import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { pop, ramp } from "../lib/anim";
import { fr, WORDS } from "../timing";

/** Titular cinético: entra con resorte (escala + giro leve). */
export const Title: React.FC<{
  at: number;
  out?: number;
  size?: number;
  color?: string;
  stroke?: string;
  bg?: string;
  rotate?: number;
  style?: React.CSSProperties;
  children: React.ReactNode;
}> = ({ at, out, size = 120, color = "#fff", stroke = "#0a0a14", bg, rotate = -3, style, children }) => {
  const f = useCurrentFrame();
  if (f < at) return null;
  const p = pop(f, at, 10, 190);
  const o = out !== undefined ? 1 - ramp(f, out, out + 6) : 1;
  return (
    <div
      style={{
        fontFamily: "Barlow Condensed",
        fontWeight: 800,
        fontSize: size,
        lineHeight: 0.95,
        color,
        textTransform: "uppercase",
        textAlign: "center",
        WebkitTextStroke: bg ? undefined : `${size * 0.06}px ${stroke}`,
        paintOrder: "stroke fill",
        textShadow: bg ? undefined : `0 ${size * 0.06}px 0 ${stroke}, 0 0 ${size * 0.4}px rgba(0,0,0,0.5)`,
        background: bg,
        padding: bg ? `${size * 0.08}px ${size * 0.22}px` : undefined,
        borderRadius: bg ? size * 0.14 : undefined,
        boxShadow: bg ? `0 ${size * 0.1}px 0 rgba(0,0,0,0.35)` : undefined,
        scale: String(0.4 + 0.6 * p),
        rotate: `${rotate * p + (1 - p) * -12}deg`,
        opacity: Math.min(1, p * 3) * o,
        ...style,
      }}
    >
      {children}
    </div>
  );
};

/** Etiqueta tipo sticker. */
export const Tag: React.FC<{ at: number; color: string; textColor?: string; rotate?: number; size?: number; icon?: React.ReactNode; style?: React.CSSProperties; children: React.ReactNode }> = ({
  at,
  color,
  textColor = "#fff",
  rotate = -4,
  size = 64,
  icon,
  style,
  children,
}) => {
  const f = useCurrentFrame();
  if (f < at) return null;
  const p = pop(f, at, 9, 220);
  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 14,
        padding: `${size * 0.16}px ${size * 0.38}px`,
        borderRadius: size * 0.3,
        background: color,
        color: textColor,
        fontFamily: "Barlow Condensed",
        fontWeight: 800,
        fontSize: size,
        textTransform: "uppercase",
        letterSpacing: 1,
        boxShadow: `0 ${size * 0.12}px 0 rgba(0,0,0,0.35), 0 0 ${size * 0.6}px ${color}88`,
        scale: String(p),
        rotate: `${rotate}deg`,
        ...style,
      }}
    >
      {icon}
      {children}
    </div>
  );
};

/* -------------------------------------------------------------- SUBTÍTULOS */
type Chunk = { words: typeof WORDS; s: number; e: number };
const KEY = /^(falso|nada|vale|vista|banco|emisor|oficial|oficiales|beneficiario|fondos|llaves|pago|nunca|foto|timbre|falsificado|adulterado|real|perfecto|uno|dos|tres|cóbralo|juntos|plata|existió|compártelo)$/i;

const chunks: Chunk[] = (() => {
  const out: Chunk[] = [];
  let cur: typeof WORDS = [];
  WORDS.forEach((w, i) => {
    cur.push(w);
    const txt = cur.map((x) => x.w).join(" ");
    const punct = /[.,:?!…]$/.test(w.w);
    const next = WORDS[i + 1];
    const gap = next ? next.s - w.e : 1;
    if (punct || cur.length >= 4 || txt.length > 20 || gap > 0.35 || !next) {
      out.push({ words: cur, s: cur[0].s, e: w.e });
      cur = [];
    }
  });
  return out.map((c, i) => ({ ...c, e: Math.min(out[i + 1]?.s ?? c.e + 0.6, c.e + 0.6) }));
})();

const clean = (w: string) => w.replace(/[.,:?!…¿]/g, "");

/** Subtítulos palabra a palabra (siempre visibles, por si el video se ve sin sonido). */
export const Captions: React.FC<{ top?: number }> = ({ top = 1390 }) => {
  const f = useCurrentFrame();
  const c = chunks.find((ch) => f >= fr(ch.s) - 2 && f < fr(ch.e));
  if (!c) return null;
  const enter = ramp(f, fr(c.s) - 2, fr(c.s) + 3);
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <div
        style={{
          position: "absolute",
          top,
          left: 70,
          right: 70,
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          gap: "0 22px",
          fontFamily: "Barlow Condensed",
          fontWeight: 800,
          fontSize: 78,
          lineHeight: 1.05,
          textTransform: "uppercase",
          translate: `0px ${(1 - enter) * 30}px`,
          opacity: enter,
        }}
      >
        {c.words.map((w, i) => {
          const active = f >= fr(w.s) && f < fr(c.words[i + 1]?.s ?? c.e);
          const spoken = f >= fr(w.s);
          const key = KEY.test(clean(w.w));
          const p = pop(f, fr(w.s), 12, 260);
          return (
            <span
              key={i}
              style={{
                color: active ? (key ? "#FF2D55" : "#FFD60A") : spoken ? "#fff" : "rgba(255,255,255,0.55)",
                WebkitTextStroke: "12px #07070f",
                paintOrder: "stroke fill",
                textShadow: "0 7px 0 #07070f",
                display: "inline-block",
                scale: active ? String(1 + 0.1 * p) : "1",
              }}
            >
              {clean(w.w)}
            </span>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
