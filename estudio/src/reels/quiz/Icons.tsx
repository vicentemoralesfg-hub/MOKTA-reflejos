import React from "react";
import { Icon } from "./data";

/**
 * Íconos estilo "luz de tablero" (trazo ámbar con brillo). Dibujados a mano en SVG, 200×200.
 * `hl` (0–1) resalta la parte clave de cada ícono durante la explicación.
 */
const AMBER = "#FFB21E";
const BLUE = "#59B7FF";

const Glow: React.FC<{ color: string; children: React.ReactNode; size: number }> = ({ color, children, size }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 200 200"
    style={{ overflow: "visible", filter: `drop-shadow(0 0 10px ${color}aa) drop-shadow(0 0 34px ${color}66)` }}
  >
    {children}
  </svg>
);

export const DashIcon: React.FC<{ icon: Icon; size?: number; hl?: number; t?: number }> = ({ icon, size = 300, hl = 0, t = 0 }) => {
  const sw = 9;
  const common = { fill: "none", stroke: AMBER, strokeWidth: sw, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  if (icon === "fuel") {
    const pulse = hl * (0.6 + 0.4 * Math.sin(t * 0.5));
    return (
      <Glow color={AMBER} size={size}>
        {/* surtidor */}
        <rect x={38} y={40} width={74} height={124} rx={10} {...common} />
        <rect x={52} y={56} width={46} height={34} rx={4} fill={AMBER} stroke="none" />
        <line x1={28} y1={164} x2={122} y2={164} {...common} />
        <path d="M112 74 h18 a10 10 0 0 1 10 10 v52 a10 10 0 0 0 20 0 V78 l-16 -20" {...common} />
        {/* flecha ▶ (lado de la tapa) */}
        <path d="M168 104 L196 122 L168 140 Z" fill={AMBER} stroke={AMBER} strokeWidth={4} strokeLinejoin="round" opacity={0.85 + 0.15 * pulse} transform={`translate(${pulse * 6} 0)`} />
        {hl > 0 ? <circle cx={182} cy={122} r={34 + 8 * pulse} fill="none" stroke="#FFFFFF" strokeWidth={4} opacity={hl * 0.8} /> : null}
      </Glow>
    );
  }
  if (icon === "neutral") {
    return (
      <Glow color={AMBER} size={size}>
        {/* indicador de marcha "N" + bajada */}
        <rect x={52} y={14} width={96} height={112} rx={20} {...common} />
        <text x={100} y={104} textAnchor="middle" fontFamily="Barlow Condensed" fontWeight={800} fontSize={92} fill={AMBER}>
          N
        </text>
        <path d="M18 146 L182 192" {...common} />
        <path d="M150 158 l34 34 l-46 6" {...common} strokeWidth={7} opacity={0.9} />
      </Glow>
    );
  }
  if (icon === "cold") {
    return (
      <Glow color={BLUE} size={size}>
        {/* termómetro de refrigerante */}
        <path d="M100 24 v96" fill="none" stroke={BLUE} strokeWidth={sw} strokeLinecap="round" />
        <path d="M100 40 h26 M100 64 h20 M100 88 h26" fill="none" stroke={BLUE} strokeWidth={7} strokeLinecap="round" />
        <circle cx={100} cy={138} r={22} fill={BLUE} />
        <path d="M30 172 q17 -14 34 0 t34 0 t34 0 t34 0" fill="none" stroke={BLUE} strokeWidth={8} strokeLinecap="round" />
        <path d="M30 196 q17 -14 34 0 t34 0 t34 0 t34 0" fill="none" stroke={BLUE} strokeWidth={8} strokeLinecap="round" opacity={0.6} />
      </Glow>
    );
  }
  if (icon === "nozzle") {
    const drip = (t % 24) / 24;
    return (
      <Glow color={AMBER} size={size}>
        {/* pistola */}
        <path d="M30 70 h70 a16 16 0 0 1 16 16 v10 h40 l22 -12 v28 l-22 -6 h-40 v8 a12 12 0 0 1 -12 12 h-26" {...common} />
        <path d="M54 70 v-26 a10 10 0 0 1 10 -10 h30" {...common} />
        <path d="M60 126 l-14 44 h30 l10 -30" {...common} />
        {/* gota */}
        <path d={`M182 ${126 + drip * 40} q10 14 0 22 q-10 -8 0 -22 z`} fill={AMBER} opacity={1 - drip} />
        <text x={150} y={56} textAnchor="middle" fontFamily="Barlow Condensed" fontWeight={800} fontSize={40} fill={AMBER} opacity={0.9}>
          ¡CLIC!
        </text>
      </Glow>
    );
  }
  // ABS
  return (
    <Glow color={AMBER} size={size}>
      <circle cx={100} cy={100} r={62} {...common} />
      <path d="M40 46 A80 80 0 0 0 40 154" {...common} />
      <path d="M160 46 A80 80 0 0 1 160 154" {...common} />
      <path d="M22 64 l12 8 M22 136 l12 -8 M178 64 l-12 8 M178 136 l-12 -8" {...common} strokeWidth={7} />
      <text x={100} y={122} textAnchor="middle" fontFamily="Barlow Condensed" fontWeight={800} fontSize={62} fill={AMBER} letterSpacing={2}>
        ABS
      </text>
    </Glow>
  );
};
