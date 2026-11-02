import React from "react";
import { AbsoluteFill, interpolate } from "remotion";
import { C, DISPLAY, UI, fmt } from "../../brand";
import { EASE_IN_OUT, EASE_OUT, inOut, ramp } from "../../lib/anim";
import { CHAT_SECONDS, FIELD_M, METERS, SPEED_KMH } from "./script";

/** Página 1: "Leíste ese chat durante 7 segundos". Página 2: 194 m a escala junto a 2 canchas. */

const PAGE2 = 55;
const TRAIL_A = PAGE2 + 10;
const TRAIL_B = PAGE2 + 72;
const SWAP = TRAIL_B + 4;

// Diagrama a escala: 210 m de alto en 870 px
const Y0 = 1470;
const PX_M = 870 / (2 * FIELD_M);
const yOf = (m: number) => Y0 - m * PX_M;
const ROAD_X = 364;
const ROAD_W = 84;
const FIELD_X = 514;
const FIELD_W = 68 * PX_M;

const Field: React.FC<{ m0: number; on: number; hl: number }> = ({ m0, on, hl }) => {
  const top = yOf(m0 + FIELD_M);
  const h = FIELD_M * PX_M;
  const w = FIELD_W;
  const x = FIELD_X;
  const box = 16.5 * PX_M;
  const boxW = 40.3 * PX_M;
  const goalBox = 5.5 * PX_M;
  const goalW = 18.3 * PX_M;
  const stroke = `rgba(43,227,138,${0.35 + 0.55 * hl})`;
  return (
    <g opacity={on}>
      <rect x={x} y={top} width={w} height={h} fill={`rgba(43,227,138,${0.04 + 0.1 * hl})`} stroke={stroke} strokeWidth={3} />
      <line x1={x} y1={top + h / 2} x2={x + w} y2={top + h / 2} stroke={stroke} strokeWidth={3} />
      <circle cx={x + w / 2} cy={top + h / 2} r={9.15 * PX_M} fill="none" stroke={stroke} strokeWidth={3} />
      <rect x={x + (w - boxW) / 2} y={top} width={boxW} height={box} fill="none" stroke={stroke} strokeWidth={3} />
      <rect x={x + (w - boxW) / 2} y={top + h - box} width={boxW} height={box} fill="none" stroke={stroke} strokeWidth={3} />
      <rect x={x + (w - goalW) / 2} y={top} width={goalW} height={goalBox} fill="none" stroke={stroke} strokeWidth={3} />
      <rect x={x + (w - goalW) / 2} y={top + h - goalBox} width={goalW} height={goalBox} fill="none" stroke={stroke} strokeWidth={3} />
    </g>
  );
};

export const DataScene: React.FC<{ f: number }> = ({ f }) => {
  // Página 1
  const p1 = inOut(f, 0, 10, PAGE2 - 8, PAGE2);
  const secs = Math.round(CHAT_SECONDS);

  // Página 2
  const p2 = ramp(f, PAGE2, PAGE2 + 10);
  const trail = ramp(f, TRAIL_A, TRAIL_B, EASE_IN_OUT);
  const meters = METERS * trail;
  const swap = ramp(f, SWAP, SWAP + 10);
  const hl = ramp(f, SWAP, SWAP + 14);
  const headY = yOf(meters);

  return (
    <AbsoluteFill style={{ background: C.ink }}>
      {/* ---------- Página 1 ---------- */}
      {p1 > 0.001 ? (
        <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", opacity: p1, paddingBottom: 140 }}>
          <div style={{ fontFamily: UI, fontWeight: 600, fontSize: 52, color: C.dim, translate: `0px ${interpolate(p1, [0, 1], [16, 0])}px` }}>
            Leíste ese chat durante
          </div>
          <div
            style={{
              fontFamily: DISPLAY,
              fontWeight: 800,
              fontSize: 420,
              lineHeight: 0.9,
              color: C.white,
              marginTop: 24,
              scale: String(interpolate(ramp(f, 4, 18, EASE_OUT), [0, 1], [1.1, 1])),
            }}
          >
            {secs}
          </div>
          <div style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: 140, lineHeight: 1, color: C.white, letterSpacing: 4, opacity: ramp(f, 6, 16) }}>
            SEGUNDOS
          </div>
        </AbsoluteFill>
      ) : null}

      {/* ---------- Página 2 ---------- */}
      {f >= PAGE2 ? (
        <AbsoluteFill style={{ opacity: p2 }}>
          <div style={{ position: "absolute", top: 262, left: 0, right: 0, textAlign: "center", fontFamily: UI, fontWeight: 600, fontSize: 46, color: C.dim }}>
            Ibas a {SPEED_KMH} km/h. Eso son
          </div>
          <div
            style={{
              position: "absolute",
              top: 318,
              left: 0,
              right: 0,
              textAlign: "center",
              fontFamily: DISPLAY,
              fontWeight: 800,
              fontSize: 200,
              lineHeight: 1,
              color: C.red,
              fontVariantNumeric: "tabular-nums",
              textShadow: `0 0 60px ${C.red}55`,
            }}
          >
            {fmt(Math.round(meters))} {Math.round(meters) === 1 ? "METRO" : "METROS"}
          </div>
          <div style={{ position: "absolute", top: 530, left: 0, right: 0, height: 60 }}>
            <div
              style={{
                position: "absolute",
                inset: 0,
                textAlign: "center",
                fontFamily: UI,
                fontWeight: 600,
                fontSize: 46,
                color: C.white,
                opacity: 1 - swap,
                translate: `0px ${-swap * 16}px`,
              }}
            >
              sin mirar el camino
            </div>
            <div
              style={{
                position: "absolute",
                inset: 0,
                textAlign: "center",
                fontFamily: UI,
                fontWeight: 700,
                fontSize: 46,
                color: C.green,
                opacity: swap,
                translate: `0px ${(1 - swap) * 16}px`,
              }}
            >
              = casi 2 canchas de fútbol
            </div>
          </div>

          <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: "absolute", inset: 0 }}>
            <defs>
              <linearGradient id="trail" x1="0" y1="1" x2="0" y2="0">
                <stop offset="0" stopColor={C.red} stopOpacity="0.15" />
                <stop offset="1" stopColor={C.red} stopOpacity="0.95" />
              </linearGradient>
            </defs>
            {/* canchas a escala */}
            <Field m0={0} on={ramp(f, PAGE2 + 4, PAGE2 + 16)} hl={hl} />
            <Field m0={FIELD_M} on={ramp(f, PAGE2 + 8, PAGE2 + 20)} hl={hl} />
            {/* autopista */}
            <rect x={ROAD_X} y={yOf(2 * FIELD_M)} width={ROAD_W} height={2 * FIELD_M * PX_M} fill="#14171D" />
            {Array.from({ length: 22 }).map((_, i) => (
              <rect key={i} x={ROAD_X + ROAD_W / 2 - 2} y={yOf(i * 10 + 6)} width={4} height={3 * PX_M} fill="rgba(244,246,248,0.35)" />
            ))}
            {/* reglas de distancia */}
            {[0, 50, 100, 150, 200].map((m) => (
              <g key={m} opacity={0.75}>
                <line x1={ROAD_X - 26} y1={yOf(m)} x2={ROAD_X - 6} y2={yOf(m)} stroke={C.faint} strokeWidth={3} />
                <text x={ROAD_X - 36} y={yOf(m) + 11} textAnchor="end" fontFamily="Inter" fontWeight={500} fontSize={30} fill={C.faint}>
                  {m} m
                </text>
              </g>
            ))}
            {/* recorrido a ciegas */}
            <rect x={ROAD_X + 10} y={headY} width={ROAD_W - 20} height={Y0 - headY} fill="url(#trail)" rx={6} />
            {/* auto (vista cenital) */}
            <g transform={`translate(${ROAD_X + ROAD_W / 2}, ${headY})`}>
              <rect x={-22} y={-14} width={44} height={80} rx={14} fill={C.white} />
              <rect x={-16} y={4} width={32} height={18} rx={5} fill="#2A2F3A" />
              <circle cx={-14} cy={-12} r={5} fill="#FFF4C8" />
              <circle cx={14} cy={-12} r={5} fill="#FFF4C8" />
              <path d={`M -14 -14 L -60 -110 L 60 -110 L 14 -14 Z`} fill="#FFF4C8" opacity={0.08} />
            </g>
            {/* marca final */}
            {trail > 0.999 ? (
              <g opacity={ramp(f, TRAIL_B, TRAIL_B + 8)}>
                <line x1={ROAD_X - 30} y1={yOf(METERS)} x2={FIELD_X + FIELD_W + 20} y2={yOf(METERS)} stroke={C.red} strokeWidth={3} strokeDasharray="10 10" />
                <text x={FIELD_X + FIELD_W + 26} y={yOf(METERS) + 11} fontFamily="Inter" fontWeight={700} fontSize={32} fill={C.red}>
                  {fmt(Math.round(METERS))} m
                </text>
              </g>
            ) : null}
          </svg>
        </AbsoluteFill>
      ) : null}
    </AbsoluteFill>
  );
};
