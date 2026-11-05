import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { COLORS, FONT_DISPLAY, FONT_UI } from "../config";
import { wf } from "../timeline";
import { BACK, EASE_IN_OUT, ramp } from "../lib/anim";
import { Mirror } from "../components/Mirror";
import { StudioBG } from "../components/Backgrounds";
import { IconMoon, IconSun, Pill } from "../components/Ui";

/**
 * "No es un adorno. Y si tu espejo no la tiene, quédate hasta el final."
 * Macro de la palanca (con sus dos posiciones) → espejo sin palanca + promesa del final.
 */
export const TabIntro: React.FC<{ from: number }> = ({ from }) => {
  const f = useCurrentFrame() + from;
  const t = f / 30;
  const split = ramp(f, wf(24) - 4, wf(24) + 6, EASE_IN_OUT);

  // macro: palanca en el centro (540, 700)
  const W = 2000;
  const k = W / 800;
  const push = interpolate(f, [from, wf(24)], [1, 1.06]);
  // la palanca se mueve para mostrar que tiene dos posiciones
  const tab = ramp(f, wf(21), wf(21) + 5) * (1 - ramp(f, wf(23) + 2, wf(23) + 7));
  const callout = ramp(f, wf(20) + 2, wf(20) + 10, BACK);

  const promise = ramp(f, wf(31) - 2, wf(31) + 6, BACK);
  const bar = ramp(f, wf(31) + 2, wf(34) + 8, EASE_IN_OUT);

  return (
    <AbsoluteFill>
      <StudioBG />
      {/* macro de la palanca */}
      <AbsoluteFill
        style={{
          opacity: 1 - split,
          transformOrigin: "540px 700px",
          transform: `scale(${push * (1 + split * 0.4)}) translateX(${-split * 300}px)`,
        }}
      >
        <div style={{ position: "absolute", left: 540 - 400 * k, top: 700 - 312 * k }}>
          <Mirror id="tabmacro" width={W} level={1} glow={0.45} t={t} tab={tab} carScale={1.2} bloomOutside={false} />
        </div>
        {/* luz de la luneta sobre el borde */}
        <AbsoluteFill style={{ background: "radial-gradient(60% 30% at 50% 10%, rgba(255,240,210,0.25), rgba(0,0,0,0) 70%)" }} />
        {callout > 0 ? (
          <svg width={1080} height={1920} style={{ position: "absolute", inset: 0, opacity: callout }}>
            <path d="M 470,800 L 300,960" stroke={COLORS.yellow} strokeWidth={5} />
            <path d="M 610,800 L 780,960" stroke={COLORS.accent} strokeWidth={5} />
            <circle cx={540} cy={760} r={120} fill="none" stroke={COLORS.white} strokeOpacity={0.5} strokeWidth={4} strokeDasharray="10 10" />
          </svg>
        ) : null}
        {callout > 0 ? (
          <>
            <div style={{ position: "absolute", left: 270, top: 1010, translate: "-50% -50%", display: "flex", alignItems: "center", gap: 14, opacity: callout, scale: String(callout) }}>
              <IconSun size={70} />
              <span style={{ fontFamily: FONT_DISPLAY, fontWeight: 800, fontSize: 70, color: COLORS.yellow, textShadow: "0 4px 0 rgba(0,0,0,0.7)" }}>DÍA</span>
            </div>
            <div style={{ position: "absolute", left: 810, top: 1010, translate: "-50% -50%", display: "flex", alignItems: "center", gap: 14, opacity: callout, scale: String(callout) }}>
              <IconMoon size={62} />
              <span style={{ fontFamily: FONT_DISPLAY, fontWeight: 800, fontSize: 70, color: COLORS.accent, textShadow: "0 4px 0 rgba(0,0,0,0.7)" }}>NOCHE</span>
            </div>
          </>
        ) : null}
        <Pill at={wf(20) + 4} x={540} y={330} color={COLORS.white} text="NO ES UN ADORNO" size={52} />
      </AbsoluteFill>

      {/* espejo sin palanca */}
      {split > 0 ? (
        <AbsoluteFill style={{ opacity: split, transform: `translateX(${(1 - split) * 300}px)` }}>
          <div style={{ position: "absolute", left: 140, top: 520 }}>
            <Mirror id="nolever" width={800} level={0.55} glow={0.6} t={t} hasTab={false} sensor={1} stem={120} />
          </div>
          <div
            style={{
              position: "absolute",
              left: 540,
              top: 900,
              translate: "-50% -50%",
              fontFamily: FONT_DISPLAY,
              fontWeight: 800,
              fontSize: 120,
              color: COLORS.yellow,
              scale: String(interpolate(ramp(f, wf(28), wf(28) + 6, BACK), [0, 1], [0, 1])),
              textShadow: "0 6px 0 rgba(0,0,0,0.7)",
            }}
          >
            ?
          </div>
          <Pill at={wf(25)} x={540} y={360} color={COLORS.yellow} text="¿Y SI NO TIENE PALANCA?" size={50} />
          {promise > 0 ? (
            <div
              style={{
                position: "absolute",
                left: 540,
                top: 1090,
                translate: "-50% -50%",
                width: 700,
                opacity: Math.min(1, promise * 2),
                scale: String(interpolate(promise, [0, 1], [0.8, 1])),
                textAlign: "center",
              }}
            >
              <div style={{ fontFamily: FONT_UI, fontWeight: 700, fontSize: 34, letterSpacing: 6, color: COLORS.white, marginBottom: 16 }}>
                TE LO CUENTO AL FINAL
              </div>
              <div style={{ height: 14, borderRadius: 7, background: "rgba(255,255,255,0.18)", overflow: "hidden" }}>
                <div style={{ width: `${bar * 100}%`, height: "100%", background: COLORS.yellow, borderRadius: 7 }} />
              </div>
            </div>
          ) : null}
        </AbsoluteFill>
      ) : null}
    </AbsoluteFill>
  );
};
