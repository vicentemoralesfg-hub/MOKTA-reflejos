import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { COLORS, FPS, TEXT, beat } from "../config";
import { CarSection } from "../components/CarSection";
import { HvacButton } from "../components/HvacButton";
import { RecircIcon } from "../components/Icons";
import { Bg, Grade, H, Pop, SUB, SceneIn, Slam, Teaser } from "../components/Kinetic";
import { lerp, pop, ramp, shake } from "../lib/anim";

/** Qué es: nombre del botón + corte del auto (la toma de aire se cierra y el aire da vueltas). */
export const Define: React.FC = () => {
  const f = useCurrentFrame();
  const B = { diagram: beat("define", "diagram"), intake: beat("define", "intake"), loop: beat("define", "loop") };
  const sh = shake(f, [0], 12);
  const d = pop(f, B.diagram, 13, 160);
  const closed = ramp(f, B.intake, B.intake + 8);
  const recirc = f >= B.loop;
  return (
    <AbsoluteFill>
      <Bg mood="neutral" />
      <SceneIn>
        <AbsoluteFill style={{ translate: `${sh.x}px ${sh.y}px` }}>
          <div style={{ position: "absolute", top: 236, left: 0, right: 0, display: "flex", flexDirection: "column", alignItems: "center" }}>
            <Pop at={0} from={0.8}>
              <div style={{ ...SUB, fontSize: 44, letterSpacing: 10, color: COLORS.dim }}>{TEXT.defineKicker}</div>
            </Pop>
            <Slam at={1}>
              <div style={{ ...H, fontSize: 138, color: COLORS.led, textShadow: `0 0 50px ${COLORS.led}55, 0 6px 30px rgba(0,0,0,0.6)` }}>{TEXT.defineName}</div>
            </Slam>
            <Pop at={6} style={{ marginTop: 26 }}>
              <HvacButton size={170} led={1} icon={<RecircIcon size={106} stroke={6} />} />
            </Pop>
          </div>

          <div
            style={{
              position: "absolute",
              top: 690,
              left: 50,
              opacity: Math.min(1, d * 2),
              scale: String(lerp(0.85, 1, d)),
              translate: `0px ${lerp(80, 0, d)}px`,
            }}
          >
            <CarSection
              t={f / FPS}
              width={980}
              mode={recirc ? "recirc" : "fresh"}
              flowColor={recirc ? COLORS.led : COLORS.cold}
              flowOpacity={recirc ? ramp(f, B.loop, B.loop + 6) : 1 - ramp(f, B.loop - 8, B.loop)}
              intakeClosed={closed}
              occupants
            />
          </div>

          <div style={{ position: "absolute", top: 1240, left: 60, right: 60 }}>
            <Pop at={B.intake}>
              <div style={{ ...SUB, fontSize: 48, color: f >= B.loop ? COLORS.dim : COLORS.white }}>{TEXT.defineIntake}</div>
            </Pop>
            <Pop at={B.loop} style={{ marginTop: 16 }}>
              <div style={{ ...SUB, fontSize: 54 }}>
                …y el auto respira <span style={{ color: COLORS.led }}>su propio aire</span>
              </div>
            </Pop>
          </div>
        </AbsoluteFill>
      </SceneIn>
      <Teaser at={20} text={TEXT.teaser} />
      <Grade />
    </AbsoluteFill>
  );
};
