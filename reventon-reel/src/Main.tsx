import React from "react";
import { AbsoluteFill, staticFile, useCurrentFrame } from "remotion";
import { Audio } from "@remotion/media";
import { BRAKE_T, ScenarioId, carAt } from "./sim/car";
import { CamSpec, poseFor, shake3 } from "./world/camera";
import { Grade, Stage } from "./world/Stage";
import { PedalsInsert } from "./overlays/PedalsInsert";
import { Captions } from "./overlays/Captions";
import { Cockpit } from "./overlays/Cockpit";
import { Tele, TeleCues } from "./overlays/Tele";
import { Checklist, Flash, FreezeTint, RewindFx, Slam, SpeedHud, StepBadge, Tag } from "./overlays/Titles";
import { COL, FONT_D, FONT_UI } from "./overlays/style";
import { CUES as C, FPS, clamp01, easeInOut, lin, rise, we, ws } from "./tl";

/**
 * MOKTA · Reventón — composición completa (60 s, 9:16).
 * Un único mundo 3D (un solo contexto WebGL) que cambia de escenario, tiempo y cámara en cada plano;
 * los gráficos y subtítulos se dibujan encima con la misma proyección de cámara.
 */

type Shot3D = {
  kind: "3d";
  scenario: ScenarioId;
  t: number;
  rate: number;
  cam: CamSpec;
  desat?: number;
  exposure?: number;
  pov?: { grip?: number; squeeze?: number; warn?: boolean; shakePx?: number };
  tele?: TeleCues;
  zoom?: number;
  dim?: number;
};
type ShotFoot = { kind: "foot" };
type ShotCard = { kind: "card" };
type Shot = Shot3D | ShotFoot | ShotCard;

const EXPOSURE: Record<CamSpec["mode"], number> = { pov: 1.4, chase: 1.7, drone: 2.2, wheel: 1.6, low: 1.6 };

const freezeT1 = 2.3 + (C.freeze1 - C.drone1) * 0.85;
const freezeT2 = 2.3 + (C.freeze2 - C.drone2) * 0.95;
const volT0 = 0.95 + (C.volPov - C.vol1) * 0.17;
const volT1 = volT0 + (C.volDrone - C.volPov) * 0.4;
const volT2 = volT1 + (C.volFreeze - C.volDrone) * 1.3;
const step3End = 3.0 + (C.step4 - C.step3) * 1.45;

const shotAt = (T: number): Shot => {
  if (T < C.wheel) return { kind: "3d", scenario: "frena", t: T - C.burst1 + 1.0, rate: 1, cam: { mode: "pov", shake: 0.0035 }, pov: {} };
  if (T < C.pov2) {
    const t = T < 0.48 ? 0.95 + (T - C.wheel) : 1.03 + (T - 0.48) * 0.22;
    const kick = T > C.burst1 ? 0.07 * Math.exp(-(T - C.burst1) * 5) : 0;
    return { kind: "3d", scenario: "frena", t, rate: T < 0.48 ? 1 : 0.22, cam: { mode: "wheel", shake: 0.006 + kick } };
  }
  if (T < C.brakeChase) {
    const t = 1.4 + (T - C.pov2) * 0.38;
    return { kind: "3d", scenario: "frena", t, rate: 0.38, cam: { mode: "pov", shake: 0.016 }, pov: { warn: true, shakePx: 7 } };
  }
  if (T < C.drone1) {
    return { kind: "3d", scenario: "frena", t: 1.86 + (T - C.brakeChase) * 0.8, rate: 0.8, cam: { mode: "chase", dist: 6.2, height: 1.15, lookAhead: 8, fov: 44, shake: 0.015 } };
  }
  if (T < C.rewind) {
    const frozen = T >= C.freeze1;
    const t = frozen ? freezeT1 : 2.3 + (T - C.drone1) * 0.85;
    return {
      kind: "3d",
      scenario: "frena",
      t,
      rate: frozen ? 0 : 0.85,
      cam: { mode: "drone", height: frozen ? lin(T, C.freeze1, C.rewind, 21, 18.5) : 21, ahead: -1.2, tilt: 0.2 },
      desat: frozen ? 0.85 * rise(T, C.freeze1, C.freeze1 + 0.15) : 0,
    };
  }
  if (T < C.pov3) {
    const k = easeInOut((T - C.rewind) / (C.pov3 - C.rewind));
    return { kind: "3d", scenario: "frena", t: freezeT1 + (0.55 - freezeT1) * k, rate: 2.5, cam: { mode: "drone", height: 18.5 + k * 3, ahead: -1.2, tilt: 0.2 }, desat: 0.35 };
  }
  if (T < C.burst2) {
    return { kind: "3d", scenario: "frena", t: T - C.burst2 + 1.0, rate: 1, cam: { mode: "pov", shake: 0.003, fov: lin(T, C.pov3, C.burst2, 62, 57) }, pov: {} };
  }
  if (T < C.dronePull) {
    const jolt = 0.055 * Math.exp(-(T - C.burst2) * 3.2);
    return { kind: "3d", scenario: "frena", t: 1.0 + (T - C.burst2), rate: 1, cam: { mode: "pov", shake: 0.014 + jolt, fov: 57 }, pov: { warn: true, shakePx: 6 + 60 * jolt } };
  }
  if (T < C.foot) {
    return {
      kind: "3d",
      scenario: "frena",
      t: 1.05 + (T - C.dronePull) * 0.55,
      rate: 0.55,
      cam: { mode: "drone", height: 18, ahead: -0.5, tilt: 0.1 },
      tele: { ring: ws(30) + 0.05, pull: ws(33) },
    };
  }
  if (T < C.chaseBrake) return { kind: "foot" };
  if (T < C.drone2) {
    return { kind: "3d", scenario: "frena", t: 1.88 + (T - C.chaseBrake) * 0.9, rate: 0.9, cam: { mode: "chase", dist: 7.5, height: 1.8, side: 0.6, shake: 0.02 } };
  }
  if (T < C.porque) {
    const frozen = T >= C.freeze2;
    return {
      kind: "3d",
      scenario: "frena",
      t: frozen ? freezeT2 : 2.3 + (T - C.drone2) * 0.95,
      rate: frozen ? 0 : 0.95,
      cam: { mode: "drone", height: 25, ahead: 0.5, tilt: 0.25 },
      desat: frozen ? 0.6 : 0,
    };
  }
  if (T < C.tele1) {
    return { kind: "3d", scenario: "frena", t: freezeT2, rate: 0, cam: { mode: "drone", height: lin(T, C.porque, C.tele1, 25, 22), ahead: 0.5, tilt: 0.25 }, desat: 0.9, dim: 0.55 };
  }
  if (T < C.tele2) {
    return {
      kind: "3d",
      scenario: "frena",
      t: 0.95 + (T - C.tele1) * 0.28,
      rate: 0.28,
      cam: { mode: "drone", height: 22, ahead: -1.7, tilt: 0.0 },
      desat: 0.3,
      tele: { ring: ws(66), drag: ws(68), pull: ws(70) },
    };
  }
  if (T < C.vol1) {
    return {
      kind: "3d",
      scenario: "frena",
      t: 1.87 + (T - C.tele2) * 0.55,
      rate: 0.55,
      cam: { mode: "drone", height: 23, ahead: -1.7, tilt: 0.0 },
      desat: 0.3,
      tele: { ring: C.tele2 - 1, brake: ws(78), weight: ws(81), spin: ws(86) },
    };
  }
  if (T < C.volPov) {
    return { kind: "3d", scenario: "volantazo", t: 0.95 + (T - C.vol1) * 0.17, rate: 0.17, cam: { mode: "chase", dist: 8, height: 2.3, side: -0.6 } };
  }
  if (T < C.volDrone) {
    return { kind: "3d", scenario: "volantazo", t: volT0 + (T - C.volPov) * 0.4, rate: 0.4, cam: { mode: "pov", shake: 0.02, fov: 60 }, pov: { warn: true, shakePx: 8 } };
  }
  if (T < C.queHaces) {
    const frozen = T >= C.volFreeze;
    return {
      kind: "3d",
      scenario: "volantazo",
      t: frozen ? volT2 : volT1 + (T - C.volDrone) * 1.3,
      rate: frozen ? 0 : 1.3,
      cam: { mode: "drone", height: 24, ahead: 4, tilt: 0.15 },
      desat: frozen ? 0.8 : 0,
    };
  }
  if (T < C.step1) return { kind: "card" };
  if (T < C.step2) {
    const sq = T > ws(108) ? 0.5 + 0.5 * Math.sin((T - ws(108)) * 9) : 0;
    return {
      kind: "3d",
      scenario: "correcto",
      t: 1.15 + (T - C.step1) * 0.6,
      rate: 0.6,
      cam: { mode: "pov", shake: 0.012, fov: 60 },
      pov: { grip: rise(T, ws(107), ws(107) + 0.3), squeeze: sq, warn: true, shakePx: 4 },
    };
  }
  if (T < C.step3) {
    return { kind: "3d", scenario: "correcto", t: 2.2 + (T - C.step2), rate: 1, cam: { mode: "drone", height: 21, ahead: 2.2, tilt: 0.12 }, tele: { lane: ws(117) } };
  }
  if (T < C.step4) {
    return { kind: "3d", scenario: "correcto", t: 3.0 + (T - C.step3) * 1.45, rate: 1.45, cam: { mode: "chase", dist: 8.5, height: 2.1, side: -1.2 } };
  }
  if (T < C.close) {
    const tb = ws(140);
    const t = T < tb ? lin(T, C.step4, tb, step3End, 10.0) : 10.0 + (T - tb) * ((15.2 - 10.0) / (C.close - tb));
    return { kind: "3d", scenario: "correcto", t, rate: 1, cam: { mode: "chase", dist: 11, height: 4.2, side: 1.4, lookAhead: 3 } };
  }
  const tEnd = 15.2 + (T - C.close);
  const k = clamp01((T - C.close) / (60 - C.close));
  return {
    kind: "3d",
    scenario: "correcto",
    t: tEnd,
    rate: 0,
    cam: { mode: "drone", height: 13 + 14 * easeInOut(k), ahead: 0, tilt: 0.38 - 0.2 * k, yaw: 0.35 * k },
    dim: T < C.end ? 0.5 : lin(T, C.end, C.end + 0.6, 0.5, 0.72),
  };
};

/** Tarjeta "Entonces, ¿qué haces?": negro con estelas de luz de carretera. */
const QueHacesCard: React.FC<{ T: number }> = ({ T }) => {
  const k = T - C.queHaces;
  return (
    <AbsoluteFill style={{ background: "radial-gradient(80% 50% at 50% 50%, #12131c 0%, #050508 70%)" }}>
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
        {Array.from({ length: 16 }, (_, i) => {
          const y = 300 + ((i * 197) % 1300);
          const sp = 900 + ((i * 331) % 700);
          const x = ((k * sp + i * 413) % 1700) - 300;
          const col = i % 3 === 0 ? "rgba(255,178,30,0.55)" : "rgba(255,255,255,0.25)";
          return <rect key={i} x={x} y={y} width={240 + (i % 4) * 90} height={3 + (i % 3)} rx={2} fill={col} />;
        })}
      </svg>
      <Slam T={T} at={ws(103) - 0.02} until={C.step1} text="ENTONCES…" color={COL.white} size={130} y={720} rotate={0} />
      <Slam T={T} at={ws(104) - 0.03} until={C.step1} text="¿QUÉ HACES?" color={COL.amber} size={235} y={960} rotate={-2} />
    </AbsoluteFill>
  );
};

const Kicker: React.FC<{ text: string; o: number; color?: string }> = ({ text, o, color = COL.white }) => (
  <div
    style={{
      position: "absolute",
      left: 0,
      right: 0,
      top: 236,
      display: "flex",
      justifyContent: "center",
      opacity: o,
      pointerEvents: "none",
    }}
  >
    <div
      style={{
        fontFamily: FONT_UI,
        fontWeight: 700,
        fontSize: 34,
        letterSpacing: 4,
        color,
        background: "rgba(7,8,12,0.55)",
        border: `2px solid ${color}55`,
        borderRadius: 40,
        padding: "12px 28px",
      }}
    >
      {text}
    </div>
  </div>
);

/** Cierre tipográfico. */
const Closing: React.FC<{ T: number }> = ({ T }) => {
  const a = rise(T, ws(150) - 0.03, ws(150) + 0.25);
  const b = rise(T, ws(155) - 0.03, ws(155) + 0.22);
  const hit = rise(T, ws(158) - 0.02, ws(158) + 0.12);
  if (T >= C.end) return null;
  return (
    <AbsoluteFill style={{ pointerEvents: "none", fontFamily: FONT_D, fontWeight: 800, textAlign: "center" }}>
      <div
        style={{
          position: "absolute",
          left: 60,
          right: 60,
          top: 640 - 120 * b,
          fontSize: 118 - 30 * b,
          lineHeight: 0.95,
          color: b > 0 ? COL.dim : COL.white,
          opacity: a,
          transform: `translateY(${(1 - a) * 40}px)`,
          textShadow: "0 8px 40px rgba(0,0,0,0.8)",
        }}
      >
        NO ES NO FRENAR NUNCA.
      </div>
      <div
        style={{
          position: "absolute",
          left: 40,
          right: 40,
          top: 700,
          fontSize: 150,
          lineHeight: 0.92,
          color: COL.white,
          opacity: b,
          transform: `scale(${1 + 0.25 * (1 - b)})`,
          textShadow: "0 8px 40px rgba(0,0,0,0.8)",
        }}
      >
        ES NO FRENAR
        <br />
        <span style={{ color: COL.red, display: "inline-block", transform: `scale(${1 + 0.2 * (1 - hit) * hit * 4})`, textShadow: `0 0 50px ${COL.red}88` }}>DE GOLPE.</span>
      </div>
    </AbsoluteFill>
  );
};

const EndCard: React.FC<{ T: number }> = ({ T }) => {
  if (T < C.end) return null;
  const a = rise(T, ws(160) - 0.05, ws(160) + 0.3);
  const fill = rise(T, ws(160) + 0.15, ws(160) + 0.45);
  const b = rise(T, ws(161) - 0.05, ws(161) + 0.35);
  const m = rise(T, we(164) + 0.03, we(164) + 0.45);
  const bounce = 1 + 0.18 * Math.sin(clamp01((T - ws(160)) / 0.35) * Math.PI);
  return (
    <AbsoluteFill style={{ pointerEvents: "none", fontFamily: FONT_D, fontWeight: 800, textAlign: "center", color: COL.white }}>
      <div style={{ position: "absolute", left: 0, right: 0, top: 560, display: "flex", flexDirection: "column", alignItems: "center", opacity: a }}>
        <svg width={170} height={210} viewBox="0 0 170 210" style={{ transform: `scale(${bounce})`, filter: "drop-shadow(0 0 30px rgba(255,178,30,0.6))" }}>
          <path d="M 20 14 L 150 14 L 150 196 L 85 148 L 20 196 Z" fill={fill > 0 ? COL.amber : "none"} fillOpacity={fill} stroke={COL.amber} strokeWidth={14} strokeLinejoin="round" />
        </svg>
        <div style={{ fontSize: 190, lineHeight: 1, marginTop: 30, textShadow: "0 8px 40px rgba(0,0,0,0.8)" }}>GUÁRDALO.</div>
      </div>
      <div style={{ position: "absolute", left: 60, right: 60, top: 1150, fontSize: 86, lineHeight: 1, color: COL.dim, opacity: b, transform: `translateY(${(1 - b) * 30}px)` }}>
        Ojalá nunca lo necesites.
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 1420, opacity: m, fontSize: 64, letterSpacing: 14, color: COL.white }}>MOKTA</div>
    </AbsoluteFill>
  );
};

export const Main: React.FC<{ withAudio?: boolean }> = ({ withAudio = true }) => {
  const frame = useCurrentFrame();
  const T = frame / FPS;
  const shot = shotAt(T);

  let body: React.ReactNode = null;
  if (shot.kind === "3d") {
    const s = carAt(shot.scenario, shot.t);
    const pose = poseFor(shot.cam, s, T);
    const sh = shake3(T * 1.3, shot.pov?.shakePx ?? 0);
    body = (
      <AbsoluteFill style={{ transform: shot.zoom ? `scale(${shot.zoom})` : undefined }}>
        <Stage scenario={shot.scenario} t={shot.t} rate={shot.rate} cam={shot.cam} time={T} desat={shot.desat ?? 0} pose={pose} exposure={shot.exposure ?? EXPOSURE[shot.cam.mode]}>
          {shot.tele ? <Tele T={T} pose={pose} s={s} cues={shot.tele} /> : null}
          {shot.pov ? (
            <Cockpit steerRad={s.steer} kmh={s.v * 3.6} dx={sh.x} dy={sh.y} grip={shot.pov.grip} squeeze={shot.pov.squeeze} warn={shot.pov.warn && s.blown > 0} />
          ) : null}
          {shot.dim ? <AbsoluteFill style={{ background: `rgba(4,4,8,${shot.dim})` }} /> : null}
          <Grade />
        </Stage>
      </AbsoluteFill>
    );
  } else if (shot.kind === "foot") {
    body = (
      <>
        <PedalsInsert T={T} liftAt={C.footLift} slamAt={C.footSlam} />
        <Grade vignette={0.6} />
      </>
    );
  } else {
    body = <QueHacesCard T={T} />;
  }

  const hideCaptions = (T >= C.step1 && T < C.close) || T >= C.close;

  return (
    <AbsoluteFill style={{ backgroundColor: "#050508" }}>
      {body}

      {/* --- gancho --- */}
      <Kicker text="100 KM/H · CARRETERA" o={T < 2.2 ? 1 - rise(T, 1.9, 2.2) : 0} />
      <Flash T={T} at={C.burst1} dur={0.14} max={0.8} />
      <Slam T={T} at={ws(14) - 0.02} until={C.drone1 + 0.05} text="FRENAR" size={270} y={600} />
      <Slam T={T} at={C.freeze1} until={C.rewind} text="ERROR" size={300} y={640} rotate={-6} />
      <FreezeTint T={T < C.rewind ? T : -1} from={C.freeze1} />

      {/* --- rebobinado y repetición --- */}
      <RewindFx T={T} from={C.rewind} to={C.pov3} frame={frame} />
      {T >= C.pov3 && T < C.burst2 ? <SpeedHud kmh={100} o={rise(T, ws(29) - 0.1, ws(29) + 0.15)} y={560} /> : null}
      <Flash T={T} at={C.burst2} dur={0.18} max={0.9} />
      <Slam T={T} at={ws(45) - 0.02} until={C.drone2} text="FRENAR A FONDO" size={200} y={560} />
      <FreezeTint T={T >= C.freeze2 && T < C.tele1 ? T : -1} from={C.freeze2} color="rgba(40,40,60,0.25)" o={0.8} />

      {/* --- por qué --- */}
      <Slam T={T} at={ws(56) - 0.03} until={C.tele1 - 0.05} text="¿POR QUÉ?" color={COL.white} size={290} y={720} rotate={-2} />
      {T >= C.tele1 && T < C.vol1 ? (
        <div style={{ position: "absolute", left: 70, top: 160, fontFamily: FONT_UI, fontWeight: 700, fontSize: 30, letterSpacing: 4, color: COL.amber, background: "rgba(7,8,12,0.55)", borderRadius: 30, padding: "10px 22px" }}>
          ▶ REPETICIÓN
        </div>
      ) : null}

      {/* --- volantazo --- */}
      <Slam T={T} at={ws(101) - 0.03} until={C.queHaces} text="EL VOLANTAZO" size={210} y={560} rotate={-4} />
      <FreezeTint T={T >= C.volFreeze && T < C.queHaces ? T : -1} from={C.volFreeze} />

      {/* --- lo correcto --- */}
      {T >= C.step1 && T < C.close ? <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(4,5,9,0.72) 0%, rgba(4,5,9,0.45) 22%, rgba(4,5,9,0) 40%)", pointerEvents: "none" }} /> : null}
      {T >= C.step1 && T < C.step2 ? <StepBadge T={T} at={ws(106)} n={1} title="VOLANTE FIRME" sub="CON LAS DOS MANOS" subAt={ws(109)} /> : null}
      {T >= C.step2 && T < C.step3 ? <StepBadge T={T} at={ws(113)} n={2} title="MANTÉN EL AUTO RECTO" sub="SIN MOVIMIENTOS BRUSCOS" subAt={ws(118)} /> : null}
      {T >= C.step3 && T < C.step4 ? (
        <>
          <StepBadge T={T} at={ws(121)} n={3} title="SUELTA EL ACELERADOR" sub="Y DEJA QUE PIERDA VELOCIDAD SOLO" subAt={ws(128)} />
          <SpeedHud kmh={carAt("correcto", 3.0 + (T - C.step3) * 1.45).v * 3.6} o={rise(T, ws(122), ws(122) + 0.3)} y={820} color={COL.green} />
        </>
      ) : null}
      {T >= C.step4 && T < C.close ? (
        <>
          <div style={{ position: "absolute", left: 92, top: 210, fontFamily: FONT_UI, fontWeight: 700, fontSize: 36, letterSpacing: 3, color: COL.amber, opacity: rise(T, ws(134), ws(134) + 0.3) }}>
            Y CUANDO YA ESTÉ BAJO CONTROL:
          </div>
          <Checklist
            T={T}
            y={290}
            items={[
              { at: ws(140), text: "FRENA SUAVE" },
              { at: ws(142), text: "PON LAS BALIZAS" },
              { at: ws(146), text: "ORÍLLATE" },
            ]}
          />
          {T >= ws(147) ? <Tag x={92 + 110} y={290 + 3 * 106 + 64} text="DONDE SEA SEGURO" color={COL.white} o={rise(T, ws(147), ws(147) + 0.25)} size={40} /> : null}
        </>
      ) : null}

      {/* --- cierre --- */}
      {T >= C.close ? <Closing T={T} /> : null}
      <EndCard T={T} />

      {!hideCaptions ? <Captions T={T} y={shot.kind === "3d" && shot.pov ? 1180 : 1300} /> : null}
      {withAudio ? <Audio src={staticFile("audio/mezcla.wav")} /> : null}
    </AbsoluteFill>
  );
};

export const BRAKE_REF = BRAKE_T;
