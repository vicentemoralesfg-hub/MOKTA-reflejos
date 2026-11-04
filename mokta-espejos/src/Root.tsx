import React from "react";
import { Composition, Folder, continueRender, delayRender } from "remotion";
import { FPS, HEIGHT, WIDTH } from "./config";
import { fontsReady } from "./lib/fonts";
import { TOTAL_FRAMES } from "./lib/timeline";
import { Reel } from "./Reel";
import { MirrorTest } from "./dev/MirrorTest";
import { TopTest } from "./dev/TopTest";

const fontHandle = delayRender("Cargando fuentes");
fontsReady.then(() => continueRender(fontHandle));

const common = { fps: FPS, width: WIDTH, height: HEIGHT };

export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="MoktaEspejos" component={Reel} durationInFrames={TOTAL_FRAMES} defaultProps={{ withAudio: true }} {...common} />
    <Folder name="Pruebas">
      <Composition id="MirrorTest" component={MirrorTest} durationInFrames={60} {...common} />
      <Composition id="TopTest" component={TopTest} durationInFrames={60} defaultProps={{ mode: 0 }} {...common} />
    </Folder>
  </>
);
