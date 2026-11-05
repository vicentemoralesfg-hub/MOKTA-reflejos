import { page, logo, counter, swipe, A } from "../lib.mjs";
import { yn, ttl, label, credLine } from "../lib2.mjs";
import { credit } from "../credits.mjs";

const N = 6;

const type = (i, code, name, car, carW, batt, battTxt, plug, ev, range, pro, con, ex) => page("bg-ink grain", `
  <div class="grid"></div>
  ${logo("light")}${counter(i, N)}
  <div class="abs num" style="right:40px;top:120px;font-size:250px;font-style:italic;font-weight:900;color:transparent;-webkit-text-stroke:3px rgba(255,255,255,.14);z-index:1">${code}</div>
  <div class="abs z" style="left:56px;top:168px;right:56px"><div class="kicker">${code}</div><div class="h-m" style="margin-top:22px">${name}</div></div>
  <div class="shadow-floor" style="left:${(1080 - carW) / 2 + 60}px;width:${carW - 120}px;top:640px"></div>
  <img class="car" src="${A("cut/" + car + ".png")}" style="left:${(1080 - carW) / 2}px;top:370px;width:${carW}px">
  <div class="abs z card" style="left:56px;right:56px;top:720px;padding:24px 30px;display:grid;gap:16px">
    <div style="display:grid;grid-template-columns:220px 1fr 200px;gap:18px;align-items:center">
      ${label("Batería")}<div class="bar" style="height:22px"><i style="width:${batt}%"></i></div><div class="num" style="font-size:34px;text-align:right">${battTxt}</div>
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:18px;border-top:1px solid rgba(255,255,255,.1);padding-top:16px">
      <div style="display:flex;gap:12px;align-items:center">${yn(plug)}<span style="font-size:21px">Se enchufa</span></div>
      <div style="display:flex;gap:12px;align-items:center">${yn(ev)}<span style="font-size:21px">Anda solo en eléctrico</span></div>
      <div style="display:flex;gap:12px;align-items:center"><span class="num" style="font-size:30px;color:var(--red)">${range}</span><span style="font-size:19px;opacity:.75">eléctrico</span></div>
    </div>
  </div>
  <div class="abs z" style="left:56px;right:56px;top:985px;display:grid;grid-template-columns:1fr 1fr 1fr;gap:24px">
    <div><div class="chip r">+ A favor</div><div style="margin-top:12px;font-size:22px;line-height:1.36">${pro}</div></div>
    <div><div class="chip w">− En contra</div><div style="margin-top:12px;font-size:22px;line-height:1.36">${con}</div></div>
    <div><div class="chip o">Ejemplo</div><div style="margin-top:12px;font-size:22px;line-height:1.36">${ex}</div></div>
  </div>
  ${credLine(credit(car))}
`);

export default {
  id: "02-hibridos-y-electricos",
  title: "Mild hybrid, híbrido, enchufable o eléctrico",
  slides: [
    page("bg-ink grain", `
    <div class="grid major"></div>
    ${logo("light")}${counter(1, N)}
    <div class="abs z" style="left:56px;top:170px;right:56px">
      <div class="kicker">Electrificación sin enredos</div>
      <div class="h-xl" style="margin-top:26px;font-size:112px">MHEV · HEV<br><span class="red">PHEV · BEV</span></div>
      <div class="lead" style="margin-top:28px;max-width:900px">Todos dicen “híbrido”, pero no son lo mismo. Te explicamos cuál es cuál.</div>
    </div>
    <div class="abs" style="left:56px;right:56px;top:720px;display:grid;grid-template-columns:repeat(4,1fr);gap:16px;align-items:end;height:400px">
      ${[[4, "MHEV"], [9, "HEV"], [32, "PHEV"], [100, "BEV"]].map(([h, t]) => `<div style="display:flex;flex-direction:column;align-items:center;gap:14px;height:100%;justify-content:flex-end">
        <div style="width:100%;height:${Math.max(h * 3.2, 14)}px;background:${t === "BEV" ? "var(--red)" : "linear-gradient(180deg,#ff3b30,#8e0006)"};border-radius:10px;box-shadow:0 0 30px rgba(225,8,12,.35)"></div>
        <div class="num" style="font-size:40px">${t}</div></div>`).join("")}
    </div>
    <div class="abs mono" style="left:56px;top:1150px;font-size:15px;opacity:.55;letter-spacing:.12em">TAMAÑO RELATIVO DE BATERÍA</div>
    ${swipe()}
    `),
    type(2, "MHEV", `Mild <span class="red">hybrid</span>`, "swift", 640, 3, "< 1 kWh", false, false, "0 km",
      "Apoya al motor al acelerar y hace más suave el Start-Stop.", "El ahorro de combustible es modesto.", "Suzuki Swift Hybrid"),
    type(3, "HEV", `Híbrido <span class="red">sin enchufe</span>`, "prius", 660, 8, "≈ 1–2 kWh", false, true, "Tramos cortos",
      "Gran ahorro en ciudad y taco, sin enchufar nunca.", "En carretera a velocidad constante, el ahorro baja.", "Toyota Prius · Corolla Cross Hybrid"),
    type(4, "PHEV", `Híbrido <span class="red">enchufable</span>`, "rav4", 660, 25, "≈ 10–25 kWh", true, true, "≈ 50–100 km",
      "El día a día en eléctrico y los viajes largos con bencina.", "Si no lo cargas, arrastras una batería pesada y gasta más.", "Toyota RAV4 PHEV"),
    type(5, "BEV", `100% <span class="red">eléctrico</span>`, "dolphin", 640, 100, "≈ 40–100 kWh", true, true, "≈ 300–600 km",
      "Cero bencina, torque instantáneo y casi sin mantención de motor.", "Tiempos de carga y planificar los viajes largos.", "BYD Dolphin"),
    page("bg-red grain", `
    <div class="speed" style="inset:0;opacity:.45"></div>
    ${logo("light")}${counter(6, N)}
    <div class="abs z" style="left:56px;top:168px;right:56px"><div class="kicker">Resumen</div><div class="h-m" style="margin-top:22px">¿Cuál es <span style="color:var(--ink)">para ti?</span></div></div>
    <div class="abs z" style="left:56px;right:56px;top:420px;background:var(--ink);border-radius:22px;padding:12px 32px">
      <div style="display:grid;grid-template-columns:150px 120px 120px 1fr;gap:16px;padding:16px 0">${label("Tipo")}${label("Enchufe")}${label("Solo eléctrico")}${label("Ideal para")}</div>
      ${[["MHEV", false, false, "Quien quiere un pequeño ahorro sin cambiar nada."], ["HEV", false, true, "Mucha ciudad y taco, sin acceso a cargador."], ["PHEV", true, true, "Trayectos diarios cortos con cargador en casa, y viajes largos."], ["BEV", true, true, "Rutina predecible y cargador en casa o en el trabajo."]].map(([t, p, e, d]) => `
        <div style="display:grid;grid-template-columns:150px 120px 120px 1fr;gap:16px;align-items:center;padding:26px 0;border-top:1px solid rgba(255,255,255,.12)">
          <div class="num" style="font-size:46px;color:var(--red);font-style:italic">${t}</div><div>${yn(p)}</div><div>${yn(e)}</div><div style="font-size:22px;line-height:1.35">${d}</div>
        </div>`).join("")}
    </div>
    <div class="abs z" style="left:56px;right:56px;bottom:56px;display:flex;justify-content:space-between;align-items:center">
      <div style="font-size:24px;font-weight:700;max-width:640px">Cifras de referencia: varían según cada modelo.</div>
      <div class="chip k" style="font-size:22px;padding:16px 22px">Guárdalo ↓</div>
    </div>
    `),
  ],
};
