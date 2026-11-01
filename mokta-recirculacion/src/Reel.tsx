import React from "react";
import { AbsoluteFill, Series, staticFile } from "remotion";
import { Audio } from "@remotion/media";
import { COLORS, SCENE_ORDER, SceneId, scene } from "./config";
import { Hook } from "./scenes/Hook";
import { Define } from "./scenes/Define";
import { Winter } from "./scenes/Winter";
import { Summer } from "./scenes/Summer";
import { Rule } from "./scenes/Rule";
import { Recipe } from "./scenes/Recipe";
import { Cta } from "./scenes/Cta";

export const SCENE_COMPONENTS: Record<SceneId, React.FC> = {
  hook: Hook,
  define: Define,
  winter: Winter,
  summer: Summer,
  rule: Rule,
  recipe: Recipe,
  cta: Cta,
};

const NAMES: Record<SceneId, string> = {
  hook: "Gancho",
  define: "Qué es",
  winter: "Error 1 · Invierno",
  summer: "Error 2 · Verano",
  rule: "La regla",
  recipe: "Desempañar al tiro",
  cta: "Cierre",
};

/**
 * Secuencia completa. Cortes secos en el pulso (120 BPM): el ritmo lo marcan el sonido y los "punch-in".
 * La pista sale de scripts/gen_audio.py, que lee la misma timeline.json.
 */
export const Reel: React.FC<{ withAudio?: boolean }> = ({ withAudio = true }) => (
  <AbsoluteFill style={{ backgroundColor: COLORS.ink }}>
    <Series>
      {SCENE_ORDER.map((id) => {
        const C = SCENE_COMPONENTS[id];
        return (
          <Series.Sequence key={id} name={NAMES[id]} durationInFrames={scene(id).duration}>
            <C />
          </Series.Sequence>
        );
      })}
    </Series>
    {withAudio ? <Audio src={staticFile("audio/soundtrack.wav")} /> : null}
  </AbsoluteFill>
);
