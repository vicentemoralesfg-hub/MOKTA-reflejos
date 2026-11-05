import * as THREE from "three";

/**
 * Iluminación compartida (atardecer + focos del auto + luz de freno + balizas),
 * calculada en el shader en coordenadas de mundo: barata en WebGL por software y determinista.
 * Todos los materiales comparten los mismos objetos uniform: se actualizan una vez por fotograma.
 */
export const U = {
  uCam: { value: new THREE.Vector3() },
  uCarPos: { value: new THREE.Vector3() },
  uCarFwd: { value: new THREE.Vector2(0, -1) },
  uHead: { value: 1 },
  uBrake: { value: 0 },
  uHazard: { value: 0 },
  uExposure: { value: 1.25 },
  uFogDensity: { value: 0.0032 },
  uTravel: { value: 0 },
  uTravelDir: { value: new THREE.Vector2(0, -1) },
  uDesat: { value: 0 },
};

export const LIGHT_GLSL = /* glsl */ `
uniform vec3 uCam;
uniform vec3 uCarPos;
uniform vec2 uCarFwd;
uniform float uHead;
uniform float uBrake;
uniform float uHazard;
uniform float uExposure;
uniform float uFogDensity;
uniform float uDesat;

const vec3 SUN_DIR = normalize(vec3(0.62, 0.10, -0.78));

vec3 skyColor(vec3 d) {
  float e = d.y;
  float sunAmt = pow(max(dot(normalize(vec3(d.x, 0.0, d.z) + 1e-5), normalize(vec3(SUN_DIR.x, 0.0, SUN_DIR.z))), 0.0), 3.0);
  vec3 zen = vec3(0.020, 0.032, 0.090);
  vec3 mid = vec3(0.085, 0.100, 0.230);
  vec3 horCold = vec3(0.30, 0.24, 0.36);
  vec3 horWarm = vec3(1.05, 0.46, 0.20);
  vec3 hor = mix(horCold, horWarm, sunAmt);
  vec3 c = mix(hor, mid, smoothstep(0.0, 0.16, e));
  c = mix(c, zen, smoothstep(0.16, 0.75, e));
  // resplandor del sol ya oculto
  c += vec3(0.9, 0.35, 0.12) * sunAmt * exp(-max(e, 0.0) * 18.0) * 0.55;
  // bajo el horizonte: neblina oscura
  c = mix(c, vec3(0.06, 0.055, 0.075), smoothstep(0.0, -0.08, e));
  return c;
}

vec3 fogCol(vec3 d) {
  return mix(skyColor(normalize(vec3(d.x, 0.02, d.z))), vec3(0.15, 0.14, 0.22), 0.5) * 0.78;
}

vec3 hemi(vec3 n) {
  vec3 sky = vec3(0.26, 0.28, 0.46);
  vec3 ground = vec3(0.07, 0.055, 0.05);
  return mix(ground, sky, n.y * 0.5 + 0.5);
}

// Focos (luz baja) del auto. p en mundo.
float headlights(vec3 p) {
  vec2 f = uCarFwd;
  vec2 r = vec2(-f.y, f.x);
  float I = 0.0;
  for (int i = 0; i < 2; i++) {
    float side = i == 0 ? -0.68 : 0.68;
    vec3 lp = vec3(uCarPos.x, 0.66, uCarPos.z) + vec3(f.x, 0.0, f.y) * 2.25 + vec3(r.x, 0.0, r.y) * side;
    vec3 rel = p - lp;
    float df = dot(rel.xz, f);
    if (df < 0.15) continue;
    float a = dot(rel.xz, r) / df;
    float beam = exp(-pow((a - 0.04) / 0.40, 2.0));
    float reach = mix(26.0, 42.0, smoothstep(-0.1, 0.25, a));
    float fall = 1.0 / (1.0 + pow(df / reach, 2.4));
    float near = smoothstep(1.0, 7.0, df);
    float el = rel.y / df;
    float cut = 1.0 - smoothstep(-0.005, 0.05, el);
    I += beam * fall * near * cut * 0.5;
  }
  return I * uHead;
}

// Luz roja trasera (posición + freno) y ámbar de balizas sobre el entorno.
vec3 carGlow(vec3 p) {
  vec2 f = uCarFwd;
  vec3 rear = vec3(uCarPos.x, 0.8, uCarPos.z) - vec3(f.x, 0.0, f.y) * 2.35;
  vec3 rel = p - rear;
  float d = length(rel);
  float back = smoothstep(0.35, -0.6, dot(normalize(rel.xz + 1e-5), f));
  vec3 red = vec3(1.0, 0.04, 0.02) * (0.08 + 1.3 * uBrake) * back / (1.0 + pow(d / 1.0, 2.0));
  float dc = length(p - vec3(uCarPos.x, 0.7, uCarPos.z));
  vec3 amber = vec3(1.0, 0.45, 0.04) * uHazard * 1.5 / (1.0 + pow(dc / 2.3, 2.0));
  return red + amber;
}

vec3 tonemap(vec3 c) {
  c = 1.0 - exp(-c * uExposure);
  float l = dot(c, vec3(0.299, 0.587, 0.114));
  c = mix(c, vec3(l), uDesat);
  return pow(clamp(c, 0.0, 1.0), vec3(1.0 / 2.2));
}

float hash12(vec2 p) {
  vec3 p3 = fract(vec3(p.xyx) * .1031);
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.x + p3.y) * p3.z);
}
float vnoise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  float a = hash12(i), b = hash12(i + vec2(1.0, 0.0));
  float c = hash12(i + vec2(0.0, 1.0)), d = hash12(i + vec2(1.0, 1.0));
  return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}

vec3 applyFog(vec3 col, vec3 p) {
  vec3 dv = p - uCam;
  float d = length(dv);
  float k = 1.0 - exp(-d * uFogDensity);
  return mix(col, fogCol(dv / max(d, 1e-4)), k);
}
`;

const VERT = /* glsl */ `
varying vec3 vWorld;
varying vec3 vNormal;
varying vec2 vUv;
void main() {
  vUv = uv;
  vec4 w = modelMatrix * vec4(position, 1.0);
  vWorld = w.xyz;
  vNormal = normalize(mat3(modelMatrix) * normal);
  gl_Position = projectionMatrix * viewMatrix * w;
}
`;

/* ------------------------------------------------------------------ carretera */
const ROAD_FRAG = /* glsl */ `
${LIGHT_GLSL}
uniform float uTravel;
uniform vec2 uTravelDir;
varying vec3 vWorld;

float band(float v, float a, float b, float fw) {
  return smoothstep(a - fw, a + fw, v) * (1.0 - smoothstep(b - fw, b + fw, v));
}
float pulseIntegral(float s, float P, float D) { return floor(s / P) * D + min(mod(s, P), D); }
float dashCov(float z, float P, float D, float L) {
  float s = -z;
  float l = max(L, 0.02);
  return (pulseIntegral(s + l, P, D) - pulseIntegral(s, P, D)) / l;
}

vec3 groundAt(vec2 q, float grainFade) {
  float x = q.x;
  float z = q.y;
  float g = (vnoise(q * 30.0) * 0.6 + vnoise(q * 9.0) * 0.4) - 0.5;
  float g2 = vnoise(q * 0.9) - 0.5;
  float g3 = vnoise(q * 0.13) - 0.5;
  vec3 asphalt = vec3(0.105, 0.106, 0.112) * (1.0 + g * 0.45 * grainFade + g2 * 0.12 + g3 * 0.12);
  // huellas de rodado más pulidas
  float lx = min(abs(abs(x - 1.75) - 0.8), abs(abs(x + 1.75) - 0.8));
  asphalt *= 1.0 + smoothstep(0.35, 0.0, lx) * 0.10;
  vec3 shoulder = vec3(0.085, 0.082, 0.080) * (1.0 + g * 0.5 * grainFade + g2 * 0.2);
  vec3 gravel = vec3(0.16, 0.14, 0.11) * (1.0 + g * 0.9 * grainFade + g2 * 0.3);
  vec3 grass = mix(vec3(0.20, 0.17, 0.09), vec3(0.11, 0.12, 0.06), vnoise(q * 0.35)) * (1.0 + g * 0.6 * grainFade + g3 * 0.5);

  vec3 c = grass;
  // calzada propia [-3.6, 3.6], bermas [-4.4,-3.6] y [3.6, 6.0], grava [6.0, 7.0]
  c = mix(c, gravel, band(x, 6.0, 7.2, 0.15));
  c = mix(c, shoulder, band(x, 3.6, 6.0, 0.02));
  c = mix(c, asphalt, band(x, -3.6, 3.6, 0.02));
  c = mix(c, shoulder, band(x, -4.45, -3.6, 0.02));
  // calzada contraria
  c = mix(c, shoulder, band(x, -6.0, -5.1, 0.02));
  c = mix(c, asphalt * 0.95, band(x, -13.2, -6.0, 0.02));
  c = mix(c, shoulder, band(x, -15.4, -13.2, 0.02));
  c = mix(c, gravel, band(x, -16.4, -15.4, 0.15));
  return c;
}

float paintAt(vec2 q, float fw, float L) {
  float x = q.x;
  float z = q.y;
  float p = 0.0;
  p += band(x, 3.42, 3.57, fw);
  p += band(x, -3.57, -3.42, fw);
  p += band(x, -0.075, 0.075, fw) * dashCov(z, 12.0, 4.5, L);
  p += band(x, -6.17, -6.02, fw);
  p += band(x, -13.17, -13.02, fw);
  p += band(x, -9.675, -9.525, fw) * dashCov(z, 12.0, 4.5, L);
  // desgaste
  p *= 0.82 + 0.18 * vnoise(q * vec2(6.0, 0.7));
  return clamp(p, 0.0, 1.0);
}

void main() {
  vec2 q = vWorld.xz;
  float dist = length(vWorld - uCam);
  float fw = max(fwidth(q.x), 0.003);
  float grainFade = 1.0 - smoothstep(5.0, 30.0, dist);

  // desenfoque de movimiento: promedia el suelo a lo largo del recorrido del fotograma
  vec3 base = vec3(0.0);
  float paint = 0.0;
  for (int i = 0; i < 4; i++) {
    float k = (float(i) / 3.0 - 0.5) * uTravel;
    vec2 qq = q + uTravelDir * k;
    base += groundAt(qq, grainFade * (1.0 - smoothstep(0.1, 0.6, uTravel)));
    paint += paintAt(qq, fw, 0.0);
  }
  base *= 0.25;
  paint *= 0.25;

  float I = headlights(vWorld);
  vec3 light = hemi(vec3(0.0, 1.0, 0.0)) * 0.5 + vec3(1.0, 0.92, 0.82) * I * 2.4 + carGlow(vWorld);
  vec3 col = base * light;
  // pintura retrorreflectante: brilla con los focos
  vec3 paintCol = vec3(0.86, 0.86, 0.82) * (light + vec3(1.0, 0.95, 0.85) * I * 2.6);
  col = mix(col, paintCol, paint);
  col = applyFog(col, vWorld);
  vec3 o = tonemap(col);
  o += (hash12(gl_FragCoord.xy) - 0.5) / 255.0;
  gl_FragColor = vec4(o, 1.0);
}
`;

/* ------------------------------------------------------------------ superficies */
const LIT_FRAG = /* glsl */ `
${LIGHT_GLSL}
uniform vec3 uColor;
uniform float uSpec;      // reflexión especular / de cielo (pintura, vidrio)
uniform float uGlass;     // 1 = vidrio (techo pintado si la normal mira arriba)
uniform vec3 uRoofColor;
uniform sampler2D uMap;
uniform float uUseMap;
uniform float uSelfCar;   // 1 = pertenece al auto (no lo iluminan sus propios focos)
uniform vec3 uEmissive;
varying vec3 vWorld;
varying vec3 vNormal;
varying vec2 vUv;

void main() {
  vec3 n = normalize(vNormal);
  if (!gl_FrontFacing) n = -n;
  vec3 base = uColor;
  if (uUseMap > 0.5) base *= texture2D(uMap, vUv).rgb;
  float spec = uSpec;
  if (uGlass > 0.5 && n.y > 0.9) { base = uRoofColor; spec = 0.35; }
  else if (uGlass > 0.5) { base = vec3(0.012, 0.014, 0.018); spec = 0.55; }

  vec3 V = normalize(uCam - vWorld);
  float sunL = max(dot(n, SUN_DIR), 0.0);
  vec3 light = hemi(n) * 0.75 + vec3(1.0, 0.55, 0.30) * sunL * 0.55;
  if (uSelfCar < 0.5) {
    light += vec3(1.0, 0.92, 0.82) * headlights(vWorld) * 2.6 * (0.35 + 0.65 * max(n.y, max(dot(n, vec3(-uCarFwd.x, 0.0, -uCarFwd.y)), 0.0)));
  }
  light += carGlow(vWorld) * (uSelfCar > 0.5 ? 0.25 : 1.0);
  vec3 col = base * light;

  if (spec > 0.0) {
    vec3 R = reflect(-V, n);
    float fres = 0.04 + 0.96 * pow(1.0 - max(dot(n, V), 0.0), 5.0);
    vec3 env = skyColor(normalize(R));
    if (R.y < 0.0) env = vec3(0.05, 0.05, 0.06);
    col += env * fres * spec * 1.1;
    float h = pow(max(dot(normalize(SUN_DIR + V), n), 0.0), 60.0);
    col += vec3(1.0, 0.6, 0.35) * h * spec * 0.5;
  }
  col += uEmissive;
  col = applyFog(col, vWorld);
  gl_FragColor = vec4(tonemap(col), 1.0);
}
`;

const SKY_FRAG = /* glsl */ `
${LIGHT_GLSL}
varying vec3 vWorld;
void main() {
  vec3 d = normalize(vWorld - uCam);
  vec3 c = skyColor(d);
  // estrellas tenues hacia el cenit
  vec2 sp = d.xz / max(d.y + 0.2, 0.05) * 140.0;
  float st = step(0.9965, hash12(floor(sp))) * smoothstep(0.25, 0.6, d.y);
  c += vec3(0.5, 0.6, 0.8) * st * 0.6;
  vec3 o = tonemap(c);
  o += (hash12(gl_FragCoord.xy) - 0.5) / 255.0;
  gl_FragColor = vec4(o, 1.0);
}
`;

export const makeRoad = () =>
  new THREE.ShaderMaterial({
    vertexShader: VERT,
    fragmentShader: ROAD_FRAG,
    uniforms: { ...U },
    extensions: { derivatives: true } as never,
  });

export const makeSky = () =>
  new THREE.ShaderMaterial({
    vertexShader: VERT,
    fragmentShader: SKY_FRAG,
    uniforms: { ...U },
    side: THREE.BackSide,
    depthWrite: false,
  });

export type LitOpts = {
  color: [number, number, number];
  spec?: number;
  glass?: boolean;
  roof?: [number, number, number];
  map?: THREE.Texture | null;
  selfCar?: boolean;
  emissive?: [number, number, number];
  side?: THREE.Side;
};

export const makeLit = (o: LitOpts) =>
  new THREE.ShaderMaterial({
    vertexShader: VERT,
    fragmentShader: LIT_FRAG,
    side: o.side ?? THREE.FrontSide,
    uniforms: {
      ...U,
      uColor: { value: new THREE.Color(...o.color) },
      uSpec: { value: o.spec ?? 0 },
      uGlass: { value: o.glass ? 1 : 0 },
      uRoofColor: { value: new THREE.Color(...(o.roof ?? [0.8, 0.8, 0.8])) },
      uMap: { value: o.map ?? null },
      uUseMap: { value: o.map ? 1 : 0 },
      uSelfCar: { value: o.selfCar ? 1 : 0 },
      uEmissive: { value: new THREE.Color(...(o.emissive ?? [0, 0, 0])) },
    },
  });
