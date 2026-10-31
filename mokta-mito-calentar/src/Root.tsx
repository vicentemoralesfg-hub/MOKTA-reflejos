import React from "react";
import { Composition, Folder, continueRender, delayRender } from "remotion";
import { HEIGHT, WIDTH } from "./config";
import { fontsReady } from "./lib/fonts";
import { MitoReel } from "./MitoReel";
import { BEATS, FPS, TOTAL } from "./timeline";
import { SCENES } from "./scenes";
import { Grain, Vignette } from "./components/Overlays";
import { AbsoluteFill } from "remotion";

const fontHandle = delayRender("Cargando fuentes");
fontsReady.then(() => continueRender(fontHandle));

const common = { fps: FPS, width: WIDTH, height: HEIGHT };

const Solo: React.FC<{ id: string }> = ({ id }) => {
  const Scene = SCENES[id];
  return (
    <AbsoluteFill style={{ backgroundColor: "#04060B" }}>
      {Scene ? <Scene /> : null}
      <Vignette />
      <Grain />
    </AbsoluteFill>
  );
};

export const RemotionRoot: React.FC = () => (
  <>
    <Composition
      id="MitoCalentarAuto"
      component={MitoReel}
      durationInFrames={TOTAL}
      defaultProps={{ audio: "audio/mix.wav" as string | null }}
      {...common}
    />
    <Folder name="Escenas">
      {BEATS.map((b) => (
        <Composition key={b.id} id={`E-${b.id}`} component={Solo} defaultProps={{ id: b.id }} durationInFrames={b.duration} {...common} />
      ))}
    </Folder>
  </>
);
