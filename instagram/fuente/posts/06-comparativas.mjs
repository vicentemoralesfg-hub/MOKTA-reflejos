import { page, logo, A } from "../lib.mjs";
import { table, vsBadge } from "../vs.mjs";
import { credit } from "../credits.mjs";

/** Infografía comparativa de una sola imagen */
function single({ id, title, kicker, nameA, nameB, carA, carB, cars, rows, pickA, pickB, note, keys }) {
  return {
    id, title,
    slides: [page("bg-ink grain", `
    <div class="abs" style="inset:0 0 auto 0;height:780px;z-index:0;background:var(--red);clip-path:polygon(64% 0,100% 0,100% 100%,40% 100%)"></div>
    <div class="abs" style="inset:0 0 auto 0;height:780px;z-index:0;background:repeating-linear-gradient(-62deg, rgba(255,255,255,.08) 0 2px, transparent 2px 26px);clip-path:polygon(64% 0,100% 0,100% 100%,40% 100%)"></div>
    <div class="abs" style="left:0;right:0;top:780px;bottom:0;background:linear-gradient(180deg,#0e0e10,#0a0a0b)"></div>
    <div class="grid" style="opacity:.6"></div>
    ${logo("light")}
    <div class="abs z" style="left:56px;top:150px;width:980px">
      <div class="kicker">${kicker}</div>
      <div class="h-m" style="margin-top:18px;font-size:64px">${nameA}<br><span style="color:transparent;-webkit-text-stroke:2.5px #fff">vs</span> ${nameB}</div>
    </div>
    <div class="abs" style="left:0;right:0;top:0;height:820px;z-index:3">
      <div class="shadow-floor" style="left:${cars.a.x + 60}px;width:${cars.a.w - 120}px;top:${cars.a.y + cars.a.fh}px"></div>
      <img class="car" src="${A("cut/" + carA + ".png")}" style="left:${cars.a.x}px;top:${cars.a.y}px;width:${cars.a.w}px">
      <div class="shadow-floor" style="left:${cars.b.x + 60}px;width:${cars.b.w - 120}px;top:${cars.b.y + cars.b.fh}px;z-index:6"></div>
      <img class="car" src="${A("cut/" + carB + ".png")}" style="left:${cars.b.x}px;top:${cars.b.y}px;width:${cars.b.w}px;z-index:7">
    </div>
    ${vsBadge(cars.vs[0], cars.vs[1], 128)}
    ${table(rows, nameA, nameB, "position:absolute;left:56px;right:56px;top:790px;z-index:10")}
    <div class="abs z" style="left:56px;right:56px;bottom:62px;display:grid;grid-template-columns:1fr 1fr;gap:30px">
      <div style="font-size:22px;line-height:1.34"><b>Elige ${pickA[0]} si</b> ${pickA[1]}</div>
      <div style="font-size:22px;line-height:1.34;text-align:right"><b style="color:var(--red)">Elige ${pickB[0]} si</b> ${pickB[1]}</div>
    </div>
    <div class="abs z mono" style="left:56px;right:56px;bottom:24px;font-size:13px;opacity:.45;display:flex;justify-content:space-between;gap:20px"><span>${note}</span><span>${credit(...keys)}</span></div>
    `)],
  };
}

export default [
  single({
    id: "07-kia-morning-vs-hyundai-grand-i10", title: "Kia Morning vs Hyundai Grand i10",
    kicker: "Cara a cara · Citycar", nameA: "Morning", nameB: 'Grand <span style="text-transform:none">i</span>10', carA: "picanto", carB: "grandi10", keys: ["picanto", "grandi10"],
    cars: { a: { x: -10, y: 330, w: 640, fh: 330 }, b: { x: 450, y: 420, w: 640, fh: 330 }, vs: [470, 330] },
    rows: [
      ["Motor", "1.2 · 4 cil.", "1.2 · 4 cil."],
      ["Potencia", "83 hp", "82 hp"],
      ["Torque", "121 Nm", "114 Nm", "a"],
      ["Largo", "3.595 mm", "3.815 mm", "b"],
      ["Maletero", "255 L", "260 L", "b"],
      ["Estanque", "35 L", "37 L", "b"],
    ],
    pickA: ["Morning", "manejas en ciudad y quieres el más corto para estacionar."],
    pickB: ["Grand i10", "necesitas más espacio interior (también hay versión sedán)."],
    note: "Versiones 1.2 · fichas Chile 2025, pueden variar.",
  }),
  single({
    id: "08-toyota-corolla-vs-mazda-3", title: "Toyota Corolla vs Mazda 3",
    kicker: "Cara a cara · Sedán compacto", nameA: "Corolla", nameB: "Mazda 3", carA: "corolla", carB: "mazda3", keys: ["corolla", "mazda3"],
    cars: { a: { x: -20, y: 360, w: 660, fh: 300 }, b: { x: 430, y: 440, w: 670, fh: 300 }, vs: [470, 330] },
    rows: [
      ["Motor", "2.0 · 4 cil.", "2.5 · 4 cil."],
      ["Potencia", "169 hp", "186 hp", "b"],
      ["Torque", "205 Nm", "252 Nm", "b"],
      ["Caja", "CVT", "Auto. 6 vel."],
      ["Versión híbrida", "Sí · 1.8 HEV", "—", "a"],
      ["Fuerte en", "Reventa", "Terminaciones"],
    ],
    pickA: ["Corolla", "priorizas confiabilidad, bajo costo de uso y valor de reventa."],
    pickB: ["Mazda 3", "quieres más potencia, mejor manejo y un interior más premium."],
    note: "Corolla 2.0 / Mazda 3 sedán 2.5 · cifras de fábrica.",
  }),
  single({
    id: "09-toyota-rav4-vs-mazda-cx5", title: "Toyota RAV4 vs Mazda CX-5",
    kicker: "Cara a cara · SUV mediano", nameA: "RAV4", nameB: "CX-5", carA: "rav4", carB: "cx5", keys: ["rav4", "cx5"],
    cars: { a: { x: -20, y: 340, w: 640, fh: 330 }, b: { x: 450, y: 420, w: 640, fh: 330 }, vs: [470, 330] },
    rows: [
      ["Motor", "2.5 híbrido", "2.5 bencina"],
      ["Potencia", "219 hp*", "186 hp", "a"],
      ["Torque motor", "221 Nm", "252 Nm", "b"],
      ["Caja", "e-CVT", "Auto. 6 vel."],
      ["Consumo urbano", "Muy bajo", "Medio", "a"],
      ["Fuerte en", "Eficiencia", "Manejo"],
    ],
    pickA: ["RAV4", "haces mucha ciudad: el híbrido brilla en el taco."],
    pickB: ["CX-5", "valoras manejo, terminaciones y una caja automática tradicional."],
    note: "*Potencia combinada del sistema híbrido.",
  }),
  single({
    id: "10-bmw-serie3-vs-mercedes-clase-c", title: "BMW Serie 3 vs Mercedes-Benz Clase C",
    kicker: "Cara a cara · Sedán premium", nameA: 'BMW 320<span style="text-transform:none">i</span>', nameB: "C 200", carA: "bmw3", carB: "cclass", keys: ["bmw3", "cclass"],
    cars: { a: { x: -20, y: 360, w: 650, fh: 270 }, b: { x: 440, y: 450, w: 650, fh: 270 }, vs: [470, 330] },
    rows: [
      ["Motor", "2.0 turbo", "1.5 turbo + 48V"],
      ["Potencia", "184 hp", "204 hp", "b"],
      ["Torque", "300 Nm", "300 Nm"],
      ["Caja", "Auto. 8 vel.", "Auto. 9 vel."],
      ["0 a 100 km/h", "7,1 s", "7,3 s", "a"],
      ["Tracción", "Trasera", "Trasera"],
    ],
    pickA: ["BMW", "lo tuyo es manejar: dirección precisa y chasis más deportivo."],
    pickB: ["Mercedes", "buscas confort de marcha y un interior más tecnológico."],
    note: "Generaciones G20 y W206 · cifras de fábrica.",
  }),
];
