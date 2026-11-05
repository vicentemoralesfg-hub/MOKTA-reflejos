import React from "react";
import { C, FONT_D } from "../theme";

/**
 * Marcador de bencina analógico (SVG, viewBox 600×600, pivote en 300,300).
 * value: 0 = E (vacío) … 1 = F (lleno). La aguja barre ±60° desde la vertical.
 */
export const GAUGE_R = 220;
export const angleOf = (v: number) => -60 + 120 * Math.max(-0.03, Math.min(1.03, v));
const rad = (deg: number) => (deg * Math.PI) / 180;
export const gaugePoint = (v: number, r: number): [number, number] => {
  const a = rad(angleOf(v));
  return [300 + r * Math.sin(a), 300 - r * Math.cos(a)];
};

const arc = (v0: number, v1: number, r: number) => {
  const [x0, y0] = gaugePoint(v0, r);
  const [x1, y1] = gaugePoint(v1, r);
  const large = Math.abs(angleOf(v1) - angleOf(v0)) > 180 ? 1 : 0;
  return `M${x0},${y0} A${r},${r} 0 ${large} 1 ${x1},${y1}`;
};

export const PumpIcon: React.FC<{ x: number; y: number; s: number; color: string; glow?: number }> = ({
  x,
  y,
  s,
  color,
  glow = 0,
}) => (
  <g transform={`translate(${x - s / 2} ${y - s / 2}) scale(${s / 64})`}>
    {glow > 0 ? (
      <circle cx={30} cy={32} r={40} fill={color} opacity={0.35 * glow} filter="url(#gBlur)" />
    ) : null}
    <rect x={10} y={8} width={30} height={48} rx={4} fill="none" stroke={color} strokeWidth={5} />
    <rect x={16} y={14} width={18} height={12} rx={2} fill={color} />
    <path d="M40 22 h8 a4 4 0 0 1 4 4 v20 a4 4 0 0 0 8 0 v-22 l-8 -8" fill="none" stroke={color} strokeWidth={4.5} strokeLinecap="round" strokeLinejoin="round" />
    <rect x={6} y={54} width={38} height={6} rx={2} fill={color} />
  </g>
);

export const GaugeG: React.FC<{
  value: number;
  lamp?: number;
  /** resalta un tramo del arco [desde, hasta] con color */
  band?: { from: number; to: number; color: string; opacity: number } | null;
  tickGlow?: { v: number; amount: number } | null;
  needleColor?: string;
  dimLabels?: number;
  /** texto en la parte baja del dial (reemplaza el testigo) */
  caption?: string;
  captionColor?: string;
}> = ({ value, lamp = 0, band = null, tickGlow = null, needleColor = C.red, dimLabels = 1, caption, captionColor = C.white }) => {
  const ticks: React.ReactNode[] = [];
  for (let k = 0; k <= 8; k++) {
    const v = k / 8;
    const major = k % 2 === 0;
    const [x0, y0] = gaugePoint(v, GAUGE_R - (major ? 40 : 22));
    const [x1, y1] = gaugePoint(v, GAUGE_R);
    const glowing = tickGlow && Math.abs(tickGlow.v - v) < 0.01 ? tickGlow.amount : 0;
    ticks.push(
      <line
        key={k}
        x1={x0}
        y1={y0}
        x2={x1}
        y2={y1}
        stroke={v <= 0.125 ? C.red : glowing > 0 ? C.fuel : C.white}
        strokeWidth={major ? 8 : 4}
        strokeLinecap="round"
        opacity={major ? 1 : 0.7}
      />,
    );
  }
  const labels: [number, string, string][] = [
    [0, "E", C.red],
    [0.5, "½", C.white],
    [1, "F", C.white],
  ];
  const a = angleOf(value);
  return (
    <g>
      <defs>
        <radialGradient id="gFace" cx="50%" cy="40%" r="60%">
          <stop offset="0%" stopColor="#1A2436" />
          <stop offset="70%" stopColor="#0B111C" />
          <stop offset="100%" stopColor="#05080E" />
        </radialGradient>
        <linearGradient id="gRing" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#9AA7B8" />
          <stop offset="45%" stopColor="#3A4556" />
          <stop offset="100%" stopColor="#141B26" />
        </linearGradient>
        <linearGradient id="gNeedle" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FFB3A8" />
          <stop offset="35%" stopColor={needleColor} />
          <stop offset="100%" stopColor="#B4161B" />
        </linearGradient>
        <filter id="gBlur" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="10" />
        </filter>
        <filter id="gNeedleGlow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="5" />
        </filter>
      </defs>
      <circle cx={300} cy={300} r={292} fill="url(#gRing)" />
      <circle cx={300} cy={300} r={280} fill="url(#gFace)" />
      <circle cx={300} cy={300} r={280} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={2} />
      {/* pista del arco */}
      <path d={arc(0, 1, GAUGE_R + 14)} stroke="rgba(244,246,248,0.10)" strokeWidth={10} fill="none" strokeLinecap="round" />
      <path d={arc(0, 0.125, GAUGE_R + 14)} stroke={C.red} strokeWidth={10} fill="none" strokeLinecap="round" opacity={0.9} />
      {band ? (
        <path
          d={arc(band.from, band.to, GAUGE_R + 14)}
          stroke={band.color}
          strokeWidth={22}
          fill="none"
          strokeLinecap="round"
          opacity={band.opacity}
        />
      ) : null}
      {ticks}
      <g opacity={dimLabels}>
        {labels.map(([v, t, col]) => {
          const [x, y] = gaugePoint(v, GAUGE_R - 82);
          return (
            <text
              key={t}
              x={x}
              y={y + 18}
              textAnchor="middle"
              fontFamily={FONT_D}
              fontWeight={800}
              fontSize={58}
              fill={col}
            >
              {t}
            </text>
          );
        })}
      </g>
      {/* testigo de reserva */}
      {caption ? (
        <text x={300} y={470} textAnchor="middle" fontFamily={FONT_D} fontWeight={800} fontSize={74} fill={captionColor}>
          {caption}
        </text>
      ) : (
        <PumpIcon x={300} y={430} s={78} color={lamp > 0.02 ? C.fuel : "rgba(244,246,248,0.22)"} glow={lamp} />
      )}
      {/* aguja */}
      <g transform={`rotate(${a} 300 300)`}>
        <polygon points="291,312 309,312 302,70 298,70" fill={needleColor} opacity={0.55} filter="url(#gNeedleGlow)" />
        <polygon points="291,312 309,312 302,70 298,70" fill="url(#gNeedle)" />
      </g>
      <circle cx={300} cy={300} r={30} fill="#1B2330" stroke="#5B6678" strokeWidth={4} />
      <circle cx={300} cy={300} r={10} fill="#0B0F16" />
      {/* reflejo del vidrio */}
      <path d="M60,250 A250,250 0 0 1 540,250 A300,300 0 0 0 60,250 Z" fill="rgba(255,255,255,0.045)" />
    </g>
  );
};

/** Marcador independiente posicionado en píxeles (centro cx, cy y diámetro size). */
export const Gauge: React.FC<
  React.ComponentProps<typeof GaugeG> & { cx: number; cy: number; size: number; style?: React.CSSProperties }
> = ({ cx, cy, size, style, ...rest }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 600 600"
    style={{ position: "absolute", left: cx - size / 2, top: cy - size / 2, overflow: "visible", ...style }}
  >
    <GaugeG {...rest} />
  </svg>
);
