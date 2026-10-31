import React from "react";
import { Composition, Folder, continueRender, delayRender } from "remotion";
import { FPS, HEIGHT, SHOTS, TOTAL_FRAMES, WIDTH } from "./timeline";
import { fontsReady } from "./lib/fonts";
import { Video } from "./Video";
import { Shot } from "./Shot";
import { Captions } from "./hud/Captions";

const fontHandle = delayRender("Cargando fuentes");
fontsReady.then(() => continueRender(fontHandle));

const common = { fps: FPS, width: WIDTH, height: HEIGHT };

export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="ConSubtitulos" component={Video} durationInFrames={TOTAL_FRAMES} defaultProps={{ subtitles: true, withAudio: true }} {...common} />
    <Composition id="SinSubtitulos" component={Video} durationInFrames={TOTAL_FRAMES} defaultProps={{ subtitles: false, withAudio: true }} {...common} />
    <Composition id="SoloSubtitulos" component={Captions} durationInFrames={TOTAL_FRAMES} {...common} />
    <Folder name="Planos">
      {SHOTS.map((s) => (
        <Composition key={s.id} id={`plano-${s.id}`} component={Shot} defaultProps={{ id: s.id }} durationInFrames={s.duration} {...common} />
      ))}
    </Folder>
  </>
);
