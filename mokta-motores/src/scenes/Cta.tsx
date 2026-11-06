import React from "react";
import { AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame } from "remotion";
import { COLORS, CTA_DURATION, FONT_DISPLAY, FONT_UI, LEVEL_COLORS, ROUNDS, TEXT, TOTAL_DURATION } from "../config";
import { Backdrop } from "../components/Backdrop";
import { EASE_OUT, ramp } from "../lib/anim";

const SCALE = [
  { range: "0–2", label: "Recién sacaste la licencia" },
  { range: "3–4", label: "Buen oído" },
  { range: "5–6", label: "Fierrero de verdad" },
  { range: "7", label: "Oído de ingeniero de F1" },
];

/** Cierre: resumen de las 7 respuestas (para contar aciertos), escala de puntaje y llamado a comentar. */
export const Cta: React.FC = () => {
  const f = useCurrentFrame();
  const abs = TOTAL_DURATION - CTA_DURATION + f;
  const head = ramp(f, 0, 10, EASE_OUT);
  const ask = ramp(f, 40, 50, EASE_OUT); // "Comenta tu puntaje" en la locución

  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <Backdrop absFrame={abs} tint="255,90,31" energy={0.6} />
      <div
        style={{
          position: "absolute",
          top: 196,
          width: "100%",
          textAlign: "center",
          fontFamily: FONT_DISPLAY,
          fontWeight: 800,
          fontSize: 118,
          lineHeight: 1,
          color: COLORS.white,
          opacity: head,
          scale: String(interpolate(head, [0, 1], [1.2, 1])),
        }}
      >
        {TEXT.ctaTop}
      </div>

      <div style={{ position: "absolute", top: 340, left: 60, right: 60, display: "flex", flexDirection: "column", gap: 12 }}>
        {ROUNDS.map((r, i) => {
          const t = ramp(f, 6 + i * 4, 16 + i * 4, EASE_OUT);
          return (
            <div
              key={r.id}
              style={{
                height: 92,
                borderRadius: 20,
                background: "rgba(255,255,255,0.06)",
                border: "2px solid rgba(255,255,255,0.1)",
                display: "flex",
                alignItems: "center",
                gap: 22,
                paddingRight: 24,
                overflow: "hidden",
                opacity: t,
                translate: `${interpolate(t, [0, 1], [80, 0])}px 0px`,
              }}
            >
              <Img src={staticFile(r.img)} style={{ width: 150, height: 92, objectFit: "cover" }} />
              <div style={{ fontFamily: FONT_UI, fontWeight: 800, fontSize: 28, color: LEVEL_COLORS[r.level], width: 40 }}>
                {i + 1}
              </div>
              <div
                style={{
                  fontFamily: FONT_DISPLAY,
                  fontWeight: 800,
                  fontSize: 60,
                  color: COLORS.white,
                  width: 290,
                  whiteSpace: "nowrap",
                }}
              >
                {r.answer}
              </div>
              <div style={{ fontFamily: FONT_UI, fontWeight: 600, fontSize: 30, color: COLORS.dim, whiteSpace: "nowrap" }}>
                {r.car}
              </div>
            </div>
          );
        })}
      </div>

      <div
        style={{
          position: "absolute",
          top: 1100,
          left: 60,
          right: 60,
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 12,
          opacity: ramp(f, 26, 38),
        }}
      >
        {SCALE.map((s) => (
          <div key={s.range} style={{ display: "flex", alignItems: "baseline", gap: 14 }}>
            <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 800, fontSize: 46, color: COLORS.accent2, minWidth: 74 }}>{s.range}</div>
            <div style={{ fontFamily: FONT_UI, fontWeight: 600, fontSize: 28, color: COLORS.white }}>{s.label}</div>
          </div>
        ))}
      </div>

      <div
        style={{
          position: "absolute",
          top: 1268,
          left: 60,
          right: 60,
          borderRadius: 30,
          background: COLORS.accent,
          padding: "26px 30px",
          textAlign: "center",
          opacity: ask,
          scale: String(interpolate(ask, [0, 1], [0.85, 1])),
          boxShadow: "0 0 70px rgba(255,90,31,0.5)",
        }}
      >
        <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 800, fontSize: 84, lineHeight: 1, color: "#fff" }}>
          {TEXT.ctaComment} <span style={{ color: "#06070A" }}>__/7</span>
        </div>
        <div style={{ fontFamily: FONT_UI, fontWeight: 700, fontSize: 38, color: "#fff", marginTop: 8 }}>{TEXT.ctaHardest}</div>
      </div>
    </AbsoluteFill>
  );
};
