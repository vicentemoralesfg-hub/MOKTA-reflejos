import React from "react";
import { COLORS, FONT_DISPLAY, FONT_UI, LEVEL_COLORS, ROUNDS } from "../config";

/** Cabecera fija: RONDA n/7, píldora de nivel y barra de dificultad que se llena ronda a ronda. */
export const RoundHeader: React.FC<{ index: number; opacity?: number }> = ({ index, opacity = 1 }) => {
  const r = ROUNDS[index];
  const lc = LEVEL_COLORS[r.level] ?? COLORS.accent;
  return (
    <div style={{ position: "absolute", left: 60, top: 196, width: 960, opacity }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 800, fontSize: 64, color: COLORS.white, letterSpacing: 2 }}>
          {r.final ? "RONDA FINAL" : `RONDA ${index + 1}`}
          <span style={{ color: COLORS.dim, fontWeight: 600 }}>{r.final ? "" : ` / ${ROUNDS.length}`}</span>
        </div>
        <div
          style={{
            fontFamily: FONT_UI,
            fontWeight: 800,
            fontSize: 30,
            letterSpacing: 4,
            color: "#06070A",
            background: lc,
            padding: "10px 22px",
            borderRadius: 999,
            boxShadow: `0 0 30px ${lc}88`,
          }}
        >
          {r.level}
        </div>
      </div>
      <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
        {ROUNDS.map((rr, i) => (
          <div
            key={rr.id}
            style={{
              flex: 1,
              height: 10,
              borderRadius: 5,
              background: i <= index ? LEVEL_COLORS[rr.level] : "rgba(255,255,255,0.12)",
              opacity: i < index ? 0.55 : 1,
            }}
          />
        ))}
      </div>
    </div>
  );
};
