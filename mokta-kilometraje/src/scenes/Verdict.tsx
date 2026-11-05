import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { COLORS, FONT_DISPLAY, FONT_UI, mk } from "../config";
import { At, SceneShell } from "../components/SceneShell";
import { WearMeter } from "../components/WearMeter";
import { EASE_OUT, ramp } from "../lib/anim";

/** Veredicto: más km no siempre es más desgaste. */
export const Verdict: React.FC = () => {
  const f = useCurrentFrame();
  const mM = mk("verMenos", "veredicto");
  const a = interpolate(f, [2, 22], [0, 0.95], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: EASE_OUT });
  const b = interpolate(f, [8, 28], [0, 0.26], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: EASE_OUT });
  return (
    <SceneShell tint="yellow" glow={0.2} flash={[0]} shakes={[{ at: mM, amp: 10 }]}>
      <At top={250}>
        <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 800, fontSize: 132, lineHeight: 0.95, color: COLORS.white, textAlign: "center" }}>
          MÁS KM <span style={{ color: COLORS.yellow }}>≠</span>
          <br />
          MÁS DESGASTE
        </div>
      </At>
      <At top={600} style={{ opacity: ramp(f, 0, 6) }}>
        <WearMeter value={a} title="AUTO A · CIUDAD" subtitle="80.000 km" blink={f / 4} />
      </At>
      <At top={850} style={{ opacity: ramp(f, 6, 12) }}>
        <WearMeter value={b} title="AUTO B · CARRETERA" subtitle="200.000 km" />
      </At>
      <At top={1080}>
        <div style={{ fontFamily: FONT_UI, fontWeight: 500, fontSize: 24, color: COLORS.faint }}>Escala ilustrativa</div>
      </At>
    </SceneShell>
  );
};
