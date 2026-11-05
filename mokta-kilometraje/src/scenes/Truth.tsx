import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { COLORS, FONT_DISPLAY, FONT_UI, mk } from "../config";
import { At, SceneShell } from "../components/SceneShell";
import { Odometer } from "../components/Odometer";
import { EASE_OUT, ramp } from "../lib/anim";

const Line: React.FC<{ f: number; at: number; children: React.ReactNode; size?: number; color?: string }> = ({ f, at, children, size = 150, color = COLORS.white }) => {
  const p = ramp(f, at - 2, at + 7, EASE_OUT);
  return (
    <div
      style={{
        fontFamily: FONT_DISPLAY,
        fontWeight: 800,
        fontSize: size,
        lineHeight: 0.98,
        color,
        opacity: p,
        translate: `0px ${interpolate(p, [0, 1], [50, 0])}px`,
        textShadow: color !== COLORS.white ? `0 0 50px ${color}55` : "0 10px 40px rgba(0,0,0,0.6)",
        textAlign: "center",
      }}
    >
      {children}
    </div>
  );
};

/** El kilometraje dice cuánto anduvo un auto… no cómo lo trataron. */
export const Truth: React.FC = () => {
  const f = useCurrentFrame();
  const mKm = mk("verKm", "verdad");
  const mC = mk("verCuanto", "verdad");
  const mNo = mk("verNo", "verdad");
  return (
    <SceneShell tint="yellow" glow={0.18} flash={[0]} shakes={[{ at: mNo, amp: 12 }]}>
      <At top={330} style={{ opacity: 0.5 + 0.5 * ramp(f, 0, 8) }}>
        <Odometer value={88888} size={0.78} scramble={f * 0.35} tone={f >= mNo ? "red" : "dark"} />
      </At>
      <At top={660}>
        <Line f={f} at={mKm} size={64} color={COLORS.dim}>
          EL KILOMETRAJE DICE
        </Line>
        <div style={{ height: 10 }} />
        <Line f={f} at={mC}>CUÁNTO ANDUVO</Line>
        <div style={{ height: 40 }} />
        <Line f={f} at={mNo} color={COLORS.yellow}>
          NO CÓMO
          <br />
          LO TRATARON
        </Line>
      </At>
      <At top={1250} style={{ opacity: ramp(f, mNo + 10, mNo + 20) }}>
        <div style={{ fontFamily: FONT_UI, fontWeight: 600, fontSize: 36, color: COLORS.dim }}>Compra el auto, no el número.</div>
      </At>
    </SceneShell>
  );
};
