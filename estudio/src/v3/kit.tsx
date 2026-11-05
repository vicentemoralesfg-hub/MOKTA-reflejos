import React, { createContext, useContext } from "react";
import { AbsoluteFill, Img, interpolate, staticFile } from "remotion";
import { DISPLAY, UI, fmt } from "../brand";
import { BACK_OUT, EASE_IN_OUT, EASE_OUT, ramp } from "../lib/anim";

/**
 * Kit visual v3 · más color, profundidad y movimiento.
 * Cada reel define su paleta (Theme) y la entrega por contexto a todos los componentes.
 */
export type Theme = {
  bg0: string; // fondo profundo
  bg1: string; // fondo secundario (degradado)
  a1: string; // acento principal (neón)
  a2: string; // acento secundario
  hot: string; // advertencia / contraste cálido
  text: string;
  ink: string; // texto sobre acento
};
const Ctx = createContext<Theme>({ bg0: "#05070D", bg1: "#0B1020", a1: "#00E5FF", a2: "#FF3CAC", hot: "#FF6B2C", text: "#F5F7FA", ink: "#05070D" });
export const ThemeP = Ctx.Provider;
export const useT = () => useContext(Ctx);

export const MONO = "'DejaVu Sans Mono', 'Courier New', monospace";
export { BACK_OUT, EASE_IN_OUT, EASE_OUT, ramp, DISPLAY, UI, fmt };

/** pseudoaleatorio determinista 0..1 */
export const rnd = (i: number, s = 0) => {
  const x = Math.sin(i * 127.1 + s * 311.7) * 43758.5453;
  return x - Math.floor(x);
};
export const alpha = (hex: string, a: number) => {
  const h = hex.replace("#", "");
  const n = parseInt(h.length === 3 ? h.split("").map((c) => c + c).join("") : h, 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
};
/** golpe de zoom que decae (para acentuar beats) */
export const punch = (f: number, at: number, amt = 0.05, d = 14) => (f < at || f > at + d ? 0 : amt * Math.pow(1 - (f - at) / d, 2));
export const shake = (f: number, at: number, amt = 14, d = 12) => {
  if (f < at || f > at + d) return { x: 0, y: 0 };
  const k = Math.pow(1 - (f - at) / d, 2) * amt;
  return { x: Math.sin(f * 2.7) * k, y: Math.cos(f * 3.3) * k };
};
export const win = (f: number, a: number, b: number, inF = 6, outF = 6) => Math.min(ramp(f, a - inF, a), 1 - ramp(f, b - outF, b));

/* ------------------------------------------------------------------ escenario */
export const Stage: React.FC<{ f: number; grid?: boolean; gridSpeed?: number; aurora?: number; grain?: boolean; children?: React.ReactNode; tint?: string }> = ({
  f,
  grid = false,
  gridSpeed = 6,
  aurora = 1,
  grain = true,
  children,
  tint,
}) => {
  const T = useT();
  const blob = (c: string, x: number, y: number, s: number, k: number) => (
    <div
      style={{
        position: "absolute",
        left: x + 120 * Math.sin(f / (70 + k * 13) + k),
        top: y + 90 * Math.cos(f / (90 + k * 11) + k * 2),
        width: s,
        height: s,
        borderRadius: "50%",
        background: `radial-gradient(circle, ${alpha(c, 0.55 * aurora)} 0%, transparent 65%)`,
        filter: "blur(40px)",
      }}
    />
  );
  return (
    <AbsoluteFill style={{ background: `linear-gradient(170deg, ${T.bg1} 0%, ${T.bg0} 55%, ${T.bg0} 100%)`, overflow: "hidden" }}>
      {aurora > 0 ? (
        <AbsoluteFill style={{ opacity: 0.85 }}>
          {blob(T.a1, -260, -160, 1000, 1)}
          {blob(T.a2, 420, 520, 1100, 2)}
          {blob(tint ?? T.a1, -200, 1250, 900, 3)}
        </AbsoluteFill>
      ) : null}
      {grid ? (
        <div style={{ position: "absolute", left: -1100, top: 1160, width: 3280, height: 1700, perspective: 700, perspectiveOrigin: "50% 0%" }}>
          <div
            style={{
              position: "absolute",
              inset: 0,
              transform: "rotateX(72deg)",
              transformOrigin: "50% 0%",
              backgroundImage: `linear-gradient(${alpha(T.a1, 0.55)} 2px, transparent 2px), linear-gradient(90deg, ${alpha(T.a1, 0.55)} 2px, transparent 2px)`,
              backgroundSize: "120px 120px",
              backgroundPosition: `0px ${(f * gridSpeed) % 120}px`,
              maskImage: "linear-gradient(180deg, transparent 0%, black 25%, black 60%, transparent 100%)",
            }}
          />
        </div>
      ) : null}
      {children}
      {grain ? <Grain f={f} /> : null}
      <AbsoluteFill style={{ background: "radial-gradient(ellipse 85% 70% at 50% 45%, transparent 55%, rgba(0,0,0,0.55) 100%)", pointerEvents: "none" }} />
    </AbsoluteFill>
  );
};

export const Grain: React.FC<{ f: number; o?: number }> = ({ f, o = 0.08 }) => (
  <svg width={1080} height={1920} style={{ position: "absolute", inset: 0, opacity: o, mixBlendMode: "overlay", pointerEvents: "none" }}>
    <filter id={`g${Math.floor(f / 2) % 6}`}>
      <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves={2} seed={Math.floor(f / 2) % 6} />
    </filter>
    <rect width="100%" height="100%" filter={`url(#g${Math.floor(f / 2) % 6})`} />
  </svg>
);

/** cámara: escala / desplazamiento / giro de toda una escena */
export const Cam: React.FC<{ s?: number; x?: number; y?: number; r?: number; ox?: number; oy?: number; children: React.ReactNode; style?: React.CSSProperties }> = ({
  s = 1,
  x = 0,
  y = 0,
  r = 0,
  ox = 540,
  oy = 960,
  children,
  style,
}) => <AbsoluteFill style={{ transformOrigin: `${ox}px ${oy}px`, transform: `translate(${x}px, ${y}px) rotate(${r}deg) scale(${s})`, ...style }}>{children}</AbsoluteFill>;

/* ------------------------------------------------------------------ tipografía */
export const glow = (c: string, k = 1) => `0 0 ${6 * k}px ${alpha(c, 0.9)}, 0 0 ${20 * k}px ${alpha(c, 0.6)}, 0 0 ${48 * k}px ${alpha(c, 0.35)}`;
export const Neon: React.FC<{ c?: string; k?: number; children: React.ReactNode }> = ({ c, k = 1, children }) => {
  const T = useT();
  const col = c ?? T.a1;
  return <span style={{ color: col, textShadow: glow(col, k) }}>{children}</span>;
};
export const Grad: React.FC<{ from?: string; to?: string; angle?: number; children: React.ReactNode }> = ({ from, to, angle = 100, children }) => {
  const T = useT();
  return (
    <span
      style={{
        background: `linear-gradient(${angle}deg, ${from ?? T.a1}, ${to ?? T.a2})`,
        WebkitBackgroundClip: "text",
        backgroundClip: "text",
        color: "transparent",
        filter: `drop-shadow(0 0 18px ${alpha(from ?? T.a1, 0.45)})`,
      }}
    >
      {children}
    </span>
  );
};

const GLYPHS = "#%&@$0123456789XYZ/<>[]{}=+*";
/** Texto que se escribe con efecto "código de sistema": caracteres aleatorios que se resuelven + cursor. */
export const Decode: React.FC<{ text: string; f: number; at: number; cps?: number; color?: string; caret?: boolean; scramble?: number }> = ({
  text,
  f,
  at,
  cps = 1.2,
  color,
  caret = true,
  scramble = 3,
}) => {
  const T = useT();
  const n = Math.floor(Math.max(0, f - at) * cps);
  const done = n >= text.length;
  return (
    <span>
      {text.split("").map((ch, i) => {
        if (ch === " " || ch === "\n") return <span key={i}>{ch}</span>;
        if (i < n) return <span key={i}>{ch}</span>;
        if (i < n + scramble && f >= at)
          return (
            <span key={i} style={{ color: color ?? T.a1, opacity: 0.85 }}>
              {GLYPHS[Math.floor(rnd(i, Math.floor(f / 2)) * GLYPHS.length)]}
            </span>
          );
        return (
          <span key={i} style={{ opacity: 0 }}>
            {ch}
          </span>
        );
      })}
      {caret && (!done || Math.floor(f / 8) % 2 === 0) && f >= at ? (
        <span style={{ display: "inline-block", width: "0.45em", height: "0.85em", marginLeft: 6, verticalAlign: "-0.05em", background: color ?? T.a1, boxShadow: glow(color ?? T.a1, 0.6) }} />
      ) : null}
    </span>
  );
};

/* ------------------------------------------------------------------ efectos */
export const Flash: React.FC<{ f: number; at: number; color?: string; d?: number; x?: number; y?: number; ring?: boolean }> = ({ f, at, color, d = 16, x = 540, y = 960, ring = true }) => {
  const T = useT();
  if (f < at || f > at + d) return null;
  const p = (f - at) / d;
  const c = color ?? T.a1;
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <AbsoluteFill style={{ background: `radial-gradient(circle at ${x}px ${y}px, ${alpha("#FFFFFF", 0.55 * (1 - p))} 0%, ${alpha(c, 0.35 * (1 - p))} 30%, transparent 70%)` }} />
      {ring ? (
        <div style={{ position: "absolute", left: x - 600 * p - 20, top: y - 600 * p - 20, width: 1200 * p + 40, height: 1200 * p + 40, borderRadius: "50%", border: `${10 * (1 - p) + 2}px solid ${alpha(c, 0.8 * (1 - p))}`, boxShadow: `0 0 40px ${alpha(c, 0.6 * (1 - p))}` }} />
      ) : null}
    </AbsoluteFill>
  );
};

/** barrido diagonal de color que tapa un corte de escena (pico de cobertura en `at`) */
export const Wipe: React.FC<{ f: number; at: number; d?: number; c1?: string; c2?: string }> = ({ f, at, d = 16, c1, c2 }) => {
  const T = useT();
  if (f < at - d / 2 || f > at + d / 2) return null;
  const p = (f - (at - d / 2)) / d; // 0..1
  const x = interpolate(p, [0, 1], [-2600, 2600], { easing: EASE_IN_OUT });
  return (
    <AbsoluteFill style={{ pointerEvents: "none", overflow: "hidden" }}>
      <div style={{ position: "absolute", left: x - 700, top: -600, width: 2200, height: 3200, transform: "rotate(14deg)", background: `linear-gradient(90deg, transparent 0%, ${c1 ?? T.a1} 18%, ${c2 ?? T.a2} 50%, ${T.bg0} 70%, ${T.bg0} 92%, transparent 100%)` }} />
    </AbsoluteFill>
  );
};

/** partículas: polvo luminoso que sube o rayos de velocidad desde el centro */
export const Particles: React.FC<{ f: number; n?: number; kind?: "dust" | "warp" | "rise"; color?: string; seed?: number; speed?: number; o?: number; cx?: number; cy?: number }> = ({
  f,
  n = 40,
  kind = "dust",
  color,
  seed = 1,
  speed = 1,
  o = 1,
  cx = 540,
  cy = 900,
}) => {
  const T = useT();
  const c = color ?? T.a1;
  const items: React.ReactNode[] = [];
  for (let i = 0; i < n; i++) {
    const r1 = rnd(i, seed), r2 = rnd(i + 99, seed), r3 = rnd(i + 199, seed);
    if (kind === "warp") {
      const a = r1 * Math.PI * 2;
      const d = (r2 + f * speed * 0.012) % 1;
      const rr = Math.pow(d, 2.2) * 1500 + 40;
      const len = 30 + rr * 0.25;
      items.push(<line key={i} x1={cx + Math.cos(a) * rr} y1={cy + Math.sin(a) * rr} x2={cx + Math.cos(a) * (rr + len)} y2={cy + Math.sin(a) * (rr + len)} stroke={c} strokeWidth={1.5 + r3 * 3} strokeLinecap="round" opacity={d * 0.8 * o} />);
    } else {
      const x = r1 * 1080 + Math.sin(f / 30 + i) * 20;
      const vy = kind === "rise" ? 6 : 1.4;
      const y = (((r2 * 2100 - f * speed * vy * (0.5 + r3)) % 2100) + 2100) % 2100 - 90;
      const s = 2 + r3 * 5;
      items.push(<circle key={i} cx={x} cy={y} r={s} fill={c} opacity={(0.25 + 0.6 * Math.abs(Math.sin(f / 15 + i))) * o} />);
    }
  }
  return (
    <svg width={1080} height={1920} style={{ position: "absolute", inset: 0, pointerEvents: "none", filter: `drop-shadow(0 0 6px ${c})` }}>
      {items}
    </svg>
  );
};

/* ------------------------------------------------------------------ superficies */
export const Glass: React.FC<{ x: number; y: number; w: number; h?: number; r?: number; c?: string; children?: React.ReactNode; style?: React.CSSProperties }> = ({ x, y, w, h, r = 28, c, children, style }) => {
  const T = useT();
  const col = c ?? T.a1;
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        width: w,
        height: h,
        borderRadius: r,
        background: `linear-gradient(160deg, ${alpha("#FFFFFF", 0.1)}, ${alpha("#FFFFFF", 0.03)})`,
        border: `2px solid ${alpha(col, 0.55)}`,
        boxShadow: `0 30px 70px rgba(0,0,0,0.55), 0 0 30px ${alpha(col, 0.25)}, inset 0 1px 0 ${alpha("#FFFFFF", 0.25)}`,
        ...style,
      }}
    >
      {children}
    </div>
  );
};

export const Chip: React.FC<{ children: React.ReactNode; c?: string; solid?: boolean; size?: number; style?: React.CSSProperties }> = ({ children, c, solid = false, size = 34, style }) => {
  const T = useT();
  const col = c ?? T.a1;
  return (
    <div
      style={{
        display: "inline-block",
        padding: `${size * 0.32}px ${size * 0.62}px`,
        borderRadius: 999,
        background: solid ? col : alpha(col, 0.12),
        border: `2px solid ${col}`,
        color: solid ? T.ink : col,
        fontFamily: UI,
        fontWeight: 800,
        fontSize: size,
        letterSpacing: 1,
        whiteSpace: "nowrap",
        boxShadow: `0 0 24px ${alpha(col, solid ? 0.6 : 0.35)}`,
        textShadow: solid ? undefined : glow(col, 0.35),
        ...style,
      }}
    >
      {children}
    </div>
  );
};

/** Foto en tarjeta con perspectiva, borde de luz, reflejo que la cruza y sombra profunda. */
export const Card3D: React.FC<{
  src: string | null;
  f: number;
  x: number;
  y: number;
  w: number;
  h: number;
  enter?: number;
  ry?: number;
  rx?: number;
  rim?: string;
  objectPosition?: string;
  zoom?: number;
  label?: React.ReactNode;
  sub?: React.ReactNode;
  children?: React.ReactNode;
  filter?: string;
}> = ({ src, f, x, y, w, h, enter = 1, ry = -10, rx = 5, rim, objectPosition = "50% 50%", zoom = 0.1, label, sub, children, filter }) => {
  const T = useT();
  const col = rim ?? T.a1;
  const e = Math.max(0, Math.min(1, enter));
  const tiltY = ry * (1 - e) * 3 + Math.sin(f / 40) * 3;
  const tiltX = rx * (1 - e) * 2 + Math.cos(f / 50) * 2;
  const sweep = interpolate(f, [4, 34], [-60, 160], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: EASE_IN_OUT });
  return (
    <div style={{ position: "absolute", left: x, top: y, width: w, height: h, perspective: 1600, opacity: Math.min(1, e * 1.6) }}>
      <div
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: 34,
          overflow: "hidden",
          transform: `rotateY(${tiltY}deg) rotateX(${tiltX}deg) scale(${0.85 + 0.15 * e})`,
          boxShadow: `0 50px 90px rgba(0,0,0,0.65), 0 0 0 3px ${alpha(col, 0.85)}, 0 0 60px ${alpha(col, 0.45)}`,
          background: `linear-gradient(135deg, ${T.bg1}, ${T.bg0})`,
        }}
      >
        {src ? <Img src={staticFile(src)} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition, transform: `scale(${1.06 + zoom * Math.min(1, f / 150)})`, filter }} /> : null}
        <AbsoluteFill style={{ background: `linear-gradient(105deg, transparent ${sweep - 18}%, rgba(255,255,255,0.28) ${sweep}%, transparent ${sweep + 18}%)` }} />
        <AbsoluteFill style={{ background: `linear-gradient(180deg, ${alpha(col, 0.12)} 0%, transparent 30%, transparent 55%, rgba(0,0,0,0.85) 100%)` }} />
        {label ? (
          <div style={{ position: "absolute", left: 30, right: 30, bottom: 24 }}>
            <div style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: Math.max(40, Math.min(76, w / 11)), lineHeight: 0.95, color: T.text, textShadow: "0 4px 20px rgba(0,0,0,0.8)" }}>{label}</div>
            {sub ? <div style={{ fontFamily: UI, fontWeight: 700, fontSize: Math.max(22, Math.min(32, w / 28)), color: col, marginTop: 6, textShadow: glow(col, 0.3) }}>{sub}</div> : null}
          </div>
        ) : null}
        {children}
      </div>
    </div>
  );
};

/** Cuenta regresiva circular de neón con número que late. */
export const Countdown3: React.FC<{ f: number; a: number; b: number; x?: number; y?: number; size?: number }> = ({ f, a, b, x = 540, y = 1250, size = 150 }) => {
  const T = useT();
  if (f < a || f >= b) return null;
  const p = (f - a) / (b - a);
  const n = Math.max(1, 3 - Math.floor(p * 3));
  const beat = (p * 3) % 1;
  const R = size / 2 - 10;
  return (
    <div style={{ position: "absolute", left: x - size / 2, top: y - size / 2, width: size, height: size }}>
      <svg width={size} height={size} style={{ position: "absolute", inset: 0, overflow: "visible", filter: `drop-shadow(0 0 14px ${T.a1})` }}>
        <circle cx={size / 2} cy={size / 2} r={R} fill={alpha(T.bg0, 0.75)} stroke={alpha(T.a1, 0.2)} strokeWidth={10} />
        <circle cx={size / 2} cy={size / 2} r={R} fill="none" stroke={T.a1} strokeWidth={10} strokeLinecap="round" strokeDasharray={2 * Math.PI * R} strokeDashoffset={2 * Math.PI * R * p} transform={`rotate(-90 ${size / 2} ${size / 2})`} />
        <circle cx={size / 2} cy={size / 2} r={R + 22 * beat} fill="none" stroke={alpha(T.a2, 0.7 * (1 - beat))} strokeWidth={4} />
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: DISPLAY, fontWeight: 800, fontSize: size * 0.58, color: T.text, textShadow: glow(T.a1, 0.6), scale: String(interpolate(beat, [0, 0.2, 1], [1.35, 1, 1])) }}>{n}</div>
    </div>
  );
};

/** Opciones del quiz como tarjetas inclinadas con foto; la que la voz nombra se ilumina y sale hacia adelante. */
export const QuizGrid: React.FC<{
  f: number;
  at: number;
  items: { label: string; src?: string | null; sub?: string }[];
  top?: number;
  hi?: number[];
  H?: number;
  blur?: number;
  correct?: number;
  revealAt?: number;
}> = ({ f, at, items, top = 640, hi, H = 290, blur = 0, correct, revealAt }) => {
  const T = useT();
  const W = 440;
  return (
    <div style={{ position: "absolute", top, left: 60, width: 960, height: H * 2 + 24, perspective: 1600 }}>
      {items.map((it, i) => {
        const p = ramp(f, at + i * 3, at + 12 + i * 3, BACK_OUT);
        const h = hi?.[i] ?? 0;
        const rev = revealAt !== undefined ? ramp(f, revealAt, revealAt + 8) : 0;
        const ok = correct === i;
        const col = ok && rev > 0 ? "#3DFF9A" : h > 0.01 ? T.a1 : alpha(T.text, 0.18);
        const cx = (i % 2) * (W + 24);
        const cy = Math.floor(i / 2) * (H + 24);
        const side = i % 2 ? -1 : 1;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: cx,
              top: cy,
              width: W,
              height: H,
              borderRadius: 28,
              overflow: "hidden",
              background: `linear-gradient(135deg, ${T.bg1}, ${T.bg0})`,
              border: `3px solid ${col}`,
              boxShadow: h > 0.01 ? `0 0 ${50 * h}px ${alpha(T.a1, 0.7 * h)}, 0 30px 60px rgba(0,0,0,0.6)` : "0 30px 60px rgba(0,0,0,0.6)",
              opacity: p * (rev > 0 && !ok ? 1 - 0.7 * rev : 1),
              transform: `translateZ(${60 * h}px) rotateY(${side * (1 - p) * 40 + side * 4 * (1 - h)}deg) scale(${interpolate(p, [0, 1], [0.7, 1]) * (1 + 0.06 * h)})`,
              zIndex: h > 0.01 ? 3 : 1,
            }}
          >
            {it.src ? <Img src={staticFile(it.src)} style={{ width: "100%", height: "100%", objectFit: "cover", filter: `saturate(${1 + 0.3 * h}) brightness(${0.7 + 0.3 * h})${blur ? ` blur(${blur}px)` : ""}`, transform: `scale(${1.12 + 0.05 * h})` }} /> : null}
            <AbsoluteFill style={{ background: `linear-gradient(180deg, transparent 35%, ${alpha(T.bg0, 0.95)} 100%)` }} />
            <div style={{ position: "absolute", left: 18, right: 14, bottom: 14, display: "flex", alignItems: "center", gap: 12 }}>
              <span style={{ flex: "none", width: 50, height: 50, borderRadius: 14, background: h > 0.01 ? T.a1 : T.a2, color: T.ink, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: DISPLAY, fontWeight: 800, fontSize: 38, boxShadow: glow(h > 0.01 ? T.a1 : T.a2, 0.5) }}>{"ABCD"[i]}</span>
              <span style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: it.label.length > 16 ? 38 : 46, color: T.text, lineHeight: 0.95 }}>{it.label}</span>
            </div>
            {it.sub ? <div style={{ position: "absolute", top: 12, right: 12, padding: "4px 12px", borderRadius: 10, background: alpha(T.bg0, 0.8), border: `1.5px solid ${alpha(T.a1, 0.6)}`, fontFamily: UI, fontWeight: 700, fontSize: 24, color: T.text }}>{it.sub}</div> : null}
          </div>
        );
      })}
    </div>
  );
};

/** Barras con degradado y brillo; la escala se "aleja" al entrar un valor mayor. */
export const Bars3: React.FC<{ rows: { label: string; value: number; color?: string; at: number; unit?: string; dec?: number }[]; f: number; top: number; maxW?: number; rowH?: number; labelW?: number }> = ({
  rows,
  f,
  top,
  maxW = 520,
  rowH = 78,
  labelW = 250,
}) => {
  const T = useT();
  const visible = rows.filter((r) => f >= r.at);
  if (!visible.length) return null;
  let max = visible[0].value;
  for (const r of visible) if (r.value > max) max = max + (r.value - max) * ramp(f, r.at, r.at + 16, EASE_IN_OUT);
  return (
    <div style={{ position: "absolute", top, left: 60, width: 940 }}>
      {visible.map((r) => {
        const p = ramp(f, r.at, r.at + 14, EASE_OUT);
        const col = r.color ?? T.a1;
        const w = Math.max(8, (r.value / max) * maxW * p);
        return (
          <div key={r.label} style={{ display: "flex", alignItems: "center", height: rowH, gap: 16, opacity: Math.min(1, p * 2) }}>
            <div style={{ width: labelW, textAlign: "right", fontFamily: UI, fontWeight: 800, fontSize: 28, color: T.text, whiteSpace: "nowrap" }}>{r.label}</div>
            <div style={{ position: "relative", height: 38, width: w, borderRadius: 19, background: `linear-gradient(90deg, ${alpha(col, 0.35)}, ${col})`, boxShadow: `0 0 26px ${alpha(col, 0.6)}` }}>
              <div style={{ position: "absolute", right: 4, top: 4, width: 30, height: 30, borderRadius: 15, background: "#FFFFFF", opacity: 0.85, boxShadow: `0 0 18px #FFFFFF` }} />
            </div>
            <div style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: 44, color: col, whiteSpace: "nowrap", textShadow: glow(col, 0.4) }}>
              {fmt(r.value * Math.min(1, p * 1.15), r.dec ?? 0)}
              {r.unit ? <span style={{ fontSize: 28, marginLeft: 6 }}>{r.unit}</span> : null}
            </div>
          </div>
        );
      })}
    </div>
  );
};

/** Cierre con pregunta: título con degradado, pastilla que late, logo. */
export const Cta3: React.FC<{ f: number; a: number; title: React.ReactNode; pill: string; size?: number; top?: number }> = ({ f, a, title, pill, size = 120, top = 330 }) => {
  const T = useT();
  const p = ramp(f, a, a + 14, BACK_OUT);
  return (
    <AbsoluteFill style={{ opacity: ramp(f, a - 4, a + 4) }}>
      <div style={{ position: "absolute", top, left: 40, width: 1000, textAlign: "center", fontFamily: DISPLAY, fontWeight: 800, fontSize: size, lineHeight: 0.92, color: T.text, transform: `scale(${interpolate(p, [0, 1], [1.25, 1])})`, filter: `blur(${(1 - Math.min(1, p)) * 8}px)` }}>{title}</div>
      <div style={{ position: "absolute", top: top + size * 2.2 + 30, left: 0, width: 1080, display: "flex", justifyContent: "center", opacity: ramp(f, a + 10, a + 20), scale: String(1 + 0.03 * Math.sin(f / 5)) }}>
        <Chip solid size={40}>
          {pill}
        </Chip>
      </div>
      <div style={{ position: "absolute", top: top + size * 2.2 + 170, left: 0, width: 1080, textAlign: "center", fontFamily: DISPLAY, fontWeight: 800, fontSize: 52, letterSpacing: 22, color: T.text, opacity: 0.85 * ramp(f, a + 18, a + 30), textShadow: glow(T.a1, 0.4) }}>MOKTA</div>
    </AbsoluteFill>
  );
};
