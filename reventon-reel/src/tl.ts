import timeline from "./timeline.json";
import cuesJson from "./cues.json";

export const FPS = timeline.fps;
export const TOTAL_FRAMES = timeline.totalFrames;
export const WORDS = timeline.words;
export const CUES = cuesJson;
/** Inicio / fin (s) de la palabra i de la locución. */
export const ws = (i: number) => WORDS[i].s;
export const we = (i: number) => WORDS[i].e;

export const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
/** Interpolación lineal con límites. */
export const lin = (T: number, T0: number, T1: number, a: number, b: number) => a + (b - a) * clamp01((T - T0) / (T1 - T0));
export const easeOut = (x: number) => 1 - Math.pow(1 - clamp01(x), 3);
export const easeInOut = (x: number) => {
  const y = clamp01(x);
  return y < 0.5 ? 4 * y * y * y : 1 - Math.pow(-2 * y + 2, 3) / 2;
};
/** 0→1 entre a y b segundos con easeOut. */
export const rise = (T: number, a: number, b: number) => easeOut((T - a) / (b - a));
export const fall = (T: number, a: number, b: number) => 1 - easeInOut((T - a) / (b - a));
