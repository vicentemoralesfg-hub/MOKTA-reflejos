import React from "react";
import { COLORS, FONT_UI } from "../config";
import { lerp } from "../lib/anim";

/**
 * Botón físico del panel de climatización: bisel, cara de plástico, ícono retroiluminado
 * y LED indicador arriba. `led` 0→1 enciende el LED; `pressed` 0→1 hunde el botón.
 */
export const HvacButton: React.FC<{
  size: number;
  icon?: React.ReactNode;
  text?: string;
  led: number;
  pressed?: number;
  ledColor?: string;
  label?: string;
  labelColor?: string;
  style?: React.CSSProperties;
}> = ({ size, icon, text, led, pressed = 0, ledColor = COLORS.led, label, labelColor = COLORS.dim, style }) => {
  const r = size * 0.18;
  const depth = lerp(1, 0.94, pressed);
  const ledW = size * 0.3;
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", ...style }}>
      <div
        style={{
          width: size,
          height: size,
          borderRadius: r,
          padding: size * 0.045,
          background: "linear-gradient(180deg, #2b3038 0%, #0b0d10 100%)",
          boxShadow: `0 ${size * 0.08}px ${size * 0.2}px rgba(0,0,0,0.65), inset 0 1px 0 rgba(255,255,255,0.10)`,
        }}
      >
        <div
          style={{
            width: "100%",
            height: "100%",
            borderRadius: r * 0.8,
            position: "relative",
            scale: String(depth),
            background: "linear-gradient(180deg, #2a2f37 0%, #171a1f 55%, #121418 100%)",
            boxShadow: `inset 0 ${size * 0.012}px 0 rgba(255,255,255,0.14), inset 0 -${size * 0.03}px ${size * 0.05}px rgba(0,0,0,0.5), 0 ${lerp(size * 0.03, size * 0.008, pressed)}px ${lerp(size * 0.05, size * 0.015, pressed)}px rgba(0,0,0,0.6)`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            overflow: "hidden",
          }}
        >
          {/* reflejo superior */}
          <div
            style={{
              position: "absolute",
              left: "8%",
              right: "8%",
              top: "4%",
              height: "38%",
              borderRadius: r,
              background: "linear-gradient(180deg, rgba(255,255,255,0.10), rgba(255,255,255,0))",
            }}
          />
          {/* LED indicador */}
          <div
            style={{
              position: "absolute",
              top: size * 0.09,
              width: ledW,
              height: size * 0.045,
              borderRadius: size,
              background: led > 0.02 ? ledColor : "#2a2d33",
              opacity: lerp(0.55, 1, led),
              boxShadow: led > 0.02 ? `0 0 ${size * 0.06 * led}px ${ledColor}, 0 0 ${size * 0.16 * led}px ${ledColor}aa` : "inset 0 1px 2px rgba(0,0,0,0.8)",
              filter: `saturate(${lerp(0.2, 1, led)}) brightness(${lerp(0.5, 1.15, led)})`,
            }}
          />
          <div
            style={{
              color: "#E9EEF4",
              marginTop: size * 0.08,
              filter: `drop-shadow(0 0 ${size * 0.03}px rgba(220,235,255,0.55))`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {icon}
            {text ? (
              <span style={{ fontFamily: FONT_UI, fontWeight: 700, fontSize: size * 0.27, letterSpacing: size * 0.005 }}>{text}</span>
            ) : null}
          </div>
        </div>
      </div>
      {label ? (
        <div
          style={{
            marginTop: size * 0.12,
            fontFamily: FONT_UI,
            fontWeight: 700,
            fontSize: Math.max(22, size * 0.15),
            letterSpacing: 2,
            color: labelColor,
            whiteSpace: "nowrap",
          }}
        >
          {label}
        </div>
      ) : null}
    </div>
  );
};

/** Onda expansiva del "clic" (anillos que salen del botón). */
export const PressRipple: React.FC<{ f: number; at: number; size: number; color?: string }> = ({ f, at, size, color = COLORS.white }) => {
  const d = f - at;
  if (d < 0 || d > 22) return null;
  return (
    <>
      {[0, 6].map((o) => {
        const k = (d - o) / 16;
        if (k < 0 || k > 1) return null;
        return (
          <div
            key={o}
            style={{
              position: "absolute",
              left: "50%",
              top: "50%",
              width: size,
              height: size,
              marginLeft: -size / 2,
              marginTop: -size / 2,
              borderRadius: size * 0.22,
              border: `${lerp(6, 1, k)}px solid ${color}`,
              opacity: (1 - k) * 0.7,
              scale: String(lerp(1, 1.6, k)),
            }}
          />
        );
      })}
    </>
  );
};
