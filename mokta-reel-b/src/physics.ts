/**
 * Modelo de frenado de la propuesta B (estimación, no medición).
 * Misma fórmula que scripts/modelo_frenado.py (que lo verifica con --check).
 *
 *  distancia de reacción  dr = v·t
 *  distancia de frenado   df = v² / (2a)        a constante
 *  distancia total        dt = dr + df
 *  dt ≤ D → se detiene, sobran D − dt
 *  dt > D → llega a la barrera a √(v² − 2a(D − dr))   (v si dr ≥ D)
 */
export const G = 9.81;

export const kmhToMs = (kmh: number) => kmh / 3.6;

export type Outcome = {
  reactionM: number;
  brakingM: number;
  totalM: number;
  stops: boolean;
  /** Metros que sobran antes de la barrera (0 si no se detiene). */
  marginM: number;
  /** Velocidad estimada al llegar a la barrera (0 si se detiene). */
  impactKmh: number;
};

export const brakeOutcome = (kmh: number, t: number, distanceM: number, decelG: number): Outcome => {
  const v = kmhToMs(kmh);
  const a = decelG * G;
  const reactionM = v * t;
  const brakingM = (v * v) / (2 * a);
  const totalM = reactionM + brakingM;
  if (totalM <= distanceM) {
    return { reactionM, brakingM, totalM, stops: true, marginM: distanceM - totalM, impactKmh: 0 };
  }
  const impactKmh =
    reactionM >= distanceM ? kmh : Math.sqrt(v * v - 2 * a * (distanceM - reactionM)) * 3.6;
  return { reactionM, brakingM, totalM, stops: false, marginM: 0, impactKmh };
};

/** Último tiempo de reacción con el que aún se detiene antes de la barrera (null si es imposible). */
export const lastStopTime = (kmh: number, distanceM: number, decelG: number) => {
  const v = kmhToMs(kmh);
  const t = (distanceM - (v * v) / (2 * decelG * G)) / v;
  return t >= 0 ? t : null;
};

/** Formato chileno: coma decimal. */
export const fmt = (n: number, decimals = 1) => n.toFixed(decimals).replace(".", ",");
