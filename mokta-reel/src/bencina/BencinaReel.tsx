import React from "react";
import { AbsoluteFill, staticFile, useCurrentFrame } from "remotion";
import { Audio } from "@remotion/media";
import { Background, Brand, Captions, SceneIn } from "./components/Common";
import { Secret } from "./scenes/Intro";
import { CtaReal, HookReal, SetupReal } from "./scenes/Cockpit";
import { Mechanism, Reason1, Reason2 } from "./scenes/Mechanism";
import { Payoff, Reason3, Tip } from "./scenes/Outro";
import { shake } from "./theme";
import { SCENES, SceneId, cue } from "./timing";

/**
 * MOKTA · ¿Por qué los últimos km de bencina se van más rápido?
 * Composición principal: escenas por rango de fotogramas globales (todas se anclan
 * a las palabras de la locución), subtítulos karaoke, golpes de cámara y destellos.
 */
const HITS = ["stamp", "crash", "altura", "r1", "r2", "r3", "warn"] as const;

const render = (id: SceneId, from: number) => {
  switch (id) {
    case "hook":
      return <HookReal />;
    case "setup":
      return <SetupReal />;
    case "secret":
      return <Secret from={from} />;
    case "mechanism":
      return <Mechanism from={from} />;
    case "r1":
      return <Reason1 />;
    case "r2":
      return <Reason2 />;
    case "r3":
      return <Reason3 />;
    case "payoff":
      return <Payoff />;
    case "tip":
      return <Tip from={from} />;
    case "cta":
      return <CtaReal from={from} />;
  }
};

export const BencinaReel: React.FC<{ withAudio?: boolean }> = ({ withAudio = true }) => {
  const t = useCurrentFrame();
  let sx = 0;
  let sy = 0;
  let flash = 0;
  for (const h of HITS) {
    const at = cue(h);
    const amp = h === "stamp" || h === "crash" ? 22 : 14;
    const d = shake(t, at, amp, 12);
    sx += d.x;
    sy += d.y;
    if (t >= at && t < at + 6) flash = Math.max(flash, (1 - (t - at) / 6) * (h === "stamp" || h === "crash" ? 0.5 : 0.3));
  }
  const scene = SCENES.find((s) => t >= s.from && t < s.to) ?? SCENES[SCENES.length - 1];

  return (
    <AbsoluteFill style={{ backgroundColor: "#03050A" }}>
      <Background />
      <AbsoluteFill style={{ translate: `${sx}px ${sy}px` }}>
        <SceneIn key={scene.id} from={scene.from} dir={SCENES.indexOf(scene) % 2 === 0 ? 1 : -1}>
          {render(scene.id, scene.from)}
        </SceneIn>
      </AbsoluteFill>
      <Brand />
      <Captions />
      {flash > 0 ? <AbsoluteFill style={{ background: "#FFF6E0", opacity: flash }} /> : null}
      {withAudio ? <Audio src={staticFile("bencina/soundtrack.wav")} /> : null}
    </AbsoluteFill>
  );
};
