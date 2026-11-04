import React from "react";
import { AbsoluteFill, interpolate } from "remotion";
import { COLORS, FONT_DISPLAY, SAFE } from "../config";
import { EASE_BACK, EASE_OUT } from "../lib/anim";
import { VO_OFFSET, WORDS, Word } from "../lib/timeline";

/**
 * Subtítulos palabra a palabra (sincronizados con la transcripción de la locución).
 * Frases cortas (≤ 3–4 palabras): la palabra actual crece y se colorea; las que vienen esperan tenues.
 */

type Chunk = { words: Word[]; start: number; end: number };

const MAX_CHARS = 17;
const MAX_WORDS = 4;

const display = (w: string) => w.replace(/\.\.\.$/, "…").replace(/[,:]$/, "").replace(/\.$/, "").toUpperCase();

const buildChunks = (): Chunk[] => {
  const out: Chunk[] = [];
  let cur: Word[] = [];
  const flush = () => {
    if (cur.length) out.push({ words: cur, start: cur[0].start, end: cur[cur.length - 1].end });
    cur = [];
  };
  WORDS.forEach((w) => {
    const len = cur.map((c) => display(c.text)).join(" ").length;
    if (cur.length && (cur.length >= MAX_WORDS || len + 1 + display(w.text).length > MAX_CHARS)) flush();
    cur.push(w);
    if (/[.,:…]$/.test(w.text) || w.text.endsWith("...")) flush();
  });
  flush();
  return out;
};

const CHUNKS = buildChunks();

/** Palabras con color propio (problema = rojo, solución = verde, dato = amarillo). */
const KEY_COLORS: Record<string, string> = {
  "95%": COLORS.yellow,
  ERROR: COLORS.red,
  PERDIDO: COLORS.red,
  "PERDIDO…": COLORS.red,
  ESPACIO: COLORS.red,
  CIEGOS: COLORS.red,
  PUNTOS: COLORS.red,
  "VISTE": COLORS.red,
  "10": COLORS.green,
  SEGUNDOS: COLORS.green,
  SOLUCIÓN: COLORS.green,
  APENAS: COLORS.green,
  DESAPARECE: COLORS.green,
  APARECE: COLORS.green,
  NUNCA: COLORS.green,
  HOMBRO: COLORS.yellow,
};

export const Captions: React.FC<{ t: number; hidden?: (t: number) => boolean }> = ({ t, hidden }) => {
  const tt = t;
  const idx = CHUNKS.findIndex((c, i) => {
    const next = CHUNKS[i + 1];
    const until = next ? Math.min(next.start + VO_OFFSET, c.end + VO_OFFSET + 0.6) : c.end + VO_OFFSET + 0.9;
    return (i === 0 ? tt >= 0 : tt >= c.start + VO_OFFSET - 0.04) && tt < until;
  });
  if (idx < 0 || hidden?.(t)) return null;
  const chunk = CHUNKS[idx];
  const cStart = chunk.start + VO_OFFSET - 0.04;
  const enter = idx === 0 ? 1 : interpolate(tt, [cStart, cStart + 0.16], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: EASE_OUT,
  });

  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <div
        style={{
          position: "absolute",
          left: SAFE.left - 20,
          right: 1080 - SAFE.right - 20,
          top: SAFE.captionsY - 80,
          height: 160,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          flexWrap: "wrap",
          columnGap: 22,
          rowGap: 0,
          opacity: enter,
          translate: `0px ${(1 - enter) * 24}px`,
          fontFamily: FONT_DISPLAY,
          fontWeight: 800,
          fontSize: 96,
          lineHeight: 1,
          letterSpacing: 0.5,
        }}
      >
        {chunk.words.map((w, i) => {
          const ws = w.start + VO_OFFSET;
          const spoken = idx === 0 || tt >= ws - 0.02;
          const pop = interpolate(tt, [ws - 0.02, ws + 0.14], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: EASE_BACK,
          });
          const active = tt >= ws - 0.02 && tt < w.end + VO_OFFSET + 0.05;
          const label = display(w.text);
          const key = KEY_COLORS[label] ?? KEY_COLORS[label.replace("…", "")];
          const color = key ?? (active ? COLORS.yellow : COLORS.white);
          return (
            <span
              key={i}
              style={{
                display: "inline-block",
                color: spoken ? color : "rgba(244,246,248,0.42)",
                scale: String(spoken ? 0.86 + 0.14 * pop + (active ? 0.06 : 0) : 0.92),
                textShadow:
                  "0 6px 0 rgba(0,0,0,0.55), 0 0 28px rgba(0,0,0,0.65), 0 2px 2px rgba(0,0,0,0.9)",
                WebkitTextStroke: "2px rgba(0,0,0,0.55)",
                paintOrder: "stroke fill",
              }}
            >
              {label}
            </span>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

/** Banda oscura detrás de los subtítulos para asegurar lectura sobre cualquier fondo. */
export const CaptionBand: React.FC<{ opacity?: number }> = ({ opacity = 1 }) => (
  <AbsoluteFill
    style={{
      pointerEvents: "none",
      background: `linear-gradient(180deg, rgba(5,7,11,0) ${SAFE.captionsY - 260}px, rgba(5,7,11,0.82) ${SAFE.captionsY - 90}px, rgba(5,7,11,0.9) ${SAFE.captionsY + 140}px, rgba(5,7,11,0.6) 1920px)`,
      opacity,
    }}
  />
);
