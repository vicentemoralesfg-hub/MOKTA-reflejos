import React from "react";
import * as THREE from "three";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import { useThree } from "@react-three/fiber";
import { BRAKE_T, CarState, JERK_T, ScenarioId, carAt, hazardBlink } from "../sim/car";
import { CamSpec, Pose, poseFor } from "./camera";
import { U } from "./materials";
import { Environment } from "./Environment";
import { Car } from "./Car";
import { Debris, SkidMarks, Smoke } from "./Effects";
import { Traffic } from "./Traffic";

export type StageProps = {
  scenario: ScenarioId;
  /** Tiempo del escenario (s). */
  t: number;
  /** Segundos de escenario por segundo de video (para el desenfoque de movimiento). 0 = congelado. */
  rate: number;
  cam: CamSpec;
  /** Tiempo de video (s) para vibraciones. */
  time: number;
  desat?: number;
  exposure?: number;
  effects?: boolean;
  /** Pose ya calculada (para que los gráficos superpuestos usen exactamente la misma). */
  pose?: Pose;
  children?: React.ReactNode;
};

const Rig: React.FC<{ pose: Pose; s: CarState; travel: number; desat: number; exposure: number; hazard: number }> = ({
  pose,
  s,
  travel,
  desat,
  exposure,
  hazard,
}) => {
  const camera = useThree((st) => st.camera) as THREE.PerspectiveCamera;
  camera.position.copy(pose.pos);
  camera.quaternion.copy(pose.quat);
  camera.fov = pose.fov;
  camera.near = 0.05;
  camera.far = 4000;
  camera.updateProjectionMatrix();
  camera.updateMatrixWorld();
  U.uCam.value.copy(pose.pos);
  U.uCarPos.value.set(s.x, 0, s.z);
  U.uCarFwd.value.set(Math.sin(s.heading), -Math.cos(s.heading));
  U.uBrake.value = s.brake;
  U.uHazard.value = hazard;
  U.uTravel.value = travel;
  U.uTravelDir.value.set(Math.sin(s.path), -Math.cos(s.path));
  U.uDesat.value = desat;
  U.uExposure.value = exposure;
  return null;
};

export const carStateFor = (scenario: ScenarioId, t: number) => carAt(scenario, t);

export const Stage: React.FC<StageProps> = ({ scenario, t, rate, cam, time, desat = 0, exposure = 1.25, effects = true, pose, children }) => {
  const { width, height } = useVideoConfig();
  const s = carAt(scenario, t);
  const p = pose ?? poseFor(cam, s, time);
  const hazardOn = s.hazard && hazardBlink(t);
  // recorrido del suelo respecto de la cámara durante ~medio fotograma (obturador 180°)
  const travel = cam.mode === "drone" ? (s.v * rate) / 30 * 0.5 : (s.v * rate) / 30 * 0.5;
  const skidFrom = scenario === "frena" ? BRAKE_T + 0.05 : scenario === "volantazo" ? JERK_T + 0.1 : null;
  return (
    <AbsoluteFill style={{ backgroundColor: "#07070c" }}>
      <ThreeCanvas
        width={width}
        height={height}
        flat
        gl={{ antialias: true, preserveDrawingBuffer: true }}
        camera={{ fov: 50, near: 0.05, far: 4000, position: [0, 2, 0] }}
        style={{ position: "absolute", inset: 0 }}
      >
        <Rig pose={p} s={s} travel={Math.min(travel, 0.9)} desat={desat} exposure={exposure} hazard={hazardOn ? 1 : 0} />
        <Environment cx={p.pos.x} cz={p.pos.z} />
        <Car s={s} look={{ showBlow: true, hazardOn, hidden: cam.mode === "pov", time }} />
        <Traffic scenario={scenario} t={t} />
        {effects ? (
          <>
            <Debris scenario={scenario} t={t} />
            {skidFrom !== null ? <SkidMarks scenario={scenario} from={skidFrom} t={t} minSlip={scenario === "volantazo" ? 0.05 : 0} /> : null}
            <Smoke scenario={scenario} t={t} skidFrom={skidFrom} />
          </>
        ) : null}
      </ThreeCanvas>
      {children}
    </AbsoluteFill>
  );
};

/** Viñeta + grano fílmico (determinista por fotograma). */
export const Grade: React.FC<{ grain?: number; vignette?: number }> = ({ grain = 0.06, vignette = 0.55 }) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <AbsoluteFill style={{ background: `radial-gradient(90% 62% at 50% 48%, rgba(0,0,0,0) 52%, rgba(0,0,0,${vignette}) 100%)` }} />
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0, opacity: grain, mixBlendMode: "overlay" }}>
        <filter id={`gr${frame}`}>
          <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" seed={frame % 89} />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter={`url(#gr${frame})`} />
      </svg>
    </AbsoluteFill>
  );
};
