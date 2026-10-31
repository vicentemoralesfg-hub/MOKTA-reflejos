import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { C, FONT_DISPLAY, FONT_UI } from "../config";
import { CarScene } from "../art/CarScene";
import { Snow } from "../components/Overlays";
import { Big, Reveal } from "../components/Text";
import { Snowflake } from "../art/Icons";
import { EASE_OUT, map, noise1 } from "../lib/anim";
import { beat, cue } from "../timeline";

/** Cronómetro "calentando": corre acelerado de 00:00 a 10:00. */
export const WarmTimer: React.FC<{ seconds: number; color?: string; label?: string; pulse?: number }> = ({
  seconds,
  color = C.frost,
  label = "CALENTANDO",
  pulse = 0,
}) => {
  const mm = Math.floor(seconds / 60);
  const ss = Math.floor(seconds % 60);
  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 22,
        padding: "16px 34px 16px 26px",
        borderRadius: 999,
        background: "rgba(4,8,16,0.72)",
        border: `2px solid ${color}66`,
        boxShadow: `0 0 ${30 + pulse * 30}px ${color}33`,
      }}
    >
      <Snowflake size={46} color={color} />
      <div style={{ fontFamily: FONT_UI, fontWeight: 700, fontSize: 28, letterSpacing: 5, color }}>{label}</div>
      <div
        style={{
          fontFamily: FONT_DISPLAY,
          fontWeight: 700,
          fontSize: 76,
          color: C.white,
          fontVariantNumeric: "tabular-nums",
          minWidth: 170,
          textAlign: "right",
        }}
      >
        {String(mm).padStart(2, "0")}:{String(ss).padStart(2, "0")}
      </div>
    </div>
  );
};

export const S01Hook: React.FC = () => {
  const f = useCurrentFrame();
  const D = beat("hook").duration;
  const zoom = map(f, [0, D], [1.0, 1.13], EASE_OUT);
  const sx = noise1(f / 18, 4) * 6;
  const sy = noise1(f / 18, 5) * 5;
  const tDiez = cue("hook", "diez", 18);
  const tCada = cue("hook", "cada", 38);
  const secs = map(f, [0, D - 4], [0, 600]);
  const settle = map(f, [0, 10], [1.06, 1], EASE_OUT);
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ transform: `translate(${sx}px, ${sy}px)` }}>
        <CarScene t={f + 40} zoom={zoom} />
      </AbsoluteFill>
      <Snow count={60} opacity={0.7} />
      <AbsoluteFill
        style={{
          background: "linear-gradient(180deg, rgba(3,6,12,0.82) 0%, rgba(3,6,12,0.35) 38%, rgba(3,6,12,0) 52%)",
        }}
      />
      <AbsoluteFill style={{ alignItems: "center", top: 300 }}>
        <div style={{ transform: `scale(${settle})` }}>
          <Big size={118}>¿Calientas el auto</Big>
        </div>
        <Reveal at={tDiez - 2} from="slam" dur={7}>
          <Big size={214} color={C.ice} glow="rgba(120,200,255,0.55)" style={{ marginTop: 6 }}>
            10 minutos
          </Big>
        </Reveal>
        <Reveal at={tCada - 2} from="up">
          <Big size={118} style={{ marginTop: 6 }}>
            cada mañana?
          </Big>
        </Reveal>
      </AbsoluteFill>
      <AbsoluteFill style={{ alignItems: "center", top: 880 }}>
        <div>
          <WarmTimer seconds={secs} pulse={Math.abs(Math.sin(f / 3))} />
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
