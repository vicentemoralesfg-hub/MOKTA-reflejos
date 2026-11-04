import React from "react";

/**
 * Auto visto desde arriba, centrado en (0,0), frente hacia arriba (−y).
 * Medidas: 130 × 270 px. En modo `interior` se quita el techo y se ve la cabina y el conductor.
 */
export const CAR_W = 130;
export const CAR_L = 270;
/** Pivote de los espejos laterales (coordenadas locales). */
export const MIRROR_L = { x: -68, y: -44 };
export const MIRROR_R = { x: 68, y: -44 };
/** Espejo retrovisor central. */
export const MIRROR_C = { x: 0, y: -40 };
/** Posición normal de la cabeza del conductor (lado izquierdo). */
export const HEAD = { x: -29, y: 6 };

const BODY =
  "M -46,-135 L 46,-135 Q 65,-133 65,-104 L 65,108 Q 65,135 40,135 L -40,135 Q -65,135 -65,108 L -65,-104 Q -65,-133 -46,-135 Z";

export type CarTopProps = {
  color: string;
  interior?: number; // 0 = techo, 1 = cabina visible
  headDx?: number;
  headTurn?: number; // grados (giro de cabeza, para mirar sobre el hombro)
  mirrorL?: number; // grados de apertura del espejo izquierdo (0 = mal, + = hacia afuera)
  mirrorR?: number;
  mirrorGlowL?: number;
  mirrorGlowR?: number;
  brake?: number;
  blinkL?: number;
  id: string;
};

const Mirror: React.FC<{ side: -1 | 1; angle: number; color: string; glow: number }> = ({ side, angle, color, glow }) => {
  const p = side < 0 ? MIRROR_L : MIRROR_R;
  // La carcasa sobresale hacia afuera; el vidrio mira hacia atrás. Abrir = girar hacia afuera.
  return (
    <g transform={`translate(${p.x} ${p.y}) rotate(${-side * angle})`}>
      {glow > 0 ? (
        <rect x={side < 0 ? -26 : 2} y={-9} width={24} height={20} rx={7} fill="none" stroke="#7FD3FF" strokeWidth={5} opacity={glow} />
      ) : null}
      <path
        d={side < 0 ? "M 2,-6 L -22,-8 Q -26,-8 -26,-3 L -26,6 Q -26,10 -22,10 L 2,6 Z" : "M -2,-6 L 22,-8 Q 26,-8 26,-3 L 26,6 Q 26,10 22,10 L -2,6 Z"}
        fill={color}
        stroke="rgba(0,0,0,0.35)"
        strokeWidth={1.5}
      />
      <line x1={side < 0 ? -24 : 24} y1={9} x2={side < 0 ? -2 : 2} y2={6} stroke="#9FD8FF" strokeWidth={3} strokeLinecap="round" />
    </g>
  );
};

export const CarTop: React.FC<CarTopProps> = ({
  color,
  interior = 0,
  headDx = 0,
  headTurn = 0,
  mirrorL = 0,
  mirrorR = 0,
  mirrorGlowL = 0,
  mirrorGlowR = 0,
  brake = 0,
  blinkL = 0,
  id,
}) => {
  return (
    <g>
      <defs>
        <linearGradient id={`car-${id}`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="rgba(0,0,0,0.22)" />
          <stop offset="0.25" stopColor="rgba(255,255,255,0.08)" />
          <stop offset="0.5" stopColor="rgba(255,255,255,0.18)" />
          <stop offset="0.75" stopColor="rgba(255,255,255,0.08)" />
          <stop offset="1" stopColor="rgba(0,0,0,0.22)" />
        </linearGradient>
        <clipPath id={`cabin-${id}`}>
          <path d="M -54,-66 L 54,-66 L 54,100 Q 54,112 42,112 L -42,112 Q -54,112 -54,100 Z" />
        </clipPath>
      </defs>
      {/* sombra */}
      <path d={BODY} transform="translate(8 12)" fill="rgba(0,0,0,0.5)" />
      <Mirror side={-1} angle={mirrorL} color={color} glow={mirrorGlowL} />
      <Mirror side={1} angle={mirrorR} color={color} glow={mirrorGlowR} />
      <path d={BODY} fill={color} />
      <path d={BODY} fill={`url(#car-${id})`} />
      {/* focos */}
      <path d="M -58,-122 Q -52,-132 -36,-133 L -38,-125 Q -50,-123 -58,-116 Z" fill="#FFF6D8" />
      <path d="M 58,-122 Q 52,-132 36,-133 L 38,-125 Q 50,-123 58,-116 Z" fill="#FFF6D8" />
      <path d="M -60,118 Q -56,130 -40,132 L -40,126 Q -52,124 -60,112 Z" fill="#E2343A" />
      <path d="M 60,118 Q 56,130 40,132 L 40,126 Q 52,124 60,112 Z" fill="#E2343A" />
      {brake > 0 ? (
        <g opacity={brake}>
          <ellipse cx={-46} cy={134} rx={22} ry={10} fill="#FF3B3B" opacity={0.6} />
          <ellipse cx={46} cy={134} rx={22} ry={10} fill="#FF3B3B" opacity={0.6} />
        </g>
      ) : null}
      {blinkL > 0 ? (
        <g opacity={blinkL}>
          <circle cx={-56} cy={-122} r={20} fill="#FFB020" opacity={0.55} />
          <circle cx={-56} cy={-122} r={9} fill="#FFD27A" />
          <circle cx={-56} cy={124} r={20} fill="#FFB020" opacity={0.55} />
          <circle cx={-56} cy={124} r={9} fill="#FFD27A" />
        </g>
      ) : null}
      {/* capó */}
      <path d="M -40,-128 Q 0,-134 40,-128" stroke="rgba(0,0,0,0.18)" strokeWidth={2} fill="none" />
      {/* techo y vidrios */}
      <g opacity={1 - interior}>
        <path d="M -52,-62 Q 0,-74 52,-62 L 47,-22 Q 0,-28 -47,-22 Z" fill="#1B2633" />
        <path d="M -30,-64 L -12,-66 L -34,-26 L -44,-24 Z" fill="rgba(255,255,255,0.16)" />
        <path d="M -48,-22 Q 0,-28 48,-22 L 48,62 Q 0,66 -48,62 Z" fill={color} />
        <path d="M -48,-22 Q 0,-28 48,-22 L 48,62 Q 0,66 -48,62 Z" fill="rgba(0,0,0,0.08)" />
        <path d="M -48,62 Q 0,66 48,62 L 44,94 Q 0,100 -44,94 Z" fill="#1B2633" />
        <path d="M -56,-18 L -50,-20 L -50,60 L -56,58 Z" fill="#1B2633" />
        <path d="M 56,-18 L 50,-20 L 50,60 L 56,58 Z" fill="#1B2633" />
      </g>
      {/* cabina */}
      {interior > 0 ? (
        <g opacity={interior} clipPath={`url(#cabin-${id})`}>
          <rect x={-60} y={-70} width={120} height={190} fill="#2A313B" />
          {/* tablero */}
          <path d="M -56,-70 L 56,-70 L 56,-44 Q 0,-36 -56,-44 Z" fill="#141920" />
          {/* volante */}
          <rect x={-52} y={-38} width={46} height={9} rx={4.5} fill="#0B0E12" />
          <rect x={-31} y={-40} width={4} height={14} rx={2} fill="#0B0E12" />
          {/* consola */}
          <rect x={-7} y={-42} width={14} height={78} rx={5} fill="#171C23" />
          {/* asientos */}
          <rect x={-50} y={-14} width={40} height={58} rx={10} fill="#3C4552" />
          <rect x={10} y={-14} width={40} height={58} rx={10} fill="#3C4552" />
          <rect x={-44} y={40} width={28} height={12} rx={5} fill="#4A5462" />
          <rect x={16} y={40} width={28} height={12} rx={5} fill="#4A5462" />
          <rect x={-50} y={68} width={100} height={40} rx={10} fill="#353D49" />
          {/* conductor */}
          <g transform={`translate(${HEAD.x + headDx} ${HEAD.y})`}>
            <ellipse cx={-headDx * 0.35} cy={14} rx={25} ry={13} fill="#2F6FD8" />
            <g transform={`rotate(${headTurn})`}>
              <ellipse cx={0} cy={-9} rx={11} ry={8} fill="#E7B48F" />
              <circle cx={0} cy={1} r={13.5} fill="#2B1D16" />
              <ellipse cx={0} cy={-13.5} rx={3.5} ry={3} fill="#D9A07A" />
            </g>
          </g>
        </g>
      ) : null}
      {/* puertas */}
      <path d="M -65,-20 L -60,-20 M -65,46 L -60,46 M 65,-20 L 60,-20 M 65,46 L 60,46" stroke="rgba(0,0,0,0.35)" strokeWidth={2} />
    </g>
  );
};
