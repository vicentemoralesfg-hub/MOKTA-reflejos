import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { FPS, HIGHLIGHTS, WORDS } from "../timeline";
import cues from "../data/cues.json";
import { C, FONT_DISPLAY } from "./style";
import { EASE_OUT } from "../lib/anim";

/**
 * Subtítulos palabra por palabra, al centro. Cada palabra entra cuando se pronuncia;
 * la palabra clave de cada frase va resaltada.
 * Grupos: se corta en la puntuación y nunca más de 3 palabras por línea visible.
 */
type Group = { words: number[]; start: number; end: number; block?: boolean };

/** Frases que se muestran completas de una vez (el gancho), en vez de palabra por palabra. */
const BLOCKS = ((cues as { captionBlocks?: number[][] }).captionBlocks ?? []) as [number, number][];

const MAX_WORDS = 3;
const MAX_CHARS = 17;

const buildGroups = (): Group[] => {
  const phrases: number[][] = [];
  let cur: number[] = [];
  const inBlock = (i: number) => BLOCKS.some(([a, b]) => i >= a && i <= b);
  const blockGroups: Group[] = BLOCKS.map(([a, b]) => ({
    words: Array.from({ length: b - a + 1 }, (_, k) => a + k),
    // los bloques cambian exactamente en el fotograma del corte (mismo redondeo que timeline.ts)
    start: a === 0 ? 0 : Math.round((WORDS[a].start - 0.12) * FPS) / FPS,
    end: WORDS[b + 1] ? Math.round((WORDS[b + 1].start - 0.12) * FPS) / FPS : WORDS[b].end + 0.45,
    block: true,
  }));
  WORDS.forEach((w, i) => {
    if (inBlock(i)) return;
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
  const wordGroups = groups.map((ids, k) => {
    const start = WORDS[ids[0]].start;
    const lastEnd = WORDS[ids[ids.length - 1]].end;
    const next = k + 1 < groups.length ? WORDS[groups[k + 1][0]].start : lastEnd + 1;
    const end = Math.min(next, lastEnd + 0.45);
    return { words: ids, start, end };
  });
  return [...blockGroups, ...wordGroups].sort((a, b) => a.start - b.start);
};

const GROUPS = buildGroups();

const colorOf = (i: number) => {
  const h = HIGHLIGHTS[String(i)];
  return h === "red" ? C.red : h === "blue" ? C.blue : h === "key" ? C.key : C.white;
};

export const Captions: React.FC<{ y?: number }> = ({ y = 1185 }) => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  // si dos grupos se solapan en un corte, gana el más reciente (nunca queda la frase anterior en el plano nuevo)
  const g = [...GROUPS].reverse().find((gr) => t >= gr.start - (gr.block ? 0 : 0.04) && t < gr.end);
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
          const p = g.block ? 1 : interpolate(t, [w.start - 0.04, w.start + 0.1], [0, 1], {
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
                fontSize: g.block ? (hl ? 100 : 92) : hl ? 108 : 98,
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
