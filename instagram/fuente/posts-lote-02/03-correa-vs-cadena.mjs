import { page, logo, counter, swipe } from "../lib.mjs";
import { head, chipCols, warn, ttl } from "../lib2.mjs";

const N = 4;
const MET = `<linearGradient id="mt" x1="0" x2="1" y1="0" y2="1"><stop offset="0" stop-color="#f4f5f7"/><stop offset=".5" stop-color="#8b9099"/><stop offset="1" stop-color="#d9dbe0"/></linearGradient>`;

// Distribución: correa, cadena o correa en aceite
export function drive(type, w = 620) {
  const path = "M100 140 A80 80 0 0 1 180 60 L420 60 A80 80 0 0 1 500 140 L498 330 L350 520 A50 50 0 0 1 250 520 L106 360 Z";
  const strap = type === "chain"
    ? `<path d="${path}" fill="none" stroke="#3a3c42" stroke-width="26" stroke-linejoin="round"/>
       <path d="${path}" fill="none" stroke="#c9ccd2" stroke-width="16" stroke-dasharray="16 6" stroke-linejoin="round"/>
       <path d="${path}" fill="none" stroke="#fff" stroke-width="7" stroke-dasharray="3 19" stroke-linejoin="round"/>`
    : `<path d="${path}" fill="none" stroke="${type === "wet" ? "#ffb000" : "#8b9099"}" stroke-width="32" stroke-linejoin="round"/>
       <path d="${path}" fill="none" stroke="#141416" stroke-width="26" stroke-linejoin="round"/>
       <path d="${path}" fill="none" stroke="#34353a" stroke-width="20" stroke-dasharray="6 5" stroke-linejoin="round"/>`;
  const pulley = (x, y, r, lbl, red = false) => `
    <circle cx="${x}" cy="${y}" r="${r}" fill="url(#mt)" stroke="#2a2b30" stroke-width="3"/>
    <circle cx="${x}" cy="${y}" r="${r * 0.62}" fill="#16171a" stroke="${red ? "#E1080C" : "rgba(255,255,255,.3)"}" stroke-width="${red ? 5 : 2}"/>
    <circle cx="${x}" cy="${y}" r="${r * 0.18}" fill="#fff"/>
    <text x="${x}" y="${y + r + 36}" text-anchor="middle" font-family="JBM" font-size="18" fill="rgba(255,255,255,.6)">${lbl}</text>`;
  const oil = type === "wet" ? `<rect x="40" y="420" width="520" height="170" rx="20" fill="#ffb000" opacity=".16"/>
    ${[[90, 470], [520, 450], [470, 560], [140, 560], [400, 590]].map(([x, y]) => `<path d="M${x} ${y} c0 0 -10 14 -10 20a10 10 0 0 0 20 0c0-6-10-20-10-20z" fill="#ffb000" opacity=".8"/>`).join("")}` : "";
  return `<svg viewBox="40 0 560 640" width="${w}"><defs>${MET}</defs>${oil}${strap}
    ${pulley(180, 140, 74, "LEVAS", true)}${pulley(420, 140, 74, "LEVAS", true)}
    ${pulley(300, 520, 46, "CIGÜEÑAL")}${pulley(472, 330, 26, "")}${pulley(132, 360, 32, "")}
  </svg>`;
}

const slide = (i, k, title, type, facts, chips, note) => page("bg-ink grain", `
  <div class="grid"></div>
  ${head(i, N, k, title)}
  <div class="abs" style="left:0;top:400px;z-index:3">${drive(type, 560)}</div>
  <div class="abs z" style="left:600px;right:56px;top:430px;display:grid;gap:22px">
    ${facts.map(([a, b]) => `<div style="border-top:2px solid rgba(255,255,255,.15);padding-top:14px"><div class="mono" style="font-size:15px;letter-spacing:.16em;opacity:.6;text-transform:uppercase">${a}</div><div style="font-family:Archivo;font-stretch:110%;font-weight:800;font-size:29px;margin-top:6px;line-height:1.15">${b}</div></div>`).join("")}
  </div>
  ${chipCols(chips, 1030, { size: 23 })}
  ${note ? warn(note) : ""}
`);

export default {
  id: "03-correa-vs-cadena",
  title: "Correa vs cadena de distribución",
  slides: [
    page("bg-ink grain", `
    <div class="grid major"></div>
    ${logo("light")}${counter(1, N)}
    <div class="abs" style="left:-40px;top:130px;opacity:.95">${drive("belt", 560)}</div>
    <div class="abs" style="right:-40px;top:330px;opacity:.95">${drive("chain", 560)}</div>
    <div class="abs z" style="left:56px;right:56px;top:960px">
      <div class="kicker">Distribución del motor</div>
      <div class="h-l" style="margin-top:22px;font-size:96px">Correa <span class="red">o</span> cadena</div>
      <div class="lead" style="margin-top:20px;font-size:30px">La pieza que, si falla, puede costarte el motor.</div>
    </div>
    ${swipe()}
    `),
    slide(2, "Opción 01", `Correa <span class="red">de goma</span>`, "belt",
      [["Duración", "Tiene fecha: entre 60.000 y 160.000 km o por años, según el fabricante"], ["Ruido", "Silenciosa"], ["Costo del cambio", "Moderado"]],
      [["+ A favor", "r", "Liviana, silenciosa y barata de fabricar."], ["Se cambia con", "o", "Tensor, poleas y casi siempre la bomba de agua."]],
      "Si se corta en un motor de interferencia, válvulas y pistones chocan: reparación mayor."),
    slide(3, "Opción 02", `Cadena <span class="red">metálica</span>`, "chain",
      [["Duración", "Pensada para toda la vida del motor"], ["Ruido", "Algo más ruidosa"], ["Su enemigo", "El aceite viejo o incorrecto"]],
      [["+ A favor", "r", "Sin cambio programado en la mayoría de los motores."], ["− En contra", "w", "Puede estirarse. Avisa con un cascabeleo metálico al arrancar en frío."]],
      "Motores con estiramiento conocido: BMW N20, VW 1.2/1.4 TSI (EA111) y Peugeot 1.6 THP."),
    slide(4, "Opción 03", `Correa <span style="color:var(--amber)">bañada en aceite</span>`, "wet",
      [["Dónde", "Trabaja dentro del motor, lubricada por el aceite"], ["Ejemplos", "Peugeot 1.2 PureTech · Ford 1.0 EcoBoost"], ["Clave", "Aceite con la norma exacta del manual"]],
      [["+ A favor", "r", "Silenciosa y con menos fricción: ayuda al consumo."], ["− En contra", "w", "Si el aceite no es el correcto, se degrada y suelta restos."]],
      "¿No sabes cuál tiene tu auto? Revisa el manual o pregunta en tu taller con la patente o el VIN."),
  ],
};
