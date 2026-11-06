import quiz from "./quiz.json";

/**
 * MOKTA · ¿Reconoces el motor? — configuración central.
 * Tiempos y contenido viven en quiz.json: el generador de audio (scripts/build_audio.py) lee el mismo archivo,
 * así que imagen y sonido comparten exactamente los mismos fotogramas.
 */

export const FPS = quiz.fps;
export const WIDTH = 1080;
export const HEIGHT = 1920;

export type Round = {
  id: string;
  level: string;
  final?: boolean;
  answer: string;
  options: string[];
  correct: number;
  car: string;
  spec: string;
  img: string;
  engineImg: string;
  /** Fotogramas: tarjeta de ronda (con silencio), escucha, cuenta regresiva, silencio previo, revelación. */
  intro: number;
  listen: number;
  countdown: number;
  gap: number;
  reveal: number;
};

export const ROUNDS: Round[] = quiz.rounds;
export const HOOK_DURATION = quiz.hook.duration;
export const CTA_DURATION = quiz.cta.duration;

export const roundDuration = (r: Round) => r.intro + r.listen + r.countdown + r.gap + r.reveal;

/** Fotograma (desde el inicio de la ronda) en que aparecen las alternativas. */
export const optionsAt = (r: Round) => r.intro + Math.round(r.listen * 0.42);
export const countdownAt = (r: Round) => r.intro + r.listen;
export const revealAt = (r: Round) => r.intro + r.listen + r.countdown + r.gap;

export const ROUND_STARTS: number[] = ROUNDS.reduce<number[]>(
  (acc, r, i) => [...acc, i === 0 ? HOOK_DURATION : acc[i - 1] + roundDuration(ROUNDS[i - 1])],
  [],
);

export const TOTAL_DURATION =
  HOOK_DURATION + ROUNDS.reduce((a, r) => a + roundDuration(r), 0) + CTA_DURATION;

export const COLORS = {
  ink: "#05060A",
  panel: "rgba(255,255,255,0.06)",
  panelLine: "rgba(255,255,255,0.14)",
  white: "#F5F6F8",
  dim: "rgba(245,246,248,0.6)",
  accent: "#FF5A1F", // naranja escape
  accent2: "#FFC21A", // ámbar
  green: "#2BE38A",
  red: "#FF3B4E",
};

export const LEVEL_COLORS: Record<string, string> = {
  "FÁCIL": "#2BE38A",
  MEDIO: "#FFC21A",
  "DIFÍCIL": "#FF8A1F",
  EXPERTO: "#FF3B4E",
  LOCURA: "#C04BFF",
};

export const LETTERS = ["A", "B", "C", "D"];

export const FONT_DISPLAY = "Barlow Condensed";
export const FONT_UI = "Inter";

export const TEXT = {
  hookA: "¿Serías capaz de reconocer estos motores",
  hookB: "SIN VERLOS?",
  hookC: "El último es una locura",
  hookChip: "SUBE EL VOLUMEN",
  listen: "ESCUCHA",
  choose: "ELIGE",
  finalRound: "RONDA FINAL",
  tally: "Cuenta tus aciertos",
  ctaTop: "¿Cuántas acertaste?",
  ctaComment: "Comenta tu puntaje",
  ctaHardest: "y cuál fue la más difícil",
};
