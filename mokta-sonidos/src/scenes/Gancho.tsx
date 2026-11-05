import React from "react";
import { Audio } from "@remotion/media";
import { AbsoluteFill, Img, Sequence, interpolate, staticFile, useCurrentFrame } from "remotion";
import { COLORS, FONT_BLOCK, FONT_DISPLAY, HOOK_DURACION, RONDAS } from "../config";
import { Fondo } from "../components/Fondo";
import { EASE_IN, pop, ramp, shake } from "../lib";

const FOTOS = RONDAS.flatMap((r) => [r.a, r.b]);

export const Gancho: React.FC<{ conAudio?: boolean }> = ({ conAudio = true }) => {
  const f = useCurrentFrame();
  const titulo = pop(f, 6, 10, 200);
  const linea2 = pop(f, 22, 12, 200);
  const chip = pop(f, 40, 12, 180);
  const sac = shake(f, 6, 18, 12);
  const salida = ramp(f, HOOK_DURACION - 8, HOOK_DURACION, EASE_IN);
  const deriva = f * 3.2;

  return (
    <AbsoluteFill>
      <Fondo acento={COLORS.violet} acento2={COLORS.pink} velocidad={2} />

      {/* mosaico inclinado de los 6 autos */}
      <AbsoluteFill style={{ rotate: "-12deg", scale: "1.35", opacity: 0.55 * (1 - salida) }}>
        {[0, 1, 2].map((fila) => (
          <div
            key={fila}
            style={{
              position: "absolute",
              top: 120 + fila * 560,
              left: -300,
              display: "flex",
              gap: 26,
              translate: `${(fila % 2 === 0 ? -1 : 1) * deriva - (fila % 2 === 0 ? 0 : 400)}px 0px`,
            }}
          >
            {[...FOTOS, ...FOTOS].slice(fila * 2, fila * 2 + 6).map((a, i) => (
              <div
                key={i}
                style={{
                  width: 620,
                  height: 520,
                  borderRadius: 30,
                  overflow: "hidden",
                  border: `6px solid ${i % 2 ? COLORS.cyan : COLORS.pink}`,
                }}
              >
                <Img
                  src={staticFile(a.imagen)}
                  style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: a.encuadre }}
                />
              </div>
            ))}
          </div>
        ))}
      </AbsoluteFill>
      <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(11,8,32,0.2), rgba(11,8,32,0.75) 45%, rgba(11,8,32,0.2))" }} />

      <AbsoluteFill
        style={{
          justifyContent: "center",
          alignItems: "center",
          translate: `${sac.x}px ${sac.y + salida * -200}px`,
          opacity: 1 - salida,
        }}
      >
        <div
          style={{
            fontFamily: FONT_DISPLAY,
            fontSize: 210,
            lineHeight: 0.92,
            color: COLORS.white,
            textAlign: "center",
            letterSpacing: 3,
            scale: String(interpolate(titulo, [0, 1], [3, 1])),
            opacity: Math.min(1, titulo * 2),
            textShadow: `10px 10px 0 ${COLORS.pink}, 20px 20px 0 ${COLORS.violet}`,
            rotate: "-5deg",
          }}
        >
          ¿QUÉ AUTO
        </div>
        <div
          style={{
            fontFamily: FONT_DISPLAY,
            fontSize: 300,
            lineHeight: 0.92,
            color: COLORS.yellow,
            WebkitTextStroke: `10px ${COLORS.ink}`,
            paintOrder: "stroke fill",
            textShadow: `14px 14px 0 ${COLORS.cyan}`,
            scale: String(interpolate(linea2, [0, 1], [0, 1])),
            rotate: "-5deg",
          }}
        >
          ES?
        </div>
        <div
          style={{
            marginTop: 70,
            display: "flex",
            alignItems: "center",
            gap: 20,
            padding: "16px 36px 14px",
            background: COLORS.cyan,
            borderRadius: 999,
            fontFamily: FONT_BLOCK,
            fontSize: 50,
            color: COLORS.ink,
            boxShadow: `8px 8px 0 ${COLORS.pink}`,
            scale: String(chip),
            rotate: "2deg",
          }}
        >
          <svg width={58} height={58} viewBox="0 0 100 100">
            <path d="M14 38 H32 L56 18 V82 L32 62 H14 Z" fill={COLORS.ink} />
            <path d="M68 32 Q80 50 68 68" stroke={COLORS.ink} strokeWidth={9} fill="none" strokeLinecap="round" />
          </svg>
          SOLO POR SU SONIDO
        </div>
      </AbsoluteFill>

      {conAudio ? (
        <>
          <Audio src={staticFile("autos/hook_arranque.wav")} volume={0.42} />
          <Sequence from={6} layout="none">
            <Audio src={staticFile("sfx/hit.mp3")} volume={0.6} />
          </Sequence>
          <Sequence from={4} layout="none">
            <Audio src={staticFile("voz/hook.wav")} volume={1} />
          </Sequence>
        </>
      ) : null}
    </AbsoluteFill>
  );
};
