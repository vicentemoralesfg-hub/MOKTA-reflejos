import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import { FPS, HEIGHT, ShotId, WIDTH, shotById } from "./timeline";
import { SHOT_FNS } from "./shots";
import { World, WorldState, projectToScreen } from "./world/World";
import { Pill } from "./hud/Pill";
import { Speedometer } from "./hud/Speedometer";
import { BigCounter, Card, Fx, Ring, Viewfinder } from "./hud/Overlays";
import { C } from "./hud/style";

/** Lienzo 3D. dpr < 1 renderiza a baja resolución y se amplía sin suavizado (pixelado real). */
const Scene: React.FC<{ state: WorldState; width: number; height: number; dpr?: number }> = ({ state, width, height, dpr = 1 }) => (
  <div className={dpr < 1 ? "pix" : undefined} style={{ position: "absolute", inset: 0 }}>
    <ThreeCanvas
      width={width}
      height={height}
      flat
      dpr={dpr}
      gl={{ antialias: true, logarithmicDepthBuffer: true, preserveDrawingBuffer: true }}
      camera={{ fov: state.cam.fov, near: 0.3, far: 30000, position: state.cam.pos }}
    >
      <World state={state} />
    </ThreeCanvas>
  </div>
);

/** Cota de medida entre dos puntos 3D (con topes en los extremos). */
const BracketLine: React.FC<{ a: { x: number; y: number }; b: { x: number; y: number }; color: string; opacity: number }> = ({ a, b, color, opacity }) => {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const len = Math.hypot(dx, dy) || 1;
  const nx = (-dy / len) * 16;
  const ny = (dx / len) * 16;
  return (
    <svg width={1080} height={1920} style={{ position: "absolute", inset: 0, opacity }}>
      <g stroke={color} strokeWidth={6} strokeLinecap="round" style={{ filter: `drop-shadow(0 0 8px ${color})` }}>
        <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} />
        <line x1={a.x - nx} y1={a.y - ny} x2={a.x + nx} y2={a.y + ny} />
        <line x1={b.x - nx} y1={b.y - ny} x2={b.x + nx} y2={b.y + ny} />
      </g>
    </svg>
  );
};

/** Un plano: mundo 3D + etiquetas HUD proyectadas con la misma cámara. */
export const Shot: React.FC<{ id: ShotId }> = ({ id }) => {
  const frame = useCurrentFrame();
  const d = shotById(id).duration / FPS;
  const t = frame / FPS;
  const s = SHOT_FNS[id](t, d);
  const camSpec = s.world.cam;

  return (
    <AbsoluteFill style={{ backgroundColor: "#0b1730" }}>
      <style>{`.pix canvas { image-rendering: pixelated; }`}</style>
      {s.split ? (
        <>
          <div style={{ position: "absolute", left: 0, top: 0, width: WIDTH, height: HEIGHT / 2, overflow: "hidden" }}>
            <Scene state={s.split.top} width={WIDTH} height={HEIGHT / 2} dpr={s.split.topDpr} />
          </div>
          <div style={{ position: "absolute", left: 0, top: HEIGHT / 2, width: WIDTH, height: HEIGHT / 2, overflow: "hidden" }}>
            <Scene state={s.split.bottom} width={WIDTH} height={HEIGHT / 2} dpr={s.split.bottomDpr} />
          </div>
          <div style={{ position: "absolute", left: 0, right: 0, top: HEIGHT / 2 - 4, height: 8, background: C.white, boxShadow: "0 0 24px rgba(0,0,0,0.8)" }} />
          <Viewfinder x0={50} y0={50} x1={1030} y1={HEIGHT / 2 - 40} opacity={1} color={C.red} />
          <Viewfinder x0={50} y0={HEIGHT / 2 + 40} x1={1030} y1={HEIGHT - 50} opacity={1} color={C.key} />
        </>
      ) : (
        <Scene state={s.world} width={WIDTH} height={HEIGHT} dpr={s.dpr} />
      )}

      {/* viñeta suave: centra la mirada sin oscurecer el cuadro */}
      <AbsoluteFill style={{ background: "radial-gradient(90% 62% at 50% 48%, rgba(0,0,0,0) 62%, rgba(2,6,16,0.4) 100%)", pointerEvents: "none" }} />

      {s.viewfinder ? <Viewfinder x0={60} y0={150} x1={1020} y1={1640} opacity={s.viewfinder} /> : null}

      {s.brackets?.map((b, i) => {
        const pa = projectToScreen(camSpec, b.a);
        const pb = projectToScreen(camSpec, b.b);
        return <BracketLine key={`b${i}`} a={pa} b={pb} color={b.color ?? C.red} opacity={b.opacity} />;
      })}

      {s.ring
        ? (() => {
            const p = projectToScreen(camSpec, s.ring.at);
            return (
              <>
                <Ring x={p.x} y={p.y} r={s.ring.r} opacity={s.ring.opacity} />
                {s.ring.label ? (
                  <Pill p={{ text: s.ring.label, x: p.x, y: p.y - s.ring.r - 90, tone: "red", size: "story", opacity: s.ring.opacity, dot: false }} />
                ) : null}
                {s.ring.sub ? (
                  <Pill p={{ text: s.ring.sub, x: p.x, y: p.y - s.ring.r - 230, tone: "key", size: "story", opacity: s.ring.opacity, dot: false }} />
                ) : null}
              </>
            );
          })()
        : null}

      {s.pills?.map((a, i) => {
        const p = projectToScreen(camSpec, a.at);
        if (!p.visible) return null;
        const { at: _at, lift = 0, ...rest } = a;
        void _at;
        return <Pill key={i} p={{ ...rest, x: p.x, y: p.y - (rest.leader ? 0 : lift) }} />;
      })}

      {s.screenPills?.map((p, i) => <Pill key={`s${i}`} p={p} />)}

      {s.counter ? <BigCounter {...s.counter} /> : null}
      {s.card ? <Card {...s.card} /> : null}
      {s.speed != null ? <Speedometer kmh={s.speed} big={s.speedBig} /> : null}
      {s.fx ? <Fx {...s.fx} /> : null}
    </AbsoluteFill>
  );
};
