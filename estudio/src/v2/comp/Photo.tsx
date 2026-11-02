import React from "react";
import { AbsoluteFill, Img, interpolate, staticFile } from "remotion";

/** Foto con movimiento lento (Ken Burns) y etalonaje oscuro coherente con la marca. */
export const Photo: React.FC<{
  src: string;
  f: number;
  dur: number;
  from?: { s: number; x: number; y: number };
  to?: { s: number; x: number; y: number };
  dim?: number;
  grade?: string;
  style?: React.CSSProperties;
}> = ({ src, f, dur, from = { s: 1.08, x: 0, y: 0 }, to = { s: 1.18, x: 0, y: 0 }, dim = 0.35, grade = "contrast(1.08) saturate(1.05)", style }) => {
  const p = interpolate(f, [0, dur], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const s = from.s + (to.s - from.s) * p;
  const x = from.x + (to.x - from.x) * p;
  const y = from.y + (to.y - from.y) * p;
  return (
    <AbsoluteFill style={{ overflow: "hidden", ...style }}>
      <Img
        src={staticFile(src)}
        style={{ width: "100%", height: "100%", objectFit: "cover", transform: `translate(${x}px, ${y}px) scale(${s})`, filter: grade }}
      />
      <AbsoluteFill style={{ background: `rgba(5,6,10,${dim})` }} />
    </AbsoluteFill>
  );
};
