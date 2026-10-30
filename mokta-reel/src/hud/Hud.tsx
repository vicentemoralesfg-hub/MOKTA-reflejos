import React from "react";
import { AbsoluteFill, interpolate } from "remotion";
import { COLORS, FONT_DISPLAY, FONT_UI, ROUNDS, TEXT, fmt, zoneOf } from "../config";
import { ramp } from "../lib/anim";

/** Número con cifras de ancho fijo (sin "baile" al cambiar). */
export const TabularNumber: React.FC<{ value: string; digitWidth?: number; style?: React.CSSProperties }> = ({
  value,
  digitWidth = 0.52,
  style,
}) => (
  <span style={{ display: "inline-flex", ...style }}>
    {value.split("").map((ch, i) => (
      <span
        key={i}
        style={{
          display: "inline-block",
          width: /[0-9]/.test(ch) ? `${digitWidth}em` : ch === "," ? "0.22em" : "auto",
          textAlign: "center",
        }}
      >
        {ch}
      </span>
    ))}
  </span>
);

/** Indicador de ronda (arriba) — discreto, fuera de la zona de la barrera. */
export const RoundBadge: React.FC<{ index: number; opacity?: number }> = ({ index, opacity = 1 }) => (
  <div
    style={{
      position: "absolute",
      top: 236,
      left: 0,
      right: 0,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: 14,
      opacity,
    }}
  >
    <div style={{ display: "flex", gap: 10 }}>
      {ROUNDS.map((_, i) => (
        <div
          key={i}
          style={{
            width: 54,
            height: 6,
            borderRadius: 3,
            background: i <= index ? COLORS.white : "rgba(244,246,248,0.22)",
            opacity: i === index ? 1 : i < index ? 0.55 : 1,
          }}
        />
      ))}
    </div>
    <div
      style={{
        fontFamily: FONT_UI,
        fontWeight: 600,
        fontSize: 34,
        letterSpacing: 6,
        color: COLORS.dim,
      }}
    >
      {ROUNDS[index].label}
    </div>
  </div>
);

/** Velocidad: lectura digital grande y limpia, sobre la zona de interfaz de Reels. */
export const SpeedReadout: React.FC<{ kmh: number; opacity?: number; scale?: number }> = ({
  kmh,
  opacity = 1,
  scale = 1,
}) => (
  <div
    style={{
      position: "absolute",
      top: 1372,
      left: 0,
      right: 0,
      display: "flex",
      justifyContent: "center",
      alignItems: "baseline",
      gap: 14,
      opacity,
      scale: String(scale),
      fontFamily: FONT_DISPLAY,
      color: COLORS.white,
      textShadow: "0 2px 18px rgba(0,0,0,0.6)",
    }}
  >
    <TabularNumber value={String(kmh)} style={{ fontSize: 104, fontWeight: 700, lineHeight: 1 }} />
    <span style={{ fontSize: 40, fontWeight: 600, color: COLORS.dim, letterSpacing: 1 }}>km/h</span>
  </div>
);

/**
 * Cronómetro de reacción. Solo existe DESPUÉS de que aparece la barrera.
 * El color se decide por fotograma con umbrales fijos: al pausar, el color es inequívoco.
 */
export const ReactionTimer: React.FC<{
  seconds: number;
  meters: number;
  appearF: number; // fotogramas desde que apareció
  dim?: number;
}> = ({ seconds, meters, appearF, dim = 1 }) => {
  const zone = zoneOf(seconds);
  const color = COLORS[zone];
  return (
    <div
      style={{
        position: "absolute",
        top: 1058,
        left: 0,
        right: 0,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        opacity: dim,
        // aparece en el mismo fotograma que la barrera (sin anticipación); solo un leve asentamiento
        translate: `0px ${interpolate(ramp(appearF, 0, 6), [0, 1], [10, 0])}px`,
      }}
    >
      <div
        style={{
          fontFamily: FONT_DISPLAY,
          fontWeight: 800,
          fontSize: 156,
          lineHeight: 0.9,
          color,
          textShadow: `0 0 40px ${color}55, 0 4px 24px rgba(0,0,0,0.65)`,
          display: "flex",
          alignItems: "baseline",
        }}
      >
        <TabularNumber value={fmt(seconds, 2)} />
        <span style={{ fontSize: 66, fontWeight: 700, marginLeft: 10 }}>s</span>
      </div>
      <div
        style={{
          marginTop: 10,
          fontFamily: FONT_UI,
          fontWeight: 600,
          fontSize: 40,
          color: COLORS.white,
          textShadow: "0 2px 14px rgba(0,0,0,0.8)",
          display: "flex",
          gap: 12,
          alignItems: "baseline",
        }}
      >
        <TabularNumber value={`${fmt(meters, 1)}`} digitWidth={0.62} />
        <span>m {TEXT.timerCaption}</span>
      </div>
    </div>
  );
};

export const SafeFill: React.FC<{ children: React.ReactNode; style?: React.CSSProperties }> = ({
  children,
  style,
}) => <AbsoluteFill style={{ pointerEvents: "none", ...style }}>{children}</AbsoluteFill>;
