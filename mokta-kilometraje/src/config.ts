import tl from "./data/timeline.json";

/**
 * MOKTA · El kilometraje engaña — configuración central.
 * Los tiempos salen de src/data/timeline.json (generado por scripts/build_timeline.py
 * a partir de las marcas por palabra de la locución). Colores, tipografías y textos aquí.
 */

export const FPS = tl.fps;
export const WIDTH = 1080;
export const HEIGHT = 1920;
export const TOTAL_FRAMES = tl.totalFrames;

export type SceneId =
  | "gancho"
  | "comparacion"
  | "revelacion"
  | "odometro"
  | "taco"
  | "ciudad"
  | "habitos"
  | "carretera"
  | "veredicto"
  | "checklist"
  | "verdad"
  | "cta";

export type MarkerId = keyof typeof tl.markers;

export const SCENES = tl.scenes as { id: SceneId; from: number; duration: number; firstWord: number }[];
export const scene = (id: SceneId) => SCENES.find((s) => s.id === id)!;

/** Fotograma de una marca relativo al inicio de la escena (para usar dentro de cada escena). */
export const mk = (id: MarkerId, sceneId: SceneId) => tl.markers[id].frame - scene(sceneId).from;

export type Word = (typeof tl.words)[number];
export const WORDS = tl.words as Word[];
export const CAPTION_PAGES = tl.captionPages;

export const COLORS = {
  ink: "#05070B",
  panel: "rgba(14,18,27,0.86)",
  panelBorder: "rgba(255,255,255,0.10)",
  white: "#F4F6F8",
  dim: "rgba(244,246,248,0.62)",
  faint: "rgba(244,246,248,0.28)",
  red: "#FF3B3B",
  yellow: "#FFC83D",
  green: "#2BE38A",
  accent: "#7FD3FF",
  car: "#C9D2DC",
};

export const FONT_DISPLAY = "Barlow Condensed";
export const FONT_UI = "Inter";

/** Formato chileno: punto de miles. */
export const km = (n: number) => Math.round(n).toLocaleString("de-DE");
