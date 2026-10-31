import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { FPS, HIGHLIGHTS, WORDS } from "../timeline";
import { C, FONT_DISPLAY } from "./style";
import { EASE_OUT } from "../lib/anim";

/**
 * Subtítulos palabra por palabra, al centro. Cada palabra entra cuando se pronuncia;
 * la palabra clave de cada frase va resaltada.
 * Grupos: se corta en la puntuación y nunca más de 3 palabras por línea visible.
 */
type Group = { words: number[]; start: number; end: number };

const MAX_WORDS = 3;
const MAX_CHARS = 17;

const buildGroups = (): Group[] => {
  const phrases: number[][] = [];
  let cur: number[] = [];
  WORDS.forEach((w, i) => {
    cur.push(i);
    if (/[.,:?…]$/.test(w.text) || i === WORDS.length - 1) {
      phrases.push(cur);
      cur = [];
    }
  });
  const groups: number[][] = [];
  for (const ph of phrases) {
    let g: number[] = [];
    const len = (ids: number[]) => ids.reduce((a, i) => a + WORDS[i].text.length + 1, 0);
    ph.forEach((i, k) => {
      const remaining = ph.length - k;
      if (g.length && (g.length >= MAX_WORDS || len([...g, i]) > MAX_CHARS) && !(remaining === 1 && g.length < MAX_WORDS && len([...g, i]) <= MAX_CHARS + 3)) {
        groups.push(g);
        g = [];
      }
      g.push(i);
    });
    if (g.length) groups.push(g);
  }
  return groups.map((ids, k) => {
    const start = WORDS[ids[0]].start;
    const lastEnd = WORDS[ids[ids.length - 1]].end;
    const next = k + 1 < groups.length ? WORDS[groups[k + 1][0]].start : lastEnd + 1;
    const end = Math.min(next, lastEnd + 0.45);
    return { words: ids, start, end };
  });
};

const GROUPS = buildGroups();

const colorOf = (i: number) => {
  const h = HIGHLIGHTS[String(i)];
  return h === "red" ? C.red : h === "blue" ? C.blue : h === "key" ? C.key : C.white;
};

export const Captions: React.FC<{ y?: number }> = ({ y = 1185 }) => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  const g = GROUPS.find((gr) => t >= gr.start - 0.04 && t < gr.end);
  if (!g) return null;
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <div
        style={{
          position: "absolute",
          top: y,
          left: 60,
          right: 60,
          transform: "translateY(-50%)",
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          columnGap: 22,
          rowGap: 0,
        }}
      >
        {g.words.map((i) => {
          const w = WORDS[i];
          const p = interpolate(t, [w.start - 0.04, w.start + 0.1], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: EASE_OUT,
          });
          const hl = HIGHLIGHTS[String(i)] !== undefined;
          return (
            <span
              key={i}
              style={{
                fontFamily: FONT_DISPLAY,
                fontWeight: 800,
                fontSize: hl ? 108 : 98,
                lineHeight: 1.08,
                textTransform: "uppercase",
                color: colorOf(i),
                opacity: p,
                scale: String(interpolate(p, [0, 1], [0.82, 1])),
                display: "inline-block",
                WebkitTextStroke: "12px rgba(3,8,22,0.88)",
                paintOrder: "stroke fill",
                textShadow: hl ? `0 0 34px ${colorOf(i)}55, 0 6px 22px rgba(0,0,0,0.6)` : "0 6px 22px rgba(0,0,0,0.6)",
                letterSpacing: 0.5,
              }}
            >
              {w.text}
            </span>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
