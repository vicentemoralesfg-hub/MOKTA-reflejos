import React, { useEffect, useMemo } from "react";
import * as THREE from "three";
import { BLOW_T, CarState, ScenarioId, WHEEL_LOCAL, carAt, localToWorld } from "../sim/car";
import { makeLit } from "./materials";
import { puffTexture } from "./textures";

const rnd = (i: number, k: number) => {
  const v = Math.sin(i * 91.17 + k * 47.31 + 3.3) * 43758.5453;
  return v - Math.floor(v);
};

const G = 9.81;

/** Jirones de la banda de rodadura que salen despedidos en el reventón. */
export const Debris: React.FC<{ scenario: ScenarioId; t: number }> = ({ scenario, t }) => {
  const mat = useMemo(() => makeLit({ color: [0.04, 0.04, 0.045], side: THREE.DoubleSide }), []);
  const s0 = carAt(scenario, BLOW_T);
  const dt = t - BLOW_T;
  if (dt < 0) return null;
  const [wx, wz] = localToWorld(s0, 0.95, -1.38);
  const fx = Math.sin(s0.heading), fz = -Math.cos(s0.heading);
  const rx = Math.cos(s0.heading), rz = Math.sin(s0.heading);
  const pieces = [];
  for (let i = 0; i < 22; i++) {
    const out = 1.5 + rnd(i, 1) * 5.0;
    const up = 1.0 + rnd(i, 2) * 4.2;
    const back = -2.5 + rnd(i, 3) * 9.0; // respecto del auto: muchos quedan atrás
    const vx = fx * (s0.v - back) + rx * out;
    const vz = fz * (s0.v - back) + rz * out;
    const y0 = 0.15 + rnd(i, 4) * 0.4;
    const tHit = (up + Math.sqrt(up * up + 2 * G * y0)) / G;
    let x: number, y: number, z: number;
    if (dt < tHit) {
      x = wx + vx * dt;
      z = wz + vz * dt;
      y = y0 + up * dt - 0.5 * G * dt * dt;
    } else {
      const k = 3.2;
      const tau = dt - tHit;
      const f = (1 - Math.exp(-k * tau)) / k;
      x = wx + vx * tHit + vx * 0.45 * f;
      z = wz + vz * tHit + vz * 0.45 * f;
      y = 0.012;
    }
    const tumble = Math.min(dt, tHit) * (6 + rnd(i, 5) * 14);
    const sz = 0.08 + rnd(i, 6) * 0.22;
    pieces.push(
      <mesh
        key={i}
        material={mat}
        position={[x, y, z]}
        rotation={dt < tHit ? [tumble, tumble * 0.7 + i, tumble * 0.3] : [-Math.PI / 2, 0, i * 1.3]}
      >
        <planeGeometry args={[sz, sz * (0.35 + rnd(i, 7) * 0.5)]} />
      </mesh>,
    );
  }
  return <group>{pieces}</group>;
};

type Puff = { x: number; y: number; z: number; size: number; alpha: number; key: string };

/** Polvo del reventón + humo de neumáticos al deslizar. */
export const Smoke: React.FC<{ scenario: ScenarioId; t: number; skidFrom?: number | null; tint?: [number, number, number] }> = ({
  scenario,
  t,
  skidFrom = null,
  tint = [0.42, 0.4, 0.44],
}) => {
  const tex = puffTexture();
  const puffs: Puff[] = [];
  // estallido de polvo
  const dt = t - BLOW_T;
  if (dt >= 0) {
    const s0 = carAt(scenario, BLOW_T);
    const [wx, wz] = localToWorld(s0, 0.9, -1.38);
    for (let i = 0; i < 9; i++) {
      const life = 1.4 + rnd(i, 11) * 0.8;
      if (dt > life) continue;
      const a = dt / life;
      const ang = rnd(i, 12) * Math.PI * 2;
      const sp = 1.2 + rnd(i, 13) * 2.5;
      puffs.push({
        x: wx + Math.cos(ang) * sp * Math.sqrt(dt) + Math.sin(s0.heading) * s0.v * 0.12 * Math.min(dt, 0.25),
        y: 0.3 + dt * (0.5 + rnd(i, 14)),
        z: wz + Math.sin(ang) * sp * Math.sqrt(dt) - Math.cos(s0.heading) * s0.v * 0.12 * Math.min(dt, 0.25),
        size: 0.6 + a * 3.2,
        alpha: (1 - a) ** 1.5 * 0.55 * Math.min(1, dt / 0.04),
        key: `b${i}`,
      });
    }
  }
  // humo de deslizamiento
  if (skidFrom !== null && t > skidFrom) {
    const step = 1 / 20;
    for (let ts = skidFrom; ts <= t; ts += step) {
      const age = t - ts;
      const life = 1.8;
      if (age > life) continue;
      const s = carAt(scenario, ts);
      const intensity = Math.min(1, Math.abs(s.slip) * 1.6) * (s.v > 2 ? 1 : s.v / 2);
      if (intensity < 0.05) continue;
      const a = age / life;
      for (const [wi, [lx, lz]] of WHEEL_LOCAL.entries()) {
        if (wi % 2 === 0 && rnd(Math.round(ts * 20), wi) > 0.5) continue;
        const [x, z] = localToWorld(s, lx, lz);
        puffs.push({
          x: x + (rnd(Math.round(ts * 20), wi + 20) - 0.5) * a * 2,
          y: 0.3 + age * 0.6,
          z: z + (rnd(Math.round(ts * 20), wi + 30) - 0.5) * a * 2,
          size: 0.8 + a * 3.0,
          alpha: (1 - a) ** 1.8 * 0.32 * intensity,
          key: `s${ts.toFixed(3)}${wi}`,
        });
      }
    }
  }
  return (
    <group>
      {puffs.map((p) => (
        <sprite key={p.key} position={[p.x, p.y, p.z]} scale={[p.size, p.size, 1]}>
          <spriteMaterial map={tex} color={new THREE.Color(...tint)} transparent opacity={p.alpha} depthWrite={false} toneMapped={false} />
        </sprite>
      ))}
    </group>
  );
};

/** Marcas de neumáticos sobre el asfalto desde que empieza a deslizar. */
export const SkidMarks: React.FC<{ scenario: ScenarioId; from: number; t: number; minSlip?: number }> = ({ scenario, from, t, minSlip = 0.0 }) => {
  const mat = useMemo(() => new THREE.MeshBasicMaterial({ color: 0x050505, transparent: true, opacity: 0.62, depthWrite: false, toneMapped: false }), []);
  const geos = useMemo(() => {
    if (t <= from + 0.02) return [];
    const samples: CarState[] = [];
    const step = 1 / 90;
    for (let ts = from; ts <= t + 1e-6; ts += step) samples.push(carAt(scenario, ts));
    samples.push(carAt(scenario, t));
    return WHEEL_LOCAL.map(([lx, lz]) => {
      const pts = samples.map((s) => localToWorld(s, lx * 1.02, lz));
      const pos: number[] = [];
      const w = 0.11;
      for (let i = 0; i < pts.length - 1; i++) {
        const s = samples[i];
        if (Math.abs(s.slip) < minSlip && s.brake < 0.5) continue;
        const [x0, z0] = pts[i];
        const [x1, z1] = pts[i + 1];
        const dx = x1 - x0, dz = z1 - z0;
        const L = Math.hypot(dx, dz);
        if (L < 1e-4) continue;
        const nx = (-dz / L) * w, nz = (dx / L) * w;
        const y = 0.006;
        pos.push(x0 - nx, y, z0 - nz, x0 + nx, y, z0 + nz, x1 + nx, y, z1 + nz);
        pos.push(x0 - nx, y, z0 - nz, x1 + nx, y, z1 + nz, x1 - nx, y, z1 - nz);
      }
      const g = new THREE.BufferGeometry();
      g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
      return g;
    });
  }, [scenario, from, t, minSlip]);
  useEffect(() => () => geos.forEach((g) => g.dispose()), [geos]);
  return (
    <group>
      {geos.map((g, i) => (
        <mesh key={i} geometry={g} material={mat} />
      ))}
    </group>
  );
};
