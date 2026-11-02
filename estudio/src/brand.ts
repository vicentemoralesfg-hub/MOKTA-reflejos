/** MOKTA · sistema visual del contenido orgánico. */
export const FPS = 30;
export const W = 1080;
export const H = 1920;

export const C = {
  ink: "#07090D",
  ink2: "#0E1117",
  card: "#151922",
  white: "#F4F6F8",
  dim: "rgba(244,246,248,0.62)",
  faint: "rgba(244,246,248,0.38)",
  yellow: "#FFC83D",
  red: "#FF3B3B",
  green: "#2BE38A",
  blue: "#7FD3FF",
};

export const DISPLAY = "Barlow Condensed";
export const UI = "Inter, 'Noto Color Emoji', 'Apple Color Emoji', sans-serif";

/** Formato chileno: coma decimal, punto de miles. */
export const fmt = (n: number, d = 0) =>
  n.toLocaleString("es-CL", { minimumFractionDigits: d, maximumFractionDigits: d });

/**
 * Zonas seguras de Reels (1080×1920): Instagram tapa ~250 px arriba (cabecera)
 * y ~420 px abajo (texto, audio) más una columna de ~150 px a la derecha (botones).
 */
export const SAFE = { top: 250, bottom: 1500, left: 70, right: 930 };
