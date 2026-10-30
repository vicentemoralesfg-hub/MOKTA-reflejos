import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { THEME } from "../prototipo/theme";
import subs from "./subtitulos.json";

/**
 * Subtítulos de la voz, palabra por palabra (tiempos generados por scripts/plan_guion.py).
 * Banda fija sobre el tablero (y ≈ 1100–1215): fuera del instrumental, de los títulos y de la zona
 * inferior que tapa la interfaz de Instagram. Cada palabra entra cuando se dice; las destacadas en ámbar
 * (el color de las balizas de la barrera). La línea se reserva completa para que no se desplace al crecer.
 */
type Word = { w: string; f: number; em: boolean };
type Chunk = { line: string; from: number; to: number; words: Word[] };
const SUBS = subs as Chunk[];

export const SUB_TOP = 1096;

export const Subtitles: React.FC = () => {
  const f = useCurrentFrame();
  const c = SUBS.find((x) => f >= x.from && f < x.to);
  if (!c) return null;
  const out = interpolate(f, [c.to - 3, c.to], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <AbsoluteFill style={{ top: SUB_TOP, height: 120, alignItems: "center", justifyContent: "center", pointerEvents: "none", opacity: out }}>
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          gap: "0 16px",
          maxWidth: 900,
          fontFamily: THEME.display,
          fontWeight: 800,
          fontSize: 68,
          lineHeight: 1.05,
          textShadow: "0 3px 14px rgba(0,0,0,0.9), 0 0 3px rgba(0,0,0,0.95)",
        }}
      >
        {c.words.map((wd, i) => {
          const k = f - wd.f;
          const on = interpolate(k, [-1, 3], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
          const current = k >= 0 && (i === c.words.length - 1 || f < c.words[i + 1].f);
          return (
            <span
              key={i}
              style={{
                opacity: on,
                translate: `0px ${interpolate(on, [0, 1], [10, 0])}px`,
                scale: String(current ? 1.06 : 1),
                color: wd.em ? THEME.amber : current ? "#FFFFFF" : "rgba(244,246,248,0.9)",
              }}
            >
              {wd.w}
            </span>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
