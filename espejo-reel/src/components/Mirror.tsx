import React from "react";
import { interpolate } from "remotion";
import { mix } from "../lib/anim";

/**
 * Espejo retrovisor visto de frente (lo que ve el conductor).
 *
 * level   reflectancia efectiva: 1 = posición DÍA (capa plateada), ~0,05 = posición NOCHE
 *         (solo el reflejo del vidrio frontal). Controla brillo, halo y destellos.
 * glow    presencia de los focos del auto de atrás (0 = sin auto / fuera de cuadro).
 * yaw     giro lateral del espejo (lo que hace "la mayoría").
 * pitch   pequeña inclinación al accionar la palanca.
 * tab     0 = palanca en día, 1 = palanca tirada hacia el conductor (noche).
 * viewShift desplazamiento del reflejo (al girar el espejo, el auto sale del cuadro).
 */
export type MirrorProps = {
  width: number;
  level: number;
  glow?: number;
  yaw?: number;
  pitch?: number;
  tab?: number;
  hasTab?: boolean;
  ecDim?: number;
  scene?: "night" | "day";
  t?: number;
  carScale?: number;
  viewShift?: number;
  sensor?: number;
  led?: number;
  stem?: number;
  bloomOutside?: boolean;
  id: string;
};

const VB_W = 800;
const VB_H = 300;
const HOUSING =
  "M 64,0 H 736 Q 800,0 800,64 V 196 Q 800,300 690,300 H 110 Q 0,300 0,196 V 64 Q 0,0 64,0 Z";
const GLASS =
  "M 76,15 H 724 Q 785,15 785,74 V 192 Q 785,285 686,285 H 114 Q 15,285 15,192 V 74 Q 15,15 76,15 Z";

const clamp01 = (v: number) => Math.max(0, Math.min(1, v));

/** Escena reflejada (luneta trasera, camino y auto de atrás). Coordenadas del viewBox. */
const Reflection: React.FC<{
  id: string;
  scene: "night" | "day";
  carScale: number;
  shift: number;
  t: number;
  glow: number;
}> = ({ id, scene, carScale, shift, t, glow }) => {
  const day = scene === "day";
  const vpX = 400;
  const vpY = 112;
  const s = carScale;
  const carY = 150 + 18 * (s - 1);
  // franjas del camino que "vienen" (mov. sutil hacia atrás = se alejan en el reflejo)
  const dashPhase = (t * 1.6) % 1;
  const dashes = Array.from({ length: 7 }, (_, i) => {
    const z = (i + dashPhase) / 7; // 0 lejos → 1 cerca
    const y0 = vpY + Math.pow(z, 2.2) * 100;
    const y1 = vpY + Math.pow(Math.min(1, z + 0.06), 2.2) * 100;
    return { y0, y1, z };
  });
  const laneX = (y: number, side: number) => vpX + side * ((y - vpY) / 100) * 290;
  return (
    <g transform={`translate(${shift} 0)`}>
      {/* interior */}
      <rect x={-900} y={-20} width={2600} height={360} fill={day ? "#3b4250" : "#06080c"} />
      <rect x={-900} y={-20} width={2600} height={70} fill={day ? "#4a5261" : "#0b0e14"} />
      {/* ventanas laterales (aparecen al girar el espejo) */}
      <path d="M -560,60 L -120,52 L -60,215 L -600,230 Z" fill={day ? "#9cc3e6" : "#0a1220"} />
      <path d="M 920,52 L 1380,60 L 1420,230 L 860,215 Z" fill={day ? "#a7cbe9" : "#0a1220"} />
      {!day ? (
        <>
          <circle cx={1150} cy={100} r={5} fill="#ffb35c" opacity={0.7} />
          <circle cx={1150} cy={100} r={22} fill="#ffb35c" opacity={0.12} />
          <circle cx={-330} cy={110} r={4} fill="#ffb35c" opacity={0.6} />
        </>
      ) : null}
      {/* luneta */}
      <clipPath id={`${id}-win`}>
        <path d="M 178,46 Q 182,40 190,40 H 610 Q 618,40 622,46 L 676,198 Q 678,206 670,206 H 130 Q 122,206 124,198 Z" />
      </clipPath>
      <g clipPath={`url(#${id}-win)`}>
        <rect x={100} y={30} width={600} height={90} fill={`url(#${id}-sky)`} />
        <path d={`M ${vpX},${vpY} L 760,215 L 40,215 Z`} fill={day ? "#7d838c" : "#0b0e13"} />
        {/* bordes de pista */}
        <path d={`M ${vpX},${vpY} L ${laneX(215, -1.25)},215`} stroke={day ? "#e9edf2" : "#2b3140"} strokeWidth={3} />
        <path d={`M ${vpX},${vpY} L ${laneX(215, 1.25)},215`} stroke={day ? "#e9edf2" : "#2b3140"} strokeWidth={3} />
        {dashes.map((d, i) => (
          <path
            key={i}
            d={`M ${laneX(d.y0, -0.42)},${d.y0} L ${laneX(d.y1, -0.42)},${d.y1}`}
            stroke={day ? "#f4f4f4" : "#3a4152"}
            strokeWidth={1 + d.z * 4}
          />
        ))}
        {day ? (
          <>
            <path d="M 100,112 Q 150,70 200,96 Q 240,74 290,104 L 290,116 L 100,116 Z" fill="#4f7a4a" />
            <path d="M 520,108 Q 580,66 640,92 Q 680,80 700,100 L 700,116 L 520,116 Z" fill="#557f4d" />
          </>
        ) : (
          <>
            {[230, 285, 520, 575].map((x, i) => (
              <g key={i}>
                <circle cx={x} cy={98 + (i % 2) * 6} r={2.4} fill="#ffb35c" />
                <circle cx={x} cy={98 + (i % 2) * 6} r={9} fill="#ffb35c" opacity={0.18} />
              </g>
            ))}
          </>
        )}
        {/* auto de atrás */}
        <g transform={`translate(${vpX} ${carY}) scale(${s})`} opacity={glow > 0 ? 1 : 0}>
          <path d="M -70,-34 Q -60,-58 -36,-60 H 36 Q 60,-58 70,-34 Z" fill={day ? "#2c323b" : "#04060a"} />
          <path d="M -58,-36 Q -50,-52 -32,-54 H 32 Q 50,-52 58,-36 Z" fill={day ? "#a9c7e2" : "#0b1018"} />
          <rect x={-96} y={-36} width={192} height={52} rx={16} fill={day ? "#39414d" : "#05070b"} />
          <rect x={-40} y={-8} width={80} height={16} rx={3} fill={day ? "#20252c" : "#020305"} />
          {day ? (
            <>
              <rect x={-84} y={-22} width={34} height={14} rx={5} fill="#dfe6ee" />
              <rect x={50} y={-22} width={34} height={14} rx={5} fill="#dfe6ee" />
            </>
          ) : null}
        </g>
      </g>
      {/* marco de la luneta y pilares */}
      <path
        d="M 178,46 Q 182,40 190,40 H 610 Q 618,40 622,46 L 676,198 Q 678,206 670,206 H 130 Q 122,206 124,198 Z"
        fill="none"
        stroke={day ? "#2a2f38" : "#0f131a"}
        strokeWidth={10}
      />
      {/* apoyacabezas traseros */}
      <rect x={150} y={176} width={150} height={150} rx={40} fill={day ? "#262b33" : "#07090d"} />
      <rect x={500} y={176} width={150} height={150} rx={40} fill={day ? "#262b33" : "#07090d"} />
      <rect x={-200} y={248} width={1200} height={80} fill={day ? "#30353e" : "#08090d"} />
    </g>
  );
};

export const Mirror: React.FC<MirrorProps> = ({
  width,
  level,
  glow = 1,
  yaw = 0,
  pitch = 0,
  tab = 0,
  hasTab = true,
  ecDim = 0,
  scene = "night",
  t = 0,
  carScale = 1,
  viewShift = 0,
  sensor = 0,
  led = 0,
  stem = 0,
  bloomOutside = true,
  id,
}) => {
  const k = width / VB_W;
  const height = VB_H * k;
  const day = scene === "day";
  const L = clamp01(level);
  const G = clamp01(glow);
  // focos del auto de atrás en coordenadas del viewBox (siguen al desplazamiento del reflejo)
  const s = carScale;
  const carY = 150 + 18 * (s - 1);
  const hx = [400 - 66 * s + viewShift, 400 + 66 * s + viewShift];
  const hy = carY - 15 * s;
  const flicker = 1 + 0.04 * Math.sin(t * 23) + 0.03 * Math.sin(t * 37 + 1);
  const glare = day ? 0 : L * G * flicker; // intensidad de encandilamiento
  const coreOp = day ? 0 : G * (0.5 + 0.5 * clamp01(L * 3));
  const darken = day ? interpolate(L, [0.04, 1], [0.9, 0]) : interpolate(L, [0.04, 1], [0.58, 0]);
  const tabP = clamp01(tab);
  const tp = (a: number, b: number) => mix(a, b, tabP);

  return (
    <div style={{ position: "relative", width, height }}>
      {/* brazo de montaje */}
      {stem > 0 ? (
        <div
          style={{
            position: "absolute",
            left: width / 2 - 17 * k,
            top: -stem * k,
            width: 34 * k,
            height: (stem + 24) * k,
            borderRadius: 14 * k,
            background: "linear-gradient(90deg, #07080b 0%, #262b33 45%, #0b0d11 100%)",
          }}
        />
      ) : null}
      <div
        style={{
          position: "absolute",
          inset: 0,
          transformOrigin: "50% 0%",
          transform: `perspective(${1800 * k}px) rotateX(${pitch}deg) rotateY(${yaw}deg)`,
        }}
      >
        <svg
          viewBox={`0 0 ${VB_W} ${VB_H}`}
          width={width}
          height={height}
          style={{ position: "absolute", inset: 0, overflow: "visible" }}
        >
          <defs>
            <linearGradient id={`${id}-house`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#2c313a" />
              <stop offset="0.5" stopColor="#15181e" />
              <stop offset="1" stopColor="#0a0b0f" />
            </linearGradient>
            <linearGradient id={`${id}-sky`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor={day ? "#5d9de0" : "#070c18"} />
              <stop offset="1" stopColor={day ? "#cfe5f8" : "#18243c"} />
            </linearGradient>
            <radialGradient id={`${id}-hl`}>
              <stop offset="0" stopColor="#ffffff" stopOpacity="1" />
              <stop offset="0.18" stopColor="#fffaf0" stopOpacity="0.95" />
              <stop offset="0.45" stopColor="#ffe9c4" stopOpacity="0.38" />
              <stop offset="1" stopColor="#ffe2b0" stopOpacity="0" />
            </radialGradient>
            <radialGradient id={`${id}-bloom`}>
              <stop offset="0" stopColor="#fff8ea" stopOpacity="0.9" />
              <stop offset="0.25" stopColor="#ffeccc" stopOpacity="0.45" />
              <stop offset="0.6" stopColor="#9fc4ff" stopOpacity="0.12" />
              <stop offset="1" stopColor="#9fc4ff" stopOpacity="0" />
            </radialGradient>
            <linearGradient id={`${id}-streak`} x1="0" y1="0" x2="1" y2="0">
              <stop offset="0" stopColor="#7fb8ff" stopOpacity="0" />
              <stop offset="0.35" stopColor="#9fd0ff" stopOpacity="0.35" />
              <stop offset="0.5" stopColor="#ffffff" stopOpacity="1" />
              <stop offset="0.65" stopColor="#9fd0ff" stopOpacity="0.35" />
              <stop offset="1" stopColor="#7fb8ff" stopOpacity="0" />
            </linearGradient>
            <linearGradient id={`${id}-sheen`} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#ffffff" stopOpacity="0.10" />
              <stop offset="0.4" stopColor="#ffffff" stopOpacity="0" />
              <stop offset="0.62" stopColor="#ffffff" stopOpacity="0.05" />
              <stop offset="1" stopColor="#ffffff" stopOpacity="0" />
            </linearGradient>
            <clipPath id={`${id}-glass`}>
              <path d={GLASS} />
            </clipPath>
          </defs>

          {/* palanca (detrás del borde inferior de la carcasa) */}
          {hasTab ? (
            <g>
              <path
                d={`M ${tp(346, 338)},290 L ${tp(454, 462)},290 L ${tp(446, 478)},${tp(334, 372)} Q 400,${tp(340, 382)} ${tp(354, 322)},${tp(334, 372)} Z`}
                fill={tabP > 0.5 ? "#3a4250" : "#2a303a"}
                stroke="#6a7486"
                strokeWidth={2.5}
              />
              {[0, 1, 2].map((i) => {
                const y = tp(306, 318) + i * tp(8, 15);
                return (
                  <line
                    key={i}
                    x1={tp(366, 356)}
                    x2={tp(434, 444)}
                    y1={y}
                    y2={y}
                    stroke="#7a8496"
                    strokeWidth={2.5}
                    strokeLinecap="round"
                  />
                );
              })}
            </g>
          ) : null}

          {/* carcasa */}
          <path d={HOUSING} fill={`url(#${id}-house)`} stroke="#3a414d" strokeWidth={2.5} />
          <path d={HOUSING} fill="none" stroke="#000" strokeOpacity={0.5} strokeWidth={1} transform="translate(0 2)" />

          {/* vidrio */}
          <g clipPath={`url(#${id}-glass)`}>
            <Reflection id={id} scene={scene} carScale={carScale} shift={viewShift} t={t} glow={G} />
            {/* atenuación por reflectancia (posición noche) */}
            <rect x={0} y={0} width={VB_W} height={VB_H} fill="#000" opacity={darken} />
            {/* velo luminoso del encandilamiento */}
            <rect x={0} y={0} width={VB_W} height={VB_H} fill="#fff4dc" opacity={0.42 * Math.pow(glare, 1.4)} />
            {/* focos */}
            {hx.map((x, i) => (
              <g key={i}>
                <circle cx={x} cy={hy} r={20 + 190 * glare} fill={`url(#${id}-hl)`} opacity={Math.min(1, 0.22 + glare)} />
                <circle cx={x} cy={hy} r={(7 + 5 * glare) * s} fill="#ffffff" opacity={coreOp} />
              </g>
            ))}
            {/* electrocrómico: el gel se oscurece desde el centro */}
            <rect x={0} y={0} width={VB_W} height={VB_H} fill="#06222a" opacity={0.86 * ecDim} />
            <rect x={0} y={0} width={VB_W} height={VB_H} fill={`url(#${id}-sheen)`} />
            {sensor > 0 ? (
              <g opacity={sensor}>
                <circle cx={400} cy={266} r={9} fill="#05070a" stroke="#4b5563" strokeWidth={2} />
                <circle cx={397} cy={263} r={2.5} fill="#8fa3bf" />
              </g>
            ) : null}
            {led > 0 ? (
              <g>
                <circle cx={712} cy={266} r={6} fill="#2BE38A" opacity={led} />
                <circle cx={712} cy={266} r={18} fill="#2BE38A" opacity={0.35 * led} />
              </g>
            ) : null}
          </g>
          <path d={GLASS} fill="none" stroke="#000" strokeOpacity={0.7} strokeWidth={5} />
          <path d={GLASS} fill="none" stroke="#5b6472" strokeOpacity={0.35} strokeWidth={1.2} />

          {/* luz que "desborda" el espejo (destello en la cámara / en tus ojos) */}
          {bloomOutside && glare > 0.02 ? (
            <g style={{ mixBlendMode: "screen" }}>
              <circle cx={400 + viewShift * 0.2} cy={hy} r={180 + 620 * glare} fill={`url(#${id}-bloom)`} opacity={Math.min(1, glare * 1.05)} />
              <ellipse cx={400 + viewShift * 0.2} cy={hy} rx={1500} ry={5 + 16 * glare} fill={`url(#${id}-streak)`} opacity={glare * 0.95} />
              {hx.map((x, i) =>
                [0, 60, 120].map((a) => (
                  <rect
                    key={`${i}-${a}`}
                    x={x - 2}
                    y={hy - 170 * glare}
                    width={4}
                    height={340 * glare}
                    rx={2}
                    fill="#fffaf0"
                    opacity={0.5 * glare}
                    transform={`rotate(${a + 15 + i * 10} ${x} ${hy})`}
                  />
                )),
              )}
            </g>
          ) : null}
        </svg>
      </div>
    </div>
  );
};

export const MIRROR_VB = { w: VB_W, h: VB_H, tabY: 320 };
