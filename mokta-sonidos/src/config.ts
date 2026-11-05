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
    sonido: "autos/ronda1_lamborghini.wav",
    sonidoFrames: 225,
    acento: COLORS.pink,
    acento2: COLORS.yellow,
  },
  {
    numero: 2,
    a: { nombre: "FORD MUSTANG", imagen: "img/mustang.jpg", encuadre: "50% 58%" },
    b: { nombre: "NISSAN GT-R", imagen: "img/gtr.jpg", encuadre: "50% 66%" },
    correcta: "A",
    sonido: "autos/ronda2_mustang.wav",
    sonidoFrames: 225,
    acento: COLORS.cyan,
    acento2: COLORS.orange,
  },
  {
    numero: 3,
    a: { nombre: "BUGATTI", imagen: "img/bugatti.jpg", encuadre: "50% 70%" },
    b: { nombre: "FÓRMULA 1", imagen: "img/f1.jpg", encuadre: "46% 60%", zoom: 1.55 },
    correcta: "B",
    sonido: "autos/ronda3_f1.wav",
    sonidoFrames: 222,
    acento: COLORS.violet,
    acento2: COLORS.lime,
  },
];

export const vozRonda = (r: Ronda) => `r${r.numero}_ronda` as ClaveVoz;

// ---- Estructura de cada ronda (fotogramas locales) ----
// La voz solo anuncia "¡Ronda N!". Después: motor completo, cuenta 3-2-1 y el "correcto".
export const CUENTA_PASO = 30; // 1 s por número: da tiempo a pensar

export const tiempos = (r: Ronda) => {
  const voz = 3;
  const titulo = Math.max(36, voz + dVoz(vozRonda(r)) + 4); // fin del título a pantalla completa
  const cartas = titulo - 8; // entran las tarjetas
  const sonido = cartas + 22; // con las tarjetas ya asentadas
  const sonidoFin = sonido + r.sonidoFrames;
  const cuenta = sonidoFin + 6; // "¿A O B?" + 3 · 2 · 1
  const revela = cuenta + CUENTA_PASO * 3;
  const fin = revela + 62; // ~2 s para ver la respuesta con el sonido de correcto
  return { voz, titulo, cartas, sonido, sonidoFin, cuenta, revela, fin };
};

export const rondaDuracion = (r: Ronda) => tiempos(r).fin;

export const HOOK_DURACION = 6 + dVoz("gancho") + 14;
export const CTA_DURACION = 75;

export const inicioRonda = (i: number) =>
  HOOK_DURACION + RONDAS.slice(0, i).reduce((s, r) => s + rondaDuracion(r), 0);

export const TOTAL = inicioRonda(RONDAS.length) + CTA_DURACION;
