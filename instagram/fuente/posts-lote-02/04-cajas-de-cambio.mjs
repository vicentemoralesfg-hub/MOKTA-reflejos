import { page, logo, counter, swipe } from "../lib.mjs";
import { head, chipCols, warn } from "../lib2.mjs";

const N = 5;
const G = `<defs><linearGradient id="mt" x1="0" x2="1" y1="0" y2="1"><stop offset="0" stop-color="#f4f5f7"/><stop offset=".5" stop-color="#8b9099"/><stop offset="1" stop-color="#d9dbe0"/></linearGradient>
<radialGradient id="kn" cx=".35" cy=".3" r=".8"><stop offset="0" stop-color="#ff5a50"/><stop offset="1" stop-color="#a80008"/></radialGradient></defs>`;

const manual = `<svg viewBox="0 0 460 420" width="440">${G}
  <path d="M80 90 V330 M200 90 V330 M320 90 V330 M80 210 H400 M400 210 V330" stroke="#3a3c42" stroke-width="34" stroke-linecap="round" fill="none"/>
  <path d="M80 90 V330 M200 90 V330 M320 90 V330 M80 210 H400 M400 210 V330" stroke="#0b0b0d" stroke-width="22" stroke-linecap="round" fill="none"/>
  ${[["1", 80, 60], ["2", 80, 380], ["3", 200, 60], ["4", 200, 380], ["5", 320, 60], ["6", 320, 380], ["R", 400, 380]].map(([t, x, y]) => `<text x="${x}" y="${y + 12}" text-anchor="middle" font-family="Barlow C" font-weight="800" font-size="40" fill="${t === "R" ? "#E1080C" : "#fff"}">${t}</text>`).join("")}
  <circle cx="200" cy="210" r="46" fill="url(#kn)" stroke="#fff" stroke-width="4"/>
</svg>`;

const planetary = `<svg viewBox="0 0 440 440" width="420">${G}
  <circle cx="220" cy="220" r="190" fill="none" stroke="url(#mt)" stroke-width="30"/>
  ${Array.from({ length: 48 }, (_, k) => `<rect x="216" y="44" width="8" height="14" fill="#16171a" transform="rotate(${k * 7.5} 220 220)"/>`).join("")}
  <circle cx="220" cy="220" r="52" fill="url(#kn)" stroke="#fff" stroke-width="4"/>
  ${[0, 120, 240].map((a) => { const x = 220 + 112 * Math.cos((a - 90) * Math.PI / 180), y = 220 + 112 * Math.sin((a - 90) * Math.PI / 180); return `<circle cx="${x}" cy="${y}" r="58" fill="url(#mt)" stroke="#2a2b30" stroke-width="3"/><circle cx="${x}" cy="${y}" r="14" fill="#16171a"/>`; }).join("")}
  <circle cx="220" cy="220" r="12" fill="#fff"/>
</svg>`;

const cvt = `<svg viewBox="0 0 520 420" width="500">${G}
  <path d="M130 120 L390 160 M130 300 L390 260" stroke="#E1080C" stroke-width="16" stroke-linecap="round"/>
  <g><path d="M70 60 L130 120 L130 300 L70 360 Z" fill="url(#mt)"/><path d="M190 60 L130 120 L130 300 L190 360 Z" fill="url(#mt)" opacity=".85"/></g>
  <g><path d="M350 120 L390 160 L390 260 L350 300 Z" fill="url(#mt)"/><path d="M430 120 L390 160 L390 260 L430 300 Z" fill="url(#mt)" opacity=".85"/></g>
  <text x="130" y="400" text-anchor="middle" font-family="JBM" font-size="18" fill="rgba(255,255,255,.6)">MOTOR</text>
  <text x="390" y="400" text-anchor="middle" font-family="JBM" font-size="18" fill="rgba(255,255,255,.6)">RUEDAS</text>
  <path d="M215 210 h90 M290 196 l16 14 -16 14" stroke="#fff" stroke-width="4" fill="none"/>
</svg>`;

const dct = `<svg viewBox="0 0 460 420" width="440">${G}
  <circle cx="230" cy="230" r="165" fill="#16171a" stroke="url(#mt)" stroke-width="16"/>
  <circle cx="230" cy="230" r="110" fill="#0b0b0d" stroke="#E1080C" stroke-width="16"/>
  <circle cx="230" cy="230" r="56" fill="url(#mt)"/>
  <text x="230" y="40" text-anchor="middle" font-family="Barlow C" font-weight="800" font-size="34" fill="#fff">1 · 3 · 5 · 7</text>
  <text x="230" y="245" text-anchor="middle" font-family="Barlow C" font-weight="800" font-size="30" fill="#0b0b0d">2 · 4 · 6</text>
  <text x="230" y="318" text-anchor="middle" font-family="JBM" font-size="16" fill="#E1080C">+ R</text>
</svg>`;

const slide = (i, k, title, art, facts, chips, note) => page("bg-ink grain", `
  <div class="grid"></div>
  ${head(i, N, k, title)}
  <div class="abs" style="left:40px;top:420px;width:520px;height:460px;display:grid;place-items:center;z-index:3">${art}</div>
  <div class="abs z" style="left:600px;right:56px;top:440px;display:grid;gap:22px">
    ${facts.map(([a, b]) => `<div style="border-top:2px solid rgba(255,255,255,.15);padding-top:14px"><div class="mono" style="font-size:15px;letter-spacing:.16em;opacity:.6;text-transform:uppercase">${a}</div><div style="font-family:Archivo;font-stretch:110%;font-weight:800;font-size:29px;margin-top:6px;line-height:1.15">${b}</div></div>`).join("")}
  </div>
  ${chipCols(chips, 935, { size: 23 })}
  ${warn(note)}
`);

export default {
  id: "04-cajas-de-cambio",
  title: "Manual, automática, CVT o doble embrague",
  slides: [
    page("bg-red grain", `
    <div class="speed" style="inset:0;opacity:.45"></div>
    ${logo("light")}${counter(1, N)}
    <div class="abs z" style="left:56px;right:56px;top:170px">
      <div class="kicker">Cajas de cambio</div>
      <div class="h-xl" style="margin-top:26px;font-size:112px;line-height:.9">Manual<br><span style="color:var(--ink)">Automática</span><br>CVT<br><span style="color:var(--ink)">Doble embrague</span></div>
    </div>
    <div class="abs" style="right:40px;top:760px;opacity:.95">${planetary.replace('width="420"', 'width="360"')}</div>
    <div class="abs z" style="left:56px;top:1080px;width:560px" ><div class="lead" style="font-weight:700;font-size:32px">Cómo funciona cada una y cómo cuidarla.</div></div>
    ${swipe("DESLIZA", "#fff")}
    `),
    slide(2, "Caja 01", `Manual`, manual,
      [["Cómo cambia", "Tú, con el embrague y la palanca"], ["Desgaste típico", "Disco de embrague"], ["Mantención", "La más barata"]],
      [["+ A favor", "r", "Simple, robusta y con control total."], ["Cuídala así", "o", "No descanses la mano en la palanca ni el pie en el embrague."]],
      "El embrague es desgaste normal: dura más o menos según cómo manejes en el taco."),
    slide(3, "Caja 02", `Automática <span class="red">convencional</span>`, planetary,
      [["Cómo cambia", "Engranajes planetarios y un convertidor de par lleno de aceite"], ["Sensación", "Suave y probada"], ["Mantención", "Cambio de aceite según manual"]],
      [["+ A favor", "r", "La más durable y cómoda para remolcar."], ["Cuídala así", "o", "Detén el auto por completo antes de pasar de D a R."]],
      "Muchas dicen “aceite de por vida”: con uso severo, cambiarlo alarga su vida."),
    slide(4, "Caja 03", `<span class="red">CVT</span>`, cvt,
      [["Cómo cambia", "Dos poleas que cambian de diámetro unidas por una correa metálica"], ["Sensación", "Sin saltos entre marchas"], ["Mantención", "Solo con su fluido específico"]],
      [["+ A favor", "r", "Mantiene el motor en su punto más eficiente: gasta menos."], ["Cuídala así", "o", "Acelera progresivo y evita arrancones repetidos o remolcar sobre su capacidad."]],
      "Usar un aceite que no es para CVT puede dañarla en pocos kilómetros."),
    slide(5, "Caja 04", `Doble <span class="red">embrague</span>`, dct,
      [["Cómo cambia", "Dos embragues: uno para marchas impares y otro para pares"], ["Sensación", "Cambios rapidísimos"], ["Ejemplos", "VW DSG · Ford Powershift"]],
      [["+ A favor", "r", "Deportiva y eficiente: la siguiente marcha ya está lista."], ["Cuídala así", "o", "En taco, no avances a pasitos: deja espacio y avanza de una vez."]],
      "Existen secas (más delicadas en taco) y bañadas en aceite (más robustas)."),
  ],
};
