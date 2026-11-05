import React from "react";
import { COLORS, FONT_DISPLAY } from "../config";

/**
 * Odómetro mecánico de tambores. `value` puede ser decimal: el tambor de las unidades gira continuo
 * y cada tambor superior solo avanza mientras el inferior pasa de 9 a 0 (como uno real).
 * `speed` (km por fotograma) agrega desenfoque de movimiento a los tambores que giran rápido.
 */
export const Odometer: React.FC<{
  value: number;
  digits?: number;
  size?: number;
  speed?: number;
  tone?: "dark" | "red" | "green";
  unit?: string;
  scramble?: number; // >0: todos los tambores giran (efecto "¿?")
}> = ({ value, digits = 6, size = 1, speed = 0, tone = "dark", unit = "km", scramble = 0 }) => {
  const W = 104 * size;
  const H = 150 * size;
  const positions: number[] = [];
  let lower = 0;
  for (let p = 0; p < digits; p++) {
    let pos: number;
    if (p === 0) {
      pos = ((value % 10) + 10) % 10;
    } else {
      const base = Math.floor(value / 10 ** p) % 10;
      const carry = Math.min(1, Math.max(0, lower - 9));
      pos = base + carry;
    }
    if (scramble > 0) pos = (pos + scramble * (1.7 + p * 0.9)) % 10;
    positions.push(pos);
    lower = pos;
  }
  const frame = tone === "red" ? COLORS.red : tone === "green" ? COLORS.green : "rgba(255,255,255,0.18)";
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 18 * size }}>
      <div
        style={{
          display: "flex",
          gap: 6 * size,
          padding: 10 * size,
          borderRadius: 18 * size,
          background: "linear-gradient(180deg,#1b2029,#0b0e13)",
          border: `${3 * size}px solid ${frame}`,
          boxShadow: `0 ${18 * size}px ${50 * size}px rgba(0,0,0,0.6)${tone !== "dark" ? `, 0 0 ${40 * size}px ${frame}55` : ""}`,
        }}
      >
        {positions
          .map((pos, p) => {
            const digitSpeed = (scramble > 0 ? 3 : speed / 10 ** p);
            const blur = Math.min(10, Math.max(0, digitSpeed * 4 - 0.4)) * size;
            return (
              <div
                key={p}
                style={{
                  width: W,
                  height: H,
                  overflow: "hidden",
                  borderRadius: 8 * size,
                  background: "linear-gradient(180deg,#07090c 0%,#171b22 50%,#07090c 100%)",
                  position: "relative",
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    left: 0,
                    right: 0,
                    top: -pos * H,
                    filter: blur > 0.2 ? `blur(${blur}px)` : undefined,
                  }}
                >
                  {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 0].map((d, k) => (
                    <div
                      key={k}
                      style={{
                        height: H,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontFamily: FONT_DISPLAY,
                        fontWeight: 700,
                        fontSize: 128 * size,
                        color: COLORS.white,
                        fontVariantNumeric: "tabular-nums",
                      }}
                    >
                      {d}
                    </div>
                  ))}
                </div>
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    background:
                      "linear-gradient(180deg, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0) 30%, rgba(255,255,255,0.04) 50%, rgba(0,0,0,0) 70%, rgba(0,0,0,0.85) 100%)",
                  }}
                />
              </div>
            );
          })
          .reverse()}
      </div>
      {unit ? (
        <div
          style={{
            fontFamily: FONT_DISPLAY,
            fontWeight: 700,
            fontSize: 70 * size,
            color: COLORS.dim,
            marginBottom: 14 * size,
          }}
        >
          {unit}
        </div>
      ) : null}
    </div>
  );
};
