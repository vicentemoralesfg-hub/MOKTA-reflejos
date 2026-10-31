import React from "react";
import { rand } from "../lib/anim";

/**
 * Hatchback genérico de perfil (mira a la izquierda). viewBox 0 0 1000 420.
 * Escape en (915, 352). Ruedas: delantera (215, 330), trasera (775, 330).
 */
export const CAR_EXHAUST = { x: 930, y: 352 };

const BODY =
  "M 60 330 L 60 300 Q 58 262 98 250 L 300 222 Q 332 217 352 204 L 470 128 Q 492 115 522 114 L 790 112 Q 852 114 882 142 L 936 214 Q 951 240 949 272 L 946 324 Q 944 345 920 345 L 852 345 A 77 77 0 0 0 698 345 L 292 345 A 77 77 0 0 0 138 345 L 82 345 Q 60 345 60 330 Z";

const GLASS = "M 376 212 L 480 141 Q 496 131 522 130 L 784 129 Q 832 131 858 154 L 902 212 Z";

const Wheel: React.FC<{ cx: number; cy: number; angle: number }> = ({ cx, cy, angle }) => {
  const spokes = [];
  for (let i = 0; i < 5; i++) {
    const a = angle + (i * 360) / 5;
    spokes.push(<path key={i} d="M -6 -9 L -10 -37 Q 0 -41 10 -37 L 6 -9 Z" fill="#C9D3DE" transform={`rotate(${a})`} />);
  }
  return (
    <g transform={`translate(${cx} ${cy})`}>
      <circle r={63} fill="#0B0E13" />
      <circle r={63} fill="none" stroke="#1C232D" strokeWidth={6} />
      <circle r={44} fill="#2A323D" />
      <circle r={41} fill="#151A21" />
      {spokes}
      <circle r={10} fill="#8C98A6" />
      <circle r={4} fill="#3A4350" />
      {/* escarcha en el neumático (arco superior) */}
      <path d="M -54 -30 A 62 62 0 0 1 54 -30" fill="none" stroke="rgba(220,240,255,0.25)" strokeWidth={3} />
    </g>
  );
};

export const Car: React.FC<{
  /** grados de giro de ruedas */
  wheelAngle?: number;
  /** 0..1 escarcha sobre vidrios y techo */
  frost?: number;
  /** luces encendidas 0..1 */
  lights?: number;
  /** color de carrocería */
  paint?: string;
  style?: React.CSSProperties;
  width?: number;
}> = ({ wheelAngle = 0, frost = 1, lights = 1, paint = "#2B3A4E", style, width = 1000 }) => {
  return (
    <svg viewBox="0 0 1000 420" width={width} height={(width * 420) / 1000} style={{ overflow: "visible", ...style }}>
      <defs>
        <linearGradient id="carPaint" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#5B7290" />
          <stop offset="0.35" stopColor={paint} />
          <stop offset="0.7" stopColor="#141C27" />
          <stop offset="1" stopColor="#0A0E14" />
        </linearGradient>
        <linearGradient id="carGlass" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#0E1A2A" />
          <stop offset="0.5" stopColor="#1B2F48" />
          <stop offset="1" stopColor="#0A1220" />
        </linearGradient>
        <linearGradient id="frostGlass" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#E6F6FF" stopOpacity="0.92" />
          <stop offset="1" stopColor="#B9DDF2" stopOpacity="0.7" />
        </linearGradient>
        <radialGradient id="headBeam" cx="0" cy="0.5" r="1">
          <stop offset="0" stopColor="#FFF4D6" stopOpacity="0.55" />
          <stop offset="1" stopColor="#FFF4D6" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="tailGlow" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#FF3B3B" stopOpacity="0.8" />
          <stop offset="1" stopColor="#FF3B3B" stopOpacity="0" />
        </radialGradient>
        <filter id="soft" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="6" />
        </filter>
        <clipPath id="glassClip">
          <path d={GLASS} />
        </clipPath>
      </defs>

      {/* sombra en el piso */}
      <ellipse cx={500} cy={392} rx={470} ry={20} fill="rgba(0,0,0,0.55)" filter="url(#soft)" />

      {/* haz de luz delantero */}
      <path d="M 70 262 L -420 170 L -420 400 Z" fill="url(#headBeam)" opacity={0.65 * lights} />

      {/* carrocería */}
      <path d={BODY} fill="url(#carPaint)" />
      {/* reflejo lateral */}
      <path d="M 100 262 L 300 236 L 930 236 L 940 252 L 100 274 Z" fill="rgba(255,255,255,0.07)" />
      <path d="M 92 300 L 940 292" stroke="rgba(255,255,255,0.10)" strokeWidth={2} />

      {/* vidrios */}
      <path d={GLASS} fill="url(#carGlass)" />
      <g clipPath="url(#glassClip)">
        <path d="M 520 120 L 600 120 L 470 230 L 390 230 Z" fill="rgba(255,255,255,0.06)" />
        <rect x={360} y={110} width={560} height={110} fill="url(#frostGlass)" opacity={frost} />
        {/* cristales de hielo sobre el vidrio */}
        {Array.from({ length: 34 }).map((_, i) => {
          const x = 380 + rand(i * 2.3) * 520;
          const y = 132 + rand(i * 4.1) * 80;
          const a = rand(i * 9.7) * 180;
          const l = 8 + rand(i * 1.9) * 22;
          return (
            <line
              key={i}
              x1={x}
              y1={y}
              x2={x + Math.cos((a * Math.PI) / 180) * l}
              y2={y + Math.sin((a * Math.PI) / 180) * l}
              stroke="#FFFFFF"
              strokeOpacity={0.55 * frost}
              strokeWidth={1.4}
            />
          );
        })}
      </g>
      {/* pilar B */}
      <rect x={636} y={128} width={16} height={86} fill="#0A0F16" />
      {/* marco */}
      <path d={GLASS} fill="none" stroke="#0A0F16" strokeWidth={7} />

      {/* escarcha sobre techo, capó y parabrisas */}
      <path
        d="M 98 250 L 300 222 Q 332 217 352 204 L 470 128 Q 492 115 522 114 L 790 112 Q 852 114 882 142 L 936 214"
        fill="none"
        stroke="#E3F5FF"
        strokeOpacity={0.85 * frost}
        strokeWidth={7}
        strokeLinecap="round"
      />
      <path
        d="M 98 250 L 300 222 Q 332 217 352 204 L 470 128 Q 492 115 522 114 L 790 112 Q 852 114 882 142 L 936 214"
        fill="none"
        stroke="#BFE6FF"
        strokeOpacity={0.35 * frost}
        strokeWidth={22}
        strokeLinecap="round"
        filter="url(#soft)"
      />

      {/* líneas de puertas y manillas */}
      <path d="M 372 214 L 366 338" stroke="#0B1018" strokeWidth={3} />
      <path d="M 644 214 L 646 338" stroke="#0B1018" strokeWidth={3} />
      <rect x={570} y={236} width={44} height={9} rx={4} fill="#0D131B" />
      <rect x={824} y={236} width={40} height={9} rx={4} fill="#0D131B" />
      {/* espejo */}
      <path d="M 384 206 L 352 202 Q 340 204 342 216 L 350 226 L 386 222 Z" fill="#1A2533" />

      {/* faro delantero */}
      <path d="M 70 268 Q 74 252 104 247 L 168 238 Q 160 262 132 270 Z" fill={lights > 0 ? "#FFF6DE" : "#7A8796"} />
      <ellipse cx={110} cy={258} rx={60} ry={22} fill="#FFF3CF" opacity={0.55 * lights} filter="url(#soft)" />
      {/* parachoques y rejilla */}
      <path d="M 62 300 L 150 296" stroke="#0B1018" strokeWidth={4} />
      <rect x={66} y={308} width={70} height={14} rx={6} fill="#0B1018" />

      {/* luz trasera */}
      <path d="M 912 220 L 940 222 Q 948 240 946 262 L 918 258 Z" fill="#FF3B3B" opacity={0.6 + 0.4 * lights} />
      <circle cx={930} cy={240} r={40} fill="url(#tailGlow)" opacity={lights} />

      {/* escape */}
      <rect x={884} y={344} width={44} height={14} rx={6} fill="#30363F" />
      <ellipse cx={926} cy={351} rx={4} ry={6} fill="#090B0E" />

      <Wheel cx={215} cy={330} angle={wheelAngle} />
      <Wheel cx={775} cy={330} angle={wheelAngle} />
    </svg>
  );
};

/** Vapor del escape: bocanadas que crecen, suben y se disipan. `t` en fotogramas. */
export const Exhaust: React.FC<{ t: number; x: number; y: number; scale?: number; intensity?: number; drift?: number }> = ({
  t,
  x,
  y,
  scale = 1,
  intensity = 1,
  drift = 1,
}) => {
  const puffs = [];
  const LIFE = 70;
  const EVERY = 5;
  for (let k = Math.floor((t - LIFE) / EVERY); k <= Math.floor(t / EVERY); k++) {
    const born = k * EVERY;
    const age = t - born;
    if (age < 0 || age > LIFE) continue;
    const a = age / LIFE;
    const r = (18 + a * 140 + rand(k * 3.3) * 24) * scale;
    const px = x + (a * 190 + rand(k) * 30) * scale * drift;
    const py = y - (a * a * 150 + rand(k * 7.1) * 20) * scale;
    const op = (1 - a) * Math.min(1, age / 4) * 0.6 * intensity;
    puffs.push(
      <div
        key={k}
        style={{
          position: "absolute",
          left: px - r,
          top: py - r,
          width: r * 2,
          height: r * 2,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(225,235,245,0.9) 0%, rgba(225,235,245,0.35) 45%, rgba(225,235,245,0) 70%)",
          opacity: op,
          filter: `blur(${6 + a * 18}px)`,
        }}
      />,
    );
  }
  return <>{puffs}</>;
};
