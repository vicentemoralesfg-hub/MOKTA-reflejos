import React from "react";
import { AbsoluteFill, Series, staticFile, useCurrentFrame } from "remotion";
import { Audio } from "@remotion/media";
import { BEATS } from "./timeline";
import { SCENES } from "./scenes";
import { Grain, Vignette } from "./components/Overlays";

/** Empuje de cámara lento y continuo: ningún cuadro queda quieto mientras habla la voz. */
const Drift: React.FC<{ duration: number; children: React.ReactNode }> = ({ duration, children }) => {
  const f = useCurrentFrame();
  const k = Math.min(1, Math.max(0, f / duration));
  return <AbsoluteFill style={{ transform: `scale(${1 + 0.04 * k})`, transformOrigin: "50% 42%" }}>{children}</AbsoluteFill>;
};

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
            {Scene ? (
              <Drift duration={b.duration}>
                <Scene />
              </Drift>
            ) : null}
          </Series.Sequence>
        );
      })}
    </Series>
    <Vignette />
    <Grain />
    {audio ? <Audio src={staticFile(audio)} /> : null}
  </AbsoluteFill>
);
