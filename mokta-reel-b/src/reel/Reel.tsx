import React from "react";
import { AbsoluteFill, Audio, Sequence, staticFile } from "remotion";
import { Cta, Hook, Reveal } from "./Scenes";
import { RoundB } from "./RoundB";
import { LAYOUT, ROUNDS, T, roundFrames } from "./config";

export const Reel: React.FC<{ withAudio?: boolean }> = ({ withAudio = true }) => (
  <AbsoluteFill style={{ backgroundColor: "#000" }}>
    {withAudio ? <Audio src={staticFile("audio/reel.wav")} /> : null}
    <Sequence durationInFrames={T.hook.duration} name="Gancho">
      <Hook />
    </Sequence>
    {ROUNDS.map((r, i) => (
      <Sequence key={r.id} from={LAYOUT.rounds[i]} durationInFrames={roundFrames(i).duration} name={`${r.label} · ${r.speedKmh}`}>
        <RoundB index={i} />
      </Sequence>
    ))}
    <Sequence from={LAYOUT.reveal} durationInFrames={T.reveal.duration} name="Cierre">
      <Reveal />
    </Sequence>
    <Sequence from={LAYOUT.cta} durationInFrames={T.cta.duration} name="CTA">
      <Cta />
    </Sequence>
  </AbsoluteFill>
);
