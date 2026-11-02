import React from "react";
import { Composition, Folder, continueRender, delayRender } from "remotion";
import { FPS, H, W } from "./brand";
import { fontsReady } from "./lib/fonts";
import { ElChat } from "./reels/chat/ElChat";
import { T as CHAT } from "./reels/chat/script";
import { Quiz } from "./reels/quiz/Quiz";
import { TOTAL as QUIZ_TOTAL } from "./reels/quiz/data";

const fontHandle = delayRender("Cargando fuentes");
fontsReady.then(() => continueRender(fontHandle));

const reel = { fps: FPS, width: W, height: H };

export const RemotionRoot: React.FC = () => (
  <>
    <Folder name="Reels">
      <Composition id="R01-ElChat" component={ElChat} durationInFrames={CHAT.total} defaultProps={{ withAudio: true }} {...reel} />
      <Composition id="R02-MitoOVerdad" component={Quiz} durationInFrames={QUIZ_TOTAL} defaultProps={{ withAudio: true }} {...reel} />
    </Folder>
  </>
);
