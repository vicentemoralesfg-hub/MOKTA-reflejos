import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";

const TINTS = {
  neutral: "127,211,255",
  red: "255,59,59",
  green: "43,227,138",
  yellow: "255,200,61",
} as const;

export type Tint = keyof typeof TINTS;

/** Fondo de la marca: negro tinta, resplandor de color por escena, retícula técnica que se desplaza y viñeta. */
export const Background: React.FC<{ tint?: Tint; glow?: number; gridSpeed?: number }> = ({
  tint = "neutral",
  glow = 0.28,
  gridSpeed = 0.6,
}) => {
  const f = useCurrentFrame();
  const c = TINTS[tint];
  const pulse = 1 + 0.06 * Math.sin(f / 14);
  return (
    <AbsoluteFill style={{ backgroundColor: "#05070B", overflow: "hidden" }}>
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse 85% 55% at 50% 30%, rgba(${c},${glow * pulse}) 0%, rgba(${c},0.06) 45%, rgba(0,0,0,0) 75%)`,
        }}
      />
      <AbsoluteFill
        style={{
          opacity: 0.55,
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.045) 2px, transparent 2px), linear-gradient(90deg, rgba(255,255,255,0.045) 2px, transparent 2px)",
          backgroundSize: "90px 90px",
          backgroundPosition: `0px ${(f * gridSpeed) % 90}px`,
          maskImage: "radial-gradient(ellipse 80% 60% at 50% 40%, black 30%, transparent 80%)",
        }}
      />
      <AbsoluteFill
        style={{
          background: "radial-gradient(ellipse 120% 80% at 50% 45%, rgba(0,0,0,0) 55%, rgba(0,0,0,0.75) 100%)",
        }}
      />
    </AbsoluteFill>
  );
};
