import React from "react";
import { AbsoluteFill, Series, staticFile } from "remotion";
import { Audio } from "@remotion/media";
import { BEATS } from "./timeline";
import { SCENES } from "./scenes";
import { Grain, Vignette } from "./components/Overlays";

/**
 * Composición principal: escenas en serie (cortes secos, el ritmo lo marca el sonido)
 * + grano y viñeta globales + pista de audio generada desde la misma timeline.json.
 */
export const MitoReel: React.FC<{ audio?: string | null }> = ({ audio = "audio/mix.wav" }) => (
  <AbsoluteFill style={{ backgroundColor: "#04060B" }}>
    <Series>
      {BEATS.map((b) => {
        const Scene = SCENES[b.id];
        return (
          <Series.Sequence key={b.id} name={b.id} durationInFrames={b.duration}>
            {Scene ? <Scene /> : null}
          </Series.Sequence>
        );
      })}
    </Series>
    <Vignette />
    <Grain />
    {audio ? <Audio src={staticFile(audio)} /> : null}
  </AbsoluteFill>
);
