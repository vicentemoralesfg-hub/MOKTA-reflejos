import React from "react";
import { AbsoluteFill } from "remotion";
import { clamp01, easeOut, rise } from "../tl";
import { COL, FONT_D, FONT_UI } from "./style";

/** Palabra de impacto: entra grande y se asienta en 5 fotogramas, con temblor. */
export const Slam: React.FC<{
  T: number;
  at: number;
  until: number;
  text: string;
  color?: string;
  size?: number;
  y?: number;
  sub?: string;
  subColor?: string;
  rotate?: number;
}> = ({ T, at, until, text, color = COL.red, size = 250, y = 560, sub, subColor = COL.white, rotate = -3 }) => {
  if (T < at || T > until) return null;
  const k = clamp01((T - at) / 0.17);
  const sc = 1 + 0.9 * Math.pow(1 - k, 3);
  const out = clamp01((until - T) / 0.12);
  const jit = k < 1 ? (1 - k) * 14 : 0;
  return (
    <AbsoluteFill style={{ pointerEvents: "none", opacity: Math.min(1, k * 3) * out }}>
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: y,
          transform: `translate(${Math.sin(T * 90) * jit}px, -50%) rotate(${rotate}deg) scale(${sc})`,
          textAlign: "center",
          fontFamily: FONT_D,
          fontWeight: 800,
          fontSize: size,
          lineHeight: 0.9,
          color,
          letterSpacing: -2,
          textShadow: `0 0 40px ${color}66, 0 10px 40px rgba(0,0,0,0.7)`,
        }}
      >
        {text}
        {sub ? (
          <div style={{ fontSize: size * 0.3, color: subColor, letterSpacing: 2, marginTop: 14, fontWeight: 700 }}>{sub}</div>
        ) : null}
      </div>
    </AbsoluteFill>
  );
};

/** Paso numerado de la revelación. */
export const StepBadge: React.FC<{ T: number; at: number; n: number; title: string; sub: string; subAt: number }> = ({ T, at, n, title, sub, subAt }) => {
  if (T < at - 0.05) return null;
  const k = rise(T, at, at + 0.3);
  const ks = rise(T, subAt, subAt + 0.3);
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <div style={{ position: "absolute", left: 84, right: 84, top: 250, display: "flex", alignItems: "center", gap: 34 }}>
        <div
          style={{
            width: 168,
            height: 168,
            borderRadius: 84,
            background: COL.green,
            color: COL.ink,
            fontFamily: FONT_D,
            fontWeight: 800,
            fontSize: 140,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transform: `scale(${0.4 + 0.6 * k}) rotate(${(1 - k) * -40}deg)`,
            opacity: k,
            boxShadow: "0 0 50px rgba(46,229,140,0.55)",
            flexShrink: 0,
            lineHeight: 1,
            paddingTop: 6,
          }}
        >
          {n}
        </div>
        <div style={{ fontFamily: FONT_D, fontWeight: 800, color: COL.white, lineHeight: 0.92, textShadow: "0 6px 30px rgba(0,0,0,0.7)" }}>
          <div style={{ fontSize: 104, transform: `translateX(${(1 - k) * 60}px)`, opacity: k }}>{title}</div>
          <div style={{ fontSize: 58, color: COL.green, letterSpacing: 1, marginTop: 8, transform: `translateX(${(1 - ks) * 60}px)`, opacity: ks }}>{sub}</div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

/** Lista de cierre de la maniobra (freno suave · balizas · orillarse). */
export const Checklist: React.FC<{ T: number; items: { at: number; text: string }[]; y?: number }> = ({ T, items, y = 300 }) => (
  <AbsoluteFill style={{ pointerEvents: "none" }}>
    <div style={{ position: "absolute", left: 90, top: y, display: "flex", flexDirection: "column", gap: 22 }}>
      {items.map((it, i) => {
        const k = rise(T, it.at, it.at + 0.25);
        if (T < it.at - 0.02) return null;
        return (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 26, opacity: k, transform: `translateX(${(1 - k) * -80}px)` }}>
            <div
              style={{
                width: 84,
                height: 84,
                borderRadius: 20,
                background: COL.green,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 0 30px rgba(46,229,140,0.5)",
              }}
            >
              <svg width={52} height={52} viewBox="0 0 52 52">
                <path d="M 10 27 L 22 39 L 43 14" fill="none" stroke={COL.ink} strokeWidth={8} strokeLinecap="round" strokeLinejoin="round" strokeDasharray={60} strokeDashoffset={60 * (1 - rise(T, it.at + 0.05, it.at + 0.3))} />
              </svg>
            </div>
            <div style={{ fontFamily: FONT_D, fontWeight: 800, fontSize: 96, color: COL.white, textShadow: "0 6px 30px rgba(0,0,0,0.8)", lineHeight: 1 }}>{it.text}</div>
          </div>
        );
      })}
    </div>
  </AbsoluteFill>
);

/** Rótulo pequeño tipo etiqueta (para HUD). */
export const Tag: React.FC<{ x: number; y: number; text: string; color: string; o?: number; anchor?: "l" | "r" | "c"; size?: number }> = ({
  x,
  y,
  text,
  color,
  o = 1,
  anchor = "l",
  size = 46,
}) => {
  // mantener la etiqueta dentro de la pantalla (ancho aproximado según el texto)
  const w = text.length * size * 0.47 + 40;
  const left0 = anchor === "l" ? x : anchor === "r" ? x - w : x - w / 2;
  const left = Math.min(1080 - 36 - w, Math.max(36, left0));
  return (
  <div
    style={{
      position: "absolute",
      left,
      top: y,
      transform: `translate(0, -50%) scale(${0.85 + 0.15 * o})`,
      opacity: o,
      background: color,
      color: COL.ink,
      fontFamily: FONT_D,
      fontWeight: 800,
      fontSize: size,
      padding: "6px 18px 4px",
      borderRadius: 10,
      whiteSpace: "nowrap",
      boxShadow: `0 6px 24px rgba(0,0,0,0.5), 0 0 24px ${color}55`,
      letterSpacing: 1,
    }}
  >
    {text}
  </div>
  );
};

/** Velocímetro grande (HUD) — para "Vas a 100" y "pierde velocidad solo". */
export const SpeedHud: React.FC<{ kmh: number; o: number; y?: number; label?: string; color?: string }> = ({ kmh, o, y = 470, label = "KM/H", color = COL.white }) => {
  const frac = Math.min(1, kmh / 140);
  const R = 190;
  const a0 = Math.PI * 0.8;
  const a1 = Math.PI * 2.2;
  const arc = (f: number) => {
    const a = a0 + (a1 - a0) * f;
    return `${540 + Math.cos(a) * R} ${y + Math.sin(a) * R}`;
  };
  const large = (a1 - a0) * frac > Math.PI ? 1 : 0;
  return (
    <AbsoluteFill style={{ pointerEvents: "none", opacity: o }}>
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
        <path d={`M ${arc(0)} A ${R} ${R} 0 1 1 ${arc(1)}`} fill="none" stroke="rgba(255,255,255,0.18)" strokeWidth={22} strokeLinecap="round" />
        {frac > 0.001 ? <path d={`M ${arc(0)} A ${R} ${R} 0 ${large} 1 ${arc(frac)}`} fill="none" stroke={color} strokeWidth={22} strokeLinecap="round" style={{ filter: `drop-shadow(0 0 14px ${color})` }} /> : null}
        <text x={540} y={y + 40} textAnchor="middle" fontFamily={FONT_D} fontWeight={800} fontSize={190} fill={COL.white} style={{ fontVariantNumeric: "tabular-nums" }}>
          {Math.round(kmh)}
        </text>
        <text x={540} y={y + 110} textAnchor="middle" fontFamily={FONT_UI} fontWeight={600} fontSize={34} fill={COL.dim} letterSpacing={6}>
          {label}
        </text>
      </svg>
    </AbsoluteFill>
  );
};

/** Efecto VHS de rebobinado: líneas, desfase cromático, contador y ◀◀. */
export const RewindFx: React.FC<{ T: number; from: number; to: number; frame: number }> = ({ T, from, to, frame }) => {
  if (T < from || T > to) return null;
  const k = clamp01((T - from) / (to - from));
  const bandY = ((frame * 97) % 1920) - 100;
  const secs = Math.max(0, 4.6 - k * 4.0);
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <AbsoluteFill style={{ background: "repeating-linear-gradient(0deg, rgba(0,0,0,0.25) 0px, rgba(0,0,0,0.25) 2px, rgba(255,255,255,0.03) 3px, rgba(0,0,0,0) 5px)" }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: bandY, height: 90, background: "linear-gradient(180deg, rgba(255,255,255,0), rgba(255,255,255,0.22), rgba(255,255,255,0))", transform: `skewY(-1deg)` }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: (bandY + 900) % 1920, height: 30, background: "rgba(255,255,255,0.12)" }} />
      <div style={{ position: "absolute", left: 80, top: 250, fontFamily: FONT_D, fontWeight: 800, fontSize: 92, color: COL.white, textShadow: "4px 0 0 rgba(255,0,60,0.7), -4px 0 0 rgba(0,220,255,0.7)", display: "flex", alignItems: "center", gap: 18 }}>
        <svg width={110} height={80} viewBox="0 0 110 80">
          <path d="M 52 8 L 8 40 L 52 72 Z M 102 8 L 58 40 L 102 72 Z" fill={COL.white} />
        </svg>
        REBOBINEMOS
      </div>
      <div style={{ position: "absolute", right: 80, top: 268, fontFamily: FONT_UI, fontWeight: 600, fontSize: 44, color: COL.white, opacity: 0.85, textShadow: "3px 0 0 rgba(255,0,60,0.6), -3px 0 0 rgba(0,220,255,0.6)", fontVariantNumeric: "tabular-nums" }}>
        00:0{Math.floor(secs)}:{String(Math.floor((secs % 1) * 30)).padStart(2, "0")}
      </div>
    </AbsoluteFill>
  );
};

/** Golpe blanco breve (reventón). */
export const Flash: React.FC<{ T: number; at: number; dur?: number; color?: string; max?: number }> = ({ T, at, dur = 0.16, color = "#ffffff", max = 0.85 }) => {
  if (T < at || T > at + dur) return null;
  const k = 1 - (T - at) / dur;
  return <AbsoluteFill style={{ background: color, opacity: max * k * k, pointerEvents: "none" }} />;
};

/** Tinte rojo + pulso de viñeta para los congelados. */
export const FreezeTint: React.FC<{ T: number; from: number; o?: number; color?: string }> = ({ T, from, o = 1, color = "rgba(255,30,20,0.28)" }) => {
  if (T < from) return null;
  const beat = Math.exp(-((T - from) % 0.75) * 7);
  const k = easeOut((T - from) / 0.2) * o;
  return (
    <AbsoluteFill style={{ pointerEvents: "none", opacity: k }}>
      <AbsoluteFill style={{ background: color, mixBlendMode: "multiply" }} />
      <AbsoluteFill style={{ background: `radial-gradient(80% 55% at 50% 50%, rgba(0,0,0,0) 40%, rgba(120,0,0,${0.35 + 0.35 * beat}) 100%)` }} />
    </AbsoluteFill>
  );
};
