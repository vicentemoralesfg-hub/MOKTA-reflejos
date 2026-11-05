import React from "react";
import { useAudioData, visualizeAudio } from "@remotion/media-utils";
import { staticFile } from "remotion";
import { COLORS, FPS } from "../config";

const BARRAS = 28;

/** Barras que reaccionan al audio real del motor + ícono de parlante. */
export const Ecualizador: React.FC<{
  src: string;
  /** fotograma relativo al inicio del sonido */
  frame: number;
  activo: boolean;
  color: string;
  color2: string;
}> = ({ src, frame, activo, color, color2 }) => {
  const audioData = useAudioData(staticFile(src));
  let valores: number[] = new Array(BARRAS).fill(0);
  if (audioData && activo && frame >= 0) {
    const espectro = visualizeAudio({ fps: FPS, frame, audioData, numberOfSamples: 64, optimizeFor: "speed" });
    // mitad de barras con el espectro (graves al centro), espejada hacia ambos lados
    const mitad = new Array(BARRAS / 2).fill(0).map((_, i) => {
      const v = espectro[Math.min(espectro.length - 1, Math.floor(i * 2.2) + 1)] ?? 0;
      return Math.min(1, Math.pow(v * 9, 0.6));
    });
    valores = [...[...mitad].reverse(), ...mitad];
  }
  const anchoBarra = 16;
  const sep = 10;
  const total = BARRAS * anchoBarra + (BARRAS - 1) * sep;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 34 }}>
      {/* parlante */}
      <svg width={120} height={120} viewBox="0 0 100 100" style={{ filter: `drop-shadow(0 0 16px ${color})` }}>
        <path d="M14 38 H32 L56 18 V82 L32 62 H14 Z" fill={COLORS.white} />
        <path d="M66 34 Q76 50 66 66" stroke={color} strokeWidth={8} fill="none" strokeLinecap="round" />
        <path d="M76 24 Q92 50 76 76" stroke={color2} strokeWidth={8} fill="none" strokeLinecap="round" />
      </svg>
      <div style={{ position: "relative", width: total, height: 170, display: "flex", alignItems: "center", gap: sep }}>
        {valores.map((v, i) => (
          <div
            key={i}
            style={{
              width: anchoBarra,
              height: 14 + v * 156,
              borderRadius: 8,
              background: `linear-gradient(180deg, ${color2}, ${color})`,
              boxShadow: v > 0.3 ? `0 0 14px ${color}` : "none",
            }}
          />
        ))}
      </div>
    </div>
  );
};
