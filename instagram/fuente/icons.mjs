// Íconos de testigos del tablero (dibujados a mano, trazo uniforme)
const wrap = (inner, c, s = 120, sw = 7) =>
  `<svg viewBox="0 0 120 120" width="${s}" height="${s}" fill="none" stroke="${c}" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round">${inner}</svg>`;

export const ICON = {
  oil: (c, s) => wrap(`<path d="M14 52h20l8-8h26l30-10-22 34H30a6 6 0 0 1-6-6V60"/><path d="M14 52v10"/><path d="M48 44v-8h-8M40 36h16"/><path d="M106 70c0 0-6 9-6 13a6 6 0 0 0 12 0c0-4-6-13-6-13z" fill="${c}" stroke="none"/>`, c, s),
  temp: (c, s) => wrap(`<path d="M60 18v46"/><circle cx="60" cy="74" r="10" fill="${c}"/><path d="M60 34h14M60 46h14M60 58h10"/><path d="M18 96c8-6 14-6 21 0s14 6 21 0 14-6 21 0 14 6 21 0"/>`, c, s),
  battery: (c, s) => wrap(`<rect x="16" y="38" width="88" height="56" rx="6"/><path d="M30 38v-8h14v8M76 38v-8h14v8"/><path d="M32 66h14M39 59v14M74 66h14"/>`, c, s),
  brake: (c, s) => wrap(`<circle cx="60" cy="60" r="28"/><path d="M60 46v18"/><circle cx="60" cy="74" r="2.5" fill="${c}"/><path d="M24 34a44 44 0 0 0 0 52M96 34a44 44 0 0 1 0 52"/>`, c, s),
  engine: (c, s) => wrap(`<path d="M22 50h10v-8h20v-8h22v8h8l8 10h8v-8h8v34h-8v-8h-8l-8 12H40l-8-8h-10z"/><path d="M12 56v20M12 66h10"/>`, c, s),
  abs: (c, s) => `<svg viewBox="0 0 120 120" width="${s}" height="${s}"><g fill="none" stroke="${c}" stroke-width="7" stroke-linecap="round"><circle cx="60" cy="60" r="30"/><path d="M22 34a44 44 0 0 0 0 52M98 34a44 44 0 0 1 0 52"/></g><text x="60" y="69" text-anchor="middle" font-family="Archivo" font-stretch="100%" font-weight="900" font-size="25" fill="${c}">ABS</text></svg>`,
  tpms: (c, s) => wrap(`<path d="M34 34c-12 20-12 40 0 58h52c12-18 12-38 0-58"/><path d="M28 98h64"/><path d="M60 46v24"/><circle cx="60" cy="82" r="2.5" fill="${c}"/>`, c, s),
  glow: (c, s) => wrap(`<path d="M20 42c0 10 6 12 10 12M100 42c0 10-6 12-10 12"/><path d="M30 54c0-14 8-20 12-20s8 6 8 14-8 10-8 18 8 10 8 10M50 48c0-8 4-14 10-14s10 6 10 14-10 10-10 18 10 10 10 10M70 48c0-8 4-14 10-14s10 6 10 20"/>`, c, s),
  high: (c, s) => wrap(`<path d="M62 30c22 0 34 14 34 30s-12 30-34 30z"/><path d="M14 40h34M14 54h34M14 68h34M14 82h34"/>`, c, s),
  cruise: (c, s) => wrap(`<path d="M24 82a40 40 0 1 1 72 0"/><path d="M60 72l18-22"/><circle cx="60" cy="74" r="6" fill="${c}"/><path d="M60 30v8M30 46l6 6M90 46l-6 6"/>`, c, s),
  low: (c, s) => wrap(`<path d="M62 30c22 0 34 14 34 30s-12 30-34 30z"/><path d="M14 44l34 6M14 58l34 6M14 72l34 6M14 86l34 6"/>`, c, s),
  turn: (c, s) => wrap(`<path d="M50 30L20 60l30 30V72h50V48H50z" fill="${c}" stroke="none"/>`, c, s),
};

export const glowBox = (svg, color, size = 150) =>
  `<div style="width:${size}px;height:${size}px;border-radius:24px;display:grid;place-items:center;background:radial-gradient(closest-side, ${color}33, transparent);">${svg}</div>`;
