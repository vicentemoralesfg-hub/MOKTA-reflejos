import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { COLORS, FONT_DISPLAY, FONT_UI, HOOK_DURATION, TEXT } from "../config";
import { Backdrop } from "../components/Backdrop";
import { SoundRing } from "../components/SoundRing";
import { EASE_OUT, ramp } from "../lib/anim";

/**
 * Gancho (5,5 s). El primer fotograma ya es la portada: pregunta + "SIN VERLOS?".
 * Locución (ElevenLabs), cama de motor sin identificar bajo la voz y, al final, 0,8 s del último motor.
 */
export const Hook: React.FC = () => {
  const f = useCurrentFrame();
  const LOCURA_AT = 88; // "El último es una locura" (scripts/clips.json → hook.voiceBAt)
  const TEASER_AT = 140; // adelanto del último motor
  const loc = ramp(f, LOCURA_AT, LOCURA_AT + 7, EASE_OUT);
  const out = ramp(f, HOOK_DURATION - 6, HOOK_DURATION);
  // golpes visuales sincronizados con las ráfagas (mismos fotogramas que build_audio.py)
  const hits = [0, LOCURA_AT, TEASER_AT];
  const lastHit = Math.max(...hits.filter((h) => h <= f));
  const kick = Math.max(0, 1 - (f - lastHit) / 8);

  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <Backdrop absFrame={f} tint={f >= LOCURA_AT ? "192,75,255" : "255,90,31"} />
      <AbsoluteFill style={{ opacity: 1 - out, scale: String(1 + kick * 0.025) }}>
        <div style={{ position: "absolute", top: 210, width: "100%", display: "flex", justifyContent: "center" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 14,
              fontFamily: FONT_UI,
              fontWeight: 800,
              fontSize: 30,
              letterSpacing: 6,
              color: "#06070A",
              background: COLORS.accent2,
              padding: "12px 26px",
              borderRadius: 999,
            }}
          >
            <svg width={34} height={30} viewBox="0 0 34 30">
              <path d="M2 10h7l9-8v26l-9-8H2z" fill="#06070A" />
              <path d="M23 8c3 2 3 12 0 14M27 4c6 4 6 18 0 22" stroke="#06070A" strokeWidth={3.2} fill="none" strokeLinecap="round" />
            </svg>
            {TEXT.hookChip}
          </div>
        </div>

        <div style={{ position: "absolute", top: 320, left: 60, right: 60, textAlign: "center" }}>
          <div style={{ fontFamily: FONT_UI, fontWeight: 700, fontSize: 58, lineHeight: 1.12, color: COLORS.white }}>
            {TEXT.hookA}
          </div>
          <div
            style={{
              fontFamily: FONT_DISPLAY,
              fontWeight: 800,
              fontSize: 196,
              lineHeight: 1,
              marginTop: 6,
              color: COLORS.accent,
              textShadow: "0 0 50px rgba(255,90,31,0.55)",
              letterSpacing: 2,
            }}
          >
            {TEXT.hookB}
          </div>
        </div>

        <div style={{ position: "absolute", left: 270, top: 790 }}>
          <SoundRing absFrame={f} size={540} color={f >= LOCURA_AT ? "#C04BFF" : COLORS.accent}>
            <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 800, fontSize: 200, color: COLORS.white, lineHeight: 0.9 }}>?</div>
          </SoundRing>
        </div>

        <div
          style={{
            position: "absolute",
            top: 1372,
            width: "100%",
            textAlign: "center",
            opacity: loc,
            scale: String(interpolate(loc, [0, 1], [1.35, 1])),
          }}
        >
          <div
            style={{
              display: "inline-block",
              fontFamily: FONT_DISPLAY,
              fontWeight: 800,
              fontSize: 92,
              letterSpacing: 2,
              color: COLORS.white,
              background: "#C04BFF",
              padding: "6px 34px",
              borderRadius: 18,
              rotate: "-2deg",
              boxShadow: "0 0 60px rgba(192,75,255,0.6)",
            }}
          >
            {TEXT.hookC}
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
