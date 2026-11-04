import React from "react";
import { AbsoluteFill } from "remotion";
import { COLORS } from "../config";
import { CarTop, HEAD, MIRROR_C, MIRROR_L, MIRROR_R } from "./CarTop";

/**
 * Vista cenital: carretera de 3 pistas, nuestro auto y los campos de visión de los tres espejos.
 * Ángulos de los conos medidos desde "directo hacia atrás", positivos hacia afuera del auto.
 *  - Mal ajuste (v = 0): lateral cubre [-4°, 12°] → roza tu propio auto y se superpone con el central.
 *  - Ajuste correcto (v = 1): lateral cubre [14°, 30°] → cubre la pista de al lado, sin superposición.
 */

export const LANE_W = 250;
export const LANES = [290, 540, 790];
export const ROAD = { left: 165, right: 915 };
export const OUR = { x: 540, y: 1000 };

export type Camera = { ax: number; ay: number; fx: number; fy: number; s: number };

export const worldToScreen = (cam: Camera, x: number, y: number) => ({
  x: cam.ax + (x - cam.fx) * cam.s,
  y: cam.ay + (y - cam.fy) * cam.s,
});

const SIDE_HALF = 8; // semiancho del cono lateral (°)
const SIDE_WRONG_CENTER = 4; // centro del cono mal ajustado
const SIDE_SHIFT = 18; // giro de la vista entre mal ajuste y ajuste correcto
const REAR_HALF = 17;
const CONE_LEN = 1500;

export const sideConeAngles = (v: number) => {
  const c = SIDE_WRONG_CENTER + SIDE_SHIFT * v;
  return [c - SIDE_HALF, c + SIDE_HALF] as const;
};

const rad = (d: number) => (d * Math.PI) / 180;

/** Polígono de un cono desde (x,y) hacia atrás (+y); `out` = -1 izquierda, +1 derecha. */
const conePoints = (x: number, y: number, a0: number, a1: number, out: -1 | 1, len = CONE_LEN) => {
  const pts: string[] = [`${x},${y}`];
  const steps = 8;
  for (let i = 0; i <= steps; i++) {
    const a = rad(a0 + ((a1 - a0) * i) / steps);
    pts.push(`${x + out * Math.sin(a) * len},${y + Math.cos(a) * len}`);
  }
  return pts.join(" ");
};

const wedgePath = (x: number, y: number, r: number, fromDeg: number, toDeg: number) => {
  // ángulos desde "adelante" (−y), positivos hacia la izquierda
  const p = (d: number) => `${x - Math.sin(rad(d)) * r},${y - Math.cos(rad(d)) * r}`;
  return `M ${x},${y} L ${p(fromDeg)} A ${r},${r} 0 0 0 ${p(toDeg)} Z`;
};

export type OtherCar = { x: number; y: number; color: string; rot?: number; id: string; mark?: number; markColor?: string };

export type TopDownProps = {
  t: number;
  cam: Camera;
  /** Vista efectiva de cada espejo lateral (0 = mal, 1 = bien). */
  vL: number;
  vR: number;
  /** Apertura física de cada espejo (grados) para dibujar la carcasa. */
  aimL?: number;
  aimR?: number;
  conesOpacity?: number;
  rearOpacity?: number;
  sideOpacityL?: number;
  sideOpacityR?: number;
  /** Resalta la superposición entre lateral y central (0..1). */
  overlap?: number;
  /** Color de los conos laterales: 0 = blanco/azulado, 1 = verde. */
  sideGreen?: number;
  blindZones?: number;
  blindPulse?: number;
  peripheral?: number;
  interior?: number;
  headDx?: number;
  headTurn?: number;
  sightL?: number;
  sightR?: number;
  ourDx?: number;
  ourRot?: number;
  brake?: number;
  blinkL?: number;
  cars?: OtherCar[];
  roadSpeed?: number;
  shoulderCheck?: number;
  highlightRear?: number;
  highlightSideL?: number;
  highlightView?: number;
};

export const TopDown: React.FC<TopDownProps> = ({
  t,
  cam,
  vL,
  vR,
  aimL = 0,
  aimR = 0,
  conesOpacity = 1,
  rearOpacity = 1,
  sideOpacityL = 1,
  sideOpacityR = 1,
  overlap = 0,
  sideGreen = 0,
  blindZones = 0,
  blindPulse = 0,
  peripheral = 0,
  interior = 0,
  headDx = 0,
  headTurn = 0,
  sightL = 0,
  sightR = 0,
  ourDx = 0,
  ourRot = 0,
  brake = 0,
  blinkL = 0,
  cars = [],
  roadSpeed = 900,
  shoulderCheck = 0,
  highlightRear = 0,
  highlightSideL = 0,
  highlightView = 0,
}) => {
  const dashPeriod = 170;
  const dashOff = (t * roadSpeed) % dashPeriod;
  const [l0, l1] = sideConeAngles(vL);
  const [r0, r1] = sideConeAngles(vR);
  const mL = { x: MIRROR_L.x - 12, y: MIRROR_L.y + 2 };
  const mR = { x: MIRROR_R.x + 12, y: MIRROR_R.y + 2 };
  const sideCol = sideGreen > 0.5 ? COLORS.green : "#CFE9FF";
  const head = { x: HEAD.x + headDx, y: HEAD.y };

  // Zona ciega (coordenadas locales del auto): pista de al lado, desde la cabeza hasta donde entra el cono mal ajustado.
  const outerWrong = rad(SIDE_WRONG_CENTER + SIDE_HALF);
  const edgeAt = (dy: number) => mL.x - Math.tan(outerWrong) * (dy - mL.y);
  const zoneTop = -20;
  const zoneBot = 600;
  const laneInner = -125 - 6; // borde interior de la pista izquierda respecto al centro del auto (−125)
  const laneOuter = -375 + 12;
  const blindL = [
    [laneOuter, zoneTop],
    [Math.min(laneInner, edgeAt(zoneTop)), zoneTop],
    [laneInner, (mL.x - laneInner) / Math.tan(outerWrong) + mL.y],
    [edgeAt(zoneBot), zoneBot],
    [laneOuter, zoneBot],
  ];
  const blindLStr = blindL.map((p) => p.join(",")).join(" ");
  const blindRStr = blindL.map((p) => `${-p[0]},${p[1]}`).join(" ");

  return (
    <AbsoluteFill>
      <svg width={1080} height={1920} viewBox="0 0 1080 1920">
        <defs>
          <linearGradient id="road-grad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#151A21" />
            <stop offset="0.5" stopColor="#1D232C" />
            <stop offset="1" stopColor="#151A21" />
          </linearGradient>
          <radialGradient id="cone-rear" cx={0} cy={0} r={CONE_LEN} gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor={COLORS.accent} stopOpacity={0.55} />
            <stop offset="1" stopColor={COLORS.accent} stopOpacity={0.04} />
          </radialGradient>
          <radialGradient id="cone-L" cx={mL.x} cy={mL.y} r={CONE_LEN} gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor={sideCol} stopOpacity={0.6} />
            <stop offset="1" stopColor={sideCol} stopOpacity={0.04} />
          </radialGradient>
          <radialGradient id="cone-R" cx={mR.x} cy={mR.y} r={CONE_LEN} gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor={sideCol} stopOpacity={0.6} />
            <stop offset="1" stopColor={sideCol} stopOpacity={0.04} />
          </radialGradient>
          <radialGradient id="periph" cx={head.x} cy={head.y} r={520} gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor={COLORS.green} stopOpacity={0.5} />
            <stop offset="1" stopColor={COLORS.green} stopOpacity={0.0} />
          </radialGradient>
          <linearGradient id="blind-fade" x1="0" y1={zoneTop} x2="0" y2={zoneBot} gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor={COLORS.red} stopOpacity={0.55} />
            <stop offset="0.75" stopColor={COLORS.red} stopOpacity={0.4} />
            <stop offset="1" stopColor={COLORS.red} stopOpacity={0} />
          </linearGradient>
          <pattern id="blind-hatch" width="26" height="26" patternUnits="userSpaceOnUse" patternTransform="rotate(40)">
            <rect width="10" height="26" fill="rgba(255,59,59,0.35)" />
          </pattern>
          <clipPath id="clip-cone-L">
            <polygon points={conePoints(mL.x, mL.y, l0, l1, -1)} />
          </clipPath>
          <clipPath id="clip-cone-R">
            <polygon points={conePoints(mR.x, mR.y, r0, r1, 1)} />
          </clipPath>
          <pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse">
            <path d="M 60 0 L 0 0 0 60" fill="none" stroke="rgba(127,211,255,0.05)" strokeWidth={2} />
          </pattern>
        </defs>

        <g transform={`translate(${cam.ax} ${cam.ay}) scale(${cam.s}) translate(${-cam.fx} ${-cam.fy})`}>
          {/* suelo y carretera */}
          <rect x={-3000} y={-4000} width={7000} height={10000} fill="#0A0F15" />
          <rect x={-3000} y={-4000} width={7000} height={10000} fill="url(#grid)" />
          <rect x={ROAD.left - 30} y={-4000} width={ROAD.right - ROAD.left + 60} height={10000} fill="#11161C" />
          <rect x={ROAD.left} y={-4000} width={ROAD.right - ROAD.left} height={10000} fill="url(#road-grad)" />
          <rect x={ROAD.left + 6} y={-4000} width={8} height={10000} fill={COLORS.lane} opacity={0.85} />
          <rect x={ROAD.right - 14} y={-4000} width={8} height={10000} fill={COLORS.lane} opacity={0.85} />
          {[415, 665].map((x) => (
            <g key={x}>
              {Array.from({ length: 70 }).map((_, i) => (
                <rect key={i} x={x - 4} y={-4000 + i * dashPeriod + dashOff} width={8} height={86} rx={2} fill={COLORS.lane} opacity={0.75} />
              ))}
            </g>
          ))}

          {/* otros autos (detrás de los conos para que se note cuándo un cono los cubre) */}
          {cars.map((c) => (
            <g key={c.id} transform={`translate(${c.x} ${c.y}) rotate(${c.rot ?? 0})`}>
              {c.mark ? (
                <rect x={-90} y={-170} width={180} height={340} rx={40} fill="none" stroke={c.markColor ?? COLORS.green} strokeWidth={8} opacity={c.mark} strokeDasharray="30 16" />
              ) : null}
              <CarTop color={c.color} id={c.id} />
            </g>
          ))}

          {/* marco de nuestro auto */}
          <g transform={`translate(${OUR.x + ourDx} ${OUR.y}) rotate(${ourRot})`}>
            {/* zonas ciegas */}
            {blindZones > 0 ? (
              <g opacity={blindZones * (0.8 + 0.2 * blindPulse)}>
                <polygon points={blindLStr} fill="url(#blind-fade)" />
                <polygon points={blindLStr} fill="url(#blind-hatch)" />
                <polygon points={blindLStr} fill="none" stroke={COLORS.red} strokeWidth={5} strokeDasharray="22 12" strokeLinejoin="round" />
                <polygon points={blindRStr} fill="url(#blind-fade)" />
                <polygon points={blindRStr} fill="url(#blind-hatch)" />
                <polygon points={blindRStr} fill="none" stroke={COLORS.red} strokeWidth={5} strokeDasharray="22 12" strokeLinejoin="round" />
              </g>
            ) : null}

            {/* visión periférica */}
            {peripheral > 0 ? (
              <path d={wedgePath(head.x, head.y, 520, 0, 112)} fill="url(#periph)" opacity={peripheral} />
            ) : null}
            {highlightView > 0 ? (
              <path d={wedgePath(head.x, head.y, 520, 0, 112)} fill="none" stroke={COLORS.green} strokeWidth={6} opacity={highlightView} strokeDasharray="18 12" />
            ) : null}

            {/* mirada sobre el hombro */}
            {shoulderCheck > 0 ? (
              <path d={wedgePath(head.x, head.y, 600, 100, 150)} fill={COLORS.yellow} opacity={0.35 * shoulderCheck} />
            ) : null}

            {/* conos */}
            <g opacity={conesOpacity}>
              <g opacity={rearOpacity}>
                <polygon points={conePoints(MIRROR_C.x, MIRROR_C.y, -REAR_HALF, REAR_HALF, 1)} fill="url(#cone-rear)" />
                <polygon
                  points={conePoints(MIRROR_C.x, MIRROR_C.y, -REAR_HALF, REAR_HALF, 1)}
                  fill="none"
                  stroke={COLORS.accent}
                  strokeWidth={4 + 4 * highlightRear}
                  opacity={0.55 + 0.45 * highlightRear}
                />
              </g>
              <g opacity={sideOpacityL}>
                <polygon points={conePoints(mL.x, mL.y, l0, l1, -1)} fill="url(#cone-L)" />
                <polygon points={conePoints(mL.x, mL.y, l0, l1, -1)} fill="none" stroke={sideCol} strokeWidth={4 + 4 * highlightSideL} opacity={0.7 + 0.3 * highlightSideL} />
              </g>
              <g opacity={sideOpacityR}>
                <polygon points={conePoints(mR.x, mR.y, r0, r1, 1)} fill="url(#cone-R)" />
                <polygon points={conePoints(mR.x, mR.y, r0, r1, 1)} fill="none" stroke={sideCol} strokeWidth={4} opacity={0.7} />
              </g>
              {overlap > 0 ? (
                <g opacity={overlap}>
                  <polygon clipPath="url(#clip-cone-L)" points={conePoints(MIRROR_C.x, MIRROR_C.y, -REAR_HALF, REAR_HALF, 1)} fill={COLORS.yellow} opacity={0.55} />
                  <polygon clipPath="url(#clip-cone-R)" points={conePoints(MIRROR_C.x, MIRROR_C.y, -REAR_HALF, REAR_HALF, 1)} fill={COLORS.yellow} opacity={0.55} />
                </g>
              ) : null}
            </g>

            {/* línea de mirada cabeza → espejo */}
            {sightL > 0 ? (
              <line x1={head.x} y1={head.y} x2={mL.x} y2={mL.y} stroke="#FFFFFF" strokeWidth={3} strokeDasharray="6 6" opacity={sightL} />
            ) : null}
            {sightR > 0 ? (
              <line x1={head.x} y1={head.y} x2={mR.x} y2={mR.y} stroke="#FFFFFF" strokeWidth={3} strokeDasharray="6 6" opacity={sightR} />
            ) : null}

            <CarTop
              color={COLORS.ourCar}
              id="our"
              interior={interior}
              headDx={headDx}
              headTurn={headTurn}
              mirrorL={aimL}
              mirrorR={aimR}
              mirrorGlowL={sightL}
              mirrorGlowR={sightR}
              brake={brake}
              blinkL={blinkL}
            />
          </g>
        </g>
      </svg>
    </AbsoluteFill>
  );
};
