import React from "react";
import { AbsoluteFill } from "remotion";
import { WORDS, clamp01 } from "../tl";
import { COL, FONT_D } from "./style";

/**
 * Subtítulos palabra a palabra: cada palabra aparece cuando se dice (tiempos del alineador Qwen3),
 * la que suena va en ámbar. Bloques cortos para lectura rápida en móvil.
 * `t` = texto en pantalla de cada palabra (con tildes y puntuación), alineado 1:1 con los índices.
 */
type Chunk = { from: number; t: string[]; hot?: number[] };

const CHUNKS: Chunk[] = [
  { from: 0, t: ["SI", "SE", "TE", "REVIENTA"], hot: [3] },
  { from: 4, t: ["UN", "NEUMÁTICO"] },
  { from: 6, t: ["EN", "PLENA", "CARRETERA"] },
  { from: 9, t: ["Y", "TU", "PRIMERA", "REACCIÓN", "ES…"] },
  { from: 15, t: ["PODRÍAS", "ESTAR", "COMETIENDO", "UN", "ERROR"], hot: [19] },
  { from: 20, t: ["QUE", "TE", "PUEDE", "COSTAR", "LA", "VIDA."] },
  { from: 27, t: ["VAS", "A", "100…"] },
  { from: 30, t: ["EL", "AUTO", "SE", "TIRA", "HACIA", "UN", "LADO,"] },
  { from: 37, t: ["Y", "TU", "PIE", "HACE", "LO", "QUE"] },
  { from: 43, t: ["HARÍA", "CUALQUIERA:"] },
  { from: 48, t: ["Y", "JUSTO", "AHÍ,"] },
  { from: 51, t: ["EL", "AUTO", "SE", "PUEDE", "CRUZAR."] },
  { from: 58, t: ["SI", "FRENAR", "PARECE", "LO", "MÁS", "LÓGICO?"] },
  { from: 64, t: ["LA", "RUEDA", "REVENTADA", "SE", "ARRASTRA"] },
  { from: 69, t: ["Y", "TIRA", "EL", "AUTO", "HACIA", "SU", "LADO."] },
  { from: 76, t: ["SI", "ENCIMA", "FRENAS", "FUERTE,"] },
  { from: 80, t: ["LO", "DESEQUILIBRAS", "TODAVÍA", "MÁS,"] },
  { from: 84, t: ["Y", "PUEDE", "GIRAR", "SOBRE", "SÍ", "MISMO."] },
  { from: 90, t: ["Y", "HAY", "OTRO", "REFLEJO", "QUE", "TAMBIÉN"] },
  { from: 96, t: ["TE", "PUEDE", "SACAR", "DEL", "CAMINO:"] },
  { from: 107, t: ["VOLANTE", "FIRME,", "CON", "LAS", "DOS", "MANOS."] },
  { from: 114, t: ["MANTÉN", "EL", "AUTO", "RECTO,"] },
  { from: 118, t: ["SIN", "MOVIMIENTOS", "BRUSCOS."] },
  { from: 122, t: ["SUELTA", "EL", "ACELERADOR", "DE", "A", "POCO"] },
  { from: 128, t: ["Y", "DEJA", "QUE", "PIERDA", "VELOCIDAD", "SOLO."] },
  { from: 134, t: ["Y", "CUANDO", "YA", "ESTÉ", "BAJO", "CONTROL:"] },
  { from: 140, t: ["FRENA", "SUAVE,"] },
  { from: 142, t: ["PON", "LAS", "BALIZAS"] },
  { from: 145, t: ["Y", "ORÍLLATE", "DONDE", "SEA", "SEGURO."] },
];

export const Captions: React.FC<{ T: number; y?: number }> = ({ T, y = 1300 }) => {
  // bloque activo: el último que ya empezó y que no terminó hace más de 0,35 s
  let active: Chunk | null = null;
  for (const c of CHUNKS) {
    const s = WORDS[c.from].s - 0.04;
    const last = c.from + c.t.length - 1;
    const e = WORDS[last].e + 0.35;
    const next = CHUNKS[CHUNKS.indexOf(c) + 1];
    const hardEnd = next ? Math.min(e, WORDS[next.from].s - 0.04) : e;
    if (T >= s && T < hardEnd) active = c;
  }
  if (!active) return null;
  const c = active;
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <div
        style={{
          position: "absolute",
          left: 70,
          right: 70,
          top: y,
          transform: "translateY(-50%)",
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          gap: "0 22px",
          fontFamily: FONT_D,
          fontWeight: 800,
          fontSize: 88,
          lineHeight: 1.02,
          letterSpacing: 0.5,
          textAlign: "center",
        }}
      >
        {c.t.map((txt, k) => {
          const wi = c.from + k;
          const w = WORDS[wi];
          const shown = T >= w.s - 0.03;
          const speaking = T >= w.s - 0.03 && T < w.e + 0.05;
          const pop = clamp01((T - (w.s - 0.03)) / 0.12);
          const sc = shown ? 1 + 0.12 * (1 - pop) * (1 - pop) : 1;
          const hot = c.hot?.includes(wi);
          return (
            <span
              key={wi}
              style={{
                display: "inline-block",
                opacity: shown ? 1 : 0,
                transform: `scale(${sc})`,
                transformOrigin: "50% 80%",
                color: speaking ? COL.amber : hot ? COL.red : COL.white,
                textShadow: "0 4px 18px rgba(0,0,0,0.75), 0 0 2px rgba(0,0,0,0.9)",
                WebkitTextStroke: "2px rgba(0,0,0,0.35)",
                paintOrder: "stroke fill",
              }}
            >
              {txt}
            </span>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
