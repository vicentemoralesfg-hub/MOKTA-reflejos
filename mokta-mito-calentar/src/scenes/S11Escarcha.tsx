import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { C, FONT_UI } from "../config";
import { FrostLayer } from "../components/Overlays";
import { Big, Foot, Marker, Reveal } from "../components/Text";
import { Warning } from "../art/Icons";
import { EASE_IN_OUT, map, ramp } from "../lib/anim";
import { beat, cue } from "../timeline";

const GLASS = "polygon(15% 0%, 85% 0%, 100% 100%, 0% 100%)";

/** Vista desde el asiento: parabrisas escarchado que se despeja de abajo hacia arriba. */
export const S11Escarcha: React.FC = () => {
  const f = useCurrentFrame();
  const D = beat("escarcha").duration;
  const tPara = cue("escarcha", "parabrisas", 31);
  const tEsc = cue("escarcha", "escarchado", 54);
  const tPrim = cue("escarcha", "primero", 75);
  const tDesp = cue("escarcha", "despues", 95);
  const clear = map(f, [tPrim - 6, D - 8], [0, 1], EASE_IN_OUT);
  const zoom = map(f, [0, D], [1.0, 1.06]);
  const defrost = ramp(f, tPrim - 10, tPrim);
  return (
    <AbsoluteFill style={{ background: "#03050A" }}>
      {/* parabrisas */}
      <div
        style={{
          position: "absolute",
          left: 40,
          right: 40,
          top: 650,
          height: 640,
          clipPath: GLASS,
          overflow: "hidden",
          transform: `scale(${zoom})`,
          transformOrigin: "50% 100%",
        }}
      >
        {/* exterior: calle al amanecer */}
        <AbsoluteFill style={{ background: "linear-gradient(180deg, #1A2C50 0%, #5A4C6E 45%, #B4745A 62%, #2A2A36 64%, #12161F 100%)" }} />
        <svg viewBox="0 0 1000 640" width="100%" height="100%" style={{ position: "absolute", inset: 0 }} preserveAspectRatio="none">
          <path d="M 0 410 L 0 300 L 140 220 L 280 300 L 280 410 Z" fill="#0A101C" />
          <path d="M 700 410 L 700 260 L 850 170 L 1000 260 L 1000 410 Z" fill="#0A101C" />
          <rect x={60} y={320} width={36} height={44} fill="#FFC777" opacity={0.85} />
          <rect x={780} y={290} width={36} height={44} fill="#FFC777" opacity={0.85} />
          <path d="M 380 640 L 470 410 L 530 410 L 620 640 Z" fill="#1B2232" />
          <path d="M 497 420 L 503 420 L 512 640 L 488 640 Z" fill="#E8E2C8" opacity={0.6} />
        </svg>
        <FrostLayer clear={clear} />
        {/* limpiaparabrisas */}
        <div
          style={{
            position: "absolute",
            left: 120,
            bottom: 22,
            width: 420,
            height: 10,
            borderRadius: 5,
            background: "#05070B",
            transform: "rotate(-4deg)",
          }}
        />
        <div
          style={{
            position: "absolute",
            left: 560,
            bottom: 26,
            width: 380,
            height: 10,
            borderRadius: 5,
            background: "#05070B",
            transform: "rotate(-4deg)",
          }}
        />
      </div>
      {/* tablero */}
      <div
        style={{
          position: "absolute",
          left: -40,
          right: -40,
          top: 1270,
          height: 700,
          background: "linear-gradient(180deg, #121722 0%, #07090E 40%)",
          borderTopLeftRadius: "50% 70px",
          borderTopRightRadius: "50% 70px",
        }}
      />
      {/* desempañador encendido */}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 1196,
          display: "flex",
          justifyContent: "center",
          opacity: 0.25 + 0.75 * defrost,
        }}
      >
        <svg width={86} height={60} viewBox="0 0 43 30">
          <path d="M 3 26 Q 21.5 14 40 26" fill="none" stroke={defrost > 0.5 ? C.amber : C.dim} strokeWidth={3} strokeLinecap="round" />
          {[12, 21.5, 31].map((x) => (
            <path
              key={x}
              d={`M ${x} 18 q -3 -4 0 -8 q 3 -4 0 -8`}
              fill="none"
              stroke={defrost > 0.5 ? C.amber : C.dim}
              strokeWidth={2.6}
              strokeLinecap="round"
            />
          ))}
        </svg>
      </div>

      {/* etiqueta */}
      <div style={{ position: "absolute", top: 250, left: 0, right: 0, display: "flex", justifyContent: "center", opacity: ramp(f, 0, 8) }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 14,
            padding: "12px 26px",
            borderRadius: 999,
            background: "rgba(40,30,4,0.8)",
            border: `2px solid ${C.amber}88`,
            fontFamily: FONT_UI,
            fontWeight: 800,
            fontSize: 30,
            letterSpacing: 5,
            color: C.amber,
          }}
        >
          <Warning size={36} />
          LA EXCEPCIÓN
        </div>
      </div>

      <AbsoluteFill style={{ alignItems: "center", top: 345 }}>
        <Reveal at={3} from="up">
          <Big size={80} color={C.dim}>
            Solo espera más si el
          </Big>
        </Reveal>
        <Reveal at={tPara - 4} from="up" style={{ marginTop: 6 }}>
          <Big size={118}>parabrisas está</Big>
        </Reveal>
        <Reveal at={tEsc - 5} from="slam" dur={6} style={{ marginTop: 6 }}>
          <Big size={118}>
            <Marker at={tEsc - 1} color={C.frost}>
              escarchado
            </Marker>
          </Big>
        </Reveal>
      </AbsoluteFill>

      <AbsoluteFill style={{ alignItems: "center", top: 1300 }}>
        <Reveal at={tPrim - 4} from="up">
          <Big size={80}>Primero ver,</Big>
        </Reveal>
        <Reveal at={tDesp - 4} from="up">
          <Big size={80} color={C.green}>
            después partir
          </Big>
        </Reveal>
      </AbsoluteFill>
      <Foot at={tPrim} top={1474}>
        Frío extremo: 2–3 min como máximo · sigue el manual de tu auto
      </Foot>
    </AbsoluteFill>
  );
};
