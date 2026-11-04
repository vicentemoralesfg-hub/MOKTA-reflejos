import React from "react";
import { AbsoluteFill, interpolate } from "remotion";
import { COLORS, FONT_DISPLAY } from "../config";
import { EASE_IN_OUT, EASE_OUT, kf, pulse, ramp, shake, spline } from "../lib/anim";
import { T } from "../lib/timeline";
import { Camera, LANES, OUR, TopDown, worldToScreen } from "../components/TopDown";
import { MIRROR_L, MIRROR_R } from "../components/CarTop";
import { PAN_RIGHT, PAN_SLIVER, SideMirror } from "../components/SideMirror";
import { Flash, Pill, TopTitle, popIn } from "../components/Ui";

const LEAN_SHIFT = 0.83;
const camE: Camera = { ax: 540, ay: 640, fx: 540, fy: 1000, s: 0.85 };
const camI: Camera = { ax: 540, ay: 960, fx: 540, fy: 985, s: 2.5 };
const camO: Camera = { ax: 540, ay: 520, fx: 540, fy: 1000, s: 0.66 };
const camS: Camera = { ax: 600, ay: 860, fx: 470, fy: 1060, s: 1.55 };

const lerpCam = (a: Camera, b: Camera, k: number): Camera => ({
  ax: a.ax + (b.ax - a.ax) * k,
  ay: a.ay + (b.ay - a.ay) * k,
  fx: a.fx + (b.fx - a.fx) * k,
  fy: a.fy + (b.fy - a.fy) * k,
  s: a.s * Math.pow(b.s / a.s, k),
});

/** Vista del espejo según el ajuste efectivo v (0 mal, 1 bien) → desplazamiento del reflejo. */
const panOf = (v: number) =>
  interpolate(v, [-LEAN_SHIFT, 0, 1 - LEAN_SHIFT, 1], [-210, 0, PAN_SLIVER, PAN_RIGHT], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

/** Escena 1: el error (de T.overlap a T.fix). */
const phaseError = (t: number) => {
  const camIn: Camera = { ax: 540, ay: 760, fx: 540, fy: 980, s: 1.8 };
  const camLane: Camera = { ax: 540, ay: 700, fx: 450, fy: 1080, s: 1.0 };
  let cam = lerpCam(camIn, camE, ramp(t, T.overlap, T.overlap + 0.8, EASE_OUT));
  cam = { ...cam, s: cam.s * interpolate(t, [T.overlap + 0.8, T.fits], [1, 1.04], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) };
  cam = lerpCam(cam, camLane, ramp(t, T.change - 0.1, T.missed + 0.2, EASE_IN_OUT));

  const threatY = interpolate(t, [T.fits - 0.15, T.fits + 0.85], [2200, 1225], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: EASE_OUT,
  });
  const ourDx = kf(t, [
    [T.change + 0.1, 0],
    [T.missed + 0.05, -76],
    [T.missed + 0.5, -36],
    [T.fix, -30],
  ]);
  const ourRot = kf(t, [
    [T.change + 0.1, 0],
    [T.change + 0.7, -9],
    [T.missed + 0.05, -7],
    [T.missed + 0.5, 5],
    [T.fix, 2],
  ]);
  const sh = shake(t, T.missed, 0.6, 26);
  cam = { ...cam, ax: cam.ax + sh.x, ay: cam.ay + sh.y };
  const coneFade = 1 - 0.35 * ramp(t, T.fits, T.fits + 0.4) - 0.45 * ramp(t, T.change, T.change + 0.3);
  return {
    cam,
    props: {
      vL: 0,
      vR: 0,
      conesOpacity: coneFade,
      sideOpacityL: ramp(t, T.overlap + 0.2, T.overlap + 0.5),
      sideOpacityR: ramp(t, T.overlap + 0.35, T.overlap + 0.65),
      rearOpacity: ramp(t, T.central - 0.15, T.central + 0.15),
      highlightRear: ramp(t, T.central - 0.15, T.central + 0.15) * (1 - ramp(t, T.sides, T.sides + 0.3)),
      overlap: ramp(t, T.central + 0.25, T.central + 0.55) * (1 - 0.6 * ramp(t, T.blind - 0.2, T.blind + 0.2)),
      blindZones: ramp(t, T.blind - 0.05, T.blind + 0.3) * (1 - 0.45 * ramp(t, T.change, T.change + 0.4)),
      blindPulse: pulse(t, 0.6),
      ourDx,
      ourRot,
      brake: ramp(t, T.missed, T.missed + 0.05) * (1 - ramp(t, T.fix - 0.3, T.fix)),
      cars: [
        { id: "far", x: LANES[2], y: 140 - ((t - T.overlap) * 60) % 600, color: "#3E7BD6" },
        ...(t >= T.fits - 0.2 ? [{ id: "threat", x: LANES[0], y: threatY, color: COLORS.threat }] : []),
      ],
    },
  };
};

/** Escena 2: los dos pasos (de T.step1 a T.back + ~0.75). */
const phaseSteps = (t: number) => {
  const headDx = kf(t, [
    [T.step1 + 0.15, 0],
    [T.window + 0.25, -22],
    [T.step2 + 0.1, -22],
    [T.center + 0.35, 26],
    [T.back + 0.05, 26],
    [T.back + 0.6, 0],
  ]);
  const aL = ramp(t, T.openLeft + 0.1, T.barely + 0.25, EASE_IN_OUT);
  const aR = ramp(t, T.sameRight + 0.1, T.back - 0.25, EASE_IN_OUT);
  const leanL = Math.max(0, -headDx / 22);
  const leanR = Math.max(0, headDx / 26);
  const vL = aL - LEAN_SHIFT * leanL;
  const vR = aR - LEAN_SHIFT * leanR;
  const camStart: Camera = { ...camI, s: 1.9, ay: 900 };
  const cam = lerpCam(camStart, camI, ramp(t, T.step1, T.step1 + 0.6, EASE_OUT));
  return {
    cam,
    vL,
    vR,
    props: {
      vL,
      vR,
      aimL: aL * 14,
      aimR: aR * 14,
      conesOpacity: 0,
      interior: 1,
      headDx,
      sightL: ramp(t, T.step1 + 0.3, T.step1 + 0.6) * (1 - ramp(t, T.step2 + 0.1, T.step2 + 0.4)),
      sightR: ramp(t, T.step2 + 0.3, T.step2 + 0.6) * (1 - ramp(t, T.back, T.back + 0.2)),
      roadSpeed: 700,
    },
  };
};

/** Escena 3: resultado y adelantamiento (de T.result a T.still). */
const OVERTAKE_KEYS: [number, number][] = [
  [T.overtakes - 0.4, 2900],
  [T.rear + 0.1, 2050],
  [T.toMirror + 0.25, 1600],
  [T.toView + 0.2, 1000],
  [T.never + 1.1, 400],
  [T.still + 0.6, 40],
];
const phaseOvertake = (t: number) => {
  const camR: Camera = { ax: 540, ay: 640, fx: 540, fy: 1000, s: 0.9 };
  const cam = lerpCam(camR, camO, ramp(t, T.result + 0.1, T.overtakes + 0.4, EASE_IN_OUT));
  const v = ramp(t, T.result + 0.1, T.result + 0.75, EASE_IN_OUT);
  const carY = spline(t, OVERTAKE_KEYS);
  const inRear = t >= T.rear - 0.1 && t < T.toMirror + 0.15;
  const inSide = t >= T.toMirror + 0.15 && t < T.toView;
  const inView = t >= T.toView && t < T.never + 0.8;
  return {
    cam,
    carY,
    props: {
      vL: v,
      vR: v,
      sideGreen: v,
      blindZones: 1 - ramp(t, T.result + 0.3, T.result + 0.8),
      peripheral: ramp(t, T.toView - 0.35, T.toView) * 0.9,
      highlightRear: inRear ? 1 : 0,
      highlightSideL: inSide ? 1 : 0,
      highlightView: inView ? 1 : 0,
      cars: [{ id: "over", x: LANES[0], y: carY, color: COLORS.threat, mark: ramp(t, T.rear - 0.1, T.rear + 0.1) * (1 - ramp(t, T.still - 0.2, T.still)) }],
    },
  };
};

/** Escena 4: mirar sobre el hombro (de T.still a T.cta). */
const phaseShoulder = (t: number) => {
  const cam = lerpCam(camO, camS, ramp(t, T.still, T.still + 0.75, EASE_IN_OUT));
  const blinkOn = t > T.still + 0.4 && Math.floor((t - T.still) / 0.36) % 2 === 0 ? 1 : 0;
  return {
    cam,
    props: {
      vL: 1,
      vR: 1,
      sideGreen: 1,
      conesOpacity: 0.45,
      interior: ramp(t, T.still + 0.2, T.still + 0.6),
      headTurn: kf(t, [
        [T.shoulder - 0.15, 0],
        [T.shoulder + 0.35, -78],
      ]),
      shoulderCheck: ramp(t, T.shoulder + 0.15, T.shoulder + 0.45),
      blinkL: blinkOn,
    },
  };
};

export const TopDownScene: React.FC<{ t: number }> = ({ t }) => {
  let content: React.ReactNode = null;

  if (t < T.fix) {
    const { cam, props } = phaseError(t);
    const threat = worldToScreen(cam, LANES[0], 1225);
    const ourS = worldToScreen(cam, OUR.x - 70, 1000);
    const bangK = popIn(t, T.missed, T.fix - 0.1, 0.25);
    content = (
      <>
        <TopDown t={t} cam={cam} {...props} />
        <TopTitle t={t} from={T.central + 0.25} until={T.sides + 0.05} text="VEN CASI LO MISMO" color={COLORS.yellow} y={200} />
        <TopTitle t={t} from={T.blind - 0.05} until={T.fits - 0.1} text="2 PUNTOS CIEGOS" color={COLORS.red} y={200} />
        <Pill t={t} from={T.fits + 0.7} until={T.change + 0.1} x={threat.x} y={threat.y - 165} color={COLORS.threat} text="¿LO VES?" size={50} dark />
        {bangK > 0 ? (
          <div
            style={{
              position: "absolute",
              left: (threat.x + ourS.x) / 2 - 90,
              top: (threat.y + ourS.y) / 2 - 140,
              width: 180,
              height: 180,
              borderRadius: 90,
              background: COLORS.red,
              color: COLORS.white,
              fontFamily: FONT_DISPLAY,
              fontWeight: 800,
              fontSize: 150,
              lineHeight: "180px",
              textAlign: "center",
              transform: `scale(${bangK * (1 + 0.06 * pulse(t, 0.35))})`,
              boxShadow: `0 0 60px ${COLORS.red}`,
            }}
          >
            !
          </div>
        ) : null}
        <Flash t={t} at={T.missed} color={COLORS.red} max={0.45} dur={0.5} />
        {t > T.missed ? (
          <AbsoluteFill style={{ boxShadow: `inset 0 0 160px ${COLORS.red}`, opacity: 0.7 * (1 - ramp(t, T.fix - 0.3, T.fix)) * (0.6 + 0.4 * pulse(t, 0.4)) }} />
        ) : null}
      </>
    );
  } else if (t < T.result) {
    const { cam, props } = phaseSteps(t);
    const step2 = t >= T.step2 + 0.1;
    const backPhase = t >= T.back;
    const insetSide = step2 ? "right" : "left";
    const v = step2 ? props.vR : props.vL;
    const insetK = popIn(t, T.step1 + 0.2, T.back - 0.05, 0.3);
    const sliver =
      ramp(t, T.barely + 0.3, T.barely + 0.5) * (1 - ramp(t, T.step2, T.step2 + 0.1)) +
      ramp(t, T.back - 0.4, T.back - 0.2) * (step2 ? 1 : 0);
    const mirrorPos = worldToScreen(cam, OUR.x + (step2 ? MIRROR_R.x + 12 : MIRROR_L.x - 12), OUR.y + MIRROR_L.y);
    const rotating = step2 ? t > T.sameRight && t < T.back - 0.1 : t > T.openLeft && t < T.barely + 0.4;
    content = (
      <>
        <TopDown t={t} cam={cam} {...props} />
        {/* vista del espejo */}
        {insetK > 0 ? (
          <div
            style={{
              position: "absolute",
              left: 230,
              top: 168,
              transformOrigin: step2 ? "85% 100%" : "15% 100%",
              transform: `scale(${0.7 + 0.3 * insetK})`,
              opacity: Math.min(1, insetK * 1.5),
            }}
          >
            <SideMirror t={t} pan={panOf(v)} width={620} side={insetSide} sliver={sliver} bodyAlert={v < 0.1 ? 1 : 0} tilt={0} />
          </div>
        ) : null}
        {/* flecha de giro del espejo */}
        {rotating ? (
          <svg width={1080} height={1920} style={{ position: "absolute", left: 0, top: 0 }}>
            <g transform={`translate(${mirrorPos.x} ${mirrorPos.y}) scale(${step2 ? 1 : -1} 1)`}>
              <path d="M 40 70 A 70 70 0 0 0 70 -20" fill="none" stroke={COLORS.green} strokeWidth={10} strokeLinecap="round" />
              <path d="M 44 -16 L 72 -26 L 84 4" fill="none" stroke={COLORS.green} strokeWidth={10} strokeLinecap="round" strokeLinejoin="round" />
            </g>
          </svg>
        ) : null}
        <Pill t={t} from={T.step1 + 0.05} until={T.barely + 0.35} x={540} y={620} color={COLORS.accent} text="PASO 1 · CABEZA EN LA VENTANA" size={44} />
        <Pill t={t} from={T.step2 + 0.15} until={T.back - 0.05} x={540} y={620} color={COLORS.accent} text="PASO 2 · CABEZA AL CENTRO" size={44} />
        <Pill t={t} from={T.barely + 0.45} until={T.step2 + 0.05} x={540} y={620} color={COLORS.green} text="APENAS EL COSTADO" icon="check" size={44} />
        {backPhase ? <Pill t={t} from={T.back} x={540} y={420} color={COLORS.white} text="VUELVE A TU POSICIÓN" size={54} /> : null}
      </>
    );
  } else if (t < T.still) {
    const { cam, props, carY } = phaseOvertake(t);
    const car = worldToScreen(cam, LANES[0], carY);
    const trailK = ramp(t, T.never - 0.1, T.never + 0.3);
    const startS = worldToScreen(cam, LANES[0], 2400);
    content = (
      <>
        <TopDown t={t} cam={cam} {...props} />
        {trailK > 0 ? (
          <svg width={1080} height={1920} style={{ position: "absolute", left: 0, top: 0 }}>
            <line x1={car.x} y1={startS.y} x2={car.x} y2={car.y + 80} stroke={COLORS.green} strokeWidth={10} strokeLinecap="round" opacity={trailK * 0.9} strokeDasharray="2 18" />
          </svg>
        ) : null}
        <TopTitle t={t} from={T.result + 0.75} until={T.rear - 0.15} text="SIN PUNTOS CIEGOS" color={COLORS.green} y={200} />
        <Pill t={t} from={T.rear - 0.1} until={T.toMirror + 0.13} x={car.x} y={car.y - 150} color={COLORS.accent} text="RETROVISOR" icon="check" size={46} />
        <Pill t={t} from={T.toMirror + 0.15} until={T.toView - 0.02} x={car.x} y={car.y - 150} color={COLORS.green} text="ESPEJO" icon="check" size={46} />
        <Pill t={t} from={T.toView} until={T.never - 0.05} x={car.x + 10} y={car.y - 150} color={COLORS.green} text="TU VISTA" icon="eye" size={46} />
        <TopTitle t={t} from={T.never} until={T.still - 0.05} text="NUNCA DESAPARECE" color={COLORS.green} y={1110} />
      </>
    );
  } else {
    const { cam, props } = phaseShoulder(t);
    content = (
      <>
        <TopDown t={t} cam={cam} {...props} />
        <Pill t={t} from={T.still + 0.3} until={T.shoulder - 0.05} x={540} y={250} color={COLORS.yellow} text="ANTES DE CAMBIARTE" icon="warn" size={56} />
        <Pill t={t} from={T.shoulder} x={540} y={250} color={COLORS.yellow} text="MIRA SOBRE TU HOMBRO" icon="eye" size={56} />
      </>
    );
  }

  return <AbsoluteFill style={{ background: COLORS.ink }}>{content}</AbsoluteFill>;
};
