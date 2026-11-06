import viz from "../viz.json";

/** Datos de audio precalculados (scripts/build_audio.py) a partir de la pista final: sincronía exacta por fotograma. */
const frames = viz.frames as number[][];
const level = viz.level as number[];
export const BANDS = viz.bands;

const clampIdx = (f: number) => Math.max(0, Math.min(level.length - 1, Math.round(f)));

/** Nivel global 0–1 en el fotograma absoluto f. */
export const levelAt = (f: number) => level[clampIdx(f)] ?? 0;

/** Espectro (BANDS valores 0–1) en el fotograma absoluto f, suavizado con el anterior. */
export const spectrumAt = (f: number): number[] => {
  const a = frames[clampIdx(f)] ?? [];
  const b = frames[clampIdx(f - 1)] ?? a;
  return a.map((v, i) => Math.max(v, (b[i] ?? 0) * 0.85));
};
