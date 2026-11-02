import React from "react";
import { Composition, Folder, Still, continueRender, delayRender } from "remotion";
import { FPS, H, W } from "./brand";
import { fontsReady } from "./lib/fonts";
import { ElChat } from "./reels/chat/ElChat";
import { T as CHAT } from "./reels/chat/script";
import { Quiz } from "./reels/quiz/Quiz";
import { TOTAL as QUIZ_TOTAL } from "./reels/quiz/data";
import { AsadoClose, AsadoCover, AsadoGuest, GUESTS } from "./carruseles/asado/Asado";
import { ITEMS, SecretosClose, SecretosCover, SecretosItem } from "./carruseles/secretos/Secretos";

const fontHandle = delayRender("Cargando fuentes");
fontsReady.then(() => continueRender(fontHandle));

const reel = { fps: FPS, width: W, height: H };
const post = { width: 1080, height: 1350 };

export const RemotionRoot: React.FC = () => (
  <>
    <Folder name="Reels">
      <Composition id="R01-ElChat" component={ElChat} durationInFrames={CHAT.total} defaultProps={{ withAudio: true }} {...reel} />
      <Composition id="R02-MitoOVerdad" component={Quiz} durationInFrames={QUIZ_TOTAL} defaultProps={{ withAudio: true }} {...reel} />
    </Folder>
    <Folder name="Carrusel-Asado">
      <Still id="C01-Asado-01" component={AsadoCover} {...post} />
      {GUESTS.map((g, i) => (
        <Still key={g.kind} id={`C01-Asado-0${i + 2}`} component={AsadoGuest} defaultProps={{ i }} {...post} />
      ))}
      <Still id="C01-Asado-08" component={AsadoClose} {...post} />
    </Folder>
    <Folder name="Carrusel-Secretos">
      <Still id="C02-Secretos-01" component={SecretosCover} {...post} />
      {ITEMS.map((_, i) => (
        <Still key={i} id={`C02-Secretos-0${i + 2}`} component={SecretosItem} defaultProps={{ i }} {...post} />
      ))}
      <Still id="C02-Secretos-09" component={SecretosClose} {...post} />
    </Folder>
  </>
);
