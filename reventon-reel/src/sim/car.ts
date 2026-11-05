/**
 * Cinemática determinista del auto (no es un simulador físico: son trayectorias
 * coreografiadas con valores plausibles, integradas a 240 Hz para que todo sea continuo).
 *
 * Coordenadas: el camino avanza hacia -Z. x positivo = derecha. Carril derecho en x = +1,75.
 * heading (rad): 0 = mirando hacia -Z; positivo = gira hacia la derecha (+x).
 */

export type ScenarioId = "frena" | "volantazo" | "correcto";

export type CarState = {
  t: number;
  x: number;
  z: number;
  /** Rumbo de la carrocería (rad). */
  heading: number;
  /** Dirección de la velocidad (rad). */
  path: number;
  /** Rapidez (m/s). */
  v: number;
  /** Distancia recorrida (m) — para la rotación de ruedas. */
  dist: number;
  /** Intensidad de freno 0..1 (luces de freno, cabeceo). */
  brake: number;
  /** 0 antes del reventón, 1 después. */
  blown: number;
  /** Segundos desde el reventón (negativo antes). */
  sinceBlow: number;
  /** Ángulo del volante (rad, positivo = derecha). */
  steer: number;
  /** Balizas encendidas. */
  hazard: boolean;
  /** Balanceo (rad, positivo = hacia la derecha) y cabeceo (rad, positivo = nariz abajo). */
  roll: number;
  pitch: number;
  /** Deslizamiento (heading - path), para humo y marcas. */
  slip: number;
};

export const V100 = 100 / 3.6;
export const BLOW_T = 1.0;

const smooth = (a: number, b: number, x: number) => {
  const y = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return y * y * (3 - 2 * y);
};

type Spec = {
  x0: number;
  /** Aceleración longitudinal (m/s²). */
  accel: (t: number, v: number) => number;
  /** Velocidad angular de la trayectoria (rad/s). */
  pathRate: (t: number, v: number) => number;
  /** Deslizamiento de la carrocería respecto de la trayectoria (rad). */
  slip: (t: number) => number;
  brake: (t: number) => number;
  steer: (t: number) => number;
  hazard: (t: number) => boolean;
  /** Si existe, fija la posición lateral directamente (escenario correcto). */
  lateral?: (t: number) => number;
};

/** A: frenar a fondo tras el reventón delantero derecho → el auto se cruza. */
export const BRAKE_T = 1.9;
const frena: Spec = {
  x0: 1.75,
  accel: (t, v) => {
    if (v <= 0.05) return 0;
    if (t < BLOW_T) return 0;
    if (t < BRAKE_T) return -1.0; // arrastre de la rueda sin aire
    return -7.2 * smooth(BRAKE_T, BRAKE_T + 0.18, t);
  },
  pathRate: (t, v) => {
    if (t < BLOW_T) return 0;
    const k = v / V100;
    if (t < BRAKE_T) return 0.07 * smooth(BLOW_T, BLOW_T + 0.25, t) * k; // tira a la derecha
    return 0.085 * k; // la trayectoria sigue derivando a la derecha mientras gira
  },
  slip: (t) => 2.15 * smooth(BRAKE_T + 0.12, BRAKE_T + 2.1, t) ** 1.25,
  brake: (t) => smooth(BRAKE_T - 0.02, BRAKE_T + 0.06, t),
  steer: (t) => (t < BLOW_T ? 0 : t < BRAKE_T ? 0.25 * smooth(BLOW_T, BLOW_T + 0.2, t) : 0.25 - 0.9 * smooth(BRAKE_T, BRAKE_T + 0.5, t)),
  hazard: () => false,
};

/** B: volantazo hacia la izquierda tras el tirón → sale de su carril. */
export const JERK_T = 1.55;
const volantazo: Spec = {
  x0: 1.75,
  accel: (t, v) => (v <= 0.05 || t < BLOW_T ? 0 : t < JERK_T ? -1.0 : -2.6),
  pathRate: (t, v) => {
    if (t < BLOW_T) return 0;
    const k = v / V100;
    if (t < JERK_T) return 0.08 * smooth(BLOW_T, BLOW_T + 0.2, t) * k;
    // volantazo brusco a la izquierda, luego la cola se va
    return (-0.62 * smooth(JERK_T, JERK_T + 0.12, t) * (1 - smooth(JERK_T + 0.7, JERK_T + 1.4, t)) - 0.12 * smooth(JERK_T + 0.7, JERK_T + 1.4, t)) * k;
  },
  slip: (t) => -0.55 * smooth(JERK_T + 0.25, JERK_T + 1.3, t),
  brake: () => 0,
  steer: (t) => (t < BLOW_T ? 0 : t < JERK_T ? 0.2 * smooth(BLOW_T, BLOW_T + 0.2, t) : 0.2 - 2.4 * smooth(JERK_T, JERK_T + 0.14, t)),
  hazard: () => false,
};

/**
 * C: lo correcto. Volante firme, recto, suelta el acelerador (desacelera solo),
 * y cuando está controlado: freno suave, balizas y a la berma.
 */
export const C = {
  softBrake: 10.0, // freno suave (ya controlado)
  hazardOn: 11.4,
  shoulderStart: 12.0,
  shoulderDur: 2.5,
};
const correcto: Spec = {
  x0: 1.75,
  accel: (t, v) => {
    if (v <= 0.05) return 0;
    if (t < BLOW_T) return 0;
    if (t < C.softBrake) return -1.25 * smooth(BLOW_T, BLOW_T + 0.6, t); // suelta el acelerador
    return -3.3; // freno suave (≈0,34 g)
  },
  pathRate: () => 0,
  slip: () => 0,
  brake: (t) => 0.45 * smooth(C.softBrake, C.softBrake + 0.3, t),
  steer: (t) => {
    if (t < BLOW_T) return 0;
    // pequeñas correcciones suaves contra el tirón
    const s = t - BLOW_T;
    return -0.09 * Math.sin(s * 3.1) * Math.exp(-s * 0.9) + 0.35 * smooth(C.shoulderStart, C.shoulderStart + 0.5, t) * (1 - smooth(C.shoulderStart + 1.0, C.shoulderStart + 1.6, t)) - 0.3 * smooth(C.shoulderStart + 1.2, C.shoulderStart + 1.7, t) * (1 - smooth(C.shoulderStart + 2.2, C.shoulderStart + 2.6, t));
  },
  hazard: (t) => t >= C.hazardOn,
  lateral: (t) => {
    const s = Math.max(0, t - BLOW_T);
    const pull = t < BLOW_T ? 0 : 0.32 * Math.sin(Math.min(s, 1.6) * 1.96) * Math.exp(-s * 0.7);
    const toShoulder = 3.05 * smooth(C.shoulderStart, C.shoulderStart + C.shoulderDur, t);
    return 1.75 + pull + toShoulder;
  },
};

const SPECS: Record<ScenarioId, Spec> = { frena, volantazo, correcto };

const DT = 1 / 240;
const cache = new Map<string, CarState>();

/** Estado del auto en el tiempo t (s) del escenario. */
export const carAt = (id: ScenarioId, tIn: number): CarState => {
  if (tIn < 0) {
    // antes del inicio: marcha recta a 100 km/h
    const s0 = carAt(id, 0);
    return { ...s0, t: tIn, z: s0.z - V100 * tIn, dist: V100 * tIn, sinceBlow: tIn - BLOW_T };
  }
  const t = tIn;
  const key = `${id}:${t.toFixed(5)}`;
  const hit = cache.get(key);
  if (hit) return hit;
  const sp = SPECS[id];
  let x = sp.x0;
  let z = 0;
  let v = V100;
  let path = 0;
  let dist = 0;
  let prevLat = sp.lateral ? sp.lateral(0) : x;
  const n = Math.floor(t / DT);
  let tt = 0;
  const step = (dt: number) => {
    v = Math.max(0, v + sp.accel(tt, v) * dt);
    if (sp.lateral) {
      const lat = sp.lateral(tt + dt);
      const dx = lat - prevLat;
      const dzAbs = v * dt;
      path = dzAbs > 1e-6 ? Math.atan2(dx, dzAbs) : path * 0.98;
      x = lat;
      prevLat = lat;
      z -= dzAbs;
      dist += Math.hypot(dx, dzAbs);
    } else {
      path += sp.pathRate(tt, v) * dt;
      x += v * Math.sin(path) * dt;
      z -= v * Math.cos(path) * dt;
      dist += v * dt;
    }
    tt += dt;
  };
  for (let i = 0; i < n; i++) step(DT);
  const rem = t - n * DT;
  if (rem > 1e-9) step(rem);

  const slip = sp.slip(t);
  const brake = v > 0.3 ? sp.brake(t) : sp.brake(t) * 0.6;
  const blown = t >= BLOW_T ? 1 : 0;
  const sinceBlow = t - BLOW_T;
  // balanceo: el auto se hunde hacia la rueda reventada (delantera derecha)
  const rollBlow = blown * 0.028 * smooth(0, 0.12, sinceBlow);
  const rollTurn = -slip * 0.02;
  const pitch = blown * 0.012 + brake * 0.035;
  const st: CarState = {
    t,
    x,
    z,
    heading: path + slip,
    path,
    v,
    dist,
    brake,
    blown,
    sinceBlow,
    steer: sp.steer(t),
    hazard: sp.hazard(t),
    roll: rollBlow + rollTurn,
    pitch,
    slip,
  };
  if (cache.size > 6000) cache.clear();
  cache.set(key, st);
  return st;
};

/** Dirección hacia adelante (x, z) para un rumbo. */
export const fwd = (h: number): [number, number] => [Math.sin(h), -Math.cos(h)];
/** Dirección hacia la derecha (x, z) para un rumbo. */
export const right = (h: number): [number, number] => [Math.cos(h), Math.sin(h)];

/** Posición de mundo de un punto local del auto (lx derecha, lz atrás positivo). */
export const localToWorld = (s: CarState, lx: number, lz: number): [number, number] => {
  const [fx, fz] = fwd(s.heading);
  const [rx, rz] = right(s.heading);
  return [s.x + rx * lx - fx * lz, s.z + rz * lx - fz * lz];
};

/** Posiciones de las ruedas (x, z): DI, DD, TI, TD. */
export const WHEEL_LOCAL: [number, number][] = [
  [-0.8, -1.38],
  [0.8, -1.38],
  [-0.8, 1.38],
  [0.8, 1.38],
];

/** Destellos de balizas (Chile: ~90 por minuto). */
export const hazardBlink = (t: number) => (t % 0.667) < 0.36;
