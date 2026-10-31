import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { C, FONT_DISPLAY, FONT_UI } from "../config";
import { Big, Marker, Reveal } from "../components/Text";
import { map, rand, ramp } from "../lib/anim";
import { beat, cue } from "../timeline";

/** Bucle abierto: "te voy a decir cuánto hay que esperar de verdad" — cronómetro con cifras borrosas. */
export const S03Teaser: React.FC = () => {
  const f = useCurrentFrame();
  const D = beat("teaser").duration;
  const tCuanto = cue("teaser", "cuanto", 14);
  const tVerdad = cue("teaser", "verdad", 36);
  const k = Math.floor(f / 2);
  const d1 = Math.floor(rand(k * 1.3) * 10);
  const d2 = Math.floor(rand(k * 2.7) * 10);
  const ringP = (f % 30) / 30;
  const glitch = rand(k * 9.1) > 0.8 ? (rand(k) - 0.5) * 16 : 0;
  const R = 230;
  const circ = 2 * Math.PI * R;
  const ringIn = ramp(f, 0, 10);
  const zoom = map(f, [0, D], [1, 1.06]);
  return (
    <AbsoluteFill
      style={{
        background: "radial-gradient(ellipse 80% 55% at 50% 52%, #10223F 0%, #070D1A 55%, #03050A 100%)",
        transform: `scale(${zoom})`,
      }}
    >
      <AbsoluteFill style={{ alignItems: "center", top: 290 }}>
        <Reveal at={0} from="up" dur={6}>
          <Big size={88} color={C.dim}>
            Te digo
          </Big>
        </Reveal>
        <Reveal at={tCuanto - 3} from="up" style={{ marginTop: 6 }}>
          <Big size={120}>cuánto hay que esperar</Big>
        </Reveal>
        <Reveal at={tVerdad - 4} from="slam" dur={6} style={{ marginTop: 14 }}>
          <Big size={150}>
            <Marker at={tVerdad - 1} color={C.green}>
              de verdad
            </Marker>
          </Big>
        </Reveal>
      </AbsoluteFill>

      <AbsoluteFill
        style={{ alignItems: "center", justifyContent: "center", top: 190, opacity: ringIn, transform: `scale(${0.85 + 0.15 * ringIn})` }}
      >
        <svg width={560} height={560} viewBox="-280 -280 560 560">
          <circle r={R} fill="rgba(5,10,20,0.6)" stroke="rgba(244,246,248,0.12)" strokeWidth={22} />
          <circle
            r={R}
            fill="none"
            stroke={C.green}
            strokeWidth={22}
            strokeLinecap="round"
            strokeDasharray={`${circ * 0.18} ${circ}`}
            strokeDashoffset={-circ * ringP}
            transform="rotate(-90)"
            opacity={0.9}
          />
          {Array.from({ length: 60 }).map((_, i) => (
            <line
              key={i}
              x1={0}
              y1={-R + 34}
              x2={0}
              y2={-R + (i % 5 === 0 ? 62 : 48)}
              stroke="rgba(244,246,248,0.35)"
              strokeWidth={i % 5 === 0 ? 4 : 2}
              transform={`rotate(${i * 6})`}
            />
          ))}
        </svg>
        <div
          style={{
            position: "absolute",
            display: "flex",
            alignItems: "baseline",
            gap: 8,
            transform: `translateX(${glitch}px)`,
          }}
        >
          <div
            style={{
              fontFamily: FONT_DISPLAY,
              fontWeight: 800,
              fontSize: 230,
              color: C.white,
              filter: "blur(13px)",
              fontVariantNumeric: "tabular-nums",
              textShadow: `0 0 40px ${C.green}`,
            }}
          >
            {d1}
            {d2}
          </div>
          <div style={{ fontFamily: FONT_UI, fontWeight: 700, fontSize: 64, color: C.green }}>s</div>
        </div>
        <div
          style={{
            position: "absolute",
            fontFamily: FONT_DISPLAY,
            fontWeight: 800,
            fontSize: 260,
            color: C.white,
            opacity: 0.92,
            textShadow: "0 8px 40px rgba(0,0,0,0.8)",
          }}
        >
          ?
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
