import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";

/** Fondo oscuro de estudio con luces de ciudad desenfocadas (bokeh) que derivan lento. */
const BOKEH = Array.from({ length: 22 }, (_, i) => {
  const r = (n: number) => {
    const x = Math.sin(n * 78.233 + i * 12.9898) * 43758.5453;
    return x - Math.floor(x);
  };
  return {
    x: r(1) * 1080,
    y: 200 + r(2) * 1300,
    s: 40 + r(3) * 120,
    o: 0.05 + r(4) * 0.12,
    c: r(5) > 0.6 ? "255,170,90" : r(5) > 0.3 ? "120,170,255" : "255,235,200",
    v: 0.2 + r(6) * 0.6,
  };
});

export const StudioBG: React.FC<{ tint?: string }> = ({ tint = "#0a1222" }) => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill
      style={{
        background: `radial-gradient(120% 70% at 50% 38%, ${tint} 0%, #05070d 55%, #020306 100%)`,
      }}
    >
      {BOKEH.map((b, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: ((b.x - f * b.v) % 1240 + 1240) % 1240 - 80,
            top: b.y,
            width: b.s,
            height: b.s,
            borderRadius: "50%",
            background: `radial-gradient(circle, rgba(${b.c},${b.o}) 0%, rgba(${b.c},${b.o * 0.5}) 45%, rgba(${b.c},0) 70%)`,
          }}
        />
      ))}
    </AbsoluteFill>
  );
};

/** Fondo de día (cielo, sol). */
export const DayBG: React.FC<{ sun?: number }> = ({ sun = 1 }) => (
  <AbsoluteFill style={{ background: "linear-gradient(180deg, #5fa2e6 0%, #9cc8f0 45%, #d9ecfb 100%)" }}>
    <div
      style={{
        position: "absolute",
        left: 760,
        top: 120,
        width: 520,
        height: 520,
        translate: "-50% -50%",
        borderRadius: "50%",
        opacity: sun,
        background:
          "radial-gradient(circle, rgba(255,255,240,1) 0%, rgba(255,248,210,0.9) 12%, rgba(255,240,180,0.35) 30%, rgba(255,240,180,0) 65%)",
      }}
    />
  </AbsoluteFill>
);

/**
 * Vista del conductor de noche: carretera, parabrisas, pilares y tablero.
 * El retrovisor se monta aparte (lo coloca la escena).
 */
export const NightPOV: React.FC<{ t: number; speed?: number }> = ({ t, speed = 1 }) => {
  const VPX = 540;
  const VPY = 880;
  const road = (z: number) => VPY + 900 / z; // z en "metros" → y en pantalla
  const lineX = (y: number, off: number) => VPX + ((y - VPY) / 1040) * off;
  const dashes = Array.from({ length: 14 }, (_, i) => {
    const z = 3 + ((i * 6 - t * 22 * speed) % 84 + 84) % 84;
    return z;
  });
  const posts = Array.from({ length: 8 }, (_, i) => 4 + ((i * 11 - t * 22 * speed) % 88 + 88) % 88);
  return (
    <AbsoluteFill style={{ background: "linear-gradient(180deg, #010207 0%, #040a17 40%, #0b1527 46%, #0a0f19 47%)" }}>
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
        <defs>
          <linearGradient id="asphalt" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#0b0e14" />
            <stop offset="1" stopColor="#14171d" />
          </linearGradient>
          <radialGradient id="beam" cx="0.5" cy="1" r="0.9">
            <stop offset="0" stopColor="#ffe7b8" stopOpacity="0.20" />
            <stop offset="0.6" stopColor="#ffe7b8" stopOpacity="0.05" />
            <stop offset="1" stopColor="#ffe7b8" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="city" cx="0.5" cy="1" r="0.6">
            <stop offset="0" stopColor="#ff9a4d" stopOpacity="0.22" />
            <stop offset="1" stopColor="#ff9a4d" stopOpacity="0" />
          </radialGradient>
        </defs>
        <rect x={0} y={700} width={1080} height={180} fill="url(#city)" />
        {/* cerros */}
        <path d="M 0,872 Q 180,830 330,860 T 640,850 T 1080,866 L 1080,882 L 0,882 Z" fill="#05080f" />
        <path d={`M ${VPX - 4},${VPY} L ${VPX + 4},${VPY} L 1900,1920 L -820,1920 Z`} fill="url(#asphalt)" />
        <path d={`M ${VPX},${VPY} L 1700,1920 L -620,1920 Z`} fill="url(#beam)" />
        {/* bordes */}
        <path d={`M ${VPX},${VPY} L ${lineX(1920, 980)},1920`} stroke="#d8dde6" strokeOpacity={0.55} strokeWidth={10} />
        <path d={`M ${VPX},${VPY} L ${lineX(1920, -1300)},1920`} stroke="#d8b25a" strokeOpacity={0.4} strokeWidth={9} />
        {/* segmentada */}
        {dashes.map((z, i) => {
          const y0 = road(z + 2.2);
          const y1 = road(z);
          if (y1 < VPY + 2) return null;
          const w0 = 2 + (y0 - VPY) * 0.03;
          const w1 = 2 + (y1 - VPY) * 0.03;
          return (
            <path
              key={i}
              d={`M ${lineX(y0, -360) - w0},${y0} L ${lineX(y0, -360) + w0},${y0} L ${lineX(y1, -360) + w1},${y1} L ${lineX(y1, -360) - w1},${y1} Z`}
              fill="#e9edf2"
              opacity={Math.min(0.75, (y1 - VPY) / 120)}
            />
          );
        })}
        {/* delineadores */}
        {posts.map((z, i) => {
          const y = road(z);
          const x = lineX(y, 1500);
          const h = (y - VPY) * 0.45;
          if (x > 1200) return null;
          return (
            <g key={i} opacity={Math.min(1, (y - VPY) / 60)}>
              <rect x={x} y={y - h} width={Math.max(2, h * 0.08)} height={h} fill="#1a1f28" />
              <rect x={x} y={y - h} width={Math.max(2, h * 0.08)} height={h * 0.12} fill="#ff8a3d" opacity={0.85} />
            </g>
          );
        })}
      </svg>
      {/* interior: techo, pilares, tablero */}
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
        <defs>
          <linearGradient id="roof" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#151922" />
            <stop offset="1" stopColor="#07090d" />
          </linearGradient>
          <linearGradient id="dash" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#0b0d12" />
            <stop offset="1" stopColor="#020203" />
          </linearGradient>
          <radialGradient id="cluster" cx="0.5" cy="0.2" r="0.5">
            <stop offset="0" stopColor="#3b8cff" stopOpacity="0.28" />
            <stop offset="1" stopColor="#3b8cff" stopOpacity="0" />
          </radialGradient>
        </defs>
        <path d="M 0,0 H 1080 V 150 Q 540,205 0,150 Z" fill="url(#roof)" />
        <path d="M 0,120 L 170,150 L 40,1250 L 0,1300 Z" fill="#05060a" />
        <path d="M 1080,120 L 910,150 L 1040,1250 L 1080,1300 Z" fill="#05060a" />
        <path d="M 0,1490 Q 540,1400 1080,1490 V 1920 H 0 Z" fill="url(#dash)" />
        <ellipse cx={540} cy={1600} rx={360} ry={140} fill="url(#cluster)" />
        {/* volante */}
        <path d="M 170,1920 Q 200,1640 540,1620 Q 880,1640 910,1920" fill="none" stroke="#08090c" strokeWidth={70} />
        <path d="M 196,1920 Q 222,1668 540,1650 Q 858,1668 884,1920" fill="none" stroke="#1c2029" strokeWidth={6} opacity={0.6} />
      </svg>
    </AbsoluteFill>
  );
};

/** Viñeta + grano sutil (determinista por fotograma). */
export const Grade: React.FC<{ grain?: number; vignette?: number }> = ({ grain = 0.06, vignette = 0.55 }) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <AbsoluteFill
        style={{
          background: `radial-gradient(90% 62% at 50% 45%, rgba(0,0,0,0) 55%, rgba(0,0,0,${vignette}) 100%)`,
        }}
      />
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0, opacity: grain, mixBlendMode: "overlay" }}>
        <filter id={`grain${frame}`}>
          <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" seed={frame % 61} />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter={`url(#grain${frame})`} />
      </svg>
    </AbsoluteFill>
  );
};

/** Degradado inferior para que los subtítulos siempre se lean. */
export const CaptionScrim: React.FC<{ strength?: number }> = ({ strength = 0.75 }) => (
  <AbsoluteFill
    style={{
      pointerEvents: "none",
      background: `linear-gradient(180deg, rgba(0,0,0,0) 58%, rgba(0,0,0,${strength * 0.75}) 68%, rgba(0,0,0,${strength}) 80%, rgba(0,0,0,${strength * 0.6}) 100%)`,
    }}
  />
);
