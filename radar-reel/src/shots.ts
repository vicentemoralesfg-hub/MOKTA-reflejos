import { interpolate } from "remotion";
import { EASE_IN_OUT, EASE_OUT } from "./lib/anim";
import { ShotId, wordAt } from "./timeline";
import type { CamSpec, CarSpec, LaserSpec, MarkerSpec, RadarSpec, V3, WorldState } from "./world/World";
import type { PillSpec } from "./hud/Pill";

/**
 * Definición de cada plano: dado el segundo local t (y la duración d), devuelve
 * el estado del mundo 3D y los elementos HUD. Todo es función pura del tiempo.
 */
export type Anchor = Omit<PillSpec, "x" | "y"> & { at: V3; lift?: number };
export type ShotFrame = {
  world: WorldState;
  pills?: Anchor[];
  screenPills?: PillSpec[];
  speed?: number | null;
  ring?: { at: V3; r: number; opacity: number; label?: string };
  reticle?: { at: V3; w: number; h: number; opacity: number };
  counter?: { value: string; sub?: string; color?: string; opacity: number; y?: number };
  plates?: { far: number; near: number; split: number };
};

// ------------------------------------------------------------------ constantes físicas
export const KMH = 140;
export const V = KMH / 3.6; // 38,9 m/s
const HERO_X = 1.75;
const LEFT_X = -1.75;
const SHOULDER_X = 5.3;
/** Distancia del láser en el reveal (alcance nominal ≈ 2,9 km). */
export const FAR_M = 2900;
/** Divergencia: ≈1 m de ancho a 300 m. */
const BEAM_SLOPE = 1 / 300;

// ------------------------------------------------------------------ utilidades
const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
const mix3 = (a: V3, b: V3, k: number): V3 => [lerp(a[0], b[0], k), lerp(a[1], b[1], k), lerp(a[2], b[2], k)];
const io = (t: number, a: number, b: number) => EASE_IN_OUT(clamp01((t - a) / (b - a)));
const eo = (t: number, a: number, b: number) => EASE_OUT(clamp01((t - a) / (b - a)));
const fadeIn = (t: number, a: number, len = 0.18) => clamp01((t - a) / len);

const hero = (z: number, extra: Partial<CarSpec> = {}): CarSpec => ({ kind: "hero", x: HERO_X, z, facing: -1, beam: true, ...extra });
const patrol = (z: number, x = SHOULDER_X, extra: Partial<CarSpec> = {}): CarSpec => ({ kind: "patrol", x, z, facing: 1, lights: false, ...extra });
const traffic = (x: number, z: number, facing: -1 | 1, color: string): CarSpec => ({ kind: "traffic", x, z, facing, color });

/** Punto donde la pistola del agente apunta desde la patrulla estacionada en (SHOULDER_X, 0, pz). */
const emitter = (pz: number): V3 => [SHOULDER_X - 0.95, 1.32, pz + 0.55];
const heroFront = (z: number): V3 => [HERO_X, 0.58, z - 2.3];

const beam = (from: V3, to: V3, extra: Partial<LaserSpec> = {}): LaserSpec => {
  const d = Math.hypot(to[0] - from[0], to[1] - from[1], to[2] - from[2]);
  return { from, to, grow: 1, radiusNear: 0.03, radiusFar: Math.max(0.03, (d * BEAM_SLOPE) / 2), opacity: 1, ...extra };
};

/** Intensidad del frente de onda del radar sobre un auto (0..1). */
const waveOn = (r: RadarSpec, x: number, z: number) => {
  const dx = x - r.origin[0];
  const dz = (z - r.origin[2]) * r.facing;
  if (dz <= 0) return 0;
  const ang = Math.atan2(Math.abs(dx), dz);
  if (ang > (r.halfAngleDeg * Math.PI) / 180) return 0;
  const dist = Math.hypot(dx, dz);
  let best = 0;
  for (let f = r.head; f > 0; f -= r.spacing) best = Math.max(best, Math.exp(-Math.pow((f - dist) / 9, 2)));
  return best * r.opacity;
};

const cam = (pos: V3, target: V3, fov: number, roll = 0, up?: V3): CamSpec => ({ pos, target, fov, roll, up });

// ------------------------------------------------------------------ planos
const ganchoCam = (t: number, zoom = 0, aim = 0): CamSpec => {
  const z = -V * t;
  const base: V3 = [1.45, 1.3, z - 0.5];
  const fwd: V3 = [1.45, 1.3 - 100 * 0.075, z - 100.5];
  const patrolPt: V3 = [SHOULDER_X, 0.75, -FAR_M];
  return cam(base, mix3(fwd, patrolPt, aim), lerp(48 - 2.5 * t, 5.5, zoom));
};
const GANCHO_WORLD = (t: number, c: CamSpec): WorldState => ({
  cam: c,
  cars: [hero(-V * t + 1.2, { hidden: true }), patrol(-FAR_M)],
  fog: [90, 2300],
  exposure: 1.5,
});

const laVesState = (t: number, id: ShotId, pz: number): ShotFrame => {
  const a = 4.6;
  const vMin = 110 / 3.6;
  const tStop = (V - vMin) / a;
  const tb = Math.min(t, tStop);
  const dist = V * tb - 0.5 * a * tb * tb + Math.max(0, t - tStop) * vMin;
  const v = t < tStop ? V - a * t : vMin;
  const z = -dist;
  const brake = clamp01((t - 0.2) / 0.12);
  const frame: ShotFrame = {
    world: {
      cam: cam([HERO_X - 1.2, 2.05, z + 7.4 + 0.25 * t], [HERO_X + 1.7, 0.95, z - 36], 40),
      cars: [hero(z, { brake }), patrol(pz)],
      fog: [70, 1600],
      exposure: 1.1,
    },
    speed: v * 3.6,
  };
  if (id === "yaTeMidieron") {
    const w = wordAt(id, 97);
    const k = eo(t, w - 0.05, w + 0.3);
    frame.pills = [
      { at: [SHOULDER_X, 1.6, pz], lift: 140, text: "MEDIDO · 140 km/h · hace 1 min", tone: "red", size: "md", opacity: k, scale: lerp(0.85, 1, k), leader: 120 },
    ];
  }
  return frame;
};

const radarOnda = (t: number): ShotFrame => {
  const radar: RadarSpec = { origin: [SHOULDER_X - 0.4, 0.9, 2.5], facing: 1, head: 20 + 95 * t, halfAngleDeg: 6.5, range: 430, spacing: 105, opacity: clamp01(t / 0.25) };
  const cars: CarSpec[] = [
    patrol(0),
    hero(235 - V * t),
    traffic(HERO_X, 130 - 33 * t, -1, "#6b7480"),
    traffic(HERO_X, 345 - 36 * t, -1, "#41506a"),
    traffic(LEFT_X, 60 + 29 * t, 1, "#7a3b3b"),
    traffic(LEFT_X, 190 + 31 * t, 1, "#5a6372"),
  ].map((c) => (c.kind === "patrol" ? c : { ...c, wave: waveOn(radar, c.x, c.z) }));
  const k = io(t, 0, 3.6);
  return {
    world: {
      cam: cam(mix3([-22, 48, -58], [-36, 92, -84], k), mix3([6, 0, 140], [6, 0, 185], k), 48),
      cars,
      radar,
      fog: [200, 2600],
      exposure: 1.1,
      lightMinPx: 7,
    },
    pills: [{ at: [SHOULDER_X, 1.9, 0], lift: 90, text: "RADAR", tone: "blue", size: "sm", leader: 70, opacity: fadeIn(t, 0.15) }],
  };
};

const radarFrente = (t: number): ShotFrame => {
  const pz = -25 + 25 * t;
  const radar: RadarSpec = { origin: [LEFT_X, 0.9, pz + 2.5], facing: 1, head: 12 + 95 * t, halfAngleDeg: 6.5, range: 380, spacing: 105, opacity: clamp01(t / 0.2) };
  const cars: CarSpec[] = [
    patrol(pz, LEFT_X, { lights: false }),
    hero(250 - V * t),
    traffic(HERO_X, 150 - 33 * t, -1, "#6b7480"),
    traffic(LEFT_X, pz - 60, 1, "#41506a"),
  ].map((c) => (c.kind === "patrol" ? c : { ...c, wave: waveOn(radar, c.x, c.z) }));
  return {
    world: {
      cam: cam([-3.2, 14, pz - 34 + 2 * t], [0.5, 0, pz + 40], 46),
      cars,
      radar,
      fog: [150, 2400],
      exposure: 1.1,
      lightMinPx: 7,
    },
    pills: [{ at: [LEFT_X, 1.9, pz], lift: 90, text: "RADAR", tone: "blue", size: "sm", leader: 40, opacity: fadeIn(t, 0.1) }],
  };
};

const laserEnciende = (t: number): ShotFrame => {
  const z = 340 - V * t;
  const g = eo(t, 0.4, 0.68);
  const k = io(t, 0, 2);
  return {
    world: {
      cam: cam(mix3([3.1, 1.55, -1.8], [2.95, 1.48, -0.7], k), [2.2, 0.9, 120], 38),
      cars: [patrol(0), hero(z, { laserSpot: g })],
      laser: beam(emitter(0), heroFront(z), { grow: g, opacity: 1 }),
      fog: [120, 2200],
      exposure: 0.9,
      lightMinPx: 6,
    },
    pills: [{ at: [SHOULDER_X - 0.6, 1.6, 0.6], lift: 80, text: "LÁSER", tone: "red", size: "sm", leader: 60, opacity: fadeIn(t, 0.55) }],
  };
};

const laserUnMetro = (t: number): ShotFrame => {
  const z = 305 - V * t;
  const k = io(t, 0, 1.6);
  return {
    world: {
      cam: cam(mix3([-6, 13.5, z - 34], [-5.2, 11.5, z - 29], k), [1.6, 0.7, z + 4], 40),
      cars: [
        patrol(0),
        hero(z, { laserSpot: 1, laserSpotSize: 1.0 }),
        traffic(HERO_X, z + 26, -1, "#6b7480"),
        traffic(LEFT_X, z - 14 + 28 * t, 1, "#7a3b3b"),
        traffic(LEFT_X, z + 40 + 28 * t, 1, "#41506a"),
      ],
      laser: beam(emitter(0), heroFront(z)),
      fog: [120, 2200],
      exposure: 1.05,
    },
    pills: [{ at: [HERO_X, 0.9, z - 2.3], lift: 150, text: "≈1 m", tone: "red", size: "md", leader: 130, opacity: fadeIn(t, wordAt("laserUnMetro", 46) - 0.05) }],
  };
};

const laserElTuyo = (t: number): ShotFrame => {
  const z = 244 - V * t;
  const k = io(t, 0, 2.2);
  return {
    world: {
      cam: cam([HERO_X - 3.5 + 0.6 * k, 1.25 - 0.1 * k, z - 7.2 + 1.2 * k], [HERO_X, 0.72, z - 1.6], 38),
      cars: [patrol(0), hero(z, { laserSpot: 1, laserSpotSize: 0.85 }), traffic(HERO_X, z + 30, -1, "#6b7480"), traffic(LEFT_X, z + 20 + 28 * t, 1, "#7a3b3b")],
      laser: beam(emitter(0), heroFront(z), { radiusFar: 0.14, opacity: 0.9 }),
      fog: [80, 1800],
      exposure: 1.05,
    },
  };
};

const medioSegundo = (t: number): ShotFrame => {
  const z = 200 - V * t;
  const t0 = 0.5;
  const el = clamp01((t - t0) / 0.4) * 0.4;
  const locked = t >= t0 + 0.42;
  return {
    world: {
      cam: cam([HERO_X - 3.4, 3.3 - 0.2 * t, z + 7.2 - 0.6 * t], [HERO_X + 0.2, 0.7, z - 3.5], 44),
      cars: [patrol(0), hero(z, { laserSpot: 1, laserSpotSize: 0.75 }), traffic(LEFT_X, z - 70 + 28 * t, 1, "#41506a")],
      laser: beam(emitter(0), heroFront(z), { radiusFar: 0.09, opacity: 0.9 }),
      fog: [80, 1800],
      exposure: 1.05,
    },
    speed: KMH,
    counter: { value: `${el.toFixed(2).replace(".", ",")} s`, color: locked ? "#FFD23F" : "#F4F7FB", opacity: fadeIn(t, 0.25, 0.15), y: 330 },
    pills: [
      { at: [HERO_X, 1.6, z - 0.4], lift: 120, text: "140 km/h ✓", tone: "red", size: "md", leader: 100, opacity: locked ? 1 : 0, scale: locked ? lerp(1.15, 1, eo(t, t0 + 0.42, t0 + 0.62)) : 1 },
    ],
  };
};

const piensaNumero = (t: number, d: number): ShotFrame => {
  const z = -V * t;
  const k = io(t, 0, d);
  const w1 = wordAt("piensaNumero", 63);
  const w2 = wordAt("piensaNumero", 65);
  const bob = (ph: number) => Math.sin(t * 2.2 + ph) * 8;
  const p1 = eo(t, w1 - 0.05, w1 + 0.25);
  const p2 = eo(t, w2 - 0.1, w2 + 0.2);
  return {
    world: {
      cam: cam([HERO_X + 0.3, 2.6, z + 8.2 - 1.2 * k], [2.3, 0.6, z - 90], 42),
      cars: [hero(z, { laserSpot: 1, laserSpotSize: 0.7 })],
      laser: { from: heroFront(z), to: [SHOULDER_X - 0.95, 1.32, z - FAR_M], grow: 1, radiusNear: 0.1, radiusFar: 3.2, opacity: 1, fadeFar: 0.88 },
      fog: [70, 1700],
      exposure: 1.0,
    },
    screenPills: [
      { text: "¿300 m?", x: 330, y: 610 + bob(0), size: "lg", tone: "key", opacity: p1, scale: lerp(0.8, 1, p1), dot: false },
      { text: "¿1 km?", x: 760, y: 520 + bob(1.7), size: "lg", tone: "key", opacity: p2, scale: lerp(0.8, 1, p2), dot: false },
    ],
  };
};

const flyOver = (t: number, d: number, id: "trescientos" | "kilometro"): ShotFrame => {
  const near = id === "trescientos";
  const mark = near ? 300 : 1000;
  const masW = wordAt(id, near ? 68 : 71);
  const z = -V * t - (near ? 0 : 80);
  const k = io(t, 0, d);
  const camPos: V3 = near ? mix3([-3.5, 7, z + 10], [-6, 30, -170], k) : mix3([-12, 45, -400], [-24, 115, -760], k);
  const look: V3 = near ? mix3([1.5, 0, -330], [1.5, 0, -420], k) : mix3([1.5, 0, -1000], [1.5, 0, -1060], k);
  const m = eo(t, masW - 0.08, masW + 0.18);
  const markers: MarkerSpec[] = [{ z: -mark, opacity: 1, color: "#d8ecff", scale: near ? 1.6 : 4 }];
  return {
    world: {
      cam: cam(camPos, look, near ? 50 : 52),
      cars: [hero(z, { laserSpot: 1 })],
      laser: { from: heroFront(z), to: [SHOULDER_X - 0.95, 1.32, -FAR_M], grow: 1, radiusNear: near ? 0.12 : 0.6, radiusFar: near ? 2.4 : 4.5, opacity: 1, fadeFar: near ? 0.75 : 0.55 },
      markers,
      fog: near ? [250, 3200] : [600, 4800],
      exposure: 1.1,
      lightMinPx: near ? 8 : 14,
    },
    pills: [
      {
        at: [0, 0, -mark],
        leader: near ? 170 : 200,
        text: near ? "300 m" : "1 km",
        size: "lg",
        tone: "neutral",
        strike: m,
        stamp: "MÁS",
        stampOpacity: m,
        opacity: fadeIn(t, 0.05),
      },
    ],
  };
};

/** Vista aérea alta y oblicua: la patrulla queda arriba (z = -FAR_M), tu auto abajo (z ≈ 0). */
const mapCam = (k: number, from: V3, to: V3, fov: number, roll = 0): CamSpec => cam(mix3(from, to, k), [0, 0, -1000], fov, roll);

const tresKm = (t: number, d: number): ShotFrame => {
  // cámara lenta: todo avanza a 0,2× y la cámara baja flotando
  const slow = 0.2;
  const z = 40 - V * slow * t;
  const k = eo(t, 0, d);
  const tw = wordAt("tresKm", 74);
  const pk = eo(t, tw - 0.05, tw + 0.35);
  const pulse = ((t * 0.3) % 1 + 1) % 1;
  return {
    world: {
      cam: mapCam(k, [-150, 1020, 960], [-110, 1130, 880], 56, 0.012 * k),
      cars: [hero(z, { laserSpot: 1, laserSpotSize: 14 }), patrol(-FAR_M)],
      laser: { from: emitter(-FAR_M), to: heroFront(z), grow: 1, radiusNear: 4.5, radiusFar: 5, opacity: 1, pulse },
      fog: [3000, 14000],
      exposure: 1.7,
      lightMinPx: 54,
      roadGlow: 0.16,
    },
    pills: [{ at: [0, 0, -FAR_M / 2], lift: 0, text: "2,9 km", size: "xl", tone: "key", opacity: pk, scale: lerp(0.7, 1, pk), dot: false }],
    ring: { at: [SHOULDER_X, 0, -FAR_M], r: 30, opacity: Math.max(0.5, pk) },
  };
};

const niUnPunto = (t: number): ShotFrame => {
  const zoom = io(t, 0.15, 1.35);
  const c = ganchoCam(0, zoom, zoom);
  const ringK = eo(t, 1.25, 1.6);
  return {
    world: GANCHO_WORLD(0, c),
    ring: { at: [SHOULDER_X, 0.75, -FAR_M], r: 70, opacity: ringK, label: "AQUÍ" },
  };
};

const unMinuto = (t: number, d: number): ShotFrame => {
  const fast = V * 3.4;
  const z = -fast * t;
  const k = clamp01(t / (d - 0.25));
  const secs = Math.round(lerp(0, FAR_M / V, k));
  const meters = Math.round(lerp(FAR_M, 0, k) / 10) * 10;
  return {
    world: {
      cam: cam([HERO_X - 1.1, 1.45, z + 8.4], [HERO_X - 0.2, 0.75, z - 12], 50, Math.sin(t * 1.3) * 0.01),
      cars: [hero(z)],
      fog: [70, 1700],
      exposure: 1.05,
    },
    speed: KMH,
    counter: {
      value: `${Math.floor(secs / 60)}:${String(secs % 60).padStart(2, "0")}`,
      sub: `${meters.toLocaleString("es-CL")} m`,
      opacity: fadeIn(t, 0.05),
      y: 330,
    },
  };
};

const detalle = (t: number, d: number): ShotFrame => {
  const z = -V * t;
  const k = io(t, 0, d);
  return {
    world: {
      cam: cam([HERO_X + 0.55 - 0.45 * k, 0.9 - 0.3 * k, z - 2.3 - 6.0 + 4.3 * k], [HERO_X, 0.5, z - 2.26], 32),
      cars: [hero(z)],
      fog: [60, 1500],
      exposure: 1.1,
    },
    speed: null,
  };
};

const patente = (t: number, id: "patenteLejos" | "patenteCerca"): ShotFrame => {
  const far = id === "patenteLejos";
  const z = (far ? FAR_M : 232) - V * t;
  const e = emitter(0);
  const target = heroFront(z);
  const fov = far ? 2.6 : 3.2;
  // el auto queda ~160 px sobre el centro (arriba van las fotos, al centro los subtítulos)
  const dist = Math.hypot(target[0] - e[0], target[1] - e[1], target[2] - e[2]);
  const drop = dist * (160 / 960) * Math.tan((fov / 2) * (Math.PI / 180));
  const c = cam(e, [target[0], target[1] - drop, target[2]], fov);
  const k = eo(t, 0.05, 0.4);
  return {
    world: {
      cam: c,
      cars: [hero(z, { beam: false }), patrol(0)],
      fog: [3200, 14000],
      exposure: 1.05,
      lightMinPx: far ? 4 : 0,
    },
    reticle: { at: [HERO_X, 0.75, z - 2.3], w: far ? 130 : 440, h: far ? 100 : 300, opacity: k },
    plates: far ? { far: eo(t, 0.2, 0.5), near: 0, split: 0 } : { far: 1, near: eo(t, wordAt(id, 118) - 0.1, wordAt(id, 118) + 0.2), split: 1 },
  };
};

const cierre = (t: number, d: number): ShotFrame => {
  const z = -1250 - V * t;
  const k = io(t, 0, d + 0.4);
  const p = eo(t, 0.05, 0.4);
  const q = eo(t, wordAt("cierre", 121) - 0.1, wordAt("cierre", 121) + 0.3);
  return {
    world: {
      cam: mapCam(k, [-120, 1120, 900], [-100, 1060, 840], 56),
      cars: [patrol(-FAR_M), hero(z, { laserSpot: 1, laserSpotSize: 14 })],
      laser: { from: emitter(-FAR_M), to: heroFront(z), grow: 1, radiusNear: 3, radiusFar: 3.4, opacity: 0.55 },
      markers: [
        { z: -FAR_M + 200, opacity: 1, color: "#ffe28a", scale: 9 },
        { z: 0, opacity: 1, color: "#ff8a94", scale: 9 },
      ],
      fog: [3000, 14000],
      exposure: 1.7,
      lightMinPx: 54,
      roadGlow: 0.16,
    },
    pills: [
      { at: [0, 0, 0], lift: 95, text: "2,9 km", tone: "red", size: "lg", opacity: p },
      { at: [0, 0, -FAR_M + 200], lift: -75, text: "≈200 m", tone: "key", size: "lg", opacity: q },
    ],
    ring: { at: [SHOULDER_X, 0, -FAR_M], r: 26, opacity: 0.7 },
  };
};

export const SHOT_FNS: Record<ShotId, (t: number, d: number) => ShotFrame> = {
  gancho: (t) => ({
    world: GANCHO_WORLD(t, ganchoCam(t)),
    screenPills: [{ text: "¿LA VES?", x: 540, y: 330, size: "xl", tone: "key", dot: false, scale: 1 + 0.015 * Math.sin(t * 3) }],
  }),
  imagina: (t) => {
    const z = -V * t;
    return {
      world: {
        cam: cam([HERO_X + 1.0 - 0.35 * t, 1.6 + 0.05 * t, z + 8.8 - 0.45 * t], [HERO_X - 0.2, 0.8, z - 10], 40),
        cars: [hero(z)],
        fog: [70, 1800],
        exposure: 1.15,
      },
      speed: KMH,
    };
  },
  laVes: (t) => laVesState(t, "laVes", -74),
  justoATiempo: (t) => {
    const v0 = 110 / 3.6;
    const z = -(v0 * t - 0.5 * 1.3 * t * t);
    const v = v0 - 1.3 * t;
    return {
      world: {
        cam: cam([HERO_X - 0.9, 0.6, z - 10.8 + 0.9 * t], [HERO_X, 0.85, z], 36),
        cars: [hero(z, { brake: 1 })],
        fog: [60, 1500],
        exposure: 1.1,
      },
      speed: v * 3.6,
    };
  },
  radarOnda,
  radarFrente,
  laserEnciende,
  laserUnMetro,
  laserElTuyo,
  medioSegundo,
  piensaNumero,
  trescientos: (t, d) => flyOver(t, d, "trescientos"),
  kilometro: (t, d) => flyOver(t, d, "kilometro"),
  tresKm,
  niUnPunto,
  unMinuto,
  yaTeMidieron: (t) => laVesState(t, "yaTeMidieron", -96),
  detalle,
  patenteLejos: (t) => patente(t, "patenteLejos"),
  patenteCerca: (t) => patente(t, "patenteCerca"),
  cierre,
};

export { interpolate };
