import timeline from "./timeline.json";

/**
 * MOKTA · "El botón que usas al revés" — configuración central.
 * Tiempos en timeline.json (los comparte el generador de audio); aquí textos, colores y tipografías.
 */

export const FPS = timeline.fps;
export const WIDTH = 1080;
export const HEIGHT = 1920;

export type SceneId = "hook" | "define" | "winter" | "summer" | "rule" | "recipe" | "cta";

type SceneDef = { id: string; duration: number; beats: Record<string, number> };
const SCENES = timeline.scenes as unknown as SceneDef[];

export const scene = (id: SceneId) => {
  const s = SCENES.find((x) => x.id === id);
  if (!s) throw new Error(`Escena desconocida: ${id}`);
  return s;
};

/** Instante (fotograma relativo a su escena) de un pulso con nombre. */
export const beat = (id: SceneId, name: string) => {
  const b = scene(id).beats[name];
  if (b === undefined) throw new Error(`Pulso desconocido: ${id}.${name}`);
  return b;
};

export const SCENE_ORDER = SCENES.map((s) => s.id as SceneId);
export const TOTAL_DURATION = SCENES.reduce((a, s) => a + s.duration, 0);

export const COLORS = {
  ink: "#05070B",
  white: "#F4F6F8",
  dim: "rgba(244,246,248,0.66)",
  faint: "rgba(244,246,248,0.42)",
  red: "#FF3B3B",
  green: "#2BE38A",
  led: "#FFB020",
  cold: "#5CC8FF",
  hot: "#FF7A1A",
  fog: "#C9D4DE",
};

export const FONT_DISPLAY = "Barlow Condensed";
export const FONT_UI = "Inter";

/**
 * Textos en pantalla. El reel está pensado para verse SIN sonido (texto grande y corto).
 * La cifra del 90 % es el gancho editorial pedido para el reel, no un dato de estudio.
 */
export const TEXT = {
  hookTop: "EL 90%",
  hookMid: "USA ESTE BOTÓN",
  hookFlip: "AL REVÉS",
  hookHabit: "Un hábito de 2 segundos que…",
  hookC1: "te empaña los vidrios",
  hookC2: "te quema bencina",
  teaser: "Al final: cómo desempañar al tiro",

  defineKicker: "SE LLAMA",
  defineName: "RECIRCULACIÓN",
  defineIntake: "Cierra la entrada de aire de afuera…",
  defineLoop: "…y el auto respira su propio aire",

  winterChip: "ERROR #1 · INVIERNO",
  winterLine: "La prendes para no pasar frío",
  winterBreath: "Tu respiración suelta",
  winterBreathHi: "vapor de agua",
  winterTrapped: "…y queda atrapado adentro",
  winterGlass: "Toca el vidrio frío…",
  winterFogged: "Y SE EMPAÑA",
  winterCo2: "Y sube el CO₂: da sueño",

  summerChip: "ERROR #2 · VERANO",
  summerLine1: "Aire acondicionado prendido…",
  summerLine2: "y la recirculación",
  summerLine2Hi: "APAGADA",
  summerFlow: "El compresor enfría aire caliente de afuera",
  summerFlowHi: "SIN PARAR",
  summerFuel1: "Más esfuerzo",
  summerFuel2: "= MÁS BENCINA",

  ruleLead: "LO ESTÁS USANDO",
  ruleFlip: "AL REVÉS",
  ruleColdTitle: "FRÍO O LLUVIA",
  ruleColdDo: "Aire de afuera",
  ruleColdWhy: "La humedad sale y el vidrio no se empaña",
  ruleHotTitle: "CALOR",
  ruleHotDo: "Recirculación",
  ruleHotWhy: "El A/C enfría aire que ya está frío",
  ruleNote1: "Al subir a un auto al sol: ventila 1 minuto primero",
  ruleNote2: "Y cada cierto rato, abre para renovar el aire",
  ruleSave: "Guárdalo para cuando lo necesites",

  recipeTitle1: "¿Y PARA DESEMPAÑAR",
  recipeTitle2: "AL TIRO?",
  steps: [
    { n: "1", title: "MODO PARABRISAS", sub: "Todo el aire al vidrio" },
    { n: "2", title: "A/C PRENDIDO", sub: "Aunque sea invierno: seca el aire" },
    { n: "3", title: "RECIRCULACIÓN APAGADA", sub: "Entra aire seco de afuera" },
    { n: "4", title: "VENTILADOR AL MÁXIMO", sub: "Y temperatura caliente" },
  ],
  recipeDone: "LISTO",
  recipeRear: "Luneta trasera: el botón del rectángulo",

  ctaQ1: "¿LO USABAS",
  ctaQ2: "AL REVÉS?",
  ctaComment: "Comenta SÍ o NO",
  ctaSave: "Guárdalo para el próximo día de lluvia",
  ctaShare: "Mándaselo a quien anda todo empañado",
  brand: "MOKTA",
};
