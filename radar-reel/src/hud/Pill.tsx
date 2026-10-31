import React from "react";
import { C, FONT_DISPLAY, Tone, toneColor } from "./style";

export type PillSize = "sm" | "md" | "lg" | "story" | "xl";
/** "story": tamaño mínimo para las píldoras que cuentan la historia (igual a los subtítulos). */
const SIZES: Record<PillSize, { font: number; padX: number; padY: number; dot: number }> = {
  sm: { font: 34, padX: 20, padY: 8, dot: 11 },
  md: { font: 44, padX: 26, padY: 10, dot: 13 },
  lg: { font: 64, padX: 34, padY: 12, dot: 16 },
  story: { font: 96, padX: 44, padY: 14, dot: 22 },
  xl: { font: 150, padX: 60, padY: 14, dot: 0 },
};

export type PillSpec = {
  text: string;
  /** Posición en pantalla (px). Con leader, (x, y) es el punto anclado y la píldora queda arriba. */
  x: number;
  y: number;
  tone?: Tone;
  size?: PillSize;
  opacity?: number;
  /** Línea guía desde la píldora hasta el punto anclado. */
  leader?: number;
  /** 0..1: tachado (para "MÁS"). */
  strike?: number;
  /** Texto que aparece al tacharse. */
  stamp?: string;
  stampOpacity?: number;
  scale?: number;
  dot?: boolean;
  /** Dentro de un layout flex (sin posición absoluta). */
  inline?: boolean;
};

export const Pill: React.FC<{ p: PillSpec }> = ({ p }) => {
  const s = SIZES[p.size ?? "md"];
  const color = toneColor(p.tone ?? "neutral");
  const op = p.opacity ?? 1;
  if (op <= 0.001) return null;
  const leader = p.leader ?? 0;
  const showDot = (p.dot ?? true) && s.dot > 0;
  return (
    <div
      style={{
        position: p.inline ? "relative" : "absolute",
        left: p.inline ? undefined : p.x,
        top: p.inline ? undefined : p.y,
        opacity: op,
        transform: p.inline ? undefined : `translate(-50%, ${leader ? "-100%" : "-50%"})`,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      <div style={{ scale: String(p.scale ?? 1), transformOrigin: leader ? "50% 100%" : "50% 50%", position: "relative" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: s.dot * 0.9,
            padding: `${s.padY}px ${s.padX}px`,
            borderRadius: 999,
            background: C.pillBg,
            border: `2px solid ${p.tone && p.tone !== "neutral" ? color + "99" : C.pillBorder}`,
            boxShadow: `0 6px 30px rgba(0,0,0,0.45), 0 0 24px ${p.tone && p.tone !== "neutral" ? color + "33" : "rgba(0,0,0,0)"}`,
            fontFamily: FONT_DISPLAY,
            fontWeight: p.size === "xl" || p.size === "story" ? 800 : 700,
            fontSize: s.font,
            lineHeight: 1,
            letterSpacing: p.size === "xl" ? 3 : 1,
            color: C.white,
            whiteSpace: "nowrap",
            position: "relative",
          }}
        >
          {showDot ? <div style={{ width: s.dot, height: s.dot, borderRadius: 99, background: color, boxShadow: `0 0 12px ${color}` }} /> : null}
          <span style={{ position: "relative" }}>
            {p.text}
            {p.strike ? (
              <span
                style={{
                  position: "absolute",
                  left: -6,
                  top: "52%",
                  height: Math.max(4, s.font * 0.09),
                  width: `calc(${p.strike * 100}% + 12px)`,
                  background: C.red,
                  borderRadius: 4,
                  boxShadow: `0 0 10px ${C.red}`,
                }}
              />
            ) : null}
          </span>
        </div>
        {p.stamp ? (
          <div
            style={{
              position: "absolute",
              left: "100%",
              top: "50%",
              marginLeft: 16,
              transform: `translateY(-50%) scale(${0.7 + 0.3 * (p.stampOpacity ?? 0)})`,
              opacity: p.stampOpacity ?? 0,
              fontFamily: FONT_DISPLAY,
              fontWeight: 800,
              fontSize: s.font * 1.05,
              color: C.key,
              textShadow: "0 4px 24px rgba(0,0,0,0.7)",
              whiteSpace: "nowrap",
            }}
          >
            {p.stamp}
          </div>
        ) : null}
      </div>
      {leader ? (
        <>
          <div style={{ width: 2, height: leader, background: `linear-gradient(${color}cc, ${color}33)` }} />
          <div style={{ width: 10, height: 10, borderRadius: 99, background: color, marginTop: -5, boxShadow: `0 0 10px ${color}`, transform: "translateY(5px)" }} />
        </>
      ) : null}
    </div>
  );
};
