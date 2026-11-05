import { page, logo, counter, swipe, A } from "../lib.mjs";
import { table, vsBadge } from "../vs.mjs";
import { single } from "../compare.mjs";
import { credit } from "../credits.mjs";
import { ttl, card } from "../lib2.mjs";

const N = 3;
const cr = `<div class="abs mono" style="left:56px;bottom:22px;font-size:12.5px;opacity:.45;z-index:40">${credit("raptor", "ramrho")}</div>`;

const raptor = {
  id: "07-ford-f150-raptor-vs-ram-1500-rho",
  title: "Ford F-150 Raptor vs RAM 1500 RHO",
  slides: [
    page("bg-ink grain", `
    <div class="abs" style="inset:0;z-index:0;background:var(--red);clip-path:polygon(60% 0,100% 0,100% 100%,36% 100%)"></div>
    <div class="abs" style="inset:0;z-index:0;background:repeating-linear-gradient(-62deg, rgba(255,255,255,.08) 0 2px, transparent 2px 26px);clip-path:polygon(60% 0,100% 0,100% 100%,36% 100%)"></div>
    ${logo("light")}${counter(1, N).replace("<b>", '<b style="color:#fff">')}
    <div class="abs z" style="left:56px;top:170px;right:56px">
      <div class="kicker">Duelo de monstruos</div>
      <div class="h-xl" style="margin-top:24px;font-size:124px">Raptor</div>
      <div class="h-xl" style="font-size:124px;text-align:right">RAM RHO</div>
    </div>
    <img class="car" src="${A("cut/raptor.png")}" style="left:-40px;top:520px;width:700px">
    <img class="car" src="${A("cut/ramrho.png")}" style="right:-60px;top:720px;width:740px;z-index:7">
    ${vsBadge(470, 540, 140)}
    <div class="abs z" style="left:56px;top:1170px;width:560px;font-size:28px;line-height:1.3;font-weight:600">Las pickups más bravas que puedes comprar en Chile.</div>
    ${swipe()}
    ${cr}
    `),
    page("bg-ink grain", `
    <div class="grid"></div>
    ${logo("light")}${counter(2, N)}
    <div class="abs z" style="left:56px;top:168px;right:56px"><div class="kicker">Los números</div><div class="h-m" style="margin-top:22px">Ficha <span class="red">técnica</span></div></div>
    <img class="car" src="${A("cut/raptor.png")}" style="left:30px;top:360px;width:470px">
    <img class="car" src="${A("cut/ramrho.png")}" style="right:30px;top:380px;width:480px">
    ${table([
      ["Motor", "3.5 V6", "3.0 6 en línea"],
      ["Turbos", "2", "2"],
      ["Potencia", "456 hp", "540 hp", "b"],
      ["Torque", "691 Nm", "706 Nm*", "b"],
      ["Caja", "Auto. 10 vel.", "Auto. 8 vel."],
      ["Amortiguadores", "FOX Live Valve", "Bilstein e2"],
    ], "F-150 Raptor", "RAM 1500 RHO", "position:absolute;left:56px;right:56px;top:690px;z-index:10")}
    <div class="abs z mono" style="left:56px;right:56px;top:1150px;font-size:16px;opacity:.6;line-height:1.5">*Torque de ficha internacional (521 lb-pie). Raptor: ficha Chile. Ambas a bencina, 4x4.</div>
    ${cr}
    `),
    page("bg-red grain", `
    <div class="speed" style="inset:0;opacity:.45"></div>
    ${logo("light")}${counter(3, N)}
    <div class="abs z" style="left:56px;top:168px;right:56px"><div class="kicker">Veredicto MOKTA</div><div class="h-l" style="margin-top:22px;font-size:96px">Fuerza bruta<br><span style="color:var(--ink)">vs leyenda</span></div></div>
    <div class="abs z" style="left:56px;right:56px;top:500px;display:grid;grid-template-columns:1fr 1fr;gap:22px">
      <div style="background:var(--ink);border-radius:22px;padding:34px 32px;min-height:420px">
        ${ttl("F-150 Raptor", 42)}
        <ul style="margin-top:20px;padding-left:26px;font-size:25px;line-height:1.55"><li>La que creó el segmento (desde 2010).</li><li>V6 biturbo con caja de 10 marchas.</li><li>Amortiguadores FOX con ajuste electrónico.</li></ul>
      </div>
      <div style="background:#fff;color:var(--ink);border-radius:22px;padding:34px 32px;min-height:420px">
        ${ttl("RAM 1500 RHO", 42, "color:var(--red)")}
        <ul style="margin-top:20px;padding-left:26px;font-size:25px;line-height:1.55"><li>Más potencia y más torque.</li><li>Seis en línea biturbo: suavidad de sobra.</li><li>Amortiguadores Bilstein adaptativos.</li></ul>
      </div>
    </div>
    <div class="abs z" style="left:56px;right:56px;top:980px;font-size:26px;line-height:1.4;border-left:6px solid #fff;padding-left:22px">En números gana la RHO. En historia y comunidad, la Raptor sigue siendo la referencia.</div>
    <div class="abs z" style="left:56px;right:56px;bottom:60px;display:flex;justify-content:space-between;align-items:center">
      <div style="font-size:28px;font-weight:800">¿Con cuál te quedas? 👇</div>
      <div class="chip k" style="font-size:22px;padding:16px 22px">Comenta</div>
    </div>
    `),
  ],
};

export default [
  raptor,
  single({
    id: "08-mitsubishi-l200-vs-nissan-navara", title: "Mitsubishi L200 vs Nissan Navara",
    kicker: "Cara a cara · Pickup", nameA: "L200", nameB: "Navara", carA: "l200", carB: "navara", keys: ["l200", "navara"],
    cars: { a: { x: -30, y: 330, w: 660, fh: 360 }, b: { x: 430, y: 410, w: 670, fh: 330 }, vs: [470, 330] },
    rows: [
      ["Motor", "2.4 biturbo", "2.3 biturbo"],
      ["Potencia", "201 hp", "188 hp", "a"],
      ["Torque", "470 Nm", "450 Nm", "a"],
      ["Susp. trasera", "Hojas", "Resortes", "b"],
      ["Generación", "Desde 2024", "Desde 2014", "a"],
      ["Combustible", "Diésel", "Diésel"],
    ],
    pickA: ["L200", "quieres la generación más nueva, con más potencia y torque."],
    pickB: ["Navara", "priorizas confort: su suspensión trasera con resortes copia mejor el camino."],
    note: "Versiones diésel · fichas Chile 2025.",
  }),
  single({
    id: "09-kia-sportage-vs-hyundai-tucson", title: "Kia Sportage vs Hyundai Tucson",
    kicker: "Hermanos · SUV mediano", nameA: "Sportage", nameB: "Tucson", carA: "sportage5", carB: "tucson", keys: ["sportage5", "tucson"],
    cars: { a: { x: -20, y: 330, w: 640, fh: 340 }, b: { x: 440, y: 410, w: 650, fh: 330 }, vs: [470, 330] },
    rows: [
      ["Motor", "2.0 bencina", "2.0 bencina"],
      ["Potencia", "154 hp", "154 hp"],
      ["Torque", "192 Nm", "192 Nm"],
      ["Plataforma", "Compartida", "Compartida"],
      ["Otra versión", "Diésel 184 hp", "Híbrida 1.6 T"],
    ],
    pickA: ["Sportage", "te gusta un diseño más audaz y quieres la opción diésel."],
    pickB: ["Tucson", "prefieres un estilo más sobrio y la opción híbrida."],
    note: "Mismo motor 2.0 y misma base: la diferencia está en diseño y equipamiento.",
  }),
  single({
    id: "10-suzuki-swift-vs-kia-morning", title: "Suzuki Swift vs Kia Morning",
    kicker: "Cara a cara · Citycar", nameA: "Swift", nameB: "Morning", carA: "swift", carB: "picanto", keys: ["swift", "picanto"],
    cars: { a: { x: -10, y: 330, w: 630, fh: 330 }, b: { x: 460, y: 420, w: 630, fh: 320 }, vs: [470, 330] },
    rows: [
      ["Motor", "1.2 · 3 cil.", "1.2 · 4 cil."],
      ["Potencia", "80 hp", "83 hp", "b"],
      ["Torque", "112 Nm", "121 Nm", "b"],
      ["Caja auto.", "CVT", "Auto. 4 vel.", "a"],
      ["Tecnología", "Mild hybrid", "Convencional", "a"],
    ],
    pickA: ["Swift", "quieres la generación más nueva y tecnología mild hybrid."],
    pickB: ["Morning", "prefieres un poco más de fuerza y la simpleza de un 4 cilindros."],
    note: "Versiones 1.2 · fichas Chile 2025.",
  }),
];
