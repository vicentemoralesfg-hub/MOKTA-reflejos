import { Easing, interpolate } from "remotion";

export const EASE_OUT = Easing.bezier(0.16, 1, 0.3, 1);
export const EASE_IN_OUT = Easing.bezier(0.65, 0, 0.35, 1);
export const EASE_BACK = Easing.bezier(0.34, 1.56, 0.64, 1);

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

/** 0→1 entre los fotogramas a y b, con easing. */
export const ramp = (f: number, a: number, b: number, easing = EASE_OUT) =>
  interpolate(f, [a, b], [0, 1], { ...clamp, easing });

/** Sube en [a,b] y baja en [c,d]. */
export const inOut = (f: number, a: number, b: number, c: number, d: number) =>
  Math.min(ramp(f, a, b), 1 - ramp(f, c, d, EASE_IN_OUT));

/** Entrada con rebote (escala 0→1 con sobrepaso). */
export const pop = (f: number, a: number, len = 9) => ramp(f, a, a + len, EASE_BACK);

/** Sacudida de cámara amortiguada que arranca en el fotograma `at`. */
export const shake = (f: number, at: number, amp = 18, len = 14) => {
  const k = f - at;
  if (k < 0 || k > len) return { x: 0, y: 0 };
  const decay = 1 - k / len;
  return {
    x: Math.sin(k * 2.7 + 1.3) * amp * decay,
    y: Math.cos(k * 3.4) * amp * 0.7 * decay,
  };
};

/** Ruido determinista 0..1 */
export const hash = (n: number) => {
  const x = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};
