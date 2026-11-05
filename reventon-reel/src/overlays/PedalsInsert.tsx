import React from "react";
import { AbsoluteFill } from "remotion";
import { clamp01, easeInOut } from "../tl";
import { COL, FONT_UI } from "./style";

/**
 * Inserto cenital del piso del conductor: el pie deja el acelerador, va al freno y lo pisa a fondo.
 * Vista desde los ojos del conductor (mirando hacia los pies).
 */
const SHOE = "M 0 -280 C 70 -282, 106 -232, 110 -150 C 114 -60, 94 40, 86 120 C 80 200, 72 268, 0 282 C -72 268, -82 200, -88 120 C -97 40, -114 -60, -110 -150 C -106 -232, -70 -282, 0 -280 Z";

export const PedalsInsert: React.FC<{ T: number; liftAt: number; slamAt: number }> = ({ T, liftAt, slamAt }) => {
  const moveEnd = slamAt - 0.16;
  const m = easeInOut((T - liftAt - 0.05) / (moveEnd - liftAt - 0.05));
  const up = Math.sin(Math.PI * clamp01((T - liftAt) / (moveEnd - liftAt + 0.08)));
  const slam = clamp01((T - (slamAt - 0.04)) / 0.07);
  const after = T - slamAt;
  const accX = 735, accY = 760;
  const brX = 390, brY = 800;
  const x = accX + (brX - accX) * m;
  const y = 905 + (965 - 905) * m - 40 * up;
  const sc = 1 + 0.1 * up - 0.09 * slam;
  const shadowOff = 18 + 40 * up - 14 * slam;
  const accPress = T < liftAt ? 0.06 : 0.06 * (1 - clamp01((T - liftAt) / 0.12));
  const brPress = 0.09 * slam;
  const shakeAmp = after > 0 ? 22 * Math.exp(-after * 7) : 0;
  const sx = Math.sin(T * 83) * shakeAmp, sy = Math.cos(T * 67) * shakeAmp;
  const blur = Math.abs(m - easeInOut((T - 1 / 30 - liftAt - 0.05) / (moveEnd - liftAt - 0.05))) * 40;
  const ring = after > 0 ? clamp01(after / 0.45) : 0;

  const Pedal: React.FC<{ cx: number; cy: number; w: number; h: number; press: number; ridges: number; hot?: boolean }> = ({ cx, cy, w, h, press, ridges, hot }) => (
    <g transform={`translate(${cx} ${cy}) scale(${1 - press})`}>
      <rect x={-w / 2 + 8} y={-h / 2 + 14} width={w} height={h} rx={26} fill="rgba(0,0,0,0.6)" />
      <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={26} fill="url(#metal)" stroke="#4b4e57" strokeWidth={4} />
      {Array.from({ length: ridges }, (_, i) => (
        <rect key={i} x={-w / 2 + 22} y={-h / 2 + 24 + i * ((h - 48) / ridges)} width={w - 44} height={((h - 48) / ridges) * 0.45} rx={6} fill="#14151a" />
      ))}
      {hot ? <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={26} fill="none" stroke={COL.red} strokeWidth={8} opacity={slam} style={{ filter: "drop-shadow(0 0 22px rgba(255,59,48,0.95))" }} /> : null}
    </g>
  );

  return (
    <AbsoluteFill style={{ background: "#08080b", overflow: "hidden" }}>
      <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: "absolute", inset: 0, transform: `translate(${sx}px, ${sy}px) scale(1.04)` }}>
        <defs>
          <filter id="carpet">
            <feTurbulence type="fractalNoise" baseFrequency="1.4" numOctaves="2" seed="4" />
            <feColorMatrix type="matrix" values="0 0 0 0 0.09  0 0 0 0 0.09  0 0 0 0 0.11  0 0 0 0.9 0" />
          </filter>
          <linearGradient id="metal" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#5a5d66" />
            <stop offset="0.5" stopColor="#2b2d33" />
            <stop offset="1" stopColor="#3b3e46" />
          </linearGradient>
          <linearGradient id="upper" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#141a2a" />
            <stop offset="0.45" stopColor="#24304b" />
            <stop offset="1" stopColor="#111624" />
          </linearGradient>
          <linearGradient id="jeans" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#141c30" />
            <stop offset="0.5" stopColor="#2c3b5e" />
            <stop offset="1" stopColor="#121a2c" />
          </linearGradient>
          <radialGradient id="moon" cx="0.3" cy="0.25" r="0.9">
            <stop offset="0" stopColor="rgba(150,170,255,0.20)" />
            <stop offset="1" stopColor="rgba(0,0,0,0)" />
          </radialGradient>
        </defs>
        <rect x={0} y={0} width={1080} height={1920} fill="#101014" />
        <rect x={0} y={0} width={1080} height={1920} filter="url(#carpet)" />
        {/* tabique y túnel central */}
        <path d="M 0 0 L 1080 0 L 1080 470 C 800 520, 300 520, 0 470 Z" fill="#0a0a0d" />
        <path d="M 0 470 C 300 520, 800 520, 1080 470" stroke="rgba(255,170,130,0.18)" strokeWidth={4} fill="none" />
        <path d="M 0 520 L 150 560 L 150 1920 L 0 1920 Z" fill="#0c0c10" />
        <rect x={0} y={0} width={1080} height={1920} fill="url(#moon)" />

        <Pedal cx={accX} cy={accY} w={130} h={330} press={accPress} ridges={7} />
        <Pedal cx={brX} cy={brY} w={270} h={200} press={brPress} ridges={4} hot />

        {/* onda de impacto */}
        {ring > 0 && ring < 1 ? (
          <circle cx={brX} cy={brY} r={160 + ring * 420} fill="none" stroke={COL.red} strokeWidth={14 * (1 - ring)} opacity={1 - ring} />
        ) : null}

        {/* pie */}
        <g style={{ filter: blur > 0.3 ? `blur(${Math.min(6, blur)}px)` : undefined }}>
          <g transform={`translate(${x + shadowOff * 0.6} ${y + shadowOff}) scale(${sc})`} opacity={0.55}>
            <path d={SHOE} fill="#000" />
          </g>
          <g transform={`translate(${x} ${y}) scale(${sc}) rotate(${-4 + 6 * m})`}>
            {/* pierna (en escorzo hacia el conductor) */}
            <path d="M -100 160 C -110 400, -120 700, -130 1100 L 130 1100 C 120 700, 110 400, 100 160 Z" fill="url(#jeans)" />
            <path d="M -100 160 C -110 400, -120 700, -130 1100" stroke="rgba(160,180,255,0.25)" strokeWidth={5} fill="none" />
            {/* suela y capellada */}
            <path d={SHOE} fill="#d7d5cf" transform="scale(1.06)" />
            <path d={SHOE} fill="url(#upper)" />
            <path d="M -60 -230 C -30 -262, 30 -262, 60 -230" stroke="rgba(255,255,255,0.22)" strokeWidth={6} fill="none" />
            {/* cordones */}
            {[-110, -70, -30, 10, 50].map((ly, i) => (
              <line key={i} x1={-42} y1={ly} x2={42} y2={ly + 6} stroke="#e9e8e4" strokeWidth={9} strokeLinecap="round" />
            ))}
            {/* boca del zapato + tobillo */}
            <ellipse cx={0} cy={150} rx={78} ry={70} fill="#0d1120" />
            <path d="M -88 120 C -60 90, 60 90, 88 120" stroke="rgba(255,170,130,0.3)" strokeWidth={5} fill="none" />
          </g>
        </g>
      </svg>
      {/* rótulos */}
      <div style={{ position: "absolute", left: brX - 130, top: 560, width: 260, textAlign: "center", fontFamily: FONT_UI, fontWeight: 700, fontSize: 30, letterSpacing: 4, color: COL.dim, opacity: 1 - slam }}>FRENO</div>
      <div style={{ position: "absolute", left: accX - 130, top: 520, width: 260, textAlign: "center", fontFamily: FONT_UI, fontWeight: 700, fontSize: 30, letterSpacing: 4, color: COL.dim, opacity: 1 - slam }}>ACELERADOR</div>
      {after > 0 ? <AbsoluteFill style={{ background: COL.red, opacity: 0.35 * Math.exp(-after * 6), mixBlendMode: "screen" }} /> : null}
    </AbsoluteFill>
  );
};
