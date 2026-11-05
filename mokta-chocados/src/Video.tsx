import React from "react";
import { AbsoluteFill, Sequence, interpolate, staticFile, useCurrentFrame } from "remotion";
import { Audio } from "@remotion/media";
import { EASE_OUT } from "./anim";
import { SCENES, SceneId } from "./timeline";
import { S01Hook } from "./scenes/S01Hook";
import { S02Setup } from "./scenes/S02Setup";
import { S03Green } from "./scenes/S03Green";
import { S04Yellow } from "./scenes/S04Yellow";
import { S05Red } from "./scenes/S05Red";
import { S06Airbags } from "./scenes/S06Airbags";
import { S07Flood } from "./scenes/S07Flood";
import { S08Compare } from "./scenes/S08Compare";
import { S09Checklist } from "./scenes/S09Checklist";
import { S10Rule } from "./scenes/S10Rule";

export const SCENE_COMPONENTS: Record<SceneId, React.FC> = {
  s01: S01Hook,
  s02: S02Setup,
  s03: S03Green,
  s04: S04Yellow,
  s05: S05Red,
  s06: S06Airbags,
  s07: S07Flood,
  s08: S08Compare,
  s09: S09Checklist,
  s10: S10Rule,
};

/** Entrada de escena: "golpe de cámara" (zoom que se asienta + destello + barra diagonal). */
const Enter: React.FC<{ children: React.ReactNode; first: boolean }> = ({ children, first }) => {
  const f = useCurrentFrame();
  if (first) return <>{children}</>;
  const k = interpolate(f, [0, 9], [0, 1], { extrapolateRight: "clamp", easing: EASE_OUT });
  const bar = interpolate(f, [0, 7], [-1400, 1600], { extrapolateRight: "clamp" });
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ scale: 1.1 - 0.1 * k, translate: `0px ${(1 - k) * 60}px` }}>{children}</AbsoluteFill>
      {f < 8 && (
        <div style={{ position: "absolute", left: -400, top: bar, width: 1900, height: 260, background: "linear-gradient(90deg, rgba(255,255,255,0), rgba(255,255,255,0.75), rgba(255,255,255,0))", rotate: "-18deg" }} />
      )}
      <AbsoluteFill style={{ background: "#fff", opacity: interpolate(f, [0, 4], [0.45, 0], { extrapolateRight: "clamp" }), pointerEvents: "none" }} />
    </AbsoluteFill>
  );
};

export const Video: React.FC<{ withAudio?: boolean }> = ({ withAudio = true }) => (
  <AbsoluteFill style={{ background: "#060814" }}>
    {SCENES.map((s, i) => {
      const C = SCENE_COMPONENTS[s.id];
      return (
        <Sequence key={s.id} from={s.from} durationInFrames={s.duration} name={s.id} premountFor={30}>
          <Enter first={i === 0}>
            <C />
          </Enter>
        </Sequence>
      );
    })}
    {withAudio && <Audio src={staticFile("audio/soundtrack.wav")} />}
  </AbsoluteFill>
);
