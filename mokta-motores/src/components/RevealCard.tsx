import React from "react";
import { Img, interpolate, staticFile } from "remotion";
import { COLORS, FONT_DISPLAY, FONT_UI, Round } from "../config";
import { EASE_OUT, ramp } from "../lib/anim";

/**
 * Revelación: la foto del auto se abre desde el centro del visualizador (círculo que crece),
 * con la configuración en tipografía gigante, la ficha corta y la foto del motor en un recuadro.
 * f = fotogramas desde la revelación.
 */
export const RevealCard: React.FC<{ round: Round; f: number; total: number }> = ({ round, f, total }) => {
  const open = ramp(f, 0, 11, EASE_OUT);
  const radius = interpolate(open, [0, 1], [200, 760]);
  const zoom = interpolate(f, [0, total], [1.16, 1.04]);
  const title = ramp(f, 4, 14);
  const sub = ramp(f, 9, 19);
  const eng = ramp(f, 12, 24);
  const long = round.answer.length > 4;

  return (
    <>
      <div
        style={{
          position: "absolute",
          left: 40,
          top: 340,
          width: 1000,
          height: 690,
          borderRadius: 34,
          overflow: "hidden",
          clipPath: `circle(${radius}px at 50% 50%)`,
          boxShadow: "0 30px 80px rgba(0,0,0,0.6)",
          background: "#111",
        }}
      >
        <Img
          src={staticFile(round.img)}
          style={{ width: "100%", height: "100%", objectFit: "cover", scale: String(zoom) }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "linear-gradient(180deg, rgba(0,0,0,0) 38%, rgba(0,0,0,0.55) 62%, rgba(0,0,0,0.92) 100%)",
          }}
        />
        <div style={{ position: "absolute", left: 40, bottom: 34, right: 300 }}>
          <div
            style={{
              fontFamily: FONT_DISPLAY,
              fontWeight: 800,
              fontSize: long ? 150 : 240,
              lineHeight: 0.86,
              color: COLORS.white,
              letterSpacing: long ? 0 : 4,
              opacity: title,
              translate: `${interpolate(title, [0, 1], [-60, 0])}px 0px`,
              textShadow: "0 6px 30px rgba(0,0,0,0.6)",
              whiteSpace: "nowrap",
            }}
          >
            {round.answer}
          </div>
          <div
            style={{
              marginTop: 14,
              fontFamily: FONT_UI,
              fontWeight: 600,
              fontSize: 32,
              color: COLORS.accent2,
              opacity: sub,
              translate: `${interpolate(sub, [0, 1], [-30, 0])}px 0px`,
            }}
          >
            {round.spec}
          </div>
        </div>
      </div>
      {/* recuadro del motor */}
      <div
        style={{
          position: "absolute",
          right: 66,
          top: 372,
          width: 236,
          height: 236,
          borderRadius: "50%",
          overflow: "hidden",
          border: `6px solid ${COLORS.white}`,
          boxShadow: "0 16px 40px rgba(0,0,0,0.6)",
          opacity: eng,
          scale: String(interpolate(eng, [0, 1], [0.6, 1])),
          rotate: `${interpolate(eng, [0, 1], [-12, 0])}deg`,
          background: "#222",
        }}
      >
        <Img src={staticFile(round.engineImg)} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      </div>
      <div
        style={{
          position: "absolute",
          right: 66,
          top: 590,
          width: 236,
          display: "flex",
          justifyContent: "center",
          opacity: eng,
        }}
      >
        <div
          style={{
            fontFamily: FONT_UI,
            fontWeight: 800,
            fontSize: 22,
            letterSpacing: 4,
            color: "#06070A",
            background: COLORS.white,
            padding: "6px 16px",
            borderRadius: 999,
          }}
        >
          EL MOTOR
        </div>
      </div>
    </>
  );
};
