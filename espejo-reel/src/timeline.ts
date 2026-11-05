import vo from "./vo_words.json";
import { FPS } from "./config";

/**
 * Fuente única de tiempos: la transcripción de la locución (src/vo_words.json,
 * generada por scripts/prep_vo.py). Todas las animaciones se anclan a palabras,
 * así que si cambia la locución, el video se re-sincroniza solo.
 */
export type Word = { text: string; start: number; end: number };
export const WORDS: Word[] = vo.words;

/** Fotograma en que empieza / termina la palabra i. */
export const wf = (i: number) => Math.round(WORDS[i].start * FPS);
export const we = (i: number) => Math.round(WORDS[i].end * FPS);

export const TOTAL = we(WORDS.length - 1) + 48;

export type SceneId = "hook" | "tab" | "error" | "fix" | "how" | "ec" | "day" | "cta";

/** Cortes de escena: unos fotogramas antes de la primera palabra de cada bloque. */
export const SCENES: Record<SceneId, [number, number]> = {
  hook: [0, wf(20) - 3],
  tab: [wf(20) - 3, wf(35) - 3],
  error: [wf(35) - 3, wf(50) - 5],
  fix: [wf(50) - 5, wf(68) - 5],
  how: [wf(68) - 5, wf(115) - 3],
  ec: [wf(115) - 3, wf(125) - 3],
  day: [wf(125) - 3, wf(134) - 4],
  cta: [wf(134) - 4, TOTAL],
};

export const SCENE_ORDER: SceneId[] = ["hook", "tab", "error", "fix", "how", "ec", "day", "cta"];
