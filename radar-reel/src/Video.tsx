import React from "react";
import { AbsoluteFill, Sequence, staticFile } from "remotion";
import { Audio } from "@remotion/media";
import { SHOTS } from "./timeline";
import { Shot } from "./Shot";
import { Captions } from "./hud/Captions";

/**
 * Video completo. Cortes secos; el último fotograma corta directo y, al repetirse,
 * el siguiente es el primer cuadro (¿LA VES?): loop sin costura.
 */
export const Video: React.FC<{ subtitles: boolean; withAudio?: boolean }> = ({ subtitles, withAudio = true }) => (
  <AbsoluteFill style={{ backgroundColor: "#0b1730" }}>
    {SHOTS.map((s) => (
      <Sequence key={s.id} name={s.id} from={s.from} durationInFrames={s.duration} premountFor={10}>
        <Shot id={s.id} />
      </Sequence>
    ))}
    {subtitles ? <Captions /> : null}
    {withAudio ? <Audio src={staticFile("audio/mix.wav")} /> : null}
  </AbsoluteFill>
);
