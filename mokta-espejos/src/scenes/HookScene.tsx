import React from "react";
import { AbsoluteFill, interpolate } from "remotion";
import { COLORS, FONT_DISPLAY } from "../config";
import { EASE_BACK, EASE_OUT, kf, pulse, shake } from "../lib/anim";
import { T, VO_OFFSET, WORDS, at } from "../lib/timeline";
import { SideMirror } from "../components/SideMirror";
import { Backdrop } from "../components/Ui";

/**
 * Gancho: la frase completa se lee desde el fotograma 0.
 * "SI VES TU AUTO / EN ESTE ESPEJO" arriba, el espejo al centro y
 * "ESTÁS COMETIENDO / EL MISMO ERROR QUE EL / 95% DE LAS PERSONAS" abajo.
 * Mientras la voz avanza, cada palabra se marca (estilo karaoke) sin que el resto deje de leerse.
 */

type Tok = { text: string; color?: string; size?: number };

const LINES: Tok[][] = [
  [{ text: "SI" }, { text: "VES" }, { text: "TU", color: COLORS.red }, { text: "AUTO", color: COLORS.red }],
  [{ text: "EN" }, { text: "ESTE" }, { text: "ESPEJO" }],
  [{ text: "ESTÁS" }, { text: "COMETIENDO" }],
  [{ text: "EL" }, { text: "MISMO" }, { text: "ERROR", color: COLORS.red }, { text: "QUE" }, { text: "EL" }],
  [{ text: "95%", color: COLORS.yellow }, { text: "DE" }, { text: "LAS" }, { text: "PERSONAS" }],
];

/** Las primeras 18 palabras de la locución corresponden, en orden, a los tokens del gancho. */
const FLAT = LINES.flat();
const TIMES = FLAT.map((_, i) => ({ start: WORDS[i].start + VO_OFFSET, end: WORDS[i].end + VO_OFFSET }));

const MIRROR_W = 900;
const MIRROR_X = 90;
const MIRROR_Y = 470;

const Word: React.FC<{ tok: Tok; idx: number; t: number; size: number }> = ({ tok, idx, t, size }) => {
  const { start, end } = TIMES[idx];
  const active = t >= start - 0.03 && t < Math.max(end + 0.06, start + 0.22);
  const pop = interpolate(t, [start - 0.03, start + 0.12], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: EASE_BACK,
  });
  const base = tok.color ?? COLORS.white;
  const hl = tok.color ?? COLORS.yellow;
  return (
    <span
      style={{
        display: "inline-block",
        position: "relative",
        padding: "0 10px",
        margin: "0 2px",
        color: active ? COLORS.ink : base,
        scale: String(active ? 1 + 0.08 * pop : 1),
        zIndex: active ? 2 : 1,
      }}
    >
      {active ? (
        <span
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: size * 0.06,
            bottom: size * 0.02,
            background: hl,
            borderRadius: size * 0.14,
            zIndex: -1,
            boxShadow: `0 0 30px ${hl}88`,
          }}
        />
      ) : null}
      {tok.text}
    </span>
  );
};

const Line: React.FC<{ toks: Tok[]; offset: number; t: number; size: number; y: number }> = ({ toks, offset, t, size, y }) => (
  <div
    style={{
      position: "absolute",
      left: 30,
      right: 30,
      top: y,
      textAlign: "center",
      fontFamily: FONT_DISPLAY,
      fontWeight: 800,
      fontSize: size,
      lineHeight: 1,
      letterSpacing: 0.5,
      textShadow: "0 6px 0 rgba(0,0,0,0.55), 0 0 30px rgba(0,0,0,0.6)",
      whiteSpace: "nowrap",
    }}
  >
    {toks.map((tok, i) => (
      <Word key={i} tok={tok} idx={offset + i} t={t} size={tok.size ?? size} />
    ))}
  </div>
);

export const HookScene: React.FC<{ t: number }> = ({ t }) => {
  const errorAt = at("error");
  const sh = shake(t, errorAt, 0.45, 12);
  const sh2 = shake(t, T.pct, 0.45, 14);
  const zoom = interpolate(t, [0, T.danger], [1, 1.06], { extrapolateRight: "clamp" });
  const pctPunch = kf(
    t,
    [
      [T.pct - 0.04, 1],
      [T.pct + 0.04, 1.3],
      [T.pct + 0.3, 1],
    ],
    EASE_OUT,
  );
  const offsets = LINES.map((_, i) => LINES.slice(0, i).reduce((a, l) => a + l.length, 0));

  return (
    <AbsoluteFill>
      <Backdrop t={t} glow={COLORS.red} glowY={770} />
      <AbsoluteFill style={{ transform: `translate(${sh.x + sh2.x}px, ${sh.y + sh2.y}px)` }}>
        <div
          style={{
            position: "absolute",
            left: MIRROR_X,
            top: MIRROR_Y,
            transformOrigin: "50% 50%",
            transform: `scale(${zoom})`,
          }}
        >
          <SideMirror t={t} pan={0} width={MIRROR_W} bodyAlert={0.75 + 0.25 * pulse(t, 0.7)} tilt={-4} />
        </div>

        <Line toks={LINES[0]} offset={offsets[0]} t={t} size={132} y={150} />
        <Line toks={LINES[1]} offset={offsets[1]} t={t} size={132} y={290} />
        <Line toks={LINES[2]} offset={offsets[2]} t={t} size={92} y={1100} />
        <Line toks={LINES[3]} offset={offsets[3]} t={t} size={92} y={1196} />
        <div
          style={{
            position: "absolute",
            left: 30,
            right: 30,
            top: 1296,
            display: "flex",
            justifyContent: "center",
            alignItems: "baseline",
            fontFamily: FONT_DISPLAY,
            fontWeight: 800,
            lineHeight: 1,
            textShadow: "0 6px 0 rgba(0,0,0,0.55), 0 0 30px rgba(0,0,0,0.6)",
            whiteSpace: "nowrap",
          }}
        >
          <span style={{ fontSize: 150, display: "inline-block", transformOrigin: "50% 70%", transform: `scale(${pctPunch})` }}>
            <Word tok={LINES[4][0]} idx={offsets[4]} t={t} size={150} />
          </span>
          <span style={{ fontSize: 86, marginLeft: 14 }}>
            {LINES[4].slice(1).map((tok, i) => (
              <Word key={i} tok={tok} idx={offsets[4] + 1 + i} t={t} size={86} />
            ))}
          </span>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
