import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { BACK, EASE_OUT, clp, pop, ramp, shake } from "../anim";
import { C, FONT_DISPLAY, FONT_UI } from "../theme";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

// ---------------------------------------------------------------- insignia de zona
export const ZoneBadge: React.FC<{ at: number; color: string; title: string; sub: string; icon?: React.ReactNode; top?: number }> = ({
  at,
  color,
  title,
  sub,
  icon,
  top = 210,
}) => {
  const f = useCurrentFrame();
  const p = pop(f, at, 12);
  return (
    <div style={{ position: "absolute", top, left: 0, right: 0, display: "flex", justifyContent: "center" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 22,
          padding: "16px 36px 16px 22px",
          borderRadius: 999,
          background: "rgba(5,8,20,0.72)",
          border: `4px solid ${color}`,
          boxShadow: `0 0 40px ${color}88, inset 0 0 24px ${color}33`,
          scale: interpolate(p, [0, 1], [0.4, 1]),
          opacity: ramp(f, at, at + 4),
          translate: `0px ${interpolate(p, [0, 1], [-40, 0])}px`,
        }}
      >
        <div
          style={{
            width: 64,
            height: 64,
            borderRadius: 999,
            background: color,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: `0 0 ${20 + 14 * Math.sin(f * 0.3)}px ${color}`,
          }}
        >
          {icon}
        </div>
        <div style={{ display: "flex", flexDirection: "column", lineHeight: 0.95 }}>
          <span style={{ fontFamily: FONT_DISPLAY, fontWeight: 800, fontSize: 64, color: "#fff", letterSpacing: 2 }}>{title}</span>
          <span style={{ fontFamily: FONT_UI, fontWeight: 700, fontSize: 26, color, letterSpacing: 4, textTransform: "uppercase" }}>{sub}</span>
        </div>
      </div>
    </div>
  );
};

// ---------------------------------------------------------------- ficha de riesgo
export type Level = 1 | 2 | 3 | 4 | 5;
const LV_COLOR = ["", C.green, "#9BF24A", C.yellow, C.orange, C.red];
const LV_TEXT = ["", "BAJO", "BAJO", "MEDIO", "ALTO", "CRÍTICO"];

export const Ficha: React.FC<{ at: number; rows: { label: string; level: Level; note?: string }[]; top: number; title?: string; accent: string }> = ({
  at,
  rows,
  top,
  title = "FICHA DEL DAÑO",
  accent,
}) => {
  const f = useCurrentFrame();
  const p = ramp(f, at, at + 10);
  return (
    <div
      style={{
        position: "absolute",
        left: 70,
        right: 70,
        top,
        padding: "22px 30px 18px",
        borderRadius: 28,
        background: "rgba(6,8,20,0.78)",
        border: `3px solid ${accent}99`,
        boxShadow: `0 20px 60px rgba(0,0,0,0.5), 0 0 30px ${accent}44`,
        opacity: p,
        translate: `0px ${interpolate(p, [0, 1], [80, 0])}px`,
      }}
    >
      <div style={{ fontFamily: FONT_UI, fontWeight: 800, fontSize: 24, letterSpacing: 5, color: accent, marginBottom: 10 }}>{title}</div>
      {rows.map((r, i) => {
        const a = at + 6 + i * 5;
        return (
          <div key={r.label} style={{ display: "flex", alignItems: "center", gap: 18, height: 54 }}>
            <div style={{ width: 235, whiteSpace: "nowrap", fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 36, color: "#fff", letterSpacing: 1 }}>{r.label}</div>
            <div style={{ display: "flex", gap: 8, flex: 1 }}>
              {[1, 2, 3, 4, 5].map((k) => {
                const on = k <= r.level ? ramp(f, a + k * 1.5, a + k * 1.5 + 5) : 0;
                return (
                  <div
                    key={k}
                    style={{
                      flex: 1,
                      height: 26,
                      borderRadius: 6,
                      background: "rgba(255,255,255,0.12)",
                      overflow: "hidden",
                    }}
                  >
                    <div style={{ width: `${on * 100}%`, height: "100%", background: LV_COLOR[r.level], boxShadow: `0 0 14px ${LV_COLOR[r.level]}` }} />
                  </div>
                );
              })}
            </div>
            <div
              style={{
                width: 215,
                textAlign: "right",
                whiteSpace: "nowrap",
                fontFamily: FONT_DISPLAY,
                fontWeight: 800,
                fontSize: 34,
                color: LV_COLOR[r.level],
                opacity: ramp(f, a + 8, a + 12),
              }}
            >
              {r.note ?? LV_TEXT[r.level]}
            </div>
          </div>
        );
      })}
    </div>
  );
};

// ---------------------------------------------------------------- etiqueta con línea
export const Callout: React.FC<{
  at: number;
  x: number; // punto en pantalla
  y: number;
  lx: number; // posición etiqueta
  ly: number;
  text: string;
  sub?: string;
  color: string;
  out?: number;
}> = ({ at, x, y, lx, ly, text, sub, color, out }) => {
  const f = useCurrentFrame();
  const p = ramp(f, at, at + 8);
  const q = pop(f, at + 4, 10);
  const o = out !== undefined ? 1 - ramp(f, out, out + 6) : 1;
  if (f < at) return null;
  return (
    <div style={{ position: "absolute", inset: 0, opacity: o, pointerEvents: "none" }}>
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
        <line x1={x} y1={y} x2={x + (lx - x) * p} y2={y + (ly - y) * p} stroke={color} strokeWidth={4} />
        <circle cx={x} cy={y} r={10 + 6 * Math.sin(f * 0.4)} fill="none" stroke={color} strokeWidth={4} />
        <circle cx={x} cy={y} r={6} fill={color} />
      </svg>
      <div
        style={{
          position: "absolute",
          left: lx,
          top: ly,
          translate: "-50% -50%",
          scale: interpolate(q, [0, 1], [0.3, 1]),
          opacity: Math.min(1, q * 3),
          padding: "10px 22px",
          borderRadius: 16,
          background: color,
          color: C.ink,
          fontFamily: FONT_DISPLAY,
          fontWeight: 800,
          fontSize: 44,
          lineHeight: 1,
          textAlign: "center",
          boxShadow: `0 10px 30px rgba(0,0,0,0.45), 0 0 26px ${color}aa`,
          whiteSpace: "nowrap",
        }}
      >
        {text}
        {sub && <div style={{ fontFamily: FONT_UI, fontWeight: 700, fontSize: 22, marginTop: 4, letterSpacing: 1 }}>{sub}</div>}
      </div>
    </div>
  );
};

// ---------------------------------------------------------------- sello
export const Stamp: React.FC<{ at: number; text: string; color: string; x?: number; y: number; rotate?: number; size?: number; sub?: string }> = ({
  at,
  text,
  color,
  x = 540,
  y,
  rotate = -8,
  size = 120,
  sub,
}) => {
  const f = useCurrentFrame();
  if (f < at) return null;
  const s = interpolate(f, [at, at + 5], [2.6, 1], { ...clamp, easing: EASE_OUT });
  const sh = shake(f, at + 5, 10, 10);
  return (
    <div
      style={{
        position: "absolute",
        left: x + sh.x,
        top: y + sh.y,
        translate: "-50% -50%",
        rotate: `${rotate}deg`,
        scale: s,
        opacity: interpolate(f, [at, at + 3], [0, 1], clamp),
        padding: "14px 40px",
        border: `10px solid ${color}`,
        borderRadius: 22,
        color,
        background: "rgba(5,6,16,0.82)",
        fontFamily: FONT_DISPLAY,
        fontWeight: 800,
        fontSize: size,
        lineHeight: 0.95,
        letterSpacing: 3,
        textAlign: "center",
        whiteSpace: "nowrap",
        boxShadow: `0 0 50px ${color}99, 0 20px 50px rgba(0,0,0,0.6)`,
      }}
    >
      {text}
      {sub && <div style={{ fontFamily: FONT_UI, fontSize: size * 0.24, fontWeight: 800, letterSpacing: 4, marginTop: 6 }}>{sub}</div>}
    </div>
  );
};

// ---------------------------------------------------------------- chip de precio
export const PriceChip: React.FC<{ at: number; x: number; y: number; label: string; value: string; color: string; out?: number }> = ({
  at,
  x,
  y,
  label,
  value,
  color,
  out,
}) => {
  const f = useCurrentFrame();
  if (f < at) return null;
  const p = pop(f, at, 10);
  const o = out !== undefined ? 1 - ramp(f, out, out + 6) : 1;
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        translate: "-50% -50%",
        scale: interpolate(p, [0, 1], [0.2, 1]),
        opacity: o,
        display: "flex",
        alignItems: "center",
        gap: 14,
        padding: "10px 20px 10px 12px",
        borderRadius: 999,
        background: "rgba(6,8,20,0.85)",
        border: `3px solid ${color}`,
        boxShadow: `0 0 24px ${color}77`,
        whiteSpace: "nowrap",
      }}
    >
      <div
        style={{
          background: color,
          color: C.ink,
          borderRadius: 999,
          padding: "4px 14px",
          fontFamily: FONT_DISPLAY,
          fontWeight: 800,
          fontSize: 34,
        }}
      >
        {value}
      </div>
      <span style={{ fontFamily: FONT_UI, fontWeight: 700, fontSize: 28, color: "#fff" }}>{label}</span>
    </div>
  );
};

// ---------------------------------------------------------------- contador
export const Counter: React.FC<{ from: number; to: number; a: number; b: number; style?: React.CSSProperties; prefix?: string; format?: (n: number) => string }> = ({
  from,
  to,
  a,
  b,
  style,
  prefix = "",
  format = clp,
}) => {
  const f = useCurrentFrame();
  const v = Math.round(interpolate(f, [a, b], [from, to], { ...clamp, easing: EASE_OUT }) / 10000) * 10000;
  return <span style={{ fontVariantNumeric: "tabular-nums", ...style }}>{prefix + format(v)}</span>;
};

// ---------------------------------------------------------------- texto grande que golpea
export const Slam: React.FC<{ at: number; children: React.ReactNode; y: number; size?: number; color?: string; out?: number; x?: number }> = ({
  at,
  children,
  y,
  size = 150,
  color = "#fff",
  out,
  x = 540,
}) => {
  const f = useCurrentFrame();
  if (f < at) return null;
  const s = interpolate(f, [at, at + 6], [1.9, 1], { ...clamp, easing: BACK });
  const o = Math.min(interpolate(f, [at, at + 3], [0, 1], clamp), out !== undefined ? 1 - ramp(f, out, out + 5) : 1);
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        translate: "-50% -50%",
        scale: s,
        opacity: o,
        fontFamily: FONT_DISPLAY,
        fontWeight: 800,
        fontSize: size,
        lineHeight: 0.92,
        color,
        textAlign: "center",
        whiteSpace: "nowrap",
        letterSpacing: 2,
        textShadow: `0 10px 0 rgba(0,0,0,0.6), 0 0 40px ${color}88`,
      }}
    >
      {children}
    </div>
  );
};

// ---------------------------------------------------------------- iconos
export const Icon: React.FC<{ name: "bolt" | "warn" | "skull" | "check" | "x" | "drop" | "airbag" | "weld" | "scan" | "ruler" | "tag" | "wrench" | "bookmark" | "coin" | "flame"; size?: number; color?: string }> = ({
  name,
  size = 40,
  color = C.ink,
}) => {
  const s = { width: size, height: size };
  const st = { fill: "none", stroke: color, strokeWidth: 2.4, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  switch (name) {
    case "bolt":
      return (
        <svg viewBox="0 0 24 24" style={s}>
          <path {...st} d="M8 3h8l3 5-3 5H8L5 8z" />
          <circle cx={12} cy={8} r={2} fill={color} />
          <path {...st} d="M10 13v8M14 13v8M10 16h4M10 19h4" />
        </svg>
      );
    case "warn":
      return (
        <svg viewBox="0 0 24 24" style={s}>
          <path {...st} d="M12 3 2 21h20z" />
          <path {...st} d="M12 10v5" />
          <circle cx={12} cy={18} r={1.3} fill={color} />
        </svg>
      );
    case "skull":
      return (
        <svg viewBox="0 0 24 24" style={s}>
          <path {...st} d="M5 11a7 7 0 1 1 14 0v3l-2 1v3H7v-3l-2-1z" />
          <circle cx={9} cy={11} r={1.8} fill={color} />
          <circle cx={15} cy={11} r={1.8} fill={color} />
          <path {...st} d="M10 18v-2M14 18v-2" />
        </svg>
      );
    case "check":
      return (
        <svg viewBox="0 0 24 24" style={s}>
          <path {...st} strokeWidth={3.4} d="M4 12.5 9.5 18 20 6" />
        </svg>
      );
    case "x":
      return (
        <svg viewBox="0 0 24 24" style={s}>
          <path {...st} strokeWidth={3.4} d="M5 5l14 14M19 5 5 19" />
        </svg>
      );
    case "drop":
      return (
        <svg viewBox="0 0 24 24" style={s}>
          <path {...st} d="M12 3s7 7.5 7 12a7 7 0 0 1-14 0c0-4.5 7-12 7-12z" />
        </svg>
      );
    case "airbag":
      return (
        <svg viewBox="0 0 24 24" style={s}>
          <circle {...st} cx={12} cy={9} r={6} />
          <path {...st} d="M6 21c1-4 3-5 6-5s5 1 6 5" />
        </svg>
      );
    case "weld":
      return (
        <svg viewBox="0 0 24 24" style={s}>
          <path {...st} d="M3 21l8-8M11 13l3-3 4 4-3 3z" />
          <path {...st} d="M18 5l1-2M20 8l2-1M16 4l-1-2" />
        </svg>
      );
    case "scan":
      return (
        <svg viewBox="0 0 24 24" style={s}>
          <rect {...st} x={4} y={3} width={16} height={18} rx={2} />
          <path {...st} d="M8 8h8M8 12h8M8 16h5" />
        </svg>
      );
    case "ruler":
      return (
        <svg viewBox="0 0 24 24" style={s}>
          <rect {...st} x={2} y={8} width={20} height={8} rx={1} />
          <path {...st} d="M6 8v3M10 8v4M14 8v3M18 8v4" />
        </svg>
      );
    case "tag":
      return (
        <svg viewBox="0 0 24 24" style={s}>
          <path {...st} d="M3 12V4h8l10 10-8 8z" />
          <circle cx={7.5} cy={8} r={1.6} fill={color} />
        </svg>
      );
    case "wrench":
      return (
        <svg viewBox="0 0 24 24" style={s}>
          <path {...st} d="M14 6a4 4 0 0 0 5 5l-9 9-3-3 9-9a4 4 0 0 1-2-2z" />
        </svg>
      );
    case "bookmark":
      return (
        <svg viewBox="0 0 24 24" style={s}>
          <path {...st} d="M6 3h12v18l-6-4-6 4z" />
        </svg>
      );
    case "coin":
      return (
        <svg viewBox="0 0 24 24" style={s}>
          <circle {...st} cx={12} cy={12} r={9} />
          <path {...st} d="M15 9c-1-1-5-1.5-5 1s5 1.5 5 4-4 2-5 1M12 6v2M12 16v2" />
        </svg>
      );
    case "flame":
      return (
        <svg viewBox="0 0 24 24" style={s}>
          <path {...st} d="M12 3c1 4 6 6 6 11a6 6 0 0 1-12 0c0-3 2-4 3-6 1 2 2 2 3 2-1-3 0-5 0-7z" />
        </svg>
      );
  }
};

/** Lupa circular que amplía cualquier contenido (se le pasa el contenido ya escalado y desplazado). */
export const Magnifier: React.FC<{ at: number; x: number; y: number; r: number; color: string; children: React.ReactNode; out?: number }> = ({
  at,
  x,
  y,
  r,
  color,
  children,
  out,
}) => {
  const f = useCurrentFrame();
  if (f < at) return null;
  const p = pop(f, at, 12);
  const o = out !== undefined ? 1 - ramp(f, out, out + 6) : 1;
  return (
    <div
      style={{
        position: "absolute",
        left: x - r,
        top: y - r,
        width: r * 2,
        height: r * 2,
        borderRadius: "50%",
        overflow: "hidden",
        border: `8px solid ${color}`,
        boxShadow: `0 0 0 6px rgba(0,0,0,0.5), 0 0 50px ${color}aa, 0 30px 60px rgba(0,0,0,0.6)`,
        scale: interpolate(p, [0, 1], [0, 1]),
        opacity: o,
        background: "#0b0f20",
      }}
    >
      {children}
    </div>
  );
};

export const fmtM = (n: number) => n.toFixed(1).replace(".", ",");
export { BACK };
