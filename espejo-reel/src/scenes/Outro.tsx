import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { COLORS, FONT_DISPLAY, FONT_UI } from "../config";
import { wf, we } from "../timeline";
import { BACK, EASE_IN_OUT, EASE_OUT, mix, ramp } from "../lib/anim";
import { Mirror } from "../components/Mirror";
import { DayBG, StudioBG } from "../components/Backgrounds";
import { IconBookmark, IconMoon, IconShare, IconSun, IconWarn, Pill, Stamp } from "../components/Ui";

const W = 900;
const K = W / 800;
const LEFT = 540 - W / 2;
const TOP = 520;

/** "¿Tu espejo no tiene palanca? Es electrocrómico: se oscurece solo." */
export const EcScene: React.FC<{ from: number }> = ({ from }) => {
  const f = useCurrentFrame() + from;
  const t = f / 30;
  const dim = ramp(f, wf(122), wf(124) + 4, EASE_IN_OUT);
  const sensorPulse = ramp(f, wf(120), wf(120) + 6);
  const sx = 540;
  const sy = TOP + 266 * K;
  const ph = ((f - wf(120)) % 20) / 20;
  return (
    <AbsoluteFill>
      <StudioBG tint="#081a22" />
      <div style={{ position: "absolute", left: LEFT, top: TOP }}>
        <Mirror id="ec" width={W} level={mix(1, 0.08, dim)} ecDim={dim} t={t} hasTab={false} sensor={1} led={ramp(f, wf(123), wf(123) + 4)} carScale={1.25} stem={180} />
      </div>
      {sensorPulse > 0 && dim < 1 ? (
        <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
          <circle cx={sx} cy={sy} r={20 + ph * 70} fill="none" stroke={COLORS.accent} strokeWidth={5} opacity={(1 - ph) * sensorPulse} />
          <circle cx={sx} cy={sy} r={26} fill="none" stroke={COLORS.accent} strokeWidth={5} opacity={sensorPulse} />
        </svg>
      ) : null}
      <Pill at={wf(115) - 1} x={540} y={350} color={COLORS.yellow} text="¿SIN PALANCA?" size={54} />
      <Pill at={wf(121) - 2} x={540} y={1010} color={COLORS.accent} text="ELECTROCRÓMICO" size={56} />
      <Pill at={wf(123) + 2} x={540} y={1120} color="rgba(10,14,20,0.9)" text="SE OSCURECE SOLO" size={44} textColor={COLORS.green} />
    </AbsoluteFill>
  );
};

/** "Y ojo: de día, vuelve a dejarla como estaba." */
export const DayScene: React.FC<{ from: number }> = ({ from }) => {
  const f = useCurrentFrame() + from;
  const t = f / 30;
  const push = we(131) - 2; // clic de vuelta a DÍA
  const tab = 1 - ramp(f, push, push + 3, EASE_OUT);
  const level = interpolate(f, [push, push + 8], [0.05, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const pitch = 5 * (1 - ramp(f, push, push + 6, BACK));
  const sun = ramp(f, wf(127) - 2, wf(127) + 8, BACK);
  const arrow = ramp(f, wf(129) - 2, wf(129) + 4) * (1 - ramp(f, push, push + 4));
  const tabY = TOP + 330 * K;
  return (
    <AbsoluteFill>
      <DayBG sun={sun} />
      <div style={{ position: "absolute", left: 830, top: 190, translate: "-50% -50%", scale: String(sun), opacity: sun }}>
        <IconSun size={150} />
      </div>
      <div style={{ position: "absolute", left: LEFT, top: TOP }}>
        <Mirror id="day" width={W} scene="day" level={level} tab={tab} pitch={pitch} t={t} carScale={1.2} stem={180} />
      </div>
      {arrow > 0 ? (
        <svg width={1080} height={1920} style={{ position: "absolute", inset: 0, opacity: arrow }}>
          {[0, 1, 2].map((i) => {
            const ph = ((f - wf(129)) / 14 + i / 3) % 1;
            const s = 1.4 - ph * 0.9;
            const y = tabY + 150 - ph * 110;
            return (
              <path
                key={i}
                d={`M ${540 - 60 * s},${y + 26 * s} L 540,${y - 18 * s} L ${540 + 60 * s},${y + 26 * s}`}
                fill="none"
                stroke="#05070B"
                strokeWidth={14 * s}
                strokeLinecap="round"
                strokeLinejoin="round"
                opacity={Math.sin(ph * Math.PI)}
              />
            );
          })}
        </svg>
      ) : null}
      <Pill at={wf(125) - 1} x={540} y={350} color={COLORS.yellow} text="Y OJO" icon={<IconWarn size={46} />} size={56} />
      <Pill at={wf(129)} out={push} x={540} y={1110} color="#05070B" text="DE VUELTA A DÍA" size={46} textColor={COLORS.yellow} />
      <Stamp at={push + 4} x={880} y={TOP + 10} kind="check" size={160} />
      <Pill at={push + 6} x={540} y={1110} color={COLORS.green} text="VUELVE A VERSE NÍTIDO" size={46} />
    </AbsoluteFill>
  );
};

/** "Guárdalo y compártelo con alguien que maneje de noche." */
export const Cta: React.FC<{ from: number }> = ({ from }) => {
  const f = useCurrentFrame() + from;
  const t = f / 30;
  const save = ramp(f, wf(134) - 2, wf(134) + 6, BACK);
  const fill = ramp(f, wf(134) + 4, wf(134) + 10);
  const share = ramp(f, wf(136) - 2, wf(136) + 6, BACK);
  const who = ramp(f, wf(137) - 2, wf(137) + 8, EASE_OUT);
  const brand = ramp(f, we(142) - 6, we(142) + 6, EASE_OUT);
  const fly = ramp(f, wf(136) + 4, wf(136) + 16, EASE_IN_OUT);
  const row: React.CSSProperties = {
    position: "absolute",
    left: 0,
    right: 0,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    gap: 34,
  };
  const big: React.CSSProperties = {
    fontFamily: FONT_DISPLAY,
    fontWeight: 800,
    fontSize: 150,
    lineHeight: 1,
    letterSpacing: 2,
    textShadow: "0 8px 0 rgba(0,0,0,0.6)",
  };
  return (
    <AbsoluteFill>
      <StudioBG />
      {/* espejo tranquilo de fondo (modo noche) */}
      <div style={{ position: "absolute", left: 140, top: 1430, opacity: 0.35 }}>
        <Mirror id="cta" width={800} level={0.05} t={t} tab={1} carScale={1.2} bloomOutside={false} />
      </div>
      <div style={{ ...row, top: 430, opacity: Math.min(1, save * 2), scale: String(interpolate(save, [0, 1], [0.6, 1])) }}>
        <IconBookmark size={150} color={COLORS.yellow} fill={fill} />
        <span style={{ ...big, color: COLORS.white }}>GUÁRDALO</span>
      </div>
      <div style={{ ...row, top: 690, opacity: Math.min(1, share * 2), scale: String(interpolate(share, [0, 1], [0.6, 1])) }}>
        <div style={{ translate: `${fly * 30}px ${-fly * 30}px` }}>
          <IconShare size={140} color={COLORS.accent} />
        </div>
        <span style={{ ...big, color: COLORS.white }}>COMPÁRTELO</span>
      </div>
      <div
        style={{
          ...row,
          top: 960,
          opacity: who,
          translate: `0 ${interpolate(who, [0, 1], [24, 0])}px`,
          fontFamily: FONT_UI,
          fontWeight: 700,
          fontSize: 50,
          color: COLORS.white,
          gap: 18,
        }}
      >
        con alguien que maneje de noche
        <IconMoon size={52} />
      </div>
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 1180,
          textAlign: "center",
          opacity: brand,
          scale: String(interpolate(brand, [0, 1], [0.9, 1])),
        }}
      >
        <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 800, fontSize: 96, letterSpacing: 18, color: COLORS.white }}>MOKTA</div>
        <div style={{ width: 220, height: 6, margin: "10px auto 0", background: COLORS.yellow, borderRadius: 3 }} />
      </div>
    </AbsoluteFill>
  );
};
