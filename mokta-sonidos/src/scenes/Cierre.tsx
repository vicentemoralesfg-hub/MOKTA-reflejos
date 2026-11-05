import React from "react";
import { Audio } from "@remotion/media";
import { AbsoluteFill, interpolate, staticFile, useCurrentFrame } from "remotion";
import { COLORS, FONT_BLOCK, FONT_DISPLAY, RONDAS } from "../config";
import { Fondo } from "../components/Fondo";
import { pop } from "../lib";

export const Cierre: React.FC<{ conAudio?: boolean }> = ({ conAudio = true }) => {
  const f = useCurrentFrame();
  const t1 = pop(f, 2, 10, 200);
  const flecha = Math.sin((f / 30) * Math.PI * 3) * 16;

  return (
    <AbsoluteFill>
      <Fondo acento={COLORS.pink} acento2={COLORS.cyan} />
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", paddingBottom: 120 }}>
        {/* fichas de las 3 respuestas */}
        <div style={{ display: "flex", gap: 34, marginBottom: 70 }}>
          {RONDAS.map((r, i) => {
            const p = pop(f, 10 + i * 6, 10, 220);
            return (
              <div
                key={r.numero}
                style={{
                  width: 210,
                  height: 210,
                  borderRadius: 40,
                  background: r.acento,
                  border: `8px solid ${COLORS.ink}`,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  scale: String(p),
                  rotate: `${(i - 1) * 6}deg`,
                  boxShadow: `0 12px 0 ${COLORS.ink}`,
                }}
              >
                <div style={{ fontFamily: FONT_BLOCK, fontSize: 34, color: COLORS.white }}>RONDA {r.numero}</div>
                <div style={{ fontFamily: FONT_DISPLAY, fontSize: 120, lineHeight: 1, color: COLORS.white, WebkitTextStroke: `6px ${COLORS.ink}`, paintOrder: "stroke fill" }}>
                  {r.correcta}
                </div>
              </div>
            );
          })}
        </div>
        <div
          style={{
            fontFamily: FONT_DISPLAY,
            fontSize: 150,
            lineHeight: 0.95,
            color: COLORS.ink,
            textAlign: "center",
            letterSpacing: 2,
            textShadow: `10px 10px 0 ${COLORS.pink}`,
            scale: String(interpolate(t1, [0, 1], [2.4, 1])),
            opacity: Math.min(1, t1 * 2),
            rotate: "-4deg",
          }}
        >
          ¿CUÁNTAS
          <br />
          <span style={{ color: COLORS.yellow, WebkitTextStroke: `10px ${COLORS.ink}`, paintOrder: "stroke fill", textShadow: `10px 10px 0 ${COLORS.ink}` }}>ACERTASTE?</span>
        </div>
        <div
          style={{
            marginTop: 70,
            display: "flex",
            alignItems: "center",
            gap: 18,
            padding: "16px 40px 14px",
            background: COLORS.white,
            border: `6px solid ${COLORS.ink}`,
            borderRadius: 999,
            fontFamily: FONT_BLOCK,
            fontSize: 54,
            color: COLORS.ink,
            boxShadow: `8px 8px 0 ${COLORS.cyan}`,
            scale: String(pop(f, 34, 12, 180)),
          }}
        >
          COMENTA
          <svg width={60} height={60} viewBox="0 0 100 100" style={{ translate: `0px ${flecha}px` }}>
            <path d="M50 10 V80 M20 52 L50 84 L80 52" stroke={COLORS.pink} strokeWidth={14} fill="none" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </AbsoluteFill>
      <div
        style={{
          position: "absolute",
          bottom: 300,
          width: "100%",
          textAlign: "center",
          fontFamily: FONT_DISPLAY,
          fontSize: 46,
          letterSpacing: 14,
          color: "rgba(26,18,64,0.55)",
          opacity: pop(f, 44, 14, 160),
        }}
      >
        MOKTA
      </div>

      {conAudio ? (
        <>
          <Audio src={staticFile("sfx/whoosh.mp3")} volume={0.5} />
        </>
      ) : null}
    </AbsoluteFill>
  );
};
