/**
 * Óptica del espejo prismático (corte lateral), en coordenadas SVG (y hacia abajo).
 *
 * El vidrio es una cuña: cara frontal sin recubrimiento (refleja ~4 %) y cara trasera
 * plateada (refleja casi todo). Como las caras no son paralelas, los dos reflejos salen
 * en direcciones distintas. La palanca gira el conjunto: en DÍA el reflejo plateado va
 * a los ojos; en NOCHE ese reflejo se va hacia el techo y a los ojos llega solo el del
 * vidrio frontal.
 *
 * Se trazan los rayos con reflexión y refracción reales (Snell, n = 1,52). Los ángulos
 * del dibujo están exagerados (cuña de 11°) para que la separación se vea.
 */
export type Vec = { x: number; y: number };

const v = (x: number, y: number): Vec => ({ x, y });
const add = (a: Vec, b: Vec) => v(a.x + b.x, a.y + b.y);
const sub = (a: Vec, b: Vec) => v(a.x - b.x, a.y - b.y);
const mul = (a: Vec, k: number) => v(a.x * k, a.y * k);
const dot = (a: Vec, b: Vec) => a.x * b.x + a.y * b.y;
const norm = (a: Vec) => mul(a, 1 / Math.hypot(a.x, a.y));
const rot = (a: Vec, th: number) => v(a.x * Math.cos(th) - a.y * Math.sin(th), a.x * Math.sin(th) + a.y * Math.cos(th));
const reflect = (d: Vec, n: Vec) => sub(d, mul(n, 2 * dot(d, n)));
/** n apunta hacia el lado de incidencia. */
const refract = (d: Vec, n: Vec, n1: number, n2: number) => {
  const ci = -dot(d, n);
  const eta = n1 / n2;
  const k = 1 - eta * eta * (1 - ci * ci);
  return add(mul(d, eta), mul(n, eta * ci - Math.sqrt(Math.max(0, k))));
};
/** Intersección del rayo p + t·d con la recta a→b. */
const intersect = (p: Vec, d: Vec, a: Vec, b: Vec): Vec => {
  const e = sub(b, a);
  const det = d.x * -e.y - d.y * -e.x;
  const r = sub(a, p);
  const t = (r.x * -e.y - r.y * -e.x) / det;
  return add(p, mul(d, t));
};

export const N_GLASS = 1.52;
export const GEO = {
  pivot: v(240, 700),
  halfH: 160,
  backX: 36,
  thinBottom: 24,
  alpha: (11 * Math.PI) / 180,
  source: v(1400, 740),
  eye: v(880, 820),
  roofY: 460,
};
export const THICK_TOP = GEO.thinBottom + 2 * GEO.halfH * Math.tan(GEO.alpha);

/** Punto local del espejo (respecto al pivote) → mundo, con el giro th. */
export const toWorld = (local: Vec, th: number) => add(GEO.pivot, rot(local, th));

export type Trace = {
  hit: Vec; // impacto en la cara frontal
  inDir: Vec;
  frontDir: Vec; // reflejo del vidrio (≈4 %)
  q: Vec; // impacto en la cara plateada
  r: Vec; // salida por la cara frontal
  silverDir: Vec; // reflejo de la capa plateada (intenso)
  corners: { b0: Vec; b1: Vec; f0: Vec; f1: Vec };
};

export const trace = (th: number): Trace => {
  const { halfH: H, backX, thinBottom: tb } = GEO;
  const tt = THICK_TOP;
  const b0 = toWorld(v(backX, H), th);
  const b1 = toWorld(v(backX, -H), th);
  const f0 = toWorld(v(backX + tb, H), th);
  const f1 = toWorld(v(backX + tt, -H), th);
  const nf = norm(rot(v(2 * H, tt - tb), th));
  const nb = norm(rot(v(1, 0), th));
  const hit = mul(add(f0, f1), 0.5);
  const d = norm(sub(hit, GEO.source));
  const frontDir = reflect(d, nf);
  const t1 = refract(d, nf, 1, N_GLASS);
  const q = intersect(hit, t1, b0, b1);
  const t2 = reflect(t1, nb);
  const r = intersect(q, t2, f0, f1);
  const silverDir = refract(t2, mul(nf, -1), N_GLASS, 1);
  return { hit, inDir: d, frontDir, q, r, silverDir, corners: { b0, b1, f0, f1 } };
};

/** Distancia con signo del punto e a la recta p + t·d. */
const side = (p: Vec, d: Vec, e: Vec) => d.x * (e.y - p.y) - d.y * (e.x - p.x);

const solve = (fn: (th: number) => number) => {
  const step = (0.5 * Math.PI) / 180;
  let prev = fn(-0.7);
  for (let th = -0.7 + step; th <= 0.7; th += step) {
    const cur = fn(th);
    if (Number.isFinite(prev) && Number.isFinite(cur) && Math.sign(cur) !== Math.sign(prev)) {
      let lo = th - step;
      let hi = th;
      let flo = prev;
      for (let i = 0; i < 50; i++) {
        const m = (lo + hi) / 2;
        const fm = fn(m);
        if (Math.sign(fm) === Math.sign(flo)) {
          lo = m;
          flo = fm;
        } else hi = m;
      }
      return (lo + hi) / 2;
    }
    prev = cur;
  }
  throw new Error("Sin solución óptica");
};

/** Giro en posición DÍA: el reflejo plateado entra al ojo. */
export const THETA_DAY = solve((th) => {
  const tr = trace(th);
  return side(tr.r, tr.silverDir, GEO.eye);
});
/** Giro en posición NOCHE: el reflejo del vidrio entra al ojo. */
export const THETA_NIGHT = solve((th) => {
  const tr = trace(th);
  return side(tr.hit, tr.frontDir, GEO.eye);
});

/** Recorta un rayo al primer borde: techo, ojo (si pasa cerca) o límites del diagrama. */
export const clipRay = (p: Vec, d: Vec, opts: { stopAtEye?: boolean; maxY?: number } = {}) => {
  const ts: number[] = [];
  if (d.y < -1e-6) ts.push((GEO.roofY - p.y) / d.y);
  if (d.x > 1e-6) ts.push((1120 - p.x) / d.x);
  if (d.x < -1e-6) ts.push((-40 - p.x) / d.x);
  if (d.y > 1e-6) ts.push(((opts.maxY ?? 1260) - p.y) / d.y);
  if (opts.stopAtEye) {
    const te = dot(sub(GEO.eye, p), d);
    const closest = add(p, mul(d, te));
    if (te > 0 && Math.hypot(closest.x - GEO.eye.x, closest.y - GEO.eye.y) < 30) ts.push(te - 26);
  }
  const t = Math.min(...ts.filter((x) => x > 0));
  return { end: add(p, mul(d, t)), hitsRoof: d.y < 0 && Math.abs(add(p, mul(d, t)).y - GEO.roofY) < 1 };
};
