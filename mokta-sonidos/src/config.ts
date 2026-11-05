// Fuente única de tiempos, colores y contenido del reel "¿Qué auto es?".
// Todo en fotogramas a 30 fps. Los tiempos se adaptan a la duración real de cada
// frase de la voz (src/voz.json, generado por scripts/generar_voz.py).
import VOZ from "./voz.json";

export const FPS = 30;
export const WIDTH = 1080;
export const HEIGHT = 1920;

// Paleta clara y saturada
export const COLORS = {
  ink: "#1A1240",
  paper: "#FFF7EC",
  violet: "#7B2FF7",
  pink: "#FF2E88",
  cyan: "#00C2E8",
  yellow: "#FFC81F",
  orange: "#FF7A1A",
  lime: "#19D66B",
  white: "#FFFFFF",
};

export const FONT_DISPLAY = "Anton";
export const FONT_BLOCK = "Archivo Black";

export type Opcion = "A" | "B";
export type ClaveVoz = keyof typeof VOZ;

/** duración de una frase en fotogramas */
export const dVoz = (k: ClaveVoz) => Math.ceil(VOZ[k] * FPS);
export const archivoVoz = (k: ClaveVoz) => `voz/${k}.wav`;

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
  a: Auto;
  b: Auto;
  correcta: Opcion;
  /** dato breve que aparece al revelar */
  dato: string;
  sonido: string; // public/autos
  sonidoFrames: number; // duración del clip del motor
  acento: string;
  acento2: string;
};

export const RONDAS: Ronda[] = [
  {
    numero: 1,
    a: { nombre: "FERRARI", imagen: "img/ferrari.jpg", encuadre: "50% 62%" },
    b: { nombre: "LAMBORGHINI", imagen: "img/lamborghini.jpg", encuadre: "50% 60%" },
    correcta: "B",
    dato: "V12 · 770 CV",
    sonido: "autos/ronda1_lamborghini.wav",
    sonidoFrames: 213,
    acento: COLORS.pink,
    acento2: COLORS.yellow,
  },
  {
    numero: 2,
    a: { nombre: "FORD MUSTANG", imagen: "img/mustang.jpg", encuadre: "50% 58%" },
    b: { nombre: "NISSAN GT-R", imagen: "img/gtr.jpg", encuadre: "50% 66%" },
    correcta: "A",
    dato: "V8 · 760 CV",
    sonido: "autos/ronda2_mustang.wav",
    sonidoFrames: 202,
    acento: COLORS.cyan,
    acento2: COLORS.orange,
  },
  {
    numero: 3,
    a: { nombre: "BUGATTI", imagen: "img/bugatti.jpg", encuadre: "50% 70%" },
    b: { nombre: "FÓRMULA 1", imagen: "img/f1.jpg", encuadre: "46% 60%", zoom: 1.55 },
    correcta: "B",
    dato: "V10 · 19.000 RPM",
    sonido: "autos/ronda3_f1.wav",
    sonidoFrames: 213,
    acento: COLORS.violet,
    acento2: COLORS.lime,
  },
];

export const voz = (r: Ronda, parte: "ronda" | "pregunta" | "ab" | "revela") =>
  `r${r.numero}_${parte}` as ClaveVoz;

// ---- Estructura de cada ronda (fotogramas locales), guiada por la voz ----
export const CUENTA_PASO = 30; // 1 s por número: da tiempo a pensar

export const tiempos = (r: Ronda) => {
  const vozRonda = 4;
  const titulo = Math.max(40, vozRonda + dVoz(voz(r, "ronda")) + 6); // fin del título a pantalla completa
  const cartas = titulo - 8; // entran las tarjetas
  const pregunta = cartas + 16; // "¿Ferrari o Lamborghini? ¡Escucha!"
  const sonido = pregunta + dVoz(voz(r, "pregunta")) + 10;
  const sonidoFin = sonido + r.sonidoFrames;
  const ab = sonidoFin + 8; // "¿A o B?"
  // la cuenta 3 · 2 · 1 arranca mientras la voz pregunta, termina ~1 s después de ella
  const cuenta = Math.max(ab + 12, ab + dVoz(voz(r, "ab")) - CUENTA_PASO * 2);
  const revela = cuenta + CUENTA_PASO * 3;
  const vozRevela = revela + 16; // "¡Era el ...!"
  const fin = Math.max(revela + 80, vozRevela + dVoz(voz(r, "revela")) + 16);
  return { vozRonda, titulo, cartas, pregunta, sonido, sonidoFin, ab, cuenta, revela, vozRevela, fin };
};

export const rondaDuracion = (r: Ronda) => tiempos(r).fin;

export const HOOK_DURACION = 8 + dVoz("gancho") + 18;
export const CTA_DURACION = 6 + dVoz("cierre") + 40;

export const inicioRonda = (i: number) =>
  HOOK_DURACION + RONDAS.slice(0, i).reduce((s, r) => s + rondaDuracion(r), 0);

export const TOTAL = inicioRonda(RONDAS.length) + CTA_DURACION;
