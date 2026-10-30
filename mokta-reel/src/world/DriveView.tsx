import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import { RoadWorld, RoadWorldProps, CAM_FOV } from "./RoadWorld";

/** Estrellas tenues fijas (deterministas). */
const STARS = Array.from({ length: 70 }, (_, i) => {
  const r = (n: number) => {
    const x = Math.sin(n * 91.7 + i * 13.3) * 43758.5453;
    return x - Math.floor(x);
  };
  return { x: r(1) * 1080, y: r(2) * 760, o: 0.15 + r(3) * 0.45, s: r(4) > 0.9 ? 2.2 : 1.4 };
});

const Sky: React.FC = () => (
  <AbsoluteFill
    style={{
      background:
        "radial-gradient(90% 16% at 68% 47.4%, rgba(90,80,110,0.30) 0%, rgba(0,0,0,0) 70%), linear-gradient(180deg, #010207 0%, #030714 28%, #0a1426 43%, #13203a 47.5%, #0a0f1a 49%, #05080f 55%)",
    }}
  >
    <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
      {STARS.map((st, i) => (
        <circle key={i} cx={st.x} cy={st.y} r={st.s / 2} fill="#cfe2ff" opacity={st.o} />
      ))}
    </svg>
  </AbsoluteFill>
);

/** Etalonaje: viñeta + grano fílmico sutil (cambia por fotograma, determinista). */
export const Grade: React.FC<{ grain?: number }> = ({ grain = 0.07 }) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(85% 60% at 50% 46%, rgba(0,0,0,0) 55%, rgba(0,0,0,0.55) 100%)",
        }}
      />
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0, opacity: grain, mixBlendMode: "overlay" }}>
        <filter id={`g${frame}`}>
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed={frame % 97} />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter={`url(#g${frame})`} />
      </svg>
    </AbsoluteFill>
  );
};

export const DriveView: React.FC<RoadWorldProps & { children?: React.ReactNode }> = ({
  children,
  ...world
}) => {
  const { width, height } = useVideoConfig();
  return (
    <AbsoluteFill style={{ backgroundColor: "#020308" }}>
      <Sky />
      <ThreeCanvas
        width={width}
        height={height}
        gl={{ antialias: true, alpha: true, preserveDrawingBuffer: true }}
        camera={{ fov: CAM_FOV, near: 0.1, far: 2000, position: [1.75, 1.22, 0] }}
        style={{ position: "absolute", inset: 0 }}
      >
        <RoadWorld {...world} />
      </ThreeCanvas>
      <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(0,0,0,0) 44%, rgba(20,32,56,0.22) 47.4%, rgba(0,0,0,0) 50.5%)", pointerEvents: "none" }} />
      <Grade />
      {children}
    </AbsoluteFill>
  );
};
