import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { COLORS, FONT_DISPLAY, FONT_UI, mk } from "../config";
import { At, SceneShell } from "../components/SceneShell";
import { IconCheck, IconClock, IconEngine, IconX } from "../components/Icons";
import { Odometer } from "../components/Odometer";
import { EASE_OUT, pop, ramp } from "../lib/anim";

const Panel: React.FC<{ children: React.ReactNode; style?: React.CSSProperties }> = ({ children, style }) => (
  <div
    style={{
      width: 450,
      height: 720,
      borderRadius: 34,
      background: COLORS.panel,
      border: `2px solid ${COLORS.panelBorder}`,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      padding: "34px 20px",
      boxSizing: "border-box",
      position: "relative",
      overflow: "hidden",
      ...style,
    }}
  >
    {children}
  </div>
);

const Title: React.FC<{ children: React.ReactNode; color?: string }> = ({ children, color = COLORS.white }) => (
  <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 800, fontSize: 62, color, lineHeight: 1, textAlign: "center" }}>{children}</div>
);

/** El odómetro cuenta vueltas de rueda, no horas de motor. */
export const OdometerHours: React.FC = () => {
  const f = useCurrentFrame();
  const mV = mk("odoVueltas", "odometro");
  const mNo = mk("odoNo", "odometro");
  const inL = ramp(f, 0, 12, EASE_OUT);
  const inR = ramp(f, 5, 17, EASE_OUT);
  const wheelRot = f * 14;
  const noX = ramp(f, mNo + 2, mNo + 12);
  const vib = Math.sin(f * 2.3) * 3;
  return (
    <SceneShell tint="neutral" glow={0.2}>
      <At top={250}>
        <div style={{ display: "flex", gap: 30 }}>
          <Panel style={{ translate: `${interpolate(inL, [0, 1], [-600, 0])}px 0px` }}>
            <div style={{ fontFamily: FONT_UI, fontWeight: 700, fontSize: 28, letterSpacing: 5, color: COLORS.accent }}>CUENTA</div>
            <Title>VUELTAS DE RUEDA</Title>
            <svg width={300} height={300} viewBox="0 0 100 100" style={{ marginTop: 36 }}>
              <circle cx={50} cy={50} r={46} fill="#0d0f13" />
              <circle cx={50} cy={50} r={40} fill="none" stroke="#2a2f38" strokeWidth={4} />
              <circle cx={50} cy={50} r={28} fill="#aab3bd" />
              <g transform={`rotate(${wheelRot} 50 50)`}>
                {[0, 72, 144, 216, 288].map((a) => (
                  <rect key={a} x={47} y={24} width={6} height={18} rx={3} fill="#5b636e" transform={`rotate(${a} 50 50)`} />
                ))}
              </g>
              <circle cx={50} cy={50} r={7} fill="#3a4049" />
            </svg>
            <div style={{ marginTop: 34 }}>
              <Odometer value={80000 + f * 0.9} speed={0.9} size={0.5} unit="" />
            </div>
            <div style={{ position: "absolute", top: 24, right: 24, opacity: ramp(f, mV, mV + 6) }}>
              <IconCheck size={70} color={COLORS.green} progress={ramp(f, mV, mV + 10)} />
            </div>
          </Panel>
          <Panel style={{ translate: `${interpolate(inR, [0, 1], [600, 0])}px 0px` }}>
            <div style={{ fontFamily: FONT_UI, fontWeight: 700, fontSize: 28, letterSpacing: 5, color: f >= mNo ? COLORS.red : COLORS.accent }}>
              {f >= mNo ? "NO CUENTA" : "¿Y LAS…?"}
            </div>
            <Title>HORAS DE MOTOR</Title>
            <div style={{ marginTop: 50, translate: `${vib}px 0px` }}>
              <IconEngine size={210} color={COLORS.white} />
            </div>
            <div style={{ marginTop: 20, display: "flex", alignItems: "center", gap: 16 }}>
              <IconClock size={110} color={COLORS.yellow} turns={f / 10} />
              <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 800, fontSize: 80, color: COLORS.yellow, fontVariantNumeric: "tabular-nums" }}>
                {`${Math.floor(f / 6) % 24}`.padStart(2, "0")}:{`${(f * 7) % 60}`.padStart(2, "0")}
              </div>
            </div>
            {f >= mNo ? (
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: `rgba(30,4,6,${0.55 * noX})`,
                }}
              >
                <div style={{ scale: String(pop(f, mNo, 8)) }}>
                  <IconX size={360} color={COLORS.red} progress={noX} />
                </div>
              </div>
            ) : null}
          </Panel>
        </div>
      </At>
    </SceneShell>
  );
};
