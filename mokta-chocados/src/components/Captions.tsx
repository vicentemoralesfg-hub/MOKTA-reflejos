import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { BACK } from "../anim";
import { FONT_DISPLAY } from "../theme";
import { FPS, SceneId, scene, words } from "../timeline";

type Chunk = { words: { t: string; s: number; e: number }[]; s: number; e: number };

const MAX_WORDS = 3;
const MAX_CHARS = 17;

const chunksOf = (id: SceneId): Chunk[] => {
  const ws = words(id);
  const out: Chunk[] = [];
  let cur: Chunk["words"] = [];
  const flush = () => {
    if (cur.length) out.push({ words: cur, s: cur[0].s, e: cur[cur.length - 1].e });
    cur = [];
  };
  ws.forEach((w) => {
    const len = cur.reduce((a, x) => a + x.t.length + 1, 0) + w.t.length;
    if (cur.length >= MAX_WORDS || (cur.length && len > MAX_CHARS)) flush();
    cur.push(w);
    if (/[.:?!…]$/.test(w.t) || (/,$/.test(w.t) && cur.length >= 2)) flush();
  });
  flush();
  return out;
};

const cache = new Map<SceneId, Chunk[]>();

const strip = (t: string) => t.replace(/^[¿¡]/, "").replace(/[,.:;…]$/, "");
const norm = (s: string) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9,]/g, "");

/** Subtítulos dinámicos (2–3 palabras), palabra activa resaltada; palabras clave siempre en color de acento. */
export const Captions: React.FC<{ id: SceneId; accent: string; keywords?: string[]; y?: number; hide?: [number, number][] }> = ({
  id,
  accent,
  keywords = [],
  y = 1430,
  hide = [],
}) => {
  const f = useCurrentFrame();
  if (!cache.has(id)) cache.set(id, chunksOf(id));
  const chunks = cache.get(id)!;
  const sec = f / FPS - scene(id).voStart;
  if (hide.some(([a, b]) => f >= a && f < b)) return null;
  const idx = chunks.findIndex((c, i) => sec >= c.s - 0.05 && (i === chunks.length - 1 ? sec < c.e + 0.5 : sec < chunks[i + 1].s - 0.05));
  if (idx < 0) return null;
  const c = chunks[idx];
  const local = (sec - (c.s - 0.05)) * FPS;
  const kw = keywords.map(norm);
  return (
    <div
      style={{
        position: "absolute",
        left: 60,
        right: 60,
        top: y,
        display: "flex",
        flexWrap: "wrap",
        justifyContent: "center",
        gap: "0 22px",
        fontFamily: FONT_DISPLAY,
        fontWeight: 800,
        fontSize: 96,
        lineHeight: 1.02,
        textTransform: "uppercase",
        letterSpacing: 1,
        scale: interpolate(local, [0, 5], [0.82, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: BACK }),
        opacity: interpolate(local, [0, 3], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
      }}
    >
      {c.words.map((w, i) => {
        const active = sec >= w.s - 0.04;
        const isKw = kw.some((k) => norm(w.t).startsWith(k));
        const color = isKw ? accent : active ? "#FFFFFF" : "rgba(255,255,255,0.55)";
        return (
          <span
            key={i}
            style={{
              color,
              textShadow: "0 6px 0 rgba(0,0,0,0.85), 0 0 24px rgba(0,0,0,0.7), 3px 3px 0 #000, -3px -3px 0 #000, 3px -3px 0 #000, -3px 3px 0 #000",
              scale: active && sec < w.e ? 1.08 : 1,
              display: "inline-block",
            }}
          >
            {strip(w.t)}
          </span>
        );
      })}
    </div>
  );
};
