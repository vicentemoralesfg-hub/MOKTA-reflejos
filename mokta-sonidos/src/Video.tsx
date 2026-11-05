import React from "react";
import { Audio } from "@remotion/media";
import { AbsoluteFill, Sequence, interpolate, staticFile } from "remotion";
import { CTA_DURACION, HOOK_DURACION, RONDAS, TOTAL, inicioRonda, rondaDuracion, tiempos } from "./config";
import { Gancho } from "./scenes/Gancho";
import { RondaEscena } from "./scenes/RondaEscena";
import { Cierre } from "./scenes/Cierre";

const MUSICA_BASE = 0.16;

/**
 * Música solo de fondo en gancho, títulos y cuenta. Se apaga por completo mientras suena
 * cada motor y durante la revelación, donde solo se escucha el "correcto".
 */
const volumenMusica = (f: number) => {
  let v = MUSICA_BASE;
  RONDAS.forEach((r, i) => {
    const T = tiempos(r);
    const ini = inicioRonda(i);
    const motor = interpolate(f, [ini + T.sonido - 10, ini + T.sonido, ini + T.sonidoFin, ini + T.sonidoFin + 10], [0, 1, 1, 0], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });
    const revela = interpolate(f, [ini + T.revela - 6, ini + T.revela, ini + T.fin - 4, ini + T.fin + 8], [0, 1, 1, 0], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });
    v = Math.min(v, MUSICA_BASE * (1 - Math.max(motor, revela)));
  });
  const fadeIn = interpolate(f, [0, 12], [0.4, 1], { extrapolateRight: "clamp" });
  const fadeOut = interpolate(f, [TOTAL - 30, TOTAL - 2], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
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
