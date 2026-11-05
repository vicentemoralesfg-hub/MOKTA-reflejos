import React from "react";
import { AbsoluteFill, Img, random, staticFile, useCurrentFrame } from "remotion";
import { lerp, ramp } from "../lib/anim";
import { RewindArrows } from "./Props";

/** Fondo vivo: degradado + manchas de luz que se desplazan lento + rayos. */
export const Stage: React.FC<{
  from: string;
  to: string;
  glowA?: string;
  glowB?: string;
  angle?: number;
  rays?: boolean;
  children?: React.ReactNode;
}> = ({ from, to, glowA = "#ff2e88", glowB = "#00e5ff", angle = 160, rays = false, children }) => {
  const f = useCurrentFrame();
  const ax = 30 + Math.sin(f / 47) * 18;
  const ay = 22 + Math.cos(f / 61) * 10;
  const bx = 72 + Math.cos(f / 53) * 16;
  const by = 78 + Math.sin(f / 41) * 10;
  return (
    <AbsoluteFill style={{ background: `linear-gradient(${angle}deg, ${from}, ${to})`, overflow: "hidden" }}>
      <AbsoluteFill
        style={{
          background: `radial-gradient(circle at ${ax}% ${ay}%, ${glowA}66 0%, transparent 42%), radial-gradient(circle at ${bx}% ${by}%, ${glowB}55 0%, transparent 45%)`,
        }}
      />
      {rays && (
        <AbsoluteFill
          style={{
            background: `repeating-conic-gradient(from ${f * 0.25}deg at 50% 40%, #ffffff10 0deg 6deg, transparent 6deg 18deg)`,
            maskImage: "radial-gradient(circle at 50% 40%, black 0%, transparent 70%)",
          }}
        />
      )}
      {children}
    </AbsoluteFill>
  );
};

/** Empuje de cámara continuo (scale + deriva) para que ningún plano quede estático. */
export const Camera: React.FC<{
  dur: number;
  zoom?: [number, number];
  drift?: [number, number];
  shakeXY?: number[];
  origin?: string;
  children: React.ReactNode;
}> = ({ dur, zoom = [1.0, 1.08], drift = [0, 0], shakeXY = [0, 0], origin = "50% 45%", children }) => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill
      style={{
        transformOrigin: origin,
        scale: String(lerp(f, 0, dur, zoom[0], zoom[1], (x) => x)),
        translate: `${lerp(f, 0, dur, 0, drift[0], (x) => x) + shakeXY[0]}px ${lerp(f, 0, dur, 0, drift[1], (x) => x) + shakeXY[1]}px`,
      }}
    >
      {children}
    </AbsoluteFill>
  );
};

/** Entrada de escena: zoom desde 1.18 con desenfoque y destello. */
export const SceneIn: React.FC<{ children: React.ReactNode; dir?: "zoom" | "left" | "right" | "up" }> = ({ children, dir = "zoom" }) => {
  const f = useCurrentFrame();
  const k = ramp(f, 0, 9);
  const off = (1 - k) * 260;
  const tr = dir === "left" ? `${-off}px 0px` : dir === "right" ? `${off}px 0px` : dir === "up" ? `0px ${off}px` : "0px 0px";
  return (
    <AbsoluteFill
      style={{
        scale: dir === "zoom" ? String(1.18 - 0.18 * k) : "1",
        translate: tr,
        filter: k < 1 ? `blur(${(1 - k) * 14}px)` : undefined,
      }}
    >
      {children}
    </AbsoluteFill>
  );
};

/** Grano de película (textura desplazada cada fotograma). */
export const Grain: React.FC<{ opacity?: number }> = ({ opacity = 0.08 }) => {
  const f = useCurrentFrame();
  const x = Math.floor(random(`gx${f}`) * 500);
  const y = Math.floor(random(`gy${f}`) * 500);
  return (
    <AbsoluteFill style={{ opacity, mixBlendMode: "overlay", pointerEvents: "none", overflow: "hidden" }}>
      <Img src={staticFile("img/grain.png")} style={{ position: "absolute", left: -x, top: -y, width: 1600, height: 2432 }} />
    </AbsoluteFill>
  );
};

export const Vignette: React.FC<{ strength?: number }> = ({ strength = 0.55 }) => (
  <AbsoluteFill
    style={{
      background: `radial-gradient(ellipse 75% 62% at 50% 46%, transparent 55%, rgba(0,0,0,${strength}) 100%)`,
      pointerEvents: "none",
    }}
  />
);

/** Destello a pantalla completa en el fotograma `at`. */
export const Flash: React.FC<{ at: number; color?: string; dur?: number; peak?: number }> = ({ at, color = "#fff", dur = 8, peak = 0.85 }) => {
  const f = useCurrentFrame();
  if (f < at || f > at + dur) return null;
  return <AbsoluteFill style={{ background: color, opacity: peak * (1 - (f - at) / dur), mixBlendMode: "screen" }} />;
};

/** Barras de interferencia + aberración cromática (glitch) entre a y b. */
export const Glitch: React.FC<{ a: number; b: number; children: React.ReactNode }> = ({ a, b, children }) => {
  const f = useCurrentFrame();
  const on = f >= a && f <= b;
  const amt = on ? 8 + random(`g${f}`) * 22 : 0;
  if (!on) return <>{children}</>;
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ translate: `${-amt}px 0px`, filter: "drop-shadow(0 0 0 red)", opacity: 0.7, mixBlendMode: "screen" }}>
        <AbsoluteFill style={{ filter: "sepia(1) saturate(8) hue-rotate(-50deg)" }}>{children}</AbsoluteFill>
      </AbsoluteFill>
      <AbsoluteFill style={{ translate: `${amt}px 0px`, opacity: 0.7, mixBlendMode: "screen" }}>
        <AbsoluteFill style={{ filter: "sepia(1) saturate(8) hue-rotate(140deg)" }}>{children}</AbsoluteFill>
      </AbsoluteFill>
      <AbsoluteFill style={{ mixBlendMode: "normal", opacity: 0.85 }}>{children}</AbsoluteFill>
      {new Array(5).fill(0).map((_, i) => {
        const y = random(`gl${f}-${i}`) * 1920;
        const h = 6 + random(`gh${f}-${i}`) * 50;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              top: y,
              height: h,
              background: i % 2 ? "#00e5ff55" : "#ff2e8855",
              translate: `${(random(`gx${f}-${i}`) - 0.5) * 120}px 0px`,
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};

/** Barrido de brillo diagonal (reflejo sobre papel o pantalla). */
export const Shine: React.FC<{ at: number; dur?: number; radius?: number }> = ({ at, dur = 18, radius = 0 }) => {
  const f = useCurrentFrame();
  const p = lerp(f, at, at + dur, -60, 160);
  if (f < at || f > at + dur) return null;
  return (
    <AbsoluteFill
      style={{
        borderRadius: radius,
        background: `linear-gradient(110deg, transparent ${p - 20}%, rgba(255,255,255,0.55) ${p}%, transparent ${p + 20}%)`,
        mixBlendMode: "overlay",
      }}
    />
  );
};

/** Partículas brillantes flotando (bokeh). */
export const Bokeh: React.FC<{ color?: string; count?: number; seed?: string }> = ({ color = "#ffd60a", count = 18, seed = "b" }) => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      {new Array(count).fill(0).map((_, i) => {
        const x = random(`${seed}x${i}`) * 1080;
        const y0 = random(`${seed}y${i}`) * 1920;
        const s = 8 + random(`${seed}s${i}`) * 40;
        const sp = 0.4 + random(`${seed}v${i}`) * 1.4;
        const y = ((y0 - f * sp * 2) % 1920 + 1920) % 1920;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: x,
              top: y,
              width: s,
              height: s,
              borderRadius: "50%",
              background: color,
              opacity: 0.12 + random(`${seed}o${i}`) * 0.25,
              filter: `blur(${s / 5}px)`,
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};

/** Efecto rebobinado VHS. */
export const Rewind: React.FC<{ a: number; label: string }> = ({ a, label }) => {
  const f = useCurrentFrame();
  if (f < a) return null;
  const k = ramp(f, a, a + 4);
  return (
    <AbsoluteFill style={{ opacity: k }}>
      <AbsoluteFill style={{ background: "repeating-linear-gradient(0deg, rgba(255,255,255,0.08) 0 3px, transparent 3px 7px)" }} />
      {new Array(3).fill(0).map((_, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: ((f - a) * 90 + i * 640) % 1920,
            height: 40,
            background: "linear-gradient(transparent, rgba(255,255,255,0.35), transparent)",
          }}
        />
      ))}
      <div
        style={{
          position: "absolute",
          top: 1150,
          left: 0,
          right: 0,
          justifyContent: "center",
          fontFamily: "Barlow Condensed",
          fontWeight: 800,
          fontSize: 92,
          color: "#fff",
          letterSpacing: 2,
          textShadow: "4px 0 #ff2e88, -4px 0 #00e5ff",
          opacity: Math.floor(f / 4) % 2 ? 1 : 0.75,
          display: "flex",
          alignItems: "center",
          gap: 24,
        }}
      >
        <RewindArrows size={66} /> {label}
      </div>
    </AbsoluteFill>
  );
};
