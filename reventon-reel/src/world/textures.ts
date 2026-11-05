import * as THREE from "three";

const canvas = (w: number, h: number) => {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  return c;
};

const memo = <T,>(f: () => T) => {
  let v: T | null = null;
  return () => (v ??= f());
};

/** Llanta de aleación de 5 rayos (cara exterior de la rueda). */
export const rimTexture = memo(() => {
  const c = canvas(256, 256);
  const g = c.getContext("2d")!;
  g.fillStyle = "#0b0b0d";
  g.fillRect(0, 0, 256, 256);
  g.translate(128, 128);
  // aro
  g.fillStyle = "#b9bec6";
  g.beginPath();
  g.arc(0, 0, 124, 0, Math.PI * 2);
  g.arc(0, 0, 104, 0, Math.PI * 2, true);
  g.fill();
  // rayos
  for (let i = 0; i < 5; i++) {
    g.save();
    g.rotate((i * Math.PI * 2) / 5);
    const grd = g.createLinearGradient(-18, 0, 18, 0);
    grd.addColorStop(0, "#8e949c");
    grd.addColorStop(0.5, "#e2e6ea");
    grd.addColorStop(1, "#80868e");
    g.fillStyle = grd;
    g.beginPath();
    g.moveTo(-14, -26);
    g.lineTo(14, -26);
    g.lineTo(26, -108);
    g.lineTo(-26, -108);
    g.closePath();
    g.fill();
    g.restore();
  }
  // maza y tuercas
  g.fillStyle = "#c9ced4";
  g.beginPath();
  g.arc(0, 0, 30, 0, Math.PI * 2);
  g.fill();
  g.fillStyle = "#3a3d42";
  for (let i = 0; i < 5; i++) {
    const a = (i * Math.PI * 2) / 5 + Math.PI / 5;
    g.beginPath();
    g.arc(Math.cos(a) * 18, Math.sin(a) * 18, 4, 0, Math.PI * 2);
    g.fill();
  }
  g.fillStyle = "#1a1b1e";
  g.beginPath();
  g.arc(0, 0, 8, 0, Math.PI * 2);
  g.fill();
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  return t;
});

/** Flanco del neumático con relieve sutil. */
export const sidewallTexture = memo(() => {
  const c = canvas(256, 256);
  const g = c.getContext("2d")!;
  g.fillStyle = "#121214";
  g.fillRect(0, 0, 256, 256);
  g.translate(128, 128);
  g.strokeStyle = "rgba(255,255,255,0.06)";
  g.lineWidth = 2;
  for (const r of [70, 92, 118]) {
    g.beginPath();
    g.arc(0, 0, r, 0, Math.PI * 2);
    g.stroke();
  }
  g.fillStyle = "rgba(255,255,255,0.09)";
  g.font = "bold 13px sans-serif";
  for (let i = 0; i < 18; i++) {
    g.save();
    g.rotate((i / 18) * Math.PI * 2);
    g.fillRect(-6, -110, 12, 6);
    g.restore();
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
});

/** Halo radial (luces, aditivo). */
export const glowTexture = memo(() => {
  const c = canvas(128, 128);
  const g = c.getContext("2d")!;
  const grd = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  grd.addColorStop(0, "rgba(255,255,255,1)");
  grd.addColorStop(0.1, "rgba(255,255,255,0.8)");
  grd.addColorStop(0.3, "rgba(255,255,255,0.2)");
  grd.addColorStop(0.65, "rgba(255,255,255,0.04)");
  grd.addColorStop(1, "rgba(255,255,255,0)");
  g.fillStyle = grd;
  g.fillRect(0, 0, 128, 128);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
});

/** Bocanada de humo/polvo (alfa suave con ruido). */
export const puffTexture = memo(() => {
  const S = 128;
  const c = canvas(S, S);
  const g = c.getContext("2d")!;
  const img = g.createImageData(S, S);
  const h = (x: number, y: number) => {
    const v = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453;
    return v - Math.floor(v);
  };
  const noise = (x: number, y: number) => {
    const xi = Math.floor(x), yi = Math.floor(y);
    const xf = x - xi, yf = y - yi;
    const u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf);
    const a = h(xi, yi), b = h(xi + 1, yi), cc = h(xi, yi + 1), d = h(xi + 1, yi + 1);
    return a + (b - a) * u + (cc - a) * v + (a - b - cc + d) * u * v;
  };
  for (let y = 0; y < S; y++)
    for (let x = 0; x < S; x++) {
      const dx = (x - S / 2) / (S / 2), dy = (y - S / 2) / (S / 2);
      const r = Math.sqrt(dx * dx + dy * dy);
      const n = noise(x / 14, y / 14) * 0.6 + noise(x / 6, y / 6) * 0.4;
      const a = Math.max(0, 1 - r) ** 1.6 * (0.55 + 0.6 * n);
      const i = (y * S + x) * 4;
      img.data[i] = img.data[i + 1] = img.data[i + 2] = 255;
      img.data[i + 3] = Math.min(255, a * 255);
    }
  g.putImageData(img, 0, 0);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
});

/** Sombra de contacto suave bajo el auto. */
export const shadowTexture = memo(() => {
  const c = canvas(128, 256);
  const g = c.getContext("2d")!;
  g.filter = "blur(14px)";
  g.fillStyle = "rgba(0,0,0,0.85)";
  g.beginPath();
  g.roundRect(26, 26, 76, 204, 26);
  g.fill();
  const t = new THREE.CanvasTexture(c);
  return t;
});

/** Silueta de la cordillera (fBm 1D determinista). */
export const mountainTexture = memo(() => {
  const W = 2048, H = 256;
  const c = canvas(W, H);
  const g = c.getContext("2d")!;
  const vn = (x: number, seed: number) => {
    const i = Math.floor(x), f = x - i;
    const hh = (n: number) => {
      const v = Math.sin((n + seed * 101.3) * 127.1) * 43758.5453;
      return v - Math.floor(v);
    };
    const u = f * f * (3 - 2 * f);
    return hh(i) * (1 - u) + hh(i + 1) * u;
  };
  const fbm = (x: number, seed: number) => {
    let a = 0.5, s = 0, fr = 1;
    for (let o = 0; o < 6; o++) {
      s += a * vn(x * fr, seed + o * 7);
      a *= 0.5;
      fr *= 2.1;
    }
    return s;
  };
  const ridge = (seed: number, base: number, amp: number, freq: number, color: string) => {
    g.fillStyle = color;
    g.beginPath();
    g.moveTo(0, H);
    for (let x = 0; x <= W; x += 2) {
      const y = base - amp * Math.pow(fbm((x / W) * freq, seed), 1.6) * 1.8;
      g.lineTo(x, y);
    }
    g.lineTo(W, H);
    g.closePath();
    g.fill();
  };
  ridge(3, 236, 160, 6, "rgb(58,52,84)");
  ridge(9, 248, 80, 12, "rgb(34,30,50)");
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
});
