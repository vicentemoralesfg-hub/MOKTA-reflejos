import React from "react";
import { COLORS } from "../config";

const BODY =
  "M 30 160 L 32 125 Q 34 108 55 104 L 175 95 Q 200 92 222 70 L 255 42 Q 268 34 290 33 L 395 33 Q 420 34 440 50 L 485 88 Q 495 95 515 97 L 590 106 Q 612 110 614 128 L 614 158 Q 612 172 596 174 L 540 174 A 50 50 0 0 0 440 174 L 200 174 A 50 50 0 0 0 100 174 L 45 174 Q 30 172 30 160 Z";
const WIN_REAR = "M 232 88 L 262 50 Q 272 42 292 42 L 328 42 L 328 92 L 236 92 Z";
const WIN_FRONT = "M 340 42 L 392 42 Q 412 43 428 57 L 464 90 L 340 92 Z";

const Wheel: React.FC<{ cx: number; rot: number; xray?: boolean; hot?: number }> = ({ cx, rot, xray, hot = 0 }) => (
  <g transform={`translate(${cx} 174)`}>
    {xray ? (
      <>
        <circle r={40} fill="none" stroke={COLORS.accent} strokeWidth={2.5} opacity={0.8} />
        <circle r={27} fill={`rgba(255,59,59,${0.25 + 0.55 * hot})`} stroke={COLORS.red} strokeWidth={3} />
        <circle r={9} fill={COLORS.red} />
      </>
    ) : (
      <>
        <circle r={40} fill="#0d0f13" />
        <circle r={36} fill="none" stroke="#1d2129" strokeWidth={4} />
        <circle r={25} fill="#aab3bd" />
        <g transform={`rotate(${rot})`}>
          {[0, 72, 144, 216, 288].map((a) => (
            <rect key={a} x={-3.5} y={-24} width={7} height={18} rx={3} fill="#5b636e" transform={`rotate(${a})`} />
          ))}
        </g>
        <circle r={7} fill="#3a4049" />
      </>
    )}
  </g>
);

/**
 * Auto genérico de perfil (sin marca ni modelo real). Mismo dibujo para los dos autos de la historia:
 * por fuera son iguales, la diferencia está por dentro (capa de rayos X).
 */
export const CarSide: React.FC<{
  width: number;
  wheelRot?: number;
  color?: string;
  /** 0..1 posición del escáner de rayos X (de izquierda a derecha); -1 = sin escáner */
  scan?: number;
  /** intensidad de los puntos de desgaste en la vista de rayos X */
  heat?: number;
  label?: string;
  pulse?: number;
}> = ({ width, wheelRot = 0, color = COLORS.car, scan = -1, heat = 1, pulse = 0 }) => {
  const id = React.useId().replace(/:/g, "");
  const scanX = 20 + scan * 610;
  const hs = 0.75 + 0.25 * Math.sin(pulse);
  return (
    <svg width={width} height={(width * 240) / 640} viewBox="0 0 640 240" style={{ overflow: "visible" }}>
      <defs>
        <linearGradient id={`b${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={color} />
          <stop offset="0.55" stopColor={color} stopOpacity={0.92} />
          <stop offset="1" stopColor="#4a525d" />
        </linearGradient>
        <linearGradient id={`w${id}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#2a3a4c" />
          <stop offset="1" stopColor="#0e141c" />
        </linearGradient>
        <clipPath id={`cn${id}`}>
          <rect x={scan < 0 ? -50 : scanX} y={-20} width={800} height={300} />
        </clipPath>
        <clipPath id={`cx${id}`}>
          <rect x={-50} y={-20} width={scan < 0 ? 0 : scanX + 50} height={300} />
        </clipPath>
        <radialGradient id={`h${id}`}>
          <stop offset="0" stopColor={COLORS.red} stopOpacity={0.95} />
          <stop offset="0.5" stopColor={COLORS.red} stopOpacity={0.35} />
          <stop offset="1" stopColor={COLORS.red} stopOpacity={0} />
        </radialGradient>
      </defs>
      <ellipse cx={322} cy={216} rx={300} ry={14} fill="rgba(0,0,0,0.55)" />
      {/* vista normal */}
      <g clipPath={`url(#cn${id})`}>
        <path d={BODY} fill={`url(#b${id})`} />
        <path d={WIN_REAR} fill={`url(#w${id})`} />
        <path d={WIN_FRONT} fill={`url(#w${id})`} />
        <path d="M 334 96 L 334 168" stroke="rgba(0,0,0,0.25)" strokeWidth={2.5} />
        <path d="M 210 100 L 210 166" stroke="rgba(0,0,0,0.18)" strokeWidth={2} />
        <rect x={290} y={110} width={26} height={6} rx={3} fill="rgba(0,0,0,0.35)" />
        <rect x={398} y={110} width={26} height={6} rx={3} fill="rgba(0,0,0,0.35)" />
        <path d="M 600 116 Q 612 118 612 132 L 586 128 Q 588 117 600 116 Z" fill="#FFF4C9" />
        <path d="M 33 116 L 52 112 L 52 132 L 32 134 Z" fill="#E0262B" />
        <path d="M 60 150 L 590 150" stroke="rgba(255,255,255,0.12)" strokeWidth={2} />
        <Wheel cx={150} rot={wheelRot} />
        <Wheel cx={490} rot={wheelRot} />
      </g>
      {/* vista de rayos X */}
      {scan >= 0 ? (
        <g clipPath={`url(#cx${id})`}>
          <path d={BODY} fill="rgba(127,211,255,0.08)" stroke={COLORS.accent} strokeWidth={2.5} />
          <path d={WIN_REAR} fill="none" stroke={COLORS.accent} strokeWidth={1.5} opacity={0.6} />
          <path d={WIN_FRONT} fill="none" stroke={COLORS.accent} strokeWidth={1.5} opacity={0.6} />
          {/* motor */}
          <rect x={500} y={104} width={88} height={56} rx={8} fill="rgba(255,59,59,0.2)" stroke={COLORS.red} strokeWidth={3} />
          <circle cx={544} cy={132} r={60 * hs} fill={`url(#h${id})`} opacity={heat} />
          {/* caja / embrague */}
          <rect x={430} y={128} width={56} height={30} rx={6} fill="rgba(255,59,59,0.2)" stroke={COLORS.red} strokeWidth={3} />
          <circle cx={458} cy={143} r={42 * hs} fill={`url(#h${id})`} opacity={heat * 0.9} />
          {/* escape */}
          <path d="M 70 166 L 430 166" stroke={COLORS.accent} strokeWidth={4} opacity={0.6} />
          <Wheel cx={150} rot={0} xray hot={heat} />
          <Wheel cx={490} rot={0} xray hot={heat} />
          <circle cx={150} cy={174} r={48 * hs} fill={`url(#h${id})`} opacity={heat * 0.8} />
          <circle cx={490} cy={174} r={48 * hs} fill={`url(#h${id})`} opacity={heat * 0.8} />
        </g>
      ) : null}
      {scan >= 0 && scan <= 1 ? (
        <g>
          <rect x={scanX - 3} y={0} width={6} height={225} fill={COLORS.accent} />
          <rect x={scanX - 40} y={0} width={40} height={225} fill={COLORS.accent} opacity={0.15} />
        </g>
      ) : null}
    </svg>
  );
};

/** Auto visto desde atrás (para la carretera). */
export const CarRear: React.FC<{ width: number; brake?: number; color?: string; bob?: number }> = ({
  width,
  brake = 0,
  color = COLORS.car,
  bob = 0,
}) => (
  <svg width={width} height={(width * 200) / 300} viewBox="0 0 300 200" style={{ overflow: "visible" }}>
    <ellipse cx={150} cy={188} rx={150} ry={12} fill="rgba(0,0,0,0.6)" />
    <g transform={`translate(0 ${bob})`}>
      <rect x={28} y={150} width={44} height={38} rx={8} fill="#0d0f13" />
      <rect x={228} y={150} width={44} height={38} rx={8} fill="#0d0f13" />
      <path d="M 70 40 Q 78 20 100 18 L 200 18 Q 222 20 230 40 L 248 82 L 52 82 Z" fill={color} />
      <path d="M 82 44 Q 88 30 104 29 L 196 29 Q 212 30 218 44 L 230 76 L 70 76 Z" fill="#1b2633" />
      <path d="M 30 92 Q 34 80 52 80 L 248 80 Q 266 80 270 92 L 276 150 Q 276 166 260 166 L 40 166 Q 24 166 24 150 Z" fill={color} />
      <rect x={36} y={100} width={58} height={22} rx={6} fill={brake > 0 ? "#ff2a2a" : "#8e1c20"} />
      <rect x={206} y={100} width={58} height={22} rx={6} fill={brake > 0 ? "#ff2a2a" : "#8e1c20"} />
      <rect x={120} y={124} width={60} height={20} rx={4} fill="#e9edf1" />
      <rect x={40} y={146} width={220} height={10} rx={5} fill="rgba(0,0,0,0.25)" />
    </g>
  </svg>
);
