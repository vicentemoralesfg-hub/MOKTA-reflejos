import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { COLORS } from "../config";

/**
 * Fondo claro y vivo: papel cálido, grandes manchas de color que flotan,
 * rayas de velocidad blancas, trama de puntos y confeti geométrico.
 */
export const Fondo: React.FC<{ acento: string; acento2: string; velocidad?: number }> = ({
  acento,
  acento2,
  velocidad = 1,
}) => {
  const f = useCurrentFrame();
  const t = f / 30;
  const x1 = 18 + Math.sin(t * 0.8) * 14;
  const y1 = 18 + Math.cos(t * 0.6) * 8;
  const x2 = 84 + Math.cos(t * 0.7) * 12;
  const y2 = 84 + Math.sin(t * 0.5) * 8;
  const x3 = 80 + Math.sin(t * 0.5 + 1) * 10;
  const y3 = 30 + Math.cos(t * 0.9) * 8;
  const desplaz = (f * 9 * velocidad) % 220;

  const formas = [
    { x: 7, y: 9, s: 46, c: acento2, tipo: "circ" },
    { x: 90, y: 6, s: 38, c: acento, tipo: "tri" },
    { x: 6, y: 93, s: 52, c: acento, tipo: "tri" },
    { x: 88, y: 95, s: 40, c: acento2, tipo: "circ" },
    { x: 94, y: 48, s: 30, c: COLORS.violet, tipo: "cuad" },
    { x: 4, y: 52, s: 28, c: COLORS.cyan, tipo: "cuad" },
  ];

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.paper, overflow: "hidden" }}>
      <AbsoluteFill
        style={{
          background: `radial-gradient(55% 32% at ${x1}% ${y1}%, ${acento}8C 0%, ${acento}00 72%),
            radial-gradient(60% 34% at ${x2}% ${y2}%, ${acento2}99 0%, ${acento2}00 72%),
            radial-gradient(40% 24% at ${x3}% ${y3}%, ${COLORS.cyan}55 0%, ${COLORS.cyan}00 70%),
            linear-gradient(165deg, #FFF3FA 0%, ${COLORS.paper} 45%, #EAF7FF 100%)`,
        }}
      />
      {/* rayas diagonales de velocidad */}
      <AbsoluteFill
        style={{
          opacity: 0.55,
          background: `repeating-linear-gradient(115deg, rgba(255,255,255,0.9) 0px, rgba(255,255,255,0.9) 10px, transparent 10px, transparent 110px)`,
          backgroundPosition: `${desplaz}px 0px`,
          backgroundSize: "200% 200%",
        }}
      />
      {/* trama de puntos */}
      <AbsoluteFill
        style={{
          opacity: 0.12,
          backgroundImage: `radial-gradient(${COLORS.ink} 2px, transparent 2.4px)`,
          backgroundSize: "30px 30px",
          maskImage: "linear-gradient(180deg, black 0%, transparent 22%, transparent 78%, black 100%)",
        }}
      />
      {/* confeti geométrico */}
      {formas.map((s, i) => {
        const flot = Math.sin(t * 1.4 + i) * 10;
        const rot = t * 25 * (i % 2 ? 1 : -1) + i * 30;
        const common: React.CSSProperties = {
          position: "absolute",
          left: `${s.x}%`,
          top: `${s.y}%`,
          translate: `-50% calc(-50% + ${flot}px)`,
          rotate: `${rot}deg`,
        };
        if (s.tipo === "circ")
          return (
            <div key={i} style={{ ...common, width: s.s, height: s.s, borderRadius: 999, border: `7px solid ${s.c}` }} />
          );
        if (s.tipo === "cuad")
          return <div key={i} style={{ ...common, width: s.s, height: s.s, background: s.c, borderRadius: 6 }} />;
        return (
          <svg key={i} width={s.s} height={s.s} viewBox="0 0 10 10" style={common}>
            <path d="M5 0 L10 9 L0 9 Z" fill={s.c} />
          </svg>
        );
      })}
    </AbsoluteFill>
  );
};
