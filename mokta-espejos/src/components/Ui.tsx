import React from "react";
import { AbsoluteFill, interpolate } from "remotion";
import { COLORS, FONT_DISPLAY, FONT_UI } from "../config";
import { EASE_BACK, EASE_IN_OUT, EASE_OUT, ramp } from "../lib/anim";

/** Aparición con rebote (0..1) entre a y a+dur, y salida en [b, b+0.2]. */
export const popIn = (t: number, a: number, b = Infinity, dur = 0.3) => {
  const i = interpolate(t, [a, a + dur], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: EASE_BACK,
  });
  const o = Number.isFinite(b) ? 1 - ramp(t, b, b + 0.2, EASE_IN_OUT) : 1;
  return Math.max(0, Math.min(i, o));
};

export const Pill: React.FC<{
  t: number;
  from: number;
  until?: number;
  x: number;
  y: number;
  color: string;
  text: string;
  icon?: "check" | "x" | "warn" | "pin" | "eye";
  size?: number;
  anchor?: "center" | "left" | "right";
  dark?: boolean;
}> = ({ t, from, until = Infinity, x, y, color, text, icon, size = 48, anchor = "center", dark = false }) => {
  const k = popIn(t, from, until);
  if (k <= 0) return null;
  const tx = anchor === "center" ? "-50%" : anchor === "right" ? "-100%" : "0%";
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        transform: `translate(${tx}, -50%) scale(${0.6 + 0.4 * k})`,
        transformOrigin: anchor === "center" ? "50% 50%" : anchor === "right" ? "100% 50%" : "0% 50%",
        opacity: Math.min(1, k * 1.5),
        display: "flex",
        alignItems: "center",
        gap: size * 0.28,
        padding: `${size * 0.22}px ${size * 0.5}px`,
        borderRadius: size,
        background: dark ? "rgba(5,7,11,0.86)" : color,
        border: dark ? `4px solid ${color}` : "none",
        color: dark ? color : COLORS.ink,
        fontFamily: FONT_DISPLAY,
        fontWeight: 800,
        fontSize: size,
        lineHeight: 1,
        letterSpacing: 1,
        whiteSpace: "nowrap",
        boxShadow: `0 10px 30px rgba(0,0,0,0.45), 0 0 34px ${color}55`,
      }}
    >
      {icon ? <Icon kind={icon} size={size * 0.9} color={dark ? color : COLORS.ink} /> : null}
      <span>{text}</span>
    </div>
  );
};

export const Icon: React.FC<{ kind: "check" | "x" | "warn" | "pin" | "eye"; size: number; color: string }> = ({ kind, size, color }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" style={{ display: "block" }}>
    {kind === "check" ? <path d="M4 12.5 L9.5 18 L20 6.5" fill="none" stroke={color} strokeWidth={3.4} strokeLinecap="round" strokeLinejoin="round" /> : null}
    {kind === "x" ? <path d="M6 6 L18 18 M18 6 L6 18" fill="none" stroke={color} strokeWidth={3.4} strokeLinecap="round" /> : null}
    {kind === "warn" ? (
      <>
        <path d="M12 3 L22 20 L2 20 Z" fill="none" stroke={color} strokeWidth={2.6} strokeLinejoin="round" />
        <path d="M12 9 L12 14" stroke={color} strokeWidth={2.8} strokeLinecap="round" />
        <circle cx={12} cy={17.2} r={1.6} fill={color} />
      </>
    ) : null}
    {kind === "pin" ? (
      <>
        <path d="M12 22 C 12 22 4.5 14 4.5 9 A 7.5 7.5 0 0 1 19.5 9 C 19.5 14 12 22 12 22 Z" fill={color} />
        <circle cx={12} cy={9} r={3} fill="#FFFFFF" />
      </>
    ) : null}
    {kind === "eye" ? (
      <>
        <path d="M2 12 Q 12 3 22 12 Q 12 21 2 12 Z" fill="none" stroke={color} strokeWidth={2.6} />
        <circle cx={12} cy={12} r={3.4} fill={color} />
      </>
    ) : null}
  </svg>
);

/** Fondo oscuro con brillo radial y líneas de velocidad sutiles. */
export const Backdrop: React.FC<{ t: number; glow?: string; glowY?: number; speed?: number }> = ({
  t,
  glow = COLORS.accent,
  glowY = 860,
  speed = 1,
}) => {
  const lines = Array.from({ length: 16 }).map((_, i) => {
    const seed = Math.sin(i * 12.9898) * 43758.5453;
    const r = seed - Math.floor(seed);
    const x = 60 + r * 960;
    const len = 120 + r * 260;
    const v = 900 + r * 900;
    const y = ((t * v * speed + r * 4000) % 2600) - 400;
    return { x, y, len, o: 0.04 + r * 0.06 };
  });
  return (
    <AbsoluteFill style={{ background: `linear-gradient(180deg, ${COLORS.bg1} 0%, ${COLORS.bg2} 100%)` }}>
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse 70% 32% at 50% ${glowY}px, ${glow}2E 0%, ${glow}10 45%, rgba(0,0,0,0) 75%)`,
        }}
      />
      <svg width={1080} height={1920} style={{ position: "absolute" }}>
        {lines.map((l, i) => (
          <line key={i} x1={l.x} y1={l.y} x2={l.x} y2={l.y + l.len} stroke="#CFE9FF" strokeWidth={3} strokeLinecap="round" opacity={l.o} />
        ))}
      </svg>
    </AbsoluteFill>
  );
};

/** Título grande superior (keyword de la escena). */
export const TopTitle: React.FC<{
  t: number;
  from: number;
  until?: number;
  text: string;
  color?: string;
  size?: number;
  y?: number;
  sub?: string;
}> = ({ t, from, until = Infinity, text, color = COLORS.white, size = 92, y = 250, sub }) => {
  const k = popIn(t, from, until, 0.32);
  if (k <= 0) return null;
  return (
    <div
      style={{
        position: "absolute",
        left: 60,
        right: 60,
        top: y,
        textAlign: "center",
        transform: `translateY(${(1 - k) * 30}px) scale(${0.85 + 0.15 * k})`,
        opacity: Math.min(1, k * 1.4),
      }}
    >
      <div
        style={{
          fontFamily: FONT_DISPLAY,
          fontWeight: 800,
          fontSize: size,
          lineHeight: 0.95,
          color,
          letterSpacing: 1,
          textShadow: "0 6px 0 rgba(0,0,0,0.5), 0 0 40px rgba(0,0,0,0.7)",
        }}
      >
        {text}
      </div>
      {sub ? (
        <div
          style={{
            marginTop: 12,
            fontFamily: FONT_UI,
            fontWeight: 600,
            fontSize: 38,
            color: COLORS.dim,
            textShadow: "0 2px 12px rgba(0,0,0,0.8)",
          }}
        >
          {sub}
        </div>
      ) : null}
    </div>
  );
};

/** Destello de pantalla completa (0..1). */
export const Flash: React.FC<{ t: number; at: number; color?: string; dur?: number; max?: number }> = ({
  t,
  at,
  color = "#FFFFFF",
  dur = 0.35,
  max = 0.55,
}) => {
  if (t < at || t > at + dur) return null;
  const o = interpolate(t, [at, at + dur], [max, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: EASE_OUT });
  return <AbsoluteFill style={{ background: color, opacity: o, pointerEvents: "none" }} />;
};
