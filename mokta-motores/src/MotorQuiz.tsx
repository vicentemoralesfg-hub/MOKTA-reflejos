import React from "react";
import { AbsoluteFill, Series, staticFile } from "remotion";
import { Audio } from "@remotion/media";
import { CTA_DURATION, HOOK_DURATION, ROUNDS, roundDuration } from "./config";
import { Hook } from "./scenes/Hook";
import { RoundScene } from "./scenes/RoundScene";
import { Cta } from "./scenes/Cta";

/**
 * Composición principal. Cortes secos entre escenas: el ritmo lo marca el sonido.
 * La pista (motores reales + diseño sonoro mínimo) se genera con scripts/build_audio.py
 * desde la misma quiz.json, así que la sincronía es exacta al fotograma.
 */
export const MotorQuiz: React.FC<{ withAudio?: boolean }> = ({ withAudio = true }) => (
  <AbsoluteFill style={{ backgroundColor: "#040509" }}>
    <Series>
      <Series.Sequence name="Gancho" durationInFrames={HOOK_DURATION}>
        <Hook />
      </Series.Sequence>
      {ROUNDS.map((r, i) => (
        <Series.Sequence key={r.id} name={`Ronda ${i + 1} · ${r.answer}`} durationInFrames={roundDuration(r)}>
          <RoundScene index={i} />
        </Series.Sequence>
      ))}
      <Series.Sequence name="Cierre" durationInFrames={CTA_DURATION}>
        <Cta />
      </Series.Sequence>
    </Series>
    {withAudio ? <Audio src={staticFile("audio/soundtrack.wav")} /> : null}
  </AbsoluteFill>
);
