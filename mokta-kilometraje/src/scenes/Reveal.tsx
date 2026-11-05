import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { COLORS, FONT_DISPLAY, FONT_UI, mk } from "../config";
import { At, SceneShell } from "../components/SceneShell";
import { CarSide } from "../components/Car";
import { Stamp } from "../components/Stamp";
import { WearMeter } from "../components/WearMeter";
import { EASE_IN_OUT, EASE_OUT, ramp } from "../lib/anim";

/** Giro: el escáner de rayos X recorre el AUTO A (80.000 km) y aparecen los puntos de desgaste. */
export const Reveal: React.FC = () => {
  const f = useCurrentFrame();
  const mMucho = mk("revMucho", "revelacion");
  const mG = mk("revGastado", "revelacion");
  const scan = interpolate(f, [4, 40], [0, 1.02], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: EASE_IN_OUT });
  const wear = interpolate(f, [24, mMucho, mG + 6], [0, 0.6, 0.93], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: EASE_OUT });
  return (
    <SceneShell tint="red" glow={0.3 + 0.2 * ramp(f, mMucho, mMucho + 4)} shakes={[{ at: mMucho, amp: 28 }]} flash={[0, mMucho]}>
      <At top={250}>
        <div style={{ fontFamily: FONT_UI, fontWeight: 700, fontSize: 34, letterSpacing: 8, color: COLORS.accent, opacity: ramp(f, 0, 8) }}>
          ESCÁNER DE DESGASTE
        </div>
        <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 800, fontSize: 96, color: COLORS.white, lineHeight: 1, marginTop: 10 }}>
          AUTO A · <span style={{ color: COLORS.yellow }}>80.000 km</span>
        </div>
      </At>
      <At top={440}>
        <div style={{ scale: String(interpolate(ramp(f, mMucho, mMucho + 10), [0, 1], [1, 1.04])) }}>
          <CarSide width={940} scan={scan} heat={ramp(f, 14, 40)} pulse={f / 3} />
        </div>
      </At>
      <At top={860}>
        <WearMeter value={wear} title="DESGASTE REAL" blink={f / 4} />
      </At>
      <At top={505}>
        <Stamp f={f} at={mMucho} text="MUCHO MÁS GASTADO" size={104} rotate={-6} />
      </At>
    </SceneShell>
  );
};
