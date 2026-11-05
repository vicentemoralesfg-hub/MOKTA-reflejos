import React from "react";
import { interpolate } from "remotion";
import { COLORS, FONT_DISPLAY } from "../config";
import { EASE_OUT, ramp } from "../lib/anim";

/** Timbre que "cae" sobre la pantalla: entra grande y rotado, golpea y queda. */
export const Stamp: React.FC<{ f: number; at: number; text: string; color?: string; size?: number; rotate?: number }> = ({
  f,
  at,
  text,
  color = COLORS.red,
  size = 110,
  rotate = -8,
}) => {
  const p = ramp(f, at, at + 6, EASE_OUT);
  if (f < at) return null;
  return (
    <div
      style={{
        display: "inline-block",
        padding: `${size * 0.12}px ${size * 0.28}px`,
        border: `${size * 0.08}px solid ${color}`,
        borderRadius: size * 0.16,
        color,
        fontFamily: FONT_DISPLAY,
        fontWeight: 800,
        fontSize: size,
        lineHeight: 1,
        letterSpacing: 2,
        background: "rgba(5,7,11,0.78)",
        boxShadow: `0 0 50px ${color}55, inset 0 0 30px ${color}22`,
        opacity: p,
        scale: String(interpolate(p, [0, 1], [2.4, 1])),
        rotate: `${interpolate(p, [0, 1], [rotate - 14, rotate])}deg`,
        whiteSpace: "nowrap",
      }}
    >
      {text}
    </div>
  );
};
