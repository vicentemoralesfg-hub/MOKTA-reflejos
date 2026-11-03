import React from "react";
import { AbsoluteFill, Img, interpolate, staticFile } from "remotion";
import { C, DISPLAY, UI, fmt } from "../../brand";
import { BACK_OUT, EASE_IN_OUT, EASE_OUT, ramp } from "../../lib/anim";

export const CX = 500; // centro óptico (deja libre la columna de botones de Instagram)

export const Y: React.FC<{ children: React.ReactNode; c?: string }> = ({ children, c = C.yellow }) => <span style={{ color: c }}>{children}</span>;

export const Bg: React.FC<{ f: number; tint?: string }> = ({ f, tint = "rgba(127,211,255,0.08)" }) => (
  <AbsoluteFill style={{ background: C.ink }}>
    <AbsoluteFill style={{ background: `radial-gradient(1000px 800px at ${50 + 6 * Math.sin(f / 70)}% ${38 + 4 * Math.cos(f / 90)}%, ${tint}, transparent 70%)` }} />
  </AbsoluteFill>
);

export const Title: React.FC<{ children: React.ReactNode; top?: number; size?: number; o?: number; pop?: number }> = ({ children, top = 250, size = 96, o = 1, pop = 1 }) => (
  <div
    style={{
      position: "absolute",
      top,
      left: 50,
      width: CX * 2 - 100,
      textAlign: "center",
      fontFamily: DISPLAY,
      fontWeight: 800,
      fontSize: size,
      lineHeight: 0.95,
      color: C.white,
      opacity: o,
      scale: String(interpolate(pop, [0, 1], [1.08, 1])),
      textShadow: "0 6px 30px rgba(0,0,0,0.7)",
    }}
  >
    {children}
  </div>
);

/** Número grande que "rueda" hasta su valor (con separador de miles chileno). */
export const Counter: React.FC<{ value: number; p: number; size?: number; color?: string; prefix?: string; suffix?: string; decimals?: number }> = ({
  value,
  p,
  size = 150,
  color = C.yellow,
  prefix = "",
  suffix = "",
  decimals = 0,
}) => (
  <span style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: size, color, fontVariantNumeric: "tabular-nums", lineHeight: 1 }}>
    {prefix}
    {fmt(value * p, decimals)}
    {suffix}
  </span>
);

export const Countdown: React.FC<{ f: number; a: number; b: number; top?: number }> = ({ f, a, b, top = 1140 }) => {
  if (f < a || f >= b) return null;
  const p = (f - a) / (b - a);
  const n = Math.max(1, 3 - Math.floor(p * 3));
  const beat = ((p * 3) % 1);
  return (
    <div style={{ position: "absolute", top, left: CX - 62, width: 124, height: 124 }}>
      <svg width={124} height={124} viewBox="0 0 124 124" style={{ position: "absolute", inset: 0 }}>
        <circle cx={62} cy={62} r={54} fill="rgba(0,0,0,0.55)" stroke="rgba(244,246,248,0.15)" strokeWidth={8} />
        <circle cx={62} cy={62} r={54} fill="none" stroke={C.yellow} strokeWidth={8} strokeLinecap="round" strokeDasharray={2 * Math.PI * 54} strokeDashoffset={2 * Math.PI * 54 * p} transform="rotate(-90 62 62)" />
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: DISPLAY, fontWeight: 800, fontSize: 72, color: C.white, scale: String(interpolate(beat, [0, 0.2, 1], [1.3, 1, 1])) }}>{n}</div>
    </div>
  );
};

/** Foto en tarjeta redondeada con leve acercamiento continuo; panel tipográfico si no hay foto. */
export const PhotoCard: React.FC<{
  src: string | null;
  f: number;
  w: number;
  h: number;
  x: number;
  y: number;
  label?: string;
  sub?: string;
  border?: string;
  objectPosition?: string;
  zoom?: number;
  dim?: number;
}> = ({ src, f, w, h, x, y, label, sub, border = "rgba(244,246,248,0.14)", objectPosition = "50% 50%", zoom = 0.08, dim = 0 }) => (
  <div style={{ position: "absolute", left: x, top: y, width: w, height: h, borderRadius: 28, overflow: "hidden", background: "linear-gradient(135deg,#151922,#0B0E14)", border: `2px solid ${border}`, boxShadow: "0 20px 60px rgba(0,0,0,0.5)" }}>
    {src ? (
      <Img src={staticFile(src)} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition, transform: `scale(${1.03 + zoom * Math.min(1, f / 150)})` }} />
    ) : (
      <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: DISPLAY, fontWeight: 800, fontSize: Math.min(140, w / 6), color: "rgba(244,246,248,0.08)", textAlign: "center", padding: 20 }}>{label}</div>
    )}
    {dim > 0 ? <AbsoluteFill style={{ background: `rgba(5,6,10,${dim})` }} /> : null}
    {label && src ? (
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, padding: "40px 22px 14px", background: "linear-gradient(180deg, transparent, rgba(0,0,0,0.85))" }}>
        <div style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: Math.max(34, Math.min(64, w / 12)), lineHeight: 0.95, color: C.white }}>{label}</div>
        {sub ? <div style={{ fontFamily: UI, fontWeight: 600, fontSize: Math.max(20, Math.min(30, w / 28)), color: C.dim, marginTop: 4 }}>{sub}</div> : null}
      </div>
    ) : null}
  </div>
);

/** Grilla 2×2 de opciones para los quiz (con foto opcional). */
export const Options: React.FC<{
  f: number;
  at: number;
  items: { label: string; src?: string | null; sub?: string }[];
  top?: number;
  correct?: number;
  revealAt?: number;
  /** 0..1 por opción: resalta la opción que la voz está nombrando */
  hi?: number[];
  H?: number;
}> = ({ f, at, items, top = 700, correct, revealAt, hi, H = 250 }) => {
  const W = 425;
  return (
    <div style={{ position: "absolute", top, left: 70, width: W * 2 + 20, display: "grid", gridTemplateColumns: `${W}px ${W}px`, gap: 20 }}>
      {items.map((it, i) => {
        const p = ramp(f, at + i * 3, at + 10 + i * 3, BACK_OUT);
        const rev = revealAt !== undefined ? ramp(f, revealAt, revealAt + 8) : 0;
        const ok = correct === i;
        const h = hi?.[i] ?? 0;
        return (
          <div
            key={i}
            style={{
              position: "relative",
              height: H,
              borderRadius: 24,
              overflow: "hidden",
              background: "linear-gradient(135deg,#151922,#0B0E14)",
              border: `3px solid ${ok && rev > 0 ? C.green : h > 0.01 ? C.yellow : "rgba(244,246,248,0.16)"}`,
              boxShadow: h > 0.01 ? `0 0 ${40 * h}px rgba(255,200,61,${0.45 * h})` : undefined,
              opacity: p * (rev > 0 && !ok ? 1 - 0.65 * rev : 1),
              scale: String(interpolate(p, [0, 1], [0.85, 1]) * (ok ? 1 + 0.04 * rev : 1) * (1 + 0.05 * h)),
              zIndex: h > 0.01 ? 2 : 1,
            }}
          >
            {it.src ? <Img src={staticFile(it.src)} style={{ width: "100%", height: "100%", objectFit: "cover", filter: `brightness(${0.8 + 0.15 * h})` }} /> : null}
            {it.sub ? (
              <div style={{ position: "absolute", top: 12, right: 12, padding: "4px 12px", borderRadius: 10, background: "rgba(5,6,10,0.75)", fontFamily: UI, fontWeight: 700, fontSize: 24, color: C.white }}>{it.sub}</div>
            ) : null}
            <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, padding: "36px 16px 12px", background: "linear-gradient(180deg, transparent, rgba(0,0,0,0.9))", display: "flex", alignItems: "center", gap: 12 }}>
              <span style={{ fontFamily: UI, fontWeight: 800, fontSize: 28, color: C.ink, background: C.yellow, borderRadius: 8, padding: "0 10px" }}>{"ABCD"[i]}</span>
              <span style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: it.label.length > 16 ? 38 : 46, color: C.white, lineHeight: 1 }}>{it.label}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
};

/** Barras horizontales; la escala se reajusta (se "aleja") cuando entra un valor mayor. */
export const Bars: React.FC<{
  rows: { label: string; value: number; color?: string; at: number; unit?: string }[];
  f: number;
  top: number;
  maxW?: number;
  rowH?: number;
}> = ({ rows, f, top, maxW = 560, rowH = 74 }) => {
  const visible = rows.filter((r) => f >= r.at);
  if (!visible.length) return null;
  // máximo animado: interpola entre el máximo anterior y el nuevo durante 14 fotogramas
  let max = visible[0].value;
  for (const r of visible) {
    if (r.value > max) max = max + (r.value - max) * ramp(f, r.at, r.at + 16, EASE_IN_OUT);
  }
  return (
    <div style={{ position: "absolute", top, left: 70, width: 860 }}>
      {visible.map((r) => {
        const p = ramp(f, r.at, r.at + 12, EASE_OUT);
        const w = Math.max(6, (r.value / max) * maxW * p);
        return (
          <div key={r.label} style={{ display: "flex", alignItems: "center", height: rowH, gap: 14, opacity: Math.min(1, p * 2) }}>
            <div style={{ width: 250, textAlign: "right", fontFamily: UI, fontWeight: 700, fontSize: 30, color: C.white, whiteSpace: "nowrap", overflow: "hidden" }}>{r.label}</div>
            <div style={{ height: 30, width: w, borderRadius: 15, background: r.color ?? C.white, boxShadow: r.color ? `0 0 24px ${r.color}55` : undefined }} />
            <div style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: 40, color: r.color ?? C.white, whiteSpace: "nowrap" }}>
              {fmt(r.value * Math.min(1, p * 1.2), 0)}
              {r.unit ? <span style={{ fontSize: 26, marginLeft: 6 }}>{r.unit}</span> : null}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export const Cta: React.FC<{ f: number; a: number; title: React.ReactNode; pill: string; size?: number }> = ({ f, a, title, pill, size = 110 }) => (
  <AbsoluteFill style={{ opacity: ramp(f, a - 6, a + 4) }}>
    <Title top={330} size={size} pop={ramp(f, a, a + 12, BACK_OUT)}>
      {title}
    </Title>
    <div style={{ position: "absolute", top: 640, left: CX - 340, width: 680, textAlign: "center", padding: "20px 10px", borderRadius: 22, background: C.yellow, color: C.ink, fontFamily: UI, fontWeight: 800, fontSize: 38, opacity: ramp(f, a + 10, a + 20), scale: String(interpolate(ramp(f, a + 10, a + 22, BACK_OUT), [0, 1], [0.85, 1])) }}>
      {pill}
    </div>
    <div style={{ position: "absolute", top: 780, left: 0, width: CX * 2, textAlign: "center", fontFamily: DISPLAY, fontWeight: 700, fontSize: 44, letterSpacing: 20, color: "rgba(244,246,248,0.6)", opacity: ramp(f, a + 18, a + 30) }}>
      MOKTA
    </div>
  </AbsoluteFill>
);

export const fadeWin = (f: number, a: number, b: number, inF = 8, outF = 6) => Math.min(ramp(f, a - inF, a), 1 - ramp(f, b - outF, b));
export { BACK_OUT, EASE_IN_OUT, EASE_OUT, ramp };
