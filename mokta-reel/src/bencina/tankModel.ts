/**
 * Modelo geométrico del estanque (coordenadas del dibujo: y=200 techo, y=700 fondo).
 *
 * El flotador mide ALTURA. Los litros dependen del ancho del estanque a cada altura.
 * Con un estanque más angosto abajo, cada litro final baja más el nivel → la aguja cae más rápido.
 * Todas las curvas del video (aguja vs. km, rebanadas de 5 L, gráfico final) salen de aquí.
 */
export type Pt = [number, number];

export const TOP = 200;
export const BOTTOM = 700;
export const H = BOTTOM - TOP;
export const CAPACITY_L = 50;

/** Estanque "caja" (modelo mental). 24 puntos, mismo orden que REAL para poder transformarlo. */
export const BOX: Pt[] = [
  [160, 200], [500, 200], [540, 200], [840, 200], [870, 230],
  [870, 330], [870, 410], [870, 470], [870, 600], [840, 700],
  [600, 700], [590, 700], [560, 700], [460, 700], [430, 700], [420, 700],
  [350, 700], [250, 700], [180, 700], [130, 660], [130, 560], [130, 430],
  [130, 400], [130, 230],
];

/** Estanque real: escalón del piso arriba, se angosta abajo, túnel del escape y hueco del eje. */
export const REAL: Pt[] = [
  [150, 200], [500, 200], [540, 228], [840, 228], [868, 250],
  [872, 330], [790, 410], [690, 470], [660, 600], [650, 700],
  [600, 700], [590, 640], [560, 590], [460, 590], [430, 640], [420, 700],
  [350, 700], [335, 660], [315, 560], [270, 480], [200, 440], [130, 430],
  [125, 400], [128, 240],
];

/** Tubo de llenado (cuello) para el "hasta el tope". */
export const NECK: Pt[] = [
  [800, 200], [860, 200], [935, 95], [880, 70],
];

export const morph = (a: Pt[], b: Pt[], k: number): Pt[] =>
  a.map((p, i) => [p[0] + (b[i][0] - p[0]) * k, p[1] + (b[i][1] - p[1]) * k]);

export const path = (pts: Pt[]) =>
  "M" + pts.map((p) => `${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(" L") + " Z";

export const hToY = (h: number) => BOTTOM - h * H;
export const yToH = (y: number) => (BOTTOM - y) / H;

/** Segmentos interiores del polígono a la altura y (regla par-impar). */
export const spansAt = (pts: Pt[], y: number): [number, number][] => {
  const xs: number[] = [];
  for (let i = 0; i < pts.length; i++) {
    const [x1, y1] = pts[i];
    const [x2, y2] = pts[(i + 1) % pts.length];
    if ((y1 <= y && y2 > y) || (y2 <= y && y1 > y)) {
      xs.push(x1 + ((y - y1) / (y2 - y1)) * (x2 - x1));
    }
  }
  xs.sort((a, b) => a - b);
  const out: [number, number][] = [];
  for (let i = 0; i + 1 < xs.length; i += 2) out.push([xs[i], xs[i + 1]]);
  return out;
};

const widthAt = (pts: Pt[], y: number) => spansAt(pts, y).reduce((a, [l, r]) => a + (r - l), 0);

/** Tabla de volumen acumulado (fracción 0..1) desde el fondo, por altura (fracción 0..1). */
const makeTable = (pts: Pt[]) => {
  const N = 500;
  const cum = new Float64Array(N + 1);
  for (let k = 0; k < N; k++) {
    const y = BOTTOM - (k + 0.5) * (H / N);
    cum[k + 1] = cum[k] + widthAt(pts, y);
  }
  const total = cum[N];
  for (let k = 0; k <= N; k++) cum[k] /= total;
  return {
    volumeAt: (h: number) => {
      const x = Math.max(0, Math.min(1, h)) * N;
      const k = Math.min(N - 1, Math.floor(x));
      return cum[k] + (cum[k + 1] - cum[k]) * (x - k);
    },
    heightAt: (v: number) => {
      const t = Math.max(0, Math.min(1, v));
      let lo = 0;
      let hi = N;
      while (hi - lo > 1) {
        const mid = (lo + hi) >> 1;
        if (cum[mid] < t) lo = mid;
        else hi = mid;
      }
      const span = cum[hi] - cum[lo] || 1;
      return (lo + (t - cum[lo]) / span) / N;
    },
  };
};

export const BOX_T = makeTable(BOX);
export const REAL_T = makeTable(REAL);

/* ------------------------------------------------------------------ flotador */
export const PIVOT: Pt = [760, 430];
export const ARM = 330;
export const PHI_MAX = (28 * Math.PI) / 180; // tope superior del brazo
export const PHI_MIN = (-46.7 * Math.PI) / 180; // tope inferior
export const FLOAT_HMAX = yToH(PIVOT[1] - ARM * Math.sin(PHI_MAX)); // ≈0,85
export const FLOAT_HMIN = yToH(PIVOT[1] - ARM * Math.sin(PHI_MIN)); // ≈0,06

/** Estado del flotador para un nivel de superficie (fracción de altura). */
export const floatState = (h: number) => {
  const yS = hToY(h);
  const s = Math.max(-1, Math.min(1, (PIVOT[1] - yS) / ARM));
  let phi = Math.asin(s);
  const pinnedTop = phi >= PHI_MAX;
  const pinnedBottom = phi <= PHI_MIN;
  phi = Math.max(PHI_MIN, Math.min(PHI_MAX, phi));
  const fx = PIVOT[0] - ARM * Math.cos(phi);
  const fy = PIVOT[1] - ARM * Math.sin(phi);
  const hf = yToH(fy);
  const gauge = (hf - FLOAT_HMIN) / (FLOAT_HMAX - FLOAT_HMIN);
  return { phi, fx, fy, pinnedTop, pinnedBottom, gauge: Math.max(0, Math.min(1, gauge)) };
};

/* ------------------------------------------------------- aguja en el estanque real */
export const RESERVE = 0.1; // 10 % del estanque queda cuando la aguja toca E (calibración)
const E_H = REAL_T.heightAt(RESERVE);
const F_H = 0.86;

/** Lectura de la aguja (0..1) para una fracción de litros (0..1) en el estanque real. */
export const needleForFuel = (v: number) => {
  const h = REAL_T.heightAt(v);
  return Math.max(0, Math.min(1, (h - E_H) / (F_H - E_H)));
};

/** Fracción de litros a la que la aguja marca r (búsqueda numérica). */
export const fuelForNeedle = (r: number) => {
  let lo = 0;
  let hi = 1;
  for (let k = 0; k < 40; k++) {
    const mid = (lo + hi) / 2;
    if (needleForFuel(mid) < r) lo = mid;
    else hi = mid;
  }
  return (lo + hi) / 2;
};
