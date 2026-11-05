import React from "react";
import { AbsoluteFill } from "remotion";
import { COL, FONT_UI } from "./style";

/**
 * Vista del conductor: tablero, volante (gira con el ángulo del volante), manos enguantadas en 9 y 3,
 * cuadro de instrumentos con la velocidad real de la simulación y espejo retrovisor.
 */
const CX = 540;
const CY = 1700;
const R = 420;

const Hand: React.FC<{ side: -1 | 1; grip: number; squeeze: number }> = ({ side, grip, squeeze }) => {
  // mano sobre el aro en la posición 9 (izq.) o 3 (der.)
  const x = CX + side * R;
  const y = CY;
  const glow = grip > 0.01;
  return (
    <g transform={`translate(${x} ${y}) scale(${side} 1)`}>
      {/* antebrazo / manga */}
      <path d="M -10 40 C -40 120, -90 200, -150 290 L -10 330 C 30 230, 60 140, 60 60 Z" fill="#0b0c10" />
      <path d="M -10 40 C -40 120, -90 200, -150 290" stroke="rgba(150,120,150,0.25)" strokeWidth={4} fill="none" />
      {/* mano */}
      <g transform={`scale(${1 - squeeze * 0.04} ${1 + squeeze * 0.02})`}>
        <ellipse cx={8} cy={-6} rx={74} ry={104} fill="#15161b" />
        {/* dedos que envuelven el aro */}
        {[-62, -24, 14, 50].map((fy, i) => (
          <rect key={i} x={-62} y={fy} width={128} height={34} rx={17} fill="#1b1c22" stroke="#0a0a0d" strokeWidth={3} />
        ))}
        {/* pulgar sobre el aro */}
        <path d="M 40 -80 C 70 -110, 95 -95, 92 -66 C 88 -40, 60 -40, 44 -46 Z" fill="#1d1e25" />
        {/* luz de borde (atardecer) */}
        <path d="M -60 -90 C -30 -118, 40 -120, 78 -86" stroke="rgba(255,170,130,0.35)" strokeWidth={5} fill="none" strokeLinecap="round" />
      </g>
      {glow ? (
        <ellipse cx={8} cy={-6} rx={96} ry={128} fill="none" stroke={COL.green} strokeWidth={7} opacity={grip} style={{ filter: "drop-shadow(0 0 18px rgba(46,229,140,0.9))" }} />
      ) : null}
    </g>
  );
};

export const Cockpit: React.FC<{
  steerRad: number;
  kmh: number;
  dx?: number;
  dy?: number;
  grip?: number;
  squeeze?: number;
  warn?: boolean;
}> = ({ steerRad, kmh, dx = 0, dy = 0, grip = 0, squeeze = 0, warn = false }) => {
  const deg = (steerRad * 180) / Math.PI;
  return (
    <AbsoluteFill style={{ pointerEvents: "none", transform: `translate(${dx}px, ${dy}px)` }}>
      <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: "absolute", inset: 0, overflow: "visible" }}>
        <defs>
          <linearGradient id="dash" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#14141a" />
            <stop offset="0.25" stopColor="#0a0a0e" />
            <stop offset="1" stopColor="#040406" />
          </linearGradient>
          <radialGradient id="clusterGlow" cx="0.5" cy="0.5" r="0.6">
            <stop offset="0" stopColor="rgba(120,200,255,0.20)" />
            <stop offset="1" stopColor="rgba(120,200,255,0)" />
          </radialGradient>
          <linearGradient id="rimHi" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="rgba(255,160,120,0)" />
            <stop offset="0.5" stopColor="rgba(255,175,140,0.35)" />
            <stop offset="1" stopColor="rgba(255,160,120,0)" />
          </linearGradient>
        </defs>
        {/* espejo retrovisor */}
        <rect x={380} y={-30} width={320} height={120} rx={26} fill="#0b0b0f" />
        <rect x={396} y={-14} width={288} height={90} rx={18} fill="#1a1c28" opacity={0.85} />
        <rect x={530} y={-60} width={20} height={50} fill="#0b0b0f" />

        {/* tablero */}
        <path d="M -20 1470 C 200 1420, 380 1404, 540 1402 C 700 1404, 880 1420, 1100 1470 L 1100 1960 L -20 1960 Z" fill="url(#dash)" />
        <path d="M -20 1470 C 200 1420, 380 1404, 540 1402 C 700 1404, 880 1420, 1100 1470" stroke="rgba(255,170,140,0.22)" strokeWidth={3} fill="none" />
        {/* cuadro de instrumentos */}
        <ellipse cx={540} cy={1500} rx={230} ry={90} fill="url(#clusterGlow)" />
        <path d="M 370 1440 C 430 1412, 650 1412, 710 1440 L 690 1590 L 390 1590 Z" fill="#08080b" stroke="#1c1d24" strokeWidth={3} />
        <text x={540} y={1518} textAnchor="middle" fontFamily={FONT_UI} fontWeight={600} fontSize={76} fill={warn ? COL.amber : "#cfe8ff"} style={{ fontVariantNumeric: "tabular-nums" }}>
          {Math.max(0, Math.round(kmh))}
        </text>
        <text x={540} y={1552} textAnchor="middle" fontFamily={FONT_UI} fontWeight={500} fontSize={22} fill="rgba(207,232,255,0.6)" letterSpacing={3}>
          KM/H
        </text>
        {warn ? (
          <g transform="translate(652 1468)">
            <path d="M 0 -18 L 18 14 L -18 14 Z" fill="none" stroke={COL.amber} strokeWidth={4} strokeLinejoin="round" />
            <rect x={-2} y={-6} width={4} height={10} fill={COL.amber} />
            <rect x={-2} y={7} width={4} height={4} fill={COL.amber} />
          </g>
        ) : null}

        {/* volante */}
        <g transform={`rotate(${deg} ${CX} ${CY})`}>
          <circle cx={CX} cy={CY} r={R} fill="none" stroke="#0d0d11" strokeWidth={54} />
          <circle cx={CX} cy={CY} r={R} fill="none" stroke="#17181e" strokeWidth={40} />
          <path d={`M ${CX - R * 0.8} ${CY - R * 0.6} A ${R} ${R} 0 0 1 ${CX + R * 0.8} ${CY - R * 0.6}`} fill="none" stroke="url(#rimHi)" strokeWidth={8} transform={`translate(0 -14)`} />
          {/* rayos */}
          <path d={`M ${CX - R + 20} ${CY - 20} L ${CX - 120} ${CY - 50} L ${CX - 120} ${CY + 40} L ${CX - R + 20} ${CY + 30} Z`} fill="#121318" />
          <path d={`M ${CX + R - 20} ${CY - 20} L ${CX + 120} ${CY - 50} L ${CX + 120} ${CY + 40} L ${CX + R - 20} ${CY + 30} Z`} fill="#121318" />
          <circle cx={CX} cy={CY} r={118} fill="#101116" stroke="#1d1e25" strokeWidth={4} />
          <rect x={CX - 36} y={CY - 92} width={72} height={12} rx={6} fill="#2a2b33" />
          {/* marca de centro (para leer el giro) */}
          <rect x={CX - 8} y={CY - R - 27} width={16} height={54} fill="#3a3b45" />
          <Hand side={-1} grip={grip} squeeze={squeeze} />
          <Hand side={1} grip={grip} squeeze={squeeze} />
        </g>
      </svg>
    </AbsoluteFill>
  );
};
