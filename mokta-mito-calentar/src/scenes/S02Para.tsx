import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { C } from "../config";
import { CarScene } from "../art/CarScene";
import { Flash } from "../components/Overlays";
import { Big, Marker, Reveal, Stamp } from "../components/Text";
import { impactShake, map } from "../lib/anim";
import { beat, cue } from "../timeline";

/** "PARA." — el plano del gancho se congela, se desatura y se tiñe de rojo. */
export const S02Para: React.FC = () => {
  const f = useCurrentFrame();
  const hookD = beat("hook").duration;
  const sh = impactShake(f, 3, 26, 16);
  const tEstas = cue("para", "estas", 16);
  const tDano = cue("para", "dano", 30);
  const tBien = cue("para", "bien", 40);
  const zoom = map(f, [0, 60], [1.16, 1.24]);
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ transform: `translate(${sh.x}px, ${sh.y}px) rotate(${sh.r}deg)` }}>
        <AbsoluteFill style={{ filter: "grayscale(0.85) brightness(0.55) contrast(1.15)" }}>
          <CarScene t={hookD + 40} zoom={zoom} />
        </AbsoluteFill>
        <AbsoluteFill
          style={{ background: "radial-gradient(ellipse at 50% 45%, rgba(255,40,40,0.22), rgba(60,0,0,0.65))", mixBlendMode: "multiply" }}
        />
        <AbsoluteFill style={{ background: "rgba(120,0,0,0.18)" }} />
      </AbsoluteFill>
      <AbsoluteFill style={{ alignItems: "center", top: 300 }}>
        <Stamp at={0} size={330} rotate={-5}>
          Para.
        </Stamp>
      </AbsoluteFill>
      <AbsoluteFill style={{ alignItems: "center", top: 640 }}>
        <Reveal at={tEstas - 3} from="up">
          <Big size={92}>Le estás haciendo</Big>
        </Reveal>
        <Reveal at={tDano - 4} from="slam" dur={6} style={{ marginTop: 12 }}>
          <Big size={150}>
            <Marker at={tDano - 1} color={C.red} ink={C.white}>
              más daño
            </Marker>
          </Big>
        </Reveal>
        <Reveal at={tBien - 4} from="up" style={{ marginTop: 10 }}>
          <Big size={92}>que bien</Big>
        </Reveal>
      </AbsoluteFill>
      <Flash at={0} color="#ff5050" peak={0.75} dur={7} />
    </AbsoluteFill>
  );
};
