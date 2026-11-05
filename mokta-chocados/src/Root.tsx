import React from "react";
import { Composition, Folder, continueRender, delayRender } from "remotion";
import { fontsReady } from "./fonts";
import { FPS, HEIGHT, SCENES, TOTAL_FRAMES, WIDTH } from "./timeline";
import { SCENE_COMPONENTS, Video } from "./Video";

const fontHandle = delayRender("Cargando fuentes");
fontsReady.then(() => continueRender(fontHandle));

const common = { fps: FPS, width: WIDTH, height: HEIGHT };

export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="AutosChocados" component={Video} durationInFrames={TOTAL_FRAMES} defaultProps={{ withAudio: true }} {...common} />
    <Folder name="Escenas">
      {SCENES.map((s) => (
        <Composition key={s.id} id={`Escena-${s.id}`} component={SCENE_COMPONENTS[s.id]} durationInFrames={s.duration} {...common} />
      ))}
    </Folder>
  </>
);
