import React from "react";
import { AbsoluteFill, interpolate } from "remotion";
import { COLORS, FONT_DISPLAY, FONT_UI } from "../config";
import { EASE_IN_OUT, EASE_OUT, kf, pulse, ramp, shake } from "../lib/anim";
import { T } from "../lib/timeline";
import { MIRROR_W, PAN_RIGHT, PAN_SLIVER, SideMirror } from "../components/SideMirror";
import { Backdrop, Pill, popIn } from "../components/Ui";

/** Ubicación del espejo grande en pantalla. */
const MX = 60;
const MY = 560;
const MW = 960;
const SC = MW / MIRROR_W;
/** Centro aproximado del costado del propio auto dentro del vidrio (coordenadas de pantalla, sin zoom). */
const BODY_SX = MX + 690 * SC;
const BODY_SY = MY + 330 * SC;

/** "Ese pedazo de auto que ves en el espejo es espacio perdido" (de T.waste a T.overlap). */
export const MirrorWaste: React.FC<{ t: number }> = ({ t }) => {
  const a = T.waste;
  // Entra desde el rebobinado con un golpe de zoom y se acerca al costado del auto.
  const zoom = kf(t, [
    [a, 1.55],
    [a + 0.45, 1.18],
    [T.wasteWord - 0.1, 1.24],
    [T.wasteWord + 0.35, 1.32],
    [T.overlap, 1.36],
  ]);
  const sh = shake(t, T.wasteWord, 0.4, 12);
  const waste = ramp(t, T.wasteWord, T.wasteWord + 0.35);
  const tagK = popIn(t, a + 0.25, T.wasteWord - 0.1, 0.3);

  const zx = (x: number) => BODY_SX + (x - BODY_SX) * zoom;
  const zy = (y: number) => BODY_SY + (y - BODY_SY) * zoom;
  const bodyLeft = zx(MX + 570 * SC);
  const bodyRight = Math.min(1040, zx(MX + 768 * SC));
  const mirrorTopZ = zy(MY + 60 * SC);
  const bracketK = ramp(t, T.wasteWord + 0.15, T.wasteWord + 0.5);

  return (
    <AbsoluteFill>
      <Backdrop t={t} glow={COLORS.red} glowY={880} />
      <AbsoluteFill
        style={{
          transformOrigin: `${BODY_SX}px ${BODY_SY}px`,
          transform: `translate(${sh.x}px, ${sh.y}px) scale(${zoom})`,
        }}
      >
        <div style={{ position: "absolute", left: MX, top: MY }}>
          <SideMirror t={t} pan={0} width={MW} bodyAlert={0.8 + 0.2 * pulse(t, 0.6)} waste={waste} tilt={-4} />
        </div>
      </AbsoluteFill>

      {tagK > 0 ? (
        <div style={{ position: "absolute", left: BODY_SX - 175, top: 300, opacity: Math.min(1, tagK * 1.4), transform: `scale(${0.7 + 0.3 * tagK})` }}>
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
              letterSpacing: 1,
            }}
          >
            TU AUTO
          </div>
          <svg width={140} height={240} style={{ position: "absolute", left: 120, top: 92 }}>
            <path d="M 40 6 Q 70 110 60 210" fill="none" stroke={COLORS.red} strokeWidth={10} strokeLinecap="round" />
            <path d="M 34 186 L 60 224 L 86 188" fill="none" stroke={COLORS.red} strokeWidth={10} strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      ) : null}

      <Pill t={t} from={T.wasteWord} until={T.overlap - 0.1} x={540} y={240} color={COLORS.red} text="ESPACIO PERDIDO" icon="x" size={66} />
      {bracketK > 0 ? (
        <svg width={1080} height={700} style={{ position: "absolute", left: 0, top: 0, opacity: bracketK }}>
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
            fontSize={56}
            fill={COLORS.white}
          >
            ≈ 1/3 DEL ESPEJO
          </text>
        </svg>
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
      <Pill t={t} from={T.appears + 0.6} x={MX + MW - 30} y={MY + 10} color={COLORS.green} text="CARRIL DE AL LADO" icon="eye" size={52} anchor="right" />
    </AbsoluteFill>
  );
};
