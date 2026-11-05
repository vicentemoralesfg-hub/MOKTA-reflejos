import * as THREE from "three";
import { CarState, fwd, localToWorld, right } from "../sim/car";

export type CamSpec =
  | { mode: "pov"; shake?: number; lookYaw?: number; pitch?: number; fov?: number }
  | { mode: "chase"; dist?: number; height?: number; side?: number; fov?: number; shake?: number; follow?: "path" | "body"; lookAhead?: number }
  | { mode: "drone"; height?: number; tilt?: number; ahead?: number; side?: number; fov?: number; yaw?: number }
  | { mode: "wheel"; shake?: number; fov?: number }
  | { mode: "low"; fov?: number; shake?: number };

export type Pose = { pos: THREE.Vector3; quat: THREE.Quaternion; fov: number };

const tmpM = new THREE.Matrix4();

const lookQuat = (eye: THREE.Vector3, target: THREE.Vector3, up: THREE.Vector3, roll = 0) => {
  tmpM.lookAt(eye, target, up);
  const q = new THREE.Quaternion().setFromRotationMatrix(tmpM);
  if (roll) q.multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 0, 1), roll));
  return q;
};

/** Vibración determinista (suma de senos inconmensurables). */
export const shake3 = (t: number, amp: number) => ({
  x: amp * (0.5 * Math.sin(t * 13.7) + 0.3 * Math.sin(t * 29.1 + 1.1) + 0.2 * Math.sin(t * 47.3 + 0.3)),
  y: amp * (0.55 * Math.sin(t * 17.3 + 0.7) + 0.3 * Math.sin(t * 37.9 + 2.0) + 0.15 * Math.sin(t * 61.1)),
  r: amp * (0.6 * Math.sin(t * 9.1 + 0.4) + 0.4 * Math.sin(t * 21.7 + 1.9)),
});

export const poseFor = (cam: CamSpec, s: CarState, time: number): Pose => {
  const UP = new THREE.Vector3(0, 1, 0);
  switch (cam.mode) {
    case "pov": {
      const [px, pz] = localToWorld(s, -0.37, 0.15);
      const sh = shake3(time, cam.shake ?? 0.004);
      const h = s.heading + (cam.lookYaw ?? 0);
      const [fx, fz] = fwd(h);
      const [rx, rz] = right(h);
      const eye = new THREE.Vector3(px + rx * sh.x, 1.18 + sh.y - s.pitch * 0.6 - s.roll * 0.4, pz + rz * sh.x);
      const pitch = (cam.pitch ?? -0.035) - s.pitch;
      const target = new THREE.Vector3(eye.x + fx * 10, eye.y + Math.tan(pitch) * 10, eye.z + fz * 10);
      return { pos: eye, quat: lookQuat(eye, target, UP, -s.roll * 1.4 + sh.r * 6), fov: cam.fov ?? 62 };
    }
    case "chase": {
      const h = cam.follow === "body" ? s.heading : s.path;
      const [fx, fz] = fwd(h);
      const [rx, rz] = right(h);
      const d = cam.dist ?? 7.2;
      const sd = cam.side ?? 0.0;
      const sh = shake3(time, cam.shake ?? 0.012);
      const eye = new THREE.Vector3(
        s.x - fx * d + rx * (sd + sh.x),
        (cam.height ?? 1.9) + sh.y,
        s.z - fz * d + rz * (sd + sh.x),
      );
      const la = cam.lookAhead ?? 5;
      const target = new THREE.Vector3(s.x + fx * la, 0.75, s.z + fz * la);
      return { pos: eye, quat: lookQuat(eye, target, UP, sh.r * 3), fov: cam.fov ?? 50 };
    }
    case "drone": {
      const H = cam.height ?? 18;
      const tilt = cam.tilt ?? 0.18;
      const ahead = cam.ahead ?? 4;
      const eye = new THREE.Vector3(s.x + (cam.side ?? 0), H, s.z - ahead + H * Math.tan(tilt));
      const target = new THREE.Vector3(s.x + (cam.side ?? 0), 0, s.z - ahead);
      const yaw = cam.yaw ?? 0;
      const up = new THREE.Vector3(Math.sin(yaw), 0, -Math.cos(yaw));
      return { pos: eye, quat: lookQuat(eye, target, up), fov: cam.fov ?? 40 };
    }
    case "wheel": {
      const sh = shake3(time, cam.shake ?? 0.01);
      const [ex, ez] = localToWorld(s, 2.9 + sh.x, -4.6);
      const [tx, tz] = localToWorld(s, 0.7, -0.7);
      const eye = new THREE.Vector3(ex, 0.55 + sh.y - s.roll * 1.2, ez);
      const target = new THREE.Vector3(tx, 0.42 - s.roll * 0.8, tz);
      return { pos: eye, quat: lookQuat(eye, target, UP, sh.r * 4 - s.roll * 0.6), fov: cam.fov ?? 44 };
    }
    case "low": {
      // a ras de suelo, adelante a la derecha, mirando hacia el auto que se acerca
      const sh = shake3(time, cam.shake ?? 0.004);
      const [fx, fz] = fwd(s.path);
      const [rx, rz] = right(s.path);
      const eye = new THREE.Vector3(s.x + fx * 7.5 + rx * 2.9 + sh.x, 0.35 + sh.y, s.z + fz * 7.5 + rz * 2.9);
      const target = new THREE.Vector3(s.x + rx * 0.3, 0.55, s.z);
      return { pos: eye, quat: lookQuat(eye, target, UP, sh.r), fov: cam.fov ?? 48 };
    }
  }
};

/** Proyecta un punto de mundo a píxeles de pantalla (1080×1920) con la misma pose. */
export const projector = (pose: Pose, W = 1080, H = 1920) => {
  const c = new THREE.PerspectiveCamera(pose.fov, W / H, 0.05, 3000);
  c.position.copy(pose.pos);
  c.quaternion.copy(pose.quat);
  c.updateMatrixWorld();
  c.updateProjectionMatrix();
  return (x: number, y: number, z: number) => {
    const v = new THREE.Vector3(x, y, z).project(c);
    return { x: (v.x * 0.5 + 0.5) * W, y: (-v.y * 0.5 + 0.5) * H, behind: v.z > 1 };
  };
};
