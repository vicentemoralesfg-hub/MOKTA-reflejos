import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { CAPTION_PAGES, COLORS, FONT_DISPLAY, FPS, WORDS } from "../config";
import { EASE_BACK, ramp } from "../lib/anim";

const COLOR_OF: Record<string, string> = {
  white: COLORS.white,
  red: COLORS.red,
  green: COLORS.green,
  yellow: COLORS.yellow,
};

const OUTLINE = [
  "0 0 2px #000",
  "4px 0 0 #000",
  "-4px 0 0 #000",
  "0 4px 0 #000",
  "0 -4px 0 #000",
  "3px 3px 0 #000",
  "-3px 3px 0 #000",
  "3px -3px 0 #000",
  "-3px -3px 0 #000",
  "0 10px 30px rgba(0,0,0,0.85)",
].join(", ");

/** Subtítulos palabra por palabra, sincronizados a la locución (páginas de 1-3 palabras). */
export const Captions: React.FC<{ top?: number }> = ({ top = 1215 }) => {
  const f = useCurrentFrame();
  const t = f / FPS;
  const page = CAPTION_PAGES.find((p) => t >= p.start && t < p.end);
  if (!page) return null;
  const pf = f - page.start * FPS;
  const pIn = ramp(pf, 0, 5, EASE_BACK);
  return (
    <div
      style={{
        position: "absolute",
        left: 70,
        right: 70,
        top,
        height: 250,
        display: "flex",
        flexWrap: "wrap",
        alignContent: "center",
        justifyContent: "center",
        columnGap: 34,
        rowGap: 0,
        scale: String(interpolate(pIn, [0, 1], [0.82, 1])),
        opacity: Math.min(1, pf / 2 + 0.3),
      }}
    >
      {page.words.map((wi) => {
        const w = WORDS[wi];
        const active = t >= w.start - 0.04;
        const current = active && t < w.end + 0.08;
        const base = COLOR_OF[w.color];
        const highlight = w.color === "white" ? COLORS.yellow : base;
        const wf = f - (w.start - 0.04) * FPS;
        const bump = current ? interpolate(ramp(wf, 0, 4, EASE_BACK), [0, 1], [1.0, 1.06]) : 1;
        return (
          <span
            key={wi}
            style={{
              fontFamily: FONT_DISPLAY,
              fontWeight: 800,
              fontSize: 104,
              lineHeight: 1.08,
              textTransform: "uppercase",
              color: current ? highlight : active ? base : "rgba(244,246,248,0.55)",
              textShadow: OUTLINE,
              display: "inline-block",
              scale: String(bump),
              translate: `0px ${current ? -4 : 0}px`,
            }}
          >
            {w.text.replace(/[,.…:]+$/, "")}
          </span>
        );
      })}
    </div>
  );
};
