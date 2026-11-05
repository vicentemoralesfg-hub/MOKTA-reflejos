import React, { useMemo } from "react";
import * as THREE from "three";
import { makeLit, makeRoad, makeSky } from "./materials";
import { mountainTexture } from "./textures";

const hash = (n: number) => {
  const x = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};

/**
 * Autopista de doble calzada al atardecer: dos pistas por sentido, bermas, barrera central de hormigón,
 * guardarraíl a la derecha, hitos, álamos y la cordillera de fondo.
 * Solo se construye una ventana alrededor de la cámara (cz) para mantener el render liviano.
 */
export const Environment: React.FC<{ cx: number; cz: number }> = ({ cx, cz }) => {
  const m = useMemo(
    () => ({
      road: makeRoad(),
      sky: makeSky(),
      concrete: makeLit({ color: [0.36, 0.35, 0.34] }),
      rail: makeLit({ color: [0.42, 0.44, 0.47], spec: 0.25 }),
      post: makeLit({ color: [0.22, 0.22, 0.23] }),
      delin: makeLit({ color: [0.75, 0.75, 0.72] }),
      reflW: makeLit({ color: [0.8, 0.8, 0.8], emissive: [0.35, 0.35, 0.33] }),
      reflA: makeLit({ color: [0.8, 0.5, 0.1], emissive: [0.4, 0.2, 0.02] }),
      trunk: makeLit({ color: [0.07, 0.06, 0.05] }),
      poplar: makeLit({ color: [0.035, 0.05, 0.03] }),
      bush: makeLit({ color: [0.05, 0.055, 0.035] }),
      mtn: mountainTexture(),
    }),
    [],
  );

  const span = (step: number, back: number, front: number) => {
    const out: number[] = [];
    const s = -cz;
    for (let k = Math.floor((s - back) / step); k <= Math.floor((s + front) / step); k++) out.push(k * step);
    return out;
  };

  const posts = span(4, 40, 160);
  const delins = span(25, 40, 260);
  const trees = span(9, 60, 420);
  const bushes = span(6, 40, 200);

  return (
    <>
      <mesh position={[cx, 0, cz]} material={m.sky}>
        <sphereGeometry args={[1600, 32, 16]} />
      </mesh>
      {/* cordillera: cilindro alrededor de la cámara (sirve para cualquier rumbo) */}
      <mesh position={[cx, 60, cz]}>
        <cylinderGeometry args={[1450, 1450, 260, 64, 1, true]} />
        <meshBasicMaterial map={m.mtn} side={THREE.BackSide} transparent depthWrite={false} toneMapped={false} />
      </mesh>

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, cz - 300]} material={m.road}>
        <planeGeometry args={[600, 1400, 1, 1]} />
      </mesh>

      {/* barrera central tipo New Jersey */}
      <mesh position={[-4.78, 0.42, cz - 100]} material={m.concrete}>
        <boxGeometry args={[0.32, 0.84, 600]} />
      </mesh>
      <mesh position={[-4.78, 0.08, cz - 100]} material={m.concrete}>
        <boxGeometry args={[0.62, 0.16, 600]} />
      </mesh>

      {/* guardarraíl derecho */}
      <mesh position={[6.45, 0.62, cz - 100]} material={m.rail}>
        <boxGeometry args={[0.06, 0.32, 600]} />
      </mesh>
      {posts.map((p) => (
        <mesh key={`p${p}`} position={[6.55, 0.38, -p]} material={m.post}>
          <boxGeometry args={[0.12, 0.76, 0.12]} />
        </mesh>
      ))}

      {/* hitos con reflectante */}
      {delins.map((p) => (
        <group key={`d${p}`}>
          <mesh position={[6.05, 0.5, -p]} material={m.delin}>
            <boxGeometry args={[0.1, 1.0, 0.1]} />
          </mesh>
          <mesh position={[6.05, 0.85, -p + 0.055]} material={m.reflW}>
            <planeGeometry args={[0.07, 0.16]} />
          </mesh>
        </group>
      ))}

      {/* álamos (hileras típicas del valle central) */}
      {trees.map((p, i) =>
        [1, -1].map((side) => {
          const k = p * 3.7 + side;
          if (hash(k) < 0.2) return null;
          const x = side > 0 ? 13 + hash(k + 1) * 3 : -21 - hash(k + 2) * 3;
          const h = 11 + hash(k + 3) * 6;
          const r = 1.1 + hash(k + 4) * 0.6;
          return (
            <group key={`t${p}${side}${i}`} position={[x, 0, -p - hash(k + 5) * 3]}>
              <mesh position={[0, 1.2, 0]} material={m.trunk}>
                <cylinderGeometry args={[0.16, 0.22, 2.4, 6]} />
              </mesh>
              <mesh position={[0, 1.6 + h / 2, 0]} material={m.poplar}>
                <coneGeometry args={[r, h, 9]} />
              </mesh>
            </group>
          );
        }),
      )}

      {/* matorrales bajos */}
      {bushes.map((p) => {
        const k = p * 1.3;
        const side = hash(k) > 0.5 ? 1 : -1;
        const x = side > 0 ? 7.6 + hash(k + 1) * 4.5 : -17 - hash(k + 2) * 3;
        const sc = 0.4 + hash(k + 3) * 0.9;
        return (
          <mesh key={`b${p}`} position={[x, 0.2 * sc, -p - hash(k + 4) * 4]} scale={[sc * 1.4, sc * 0.7, sc * 1.1]} material={m.bush}>
            <icosahedronGeometry args={[0.7, 1]} />
          </mesh>
        );
      })}
    </>
  );
};
