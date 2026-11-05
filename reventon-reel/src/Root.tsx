import React from "react";
import { Composition, continueRender, delayRender } from "remotion";
import { fontsReady } from "./lib/fonts";
import { Main } from "./Main";
import { TOTAL_FRAMES, FPS } from "./tl";

const fontHandle = delayRender("Cargando fuentes");
fontsReady.then(() => continueRender(fontHandle));

export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="Reventon" component={Main} durationInFrames={TOTAL_FRAMES} fps={FPS} width={1080} height={1920} defaultProps={{ withAudio: true }} />
  </>
);
