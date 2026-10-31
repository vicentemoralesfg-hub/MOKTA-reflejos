import React, { createContext, useContext, useEffect, useMemo } from "react";
import * as THREE from "three";
import { useThree } from "@react-three/fiber";
import {
  MOON_DIR,
  PAL,
  PLATE_TEXT,
  ROAD_LENGTH,
  ROAD_TOTAL_W,
  ROAD_Z0,
  OFFICER_MUZZLE,
  carGeometries,
  fogTexture,
  forest,
  glowTexture,
  hills,
  makeBeamMaterial,
  makeCurtainMaterial,
  makeRadarFanMaterial,
  makeSkyMaterial,
  officerGeometry,
  patrolGeometries,
  pineGeometry,
  plateTexture,
  roadStuds,
  roadTextures,
  speedSignTexture,
  stars,
} from "./assets";

/**
 * Mundo low-poly nocturno. Coordenadas: la carretera corre a lo largo de Z.
 * El auto del espectador ("hero") avanza hacia -Z por la pista derecha (x = +1,75).
 * La patrulla mira hacia +Z (hacia el tránsito que se le acerca).
 */
export type V3 = [number, number, number];

export type CamSpec = { pos: V3; target: V3; fov: number; roll?: number; up?: V3 };

export type CarSpec = {
  kind: "hero" | "patrol" | "traffic";
  x: number;
  z: number;
  /** -1: el frente mira a -Z (sentido del hero) · +1: mira a +Z. */
  facing: -1 | 1;
  color?: string;
  /** 0..1 luces de freno. */
  brake?: number;
  /** Focos encendidos (por defecto: sí, salvo la patrulla). */
  lights?: boolean;
  /** Proyecta luz real de focos sobre el mundo. */
  beam?: boolean;
  /** 0..1 tinte azul cuando lo cruza la onda del radar. */
  wave?: number;
  /** 0..1 punto rojo del láser en el frente. */
  laserSpot?: number;
  laserSpotSize?: number;
  /** Solo proyecta la luz de los focos (cámara subjetiva dentro del auto). */
  hidden?: boolean;
};

export type RadarSpec = {
  origin: V3;
  facing: 1 | -1;
  /** Metros que ya recorrió el primer frente de onda. */
  head: number;
  halfAngleDeg: number;
  range: number;
  spacing: number;
  opacity: number;
  /** 1 = la onda se desvanece al pasar junto a la cámara (plano subjetivo). */
  nearFade?: number;
};

export type LaserSpec = {
  from: V3;
  to: V3;
  /** 0..1: fracción del recorrido ya dibujada. */
  grow: number;
  radiusNear: number;
  radiusFar: number;
  opacity: number;
  /** 0..1 desvanecimiento hacia el extremo lejano (para que "se pierda" en la noche). */
  fadeFar?: number;
  /** Fracción 0..1 donde va un pulso brillante, o null. */
  pulse?: number | null;
  /** Ancho del halo respecto del núcleo (por defecto 2,6). */
  glowScale?: number;
};

export type MarkerSpec = { z: number; opacity: number; color?: string; scale?: number };

export type WorldState = {
  cam: CamSpec;
  cars: CarSpec[];
  radar?: RadarSpec | null;
  laser?: LaserSpec | null;
  markers?: MarkerSpec[];
  fog: [number, number];
  /** Multiplicador de la luz de luna/cielo (el gancho va más claro para celulares). */
  exposure?: number;
  /** Tamaño mínimo en píxeles de los halos de luces (vistas aéreas). */
  lightMinPx?: number;
  /** Realce tenue de la carretera para que se lea desde muy alto (0..1). */
  roadGlow?: number;
  /** Oculta los cerros (en la vista cenital parecen rocas y tapan el bosque). */
  hideHills?: boolean;
  /** Letreros de velocidad máxima 120 (en la berma derecha, mirando al conductor). */
  signs?: { x: number; z: number }[];
  /** Agente apuntando la pistola láser (mira hacia +Z, girado rotY). */
  officer?: { x: number; z: number; rotY?: number } | null;
  /** Tachas reflectantes de la carretera: tamaño en píxeles (0 = ocultas). */
  studs?: number;
  /** Niebla en capas para las vistas aéreas (opacidad 0..1). */
  fogLayers?: number;
};

/** Punta de la pistola en coordenadas de mundo. */
export const officerMuzzle = (o: { x: number; z: number; rotY?: number }): V3 => {
  const v = OFFICER_MUZZLE.clone().applyAxisAngle(new THREE.Vector3(0, 1, 0), o.rotY ?? 0);
  return [o.x + v.x, v.y, o.z + v.z];
};

const Ctx = createContext<{ cam: CamSpec; minPx: number }>({ cam: { pos: [0, 0, 0], target: [0, 0, -1], fov: 45 }, minPx: 0 });

const v3 = (a: V3) => new THREE.Vector3(...a);

const CameraRig: React.FC<{ cam: CamSpec }> = ({ cam }) => {
  const camera = useThree((s) => s.camera) as THREE.PerspectiveCamera;
  camera.fov = cam.fov;
  camera.near = 0.3;
  camera.far = 30000;
  camera.position.set(...cam.pos);
  camera.up.set(...(cam.up ?? [0, 1, 0]));
  camera.lookAt(...cam.target);
  if (cam.roll) camera.rotateZ(cam.roll);
  camera.updateProjectionMatrix();
  camera.updateMatrixWorld();
  return null;
};

/** Escala de un sprite para que nunca baje de minPx píxeles en pantalla. */
const useSpriteScale = (pos: THREE.Vector3, base: number) => {
  const { cam, minPx } = useContext(Ctx);
  const d = pos.distanceTo(v3(cam.pos));
  // muy cerca de la cámara el halo se achica (si no, encandila todo el cuadro)
  if (d < 8) base *= Math.max(0.3, d / 8);
  if (!minPx) return base;
  const worldPerPx = (2 * d * Math.tan(THREE.MathUtils.degToRad(cam.fov / 2))) / 1920;
  return Math.max(base, minPx * worldPerPx);
};

const Glow: React.FC<{ pos: V3; worldPos: THREE.Vector3; color: string; size: number; opacity?: number }> = ({
  pos,
  worldPos,
  color,
  size,
  opacity = 1,
}) => {
  const s = useSpriteScale(worldPos, size);
  // en vistas aéreas el halo es más grande que el auto: se dibuja encima (si no, lo tapa el suelo)
  const aerial = useContext(Ctx).minPx > 0;
  return (
    <sprite position={pos} scale={[s, s, 1]} renderOrder={5}>
      <spriteMaterial
        map={glowTexture()}
        color={color}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
        transparent
        opacity={opacity}
        fog={false}
        toneMapped={false}
        depthTest={!aerial}
      />
    </sprite>
  );
};

const Car: React.FC<{ spec: CarSpec }> = ({ spec }) => {
  const G = carGeometries();
  const isPatrol = spec.kind === "patrol";
  const lights = spec.lights ?? !isPatrol;
  const color = spec.color ?? (spec.kind === "hero" ? PAL.hero : isPatrol ? PAL.patrol : "#5f6875");
  const mats = useMemo(
    () => ({
      body: new THREE.MeshLambertMaterial({ color, flatShading: true }),
      glass: new THREE.MeshLambertMaterial({ color: PAL.glass, side: THREE.DoubleSide, emissive: "#0a1a30", emissiveIntensity: 0.4 }),
      tire: new THREE.MeshLambertMaterial({ color: PAL.tire }),
      head: new THREE.MeshBasicMaterial({ color: "#fff4dc" }),
      tail: new THREE.MeshBasicMaterial({ color: "#ff2030" }),
      bar: new THREE.MeshLambertMaterial({ color: "#20242c", flatShading: true }),
      door: new THREE.MeshLambertMaterial({ color: PAL.patrolDoor, side: THREE.DoubleSide }),
      lensR: new THREE.MeshLambertMaterial({ color: "#a3141f", emissive: "#3a0508", flatShading: true }),
      lensB: new THREE.MeshLambertMaterial({ color: "#1546a8", emissive: "#04122e", flatShading: true }),
      plate: new THREE.MeshLambertMaterial({ map: plateTexture(), emissive: "#ffffff", emissiveMap: plateTexture(), emissiveIntensity: 0.18 }),
      spot: new THREE.MeshBasicMaterial({
        map: glowTexture(),
        color: PAL.red,
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        fog: false,
      }),
    }),
    [color],
  );
  useEffect(() => () => Object.values(mats).forEach((m) => m.dispose()), [mats]);

  mats.body.emissive.set(PAL.blue);
  mats.body.emissiveIntensity = (spec.wave ?? 0) * 0.85;
  mats.head.color.set(lights ? "#fff4dc" : "#1a1d24");
  const brake = spec.brake ?? 0;
  mats.tail.color.setRGB(0.35 + 0.65 * brake, 0.03, 0.05);

  const rotY = spec.facing === -1 ? 0 : Math.PI;
  const world = new THREE.Vector3(spec.x, 0.7, spec.z);
  const target = useMemo(() => new THREE.Object3D(), []);
  const spotSize = spec.laserSpotSize ?? 0.9;

  if (spec.hidden) {
    return (
      <group position={[spec.x, 0, spec.z]} rotation={[0, rotY, 0]}>
        <primitive object={target} position={[0, 0, -45]} />
        <spotLight position={[0, 0.75, -2.0]} target={target} angle={0.5} penumbra={0.75} intensity={420} decay={1.65} color="#ffeccc" />
      </group>
    );
  }
  return (
    <group position={[spec.x, 0, spec.z]} rotation={[0, rotY, 0]}>
      <mesh geometry={G.body} material={mats.body} />
      <mesh geometry={G.glass} material={mats.glass} />
      <mesh geometry={G.wheels} material={mats.tire} />
      <mesh geometry={G.seams} material={mats.tire} />
      <mesh geometry={G.head} material={mats.head} />
      <mesh geometry={G.tail} material={mats.tail} />
      {spec.kind === "hero" ? (
        <>
          <mesh geometry={G.plateF} material={mats.plate} />
          <mesh geometry={G.plateR} material={mats.plate} />
        </>
      ) : null}
      {isPatrol ? (
        <>
          <mesh geometry={patrolGeometries().doors} material={mats.door} />
          <mesh geometry={patrolGeometries().barBase} material={mats.bar} />
          <mesh geometry={patrolGeometries().lensR} material={mats.lensR} />
          <mesh geometry={patrolGeometries().lensB} material={mats.lensB} />
        </>
      ) : null}
      {lights ? (
        <>
          {[-0.62, 0.62].map((x) => (
            <Glow key={x} pos={[x, 0.68, -2.32]} worldPos={world} color="#fff1d6" size={1.25} opacity={0.95} />
          ))}
        </>
      ) : null}
      {[-0.66, 0.66].map((x) => (
        <Glow key={`t${x}`} pos={[x, 0.82, 2.33]} worldPos={world} color="#ff2a34" size={0.55 + brake * 0.9} opacity={0.5 + brake * 0.5} />
      ))}
      {lights && spec.beam ? (
        <>
          <primitive object={target} position={[0, 0, -45]} />
          <spotLight position={[0, 0.75, -2.0]} target={target} angle={0.5} penumbra={0.75} intensity={420} decay={1.65} color="#ffeccc" />
        </>
      ) : null}
      {spec.laserSpot ? (
        <>
          <mesh position={[0, 0.58, -2.3]} rotation={[0, Math.PI, 0]} material={mats.spot} renderOrder={6}>
            <planeGeometry args={[spotSize * 1.6, spotSize * 1.6]} />
          </mesh>
          <Glow pos={[0, 0.58, -2.45]} worldPos={world} color={PAL.red} size={spotSize * 2.2} opacity={spec.laserSpot} />
        </>
      ) : null}
    </group>
  );
};

const Forest: React.FC = () => {
  const mesh = useMemo(() => {
    const trees = forest();
    const mat = new THREE.MeshLambertMaterial({ vertexColors: true, flatShading: true });
    const m = new THREE.InstancedMesh(pineGeometry(), mat, trees.length);
    const o = new THREE.Object3D();
    trees.forEach((t, i) => {
      o.position.set(t.x, 0, t.z);
      o.rotation.set(0, t.r, 0);
      o.scale.setScalar(t.s);
      o.updateMatrix();
      m.setMatrixAt(i, o.matrix);
    });
    m.instanceMatrix.needsUpdate = true;
    m.frustumCulled = false;
    return m;
  }, []);
  return <primitive object={mesh} />;
};

const Hills: React.FC = () => {
  const mesh = useMemo(() => {
    const hs = hills();
    const geo = new THREE.IcosahedronGeometry(1, 2);
    const m = new THREE.InstancedMesh(geo, new THREE.MeshLambertMaterial({ color: "#ffffff", flatShading: true }), hs.length);
    const o = new THREE.Object3D();
    const c = new THREE.Color();
    hs.forEach((h, i) => {
      o.position.set(h.x, -h.sy * 0.12, h.z);
      o.rotation.set(0, h.r, 0);
      o.scale.set(h.sx, h.sy, h.sz);
      o.updateMatrix();
      m.setMatrixAt(i, o.matrix);
      m.setColorAt(i, c.set(h.far ? PAL.hillFar : PAL.hill));
    });
    m.instanceMatrix.needsUpdate = true;
    m.frustumCulled = false;
    return m;
  }, []);
  return <primitive object={mesh} />;
};

const Road: React.FC = () => {
  const mat = useMemo(() => {
    const { map, lines } = roadTextures();
    return new THREE.MeshLambertMaterial({
      map,
      emissive: "#9fb4cc",
      emissiveMap: lines,
      emissiveIntensity: 0.32,
      polygonOffset: true,
      polygonOffsetFactor: -2,
      polygonOffsetUnits: -2,
    });
  }, []);
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, ROAD_Z0 - ROAD_LENGTH / 2]} material={mat}>
      <planeGeometry args={[ROAD_TOTAL_W, ROAD_LENGTH]} />
    </mesh>
  );
};

const Sky: React.FC<{ exposure: number }> = ({ exposure }) => {
  const mat = useMemo(() => makeSkyMaterial(exposure), [exposure]);
  const { cam } = useContext(Ctx);
  const moon = MOON_DIR.clone().multiplyScalar(13000).add(v3(cam.pos));
  return (
    <>
      <mesh position={cam.pos} material={mat} renderOrder={-10} frustumCulled={false}>
        <sphereGeometry args={[15000, 48, 24]} />
      </mesh>
      <points geometry={stars()} position={[cam.pos[0], 0, cam.pos[2]]} frustumCulled={false}>
        <pointsMaterial color="#d6e4ff" size={2.2} sizeAttenuation={false} transparent opacity={0.75} fog={false} depthWrite={false} />
      </points>
      <sprite position={moon} scale={[420, 420, 1]} frustumCulled={false}>
        <spriteMaterial map={glowTexture()} color="#dfe9ff" transparent opacity={0.95} fog={false} depthWrite={false} blending={THREE.AdditiveBlending} />
      </sprite>
    </>
  );
};

const Radar: React.FC<{ spec: RadarSpec }> = ({ spec }) => {
  const fan = useMemo(() => makeRadarFanMaterial(), []);
  const curtains = useMemo(() => Array.from({ length: 5 }, () => makeCurtainMaterial()), []);
  const half = THREE.MathUtils.degToRad(spec.halfAngleDeg);
  // CircleGeometry vive en XY; tras rotar -90° en X, theta = -90° apunta a +Z
  const center = spec.facing === 1 ? -Math.PI / 2 : Math.PI / 2;
  const fanGeo = useMemo(
    () => new THREE.CircleGeometry(spec.range, 64, center - half, half * 2),
    [spec.range, center, half],
  );
  // CylinderGeometry: theta = 0 apunta a +Z
  const curtainGeo = useMemo(
    () => new THREE.CylinderGeometry(1, 1, 1, 48, 1, true, (spec.facing === 1 ? 0 : Math.PI) - half, half * 2).translate(0, 0.5, 0),
    [spec.facing, half],
  );
  useEffect(() => () => fanGeo.dispose(), [fanGeo]);
  fan.uniforms.uRange.value = spec.range;
  fan.uniforms.uHead.value = spec.head;
  fan.uniforms.uSpacing.value = spec.spacing;
  fan.uniforms.uOpacity.value = spec.opacity;
  fan.uniforms.uCenter.value = center;
  fan.uniforms.uHalf.value = half;
  fan.uniforms.uNearFade.value = spec.nearFade ?? 0;
  const fronts: number[] = [];
  for (let r = spec.head; r > 2 && fronts.length < 5; r -= spec.spacing) if (r < spec.range) fronts.push(r);
  return (
    <group position={spec.origin}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.12 - spec.origin[1], 0]} geometry={fanGeo} material={fan} renderOrder={8} />
      {fronts.map((r, i) => {
        const fade = Math.pow(Math.max(0, 1 - r / spec.range), 1.2) * spec.opacity;
        const m = curtains[i];
        m.uniforms.uOpacity.value = fade * 1.1;
        m.uniforms.uNearFade.value = spec.nearFade ?? 0;
        return (
          <mesh key={i} geometry={curtainGeo} material={m} scale={[r, 3 + r * 0.06, r]} position={[0, -spec.origin[1], 0]} renderOrder={9} />
        );
      })}
    </group>
  );
};

const Laser: React.FC<{ spec: LaserSpec }> = ({ spec }) => {
  const core = useMemo(() => makeBeamMaterial("#ff6a74", 1.2), []);
  const glow = useMemo(() => makeBeamMaterial(PAL.red, 2.6), []);
  const from = v3(spec.from);
  const full = v3(spec.to).sub(from);
  const len = Math.max(0.001, full.length() * spec.grow);
  const dir = full.clone().normalize();
  const rFar = spec.radiusNear + (spec.radiusFar - spec.radiusNear) * spec.grow;
  const geo = useMemo(
    () => new THREE.CylinderGeometry(rFar, spec.radiusNear, 1, 14, 1, true).translate(0, 0.5, 0),
    [rFar, spec.radiusNear],
  );
  useEffect(() => () => geo.dispose(), [geo]);
  const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir);
  for (const m of [core, glow]) {
    m.uniforms.uFade.value = spec.fadeFar ?? 0;
    m.uniforms.uPulse.value = spec.pulse ?? -1;
  }
  core.uniforms.uOpacity.value = spec.opacity * 1.6;
  glow.uniforms.uOpacity.value = spec.opacity * 0.75;
  return (
    <group position={spec.from} quaternion={q}>
      <mesh geometry={geo} material={core} scale={[1, len, 1]} renderOrder={7} />
      <mesh geometry={geo} material={glow} scale={[spec.glowScale ?? 2.6, len, spec.glowScale ?? 2.6]} renderOrder={7} />
    </group>
  );
};

const Marker: React.FC<{ spec: MarkerSpec }> = ({ spec }) => (
  <group position={[0, 0, spec.z]} scale={[spec.scale ?? 1, spec.scale ?? 1, spec.scale ?? 1]}>
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.08, 0]} renderOrder={4}>
      <planeGeometry args={[ROAD_TOTAL_W + 4, 1.4]} />
      <meshBasicMaterial color={spec.color ?? "#cfe6ff"} transparent opacity={spec.opacity * 0.9} blending={THREE.AdditiveBlending} depthWrite={false} fog={false} />
    </mesh>
    {[-1, 1].map((s) => (
      <mesh key={s} position={[s * (ROAD_TOTAL_W / 2 + 2), 2.5, 0]} renderOrder={4}>
        <boxGeometry args={[0.35, 5, 0.35]} />
        <meshBasicMaterial color={spec.color ?? "#cfe6ff"} transparent opacity={spec.opacity} fog={false} />
      </mesh>
    ))}
  </group>
);

const SpeedSign: React.FC<{ x: number; z: number }> = ({ x, z }) => {
  const mat = useMemo(
    () => new THREE.MeshLambertMaterial({ map: speedSignTexture(), emissive: "#ffffff", emissiveMap: speedSignTexture(), emissiveIntensity: 0.55, side: THREE.DoubleSide }),
    [],
  );
  return (
    <group position={[x, 0, z]}>
      <mesh position={[0, 1.15, 0]}>
        <cylinderGeometry args={[0.06, 0.06, 2.3, 8]} />
        <meshLambertMaterial color="#8a9099" />
      </mesh>
      <mesh position={[0, 2.7, 0.06]} material={mat}>
        <circleGeometry args={[0.85, 40]} />
      </mesh>
    </group>
  );
};

const Officer: React.FC<{ x: number; z: number; rotY?: number }> = ({ x, z, rotY = 0 }) => (
  <mesh geometry={officerGeometry()} position={[x, 0, z]} rotation={[0, rotY, 0]}>
    <meshLambertMaterial color="#1a2233" flatShading />
  </mesh>
);

const Studs: React.FC<{ size: number }> = ({ size }) => (
  <points geometry={roadStuds()} frustumCulled={false} renderOrder={3}>
    <pointsMaterial color="#ffe2a8" size={size} sizeAttenuation={false} transparent opacity={0.95} depthWrite={false} />
  </points>
);

const FogLayers: React.FC<{ opacity: number }> = ({ opacity }) => (
  <>
    {[
      [18, 0, 1],
      [55, 1.7, 0.8],
      [120, 3.1, 0.6],
    ].map(([y, r, k]) => (
      <mesh key={y} rotation={[-Math.PI / 2, 0, r]} position={[0, y, -1500]} renderOrder={2}>
        <planeGeometry args={[9000, 9000]} />
        <meshBasicMaterial
          map={fogTexture()}
          color="#a9c4ee"
          transparent
          opacity={opacity * k}
          depthWrite={false}
          fog={false}
          side={THREE.DoubleSide}
        />
      </mesh>
    ))}
  </>
);

export const World: React.FC<{ state: WorldState }> = ({ state }) => {
  const scene = useThree((s) => s.scene);
  const exposure = state.exposure ?? 1;
  const fog = useMemo(() => new THREE.Fog(PAL.fog, 1, 2), []);
  fog.near = state.fog[0];
  fog.far = state.fog[1];
  fog.color.set(PAL.fog).multiplyScalar(exposure);
  scene.fog = fog;
  return (
    <Ctx.Provider value={{ cam: state.cam, minPx: state.lightMinPx ?? 0 }}>
      <CameraRig cam={state.cam} />
      <Sky exposure={exposure} />
      <hemisphereLight args={["#5c82bd", "#0e1826", 1.25 * exposure]} />
      <directionalLight position={[MOON_DIR.x * 100, MOON_DIR.y * 100 + 40, MOON_DIR.z * 100]} color="#a9c2ff" intensity={1.1 * exposure} />
      {/* suelo subdividido y 15 cm bajo la calzada: un único triángulo gigante + búfer de profundidad
          logarítmico hacía "desaparecer" la carretera en algunos fotogramas */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.15, -3000]}>
        <planeGeometry args={[40000, 40000, 160, 160]} />
        <meshLambertMaterial color={PAL.ground} />
      </mesh>
      <Road />
      {state.roadGlow ? (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.5, ROAD_Z0 - ROAD_LENGTH / 2]} renderOrder={3}>
          <planeGeometry args={[16, ROAD_LENGTH]} />
          <meshBasicMaterial color="#9fc0ff" transparent opacity={state.roadGlow} blending={THREE.AdditiveBlending} depthWrite={false} fog={false} />
        </mesh>
      ) : null}
      <Forest />
      {state.hideHills ? null : <Hills />}
      {state.studs ? <Studs size={state.studs} /> : null}
      {state.fogLayers ? <FogLayers opacity={state.fogLayers} /> : null}
      {state.signs?.map((g) => <SpeedSign key={g.z} x={g.x} z={g.z} />)}
      {state.officer ? <Officer {...state.officer} /> : null}
      {state.markers?.map((m) => <Marker key={m.z} spec={m} />)}
      {state.cars.map((c, i) => <Car key={`${c.kind}${i}`} spec={c} />)}
      {state.radar ? <Radar spec={state.radar} /> : null}
      {state.laser && state.laser.grow > 0 ? <Laser spec={state.laser} /> : null}
    </Ctx.Provider>
  );
};

/** Proyección 3D → píxeles con la misma cámara que el render (para etiquetas HUD). */
export const projectToScreen = (cam: CamSpec, p: V3, w = 1080, h = 1920) => {
  const c = new THREE.PerspectiveCamera(cam.fov, w / h, 0.3, 30000);
  c.position.set(...cam.pos);
  c.up.set(...(cam.up ?? [0, 1, 0]));
  c.lookAt(...cam.target);
  if (cam.roll) c.rotateZ(cam.roll);
  c.updateMatrixWorld();
  c.updateProjectionMatrix();
  const v = v3(p).project(c);
  return { x: (v.x * 0.5 + 0.5) * w, y: (-v.y * 0.5 + 0.5) * h, visible: v.z < 1 && v.z > -1 };
};

export { PLATE_TEXT };
