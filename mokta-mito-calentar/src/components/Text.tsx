import React from "react";
import { useCurrentFrame } from "remotion";
import { C, FONT_DISPLAY, FONT_UI } from "../config";
import { EASE_BACK, EASE_IN, EASE_OUT, impactShake, map, ramp } from "../lib/anim";

type From = "up" | "down" | "scale" | "slam" | "left" | "right" | "blur";

/**
 * Entrada/salida animada. `at`: fotograma de entrada; `out`: fotograma de salida (opcional).
 * Todas las entradas terminan en ≤ 8 fotogramas: ritmo de reel.
 */
export const Reveal: React.FC<{
  at: number;
  out?: number;
  from?: From;
  dur?: number;
  children: React.ReactNode;
  style?: React.CSSProperties;
}> = ({ at, out, from = "up", dur = 8, children, style }) => {
  const f = useCurrentFrame();
  if (f < at) return null;
  if (out !== undefined && f >= out + 6) return null;
  const p = ramp(f, at, at + dur, from === "slam" ? EASE_BACK : EASE_OUT);
  const q = out !== undefined ? ramp(f, out, out + 6, EASE_IN) : 0;
  let tx = 0;
  let ty = 0;
  let sc = 1;
  let blur = 0;
  switch (from) {
    case "up":
      ty = (1 - p) * 40;
      blur = (1 - p) * 10;
      break;
    case "down":
      ty = -(1 - p) * 40;
      blur = (1 - p) * 10;
      break;
    case "left":
      tx = -(1 - p) * 80;
      blur = (1 - p) * 12;
      break;
    case "right":
      tx = (1 - p) * 80;
      blur = (1 - p) * 12;
      break;
    case "scale":
      sc = 0.7 + 0.3 * p;
      blur = (1 - p) * 14;
      break;
    case "slam":
      sc = 1.9 - 0.9 * p;
      blur = (1 - Math.min(1, p)) * 18;
      break;
    case "blur":
      blur = (1 - p) * 24;
      sc = 1.06 - 0.06 * p;
      break;
  }
  ty -= q * 30;
  blur += q * 14;
  const op = Math.min(1, p * 1.6) * (1 - q);
  return (
    <div
      style={{
        opacity: op,
        transform: `translate(${tx}px, ${ty}px) scale(${sc})`,
        filter: blur > 0.3 ? `blur(${blur}px)` : undefined,
        ...style,
      }}
    >
      {children}
    </div>
  );
};

/** Titular grande (Barlow Condensed 800, mayúsculas). */
export const Big: React.FC<{
  children: React.ReactNode;
  size?: number;
  color?: string;
  style?: React.CSSProperties;
  glow?: string;
}> = ({ children, size = 130, color = C.white, style, glow }) => (
  <div
    style={{
      fontFamily: FONT_DISPLAY,
      fontWeight: 800,
      fontSize: size,
      lineHeight: 0.92,
      letterSpacing: 0.5,
      textTransform: "uppercase",
      color,
      textAlign: "center",
      textShadow: glow ? `0 0 40px ${glow}, 0 6px 30px rgba(0,0,0,0.65)` : "0 6px 30px rgba(0,0,0,0.65)",
      ...style,
    }}
  >
    {children}
  </div>
);

/** Texto secundario (Inter). */
export const Sub: React.FC<{ children: React.ReactNode; size?: number; color?: string; weight?: number; style?: React.CSSProperties }> = ({
  children,
  size = 46,
  color = C.white,
  weight = 600,
  style,
}) => (
  <div
    style={{
      fontFamily: FONT_UI,
      fontWeight: weight,
      fontSize: size,
      lineHeight: 1.22,
      color,
      textAlign: "center",
      textShadow: "0 3px 18px rgba(0,0,0,0.75)",
      ...style,
    }}
  >
    {children}
  </div>
);

/** Palabra con marcador que se pinta de izquierda a derecha desde `at`. */
export const Marker: React.FC<{ at: number; color: string; children: React.ReactNode; ink?: string; pad?: string }> = ({
  at,
  color,
  children,
  ink = C.ink,
  pad = "0 18px",
}) => {
  const f = useCurrentFrame();
  const p = ramp(f, at, at + 7);
  return (
    <span style={{ position: "relative", display: "inline-block", padding: pad }}>
      <span
        style={{
          position: "absolute",
          inset: "6% 0 2% 0",
          background: color,
          transformOrigin: "left center",
          transform: `scaleX(${p}) skewX(-6deg)`,
          borderRadius: 6,
        }}
      />
      <span style={{ position: "relative", color: p > 0.5 ? ink : "inherit" }}>{children}</span>
    </span>
  );
};

/** Etiqueta de capítulo arriba (01 · EL ORIGEN). */
export const Chapter: React.FC<{ n: string; label: string; color?: string; at?: number; out?: number }> = ({
  n,
  label,
  color = C.frost,
  at = 0,
  out,
}) => {
  const f = useCurrentFrame();
  const p = ramp(f, at, at + 10);
  const q = out !== undefined ? ramp(f, out, out + 6) : 0;
  return (
    <div
      style={{
        position: "absolute",
        top: 250,
        left: 0,
        right: 0,
        display: "flex",
        justifyContent: "center",
        opacity: p * (1 - q),
        transform: `translateY(${(1 - p) * -20}px)`,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 16,
          padding: "12px 26px",
          borderRadius: 999,
          border: `2px solid ${color}55`,
          background: "rgba(4,7,14,0.55)",
          fontFamily: FONT_UI,
          fontWeight: 700,
          fontSize: 30,
          letterSpacing: 5,
          color,
        }}
      >
        <span style={{ fontFamily: FONT_DISPLAY, fontWeight: 800, fontSize: 36, letterSpacing: 1 }}>{n}</span>
        <span style={{ width: 8, height: 8, borderRadius: 4, background: color }} />
        {label}
      </div>
    </div>
  );
};

/** Sello: entra gigante, golpea y tiembla. */
export const Stamp: React.FC<{
  at: number;
  children: React.ReactNode;
  color?: string;
  size?: number;
  rotate?: number;
  style?: React.CSSProperties;
}> = ({ at, children, color = C.red, size = 300, rotate = -6, style }) => {
  const f = useCurrentFrame();
  if (f < at) return null;
  const p = ramp(f, at, at + 6, EASE_IN);
  const sc = map(f, [at, at + 6, at + 9, at + 13], [2.4, 0.94, 1.03, 1]);
  const sh = impactShake(f, at + 6, 14, 12);
  return (
    <div
      style={{
        fontFamily: FONT_DISPLAY,
        fontWeight: 800,
        fontSize: size,
        lineHeight: 0.85,
        color,
        textTransform: "uppercase",
        textAlign: "center",
        opacity: Math.min(1, p * 2),
        transform: `translate(${sh.x}px, ${sh.y}px) rotate(${rotate}deg) scale(${sc})`,
        filter: p < 1 ? `blur(${(1 - p) * 10}px)` : undefined,
        textShadow: `0 0 60px ${color}88, 0 10px 40px rgba(0,0,0,0.6)`,
        ...style,
      }}
    >
      {children}
    </div>
  );
};

/** Nota al pie pequeña (fuentes / supuestos). */
export const Foot: React.FC<{ children: React.ReactNode; at: number; top?: number }> = ({ children, at, top = 1440 }) => {
  const f = useCurrentFrame();
  return (
    <div
      style={{
        position: "absolute",
        top,
        left: 90,
        right: 150,
        textAlign: "center",
        fontFamily: FONT_UI,
        fontWeight: 500,
        fontSize: 25,
        lineHeight: 1.35,
        color: "rgba(244,246,248,0.5)",
        opacity: ramp(f, at, at + 10),
      }}
    >
      {children}
    </div>
  );
};
