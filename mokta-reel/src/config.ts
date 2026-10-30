import timeline from "./timeline.json";

/**
 * MOKTA · Test de reflejos — configuración central.
 * Cambia aquí velocidades, tiempos, umbrales, colores y textos.
 * Los tiempos viven en timeline.json para que el generador de audio use exactamente los mismos.
 */

export const FPS = timeline.fps;
export const WIDTH = 1080;
export const HEIGHT = 1920;

export type RoundConfig = {
  id: string;
  speedKmh: number;
  label: string;
  /** Fotograma (desde el inicio de la ronda) en que aparece la barrera. */
  eventAt: number;
  /** Fotogramas que el mundo sigue avanzando después de la aparición (ventana para pausar). */
  reactWindow: number;
  /** Fotogramas de la tarjeta de resultado (mundo congelado). */
  resultDuration: number;
  /** Fotograma de un auto en sentido contrario (distractor, lejos del evento). */
  decoyAt?: number;
};

export const ROUNDS: RoundConfig[] = timeline.rounds;

export const roundDuration = (r: RoundConfig) =>
  r.eventAt + r.reactWindow + r.resultDuration;

export const HOOK_DURATION = timeline.hook.duration;
export const REVEAL_DURATION = timeline.reveal.duration;
export const CTA_DURATION = timeline.cta.duration;

export const TOTAL_DURATION =
  HOOK_DURATION +
  ROUNDS.reduce((a, r) => a + roundDuration(r), 0) +
  REVEAL_DURATION +
  CTA_DURATION;

/** Distancia (m) a la que aparece la barrera en las tres rondas. Igual en todas: la diferencia la pone la velocidad. */
export const BARRIER_DISTANCE_M = timeline.barrierDistanceM;

/**
 * Umbrales del resultado (segundos desde la aparición).
 * Base: Green (2000), revisión de estudios de tiempo de frenado:
 *  - ~0,70–0,75 s es el mejor caso humano cuando el conductor ESPERA la señal
 *    (≈0,5 s de percepción + ≈0,2 s de mover el pie).
 *  VERDE  < 0,50 s → percibiste y reaccionaste dentro del tiempo de percepción del mejor caso.
 *  AMARILLO 0,50–0,75 s → dentro del rango del mejor caso humano.
 *  ROJO   > 0,75 s → más lento que el mejor caso humano esperado.
 * A 30 fps los cortes caen en fotogramas exactos (15 y 22,5), sin fotogramas ambiguos.
 */
export const THRESHOLDS = timeline.thresholds;

export const kmhToMs = (kmh: number) => kmh / 3.6;

/** Modelo de frenado del cierre (datos aportados): 1,0 s de reacción, ≈0,7 g, asfalto seco. */
export const STOP_MODEL = { reactionS: 1.0, decelG: 0.7, g: 9.81 };
export const stoppingDistance = (kmh: number) => {
  const v = kmhToMs(kmh);
  return v * STOP_MODEL.reactionS + (v * v) / (2 * STOP_MODEL.decelG * STOP_MODEL.g);
};

export const COLORS = {
  green: "#2BE38A",
  yellow: "#FFC83D",
  red: "#FF3B3B",
  white: "#F4F6F8",
  dim: "rgba(244,246,248,0.62)",
  ink: "#05070B",
  accent: "#7FD3FF",
};

export const zoneOf = (seconds: number): "green" | "yellow" | "red" =>
  seconds < THRESHOLDS.greenMaxS ? "green" : seconds < THRESHOLDS.yellowMaxS ? "yellow" : "red";

export const TEXT = {
  hookTop: "PAUSA EL VIDEO",
  hookKicker: "TEST DE REFLEJOS",
  hookBottom: "cuando veas esta barrera",
  hookRule: "3 rondas · cada una más rápida",
  timerCaption: "sin frenar",
  resultTitle: "¿Dónde pausaste?",
  zoneLabels: { green: "RÁPIDO", yellow: "JUSTO", red: "TARDE" },
  revealTop: "Y eso es solo reaccionar.",
  revealSub: "Distancia total para detenerte",
  revealFoot: "Modelo: 1 s de reacción · frenada ≈0,7 g · asfalto seco · ABS",
  ctaTop: "¿En qué ronda",
  ctaMid: "caíste en rojo?",
  ctaComment: "Comenta tu tiempo de la ronda final",
  ctaShare: "Envíaselo a quien maneja rápido",
};

export const FONT_DISPLAY = "Barlow Condensed";
export const FONT_UI = "Inter";

/** Formato numérico chileno: coma decimal. */
export const fmt = (n: number, decimals = 1) => n.toFixed(decimals).replace(".", ",");
