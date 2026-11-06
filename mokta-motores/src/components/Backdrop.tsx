import React from "react";
import { AbsoluteFill } from "remotion";
import { levelAt } from "../lib/viz";

/**
 * Fondo de "estudio": negro profundo, foco cálido que respira con el nivel del motor,
 * líneas de suelo en perspectiva y viñeta. Todo depende del fotograma absoluto (sin estado).
 */
export const Backdrop: React.FC<{ absFrame: number; tint?: string; energy?: number }> = ({
  absFrame,
  tint = "255,90,31",
  energy = 1,
}) => {
  const lv = levelAt(absFrame) * energy;
  const glow = 0.16 + lv * 0.42;
  const drift = (absFrame * 0.6) % 120;
  return (
    <AbsoluteFill style={{ backgroundColor: "#040509", overflow: "hidden" }}>
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse 75% 42% at 50% 36%, rgba(${tint},${glow}) 0%, rgba(${tint},${glow * 0.25}) 45%, rgba(0,0,0,0) 75%)`,
        }}
      />
      {/* suelo en perspectiva */}
      <svg
        width={1080}
        height={900}
        viewBox="0 0 1080 900"
        style={{ position: "absolute", left: 0, top: 1020, opacity: 0.32 }}
      >
        <defs>
          <linearGradient id="floorFade" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#fff" stopOpacity="0" />
            <stop offset="0.35" stopColor="#fff" stopOpacity="0.5" />
            <stop offset="1" stopColor="#fff" stopOpacity="0" />
          </linearGradient>
          <mask id="floorMask">
            <rect width="1080" height="900" fill="url(#floorFade)" />
          </mask>
        </defs>
        <g mask="url(#floorMask)" stroke={`rgba(${tint},0.9)`} strokeWidth={1.5}>
          {Array.from({ length: 17 }).map((_, i) => {
            const x = -1080 + i * 202.5;
            return <line key={`v${i}`} x1={540} y1={0} x2={x} y2={900} />;
          })}
          {Array.from({ length: 9 }).map((_, i) => {
            const t = ((i * 120 + drift) % 1080) / 1080;
            const y = 900 * t * t;
            return <line key={`h${i}`} x1={0} y1={y} x2={1080} y2={y} />;
          })}
        </g>
      </svg>
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(ellipse 120% 85% at 50% 45%, rgba(0,0,0,0) 55%, rgba(0,0,0,0.75) 100%)",
        }}
      />
    </AbsoluteFill>
  );
};
