import React from "react";
import { interpolate } from "remotion";
import { COLORS, FONT_DISPLAY, FONT_UI, LETTERS } from "../config";
import { EASE_OUT, ramp } from "../lib/anim";

/**
 * Las cuatro alternativas (2×2). Tipografía grande, letra A–D en cápsula.
 * f = fotograma local de la ronda; appearAt = entrada escalonada; revealAt = la correcta se ilumina en verde.
 */
export const Options: React.FC<{
  f: number;
  options: string[];
  correct: number;
  appearAt: number;
  revealAt: number;
  countdownAt: number;
}> = ({ f, options, correct, appearAt, revealAt, countdownAt }) => {
  const revealed = f >= revealAt;
  const rv = ramp(f, revealAt, revealAt + 8);
  // latido sutil durante la cuenta regresiva
  const beat = f >= countdownAt && !revealed ? Math.max(0, Math.cos(((f - countdownAt) / 30) * Math.PI * 2)) : 0;

  return (
    <div
      style={{
        position: "absolute",
        left: 60,
        top: 1112,
        width: 960,
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: 22,
      }}
    >
      {options.map((label, i) => {
        const t = ramp(f, appearAt + i * 4, appearAt + i * 4 + 10, EASE_OUT);
        const isRight = i === correct;
        const bg = revealed
          ? isRight
            ? `rgba(43,227,138,${0.18 + 0.1 * (1 - rv)})`
            : "rgba(255,255,255,0.03)"
          : `rgba(255,255,255,${0.07 + beat * 0.03})`;
        const border = revealed ? (isRight ? COLORS.green : "rgba(255,255,255,0.08)") : `rgba(255,255,255,${0.18 + beat * 0.12})`;
        const opacity = t * (revealed && !isRight ? interpolate(rv, [0, 1], [1, 0.32]) : 1);
        const pop = revealed && isRight ? interpolate(rv, [0, 0.5, 1], [1, 1.07, 1.03]) : 1;
        return (
          <div
            key={label}
            style={{
              height: 172,
              borderRadius: 26,
              background: bg,
              border: `3px solid ${border}`,
              boxShadow: revealed && isRight ? `0 0 ${50 * (1 - rv * 0.4)}px rgba(43,227,138,0.55)` : "0 10px 30px rgba(0,0,0,0.35)",
              display: "flex",
              alignItems: "center",
              gap: 20,
              paddingLeft: 22,
              opacity,
              translate: `0px ${interpolate(t, [0, 1], [40, 0])}px`,
              scale: String(interpolate(t, [0, 1], [0.92, 1]) * pop),
            }}
          >
            <div
              style={{
                width: 74,
                height: 74,
                flexShrink: 0,
                borderRadius: 18,
                background: revealed && isRight ? COLORS.green : "rgba(255,255,255,0.12)",
                color: revealed && isRight ? "#04120A" : COLORS.white,
                fontFamily: FONT_UI,
                fontWeight: 800,
                fontSize: 40,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {revealed && isRight ? "✓" : LETTERS[i]}
            </div>
            <div
              style={{
                fontFamily: FONT_DISPLAY,
                fontWeight: 800,
                fontSize: label.length > 6 ? 70 : 96,
                lineHeight: 1,
                letterSpacing: label.length > 6 ? 0 : 2,
                color: COLORS.white,
                whiteSpace: "nowrap",
              }}
            >
              {label}
            </div>
          </div>
        );
      })}
    </div>
  );
};
