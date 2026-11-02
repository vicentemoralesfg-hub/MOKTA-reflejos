import t from "./timeline.json";

export const TL = t;
export const REAL = 600; // °/fotograma a 3.000 rpm

/** Velocidad (°/fotograma) en el fotograma f — interpolación geométrica entre puntos. */
export const speedAt = (f: number) => {
  const s = t.speed as [number, number][];
  if (f <= s[0][0]) return s[0][1];
  for (let i = 0; i < s.length - 1; i++) {
    const [a, va] = s[i];
    const [b, vb] = s[i + 1];
    if (f <= b) {
      const u = (f - a) / (b - a);
      const e = u * u * (3 - 2 * u);
      return Math.exp(Math.log(va) + (Math.log(vb) - Math.log(va)) * e);
    }
  }
  return s[s.length - 1][1];
};

/** Ángulo acumulado del ciclo al inicio del fotograma f (suma exacta, determinista). */
const CACHE: number[] = [0];
export const thetaAt = (f: number) => {
  for (let k = CACHE.length; k <= f; k++) CACHE[k] = CACHE[k - 1] + speedAt(k - 1);
  return CACHE[f];
};

/** Explosiones acumuladas (una cada 180° del ciclo en un 4 cilindros). */
export const explosionsAt = (f: number) => Math.floor(thetaAt(f) / 180);

/** Tiempo real transcurrido (s): cada grado del ciclo = 1/18.000 s a 3.000 rpm. */
export const realTimeAt = (f: number) => thetaAt(f) / 18000;
