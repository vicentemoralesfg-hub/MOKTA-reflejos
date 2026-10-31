import React, { useMemo } from "react";
import { plateCanvas } from "../world/assets";
import { C, FONT_DISPLAY } from "./style";
import { Pill } from "./Pill";

/** Círculo que marca un punto de la imagen (el "AQUÍ" del final). */
export const Ring: React.FC<{ x: number; y: number; r: number; opacity: number; color?: string }> = ({ x, y, r, opacity, color = C.red }) => (
  <svg width={1080} height={1920} style={{ position: "absolute", inset: 0, opacity }}>
    <circle cx={x} cy={y} r={r} fill="none" stroke={color} strokeWidth={5} style={{ filter: `drop-shadow(0 0 10px ${color})` }} />
    <circle cx={x} cy={y} r={r + 16} fill="none" stroke={color} strokeOpacity={0.35} strokeWidth={2} />
  </svg>
);

/** Esquinas de visor alrededor de un punto. */
export const Reticle: React.FC<{ x: number; y: number; w: number; h: number; opacity: number; color?: string }> = ({
  x,
  y,
  w,
  h,
  opacity,
  color = C.white,
}) => {
  const L = Math.min(w, h) * 0.28;
  const x0 = x - w / 2;
  const y0 = y - h / 2;
  const x1 = x + w / 2;
  const y1 = y + h / 2;
  const d = [
    `M ${x0} ${y0 + L} L ${x0} ${y0} L ${x0 + L} ${y0}`,
    `M ${x1 - L} ${y0} L ${x1} ${y0} L ${x1} ${y0 + L}`,
    `M ${x1} ${y1 - L} L ${x1} ${y1} L ${x1 - L} ${y1}`,
    `M ${x0 + L} ${y1} L ${x0} ${y1} L ${x0} ${y1 - L}`,
  ].join(" ");
  return (
    <svg width={1080} height={1920} style={{ position: "absolute", inset: 0, opacity }}>
      <path d={d} stroke={color} strokeWidth={4} fill="none" strokeLinecap="round" />
      <line x1={x - 14} y1={y} x2={x + 14} y2={y} stroke={C.red} strokeWidth={2} />
      <line x1={x} y1={y - 14} x2={x} y2={y + 14} stroke={C.red} strokeWidth={2} />
    </svg>
  );
};

const usePlateImages = () =>
  useMemo(() => {
    const src = plateCanvas();
    const small = document.createElement("canvas");
    // reducción en pasos (promedia de verdad, como un sensor con muy pocos píxeles sobre la patente)
    const mid = document.createElement("canvas");
    mid.width = 64;
    mid.height = 20;
    mid.getContext("2d")!.drawImage(src, 0, 0, 64, 20);
    small.width = 16;
    small.height = 5;
    const g = small.getContext("2d")!;
    g.imageSmoothingEnabled = true;
    g.drawImage(mid, 0, 0, 16, 5);
    return { sharp: src.toDataURL("image/png"), pixel: small.toDataURL("image/png") };
  }, []);

const PlateCard: React.FC<{ src: string; pixelated: boolean; label: string; tone: "red" | "key"; opacity: number }> = ({
  src,
  pixelated,
  label,
  tone,
  opacity,
}) => (
  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 18, opacity }}>
    <div
      style={{
        width: 420,
        height: 150,
        borderRadius: 18,
        overflow: "hidden",
        border: `3px solid ${tone === "red" ? C.red : C.key}`,
        boxShadow: `0 10px 40px rgba(0,0,0,0.5), 0 0 30px ${tone === "red" ? C.red : C.key}44`,
        background: "#000",
      }}
    >
      <img
        src={src}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          imageRendering: pixelated ? "pixelated" : "auto",
          filter: pixelated ? "brightness(0.8)" : "none",
        }}
      />
    </div>
    <Pill p={{ text: label, x: 0, y: 0, tone, size: "md", inline: true }} />
  </div>
);

/** Panel de "foto": a la izquierda la patente a 2,9 km (pixelada), a la derecha a ≈200 m (legible). */
export const PlatePanel: React.FC<{ farOpacity: number; nearOpacity: number; split: number }> = ({ farOpacity, nearOpacity, split }) => {
  const img = usePlateImages();
  // split: 0 = tarjeta lejana centrada sola · 1 = las dos lado a lado
  const farX = 540 - split * 250;
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: 250, height: 330 }}>
      <div style={{ position: "absolute", left: farX, top: 0, transform: "translateX(-50%) scale(" + (1 - split * 0.12) + ")", transformOrigin: "50% 0%" }}>
        <PlateCard src={img.pixel} pixelated label="2,9 km" tone="red" opacity={farOpacity} />
      </div>
      <div style={{ position: "absolute", left: 790, top: 0, transform: "translateX(-50%) scale(0.88)", transformOrigin: "50% 0%" }}>
        <PlateCard src={img.sharp} pixelated={false} label="≈200 m" tone="key" opacity={nearOpacity} />
      </div>
    </div>
  );
};

/** Contador grande (cronómetro / tiempo hasta la patrulla). */
export const BigCounter: React.FC<{ value: string; sub?: string; color?: string; opacity: number; y?: number }> = ({
  value,
  sub,
  color = C.white,
  opacity,
  y = 380,
}) => (
  <div style={{ position: "absolute", left: 0, right: 0, top: y, display: "flex", flexDirection: "column", alignItems: "center", opacity }}>
    <div
      style={{
        padding: "10px 46px",
        borderRadius: 999,
        background: C.pillBg,
        border: `2px solid ${C.pillBorder}`,
        fontFamily: FONT_DISPLAY,
        fontWeight: 800,
        fontSize: 132,
        lineHeight: 1.05,
        color,
        fontVariantNumeric: "tabular-nums",
        boxShadow: "0 10px 40px rgba(0,0,0,0.45)",
      }}
    >
      {value}
    </div>
    {sub ? (
      <div style={{ marginTop: 16 }}>
        <Pill p={{ text: sub, x: 0, y: 0, size: "md", tone: "neutral", inline: true }} />
      </div>
    ) : null}
  </div>
);

/** Tarjeta grande centrada (p. ej. "MEDIDO · 140 km/h" / "hace 1 min"). */
export const Card: React.FC<{ title: string; sub?: string; color?: string; opacity: number; scale?: number; y?: number }> = ({
  title,
  sub,
  color = C.red,
  opacity,
  scale = 1,
  y = 640,
}) =>
  opacity <= 0.001 ? null : (
    <div style={{ position: "absolute", left: 0, right: 0, top: y, display: "flex", justifyContent: "center", opacity }}>
      <div
        style={{
          scale: String(scale),
          padding: "26px 54px 22px",
          borderRadius: 40,
          background: "rgba(10,6,14,0.82)",
          border: `4px solid ${color}`,
          boxShadow: `0 0 60px ${color}88, 0 14px 50px rgba(0,0,0,0.6)`,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 6,
        }}
      >
        <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 800, fontSize: 118, lineHeight: 1, color: C.white, letterSpacing: 2, whiteSpace: "nowrap" }}>
          {title}
        </div>
        {sub ? (
          <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 78, lineHeight: 1, color, whiteSpace: "nowrap" }}>{sub}</div>
        ) : null}
      </div>
    </div>
  );

/** Destello, tinte rojo y viñeta para los momentos de escalada. */
export const Fx: React.FC<{ flash?: number; tint?: number; vignette?: number; color?: "red" | "blue" }> = ({
  flash = 0,
  tint = 0,
  vignette = 0,
  color = "red",
}) => (
  <>
    {tint > 0 ? (
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: color === "blue" ? `rgba(60,150,255,${0.35 * tint})` : `rgba(255,30,50,${0.22 * tint})`,
          mixBlendMode: "screen",
        }}
      />
    ) : null}
    {vignette > 0 ? (
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `radial-gradient(75% 55% at 50% 50%, rgba(0,0,0,0) 45%, rgba(120,0,12,${0.75 * vignette}) 100%)`,
        }}
      />
    ) : null}
    {flash > 0 ? (
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `radial-gradient(80% 60% at 50% 45%, rgba(255,255,255,${flash}) 0%, rgba(255,60,70,${flash * 0.85}) 60%, rgba(255,20,40,${flash * 0.7}) 100%)`,
        }}
      />
    ) : null}
  </>
);

/** Esquinas de visor a pantalla completa + REC. */
export const Viewfinder: React.FC<{ x0: number; y0: number; x1: number; y1: number; opacity: number; color?: string }> = ({
  x0,
  y0,
  x1,
  y1,
  opacity,
  color = C.white,
}) => {
  const L = 70;
  const d = [
    `M ${x0} ${y0 + L} L ${x0} ${y0} L ${x0 + L} ${y0}`,
    `M ${x1 - L} ${y0} L ${x1} ${y0} L ${x1} ${y0 + L}`,
    `M ${x1} ${y1 - L} L ${x1} ${y1} L ${x1 - L} ${y1}`,
    `M ${x0 + L} ${y1} L ${x0} ${y1} L ${x0} ${y1 - L}`,
  ].join(" ");
  return (
    <svg width={1080} height={1920} style={{ position: "absolute", inset: 0, opacity }}>
      <path d={d} stroke={color} strokeWidth={6} fill="none" strokeLinecap="round" />
    </svg>
  );
};
