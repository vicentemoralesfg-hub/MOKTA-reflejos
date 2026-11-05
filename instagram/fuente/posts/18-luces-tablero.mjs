import { page, logo, counter, swipe } from "../lib.mjs";
import { ICON } from "../icons.mjs";

const N = 5;
const C = { r: "#FF2A1F", a: "#FFB000", g: "#19C37D", b: "#3D8BFF" };
const lit = (svg, c) => `<div style="filter:drop-shadow(0 0 10px ${c}) drop-shadow(0 0 26px ${c}88)">${svg}</div>`;

const item = (ic, c, name, what, todo) => `
  <div style="display:grid;grid-template-columns:150px 1fr;gap:26px;align-items:center;padding:33px 0;border-top:1px solid rgba(255,255,255,.1)">
    <div style="width:150px;height:130px;border-radius:20px;background:#050506;border:1px solid rgba(255,255,255,.08);display:grid;place-items:center;box-shadow:inset 0 0 40px ${c}22">${lit(ICON[ic](c, 96), c)}</div>
    <div>
      <div style="font-family:Archivo;font-stretch:118%;font-weight:900;font-style:italic;font-size:35px;text-transform:uppercase;letter-spacing:-.005em">${name}</div>
      <div style="font-size:24px;line-height:1.35;margin-top:8px;opacity:.75">${what}</div>
      <div style="font-size:25px;line-height:1.35;margin-top:6px;font-weight:650;color:${c}">→ ${todo}</div>
    </div>
  </div>`;

const head = (i, color, label, title) => `
  ${logo("light")}${counter(i, N)}
  <div class="abs z" style="left:56px;top:160px;right:56px">
    <div style="display:flex;align-items:center;gap:18px"><span style="width:26px;height:26px;border-radius:50%;background:${color};box-shadow:0 0 18px ${color}, 0 0 40px ${color}"></span>
      <span style="font-family:Archivo;font-stretch:125%;font-weight:700;font-size:20px;letter-spacing:.42em;text-transform:uppercase">${label}</span></div>
    <div class="h-m" style="margin-top:22px">${title}</div>
  </div>`;

export default {
  id: "18-luces-del-tablero",
  title: "Luces del tablero: qué significan",
  slides: [
    page("bg-ink grain", `
    ${logo("light")}${counter(1, N)}
    <svg class="abs" style="left:90px;top:150px" width="900" height="560" viewBox="0 0 900 560">
      <path d="M90 520 A 360 360 0 1 1 810 520" fill="none" stroke="rgba(255,255,255,.08)" stroke-width="40"/>
      <path d="M90 520 A 360 360 0 0 1 640 210" fill="none" stroke="url(#gg)" stroke-width="40"/>
      <defs><linearGradient id="gg" x1="0" x2="1"><stop offset="0" stop-color="#E1080C" stop-opacity=".1"/><stop offset="1" stop-color="#E1080C"/></linearGradient></defs>
      ${Array.from({ length: 41 }, (_, k) => { const a = Math.PI + (k / 40) * Math.PI; const r1 = 312, r2 = k % 5 ? 296 : 270; return `<line x1="${450 + r1 * Math.cos(a)}" y1="${520 + r1 * Math.sin(a)}" x2="${450 + r2 * Math.cos(a)}" y2="${520 + r2 * Math.sin(a)}" stroke="rgba(255,255,255,${k % 5 ? .25 : .7})" stroke-width="${k % 5 ? 3 : 5}"/>`; }).join("")}
      <line x1="450" y1="520" x2="${450 + 250 * Math.cos(Math.PI * 1.72)}" y2="${520 + 250 * Math.sin(Math.PI * 1.72)}" stroke="#E1080C" stroke-width="10" stroke-linecap="round"/>
      <circle cx="450" cy="520" r="22" fill="#E1080C"/>
    </svg>
    <div class="abs z" style="left:0;right:0;top:470px;display:flex;justify-content:center;gap:34px">
      ${lit(ICON.oil(C.r, 92), C.r)}${lit(ICON.temp(C.r, 92), C.r)}${lit(ICON.engine(C.a, 92), C.a)}${lit(ICON.abs(C.a, 92), C.a)}${lit(ICON.high(C.b, 92), C.b)}
    </div>
    <div class="abs z" style="left:56px;right:56px;top:740px">
      <div class="kicker">Guía rápida · Tablero</div>
      <div class="h-l" style="margin-top:24px;font-size:96px">¿Se prendió<br>una luz?<br><span class="red">No la ignores.</span></div>
      <div class="lead" style="margin-top:26px">El color te dice la urgencia.</div>
    </div>
    ${swipe()}
    `),
    page("bg-ink grain", `
    <div class="abs" style="inset:0;background:radial-gradient(800px 500px at 100% 0%, rgba(255,42,31,.18), transparent 70%)"></div>
    ${head(2, C.r, "Rojo", `Detente donde<br>sea <span style="color:${C.r}">seguro</span>`)}
    <div class="abs z" style="left:56px;right:56px;top:395px">
      ${item("oil", C.r, "Presión de aceite", "El motor no está lubricando bien.", "Apaga el motor de inmediato y revisa el nivel.")}
      ${item("temp", C.r, "Temperatura", "El motor se está sobrecalentando.", "Detente. Nunca abras el radiador en caliente.")}
      ${item("battery", C.r, "Carga / batería", "El alternador no está cargando.", "Te quedan minutos de batería: ve al taller.")}
      ${item("brake", C.r, "Sistema de frenos", "Freno de mano puesto o líquido bajo.", "Si no es el freno de mano, no sigas manejando.")}
    </div>
    `),
    page("bg-ink grain", `
    <div class="abs" style="inset:0;background:radial-gradient(800px 500px at 100% 0%, rgba(255,176,0,.14), transparent 70%)"></div>
    ${head(3, C.a, "Amarillo", `Revisa <span style="color:${C.a}">pronto</span>`)}
    <div class="abs z" style="left:56px;right:56px;top:395px">
      ${item("engine", C.a, "Check engine fijo", "Falla de motor o emisiones registrada.", "Escanea el código en los próximos días.")}
      ${item("engine", C.r, "Check engine parpadeando", "Falla de encendido grave: puede dañar el catalizador.", "Baja la velocidad y ve al taller ya.")}
      ${item("abs", C.a, "ABS", "Frenas, pero sin sistema antibloqueo.", "Maneja con más distancia y revísalo.")}
      ${item("tpms", C.a, "Presión de neumáticos", "Uno o más neumáticos bajos de presión.", "Revisa y calibra en frío.")}
    </div>
    `),
    page("bg-ink grain", `
    <div class="abs" style="inset:0;background:radial-gradient(800px 500px at 100% 0%, rgba(61,139,255,.16), transparent 70%)"></div>
    ${head(4, C.g, "Verde y azul", `Solo te <span style="color:${C.g}">informan</span>`)}
    <div class="abs z" style="left:56px;right:56px;top:395px">
      ${item("high", C.b, "Luces altas", "Las únicas en azul. Encandilan a otros.", "Bájalas cuando venga alguien de frente.")}
      ${item("low", C.g, "Luces bajas", "Encendidas y funcionando.", "En carretera, úsalas también de día.")}
      ${item("cruise", C.g, "Control crucero", "Velocidad fijada y activa.", "Desactívalo con lluvia o tráfico denso.")}
      ${item("turn", C.g, "Intermitentes", "Señalizando giro o cambio de pista.", "Si parpadea rápido: hay una ampolleta quemada.")}
    </div>
    `),
    page("bg-red grain", `
    <div class="speed" style="inset:0;opacity:.5"></div>
    ${logo("light")}${counter(5, N)}
    <div class="abs z" style="left:56px;top:168px;right:56px">
      <div class="kicker">La regla de oro</div>
      <div class="h-l" style="margin-top:22px;font-size:104px">Piensa en un<br><span style="color:var(--ink)">semáforo</span></div>
    </div>
    <div class="abs z" style="left:56px;right:56px;top:560px;background:var(--ink);border-radius:22px;padding:14px 36px">
      ${[[C.r, "Rojo", "Detente donde sea seguro."], [C.a, "Amarillo", "Agenda revisión pronto."], [C.g, "Verde / azul", "Solo te informa."]].map(([c, a, b], k) => `
        <div style="display:grid;grid-template-columns:90px 1fr;align-items:center;gap:26px;padding:30px 0;${k ? "border-top:1px solid rgba(255,255,255,.12)" : ""}">
          <span style="width:78px;height:78px;border-radius:50%;background:${c};box-shadow:0 0 24px ${c}, 0 0 60px ${c}88"></span>
          <div><div style="font-family:Archivo;font-stretch:118%;font-weight:900;font-style:italic;font-size:40px;text-transform:uppercase">${a}</div><div style="font-size:27px;opacity:.85;margin-top:4px">${b}</div></div>
        </div>`).join("")}
    </div>
    <div class="abs z" style="left:56px;right:56px;top:1120px;display:flex;align-items:center;justify-content:space-between;gap:24px">
      <div style="font-size:26px;line-height:1.35;font-weight:600;max-width:640px">Los íconos varían según la marca: el manual de tu auto manda.</div>
      <div class="chip k" style="font-size:22px;padding:16px 22px">Guárdalo ↓</div>
    </div>
    `),
  ],
};
