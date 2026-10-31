import React from "react";
import { C, FONT_UI } from "../config";
import { rand } from "../lib/anim";

/**
 * Corte de un cilindro (esquema). viewBox 0 0 800 900.
 * - `theta`: ángulo del cigüeñal (rad). 0 = punto muerto superior.
 * - `extra` 0..1: bencina extra (gotas más gruesas que llegan a las paredes).
 * - `wash` 0..1: cuánto de la película de aceite (de arriba hacia abajo) ya se lavó.
 * - `t`: fotograma (partículas).
 */
const CY = 800;
const R = 140;
const L = 330;
const BORE_L = 200;
const BORE_R = 600;
const WALL_TOP = 150;
const WALL_BOT = 720;

export const pistonTop = (theta: number) => {
  const pin = CY - (R * Math.cos(theta) + Math.sqrt(L * L - (R * Math.sin(theta)) ** 2));
  return pin - 140;
};

export const Cylinder: React.FC<{
  theta: number;
  t: number;
  extra?: number;
  wash?: number;
  sparks?: number;
  labels?: { fuel?: number; oil?: number; wear?: number };
}> = ({ theta, t, extra = 0, wash = 0, sparks = 0, labels = {} }) => {
  const top = pistonTop(theta);
  const pinY = top + 140;
  const crankX = 400 + R * Math.sin(theta);
  const crankY = CY - R * Math.cos(theta);
  const washY = WALL_TOP + wash * (WALL_BOT - WALL_TOP);

  // gotas del inyector
  const drops = [];
  const nDrops = Math.round(14 + extra * 40);
  for (let i = 0; i < nDrops; i++) {
    const period = 26;
    const age = (t + i * (period / nDrops) * 3) % period;
    const a = age / period;
    const side = i % 2 === 0 ? -1 : 1;
    const spread = 0.25 + rand(i * 1.7) * (0.35 + extra * 0.55);
    const reach = 1 + extra * 0.9;
    const x = 400 + side * Math.sin(spread) * a * 300 * reach;
    const y = 160 + Math.cos(spread) * a * 230 * reach;
    const big = extra > 0.3 && i % 3 === 0;
    const r = (big ? 8 : 4) + rand(i * 3.1) * 3;
    if (x < BORE_L + 14 || x > BORE_R - 14 || y > top - 6) continue;
    drops.push(<circle key={i} cx={x} cy={y} r={r} fill={C.cyan} opacity={(1 - a * 0.5) * 0.95} />);
  }

  // regueros de bencina por las paredes (zona lavada)
  const streaks = [];
  if (wash > 0) {
    for (let i = 0; i < 9; i++) {
      const left = i % 2 === 0;
      const x = left ? BORE_L + 4 + rand(i) * 6 : BORE_R - 4 - rand(i) * 6;
      const y0 = WALL_TOP + 10 + rand(i * 2.3) * 120;
      const len = Math.max(0, washY - y0) * (0.6 + 0.4 * rand(i * 5.5));
      streaks.push(
        <line key={i} x1={x} y1={y0} x2={x} y2={y0 + len} stroke={C.cyan} strokeWidth={7} strokeLinecap="round" opacity={0.9} />,
      );
    }
  }

  // chispas de roce donde ya no hay aceite (anillos contra la pared)
  const sparkEls = [];
  if (sparks > 0) {
    const ringY = top + 32;
    if (ringY < washY) {
      for (let i = 0; i < 10; i++) {
        const k = Math.floor(t / 2) + i * 7;
        if (rand(k * 1.3) > 0.55) continue;
        const left = i % 2 === 0;
        const x0 = left ? BORE_L + 6 : BORE_R - 6;
        const ang = (left ? 0 : Math.PI) + (rand(k * 2.1) - 0.5) * 1.4;
        const l = 10 + rand(k * 3.3) * 26;
        sparkEls.push(
          <line
            key={i}
            x1={x0}
            y1={ringY}
            x2={x0 + Math.cos(ang) * l}
            y2={ringY + Math.sin(ang) * l}
            stroke={i % 3 === 0 ? "#FFE08A" : C.heat}
            strokeWidth={3}
            strokeLinecap="round"
            opacity={sparks}
          />,
        );
      }
    }
  }

  const hatch = [];
  for (let y = WALL_TOP - 10; y < WALL_BOT + 40; y += 22) {
    hatch.push(<line key={`l${y}`} x1={130} y1={y + 20} x2={196} y2={y - 10} stroke="rgba(160,190,220,0.12)" strokeWidth={3} />);
    hatch.push(<line key={`r${y}`} x1={604} y1={y + 20} x2={670} y2={y - 10} stroke="rgba(160,190,220,0.12)" strokeWidth={3} />);
  }

  const Lbl: React.FC<{ x: number; y: number; text: string; color: string; o?: number; anchor?: "start" | "end" | "middle" }> = ({
    x,
    y,
    text,
    color,
    o = 1,
    anchor = "start",
  }) => (
    <text x={x} y={y} fill={color} fontFamily={FONT_UI} fontWeight={800} fontSize={30} letterSpacing={2} textAnchor={anchor} opacity={o}>
      {text}
    </text>
  );

  return (
    <svg viewBox="0 0 800 900" width="100%" height="100%" style={{ overflow: "visible" }}>
      <defs>
        <linearGradient id="blockMetal" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#3A4A5E" />
          <stop offset="0.5" stopColor="#56697F" />
          <stop offset="1" stopColor="#3A4A5E" />
        </linearGradient>
        <linearGradient id="pistonMetal" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#C9D3DE" />
          <stop offset="1" stopColor="#7D8B9B" />
        </linearGradient>
        <linearGradient id="bore" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#0B1422" />
          <stop offset="0.5" stopColor="#13213A" />
          <stop offset="1" stopColor="#0B1422" />
        </linearGradient>
      </defs>
      {/* camisa (interior) */}
      <rect x={BORE_L} y={WALL_TOP - 10} width={BORE_R - BORE_L} height={WALL_BOT - WALL_TOP + 40} fill="url(#bore)" />
      {/* paredes del bloque */}
      <rect x={130} y={WALL_TOP - 10} width={70} height={WALL_BOT - WALL_TOP + 60} fill="url(#blockMetal)" />
      <rect x={600} y={WALL_TOP - 10} width={70} height={WALL_BOT - WALL_TOP + 60} fill="url(#blockMetal)" />
      {hatch}
      {/* culata */}
      <path d="M 110 40 L 690 40 L 690 140 L 600 140 Q 520 96 400 96 Q 280 96 200 140 L 110 140 Z" fill="url(#blockMetal)" />
      <path d="M 200 140 Q 280 96 400 96 Q 520 96 600 140" fill="none" stroke="rgba(0,0,0,0.35)" strokeWidth={4} />
      {/* bujía */}
      <rect x={282} y={6} width={30} height={70} rx={6} fill="#D8DEE6" />
      <rect x={290} y={76} width={14} height={26} fill="#9AA6B4" />
      {/* inyector */}
      <rect x={380} y={-30} width={40} height={110} rx={10} fill="#2A4466" stroke="#9FC6E8" strokeWidth={3} />
      <path d="M 388 80 L 412 80 L 404 104 L 396 104 Z" fill="#9FC6E8" />

      {/* película de aceite (se lava desde arriba) */}
      <rect
        x={BORE_L}
        y={Math.max(WALL_TOP, washY)}
        width={12}
        height={Math.max(0, WALL_BOT - Math.max(WALL_TOP, washY))}
        fill={C.oil}
        opacity={0.95}
      />
      <rect
        x={BORE_R - 12}
        y={Math.max(WALL_TOP, washY)}
        width={12}
        height={Math.max(0, WALL_BOT - Math.max(WALL_TOP, washY))}
        fill={C.oil}
        opacity={0.95}
      />
      <rect x={BORE_L} y={WALL_TOP} width={12} height={Math.max(0, washY - WALL_TOP)} fill={C.oil} opacity={0.18} />
      <rect x={BORE_R - 12} y={WALL_TOP} width={12} height={Math.max(0, washY - WALL_TOP)} fill={C.oil} opacity={0.18} />
      {streaks}

      {/* cigüeñal y biela */}
      <circle cx={400} cy={CY} r={185} fill="#0B1320" stroke="#22324A" strokeWidth={4} strokeDasharray="10 10" />
      <g transform={`rotate(${(theta * 180) / Math.PI} 400 ${CY})`}>
        <path d={`M 290 ${CY + 20} A 110 110 0 0 0 510 ${CY + 20} L 470 ${CY - 10} L 330 ${CY - 10} Z`} fill="#3A4A5E" />
        <rect x={370} y={CY - R - 10} width={60} height={R + 20} rx={22} fill="#4A5B70" />
      </g>
      <line x1={400} y1={pinY} x2={crankX} y2={crankY} stroke="#A9B6C5" strokeWidth={40} strokeLinecap="round" />
      <circle cx={crankX} cy={crankY} r={26} fill="#6E7E91" />
      <circle cx={400} cy={CY} r={24} fill="#2A3A50" />

      {/* pistón */}
      <rect x={BORE_L + 8} y={top} width={BORE_R - BORE_L - 16} height={150} rx={8} fill="url(#pistonMetal)" />
      {[18, 34, 50].map((dy) => (
        <rect key={dy} x={BORE_L + 8} y={top + dy} width={BORE_R - BORE_L - 16} height={6} fill="#4A5868" />
      ))}
      <circle cx={400} cy={pinY} r={24} fill="#5B6B7D" />

      {drops}
      {sparkEls}

      {/* etiquetas */}
      <g opacity={labels.fuel ?? 0}>
        <line x1={470} y1={190} x2={705} y2={110} stroke={C.cyan} strokeWidth={3} />
        <Lbl x={712} y={92} text="BENCINA" color={C.cyan} />
        <Lbl x={712} y={126} text="EXTRA" color={C.cyan} />
      </g>
      <g opacity={labels.oil ?? 0}>
        <line x1={205} y1={600} x2={70} y2={650} stroke={C.oil} strokeWidth={3} />
        <Lbl x={62} y={690} text="ACEITE" color={C.oil} anchor="end" />
      </g>
      <g opacity={labels.wear ?? 0}>
        <line x1={598} y1={top + 34} x2={720} y2={top + 70} stroke={C.red} strokeWidth={3} />
        <Lbl x={728} y={top + 80} text="ROCE" color={C.red} />
      </g>
    </svg>
  );
};
