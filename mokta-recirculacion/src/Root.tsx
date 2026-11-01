import React from "react";
import { Composition, Folder, continueRender, delayRender } from "remotion";
import { FPS, HEIGHT, SCENE_ORDER, TOTAL_DURATION, WIDTH, scene } from "./config";
import { fontsReady } from "./lib/fonts";
import { Reel, SCENE_COMPONENTS } from "./Reel";

const fontHandle = delayRender("Cargando fuentes");
fontsReady.then(() => continueRender(fontHandle));

const common = { fps: FPS, width: WIDTH, height: HEIGHT };

export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="MoktaRecirculacion" component={Reel} durationInFrames={TOTAL_DURATION} defaultProps={{ withAudio: true }} {...common} />
    <Folder name="Escenas">
      {SCENE_ORDER.map((id) => (
        <Composition key={id} id={`Escena-${id}`} component={SCENE_COMPONENTS[id]} durationInFrames={scene(id).duration} {...common} />
      ))}
    </Folder>
  </>
);
