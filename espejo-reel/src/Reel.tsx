import React from "react";
import { AbsoluteFill, Sequence, staticFile, useCurrentFrame } from "remotion";
import { Audio } from "@remotion/media";
import { SCENES, SCENE_ORDER, SceneId } from "./timeline";
import { ramp } from "./lib/anim";
import { SceneStart } from "./lib/frame";
import { Captions } from "./components/Captions";
import { CaptionScrim, Grade } from "./components/Backgrounds";
import { Hook } from "./scenes/Hook";
import { TabIntro } from "./scenes/TabIntro";
import { ErrorScene, FixScene } from "./scenes/ErrorAndFix";
import { HowItWorks } from "./scenes/HowItWorks";
import { Cta, DayScene, EcScene } from "./scenes/Outro";

const render = (id: SceneId, from: number) => {
  switch (id) {
    case "hook":
      return <Hook />;
    case "tab":
      return <TabIntro from={from} />;
    case "error":
      return <ErrorScene from={from} />;
    case "fix":
      return <FixScene from={from} />;
    case "how":
      return <HowItWorks from={from} />;
    case "ec":
      return <EcScene from={from} />;
    case "day":
      return <DayScene from={from} />;
    case "cta":
      return <Cta from={from} />;
  }
};

/** Corte con "golpe": la escena entrante arranca un poco más grande y asienta en 8 fotogramas. */
const Punch: React.FC<{ children: React.ReactNode; first: boolean }> = ({ children, first }) => {
  const f = useCurrentFrame();
  const p = first ? 1 : ramp(f, 0, 8);
  const flash = first ? 0 : Math.max(0, 0.28 * (1 - f / 4));
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ scale: String(1 + 0.07 * (1 - p)) }}>{children}</AbsoluteFill>
      {flash > 0 ? <AbsoluteFill style={{ background: "#dfeeff", opacity: flash }} /> : null}
    </AbsoluteFill>
  );
};

export const Reel: React.FC<{ withAudio?: boolean }> = ({ withAudio = true }) => {
  const frame = useCurrentFrame();
  const inCta = frame >= SCENES.cta[0];
  return (
    <AbsoluteFill style={{ backgroundColor: "#020306" }}>
      {SCENE_ORDER.map((id, i) => {
        const [a, b] = SCENES[id];
        return (
          <Sequence key={id} name={id} from={a} durationInFrames={b - a} premountFor={15}>
            <SceneStart.Provider value={a}>
              <Punch first={i === 0}>{render(id, a)}</Punch>
            </SceneStart.Provider>
          </Sequence>
        );
      })}
      {!inCta ? <CaptionScrim strength={0.7} /> : null}
      <Grade />
      <Captions />
      {withAudio ? <Audio src={staticFile("audio/soundtrack.wav")} /> : null}
    </AbsoluteFill>
  );
};
