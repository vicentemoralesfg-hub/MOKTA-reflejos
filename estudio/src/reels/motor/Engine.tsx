import React from "react";

/**
 * Corte de un motor de 4 cilindros en línea, 4 tiempos, con cinemática biela-manivela real.
 * θ = ángulo del ciclo (0–720°). Orden de encendido 1-3-4-2.
 * Para un cilindro con desfase φ: a = (θ − φ) mod 720
 *   0–180 EXPLOSIÓN (PMS→PMI) · 180–360 ESCAPE · 360–540 ADMISIÓN · 540–720 COMPRESIÓN
 */
export const PHASE = [0, 540, 180, 360]; // cilindros 1,2,3,4 (encendido 1-3-4-2)
export const STROKES = ["EXPLOSIÓN", "ESCAPE", "ADMISIÓN", "COMPRESIÓN"] as const;
export const strokeOf = (a: number) => STROKES[Math.floor((((a % 720) + 720) % 720) / 180)];

const XS = [200, 380, 560, 740];
const BORE = 140;
const CRANK_Y = 1270;
const R = 60;
const L = 200;
const HEAD_Y = 880; // cara inferior de la culata

const mod = (x: number, m: number) => ((x % m) + m) % m;
const rad = (d: number) => (d * Math.PI) / 180;

/** Altura del pasador del pistón sobre el cigüeñal (px). */
const pinY = (a: number) => {
  const t = rad(a);
  return CRANK_Y - (R * Math.cos(t) + Math.sqrt(L * L - R * R * Math.sin(t) * Math.sin(t)));
};

const Moving: React.FC<{ a: number; cx: number; op: number }> = ({ a, cx, op }) => {
  const t = rad(a);
  const py = pinY(a);
  const px = cx + R * Math.sin(t);
  const pyc = CRANK_Y - R * Math.cos(t);
  return (
    <g opacity={op}>
      {/* biela */}
      <line x1={cx} y1={py} x2={px} y2={pyc} stroke="#8F97A3" strokeWidth={22} strokeLinecap="round" />
      <circle cx={px} cy={pyc} r={17} fill="#5D6470" stroke="#AEB6C2" strokeWidth={3} />
      {/* pistón */}
      <rect x={cx - BORE / 2 + 5} y={py - 46} width={BORE - 10} height={96} rx={8} fill="url(#piston)" />
      {[0, 1, 2].map((k) => (
        <rect key={k} x={cx - BORE / 2 + 5} y={py - 36 + k * 12} width={BORE - 10} height={4} fill="#3B414B" />
      ))}
      <circle cx={cx} cy={py} r={12} fill="#2A2F37" stroke="#AEB6C2" strokeWidth={3} />
    </g>
  );
};

export const Engine: React.FC<{
  theta: number;
  /** grados recorridos durante este fotograma (para el desenfoque de movimiento) */
  dTheta: number;
  highlight?: number; // 0..1 resalta el cilindro 1
}> = ({ theta, dTheta, highlight = 0 }) => {
  const samples = dTheta > 200 ? 16 : dTheta > 25 ? 8 : dTheta > 6 ? 4 : 1;
  return (
    <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: "absolute", inset: 0 }}>
      <defs>
        <linearGradient id="piston" x1="0" x2="1">
          <stop offset="0" stopColor="#7E8794" />
          <stop offset="0.45" stopColor="#D9DEE5" />
          <stop offset="1" stopColor="#6B7380" />
        </linearGradient>
        <linearGradient id="block" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#2A2E36" />
          <stop offset="1" stopColor="#15181E" />
        </linearGradient>
        <linearGradient id="bore" x1="0" x2="1">
          <stop offset="0" stopColor="#0C0E12" />
          <stop offset="0.5" stopColor="#1A1E25" />
          <stop offset="1" stopColor="#0C0E12" />
        </linearGradient>
        <radialGradient id="fire">
          <stop offset="0" stopColor="#FFF6C8" />
          <stop offset="0.3" stopColor="#FFC23A" />
          <stop offset="0.7" stopColor="#FF5A1A" stopOpacity="0.85" />
          <stop offset="1" stopColor="#B81E00" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="flash">
          <stop offset="0" stopColor="#FFB84A" stopOpacity="0.55" />
          <stop offset="1" stopColor="#FF6A00" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* bloque */}
      <rect x={100} y={760} width={740} height={560} rx={30} fill="url(#block)" stroke="#3A404A" strokeWidth={4} />
      {/* culata */}
      <rect x={90} y={730} width={760} height={150} rx={26} fill="#262A32" stroke="#454C57" strokeWidth={4} />
      {/* cárter */}
      <path d="M110 1320 H830 L800 1430 Q470 1470 140 1430 Z" fill="#1A1D23" stroke="#3A404A" strokeWidth={4} />

      {XS.map((cx, i) => {
        const a = mod(theta - PHASE[i], 720);
        const py = pinY(a % 360);
        const top = py - 46;
        // gas en la cámara según el tiempo
        const stroke = Math.floor(a / 180);
        const u = (a % 180) / 180;
        const fire = stroke === 0 ? Math.max(0, 1 - u * 1.6) : 0;
        const gas =
          stroke === 0
            ? `rgba(255,${Math.round(120 + 60 * u)},40,${0.55 * (1 - u) + 0.15})`
            : stroke === 1
              ? `rgba(120,120,128,${0.45 * (1 - u) + 0.1})`
              : stroke === 2
                ? `rgba(90,170,255,${0.18 + 0.2 * u})`
                : `rgba(110,185,255,${0.38 + 0.3 * u})`;
        const exLift = stroke === 1 ? Math.sin(Math.PI * u) : 0;
        const inLift = stroke === 2 ? Math.sin(Math.PI * u) : 0;
        const hl = i === 0 ? highlight : 0;
        const sparkOn = a < 14 || a > 712;
        return (
          <g key={i}>
            {/* camisa */}
            <rect x={cx - BORE / 2} y={HEAD_Y} width={BORE} height={300} fill="url(#bore)" />
            {/* gas */}
            <rect x={cx - BORE / 2} y={HEAD_Y} width={BORE} height={Math.max(0, top - HEAD_Y)} fill={gas} />
            {fire > 0 ? (
              <ellipse cx={cx} cy={HEAD_Y + (top - HEAD_Y) * 0.45} rx={BORE * (0.4 + 0.5 * (1 - fire))} ry={Math.max(10, (top - HEAD_Y) * 0.6)} fill="url(#fire)" opacity={fire} />
            ) : null}
            {/* válvulas (admisión izq., escape der.) */}
            <g>
              <line x1={cx - 34} y1={790} x2={cx - 34} y2={HEAD_Y - 4 + inLift * 22} stroke="#9AA3AF" strokeWidth={7} />
              <rect x={cx - 52} y={HEAD_Y - 10 + inLift * 22} width={36} height={9} rx={3} fill="#C9D0D9" />
              <line x1={cx + 34} y1={790} x2={cx + 34} y2={HEAD_Y - 4 + exLift * 22} stroke="#9AA3AF" strokeWidth={7} />
              <rect x={cx + 16} y={HEAD_Y - 10 + exLift * 22} width={36} height={9} rx={3} fill="#C9D0D9" />
            </g>
            {/* bujía */}
            <rect x={cx - 9} y={700} width={18} height={70} rx={5} fill="#E8ECF1" />
            <rect x={cx - 14} y={680} width={28} height={28} rx={6} fill="#9AA3AF" />
            {sparkOn ? (
              <g>
                <circle cx={cx} cy={HEAD_Y + 4} r={70} fill="url(#flash)" />
                <path d={`M${cx} ${HEAD_Y - 6} l-10 14 l12 0 l-8 16`} stroke="#FFFFFF" strokeWidth={4} fill="none" strokeLinejoin="round" />
              </g>
            ) : null}
            {/* partes móviles, con desenfoque por submuestreo */}
            {Array.from({ length: samples }).map((_, k) => {
              const ak = mod(a - (dTheta * k) / samples, 720) % 360;
              return <Moving key={k} a={ak} cx={cx} op={samples === 1 ? 1 : 1.6 / samples} />;
            })}
            {/* número de cilindro */}
            <text x={cx} y={1412} textAnchor="middle" fontFamily="Barlow Condensed" fontWeight={800} fontSize={44} fill={hl > 0 ? `rgba(255,200,61,${0.4 + 0.6 * hl})` : "rgba(244,246,248,0.35)"}>
              {i + 1}
            </text>
            {hl > 0 ? <rect x={cx - BORE / 2 - 8} y={HEAD_Y - 8} width={BORE + 16} height={316} rx={10} fill="none" stroke="#FFC83D" strokeWidth={5} opacity={hl} /> : null}
          </g>
        );
      })}
      {/* eje del cigüeñal */}
      <rect x={120} y={CRANK_Y - 10} width={700} height={20} rx={10} fill="#4A515C" />
      {XS.map((cx) => (
        <circle key={cx} cx={cx} cy={CRANK_Y} r={14} fill="#6C7480" />
      ))}
    </svg>
  );
};
