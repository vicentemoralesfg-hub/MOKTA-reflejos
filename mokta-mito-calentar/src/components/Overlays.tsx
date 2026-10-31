import React from "react";
import { AbsoluteFill, Img, staticFile, useCurrentFrame } from "remotion";
import { rand } from "../lib/anim";

/** Grano de película: textura de ruido grande desplazada al azar cada 2 fotogramas. */
export const Grain: React.FC<{ opacity?: number }> = ({ opacity = 0.07 }) => {
  const f = useCurrentFrame();
  const k = Math.floor(f / 2);
  const x = -Math.floor(rand(k * 3.1) * 512);
  const y = -Math.floor(rand(k * 7.7) * 512);
  return (
    <AbsoluteFill style={{ overflow: "hidden", mixBlendMode: "overlay", opacity, pointerEvents: "none" }}>
      <Img src={staticFile("tex/grain.png")} style={{ position: "absolute", left: x, top: y, width: 1600, height: 2440 }} />
    </AbsoluteFill>
  );
};

export const Vignette: React.FC<{ strength?: number }> = ({ strength = 0.55 }) => (
  <AbsoluteFill
    style={{
      background: `radial-gradient(ellipse 85% 70% at 50% 48%, rgba(0,0,0,0) 55%, rgba(0,0,0,${strength}) 100%)`,
      pointerEvents: "none",
    }}
  />
);

/** Destello que decae desde el fotograma `at`. */
export const Flash: React.FC<{ at: number; color?: string; dur?: number; peak?: number }> = ({
  at,
  color = "#ffffff",
  dur = 8,
  peak = 0.85,
}) => {
  const f = useCurrentFrame();
  const k = f - at;
  if (k < 0 || k > dur) return null;
  const o = peak * Math.pow(1 - k / dur, 2);
  return <AbsoluteFill style={{ background: color, opacity: o, mixBlendMode: "screen", pointerEvents: "none" }} />;
};

/** Nieve / partículas heladas en 3 capas de profundidad (deterministas). */
export const Snow: React.FC<{ count?: number; opacity?: number; wind?: number; speed?: number }> = ({
  count = 70,
  opacity = 0.8,
  wind = -0.6,
  speed = 1,
}) => {
  const f = useCurrentFrame();
  const flakes = [];
  for (let i = 0; i < count; i++) {
    const layer = i % 3; // 0 lejos, 2 cerca
    const size = [3, 5, 9][layer] * (0.7 + rand(i * 5.3) * 0.6);
    const v = [1.1, 1.9, 3.2][layer] * speed;
    const x0 = rand(i * 1.7) * 1180 - 50;
    const y0 = rand(i * 3.9) * 2000;
    const y = ((y0 + f * v) % 2050) - 60;
    const x = x0 + f * wind * (layer + 1) * 0.4 + Math.sin((f + i * 13) / (22 + layer * 7)) * (6 + layer * 4);
    const xx = (((x % 1180) + 1180) % 1180) - 50;
    flakes.push(
      <div
        key={i}
        style={{
          position: "absolute",
          left: xx,
          top: y,
          width: size,
          height: size,
          borderRadius: "50%",
          background: "rgba(235,246,255,0.95)",
          opacity: [0.35, 0.6, 0.85][layer],
          filter: layer === 2 ? "blur(2.5px)" : layer === 0 ? "blur(0.5px)" : "blur(1px)",
        }}
      />,
    );
  }
  return <AbsoluteFill style={{ opacity, pointerEvents: "none" }}>{flakes}</AbsoluteFill>;
};

/** Escarcha (textura procedural) — `clear` 0..1 la despeja desde abajo (desempañador). */
export const FrostLayer: React.FC<{ clear?: number; opacity?: number; style?: React.CSSProperties }> = ({
  clear = 0,
  opacity = 1,
  style,
}) => {
  const edge = 100 - clear * 115; // % desde arriba donde termina la escarcha
  const mask = `linear-gradient(180deg, #000 0%, #000 ${Math.max(0, edge - 12)}%, rgba(0,0,0,0) ${Math.max(0, edge + 4)}%)`;
  return (
    <AbsoluteFill style={{ opacity, ...style }}>
      <Img
        src={staticFile("tex/frost.png")}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          WebkitMaskImage: mask,
          maskImage: mask,
        }}
      />
    </AbsoluteFill>
  );
};
