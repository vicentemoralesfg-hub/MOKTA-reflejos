import cues from "./data/cues.json";
import wordsData from "./data/words.json";

/**
 * Tiempos derivados de la locución real (words.json, generado por scripts/build_voice.py).
 * Cada plano empieza 0,12 s antes de su primera palabra: el corte llega justo antes de la voz.
 * scripts/build_audio.py usa exactamente el mismo criterio.
 */
export const FPS = cues.fps;
export const WIDTH = 1080;
export const HEIGHT = 1920;
export const TOTAL_FRAMES = wordsData.durationInFrames;

export type Word = { text: string; start: number; end: number };
export const WORDS: Word[] = wordsData.words;

export type ShotId =
  | "gancho"
  | "imagina"
  | "laVes"
  | "justoATiempo"
  | "radarOnda"
  | "radarFrente"
  | "laserEnciende"
  | "laserUnMetro"
  | "laserElTuyo"
  | "medioSegundo"
  | "piensaNumero"
  | "trescientos"
  | "kilometro"
  | "tresKm"
  | "niUnPunto"
  | "unMinuto"
  | "yaTeMidieron"
  | "detalle"
  | "patenteLejos"
  | "patenteCerca"
  | "cierre";

const shotStartFrame = (word: number) => {
  if (word === 0) return 0;
  const f = Math.round((WORDS[word].start - 0.12) * FPS);
  return Math.max(f, Math.round(WORDS[word - 1].end * FPS));
};

export type ShotTiming = { id: ShotId; from: number; duration: number; firstWord: number };

export const SHOTS: ShotTiming[] = cues.shots.map((s, i, arr) => {
  const from = shotStartFrame(s.word);
  const to = i + 1 < arr.length ? shotStartFrame(arr[i + 1].word) : TOTAL_FRAMES;
  return { id: s.id as ShotId, from, duration: to - from, firstWord: s.word };
});

export const shotById = (id: ShotId) => SHOTS.find((s) => s.id === id)!;

/** Segundo (relativo al plano) en que empieza la palabra i. */
export const wordAt = (shot: ShotId, i: number) => WORDS[i].start - shotById(shot).from / FPS;
export const wordEndAt = (shot: ShotId, i: number) => WORDS[i].end - shotById(shot).from / FPS;

export type Highlight = "key" | "red" | "blue";
export const HIGHLIGHTS = cues.highlights as Record<string, Highlight>;
