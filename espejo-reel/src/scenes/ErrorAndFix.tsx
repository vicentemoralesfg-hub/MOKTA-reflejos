import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { COLORS, FONT_DISPLAY } from "../config";
import { wf, we } from "../timeline";
import { BACK, EASE_IN_OUT, EASE_OUT, noise1, ramp } from "../lib/anim";
import { Mirror } from "../components/Mirror";
import { StudioBG } from "../components/Backgrounds";
import { Pill, Stamp } from "../components/Ui";

const W = 900;
const K = W / 800;
const LEFT = 540 - W / 2;
const TOP = 500;
const TAB = { x: 540, y: TOP + 312 * K };

/** "Cuando te encandilan, la mayoría mueve el espejo entero… y se queda sin ver atrás." */
export const ErrorScene: React.FC<{ from: number }> = ({ from }) => {
  const f = useCurrentFrame() + from;
  const t = f / 30;
  const turn = ramp(f, wf(40) - 2, wf(40) + 12, EASE_OUT);
  const yaw = 42 * turn;
  const viewShift = -620 * turn;
  const glow = Math.max(0, 1 - turn * 1.6);
  const fail = ramp(f, wf(44), wf(44) + 6);
  const shake = fail > 0 && fail < 1 ? 10 * (1 - fail) : 0;
  return (
    <AbsoluteFill>
      <StudioBG tint="#140c14" />
      <AbsoluteFill style={{ translate: `${noise1(t * 30, 3) * shake}px ${noise1(t * 30, 9) * shake}px` }}>
        <div style={{ position: "absolute", left: LEFT, top: TOP }}>
          <Mirror id="err" width={W} level={1} glow={glow} t={t} yaw={yaw} viewShift={viewShift} carScale={1.25} stem={180} />
        </div>
        {/* flechas de giro */}
        {turn > 0 && turn < 1 ? (
          <svg width={1080} height={1920} style={{ position: "absolute", inset: 0, opacity: Math.sin(turn * Math.PI) }}>
            <path d="M 820,430 Q 980,600 860,860" fill="none" stroke={COLORS.white} strokeWidth={10} strokeLinecap="round" />
            <path d="M 830,880 L 860,860 L 880,900" fill="none" stroke={COLORS.white} strokeWidth={10} strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        ) : null}
        <AbsoluteFill style={{ background: "rgba(255,40,40,0.18)", opacity: fail, mixBlendMode: "multiply" }} />
      </AbsoluteFill>
      <Pill at={wf(38) - 2} x={540} y={330} color={COLORS.red} text="LO QUE HACE LA MAYORÍA" size={48} textColor="#fff" />
      <Stamp at={wf(44)} x={540} y={TOP + 150 * K} kind="x" size={250} />
      <Pill at={wf(47)} x={540} y={1060} color="rgba(10,10,14,0.85)" text="SIN VISIÓN TRASERA" size={50} textColor={COLORS.red} />
    </AbsoluteFill>
  );
};

/**
 * "Lo correcto: tira la palanca hacia ti. ¡Y listo! Adiós encandilamiento…
 *  y sigues viendo al auto de atrás."
 */
export const FixScene: React.FC<{ from: number }> = ({ from }) => {
  const f = useCurrentFrame() + from;
  const t = f / 30;
  const back = ramp(f, from, from + 7, EASE_OUT);
  const yaw = 42 * (1 - back);
  const viewShift = -620 * (1 - back);

  const click = we(56) - 2; // fotograma del "clic"
  const tab = ramp(f, click, click + 3, EASE_OUT);
  const pitch = 5 * ramp(f, click, click + 6, BACK);
  const level = interpolate(f, [click, click + 9], [1, 0.05], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const flash = f >= click ? 0.5 * Math.exp(-(f - click) / 3) : 0;

  const push = ramp(f, wf(52) - 2, wf(52) + 10, EASE_IN_OUT) * (1 - ramp(f, click + 2, click + 16, EASE_IN_OUT));
  const camS = 1 + 0.45 * push;
  const camY = -push * (TAB.y - 820);

  // comparación ANTES / DESPUÉS
  const cmp = ramp(f, wf(59) - 3, wf(59) + 9, EASE_IN_OUT);
  const W2 = interpolate(cmp, [0, 1], [W, 800]);
  const top2 = interpolate(cmp, [0, 1], [TOP, 880]);
  const left2 = 540 - W2 / 2;
  const box = ramp(f, wf(62), wf(62) + 8, BACK);

  // flechas "hacia ti" (chevrones que vienen hacia la cámara)
  const arrowsOn = ramp(f, wf(52), wf(52) + 4) * (1 - ramp(f, click, click + 3));

  return (
    <AbsoluteFill>
      <StudioBG tint="#0a1a14" />
      <AbsoluteFill style={{ transformOrigin: `${TAB.x}px ${TAB.y}px`, transform: `translateY(${camY}px) scale(${camS})` }}>
        {/* ANTES (aparece arriba en la comparación) */}
        {cmp > 0 ? (
          <div style={{ position: "absolute", left: 140, top: interpolate(cmp, [0, 1], [-400, 330]), opacity: cmp }}>
            <Mirror id="before" width={800} level={1} glow={0.8} t={t} carScale={1.25} />
          </div>
        ) : null}
        <div style={{ position: "absolute", left: left2, top: top2 }}>
          <Mirror
            id="fix"
            width={W2}
            level={level}
            t={t}
            yaw={yaw}
            viewShift={viewShift}
            tab={tab}
            pitch={pitch * (1 - cmp)}
            carScale={1.25}
            stem={cmp > 0 ? 0 : 180}
          />
        </div>
        {arrowsOn > 0 ? (
          <svg width={1080} height={1920} style={{ position: "absolute", inset: 0, opacity: arrowsOn }}>
            {[0, 1, 2].map((i) => {
              const ph = ((f - wf(52)) / 14 + i / 3) % 1;
              const s = 0.5 + ph * 1.1;
              const y = TAB.y + 70 + ph * 130;
              return (
                <path
                  key={i}
                  d={`M ${540 - 70 * s},${y - 30 * s} L 540,${y + 20 * s} L ${540 + 70 * s},${y - 30 * s}`}
                  fill="none"
                  stroke={COLORS.yellow}
                  strokeWidth={16 * s}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  opacity={Math.sin(ph * Math.PI)}
                />
              );
            })}
          </svg>
        ) : null}
      </AbsoluteFill>
      <AbsoluteFill style={{ background: "#fff", opacity: flash }} />
      <Pill at={wf(51) - 4} out={wf(59) - 4} x={540} y={330} color={COLORS.green} text="LO CORRECTO" size={52} />
      <Pill at={wf(52) + 2} out={click} x={540} y={1110} color={COLORS.yellow} text="TIRA HACIA TI" size={50} />
      <Stamp at={wf(58) - 1} out={wf(59) - 4} x={880} y={TOP + 20} kind="check" size={170} />
      {cmp > 0 ? (
        <>
          <Pill at={wf(59) + 2} x={250} y={300} color={COLORS.red} text="ANTES" size={42} textColor="#fff" />
          <Pill at={wf(59) + 6} x={270} y={850} color={COLORS.green} text="DESPUÉS" size={42} />
        </>
      ) : null}
      {box > 0 ? (
        <>
          <div
            style={{
              position: "absolute",
              left: 540 - 170,
              top: 880 + 150 - 78,
              width: 340,
              height: 130,
              border: `5px solid ${COLORS.green}`,
              borderRadius: 18,
              opacity: box,
              scale: String(interpolate(box, [0, 1], [1.3, 1])),
              boxShadow: `0 0 30px ${COLORS.green}88`,
            }}
          />
          <div
            style={{
              position: "absolute",
              left: 540,
              top: 1220,
              translate: "-50% -50%",
              fontFamily: FONT_DISPLAY,
              fontWeight: 800,
              fontSize: 54,
              letterSpacing: 2,
              color: COLORS.green,
              opacity: box,
              textShadow: "0 4px 0 rgba(0,0,0,0.8)",
            }}
          >
            SIGUES VIENDO EL AUTO
          </div>
        </>
      ) : null}
    </AbsoluteFill>
  );
};
