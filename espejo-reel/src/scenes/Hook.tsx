import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { COLORS, FONT_DISPLAY, FONT_UI } from "../config";
import { wf } from "../timeline";
import { BACK, EASE_IN_OUT, noise1, ramp } from "../lib/anim";
import { Mirror } from "../components/Mirror";
import { NightPOV } from "../components/Backgrounds";
import { Ring } from "../components/Ui";

/** Posición del retrovisor en la vista del conductor. */
const M_W = 640;
const M_LEFT = 540 - M_W / 2;
const M_TOP = 300;
const K = M_W / 800;
export const HOOK_TAB = { x: 540, y: M_TOP + 312 * K };

/**
 * Gancho: vista del conductor, de noche, con un auto encandilando por el retrovisor.
 * "90 %" golpea en pantalla y la cámara se lanza contra la palanca en "ESTA palanca".
 */
export const Hook: React.FC = () => {
  const f = useCurrentFrame();
  const t = f / 30;

  const zoom = ramp(f, wf(17) - 1, wf(18) + 5, EASE_IN_OUT);
  const push = interpolate(f, [0, wf(17)], [1, 1.08], { extrapolateRight: "clamp" });
  // golpes de cámara en cada destello y en el "90%"
  const bump = (at: number, amp: number) => (f >= at ? amp * Math.exp(-(f - at) / 6) : 0);
  const kick = 1 + bump(wf(6), 0.04) + bump(wf(10), 0.045) + bump(wf(13) - 1, 0.05);
  const scale = push * kick * interpolate(zoom, [0, 1], [1, 3.5]);
  const ty = zoom * (760 - HOOK_TAB.y);
  const shakeAmp = 7 * (1 - zoom);
  const sx = noise1(t * 9, 1) * shakeAmp;
  const sy = noise1(t * 9, 7) * shakeAmp;
  const blur = Math.sin(zoom * Math.PI) * 5;

  // destellos de encandilamiento
  const pulse = (at: number, amp: number) => (f >= at ? amp * Math.exp(-(f - at) / 5) : 0);
  const flash = Math.min(0.75, pulse(wf(0) + 4, 0.35) + pulse(wf(6), 0.45) + pulse(wf(10), 0.5));

  const carScale = interpolate(f, [0, wf(17)], [0.95, 1.3], { extrapolateRight: "clamp" });

  // 90 %
  const p90 = ramp(f, wf(13) - 1, wf(13) + 7, BACK);
  const out90 = ramp(f, wf(17) - 4, wf(17) + 2);
  const sub90 = ramp(f, wf(14), wf(14) + 8);

  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      <AbsoluteFill
        style={{
          transformOrigin: `${HOOK_TAB.x}px ${HOOK_TAB.y}px`,
          transform: `translate(${sx}px, ${sy + ty}px) scale(${scale})`,
          filter: blur > 0.3 ? `blur(${blur}px)` : undefined,
        }}
      >
        <NightPOV t={t} />
        <div style={{ position: "absolute", left: M_LEFT, top: M_TOP }}>
          <Mirror id="hook" width={M_W} level={1} t={t} carScale={carScale} stem={210} />
        </div>
      </AbsoluteFill>

      {/* velo de deslumbramiento */}
      <AbsoluteFill style={{ background: "#fff8ea", opacity: flash, mixBlendMode: "screen" }} />

      {/* 90 % */}
      {p90 > 0 && out90 < 1 ? (
        <AbsoluteFill style={{ alignItems: "center", top: 640, opacity: 1 - out90 }}>
          <div
            style={{
              fontFamily: FONT_DISPLAY,
              fontWeight: 800,
              fontSize: 330,
              lineHeight: 0.85,
              color: COLORS.red,
              scale: String(interpolate(p90, [0, 1], [2.2, 1])),
              opacity: Math.min(1, p90 * 2),
              textShadow: "0 0 60px rgba(255,59,59,0.6), 0 10px 0 rgba(0,0,0,0.75)",
              letterSpacing: -4,
            }}
          >
            90%
          </div>
          <div
            style={{
              marginTop: 8,
              fontFamily: FONT_UI,
              fontWeight: 700,
              fontSize: 40,
              letterSpacing: 8,
              color: COLORS.white,
              opacity: sub90,
              translate: `0 ${interpolate(sub90, [0, 1], [14, 0])}px`,
              textShadow: "0 4px 20px rgba(0,0,0,0.9)",
            }}
          >
            DE LOS CONDUCTORES
          </div>
        </AbsoluteFill>
      ) : null}

      <Ring at={wf(18)} x={540} y={760} r={150} width={12} />
    </AbsoluteFill>
  );
};
