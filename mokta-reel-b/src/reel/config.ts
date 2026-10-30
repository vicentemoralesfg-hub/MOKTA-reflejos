import timeline from "./timeline.json";
import seamsJson from "./seams.json";
import { kmhToMs, lastStopTime, limitTime } from "../physics";

/**
 * Reel completo (propuesta B). Mismas fórmulas que scripts/reel_timing.py: el audio se genera
 * con exactamente estos tiempos.
 */
export const T = timeline;
export const FPS = T.fps;
export const D = T.barrierDistanceM;
export const DECEL_G = T.decelG;
/** Velocidad de impacto sobre la cual el choque frontal queda fuera del límite de protección del auto. */
export const UMBRAL = T.umbralKmh;

export type RoundCfg = (typeof T.rounds)[number] & { decoyPassAt?: number };
export const ROUNDS: RoundCfg[] = T.rounds;
export const SEAMS: Record<string, number[]> = seamsJson;

const smooth = (x: number) => {
  const c = Math.min(Math.max(x, 0), 1);
  return c * c * (3 - 2 * c);
};

/** Velocidad (km/h) en el fotograma f de la ronda i. Las rondas 2 y 3 aceleran desde la anterior. */
export const kmhAt = (i: number, f: number) => {
  const r = ROUNDS[i];
  if (i === 0) return r.speedKmh;
  const k0 = ROUNDS[i - 1].speedKmh;
  return k0 + (r.speedKmh - k0) * smooth(f / T.rampFrames);
};

/** Metros recorridos al inicio del fotograma f (suma por fotograma). */
export const sAt = (i: number, f: number) => {
  let s = ROUNDS[i].startS;
  for (let k = 0; k < Math.floor(f); k++) s += kmhToMs(kmhAt(i, k)) / FPS;
  return s;
};

export const roundFrames = (i: number) => {
  const r = ROUNDS[i];
  const v = kmhToMs(r.speedKmh);
  const impact = r.eventAt + Math.ceil((D / v) * FPS - 1e-9);
  const result = impact + T.blackFrames;
  return { event: r.eventAt, impact, result, duration: result + r.resultFrames };
};

export const LAYOUT = (() => {
  const starts: number[] = [];
  let t = T.hook.duration;
  for (let i = 0; i < ROUNDS.length; i++) {
    starts.push(t);
    t += roundFrames(i).duration;
  }
  const reveal = t;
  t += T.reveal.duration;
  const cta = t;
  t += T.cta.duration;
  return { rounds: starts, reveal, cta, total: t };
})();

export const lastStop = (kmh: number) => lastStopTime(kmh, D, DECEL_G);
/** Último tiempo con el que el choque queda bajo el umbral (pasas la ronda). null = imposible. */
export const lastPass = (kmh: number) => limitTime(kmh, D, DECEL_G, UMBRAL);
