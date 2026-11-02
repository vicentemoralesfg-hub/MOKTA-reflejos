import { Easing, interpolate } from "remotion";

export const EASE_OUT = Easing.bezier(0.16, 1, 0.3, 1);
export const EASE_IN_OUT = Easing.bezier(0.65, 0, 0.35, 1);
export const EASE_IN = Easing.bezier(0.5, 0, 0.75, 0);
export const BACK_OUT = Easing.bezier(0.34, 1.56, 0.64, 1);

/** 0→1 entre a y b (fotogramas), con easing. */
export const ramp = (f: number, a: number, b: number, easing = EASE_OUT) =>
  interpolate(f, [a, b], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing });

/** Sube en [a,b], baja en [c,d]. */
export const inOut = (f: number, a: number, b: number, c: number, d: number) =>
  Math.min(ramp(f, a, b), 1 - ramp(f, c, d, EASE_IN_OUT));

export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/** Ruido suave determinista (suma de senos), para vibraciones de cámara. */
export const wobble = (t: number, seed = 0) =>
  Math.sin(t * 7.3 + seed) * 0.5 + Math.sin(t * 13.1 + seed * 2.1) * 0.3 + Math.sin(t * 23.7 + seed * 3.7) * 0.2;
