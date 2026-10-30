import React from "react";
import { AbsoluteFill } from "remotion";
import { THEME } from "./theme";

/**
 * Interior visto desde el asiento del conductor: borde del tablero con capota del instrumental,
 * pantalla del instrumental y arco superior del volante. 2D (SVG): nítido, determinista y barato.
 * `lift` = desplazamiento vertical en px (el tablero sigue a la carrocería en los golpes).
 */
export const DASH_TOP = 1224; // punto más alto de la capota
export const CLUSTER = { x: 204, y: 1268, w: 672, h: 188 };

const DASH_PATH =
  "M0 1286 C 120 1279 170 1270 202 1250 C 244 1230 300 1224 540 1224 C 780 1224 836 1230 878 1250 C 910 1270 960 1279 1080 1286 L 1080 1920 L 0 1920 Z";

export const Cockpit: React.FC<{ lift?: number; children?: React.ReactNode; glow?: number }> = ({
  lift = 0,
  children,
  glow = 1,
}) => (
  <AbsoluteFill style={{ translate: `0px ${lift}px`, pointerEvents: "none" }}>
    <svg width={1080} height={1940} style={{ position: "absolute", inset: 0 }}>
      <defs>
        <linearGradient id="dash" x1="0" y1="1224" x2="0" y2="1920" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#15171b" />
          <stop offset="0.06" stopColor="#0c0d10" />
          <stop offset="0.4" stopColor="#070809" />
          <stop offset="1" stopColor="#030304" />
        </linearGradient>
        <linearGradient id="rim" x1="0" y1="1450" x2="0" y2="1560" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#3a3d44" />
          <stop offset="0.12" stopColor="#1b1c20" />
          <stop offset="0.5" stopColor="#0d0e10" />
          <stop offset="1" stopColor="#060607" />
        </linearGradient>
        <linearGradient id="screen" x1="0" y1={CLUSTER.y} x2="0" y2={CLUSTER.y + CLUSTER.h} gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#07080b" />
          <stop offset="1" stopColor="#040507" />
        </linearGradient>
        <filter id="soft" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="6" />
        </filter>
      </defs>

      {/* reflejo tenue del tablero en la parte baja del parabrisas */}
      <path d="M0 1286 C 300 1215 780 1215 1080 1286 L 1080 1240 C 780 1180 300 1180 0 1240 Z" fill="rgba(140,150,170,0.025)" filter="url(#soft)" />

      <path d={DASH_PATH} fill="url(#dash)" />
      {/* arista del tablero que recibe la luz ambiente */}
      <path
        d="M0 1286 C 120 1279 170 1270 202 1250 C 244 1230 300 1224 540 1224 C 780 1224 836 1230 878 1250 C 910 1270 960 1279 1080 1286"
        fill="none"
        stroke="rgba(170,180,200,0.13)"
        strokeWidth={2}
      />

      {/* pantalla del instrumental */}
      <rect x={CLUSTER.x} y={CLUSTER.y} width={CLUSTER.w} height={CLUSTER.h} rx={22} fill="url(#screen)" />
      <rect
        x={CLUSTER.x + 0.5}
        y={CLUSTER.y + 0.5}
        width={CLUSTER.w - 1}
        height={CLUSTER.h - 1}
        rx={22}
        fill="none"
        stroke="rgba(255,255,255,0.06)"
      />


      {/* volante: arco superior del aro */}
      <circle cx={540} cy={2140} r={648} fill="none" stroke="url(#rim)" strokeWidth={78} />
      {/* luz de la pantalla sobre el borde superior del aro */}
      <circle cx={540} cy={2140} r={686} fill="none" stroke={`rgba(190,205,230,${0.16 * glow})`} strokeWidth={2.5} />
      <circle cx={540} cy={2140} r={610} fill="none" stroke="rgba(190,205,230,0.05)" strokeWidth={1.5} />
    </svg>
    <div
      style={{
        position: "absolute",
        left: CLUSTER.x,
        top: CLUSTER.y,
        width: CLUSTER.w,
        height: CLUSTER.h,
        color: THEME.text,
      }}
    >
      {children}
    </div>
  </AbsoluteFill>
);
