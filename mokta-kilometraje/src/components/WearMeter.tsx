import React from "react";
import { COLORS, FONT_DISPLAY, FONT_UI } from "../config";

const LEVELS = [
  { max: 0.34, label: "BAJO", color: COLORS.green },
  { max: 0.62, label: "MEDIO", color: COLORS.yellow },
  { max: 0.85, label: "ALTO", color: COLORS.red },
  { max: 2, label: "CRÍTICO", color: COLORS.red },
];
export const levelOf = (v: number) => LEVELS.find((l) => v <= l.max)!;

/** Medidor segmentado de "desgaste real" (escala cualitativa, sin porcentajes inventados). */
export const WearMeter: React.FC<{
  value: number;
  title: string;
  subtitle?: string;
  width?: number;
  segments?: number;
  blink?: number;
}> = ({ value, title, subtitle, width = 920, segments = 20, blink = 0 }) => {
  const lv = levelOf(value);
  const on = Math.round(value * segments);
  const gap = 6;
  const segW = (width - gap * (segments - 1)) / segments;
  return (
    <div style={{ width }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 14 }}>
        <div>
          <div style={{ fontFamily: FONT_UI, fontWeight: 700, fontSize: 30, letterSpacing: 5, color: COLORS.dim }}>{title}</div>
          {subtitle ? (
            <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 52, color: COLORS.white, lineHeight: 1.05 }}>{subtitle}</div>
          ) : null}
        </div>
        <div
          style={{
            fontFamily: FONT_DISPLAY,
            fontWeight: 800,
            fontSize: 72,
            lineHeight: 1,
            color: lv.color,
            opacity: lv.label === "CRÍTICO" ? 0.55 + 0.45 * Math.abs(Math.cos(blink)) : 1,
            textShadow: `0 0 30px ${lv.color}66`,
          }}
        >
          {lv.label}
        </div>
      </div>
      <div style={{ display: "flex", gap }}>
        {new Array(segments).fill(0).map((_, i) => {
          const v = (i + 0.5) / segments;
          const c = levelOf(v).color;
          const active = i < on;
          return (
            <div
              key={i}
              style={{
                width: segW,
                height: 46,
                borderRadius: 6,
                background: active ? c : "rgba(255,255,255,0.07)",
                boxShadow: active ? `0 0 16px ${c}88` : "none",
              }}
            />
          );
        })}
      </div>
    </div>
  );
};
