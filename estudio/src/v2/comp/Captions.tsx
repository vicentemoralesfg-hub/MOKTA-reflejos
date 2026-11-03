import React from "react";
import { C, DISPLAY } from "../../brand";
import { VO, VOWord, fr } from "../lib/vo";

/**
 * Subtítulos palabra a palabra (estilo Reels): bloques de hasta ~22 caracteres por línea y 2 líneas,
 * palabra hablada en amarillo. `fix` corrige grafías que Whisper transcribe distinto (marcas, modelos).
 */
type Chunk = { words: VOWord[]; s: number; e: number };

const chunkWords = (words: VOWord[], maxChars = 26, maxWords = 6): Chunk[] => {
  const out: Chunk[] = [];
  let cur: VOWord[] = [];
  let len = 0;
  for (const w of words) {
    const strong = /[.?!:]$/.test(w.w);
    if (cur.length && (len + w.w.length > maxChars * 2 || cur.length >= maxWords)) {
      out.push({ words: cur, s: cur[0].s, e: cur[cur.length - 1].e });
      cur = [];
      len = 0;
    }
    cur.push(w);
    len += w.w.length + 1;
    if (strong) {
      out.push({ words: cur, s: cur[0].s, e: cur[cur.length - 1].e });
      cur = [];
      len = 0;
    }
  }
  if (cur.length) out.push({ words: cur, s: cur[0].s, e: cur[cur.length - 1].e });
  return out;
};

/** Une los números que Whisper separa ("4", ".600", ".000" → "4.600.000") y aplica fusiones de frases. */
const tidy = (words: VOWord[], merges: { from: string[]; to: string }[]): VOWord[] => {
  const out: VOWord[] = [];
  for (const w of words) {
    const prev = out[out.length - 1];
    if (prev && /^[.,]\d/.test(w.w) && /\d$/.test(prev.w)) {
      // ",000" es separador de miles (Whisper en inglés) → "4.000"; ",8" es decimal → "3,8"
      const piece = /^,\d{3}(?!\d)/.test(w.w) ? "." + w.w.slice(1) : w.w;
      out[out.length - 1] = { w: prev.w + piece, s: prev.s, e: w.e };
    } else out.push({ ...w });
  }
  const key = (x: string) => x.toLowerCase().replace(/[^a-záéíóúñü0-9.]/gi, "");
  for (const m of merges) {
    for (let i = 0; i + m.from.length <= out.length; i++) {
      if (m.from.every((x, j) => key(out[i + j].w) === x)) {
        const tail = out[i + m.from.length - 1].w.match(/[.,:;?!]+$/)?.[0] ?? "";
        out.splice(i, m.from.length, { w: m.to + tail, s: out[i].s, e: out[i + m.from.length - 1].e });
      }
    }
  }
  return out;
};

/** Grafías que Whisper escribe distinto a como se dicen/escriben en Chile (válidas para todos los reels). */
const BASE_FIX: Record<string, string> = { benzina: "bencina", click: "clic", vyd: "BYD", byd: "BYD" };

export const Captions: React.FC<{
  vo: VO;
  f: number;
  fix?: Record<string, string>;
  merges?: { from: string[]; to: string }[];
  top?: number;
  hide?: (f: number) => boolean;
}> = ({ vo, f, fix = {}, merges = [], top = 1250, hide }) => {
  if (hide && hide(f)) return null;
  const t = f / 30;
  const chunks = vo.segments.flatMap((s) => chunkWords(tidy(s.words, merges)));
  const i = chunks.findIndex((c, k) => t >= c.s - 0.05 && t < (chunks[k + 1] ? Math.min(chunks[k + 1].s - 0.05, c.e + 0.6) : c.e + 0.6));
  if (i < 0) return null;
  const c = chunks[i];
  const age = f - fr(c.s - 0.05);
  const pop = Math.min(1, age / 4);
  return (
    <div
      style={{
        position: "absolute",
        top,
        left: 70,
        width: 860,
        display: "flex",
        flexWrap: "wrap",
        justifyContent: "center",
        columnGap: 18,
        rowGap: 2,
        fontFamily: DISPLAY,
        fontWeight: 800,
        fontSize: 74,
        lineHeight: 1.05,
        textTransform: "uppercase",
        textAlign: "center",
        scale: String(0.94 + 0.06 * pop),
        opacity: 0.4 + 0.6 * pop,
      }}
    >
      {c.words.map((w, k) => {
        const on = t >= w.s - 0.03 && t < w.e + 0.05;
        const said = t >= w.e;
        const txt = { ...BASE_FIX, ...fix }[w.w.toLowerCase().replace(/[^a-záéíóúñü0-9]/gi, "")] ?? w.w;
        return (
          <span
            key={k}
            style={{
              color: on ? C.yellow : C.white,
              opacity: on || said ? 1 : 0.9,
              WebkitTextStroke: "10px rgba(0,0,0,0.85)",
              paintOrder: "stroke fill",
              textShadow: "0 6px 18px rgba(0,0,0,0.6)",
            }}
          >
            {txt}
          </span>
        );
      })}
    </div>
  );
};
