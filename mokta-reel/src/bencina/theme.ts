import { Easing, interpolate } from "remotion";

export const C = {
  bg0: "#03050A",
  bg1: "#0A1322",
  panel: "rgba(10,16,28,0.78)",
  white: "#F4F6F8",
  dim: "rgba(244,246,248,0.62)",
  faint: "rgba(244,246,248,0.16)",
  line: "rgba(244,246,248,0.38)",
  fuel: "#FFB020",
  fuelDeep: "#FF7A00",
  fuelLight: "#FFD98A",
  red: "#FF3B3B",
  green: "#2BE38A",
  yellow: "#FFC83D",
  cyan: "#7FD3FF",
  ink: "#05070B",
};

export const FONT_D = "Barlow Condensed";
export const FONT_UI = "Inter";

export const EASE_OUT = Easing.bezier(0.16, 1, 0.3, 1);
export const EASE_IN_OUT = Easing.bezier(0.65, 0, 0.35, 1);
export const EASE_IN = Easing.bezier(0.55, 0, 0.9, 0.4);
export const BACK = Easing.bezier(0.34, 1.56, 0.64, 1);

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

/** 0→1 entre los fotogramas a y b. */
export const ramp = (t: number, a: number, b: number, easing = EASE_OUT) =>
  b <= a ? (t >= a ? 1 : 0) : interpolate(t, [a, b], [0, 1], { ...clamp, easing });

/** Interpola un valor entre a y b con easing. */
export const lerpT = (t: number, a: number, b: number, from: number, to: number, easing = EASE_IN_OUT) =>
  from + (to - from) * ramp(t, a, b, easing);

/** Aparición "pop" (escala con rebote) — devuelve [opacidad, escala]. */
export const pop = (t: number, at: number, dur = 9): [number, number] => {
  const o = ramp(t, at, at + 4);
  const s = interpolate(t, [at, at + dur], [0.6, 1], { ...clamp, easing: BACK });
  return [o, s];
};

/** Temblor de cámara determinista que decae. */
export const shake = (t: number, at: number, amp: number, dur = 12) => {
  if (t < at || t > at + dur) return { x: 0, y: 0 };
  const k = 1 - (t - at) / dur;
  const a = amp * k * k;
  return { x: Math.sin(t * 2.7 + 1.3) * a, y: Math.cos(t * 3.4 + 0.2) * a };
};

/** Número en formato chileno. */
export const fmt = (n: number, d = 0) => n.toFixed(d).replace(".", ",");
