// Ilustraciones técnicas SVG de configuraciones de motor
const defs = (id) => `
<defs>
  <linearGradient id="${id}m" x1="0" y1="0" x2="1" y2="0">
    <stop offset="0" stop-color="#6b7079"/><stop offset=".22" stop-color="#f4f5f7"/><stop offset=".45" stop-color="#a9aeb6"/>
    <stop offset=".7" stop-color="#e3e5e8"/><stop offset="1" stop-color="#585c64"/>
  </linearGradient>
  <linearGradient id="${id}b" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0" stop-color="#2a2b30"/><stop offset="1" stop-color="#121215"/>
  </linearGradient>
  <linearGradient id="${id}h" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#3a3c42"/><stop offset="1" stop-color="#1d1e22"/>
  </linearGradient>
  <radialGradient id="${id}g" cx=".5" cy=".5" r=".5">
    <stop offset="0" stop-color="#ff2a1f" stop-opacity=".55"/><stop offset="1" stop-color="#ff2a1f" stop-opacity="0"/>
  </radialGradient>
  <linearGradient id="${id}r" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#ff3b30"/><stop offset="1" stop-color="#b00008"/>
  </linearGradient>
</defs>`;

const rot = (x, y, cx, cy, deg) => {
  const a = (deg * Math.PI) / 180;
  const dx = x - cx, dy = y - cy;
  return [cx + dx * Math.cos(a) - dy * Math.sin(a), cy + dx * Math.sin(a) + dy * Math.cos(a)];
};

// Un banco de cilindros dibujado vertical (hacia arriba desde el cigüeñal) y rotado
function bank(id, cx, cy, deg, pistonOffset, crankPin, opts = {}) {
  const w = opts.w ?? 132, L0 = opts.L0 ?? 120, L1 = opts.L1 ?? 360;
  const x = cx - w / 2;
  const pistonY = cy - 210 - pistonOffset; // centro del pistón
  const pin = rot(cx, pistonY + 14, cx, cy, deg);
  return `
  <g transform="rotate(${deg} ${cx} ${cy})">
    <rect x="${x - 26}" y="${cy - L1}" width="${w + 52}" height="${L1 - L0}" rx="10" fill="url(#${id}b)" stroke="rgba(255,255,255,.22)" stroke-width="2"/>
    <rect x="${x - 34}" y="${cy - L1 - 70}" width="${w + 68}" height="78" rx="12" fill="url(#${id}h)" stroke="rgba(255,255,255,.28)" stroke-width="2"/>
    <circle cx="${cx - 30}" cy="${cy - L1 - 32}" r="13" fill="#0c0c0e" stroke="rgba(255,255,255,.4)" stroke-width="2"/>
    <circle cx="${cx + 30}" cy="${cy - L1 - 32}" r="13" fill="#0c0c0e" stroke="rgba(255,255,255,.4)" stroke-width="2"/>
    <rect x="${x}" y="${cy - L1 + 6}" width="${w}" height="${L1 - L0 - 6}" fill="#08080a"/>
    <rect x="${x}" y="${cy - L1 + 6}" width="${w}" height="${pistonY - 40 - (cy - L1 + 6)}" fill="url(#${id}g)" opacity=".9"/>
    <rect x="${x + 4}" y="${pistonY - 40}" width="${w - 8}" height="80" rx="6" fill="url(#${id}m)"/>
    <rect x="${x + 4}" y="${pistonY - 30}" width="${w - 8}" height="4" fill="rgba(0,0,0,.35)"/>
    <rect x="${x + 4}" y="${pistonY - 20}" width="${w - 8}" height="4" fill="rgba(0,0,0,.35)"/>
  </g>
  <line x1="${pin[0]}" y1="${pin[1]}" x2="${crankPin[0]}" y2="${crankPin[1]}" stroke="#9aa0a8" stroke-width="22" stroke-linecap="round"/>
  <line x1="${pin[0]}" y1="${pin[1]}" x2="${crankPin[0]}" y2="${crankPin[1]}" stroke="#d7dade" stroke-width="8" stroke-linecap="round"/>
  <circle cx="${pin[0]}" cy="${pin[1]}" r="9" fill="#3a3c42"/>`;
}

function crank(id, cx, cy, pin) {
  return `
  <circle cx="${cx}" cy="${cy}" r="96" fill="#0d0d10" stroke="rgba(255,255,255,.18)" stroke-width="2" stroke-dasharray="6 8"/>
  <circle cx="${cx}" cy="${cy}" r="58" fill="url(#${id}h)" stroke="#E1080C" stroke-width="5"/>
  <circle cx="${pin[0]}" cy="${pin[1]}" r="22" fill="url(#${id}r)" stroke="#fff" stroke-width="3"/>
  <circle cx="${cx}" cy="${cy}" r="12" fill="#fff"/>`;
}

function angleArc(cx, cy, deg, r = 150, label = `${deg}°`, size = 46) {
  const a1 = -90 - deg / 2, a2 = -90 + deg / 2;
  const p = (a) => [cx + r * Math.cos((a * Math.PI) / 180), cy + r * Math.sin((a * Math.PI) / 180)];
  const [x1, y1] = p(a1), [x2, y2] = p(a2);
  const large = deg > 180 ? 1 : 0;
  return `
  <path d="M${x1} ${y1} A${r} ${r} 0 ${large} 1 ${x2} ${y2}" fill="none" stroke="#E1080C" stroke-width="5"/>
  <line x1="${cx}" y1="${cy}" x2="${x1}" y2="${y1}" stroke="#E1080C" stroke-width="2" stroke-dasharray="6 6"/>
  <line x1="${cx}" y1="${cy}" x2="${x2}" y2="${y2}" stroke="#E1080C" stroke-width="2" stroke-dasharray="6 6"/>
  <text x="${cx}" y="${cy - r - 22}" text-anchor="middle" font-family="Barlow C" font-weight="800" font-size="${size}" fill="#fff">${label}</text>`;
}

/** Vista frontal de un motor en V (o en línea si deg=0, bóxer si deg=180) */
export function frontV(deg, { id = "f", w = 600, h = 640, single = false, label } = {}) {
  const cx = 300, cy = 470;
  const pinAng = single ? -90 : -90 + 25;
  const pin = [cx + 40 * Math.cos((pinAng * Math.PI) / 180), cy + 40 * Math.sin((pinAng * Math.PI) / 180)];
  let g = "";
  if (single) {
    g += bank(id, cx, cy, 0, 0, pin);
  } else {
    g += bank(id, cx, cy, -deg / 2, 24, pin);
    g += bank(id, cx, cy, deg / 2, -18, pin);
  }
  g += crank(id, cx, cy, pin);
  if (!single && deg < 180) g += angleArc(cx, cy, deg, 105, label ?? `${deg}°`);
  return `<svg viewBox="${-40} ${-10} ${680} ${h}" width="${w}" xmlns="http://www.w3.org/2000/svg">${defs(id)}${g}</svg>`;
}

/** Bóxer: bancos opuestos horizontales */
export function frontBoxer({ id = "bx", w = 640 } = {}) {
  const cx = 420, cy = 300;
  const pin = [cx, cy - 34];
  let g = bank(id, cx, cy, -90, 10, pin, { L1: 330 }) + bank(id, cx, cy, 90, 10, [cx, cy + 34], { L1: 330 });
  g += crank(id, cx, cy, pin);
  g += `<circle cx="${cx}" cy="${cy + 34}" r="22" fill="url(#${id}r)" stroke="#fff" stroke-width="3"/>`;
  g += `<text x="${cx}" y="${cy - 120}" text-anchor="middle" font-family="Barlow C" font-weight="800" font-size="46" fill="#fff">180°</text>
  <path d="M${cx - 150} ${cy - 100} L${cx + 150} ${cy - 100}" stroke="#E1080C" stroke-width="4" stroke-dasharray="8 7"/>
  <path d="M${cx - 160} ${cy - 112} l-14 12 14 12 M${cx + 160} ${cy - 112} l14 12 -14 12" stroke="#E1080C" stroke-width="4" fill="none"/>`;
  return `<svg viewBox="0 30 840 540" width="${w}" xmlns="http://www.w3.org/2000/svg">${defs(id)}${g}</svg>`;
}

/** Vista superior: distribución de cilindros */
export function topLayout(kind, n, { w = 520, id = "t" } = {}) {
  const r = 34, pitch = 84;
  let circles = "", W, H, block = "";
  const cyl = (x, y, i, c = "#E1080C") =>
    `<circle cx="${x}" cy="${y}" r="${r}" fill="#0b0b0d" stroke="rgba(255,255,255,.75)" stroke-width="3"/>
     <circle cx="${x}" cy="${y}" r="${r - 10}" fill="url(#${id}r)"/>
     <text x="${x}" y="${y + 9}" text-anchor="middle" font-family="Barlow C" font-weight="800" font-size="26" fill="#fff">${i}</text>`;
  if (kind === "inline") {
    W = n * pitch + 60; H = 150;
    block = `<rect x="6" y="6" width="${W - 12}" height="${H - 12}" rx="22" fill="url(#${id}b)" stroke="rgba(255,255,255,.25)" stroke-width="2"/>`;
    for (let i = 0; i < n; i++) circles += cyl(30 + pitch / 2 + i * pitch, H / 2, i + 1);
  } else if (kind === "v" || kind === "boxer") {
    const per = n / 2;
    W = per * pitch + pitch / 2 + 60; H = 250;
    block = `<rect x="6" y="6" width="${W - 12}" height="${H - 12}" rx="26" fill="url(#${id}b)" stroke="rgba(255,255,255,.25)" stroke-width="2"/>
      <line x1="30" y1="${H / 2}" x2="${W - 30}" y2="${H / 2}" stroke="rgba(255,255,255,.25)" stroke-width="2" stroke-dasharray="8 8"/>`;
    for (let i = 0; i < per; i++) {
      circles += cyl(30 + pitch / 2 + i * pitch, 66, i * 2 + 1);
      circles += cyl(30 + pitch / 2 + i * pitch + pitch / 2, H - 66, i * 2 + 2);
    }
  } else if (kind === "w") {
    const per = n / 4;
    W = per * pitch + pitch / 2 + 60; H = 380;
    block = `<rect x="6" y="6" width="${W - 12}" height="${H - 12}" rx="26" fill="url(#${id}b)" stroke="rgba(255,255,255,.25)" stroke-width="2"/>`;
    let k = 1;
    const rows = [56, 136, 244, 324];
    rows.forEach((y, ri) => { for (let i = 0; i < per; i++) circles += cyl(30 + pitch / 2 + i * pitch + (ri % 2 ? pitch / 2 : 0), y, k++); });
  }
  return `<svg viewBox="0 0 ${W} ${H}" width="${w}" xmlns="http://www.w3.org/2000/svg">${defs(id)}${block}${circles}</svg>`;
}

/** Rotativo Wankel: carcasa epitrocoide + rotor triangular */
export function rotary({ w = 600, id = "rt" } = {}) {
  const R = 150, e = 24, cx = 300, cy = 300;
  let d = "";
  for (let t = 0; t <= 360; t += 2) {
    const a = (t * Math.PI) / 180;
    const x = cx + e * Math.cos(3 * a) + R * Math.cos(a);
    const y = cy + (e * Math.sin(3 * a) + R * Math.sin(a)) * 1;
    d += (t ? "L" : "M") + x.toFixed(1) + " " + y.toFixed(1);
  }
  // Rotor (triángulo de Reuleaux aproximado) inscrito, rotado
  const rr = 142, rot0 = 18;
  const pts = [0, 120, 240].map((k) => {
    const a = ((k + rot0) * Math.PI) / 180;
    return [cx + e * Math.cos(-3 * a) * 0.0 + rr * Math.cos(a), cy + rr * Math.sin(a)];
  });
  const arc = (p, q) => `A ${rr * 1.55} ${rr * 1.55} 0 0 1 ${q[0].toFixed(1)} ${q[1].toFixed(1)}`;
  const rotor = `M${pts[0][0]} ${pts[0][1]} ${arc(pts[0], pts[1])} ${arc(pts[1], pts[2])} ${arc(pts[2], pts[0])}Z`;
  return `<svg viewBox="40 60 520 480" width="${w}" xmlns="http://www.w3.org/2000/svg">${defs(id)}
    <path d="${d}Z" fill="#08080a" stroke="rgba(255,255,255,.9)" stroke-width="22" stroke-linejoin="round"/>
    <path d="${d}Z" fill="url(#${id}g)" opacity=".7"/>
    <path d="${rotor}" fill="url(#${id}m)" stroke="#2a2b30" stroke-width="3"/>
    ${pts.map((p) => `<circle cx="${p[0]}" cy="${p[1]}" r="9" fill="#E1080C" stroke="#fff" stroke-width="3"/>`).join("")}
    <circle cx="${cx}" cy="${cy}" r="52" fill="#16171a" stroke="#E1080C" stroke-width="5"/>
    <circle cx="${cx}" cy="${cy}" r="30" fill="url(#${id}h)" stroke="rgba(255,255,255,.4)" stroke-width="2"/>
    <circle cx="${cx}" cy="${cy}" r="9" fill="#fff"/>
    <rect x="${cx - 168}" y="${cy - 18}" width="26" height="36" rx="4" fill="#E1080C"/>
    <rect x="${cx - 168}" y="${cy + 46}" width="26" height="36" rx="4" fill="#E1080C"/>
  </svg>`;
}

/** Turbo: esquema caracol turbina/compresor */
export function turboSvg({ w = 560, id = "tb", twin = false } = {}) {
  const snail = (cx, cy, s, hot) => {
    const c = hot ? "#E1080C" : "#cfd3d8";
    let d = "";
    for (let t = 0; t <= 330; t += 6) {
      const a = (t * Math.PI) / 180, r = s * (0.55 + 0.45 * (t / 330));
      d += (t ? "L" : "M") + (cx + r * Math.cos(a)).toFixed(1) + " " + (cy + r * Math.sin(a)).toFixed(1);
    }
    let blades = "";
    for (let k = 0; k < 10; k++) {
      const a = (k * 36 * Math.PI) / 180;
      blades += `<path d="M${cx} ${cy} Q ${cx + s * 0.32 * Math.cos(a + 0.6)} ${cy + s * 0.32 * Math.sin(a + 0.6)} ${cx + s * 0.44 * Math.cos(a)} ${cy + s * 0.44 * Math.sin(a)}" stroke="${hot ? "#ffb3ad" : "#8b9099"}" stroke-width="5" fill="none"/>`;
    }
    return `<path d="${d}" fill="${hot ? "rgba(225,8,12,.18)" : "rgba(255,255,255,.07)"}" stroke="${c}" stroke-width="9" stroke-linecap="round"/>
      <circle cx="${cx}" cy="${cy}" r="${s * 0.46}" fill="#0b0b0d" stroke="${c}" stroke-width="3"/>${blades}
      <circle cx="${cx}" cy="${cy}" r="${s * 0.1}" fill="${c}"/>`;
  };
  const one = (ox, oy, sc = 1) => `<g transform="translate(${ox} ${oy}) scale(${sc})">
    ${snail(140, 170, 120, true)}
    <rect x="236" y="158" width="128" height="24" fill="url(#${id}m)"/>
    ${snail(460, 170, 120, false)}
  </g>`;
  const body = twin ? one(0, -20, 0.82) + one(110, 250, 0.82) : one(0, 0);
  return `<svg viewBox="0 0 600 ${twin ? 560 : 340}" width="${w}" xmlns="http://www.w3.org/2000/svg">${defs(id)}${body}</svg>`;
}

/** Corte lateral de un motor en línea: pistones a distintas alturas según el ángulo de cada muñequilla */
export function sideInline(n, { w = 900, h, id = "si", phases } = {}) {
  const bw = 112, gap = 18, r = 46, rod = 170, top = 70;
  const W = n * bw + (n - 1) * gap + 80, cy = 470, H = 560;
  const ph = phases || {
    3: [0, 240, 120], 4: [0, 180, 180, 0], 5: [0, 144, 216, 72, 288], 6: [0, 240, 120, 120, 240, 0],
  }[n];
  let g = `<rect x="10" y="${top}" width="${W - 20}" height="${cy - top - 30}" rx="16" fill="url(#${id}b)" stroke="rgba(255,255,255,.22)" stroke-width="2"/>
  <rect x="0" y="${top - 64}" width="${W}" height="70" rx="14" fill="url(#${id}h)" stroke="rgba(255,255,255,.28)" stroke-width="2"/>`;
  for (let i = 0; i < n; i++) {
    const x = 40 + i * (bw + gap), cx = x + bw / 2;
    const th = (ph[i] * Math.PI) / 180;
    const pinY = cy - r * Math.cos(th), pinX = cx + r * Math.sin(th) * 0.0;
    const pistonY = pinY - Math.sqrt(rod * rod - (r * Math.sin(th)) ** 2) - 30;
    g += `<rect x="${x}" y="${top + 8}" width="${bw}" height="${cy - top - 60}" fill="#08080a"/>
      <rect x="${x}" y="${top + 8}" width="${bw}" height="${Math.max(0, pistonY - 40 - top - 8)}" fill="url(#${id}g)"/>
      <circle cx="${cx - 26}" cy="${top - 30}" r="12" fill="#0c0c0e" stroke="rgba(255,255,255,.4)" stroke-width="2"/>
      <circle cx="${cx + 26}" cy="${top - 30}" r="12" fill="#0c0c0e" stroke="rgba(255,255,255,.4)" stroke-width="2"/>
      <line x1="${cx}" y1="${pistonY + 10}" x2="${pinX}" y2="${pinY}" stroke="#9aa0a8" stroke-width="22" stroke-linecap="round"/>
      <line x1="${cx}" y1="${pistonY + 10}" x2="${pinX}" y2="${pinY}" stroke="#d7dade" stroke-width="7" stroke-linecap="round"/>
      <rect x="${x + 4}" y="${pistonY - 40}" width="${bw - 8}" height="74" rx="6" fill="url(#${id}m)"/>
      <rect x="${x + 4}" y="${pistonY - 30}" width="${bw - 8}" height="4" fill="rgba(0,0,0,.35)"/>
      <rect x="${x + 4}" y="${pistonY - 20}" width="${bw - 8}" height="4" fill="rgba(0,0,0,.35)"/>
      <rect x="${cx - 40}" y="${cy - 20}" width="80" height="${40}" rx="8" fill="#26272c" stroke="rgba(255,255,255,.2)"/>
      <circle cx="${pinX}" cy="${pinY}" r="18" fill="url(#${id}r)" stroke="#fff" stroke-width="3"/>
      <text x="${cx}" y="${cy + 84}" text-anchor="middle" font-family="Barlow C" font-weight="800" font-size="30" fill="rgba(255,255,255,.6)">${i + 1}</text>`;
  }
  g = `<rect x="10" y="${cy - 9}" width="${W - 20}" height="18" rx="9" fill="url(#${id}m)"/>` + g.replace(/(<rect x="10" y="\d+")/, "$1");
  // eje del cigüeñal encima de muñones
  g += `<rect x="10" y="${cy - 7}" width="${W - 20}" height="14" rx="7" fill="url(#${id}m)" opacity=".85"/>`;
  return `<svg viewBox="0 0 ${W} ${H}" ${h ? `height="${h}"` : `width="${w}"`} xmlns="http://www.w3.org/2000/svg">${defs(id)}${g}</svg>`;
}

/** Onda de vibración: amplitud relativa 0..1 */
export function vibeWave(amp, { w = 420, h = 90, color = "#E1080C" } = {}) {
  let d = "";
  for (let x = 0; x <= w; x += 4) {
    const y = h / 2 + Math.sin(x / 14) * (h / 2 - 6) * amp * (0.75 + 0.25 * Math.sin(x / 41));
    d += (x ? "L" : "M") + x + " " + y.toFixed(1);
  }
  return `<svg viewBox="0 0 ${w} ${h}" width="${w}" height="${h}"><line x1="0" y1="${h / 2}" x2="${w}" y2="${h / 2}" stroke="rgba(255,255,255,.18)" stroke-dasharray="4 6"/><path d="${d}" fill="none" stroke="${color}" stroke-width="5" stroke-linecap="round"/></svg>`;
}
