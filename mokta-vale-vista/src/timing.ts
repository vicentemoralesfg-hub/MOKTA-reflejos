import words from "./words.json";

/** Fuente única de tiempos. Todo se expresa en SEGUNDOS DE LOCUCIÓN (public/audio/voz.wav). */
export const FPS = 30;
export const WIDTH = 1080;
export const HEIGHT = 1920;
/** La voz entra 0,2 s después del primer fotograma (el primer fotograma ya tiene imagen fuerte). */
export const VOICE_OFFSET = 0.2;
export type Word = { w: string; s: number; e: number };
export const WORDS: Word[] = words;
export const VOICE_END = WORDS[WORDS.length - 1].e;

/** Segundo de locución → fotograma global. */
export const fr = (sec: number) => Math.round((sec + VOICE_OFFSET) * FPS);

export const SCENES = [
  { id: "Gancho", from: -VOICE_OFFSET, to: 5.2 },
  { id: "Publicacion", from: 5.2, to: 10.65 },
  { id: "Viernes", from: 10.65, to: 14.65 },
  { id: "Documento", from: 14.65, to: 18.8 },
  { id: "Entrega", from: 18.8, to: 20.75 },
  { id: "Lunes", from: 20.75, to: 26.6 },
  { id: "Explicacion", from: 26.6, to: 32.45 },
  { id: "AntesDe", from: 32.45, to: 33.95 },
  { id: "Paso1", from: 33.95, to: 39.3 },
  { id: "Paso2", from: 39.3, to: 44.0 },
  { id: "Paso3", from: 44.0, to: 49.7 },
  { id: "Foto", from: 49.7, to: 52.7 },
  { id: "Regla", from: 52.7, to: 55.6 },
  { id: "Cierre", from: 55.6, to: VOICE_END + 2.2 },
] as const;

export type SceneId = (typeof SCENES)[number]["id"];
export const TOTAL_FRAMES = fr(SCENES[SCENES.length - 1].to);
export const sceneOf = (id: SceneId) => SCENES.find((s) => s.id === id)!;
export const sceneFrames = (id: SceneId) => fr(sceneOf(id).to) - fr(sceneOf(id).from);
