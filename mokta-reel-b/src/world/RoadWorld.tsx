import React, { useMemo } from "react";
import * as THREE from "three";
import { useThree } from "@react-three/fiber";
import type { Ride } from "../lib/ride";
import {
  makeLitMaterial,
  makeRoadMaterial,
  syncCam,
} from "./shaders";
import {
  makeGlowTexture,
  makeMountainTexture,
  makeStripeTexture,
} from "./textures";

/**
 * Coordenadas: el auto avanza por -Z. "s" = metros recorridos (positivo hacia adelante), z = -s.
 * Carril derecho centrado en x = +1,75 (Chile: tránsito por la derecha).
 */
export type RoadWorldProps = {
  /** Metros recorridos por la cámara. */
  s: number;
  /** Metros recorridos en un fotograma (0 si está congelado → sin desenfoque). */
  travelPerFrame: number;
  /** Desplazamiento de cabeza/carrocería (m y grados), calculado fuera: ver lib/ride.ts. */
  ride: Ride;
  /** Juntas del asfalto visibles (s en metros, máx. 24). */
  seams: number[];
  /** Posición (s) de la barrera, o null si no existe. */
  barrierS: number | null;
  /** Posición (s) del auto en sentido contrario, o null. */
  decoyS?: number | null;
  camX?: number;
};

/**
 * Óptica: distancia focal equivalente de 1662 px sobre 1080 px de ancho (≈36° horizontal, similar a la
 * vista natural en un teléfono). El horizonte se sube con desplazamiento de lente (no inclinando la cámara),
 * así las verticales siguen verticales y la carretera ocupa la zona sobre el tablero.
 */
const CAM_Y = 1.2;
export const FOCAL_PX = 1662;
export const HORIZON_Y = 700;
const FRAME_W = 1080;
const FRAME_H = 1920;
const SHIFT = FRAME_H / 2 - HORIZON_Y; // px
const VIRT_H = FRAME_H + 2 * SHIFT;
const VFOV = (2 * Math.atan(VIRT_H / 2 / FOCAL_PX) * 180) / Math.PI;

const hash = (n: number) => {
  const x = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};

const CameraRig: React.FC<{
  s: number;
  ride: Ride;
  camX: number;
  mats: THREE.ShaderMaterial[];
}> = ({ s, ride, camX, mats }) => {
  const camera = useThree((st) => st.camera) as THREE.PerspectiveCamera;
  camera.fov = VFOV;
  camera.aspect = FRAME_W / VIRT_H;
  camera.near = 0.1;
  camera.far = 2000;
  camera.setViewOffset(FRAME_W, VIRT_H, 0, 2 * SHIFT, FRAME_W, FRAME_H);
  camera.position.set(camX + ride.dx, CAM_Y + ride.dy, -s);
  camera.rotation.set(THREE.MathUtils.degToRad(ride.pitchDeg), 0, THREE.MathUtils.degToRad(ride.rollDeg), "YXZ");
  camera.updateProjectionMatrix();
  camera.updateMatrixWorld();
  syncCam(mats, camera.position);
  return null;
};

/** Barrera tipo III (tres travesaños con franjas) con dos postes y balizas ámbar fijas. */
const Barricade: React.FC<{
  x: number;
  z: number;
  railMat: THREE.ShaderMaterial;
  postMat: THREE.ShaderMaterial;
  glow: THREE.Texture;
}> = ({ x, z, railMat, postMat, glow }) => {
  const W = 2.95;
  const rails = [0.52, 0.98, 1.44];
  return (
    <group position={[x, 0, z]}>
      {rails.map((y) => (
        <mesh key={y} position={[0, y, 0]} material={railMat}>
          <boxGeometry args={[W, 0.3, 0.05]} />
        </mesh>
      ))}
      {[-W / 2 + 0.18, W / 2 - 0.18].map((px) => (
        <group key={px}>
          <mesh position={[px, 0.85, 0.06]} material={postMat}>
            <boxGeometry args={[0.09, 1.7, 0.06]} />
          </mesh>
          <mesh position={[px, 0.03, 0.1]} material={postMat}>
            <boxGeometry args={[0.16, 0.06, 0.9]} />
          </mesh>
          <mesh position={[px, 1.82, 0.04]}>
            <sphereGeometry args={[0.085, 16, 12]} />
            <meshBasicMaterial color={new THREE.Color(1.0, 0.62, 0.12)} toneMapped={false} />
          </mesh>
          <sprite position={[px, 1.82, 0.12]} scale={[1.5, 1.5, 1]}>
            <spriteMaterial
              map={glow}
              color={new THREE.Color(1.0, 0.55, 0.1)}
              blending={THREE.AdditiveBlending}
              depthWrite={false}
              transparent
              opacity={0.85}
              toneMapped={false}
            />
          </sprite>
        </group>
      ))}
    </group>
  );
};

export const RoadWorld: React.FC<RoadWorldProps> = ({
  s,
  travelPerFrame,
  ride,
  seams,
  barrierS,
  decoyS = null,
  camX = 1.38,
}) => {
  const assets = useMemo(() => {
    const road = makeRoadMaterial();
    const guard = makeLitMaterial({ color: [0.30, 0.32, 0.35], retro: 0.0 });
    const post = makeLitMaterial({ color: [0.20, 0.21, 0.22] });
    const delBody = makeLitMaterial({ color: [0.42, 0.43, 0.42] });
    const reflW = makeLitMaterial({ color: [1.0, 1.0, 0.96], retro: 1.1, minLight: 0.15 });
    const reflA = makeLitMaterial({ color: [1.0, 0.55, 0.1], retro: 1.1, minLight: 0.15 });
    const bush = makeLitMaterial({ color: [0.07, 0.085, 0.06] });
    const stripes = makeStripeTexture();
    const rail = makeLitMaterial({ color: [0.86, 0.86, 0.84], retro: 0.42, minLight: 0.2, map: stripes });
    const bPost = makeLitMaterial({ color: [0.62, 0.62, 0.6], retro: 0.12, minLight: 0.12 });
    const glow = makeGlowTexture();
    const mountains = makeMountainTexture();
    return {
      road,
      guard,
      post,
      delBody,
      reflW,
      reflA,
      bush,
      rail,
      bPost,
      glow,
      mountains,
      mats: [road, guard, post, delBody, reflW, reflA, bush, rail, bPost],
    };
  }, []);

  assets.road.uniforms.uTravel.value = travelPerFrame;
  const seamU = assets.road.uniforms.uSeams.value as number[];
  for (let i = 0; i < 24; i++) seamU[i] = seams[i] ?? -1e5;

  const z = -s;

  // Postes del guardarraíl cada 6 m (a 210 km/h avanzan 0,32 del intervalo por fotograma: sin aliasing temporal)
  const guardPosts: number[] = [];
  for (let k = Math.floor(s / 6) - 1; k < Math.floor(s / 6) + 30; k++) guardPosts.push(k * 6);
  // Desenfoque de movimiento barato: los objetos cercanos se alargan en Z lo recorrido en ~medio fotograma
  const smear = travelPerFrame * 0.32;

  // Hitos delineadores cada 25 m (ambos lados)
  const delineators: number[] = [];
  for (let k = Math.floor(s / 25) - 1; k < Math.floor(s / 25) + 14; k++) delineators.push(k * 25);

  // Tachas retrorreflectantes en el eje (entre segmentos) cada 12 m
  const studs: number[] = [];
  for (let k = Math.floor(s / 12) - 1; k < Math.floor(s / 12) + 16; k++) studs.push(k * 12 + 8);

  // Arbustos dispersos (posición pseudoaleatoria por índice)
  const bushes: { sPos: number; x: number; sc: number }[] = [];
  for (let k = Math.floor(s / 9) - 1; k < Math.floor(s / 9) + 30; k++) {
    const side = hash(k) > 0.45 ? 1 : -1;
    bushes.push({
      sPos: k * 9 + hash(k + 7) * 6,
      x: side * (7.2 + hash(k + 3) * 9),
      sc: 0.6 + hash(k + 11) * 1.4,
    });
  }

  return (
    <>
      <CameraRig
        s={s}
        ride={ride}
        camX={camX}
        mats={assets.mats}
      />

      {/* Suelo: calzada, berma y tierra en un único shader procedural */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, z - 420]} material={assets.road}>
        <planeGeometry args={[400, 900, 1, 1]} />
      </mesh>

      {/* Cordillera lejana (se mueve con la cámara: está "en el infinito") */}
      <mesh position={[40, 70, z - 1500]}>
        <planeGeometry args={[1500, 150]} />
        <meshBasicMaterial map={assets.mountains} transparent depthWrite={false} toneMapped={false} />
      </mesh>

      {/* Guardarraíl derecho: viga continua + postes */}
      <mesh position={[5.5, 0.68, z - 140]} material={assets.guard}>
        <boxGeometry args={[0.05, 0.13, 300]} />
      </mesh>
      <mesh position={[5.53, 0.55, z - 140]} material={assets.post}>
        <boxGeometry args={[0.05, 0.12, 300]} />
      </mesh>
      {guardPosts.map((p) => (
        <mesh key={`gp${p}`} position={[5.62, 0.36, -p + smear / 2]} material={assets.post}>
          <boxGeometry args={[0.1, 0.72, 0.1 + smear]} />
        </mesh>
      ))}

      {/* Delineadores con reflectante (blanco derecha, ámbar izquierda) */}
      {delineators.map((p) => (
        <group key={`dl${p}`}>
          <mesh position={[4.9, 0.5, -p + smear / 2]} material={assets.delBody}>
            <boxGeometry args={[0.1, 1.0, 0.1 + smear]} />
          </mesh>
          <mesh position={[4.9, 0.9, -p + 0.055]} material={assets.reflW}>
            <planeGeometry args={[0.07, 0.16]} />
          </mesh>
          <mesh position={[-4.9, 0.5, -p + smear / 2]} material={assets.delBody}>
            <boxGeometry args={[0.1, 1.0, 0.1 + smear]} />
          </mesh>
          <mesh position={[-4.9, 0.9, -p + 0.055]} material={assets.reflA}>
            <planeGeometry args={[0.07, 0.16]} />
          </mesh>
        </group>
      ))}

      {/* Tachas */}
      {studs.map((p) => (
        <mesh key={`st${p}`} position={[0, 0.012, -p + smear / 2]} material={assets.reflW}>
          <boxGeometry args={[0.1, 0.024, 0.1 + smear]} />
        </mesh>
      ))}

      {/* Vegetación baja */}
      {bushes.map((b, i) => (
        <mesh
          key={`b${i}${b.sPos}`}
          position={[b.x, 0.25 * b.sc, -b.sPos]}
          scale={[b.sc * 1.4, b.sc * 0.7, b.sc * 1.2]}
          material={assets.bush}
        >
          <icosahedronGeometry args={[0.7, 1]} />
        </mesh>
      ))}

      {/* Cierre total: cuatro barreras tipo III escalonadas, de berma a berma (≈10,7 m) */}
      {barrierS !== null ? (
        <group>
          {[-3.9, -1.3, 1.3, 3.9].map((bx, i) => (
            <Barricade
              key={bx}
              x={bx}
              z={-barrierS - (i % 2) * 0.35}
              railMat={assets.rail}
              postMat={assets.bPost}
              glow={assets.glow}
            />
          ))}
        </group>
      ) : null}

      {/* Auto en sentido contrario (distractor) */}
      {decoyS !== null && decoyS !== undefined ? (
        <group position={[-1.8, 0, -decoyS]}>
          <mesh position={[0, 0.7, -2.2]}>
            <boxGeometry args={[1.8, 0.9, 4.4]} />
            <meshBasicMaterial color={new THREE.Color(0.002, 0.0022, 0.0026)} />
          </mesh>
          {[-0.62, 0.62].map((hx) => (
            <sprite key={hx} position={[hx, 0.68, 0.05]} scale={[2.4, 2.4, 1]}>
              <spriteMaterial
                map={assets.glow}
                color={new THREE.Color(0.95, 0.97, 1.0)}
                blending={THREE.AdditiveBlending}
                depthWrite={false}
                transparent
                toneMapped={false}
              />
            </sprite>
          ))}
          <sprite position={[0, 0.7, 0.1]} scale={[9, 4.5, 1]}>
            <spriteMaterial
              map={assets.glow}
              color={new THREE.Color(0.35, 0.4, 0.5)}
              blending={THREE.AdditiveBlending}
              depthWrite={false}
              transparent
              opacity={0.5}
              toneMapped={false}
            />
          </sprite>
        </group>
      ) : null}
    </>
  );
};
