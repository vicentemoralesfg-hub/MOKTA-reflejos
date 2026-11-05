import React from "react";
import { Composition, continueRender, delayRender } from "remotion";
import { FPS, HEIGHT, WIDTH } from "./config";
import { fontsReady } from "./lib/fonts";
import { Reel } from "./Reel";
import { TOTAL } from "./timeline";

const fontHandle = delayRender("Cargando fuentes");
fontsReady.then(() => continueRender(fontHandle));

export const RemotionRoot: React.FC = () => (
  <>
    <Composition
      id="EspejoRetrovisor"
      component={Reel}
      durationInFrames={TOTAL}
      fps={FPS}
      width={WIDTH}
      height={HEIGHT}
      defaultProps={{ withAudio: true }}
    />
  </>
);
