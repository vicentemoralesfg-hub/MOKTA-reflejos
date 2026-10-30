import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { COLORS, FONT_DISPLAY, FONT_UI, FPS, HOOK_DURATION, ROUNDS, TEXT } from "../config";
import { DriveView } from "../world/DriveView";
import { ramp } from "../lib/anim";

/**
 * Gancho: el primer fotograma ya es la portada (texto + barrera visibles, con movimiento).
 * Enseña QUÉ buscar (la barrera) sin revelar CUÁNDO aparecerá.
 */
export const Hook: React.FC = () => {
  const f = useCurrentFrame();
  // empuje lento de cámara hacia la barrera (de 31 m a 21 m)
  const s = interpolate(f, [0, HOOK_DURATION], [0, 10]);
  const rule = ramp(f, 40, 52);
  return (
    <AbsoluteFill>
      <DriveView
        s={s}
        travelPerFrame={10 / HOOK_DURATION}
        shakeT={f / FPS}
        shakeAmp={0.0016}
        barrierS={31}
      />
      <AbsoluteFill
        style={{
          background:
            "linear-gradient(180deg, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0) 30%, rgba(0,0,0,0) 62%, rgba(0,0,0,0.5) 100%)",
        }}
      />
      <AbsoluteFill style={{ alignItems: "center", top: 262 }}>
        <div
          style={{
            fontFamily: FONT_UI,
            fontWeight: 700,
            fontSize: 34,
            letterSpacing: 9,
            color: COLORS.accent,
            marginBottom: 14,
          }}
        >
          {TEXT.hookKicker}
        </div>
        <div
          style={{
            fontFamily: FONT_DISPLAY,
            fontWeight: 800,
            fontSize: 150,
            lineHeight: 0.95,
            color: COLORS.white,
            letterSpacing: 1,
            textShadow: "0 8px 40px rgba(0,0,0,0.7)",
            scale: String(interpolate(ramp(f, 0, 14), [0, 1], [1.04, 1])),
          }}
        >
          {TEXT.hookTop}
        </div>
        <div
          style={{
            marginTop: 18,
            fontFamily: FONT_UI,
            fontWeight: 600,
            fontSize: 50,
            color: COLORS.white,
            opacity: 0.9,
            textShadow: "0 2px 16px rgba(0,0,0,0.8)",
          }}
        >
          {TEXT.hookBottom}
        </div>
      </AbsoluteFill>

      <AbsoluteFill style={{ alignItems: "center", top: 1150, opacity: rule }}>
        <div
          style={{
            fontFamily: FONT_UI,
            fontWeight: 600,
            fontSize: 40,
            letterSpacing: 2,
            color: COLORS.dim,
            translate: `0px ${interpolate(rule, [0, 1], [14, 0])}px`,
          }}
        >
          {TEXT.hookRule}
        </div>
        <div style={{ display: "flex", gap: 22, marginTop: 26 }}>
          {ROUNDS.map((r, i) => {
            const p = ramp(f, 46 + i * 6, 58 + i * 6);
            return (
              <div
                key={r.id}
                style={{
                  padding: "14px 28px",
                  borderRadius: 18,
                  border: "1.5px solid rgba(255,255,255,0.22)",
                  background: "rgba(6,9,15,0.55)",
                  fontFamily: FONT_DISPLAY,
                  fontWeight: 700,
                  fontSize: 62,
                  color: COLORS.white,
                  opacity: p,
                  translate: `0px ${interpolate(p, [0, 1], [18, 0])}px`,
                }}
              >
                {r.speedKmh}
                <span style={{ fontSize: 30, color: COLORS.dim, marginLeft: 6 }}>km/h</span>
              </div>
            );
          })}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
