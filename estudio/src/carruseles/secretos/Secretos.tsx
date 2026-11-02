import React from "react";
import { AbsoluteFill } from "remotion";
import { C, DISPLAY, UI } from "../../brand";

/**
 * Carrusel 02 · "7 cosas que tu auto tiene y nadie te explicó" (1080×1350, 9 láminas).
 * Utilidad pura → guardados y envíos. Ilustraciones de línea propias (SVG).
 */
type Item = { title: string; body: string; where: string; art: React.FC };

const W = "#F4F6F8";
const Y = C.yellow;
const line = { fill: "none", stroke: W, strokeWidth: 9, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
const hot = { ...line, stroke: Y };

const ArtFuel: React.FC = () => (
  <svg viewBox="0 0 520 520" width="100%" height="100%">
    <path d="M90 330 A 190 190 0 0 1 430 330" {...line} opacity={0.5} />
    {[0, 1, 2, 3, 4].map((i) => {
      const a = Math.PI * (1 - i / 4);
      return <line key={i} x1={260 + Math.cos(a) * 170} y1={330 - Math.sin(a) * 170} x2={260 + Math.cos(a) * 140} y2={330 - Math.sin(a) * 140} {...line} />;
    })}
    <text x={88} y={392} fontFamily="Barlow Condensed" fontWeight={800} fontSize={54} fill={C.red}>E</text>
    <text x={410} y={392} fontFamily="Barlow Condensed" fontWeight={800} fontSize={54} fill={W}>F</text>
    <line x1={260} y1={330} x2={150} y2={250} stroke={C.red} strokeWidth={10} strokeLinecap="round" />
    <circle cx={260} cy={330} r={16} fill={W} />
    {/* surtidor + flecha */}
    <rect x={200} y={380} width={60} height={86} rx={8} {...line} strokeWidth={8} />
    <rect x={212} y={392} width={36} height={24} rx={3} fill={W} />
    <path d="M260 404 h12 a8 8 0 0 1 8 8 v34 a8 8 0 0 0 16 0 v-38 l-12 -14" {...line} strokeWidth={7} />
    <path d="M318 402 L352 423 L318 444 Z" fill={Y} stroke={Y} strokeWidth={4} strokeLinejoin="round" />
    <circle cx={338} cy={423} r={40} {...hot} strokeWidth={5} strokeDasharray="10 10" />
  </svg>
);

const ArtDoor: React.FC = () => (
  <svg viewBox="0 0 520 520" width="100%" height="100%">
    {/* marco de la puerta (pilar B) y puerta abierta */}
    <path d="M150 60 V470" {...line} />
    <path d="M150 60 Q230 60 260 120 V470" {...line} opacity={0.55} />
    <path d="M300 110 L470 60 V430 L300 480 Z" {...line} />
    <path d="M320 140 L450 102 V230 L320 262 Z" {...line} opacity={0.5} />
    <path d="M400 300 h40" {...line} />
    {/* etiqueta */}
    <rect x={168} y={210} width={82} height={130} rx={8} fill={Y} />
    <rect x={180} y={226} width={58} height={10} rx={3} fill={C.ink} />
    {[250, 268, 286, 304].map((y) => (
      <rect key={y} x={180} y={y} width={y === 268 ? 40 : 58} height={8} rx={3} fill={C.ink} opacity={0.6} />
    ))}
    <text x={209} y={330} textAnchor="middle" fontFamily="Inter" fontWeight={800} fontSize={18} fill={C.ink}>2,3 bar</text>
    <path d="M60 280 L150 280" {...hot} strokeWidth={6} strokeDasharray="12 10" />
  </svg>
);

const ArtMirror: React.FC = () => (
  <svg viewBox="0 0 520 520" width="100%" height="100%">
    <rect x={240} y={40} width={40} height={90} rx={12} {...line} />
    <rect x={60} y={130} width={400} height={170} rx={60} {...line} />
    <rect x={88} y={156} width={344} height={118} rx={42} fill="rgba(127,211,255,0.10)" stroke="none" />
    <circle cx={190} cy={214} r={22} fill={W} opacity={0.35} />
    <circle cx={330} cy={214} r={22} fill={W} opacity={0.35} />
    {/* palanquita */}
    <rect x={232} y={300} width={56} height={58} rx={12} fill={Y} />
    <path d="M330 420 A 90 90 0 0 1 190 420" {...hot} strokeWidth={7} />
    <path d="M190 420 l8 -32 M190 420 l32 -6" {...hot} strokeWidth={7} />
    <text x={260} y={490} textAnchor="middle" fontFamily="Inter" fontWeight={700} fontSize={34} fill={Y}>tirar de noche</text>
  </svg>
);

const ArtKey: React.FC = () => (
  <svg viewBox="0 0 520 520" width="100%" height="100%">
    <rect x={150} y={70} width={190} height={300} rx={70} {...line} />
    <circle cx={245} cy={170} r={34} {...line} strokeWidth={7} />
    <path d="M232 170 l13 -13 l13 13 M232 186 h26" {...line} strokeWidth={6} />
    <circle cx={245} cy={270} r={34} {...line} strokeWidth={7} />
    <rect x={226} y={258} width={38} height={26} rx={5} {...line} strokeWidth={6} />
    {/* llave metálica deslizando */}
    <path d="M330 300 h120 l20 18 l-18 18 l-14 -10 l-14 10 l-14 -10 l-14 10 h-66" fill={Y} stroke={Y} strokeWidth={4} strokeLinejoin="round" />
    <rect x={300} y={286} width={44} height={56} rx={10} fill={Y} />
    <path d="M300 420 h150" {...hot} strokeWidth={7} />
    <path d="M430 400 l20 20 l-20 20" {...hot} strokeWidth={7} />
  </svg>
);

const ArtChild: React.FC = () => (
  <svg viewBox="0 0 520 520" width="100%" height="100%">
    {/* canto de la puerta */}
    <path d="M150 40 h220 v440 h-220 z" {...line} />
    <path d="M170 60 v400" {...line} opacity={0.35} />
    <rect x={232} y={150} width={60} height={110} rx={14} {...line} strokeWidth={7} />
    <circle cx={262} cy={226} r={10} fill={W} />
    {/* palanca del seguro */}
    <rect x={236} y={320} width={52} height={92} rx={12} {...line} strokeWidth={7} />
    <rect x={248} y={330} width={28} height={36} rx={6} fill={Y} />
    <path d="M300 348 h70" {...hot} strokeWidth={6} />
    {/* pictograma niño */}
    <circle cx={430} cy={318} r={18} fill={Y} />
    <path d="M430 340 v40 M410 356 h40 M430 380 l-14 30 M430 380 l14 30" {...hot} strokeWidth={8} />
  </svg>
);

const ArtHook: React.FC = () => (
  <svg viewBox="0 0 520 520" width="100%" height="100%">
    {/* parachoques con tapita */}
    <path d="M30 120 Q260 60 490 120 V260 Q260 320 30 260 Z" {...line} />
    <rect x={100} y={170} width={120} height={50} rx={20} {...line} opacity={0.4} />
    <circle cx={380} cy={198} r={30} {...hot} strokeWidth={7} strokeDasharray="8 8" />
    {/* gancho atornillable */}
    <circle cx={190} cy={400} r={46} {...hot} />
    <path d="M236 400 h170" stroke={Y} strokeWidth={22} strokeLinecap="round" />
    {[260, 284, 308, 332, 356, 380].map((x) => (
      <line key={x} x1={x} y1={386} x2={x + 10} y2={414} stroke={C.ink} strokeWidth={4} />
    ))}
    <path d="M410 360 Q450 300 400 250" {...line} strokeWidth={6} strokeDasharray="10 10" />
  </svg>
);

const ArtRecirc: React.FC = () => (
  <svg viewBox="0 0 520 520" width="100%" height="100%">
    {/* símbolo real del tablero: auto con flecha circular */}
    <rect x={40} y={60} width={440} height={400} rx={60} {...line} opacity={0.25} />
    <path d="M90 360 h340 v-50 q0 -24 -24 -30 l-60 -14 l-50 -60 q-12 -14 -30 -14 h-120 q-18 0 -28 14 l-40 60 q-10 14 -10 30 z" {...line} />
    <circle cx={160} cy={364} r={30} {...line} fill={C.ink} />
    <circle cx={360} cy={364} r={30} {...line} fill={C.ink} />
    <path d="M190 250 A 70 70 0 1 1 330 250" {...hot} strokeWidth={10} />
    <path d="M330 250 l-26 -10 M330 250 l14 -24" {...hot} strokeWidth={10} />
  </svg>
);

export const ITEMS: Item[] = [
  {
    title: "LA FLECHITA DEL SURTIDOR",
    body: "Ese triángulo junto al ícono de bencina apunta al lado donde está la tapa del estanque. Se acabaron las vueltas en la bencinera.",
    where: "Tablero, junto al indicador de combustible",
    art: ArtFuel,
  },
  {
    title: "LA PRESIÓN CORRECTA NO ESTÁ EN EL NEUMÁTICO",
    body: "El número del neumático es el máximo que aguanta. La presión recomendada para tu auto viene en una etiqueta del fabricante.",
    where: "Marco de la puerta del conductor (en algunos, tapa del estanque o guantera)",
    art: ArtDoor,
  },
  {
    title: "EL MODO NOCHE DEL ESPEJO",
    body: "Si tu retrovisor tiene una palanquita abajo, tírala de noche: atenúa los focos del auto de atrás y sigues viendo.",
    where: "Borde inferior del espejo retrovisor",
    art: ArtMirror,
  },
  {
    title: "UNA LLAVE ESCONDIDA EN TU LLAVE",
    body: "Casi todos los controles de encendido sin llave traen una llave metálica adentro. Si se agota la pila, con ella abres la puerta.",
    where: "Botón o pestaña en el mismo control",
    art: ArtKey,
  },
  {
    title: "EL SEGURO DE NIÑOS",
    body: "Una palanquita en el canto de las puertas traseras impide abrirlas desde adentro. Si viajas con niños, úsala siempre.",
    where: "Canto de las puertas traseras (con la puerta abierta)",
    art: ArtChild,
  },
  {
    title: "EL GANCHO DE REMOLQUE «PERDIDO»",
    body: "Muchos autos traen un gancho que se atornilla en el parachoques. Está con la rueda de repuesto y casi nadie sabe que existe.",
    where: "Junto a la rueda de repuesto · tapita en el parachoques",
    art: ArtHook,
  },
  {
    title: "EL BOTÓN DEL AUTITO CON FLECHA",
    body: "Recircula el aire de adentro: úsalo en túneles, tacos o detrás de un camión humeante. Solo un rato: si lo dejas, se empañan los vidrios.",
    where: "Panel del aire acondicionado",
    art: ArtRecirc,
  },
];

const TOTAL = ITEMS.length + 2;

const Frame: React.FC<{ page: number; children: React.ReactNode }> = ({ page, children }) => (
  <AbsoluteFill style={{ background: C.ink, overflow: "hidden" }}>
    <AbsoluteFill style={{ background: "radial-gradient(800px 700px at 75% 25%, rgba(255,200,61,0.10), transparent 70%)" }} />
    {children}
    <div style={{ position: "absolute", top: 54, left: 70, right: 70, display: "flex", justifyContent: "space-between", fontFamily: UI, fontWeight: 700, fontSize: 28, letterSpacing: 5, color: C.faint }}>
      <span>LO QUE NADIE TE EXPLICÓ</span>
      <span>
        {page}/{TOTAL}
      </span>
    </div>
    <div style={{ position: "absolute", bottom: 50, left: 70, fontFamily: DISPLAY, fontWeight: 700, fontSize: 34, letterSpacing: 14, color: "rgba(244,246,248,0.5)" }}>MOKTA</div>
    {page < TOTAL ? <div style={{ position: "absolute", bottom: 46, right: 70, fontFamily: UI, fontWeight: 600, fontSize: 30, color: C.faint }}>desliza →</div> : null}
  </AbsoluteFill>
);

export const SecretosCover: React.FC = () => (
  <Frame page={1}>
    <div style={{ position: "absolute", top: 110, left: 60, fontFamily: DISPLAY, fontWeight: 800, fontSize: 470, lineHeight: 0.8, color: Y }}>7</div>
    <div style={{ position: "absolute", top: 500, left: 70, right: 70, fontFamily: DISPLAY, fontWeight: 800, fontSize: 154, lineHeight: 0.9, color: W }}>
      COSAS QUE TU AUTO TIENE Y <span style={{ color: Y }}>NADIE TE EXPLICÓ</span>
    </div>
    <div style={{ position: "absolute", top: 1090, left: 70, right: 70, fontFamily: UI, fontWeight: 600, fontSize: 48, lineHeight: 1.25, color: C.dim }}>
      La número 4 te va a salvar algún día.
    </div>
    <div style={{ position: "absolute", top: 110, right: 50, width: 520, height: 380, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, opacity: 0.9 }}>
      {[ArtFuel, ArtMirror, ArtKey, ArtRecirc].map((A, i) => (
        <div key={i} style={{ width: 255, height: 185, border: "2px solid rgba(244,246,248,0.12)", borderRadius: 24, padding: 10, background: "rgba(244,246,248,0.03)" }}>
          <A />
        </div>
      ))}
    </div>
  </Frame>
);

export const SecretosItem: React.FC<{ i: number }> = ({ i }) => {
  const it = ITEMS[i];
  const Art = it.art;
  return (
    <Frame page={i + 2}>
      <div style={{ position: "absolute", top: 104, left: 62, fontFamily: DISPLAY, fontWeight: 800, fontSize: 250, lineHeight: 1, color: Y }}>
        {String(i + 1).padStart(2, "0")}
      </div>
      <div style={{ position: "absolute", top: 110, right: 60, width: 540, height: 540 }}>
        <Art />
      </div>
      <div style={{ position: "absolute", top: 676, left: 66, right: 66, display: "flex", flexDirection: "column", gap: 34 }}>
        <div style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: it.title.length > 26 ? 92 : 104, lineHeight: 0.95, color: W }}>{it.title}</div>
        <div style={{ fontFamily: UI, fontWeight: 500, fontSize: 41, lineHeight: 1.32, color: "rgba(244,246,248,0.86)", paddingRight: 4 }}>{it.body}</div>
      </div>
      <div
        style={{
          position: "absolute",
          top: 1130,
          left: 70,
          right: 70,
          display: "flex",
          alignItems: "center",
          gap: 16,
          padding: "18px 26px",
          borderRadius: 22,
          background: "rgba(255,200,61,0.10)",
          border: "2px solid rgba(255,200,61,0.35)",
          fontFamily: UI,
          fontWeight: 600,
          fontSize: 32,
          color: Y,
        }}
      >
        <svg width="34" height="34" viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
          <path d="M12 22s7-6.2 7-12a7 7 0 1 0-14 0c0 5.8 7 12 7 12z" fill="none" stroke={Y} strokeWidth="2.2" />
          <circle cx="12" cy="10" r="2.6" fill={Y} />
        </svg>
        {it.where}
      </div>
    </Frame>
  );
};

export const SecretosClose: React.FC = () => (
  <Frame page={TOTAL}>
    <div style={{ position: "absolute", top: 200, left: 0, right: 0, textAlign: "center", fontFamily: DISPLAY, fontWeight: 800, fontSize: 170, lineHeight: 0.9, color: W }}>
      ¿CUÁNTAS
      <br />
      <span style={{ color: Y }}>CONOCÍAS?</span>
    </div>
    <div style={{ position: "absolute", top: 600, left: 120, right: 120, display: "flex", flexDirection: "column", gap: 28 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 24, padding: "30px 36px", borderRadius: 28, background: Y, color: C.ink, fontFamily: UI, fontWeight: 800, fontSize: 44 }}>
        <svg width="48" height="48" viewBox="0 0 24 24">
          <path d="M6 3h12v18l-6-4-6 4z" fill="none" stroke={C.ink} strokeWidth="2.4" strokeLinejoin="round" />
        </svg>
        Guárdalo para cuando lo necesites
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 24, padding: "30px 36px", borderRadius: 28, background: "rgba(244,246,248,0.06)", border: "2px solid rgba(244,246,248,0.14)", color: W, fontFamily: UI, fontWeight: 600, fontSize: 40, lineHeight: 1.25 }}>
        <svg width="48" height="48" viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
          <path d="M21.5 2.5L10.5 13.5M21.5 2.5l-7 19-4-8-8-4z" fill="none" stroke={W} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
        </svg>
        Mándaselo a quien siempre se equivoca de lado en la bencinera
      </div>
    </div>
  </Frame>
);
