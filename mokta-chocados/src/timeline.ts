import timeline from "./data/timeline.json";
import vo from "./data/vo.json";

export const FPS = timeline.fps;
export const WIDTH = timeline.width;
export const HEIGHT = timeline.height;

export type SceneId = "s01" | "s02" | "s03" | "s04" | "s05" | "s06" | "s07" | "s08" | "s09" | "s10";
type Word = { t: string; s: number; e: number };
const VO = vo as Record<SceneId, { duration: number; words: Word[] }>;

export type SceneInfo = { id: SceneId; from: number; duration: number; voStart: number; voFrom: number };

/** Misma cuenta que scripts/mix_audio.py: duración = voStart + locución + cola, redondeada a fotogramas. */
export const SCENES: SceneInfo[] = (() => {
  let from = 0;
  return timeline.scenes.map((s) => {
    const id = s.id as SceneId;
    const duration = Math.round((s.voStart + VO[id].duration + s.tail) * FPS);
    const info = { id, from, duration, voStart: s.voStart, voFrom: Math.round(s.voStart * FPS) };
    from += duration;
    return info;
  });
})();

export const TOTAL_FRAMES = SCENES.reduce((a, s) => a + s.duration, 0);
export const scene = (id: SceneId) => SCENES.find((s) => s.id === id)!;
export const words = (id: SceneId) => VO[id].words;

const norm = (s: string) =>
  s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9,]/g, "");

/** Fotograma (relativo al inicio de la escena) en que la voz empieza a decir `word` (n-ésima aparición). */
export const at = (id: SceneId, word: string, nth = 0, edge: "s" | "e" = "s") => {
  const target = norm(word);
  const list = VO[id].words.filter((w) => norm(w.t) === target || norm(w.t).startsWith(target));
  const w = list[Math.min(nth, list.length - 1)];
  if (!w) throw new Error(`Palabra no encontrada: ${id}/${word}`);
  return Math.round((scene(id).voStart + w[edge]) * FPS);
};
