import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import {
  COLORS,
  FONT_DISPLAY,
  FONT_UI,
  LEVEL_COLORS,
  ROUNDS,
  ROUND_STARTS,
  countdownAt,
  optionsAt,
  revealAt,
  roundDuration,
} from "../config";
import { Backdrop } from "../components/Backdrop";
import { Options } from "../components/Options";
import { RevealCard } from "../components/RevealCard";
import { RoundHeader } from "../components/RoundHeader";
import { SoundRing } from "../components/SoundRing";
import { EASE_IN_OUT, EASE_OUT, ramp } from "../lib/anim";

/**
 * Una ronda: tarjeta de ronda (silencio) → escucha (sin pistas visuales) → alternativas →
 * cuenta regresiva 3-2-1 → silencio táctico → revelación con destello, foto del auto y del motor.
 */
export const RoundScene: React.FC<{ index: number }> = ({ index }) => {
  const f = useCurrentFrame();
  const r = ROUNDS[index];
  const abs = ROUND_STARTS[index] + f;
  const lc = LEVEL_COLORS[r.level] ?? COLORS.accent;
  const oAt = optionsAt(r);
  const cAt = countdownAt(r);
  const gAt = cAt + r.countdown;
  const rAt = revealAt(r);
  const dur = roundDuration(r);

  const inIntro = f < r.intro;
  const inListen = f >= r.intro && f < cAt;
  const inCount = f >= cAt && f < gAt;
  const inGap = f >= gAt && f < rAt;
  const revealed = f >= rAt;

  // cuenta regresiva
  const cf = f - cAt;
  const secLeft = 3 - Math.floor(cf / 30);
  const inSec = (cf % 30) / 30;
  const countProgress = inCount ? cf / r.countdown : inGap ? 1 : 0;
  const countColor = secLeft <= 1 || inGap ? COLORS.red : secLeft === 2 ? COLORS.accent : COLORS.accent2;

  // temblor de cámara en la revelación
  const shakeK = revealed ? Math.max(0, 1 - (f - rAt) / 10) : 0;
  const shakeX = Math.sin((f - rAt) * 2.3) * 14 * shakeK;
  const shakeY = Math.cos((f - rAt) * 3.1) * 10 * shakeK;

  // el visualizador se encoge y desaparece al revelar
  const ringOut = ramp(f, rAt, rAt + 8, EASE_IN_OUT);
  const ringIn = ramp(f, r.intro - 4, r.intro + 10, EASE_OUT);

  // tarjeta de ronda
  const introT = r.intro;
  const introIn = ramp(f, 0, 6, EASE_OUT);
  const introOut = ramp(f, introT - 6, introT, EASE_IN_OUT);
  const finalPulse = r.final ? 1 + 0.06 * Math.max(0, Math.sin((f / 18) * Math.PI * 2)) : 1;

  const caption = inListen
    ? f < oAt
      ? "ESCUCHA EL MOTOR"
      : "¿QUÉ CONFIGURACIÓN ES?"
    : inCount || inGap
      ? "ELIGE AHORA"
      : revealed
        ? r.car.toUpperCase()
        : "";
  const recBlink = Math.floor(f / 12) % 2 === 0;

  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <Backdrop absFrame={abs} tint={r.final ? "192,75,255" : "255,90,31"} energy={inIntro ? 0 : 1} />

      <AbsoluteFill style={{ translate: `${shakeX}px ${shakeY}px` }}>
        <RoundHeader index={index} opacity={ramp(f, introT - 4, introT + 6)} />

        {/* visualizador + cuenta regresiva */}
        {!inIntro && ringOut < 1 ? (
          <div
            style={{
              position: "absolute",
              left: 220,
              top: 365,
              opacity: ringIn * (1 - ringOut),
              scale: String(interpolate(ringIn, [0, 1], [0.85, 1]) * interpolate(ringOut, [0, 1], [1, 0.7])),
            }}
          >
            <SoundRing
              absFrame={abs}
              size={640}
              color={r.final ? "#C04BFF" : COLORS.accent}
              countdown={inCount || inGap || revealed ? countProgress : null}
              countdownColor={countColor}
            >
              {inListen ? (
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                  <div
                    style={{
                      fontFamily: FONT_DISPLAY,
                      fontWeight: 800,
                      fontSize: 230,
                      lineHeight: 0.9,
                      color: COLORS.white,
                      opacity: 0.92,
                    }}
                  >
                    ?
                  </div>
                </div>
              ) : null}
              {inCount ? (
                <div
                  style={{
                    fontFamily: FONT_DISPLAY,
                    fontWeight: 800,
                    fontSize: 250,
                    lineHeight: 1,
                    color: countColor,
                    scale: String(interpolate(inSec, [0, 0.18, 1], [1.45, 1, 0.92], { extrapolateRight: "clamp" })),
                    opacity: interpolate(inSec, [0, 0.1, 0.85, 1], [0, 1, 1, 0.2]),
                    textShadow: `0 0 40px ${countColor}`,
                  }}
                >
                  {secLeft}
                </div>
              ) : null}
              {inGap ? (
                <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 800, fontSize: 120, color: COLORS.red, letterSpacing: 6 }}>
                  ···
                </div>
              ) : null}
            </SoundRing>
          </div>
        ) : null}

        {revealed ? <RevealCard round={r} f={f - rAt} total={dur - rAt} /> : null}

        {/* rótulo bajo el escenario */}
        {!inIntro ? (
          <div
            style={{
              position: "absolute",
              left: 60,
              right: 60,
              top: 1036,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              gap: 16,
              fontFamily: FONT_UI,
              fontWeight: 800,
              fontSize: revealed ? 44 : 38,
              letterSpacing: revealed ? 2 : 6,
              color: revealed ? COLORS.white : inCount || inGap ? COLORS.accent2 : COLORS.dim,
              opacity: ringIn,
            }}
          >
            {inListen && f < oAt ? (
              <div
                style={{
                  width: 22,
                  height: 22,
                  borderRadius: "50%",
                  background: COLORS.red,
                  opacity: recBlink ? 1 : 0.25,
                  boxShadow: `0 0 16px ${COLORS.red}`,
                }}
              />
            ) : null}
            {caption}
          </div>
        ) : null}

        {!inIntro ? (
          <Options f={f} options={r.options} correct={r.correct} appearAt={oAt} revealAt={rAt} countdownAt={cAt} />
        ) : null}
      </AbsoluteFill>

      {/* tarjeta de ronda (pantalla completa, en silencio) */}
      {inIntro ? (
        <AbsoluteFill
          style={{
            alignItems: "center",
            justifyContent: "center",
            opacity: 1 - introOut,
          }}
        >
          <div
            style={{
              fontFamily: FONT_UI,
              fontWeight: 800,
              fontSize: 40,
              letterSpacing: 10,
              color: lc,
              opacity: introIn,
              marginBottom: 10,
            }}
          >
            {r.final ? "EL ÚLTIMO ES UNA" : `NIVEL ${r.level}`}
          </div>
          <div
            style={{
              fontFamily: FONT_DISPLAY,
              fontWeight: 800,
              fontSize: r.final ? 230 : 260,
              lineHeight: 0.9,
              color: r.final ? lc : COLORS.white,
              letterSpacing: 4,
              scale: String(interpolate(introIn, [0, 1], [1.5, 1]) * finalPulse),
              opacity: introIn,
              textShadow: r.final ? `0 0 60px ${lc}` : "0 10px 50px rgba(0,0,0,0.6)",
              textAlign: "center",
            }}
          >
            {r.final ? "LOCURA" : `RONDA ${index + 1}`}
          </div>
          {r.final ? (
            <div
              style={{
                marginTop: 26,
                fontFamily: FONT_DISPLAY,
                fontWeight: 700,
                fontSize: 70,
                letterSpacing: 6,
                color: COLORS.white,
                opacity: ramp(f, 12, 20),
              }}
            >
              RONDA FINAL
            </div>
          ) : null}
        </AbsoluteFill>
      ) : null}

      {/* destello de revelación */}
      {revealed && f - rAt < 10 ? (
        <AbsoluteFill style={{ backgroundColor: "#fff", opacity: interpolate(f - rAt, [0, 9], [0.85, 0], { extrapolateRight: "clamp" }) }} />
      ) : null}
    </AbsoluteFill>
  );
};
