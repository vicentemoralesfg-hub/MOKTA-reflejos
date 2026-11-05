import React from "react";
import { Composition, Folder, continueRender, delayRender } from "remotion";
import { CTA_DURACION, FPS, HEIGHT, HOOK_DURACION, RONDAS, TOTAL, WIDTH, rondaDuracion } from "./config";
import { fontsReady } from "./lib";
import { Video } from "./Video";
import { Gancho } from "./scenes/Gancho";
import { RondaEscena } from "./scenes/RondaEscena";
import { Cierre } from "./scenes/Cierre";

const handle = delayRender("Cargando fuentes");
fontsReady.then(() => continueRender(handle));

const comun = { fps: FPS, width: WIDTH, height: HEIGHT };

export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="QueAutoEs" component={Video} durationInFrames={TOTAL} defaultProps={{ conAudio: true }} {...comun} />
    <Folder name="Escenas">
      <Composition id="Gancho" component={Gancho} durationInFrames={HOOK_DURACION} {...comun} />
      {RONDAS.map((r) => (
        <Composition
          key={r.numero}
          id={`Ronda-${r.numero}`}
          component={RondaEscena}
          defaultProps={{ ronda: r }}
          durationInFrames={rondaDuracion(r)}
          {...comun}
        />
      ))}
      <Composition id="Cierre" component={Cierre} durationInFrames={CTA_DURACION} {...comun} />
    </Folder>
  </>
);
