import React from "react";
import { interpolate } from "remotion";
import { COLORS, FONT_DISPLAY, FONT_UI } from "../config";
import { EASE_OUT, ramp } from "../lib/anim";

/** Fila con ícono + título + bajada. Entra deslizándose desde la derecha en el fotograma `at`. */
export const Tile: React.FC<{
  f: number;
  at: number;
  icon: React.ReactNode;
  title: string;
  sub: string;
  color: string;
  badge?: React.ReactNode;
  width?: number;
}> = ({ f, at, icon, title, sub, color, badge, width = 920 }) => {
  const p = ramp(f, at, at + 10, EASE_OUT);
  const glow = interpolate(f - at, [0, 4, 24], [0, 1, 0.25], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <div
      style={{
        width,
        height: 186,
        boxSizing: "border-box",
        display: "flex",
        alignItems: "center",
        gap: 28,
        padding: "0 30px",
        borderRadius: 30,
        background: COLORS.panel,
        border: `2px solid ${color}${Math.round(40 + glow * 160).toString(16).padStart(2, "0")}`,
        boxShadow: `0 0 ${50 * glow}px ${color}44, 0 20px 50px rgba(0,0,0,0.5)`,
        opacity: p,
        translate: `${interpolate(p, [0, 1], [700, 0])}px 0px`,
        position: "relative",
      }}
    >
      <div
        style={{
          width: 128,
          height: 128,
          flexShrink: 0,
          borderRadius: 26,
          background: `${color}1f`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {icon}
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 800, fontSize: 64, lineHeight: 1, color: COLORS.white }}>{title}</div>
        <div style={{ fontFamily: FONT_UI, fontWeight: 500, fontSize: 31, lineHeight: 1.25, color: COLORS.dim, marginTop: 8 }}>{sub}</div>
      </div>
      {badge}
    </div>
  );
};
