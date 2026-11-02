import React from "react";
import { AbsoluteFill, Sequence, staticFile, useCurrentFrame } from "remotion";
import { Audio } from "@remotion/media";
import { C } from "../../brand";
import { ChatUI } from "./ChatUI";
import { DataScene } from "./DataScene";
import { EndCard } from "./EndCard";
import { NightScene } from "./NightScene";
import { T } from "./script";

/**
 * Reel 01 · "El chat"
 * 0,0–7,0 s   historia de chat (con pistas sutiles: vibración + reflejos de luminarias)
 * 7,0–8,7 s   revelación: el celular estaba en el tablero; el auto de adelante frena
 * 8,7–9,3 s   negro + pitido
 * 9,3–15,3 s  7 s = 194 m a 100 km/h, a escala con 2 canchas
 * 15,3–19,5 s cierre + pregunta abierta (bucle al inicio del chat)
 */
export const ElChat: React.FC<{ withAudio?: boolean }> = ({ withAudio = true }) => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: C.ink }}>
      {f < T.reveal ? <ChatUI f={f} /> : null}
      {f >= T.reveal && f < T.crash ? <NightScene lf={f - T.reveal} /> : null}
      {f >= T.crash && f < T.data ? <AbsoluteFill style={{ background: "#000" }} /> : null}
      {f >= T.data && f < T.end ? <DataScene f={f - T.data} /> : null}
      {f >= T.end ? <EndCard f={f - T.end} /> : null}
      {withAudio ? (
        <Sequence>
          <Audio src={staticFile("audio/el-chat.wav")} />
        </Sequence>
      ) : null}
    </AbsoluteFill>
  );
};
