import * as THREE from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";

/**
 * Geometrías, texturas y materiales compartidos (se crean una sola vez por pestaña de render).
 * Todo es determinista: nada de Math.random.
 */

export const hash = (n: number) => {
  const x = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};

const once = <T>(fn: () => T) => {
  let v: T | undefined;
  return () => (v ??= fn());
};

const canvas = (w: number, h: number) => {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  return c;
};

// ------------------------------------------------------------------ paleta
export const PAL = {
  skyZenith: "#081430",
  skyMid: "#173563",
  skyHorizon: "#3a6496",
  fog: "#2b4c78",
  ground: "#16263a",
  hill: "#2d4b73",
  hillFar: "#3a5d8c",
  pine: "#24605c",
  trunk: "#2e2622",
  hero: "#f3f5f8",
  patrol: "#3a4458",
  glass: "#0c1626",
  tire: "#0b0e13",
  red: "#ff2d3d",
  blue: "#3fa9ff",
  amber: "#ffc93d",
};

// ------------------------------------------------------------------ texturas
export const glowTexture = once(() => {
  const c = canvas(256, 256);
  const g = c.getContext("2d")!;
  const grd = g.createRadialGradient(128, 128, 0, 128, 128, 128);
  grd.addColorStop(0, "rgba(255,255,255,1)");
  grd.addColorStop(0.1, "rgba(255,255,255,0.8)");
  grd.addColorStop(0.3, "rgba(255,255,255,0.18)");
  grd.addColorStop(0.65, "rgba(255,255,255,0.04)");
  grd.addColorStop(1, "rgba(255,255,255,0)");
  g.fillStyle = grd;
  g.fillRect(0, 0, 256, 256);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
});

/** Calzada de 7,4 m + bermas de 1,4 m. Un tile = 12 m (línea central 4 m pintada / 8 m vacía). */
const ROAD_W_PX = 512;
const ROAD_TILE_M = 12;
export const ROAD_TOTAL_W = 10.2;
const roadCanvas = (linesOnly: boolean) => {
  const c = canvas(ROAD_W_PX, 512);
  const g = c.getContext("2d")!;
  const m = ROAD_W_PX / ROAD_TOTAL_W; // px por metro (ancho)
  const mz = 512 / ROAD_TILE_M; // px por metro (largo)
  const X = (xm: number) => (xm + ROAD_TOTAL_W / 2) * m;
  if (!linesOnly) {
    g.fillStyle = "#2a323d";
    g.fillRect(0, 0, ROAD_W_PX, 512);
    g.fillStyle = "#38414f";
    g.fillRect(X(-3.7), 0, 7.4 * m, 512);
    // grano del asfalto
    const img = g.getImageData(0, 0, ROAD_W_PX, 512);
    for (let i = 0; i < img.data.length; i += 4) {
      const n = (hash(i * 0.37) - 0.5) * 9;
      img.data[i] += n;
      img.data[i + 1] += n;
      img.data[i + 2] += n;
    }
    g.putImageData(img, 0, 0);
  } else {
    g.fillStyle = "#000";
    g.fillRect(0, 0, ROAD_W_PX, 512);
  }
  g.fillStyle = linesOnly ? "#fff" : "#e9edf2";
  g.fillRect(X(-3.62), 0, 0.15 * m, 512);
  g.fillRect(X(3.47), 0, 0.15 * m, 512);
  g.fillRect(X(-0.07), 0, 0.14 * m, 4 * mz);
  const t = new THREE.CanvasTexture(c);
  t.wrapS = THREE.ClampToEdgeWrapping;
  t.wrapT = THREE.RepeatWrapping;
  t.anisotropy = 16;
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
};
export const ROAD_LENGTH = 14000;
export const ROAD_Z0 = 2000; // la calzada va de z=+2000 a z=-12000
export const roadTextures = once(() => {
  const map = roadCanvas(false);
  const lines = roadCanvas(true);
  for (const t of [map, lines]) t.repeat.set(1, ROAD_LENGTH / ROAD_TILE_M);
  return { map, lines };
});

/** Patente genérica (formato chileno, combinación inválida a propósito: "AB" lleva vocal). */
export const PLATE_TEXT = "AB·CD·12";
export const plateCanvas = once(() => {
  const c = canvas(512, 160);
  const g = c.getContext("2d")!;
  g.fillStyle = "#f4f4ef";
  g.fillRect(0, 0, 512, 160);
  g.strokeStyle = "#1a1a1a";
  g.lineWidth = 8;
  g.strokeRect(6, 6, 500, 148);
  g.fillStyle = "#111";
  g.font = "bold 112px sans-serif";
  g.textAlign = "center";
  g.textBaseline = "middle";
  g.fillText(PLATE_TEXT, 256, 86, 470);
  return c;
});
export const plateTexture = once(() => {
  const t = new THREE.CanvasTexture(plateCanvas());
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  return t;
});

// ------------------------------------------------------------------ geometrías del auto
const quad = (a: number[], b: number[], c: number[], d: number[]) => {
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute([...a, ...b, ...c, ...a, ...c, ...d], 3));
  g.computeVertexNormals();
  return g;
};

/** Perfil lateral (u = metros hacia el frente, y = altura). El frente mira a -Z. */
const PROFILE: [number, number][] = [
  [-2.2, 0.32],
  [2.2, 0.32],
  [2.26, 0.6],
  [2.08, 0.8],
  [0.85, 0.95],
  [0.12, 1.42],
  [-1.05, 1.42],
  [-1.78, 1.0],
  [-2.2, 0.95],
  [-2.26, 0.6],
];

export const carGeometries = once(() => {
  const shape = new THREE.Shape(PROFILE.map(([u, y]) => new THREE.Vector2(u, y)));
  const body = new THREE.ExtrudeGeometry(shape, { depth: 1.8, bevelEnabled: false });
  body.translate(0, 0, -0.9);
  body.rotateY(Math.PI / 2);

  const win = new THREE.Shape(
    [
      [0.72, 1.0],
      [0.14, 1.36],
      [-1.0, 1.36],
      [-1.62, 1.03],
    ].map(([u, y]) => new THREE.Vector2(u, y)),
  );
  const sideR = new THREE.ShapeGeometry(win);
  sideR.rotateY(Math.PI / 2);
  sideR.translate(0.905, 0, 0);
  const sideL = sideR.clone();
  sideL.translate(-1.81, 0, 0);
  const w = 0.78;
  const ws = quad([-w, 0.97, -0.84], [w, 0.97, -0.84], [w, 1.405, -0.16], [-w, 1.405, -0.16]);
  const rw = quad([w, 1.02, 1.76], [-w, 1.02, 1.76], [-w, 1.405, 1.07], [w, 1.405, 1.07]);
  const plain = (g: THREE.BufferGeometry) => {
    const q = g.index ? g.toNonIndexed() : g;
    for (const k of Object.keys(q.attributes)) if (k !== "position" && k !== "normal") q.deleteAttribute(k);
    return q;
  };
  const glass = mergeGeometries([sideR, sideL, ws, rw].map(plain))!;
  if (!glass) throw new Error("glass merge");

  const wheel = new THREE.CylinderGeometry(0.34, 0.34, 0.26, 10);
  wheel.rotateZ(Math.PI / 2);
  const wheels = mergeGeometries(
    [
      [0.84, -1.38],
      [-0.84, -1.38],
      [0.84, 1.4],
      [-0.84, 1.4],
    ].map(([x, z]) => wheel.clone().translate(x, 0.34, z)),
  )!;

  const head = mergeGeometries([-0.62, 0.62].map((x) => new THREE.BoxGeometry(0.38, 0.13, 0.06).translate(x, 0.68, -2.215)))!;
  const tail = mergeGeometries([-0.66, 0.66].map((x) => new THREE.BoxGeometry(0.34, 0.12, 0.06).translate(x, 0.82, 2.225)))!;
  const lightbar = new THREE.BoxGeometry(1.15, 0.13, 0.32).translate(0, 1.49, -0.4);
  const plateF = new THREE.PlaneGeometry(0.4, 0.125).rotateY(Math.PI).translate(0, 0.5, -2.262);
  const plateR = new THREE.PlaneGeometry(0.4, 0.125).translate(0, 0.62, 2.262);
  return { body, glass, wheels, head, tail, lightbar, plateF, plateR };
});

// ------------------------------------------------------------------ pinos (instanciados)
export const pineGeometry = once(() => {
  const parts: THREE.BufferGeometry[] = [];
  const paint = (g: THREE.BufferGeometry, hex: string) => {
    const c = new THREE.Color(hex);
    const n = g.attributes.position.count;
    const arr = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) arr.set([c.r, c.g, c.b], i * 3);
    g.setAttribute("color", new THREE.BufferAttribute(arr, 3));
    return g.toNonIndexed();
  };
  parts.push(paint(new THREE.CylinderGeometry(0.18, 0.26, 2.2, 5).translate(0, 1.1, 0), PAL.trunk));
  parts.push(paint(new THREE.ConeGeometry(2.3, 4.2, 7).translate(0, 3.6, 0), PAL.pine));
  parts.push(paint(new THREE.ConeGeometry(1.75, 3.6, 7).translate(0, 5.6, 0), "#2a6e68"));
  parts.push(paint(new THREE.ConeGeometry(1.15, 3.0, 7).translate(0, 7.4, 0), "#317c73"));
  const all = parts.map((p) => {
    const q = p.index ? p.toNonIndexed() : p;
    q.deleteAttribute("uv");
    return q;
  });
  const g = mergeGeometries(all)!;
  g.computeVertexNormals();
  return g;
});

export type TreeInst = { x: number; z: number; s: number; r: number };
/** Bosque a ambos lados, de z=+700 a z=-3700, con claros. Nunca sobre la calzada ni las bermas. */
export const forest = once(() => {
  const out: TreeInst[] = [];
  let k = 0;
  for (let z = 700; z > -3700; z -= 3.1) {
    for (const side of [-1, 1]) {
      for (let j = 0; j < 3; j++) {
        k++;
        const band = hash(k * 1.3);
        // densidad: alta cerca del camino, decae hacia afuera
        const dist = 9.5 + Math.pow(band, 1.8) * 150;
        const clearing = Math.sin(z * 0.011 + side * 1.7) + Math.sin(z * 0.027 + 2.1) * 0.6;
        if (clearing > 1.05 && dist > 14) continue;
        if (hash(k * 2.7) > 0.62 - dist / 600) continue;
        out.push({
          x: side * dist + (hash(k * 5.1) - 0.5) * 2,
          z: z + (hash(k * 3.3) - 0.5) * 3,
          s: 0.7 + hash(k * 7.7) * 0.85,
          r: hash(k * 9.1) * Math.PI * 2,
        });
      }
    }
  }
  return out;
});

export type HillInst = { x: number; z: number; sx: number; sy: number; sz: number; r: number; far: boolean };
export const hills = once(() => {
  const out: HillInst[] = [];
  let k = 100;
  // lomas laterales: pocas, amplias y lejos del bosque que bordea la carretera
  for (let z = 900; z > -5200; z -= 640) {
    for (const side of [-1, 1]) {
      k++;
      const sx = 320 + hash(k + 2) * 420;
      out.push({
        x: side * (240 + sx * 0.9 + hash(k) * 450),
        z: z + (hash(k + 1) - 0.5) * 300 + (side > 0 ? 320 : 0),
        sx,
        sy: 90 + hash(k + 3) * 170,
        sz: 380 + hash(k + 4) * 380,
        r: hash(k + 5) * 6,
        far: false,
      });
    }
  }
  // cordón de cerros al fondo (más allá de la patrulla), y detrás de la cámara
  for (let i = 0; i < 22; i++) {
    k++;
    out.push({
      x: -5200 + i * 500 + hash(k) * 200,
      z: -6200 - hash(k + 1) * 1600,
      sx: 900 + hash(k + 2) * 800,
      sy: 380 + hash(k + 3) * 520,
      sz: 700 + hash(k + 4) * 500,
      r: hash(k + 5) * 6,
      far: true,
    });
    out.push({
      x: -5200 + i * 500 + hash(k + 9) * 200,
      z: 3600 + hash(k + 6) * 1200,
      sx: 900 + hash(k + 7) * 700,
      sy: 300 + hash(k + 8) * 400,
      sz: 700,
      r: hash(k + 10) * 6,
      far: true,
    });
  }
  return out;
});

/** Estrellas en el domo (dirección unitaria * radio). */
export const stars = once(() => {
  const pos: number[] = [];
  for (let i = 0; i < 700; i++) {
    const az = hash(i * 3.1) * Math.PI * 2;
    const el = Math.asin(0.06 + hash(i * 5.7) * 0.94);
    const r = 14000;
    pos.push(Math.cos(el) * Math.sin(az) * r, Math.sin(el) * r, -Math.cos(el) * Math.cos(az) * r);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  return g;
});

// ------------------------------------------------------------------ shaders aditivos
/** Haz cilíndrico con caída tipo "fresnel" (neón). uFade: desvanecimiento hacia el extremo lejano. */
export const makeBeamMaterial = (color: string, power: number) =>
  new THREE.ShaderMaterial({
    uniforms: {
      uColor: { value: new THREE.Color(color) },
      uOpacity: { value: 1 },
      uPower: { value: power },
      uFade: { value: 0 },
      uPulse: { value: -1 },
    },
    vertexShader: /* glsl */ `
      #include <common>
      #include <logdepthbuf_pars_vertex>
      varying vec3 vN; varying vec3 vV; varying float vY;
      void main(){
        vec4 mv = modelViewMatrix * vec4(position,1.0);
        vN = normalize(normalMatrix * normal);
        vV = normalize(-mv.xyz);
        vY = uv.y;
        gl_Position = projectionMatrix * mv;
        #include <logdepthbuf_vertex>
      }`,
    fragmentShader: /* glsl */ `
      #include <logdepthbuf_pars_fragment>
      uniform vec3 uColor; uniform float uOpacity; uniform float uPower; uniform float uFade; uniform float uPulse;
      varying vec3 vN; varying vec3 vV; varying float vY;
      void main(){
        #include <logdepthbuf_fragment>
        float f = pow(abs(dot(normalize(vN), normalize(vV))), uPower);
        float along = 1.0 - uFade * smoothstep(0.0, 1.0, vY);
        float pulse = uPulse < 0.0 ? 0.0 : exp(-pow((vY - uPulse) / 0.035, 2.0)) * 2.2;
        gl_FragColor = vec4(uColor * (f * (1.0 + pulse)) * uOpacity * along, 1.0);
      }`,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    side: THREE.DoubleSide,
  });

/** Abanico del radar en el suelo: relleno tenue + frentes de onda que avanzan. */
export const makeRadarFanMaterial = () =>
  new THREE.ShaderMaterial({
    uniforms: {
      uColor: { value: new THREE.Color(PAL.blue) },
      uRange: { value: 400 },
      uHead: { value: 0 },
      uSpacing: { value: 60 },
      uOpacity: { value: 1 },
    },
    depthTest: false,
    vertexShader: /* glsl */ `
      #include <common>
      #include <logdepthbuf_pars_vertex>
      varying vec2 vP;
      void main(){ vP = position.xy; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0);
        #include <logdepthbuf_vertex>
      }`,
    fragmentShader: /* glsl */ `
      #include <logdepthbuf_pars_fragment>
      uniform vec3 uColor; uniform float uRange; uniform float uHead; uniform float uSpacing; uniform float uOpacity;
      varying vec2 vP;
      void main(){
        #include <logdepthbuf_fragment>
        float r = length(vP);
        float k = r / uRange;
        float fade = pow(clamp(1.0 - k, 0.0, 1.0), 1.1);
        // solo hasta donde ya llegó la onda
        float reached = 1.0 - smoothstep(uHead - 6.0, uHead, r);
        float fill = 0.2 * reached;
        float ph = (uHead - r) / uSpacing;
        float band = (ph >= 0.0) ? exp(-pow(fract(ph) * uSpacing / max(1.2, r * 0.03), 2.0)) : 0.0;
        float a = (fill + band * 1.25) * fade * uOpacity;
        gl_FragColor = vec4(uColor * a, 1.0);
      }`,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    side: THREE.DoubleSide,
  });

/** Cortina vertical de cada frente de onda (degradado vertical). */
export const makeCurtainMaterial = () =>
  new THREE.ShaderMaterial({
    uniforms: { uColor: { value: new THREE.Color(PAL.blue) }, uOpacity: { value: 1 } },
    vertexShader: /* glsl */ `
      #include <common>
      #include <logdepthbuf_pars_vertex>
      varying float vY;
      void main(){ vY = uv.y; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0);
        #include <logdepthbuf_vertex>
      }`,
    fragmentShader: /* glsl */ `
      #include <logdepthbuf_pars_fragment>
      uniform vec3 uColor; uniform float uOpacity; varying float vY;
      void main(){
        #include <logdepthbuf_fragment>
        gl_FragColor = vec4(uColor * pow(1.0 - vY, 1.6) * uOpacity, 1.0); }`,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    side: THREE.DoubleSide,
  });

/** Domo del cielo: degradado nocturno + halo de la luna. Escribe sRGB directo (renderer "flat"). */
export const MOON_DIR = new THREE.Vector3(-0.17, 0.14, -0.975).normalize();
export const makeSkyMaterial = (exposure: number) =>
  new THREE.ShaderMaterial({
    uniforms: {
      uZenith: { value: new THREE.Color(PAL.skyZenith) },
      uMid: { value: new THREE.Color(PAL.skyMid) },
      uHorizon: { value: new THREE.Color(PAL.skyHorizon) },
      uMoon: { value: MOON_DIR },
      uExposure: { value: exposure },
    },
    vertexShader: /* glsl */ `
      varying vec3 vDir;
      void main(){ vDir = normalize(position); vec4 p = projectionMatrix * modelViewMatrix * vec4(position,1.0); gl_Position = p.xyww; }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uZenith; uniform vec3 uMid; uniform vec3 uHorizon; uniform vec3 uMoon; uniform float uExposure;
      varying vec3 vDir;
      void main(){
        vec3 d = normalize(vDir);
        float h = max(d.y, 0.0);
        vec3 c = mix(uHorizon, uMid, smoothstep(0.0, 0.16, h));
        c = mix(c, uZenith, smoothstep(0.14, 0.75, h));
        float m = max(dot(d, uMoon), 0.0);
        c += vec3(0.55, 0.65, 0.85) * (pow(m, 900.0) * 1.4 + pow(m, 60.0) * 0.22 + pow(m, 8.0) * 0.07);
        if (d.y < 0.0) c = uHorizon;
        gl_FragColor = vec4(c * uExposure, 1.0);
      }`,
    side: THREE.BackSide,
    depthWrite: false,
    fog: false,
  });
