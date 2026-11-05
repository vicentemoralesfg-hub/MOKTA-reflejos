import React from "react";
import { AbsoluteFill, Sequence, interpolate, staticFile, useCurrentFrame } from "remotion";
import { Audio } from "@remotion/media";
import { COLORS, FPS } from "./config";
import { T, TOTAL_FRAMES, VO_OFFSET, at } from "./lib/timeline";
import { CaptionBand, Captions } from "./components/Captions";
import { Flash } from "./components/Ui";
import { MirrorResult, MirrorWaste } from "./scenes/MirrorScenes";
import { CRASH_AT, REWIND_A, TopDownScene } from "./scenes/TopDownScene";
import { HookScene } from "./scenes/HookScene";
import { CtaCard, FixCard } from "./scenes/Cards";

/** Inicio de la escena del espejo grande (después de que la cabeza vuelve a su posición). */
export const BACK_END = T.back + 0.7;

/** Cortes de escena (s). */
const CUTS = [T.danger, T.waste, T.overlap, T.fix, T.step1, BACK_END, T.result, T.cta];

type Cue = { at: number; src: string; volume: number };
const ERROR_AT = at("error");
const CUES: Cue[] = [
  // gancho
  { at: 0, src: "sfx/impacto.wav", volume: 0.5 },
  { at: ERROR_AT, src: "sfx/error.wav", volume: 0.32 },
  { at: T.pct, src: "sfx/impacto.wav", volume: 0.6 },
  // consecuencia: cambio de carril y choque
  { at: T.danger - 0.12, src: "sfx/whoosh.wav", volume: 0.55 },
  { at: T.danger + 0.2, src: "sfx/pop.wav", volume: 0.35 },
  { at: T.danger + 0.6, src: "sfx/acierto.wav", volume: 0.25 },
  { at: T.change - 0.25, src: "sfx/intermitente.wav", volume: 0.55 },
  { at: CRASH_AT - 0.03, src: "sfx/choque.wav", volume: 0.85 },
  { at: CRASH_AT - 0.02, src: "sfx/impacto.wav", volume: 0.6 },
  { at: CRASH_AT + 0.3, src: "sfx/bocina.wav", volume: 0.45 },
  { at: REWIND_A - 0.05, src: "sfx/rebobinado.wav", volume: 0.6 },
  // por qué pasa
  { at: T.waste - 0.08, src: "sfx/whoosh2.wav", volume: 0.45 },
  { at: T.waste + 0.25, src: "sfx/pop.wav", volume: 0.4 },
  { at: T.wasteWord, src: "sfx/error.wav", volume: 0.42 },
  { at: T.overlap - 0.12, src: "sfx/whoosh.wav", volume: 0.55 },
  { at: T.overlap + 0.15, src: "sfx/pop.wav", volume: 0.35 },
  { at: T.overlap + 0.3, src: "sfx/pop.wav", volume: 0.35 },
  { at: T.central - 0.1, src: "sfx/pop.wav", volume: 0.45 },
  { at: T.blind, src: "sfx/error.wav", volume: 0.5 },
  { at: T.fits - 0.2, src: "sfx/whoosh2.wav", volume: 0.45 },
  { at: T.fits + 0.55, src: "sfx/pop.wav", volume: 0.4 },
  // solución
  { at: T.fix - 0.1, src: "sfx/whoosh.wav", volume: 0.55 },
  { at: T.tenSec - 0.05, src: "sfx/impacto.wav", volume: 0.45 },
  { at: T.step1 - 0.1, src: "sfx/whoosh2.wav", volume: 0.4 },
  { at: T.step1 + 0.05, src: "sfx/pop.wav", volume: 0.4 },
  { at: T.openLeft + 0.1, src: "sfx/motor.wav", volume: 0.6 },
  { at: T.barely + 0.45, src: "sfx/acierto.wav", volume: 0.42 },
  { at: T.step2 + 0.15, src: "sfx/pop.wav", volume: 0.4 },
  { at: T.sameRight + 0.1, src: "sfx/motor.wav", volume: 0.6 },
  { at: T.back, src: "sfx/pop.wav", volume: 0.4 },
  { at: BACK_END - 0.1, src: "sfx/whoosh.wav", volume: 0.5 },
  { at: T.vanish, src: "sfx/whoosh2.wav", volume: 0.4 },
  { at: T.appears + 0.55, src: "sfx/acierto.wav", volume: 0.5 },
  // resultado
  { at: T.result - 0.1, src: "sfx/whoosh.wav", volume: 0.5 },
  { at: T.result + 0.75, src: "sfx/acierto.wav", volume: 0.45 },
  { at: T.rear - 0.1, src: "sfx/pop.wav", volume: 0.42 },
  { at: T.toMirror + 0.15, src: "sfx/pop.wav", volume: 0.42 },
  { at: T.toView, src: "sfx/pop.wav", volume: 0.42 },
  { at: T.never, src: "sfx/acierto.wav", volume: 0.42 },
  { at: T.still - 0.05, src: "sfx/whoosh2.wav", volume: 0.4 },
  { at: T.still + 0.3, src: "sfx/intermitente.wav", volume: 0.4 },
  { at: T.shoulder, src: "sfx/pop.wav", volume: 0.45 },
  // cierre
  { at: T.cta - 0.1, src: "sfx/whoosh.wav", volume: 0.55 },
  { at: T.cta + 0.15, src: "sfx/pop.wav", volume: 0.45 },
  { at: T.cta + 0.5, src: "sfx/whoosh2.wav", volume: 0.35 },
  { at: T.end + 0.05, src: "sfx/impacto.wav", volume: 0.4 },
];


const musicVolume = (f: number) => {
  const t = f / FPS;
  const base = 0.2;
  const fadeIn = interpolate(t, [0, 0.08], [0, 1], { extrapolateRight: "clamp" });
  const dip = interpolate(t, [CRASH_AT, CRASH_AT + 0.15, T.waste - 0.1, T.waste + 0.1], [1, 0.12, 0.12, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const tail = interpolate(t, [T.end, T.end + 0.4], [1, 1.45], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const out = interpolate(t, [TOTAL_FRAMES / FPS - 1.0, TOTAL_FRAMES / FPS], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return base * fadeIn * dip * tail * out;
};

export const Reel: React.FC<{ withAudio?: boolean }> = ({ withAudio = true }) => {
  const frame = useCurrentFrame();
  const t = frame / FPS;

  let scene: React.ReactNode;
  if (t < T.danger) scene = <HookScene t={t} />;
  else if (t < T.waste) scene = <TopDownScene t={t} />;
  else if (t < T.overlap) scene = <MirrorWaste t={t} />;
  else if (t < T.fix) scene = <TopDownScene t={t} />;
  else if (t < T.step1) scene = <FixCard t={t} />;
  else if (t < BACK_END) scene = <TopDownScene t={t} />;
  else if (t < T.result) scene = <MirrorResult t={t} from={BACK_END} />;
  else if (t < T.cta) scene = <TopDownScene t={t} />;
  else scene = <CtaCard t={t} />;

  const hideCaptions = (tt: number) => tt < T.danger || (tt >= T.fix && tt < T.step1) || tt >= T.end + 0.1;

  return (
    <AbsoluteFill style={{ background: COLORS.ink }}>
      {scene}
      {CUTS.map((c) => (
        <Flash key={c} t={t} at={c} max={0.16} dur={0.18} />
      ))}
      {!hideCaptions(t) ? <CaptionBand /> : null}
      <Captions t={t} hidden={hideCaptions} />

      {withAudio ? (
        <>
          <Sequence from={Math.round(VO_OFFSET * FPS)} layout="none" name="Locución">
            <Audio src={staticFile("vo/voz.wav")} volume={1} />
          </Sequence>
          <Audio src={staticFile("music/musica.wav")} volume={musicVolume} name="Música" />
          {CUES.map((c, i) => (
            <Sequence key={i} from={Math.max(0, Math.round(c.at * FPS))} layout="none" name={`SFX ${c.src}`}>
              <Audio src={staticFile(c.src)} volume={c.volume} />
            </Sequence>
          ))}
        </>
      ) : null}
    </AbsoluteFill>
  );
};
