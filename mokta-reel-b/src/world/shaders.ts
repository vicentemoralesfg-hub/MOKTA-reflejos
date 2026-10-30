import * as THREE from "three";

/**
 * Iluminación simulada de los focos del auto (luz baja), compartida por
 * todos los materiales. Se calcula en coordenadas de mundo a partir de la
 * posición de la cámara: barata en render por software y totalmente determinista.
 */
export const HEADLIGHT_GLSL = /* glsl */ `
uniform vec3 uCam;
uniform float uFogDensity;
uniform vec3 uFogColor;

// Intensidad de la luz baja sobre un punto del mundo.
float headlight(vec3 p) {
  float dz = uCam.z - p.z;              // distancia hacia adelante
  if (dz < 0.5) return 0.0;
  float a = (p.x - uCam.x) / dz;        // ángulo lateral (tangente)
  // haz de luz baja: núcleo + bordes suaves, más ancho cerca
  float beam = exp(-pow(a / 0.30, 2.0)) * 0.8 + exp(-pow(a / 0.62, 2.0)) * 0.2;
  // asimétrica: alcanza más lejos hacia la derecha (tránsito por la derecha)
  float reach = mix(26.0, 46.0, smoothstep(-0.10, 0.22, a));
  float fall = 1.0 / (1.0 + pow(dz / reach, 3.0));
  float near = smoothstep(2.0, 9.0, dz);
  // la luz cae con la altura (los focos están a ~0,7 m; corte horizontal de la luz baja)
  float h = exp(-max(p.y - 0.7, 0.0) * 0.55);
  return beam * fall * near * h;
}

float fogFactor(vec3 p) {
  float d = length(p - uCam);
  return 1.0 - exp(-d * uFogDensity);
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
`;

const VERT = /* glsl */ `
varying vec3 vWorld;
varying vec2 vUv;
void main() {
  vUv = uv;
  vec4 w = modelMatrix * vec4(position, 1.0);
  vWorld = w.xyz;
  gl_Position = projectionMatrix * viewMatrix * w;
}
`;

const ROAD_FRAG = /* glsl */ `
${HEADLIGHT_GLSL}
uniform float uTravel;   // metros recorridos en un fotograma (desenfoque de movimiento analítico)
uniform float uSeams[24]; // juntas transversales del asfalto (s en metros), compartidas con vibración y audio
varying vec3 vWorld;

float band(float v, float a, float b, float fw) {
  return smoothstep(a - fw, a + fw, v) * (1.0 - smoothstep(b - fw, b + fw, v));
}

// Integral de un tren de pulsos (longitud D, período P) — para promediar el
// patrón de líneas discontinuas sobre el recorrido de un fotograma.
float pulseIntegral(float s, float P, float D) {
  return floor(s / P) * D + min(mod(s, P), D);
}

float dashCoverage(float z, float P, float D, float L) {
  float s = -z;
  float l = max(L, 0.02);
  return (pulseIntegral(s + l, P, D) - pulseIntegral(s, P, D)) / l;
}

void main() {
  float x = vWorld.x;
  float z = vWorld.z;
  float ax = abs(x);
  float fw = max(fwidth(x), 0.004);
  float dist = length(vWorld - uCam);

  float roadMask = 1.0 - smoothstep(3.72 - fw, 3.72 + fw, ax);
  float shoulderMask = (1.0 - roadMask) * (1.0 - smoothstep(5.3, 5.9, ax));

  // asfalto con grano fino que se desvanece a distancia (evita parpadeo)
  float grainFade = 1.0 - smoothstep(6.0, 28.0, dist);
  float g = (vnoise(vec2(x, z) * 34.0) * 0.6 + vnoise(vec2(x, z) * 11.0) * 0.4) - 0.5;
  float g2 = vnoise(vec2(x, z) * 1.6) - 0.5;
  vec3 asphalt = vec3(0.085, 0.088, 0.096) * (1.0 + g * 0.35 * grainFade + g2 * 0.10);
  // huellas de rodado levemente más pulidas
  float lx = abs(abs(x) - 1.75);
  float wheel = band(lx, 0.55, 1.05, 0.25);
  asphalt *= 1.0 + wheel * 0.10;

  // juntas selladas: banda más oscura, promediada sobre el recorrido del fotograma
  float sx = -z;
  float Ls = max(uTravel * 0.5, 0.2);
  float seam = 0.0;
  for (int i = 0; i < 24; i++) {
    float p = uSeams[i];
    seam = max(seam, clamp((min(sx + Ls, p + 0.2) - max(sx, p)) / Ls, 0.0, 1.0));
  }
  asphalt *= 1.0 - 0.55 * seam * (1.0 - smoothstep(18.0, 55.0, dist));

  vec3 shoulder = vec3(0.060, 0.058, 0.054) * (1.0 + g * 0.5 * grainFade + g2 * 0.25);
  vec3 dirt = vec3(0.028, 0.031, 0.028) * (1.0 + g2 * 0.6);

  vec3 base = mix(dirt, shoulder, shoulderMask);
  base = mix(base, asphalt, roadMask);

  // demarcación (pintura retrorreflectante)
  float L = uTravel;
  float edge = band(ax, 3.46, 3.61, fw);
  float center = band(ax, 0.0, 0.075, fw) * dashCoverage(z, 12.0, 4.0, L);
  float paint = clamp(edge + center, 0.0, 1.0);

  float I = headlight(vWorld);
  float dz = max(uCam.z - z, 0.0);
  float retro = 1.0 / (1.0 + pow(dz / 95.0, 2.0)) * smoothstep(1.5, 6.0, dz);

  vec3 col = base * (0.09 + 3.0 * I);
  vec3 paintCol = vec3(0.92, 0.93, 0.90) * (0.05 + 0.55 * retro + 1.6 * I);
  col = mix(col, paintCol, paint);

  col = mix(col, uFogColor, fogFactor(vWorld));
  // dithering para evitar bandas en el degradado nocturno
  col += (hash12(gl_FragCoord.xy) - 0.5) / 255.0;
  gl_FragColor = vec4(col, 1.0);
}
`;

const LIT_FRAG = /* glsl */ `
${HEADLIGHT_GLSL}
uniform vec3 uColor;
uniform float uRetro;     // >0 para superficies retrorreflectantes
uniform float uMinLight;
uniform sampler2D uMap;
uniform float uUseMap;
varying vec3 vWorld;
varying vec2 vUv;
void main() {
  vec3 base = uColor;
  if (uUseMap > 0.5) base *= texture2D(uMap, vUv).rgb;
  float I = headlight(vWorld);
  float dz = max(uCam.z - vWorld.z, 0.0);
  float retro = uRetro / (1.0 + pow(dz / 120.0, 2.0));
  float light = max(uMinLight, 0.10 + 2.6 * I) + retro;
  vec3 col = base * light;
  col = mix(col, uFogColor, fogFactor(vWorld) * (uRetro > 0.0 ? 0.55 : 1.0));
  gl_FragColor = vec4(col, 1.0);
}
`;

export const FOG_COLOR = new THREE.Color(0.012, 0.018, 0.032);
export const FOG_DENSITY = 0.0105;

const commonUniforms = () => ({
  uCam: { value: new THREE.Vector3() },
  uFogDensity: { value: FOG_DENSITY },
  uFogColor: { value: FOG_COLOR },
});

export const makeRoadMaterial = () =>
  new THREE.ShaderMaterial({
    vertexShader: VERT,
    fragmentShader: ROAD_FRAG,
    uniforms: { ...commonUniforms(), uTravel: { value: 0 }, uSeams: { value: new Array(24).fill(-1e5) } },
  });

export const makeLitMaterial = (opts: {
  color: [number, number, number];
  retro?: number;
  minLight?: number;
  map?: THREE.Texture;
}) =>
  new THREE.ShaderMaterial({
    vertexShader: VERT,
    fragmentShader: LIT_FRAG,
    uniforms: {
      ...commonUniforms(),
      uColor: { value: new THREE.Color(...opts.color) },
      uRetro: { value: opts.retro ?? 0 },
      uMinLight: { value: opts.minLight ?? 0 },
      uMap: { value: opts.map ?? null },
      uUseMap: { value: opts.map ? 1 : 0 },
    },
  });

/** Actualiza la posición de cámara en todos los materiales del mundo. */
export const syncCam = (mats: THREE.ShaderMaterial[], cam: THREE.Vector3) => {
  for (const m of mats) m.uniforms.uCam.value.copy(cam);
};
