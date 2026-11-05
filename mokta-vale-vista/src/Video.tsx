import React from "react";
import { AbsoluteFill, Sequence, staticFile, useCurrentFrame } from "remotion";
import { Audio } from "@remotion/media";
import { Grain, Vignette } from "./components/Fx";
import { Captions } from "./components/Text";
import { fr, SCENES, SceneId } from "./timing";
import { Documento, Entrega, Lunes } from "./scenes/Story2";
import { Gancho, Publicacion, Viernes } from "./scenes/Story1";
import { AntesDe, Explicacion, Paso1, Paso2, Paso3 } from "./scenes/Teach";
import { Cierre, Foto, Regla } from "./scenes/Close";

export const SCENE_COMPONENTS: Record<SceneId, React.FC> = {
  Gancho,
  Publicacion,
  Viernes,
  Documento,
  Entrega,
  Lunes,
  Explicacion,
  AntesDe,
  Paso1,
  Paso2,
  Paso3,
  Foto,
  Regla,
  Cierre,
};

/** Destello corto en cada corte de escena (el "whoosh" visual). */
const CutFlash: React.FC = () => {
  const f = useCurrentFrame();
  const cut = SCENES.slice(1).find((s) => f >= fr(s.from) && f < fr(s.from) + 5);
  if (!cut) return null;
  const k = 1 - (f - fr(cut.from)) / 5;
  return <AbsoluteFill style={{ background: "#fff", opacity: 0.35 * k, mixBlendMode: "screen" }} />;
};

export const ValeVistaReel: React.FC<{ withAudio?: boolean }> = ({ withAudio = true }) => (
  <AbsoluteFill style={{ background: "#000" }}>
    {SCENES.map((s) => {
      const C = SCENE_COMPONENTS[s.id];
      return (
        <Sequence key={s.id} name={s.id} from={fr(s.from)} durationInFrames={fr(s.to) - fr(s.from)}>
          <C />
        </Sequence>
      );
    })}
    <CutFlash />
    <Vignette />
    <Captions />
    <Grain />
    {withAudio && <Audio src={staticFile("audio/mix.wav")} />}
  </AbsoluteFill>
);
