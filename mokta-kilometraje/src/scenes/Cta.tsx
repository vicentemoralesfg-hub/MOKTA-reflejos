import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { COLORS, FONT_DISPLAY, FONT_UI, mk } from "../config";
import { At, SceneShell } from "../components/SceneShell";
import { IconBookmark } from "../components/Icons";
import { EASE_OUT, pop, ramp } from "../lib/anim";

/** Guarda este video para tu próxima compra. */
export const Cta: React.FC = () => {
  const f = useCurrentFrame();
  const mG = mk("ctaGuarda", "cta");
  const tapAt = mG + 16;
  const tap = ramp(f, tapAt, tapAt + 14);
  const fill = ramp(f, tapAt, tapAt + 8, EASE_OUT);
  return (
    <SceneShell tint="yellow" glow={0.26}>
      <At top={330}>
        <div style={{ position: "relative", width: 300, height: 300, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div
            style={{
              position: "absolute",
              inset: 0,
              borderRadius: 150,
              border: `6px solid ${COLORS.yellow}`,
              scale: String(1 + tap * 0.9),
              opacity: f >= tapAt ? 1 - tap : 0,
            }}
          />
          <div style={{ scale: String(interpolate(pop(f, 0, 10), [0, 1], [0.4, 1]) * (1 + 0.12 * Math.sin(Math.PI * tap))) }}>
            <IconBookmark size={250} color={COLORS.yellow} fill={fill} />
          </div>
        </div>
      </At>
      <At top={700}>
        <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 800, fontSize: 140, lineHeight: 0.95, color: COLORS.white, textAlign: "center", opacity: ramp(f, mG - 2, mG + 6) }}>
          GUARDA
          <br />
          ESTE VIDEO
        </div>
        <div style={{ marginTop: 22, fontFamily: FONT_UI, fontWeight: 600, fontSize: 46, color: COLORS.yellow, opacity: ramp(f, mG + 14, mG + 22) }}>
          para tu próxima compra
        </div>
        <div style={{ marginTop: 34, fontFamily: FONT_UI, fontWeight: 500, fontSize: 36, color: COLORS.dim, opacity: ramp(f, mG + 30, mG + 40), textAlign: "center" }}>
          y mándaselo a quien esté buscando auto
        </div>
      </At>
      <At top={1300} style={{ opacity: ramp(f, mG + 40, mG + 52) }}>
        <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 800, fontSize: 84, letterSpacing: 18, color: COLORS.white }}>MOKTA</div>
      </At>
    </SceneShell>
  );
};
