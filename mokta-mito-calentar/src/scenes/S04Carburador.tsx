import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { C, FONT_DISPLAY } from "../config";
import { Carburetor } from "../art/Carburetor";
import { Big, Chapter, Reveal, Sub } from "../components/Text";
import { map, noise1, rand, ramp } from "../lib/anim";
import { beat, cue } from "../timeline";

/** Look de película antigua: sepia, parpadeo, rayas y vaivén del cuadro. */
const OldFilm: React.FC<{ f: number }> = ({ f }) => {
  const k = Math.floor(f / 2);
  const lines = [];
  for (let i = 0; i < 3; i++) {
    if (rand(k * 3.7 + i) > 0.55) {
      lines.push(
        <div
          key={i}
          style={{
            position: "absolute",
            top: 0,
            bottom: 0,
            left: rand(k * 1.9 + i * 5) * 1080,
            width: 2 + rand(k + i) * 2,
            background: "rgba(255,240,210,0.18)",
          }}
        />,
      );
    }
  }
  const dust = [];
  for (let i = 0; i < 6; i++) {
    if (rand(k * 5.1 + i * 2) > 0.6) {
      dust.push(
        <div
          key={i}
          style={{
            position: "absolute",
            left: rand(k * 2.3 + i) * 1080,
            top: rand(k * 4.1 + i) * 1920,
            width: 3 + rand(i + k) * 8,
            height: 3 + rand(i * 3 + k) * 8,
            borderRadius: "50%",
            background: "rgba(20,12,4,0.55)",
          }}
        />,
      );
    }
  }
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      {lines}
      {dust}
      <AbsoluteFill style={{ background: "rgba(255,230,190,1)", opacity: 0.03 + 0.03 * rand(k * 8.8), mixBlendMode: "overlay" }} />
    </AbsoluteFill>
  );
};

export const S04Carburador: React.FC = () => {
  const f = useCurrentFrame();
  const D = beat("carburador").duration;
  const tCarb = cue("carburador", "carburador", 48);
  const tNecesitaban = cue("carburador", "necesitaban", 78);
  const tCalor = cue("carburador", "calor", 96);
  const weaveX = noise1(f / 3, 7) * 3;
  const weaveY = noise1(f / 3, 8) * 4;
  const flicker = 0.92 + 0.08 * rand(Math.floor(f / 2) * 1.7);
  const diagramIn = ramp(f, tCarb - 8, tCarb + 6);
  const zoom = map(f, [0, D], [1.0, 1.07]);
  const yearIn = ramp(f, 0, 8);
  return (
    <AbsoluteFill style={{ background: "#120C06" }}>
      <AbsoluteFill
        style={{
          transform: `translate(${weaveX}px, ${weaveY}px) scale(${zoom})`,
          filter: `brightness(${flicker})`,
        }}
      >
        <AbsoluteFill style={{ background: "radial-gradient(ellipse 80% 60% at 50% 55%, #4A3520 0%, #22170C 55%, #0E0904 100%)" }} />
        {/* diagrama */}
        <div
          style={{
            position: "absolute",
            left: 300,
            top: 770,
            width: 520,
            height: 620,
            opacity: diagramIn,
            transform: `translateY(${(1 - diagramIn) * 60}px) scale(${0.92 + 0.08 * diagramIn})`,
          }}
        >
          <Carburetor t={f} choke={1} labels={ramp(f, tCarb + 6, tCarb + 16)} />
        </div>
      </AbsoluteFill>

      <Chapter n="01" label="EL ORIGEN" color={C.sepia} at={0} />

      {/* sello de época */}
      <div
        style={{
          position: "absolute",
          right: 150,
          top: 790,
          transform: `rotate(8deg) scale(${0.8 + 0.2 * yearIn})`,
          opacity: yearIn * 0.95,
          border: `4px solid ${C.sepia}`,
          borderRadius: 14,
          padding: "6px 18px",
          fontFamily: FONT_DISPLAY,
          fontWeight: 800,
          fontSize: 64,
          color: C.sepia,
          letterSpacing: 2,
        }}
      >
        AÑOS 70
      </div>

      <AbsoluteFill style={{ alignItems: "center", top: 340 }}>
        <Reveal at={2} from="up" dur={7}>
          <Big size={84} color={C.sepia}>
            Este mito viene
            <br />
            de los autos con
          </Big>
        </Reveal>
        <Reveal at={tCarb - 4} from="slam" dur={7} style={{ marginTop: 10 }}>
          <Big size={176} color="#FFE2B0" glow="rgba(255,170,80,0.45)">
            carburador
          </Big>
        </Reveal>
      </AbsoluteFill>

      <AbsoluteFill style={{ alignItems: "center", top: 1405 }}>
        <Reveal at={tNecesitaban - 4} from="up">
          <Sub size={44} color="#F3E3C6">
            que sí necesitaban <span style={{ color: C.heat, fontWeight: 800 }}>calor</span>
          </Sub>
        </Reveal>
        <Reveal at={tCalor + 6} from="up" style={{ marginTop: 6 }}>
          <Sub size={34} color="rgba(243,227,198,0.7)" weight={500}>
            para mezclar bien la bencina con el aire
          </Sub>
        </Reveal>
      </AbsoluteFill>
      <OldFilm f={f} />
      <AbsoluteFill
        style={{
          background: "radial-gradient(ellipse 75% 60% at 50% 50%, rgba(0,0,0,0) 55%, rgba(10,5,0,0.75) 100%)",
          pointerEvents: "none",
        }}
      />
    </AbsoluteFill>
  );
};
