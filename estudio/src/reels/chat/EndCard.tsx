import React from "react";
import { AbsoluteFill, interpolate } from "remotion";
import { C, DISPLAY, UI, fmt } from "../../brand";
import { BACK_OUT, ramp } from "../../lib/anim";
import { METERS } from "./script";

export const EndCard: React.FC<{ f: number }> = ({ f }) => {
  const a = ramp(f, 0, 12);
  const b = ramp(f, 8, 20);
  const q = ramp(f, 30, 44, BACK_OUT);
  const s = ramp(f, 48, 60);
  const logo = ramp(f, 56, 70);
  return (
    <AbsoluteFill style={{ background: C.ink }}>
      <AbsoluteFill style={{ alignItems: "center", top: 470 }}>
        <div
          style={{
            fontFamily: DISPLAY,
            fontWeight: 800,
            fontSize: 132,
            lineHeight: 0.98,
            textAlign: "center",
            color: C.white,
            opacity: a,
            translate: `0px ${interpolate(a, [0, 1], [24, 0])}px`,
          }}
        >
          NINGÚN CHISME VALE
        </div>
        <div
          style={{
            fontFamily: DISPLAY,
            fontWeight: 800,
            fontSize: 132,
            lineHeight: 0.98,
            textAlign: "center",
            color: C.white,
            opacity: b,
            translate: `0px ${interpolate(b, [0, 1], [24, 0])}px`,
          }}
        >
          <span style={{ color: C.red }}>{fmt(Math.round(METERS))} METROS</span>
          <br />A CIEGAS.
        </div>
      </AbsoluteFill>

      <AbsoluteFill style={{ alignItems: "center", top: 1012 }}>
        <div
          style={{
            fontFamily: UI,
            fontWeight: 700,
            fontSize: 46,
            color: C.ink,
            background: C.yellow,
            padding: "22px 36px",
            borderRadius: 24,
            opacity: q,
            scale: String(interpolate(q, [0, 1], [0.9, 1])),
          }}
        >
          ¿Y qué hizo la mamá del Seba? 👀
        </div>
        <div
          style={{
            marginTop: 34,
            display: "flex",
            alignItems: "center",
            gap: 16,
            fontFamily: UI,
            fontWeight: 600,
            fontSize: 40,
            color: C.white,
            opacity: s * 0.92,
            translate: `0px ${interpolate(s, [0, 1], [14, 0])}px`,
          }}
        >
          <svg width="40" height="40" viewBox="0 0 24 24">
            <path d="M21.5 2.5L10.5 13.5M21.5 2.5l-7 19-4-8-8-4z" fill="none" stroke={C.white} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
          </svg>
          Mándaselo a quien chatea manejando
        </div>
      </AbsoluteFill>

      <div
        style={{
          position: "absolute",
          top: 1360,
          left: 0,
          right: 0,
          textAlign: "center",
          fontFamily: DISPLAY,
          fontWeight: 700,
          fontSize: 44,
          letterSpacing: 20,
          color: "rgba(244,246,248,0.6)",
          opacity: logo,
        }}
      >
        MOKTA
      </div>
    </AbsoluteFill>
  );
};
