import React from "react";
import { Composition, Folder, Still, continueRender, delayRender } from "remotion";
import { FPS, H, W } from "./brand";
import { fontsReady } from "./lib/fonts";
import { ElChat } from "./reels/chat/ElChat";
import { T as CHAT } from "./reels/chat/script";
import { Quiz } from "./reels/quiz/Quiz";
import { MotorLento } from "./reels/motor/MotorLento";
import { Clic } from "./reels/clic/Clic";
import CLIC from "./reels/clic/timeline.json";
import { TL as MOTOR } from "./reels/motor/timeline";
import { TOTAL as QUIZ_TOTAL } from "./reels/quiz/data";
import { AsadoClose, AsadoCover, AsadoGuest, GUESTS } from "./carruseles/asado/Asado";
import { ITEMS, SecretosClose, SecretosCover, SecretosItem } from "./carruseles/secretos/Secretos";
import { Conductores } from "./imagenes/Conductores";
import { KM_TOTAL, Kilometros } from "./v2/Kilometros";
import { Caballos, HP_TOTAL } from "./v2/Caballos";
import { MOTOR_TOTAL, MotorV2 } from "./v2/MotorV2";
import { CLIC_TOTAL, ClicV2 } from "./v2/ClicV2";
import { Explosiones } from "./imagenes/Explosiones";

const fontHandle = delayRender("Cargando fuentes");
fontsReady.then(() => continueRender(fontHandle));

const reel = { fps: FPS, width: W, height: H };
const post = { width: 1080, height: 1350 };

export const RemotionRoot: React.FC = () => (
  <>
    <Folder name="Reels">
      <Composition id="R01-ElChat" component={ElChat} durationInFrames={CHAT.total} defaultProps={{ withAudio: true }} {...reel} />
      <Composition id="R03-MotorLento" component={MotorLento} durationInFrames={MOTOR.beats.total} defaultProps={{ withAudio: true }} {...reel} />
      <Composition id="R04-Clic" component={Clic} durationInFrames={CLIC.k.total} defaultProps={{ withAudio: true }} {...reel} />
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
    <Folder name="V2">
      <Composition id="V2-Clic" component={ClicV2} durationInFrames={CLIC_TOTAL} defaultProps={{ withAudio: true }} {...reel} />
      <Composition id="V2-Motor" component={MotorV2} durationInFrames={MOTOR_TOTAL} defaultProps={{ withAudio: true }} {...reel} />
      <Composition id="V2-Caballos" component={Caballos} durationInFrames={HP_TOTAL} defaultProps={{ withAudio: true }} {...reel} />
      <Composition id="V2-Kilometros" component={Kilometros} durationInFrames={KM_TOTAL} defaultProps={{ withAudio: true }} {...reel} />
    </Folder>
    <Folder name="Imagenes">
      <Still id="I01-Conductores" component={Conductores} {...post} />
      <Still id="I02-Explosiones" component={Explosiones} {...post} />
    </Folder>
  </>
);
