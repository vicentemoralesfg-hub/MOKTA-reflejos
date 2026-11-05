import React from "react";
import { interpolate } from "remotion";
import { useAbsFrame } from "../lib/frame";
import { COLORS, FONT_DISPLAY, FONT_UI } from "../config";
import { BACK, ramp } from "../lib/anim";

/** Etiqueta tipo "píldora" que entra con rebote en el fotograma `at`. */
export const Pill: React.FC<{
  at: number;
  out?: number;
  x: number;
  y: number;
  color: string;
  text: string;
  icon?: React.ReactNode;
  size?: number;
  textColor?: string;
}> = ({ at, out, x, y, color, text, icon, size = 44, textColor = "#05070B" }) => {
  const f = useAbsFrame();
  const p = ramp(f, at, at + 8, BACK);
  const o = out !== undefined ? 1 - ramp(f, out, out + 6) : 1;
  if (p <= 0 || o <= 0) return null;
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        translate: "-50% -50%",
        scale: String(interpolate(p, [0, 1], [0.6, 1])),
        opacity: Math.min(p * 2, 1) * o,
        display: "flex",
        alignItems: "center",
        gap: 14,
        padding: `${size * 0.28}px ${size * 0.62}px`,
        borderRadius: 999,
        background: color,
        color: textColor,
        fontFamily: FONT_DISPLAY,
        fontWeight: 800,
        fontSize: size,
        letterSpacing: 2,
        whiteSpace: "nowrap",
        boxShadow: `0 10px 40px rgba(0,0,0,0.5), 0 0 40px ${color}55`,
      }}
    >
      {icon}
      {text}
    </div>
  );
};

/** Sello circular ✕ / ✓. */
export const Stamp: React.FC<{ at: number; x: number; y: number; kind: "x" | "check"; size?: number; out?: number }> = ({
  at,
  x,
  y,
  kind,
  size = 220,
  out,
}) => {
  const f = useAbsFrame();
  const p = ramp(f, at, at + 9, BACK);
  const o = out !== undefined ? 1 - ramp(f, out, out + 6) : 1;
  if (p <= 0 || o <= 0) return null;
  const c = kind === "x" ? COLORS.red : COLORS.green;
  const draw = ramp(f, at + 2, at + 12);
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      style={{
        position: "absolute",
        left: x - size / 2,
        top: y - size / 2,
        scale: String(interpolate(p, [0, 1], [1.8, 1])),
        rotate: `${interpolate(p, [0, 1], [-14, 0])}deg`,
        opacity: Math.min(1, p * 2) * o,
        filter: `drop-shadow(0 0 18px ${c}aa)`,
        overflow: "visible",
      }}
    >
      <circle cx={50} cy={50} r={44} fill="rgba(5,7,11,0.82)" stroke={c} strokeWidth={6} />
      {kind === "x" ? (
        <path
          d="M 32,32 L 68,68 M 68,32 L 32,68"
          stroke={c}
          strokeWidth={10}
          strokeLinecap="round"
          pathLength={1}
          strokeDasharray={1}
          strokeDashoffset={1 - draw}
          fill="none"
        />
      ) : (
        <path
          d="M 28,52 L 44,67 L 72,36"
          stroke={c}
          strokeWidth={10}
          strokeLinecap="round"
          strokeLinejoin="round"
          pathLength={1}
          strokeDasharray={1}
          strokeDashoffset={1 - draw}
          fill="none"
        />
      )}
    </svg>
  );
};

/** Anillo que se dibuja alrededor de un punto + pulso. */
export const Ring: React.FC<{ at: number; x: number; y: number; r: number; color?: string; out?: number; width?: number }> = ({
  at,
  x,
  y,
  r,
  color = COLORS.red,
  out,
  width = 10,
}) => {
  const f = useAbsFrame();
  const draw = ramp(f, at, at + 10);
  const o = out !== undefined ? 1 - ramp(f, out, out + 6) : 1;
  if (draw <= 0 || o <= 0) return null;
  const pulse = ((f - at) % 24) / 24;
  return (
    <svg
      width={r * 4}
      height={r * 4}
      style={{ position: "absolute", left: x - r * 2, top: y - r * 2, overflow: "visible", opacity: o }}
    >
      <circle
        cx={r * 2}
        cy={r * 2}
        r={r}
        fill="none"
        stroke={color}
        strokeWidth={width}
        pathLength={1}
        strokeDasharray={1}
        strokeDashoffset={1 - draw}
        transform={`rotate(-90 ${r * 2} ${r * 2})`}
        style={{ filter: `drop-shadow(0 0 12px ${color})` }}
      />
      {draw >= 1 ? (
        <circle cx={r * 2} cy={r * 2} r={r * (1 + pulse * 0.5)} fill="none" stroke={color} strokeWidth={width * 0.5} opacity={1 - pulse} />
      ) : null}
    </svg>
  );
};

/** Flecha gruesa (dirección en grados, 0 = derecha, 90 = abajo). */
export const Arrow: React.FC<{
  x: number;
  y: number;
  angle: number;
  length: number;
  color?: string;
  opacity?: number;
  thickness?: number;
}> = ({ x, y, angle, length, color = COLORS.yellow, opacity = 1, thickness = 26 }) => (
  <svg
    width={length + 80}
    height={120}
    viewBox={`0 0 ${length + 80} 120`}
    style={{
      position: "absolute",
      left: x,
      top: y - 60,
      transformOrigin: "0 60px",
      rotate: `${angle}deg`,
      opacity,
      overflow: "visible",
      filter: "drop-shadow(0 6px 18px rgba(0,0,0,0.6))",
    }}
  >
    <path
      d={`M 0,${60 - thickness / 2} H ${length} V ${60 - thickness * 1.5} L ${length + 70},60 L ${length},${60 + thickness * 1.5} V ${60 + thickness / 2} H 0 Z`}
      fill={color}
      stroke="rgba(0,0,0,0.6)"
      strokeWidth={3}
    />
  </svg>
);

export const Kicker: React.FC<{ text: string; at: number; y: number; color?: string; size?: number; out?: number }> = ({
  text,
  at,
  y,
  color = COLORS.white,
  size = 40,
  out,
}) => {
  const f = useAbsFrame();
  const p = ramp(f, at, at + 8);
  const o = out !== undefined ? 1 - ramp(f, out, out + 6) : 1;
  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        top: y,
        textAlign: "center",
        fontFamily: FONT_UI,
        fontWeight: 700,
        fontSize: size,
        letterSpacing: 6,
        color,
        opacity: p * o,
        translate: `0 ${interpolate(p, [0, 1], [16, 0])}px`,
        textShadow: "0 4px 18px rgba(0,0,0,0.8)",
      }}
    >
      {text}
    </div>
  );
};

/* ---------------------------------------------------------------- íconos */
export const IconBookmark: React.FC<{ size: number; color?: string; fill?: number }> = ({ size, color = COLORS.white, fill = 0 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24">
    <path d="M6 3h12v18l-6-4.5L6 21z" fill={color} fillOpacity={fill} stroke={color} strokeWidth={2} strokeLinejoin="round" />
  </svg>
);

export const IconShare: React.FC<{ size: number; color?: string }> = ({ size, color = COLORS.white }) => (
  <svg width={size} height={size} viewBox="0 0 24 24">
    <path d="M22 2 11 13" stroke={color} strokeWidth={2} strokeLinecap="round" fill="none" />
    <path d="M22 2 15 22l-4-9-9-4z" stroke={color} strokeWidth={2} strokeLinejoin="round" fill="none" />
  </svg>
);

export const IconSun: React.FC<{ size: number; color?: string }> = ({ size, color = COLORS.yellow }) => (
  <svg width={size} height={size} viewBox="0 0 24 24">
    <circle cx={12} cy={12} r={4.5} fill={color} />
    {Array.from({ length: 8 }, (_, i) => {
      const a = (i * Math.PI) / 4;
      return (
        <line
          key={i}
          x1={12 + Math.cos(a) * 7.5}
          y1={12 + Math.sin(a) * 7.5}
          x2={12 + Math.cos(a) * 10.5}
          y2={12 + Math.sin(a) * 10.5}
          stroke={color}
          strokeWidth={2}
          strokeLinecap="round"
        />
      );
    })}
  </svg>
);

export const IconMoon: React.FC<{ size: number; color?: string }> = ({ size, color = COLORS.accent }) => (
  <svg width={size} height={size} viewBox="0 0 24 24">
    <path d="M20 14.5A8.5 8.5 0 0 1 9.5 4a8.5 8.5 0 1 0 10.5 10.5z" fill={color} />
  </svg>
);

export const IconWarn: React.FC<{ size: number; color?: string }> = ({ size, color = "#05070B" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24">
    <path d="M12 3 2 21h20z" fill="none" stroke={color} strokeWidth={2.4} strokeLinejoin="round" />
    <line x1={12} y1={10} x2={12} y2={15} stroke={color} strokeWidth={2.4} strokeLinecap="round" />
    <circle cx={12} cy={18} r={1.3} fill={color} />
  </svg>
);
