import { page, logo, counter, A, foot } from "./lib.mjs";

// Fila de comparación: win = "a" | "b" | "" (empate)
export const row = ([label, a, b, win = ""]) => `
  <div style="display:grid;grid-template-columns:1fr 250px 1fr;align-items:center;padding:12px 0;border-top:1px solid rgba(255,255,255,.1)">
    <div style="text-align:left;display:flex;align-items:center;gap:12px;${win === "b" ? "opacity:.55" : ""}">
      ${win === "a" ? `<span style="width:12px;height:30px;background:var(--red);transform:skewX(-18deg);flex:none"></span>` : ""}
      <span class="num" style="font-size:38px;font-weight:${win === "a" ? 800 : 600}">${a}</span></div>
    <div class="mono" style="text-align:center;font-size:16px;letter-spacing:.16em;opacity:.6;text-transform:uppercase">${label}</div>
    <div style="text-align:right;display:flex;align-items:center;justify-content:flex-end;gap:12px;${win === "a" ? "opacity:.55" : ""}">
      <span class="num" style="font-size:38px;font-weight:${win === "b" ? 800 : 600}">${b}</span>
      ${win === "b" ? `<span style="width:12px;height:30px;background:var(--red);transform:skewX(-18deg);flex:none"></span>` : ""}</div>
  </div>`;

export const table = (rows, nameA, nameB, style = "") => `
  <div style="${style}">
    <div style="display:grid;grid-template-columns:1fr 1fr;padding-bottom:12px">
      <div style="font-family:Archivo;font-stretch:118%;font-weight:900;font-style:italic;font-size:30px;text-transform:uppercase">${nameA}</div>
      <div style="font-family:Archivo;font-stretch:118%;font-weight:900;font-style:italic;font-size:30px;text-transform:uppercase;text-align:right;color:var(--red)">${nameB}</div>
    </div>
    ${rows.map(row).join("")}
  </div>`;

/** Fondo dividido en diagonal + dos autos recortados enfrentados */
export const duel = ({ a, b, top = 300, h = 470, wA = 640, wB = 640, offA = {}, offB = {} }) => `
  <div class="abs" style="left:0;right:0;top:${top}px;height:${h}px;z-index:2">
    <div class="shadow-floor" style="left:${(offA.x ?? 10) + 40}px;width:${wA - 80}px;top:${(offA.y ?? 0) + (offA.fh ?? 300)}px"></div>
    <img class="car" src="${A("cut/" + a + ".png")}" style="left:${offA.x ?? 10}px;top:${offA.y ?? 0}px;width:${wA}px;${offA.flip ? "transform:scaleX(-1)" : ""}">
    <div class="shadow-floor" style="right:${(offB.x ?? 10) + 40}px;width:${wB - 80}px;top:${(offB.y ?? 120) + (offB.fh ?? 300)}px"></div>
    <img class="car" src="${A("cut/" + b + ".png")}" style="right:${offB.x ?? 10}px;top:${offB.y ?? 120}px;width:${wB}px;z-index:6">
  </div>`;

export const vsBadge = (x, y, s = 150) => `
  <div class="abs" style="left:${x}px;top:${y}px;width:${s}px;height:${s}px;z-index:8;display:grid;place-items:center;background:var(--red);transform:skewX(-14deg);box-shadow:0 20px 50px rgba(0,0,0,.5)">
    <span style="font-family:Archivo;font-stretch:125%;font-weight:900;font-style:italic;font-size:${s * 0.42}px;transform:skewX(14deg);letter-spacing:-.02em">VS</span>
  </div>`;

export const splitBg = (deg = 104) => `
  <div class="abs" style="inset:0;z-index:0;background:linear-gradient(${deg}deg, transparent 0 50%, rgba(225,8,12,.92) 50% 100%)"></div>
  <div class="abs" style="inset:0;z-index:0;background:radial-gradient(700px 500px at 80% 40%, rgba(255,60,40,.35), transparent 70%)"></div>`;
