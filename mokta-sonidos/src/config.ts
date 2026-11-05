// Fuente única de tiempos, colores y contenido del reel "¿Qué auto es?".
// Todo en fotogramas a 30 fps.

export const FPS = 30;
export const WIDTH = 1080;
export const HEIGHT = 1920;

export const COLORS = {
  ink: "#0B0820",
  night: "#150B3A",
  violet: "#7B2FF7",
  pink: "#FF2E88",
  cyan: "#19F0FF",
  yellow: "#FFE14D",
  lime: "#3DFF8A",
  red: "#FF3B3B",
  white: "#FFFFFF",
};

export const FONT_DISPLAY = "Anton";
export const FONT_BLOCK = "Archivo Black";

export type Opcion = "A" | "B";

export type Auto = {
  nombre: string;
  imagen: string; // en public/img
  /** object-position para encuadrar el auto dentro de la tarjeta */
  encuadre: string;
  /** acercamiento opcional de la foto */
  zoom?: number;
};

export type Ronda = {
  numero: 1 | 2 | 3;
  vozRonda: string; // public/voz
  a: Auto;
  b: Auto;
  correcta: Opcion;
  sonido: string; // public/autos
  sonidoFrames: number; // duración del clip del motor
  /** Colores de acento de la ronda (fondo y marcos) */
  acento: string;
  acento2: string;
};

export const RONDAS: Ronda[] = [
  {
    numero: 1,
    vozRonda: "voz/ronda1.wav",
    a: { nombre: "FERRARI", imagen: "img/ferrari.jpg", encuadre: "50% 62%" },
    b: { nombre: "LAMBORGHINI", imagen: "img/lamborghini.jpg", encuadre: "50% 60%" },
    correcta: "B",
    sonido: "autos/ronda1_lamborghini.wav",
    sonidoFrames: 165,
    acento: COLORS.pink,
    acento2: COLORS.yellow,
  },
  {
    numero: 2,
    vozRonda: "voz/ronda2.wav",
    a: { nombre: "FORD MUSTANG", imagen: "img/mustang.jpg", encuadre: "50% 58%" },
    b: { nombre: "NISSAN GT-R", imagen: "img/gtr.jpg", encuadre: "50% 66%" },
    correcta: "A",
    sonido: "autos/ronda2_mustang.wav",
    sonidoFrames: 165,
    acento: COLORS.cyan,
    acento2: COLORS.pink,
  },
  {
    numero: 3,
    vozRonda: "voz/ronda3.wav",
    a: { nombre: "BUGATTI", imagen: "img/bugatti.jpg", encuadre: "50% 70%" },
    b: { nombre: "FÓRMULA 1", imagen: "img/f1.jpg", encuadre: "46% 60%", zoom: 1.55 },
    correcta: "B",
    sonido: "autos/ronda3_f1.wav",
    sonidoFrames: 180,
    acento: COLORS.yellow,
    acento2: COLORS.cyan,
  },
];

// ---- Estructura de cada ronda (fotogramas locales) ----
export const R_TITULO_FIN = 34; // "RONDA N" a pantalla completa
export const R_CARTAS_IN = 26; // entran las tarjetas A y B
export const R_SONIDO_IN = 52; // empieza el sonido del motor
/** fin del sonido */
export const sonidoFin = (r: Ronda) => R_SONIDO_IN + r.sonidoFrames;
/** "¿A o B?" + cuenta 3-2-1 */
export const cuentaInicio = (r: Ronda) => sonidoFin(r) + 4;
export const CUENTA_PASO = 14;
export const revelacion = (r: Ronda) => cuentaInicio(r) + CUENTA_PASO * 3 + 4;
export const R_DESPUES_REVELAR = 70;
export const rondaDuracion = (r: Ronda) => revelacion(r) + R_DESPUES_REVELAR;

export const HOOK_DURACION = 102;
export const CTA_DURACION = 118;

export const inicioRonda = (i: number) =>
  HOOK_DURACION + RONDAS.slice(0, i).reduce((s, r) => s + rondaDuracion(r), 0);

export const TOTAL = inicioRonda(RONDAS.length) + CTA_DURACION;
