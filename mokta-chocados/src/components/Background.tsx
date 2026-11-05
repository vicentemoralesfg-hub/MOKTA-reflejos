import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { rnd } from "../anim";
import { ZONE_BG, Zone } from "../theme";

/** Fondo vivo: degradado radial saturado, rejilla en perspectiva, estelas de velocidad y partículas. */
export const Background: React.FC<{ zone: Zone; cy?: number; flash?: number; speed?: number }> = ({ zone, cy = 40, flash = 0, speed = 1 }) => {
  const f = useCurrentFrame();
  const [c0, c1, c2] = ZONE_BG[zone];
  const gridShift = (f * 4 * speed) % 80;
  return (
    <AbsoluteFill style={{ background: c2, overflow: "hidden" }}>
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse 95% 60% at 50% ${cy}%, ${c0} 0%, ${c1} 45%, ${c2} 100%)`,
        }}
      />
      {/* rejilla de piso en perspectiva */}
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0, opacity: 0.32 }}>
        <defs>
          <linearGradient id={`fade-${zone}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#fff" stopOpacity={0} />
            <stop offset="1" stopColor="#fff" stopOpacity={0.9} />
          </linearGradient>
        </defs>
        <g stroke={`url(#fade-${zone})`} strokeWidth={2}>
          {Array.from({ length: 23 }, (_, i) => {
            const x = -1100 + i * 150;
            return <line key={i} x1={540} y1={1050} x2={x + 540 - 540} y2={1920} />;
          })}
          {Array.from({ length: 12 }, (_, i) => {
            const k = (i * 80 + gridShift) / 960;
            const y = 1050 + Math.pow(k, 2.2) * 870;
            return <line key={`h${i}`} x1={0} y1={y} x2={1080} y2={y} />;
          })}
        </g>
      </svg>
      {/* estelas diagonales */}
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0, mixBlendMode: "screen" }}>
        {Array.from({ length: 9 }, (_, i) => {
          const y = ((rnd(i) * 1920 + f * (18 + rnd(i + 3) * 26) * speed) % 2400) - 240;
          const x = rnd(i + 9) * 1080;
          return (
            <line key={i} x1={x} y1={y} x2={x - 120} y2={y - 260} stroke={c0} strokeOpacity={0.35} strokeWidth={3 + rnd(i + 5) * 5} strokeLinecap="round" />
          );
        })}
        {Array.from({ length: 34 }, (_, i) => {
          const y = (rnd(i + 40) * 1920 - f * (1.5 + rnd(i + 70) * 3) + 3840) % 1920;
          const x = (rnd(i + 90) * 1080 + Math.sin(f * 0.03 + i) * 20 + 1080) % 1080;
          return <circle key={`p${i}`} cx={x} cy={y} r={1.5 + rnd(i + 20) * 3.5} fill="#fff" opacity={0.15 + rnd(i + 50) * 0.35} />;
        })}
      </svg>
      {/* viñeta */}
      <AbsoluteFill style={{ background: "radial-gradient(ellipse 85% 75% at 50% 45%, transparent 55%, rgba(0,0,0,0.55) 100%)" }} />
      {flash > 0 && <AbsoluteFill style={{ background: "#fff", opacity: flash }} />}
    </AbsoluteFill>
  );
};
