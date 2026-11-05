import React from "react";
import { Composition, Folder, continueRender, delayRender } from "remotion";
import { fontsReady } from "./lib/fonts";
import { FPS, HEIGHT, SCENES, TOTAL_FRAMES, WIDTH, fr } from "./timing";
import { SCENE_COMPONENTS, ValeVistaReel } from "./Video";

const fontHandle = delayRender("Cargando fuentes");
fontsReady.then(() => continueRender(fontHandle));

const common = { fps: FPS, width: WIDTH, height: HEIGHT };

export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="FalsoValeVista" component={ValeVistaReel} durationInFrames={TOTAL_FRAMES} defaultProps={{ withAudio: true }} {...common} />
    <Folder name="Escenas">
      {SCENES.map((s) => (
        <Composition key={s.id} id={s.id} component={SCENE_COMPONENTS[s.id]} durationInFrames={fr(s.to) - fr(s.from)} {...common} />
      ))}
    </Folder>
  </>
);
