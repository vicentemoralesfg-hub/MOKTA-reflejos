import { Easing, interpolate } from "remotion";

export const EASE_OUT = Easing.bezier(0.16, 1, 0.3, 1);
export const EASE_IN_OUT = Easing.bezier(0.65, 0, 0.35, 1);
export const EASE_IN = Easing.bezier(0.5, 0, 0.75, 0);
/** Sobreimpulso tipo "sello". */
export const EASE_BACK = Easing.bezier(0.34, 1.56, 0.64, 1);

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

/** 0→1 entre a y b (fotogramas), con easing. */
export const ramp = (f: number, a: number, b: number, easing = EASE_OUT) =>
  interpolate(f, [a, b], [0, 1], { ...clamp, easing });

export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/** Interpolación con clamp. */
export const map = (f: number, inp: number[], out: number[], easing?: (t: number) => number) =>
  interpolate(f, inp, out, { ...clamp, easing });

/** Pseudoaleatorio determinista en [0,1). */
export const rand = (seed: number) => {
  const x = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};

/** Ruido 1D suave (valor) para temblores de cámara. */
export const noise1 = (t: number, seed = 0) => {
  const i = Math.floor(t);
  const fr = t - i;
  const a = rand(i + seed * 101);
  const b = rand(i + 1 + seed * 101);
  const u = fr * fr * (3 - 2 * fr);
  return (a + (b - a) * u) * 2 - 1;
};

/** Temblor decreciente tras un impacto en el fotograma `at`. */
export const impactShake = (f: number, at: number, amp = 18, dur = 14) => {
  const k = f - at;
  if (k < 0 || k > dur) return { x: 0, y: 0, r: 0 };
  const d = Math.pow(1 - k / dur, 2);
  return {
    x: noise1(k * 0.9, 1) * amp * d,
    y: noise1(k * 0.9, 2) * amp * d,
    r: noise1(k * 0.9, 3) * amp * 0.06 * d,
  };
};
