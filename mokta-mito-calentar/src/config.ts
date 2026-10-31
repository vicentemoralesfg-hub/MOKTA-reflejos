/** MOKTA · Mito de calentar el auto — paleta, tipografías y utilidades de formato. */
export const WIDTH = 1080;
export const HEIGHT = 1920;

export const C = {
  ink: "#04060B",
  night: "#071022",
  navy: "#0B1A33",
  white: "#F4F6F8",
  dim: "rgba(244,246,248,0.62)",
  faint: "rgba(244,246,248,0.38)",
  frost: "#9FDCFF",
  ice: "#D9F2FF",
  cyan: "#43C6FF",
  heat: "#FF8A3D",
  red: "#FF3B3B",
  amber: "#FFC83D",
  green: "#2BE38A",
  oil: "#E8A93A",
  sepia: "#D8B98A",
};

export const FONT_DISPLAY = "Barlow Condensed";
export const FONT_UI = "Inter";

/**
 * Zona segura de Reels (1080×1920): arriba ~220 px (barra superior),
 * abajo ~420 px (descripción, audio, perfil), derecha ~140 px (botones).
 * Todo el texto importante vive entre y=230 y y=1500, x=70..940.
 */
export const SAFE = { top: 230, bottom: 1500, left: 70, right: 940 };

/** Formato chileno: coma decimal. */
export const fmt = (n: number, d = 1) => n.toFixed(d).replace(".", ",");
