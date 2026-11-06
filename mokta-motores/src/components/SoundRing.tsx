import React from "react";
import { BANDS, levelAt, spectrumAt } from "../lib/viz";

const BARS = 72;

/**
 * Visualizador circular: 72 barras radiales que responden al espectro real de la pista
 * (graves a la izquierda/derecha abajo, agudos arriba), un disco que late con el nivel
 * y, opcionalmente, el arco de la cuenta regresiva.
 */
export const SoundRing: React.FC<{
  absFrame: number;
  size?: number;
  color?: string;
  /** 0–1 progreso de la cuenta regresiva (null = sin arco). */
  countdown?: number | null;
  countdownColor?: string;
  children?: React.ReactNode;
  intensity?: number;
}> = ({ absFrame, size = 640, color = "#FF5A1F", countdown = null, countdownColor = "#FFC21A", children, intensity = 1 }) => {
  const spec = spectrumAt(absFrame);
  const lv = levelAt(absFrame) * intensity;
  const c = size / 2;
  const r0 = size * 0.3;
  const maxLen = size * 0.17;
  const discScale = 1 + lv * 0.06;
  const arcR = size * 0.485;
  const arcLen = 2 * Math.PI * arcR;

  return (
    <div style={{ position: "relative", width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ position: "absolute", inset: 0 }}>
        <defs>
          <radialGradient id="ringDisc" cx="50%" cy="45%" r="60%">
            <stop offset="0" stopColor="#1a1c24" />
            <stop offset="1" stopColor="#08090d" />
          </radialGradient>
        </defs>
        {/* barras */}
        <g>
          {Array.from({ length: BARS }).map((_, i) => {
            // espejo: la mitad derecha y la izquierda muestran las mismas bandas, graves abajo
            const half = BARS / 2;
            const k = i < half ? i : BARS - 1 - i;
            const band = Math.min(BANDS - 1, Math.floor((1 - k / half) * BANDS));
            const v = Math.min(1, (spec[band] ?? 0) * intensity);
            const len = 6 + maxLen * v;
            const a = (i / BARS) * Math.PI * 2 + Math.PI / 2 + Math.PI / BARS;
            const x1 = c + Math.cos(a) * r0;
            const y1 = c + Math.sin(a) * r0;
            const x2 = c + Math.cos(a) * (r0 + len);
            const y2 = c + Math.sin(a) * (r0 + len);
            return (
              <line
                key={i}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke={color}
                strokeOpacity={0.35 + v * 0.65}
                strokeWidth={7}
                strokeLinecap="round"
              />
            );
          })}
        </g>
        {/* aro guía */}
        <circle cx={c} cy={c} r={arcR} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={10} />
        {countdown !== null ? (
          <circle
            cx={c}
            cy={c}
            r={arcR}
            fill="none"
            stroke={countdownColor}
            strokeWidth={10}
            strokeLinecap="round"
            strokeDasharray={arcLen}
            strokeDashoffset={arcLen * countdown}
            transform={`rotate(-90 ${c} ${c})`}
            style={{ filter: `drop-shadow(0 0 12px ${countdownColor})` }}
          />
        ) : null}
      </svg>
      {/* disco central */}
      <div
        style={{
          position: "absolute",
          left: c - r0 + 10,
          top: c - r0 + 10,
          width: (r0 - 10) * 2,
          height: (r0 - 10) * 2,
          borderRadius: "50%",
          background: "radial-gradient(circle at 50% 40%, #1b1d26 0%, #07080c 100%)",
          boxShadow: `0 0 ${40 + lv * 90}px rgba(255,90,31,${0.25 + lv * 0.5}), inset 0 0 0 2px rgba(255,255,255,0.08)`,
          scale: String(discScale),
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {children}
      </div>
    </div>
  );
};
