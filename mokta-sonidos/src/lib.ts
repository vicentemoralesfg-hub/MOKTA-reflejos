import { loadFont } from "@remotion/fonts";
import { Easing, interpolate, spring, staticFile } from "remotion";
import { FONT_BLOCK, FONT_DISPLAY, FPS } from "./config";

export const fontsReady = Promise.all([
  loadFont({ family: FONT_DISPLAY, url: staticFile("fonts/anton.woff2"), display: "block" }),
  loadFont({ family: FONT_BLOCK, url: staticFile("fonts/archivoblack.woff2"), display: "block" }),
]);

export const EASE_OUT = Easing.bezier(0.16, 1, 0.3, 1);
export const EASE_IN = Easing.bezier(0.7, 0, 0.84, 0);

/** 0→1 entre los fotogramas a y b */
export const ramp = (f: number, a: number, b: number, easing = EASE_OUT) =>
  interpolate(f, [a, b], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing });

/** Resorte con rebote, empezando en `from` */
export const pop = (f: number, from: number, damping = 11, stiffness = 180) =>
  spring({ frame: f - from, fps: FPS, config: { damping, stiffness, mass: 0.7 } });

/** Sacudida determinista (para impactos) */
export const shake = (f: number, from: number, amp = 14, dur = 10) => {
  const t = f - from;
  if (t < 0 || t > dur) return { x: 0, y: 0 };
  const k = (1 - t / dur) * amp;
  return { x: Math.sin(t * 2.3) * k, y: Math.cos(t * 3.1) * k * 0.7 };
};
