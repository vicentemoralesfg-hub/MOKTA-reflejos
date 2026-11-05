import { Easing, interpolate } from "remotion";

export const EASE_OUT = Easing.bezier(0.16, 1, 0.3, 1);
export const EASE_IN_OUT = Easing.bezier(0.65, 0, 0.35, 1);
export const EASE_IN = Easing.bezier(0.5, 0, 0.75, 0);
export const BACK = Easing.bezier(0.34, 1.56, 0.64, 1);

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

/** 0→1 entre los fotogramas a y b. */
export const ramp = (f: number, a: number, b: number, easing = EASE_OUT) =>
  interpolate(f, [a, b], [0, 1], { ...clamp, easing });

/** Sube en [a, a+dIn], baja en [b-dOut, b]. */
export const window_ = (f: number, a: number, b: number, dIn = 6, dOut = 6) =>
  Math.min(ramp(f, a, a + dIn), 1 - ramp(f, b - dOut, b, EASE_IN_OUT));

export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/** Rebote tipo "pop" (sobrepasa y vuelve). */
export const pop = (f: number, a: number, d = 10) => interpolate(f, [a, a + d], [0, 1], { ...clamp, easing: BACK });

/** Sacudida determinista que decae desde el fotograma a. */
export const shake = (f: number, a: number, amp = 18, dur = 14) => {
  if (f < a || f > a + dur) return { x: 0, y: 0 };
  const k = 1 - (f - a) / dur;
  return { x: Math.sin(f * 2.7 + a) * amp * k, y: Math.cos(f * 3.3 + a * 0.7) * amp * k };
};

/** Pseudoaleatorio determinista. */
export const rnd = (i: number) => {
  const x = Math.sin(i * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};

/** Formato pesos chilenos: $1.550.000 */
export const clp = (n: number) => "$" + Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");

/** Destello: 0 antes de a, salta a `peak` en a y decae a 0 en d fotogramas. */
export const flashAt = (f: number, a: number, d = 6, peak = 0.6) => (f < a || f > a + d ? 0 : peak * (1 - (f - a) / d));
