import { Easing, interpolate } from "remotion";

export const EASE_OUT = Easing.bezier(0.16, 1, 0.3, 1);
export const EASE_IN_OUT = Easing.bezier(0.65, 0, 0.35, 1);
export const EASE_IN = Easing.bezier(0.5, 0, 0.75, 0);
export const BACK = Easing.bezier(0.34, 1.56, 0.64, 1);

/** 0→1 entre a y b (fotogramas), con easing. */
export const ramp = (f: number, a: number, b: number, easing = EASE_OUT) =>
  interpolate(f, [a, b], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing });

/** Sube en [a,b], baja en [c,d]. */
export const inOut = (f: number, a: number, b: number, c: number, d: number) =>
  Math.min(ramp(f, a, b), 1 - ramp(f, c, d, EASE_IN_OUT));

export const mix = (a: number, b: number, t: number) => a + (b - a) * t;

/** Ruido determinista suave (para temblores de cámara y parpadeos). */
export const noise1 = (t: number, seed = 0) => {
  const s = (n: number) => {
    const x = Math.sin(n * 127.1 + seed * 311.7) * 43758.5453;
    return x - Math.floor(x);
  };
  const i = Math.floor(t);
  const fr = t - i;
  const u = fr * fr * (3 - 2 * fr);
  return mix(s(i), s(i + 1), u) * 2 - 1;
};
