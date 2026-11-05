import { page, logo, A, TAG } from "./lib.mjs";
import { credit } from "./credits.mjs";

export const legend = (dark = false) => `
  <div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap">
    <span class="mono" style="font-size:14px;letter-spacing:.14em;opacity:.55;margin-right:6px">CLASIFICACIÓN</span>
    <span class="chip r" style="font-size:14px;padding:7px 10px 6px">● Documentada</span>
    <span class="chip a" style="font-size:14px;padding:7px 10px 6px">● Reportada</span>
    <span class="chip g" style="font-size:14px;padding:7px 10px 6px">● Desgaste</span>
  </div>`;

export const issue = (n, tag, title, text, dark = false) => `
  <div style="display:grid;grid-template-columns:74px 1fr;gap:18px;padding:22px 0;border-top:1px solid ${dark ? "rgba(255,255,255,.12)" : "rgba(10,10,11,.12)"}">
    <div class="num" style="font-size:58px;color:var(--red);font-style:italic">${n}</div>
    <div>
      <div style="display:flex;align-items:center;gap:14px;flex-wrap:wrap">${TAG[tag]}
        <span style="font-family:Archivo;font-stretch:112%;font-weight:900;font-style:italic;font-size:27px;text-transform:uppercase;line-height:1.05">${title}</span></div>
      <div style="font-size:22px;line-height:1.38;margin-top:10px;opacity:.85">${text}</div>
    </div>
  </div>`;

/** Ficha de fallas en una sola imagen (fondo papel, editorial) */
export function fallaSingle({ id, title, no, model, specs, car, carStyle = "", items, check, source }) {
  return {
    id, title,
    slides: [page("bg-paper grain", `
    <div class="grid"></div>
    <div class="abs" style="right:-80px;top:230px;width:600px;height:400px;background:var(--red);transform:skewX(-14deg);z-index:1"></div>
    <div class="abs" style="right:-80px;top:230px;width:600px;height:400px;transform:skewX(-14deg);z-index:1;background:repeating-linear-gradient(-62deg, rgba(255,255,255,.12) 0 2px, transparent 2px 24px)"></div>
    ${logo("dark")}
    <div class="abs z" style="right:56px;top:58px;display:flex;gap:10px;align-items:center"><span class="chip k">Fallas frecuentes</span><span class="chip o" style="color:var(--ink)">N° ${no}</span></div>
    <div class="abs z" style="left:56px;top:170px;width:560px;color:var(--ink)">
      <div class="h-m" style="font-size:60px;line-height:.95">${model}</div>
      <div style="display:flex;gap:10px;flex-wrap:wrap;margin-top:22px">${specs.map((s) => `<span class="chip k" style="font-size:16px">${s}</span>`).join("")}</div>
    </div>
    <img class="car" src="${A("cut/" + car + ".png")}" style="right:-30px;top:280px;width:620px;z-index:6;filter:drop-shadow(0 34px 28px rgba(0,0,0,.4));${carStyle}">
    <div class="abs z" style="left:56px;right:56px;top:640px;color:var(--ink)">
      ${legend()}
      <div style="margin-top:14px">${items.map((it, k) => issue("0" + (k + 1), ...it)).join("")}</div>
    </div>
    <div class="abs z" style="left:0;right:0;bottom:0;height:200px;background:var(--ink);color:#fff;padding:30px 56px 0">
      <div style="display:grid;grid-template-columns:200px 1fr;gap:24px;align-items:start">
        <div style="font-family:Archivo;font-stretch:118%;font-weight:900;font-style:italic;font-size:30px;line-height:1;text-transform:uppercase;color:var(--red)">Antes de<br>comprar</div>
        <div style="font-size:23px;line-height:1.38">${check}</div>
      </div>
      <div class="mono" style="position:absolute;left:56px;right:56px;bottom:18px;font-size:12.5px;opacity:.45;display:flex;justify-content:space-between;gap:20px"><span>${source}</span><span>${credit(car)}</span></div>
    </div>
    `)],
  };
}
