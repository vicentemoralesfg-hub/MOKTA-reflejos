import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { COLORS, FONT_DISPLAY, FONT_UI, mk } from "../config";
import { At, SceneShell } from "../components/SceneShell";
import { Odometer } from "../components/Odometer";
import { Stamp } from "../components/Stamp";
import { IconCheck, IconX } from "../components/Icons";
import { EASE_IN_OUT, EASE_OUT, pop, ramp } from "../lib/anim";

/**
 * GANCHO. El primer fotograma ya plantea la pregunta: "¿MENOS KM = MEJOR AUTO?" con el odómetro girando.
 * Aparece la trampa ("POCOS KM ✓") y en "error" cae el timbre: ERROR FINANCIERO.
 */
export const Hook: React.FC = () => {
  const f = useCurrentFrame();
  const err = mk("hookError", "gancho");
  const roll = interpolate(f, [0, 26], [0, 80000], { extrapolateRight: "clamp", easing: EASE_OUT });
  const speed = f < 26 ? (80000 / 26) * 3 * (1 - f / 26) ** 2 : 0;
  const bad = f >= err;
  const trap = pop(f, 30, 10);
  const flip = ramp(f, err, err + 6, EASE_IN_OUT);
  const titleIn = interpolate(f, [0, 8], [1.08, 1], { extrapolateRight: "clamp", easing: EASE_OUT });
  return (
    <SceneShell tint={bad ? "red" : "neutral"} glow={bad ? 0.42 : 0.24} shakes={[{ at: err, amp: 26 }]} flash={[err]} enter="none">
      <At top={290}>
        <div style={{ fontFamily: FONT_UI, fontWeight: 700, fontSize: 34, letterSpacing: 8, color: COLORS.accent }}>
          ANTES DE COMPRAR UN AUTO
        </div>
        <div
          style={{
            marginTop: 18,
            fontFamily: FONT_DISPLAY,
            fontWeight: 800,
            fontSize: 152,
            lineHeight: 0.9,
            color: COLORS.white,
            textAlign: "center",
            scale: String(titleIn),
            textShadow: "0 10px 40px rgba(0,0,0,0.7)",
          }}
        >
          ¿MENOS KM
          <br />
          <span style={{ color: bad ? COLORS.red : COLORS.yellow }}>= MEJOR AUTO?</span>
        </div>
      </At>

      <At top={735}>
        <div style={{ scale: String(interpolate(ramp(f, err, err + 8), [0, 1], [1, 0.94])) }}>
          <Odometer value={roll} size={1.12} speed={speed} tone={bad ? "red" : f > 26 ? "green" : "dark"} />
        </div>
      </At>

      <At top={1000}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 14,
            padding: "14px 30px 14px 18px",
            borderRadius: 60,
            background: bad ? "rgba(255,59,59,0.16)" : "rgba(43,227,138,0.14)",
            border: `3px solid ${bad ? COLORS.red : COLORS.green}`,
            opacity: trap,
            scale: String(interpolate(trap, [0, 1], [0.6, 1])),
            rotate: `${interpolate(flip, [0, 0.5, 1], [0, 90, 0])}deg`,
          }}
        >
          {bad ? <IconX size={64} color={COLORS.red} progress={ramp(f, err + 3, err + 10)} /> : <IconCheck size={64} color={COLORS.green} progress={ramp(f, 32, 42)} />}
          <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 800, fontSize: 64, color: bad ? COLORS.red : COLORS.green }}>
            {bad ? "TRAMPA" : "POCOS KM"}
          </div>
        </div>
      </At>

      <At top={770} style={{ pointerEvents: "none" }}>
        <Stamp f={f} at={err} text="ERROR FINANCIERO" size={112} />
      </At>
    </SceneShell>
  );
};
