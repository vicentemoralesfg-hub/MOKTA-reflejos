import React from "react";
import { C, DISPLAY, UI } from "../../brand";

/**
 * Odómetro mecánico de rodillos. `value` puede ser decimal: los rodillos giran de forma continua
 * (el último gira con la fracción, y cada rodillo arrastra al siguiente solo cuando el anterior pasa de 9 a 0).
 */
export const Odometer: React.FC<{ value: number; digits?: number; size?: number; unit?: string; accent?: string }> = ({
  value,
  digits = 7,
  size = 110,
  unit = "KM",
  accent = C.white,
}) => {
  const w = size * 0.62;
  const h = size * 1.12;
  const v = Math.max(0, value);
  const cells: React.ReactNode[] = [];
  for (let k = digits - 1; k >= 0; k--) {
    const place = Math.pow(10, k);
    const base = Math.floor(v / place) % 10;
    // fracción de giro: solo cuando todos los rodillos de la derecha están en 9
    const below = v % place;
    const frac = k === 0 ? v - Math.floor(v) : Math.max(0, (below - (place - 1)) / 1);
    const pos = base + Math.min(1, frac);
    const sep = k > 0 && k % 3 === 0;
    cells.push(
      <div key={k} style={{ display: "flex", alignItems: "center" }}>
        <div
          style={{
            width: w,
            height: h,
            overflow: "hidden",
            position: "relative",
            borderRadius: size * 0.08,
            background: "linear-gradient(180deg, #050608 0%, #1B1F27 22%, #2A2F39 50%, #1B1F27 78%, #050608 100%)",
            boxShadow: "inset 0 0 0 2px rgba(255,255,255,0.06)",
            marginRight: size * 0.05,
          }}
        >
          <div style={{ position: "absolute", left: 0, right: 0, top: -pos * h }}>
            {Array.from({ length: 11 }).map((_, d) => (
              <div
                key={d}
                style={{
                  height: h,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontFamily: DISPLAY,
                  fontWeight: 800,
                  fontSize: size,
                  color: accent,
                  fontVariantNumeric: "tabular-nums",
                }}
              >
                {d % 10}
              </div>
            ))}
          </div>
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(0,0,0,0.55), transparent 30%, transparent 70%, rgba(0,0,0,0.55))" }} />
        </div>
        {sep ? <div style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: size * 0.7, color: "rgba(244,246,248,0.45)", marginRight: size * 0.05 }}>.</div> : null}
      </div>,
    );
  }
  return (
    <div style={{ display: "flex", alignItems: "center" }}>
      {cells}
      <div style={{ fontFamily: UI, fontWeight: 800, fontSize: size * 0.34, color: C.dim, marginLeft: size * 0.12, letterSpacing: 2 }}>{unit}</div>
    </div>
  );
};
