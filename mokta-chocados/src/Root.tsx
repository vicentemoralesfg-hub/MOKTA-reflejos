import React from "react";
import { Composition, continueRender, delayRender } from "remotion";
import { fontsReady } from "./fonts";
import { CarTest } from "./CarTest";
import { FPS, HEIGHT, WIDTH } from "./timeline";

const fontHandle = delayRender("Cargando fuentes");
fontsReady.then(() => continueRender(fontHandle));

export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="CarTest" component={CarTest} durationInFrames={60} fps={FPS} width={WIDTH} height={HEIGHT} />
  </>
);
