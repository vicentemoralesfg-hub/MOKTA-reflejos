import React from "react";
import { AbsoluteFill } from "remotion";
import { C, DISPLAY, UI } from "../brand";

/** Imagen 01 · "¿Qué conductor eres?" — grilla 3×3 (1080×1350). Comentar el número + etiquetar. */
const Wt = "#F4F6F8";
const Yl = C.yellow;
const ln = { fill: "none", stroke: Wt, strokeWidth: 7, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
const hl = { ...ln, stroke: Yl };

const icons: React.ReactNode[] = [
  // 1 intermitente después de doblar
  <g key={1}>
    <path d="M40 150 V90 Q40 60 70 60 H140" {...ln} />
    <path d="M120 40 L145 60 L120 80" {...ln} />
    <path d="M150 120 l20 -14 v28 z" fill={Yl} />
    <path d="M178 106 q10 14 0 28 M190 98 q16 22 0 44" {...hl} strokeWidth={5} />
  </g>,
  // 2 el colado
  <g key={2}>
    {[0, 1, 2].map((i) => (
      <rect key={i} x={30 + i * 0} y={30 + i * 44} width={60} height={34} rx={8} {...ln} strokeWidth={6} />
    ))}
    <rect x={130} y={120} width={60} height={34} rx={8} fill={Yl} />
    <path d="M150 112 Q130 70 100 64" {...hl} strokeWidth={6} />
    <path d="M104 52 l-8 12 l14 4" {...hl} strokeWidth={6} />
  </g>,
  // 3 bocinazo al verde
  <g key={3}>
    <rect x={40} y={30} width={56} height={140} rx={16} {...ln} />
    <circle cx={68} cy={60} r={12} {...ln} strokeWidth={5} opacity={0.4} />
    <circle cx={68} cy={100} r={12} {...ln} strokeWidth={5} opacity={0.4} />
    <circle cx={68} cy={140} r={14} fill={C.green} />
    <path d="M130 100 l26 -20 v40 z" fill={Yl} />
    <path d="M168 80 q14 20 0 40 M182 70 q22 30 0 60" {...hl} strokeWidth={5} />
  </g>,
  // 4 a 60 por la pista izquierda
  <g key={4}>
    <path d="M30 150 A 70 70 0 0 1 170 150" {...ln} />
    <line x1={100} y1={150} x2={62} y2={112} stroke={Yl} strokeWidth={7} strokeLinecap="round" />
    <circle cx={100} cy={150} r={8} fill={Wt} />
    <text x={150} y={58} fontFamily="Barlow Condensed" fontWeight={800} fontSize={44} fill={Yl}>60</text>
    <path d="M40 40 l-20 20 l20 20" {...ln} strokeWidth={6} />
  </g>,
  // 5 estacionado en dos lugares
  <g key={5}>
    <path d="M30 40 V170 M100 40 V170 M170 40 V170" {...ln} strokeWidth={5} opacity={0.6} />
    <rect x={52} y={80} width={96} height={52} rx={14} fill={Yl} transform="rotate(-18 100 106)" />
  </g>,
  // 6 lomo de toro como muro
  <g key={6}>
    <path d="M20 150 H70 Q100 100 130 150 H180" {...ln} />
    <path d="M70 150 Q100 100 130 150 Z" fill={Yl} opacity={0.9} />
    <text x={150} y={90} fontFamily="Barlow Condensed" fontWeight={800} fontSize={70} fill={Yl}>!</text>
    <rect x={30} y={60} width={56} height={30} rx={8} {...ln} strokeWidth={6} />
  </g>,
  // 7 copiloto que frena con el pie
  <g key={7}>
    <rect x={40} y={130} width={120} height={20} rx={6} {...ln} strokeWidth={6} opacity={0.5} />
    <path d="M110 40 v60 q0 12 12 16 l44 12 q10 3 8 14 h-70 q-10 0 -10 -10 v-92" fill={Yl} />
    <path d="M40 70 q-14 10 0 20 M28 60 q-24 20 0 40" {...ln} strokeWidth={5} opacity={0.7} />
  </g>,
  // 8 "conozco un atajo"
  <g key={8}>
    <path d="M30 160 Q60 100 100 130 T150 80 Q170 50 140 40" {...ln} strokeDasharray="12 12" />
    <path d="M150 20 a22 22 0 0 1 22 22 c0 18 -22 40 -22 40 s-22 -22 -22 -40 a22 22 0 0 1 22 -22z" fill={Yl} />
    <text x={40} y={70} fontFamily="Barlow Condensed" fontWeight={800} fontSize={54} fill={Wt}>?</text>
  </g>,
  // 9 siempre en reserva
  <g key={9}>
    <path d="M30 150 A 70 70 0 0 1 170 150" {...ln} />
    <line x1={100} y1={150} x2={38} y2={142} stroke={C.red} strokeWidth={7} strokeLinecap="round" />
    <circle cx={100} cy={150} r={8} fill={Wt} />
    <text x={24} y={186} fontFamily="Barlow Condensed" fontWeight={800} fontSize={34} fill={C.red}>E</text>
    <rect x={120} y={40} width={30} height={40} rx={4} fill={Yl} />
    <path d="M150 52 h6 q6 0 6 6 v16 q0 6 6 6" {...hl} strokeWidth={4} />
  </g>,
];

const LABELS = [
  "Pone el intermitente después de doblar",
  "Se cuela en la fila de la salida",
  "Toca la bocina 0,1 s después del verde",
  "Va a 60 por la pista izquierda",
  "Se estaciona en dos lugares",
  "Frena en cada lomo de toro como si fuera un muro",
  "El copiloto que «frena» con el pie",
  "«Conozco un atajo»",
  "Anda siempre en reserva",
];

export const Conductores: React.FC = () => (
  <AbsoluteFill style={{ background: C.ink }}>
    <AbsoluteFill style={{ background: "radial-gradient(900px 600px at 50% 0%, rgba(255,200,61,0.14), transparent 70%)" }} />
    <div style={{ position: "absolute", top: 70, left: 0, right: 0, textAlign: "center", fontFamily: DISPLAY, fontWeight: 800, fontSize: 104, lineHeight: 0.92, color: Wt, whiteSpace: "nowrap" }}>
      ¿QUÉ CONDUCTOR <span style={{ color: Yl }}>ERES?</span>
    </div>
    <div style={{ position: "absolute", top: 186, left: 0, right: 0, textAlign: "center", fontFamily: UI, fontWeight: 600, fontSize: 40, color: C.dim }}>
      Comenta tu número y etiqueta al 4 👇
    </div>
    <div style={{ position: "absolute", top: 296, left: 60, right: 60, display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 18 }}>
      {LABELS.map((l, i) => (
        <div
          key={i}
          style={{
            height: 306,
            borderRadius: 28,
            background: C.card,
            border: "2px solid rgba(244,246,248,0.08)",
            position: "relative",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            padding: "18px 18px 0",
          }}
        >
          <div style={{ position: "absolute", top: 12, left: 20, fontFamily: DISPLAY, fontWeight: 800, fontSize: 64, color: Yl, lineHeight: 1 }}>{i + 1}</div>
          <svg width={160} height={160} viewBox="0 0 200 200" style={{ marginTop: 14, overflow: "visible" }}>
            {icons[i]}
          </svg>
          <div style={{ marginTop: 14, textAlign: "center", fontFamily: UI, fontWeight: 700, fontSize: 27, lineHeight: 1.22, color: Wt }}>{l}</div>
        </div>
      ))}
    </div>
    <div style={{ position: "absolute", bottom: 46, left: 0, right: 0, textAlign: "center", fontFamily: DISPLAY, fontWeight: 700, fontSize: 36, letterSpacing: 16, color: "rgba(244,246,248,0.5)" }}>MOKTA</div>
  </AbsoluteFill>
);
