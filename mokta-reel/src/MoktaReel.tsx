import React from "react";
import { AbsoluteFill, Series, staticFile } from "remotion";
import { Audio } from "@remotion/media";
import { CTA_DURATION, HOOK_DURATION, REVEAL_DURATION, ROUNDS, roundDuration } from "./config";
import { Hook } from "./scenes/Hook";
import { RoundScene } from "./scenes/RoundScene";
import { Cta, Reveal } from "./scenes/Outro";

/**
 * Composición principal. Cortes secos entre escenas (sin fundidos a negro):
 * el ritmo lo marca el sonido. La pista se genera con scripts/gen_audio.py
 * a partir de la misma timeline.json, así que la sincronía es exacta.
 */
export const MoktaReel: React.FC<{ withAudio?: boolean }> = ({ withAudio = true }) => (
  <AbsoluteFill style={{ backgroundColor: "#020308" }}>
    <Series>
      <Series.Sequence name="Gancho" durationInFrames={HOOK_DURATION}>
        <Hook />
      </Series.Sequence>
      {ROUNDS.map((r, i) => (
        <Series.Sequence key={r.id} name={`Ronda ${r.speedKmh}`} durationInFrames={roundDuration(r)}>
          <RoundScene index={i} />
        </Series.Sequence>
      ))}
      <Series.Sequence name="Revelación" durationInFrames={REVEAL_DURATION}>
        <Reveal />
      </Series.Sequence>
      <Series.Sequence name="CTA" durationInFrames={CTA_DURATION}>
        <Cta />
      </Series.Sequence>
    </Series>
    {withAudio ? <Audio src={staticFile("audio/soundtrack.wav")} /> : null}
  </AbsoluteFill>
);
