import * as THREE from "three";

const canvas = (w: number, h: number) => {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  return c;
};

/** Franjas diagonales rojo/blanco retrorreflectantes de una barrera tipo III. */
export const makeStripeTexture = (flip = false) => {
  const c = canvas(512, 64);
  const g = c.getContext("2d")!;
  g.fillStyle = "#f3f1ea";
  g.fillRect(0, 0, 512, 64);
  g.fillStyle = "#d8141c";
  const step = 64;
  for (let x = -128; x < 640; x += step * 2) {
    g.beginPath();
    if (!flip) {
      g.moveTo(x, 64);
      g.lineTo(x + step, 64);
      g.lineTo(x + step + 64, 0);
      g.lineTo(x + 64, 0);
    } else {
      g.moveTo(x, 0);
      g.lineTo(x + step, 0);
      g.lineTo(x + step + 64, 64);
      g.lineTo(x + 64, 64);
    }
    g.closePath();
    g.fill();
  }
  // borde fino y micro-textura de lámina reflectante
  g.strokeStyle = "rgba(0,0,0,0.35)";
  g.lineWidth = 3;
  g.strokeRect(1.5, 1.5, 509, 61);
  const img = g.getImageData(0, 0, 512, 64);
  for (let i = 0; i < img.data.length; i += 4) {
    const n = ((i * 2654435761) >>> 24) / 255 - 0.5;
    img.data[i] = Math.max(0, Math.min(255, img.data[i] + n * 10));
    img.data[i + 1] = Math.max(0, Math.min(255, img.data[i + 1] + n * 10));
    img.data[i + 2] = Math.max(0, Math.min(255, img.data[i + 2] + n * 10));
  }
  g.putImageData(img, 0, 0);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  return t;
};

/** Halo radial para luces (aditivo). */
export const makeGlowTexture = () => {
  const c = canvas(256, 256);
  const g = c.getContext("2d")!;
  const grd = g.createRadialGradient(128, 128, 0, 128, 128, 128);
  grd.addColorStop(0, "rgba(255,255,255,1)");
  grd.addColorStop(0.08, "rgba(255,255,255,0.85)");
  grd.addColorStop(0.25, "rgba(255,255,255,0.22)");
  grd.addColorStop(0.6, "rgba(255,255,255,0.05)");
  grd.addColorStop(1, "rgba(255,255,255,0)");
  g.fillStyle = grd;
  g.fillRect(0, 0, 256, 256);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
};

/** Silueta de cordillera para el horizonte (fBm 1D determinista). */
export const makeMountainTexture = () => {
  const W = 2048;
  const H = 256;
  const c = canvas(W, H);
  const g = c.getContext("2d")!;
  const vnoise = (x: number, seed: number) => {
    const i = Math.floor(x);
    const f = x - i;
    const h = (n: number) => {
      const v = Math.sin((n + seed * 101.3) * 127.1) * 43758.5453;
      return v - Math.floor(v);
    };
    const u = f * f * (3 - 2 * f);
    return h(i) * (1 - u) + h(i + 1) * u;
  };
  const fbm = (x: number, seed: number) => {
    let a = 0.5, sum = 0, fr = 1;
    for (let o = 0; o < 6; o++) {
      sum += a * vnoise(x * fr, seed + o * 7);
      a *= 0.5;
      fr *= 2.1;
    }
    return sum;
  };
  const ridge = (seed: number, base: number, amp: number, freq: number, color: string) => {
    g.fillStyle = color;
    g.beginPath();
    g.moveTo(0, H);
    for (let x = 0; x <= W; x += 2) {
      const t = x / W;
      const y = base - amp * Math.pow(fbm(t * freq, seed), 1.6) * 1.8;
      g.lineTo(x, y);
    }
    g.lineTo(W, H);
    g.closePath();
    g.fill();
  };
  ridge(3, 230, 150, 7, "rgba(15,23,38,1)");
  ridge(9, 246, 70, 13, "rgba(8,12,20,1)");
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
};
