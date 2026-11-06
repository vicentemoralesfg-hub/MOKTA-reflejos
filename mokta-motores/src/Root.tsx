import React from "react";
import { Composition, continueRender, delayRender } from "remotion";
import { FPS, HEIGHT, TOTAL_DURATION, WIDTH } from "./config";
import { fontsReady } from "./lib/fonts";
import { MotorQuiz } from "./MotorQuiz";

const fontHandle = delayRender("Cargando fuentes");
fontsReady.then(() => continueRender(fontHandle));

export const RemotionRoot: React.FC = () => (
  <Composition
    id="MoktaMotores"
    component={MotorQuiz}
    durationInFrames={TOTAL_DURATION}
    fps={FPS}
    width={WIDTH}
    height={HEIGHT}
    defaultProps={{ withAudio: true }}
  />
);
