import { page, logo, counter, swipe, A } from "../lib.mjs";
import { table, vsBadge } from "../vs.mjs";
import { credit } from "../credits.mjs";

const N = 4;
const cr = `<div class="abs mono" style="left:56px;bottom:24px;font-size:12.5px;opacity:.45;z-index:40">${credit("hilux", "amarok")}</div>`;

const use = (title, win, why, wcol) => `
  <div class="card" style="padding:36px 32px 40px;display:grid;gap:16px;align-content:start">
    <div class="mono" style="font-size:15px;letter-spacing:.18em;opacity:.6;text-transform:uppercase">${title}</div>
    <div style="font-family:Archivo;font-stretch:120%;font-weight:900;font-style:italic;font-size:46px;text-transform:uppercase;color:${wcol}">${win}</div>
    <div style="font-size:24px;line-height:1.38;opacity:.85">${why}</div>
  </div>`;

export default {
  id: "05-toyota-hilux-vs-vw-amarok",
  title: "Toyota Hilux vs VW Amarok V6",
  slides: [
    page("bg-ink grain", `
    <div class="abs" style="inset:0;z-index:0;background:var(--red);clip-path:polygon(58% 0,100% 0,100% 100%,38% 100%)"></div>
    <div class="abs" style="inset:0;z-index:0;background:repeating-linear-gradient(-62deg, rgba(255,255,255,.08) 0 2px, transparent 2px 26px);clip-path:polygon(58% 0,100% 0,100% 100%,38% 100%)"></div>
    ${logo("light")}${counter(1, N).replace("<b>", '<b style="color:#fff">')}
    <div class="abs z" style="left:56px;top:170px;right:56px">
      <div class="kicker">Duelo de pickups</div>
      <div class="h-xl" style="margin-top:24px;font-size:130px">Hilux</div>
      <div class="h-xl" style="font-size:130px;text-align:right">Amarok</div>
    </div>
    <img class="car" src="${A("cut/hilux.png")}" style="left:-30px;top:520px;width:720px">
    <img class="car" src="${A("cut/amarok.png")}" style="right:-50px;top:700px;width:760px;z-index:7">
    ${vsBadge(470, 520, 140)}
    <div class="abs z" style="left:56px;top:1160px;width:520px;font-size:28px;line-height:1.3;font-weight:600">El ícono de la confiabilidad contra la fuerza de un V6 diésel.</div>
    ${swipe()}
    ${cr}
    `),
    page("bg-ink grain", `
    <div class="grid"></div>
    ${logo("light")}${counter(2, N)}
    <div class="abs z" style="left:56px;top:168px;right:56px"><div class="kicker">Los números</div><div class="h-m" style="margin-top:22px">Ficha <span class="red">técnica</span></div></div>
    <img class="car" src="${A("cut/hilux.png")}" style="left:40px;top:370px;width:440px">
    <img class="car" src="${A("cut/amarok.png")}" style="right:40px;top:390px;width:450px">
    ${table([
      ["Motor", "2.8 · 4 cil.", "3.0 · V6"],
      ["Combustible", "Diésel turbo", "Diésel turbo"],
      ["Potencia", "204 CV", "258 CV", "b"],
      ["Torque", "500 Nm*", "580 Nm", "b"],
      ["Caja", "Auto. 6 vel.", "Auto. 8 vel.", "b"],
      ["Tracción", "4x4 + reductora", "4MOTION perm."],
    ], "Hilux 2.8", "Amarok V6", "position:absolute;left:56px;right:56px;top:690px;z-index:10")}
    <div class="abs z mono" style="left:56px;right:56px;top:1150px;font-size:16px;opacity:.6;line-height:1.5">*Con caja automática. Manual: 420 Nm. Cifras de fábrica, versiones 4x4 tope de línea vendidas en Chile.</div>
    ${cr}
    `),
    page("bg-ink grain", `
    <div class="grid"></div>
    ${logo("light")}${counter(3, N)}
    <div class="abs z" style="left:56px;top:168px;right:56px"><div class="kicker">Según tu uso</div><div class="h-m" style="margin-top:22px">¿Para qué<br><span class="red">la quieres?</span></div></div>
    <div class="abs z" style="left:56px;right:56px;top:450px;display:grid;grid-template-columns:1fr 1fr;gap:22px">
      ${use("Off-road duro", "Hilux", "La reductora multiplica la fuerza en barro, arena y pendientes extremas.", "#fff")}
      ${use("Carretera", "Amarok", "258 CV y 580 Nm: adelantamientos con mucho margen, incluso cargada.", "var(--red)")}
      ${use("Confort diario", "Amarok", "Caja de 8 marchas y tracción integral permanente: más suave en asfalto.", "var(--red)")}
      ${use("Reventa", "Hilux", "Históricamente, una de las pickups que mejor mantiene su valor en Chile.", "#fff")}
    </div>
    <div class="abs z" style="left:56px;right:56px;top:1150px;font-size:23px;line-height:1.38;opacity:.85">Empate técnico en algo clave: las dos son <b>pickups probadas en faena</b> con años en el mercado chileno.</div>
    `),
    page("bg-red grain", `
    <div class="speed" style="inset:0;opacity:.45"></div>
    ${logo("light")}${counter(4, N)}
    <div class="abs z" style="left:56px;top:168px;right:56px"><div class="kicker">Veredicto MOKTA</div><div class="h-l" style="margin-top:22px;font-size:92px">No hay una mejor.<br><span style="color:var(--ink)">Hay una mejor<br>para ti.</span></div></div>
    <div class="abs z" style="left:56px;right:56px;top:640px;display:grid;grid-template-columns:1fr 1fr;gap:22px">
      <div style="background:var(--ink);border-radius:20px;padding:30px">
        <div style="font-family:Archivo;font-stretch:120%;font-weight:900;font-style:italic;font-size:44px;text-transform:uppercase">Hilux</div>
        <div style="font-size:23px;line-height:1.4;margin-top:12px;opacity:.9">Trabajo pesado, caminos rurales y la tranquilidad de una red de servicio enorme.</div>
      </div>
      <div style="background:#fff;color:var(--ink);border-radius:20px;padding:30px">
        <div style="font-family:Archivo;font-stretch:120%;font-weight:900;font-style:italic;font-size:44px;text-transform:uppercase;color:var(--red)">Amarok V6</div>
        <div style="font-size:23px;line-height:1.4;margin-top:12px">Potencia, carretera y una conducción más cercana a la de un SUV.</div>
      </div>
    </div>
    <div class="abs z" style="left:56px;right:56px;top:960px;font-size:24px;line-height:1.4;border-left:6px solid #fff;padding-left:22px">¿Buscas una Hilux usada 2015–2020? Revisa antes el tema del filtro de partículas (DPF).</div>
    <div class="abs z" style="left:56px;right:56px;bottom:60px;display:flex;justify-content:space-between;align-items:center">
      <div style="font-size:28px;font-weight:800">¿Team Hilux o Team Amarok? 👇</div>
      <div class="chip k" style="font-size:22px;padding:16px 22px">Comenta</div>
    </div>
    `),
  ],
};
