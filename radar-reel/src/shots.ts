import { EASE_IN_OUT, EASE_OUT } from "./lib/anim";
import { ShotId, wordAt } from "./timeline";
import { officerMuzzle } from "./world/World";
import type { CamSpec, CarSpec, LaserSpec, MarkerSpec, RadarSpec, V3, WorldState } from "./world/World";
import type { PillSpec } from "./hud/Pill";

/**
 * Definición de cada plano: dado el segundo local t (y la duración d), devuelve
 * el estado del mundo 3D y los elementos HUD. Todo es función pura del tiempo.
 * Regla de ritmo: ningún plano supera 2,5 s (lo valida timeline.ts) y nunca se repite
 * el mismo tipo de encuadre en dos planos seguidos.
 */
export type Anchor = Omit<PillSpec, "x" | "y"> & { at: V3; lift?: number };
export type Bracket = { a: V3; b: V3; opacity: number; color?: string };
export type ShotFrame = {
  world: WorldState;
  /** Resolución interna del 3D (<1 = pixelado, como un zoom digital extremo). */
  dpr?: number;
  /** Visor partido: arriba y abajo, cada mitad con su propio mundo y resolución. */
  split?: { top: WorldState; bottom: WorldState; topDpr: number; bottomDpr: number };
  pills?: Anchor[];
  screenPills?: PillSpec[];
  speed?: number | null;
  speedBig?: boolean;
  ring?: { at: V3; r: number; opacity: number; label?: string; sub?: string };
  counter?: { value: string; sub?: string; color?: string; opacity: number; y?: number };
  card?: { title: string; sub?: string; opacity: number; scale?: number; y?: number };
  fx?: { flash?: number; tint?: number; vignette?: number; color?: "red" | "blue" };
  brackets?: Bracket[];
  viewfinder?: number;
};

// ------------------------------------------------------------------ constantes
export const KMH = 140;
export const V = KMH / 3.6; // 38,9 m/s
const HERO_X = 1.75;
const LEFT_X = -1.75;
const SHOULDER_X = 5.3;
/** Distancia del láser en el reveal (alcance nominal ≈ 2,9 km). */
export const FAR_M = 2900;
/** Divergencia: ≈1 m de ancho a 300 m. */
const BEAM_SLOPE = 1 / 300;

const RED = "#ff4d5e";
const YELLOW = "#ffd23f";

// ------------------------------------------------------------------ utilidades
const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
const mix3 = (a: V3, b: V3, k: number): V3 => [lerp(a[0], b[0], k), lerp(a[1], b[1], k), lerp(a[2], b[2], k)];
const io = (t: number, a: number, b: number) => EASE_IN_OUT(clamp01((t - a) / (b - a)));
const eo = (t: number, a: number, b: number) => EASE_OUT(clamp01((t - a) / (b - a)));
const fadeIn = (t: number, a: number, len = 0.15) => clamp01((t - a) / len);
/** Destello que arranca en el corte y se apaga en `len` segundos. */
const flashAt = (t: number, a: number, peak: number, len = 0.35) => (t < a ? 0 : peak * Math.pow(1 - clamp01((t - a) / len), 2));
/** Píldora que entra con un pequeño rebote. */
const pop = (t: number, a: number) => {
  const k = eo(t, a - 0.04, a + 0.22);
  return { opacity: k, scale: lerp(0.75, 1, k) + Math.sin(clamp01((t - a) / 0.3) * Math.PI) * 0.06 };
};

const hero = (z: number, extra: Partial<CarSpec> = {}): CarSpec => ({ kind: "hero", x: HERO_X, z, facing: -1, beam: true, ...extra });
const patrol = (z: number, x = SHOULDER_X, extra: Partial<CarSpec> = {}): CarSpec => ({ kind: "patrol", x, z, facing: 1, lights: false, ...extra });
const traffic = (x: number, z: number, facing: -1 | 1, color = "#4b5361"): CarSpec => ({ kind: "traffic", x, z, facing, color });

/** Punto desde donde apunta la pistola cuando el agente está dentro de la patrulla estacionada en (SHOULDER_X, 0, pz). */
const emitter = (pz: number): V3 => [SHOULDER_X - 0.95, 1.32, pz + 0.55];
const heroFront = (z: number): V3 => [HERO_X, 0.58, z - 2.3];

const beam = (from: V3, to: V3, extra: Partial<LaserSpec> = {}): LaserSpec => {
  const d = Math.hypot(to[0] - from[0], to[1] - from[1], to[2] - from[2]);
  return { from, to, grow: 1, radiusNear: 0.03, radiusFar: Math.max(0.03, (d * BEAM_SLOPE) / 2), opacity: 1, ...extra };
};

/** Intensidad del frente de onda del radar sobre un punto (0..1). */
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
const withWave = (r: RadarSpec, cars: CarSpec[]) => cars.map((c) => (c.kind === "patrol" ? c : { ...c, wave: waveOn(r, c.x, c.z) }));

const cam = (pos: V3, target: V3, fov: number, roll = 0, up?: V3): CamSpec => ({ pos, target, fov, roll, up });

/** Ajustes comunes de las vistas aéreas: más luz, niebla en capas, tachas y luces visibles. */
const AERIAL: Partial<WorldState> = { exposure: 1.9, fogLayers: 0.32, studs: 5, lightMinPx: 54, roadGlow: 0.18 };

// ------------------------------------------------------------------ gancho / respuesta
const ganchoCam = (t: number, zoom = 0, aim = 0): CamSpec => {
  const z = -V * t;
  const base: V3 = [1.45, 1.3, z - 0.5];
  const fwd: V3 = [1.45, 1.3 - 100 * 0.075, z - 100.5];
  const patrolPt: V3 = [SHOULDER_X, 0.75, -FAR_M];
  return cam(base, mix3(fwd, patrolPt, aim), lerp(48 - 1.5 * t, 4.2, zoom));
};
const ganchoWorld = (t: number, c: CamSpec): WorldState => ({
  cam: c,
  cars: [hero(-V * t + 1.2, { hidden: true }), patrol(-FAR_M)],
  fog: [90, 2300],
  exposure: 1.55,
  studs: 3,
});

// ------------------------------------------------------------------ planos
const gancho = (t: number): ShotFrame => ({
  world: ganchoWorld(t, ganchoCam(t)),
  screenPills: [{ text: "¿LA VES?", x: 540, y: 330, size: "xl", tone: "key", dot: false, scale: 1 + 0.015 * Math.sin(t * 3) }],
});

const limite = (t: number, d: number): ShotFrame => {
  const kmh = 112 + 28 * io(t, 0.1, d * 0.8);
  const z = -(31 * t + 0.5 * 3.4 * t * t);
  return {
    world: {
      cam: cam([HERO_X - 1.5, 1.4, z + 8], [HERO_X + 1.0, 1.35, z - 26], 42),
      cars: [hero(z)],
      signs: [{ x: 4.9, z: -46 }],
      fog: [70, 1800],
      exposure: 1.25,
      studs: 3,
    },
    speed: kmh,
    speedBig: true,
  };
};

/** Conductor: la patrulla aparece grande en la berma, iluminada por tus focos. */
const povPatrol = (t: number, pz: number, closing: number, braking: boolean): ShotFrame => {
  const z = -(closing * t - (braking ? 2.4 : 0) * t * t);
  const dip = braking ? Math.sin(clamp01((t - 0.3) / 0.6) * Math.PI) * 0.12 : 0;
  return {
    world: {
      cam: cam([HERO_X - 0.35, 1.25 - dip * 0.3, z - 0.6], [HERO_X + 2.2, 0.85 - dip, z - 22], 30),
      cars: [hero(z, { hidden: true }), patrol(pz, 5.0)],
      fog: [60, 1600],
      exposure: 1.2,
      studs: 3,
    },
    speed: braking ? 140 - 25 * clamp01((t - 0.3) / 1.2) : 140,
  };
};

const justoATiempo = (t: number): ShotFrame => {
  // desde atrás de la patrulla: tu auto llega frenando, la patrulla en silueta en primer plano
  const zh = 72 - 29 * t + 3 * t * t;
  return {
    world: {
      cam: cam([SHOULDER_X + 0.35, 2.75, -7.2 + 0.4 * t], [2.0, 0.7, 40], 40),
      cars: [patrol(0), hero(zh, { brake: 1 })],
      fog: [80, 1800],
      exposure: 1.2,
      studs: 3,
    },
    speed: 115 - 12 * clamp01(t / 2),
  };
};

const radarSpec = (origin: V3, head: number, opacity: number, facing: 1 | -1 = 1): RadarSpec => ({
  origin,
  facing,
  head,
  halfAngleDeg: 11,
  range: 300,
  spacing: 48,
  opacity,
});

const radarLanza = (t: number): ShotFrame => {
  const radar = radarSpec([SHOULDER_X - 0.3, 0.9, 2.4], 8 + 110 * t, clamp01(t / 0.15));
  return {
    world: {
      cam: cam([SHOULDER_X - 3.4, 1.0, -3.2 + 0.5 * t], [3.2, 1.6, 40], 46),
      cars: withWave(radar, [patrol(0), hero(150 - V * t), traffic(HERO_X, 95 - 33 * t, -1)]),
      radar,
      fog: [80, 1800],
      exposure: 1.25,
      studs: 3,
    },
    screenPills: [{ text: "RADAR", x: 540, y: 340, size: "story", tone: "blue", ...pop(t, 0.12) }],
  };
};

const radarAncha = (t: number, d: number): ShotFrame => {
  const radar = radarSpec([SHOULDER_X - 0.3, 0.9, 2.4], 40 + 120 * t, 1);
  const k = io(t, 0, d);
  return {
    world: {
      cam: cam(mix3([-26, 68, -62], [-32, 80, -70], k), [4, 0, 115], 48),
      cars: withWave(radar, [
        patrol(0),
        hero(165 - V * t),
        traffic(HERO_X, 92 - 33 * t, -1, "#6b7480"),
        traffic(HERO_X, 240 - 36 * t, -1, "#41506a"),
        traffic(LEFT_X, 58 + 29 * t, 1, "#7a3b3b"),
        traffic(LEFT_X, 150 + 31 * t, 1, "#5a6372"),
      ]),
      radar,
      fog: [250, 3000],
      exposure: 1.6,
      studs: 4,
      lightMinPx: 10,
      fogLayers: 0.15,
    },
  };
};

const radarMedir = (t: number): ShotFrame => {
  // subjetiva: la onda azul de una patrulla que viene de frente te pasa por encima
  const zh = -V * t;
  const pz = -165 + 25 * t;
  // ondas espaciadas: solo una o dos te cruzan en el plano (pulso suave, nunca un parpadeo)
  const radar = { ...radarSpec([LEFT_X, 0.9, pz + 2.4], 60 + 85 * t, 1), spacing: 125, nearFade: 1 };
  const camZ = zh - 0.5;
  const dist = Math.hypot(1.45 - LEFT_X, camZ - (pz + 2.4));
  let hitNow = 0;
  for (let f = radar.head; f > 0; f -= radar.spacing) hitNow = Math.max(hitNow, Math.exp(-Math.pow((f - dist) / 22, 2)));
  return {
    world: {
      cam: cam([1.45, 1.3, camZ], [1.2, 0.9, camZ - 100], 46),
      cars: [hero(zh + 1.2, { hidden: true }), patrol(pz, LEFT_X)],
      radar,
      fog: [80, 1800],
      exposure: 1.25,
      studs: 3,
    },
    fx: { tint: hitNow * 0.5, color: "blue" },
    speed: KMH,
  };
};

const radarFrente = (t: number): ShotFrame => {
  const pz = -25 + 25 * t;
  const radar = radarSpec([LEFT_X, 0.9, pz + 2.4], 12 + 110 * t, clamp01(t / 0.15));
  return {
    world: {
      cam: cam([-3.2, 14, pz - 34 + 2 * t], [0.5, 0, pz + 40], 46),
      cars: withWave(radar, [patrol(pz, LEFT_X), hero(110 - V * t), traffic(HERO_X, 60 - 33 * t, -1, "#6b7480"), traffic(LEFT_X, pz - 60, 1, "#41506a")]),
      radar,
      fog: [150, 2400],
      exposure: 1.45,
      studs: 4,
      lightMinPx: 8,
    },
    screenPills: [{ text: "RADAR", x: 540, y: 330, size: "story", tone: "blue", ...pop(t, 0.05) }],
  };
};

const laserPistola = (t: number, d: number, id: ShotId): ShotFrame => {
  const zh = 320 - V * t;
  const off = { x: SHOULDER_X + 1.25, z: 1.0, rotY: 0 };
  const tgt = heroFront(zh);
  off.rotY = Math.atan2(tgt[0] - off.x, tgt[2] - off.z);
  const wl = wordAt(id, 45);
  const g = eo(t, wl - 0.12, wl + 0.2);
  const k = io(t, 0, d);
  return {
    world: {
      cam: cam(mix3([off.x + 0.75, 1.15, off.z - 3.4], [off.x + 0.6, 1.2, off.z - 2.6], k), [off.x - 1.4, 1.55, off.z + 30], 40),
      cars: [patrol(0), hero(zh, { laserSpot: g })],
      officer: off,
      laser: beam(officerMuzzle(off), tgt, { grow: g }),
      fog: [80, 1800],
      exposure: 1.35,
      studs: 3,
    },
    screenPills: [{ text: "PISTOLA LÁSER", x: 540, y: 330, size: "story", tone: "red", ...pop(t, wl) }],
  };
};

const laserPuerta = (t: number): ShotFrame => {
  // de costado: el rayo llega al frente de tu auto y mide lo mismo que la puerta (≈1 m)
  const zh = 220 - V * t;
  const bz = zh - 3.4;
  const k = eo(t, 0.25, 0.6);
  return {
    world: {
      cam: cam([HERO_X - 7.6, 2.2, zh - 5.0], [HERO_X - 0.1, 0.7, zh - 2.0], 50),
      cars: [patrol(0), hero(zh, { laserSpot: 1, laserSpotSize: 0.6 })],
      laser: { ...beam(emitter(0), heroFront(zh)), radiusFar: 0.5, glowScale: 1.12, opacity: 0.75 },
      fog: [80, 1800],
      exposure: 1.3,
      studs: 3,
    },
    brackets: [
      { a: [HERO_X - 0.95, 1.08, bz], b: [HERO_X - 0.95, 0.08, bz], opacity: k, color: RED },
      { a: [HERO_X - 0.95, 0.18, zh - 0.95], b: [HERO_X - 0.95, 0.18, zh + 0.25], opacity: k, color: YELLOW },
    ],
    pills: [{ at: [HERO_X - 0.95, 1.08, bz], text: "≈ 1 m", tone: "red", size: "story", leader: 110, ...pop(t, 0.3) }],
  };
};

const laserTuyo = (t: number, d: number): ShotFrame => {
  const zh = 180 - V * t;
  const k = io(t, 0, d);
  return {
    world: {
      cam: cam(mix3([-17, 24, zh - 30], [-15, 21, zh - 27], k), [1, 0.4, zh + 6], 42),
      cars: [
        patrol(0),
        hero(zh, { laserSpot: 1, laserSpotSize: 1.1 }),
        traffic(HERO_X, zh + 22, -1),
        traffic(HERO_X, zh - 34, -1, "#3b4352"),
        traffic(LEFT_X, zh - 8 + 28 * t, 1),
        traffic(LEFT_X, zh + 36 + 28 * t, 1, "#3b4352"),
      ],
      laser: beam(emitter(0), heroFront(zh)),
      fog: [120, 2200],
      exposure: 1.45,
      studs: 4,
    },
    pills: [{ at: [HERO_X, 1.6, zh], text: "TÚ", tone: "red", size: "story", leader: 90, ...pop(t, wordAt("laserTuyo", 60) - 0.1) }],
  };
};

const medioSegundo = (t: number, id: ShotId): ShotFrame => {
  const z = 200 - V * t;
  const t0 = wordAt(id, 64) - 0.1;
  const el = clamp01((t - t0) / 0.4) * 0.4;
  const locked = t >= t0 + 0.42;
  return {
    world: {
      cam: cam([HERO_X - 3.4, 3.3 - 0.2 * t, z + 7.2 - 0.6 * t], [HERO_X + 0.2, 0.7, z - 3.5], 44),
      cars: [patrol(0), hero(z, { laserSpot: 1, laserSpotSize: 0.75 }), traffic(LEFT_X, z - 70 + 28 * t, 1, "#41506a")],
      laser: beam(emitter(0), heroFront(z), { radiusFar: 0.09, opacity: 0.9 }),
      fog: [80, 1800],
      exposure: 1.25,
      studs: 3,
    },
    speed: KMH,
    counter: { value: `${el.toFixed(2).replace(".", ",")} s`, color: locked ? YELLOW : "#F4F7FB", opacity: fadeIn(t, 0.05), y: 300 },
    pills: [{ at: [HERO_X, 1.6, z - 0.4], text: "140 km/h", tone: "red", size: "story", leader: 70, ...(locked ? pop(t, t0 + 0.42) : { opacity: 0 }) }],
  };
};

const desdeDistancia = (t: number): ShotFrame => {
  // cenital sobre tu auto: el rayo sale hacia adelante y se pierde en la noche
  const z = -V * t;
  return {
    world: {
      cam: cam([HERO_X + 0.4, 30 - 2 * t, z + 9], [HERO_X, 0, z - 24], 44),
      cars: [hero(z, { laserSpot: 1, laserSpotSize: 0.8 })],
      laser: { from: heroFront(z), to: [SHOULDER_X - 0.95, 1.32, z - FAR_M], grow: 1, radiusNear: 0.18, radiusFar: 4, opacity: 1, fadeFar: 0.9 },
      fog: [80, 1500],
      exposure: 1.4,
      studs: 4,
    },
  };
};

const piensaNumero = (t: number, id: ShotId): ShotFrame => {
  const z = -V * t;
  const w1 = wordAt(id, 71);
  const w2 = wordAt(id, 73);
  const bob = (ph: number) => Math.sin(t * 2.2 + ph) * 8;
  return {
    world: {
      cam: cam([-5.5, 17, z - 18 - 6 * t], [1.5, 0, z - 160], 44),
      cars: [hero(z, { laserSpot: 1, laserSpotSize: 1.2 })],
      laser: { from: heroFront(z), to: [SHOULDER_X - 0.95, 1.32, z - FAR_M], grow: 1, radiusNear: 0.3, radiusFar: 5, opacity: 1, fadeFar: 0.85 },
      fog: [120, 1600],
      exposure: 1.5,
      studs: 4,
      lightMinPx: 8,
    },
    screenPills: [
      { text: "¿300 m?", x: 300, y: 420 + bob(0), size: "story", tone: "key", dot: false, ...pop(t, w1) },
      { text: "¿1 km?", x: 770, y: 600 + bob(1.7), size: "story", tone: "key", dot: false, ...pop(t, w2 - 0.05) },
    ],
  };
};

/** Marcas de distancia: vuelo a ras sobre la carretera (pregunta) y plano nuevo en cada "Más". */
const pregunta = (t: number, d: number, mark: number, label: string): ShotFrame => {
  const near = mark < 500;
  const z = -V * t;
  const k = io(t, 0, d);
  const camPos: V3 = near ? mix3([-3, 6, 8], [-5, 15, -150], k) : mix3([-14, 60, -690], [-18, 76, -800], k);
  const look: V3 = near ? [1.5, 0, -330] : [1.5, 0, -1010];
  return {
    world: {
      cam: cam(camPos, look, near ? 50 : 52),
      cars: [hero(z, { laserSpot: 1 })],
      laser: { from: heroFront(z), to: [SHOULDER_X - 0.95, 1.32, -FAR_M], grow: 1, radiusNear: near ? 0.15 : 0.7, radiusFar: near ? 2.6 : 4.5, opacity: 1, fadeFar: 0.6 },
      markers: [{ z: -mark, opacity: 1, color: "#d8ecff", scale: near ? 2 : 4.5 }],
      fog: near ? [250, 3200] : [600, 5200],
      ...AERIAL,
      exposure: near ? 1.6 : 1.9,
    },
    pills: [{ at: [0, 0, -mark], text: label, size: "story", tone: "key", dot: false, leader: near ? 150 : 180, ...pop(t, 0.08) }],
  };
};

const mas = (t: number, mark: number, label: string): ShotFrame => {
  const near = mark < 500;
  const z = -V * 0.9 - V * t;
  const s = eo(t, 0.02, 0.2);
  const camPos: V3 = near ? [-6.5, 6 + 2 * t, -mark + 22] : mix3([-6, 8, -mark + 12], [-34, 120, -mark + 60], eo(t, 0, 1.4));
  const look: V3 = near ? [2, 1, -mark - 70] : mix3([1.5, 2, -mark - 80], [1.5, 0, -mark - 900], eo(t, 0, 1.4));
  return {
    world: {
      cam: cam(camPos, look, near ? 44 : 48),
      cars: [hero(z, { laserSpot: 1 })],
      laser: { from: heroFront(z), to: [SHOULDER_X - 0.95, 1.32, -FAR_M], grow: 1, radiusNear: 0.4, radiusFar: 4, opacity: 1, fadeFar: 0.35 },
      markers: [{ z: -mark, opacity: 1, color: "#d8ecff", scale: near ? 2 : 4.5 }],
      fog: [400, 6000],
      ...AERIAL,
    },
    screenPills: [{ text: label, x: 430, y: 360, size: "story", tone: "neutral", dot: false, strike: s, stamp: "MÁS", stampOpacity: s }],
    fx: { flash: flashAt(t, 0, 0.35, 0.25) },
  };
};

/** Vista aérea alta y oblicua: la patrulla queda arriba (z = -FAR_M), tu auto abajo (z ≈ 0). */
const mapCam = (k: number, from: V3, to: V3, fov: number, roll = 0): CamSpec => cam(mix3(from, to, k), [0, 0, -1000], fov, roll);

const tresKm = (t: number, d: number, id: ShotId): ShotFrame => {
  // el reveal: única cámara lenta, destello y tinte rojo
  const slow = 0.2;
  const z = 40 - V * slow * t;
  const k = eo(t, 0, d);
  const tw = wordAt(id, 82);
  const pulse = ((t * 0.3) % 1 + 1) % 1;
  return {
    world: {
      cam: mapCam(k, [-150, 1020, 960], [-110, 1130, 880], 56, 0.012 * k),
      cars: [hero(z, { laserSpot: 1, laserSpotSize: 14 }), patrol(-FAR_M)],
      laser: { from: emitter(-FAR_M), to: heroFront(z), grow: 1, radiusNear: 4.5, radiusFar: 5, opacity: 1, pulse },
      fog: [3000, 14000],
      ...AERIAL,
      exposure: 2.0,
      hideHills: true,
    },
    pills: [{ at: [0, 0, -FAR_M / 2], lift: 0, text: "2,9 km", size: "xl", tone: "key", dot: false, ...pop(t, tw) }],
    ring: { at: [SHOULDER_X, 0, -FAR_M], r: 34, opacity: Math.max(0.6, eo(t, tw, tw + 0.3)) },
    fx: { flash: flashAt(t, 0, 0.9, 0.45), tint: 0.55, vignette: 0.9 },
  };
};

const niUnPunto = (t: number, id: ShotId): ShotFrame => {
  const zoom = io(t, 0.05, 0.95);
  const ringT = wordAt(id, 91) - 0.15;
  return {
    world: ganchoWorld(0, ganchoCam(0, zoom, zoom)),
    ring: { at: [SHOULDER_X, 0.75, -FAR_M], r: 130, opacity: eo(t, ringT, ringT + 0.2), label: "AQUÍ", sub: "2,9 km" },
  };
};

const cientoCuarenta = (t: number): ShotFrame => {
  const fast = V * 3.4;
  const z = -fast * t;
  return {
    world: {
      cam: cam([HERO_X - 0.5, 1.6, z + 8.6], [HERO_X + 0.4, 0.7, z - 12], 50, Math.sin(t * 1.3) * 0.01),
      cars: [hero(z)],
      fog: [70, 1700],
      exposure: 1.25,
      studs: 3,
    },
    speed: KMH,
  };
};

const unMinuto = (t: number, d: number): ShotFrame => {
  const fast = V * 6;
  const z = -fast * t;
  const k = clamp01(t / (d - 0.2));
  const secs = Math.round(lerp(0, FAR_M / V, EASE_IN_OUT(k)));
  const meters = Math.round(lerp(FAR_M, 0, EASE_IN_OUT(k)) / 10) * 10;
  return {
    world: {
      cam: cam([HERO_X - 22, 46, z + 34], [HERO_X, 0, z - 26], 48),
      cars: [hero(z)],
      fog: [200, 3000],
      ...AERIAL,
      exposure: 1.7,
      lightMinPx: 0,
    },
    counter: { value: `${Math.floor(secs / 60)}:${String(secs % 60).padStart(2, "0")}`, sub: `faltan ${meters.toLocaleString("es-CL")} m`, opacity: 1, y: 280 },
  };
};

const yaTeMidieron = (t: number): ShotFrame => {
  // desde la berma, a ras de piso: tu auto llega; destello rojo y tarjeta MEDIDO
  const zh = 48 - 28 * t;
  const k = eo(t, 0.02, 0.25);
  return {
    world: {
      cam: cam([SHOULDER_X - 1.6, 0.45, 4.6], [2.4, 1.4, 40], 44),
      cars: [patrol(0), hero(zh, { brake: 1 })],
      fog: [80, 1800],
      exposure: 1.3,
      studs: 3,
    },
    card: { title: "MEDIDO · 140 km/h", sub: "hace 1 min", opacity: k, scale: lerp(0.8, 1, k), y: 560 },
    fx: { flash: flashAt(t, 0, 0.95, 0.4), tint: 0.45, vignette: 0.85 },
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
      exposure: 1.2,
    },
  };
};

const teMide = (t: number, d: number, id: ShotId): ShotFrame => {
  // detrás y arriba de tu auto, el rayo cruza 2,9 km hasta la patrulla
  const z = -V * t;
  const k = io(t, 0, d);
  const pulse = ((1 - t * 0.6) % 1 + 1) % 1;
  return {
    world: {
      cam: cam(mix3([HERO_X - 10, 34, z + 46], [HERO_X - 12, 40, z + 54], k), [1, 0, z - 700], 46),
      cars: [hero(z, { laserSpot: 1, laserSpotSize: 2 }), patrol(-FAR_M + z)],
      laser: { from: emitter(-FAR_M + z), to: heroFront(z), grow: 1, radiusNear: 3, radiusFar: 0.4, opacity: 1, pulse },
      fog: [600, 7000],
      ...AERIAL,
    },
    screenPills: [{ text: "MIDE: 2,9 km", x: 540, y: 320, size: "story", tone: "red", ...pop(t, wordAt(id, 113)) }],
  };
};

/** Teleobjetivo desde la patrulla hacia tu auto a `dist` metros (encuadra el frente del auto). */
const tele = (dist: number, aspect: number, fill = 0.8): WorldState => {
  const zh = dist + 2.3;
  const e = emitter(0);
  const tgt = heroFront(zh);
  const hFov = (1.9 / dist) / fill; // rad: el ancho del auto ocupa `fill` del cuadro
  const vFov = ((2 * Math.atan(Math.tan(hFov / 2) / aspect)) * 180) / Math.PI;
  return {
    cam: cam(e, [tgt[0], tgt[1] + (fill > 1 ? 0.02 : 0.15), tgt[2]], vFov),
    cars: [hero(zh, { beam: false })],
    fog: [20000, 30000],
    exposure: 1.6,
  };
};

const patenteFoto = (t: number): ShotFrame => ({
  world: tele(FAR_M, 1080 / 1920, 1.2),
  dpr: 0.032,
  viewfinder: 1,
  screenPills: [
    { text: "2,9 km", x: 540, y: 300, size: "story", tone: "red", ...pop(t, 0.05) },
    { text: "PATENTE: ???", x: 540, y: 1500, size: "story", tone: "neutral", dot: false, ...pop(t, 0.35) },
  ],
});

const necesita = (t: number, d: number): ShotFrame => {
  const k = io(t, 0, d);
  const dist = Math.exp(lerp(Math.log(FAR_M), Math.log(200), k));
  return {
    world: tele(dist, 1080 / 1920, lerp(1.2, 1.4, k)),
    dpr: lerp(0.032, 1, Math.pow(k, 1.6)),
    viewfinder: 1,
    counter: { value: `${(Math.round(dist / 10) * 10).toLocaleString("es-CL")} m`, opacity: 1, y: 260, color: lerp(0, 1, k) > 0.95 ? YELLOW : "#F4F7FB" },
  };
};

const doscientos = (t: number): ShotFrame => ({
  world: tele(200, 1080 / 960),
  split: { top: tele(FAR_M, 1080 / 960, 1.5), bottom: tele(200, 1080 / 960, 1.5), topDpr: 0.032, bottomDpr: 1 },
  screenPills: [
    { text: "MIDE: 2,9 km", x: 540, y: 150, size: "story", tone: "red", ...pop(t, 0.02) },
    { text: "FOTO: 200 m", x: 540, y: 1770, size: "story", tone: "key", ...pop(t, 0.12) },
  ],
  fx: { flash: flashAt(t, 0, 0.4, 0.3) },
});

const entonces = (t: number): ShotFrame => {
  // desde atrás y arriba de la patrulla: la marca de 200 m cerca, la de 2,9 km en el horizonte
  const zh = 1500 - V * t;
  return {
    world: {
      cam: cam([-8, 120 - 4 * t, -60 + 4 * t], [0, 0, 400], 56),
      cars: [patrol(0), hero(zh)],
      markers: [
        { z: 200, opacity: 1, color: YELLOW, scale: 4 },
        { z: FAR_M, opacity: 1, color: RED, scale: 16 },
      ],
      fog: [400, 6000],
      exposure: 1.6,
      studs: 4,
      lightMinPx: 10,
    },
    pills: [
      { at: [0, 0, 200], lift: -150, text: "FOTO: 200 m", tone: "key", size: "story", opacity: 1 },
      { at: [0, 60, FAR_M], text: "MIDE: 2,9 km", tone: "red", size: "story", leader: 40, opacity: 1 },
    ],
    ring: { at: [SHOULDER_X, 0.8, 0], r: 46, opacity: 0.9 },
  };
};

const pillaron = (t: number, d: number): ShotFrame => {
  const z = -1250 - V * t;
  const k = io(t, 0, d + 0.4);
  return {
    world: {
      cam: mapCam(k, [-120, 1120, 900], [-100, 1060, 840], 56),
      cars: [patrol(-FAR_M), hero(z, { laserSpot: 1, laserSpotSize: 14 })],
      laser: { from: emitter(-FAR_M), to: heroFront(z), grow: 1, radiusNear: 3, radiusFar: 3.4, opacity: 0.6 },
      markers: [
        { z: -FAR_M + 200, opacity: 1, color: YELLOW, scale: 30 },
        { z: 0, opacity: 1, color: RED, scale: 22 },
      ],
      fog: [3000, 14000],
      ...AERIAL,
      hideHills: true,
    },
    pills: [
      { at: [0, 0, 0], lift: 110, text: "MIDE: 2,9 km", tone: "red", size: "story", opacity: 1 },
      { at: [0, 0, -FAR_M + 200], lift: -110, text: "FOTO: 200 m", tone: "key", size: "story", opacity: 1 },
    ],
    ring: { at: [SHOULDER_X, 0, -FAR_M], r: 26, opacity: 0.8 },
  };
};

export const SHOT_FNS: Record<ShotId, (t: number, d: number) => ShotFrame> = {
  gancho,
  limite,
  laVes: (t) => povPatrol(t, -44, 22, true),
  justoATiempo,
  radarLanza,
  radarAncha,
  radarMedir,
  radarFrente,
  laserPistola: (t, d) => laserPistola(t, d, "laserPistola"),
  laserPuerta,
  laserTuyo,
  medioSegundo: (t) => medioSegundo(t, "medioSegundo"),
  desdeDistancia,
  piensaNumero: (t) => piensaNumero(t, "piensaNumero"),
  trescientos: (t, d) => pregunta(t, d, 300, "¿300 m?"),
  mas1: (t) => mas(t, 300, "300 m"),
  kilometro: (t, d) => pregunta(t, d, 1000, "¿1 km?"),
  mas2: (t) => mas(t, 1000, "1 km"),
  tresKm: (t, d) => tresKm(t, d, "tresKm"),
  niUnPunto: (t) => niUnPunto(t, "niUnPunto"),
  cientoCuarenta,
  unMinuto,
  cuandoLaVes: (t) => povPatrol(t, -30, 13, false),
  yaTeMidieron,
  detalle,
  teMide: (t, d) => teMide(t, d, "teMide"),
  patenteFoto,
  necesita,
  doscientos,
  entonces,
  pillaron,
};

export type { MarkerSpec };
