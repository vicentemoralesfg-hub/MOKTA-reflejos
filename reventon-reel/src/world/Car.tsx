import React, { useMemo } from "react";
import * as THREE from "three";
import { CarState, WHEEL_LOCAL } from "../sim/car";
import { makeLit } from "./materials";
import { glowTexture, rimTexture, shadowTexture, sidewallTexture } from "./textures";

const WHEEL_R = 0.33;
const WHEEL_W = 0.24;

/** Perfil lateral del sedán (u: largo, adelante negativo; v: alto) con pasos de rueda. */
const bodyShape = () => {
  const s = new THREE.Shape();
  s.moveTo(-2.3, 0.42);
  s.lineTo(-2.36, 0.62);
  s.quadraticCurveTo(-2.36, 0.84, -2.18, 0.9);
  s.quadraticCurveTo(-1.6, 0.99, -0.86, 1.03);
  s.lineTo(1.32, 1.05);
  s.quadraticCurveTo(2.05, 1.05, 2.22, 1.0);
  s.quadraticCurveTo(2.36, 0.94, 2.34, 0.7);
  s.lineTo(2.3, 0.45);
  s.lineTo(1.84, 0.37);
  s.absarc(1.38, 0.33, 0.44, 0.09, Math.PI - 0.09, false);
  s.lineTo(-0.94, 0.34);
  s.absarc(-1.38, 0.33, 0.44, 0.09, Math.PI - 0.09, false);
  s.lineTo(-2.1, 0.4);
  s.closePath();
  return s;
};

const cabinShape = () => {
  const s = new THREE.Shape();
  s.moveTo(-0.9, 1.0);
  s.quadraticCurveTo(-0.55, 1.22, -0.22, 1.43);
  s.quadraticCurveTo(0.3, 1.5, 0.92, 1.45);
  s.quadraticCurveTo(1.25, 1.3, 1.6, 1.03);
  s.lineTo(-0.9, 1.0);
  return s;
};

const extrude = (shape: THREE.Shape, width: number, bevel: number) => {
  const g = new THREE.ExtrudeGeometry(shape, {
    depth: width - bevel * 2,
    bevelEnabled: true,
    bevelThickness: bevel,
    bevelSize: bevel * 0.8,
    bevelSegments: 4,
    curveSegments: 18,
  });
  g.translate(0, 0, -(width - bevel * 2) / 2);
  g.rotateY(-Math.PI / 2);
  g.computeVertexNormals();
  return g;
};

export type CarLook = {
  /** Mostrar el reventón (rueda DD hundida, jirones). */
  showBlow?: boolean;
  /** Parpadeo de balizas en este fotograma. */
  hazardOn?: boolean;
  /** Ocultar carrocería (cámara interior). */
  hidden?: boolean;
  /** Tiempo para el temblor de la banda de rodadura suelta. */
  time: number;
};

export const Car: React.FC<{ s: CarState; look: CarLook }> = ({ s, look }) => {
  const a = useMemo(() => {
    const paint = makeLit({ color: [0.40, 0.03, 0.028], spec: 0.8, selfCar: true });
    const glass = makeLit({ color: [0.02, 0.02, 0.02], glass: true, roof: [0.36, 0.028, 0.026], selfCar: true });
    const black = makeLit({ color: [0.025, 0.025, 0.028], spec: 0.15, selfCar: true });
    const rubber = makeLit({ color: [0.035, 0.035, 0.038], selfCar: true });
    const side = makeLit({ color: [1, 1, 1], map: sidewallTexture(), selfCar: true });
    const rim = makeLit({ color: [1, 1, 1], map: rimTexture(), spec: 0.3, selfCar: true });
    const head = makeLit({ color: [0.1, 0.1, 0.1], emissive: [1.6, 1.6, 1.5], selfCar: true });
    const tail = makeLit({ color: [0.08, 0.0, 0.0], emissive: [0.5, 0.02, 0.01], selfCar: true });
    const third = makeLit({ color: [0.05, 0.0, 0.0], emissive: [0, 0, 0], selfCar: true });
    const amber = makeLit({ color: [0.12, 0.06, 0.0], emissive: [0, 0, 0], selfCar: true });
    const plate = makeLit({ color: [0.85, 0.85, 0.82], selfCar: true });
    return {
      paint,
      glass,
      black,
      rubber,
      side,
      rim,
      head,
      tail,
      third,
      amber,
      plate,
      body: extrude(bodyShape(), 1.84, 0.09),
      cabin: extrude(cabinShape(), 1.56, 0.07),
      tireG: new THREE.CylinderGeometry(WHEEL_R, WHEEL_R, WHEEL_W, 40, 1, true).rotateZ(Math.PI / 2),
      capG: new THREE.CircleGeometry(WHEEL_R * 0.985, 40),
      rimG: new THREE.CircleGeometry(WHEEL_R * 0.66, 40),
      glow: glowTexture(),
      shadow: shadowTexture(),
    };
  }, []);

  const brake = s.brake;
  a.tail.uniforms.uEmissive.value.setRGB(0.5 + 3.2 * brake, 0.02 + 0.08 * brake, 0.01 + 0.04 * brake);
  a.third.uniforms.uEmissive.value.setRGB(3.0 * brake, 0.1 * brake, 0.05 * brake);
  const hz = look.hazardOn ? 1 : 0;
  a.amber.uniforms.uEmissive.value.setRGB(2.6 * hz, 1.1 * hz, 0.05 * hz);

  if (look.hidden) return null;
  const blow = look.showBlow && s.blown > 0;
  const spin = -s.dist / WHEEL_R;

  return (
    <group position={[s.x, 0, s.z]} rotation={[0, -s.heading, 0]}>
      {/* sombra de contacto */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.012, 0]}>
        <planeGeometry args={[2.6, 5.4]} />
        <meshBasicMaterial map={a.shadow} transparent opacity={0.8} depthWrite={false} />
      </mesh>
      <group position={[0, 0.0, 0]} rotation={[-s.pitch, 0, -s.roll]}>
        <mesh geometry={a.body} material={a.paint} />
        <mesh geometry={a.cabin} material={a.glass} />
        {/* parachoques, parrilla y bajos oscuros */}
        <mesh position={[0, 0.5, -2.36]} material={a.black}>
          <boxGeometry args={[1.5, 0.2, 0.06]} />
        </mesh>
        <mesh position={[0, 0.52, 2.37]} material={a.black}>
          <boxGeometry args={[1.5, 0.16, 0.05]} />
        </mesh>
        <mesh position={[0, 0.62, 2.39]} material={a.plate}>
          <boxGeometry args={[0.52, 0.12, 0.02]} />
        </mesh>
        {/* espejos */}
        {[-1, 1].map((k) => (
          <mesh key={k} position={[k * 0.98, 1.08, -0.72]} material={a.paint}>
            <boxGeometry args={[0.18, 0.13, 0.12]} />
          </mesh>
        ))}
        {/* focos */}
        {[-1, 1].map((k) => (
          <mesh key={`h${k}`} position={[k * 0.62, 0.8, -2.32]} material={a.head}>
            <boxGeometry args={[0.44, 0.09, 0.06]} />
          </mesh>
        ))}
        {/* luces traseras */}
        {[-1, 1].map((k) => (
          <mesh key={`t${k}`} position={[k * 0.64, 0.88, 2.3]} material={a.tail}>
            <boxGeometry args={[0.42, 0.11, 0.06]} />
          </mesh>
        ))}
        <mesh position={[0, 1.27, 1.42]} rotation={[0.9, 0, 0]} material={a.third}>
          <boxGeometry args={[0.5, 0.035, 0.02]} />
        </mesh>
        {/* intermitentes (balizas) en las cuatro esquinas */}
        {[
          [-0.9, 0.78, -2.2],
          [0.9, 0.78, -2.2],
          [-0.88, 0.9, 2.22],
          [0.88, 0.9, 2.22],
        ].map(([x, y, z], i) => (
          <mesh key={`a${i}`} position={[x, y, z]} material={a.amber}>
            <boxGeometry args={[0.1, 0.07, 0.12]} />
          </mesh>
        ))}

        {/* ruedas */}
        {WHEEL_LOCAL.map(([lx, lz], i) => {
          const isBlown = blow && i === 1;
          const front = i < 2;
          const drop = isBlown ? 0.085 : 0;
          return (
            <group key={i} position={[lx * 1.02, WHEEL_R - drop, lz]} rotation={[0, front ? -s.steer / 15 : 0, 0]}>
              <group rotation={[spin, 0, 0]}>
                <mesh geometry={a.tireG} material={a.rubber} scale={isBlown ? [1.08, 1, 1] : [1, 1, 1]} />
                <mesh geometry={a.capG} material={a.side} position={[(lx > 0 ? 1 : -1) * WHEEL_W * 0.5, 0, 0]} rotation={[0, (lx > 0 ? 1 : -1) * Math.PI / 2, 0]} />
                <mesh geometry={a.rimG} material={a.rim} position={[(lx > 0 ? 1 : -1) * (WHEEL_W * 0.5 + 0.004), 0, 0]} rotation={[0, (lx > 0 ? 1 : -1) * Math.PI / 2, 0]} />
                <mesh geometry={a.capG} material={a.rubber} position={[(lx > 0 ? -1 : 1) * WHEEL_W * 0.5, 0, 0]} rotation={[0, (lx > 0 ? -1 : 1) * Math.PI / 2, 0]} />
                {isBlown
                  ? [0.3, 1.4, 2.2, 3.5, 4.4, 5.6].map((ang, j) => {
                      const flap = 0.06 + 0.05 * Math.sin(look.time * 31 + j * 1.7);
                      return (
                        <mesh
                          key={j}
                          material={a.rubber}
                          position={[(j % 2 ? 1 : -1) * 0.04, Math.cos(ang) * (WHEEL_R + flap), Math.sin(ang) * (WHEEL_R + flap)]}
                          rotation={[ang + 0.5 * Math.sin(look.time * 23 + j), 0, 0]}
                        >
                          <boxGeometry args={[0.16, 0.012, 0.16 + (j % 3) * 0.05]} />
                        </mesh>
                      );
                    })
                  : null}
              </group>
            </group>
          );
        })}

        {/* halos de luces */}
        {[-1, 1].map((k) => (
          <sprite key={`hg${k}`} position={[k * 0.62, 0.8, -2.42]} scale={[1.15, 1.15, 1]}>
            <spriteMaterial map={a.glow} color={new THREE.Color(0.95, 0.95, 1.0)} blending={THREE.AdditiveBlending} depthWrite={false} transparent opacity={0.9} toneMapped={false} />
          </sprite>
        ))}
        {[-1, 1].map((k) => (
          <sprite key={`tg${k}`} position={[k * 0.64, 0.88, 2.42]} scale={[0.7 + 1.5 * brake, 0.7 + 1.5 * brake, 1]}>
            <spriteMaterial map={a.glow} color={new THREE.Color(1.0, 0.08, 0.04)} blending={THREE.AdditiveBlending} depthWrite={false} transparent opacity={0.45 + 0.55 * brake} toneMapped={false} />
          </sprite>
        ))}
        {look.hazardOn
          ? [
              [-0.95, 0.8, -2.3],
              [0.95, 0.8, -2.3],
              [-0.92, 0.9, 2.32],
              [0.92, 0.9, 2.32],
            ].map(([x, y, z], i) => (
              <sprite key={`ag${i}`} position={[x, y, z]} scale={[2.0, 2.0, 1]}>
                <spriteMaterial map={a.glow} color={new THREE.Color(1.0, 0.5, 0.05)} blending={THREE.AdditiveBlending} depthWrite={false} transparent opacity={0.95} toneMapped={false} />
              </sprite>
            ))
          : null}
      </group>
    </group>
  );
};
