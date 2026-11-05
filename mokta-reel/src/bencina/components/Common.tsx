import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { C, EASE_OUT, FONT_D, FONT_UI, ramp } from "../theme";
import { SCENES, WORDS } from "../timing";

/* ------------------------------------------------------------------ fondo */
export const Background: React.FC = () => {
  const t = useCurrentFrame();
  const drift = (t * 0.6) % 60;
  return (
    <AbsoluteFill style={{ background: `radial-gradient(120% 80% at 50% 42%, ${C.bg1} 0%, ${C.bg0} 70%)` }}>
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
        <defs>
          <pattern id="bgGrid" width={60} height={60} patternUnits="userSpaceOnUse" patternTransform={`translate(0 ${drift})`}>
            <path d="M60 0 L0 0 0 60" fill="none" stroke="rgba(127,211,255,0.055)" strokeWidth={2} />
          </pattern>
          <radialGradient id="bgFade" cx="50%" cy="45%" r="65%">
            <stop offset="0%" stopColor="#fff" stopOpacity={1} />
            <stop offset="100%" stopColor="#fff" stopOpacity={0} />
          </radialGradient>
          <mask id="bgMask">
            <rect width={1080} height={1920} fill="url(#bgFade)" />
          </mask>
        </defs>
        <rect width={1080} height={1920} fill="url(#bgGrid)" mask="url(#bgMask)" />
      </svg>
      <AbsoluteFill
        style={{
          background: "radial-gradient(110% 70% at 50% 50%, rgba(0,0,0,0) 55%, rgba(0,0,0,0.55) 100%)",
        }}
      />
    </AbsoluteFill>
  );
};

/* ---------------------------------------------- contenedor de escena con entrada "whip" */
export const SceneIn: React.FC<{ from: number; children: React.ReactNode; dir?: 1 | -1 }> = ({ from, children, dir = 1 }) => {
  const t = useCurrentFrame();
  if (from === 0) return <AbsoluteFill>{children}</AbsoluteFill>; // el primer fotograma ya es la portada
  const k = ramp(t, from, from + 8, EASE_OUT);
  return (
    <AbsoluteFill
      style={{
        opacity: interpolate(k, [0, 0.4, 1], [0, 1, 1]),
        scale: String(interpolate(k, [0, 1], [1.07, 1])),
        translate: `${interpolate(k, [0, 1], [70 * dir, 0])}px 0px`,
        filter: k < 1 ? `blur(${(1 - k) * 14}px)` : undefined,
      }}
    >
      {children}
    </AbsoluteFill>
  );
};

/* --------------------------------------------------------------- subtítulos */
type Page = { words: number[]; start: number; end: number };

const buildPages = (): Page[] => {
  const pages: Page[] = [];
  let cur: number[] = [];
  const flush = () => {
    if (cur.length) pages.push({ words: cur, start: 0, end: 0 });
    cur = [];
  };
  WORDS.forEach((w, i) => {
    const chars = cur.reduce((a, j) => a + WORDS[j].text.length + 1, 0) + w.text.length;
    if (cur.length >= 3 || (cur.length > 0 && chars > 17)) flush();
    cur.push(i);
    if (/[.,:?…]$/.test(w.text)) flush();
  });
  flush();
  pages.forEach((p) => {
    p.start = WORDS[p.words[0]].start - 2;
  });
  pages.forEach((p, k) => {
    const lastEnd = WORDS[p.words[p.words.length - 1]].end;
    const next = pages[k + 1];
    p.end = next ? Math.min(next.start, lastEnd + 14) : lastEnd + 20;
  });
  return pages;
};
const PAGES = buildPages();

const clean = (s: string) => s.replace(/[¿?¡!.,:…]/g, "").toUpperCase();

/** Palabras clave que se pintan del color de la bencina. */
const KEY = new Set([
  "ÚLTIMOS", "DESAPARECER", "RÁPIDO", "IMAGINACIÓN", "DESPLOMA", "ALTURA", "LITROS", "FLOTADOR",
  "RESISTENCIA", "SEÑAL", "AGUJA", "TOPE", "MÁXIMO", "ENTERA", "CAJA", "ANGOSTO", "NIVEL", "LITRO",
  "PROPÓSITO", "VACÍO", "RESERVA", "IGUAL", "BOMBA", "ENFRÍA", "ARRIBA", "MITAD",
]);

/** Contorno grueso con sombras (paint-order no aplica a texto HTML en el Chrome de render). */
const OUTLINE = [
  ...Array.from({ length: 16 }).map((_, k) => {
    const a = (k / 16) * Math.PI * 2;
    return `${(Math.cos(a) * 5).toFixed(1)}px ${(Math.sin(a) * 5).toFixed(1)}px 0 rgba(3,5,10,0.95)`;
  }),
  "0 8px 24px rgba(0,0,0,0.8)",
].join(", ");

export const Captions: React.FC = () => {
  const t = useCurrentFrame();
  const scene = SCENES.find((s) => t >= s.from && t < s.to);
  if (!scene || !scene.captions) return null;
  const page = PAGES.find((p) => t >= p.start && t < p.end && p.start >= scene.from - 2);
  if (!page) return null;
  const k = ramp(t, page.start, page.start + 5, EASE_OUT);
  return (
    <div
      style={{
        position: "absolute",
        left: 90,
        right: 90,
        top: 1388,
        display: "flex",
        justifyContent: "center",
        flexWrap: "wrap",
        gap: "0 22px",
        scale: String(interpolate(k, [0, 1], [0.86, 1])),
        opacity: k,
      }}
    >
      {page.words.map((i) => {
        const w = WORDS[i];
        const active = t >= w.start - 1 && t < w.end + 2;
        const said = t >= w.start - 1;
        const isKey = KEY.has(clean(w.text));
        const pk = ramp(t, w.start - 1, w.start + 4, EASE_OUT);
        return (
          <span
            key={i}
            style={{
              fontFamily: FONT_D,
              fontWeight: 800,
              fontSize: 92,
              lineHeight: 1.05,
              letterSpacing: 1,
              color: isKey && said ? C.fuel : C.white,
              opacity: said ? 1 : 0.5,
              textShadow: OUTLINE,
              display: "inline-block",
              scale: String(active ? interpolate(pk, [0, 1], [1.16, 1.04]) : 1),
              translate: `0px ${active ? interpolate(pk, [0, 1], [-6, 0]) : 0}px`,
            }}
          >
            {w.text.replace(/[.,:…]/g, "").toUpperCase()}
          </span>
        );
      })}
    </div>
  );
};

/* ------------------------------------------------------- chip de razón (1 · 2 · 3) */
export const ReasonChip: React.FC<{ n: number; title: string; at: number }> = ({ n, title, at }) => {
  const t = useCurrentFrame();
  const k = ramp(t, at - 2, at + 7, EASE_OUT);
  const k2 = ramp(t, at + 3, at + 12, EASE_OUT);
  return (
    <div
      style={{
        position: "absolute",
        top: 214,
        left: 0,
        right: 0,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        gap: 26,
      }}
    >
      <div
        style={{
          width: 132,
          height: 132,
          borderRadius: 66,
          background: C.fuel,
          color: C.ink,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: FONT_D,
          fontWeight: 800,
          fontSize: 104,
          boxShadow: `0 0 50px ${C.fuel}88`,
          opacity: k,
          scale: String(interpolate(k, [0, 1], [2.1, 1])),
          rotate: `${interpolate(k, [0, 1], [-25, 0])}deg`,
        }}
      >
        {n}
      </div>
      <div style={{ opacity: k2, translate: `${interpolate(k2, [0, 1], [-30, 0])}px 0px` }}>
        <div style={{ fontFamily: FONT_UI, fontWeight: 700, fontSize: 30, letterSpacing: 7, color: C.cyan }}>
          RAZÓN {n} DE 3
        </div>
        <div style={{ fontFamily: FONT_D, fontWeight: 800, fontSize: 74, lineHeight: 1, color: C.white }}>{title}</div>
      </div>
    </div>
  );
};

/* -------------------------------------------------------------- marca MOKTA */
export const Brand: React.FC<{ o?: number }> = ({ o = 1 }) => (
  <div
    style={{
      position: "absolute",
      top: 120,
      left: 0,
      right: 0,
      textAlign: "center",
      fontFamily: FONT_D,
      fontWeight: 700,
      fontSize: 34,
      letterSpacing: 16,
      color: "rgba(244,246,248,0.42)",
      opacity: o,
    }}
  >
    MOKTA
  </div>
);
