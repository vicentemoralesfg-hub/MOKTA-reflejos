import { page, logo, counter, swipe } from "../lib.mjs";

const N = 6;

const dipstick = `<svg viewBox="0 0 900 260" width="900">
  <defs><linearGradient id="ds" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f4f5f7"/><stop offset=".5" stop-color="#9aa0a8"/><stop offset="1" stop-color="#e3e5e8"/></linearGradient>
  <linearGradient id="oil" x1="0" x2="1"><stop offset="0" stop-color="#c98a0c" stop-opacity=".95"/><stop offset="1" stop-color="#7a4d00" stop-opacity=".95"/></linearGradient></defs>
  <rect x="20" y="96" width="120" height="68" rx="34" fill="#E1080C"/>
  <circle cx="80" cy="130" r="18" fill="#0a0a0b"/>
  <rect x="140" y="118" width="740" height="24" rx="6" fill="url(#ds)"/>
  <rect x="470" y="114" width="360" height="32" rx="6" fill="url(#oil)"/>
  <path d="M880 118 l18 12 -18 12z" fill="#9aa0a8"/>
  <line x1="560" y1="70" x2="560" y2="190" stroke="#fff" stroke-width="4"/>
  <line x1="800" y1="70" x2="800" y2="190" stroke="#fff" stroke-width="4"/>
  <text x="560" y="56" text-anchor="middle" font-family="Barlow C" font-weight="800" font-size="34" fill="#fff">MAX</text>
  <text x="800" y="56" text-anchor="middle" font-family="Barlow C" font-weight="800" font-size="34" fill="#fff">MIN</text>
  <path d="M570 222 h220" stroke="#19C37D" stroke-width="6"/><text x="680" y="252" text-anchor="middle" font-family="JBM" font-size="20" fill="#19C37D">ZONA CORRECTA</text>
</svg>`;

const tank = (fill, label, color = "#ff4d8d", lvl = 0.55) => `<svg viewBox="0 0 360 420" width="370">
  <rect x="140" y="10" width="80" height="50" rx="10" fill="#1d1e22" stroke="rgba(255,255,255,.4)" stroke-width="3"/>
  <rect x="40" y="56" width="280" height="340" rx="38" fill="rgba(255,255,255,.07)" stroke="rgba(255,255,255,.65)" stroke-width="5"/>
  <clipPath id="c${label}"><rect x="43" y="59" width="274" height="334" rx="35"/></clipPath>
  <rect x="40" y="${56 + 340 * (1 - lvl)}" width="280" height="${340 * lvl}" fill="${color}" opacity=".8" clip-path="url(#c${label})"/>
  <line x1="40" y1="150" x2="120" y2="150" stroke="#fff" stroke-width="4"/><text x="132" y="160" font-family="Barlow C" font-weight="800" font-size="30" fill="#fff">MAX</text>
  <line x1="40" y1="300" x2="120" y2="300" stroke="#fff" stroke-width="4"/><text x="132" y="310" font-family="Barlow C" font-weight="800" font-size="30" fill="#fff">MIN</text>
  <text x="180" y="240" text-anchor="middle" font-family="Archivo" font-stretch="120%" font-weight="900" font-size="40" fill="#fff">${fill}</text>
</svg>`;

const gauge = `<svg viewBox="0 0 400 400" width="420">
  <circle cx="200" cy="200" r="180" fill="#121214" stroke="url(#gr)" stroke-width="18"/>
  <defs><linearGradient id="gr" x1="0" x2="1"><stop offset="0" stop-color="#f4f5f7"/><stop offset=".5" stop-color="#6d727b"/><stop offset="1" stop-color="#e3e5e8"/></linearGradient></defs>
  ${Array.from({ length: 31 }, (_, k) => { const a = (-225 + k * 9) * Math.PI / 180; const r2 = k % 5 ? 140 : 125; return `<line x1="${200 + 158 * Math.cos(a)}" y1="${200 + 158 * Math.sin(a)}" x2="${200 + r2 * Math.cos(a)}" y2="${200 + r2 * Math.sin(a)}" stroke="${k > 24 ? "#E1080C" : "#fff"}" stroke-width="${k % 5 ? 3 : 6}"/>`; }).join("")}
  ${[0, 10, 20, 30, 40, 50, 60].map((v, k) => { const a = (-225 + k * 45) * Math.PI / 180; return `<text x="${200 + 100 * Math.cos(a)}" y="${210 + 100 * Math.sin(a)}" text-anchor="middle" font-family="Barlow C" font-weight="700" font-size="28" fill="rgba(255,255,255,.75)">${v}</text>`; }).join("")}
  <line x1="200" y1="200" x2="${200 + 150 * Math.cos((-225 + 32 * 4.5) * Math.PI / 180)}" y2="${200 + 150 * Math.sin((-225 + 32 * 4.5) * Math.PI / 180)}" stroke="#E1080C" stroke-width="9" stroke-linecap="round"/>
  <circle cx="200" cy="200" r="20" fill="#E1080C"/>
  <text x="200" y="320" text-anchor="middle" font-family="JBM" font-size="24" fill="rgba(255,255,255,.6)">PSI</text>
</svg>`;

const step = ({ i, k, title, art, when, how, warn }) => page("bg-ink grain", `
  <div class="grid"></div>
  ${logo("light")}${counter(i, N)}
  <div class="abs num" style="right:30px;top:120px;font-size:360px;font-style:italic;font-weight:900;color:transparent;-webkit-text-stroke:3px rgba(255,255,255,.12);z-index:1">0${i - 1}</div>
  <div class="abs z" style="left:56px;top:168px;right:56px"><div class="kicker">${k}</div><div class="h-m" style="margin-top:22px">${title}</div></div>
  <div class="abs z" style="left:0;right:0;top:390px;height:470px;display:flex;align-items:center;justify-content:center">${art}</div>
  <div class="abs z" style="left:56px;right:56px;top:890px;display:grid;grid-template-columns:1fr 1fr;gap:26px">
    <div><div class="chip w">Cuándo</div><div style="font-size:24px;line-height:1.38;margin-top:14px">${when}</div></div>
    <div><div class="chip r">Cómo</div><div style="font-size:24px;line-height:1.38;margin-top:14px">${how}</div></div>
  </div>
  <div class="abs z" style="left:56px;right:56px;bottom:56px;display:flex;gap:18px;align-items:center;background:rgba(225,8,12,.12);border:1px solid rgba(225,8,12,.55);border-radius:14px;padding:20px 24px">
    <span class="num" style="font-size:46px;color:var(--red)">!</span><span style="font-size:23px;line-height:1.36">${warn}</span>
  </div>
`);

export default {
  id: "20-revision-de-niveles",
  title: "Revisa tu auto en 5 minutos",
  slides: [
    page("bg-red grain", `
    <div class="speed" style="inset:0;opacity:.45"></div>
    ${logo("light")}${counter(1, N)}
    <div class="abs z" style="left:56px;top:170px;right:56px">
      <div class="kicker">Mantención básica</div>
      <div class="h-xl" style="margin-top:26px;font-size:112px">5 minutos<br><span style="color:var(--ink)">que te ahorran<br>millones</span></div>
      <div class="lead" style="margin-top:34px;font-weight:600;max-width:860px">La revisión que puedes hacer tú mismo en el estacionamiento.</div>
    </div>
    <div class="abs z" style="left:56px;right:56px;top:1000px;display:flex;gap:12px;flex-wrap:wrap">
      ${["Aceite", "Refrigerante", "Frenos", "Neumáticos"].map((t, k) => `<span class="chip k" style="font-size:22px;padding:14px 18px">0${k + 1} · ${t}</span>`).join("")}
    </div>
    ${swipe("DESLIZA", "#fff")}
    `),
    step({
      i: 2, k: "Paso 01", title: `Aceite de <span class="red">motor</span>`, art: dipstick,
      when: "Cada dos semanas y antes de un viaje largo.",
      how: "Auto en plano, motor apagado 5 min. Saca, limpia, vuelve a meter y lee.",
      warn: "Si baja seguido entre cambios, tu motor está consumiendo aceite: no es normal, revísalo.",
    }),
    step({
      i: 3, k: "Paso 02", title: `<span class="red">Refrigerante</span>`, art: tank("COOLANT", "c", "#19C37D", 0.6),
      when: "Una vez al mes, siempre con el motor frío.",
      how: "Mira el depósito de expansión: el nivel debe estar entre MIN y MAX.",
      warn: "Nunca abras la tapa con el motor caliente: el líquido sale a presión y quema.",
    }),
    step({
      i: 4, k: "Paso 03", title: `Líquido de <span class="red">frenos</span>`, art: tank("DOT 4", "b", "#d9b24a", 0.62),
      when: "Una vez al mes. Cámbialo cada 2 años o según tu manual.",
      how: "Revisa el depósito sin abrirlo: entre MIN y MAX, color claro.",
      warn: "Absorbe humedad con el tiempo y frena peor. Si baja, puede haber fuga o pastillas gastadas.",
    }),
    step({
      i: 5, k: "Paso 04", title: `Presión de <span class="red">neumáticos</span>`, art: gauge,
      when: "Cada dos semanas, con los neumáticos fríos.",
      how: "La presión correcta está en la etiqueta del marco de la puerta del conductor o en la tapa del estanque.",
      warn: "Un neumático bajo gasta más combustible, se calienta y se desgasta por los bordes.",
    }),
    page("bg-paper grain", `
    <div class="grid"></div>
    ${logo("dark")}${counter(6, N)}
    <div class="abs z" style="left:56px;top:168px;right:56px;color:var(--ink)"><div class="kicker">Resumen</div><div class="h-m" style="margin-top:22px">Pégalo en tu<br><span class="red">guantera</span></div></div>
    <div class="abs z" style="left:56px;right:56px;top:440px;background:var(--ink);color:#fff;border-radius:22px;padding:10px 34px">
      ${[["Aceite", "Cada 2 semanas", "Motor tibio y en plano"], ["Refrigerante", "Mensual", "Siempre en frío"], ["Líquido de frenos", "Mensual", "Cambio cada 2 años"], ["Neumáticos", "Cada 2 semanas", "Presión en frío"], ["Plumillas", "Cada 6–12 meses", "Si dejan franjas, cámbialas"]].map(([a, b, c], k) => `
        <div style="display:grid;grid-template-columns:1.1fr 1fr 1.2fr;gap:18px;align-items:center;padding:28px 0;${k ? "border-top:1px solid rgba(255,255,255,.12)" : ""}">
          <div style="font-family:Archivo;font-stretch:115%;font-weight:900;font-style:italic;font-size:30px;text-transform:uppercase">${a}</div>
          <div class="num" style="font-size:36px;color:var(--red)">${b}</div>
          <div style="font-size:22px;opacity:.8">${c}</div>
        </div>`).join("")}
    </div>
    <div class="abs z" style="left:56px;right:56px;bottom:56px;display:flex;justify-content:space-between;align-items:center;color:var(--ink)">
      <div style="font-size:24px;font-weight:700">Las frecuencias de tu manual siempre mandan.</div>
      <div class="chip r" style="font-size:22px;padding:16px 22px">Guárdalo ↓</div>
    </div>
    `),
  ],
};
