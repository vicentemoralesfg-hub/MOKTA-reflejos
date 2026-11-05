import React from "react";
import { Audio } from "@remotion/media";
import { AbsoluteFill, Sequence, interpolate, staticFile } from "remotion";
import { CTA_DURACION, HOOK_DURACION, RONDAS, TOTAL, inicioRonda, rondaDuracion, tiempos } from "./config";
import { Gancho } from "./scenes/Gancho";
import { RondaEscena } from "./scenes/RondaEscena";
import { Cierre } from "./scenes/Cierre";

const MUSICA_BASE = 0.16;

/** La música baja casi a cero mientras suena cada motor, para que se escuche limpio. */
const volumenMusica = (f: number) => {
  let v = MUSICA_BASE;
  RONDAS.forEach((r, i) => {
    const a = inicioRonda(i) + tiempos(r).sonido;
    const b = inicioRonda(i) + tiempos(r).sonidoFin;
    const duck = interpolate(f, [a - 8, a, b, b + 10], [0, 1, 1, 0], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });
    v = Math.min(v, MUSICA_BASE * (1 - duck * 0.94));
  });
  const fadeIn = interpolate(f, [0, 12], [0.4, 1], { extrapolateRight: "clamp" });
  const fadeOut = interpolate(f, [TOTAL - 40, TOTAL - 2], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return v * fadeIn * fadeOut;
};

export const Video: React.FC<{ conAudio: boolean }> = ({ conAudio }) => (
  <AbsoluteFill style={{ backgroundColor: "#0B0820" }}>
    <Sequence name="Gancho" durationInFrames={HOOK_DURACION}>
      <Gancho conAudio={conAudio} />
    </Sequence>
    {RONDAS.map((r, i) => (
      <Sequence key={r.numero} name={`Ronda ${r.numero}`} from={inicioRonda(i)} durationInFrames={rondaDuracion(r)}>
        <RondaEscena ronda={r} conAudio={conAudio} />
      </Sequence>
    ))}
    <Sequence name="Cierre" from={inicioRonda(RONDAS.length)} durationInFrames={CTA_DURACION}>
      <Cierre conAudio={conAudio} />
    </Sequence>
    {conAudio ? <Audio src={staticFile("musica/need_for_speed.mp3")} volume={volumenMusica} /> : null}
  </AbsoluteFill>
);
