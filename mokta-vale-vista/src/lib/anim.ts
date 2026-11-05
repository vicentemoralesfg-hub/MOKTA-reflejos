import { Easing, interpolate, spring } from "remotion";
import { FPS, fr, SceneId, sceneOf } from "../timing";

export const EASE_OUT = Easing.bezier(0.16, 1, 0.3, 1);
export const EASE_IN = Easing.bezier(0.7, 0, 0.84, 0);
export const EASE_IN_OUT = Easing.bezier(0.65, 0, 0.35, 1);
const C = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

/** 0→1 entre los fotogramas a y b. */
export const ramp = (f: number, a: number, b: number, easing = EASE_OUT) =>
  interpolate(f, [a, b], [0, 1], { ...C, easing });
export const lerp = (f: number, a: number, b: number, from: number, to: number, easing = EASE_OUT) =>
  interpolate(f, [a, b], [from, to], { ...C, easing });
/** Rebote tipo resorte que empieza en el fotograma a. */
export const pop = (f: number, a: number, damping = 11, stiffness = 170) =>
  f < a ? 0 : spring({ frame: f - a, fps: FPS, config: { damping, stiffness, mass: 0.9 } });
/** Temblor de cámara que decae (impactos). */
/** Golpe de timbre: cae desde grande (fotogramas 0-5) y rebota leve. Devuelve la escala. */
export const slam = (f: number, a: number, from = 2.6) => {
  if (f < a) return from;
  const d = f - a;
  if (d <= 5) return interpolate(d, [0, 5], [from, 1], { ...C, easing: EASE_IN });
  return 1 + Math.sin(((d - 5) / 8) * Math.PI) * 0.06 * Math.max(0, 1 - (d - 5) / 8);
};

export const shake = (f: number, a: number, amp = 26, dur = 14) => {
  if (f < a || f > a + dur) return [0, 0];
  const k = 1 - (f - a) / dur;
  return [Math.sin((f - a) * 2.9) * amp * k, Math.cos((f - a) * 3.7) * amp * 0.7 * k];
};

/**
 * Convierte segundos de locución en fotogramas locales de una escena.
 * Uso: const t = sceneClock("Gancho"); ramp(frame, t(3.9), t(4.1))
 */
export const sceneClock = (id: SceneId) => {
  const start = fr(sceneOf(id).from);
  return (sec: number) => fr(sec) - start;
};
