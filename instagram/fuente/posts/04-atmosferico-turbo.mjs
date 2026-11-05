import { page, logo, counter, swipe, foot } from "../lib.mjs";
import { turboSvg } from "../engines.mjs";

const N = 5;
// Densidad del aire, atmósfera estándar ISA: ρ/ρ0 = (1 − 2,2558e-5·h)^4,2559
const loss = (h) => Math.round((1 - Math.pow(1 - 2.2558e-5 * h, 4.2559)) * 100);

const cols = (items) => `<div style="display:grid;grid-template-columns:1fr 1fr;gap:28px">${items
  .map(([chip, cls, txt]) => `<div><div class="chip ${cls}">${chip}</div><div style="margin-top:14px;font-size:24px;line-height:1.38">${txt}</div></div>`)
  .join("")}</div>`;

const header = (i, k, title, sub) => `
  ${logo("light")}${counter(i, N)}
  <div class="abs z" style="left:56px;top:168px;right:56px">
    <div class="kicker">${k}</div>
    <div class="h-l" style="margin-top:22px">${title}</div>
    <div class="lead" style="margin-top:20px;opacity:.9">${sub}</div>
  </div>`;

// Pistón aspirando (ilustración atmosférico)
const intake = `<svg viewBox="0 0 520 420" width="520">
  <defs><linearGradient id="am" x1="0" x2="1"><stop offset="0" stop-color="#6b7079"/><stop offset=".25" stop-color="#f4f5f7"/><stop offset=".5" stop-color="#a9aeb6"/><stop offset=".75" stop-color="#e3e5e8"/><stop offset="1" stop-color="#585c64"/></linearGradient></defs>
  <rect x="150" y="40" width="220" height="360" rx="10" fill="#08080a" stroke="rgba(255,255,255,.35)" stroke-width="3"/>
  <rect x="156" y="250" width="208" height="110" rx="8" fill="url(#am)"/>
  <path d="M156 268h208M156 284h208" stroke="rgba(0,0,0,.3)" stroke-width="5"/>
  <path d="M-10 70 C 60 70 110 60 160 120" stroke="#fff" stroke-width="7" fill="none" stroke-dasharray="2 16" stroke-linecap="round"/>
  <path d="M-10 120 C 70 120 110 110 170 170" stroke="#fff" stroke-width="7" fill="none" stroke-dasharray="2 16" stroke-linecap="round" opacity=".7"/>
  <path d="M-10 30 C 60 30 120 30 165 80" stroke="#fff" stroke-width="7" fill="none" stroke-dasharray="2 16" stroke-linecap="round" opacity=".5"/>
  <path d="M260 230 v-70 M240 180 l20 -22 20 22" stroke="#E1080C" stroke-width="0" fill="none"/>
  <path d="M260 372 v40 M244 396 l16 18 16 -18" stroke="#E1080C" stroke-width="6" fill="none"/>
  <text x="400" y="320" font-family="JBM" font-size="20" fill="rgba(255,255,255,.7)">BAJA ↓</text>
  <text x="400" y="346" font-family="JBM" font-size="20" fill="rgba(255,255,255,.7)">Y ASPIRA</text>
</svg>`;

export default {
  id: "04-atmosferico-turbo-biturbo",
  title: "Atmosférico vs Turbo vs Biturbo",
  slides: [
    page("bg-ink grain", `
    <div class="grid major"></div>
    ${logo("light")}${counter(1, N)}
    <div class="abs" style="right:-120px;top:120px;opacity:.95;transform:rotate(-8deg)">${turboSvg({ w: 900, id: "cv" })}</div>
    <div class="abs z" style="left:56px;top:560px;right:56px">
      <div class="kicker">Cómo respira tu motor</div>
      <div class="h-l" style="margin-top:26px;font-size:104px">Atmosférico</div>
      <div class="h-l" style="font-size:104px;color:transparent;-webkit-text-stroke:3px #fff">Turbo</div>
      <div class="h-l red" style="font-size:104px">Biturbo</div>
      <div class="lead" style="margin-top:30px;max-width:840px">Cuál conviene según cómo y <b>dónde</b> manejas en Chile.</div>
    </div>
    ${swipe()}
    `),
    page("bg-ink grain", `
    <div class="grid"></div>
    ${header(2, "Atmosférico", `Respira <span class="red">solo</span>`, "El pistón baja y “succiona” el aire a presión atmosférica. Sin ayudas.")}
    <div class="abs z" style="left:60px;top:520px">${intake}</div>
    <div class="abs z" style="left:620px;right:56px;top:560px;display:grid;gap:26px">
      ${[["Respuesta", "Inmediata y lineal"], ["Piezas", "Menos = menos fallas"], ["Potencia / litro", "La más baja"], ["En altura", "Pierde potencia"]]
        .map(([a, b]) => `<div style="border-top:2px solid rgba(255,255,255,.15);padding-top:14px"><div class="mono" style="font-size:15px;letter-spacing:.18em;opacity:.55;text-transform:uppercase">${a}</div><div style="font-family:Archivo;font-stretch:110%;font-weight:800;font-size:30px;margin-top:6px">${b}</div></div>`).join("")}
    </div>
    <div class="abs z" style="left:56px;right:56px;top:1010px">${cols([
      ["+ Ideal para", "r", "Quien busca simpleza, durabilidad y mantenciones baratas."],
      ["Lo encuentras en", "o", "Toyota Corolla 2.0 · Mazda 3 2.5 · Kia Morning"],
    ])}</div>
    `),
    page("bg-ink grain", `
    <div class="grid"></div>
    ${header(3, "Turbo", `Aire a <span class="red">presión</span>`, "Los gases de escape mueven una turbina que comprime el aire que entra al motor.")}
    <div class="abs z" style="left:40px;right:40px;top:650px;display:flex;justify-content:center">${turboSvg({ w: 720, id: "t3" })}</div>
    <div class="abs z mono" style="left:110px;top:1018px;font-size:18px;letter-spacing:.1em;color:var(--red);font-weight:700">TURBINA · GASES CALIENTES</div>
    <div class="abs z mono" style="left:600px;top:1018px;font-size:18px;letter-spacing:.1em;font-weight:700">COMPRESOR · AIRE FRESCO</div>
    <div class="abs z" style="left:56px;right:56px;top:1080px">${cols([
      ["+ A favor", "r", "Más potencia con menos cilindrada y casi no se ahoga en altura."],
      ["− En contra", "w", "Más calor y exigencia: pide aceite de calidad y cambios a tiempo."],
    ])}</div>
    <div class="abs z" style="left:56px;top:590px">
      <div class="num chrome" style="font-size:96px;font-style:italic">+150.000</div>
      <div class="mono" style="font-size:16px;letter-spacing:.18em;opacity:.6">RPM PUEDE SUPERAR EL EJE DE UN TURBO</div>
    </div>
    `),
    page("bg-ink grain", `
    <div class="grid"></div>
    ${logo("light")}${counter(4, N)}
    <div class="abs z" style="left:56px;top:168px;right:56px"><div class="kicker">Biturbo</div><div class="h-m" style="margin-top:22px">Dos turbos,<br><span class="red">dos estrategias</span></div></div>
    <div class="abs z" style="left:56px;right:56px;top:430px;display:grid;grid-template-columns:1fr 1fr;gap:26px">
      <div class="card" style="padding:30px 30px 34px">
        <div class="chip r">Paralelo</div>
        <div style="margin:18px 0 12px;display:flex;justify-content:center">${turboSvg({ w: 380, id: "p1", twin: true })}</div>
        <div style="font-size:24px;line-height:1.38">Un turbo por cada bancada del motor en V. Ambos trabajan a la vez.</div>
        <div class="mono" style="font-size:16px;opacity:.6;margin-top:16px;letter-spacing:.06em">EJ: FORD 3.5 ECOBOOST V6 (F-150)</div>
      </div>
      <div class="card" style="padding:30px 30px 34px">
        <div class="chip w">Secuencial</div>
        <div style="margin:18px 0 12px;display:flex;justify-content:center;align-items:flex-end;gap:10px;height:355px">${turboSvg({ w: 160, id: "s1" })}${turboSvg({ w: 260, id: "s2" })}</div>
        <div style="font-size:24px;line-height:1.38">Uno chico sopla a bajas vueltas y uno grande entra arriba.</div>
        <div class="mono" style="font-size:16px;opacity:.6;margin-top:16px;letter-spacing:.06em">EJ: VW AMAROK 2.0 BiTDI</div>
      </div>
    </div>
    <div class="abs z" style="left:56px;right:56px;top:1110px">${cols([
      ["+ A favor", "r", "Menos “retardo”: entrega fuerza en un rango de vueltas más amplio."],
      ["− En contra", "w", "Más piezas, más calor y reparaciones más caras."],
    ])}</div>
    `),
    page("bg-red grain", `
    <div class="speed" style="inset:0;opacity:.45"></div>
    ${logo("light")}${counter(5, N)}
    <div class="abs z" style="left:56px;top:168px;right:56px">
      <div class="kicker">El dato chileno</div>
      <div class="h-l" style="margin-top:22px;font-size:96px">En Chile,<br><span style="color:var(--ink)">la altura manda</span></div>
      <div class="lead" style="margin-top:20px;font-weight:600;font-size:30px">Potencia que pierde un motor <u>atmosférico</u> por el aire más delgado:</div>
    </div>
    <div class="abs z" style="left:56px;right:56px;top:620px;background:var(--ink);border-radius:20px;padding:36px 36px;display:grid;gap:30px">
      ${[["Santiago", 570], ["Calama", 2260], ["Túnel Cristo Redentor", 3200], ["Paso de Jama", 4200]].map(([c, h]) => `
        <div style="display:grid;grid-template-columns:330px 1fr 110px;align-items:center;gap:20px">
          <div><div style="font-family:Archivo;font-stretch:110%;font-weight:800;font-size:28px">${c}</div><div class="mono" style="font-size:17px;opacity:.55;letter-spacing:.1em">≈ ${h.toLocaleString("es-CL")} m s.n.m.</div></div>
          <div class="bar" style="height:22px"><i style="width:${loss(h) * 2.4}%"></i></div>
          <div class="num" style="font-size:62px;text-align:right;color:var(--red)">−${loss(h)}%</div>
        </div>`).join("")}
      <div class="mono" style="font-size:15px;opacity:.5;letter-spacing:.06em;line-height:1.4">ESTIMACIÓN SEGÚN DENSIDAD DEL AIRE (ATMÓSFERA ESTÁNDAR). UN TURBO COMPENSA GRAN PARTE DE ESTA PÉRDIDA.</div>
    </div>
    <div class="abs z" style="left:56px;right:56px;top:1120px;display:grid;grid-template-columns:1fr 1fr;gap:26px">
      <div style="font-size:26px;line-height:1.35"><b>Ciudad y uso tranquilo:</b> un atmosférico bien mantenido es difícil de matar.</div>
      <div style="font-size:26px;line-height:1.35"><b>Carga, carretera o altura:</b> el turbo es tu aliado.</div>
    </div>
    `),
  ],
};
