import { Easing, interpolate } from "remotion";

export const EASE_OUT = Easing.bezier(0.16, 1, 0.3, 1);
export const EASE_IN_OUT = Easing.bezier(0.65, 0, 0.35, 1);
export const EASE_IN = Easing.bezier(0.55, 0, 1, 0.45);
export const EASE_BACK = Easing.bezier(0.34, 1.56, 0.64, 1);

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

/** 0→1 entre a y b (segundos o fotogramas), con easing. */
export const ramp = (t: number, a: number, b: number, easing = EASE_OUT) =>
  interpolate(t, [a, b], [0, 1], { ...clamp, easing });

/** Sube en [a,b] y baja en [c,d]. */
export const inOut = (t: number, a: number, b: number, c: number, d: number) =>
  Math.min(ramp(t, a, b), 1 - ramp(t, c, d, EASE_IN_OUT));

/** Interpolación por fotogramas clave [[t, v], ...] con easing por tramo. */
export const kf = (t: number, keys: [number, number][], easing = EASE_IN_OUT) => {
  if (t <= keys[0][0]) return keys[0][1];
  for (let i = 0; i < keys.length - 1; i++) {
    const [t0, v0] = keys[i];
    const [t1, v1] = keys[i + 1];
    if (t <= t1) return interpolate(t, [t0, t1], [v0, v1], { ...clamp, easing });
  }
  return keys[keys.length - 1][1];
};

/** Interpolación suave (Catmull-Rom) por puntos [[t, v], ...]: velocidad continua. */
export const spline = (t: number, keys: [number, number][]) => {
  if (t <= keys[0][0]) return keys[0][1];
  const n = keys.length;
  if (t >= keys[n - 1][0]) return keys[n - 1][1];
  let i = 0;
  while (t > keys[i + 1][0]) i++;
  const p0 = keys[Math.max(0, i - 1)];
  const p1 = keys[i];
  const p2 = keys[i + 1];
  const p3 = keys[Math.min(n - 1, i + 2)];
  const u = (t - p1[0]) / (p2[0] - p1[0]);
  const m1 = ((p2[1] - p0[1]) / (p2[0] - p0[0])) * (p2[0] - p1[0]);
  const m2 = ((p3[1] - p1[1]) / (p3[0] - p1[0])) * (p2[0] - p1[0]);
  const u2 = u * u;
  const u3 = u2 * u;
  return (2 * u3 - 3 * u2 + 1) * p1[1] + (u3 - 2 * u2 + u) * m1 + (-2 * u3 + 3 * u2) * p2[1] + (u3 - u2) * m2;
};

/** Pulso 0..1 periódico (para parpadeos suaves). */
export const pulse = (t: number, period = 0.8) => 0.5 - 0.5 * Math.cos((t / period) * Math.PI * 2);

/** Sacudida de cámara determinista que decae desde t0. */
export const shake = (t: number, t0: number, dur = 0.5, amp = 18) => {
  if (t < t0 || t > t0 + dur) return { x: 0, y: 0 };
  const k = 1 - (t - t0) / dur;
  return {
    x: Math.sin(t * 97.3) * amp * k * k,
    y: Math.cos(t * 83.1) * amp * k * k,
  };
};
