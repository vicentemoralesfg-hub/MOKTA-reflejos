import React from "react";
import { Composition, Folder, continueRender, delayRender } from "remotion";
import { CTA_DURATION, FPS, HEIGHT, HOOK_DURATION, REVEAL_DURATION, ROUNDS, TOTAL_DURATION, WIDTH, roundDuration } from "./config";
import { fontsReady } from "./lib/fonts";
import { MoktaReel } from "./MoktaReel";
import { Hook } from "./scenes/Hook";
import { RoundScene } from "./scenes/RoundScene";
import { Cta, Reveal } from "./scenes/Outro";

const fontHandle = delayRender("Cargando fuentes");
fontsReady.then(() => continueRender(fontHandle));

const common = { fps: FPS, width: WIDTH, height: HEIGHT };

export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="MoktaReflejos" component={MoktaReel} durationInFrames={TOTAL_DURATION} defaultProps={{ withAudio: true }} {...common} />
    <Folder name="Escenas">
      <Composition id="Gancho" component={Hook} durationInFrames={HOOK_DURATION} {...common} />
      {ROUNDS.map((r, i) => (
        <Composition key={r.id} id={`Ronda-${r.speedKmh}`} component={RoundScene} defaultProps={{ index: i }} durationInFrames={roundDuration(r)} {...common} />
      ))}
      <Composition id="Revelacion" component={Reveal} durationInFrames={REVEAL_DURATION} {...common} />
      <Composition id="CTA" component={Cta} durationInFrames={CTA_DURATION} {...common} />
    </Folder>
  </>
);
