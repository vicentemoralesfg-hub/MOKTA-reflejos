import React from "react";
import { AbsoluteFill } from "remotion";
import { rand } from "../lib/anim";
import { Car, CAR_EXHAUST, Exhaust } from "./Car";

/**
 * Amanecer helado frente a una casa: el auto "calentando" con vapor saliendo del escape.
 * `t` controla toda la animación (permite congelar el plano pasando un t fijo).
 */
export const CarScene: React.FC<{
  t: number;
  zoom?: number;
  carX?: number;
  wheelAngle?: number;
  frost?: number;
  exhaust?: number;
  idle?: boolean;
  carTop?: number;
}> = ({ t, zoom = 1, carX = 0, wheelAngle = 0, frost = 1, exhaust = 1, idle = true, carTop = 1050 }) => {
  const vib = idle ? Math.sin(t * 2.6) * 1.3 + Math.sin(t * 5.3) * 0.6 : 0;
  const carLeft = 40 + carX;
  const stars = [];
  for (let i = 0; i < 46; i++) {
    const tw = 0.4 + 0.6 * Math.abs(Math.sin(t / (14 + (i % 7)) + i));
    stars.push(
      <circle key={i} cx={rand(i * 1.3) * 1080} cy={rand(i * 2.9) * 700} r={0.8 + rand(i * 5.1) * 1.6} fill="#DDE8FF" opacity={0.5 * tw} />,
    );
  }
  const windows: React.ReactNode[] = [];
  const houses = [
    { x: -40, w: 330, h: 260, roof: 90 },
    { x: 300, w: 420, h: 330, roof: 120 },
    { x: 740, w: 380, h: 240, roof: 80 },
  ];
  houses.forEach((h, hi) => {
    for (let k = 0; k < 4; k++) {
      const lit = rand(hi * 10 + k) > 0.45;
      windows.push(
        <rect
          key={`${hi}-${k}`}
          x={h.x + 40 + k * (h.w / 4.4)}
          y={1180 - h.h + 70 + (k % 2) * 70}
          width={46}
          height={56}
          rx={3}
          fill={lit ? "#FFC777" : "#101828"}
          opacity={lit ? 0.85 : 1}
        />,
      );
    }
  });
  return (
    <AbsoluteFill style={{ overflow: "hidden", background: "#050913" }}>
      <AbsoluteFill style={{ transform: `scale(${zoom})`, transformOrigin: "50% 66%" }}>
        <svg viewBox="0 0 1080 1920" width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
          <defs>
            <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#040812" />
              <stop offset="0.35" stopColor="#0A1630" />
              <stop offset="0.55" stopColor="#1A2C50" />
              <stop offset="0.62" stopColor="#5A4C6E" />
              <stop offset="0.66" stopColor="#B4745A" />
            </linearGradient>
            <linearGradient id="ground" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#24324A" />
              <stop offset="0.25" stopColor="#141E30" />
              <stop offset="1" stopColor="#070B12" />
            </linearGradient>
            <radialGradient id="lamp" cx="0.5" cy="0" r="1">
              <stop offset="0" stopColor="#FFD59A" stopOpacity="0.55" />
              <stop offset="1" stopColor="#FFD59A" stopOpacity="0" />
            </radialGradient>
            <radialGradient id="dawn" cx="0.7" cy="1" r="0.8">
              <stop offset="0" stopColor="#FF9A5C" stopOpacity="0.35" />
              <stop offset="1" stopColor="#FF9A5C" stopOpacity="0" />
            </radialGradient>
          </defs>
          <rect width={1080} height={1270} fill="url(#sky)" />
          <rect y={700} width={1080} height={570} fill="url(#dawn)" />
          {stars}
          {/* cerro lejano */}
          <path d="M 0 1060 Q 200 960 420 1010 Q 640 1060 820 980 Q 960 930 1080 990 L 1080 1200 L 0 1200 Z" fill="#141B2E" />
          {/* casas */}
          {houses.map((h, i) => (
            <path
              key={i}
              d={`M ${h.x} 1180 L ${h.x} ${1180 - h.h} L ${h.x + h.w / 2} ${1180 - h.h - h.roof} L ${h.x + h.w} ${1180 - h.h} L ${h.x + h.w} 1180 Z`}
              fill="#0A101C"
            />
          ))}
          {/* escarcha en tejados */}
          {houses.map((h, i) => (
            <path
              key={`r${i}`}
              d={`M ${h.x} ${1180 - h.h} L ${h.x + h.w / 2} ${1180 - h.h - h.roof} L ${h.x + h.w} ${1180 - h.h}`}
              fill="none"
              stroke="#CFE9FF"
              strokeOpacity={0.35}
              strokeWidth={5}
            />
          ))}
          {windows}
          {/* reja */}
          {Array.from({ length: 28 }).map((_, i) => (
            <rect key={i} x={i * 40} y={1120} width={8} height={70} fill="#0C1320" />
          ))}
          <rect x={0} y={1128} width={1080} height={8} fill="#0C1320" />
          {/* poste de luz */}
          <rect x={92} y={640} width={14} height={560} fill="#0C1320" />
          <path d="M 99 646 Q 110 610 170 616 L 176 630 Q 120 628 106 650 Z" fill="#0C1320" />
          <path d="M 160 630 L -60 1200 L 420 1200 Z" fill="url(#lamp)" opacity={0.55} />
          <circle cx={168} cy={632} r={12} fill="#FFE2B0" />
          <circle cx={168} cy={632} r={46} fill="#FFD59A" opacity={0.25} />
          {/* suelo */}
          <rect y={1180} width={1080} height={740} fill="url(#ground)" />
          {/* brillo de escarcha en el suelo */}
          {Array.from({ length: 90 }).map((_, i) => {
            const tw = Math.max(0, Math.sin(t / 6 + i * 1.7));
            return (
              <circle
                key={`g${i}`}
                cx={rand(i * 3.7) * 1080}
                cy={1190 + rand(i * 6.1) * 600}
                r={1 + rand(i) * 1.6}
                fill="#E8F6FF"
                opacity={0.15 + 0.6 * tw * tw}
              />
            );
          })}
          {/* líneas del pasaje */}
          <path d="M 0 1420 L 1080 1380" stroke="rgba(200,225,255,0.08)" strokeWidth={4} />
        </svg>

        {/* auto */}
        <div style={{ position: "absolute", left: carLeft, top: carTop + vib, width: 1000 }}>
          <Car wheelAngle={wheelAngle} frost={frost} lights={1} />
        </div>
        {/* vapor del escape */}
        <div style={{ position: "absolute", inset: 0 }}>
          <Exhaust t={t} x={carLeft + CAR_EXHAUST.x} y={carTop + CAR_EXHAUST.y + vib} intensity={exhaust} drift={-0.35} />
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
