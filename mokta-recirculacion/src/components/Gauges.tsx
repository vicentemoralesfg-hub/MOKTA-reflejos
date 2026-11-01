import React from "react";
import { COLORS, FONT_DISPLAY, FONT_UI } from "../config";
import { lerp } from "../lib/anim";

const polar = (cx: number, cy: number, r: number, deg: number) => {
  const a = ((deg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) };
};

const arc = (cx: number, cy: number, r: number, a0: number, a1: number) => {
  const p0 = polar(cx, cy, r, a0);
  const p1 = polar(cx, cy, r, a1);
  const large = a1 - a0 > 180 ? 1 : 0;
  return `M${p0.x} ${p0.y} A${r} ${r} 0 ${large} 1 ${p1.x} ${p1.y}`;
};

/**
 * Indicador semicircular con aguja (−110° … +110°).
 * `zones`: tramos coloreados del arco en fracción 0..1.
 */
export const Gauge: React.FC<{
  size: number;
  value: number;
  label: string;
  zones: { from: number; to: number; color: string }[];
  minLabel?: string;
  maxLabel?: string;
  icon?: React.ReactNode;
  glow?: string;
}> = ({ size, value, label, zones, minLabel, maxLabel, icon, glow }) => {
  const c = 100;
  const r = 78;
  const A0 = -115;
  const A1 = 115;
  const ang = lerp(A0, A1, Math.max(0, Math.min(1.04, value)));
  const tip = polar(c, c, r - 14, ang);
  return (
    <div style={{ width: size, display: "flex", flexDirection: "column", alignItems: "center" }}>
      <svg width={size} height={size * 0.82} viewBox="0 0 200 164" style={{ overflow: "visible" }}>
        <path d={arc(c, c, r, A0, A1)} stroke="rgba(244,246,248,0.12)" strokeWidth={16} fill="none" strokeLinecap="round" />
        {zones.map((z, i) => (
          <path
            key={i}
            d={arc(c, c, r, lerp(A0, A1, z.from), lerp(A0, A1, z.to))}
            stroke={z.color}
            strokeWidth={16}
            fill="none"
            opacity={0.9}
          />
        ))}
        {Array.from({ length: 11 }, (_, i) => {
          const a = lerp(A0, A1, i / 10);
          const p0 = polar(c, c, r - 16, a);
          const p1 = polar(c, c, r - (i % 5 === 0 ? 30 : 24), a);
          return <line key={i} x1={p0.x} y1={p0.y} x2={p1.x} y2={p1.y} stroke="rgba(244,246,248,0.55)" strokeWidth={i % 5 === 0 ? 3 : 2} />;
        })}
        <line
          x1={c}
          y1={c}
          x2={tip.x}
          y2={tip.y}
          stroke={COLORS.white}
          strokeWidth={6}
          strokeLinecap="round"
          style={glow ? { filter: `drop-shadow(0 0 6px ${glow})` } : undefined}
        />
        <circle cx={c} cy={c} r={11} fill="#11151c" stroke={COLORS.white} strokeWidth={4} />
        {minLabel ? (
          <text x={polar(c, c, r + 24, A0).x} y={polar(c, c, r + 24, A0).y + 14} textAnchor="middle" fontFamily={FONT_DISPLAY} fontWeight={700} fontSize={22} fill={COLORS.dim}>
            {minLabel}
          </text>
        ) : null}
        {maxLabel ? (
          <text x={polar(c, c, r + 24, A1).x} y={polar(c, c, r + 24, A1).y + 14} textAnchor="middle" fontFamily={FONT_DISPLAY} fontWeight={700} fontSize={22} fill={COLORS.dim}>
            {maxLabel}
          </text>
        ) : null}
        {icon ? <g transform="translate(82 118) scale(0.36)">{icon}</g> : null}
      </svg>
      <div style={{ marginTop: 6, fontFamily: FONT_UI, fontWeight: 700, fontSize: size * 0.085, letterSpacing: 3, color: COLORS.dim, textAlign: "center" }}>{label}</div>
    </div>
  );
};

/**
 * Perilla rotatoria del panel. `marks`: posiciones (grados) con su ícono/texto.
 * `angle`: dirección del indicador. `ring`: arco de color opcional (temperatura).
 */
export const Dial: React.FC<{
  size: number;
  angle: number;
  marks: { deg: number; node: React.ReactNode; active?: boolean }[];
  ring?: React.ReactNode;
  label?: string;
  pointerColor?: string;
}> = ({ size, angle, marks, ring, label, pointerColor = COLORS.white }) => {
  const knob = size * 0.56;
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
      <div style={{ position: "relative", width: size, height: size }}>
        {ring ? <div style={{ position: "absolute", inset: 0 }}>{ring}</div> : null}
        {marks.map((m, i) => {
          const p = polar(size / 2, size / 2, size * 0.43, m.deg);
          return (
            <div
              key={i}
              style={{
                position: "absolute",
                left: p.x,
                top: p.y,
                translate: "-50% -50%",
                color: m.active ? COLORS.white : "rgba(244,246,248,0.42)",
                filter: m.active ? `drop-shadow(0 0 8px ${pointerColor})` : undefined,
              }}
            >
              {m.node}
            </div>
          );
        })}
        <div
          style={{
            position: "absolute",
            left: (size - knob) / 2,
            top: (size - knob) / 2,
            width: knob,
            height: knob,
            borderRadius: "50%",
            background: "radial-gradient(circle at 38% 30%, #3a414c 0%, #1a1e25 55%, #0c0e12 100%)",
            boxShadow: `0 ${knob * 0.08}px ${knob * 0.18}px rgba(0,0,0,0.7), inset 0 2px 0 rgba(255,255,255,0.10)`,
            rotate: `${angle}deg`,
          }}
        >
          {/* estrías */}
          <div style={{ position: "absolute", inset: knob * 0.06, borderRadius: "50%", border: "2px dashed rgba(255,255,255,0.07)" }} />
          <div
            style={{
              position: "absolute",
              left: knob / 2 - knob * 0.035,
              top: knob * 0.08,
              width: knob * 0.07,
              height: knob * 0.26,
              borderRadius: knob,
              background: pointerColor,
              boxShadow: `0 0 ${knob * 0.08}px ${pointerColor}`,
            }}
          />
        </div>
      </div>
      {label ? (
        <div style={{ marginTop: 4, fontFamily: FONT_UI, fontWeight: 700, fontSize: Math.max(20, size * 0.11), letterSpacing: 2, color: COLORS.dim }}>{label}</div>
      ) : null}
    </div>
  );
};

/** Arco de temperatura (azul → rojo) para la perilla de temperatura. */
export const TempRing: React.FC<{ size: number }> = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 200 200">
    <defs>
      <linearGradient id="tempRing" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stopColor={COLORS.cold} />
        <stop offset="1" stopColor={COLORS.red} />
      </linearGradient>
    </defs>
    <path d={arc(100, 100, 92, -130, 130)} stroke="url(#tempRing)" strokeWidth={8} fill="none" strokeLinecap="round" opacity={0.85} />
  </svg>
);
