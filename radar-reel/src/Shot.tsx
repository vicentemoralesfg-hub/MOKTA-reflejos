import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import { FPS, HEIGHT, ShotId, WIDTH, shotById } from "./timeline";
import { SHOT_FNS } from "./shots";
import { World, projectToScreen } from "./world/World";
import { Pill } from "./hud/Pill";
import { Speedometer } from "./hud/Speedometer";
import { BigCounter, PlatePanel, Reticle, Ring } from "./hud/Overlays";

/** Un plano: mundo 3D + etiquetas HUD proyectadas con la misma cámara. */
export const Shot: React.FC<{ id: ShotId }> = ({ id }) => {
  const frame = useCurrentFrame();
  const d = shotById(id).duration / FPS;
  const t = frame / FPS;
  const s = SHOT_FNS[id](t, d);
  const camSpec = s.world.cam;

  return (
    <AbsoluteFill style={{ backgroundColor: "#0b1730" }}>
      <ThreeCanvas
        width={WIDTH}
        height={HEIGHT}
        flat
        gl={{ antialias: true, logarithmicDepthBuffer: true, preserveDrawingBuffer: true }}
        camera={{ fov: camSpec.fov, near: 0.3, far: 30000, position: camSpec.pos }}
        style={{ position: "absolute", inset: 0 }}
      >
        <World state={s.world} />
      </ThreeCanvas>

      {/* viñeta suave: centra la mirada sin oscurecer el cuadro */}
      <AbsoluteFill style={{ background: "radial-gradient(90% 62% at 50% 48%, rgba(0,0,0,0) 60%, rgba(2,6,16,0.45) 100%)", pointerEvents: "none" }} />

      {s.reticle
        ? (() => {
            const p = projectToScreen(camSpec, s.reticle.at);
            return <Reticle x={p.x} y={p.y} w={s.reticle.w} h={s.reticle.h} opacity={s.reticle.opacity} />;
          })()
        : null}

      {s.ring
        ? (() => {
            const p = projectToScreen(camSpec, s.ring.at);
            return (
              <>
                <Ring x={p.x} y={p.y} r={s.ring.r} opacity={s.ring.opacity} />
                {s.ring.label ? (
                  <Pill p={{ text: s.ring.label, x: p.x, y: p.y - s.ring.r - 20, leader: 0, tone: "red", size: "lg", opacity: s.ring.opacity, dot: false }} />
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
      {s.plates ? <PlatePanel farOpacity={s.plates.far} nearOpacity={s.plates.near} split={s.plates.split} /> : null}
      {s.speed != null ? <Speedometer kmh={s.speed} /> : null}
    </AbsoluteFill>
  );
};
