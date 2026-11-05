import React from "react";
import { AbsoluteFill, Sequence, staticFile } from "remotion";
import { Audio } from "@remotion/media";
import { SCENES, SceneId } from "./config";
import { Captions } from "./components/Captions";
import { Hook } from "./scenes/Hook";
import { Comparison } from "./scenes/Comparison";
import { Reveal } from "./scenes/Reveal";
import { OdometerHours } from "./scenes/OdometerHours";
import { Traffic } from "./scenes/Traffic";
import { City, Habits } from "./scenes/Wear";
import { Highway } from "./scenes/Highway";
import { Verdict } from "./scenes/Verdict";
import { Checklist } from "./scenes/Checklist";
import { Truth } from "./scenes/Truth";
import { Cta } from "./scenes/Cta";

export const SCENE_COMPONENTS: Record<SceneId, React.FC> = {
  gancho: Hook,
  comparacion: Comparison,
  revelacion: Reveal,
  odometro: OdometerHours,
  taco: Traffic,
  ciudad: City,
  habitos: Habits,
  carretera: Highway,
  veredicto: Verdict,
  checklist: Checklist,
  verdad: Truth,
  cta: Cta,
};

/** Reel completo: escenas cortadas a la locución + subtítulos palabra a palabra + banda sonora. */
export const Reel: React.FC<{ withAudio: boolean }> = ({ withAudio }) => (
  <AbsoluteFill style={{ backgroundColor: "#05070B" }}>
    {SCENES.map((s) => {
      const C = SCENE_COMPONENTS[s.id];
      return (
        <Sequence key={s.id} name={s.id} from={s.from} durationInFrames={s.duration} premountFor={30}>
          <C />
        </Sequence>
      );
    })}
    <Captions />
    {withAudio ? <Audio src={staticFile("audio/soundtrack.wav")} /> : null}
  </AbsoluteFill>
);
