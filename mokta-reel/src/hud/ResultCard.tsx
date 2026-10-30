import React from "react";
import { interpolate } from "remotion";
import { COLORS, FONT_DISPLAY, FONT_UI, TEXT, THRESHOLDS, fmt, kmhToMs } from "../config";
import { ramp } from "../lib/anim";

type Zone = "green" | "yellow" | "red";

/**
 * Tabla de lectura del resultado: el espectador compara el tiempo en que pausó
 * con los tres tramos. Los metros son física exacta (v · t) a la velocidad de la ronda.
 */
export const ResultCard: React.FC<{ kmh: number; f: number; compact?: boolean }> = ({ kmh, f, compact }) => {
  const v = kmhToMs(kmh);
  const g = THRESHOLDS.greenMaxS;
  const y = THRESHOLDS.yellowMaxS;
  const rows: { zone: Zone; time: string; meters: string }[] = [
    { zone: "green", time: `< ${fmt(g, 2)} s`, meters: `< ${fmt(v * g)} m` },
    { zone: "yellow", time: `${fmt(g, 2)}–${fmt(y, 2)} s`, meters: `${fmt(v * g)}–${fmt(v * y)} m` },
    { zone: "red", time: `> ${fmt(y, 2)} s`, meters: `> ${fmt(v * y)} m` },
  ];
  const stagger = compact ? 3 : 5;
  const pIn = ramp(f, 0, 12);
  return (
    <div
      style={{
        position: "absolute",
        left: 84,
        right: 84,
        top: 958,
        padding: "34px 40px 30px",
        borderRadius: 30,
        background: "rgba(6,9,15,0.82)",
        border: "1px solid rgba(255,255,255,0.10)",
        boxShadow: "0 30px 80px rgba(0,0,0,0.55)",
        backdropFilter: "blur(14px)",
        opacity: pIn,
        translate: `0px ${interpolate(pIn, [0, 1], [40, 0])}px`,
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "baseline",
          marginBottom: 18,
        }}
      >
        <div style={{ fontFamily: FONT_UI, fontWeight: 700, fontSize: 46, color: COLORS.white }}>
          {TEXT.resultTitle}
        </div>
        <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 600, fontSize: 40, color: COLORS.dim }}>
          {kmh} km/h
        </div>
      </div>
      {rows.map((r, i) => {
        const p = ramp(f, 6 + i * stagger, 16 + i * stagger);
        const c = COLORS[r.zone];
        return (
          <div
            key={r.zone}
            style={{
              display: "grid",
              gridTemplateColumns: "28px 1.05fr 1.2fr 1.25fr",
              alignItems: "center",
              columnGap: 18,
              padding: "16px 0",
              borderTop: i === 0 ? "none" : "1px solid rgba(255,255,255,0.08)",
              opacity: p,
              translate: `${interpolate(p, [0, 1], [-18, 0])}px 0px`,
            }}
          >
            <div style={{ width: 22, height: 22, borderRadius: 11, background: c, boxShadow: `0 0 18px ${c}` }} />
            <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 800, fontSize: 48, color: c, letterSpacing: 1 }}>
              {TEXT.zoneLabels[r.zone]}
            </div>
            <div style={{ fontFamily: FONT_UI, fontWeight: 500, fontSize: 36, color: COLORS.white, whiteSpace: "nowrap" }}>
              {r.time}
            </div>
            <div
              style={{
                fontFamily: FONT_DISPLAY,
                fontWeight: 700,
                fontSize: 46,
                color: COLORS.white,
                textAlign: "right",
                whiteSpace: "nowrap",
              }}
            >
              {r.meters}
            </div>
          </div>
        );
      })}
      <div
        style={{
          marginTop: 8,
          fontFamily: FONT_UI,
          fontWeight: 500,
          fontSize: 28,
          color: "rgba(244,246,248,0.5)",
          textAlign: "right",
          opacity: ramp(f, 22, 32),
        }}
      >
        metros recorridos sin frenar
      </div>
    </div>
  );
};
