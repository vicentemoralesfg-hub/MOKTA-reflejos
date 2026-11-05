// Componentes del lote 02
import { logo, counter } from "./lib.mjs";

export const head = (i, N, kicker, title, { top = 168, size = "h-m", dark = false, color = "" } = {}) => `
  ${logo(dark ? "dark" : "light")}${N ? counter(i, N) : ""}
  <div class="abs z" style="left:56px;top:${top}px;right:56px;${dark ? "color:var(--ink)" : ""}">
    <div class="kicker">${kicker}</div>
    <div class="${size}" style="margin-top:22px;${color}">${title}</div>
  </div>`;

export const chipCols = (items, top, { size = 23, cols } = {}) => `
  <div class="abs z" style="left:56px;right:56px;top:${top}px;display:grid;grid-template-columns:${cols || `repeat(${items.length},1fr)`};gap:26px">
    ${items.map(([chip, cls, txt]) => `<div><div class="chip ${cls}">${chip}</div><div style="margin-top:13px;font-size:${size}px;line-height:1.38">${txt}</div></div>`).join("")}
  </div>`;

export const warn = (txt, { bottom = 56, light = false } = {}) => `
  <div class="abs z" style="left:56px;right:56px;bottom:${bottom}px;display:flex;gap:18px;align-items:center;background:${light ? "rgba(225,8,12,.08)" : "rgba(225,8,12,.12)"};border:1px solid rgba(225,8,12,.55);border-radius:14px;padding:18px 24px">
    <span class="num" style="font-size:46px;color:var(--red)">!</span><span style="font-size:23px;line-height:1.36">${txt}</span>
  </div>`;

export const credLine = (txt) => `<div class="abs mono" style="left:56px;bottom:22px;font-size:12.5px;opacity:.42;z-index:40">${txt}</div>`;

// Medidor de costo ($ a $$$$$)
export const cost = (n, { size = 30, on = "var(--red)", off = "rgba(255,255,255,.14)" } = {}) =>
  `<span style="display:inline-flex;gap:4px">${[1, 2, 3, 4, 5].map((k) => `<span class="num" style="font-size:${size}px;color:${k <= n ? on : off}">$</span>`).join("")}</span>`;

// Fila "sí/no" con íconos
export const yn = (v) => v === true
  ? `<svg width="34" height="34" viewBox="0 0 34 34"><circle cx="17" cy="17" r="16" fill="#E1080C"/><path d="M9 17.5l5.5 5.5L25 12" fill="none" stroke="#fff" stroke-width="3.6" stroke-linecap="round" stroke-linejoin="round"/></svg>`
  : v === false
    ? `<svg width="34" height="34" viewBox="0 0 34 34"><circle cx="17" cy="17" r="15" fill="none" stroke="rgba(255,255,255,.35)" stroke-width="2.5"/><path d="M11 11l12 12M23 11L11 23" stroke="rgba(255,255,255,.55)" stroke-width="3" stroke-linecap="round"/></svg>`
    : `<span class="num" style="font-size:30px;color:var(--amber)">${v}</span>`;

export const card = (inner, style = "") => `<div class="card" style="padding:28px 30px;${style}">${inner}</div>`;
export const label = (t, color = "") => `<div class="mono" style="font-size:15px;letter-spacing:.18em;opacity:.62;text-transform:uppercase;${color}">${t}</div>`;
export const ttl = (t, size = 34, color = "") => `<div style="font-family:Archivo;font-stretch:118%;font-weight:900;font-style:italic;font-size:${size}px;text-transform:uppercase;line-height:1.02;${color}">${t}</div>`;
