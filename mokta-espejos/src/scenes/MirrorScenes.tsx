import React from "react";
import { AbsoluteFill, interpolate } from "remotion";
import { COLORS, FONT_DISPLAY, FONT_UI } from "../config";
import { EASE_BACK, EASE_IN_OUT, EASE_OUT, kf, pulse, ramp, shake } from "../lib/anim";
import { T, at } from "../lib/timeline";
import { MIRROR_W, PAN_RIGHT, PAN_SLIVER, SideMirror } from "../components/SideMirror";
import { Backdrop, Icon, Pill, popIn } from "../components/Ui";

/** Ubicación del espejo grande en pantalla. */
const MX = 60;
const MY = 560;
const MW = 960;
const SC = MW / MIRROR_W;
/** Centro aproximado del costado del propio auto dentro del vidrio (coordenadas de pantalla, sin zoom). */
const BODY_SX = MX + 690 * SC;
const BODY_SY = MY + 330 * SC;

const ERROR_AT = at("error");

/** Gancho + "espacio perdido": de 0 a T.overlap. */
export const MirrorHook: React.FC<{ t: number }> = ({ t }) => {
  // Cámara: golpe de zoom al inicio, acercamiento al costado del auto en "Ese pedazo de auto".
  const punch = interpolate(t, [0, 0.55], [1.14, 1], { extrapolateRight: "clamp", easing: EASE_OUT });
  const zoom = kf(t, [
    [T.waste - 0.1, 1],
    [T.waste + 0.6, 1.3],
    [T.stays + 0.2, 1.3],
    [T.stays + 1.2, 1.22],
  ]);
  const sh = shake(t, ERROR_AT, 0.45, 14);
  const sh2 = shake(t, T.pct, 0.4, 10);
  const scale = punch * zoom;

  const pctK = popIn(t, T.pct - 0.05, T.waste - 0.1, 0.35);
  const count = Math.round(interpolate(t, [T.pct, T.pct + 0.55], [0, 95], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: EASE_OUT }));
  const waste = ramp(t, T.wasteWord, T.wasteWord + 0.35);
  const tagK = 1 - ramp(t, T.pct - 0.2, T.pct);

  // Alfiler "sigue ahí"
  const pinDrop = interpolate(t, [T.stays + 0.05, T.stays + 0.45], [-520, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: EASE_BACK,
  });
  const pinO = ramp(t, T.stays, T.stays + 0.1) * (1 - ramp(t, T.overlap - 0.25, T.overlap));

  // Zoom alrededor del auto: posiciones en pantalla tras el zoom
  const zx = (x: number) => BODY_SX + (x - BODY_SX) * zoom;
  const zy = (y: number) => BODY_SY + (y - BODY_SY) * zoom;
  const bodyLeft = zx(MX + 570 * SC);
  const bodyRight = zx(MX + 768 * SC);
  const mirrorTopZ = zy(MY + 60 * SC);
  const bracketK = ramp(t, T.wasteWord + 0.15, T.wasteWord + 0.5);

  return (
    <AbsoluteFill>
      <Backdrop t={t} glow={COLORS.red} glowY={880} />
      <AbsoluteFill
        style={{
          transformOrigin: `${BODY_SX}px ${BODY_SY}px`,
          transform: `translate(${sh.x + sh2.x}px, ${sh.y + sh2.y}px) scale(${scale})`,
        }}
      >
        <div style={{ position: "absolute", left: MX, top: MY }}>
          <SideMirror t={t} pan={0} width={MW} bodyAlert={1} waste={waste} tilt={-4} />
        </div>
      </AbsoluteFill>

      {/* "TU AUTO" (portada) */}
      {tagK > 0 ? (
        <div style={{ position: "absolute", left: BODY_SX - 175, top: 400, opacity: tagK }}>
          <div
            style={{
              fontFamily: FONT_DISPLAY,
              fontWeight: 800,
              fontSize: 76,
              color: COLORS.white,
              background: COLORS.red,
              padding: "8px 26px",
              borderRadius: 18,
              boxShadow: `0 0 40px ${COLORS.red}88`,
              transform: `scale(${1 + 0.05 * pulse(t, 0.7)})`,
              letterSpacing: 1,
            }}
          >
            TU AUTO
          </div>
          <svg width={140} height={210} style={{ position: "absolute", left: 120, top: 92 }}>
            <path d="M 40 6 Q 70 90 60 180" fill="none" stroke={COLORS.red} strokeWidth={10} strokeLinecap="round" />
            <path d="M 34 156 L 60 194 L 86 158" fill="none" stroke={COLORS.red} strokeWidth={10} strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      ) : null}

      {/* 95 % */}
      {pctK > 0 ? (
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: 160,
            textAlign: "center",
            transform: `scale(${0.6 + 0.4 * pctK})`,
            opacity: Math.min(1, pctK * 1.5),
          }}
        >
          <div
            style={{
              fontFamily: FONT_DISPLAY,
              fontWeight: 800,
              fontSize: 250,
              lineHeight: 0.9,
              color: COLORS.yellow,
              textShadow: `0 10px 0 rgba(0,0,0,0.55), 0 0 60px ${COLORS.yellow}55`,
            }}
          >
            {count}%
          </div>
          <div style={{ fontFamily: FONT_UI, fontWeight: 700, fontSize: 40, color: COLORS.white, letterSpacing: 2, marginTop: 6 }}>
            COMETE ESTE ERROR
          </div>
        </div>
      ) : null}

      {/* Espacio perdido: pastilla + corchete de medida */}
      <Pill t={t} from={T.wasteWord} until={T.stays - 0.1} x={540} y={250} color={COLORS.red} text="ESPACIO PERDIDO" icon="x" size={62} />
      {bracketK > 0 && t < T.overlap ? (
        <svg width={1080} height={600} style={{ position: "absolute", left: 0, top: 0, opacity: bracketK * (1 - ramp(t, T.stays - 0.1, T.stays + 0.1)) }}>
          <path
            d={`M ${bodyLeft} ${mirrorTopZ - 20} L ${bodyLeft} ${mirrorTopZ - 50} L ${bodyRight} ${mirrorTopZ - 50} L ${bodyRight} ${mirrorTopZ - 20}`}
            fill="none"
            stroke={COLORS.white}
            strokeWidth={6}
            strokeLinejoin="round"
          />
          <text
            x={(bodyLeft + bodyRight) / 2}
            y={mirrorTopZ - 72}
            textAnchor="middle"
            fontFamily={FONT_DISPLAY}
            fontWeight={800}
            fontSize={54}
            fill={COLORS.white}
          >
            ≈ 1/3 DEL ESPEJO
          </text>
        </svg>
      ) : null}

      {/* Alfiler: tu auto sigue ahí */}
      {pinO > 0 ? (
        <>
          <div style={{ position: "absolute", left: BODY_SX - 70, top: BODY_SY - 200 + pinDrop, opacity: pinO }}>
            <Icon kind="pin" size={140} color={COLORS.yellow} />
          </div>
          <Pill t={t} from={T.stays + 0.35} until={T.overlap - 0.25} x={540} y={250} color={COLORS.yellow} text="SIGUE AHÍ. SIEMPRE." icon="pin" size={62} />
        </>
      ) : null}
    </AbsoluteFill>
  );
};

/** "Vuelve a tu posición": el auto desaparece del espejo y aparece la pista de al lado. */
export const MirrorResult: React.FC<{ t: number; from: number }> = ({ t, from }) => {
  const pan = kf(t, [
    [from, PAN_SLIVER],
    [T.vanish, PAN_SLIVER],
    [T.vanish + 0.7, 270],
    [T.appears, 270],
    [T.appears + 0.55, PAN_RIGHT],
  ]);
  const enter = interpolate(t, [from, from + 0.35], [1.12, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: EASE_OUT });
  const drift = interpolate(t, [from, T.result], [1, 1.04], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: EASE_IN_OUT });
  const mark = ramp(t, T.appears + 0.45, T.appears + 0.8);
  const sliver = 1 - ramp(t, T.vanish, T.vanish + 0.3);
  const before = popIn(t, T.vanish + 0.1, Infinity, 0.35);
  const tilt = interpolate(pan, [PAN_SLIVER, PAN_RIGHT], [-2, 5]);

  return (
    <AbsoluteFill>
      <Backdrop t={t} glow={COLORS.green} glowY={900} />
      <AbsoluteFill style={{ transformOrigin: "540px 880px", transform: `scale(${enter * drift})` }}>
        <div style={{ position: "absolute", left: MX, top: MY + 40 }}>
          <SideMirror t={t} pan={pan} width={MW} sliver={sliver} blindCarMark={mark} tilt={tilt} />
        </div>
      </AbsoluteFill>
      <Pill t={t} from={from + 0.1} x={MX + 40} y={MY + 10} color={COLORS.green} text="AHORA" anchor="left" size={52} icon="check" />
      {/* Antes: miniatura del espejo mal ajustado */}
      {before > 0 ? (
        <div
          style={{
            position: "absolute",
            left: 96,
            top: 190,
            transformOrigin: "0% 0%",
            transform: `scale(${0.7 + 0.3 * before})`,
            opacity: Math.min(1, before * 1.4),
          }}
        >
          <SideMirror t={t} pan={0} width={400} bodyAlert={1} tilt={-4} />
          <div style={{ position: "absolute", left: 430, top: 70 }}>
            <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 800, fontSize: 64, color: COLORS.red, lineHeight: 1 }}>ANTES</div>
            <div style={{ fontFamily: FONT_UI, fontWeight: 600, fontSize: 34, color: COLORS.dim, marginTop: 8, lineHeight: 1.2 }}>
              un tercio
              <br />
              era tu auto
            </div>
          </div>
        </div>
      ) : null}
      <Pill t={t} from={T.appears + 0.6} x={MX + MW - 30} y={MY + 10} color={COLORS.green} text="PISTA DE AL LADO" icon="eye" size={52} anchor="right" />
    </AbsoluteFill>
  );
};
