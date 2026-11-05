// Helpers compartidos para las piezas MOKTA
export const A = (p) => `../../assets/${p}`;

export const logo = (v = "light", pos = "") =>
  `<img class="logo ${pos}" src="${A(`logo-${v}.png`)}" alt="MOKTA Cars">`;

export const counter = (i, n) =>
  `<div class="counter"><b>${String(i).padStart(2, "0")}</b><i>/</i><span>${String(n).padStart(2, "0")}</span></div>`;

export const swipe = (t = "DESLIZA", color = "currentColor") =>
  `<div class="swipe">${t}<svg viewBox="0 0 64 20"><path d="M0 10h58M48 2l10 8-10 8" fill="none" stroke="${color}" stroke-width="3.2"/></svg></div>`;

export const foot = (t, style = "") => `<div class="foot" style="${style}">${t}</div>`;

export const photoCredit = (who) => `Foto: ${who} · Wikimedia Commons (CC)`;

// Página completa
export const page = (cls, inner) => `<!doctype html><html lang="es"><head><meta charset="utf-8">
<link rel="stylesheet" href="../../base.css"></head><body><div class="s ${cls}">${inner}</div></body></html>`;

// Etiquetas de clasificación de fallas
export const TAG = {
  doc: `<span class="chip r">● Documentada</span>`,
  rep: `<span class="chip a">● Reportada</span>`,
  wear: `<span class="chip g">● Desgaste normal</span>`,
};

// Flecha / iconos sencillos
export const arrow = (c = "currentColor", w = 40) =>
  `<svg width="${w}" height="${w * 0.5}" viewBox="0 0 40 20"><path d="M0 10h34M26 3l8 7-8 7" fill="none" stroke="${c}" stroke-width="3"/></svg>`;
