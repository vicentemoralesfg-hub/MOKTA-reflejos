import React, { useMemo } from "react";
import * as THREE from "three";
import { ScenarioId } from "../sim/car";
import { makeLit } from "./materials";
import { glowTexture } from "./textures";

/**
 * Tránsito de fondo: un auto adelante por la pista izquierda y autos en la calzada contraria.
 * Las posiciones dependen del tiempo del escenario (coherente con cámara lenta y rebobinado).
 */
type Veh = { x: number; z0: number; v: number; dir: 1 | -1; color: [number, number, number] };

const BY_SCENARIO: Record<ScenarioId, Veh[]> = {
  frena: [
    { x: -1.75, z0: -95, v: 26.0, dir: 1, color: [0.12, 0.13, 0.15] },
    { x: -7.8, z0: -400, v: 27, dir: -1, color: [0.5, 0.5, 0.52] },
    { x: -11.4, z0: -150, v: 30, dir: -1, color: [0.08, 0.1, 0.18] },
  ],
  volantazo: [
    { x: -1.75, z0: -120, v: 26.5, dir: 1, color: [0.5, 0.5, 0.52] },
    { x: -7.8, z0: -190, v: 28, dir: -1, color: [0.12, 0.13, 0.15] },
  ],
  correcto: [
    { x: -1.75, z0: -70, v: 27.0, dir: 1, color: [0.12, 0.13, 0.15] },
    { x: -7.8, z0: -210, v: 27, dir: -1, color: [0.45, 0.46, 0.5] },
    { x: -11.4, z0: -520, v: 30, dir: -1, color: [0.15, 0.04, 0.03] },
  ],
};

export const Traffic: React.FC<{ scenario: ScenarioId; t: number }> = ({ scenario, t }) => {
  const mats = useMemo(() => {
    const m = new Map<string, THREE.ShaderMaterial>();
    for (const list of Object.values(BY_SCENARIO))
      for (const v of list) {
        const k = v.color.join(",");
        if (!m.has(k)) m.set(k, makeLit({ color: v.color, spec: 0.6 }));
      }
    return { paint: m, glass: makeLit({ color: [0.02, 0.02, 0.02], spec: 1 }) };
  }, []);
  const glow = glowTexture();
  return (
    <>
      {BY_SCENARIO[scenario].map((v, i) => {
        // dir 1 = mismo sentido (hacia -Z); dir -1 = contrario (hacia +Z)
        const z = v.dir === 1 ? v.z0 - v.v * t : v.z0 + v.v * t;
        const rotY = v.dir === 1 ? 0 : Math.PI;
        return (
          <group key={i} position={[v.x, 0, z]} rotation={[0, rotY, 0]}>
            <mesh position={[0, 0.62, 0]} material={mats.paint.get(v.color.join(","))}>
              <boxGeometry args={[1.78, 0.62, 4.4]} />
            </mesh>
            <mesh position={[0, 1.15, 0.25]} material={mats.glass}>
              <boxGeometry args={[1.5, 0.45, 2.2]} />
            </mesh>
            {[-0.6, 0.6].map((hx) => (
              <React.Fragment key={hx}>
                <sprite position={[hx, 0.75, -2.25]} scale={[1.3, 1.3, 1]}>
                  <spriteMaterial map={glow} color={new THREE.Color(0.95, 0.95, 1)} blending={THREE.AdditiveBlending} depthWrite={false} transparent toneMapped={false} />
                </sprite>
                <sprite position={[hx, 0.85, 2.25]} scale={[0.75, 0.75, 1]}>
                  <spriteMaterial map={glow} color={new THREE.Color(1, 0.06, 0.03)} blending={THREE.AdditiveBlending} depthWrite={false} transparent opacity={0.7} toneMapped={false} />
                </sprite>
              </React.Fragment>
            ))}
          </group>
        );
      })}
    </>
  );
};
