import { page, logo, counter, swipe, A } from "../lib.mjs";
import { issue, legend } from "../fallas.mjs";
import { credit } from "../credits.mjs";

const N = 4;
const head = (i, k, t) => `
  ${logo("light")}${counter(i, N)}
  <div class="abs z" style="left:56px;top:168px;right:56px"><div class="kicker">${k}</div><div class="h-m" style="margin-top:22px">${t}</div></div>`;

const check = (t, d) => `
  <div style="display:grid;grid-template-columns:56px 1fr;gap:20px;align-items:start;padding:20px 0;border-top:1px solid rgba(255,255,255,.12)">
    <div style="width:46px;height:46px;border:3px solid var(--red);border-radius:8px;display:grid;place-items:center;transform:skewX(-8deg)">
      <svg width="26" height="22" viewBox="0 0 26 22"><path d="M2 12l7 7L24 3" fill="none" stroke="#fff" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/></svg></div>
    <div><div style="font-family:Archivo;font-stretch:112%;font-weight:900;font-style:italic;font-size:27px;text-transform:uppercase">${t}</div>
    <div style="font-size:22px;line-height:1.36;margin-top:6px;opacity:.8">${d}</div></div>
  </div>`;

export default {
  id: "11-ford-ranger-32-usada",
  title: "Ford Ranger 3.2 usada: qué revisar",
  slides: [
    page("bg-ink grain", `
    <div class="grid major"></div>
    <div class="abs" style="left:-100px;right:-100px;top:620px;height:330px;background:var(--red);transform:skewY(-6deg);z-index:1"></div>
    <div class="abs" style="left:-100px;right:-100px;top:620px;height:330px;transform:skewY(-6deg);z-index:1;background:repeating-linear-gradient(-62deg, rgba(255,255,255,.1) 0 2px, transparent 2px 26px)"></div>
    ${logo("light")}${counter(1, N)}
    <div class="abs z" style="left:56px;top:170px;right:56px">
      <div class="kicker">Guía de compra · Usados</div>
      <div class="h-xl" style="margin-top:24px;font-size:122px">Ranger 3.2<br><span class="red">usada</span></div>
    </div>
    <img class="car" src="${A("cut/rangerpx.png")}" style="left:40px;top:450px;width:1000px;z-index:6">
    <div class="abs z" style="left:56px;right:56px;top:1040px">
      <div class="lead" style="font-size:36px;font-weight:700">Lo que debes revisar antes de pagar.</div>
      <div style="display:flex;gap:10px;margin-top:20px"><span class="chip w">Motor 3.2 TDCi · 5 cil.</span><span class="chip o">PX · 2012 – 2022</span></div>
    </div>
    ${swipe()}
    <div class="abs mono" style="left:56px;bottom:24px;font-size:12.5px;opacity:.4;z-index:40">${credit("rangerpx")}</div>
    `),
    page("bg-ink grain", `
    <div class="grid"></div>
    ${head(2, "Motor 3.2 TDCi", `Lo que más<br><span class="red">duele</span>`)}
    <div class="abs z" style="left:56px;right:56px;top:410px">${legend(true)}
      ${issue("01", "rep", "Bomba de aceite", "La bomba original de paletas es su punto débil más caro: si pierde presión, daña metales y cigüeñal. Muchos especialistas la reemplazan por una de engranajes.", true)}
      ${issue("02", "rep", "Enfriador EGR", "Se fisura y el motor “se toma” el refrigerante: el nivel baja sin fugas visibles y puede salir humo blanco.", true)}
      ${issue("03", "wear", "Embrague y volante bimasa", "En cajas manuales: vibración al soltar el embrague o ruido metálico en ralentí.", true)}
    </div>
    <div class="abs z" style="left:56px;right:56px;bottom:56px;display:flex;gap:16px;align-items:center;background:rgba(225,8,12,.12);border:1px solid rgba(225,8,12,.5);border-radius:14px;padding:18px 22px">
      <span class="num" style="font-size:44px;color:var(--red)">!</span>
      <span style="font-size:22px;line-height:1.35">Luz de presión de aceite encendida, aunque sea un segundo en marcha: <b>no la compres sin diagnóstico.</b></span>
    </div>
    `),
    page("bg-ink grain", `
    <div class="grid"></div>
    ${head(3, "Combustible y emisiones", `Inyección y<br><span class="red">emisiones</span>`)}
    <img class="car" src="${A("cut/ranger.png")}" style="right:-30px;top:330px;width:560px;opacity:.95">
    <div class="abs z" style="left:56px;right:56px;top:640px">${legend(true)}
      ${issue("01", "rep", "Inyectores", "Ralentí irregular, arranque difícil o humo negro. Revisa el retorno de los inyectores con un escáner.", true)}
      ${issue("02", "wear", "Filtro de partículas (DPF)", "En versiones que lo tienen, se tapa con uso solo urbano: necesita carretera para regenerar.", true)}
      ${issue("03", "wear", "Turbo", "Silbido fuerte o humo azul. Un aceite mal mantenido lo acorta.", true)}
    </div>
    <div class="abs mono" style="left:56px;bottom:24px;font-size:12.5px;opacity:.4;z-index:40">${credit("ranger")}</div>
    `),
    page("bg-red grain", `
    <div class="speed" style="inset:0;opacity:.45"></div>
    ${logo("light")}${counter(4, N)}
    <div class="abs z" style="left:56px;top:168px;right:56px"><div class="kicker">Checklist</div><div class="h-m" style="margin-top:22px">Antes de firmar,<br><span style="color:var(--ink)">revisa esto</span></div></div>
    <div class="abs z" style="left:56px;right:56px;top:440px;background:var(--ink);border-radius:22px;padding:6px 32px 10px">
      ${check("Arranque en frío", "Pide que no la enciendan antes de tu visita. Fíjate en humo y ruidos.")}
      ${check("Refrigerante", "Marca el nivel y revísalo después de la prueba de manejo.")}
      ${check("Escáner", "Códigos guardados de EGR, inyectores, DPF o presión de aceite.")}
      ${check("Historial", "Cambios de aceite a tiempo y con la especificación correcta.")}
      ${check("Prueba con subida", "Tirones, pérdida de fuerza o humo bajo carga.")}
    </div>
    <div class="abs z" style="left:56px;right:56px;bottom:56px;display:flex;justify-content:space-between;align-items:center">
      <div style="font-size:25px;font-weight:700">Guárdalo para tu próxima visita.</div>
      <div class="chip k" style="font-size:22px;padding:16px 22px">Guardar ↓</div>
    </div>
    `),
  ],
};
