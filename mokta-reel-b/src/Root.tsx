import React from "react";
import { Composition, continueRender, delayRender } from "remotion";
import { fontsReady } from "./lib/fonts";
import { Ronda1 } from "./prototipo/Ronda1";
import { FPS, R1_DURATION } from "./prototipo/theme";

const fontHandle = delayRender("Cargando fuentes");
fontsReady.then(() => continueRender(fontHandle));

export const RemotionRoot: React.FC = () => (
  <Composition
    id="PrototipoRonda1"
    component={Ronda1}
    durationInFrames={R1_DURATION}
    fps={FPS}
    width={1080}
    height={1920}
    defaultProps={{ withAudio: true }}
  />
);
