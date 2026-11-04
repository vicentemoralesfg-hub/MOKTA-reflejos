import React from "react";
import { AbsoluteFill, interpolate } from "remotion";
import { COLORS, FONT_DISPLAY, FONT_UI } from "../config";
import { EASE_BACK, EASE_IN_OUT, EASE_OUT, pulse, ramp } from "../lib/anim";
import { T } from "../lib/timeline";
import { SideMirror } from "../components/SideMirror";
import { Backdrop, Pill, popIn } from "../components/Ui";

/** "La solución toma 10 segundos". */
export const FixCard: React.FC<{ t: number }> = ({ t }) => {
  const a = T.fix;
  const enter = interpolate(t, [a, a + 0.35], [1.25, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: EASE_OUT });
  const num = popIn(t, T.tenSec - 0.08, Infinity, 0.3);
  const sweep = ramp(t, T.tenSec, T.step1 + 0.2, EASE_IN_OUT);
  const R = 300;
  const C = 2 * Math.PI * R;
  return (
    <AbsoluteFill>
      <Backdrop t={t} glow={COLORS.green} glowY={860} speed={0.6} />
      <AbsoluteFill style={{ transform: `scale(${enter})` }}>
        <div
          style={{
            position: "absolute",
            top: 330,
            left: 0,
            right: 0,
            textAlign: "center",
            fontFamily: FONT_DISPLAY,
            fontWeight: 800,
            fontSize: 96,
            letterSpacing: 4,
            color: COLORS.green,
            opacity: ramp(t, a, a + 0.2),
          }}
        >
          LA SOLUCIÓN
        </div>
        <svg width={1080} height={1920} style={{ position: "absolute", left: 0, top: 0 }}>
          <circle cx={540} cy={860} r={R} fill="none" stroke="rgba(43,227,138,0.15)" strokeWidth={26} />
          <circle
            cx={540}
            cy={860}
            r={R}
            fill="none"
            stroke={COLORS.green}
            strokeWidth={26}
            strokeLinecap="round"
            strokeDasharray={`${C * sweep} ${C}`}
            transform="rotate(-90 540 860)"
            opacity={num}
          />
        </svg>
        <div
          style={{
            position: "absolute",
            top: 860 - 230,
            left: 0,
            right: 0,
            textAlign: "center",
            transform: `scale(${0.4 + 0.6 * num})`,
            opacity: Math.min(1, num * 1.5),
          }}
        >
          <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 800, fontSize: 360, lineHeight: 1, color: COLORS.white }}>10</div>
          <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 800, fontSize: 80, letterSpacing: 6, color: COLORS.green, marginTop: -14 }}>SEGUNDOS</div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/** Llamado a la acción final. */
export const CtaCard: React.FC<{ t: number }> = ({ t }) => {
  const a = T.cta;
  const enter = interpolate(t, [a, a + 0.4], [1.15, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: EASE_OUT });
  const plane = interpolate(t, [a + 0.5, a + 1.3], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: EASE_BACK });
  const outro = ramp(t, T.end + 0.05, T.end + 0.4);
  return (
    <AbsoluteFill>
      <Backdrop t={t} glow={COLORS.accent} glowY={820} speed={0.5} />
      <AbsoluteFill style={{ transform: `scale(${enter})` }}>
        <div
          style={{
            position: "absolute",
            top: 210,
            left: 0,
            right: 0,
            textAlign: "center",
            fontFamily: FONT_DISPLAY,
            fontWeight: 800,
            fontSize: 70,
            letterSpacing: 18,
            color: COLORS.white,
            opacity: 0.92,
          }}
        >
          MOKTA
        </div>
        <div style={{ position: "absolute", left: 140, top: 520, transform: `rotate(-3deg) scale(${1 + 0.02 * pulse(t, 1.2)})` }}>
          <SideMirror t={t} pan={0} width={800} bodyAlert={1} tilt={-4} />
        </div>
        <Pill t={t} from={a + 0.15} x={540} y={420} color={COLORS.red} text="¿CONOCES A ALGUIEN ASÍ?" size={58} />
        <div
          style={{
            position: "absolute",
            left: 540,
            top: 1150,
            transform: `translate(-50%, -50%) scale(${0.5 + 0.5 * plane})`,
            opacity: Math.min(1, plane * 1.5),
            display: "flex",
            alignItems: "center",
            gap: 22,
            padding: "22px 46px",
            borderRadius: 60,
            background: COLORS.accent,
            color: COLORS.ink,
            fontFamily: FONT_DISPLAY,
            fontWeight: 800,
            fontSize: 70,
            boxShadow: `0 0 50px ${COLORS.accent}88`,
          }}
        >
          <svg width={70} height={70} viewBox="0 0 24 24" style={{ translate: `${(1 - plane) * -30}px 0px` }}>
            <path d="M2.5 11.2 L21 3 L14.6 21 L11.3 13.2 Z" fill={COLORS.ink} />
            <path d="M11.3 13.2 L21 3" stroke={COLORS.accent} strokeWidth={1.6} />
          </svg>
          ENVÍASELO
        </div>
      </AbsoluteFill>
      {outro > 0 ? (
        <div
          style={{
            position: "absolute",
            top: 1360,
            left: 60,
            right: 60,
            textAlign: "center",
            opacity: outro,
            translate: `0px ${(1 - outro) * 20}px`,
          }}
        >
          <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 800, fontSize: 84, color: COLORS.white, lineHeight: 1 }}>GUÁRDALO</div>
          <div style={{ fontFamily: FONT_UI, fontWeight: 600, fontSize: 40, color: COLORS.dim, marginTop: 14 }}>y ajusta tus espejos en el próximo viaje</div>
        </div>
      ) : null}
    </AbsoluteFill>
  );
};
