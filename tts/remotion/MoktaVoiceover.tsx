// Ejemplo de integración en Remotion.
// 1) Copia salida/<proyecto>/ a  <tu-proyecto-remotion>/public/voiceover/<proyecto>/
// 2) Copia salida/<proyecto>/voiceover.ts a  src/voiceover/<proyecto>.ts
// 3) Usa este componente (o lee `voiceover` para sincronizar tus escenas visuales).
import React from "react";
import {AbsoluteFill, Series, staticFile} from "remotion";
import {Audio} from "@remotion/media";
import {voiceover, VOICEOVER_FPS, VOICEOVER_TOTAL_FRAMES} from "./voiceover/ejemplo"; // generado por tts/

// Silencio entre escenas (en frames). Debe coincidir con --scene-gap si usas la pista completa.
const GAP = Math.round(0.6 * VOICEOVER_FPS); // = round(--scene-gap * fps)

export const MoktaVoiceover: React.FC<{renderScene?: (id: string) => React.ReactNode}> = ({renderScene}) => {
  return (
    <AbsoluteFill>
      <Series>
        {voiceover.map((scene, i) => (
          <Series.Sequence
            key={scene.id}
            durationInFrames={scene.durationInFrames + (i < voiceover.length - 1 ? GAP : 0)}
            name={`${scene.id} · ${scene.emotion}`}
          >
            <Audio src={staticFile(scene.src)} />
            {renderScene?.(scene.id)}
          </Series.Sequence>
        ))}
      </Series>
    </AbsoluteFill>
  );
};

// En Root.tsx:
// <Composition id="Mokta" component={MoktaVoiceover} fps={VOICEOVER_FPS}
//   durationInFrames={VOICEOVER_TOTAL_FRAMES} width={1920} height={1080} />
