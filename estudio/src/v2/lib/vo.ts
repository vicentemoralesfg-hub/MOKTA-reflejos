/** Tiempos de la locución (generados por scripts/vo_generate.py) → fotogramas. */
export type VOWord = { w: string; s: number; e: number };
export type VOSeg = { id: string; text: string; start: number; end: number; words: VOWord[] };
export type VO = { duration: number; segments: VOSeg[] };

export const FPS = 30;
export const fr = (sec: number) => Math.round(sec * FPS);

export const seg = (vo: VO, id: string) => {
  const s = vo.segments.find((x) => x.id === id);
  if (!s) throw new Error(`Segmento inexistente: ${id}`);
  return { ...s, f0: fr(s.start), f1: fr(s.end) };
};

const clean = (w: string) =>
  w
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]/g, "");

/** Fotograma en que empieza la primera palabra del segmento que contiene `needle` (sin tildes ni puntuación). */
export const wordAt = (vo: VO, id: string, needle: string | string[], fallbackSec?: number) => {
  const s = seg(vo, id);
  const ns = (Array.isArray(needle) ? needle : [needle]).map(clean);
  const w = ns.map((n) => s.words.find((x) => clean(x.w).includes(n))).find((x) => x);
  if (w) return fr(w.s);
  return fallbackSec !== undefined ? fr(fallbackSec) : s.f0;
};

export const total = (vo: VO, tailSec = 1.6) => fr(vo.duration + tailSec);
