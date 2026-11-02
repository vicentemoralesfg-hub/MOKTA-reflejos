import React from "react";
import { AbsoluteFill } from "remotion";
import { C, DISPLAY, UI } from "../../brand";
import { BUDDY_COLOR, Buddy, Kind } from "./Buddy";

/**
 * Carrusel 01 · "Los motores en el asado familiar" (1080×1350, 8 láminas).
 * Humor de identidad + etiquetado ("etiqueta al diésel de tu familia").
 * Cada rasgo cómico se apoya en una característica real del motor (ver copy.md).
 */
type Guest = { kind: Kind; engine: string; role: [string, string]; quote: string; traits: string[] };

export const GUESTS: Guest[] = [
  {
    kind: "diesel",
    engine: "MOTOR DIÉSEL",
    role: ["EL TÍO", "INDESTRUCTIBLE"],
    quote: "«Este motor tiene 400 mil kilómetros y está como nuevo»",
    traits: ["Le cuesta arrancar en la mañana. Después, no lo para nadie.", "Siempre termina a cargo de la parrilla."],
  },
  {
    kind: "v8",
    engine: "MOTOR V8",
    role: ["EL PRIMO", "DEL PARLANTE"],
    quote: "«¿Escuchaste cómo suena?»",
    traits: ["Nadie le pidió música. Igual la puso.", "Gasta como si la carne fuera gratis."],
  },
  {
    kind: "turbo",
    engine: "1.0 TURBO · 3 CILINDROS",
    role: ["EL CHICO QUE", "NADIE PESCABA"],
    quote: "«No me subestimen»",
    traits: ["Chico, ahorrativo y subestimado.", "Hasta que sopla el turbo y todos lo miran."],
  },
  {
    kind: "hibrido",
    engine: "HÍBRIDO",
    role: ["LA PRIMA QUE TRAE", "SU PROPIO TÁPER"],
    quote: "«¿Sabías que en la ciudad casi no gasto?»",
    traits: ["Ahorra en todo… y te lo explica.", "En el taco es la más feliz de la mesa."],
  },
  {
    kind: "electrico",
    engine: "100 % ELÉCTRICO",
    role: ["EL QUE LLEGÓ", "SIN HACER RUIDO"],
    quote: "«¿Hay algún enchufe por aquí?»",
    traits: ["Nadie lo escuchó llegar. Ya está en tu silla.", "Sale disparado: su fuerza llega al instante."],
  },
  {
    kind: "rotativo",
    engine: "MOTOR ROTATIVO",
    role: ["EL AMIGO GENIO", "(PERO COMPLICADO)"],
    quote: "«Es que yo funciono distinto»",
    traits: ["Todos lo admiran. Nadie lo entiende.", "Toma aceite como si fuera bebida."],
  },
];

const Frame: React.FC<{ children: React.ReactNode; glow?: string; page: number; total: number }> = ({ children, glow, page, total }) => (
  <AbsoluteFill style={{ background: C.ink, overflow: "hidden" }}>
    {glow ? <AbsoluteFill style={{ background: `radial-gradient(760px 640px at 72% 52%, ${glow}55, transparent 70%)` }} /> : null}
    {/* brasas: puntitos cálidos */}
    <AbsoluteFill
      style={{
        backgroundImage: "radial-gradient(rgba(255,140,60,0.10) 2px, transparent 2.5px)",
        backgroundSize: "46px 46px",
        maskImage: "linear-gradient(180deg, transparent 55%, black 100%)",
      }}
    />
    {children}
    <div style={{ position: "absolute", top: 54, left: 70, right: 70, display: "flex", justifyContent: "space-between", fontFamily: UI, fontWeight: 700, fontSize: 28, letterSpacing: 5, color: C.faint }}>
      <span>MOTORES EN EL ASADO</span>
      <span>
        {page}/{total}
      </span>
    </div>
    <div style={{ position: "absolute", bottom: 50, left: 70, fontFamily: DISPLAY, fontWeight: 700, fontSize: 34, letterSpacing: 14, color: "rgba(244,246,248,0.5)" }}>MOKTA</div>
    {page < total ? (
      <div style={{ position: "absolute", bottom: 46, right: 70, fontFamily: UI, fontWeight: 600, fontSize: 30, color: C.faint }}>desliza →</div>
    ) : null}
  </AbsoluteFill>
);

const Grill: React.FC = () => (
  <svg width={620} height={300} viewBox="0 0 620 300">
    {/* humo */}
    <g fill="none" stroke="rgba(244,246,248,0.18)" strokeWidth={10} strokeLinecap="round">
      <path d="M200 70 q-30 -30 0 -60" />
      <path d="M310 60 q30 -30 0 -60" />
      <path d="M420 70 q-30 -30 0 -60" />
    </g>
    {/* parrilla */}
    <rect x={60} y={96} width={500} height={86} rx={16} fill="#2A2D34" stroke="#0B0C10" strokeWidth={6} />
    <rect x={70} y={100} width={480} height={30} rx={8} fill="#FF7A2E" opacity={0.85} />
    <rect x={70} y={100} width={480} height={30} rx={8} fill="url(#embers)" />
    {Array.from({ length: 12 }).map((_, i) => (
      <line key={i} x1={84 + i * 41} y1={92} x2={84 + i * 41} y2={136} stroke="#9AA0AA" strokeWidth={5} />
    ))}
    {/* carne y chorizos */}
    <rect x={110} y={84} width={120} height={30} rx={14} fill="#9C3B22" stroke="#0B0C10" strokeWidth={4} />
    <rect x={250} y={86} width={70} height={26} rx={13} fill="#B2452A" stroke="#0B0C10" strokeWidth={4} />
    <rect x={330} y={86} width={70} height={26} rx={13} fill="#B2452A" stroke="#0B0C10" strokeWidth={4} />
    <path d="M420 88 h110 l-10 26 h-96 z" fill="#8E3A24" stroke="#0B0C10" strokeWidth={4} />
    <line x1={110} y1={182} x2={80} y2={290} stroke="#2A2D34" strokeWidth={14} />
    <line x1={510} y1={182} x2={540} y2={290} stroke="#2A2D34" strokeWidth={14} />
    <defs>
      <linearGradient id="embers" x1="0" x2="1">
        <stop offset="0" stopColor="#FFD24A" stopOpacity="0.5" />
        <stop offset="0.5" stopColor="#FF4A1A" stopOpacity="0.2" />
        <stop offset="1" stopColor="#FFD24A" stopOpacity="0.5" />
      </linearGradient>
    </defs>
  </svg>
);

export const AsadoCover: React.FC = () => (
  <Frame page={1} total={8}>
    <AbsoluteFill style={{ background: "radial-gradient(900px 600px at 50% 80%, rgba(255,110,40,0.28), transparent 70%)" }} />
    <div style={{ position: "absolute", top: 130, left: 70, right: 70, fontFamily: DISPLAY, fontWeight: 800, fontSize: 150, lineHeight: 0.9, color: C.white }}>
      SI LOS MOTORES
      <br />
      FUERAN AL
      <br />
      <span style={{ color: "#FF8A3D" }}>ASADO FAMILIAR</span>
    </div>
    <div style={{ position: "absolute", top: 556, left: 72, fontFamily: UI, fontWeight: 600, fontSize: 44, color: C.dim }}>Busca al tuyo. Todas las familias tienen uno.</div>
    {/* fila de atrás → parrilla → fila de adelante */}
    {(
      [
        ["rotativo", 150, 712, 240, false],
        ["diesel", 395, 640, 300, false],
        ["hibrido", 690, 712, 250, true],
      ] as [Kind, number, number, number, boolean][]
    ).map(([k, x, y, s, flip]) => (
      <div key={k} style={{ position: "absolute", left: x, top: y }}>
        <Buddy kind={k} size={s} flip={flip} />
      </div>
    ))}
    <div style={{ position: "absolute", left: 230, top: 892, scale: "1.05" }}>
      <Grill />
    </div>
    {(
      [
        ["v8", 10, 975, 260, false],
        ["turbo", 300, 1095, 190, false],
        ["electrico", 800, 985, 235, true],
      ] as [Kind, number, number, number, boolean][]
    ).map(([k, x, y, s, flip]) => (
      <div key={k} style={{ position: "absolute", left: x, top: y }}>
        <Buddy kind={k} size={s} flip={flip} />
      </div>
    ))}
  </Frame>
);

export const AsadoGuest: React.FC<{ i: number }> = ({ i }) => {
  const g = GUESTS[i];
  const col = BUDDY_COLOR[g.kind];
  return (
    <Frame glow={col} page={i + 2} total={8}>
      <div style={{ position: "absolute", top: 118, left: 70, fontFamily: UI, fontWeight: 700, fontSize: 30, letterSpacing: 6, color: col }}>
        INVITADO {i + 1} DE {GUESTS.length}
      </div>
      <div style={{ position: "absolute", top: 160, left: 66, right: 60, fontFamily: DISPLAY, fontWeight: 800, fontSize: 124, lineHeight: 0.92, color: C.white }}>
        {g.role[0]}
        <br />
        <span style={{ color: col }}>{g.role[1]}</span>
      </div>
      <div
        style={{
          position: "absolute",
          top: 410,
          left: 70,
          padding: "12px 24px",
          borderRadius: 999,
          background: col,
          color: C.ink,
          fontFamily: UI,
          fontWeight: 800,
          fontSize: 30,
          letterSpacing: 2,
        }}
      >
        {g.engine}
      </div>
      {/* personaje */}
      <div style={{ position: "absolute", top: 470, right: 40 }}>
        <Buddy kind={g.kind} size={500} />
      </div>
      {/* frase típica */}
      <div
        style={{
          position: "absolute",
          top: 520,
          left: 70,
          width: 440,
          padding: "28px 30px",
          borderRadius: 34,
          background: C.white,
          color: C.ink,
          fontFamily: UI,
          fontWeight: 700,
          fontSize: 40,
          lineHeight: 1.22,
          boxShadow: "0 20px 50px rgba(0,0,0,0.45)",
        }}
      >
        {g.quote}
        <svg width={60} height={40} viewBox="0 0 60 40" style={{ position: "absolute", right: -34, top: 70 }}>
          <path d="M0 0 L60 22 L0 34 Z" fill={C.white} />
        </svg>
      </div>
      {/* rasgos */}
      <div style={{ position: "absolute", top: 1010, left: 70, right: 70, display: "flex", flexDirection: "column", gap: 22 }}>
        {g.traits.map((t) => (
          <div key={t} style={{ display: "flex", gap: 20, alignItems: "flex-start", fontFamily: UI, fontWeight: 600, fontSize: 41, lineHeight: 1.25, color: C.white }}>
            <div style={{ width: 16, height: 16, borderRadius: 8, background: col, marginTop: 17, flexShrink: 0 }} />
            {t}
          </div>
        ))}
      </div>
    </Frame>
  );
};

export const AsadoClose: React.FC = () => (
  <Frame page={8} total={8}>
    <AbsoluteFill style={{ background: "radial-gradient(900px 700px at 50% 70%, rgba(255,200,61,0.16), transparent 70%)" }} />
    <div style={{ position: "absolute", top: 150, left: 0, right: 0, textAlign: "center", fontFamily: DISPLAY, fontWeight: 800, fontSize: 160, lineHeight: 0.9, color: C.white }}>
      ¿Y TÚ
      <br />
      <span style={{ color: C.yellow }}>CUÁL ERES?</span>
    </div>
    <div style={{ position: "absolute", top: 470, left: 0, right: 0, display: "flex", justifyContent: "center", gap: 0, flexWrap: "wrap", padding: "0 40px" }}>
      {GUESTS.map((g) => (
        <div key={g.kind} style={{ width: 320, display: "flex", flexDirection: "column", alignItems: "center", marginBottom: 6 }}>
          <Buddy kind={g.kind} size={200} />
          <div style={{ fontFamily: UI, fontWeight: 700, fontSize: 26, color: BUDDY_COLOR[g.kind], marginTop: 4, letterSpacing: 1 }}>{g.engine.split(" · ")[0]}</div>
        </div>
      ))}
    </div>
    <div
      style={{
        position: "absolute",
        top: 1086,
        left: 120,
        right: 120,
        textAlign: "center",
        padding: "26px 0",
        borderRadius: 28,
        background: C.yellow,
        color: C.ink,
        fontFamily: UI,
        fontWeight: 800,
        fontSize: 44,
      }}
    >
      Etiqueta al diésel de tu familia 👇
    </div>
  </Frame>
);
