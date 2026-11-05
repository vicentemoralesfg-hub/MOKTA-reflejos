import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { COLORS } from "../config";

/** Fondo vivo: base nocturna, dos focos de color que se mueven, rayas de velocidad y trama de puntos. */
export const Fondo: React.FC<{ acento: string; acento2: string; velocidad?: number }> = ({
  acento,
  acento2,
  velocidad = 1,
}) => {
  const f = useCurrentFrame();
  const t = f / 30;
  const x1 = 30 + Math.sin(t * 0.9) * 18;
  const y1 = 22 + Math.cos(t * 0.7) * 10;
  const x2 = 70 + Math.cos(t * 0.8) * 18;
  const y2 = 80 + Math.sin(t * 0.6) * 10;
  const desplaz = (f * 14 * velocidad) % 160;

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.ink, overflow: "hidden" }}>
      <AbsoluteFill
        style={{
          background: `radial-gradient(60% 40% at ${x1}% ${y1}%, ${acento}AA 0%, ${acento}00 70%),
            radial-gradient(60% 40% at ${x2}% ${y2}%, ${acento2}99 0%, ${acento2}00 70%),
            linear-gradient(160deg, ${COLORS.night} 0%, ${COLORS.ink} 55%, #24074A 100%)`,
        }}
      />
      {/* rayas diagonales de velocidad */}
      <AbsoluteFill
        style={{
          opacity: 0.16,
          background: `repeating-linear-gradient(115deg, ${COLORS.white} 0px, ${COLORS.white} 6px, transparent 6px, transparent 80px)`,
          backgroundPosition: `${desplaz}px 0px`,
          backgroundSize: "200% 200%",
        }}
      />
      {/* trama de puntos */}
      <AbsoluteFill
        style={{
          opacity: 0.22,
          backgroundImage: `radial-gradient(${COLORS.white} 1.6px, transparent 1.8px)`,
          backgroundSize: "28px 28px",
          maskImage: "linear-gradient(180deg, black 0%, transparent 30%, transparent 70%, black 100%)",
        }}
      />
      {/* viñeta */}
      <AbsoluteFill
        style={{ background: "radial-gradient(120% 80% at 50% 50%, transparent 55%, rgba(0,0,0,0.55) 100%)" }}
      />
    </AbsoluteFill>
  );
};
