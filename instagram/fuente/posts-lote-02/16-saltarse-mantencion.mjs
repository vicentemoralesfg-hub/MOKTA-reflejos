import { page, logo, counter, swipe } from "../lib.mjs";
import { head, cost, ttl, label } from "../lib2.mjs";

const N = 7;

const step = (i, item, keep, breaks, ref, mCost, rCost) => page("bg-ink grain", `
  <div class="grid"></div>
  ${logo("light")}${counter(i, N)}
  <div class="abs z" style="left:56px;top:168px;right:56px">
    <div class="kicker">Te saltas</div>
    <div class="h-m" style="margin-top:22px">${item}</div>
  </div>
  <div class="abs z" style="left:56px;right:56px;top:410px;display:grid;grid-template-columns:1fr 1.2fr;grid-auto-rows:600px;gap:22px">
    <div class="card" style="padding:36px">
      ${label("Mantención")}
      <div style="margin-top:16px">${cost(mCost, { size: 76, on: "#fff" })}</div>
      <div style="font-size:28px;line-height:1.42;margin-top:22px;opacity:.9">${keep}</div>
    </div>
    <div style="padding:36px;border-radius:18px;background:var(--red)">
      ${label("Reparación si fallas", "opacity:.85")}
      <div style="margin-top:16px">${cost(rCost, { size: 76, on: "#fff", off: "rgba(0,0,0,.25)" })}</div>
      <ul style="font-size:27px;line-height:1.5;margin-top:22px;padding-left:28px">${breaks.map((b) => `<li>${b}</li>`).join("")}</ul>
    </div>
  </div>
  <div class="abs z" style="left:56px;right:56px;bottom:56px;display:grid;grid-template-columns:auto 1fr;gap:22px;align-items:center;border-top:2px solid rgba(255,255,255,.15);padding-top:26px">
    <div class="chip w" style="font-size:18px">Cada cuánto</div>
    <div style="font-size:25px;line-height:1.38">${ref}</div>
  </div>
`);

export default {
  id: "16-lo-que-se-rompe-sin-mantencion",
  title: "Lo que se rompe cuando te saltas la mantención",
  slides: [
    page("bg-red grain", `
    <div class="speed" style="inset:0;opacity:.45"></div>
    ${logo("light")}${counter(1, N)}
    <div class="abs z" style="left:56px;right:56px;top:180px">
      <div class="kicker">Mantención</div>
      <div class="h-xl" style="margin-top:26px;font-size:92px">“Ahorrarte”<br><span style="color:var(--ink)">una mantención</span><br>sale caro</div>
    </div>
    <div class="abs z" style="left:56px;right:56px;top:690px;background:var(--ink);border-radius:22px;padding:40px 36px;display:grid;grid-template-columns:1fr 1fr;gap:20px;align-items:center">
      <div>${label("Mantención a tiempo")}<div style="margin-top:8px">${cost(1, { size: 64, on: "#fff" })}</div></div>
      <div>${label("Reparación por olvido")}<div style="margin-top:8px">${cost(5, { size: 64 })}</div></div>
    </div>
    <div class="abs z lead" style="left:56px;top:960px;font-weight:700;font-size:36px;max-width:700px">5 mantenciones que nunca debes postergar.</div>
    ${swipe("DESLIZA", "#fff")}
    `),
    step(2, `Cambio de <span class="red">aceite</span>`,
      "Aceite y filtro nuevos: el motor queda lubricado y protegido.",
      ["Lodo que tapa conductos", "Desgaste de metales y levas", "Turbo sin lubricación", "Cadena que se estira"],
      "Cada 5.000 a 15.000 km o una vez al año, según tu manual y si haces uso severo.", 1, 5),
    step(3, `Correa de <span class="red">distribución</span>`,
      "Correa, tensor y poleas nuevos (y casi siempre la bomba de agua).",
      ["Si se corta: válvulas dobladas", "Pistones y culata dañados", "El auto queda detenido en el acto"],
      "Según tu manual: un kilometraje o una cantidad de años, lo que ocurra primero.", 2, 5),
    step(4, `Cambio de <span class="red">refrigerante</span>`,
      "Líquido nuevo con sus aditivos que evitan la corrosión.",
      ["Radiador y conductos tapados", "Bomba de agua dañada", "Sobrecalentamiento", "Empaquetadura de culata quemada"],
      "Entre 2 y 5 años según el tipo de refrigerante. Revisa el nivel cada mes, en frío.", 1, 4),
    step(5, `Líquido de <span class="red">frenos</span>`,
      "Líquido nuevo sin humedad: el pedal responde firme.",
      ["Hierve antes en bajadas largas", "Pedal esponjoso o que se va al fondo", "Corrosión en cilindros y módulo ABS"],
      "Normalmente cada 2 años, aunque el nivel esté bien: absorbe humedad del aire.", 1, 4),
    step(6, `Filtro de <span class="red">petróleo</span>`,
      "Filtro nuevo y separador de agua drenado.",
      ["Agua y suciedad llegan a los inyectores", "Bomba de alta presión dañada", "Tirones, humo y pérdida de fuerza"],
      "Según tu manual. Si tu camioneta tiene separador de agua, drénalo cuando lo indique el testigo.", 1, 5),
    page("bg-paper grain", `
    <div class="grid"></div>
    ${head(7, N, "Resumen", `Lo barato <span class="red">vs lo caro</span>`, { dark: true })}
    <div class="abs z" style="left:56px;right:56px;top:420px;background:var(--ink);color:#fff;border-radius:22px;padding:14px 34px">
      <div style="display:grid;grid-template-columns:1.3fr 1fr 1fr;gap:18px;padding:14px 0">${label("Ítem")}${label("Mantención")}${label("Si fallas")}</div>
      ${[["Aceite", 1, 5], ["Correa", 2, 5], ["Refrigerante", 1, 4], ["Líquido de frenos", 1, 4], ["Filtro de petróleo", 1, 5]].map(([a, m, r]) => `
        <div style="display:grid;grid-template-columns:1.3fr 1fr 1fr;gap:18px;align-items:center;padding:36px 0;border-top:1px solid rgba(255,255,255,.12)">
          ${ttl(a, 28)}<div>${cost(m, { size: 36, on: "#fff" })}</div><div>${cost(r, { size: 36 })}</div>
        </div>`).join("")}
    </div>
    <div class="abs z" style="left:56px;right:56px;bottom:56px;display:flex;justify-content:space-between;align-items:center;color:var(--ink)">
      <div style="font-size:24px;font-weight:700;max-width:640px">Escala relativa de costo. El plan de tu manual siempre manda.</div>
      <div class="chip r" style="font-size:22px;padding:16px 22px">Guárdalo ↓</div>
    </div>
    `),
  ],
};
