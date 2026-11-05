import words from "./data/words.json";
import cues from "./data/cues.json";

/**
 * Sincronía: todo se ancla a las palabras de la locución (words.json, generado por
 * scripts/bencina/prep_voice.py) y a los cues con nombre (cues.json). El generador de
 * audio lee los mismos archivos, así que imagen, subtítulos y efectos caen juntos.
 */
export const FPS = 30;
export const WIDTH = 1080;
export const HEIGHT = 1920;

export type Word = { text: string; start: number; end: number };
export const WORDS: Word[] = words.words;

/** Fotograma global en que empieza / termina la palabra i. */
export const W = (i: number) => Math.round(WORDS[i].start);
export const WE = (i: number) => Math.round(WORDS[i].end);

type CueName = keyof typeof cues.cues;
/** Fotograma global de un cue con nombre. */
export const cue = (name: CueName) => {
  const [i, off] = cues.cues[name];
  return W(i) + off;
};

export const TOTAL = WE(WORDS.length - 1) + cues.tailFrames;

export type SceneId =
  | "hook"
  | "setup"
  | "secret"
  | "mechanism"
  | "r1"
  | "r2"
  | "r3"
  | "payoff"
  | "tip"
  | "cta";

/** Escenas: el corte cae `lead` fotogramas antes de la primera palabra (la imagen anticipa a la voz). */
export const SCENES = cues.scenes.map(([id, wordIdx], k) => {
  const from = k === 0 ? 0 : W(wordIdx as number) - cues.lead;
  const next = cues.scenes[k + 1];
  const to = next ? W(next[1] as number) - cues.lead : TOTAL;
  return { id: id as SceneId, from, to, captions: !cues.captionsOff.includes(id as string) };
});

export const sceneOf = (id: SceneId) => SCENES.find((s) => s.id === id)!;
