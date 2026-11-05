import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { Background, Tint } from "./Background";
import { EASE_OUT, shake } from "../lib/anim";

/**
 * Envoltorio de cada escena: fondo, entrada con "golpe" de cámara (zoom + desenfoque breve),
 * deriva lenta de cámara durante la escena, sacudidas en los impactos y destello de corte.
 */
export const SceneShell: React.FC<{
  children: React.ReactNode;
  tint?: Tint;
  glow?: number;
  shakes?: { at: number; amp?: number }[];
  flash?: number[];
  enter?: "punch" | "none";
}> = ({ children, tint = "neutral", glow, shakes = [], flash = [], enter = "punch" }) => {
  const f = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const s = shakes.reduce(
    (acc, k) => {
      const v = shake(f, k.at, k.amp ?? 18);
      return { x: acc.x + v.x, y: acc.y + v.y };
    },
    { x: 0, y: 0 },
  );
  const enterScale = enter === "punch" ? interpolate(f, [0, 8], [1.07, 1], { extrapolateRight: "clamp", easing: EASE_OUT }) : 1;
  const drift = 1 + 0.025 * (f / durationInFrames);
  const blur = enter === "punch" ? interpolate(f, [0, 5], [9, 0], { extrapolateRight: "clamp" }) : 0;
  const flashO = flash.reduce((a, at) => Math.max(a, interpolate(f - at, [0, 1, 6], [0, 0.42, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })), 0);
  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <Background tint={tint} glow={glow} />
      <AbsoluteFill
        style={{
          scale: String(enterScale * drift),
          translate: `${s.x}px ${s.y}px`,
          filter: blur > 0.3 ? `blur(${blur}px)` : undefined,
        }}
      >
        {children}
      </AbsoluteFill>
      {flashO > 0 ? <AbsoluteFill style={{ background: "#fff", opacity: flashO }} /> : null}
    </AbsoluteFill>
  );
};

/** Bloque posicionado en coordenadas absolutas del lienzo 1080×1920, centrado horizontalmente. */
export const At: React.FC<{ top: number; children: React.ReactNode; style?: React.CSSProperties }> = ({ top, children, style }) => (
  <div style={{ position: "absolute", left: 0, right: 0, top, display: "flex", flexDirection: "column", alignItems: "center", ...style }}>
    {children}
  </div>
);
