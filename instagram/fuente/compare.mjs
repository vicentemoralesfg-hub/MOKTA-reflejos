import { page, logo, A } from "./lib.mjs";
import { table, vsBadge } from "./vs.mjs";
import { credit } from "./credits.mjs";

/** Infografía comparativa de una sola imagen */
export function single({ id, title, kicker, nameA, nameB, carA, carB, cars, rows, pickA, pickB, note, keys }) {
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

