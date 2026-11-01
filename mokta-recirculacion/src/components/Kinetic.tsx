import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { COLORS, FONT_DISPLAY, FONT_UI, HEIGHT, WIDTH } from "../config";
import { EASE_OUT, clamp01, lerp, pop, ramp } from "../lib/anim";

/** Aparece con rebote (escala + subida). */
export const Pop: React.FC<{ at: number; children: React.ReactNode; from?: number; dy?: number; style?: React.CSSProperties; damping?: number }> = ({
  at,
  children,
  from = 0.5,
  dy = 30,
  style,
  damping,
}) => {
  const f = useCurrentFrame();
  const p = pop(f, at, damping);
  return (
    <div
      style={{
        opacity: clamp01(p * 2.5),
        scale: String(lerp(from, 1, p)),
        translate: `0px ${lerp(dy, 0, p)}px`,
        ...style,
      }}
    >
      {children}
    </div>
  );
};

/** Palabra por palabra, con rebote escalonado. */
export const Words: React.FC<{
  text: string;
  at: number;
  stagger?: number;
  style?: React.CSSProperties;
  wordStyle?: (w: string, i: number) => React.CSSProperties | undefined;
}> = ({ text, at, stagger = 3, style, wordStyle }) => {
  const f = useCurrentFrame();
  const words = text.split(" ");
  return (
    <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", columnGap: "0.26em", ...style }}>
      {words.map((w, i) => {
        const p = pop(f, at + i * stagger, 12, 200);
        return (
          <span
            key={i}
            style={{
              display: "inline-block",
              opacity: clamp01(p * 2.5),
              scale: String(lerp(0.6, 1, p)),
              translate: `0px ${lerp(26, 0, p)}px`,
              ...wordStyle?.(w, i),
            }}
          >
            {w}
          </span>
        );
      })}
    </div>
  );
};

/** Bloque de color detrás del texto (marcador) que se "pinta" de izquierda a derecha. */
export const Marker: React.FC<{ at: number; color: string; children: React.ReactNode; textColor?: string; rotate?: number; style?: React.CSSProperties }> = ({
  at,
  color,
  children,
  textColor = COLORS.white,
  rotate = -2,
  style,
}) => {
  const f = useCurrentFrame();
  const p = ramp(f, at, at + 7);
  return (
    <span style={{ position: "relative", display: "inline-block", padding: "0 0.18em", rotate: `${rotate}deg`, ...style }}>
      <span
        style={{
          position: "absolute",
          inset: "0.04em 0",
          background: color,
          borderRadius: "0.08em",
          transformOrigin: "left center",
          scale: `${p} 1`,
          boxShadow: `0 10px 40px ${color}66`,
        }}
      />
      <span style={{ position: "relative", color: textColor }}>{children}</span>
    </span>
  );
};

/** Texto que llega de cabeza y gira 180° hasta quedar derecho ("al revés"). */
export const Flip: React.FC<{ at: number; children: React.ReactNode; style?: React.CSSProperties }> = ({ at, children, style }) => {
  const f = useCurrentFrame();
  const p = pop(f, at, 9, 140);
  return <div style={{ display: "inline-block", rotate: `${lerp(180, 0, p)}deg`, ...style }}>{children}</div>;
};

/** Golpe: entra grande y "aterriza" (para palabras clave). */
export const Slam: React.FC<{ at: number; children: React.ReactNode; from?: number; style?: React.CSSProperties }> = ({ at, children, from = 2.4, style }) => {
  const f = useCurrentFrame();
  const p = ramp(f, at, at + 5, (x) => x * x);
  const settle = pop(f, at + 5, 8, 260);
  const s = f < at + 5 ? lerp(from, 1, p) : lerp(0.94, 1, settle);
  return <div style={{ opacity: f < at ? 0 : clamp01(p * 3), scale: String(s), ...style }}>{children}</div>;
};

/** Píldora con ícono (rótulos de sección). */
export const Chip: React.FC<{ icon?: React.ReactNode; color: string; children: React.ReactNode; solid?: boolean; size?: number; style?: React.CSSProperties }> = ({
  icon,
  color,
  children,
  solid = false,
  size = 44,
  style,
}) => (
  <div
    style={{
      display: "inline-flex",
      alignItems: "center",
      gap: size * 0.4,
      padding: `${size * 0.32}px ${size * 0.62}px`,
      borderRadius: size,
      background: solid ? color : "rgba(6,9,15,0.72)",
      border: `${Math.max(2, size * 0.06)}px solid ${color}`,
      color: solid ? COLORS.ink : COLORS.white,
      fontFamily: FONT_UI,
      fontWeight: 800,
      fontSize: size,
      letterSpacing: size * 0.06,
      whiteSpace: "nowrap",
      boxShadow: `0 10px 40px rgba(0,0,0,0.45), 0 0 30px ${color}33`,
      ...style,
    }}
  >
    {icon ? <span style={{ display: "flex", color: solid ? COLORS.ink : color }}>{icon}</span> : null}
    {children}
  </div>
);

export const H: React.CSSProperties = {
  fontFamily: FONT_DISPLAY,
  fontWeight: 800,
  color: COLORS.white,
  lineHeight: 0.92,
  textAlign: "center",
  textTransform: "uppercase",
  textShadow: "0 6px 30px rgba(0,0,0,0.6)",
};

export const SUB: React.CSSProperties = {
  fontFamily: FONT_UI,
  fontWeight: 700,
  color: COLORS.white,
  textAlign: "center",
  textShadow: "0 2px 18px rgba(0,0,0,0.85)",
};

/** Fondo con atmósfera (manchas de luz que derivan lentamente). */
export const Bg: React.FC<{ mood: "night" | "cold" | "hot" | "neutral" }> = ({ mood }) => {
  const f = useCurrentFrame();
  const pal = {
    night: ["#070a12", "#101a2e", "#1c2a4a"],
    cold: ["#04070d", "#0b1d33", "#14395e"],
    hot: ["#0d0603", "#2a1206", "#5a2508"],
    neutral: ["#05070b", "#0e131c", "#1a2232"],
  }[mood];
  const x1 = 30 + Math.sin(f / 70) * 10;
  const y1 = 30 + Math.cos(f / 90) * 8;
  const x2 = 70 + Math.cos(f / 80) * 10;
  const y2 = 72 + Math.sin(f / 60) * 6;
  return (
    <AbsoluteFill
      style={{
        background: `radial-gradient(60% 40% at ${x1}% ${y1}%, ${pal[2]}cc 0%, transparent 70%), radial-gradient(55% 35% at ${x2}% ${y2}%, ${pal[1]} 0%, transparent 70%), linear-gradient(180deg, ${pal[0]} 0%, ${pal[1]} 55%, ${pal[0]} 100%)`,
      }}
    />
  );
};

/** Etalonaje: viñeta + grano fílmico (determinista por fotograma). */
export const Grade: React.FC<{ grain?: number; vignette?: number }> = ({ grain = 0.06, vignette = 0.55 }) => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <AbsoluteFill style={{ background: `radial-gradient(90% 62% at 50% 46%, rgba(0,0,0,0) 55%, rgba(0,0,0,${vignette}) 100%)` }} />
      <svg width={WIDTH} height={HEIGHT} style={{ position: "absolute", inset: 0, opacity: grain, mixBlendMode: "overlay" }}>
        <filter id={`grain${f}`}>
          <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="1" seed={f % 89} />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter={`url(#grain${f})`} />
      </svg>
    </AbsoluteFill>
  );
};

/** Destello blanco breve en los impactos. */
export const Flash: React.FC<{ at: number; dur?: number; max?: number; color?: string }> = ({ at, dur = 6, max = 0.55, color = "#fff" }) => {
  const f = useCurrentFrame();
  const o = interpolate(f, [at, at + 1, at + dur], [0, max, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: EASE_OUT });
  if (o <= 0.001) return null;
  return <AbsoluteFill style={{ background: color, opacity: o, pointerEvents: "none" }} />;
};

/** Entrada de escena: "punch-in" de escala + desenfoque de movimiento corto. */
export const SceneIn: React.FC<{ children: React.ReactNode; from?: number; dur?: number }> = ({ children, from = 1.12, dur = 9 }) => {
  const f = useCurrentFrame();
  const p = ramp(f, 0, dur, EASE_OUT);
  return (
    <AbsoluteFill style={{ scale: String(lerp(from, 1, p)), filter: p < 1 ? `blur(${lerp(10, 0, p)}px)` : undefined }}>{children}</AbsoluteFill>
  );
};

/** Aviso persistente que abre un bucle de curiosidad ("al final…"). */
export const Teaser: React.FC<{ at: number; text: string }> = ({ at, text }) => {
  const f = useCurrentFrame();
  const p = ramp(f, at, at + 10);
  const bob = Math.sin(f / 6) * 4;
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: 1452, display: "flex", justifyContent: "center", opacity: p }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 14,
          padding: "12px 26px",
          borderRadius: 40,
          background: "rgba(6,9,15,0.7)",
          border: "2px solid rgba(244,246,248,0.22)",
          fontFamily: FONT_UI,
          fontWeight: 700,
          fontSize: 30,
          color: COLORS.white,
        }}
      >
        <svg width={26} height={30} viewBox="0 0 26 30" style={{ translate: `0px ${bob}px` }}>
          <path d="M13 3 L13 25 M4 16 L13 25 L22 16" stroke={COLORS.green} strokeWidth={4} fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        {text}
      </div>
    </div>
  );
};
