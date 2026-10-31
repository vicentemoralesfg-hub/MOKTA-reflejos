import timeline from "./timeline.json";

export const FPS = timeline.fps;

export type Word = { w: string; t: number };
export type Beat = {
  id: string;
  duration: number;
  vo: string;
  /** Inicio de la locución dentro de la escena (fotogramas). */
  voAt?: number;
  /** Palabras con su instante (fotogramas desde el inicio de la escena), si hay locución. */
  words?: Word[];
};

export const BEATS: Beat[] = timeline.beats as Beat[];

export const beatStart = (id: string) => {
  let t = 0;
  for (const b of BEATS) {
    if (b.id === id) return t;
    t += b.duration;
  }
  throw new Error(`Escena desconocida: ${id}`);
};

export const beat = (id: string) => {
  const b = BEATS.find((x) => x.id === id);
  if (!b) throw new Error(`Escena desconocida: ${id}`);
  return b;
};

export const TOTAL = BEATS.reduce((a, b) => a + b.duration, 0);

const norm = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9ñ]/g, "");

/**
 * Fotograma (relativo a la escena) en que la locución dice `word`.
 * Si no hay locución sincronizada, usa `fallback`. `nth` elige la n-ésima aparición.
 */
export const cue = (id: string, word: string, fallback: number, nth = 0) => {
  const b = beat(id);
  if (!b.words) return fallback;
  const target = norm(word);
  const hits = b.words.filter((x) => norm(x.w) === target);
  const h = hits[nth];
  return h ? Math.round(h.t) : fallback;
};
