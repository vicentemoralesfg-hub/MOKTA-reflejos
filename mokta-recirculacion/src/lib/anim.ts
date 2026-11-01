import { Easing, interpolate, spring } from "remotion";
import { FPS } from "../config";

export const EASE_OUT = Easing.bezier(0.16, 1, 0.3, 1);
export const EASE_IN_OUT = Easing.bezier(0.65, 0, 0.35, 1);
export const EASE_IN = Easing.bezier(0.55, 0, 1, 0.45);

/** 0→1 entre a y b (fotogramas), con easing. */
export const ramp = (f: number, a: number, b: number, easing = EASE_OUT) =>
  interpolate(f, [a, b], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing });

/** Entrada en [a,b] y salida en [c,d]. */
export const inOut = (f: number, a: number, b: number, c: number, d: number) =>
  Math.min(ramp(f, a, b), 1 - ramp(f, c, d, EASE_IN_OUT));

/** Resorte con rebote (para "pops" de texto e íconos). 0 antes de `at`. */
export const pop = (f: number, at: number, damping = 11, stiffness = 170) =>
  f < at ? 0 : spring({ frame: f - at, fps: FPS, config: { damping, stiffness, mass: 0.6 } });

/** Resorte sin rebote. */
export const smooth = (f: number, at: number, durationInFrames = 14) =>
  f < at ? 0 : spring({ frame: f - at, fps: FPS, config: { damping: 200 }, durationInFrames });

/** Pseudoaleatorio determinista en [0,1). */
export const rand = (n: number) => {
  const x = Math.sin(n * 127.1 + 311.7) * 43758.5453123;
  return x - Math.floor(x);
};

/**
 * Sacudida de cámara que decae tras cada impacto.
 * `hits`: fotogramas de impacto; devuelve desplazamiento en px y rotación en grados.
 */
export const shake = (f: number, hits: number[], amp = 18, decay = 7) => {
  let x = 0;
  let y = 0;
  let r = 0;
  for (const h of hits) {
    const d = f - h;
    if (d < 0 || d > decay * 4) continue;
    const k = Math.exp(-d / decay) * amp;
    x += Math.sin(d * 2.9 + h) * k;
    y += Math.cos(d * 3.7 + h * 0.7) * k * 0.8;
    r += Math.sin(d * 2.3 + h * 1.3) * k * 0.03;
  }
  return { x, y, r };
};

export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
