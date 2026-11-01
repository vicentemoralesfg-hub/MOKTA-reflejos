import React from "react";
import { FONT_UI } from "../config";
import { rand } from "../lib/anim";

/**
 * Corte de un carburador (esquema). viewBox 0 0 640 760.
 * Aire entra arriba, se acelera en el venturi, chupa bencina del flotador por el surtidor.
 * Con el motor frío la bencina no se evapora bien: caen gotas gruesas por las paredes.
 */
export const Carburetor: React.FC<{ t: number; choke?: number; ink?: string; accent?: string; fuel?: string; labels?: number }> = ({
  t,
  choke = 1,
  ink = "#E8D3AE",
  accent = "#FFB45C",
  fuel = "#F2C14E",
  labels = 1,
}) => {
  const metal = "#6B5236";
  const metalHi = "#9A7A52";
  // flujo de aire: guiones animados
  const flows = [-70, -25, 25, 70].map((dx, i) => {
    const d = `M ${320 + dx * 1.9} 40 C ${320 + dx * 1.9} 160, ${320 + dx * 0.55} 250, ${320 + dx * 0.55} 340 C ${320 + dx * 0.55} 430, ${320 + dx * 1.2} 520, ${320 + dx * 1.2} 720`;
    return (
      <path
        key={i}
        d={d}
        fill="none"
        stroke={ink}
        strokeOpacity={0.55}
        strokeWidth={4}
        strokeDasharray="18 26"
        strokeDashoffset={-t * 6 - i * 9}
        strokeLinecap="round"
      />
    );
  });
  // gotas de bencina mal atomizada (gruesas) desde el surtidor
  const drops = [];
  for (let i = 0; i < 16; i++) {
    const life = 34;
    const born = i * 4 + Math.floor(t / 64) * 64;
    let age = (t - i * 4) % 64;
    if (age < 0) age += 64;
    if (age > life) continue;
    const a = age / life;
    const dir = rand(i * 3.3 + born * 0.01) - 0.5;
    const x = 320 + dir * 260 * a;
    const y = 345 + a * a * 330 + a * 40;
    const r = 5 + rand(i * 7.7) * 6;
    drops.push(<ellipse key={i} cx={x} cy={y} rx={r * 0.8} ry={r} fill={fuel} opacity={0.9 * (1 - a * 0.6)} />);
  }
  const chokeAng = -10 - (1 - choke) * 70;
  const Label: React.FC<{ x: number; y: number; text: string; anchor?: "start" | "end"; color?: string }> = ({
    x,
    y,
    text,
    anchor = "start",
    color = ink,
  }) => (
    <text
      x={x}
      y={y}
      fill={color}
      fontFamily={FONT_UI}
      fontWeight={700}
      fontSize={32}
      letterSpacing={3}
      textAnchor={anchor}
      opacity={labels}
    >
      {text}
    </text>
  );
  return (
    <svg viewBox="0 0 640 760" width="100%" height="100%" style={{ overflow: "visible" }}>
      <defs>
        <linearGradient id="carbMetal" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor={metal} />
          <stop offset="0.5" stopColor={metalHi} />
          <stop offset="1" stopColor={metal} />
        </linearGradient>
      </defs>
      {/* paredes (venturi) */}
      <path
        d="M 100 30 L 150 30 C 150 160, 252 250, 252 340 C 252 430, 200 500, 200 560 L 200 740 L 120 740 L 120 560 C 120 470, 190 420, 190 340 C 190 240, 100 160, 100 30 Z"
        fill="url(#carbMetal)"
      />
      <path
        d="M 540 30 L 490 30 C 490 160, 388 250, 388 340 C 388 430, 440 500, 440 560 L 440 740 L 520 740 L 520 560 C 520 470, 450 420, 450 340 C 450 240, 540 160, 540 30 Z"
        fill="url(#carbMetal)"
      />
      {flows}
      {/* cebador (chupete) */}
      <g transform={`translate(320 110) rotate(${chokeAng})`}>
        <rect x={-150} y={-6} width={300} height={12} rx={6} fill={accent} />
        <circle r={10} fill={metal} stroke={accent} strokeWidth={4} />
      </g>
      {/* mariposa del acelerador */}
      <g transform="translate(320 600) rotate(-62)">
        <rect x={-112} y={-6} width={224} height={12} rx={6} fill={ink} opacity={0.8} />
        <circle r={10} fill={metal} stroke={ink} strokeWidth={4} />
      </g>
      {/* cuba / flotador */}
      <rect x={470} y={250} width={150} height={240} rx={14} fill="#2A1E12" stroke={metalHi} strokeWidth={6} />
      <rect x={476} y={350} width={138} height={134} rx={10} fill={fuel} opacity={0.75} />
      <rect x={505} y={318} width={80} height={40} rx={12} fill={metalHi} />
      {/* surtidor hacia el venturi */}
      <path d="M 476 460 L 400 460 Q 330 460 325 400 L 322 345" fill="none" stroke={fuel} strokeWidth={10} strokeLinecap="round" />
      <circle cx={322} cy={343} r={9} fill={fuel} />
      {drops}
      {/* etiquetas */}
      <Label x={320} y={0} text="AIRE" anchor="start" />
      <path d="M 300 -24 L 300 14" stroke={ink} strokeWidth={4} opacity={labels} />
      <path d="M 290 4 L 300 18 L 310 4" fill="none" stroke={ink} strokeWidth={4} opacity={labels} />
      <Label x={-10} y={118} text="CEBADOR" anchor="end" color={accent} />
      <Label x={-10} y={150} text="(EL «CHUPETE»)" anchor="end" color={accent} />
      <path d="M 0 128 L 160 112" stroke={accent} strokeWidth={3} opacity={labels} />
      <Label x={630} y={540} text="BENCINA" anchor="end" color={fuel} />
    </svg>
  );
};
