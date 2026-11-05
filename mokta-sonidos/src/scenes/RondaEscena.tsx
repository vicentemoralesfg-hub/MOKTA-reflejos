import React from "react";
import { Audio } from "@remotion/media";
import { AbsoluteFill, Sequence, interpolate, staticFile, useCurrentFrame } from "remotion";
import { COLORS, CUENTA_PASO, FONT_BLOCK, FONT_DISPLAY, Ronda, archivoVoz, tiempos, voz } from "../config";
import { Fondo } from "../components/Fondo";
import { CARD_H, CARD_W, Tarjeta } from "../components/Tarjeta";
import { Ecualizador } from "../components/Ecualizador";
import { EASE_IN, pop, ramp, shake } from "../lib";

const CARD_A_Y = 330;
const CARD_B_Y = 1120;
const BANDA_Y = CARD_A_Y + CARD_H; // 850 → 1120: zona central

export const RondaEscena: React.FC<{ ronda: Ronda; conAudio?: boolean }> = ({ ronda, conAudio = true }) => {
  const f = useCurrentFrame();
  const T = tiempos(ronda);

  // ---------- título "RONDA N" ----------
  const slam = pop(f, 0, 12, 220);
  const tituloSale = ramp(f, T.titulo - 8, T.titulo + 4);
  const badge = pop(f, T.titulo - 4, 14, 200);

  // ---------- tarjetas ----------
  const entraA = pop(f, T.cartas, 14, 150);
  const entraB = pop(f, T.cartas + 6, 14, 150);
  const sonando = f >= T.sonido && f < T.sonidoFin;
  const pulso = sonando ? 0.5 + 0.5 * Math.sin(((f - T.sonido) / 30) * Math.PI * 3) : 0;
  const circulo = ramp(f, T.revela + 1, T.revela + 20);
  const check = pop(f, T.revela + 8, 9, 200);
  const datoVis = pop(f, T.vozRevela, 12, 200);
  const apagar = ramp(f, T.revela, T.revela + 12);
  const sacudida = shake(f, T.revela, 16, 12);
  const salida = ramp(f, T.fin - 9, T.fin, EASE_IN);

  // ---------- banda central ----------
  const ecualizadorVis = ramp(f, T.sonido - 10, T.sonido + 4) * (1 - ramp(f, T.sonidoFin - 2, T.sonidoFin + 6));
  const pasoCuenta = Math.floor((f - T.cuenta) / CUENTA_PASO); // 0,1,2
  const enCuenta = f >= T.cuenta && f < T.revela;
  const numero = 3 - pasoCuenta;
  const popNumero = pop(f, T.cuenta + pasoCuenta * CUENTA_PASO, 8, 260);
  const arco = enCuenta ? ((f - T.cuenta) % CUENTA_PASO) / CUENTA_PASO : 0;
  const preguntaVis = ramp(f, T.ab - 2, T.ab + 8) * (1 - ramp(f, T.revela, T.revela + 6));
  const flash = interpolate(f, [T.revela, T.revela + 2, T.revela + 9], [0, 0.6, 0], {
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
    const escala = esCorrecta ? 1 + ramp(f, T.revela, T.revela + 10) * 0.04 : 1 - apagar * 0.06;
    // mientras suena, las tarjetas "respiran" alternadas para invitar a elegir
    const respira = sonando ? Math.sin(((f - T.sonido) / 30) * Math.PI * 1.2 + (cual === "A" ? 0 : Math.PI)) * 0.012 : 0;
    return (
      <div
        style={{
          position: "absolute",
          left: (1080 - CARD_W) / 2,
          top: y,
          translate: `${interpolate(entra, [0, 1], [desde, 0]) + sx + (cual === "A" ? -1 : 1) * salida * 1300}px ${sy}px`,
          rotate: `${(cual === "A" ? -2.5 : 2.5) * entra}deg`,
          scale: String(escala + respira),
          zIndex: esCorrecta && f >= T.revela ? 3 : 2,
        }}
      >
        <Tarjeta
          auto={cual === "A" ? ronda.a : ronda.b}
          letra={cual}
          color={cual === "A" ? ronda.acento : ronda.acento2}
          circulo={esCorrecta ? circulo : 0}
          check={esCorrecta ? check : 0}
          apagar={esCorrecta ? 0 : apagar}
          pulso={pulso * 0.7}
          dato={esCorrecta ? ronda.dato : undefined}
          datoVis={esCorrecta ? datoVis : 0}
          frame={f}
        />
      </div>
    );
  };

  return (
    <AbsoluteFill>
      <Fondo acento={ronda.acento} acento2={ronda.acento2} velocidad={sonando ? 2.6 : 1} />

      {/* número de ronda fantasma, detrás de todo */}
      <div
        style={{
          position: "absolute",
          right: -30,
          bottom: -70,
          fontFamily: FONT_BLOCK,
          fontSize: 380,
          color: "transparent",
          WebkitTextStroke: `4px ${COLORS.ink}22`,
          opacity: 1 - salida,
        }}
      >
        0{ronda.numero}
      </div>

      {/* insignia superior "RONDA N" */}
      <div
        style={{
          position: "absolute",
          top: 150,
          width: "100%",
          display: "flex",
          justifyContent: "center",
          opacity: f >= T.titulo - 4 ? 1 - salida : 0,
          scale: String(badge),
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 18,
            padding: "10px 34px 6px",
            background: COLORS.ink,
            borderRadius: 18,
            fontFamily: FONT_DISPLAY,
            fontSize: 70,
            color: COLORS.white,
            letterSpacing: 2,
            boxShadow: `8px 8px 0 ${ronda.acento}`,
            rotate: "-2deg",
          }}
        >
          RONDA
          <span style={{ background: ronda.acento, color: COLORS.white, borderRadius: 12, padding: "0 18px" }}>
            {ronda.numero}
          </span>
          <span style={{ fontSize: 40, color: "#A79FC9", marginLeft: 6 }}>/3</span>
        </div>
      </div>

      {f >= T.cartas - 2 ? (
        <>
          {tarjeta(ronda.correcta === "A" ? "B" : "A")}
          {tarjeta(ronda.correcta)}
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
            frame={f - T.sonido}
            activo={sonando}
            color={ronda.acento}
            color2={ronda.acento2}
            progreso={ramp(f, T.sonido, T.sonidoFin, (x) => x)}
          />
        </div>
        <div
          style={{
            position: "absolute",
            display: "flex",
            alignItems: "center",
            gap: 40,
            opacity: preguntaVis,
            scale: String(0.7 + 0.3 * pop(f, T.ab - 2, 10, 200)),
          }}
        >
          <div
            style={{
              fontFamily: FONT_DISPLAY,
              fontSize: 128,
              color: COLORS.ink,
              letterSpacing: 2,
              textShadow: `7px 7px 0 ${ronda.acento}`,
              rotate: "-3deg",
            }}
          >
            ¿A O B?
          </div>
          <div
            style={{
              position: "relative",
              width: 180,
              height: 180,
              opacity: enCuenta ? 1 : 0,
              scale: String(0.55 + 0.45 * popNumero),
            }}
          >
            <svg width={180} height={180} viewBox="0 0 180 180" style={{ position: "absolute", inset: 0, rotate: "-90deg" }}>
              <circle cx={90} cy={90} r={80} fill={COLORS.yellow} stroke={COLORS.ink} strokeWidth={9} />
              <circle
                cx={90}
                cy={90}
                r={62}
                fill="none"
                stroke={COLORS.ink}
                strokeWidth={10}
                strokeLinecap="round"
                pathLength={1}
                strokeDasharray="1 1"
                strokeDashoffset={arco}
                opacity={0.25}
              />
            </svg>
            <div
              style={{
                position: "absolute",
                inset: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontFamily: FONT_DISPLAY,
                fontSize: 118,
                color: COLORS.ink,
                paddingTop: 8,
              }}
            >
              {Math.max(1, numero)}
            </div>
          </div>
        </div>
      </div>

      {/* título a pantalla completa */}
      {f < T.titulo + 6 ? (
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
              color: COLORS.ink,
              lineHeight: 0.9,
              letterSpacing: 4,
              textShadow: `10px 10px 0 ${ronda.acento}`,
              rotate: "-4deg",
            }}
          >
            {ronda.numero === 3 ? "ÚLTIMA" : "RONDA"}
          </div>
          <div
            style={{
              marginTop: 10,
              fontFamily: FONT_DISPLAY,
              fontSize: ronda.numero === 3 ? 260 : 420,
              lineHeight: 0.9,
              color: ronda.acento,
              WebkitTextStroke: `12px ${COLORS.ink}`,
              paintOrder: "stroke fill",
              textShadow: `14px 14px 0 ${COLORS.ink}`,
              rotate: "-4deg",
            }}
          >
            {ronda.numero === 3 ? "RONDA" : ronda.numero}
          </div>
        </AbsoluteFill>
      ) : null}

      <AbsoluteFill style={{ backgroundColor: COLORS.white, opacity: flash, pointerEvents: "none" }} />

      {/* -------- audio -------- */}
      {conAudio ? (
        <>
          <Audio src={staticFile("sfx/whoosh.mp3")} volume={0.5} />
          <Sequence from={T.vozRonda} layout="none">
            <Audio src={staticFile(archivoVoz(voz(ronda, "ronda")))} />
          </Sequence>
          <Sequence from={T.cartas} layout="none">
            <Audio src={staticFile("sfx/whoosh2.mp3")} volume={0.4} />
          </Sequence>
          <Sequence from={T.pregunta} layout="none">
            <Audio src={staticFile(archivoVoz(voz(ronda, "pregunta")))} />
          </Sequence>
          <Sequence from={T.sonido} durationInFrames={ronda.sonidoFrames} layout="none">
            <Audio src={staticFile(ronda.sonido)} />
          </Sequence>
          <Sequence from={T.ab} layout="none">
            <Audio src={staticFile(archivoVoz(voz(ronda, "ab")))} />
          </Sequence>
          {[0, 1, 2].map((i) => (
            <Sequence key={i} from={T.cuenta + i * CUENTA_PASO} durationInFrames={12} layout="none">
              <Audio src={staticFile("sfx/pop.mp3")} volume={0.9} />
            </Sequence>
          ))}
          <Sequence from={T.revela} layout="none">
            <Audio src={staticFile("sfx/check.mp3")} volume={0.85} />
          </Sequence>
          <Sequence from={T.vozRevela} layout="none">
            <Audio src={staticFile(archivoVoz(voz(ronda, "revela")))} />
          </Sequence>
        </>
      ) : null}
    </AbsoluteFill>
  );
};
