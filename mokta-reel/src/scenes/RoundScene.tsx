import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { BARRIER_DISTANCE_M, COLORS, FONT_DISPLAY, FONT_UI, FPS, ROUNDS, kmhToMs } from "../config";
import { DriveView } from "../world/DriveView";
import { ReactionTimer, RoundBadge, SpeedReadout, TabularNumber } from "../hud/Hud";
import { ResultCard } from "../hud/ResultCard";
import { EASE_IN_OUT, ramp } from "../lib/anim";

/**
 * Una ronda del desafío.
 *  0 … eventAt        conducción a velocidad constante (nada cambia: ni luz, ni sonido, ni HUD)
 *  eventAt            la barrera aparece a BARRIER_DISTANCE_M y arranca el cronómetro (mismo fotograma)
 *  … freezeAt         el auto sigue avanzando: ventana para pausar
 *  freezeAt …         el mundo se congela y aparece la tabla de resultado
 */
export const RoundScene: React.FC<{ index: number }> = ({ index }) => {
  const f = useCurrentFrame();
  const r = ROUNDS[index];
  const v = kmhToMs(r.speedKmh);
  const freezeAt = r.eventAt + r.reactWindow;
  const frozen = f >= freezeAt;
  const fMove = Math.min(f, freezeAt);

  const S0 = 1000 + index * 2000; // tramo de carretera distinto en cada ronda
  const s = S0 + (v * fMove) / FPS;
  const sAtEvent = S0 + (v * r.eventAt) / FPS;
  const barrierS = f >= r.eventAt ? sAtEvent + BARRIER_DISTANCE_M : null;

  // Auto en sentido contrario: visible desde el inicio, lejos; cruza ~2 s antes del evento.
  let decoyS: number | null = null;
  if (r.decoyAt !== undefined) {
    const start = S0 + 260;
    const pos = start - (25 * fMove) / FPS;
    if (pos > s - 8) decoyS = pos;
  }

  const shakeAmp = 0.004 + (0.006 * (r.speedKmh - 100)) / 110;

  const tSec = Math.max(0, (fMove - r.eventAt) / FPS);
  const meters = v * tSec;

  // Tarjeta de inicio de ronda (velocidad grande) → se retira y deja el HUD persistente
  const cardIn = ramp(f, 0, 8);
  const cardOut = ramp(f, 30, 42, EASE_IN_OUT);
  const card = Math.min(cardIn, 1 - cardOut);
  const hudIn = ramp(f, 34, 46);

  const fr = f - freezeAt; // fotogramas desde la congelación
  const freezeDim = frozen ? ramp(fr, 0, 10) : 0;
  const punch = frozen ? interpolate(ramp(fr, 0, 14), [0, 1], [1, 1.035]) : 1;

  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ scale: String(punch), filter: frozen ? `saturate(${1 - 0.35 * freezeDim})` : undefined }}>
        <DriveView
          s={s}
          travelPerFrame={frozen ? 0 : v / FPS}
          shakeT={fMove / FPS}
          shakeAmp={shakeAmp}
          barrierS={barrierS}
          decoyS={decoyS}
        />
      </AbsoluteFill>

      {/* Oscurecimiento solo DESPUÉS de congelar (para leer la tabla) */}
      <AbsoluteFill style={{ background: "rgba(2,3,8,0.45)", opacity: freezeDim * (fr > 8 ? 1 : 0.4) }} />

      {/* Tarjeta de ronda */}
      {card > 0.001 ? (
        <AbsoluteFill style={{ alignItems: "center", top: 330, opacity: card }}>
          <div
            style={{
              fontFamily: FONT_UI,
              fontWeight: 700,
              fontSize: 40,
              letterSpacing: 10,
              color: COLORS.dim,
              translate: `0px ${interpolate(cardIn, [0, 1], [16, 0])}px`,
            }}
          >
            {r.label}
          </div>
          <div
            style={{
              fontFamily: FONT_DISPLAY,
              fontWeight: 800,
              fontSize: 230,
              lineHeight: 1,
              color: COLORS.white,
              display: "flex",
              alignItems: "baseline",
              gap: 18,
              textShadow: "0 6px 40px rgba(0,0,0,0.6)",
              translate: `0px ${interpolate(cardIn, [0, 1], [26, 0])}px`,
            }}
          >
            <TabularNumber value={String(r.speedKmh)} />
            <span style={{ fontSize: 80, fontWeight: 600, color: COLORS.dim }}>km/h</span>
          </div>
        </AbsoluteFill>
      ) : null}

      <RoundBadge index={index} opacity={hudIn} />
      <SpeedReadout kmh={r.speedKmh} opacity={hudIn * (frozen ? 1 - ramp(fr, 4, 12) : 1)} />

      {barrierS !== null && (!frozen || fr < 14) ? (
        <ReactionTimer
          seconds={tSec}
          meters={meters}
          appearF={f - r.eventAt}
          dim={frozen ? 1 - ramp(fr, 8, 14) : 1}
        />
      ) : null}

      {frozen && fr >= 10 ? <ResultCard kmh={r.speedKmh} f={fr - 10} compact={index > 0} /> : null}

    </AbsoluteFill>
  );
};
