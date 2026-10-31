import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { C, FONT_UI } from "../config";
import { Cylinder } from "../art/Cylinder";
import { Flash } from "../components/Overlays";
import { Big, Chapter, Marker, Reveal } from "../components/Text";
import { Snowflake } from "../art/Icons";
import { EASE_IN_OUT, impactShake, map, ramp } from "../lib/anim";
import { beat, cue } from "../timeline";

/** Ralentí en frío: bencina extra que lava la película de aceite → roce. */
export const S06Bencina: React.FC = () => {
  const f = useCurrentFrame();
  const D = beat("bencina").duration;
  const tPeor = cue("bencina", "peor", 33);
  const tMotor = cue("bencina", "motor", 51);
  const tExtra = cue("bencina", "extra", 93);
  const tLavar = cue("bencina", "lavar", 118);
  const tAceite = cue("bencina", "aceite", 131);
  const tCil = cue("bencina", "cilindros", 149);
  const phaseB = tMotor - 4;
  const phaseC = tLavar - 6;
  const theta = (f / 42) * Math.PI * 2;
  const extra = ramp(f, tExtra - 10, tExtra + 8);
  const wash = map(f, [tLavar - 2, D - 6], [0, 0.85], EASE_IN_OUT);
  const sparks = ramp(f, tAceite, tAceite + 8);
  const sh = impactShake(f, tPeor, 14, 12);
  const sh2 = impactShake(f, tAceite + 4, 8, 10);
  const zoom = map(f, [0, D], [1.0, 1.1]);
  const cylIn = ramp(f, 0, 10);
  return (
    <AbsoluteFill style={{ background: "radial-gradient(ellipse 85% 60% at 50% 60%, #121F36 0%, #070C17 60%, #03050A 100%)" }}>
      <AbsoluteFill style={{ transform: `translate(${sh.x + sh2.x}px, ${sh.y + sh2.y}px)` }}>
        <div
          style={{
            position: "absolute",
            left: 170,
            top: 700,
            width: 740,
            height: 832,
            opacity: cylIn,
            transform: `scale(${zoom * (0.94 + 0.06 * cylIn)})`,
            transformOrigin: "50% 30%",
          }}
        >
          <Cylinder
            theta={theta}
            t={f}
            extra={extra}
            wash={wash}
            sparks={sparks}
            labels={{
              fuel: ramp(f, tExtra, tExtra + 8),
              oil: ramp(f, tAceite - 6, tAceite + 4),
              wear: ramp(f, tAceite + 10, tAceite + 18),
            }}
          />
        </div>
        {/* termómetro: motor frío */}
        <div
          style={{
            position: "absolute",
            left: 70,
            top: 690,
            display: "flex",
            alignItems: "center",
            gap: 12,
            padding: "12px 22px",
            borderRadius: 999,
            background: "rgba(10,30,55,0.85)",
            border: `2px solid ${C.frost}88`,
            opacity: ramp(f, tMotor - 2, tMotor + 6),
            fontFamily: FONT_UI,
            fontWeight: 800,
            fontSize: 30,
            letterSpacing: 3,
            color: C.frost,
          }}
        >
          <Snowflake size={38} color={C.frost} />
          MOTOR FRÍO
        </div>
      </AbsoluteFill>

      <Chapter n="02" label="EL DAÑO" color={C.red} at={0} />

      <AbsoluteFill style={{ alignItems: "center", top: 345 }}>
        <Reveal at={2} out={phaseB} from="up" dur={7}>
          <Big size={112}>En ralentí</Big>
        </Reveal>
        <Reveal at={tPeor - 6} out={phaseB} from="slam" dur={6} style={{ marginTop: 8 }}>
          <Big size={130}>
            pasa algo{" "}
            <Marker at={tPeor - 2} color={C.red} ink={C.white}>
              peor
            </Marker>
          </Big>
        </Reveal>
      </AbsoluteFill>

      <AbsoluteFill style={{ alignItems: "center", top: 345 }}>
        <Reveal at={phaseB + 6} out={phaseC} from="up" dur={7}>
          <Big size={112} color={C.frost}>
            Motor frío =
          </Big>
        </Reveal>
        <Reveal at={tExtra - 14} out={phaseC} from="slam" dur={6} style={{ marginTop: 8 }}>
          <Big size={130}>
            <Marker at={tExtra - 4} color={C.cyan}>
              bencina extra
            </Marker>
          </Big>
        </Reveal>
      </AbsoluteFill>

      <AbsoluteFill style={{ alignItems: "center", top: 345 }}>
        <Reveal at={phaseC + 6} from="up" dur={7}>
          <Big size={112}>
            Lava el{" "}
            <Marker at={tAceite - 2} color={C.oil}>
              aceite
            </Marker>
          </Big>
        </Reveal>
        <Reveal at={tCil - 6} from="up" style={{ marginTop: 8 }}>
          <Big size={92} color={C.dim}>
            de los cilindros
          </Big>
        </Reveal>
      </AbsoluteFill>
      <Flash at={tPeor} color="#ff3b3b" peak={0.35} dur={8} />
    </AbsoluteFill>
  );
};
