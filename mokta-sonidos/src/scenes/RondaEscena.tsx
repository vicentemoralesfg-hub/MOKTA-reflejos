import React from "react";
import { Audio } from "@remotion/media";
import { AbsoluteFill, Sequence, interpolate, staticFile, useCurrentFrame } from "remotion";
import {
  COLORS,
  CUENTA_PASO,
  FONT_BLOCK,
  FONT_DISPLAY,
  R_CARTAS_IN,
  R_SONIDO_IN,
  R_TITULO_FIN,
  Ronda,
  cuentaInicio,
  revelacion,
  rondaDuracion,
  sonidoFin,
} from "../config";
import { Fondo } from "../components/Fondo";
import { CARD_H, CARD_W, Tarjeta } from "../components/Tarjeta";
import { Ecualizador } from "../components/Ecualizador";
import { EASE_IN, pop, ramp, shake } from "../lib";

const CARD_A_Y = 330;
const CARD_B_Y = 1120;
const BANDA_Y = CARD_A_Y + CARD_H; // 850 → 1120: zona central

export const RondaEscena: React.FC<{ ronda: Ronda; conAudio?: boolean }> = ({ ronda, conAudio = true }) => {
  const f = useCurrentFrame();
  const dur = rondaDuracion(ronda);
  const sIn = R_SONIDO_IN;
  const sOut = sonidoFin(ronda);
  const cIn = cuentaInicio(ronda);
  const rev = revelacion(ronda);

  // ---------- título "RONDA N" ----------
  const slam = pop(f, 0, 12, 220);
  const tituloSale = ramp(f, R_TITULO_FIN - 6, R_TITULO_FIN + 6);
  const badge = pop(f, R_TITULO_FIN - 2, 14, 200);

  // ---------- tarjetas ----------
  const entraA = pop(f, R_CARTAS_IN, 14, 160);
  const entraB = pop(f, R_CARTAS_IN + 5, 14, 160);
  const sonando = f >= sIn && f < sOut;
  const pulso = sonando ? 0.5 + 0.5 * Math.sin(((f - sIn) / 30) * Math.PI * 4) : 0;
  const circulo = ramp(f, rev + 1, rev + 17);
  const check = pop(f, rev + 6, 9, 200);
  const apagar = ramp(f, rev, rev + 10);
  const sacudida = shake(f, rev, 16, 12);
  const salida = ramp(f, dur - 8, dur, EASE_IN);

  const esA = ronda.correcta === "A";
  const colorA = ronda.acento;
  const colorB = ronda.acento2;

  // ---------- banda central ----------
  const ecualizadorVis = ramp(f, sIn - 8, sIn + 4) * (1 - ramp(f, sOut - 2, sOut + 6));
  const pasoCuenta = Math.floor((f - cIn) / CUENTA_PASO); // 0,1,2
  const enCuenta = f >= cIn && f < rev;
  const numero = 3 - pasoCuenta;
  const popNumero = pop(f, cIn + pasoCuenta * CUENTA_PASO, 8, 260);
  const preguntaVis = ramp(f, sOut, sOut + 8) * (1 - ramp(f, rev, rev + 6));
  const flash = interpolate(f, [rev, rev + 2, rev + 8], [0, 0.85, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const tarjeta = (cual: "A" | "B") => {
    const esCorrecta = ronda.correcta === cual;
    const entra = cual === "A" ? entraA : entraB;
    const desde = cual === "A" ? -1200 : 1200;
    const y = cual === "A" ? CARD_A_Y : CARD_B_Y;
    const sx = esCorrecta ? sacudida.x : 0;
    const sy = esCorrecta ? sacudida.y : 0;
    const escala = esCorrecta ? 1 + ramp(f, rev, rev + 10) * 0.04 : 1 - apagar * 0.06;
    return (
      <div
        style={{
          position: "absolute",
          left: (1080 - CARD_W) / 2,
          top: y,
          translate: `${interpolate(entra, [0, 1], [desde, 0]) + sx + (cual === "A" ? -1 : 1) * salida * 1300}px ${sy}px`,
          rotate: `${(cual === "A" ? -2.5 : 2.5) * entra}deg`,
          scale: String(escala),
          zIndex: esCorrecta && f >= rev ? 3 : 2,
        }}
      >
        <Tarjeta
          auto={cual === "A" ? ronda.a : ronda.b}
          letra={cual}
          color={cual === "A" ? colorA : colorB}
          circulo={esCorrecta ? circulo : 0}
          check={esCorrecta ? check : 0}
          apagar={esCorrecta ? 0 : apagar}
          pulso={pulso * 0.8}
        />
      </div>
    );
  };

  return (
    <AbsoluteFill>
      <Fondo acento={ronda.acento} acento2={ronda.acento2} velocidad={sonando ? 2.4 : 1} />

      {/* insignia superior "RONDA N" */}
      <div
        style={{
          position: "absolute",
          top: 150,
          width: "100%",
          display: "flex",
          justifyContent: "center",
          opacity: f >= R_TITULO_FIN - 2 ? 1 - salida : 0,
          scale: String(badge),
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 18,
            padding: "10px 34px 6px",
            background: COLORS.white,
            borderRadius: 18,
            fontFamily: FONT_DISPLAY,
            fontSize: 70,
            color: COLORS.ink,
            letterSpacing: 2,
            boxShadow: `8px 8px 0 ${ronda.acento}`,
            rotate: "-2deg",
          }}
        >
          RONDA
          <span
            style={{
              background: ronda.acento,
              color: COLORS.ink,
              borderRadius: 12,
              padding: "0 18px",
            }}
          >
            {ronda.numero}
          </span>
          <span style={{ fontSize: 40, color: "#9A90B8", marginLeft: 6 }}>/3</span>
        </div>
      </div>

      {f >= R_CARTAS_IN - 2 ? (
        <>
          {tarjeta(esA ? "B" : "A")}
          {tarjeta(esA ? "A" : "B")}
        </>
      ) : null}

      {/* banda central: ecualizador / pregunta + cuenta */}
      <div
        style={{
          position: "absolute",
          top: BANDA_Y,
          height: CARD_B_Y - BANDA_Y,
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div style={{ position: "absolute", opacity: ecualizadorVis, scale: String(0.8 + 0.2 * ecualizadorVis) }}>
          <Ecualizador
            src={ronda.sonido}
            frame={f - sIn}
            activo={sonando}
            color={ronda.acento}
            color2={ronda.acento2}
          />
        </div>
        <div
          style={{
            position: "absolute",
            display: "flex",
            alignItems: "center",
            gap: 36,
            opacity: preguntaVis,
            scale: String(0.7 + 0.3 * pop(f, sOut, 10, 200)),
          }}
        >
          <div
            style={{
              fontFamily: FONT_DISPLAY,
              fontSize: 120,
              color: COLORS.white,
              letterSpacing: 2,
              textShadow: `6px 6px 0 ${ronda.acento}`,
              rotate: "-3deg",
            }}
          >
            ¿A O B?
          </div>
          {enCuenta ? (
            <div
              style={{
                width: 170,
                height: 170,
                borderRadius: 85,
                background: COLORS.yellow,
                border: `8px solid ${COLORS.white}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontFamily: FONT_DISPLAY,
                fontSize: 120,
                color: COLORS.ink,
                paddingTop: 8,
                scale: String(0.5 + 0.5 * popNumero),
                boxShadow: `0 0 40px ${COLORS.yellow}`,
              }}
            >
              {numero}
            </div>
          ) : null}
        </div>
      </div>

      {/* título a pantalla completa */}
      {f < R_TITULO_FIN + 8 ? (
        <AbsoluteFill
          style={{
            justifyContent: "center",
            alignItems: "center",
            opacity: 1 - tituloSale,
            scale: String(interpolate(slam, [0, 1], [2.6, 1]) * (1 - 0.3 * tituloSale)),
          }}
        >
          <div
            style={{
              fontFamily: FONT_DISPLAY,
              fontSize: 190,
              color: COLORS.white,
              lineHeight: 0.9,
              letterSpacing: 4,
              textShadow: `10px 10px 0 ${ronda.acento}`,
              rotate: "-4deg",
            }}
          >
            RONDA
          </div>
          <div
            style={{
              marginTop: 10,
              fontFamily: FONT_DISPLAY,
              fontSize: 420,
              lineHeight: 0.9,
              color: ronda.acento,
              WebkitTextStroke: `10px ${COLORS.white}`,
              textShadow: `14px 14px 0 ${ronda.acento2}`,
              rotate: "-4deg",
            }}
          >
            {ronda.numero}
          </div>
        </AbsoluteFill>
      ) : null}

      <AbsoluteFill style={{ backgroundColor: COLORS.white, opacity: flash, pointerEvents: "none" }} />

      {/* -------- audio -------- */}
      {conAudio ? (
        <>
          <Audio src={staticFile("sfx/whoosh.mp3")} volume={0.55} />
          <Sequence from={2} layout="none">
            <Audio src={staticFile(ronda.vozRonda)} volume={1} />
          </Sequence>
          <Sequence from={R_CARTAS_IN} layout="none">
            <Audio src={staticFile("sfx/whoosh2.mp3")} volume={0.45} />
          </Sequence>
          <Sequence from={sIn} durationInFrames={ronda.sonidoFrames} layout="none">
            <Audio src={staticFile(ronda.sonido)} volume={1} />
          </Sequence>
          <Sequence from={sOut + 1} layout="none">
            <Audio src={staticFile("voz/ab.wav")} volume={1} />
          </Sequence>
          {[0, 1, 2].map((i) => (
            <Sequence key={i} from={cIn + i * CUENTA_PASO} durationInFrames={10} layout="none">
              <Audio src={staticFile("sfx/pop.mp3")} volume={0.9} />
            </Sequence>
          ))}
          <Sequence from={rev} layout="none">
            <Audio src={staticFile("sfx/check.mp3")} volume={0.9} />
          </Sequence>
        </>
      ) : null}

      {/* número de ronda fantasma para dar textura */}
      <div
        style={{
          position: "absolute",
          right: -30,
          bottom: -60,
          fontFamily: FONT_BLOCK,
          fontSize: 360,
          color: "transparent",
          WebkitTextStroke: `3px ${ronda.acento}55`,
          opacity: 0.6 * (1 - salida),
          zIndex: 0,
        }}
      >
        0{ronda.numero}
      </div>
    </AbsoluteFill>
  );
};
