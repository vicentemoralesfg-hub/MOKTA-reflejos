import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { C, FONT_DISPLAY, FONT_UI } from "../config";
import { CarScene } from "../art/CarScene";
import { Big, Reveal } from "../components/Text";
import { Bubble, Send } from "../art/Icons";
import { map, ramp } from "../lib/anim";
import { beat, cue } from "../timeline";

const TYPED = "Yo le daba 15 min 😅";

/** Cierre: pregunta para comentarios + compartir. El fondo vuelve al plano del gancho (bucle). */
export const S12Cta: React.FC = () => {
  const f = useCurrentFrame();
  const D = beat("cta").duration;
  const tCuantos = cue("cta", "cuantos", 14);
  const tCal = cue("cta", "calentabas", 36);
  const tLeo = cue("cta", "leo", 63);
  const typeStart = tLeo - 6;
  const chars = Math.floor(map(f, [typeStart, typeStart + 30], [0, [...TYPED].length]));
  const typed = [...TYPED].slice(0, chars).join("");
  const caret = Math.floor(f / 8) % 2 === 0;
  const boxIn = ramp(f, tCal + 6, tCal + 14);
  const shareIn = ramp(f, typeStart + 24, typeStart + 34);
  // el fondo vuelve exactamente al encuadre del primer fotograma (bucle del reel)
  const dim = map(f, [D - 14, D], [0.62, 0.0]);
  return (
    <AbsoluteFill>
      <CarScene t={map(f, [0, D], [-D, 0]) + 40} zoom={1} />
      <AbsoluteFill style={{ background: `rgba(3,5,10,${dim})` }} />
      <AbsoluteFill style={{ opacity: 1 - ramp(f, D - 12, D - 2) }}>
        <AbsoluteFill style={{ alignItems: "center", top: 320 }}>
          <Reveal at={2} from="up">
            <Big size={92} color={C.dim}>
              Y tú,
            </Big>
          </Reveal>
          <Reveal at={tCuantos - 4} from="slam" dur={6} style={{ marginTop: 6 }}>
            <Big size={128}>¿cuántos minutos</Big>
          </Reveal>
          <Reveal at={tCal - 6} from="up" style={{ marginTop: 6 }}>
            <Big size={128} color={C.ice} glow="rgba(120,200,255,0.45)">
              lo calentabas?
            </Big>
          </Reveal>
        </AbsoluteFill>

        <div
          style={{
            position: "absolute",
            left: 90,
            right: 150,
            top: 830,
            opacity: boxIn,
            transform: `translateY(${(1 - boxIn) * 30}px)`,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 20,
              padding: "22px 28px",
              borderRadius: 40,
              background: "rgba(244,246,248,0.96)",
              boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
            }}
          >
            <Bubble size={46} />
            <div style={{ flex: 1, fontFamily: FONT_UI, fontWeight: 600, fontSize: 40, color: chars > 0 ? C.ink : "rgba(5,7,11,0.45)" }}>
              {chars > 0 ? typed : "Comenta tus minutos…"}
              {chars > 0 && caret ? <span style={{ color: "#3D7BFF" }}>|</span> : null}
            </div>
          </div>
        </div>

        <AbsoluteFill style={{ alignItems: "center", top: 1010, opacity: shareIn }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 18,
              padding: "18px 30px",
              borderRadius: 26,
              background: "rgba(6,10,18,0.78)",
              border: "2px solid rgba(244,246,248,0.2)",
              fontFamily: FONT_UI,
              fontWeight: 700,
              fontSize: 36,
              color: C.white,
              transform: `translateY(${(1 - shareIn) * 24}px)`,
            }}
          >
            <Send size={42} />
            Mándaselo al que lo deja 10 min
          </div>
        </AbsoluteFill>

        <div
          style={{
            position: "absolute",
            top: 1430,
            left: 0,
            right: 0,
            textAlign: "center",
            fontFamily: FONT_DISPLAY,
            fontWeight: 700,
            fontSize: 44,
            letterSpacing: 20,
            color: "rgba(244,246,248,0.7)",
            opacity: ramp(f, 20, 34),
          }}
        >
          MOKTA
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
