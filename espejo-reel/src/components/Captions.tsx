import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { CAPTION_Y, COLORS, FONT_DISPLAY } from "../config";
import { WORDS, wf, we } from "../timeline";
import { BACK, ramp } from "../lib/anim";

/**
 * Subtítulos dinámicos palabra a palabra, sincronizados con la transcripción.
 * Cada bloque son 1–4 palabras; la palabra que suena se pinta en amarillo y "salta".
 */

/** Índice de la primera palabra de cada bloque (cortes escogidos a mano para leer de un vistazo). */
const CHUNK_STARTS = [
  0, 4, 6, 8, 11, 14, 17, 20, 24, 28, 31, 35, 38, 40, 44, 47, 50, 52, 55, 57, 59, 61, 64, 68, 70, 73,
  77, 79, 81, 85, 87, 89, 93, 97, 99, 103, 106, 109, 112, 115, 117, 120, 122, 125, 127, 129, 132, 134,
];

/** Bloques que no se subtitulan porque la escena ya los muestra en grande. */
const HIDDEN_FROM = new Set([68, 134]);

/** Colores fijos de palabras clave. */
const EMPHASIS: Record<number, string> = {
  13: COLORS.red, // 90%
  18: COLORS.yellow, // ESTA
  19: COLORS.yellow, // palanca
  43: COLORS.red, // entero
  47: COLORS.red, // sin
  48: COLORS.red, // ver
  49: COLORS.red, // atrás
  51: COLORS.green, // correcto
  58: COLORS.green, // listo
  74: COLORS.accent, // cuña
  76: COLORS.accent, // vidrio
  83: "#D9E2EC", // capa
  84: "#D9E2EC", // plateada
  88: COLORS.yellow, // brillante
  102: COLORS.accent, // techo
  108: COLORS.accent, // vidrio
  111: COLORS.green, // 4%
  121: COLORS.accent, // electrocrómico
  128: COLORS.yellow, // día
};

const clean = (t: string) =>
  t
    .replace(/[.,:…]+$/u, "")
    .toUpperCase();

type Chunk = { from: number; to: number; words: number[] };

const CHUNKS: Chunk[] = CHUNK_STARTS.map((s, k) => {
  const e = (CHUNK_STARTS[k + 1] ?? WORDS.length) - 1;
  const words = Array.from({ length: e - s + 1 }, (_, i) => s + i);
  const nextStart = CHUNK_STARTS[k + 1] !== undefined ? wf(CHUNK_STARTS[k + 1]) : we(e) + 30;
  // se mantiene hasta el siguiente bloque (máx. 0,8 s de cola si hay pausa larga)
  const to = Math.min(nextStart, we(e) + 24);
  return { from: wf(s) - 1, to, words };
}).filter((c) => !HIDDEN_FROM.has(c.words[0]));

const OUTLINE = [
  "0 0 2px rgba(0,0,0,0.9)",
  "3px 3px 0 rgba(0,0,0,0.85)",
  "-3px 3px 0 rgba(0,0,0,0.85)",
  "3px -3px 0 rgba(0,0,0,0.85)",
  "-3px -3px 0 rgba(0,0,0,0.85)",
  "0 4px 0 rgba(0,0,0,0.85)",
  "0 -4px 0 rgba(0,0,0,0.85)",
  "4px 0 0 rgba(0,0,0,0.85)",
  "-4px 0 0 rgba(0,0,0,0.85)",
  "0 10px 30px rgba(0,0,0,0.65)",
].join(", ");

export const Captions: React.FC = () => {
  const f = useCurrentFrame();
  const chunk = CHUNKS.find((c) => f >= c.from && f < c.to);
  if (!chunk) return null;
  const pop = ramp(f, chunk.from, chunk.from + 5, BACK);
  const long = chunk.words.map((i) => clean(WORDS[i].text)).join(" ").length > 17;
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <div
        style={{
          position: "absolute",
          left: 70,
          right: 70,
          top: CAPTION_Y,
          translate: "0 -50%",
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          alignItems: "baseline",
          columnGap: 30,
          rowGap: 0,
          fontFamily: FONT_DISPLAY,
          fontWeight: 800,
          fontSize: long ? 96 : 108,
          lineHeight: 1.02,
          letterSpacing: 1,
          textAlign: "center",
          scale: String(interpolate(pop, [0, 1], [0.86, 1])),
          opacity: interpolate(pop, [0, 0.4], [0, 1], { extrapolateRight: "clamp" }),
        }}
      >
        {chunk.words.map((i) => {
          const active = f >= wf(i) - 1 && f < Math.max(we(i), wf(i) + 4);
          const said = f >= wf(i) - 1;
          const k = ramp(f, wf(i) - 1, wf(i) + 3, BACK);
          const base = EMPHASIS[i] ?? COLORS.white;
          return (
            <span
              key={i}
              style={{
                color: active ? (EMPHASIS[i] ?? COLORS.yellow) : base,
                opacity: said ? 1 : 0.55,
                textShadow: OUTLINE,
                display: "inline-block",
                scale: active ? String(interpolate(k, [0, 1], [1.0, 1.05])) : "1",
                translate: active ? `0 ${interpolate(k, [0, 1], [0, -6])}px` : "0 0",
              }}
            >
              {clean(WORDS[i].text)}
            </span>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
