import React from "react";
import { C, FONT_DISPLAY, FONT_UI } from "./style";

/** Velocímetro discreto (abajo a la izquierda, sobre la zona de interfaz de Reels/TikTok). */
export const Speedometer: React.FC<{ kmh: number; opacity?: number }> = ({ kmh, opacity = 1 }) => {
  const R = 74;
  const sweep = 240;
  const start = 150;
  const frac = Math.min(1, kmh / 200);
  const arc = (a0: number, a1: number) => {
    const p = (a: number) => [100 + R * Math.cos((a * Math.PI) / 180), 100 + R * Math.sin((a * Math.PI) / 180)];
    const [x0, y0] = p(a0);
    const [x1, y1] = p(a1);
    return `M ${x0} ${y0} A ${R} ${R} 0 ${a1 - a0 > 180 ? 1 : 0} 1 ${x1} ${y1}`;
  };
  const over = kmh > 120;
  return (
    <div style={{ position: "absolute", left: 56, top: 1395, width: 200, height: 200, opacity }}>
      <div style={{ position: "absolute", inset: 0, borderRadius: 999, background: "rgba(5,12,28,0.55)", border: `1.5px solid ${C.pillBorder}` }} />
      <svg width={200} height={200} style={{ position: "absolute", inset: 0 }}>
        <path d={arc(start, start + sweep)} stroke="rgba(200,220,255,0.18)" strokeWidth={9} fill="none" strokeLinecap="round" />
        <path
          d={arc(start, start + sweep * Math.max(0.001, frac))}
          stroke={over ? C.red : C.blue}
          strokeWidth={9}
          fill="none"
          strokeLinecap="round"
          style={{ filter: `drop-shadow(0 0 6px ${over ? C.red : C.blue})` }}
        />
        {/* marca del límite de 120 km/h */}
        {(() => {
          const a = ((start + sweep * 0.6) * Math.PI) / 180;
          return <line x1={100 + 60 * Math.cos(a)} y1={100 + 60 * Math.sin(a)} x2={100 + 88 * Math.cos(a)} y2={100 + 88 * Math.sin(a)} stroke="rgba(255,255,255,0.75)" strokeWidth={3} />;
        })()}
      </svg>
      <div style={{ position: "absolute", top: 58, width: "100%", textAlign: "center", fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 64, color: C.white, lineHeight: 1 }}>
        {Math.round(kmh)}
      </div>
      <div style={{ position: "absolute", top: 124, width: "100%", textAlign: "center", fontFamily: FONT_UI, fontWeight: 600, fontSize: 20, color: C.dim, letterSpacing: 1 }}>
        km/h
      </div>
    </div>
  );
};
