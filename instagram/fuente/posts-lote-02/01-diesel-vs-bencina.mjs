import { page, logo, counter, swipe, A } from "../lib.mjs";
import { head, chipCols, credLine, card, label, ttl } from "../lib2.mjs";
import { credit } from "../credits.mjs";

const N = 5;

// Cilindro en corte: chispa (bencina) o inyector con aire muy caliente (diésel)
const cyl = (type, id) => `<svg viewBox="0 0 300 420" width="360">
  <defs>
    <linearGradient id="m${id}" x1="0" x2="1"><stop offset="0" stop-color="#6b7079"/><stop offset=".25" stop-color="#f4f5f7"/><stop offset=".5" stop-color="#a9aeb6"/><stop offset=".75" stop-color="#e3e5e8"/><stop offset="1" stop-color="#585c64"/></linearGradient>
    <radialGradient id="g${id}" cx=".5" cy=".3" r=".7"><stop offset="0" stop-color="${type === "d" ? "#ffb000" : "#ff2a1f"}" stop-opacity=".95"/><stop offset="1" stop-color="#ff2a1f" stop-opacity="0"/></radialGradient>
  </defs>
  <rect x="40" y="30" width="220" height="70" rx="12" fill="#26272c" stroke="rgba(255,255,255,.3)" stroke-width="2"/>
  <rect x="60" y="96" width="180" height="300" fill="#08080a" stroke="rgba(255,255,255,.35)" stroke-width="3"/>
  <rect x="62" y="100" width="176" height="${type === "d" ? 70 : 110}" fill="url(#g${id})"/>
  <rect x="64" y="${type === "d" ? 172 : 212}" width="172" height="90" rx="8" fill="url(#m${id})"/>
  <path d="M64 ${type === "d" ? 192 : 232}h172M64 ${type === "d" ? 208 : 248}h172" stroke="rgba(0,0,0,.3)" stroke-width="5"/>
  ${type === "g"
    ? `<rect x="138" y="0" width="24" height="70" rx="4" fill="#c9ccd2"/><rect x="132" y="60" width="36" height="40" rx="4" fill="#fff"/><path d="M150 102 l-14 26 h12 l-10 26 26 -34 h-12 l10 -18z" fill="#fff" stroke="#E1080C" stroke-width="3"/>`
    : `<rect x="140" y="0" width="20" height="90" rx="4" fill="#c9ccd2"/><path d="M150 102 L118 150 M150 102 L150 156 M150 102 L182 150" stroke="#fff" stroke-width="5" stroke-linecap="round" stroke-dasharray="3 9"/>`}
  <text x="150" y="${type === "d" ? 300 : 330}" text-anchor="middle" font-family="Barlow C" font-weight="800" font-size="34" fill="rgba(255,255,255,.75)">${type === "d" ? "16:1" : "11:1"}</text>
  <text x="150" y="${type === "d" ? 330 : 360}" text-anchor="middle" font-family="JBM" font-size="15" fill="rgba(255,255,255,.5)">COMPRESIÓN TÍPICA</text>
</svg>`;

const vrow = (label, win, why) => `
  <div style="display:grid;grid-template-columns:330px 190px 1fr;align-items:center;gap:20px;padding:26px 0;border-top:1px solid rgba(255,255,255,.1)">
    <div style="font-family:Archivo;font-stretch:112%;font-weight:800;font-size:27px">${label}</div>
    <div><span class="chip ${win === "Diésel" ? "r" : "w"}" style="font-size:19px">${win}</span></div>
    <div style="font-size:23px;line-height:1.32;opacity:.82">${why}</div>
  </div>`;

export default {
  id: "01-diesel-vs-bencina",
  title: "Diésel vs Bencina",
  slides: [
    page("bg-ink grain", `
    <div class="abs" style="left:445px;right:0;top:0;bottom:0;background:var(--red);z-index:0"></div>
    <div class="abs" style="left:445px;right:0;top:0;bottom:0;z-index:0;background:repeating-linear-gradient(-62deg, rgba(255,255,255,.08) 0 2px, transparent 2px 26px)"></div>
    ${logo("light")}${counter(1, N).replace("<b>", '<b style="color:#fff">')}
    <div class="abs z" style="left:56px;top:190px"><div class="kicker">Duelo de combustibles</div></div>
    <div class="abs z h-xl" style="left:56px;top:250px;font-size:124px">Diésel</div>
    <div class="abs z h-xl" style="right:40px;top:400px;font-size:92px;color:var(--ink);text-align:right">Bencina</div>
    <img class="car" src="${A("cut/hilux2.png")}" style="left:-60px;top:560px;width:650px">
    <img class="car" src="${A("cut/corolla.png")}" style="right:-50px;top:700px;width:640px">
    <div class="abs z" style="left:56px;right:56px;top:1110px;display:flex;justify-content:space-between;align-items:flex-end;gap:30px">
      <div class="lead" style="font-weight:700;font-size:32px;max-width:560px">¿Cuál te conviene según cómo usas tu auto?</div>
    </div>
    ${swipe("DESLIZA", "#fff")}
    ${credLine(credit("hilux2", "corolla"))}
    `),
    page("bg-ink grain", `
    <div class="grid"></div>
    ${head(2, N, "Cómo encienden", `Chispa vs <span class="red">compresión</span>`)}
    <div class="abs z" style="left:56px;right:56px;top:430px;display:grid;grid-template-columns:1fr 1fr;gap:30px">
      <div style="text-align:center">${cyl("g", "a")}${ttl("Bencina", 40)}<div style="font-size:23px;line-height:1.36;margin-top:10px;opacity:.85">La bujía hace saltar una chispa que enciende la mezcla de aire y bencina.</div></div>
      <div style="text-align:center">${cyl("d", "b")}${ttl("Diésel", 40, "color:var(--red)")}<div style="font-size:23px;line-height:1.36;margin-top:10px;opacity:.85">Sin bujías: el aire se comprime tanto que se calienta a más de 500 °C y el diésel se enciende solo al inyectarse.</div></div>
    </div>
    <div class="abs z" style="left:56px;right:56px;bottom:56px;font-size:23px;line-height:1.38;border-left:6px solid var(--red);padding-left:22px">Por eso el diésel tiene <b>más torque a bajas vueltas</b>: comprime más y quema más lento.</div>
    `),
    page("bg-ink grain", `
    <div class="grid"></div>
    ${head(3, N, "Cara a cara", `¿Quién gana <span class="red">en qué?</span>`)}
    <div class="abs z" style="left:56px;right:56px;top:420px">
      ${vrow("Torque a bajas vueltas", "Diésel", "Ideal para carga, remolque y subidas.")}
      ${vrow("Consumo", "Diésel", "Recorre más kilómetros por litro.")}
      ${vrow("Precio por litro", "Diésel", "En Chile suele ser más barato.")}
      ${vrow("Precio del auto", "Bencina", "La versión diésel casi siempre cuesta más.")}
      ${vrow("Mantención", "Bencina", "Más simple: sin filtro de partículas ni inyectores de alta presión.")}
      ${vrow("Uso solo en ciudad", "Bencina", "Los trayectos cortos complican al diésel moderno.")}
      ${vrow("Ruido y vibración", "Bencina", "Más silencioso, sobre todo en frío.")}
    </div>
    `),
    page("bg-ink grain", `
    <div class="grid"></div>
    ${head(4, N, "Diésel moderno", `Sus puntos <span class="red">sensibles</span>`)}
    <div class="abs z" style="left:56px;right:56px;top:430px;display:grid;grid-template-columns:1fr 1fr;grid-auto-rows:310px;gap:22px">
      ${card(`${ttl("Filtro de partículas (DPF)", 27, "color:var(--red)")}<div style="font-size:26px;line-height:1.4;margin-top:16px">Atrapa el hollín y necesita carretera para limpiarse. En ciudad se satura.</div>`)}
      ${card(`${ttl("Inyectores", 27, "color:var(--red)")}<div style="font-size:26px;line-height:1.4;margin-top:16px">Trabajan a presiones altísimas: el agua o la suciedad en el combustible los dañan.</div>`)}
      ${card(`${ttl("Válvula EGR", 27, "color:var(--red)")}<div style="font-size:26px;line-height:1.4;margin-top:16px">Recircula gases de escape y se llena de carbón con el uso urbano.</div>`)}
      ${card(`${ttl("AdBlue (Euro 6)", 27, "color:var(--red)")}<div style="font-size:26px;line-height:1.4;margin-top:16px">Muchos diésel nuevos usan este líquido para reducir emisiones. Si se acaba, el auto limita su potencia o no arranca.</div>`)}
    </div>
    <div class="abs z" style="left:56px;right:56px;bottom:56px;font-size:23px;line-height:1.38;border-left:6px solid var(--red);padding-left:22px">Clave: <b>cambia el filtro de combustible</b> a tiempo y drena el agua si tu auto tiene separador.</div>
    `),
    page("bg-red grain", `
    <div class="speed" style="inset:0;opacity:.45"></div>
    ${head(5, N, "Veredicto MOKTA", `¿Cuál te <span style="color:var(--ink)">conviene?</span>`, { size: "h-l" })}
    <div class="abs z" style="left:56px;right:56px;top:470px;display:grid;grid-template-columns:1fr 1fr;gap:22px">
      <div style="background:var(--ink);border-radius:22px;padding:40px 34px;min-height:560px">
        ${ttl("Diésel si…", 44, "color:var(--red)")}
        <ul style="margin-top:22px;padding-left:28px;font-size:28px;line-height:1.65">
          <li>Haces muchos kilómetros al año.</li><li>Andas harto en carretera.</li><li>Cargas peso o remolcas.</li><li>Buscas una pickup o SUV de trabajo.</li></ul>
      </div>
      <div style="background:#fff;color:var(--ink);border-radius:22px;padding:40px 34px;min-height:560px">
        ${ttl("Bencina si…", 44)}
        <ul style="margin-top:22px;padding-left:28px;font-size:28px;line-height:1.65">
          <li>Usas el auto en ciudad.</li><li>Haces trayectos cortos.</li><li>Recorres pocos kilómetros.</li><li>Quieres mantenciones simples.</li></ul>
      </div>
    </div>
    <div class="abs z" style="left:56px;right:56px;bottom:60px;display:flex;justify-content:space-between;align-items:center">
      <div style="font-size:27px;font-weight:800">¿Team diésel o team bencina? 👇</div>
      <div class="chip k" style="font-size:22px;padding:16px 22px">Comenta</div>
    </div>
    `),
  ],
};
