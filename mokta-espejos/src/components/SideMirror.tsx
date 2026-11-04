import React from "react";
import { COLORS } from "../config";
import { pulse } from "../lib/anim";

/**
 * Espejo lateral visto desde el asiento del conductor.
 * Todo lo reflejado vive en una "capa mundo" que se desplaza con `pan`:
 *   pan = 0    → espejo mal ajustado (se ve un tercio de tu propio auto)
 *   pan ≈ 185  → justo el costado del auto (ajuste con la cabeza en la ventana)
 *   pan = 430  → ajuste correcto en posición normal: tu auto desaparece y aparece la pista de al lado
 * Girar un espejo plano gira la imagen reflejada: en pantalla equivale a desplazar todo el reflejo.
 */

export const PAN_WRONG = 0;
export const PAN_SLIVER = 185;
export const PAN_RIGHT = 450;

export const MIRROR_W = 820;
export const MIRROR_H = 540;

const HOUSING =
  "M 120,30 L 700,58 Q 792,62 794,150 L 792,420 Q 790,502 700,507 L 130,522 Q 28,524 26,420 L 26,132 Q 28,30 120,30 Z";
const GLASS =
  "M 128,56 L 694,82 Q 766,86 768,152 L 767,412 Q 765,480 694,484 L 136,497 Q 54,498 53,416 L 53,138 Q 55,56 128,56 Z";

const HORIZON = 232;
const VPX = 430;
const BOTTOM = 560;
/** x del borde inferior (s = 1) de cada línea de pista. */
const LEFT_EDGE_X = -900;
const DIVIDER_X = 150;
const OUR_LANE_CENTER_X = 675;

const proj = (xb: number, s: number) => ({
  x: VPX + s * (xb - VPX),
  y: HORIZON + s * (BOTTOM - HORIZON),
});

/** Polígono del costado del propio auto (coordenadas del vidrio, sin desplazar). */
const bodyAt = (x: number, line: "top" | "belt" | "bottom") => {
  const k = (x - VPX) / (900 - VPX);
  if (line === "top") return HORIZON - k * 64;
  if (line === "belt") return HORIZON + k * 34;
  return HORIZON + k * 368;
};
const BODY_FAR = 560;
const BODY_NEAR = 920;
export const BODY_POLY = [
  [BODY_FAR, bodyAt(BODY_FAR, "belt") - 8],
  [628, bodyAt(628, "belt") - 6],
  [668, bodyAt(668, "top")],
  [BODY_NEAR, bodyAt(BODY_NEAR, "top")],
  [BODY_NEAR, bodyAt(BODY_NEAR, "bottom")],
  [BODY_FAR, bodyAt(BODY_FAR, "bottom")],
]
  .map((p) => p.join(","))
  .join(" ");

const Dashes: React.FC<{ xb: number; t: number; color: string; width: number }> = ({ xb, t, color, width }) => {
  const speed = 24; // m/s
  const period = 12;
  const offset = (t * speed) % period;
  const quads: string[] = [];
  for (let k = -1; k < 30; k++) {
    const d0 = 3.2 + k * period + offset;
    const d1 = d0 + 3;
    if (d1 <= 3.2) continue;
    const s0 = Math.min(1.25, 4 / Math.max(d0, 3.2));
    const s1 = 4 / d1;
    const w0 = width * s0;
    const w1 = width * s1;
    const a = proj(xb, s0);
    const b = proj(xb, s1);
    quads.push(`${a.x - w0},${a.y} ${a.x + w0},${a.y} ${b.x + w1},${b.y} ${b.x - w1},${b.y}`);
  }
  return (
    <g fill={color}>
      {quads.map((q, i) => (
        <polygon key={i} points={q} />
      ))}
    </g>
  );
};

/** Auto visto de frente (viene detrás de nosotros). x,y = centro del contacto con el suelo; w = ancho. */
export const CarFront: React.FC<{ x: number; y: number; w: number; color: string }> = ({ x, y, w, color }) => {
  const h = w * 0.78;
  const top = y - h;
  return (
    <g>
      <ellipse cx={x} cy={y + w * 0.02} rx={w * 0.56} ry={w * 0.07} fill="rgba(0,0,0,0.45)" />
      {/* ruedas */}
      <rect x={x - w * 0.47} y={y - w * 0.16} width={w * 0.16} height={w * 0.17} rx={w * 0.03} fill="#0d0f12" />
      <rect x={x + w * 0.31} y={y - w * 0.16} width={w * 0.16} height={w * 0.17} rx={w * 0.03} fill="#0d0f12" />
      {/* carrocería baja */}
      <path
        d={`M ${x - w * 0.5},${y - w * 0.12} L ${x - w * 0.5},${top + h * 0.5} Q ${x - w * 0.49},${top + h * 0.4} ${x - w * 0.42},${top + h * 0.38} L ${x + w * 0.42},${top + h * 0.38} Q ${x + w * 0.49},${top + h * 0.4} ${x + w * 0.5},${top + h * 0.5} L ${x + w * 0.5},${y - w * 0.12} Q ${x + w * 0.5},${y - w * 0.06} ${x + w * 0.44},${y - w * 0.06} L ${x - w * 0.44},${y - w * 0.06} Q ${x - w * 0.5},${y - w * 0.06} ${x - w * 0.5},${y - w * 0.12} Z`}
        fill={color}
      />
      {/* cabina */}
      <path
        d={`M ${x - w * 0.42},${top + h * 0.4} L ${x - w * 0.32},${top + h * 0.04} Q ${x - w * 0.3},${top} ${x - w * 0.24},${top} L ${x + w * 0.24},${top} Q ${x + w * 0.3},${top} ${x + w * 0.32},${top + h * 0.04} L ${x + w * 0.42},${top + h * 0.4} Z`}
        fill={color}
      />
      {/* parabrisas */}
      <path
        d={`M ${x - w * 0.36},${top + h * 0.37} L ${x - w * 0.28},${top + h * 0.08} L ${x + w * 0.28},${top + h * 0.08} L ${x + w * 0.36},${top + h * 0.37} Z`}
        fill="#1d2a38"
      />
      <path
        d={`M ${x - w * 0.2},${top + h * 0.1} L ${x - w * 0.05},${top + h * 0.1} L ${x - w * 0.22},${top + h * 0.35} L ${x - w * 0.33},${top + h * 0.35} Z`}
        fill="rgba(255,255,255,0.14)"
      />
      {/* parrilla y focos */}
      <rect x={x - w * 0.2} y={top + h * 0.64} width={w * 0.4} height={w * 0.1} rx={w * 0.03} fill="#111418" />
      <path
        d={`M ${x - w * 0.47},${top + h * 0.52} L ${x - w * 0.26},${top + h * 0.56} L ${x - w * 0.27},${top + h * 0.64} L ${x - w * 0.47},${top + h * 0.62} Z`}
        fill="#FFF6D8"
      />
      <path
        d={`M ${x + w * 0.47},${top + h * 0.52} L ${x + w * 0.26},${top + h * 0.56} L ${x + w * 0.27},${top + h * 0.64} L ${x + w * 0.47},${top + h * 0.62} Z`}
        fill="#FFF6D8"
      />
      {/* espejos */}
      <rect x={x - w * 0.6} y={top + h * 0.3} width={w * 0.11} height={w * 0.07} rx={w * 0.02} fill={color} />
      <rect x={x + w * 0.49} y={top + h * 0.3} width={w * 0.11} height={w * 0.07} rx={w * 0.02} fill={color} />
      <rect x={x - w * 0.5} y={y - w * 0.12} width={w} height={w * 0.04} fill="rgba(0,0,0,0.25)" />
    </g>
  );
};

export type SideMirrorProps = {
  t: number;
  pan: number;
  /** Brillo rojo alrededor del propio auto (0..1). */
  bodyAlert?: number;
  /** Trama roja "espacio perdido" sobre el propio auto (0..1). */
  waste?: number;
  /** Contorno verde para el borde mínimo del auto (0..1). */
  sliver?: number;
  /** Auto en la pista de al lado (punto ciego). */
  blindCar?: boolean;
  /** Contorno verde alrededor del auto de la pista de al lado (0..1). */
  blindCarMark?: number;
  /** Inclinación física de la carcasa en grados. */
  tilt?: number;
  side?: "left" | "right";
  width?: number;
};

export const SideMirror: React.FC<SideMirrorProps> = ({
  t,
  pan,
  bodyAlert = 0,
  waste = 0,
  sliver = 0,
  blindCar = true,
  blindCarMark = 0,
  tilt = 0,
  side = "left",
  width = MIRROR_W,
}) => {
  const id = side;
  const BS = 4 / 5;
  const blindX = proj((LEFT_EDGE_X + DIVIDER_X) / 2, BS).x;
  const blindY = proj(0, BS).y;
  const blindW = BS * (DIVIDER_X - LEFT_EDGE_X) * (1.8 / 3.5);
  const follow = proj(OUR_LANE_CENTER_X, 4 / 46);
  const followW = (4 / 46) * 1050 * (1.8 / 3.5);
  const p = pulse(t, 0.9);

  return (
    <div
      style={{
        width,
        height: (width * MIRROR_H) / MIRROR_W,
        perspective: 1800,
      }}
    >
      <svg
        viewBox={`0 0 ${MIRROR_W} ${MIRROR_H}`}
        width={width}
        height={(width * MIRROR_H) / MIRROR_W}
        style={{
          overflow: "visible",
          transform: `${side === "right" ? "scaleX(-1) " : ""}rotateY(${tilt}deg)`,
        }}
      >
        <defs>
          <clipPath id={`glass-${id}`}>
            <path d={GLASS} />
          </clipPath>
          <linearGradient id={`sky-${id}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#6FA8D6" />
            <stop offset="1" stopColor="#D9ECF7" />
          </linearGradient>
          <linearGradient id={`road-${id}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#59606B" />
            <stop offset="1" stopColor="#2E333B" />
          </linearGradient>
          <linearGradient id={`housing-${id}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#2A3039" />
            <stop offset="0.5" stopColor="#14181E" />
            <stop offset="1" stopColor="#08090C" />
          </linearGradient>
          <linearGradient id={`body-${id}`} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#8E98A6" />
            <stop offset="0.55" stopColor="#C9D2DD" />
            <stop offset="1" stopColor="#EEF2F7" />
          </linearGradient>
          <linearGradient id={`win-${id}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#2B3B4D" />
            <stop offset="1" stopColor="#5D7C99" />
          </linearGradient>
          <pattern id={`hatch-${id}`} width="22" height="22" patternUnits="userSpaceOnUse" patternTransform="rotate(35)">
            <rect width="22" height="22" fill="rgba(255,59,59,0.28)" />
            <rect width="9" height="22" fill="rgba(255,59,59,0.55)" />
          </pattern>
          <linearGradient id={`sheen-${id}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="rgba(255,255,255,0)" />
            <stop offset="0.42" stopColor="rgba(255,255,255,0)" />
            <stop offset="0.5" stopColor="rgba(255,255,255,0.16)" />
            <stop offset="0.6" stopColor="rgba(255,255,255,0)" />
          </linearGradient>
          <radialGradient id={`vig-${id}`} cx="0.5" cy="0.5" r="0.7">
            <stop offset="0.6" stopColor="rgba(0,0,0,0)" />
            <stop offset="1" stopColor="rgba(0,0,0,0.45)" />
          </radialGradient>
          <filter id={`glow-${id}`} x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="6" />
          </filter>
        </defs>

        {/* sombra y carcasa */}
        <path d={HOUSING} transform="translate(10 18)" fill="rgba(0,0,0,0.55)" filter={`url(#glow-${id})`} />
        <path d={HOUSING} fill={`url(#housing-${id})`} stroke="#3B434F" strokeWidth={3} />

        <g clipPath={`url(#glass-${id})`}>
          <g transform={`translate(${pan} 0)`}>
            <rect x={-1400} y={-40} width={3200} height={HORIZON + 41} fill={`url(#sky-${id})`} />
            <ellipse cx={120} cy={120} rx={130} ry={22} fill="rgba(255,255,255,0.55)" />
            <ellipse cx={-260} cy={90} rx={160} ry={20} fill="rgba(255,255,255,0.45)" />
            <ellipse cx={560} cy={140} rx={110} ry={16} fill="rgba(255,255,255,0.5)" />
            {/* cerros */}
            <path
              d={`M -1400,${HORIZON} L -1400,205 Q -1100,170 -900,198 Q -700,160 -420,196 Q -200,176 0,200 Q 220,168 460,204 Q 700,180 900,198 Q 1200,170 1800,200 L 1800,${HORIZON} Z`}
              fill="#7C97AE"
            />
            <path
              d={`M -1400,${HORIZON} L -1400,216 Q -1000,204 -700,218 Q -400,206 -100,220 Q 200,208 500,222 Q 900,210 1800,220 L 1800,${HORIZON} Z`}
              fill="#5E7A62"
            />
            {/* berma / tierra */}
            <rect x={-1400} y={HORIZON} width={3200} height={420} fill="#6B7553" />
            {/* calzada */}
            <polygon
              points={`${VPX - 4},${HORIZON} ${VPX + 6},${HORIZON} ${proj(1900, 1.4).x},${proj(1900, 1.4).y} ${proj(LEFT_EDGE_X, 1.4).x},${proj(LEFT_EDGE_X, 1.4).y}`}
              fill={`url(#road-${id})`}
            />
            {/* línea de borde izquierda (continua) */}
            <polygon
              points={`${VPX},${HORIZON} ${VPX + 1},${HORIZON} ${proj(LEFT_EDGE_X + 22, 1.4).x},${proj(LEFT_EDGE_X + 22, 1.4).y} ${proj(LEFT_EDGE_X - 22, 1.4).x},${proj(LEFT_EDGE_X - 22, 1.4).y}`}
              fill="#E9EEF3"
            />
            {/* línea divisoria (segmentada, en movimiento) */}
            <Dashes xb={DIVIDER_X} t={t} color="#F2F5F8" width={20} />
            <Dashes xb={1200} t={t} color="#F2F5F8" width={20} />
            {/* auto que viene lejos en nuestra pista */}
            <CarFront x={follow.x} y={follow.y} w={followW} color="#3E7BD6" />
            {/* auto en la pista de al lado (en el punto ciego) */}
            {blindCar ? <CarFront x={blindX} y={blindY} w={blindW} color={COLORS.threat} /> : null}
            {blindCarMark > 0 ? (
              <rect
                x={blindX - blindW * 0.66}
                y={blindY - blindW * 0.9}
                width={blindW * 1.32}
                height={blindW * 0.98}
                rx={26}
                fill="none"
                stroke={COLORS.green}
                strokeWidth={9}
                opacity={blindCarMark}
                strokeDasharray="34 16"
              />
            ) : null}

            {/* costado del propio auto */}
            <g>
              <polygon points={BODY_POLY} fill={`url(#body-${id})`} />
              {/* vidrios laterales con pilar C inclinado */}
              <polygon
                points={`${BODY_NEAR},${bodyAt(BODY_NEAR, "top") + 4} ${668},${bodyAt(668, "top") + 4} ${628},${bodyAt(628, "belt")} ${BODY_NEAR},${bodyAt(BODY_NEAR, "belt")}`}
                fill={`url(#win-${id})`}
              />
              {/* techo sobre el maletero: el auto baja después del pilar C */}
              <polygon
                points={`${BODY_FAR - 2},${bodyAt(BODY_FAR, "top") - 6} ${668},${bodyAt(668, "top") - 6} ${628},${bodyAt(628, "belt") - 1} ${BODY_FAR - 2},${bodyAt(BODY_FAR, "belt") + 2}`}
                fill="#6FA8D6"
                opacity={0}
              />
              {/* pilar B */}
              <polygon
                points={`${742},${bodyAt(742, "top") + 4} ${758},${bodyAt(758, "top") + 4} ${758},${bodyAt(758, "belt")} ${742},${bodyAt(742, "belt")}`}
                fill="#1A1F26"
              />
              <polyline
                points={`${BODY_NEAR},${bodyAt(BODY_NEAR, "top") + 4} ${668},${bodyAt(668, "top") + 4} ${628},${bodyAt(628, "belt")}`}
                stroke="#DDE3EA"
                strokeWidth={4}
                fill="none"
              />
              {/* línea de cintura */}
              <polyline
                points={`${BODY_FAR},${bodyAt(BODY_FAR, "belt") + 3} ${BODY_NEAR},${bodyAt(BODY_NEAR, "belt") + 6}`}
                stroke="#F9FBFD"
                strokeWidth={3}
                fill="none"
              />
              {/* separación de puertas */}
              <line x1={752} y1={bodyAt(752, "belt") + 6} x2={752} y2={bodyAt(752, "bottom") - 4} stroke="rgba(30,36,44,0.55)" strokeWidth={3} />
              {/* manilla */}
              <rect x={712} y={bodyAt(712, "belt") + 22} width={30} height={8} rx={4} fill="rgba(40,46,56,0.55)" />
              {/* rueda trasera */}
              <path
                d={`M 574,${bodyAt(574, "bottom") + 2} Q 606,${bodyAt(606, "bottom") - 52} 648,${bodyAt(648, "bottom") + 2} Z`}
                fill="#0E1116"
              />
              <ellipse cx={612} cy={bodyAt(612, "bottom") - 6} rx={20} ry={26} fill="#22272F" />
              <ellipse cx={612} cy={bodyAt(612, "bottom") - 6} rx={9} ry={13} fill="#7A838F" />
              {/* parachoques trasero */}
              <polygon
                points={`${BODY_FAR},${bodyAt(BODY_FAR, "belt") + 30} ${BODY_FAR + 10},${bodyAt(BODY_FAR + 10, "belt") + 32} ${BODY_FAR + 10},${bodyAt(BODY_FAR + 10, "bottom") - 2} ${BODY_FAR},${bodyAt(BODY_FAR, "bottom")}`}
                fill="#7D8794"
              />
              {/* foco trasero */}
              <polygon
                points={`${BODY_FAR},${bodyAt(BODY_FAR, "belt") + 4} ${BODY_FAR + 16},${bodyAt(BODY_FAR + 16, "belt") + 6} ${BODY_FAR + 16},${bodyAt(BODY_FAR + 16, "belt") + 30} ${BODY_FAR},${bodyAt(BODY_FAR, "belt") + 26}`}
                fill="#E2343A"
              />
              <polygon
                points={`${BODY_NEAR},${bodyAt(BODY_NEAR, "bottom") - 40} ${BODY_FAR},${bodyAt(BODY_FAR, "bottom") - 10} ${BODY_FAR},${bodyAt(BODY_FAR, "bottom")} ${BODY_NEAR},${bodyAt(BODY_NEAR, "bottom")}`}
                fill="rgba(0,0,0,0.18)"
              />
              {waste > 0 ? <polygon points={BODY_POLY} fill={`url(#hatch-${id})`} opacity={waste} /> : null}
              {bodyAlert > 0 ? (
                <>
                  <polygon
                    points={BODY_POLY}
                    fill="none"
                    stroke={COLORS.red}
                    strokeWidth={22}
                    opacity={bodyAlert * (0.35 + 0.35 * p)}
                    filter={`url(#glow-${id})`}
                  />
                  <polygon points={BODY_POLY} fill="none" stroke={COLORS.red} strokeWidth={9} opacity={bodyAlert} strokeLinejoin="round" />
                </>
              ) : null}
              {sliver > 0 ? (
                <polygon points={BODY_POLY} fill="none" stroke={COLORS.green} strokeWidth={12} opacity={sliver} strokeLinejoin="round" />
              ) : null}
            </g>
          </g>
          {/* brillo del vidrio y viñeta */}
          <rect x={0} y={0} width={MIRROR_W} height={MIRROR_H} fill={`url(#sheen-${id})`} />
          <rect x={0} y={0} width={MIRROR_W} height={MIRROR_H} fill={`url(#vig-${id})`} />
        </g>
        <path d={GLASS} fill="none" stroke="rgba(255,255,255,0.22)" strokeWidth={3} />
      </svg>
    </div>
  );
};
