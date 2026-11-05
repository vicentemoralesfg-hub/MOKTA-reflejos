import { page, logo, counter, swipe, foot } from "../lib.mjs";
import { frontV, topLayout } from "../engines.mjs";

const N = 6;

const meter = (label, v, note = "") => `
  <div style="display:grid;grid-template-columns:200px 1fr 70px;align-items:center;gap:22px">
    <div style="font-family:Archivo;font-stretch:115%;font-weight:700;font-size:21px;letter-spacing:.14em;text-transform:uppercase">${label}</div>
    <div style="display:grid;grid-template-columns:repeat(5,1fr);gap:7px">${[1, 2, 3, 4, 5].map((k) => `<i style="height:18px;transform:skewX(-18deg);background:${k <= v ? "var(--red)" : "rgba(255,255,255,.12)"}"></i>`).join("")}</div>
    <div class="num" style="font-size:34px;text-align:right">${v}<span style="opacity:.4">/5</span></div>
  </div>`;

function cfg({ i, name, kicker, title, deg, n, angle, ratings, examples, pro, con, fact }) {
  return page("bg-ink grain", `
  <div class="grid"></div>
  ${logo("light")}${counter(i, N)}
  <div class="abs z" style="left:56px;top:168px"><div class="kicker">${kicker}</div></div>
  <div class="abs z num chrome" style="left:44px;top:214px;font-size:300px;font-style:italic;font-weight:900;letter-spacing:-.02em">${name}</div>
  <div class="abs z h-s" style="left:56px;top:500px;width:520px">${title}</div>
  <div class="abs" style="right:-40px;top:110px;z-index:3">${frontV(deg, { w: 590, id: "f" + i })}</div>
  <div class="abs z" style="left:56px;top:660px;width:440px">
     <div class="mono" style="font-size:15px;letter-spacing:.2em;opacity:.55;margin-bottom:14px">VISTA SUPERIOR · ${n} CIL.</div>
     ${topLayout("v", n, { w: Math.min(64 * n / 2 + 50, 440), id: "t" + i })}
  </div>
  <div class="abs z" style="left:540px;right:56px;top:690px;border-left:6px solid var(--red);padding:4px 0 4px 26px">
     <div class="mono" style="font-size:15px;letter-spacing:.2em;color:var(--red);font-weight:700">DATO CLAVE</div>
     <div class="small" style="margin-top:10px;font-size:23px">${fact}</div>
  </div>
  <div class="abs z card" style="left:56px;right:56px;top:900px;padding:26px 34px;display:grid;gap:14px">
    ${ratings.map((r) => meter(r[0], r[1])).join("")}
    <div class="mono" style="font-size:13px;letter-spacing:.14em;opacity:.45;text-align:right">ESCALA RELATIVA ENTRE MOTORES EN V · MÁS BARRAS = MÁS DE ESO</div>
  </div>
  <div class="abs z" style="left:56px;right:56px;top:1138px;display:grid;grid-template-columns:1fr 1fr 1.1fr;gap:26px">
    <div><div class="chip r">+ A favor</div><div style="margin-top:12px;font-size:22px;line-height:1.36">${pro}</div></div>
    <div><div class="chip w">− En contra</div><div style="margin-top:12px;font-size:22px;line-height:1.36">${con}</div></div>
    <div><div class="chip o">Lo encuentras en</div><div style="margin-top:12px;font-size:22px;line-height:1.36">${examples}</div></div>
  </div>
  `);
}

export default {
  id: "01-motores-en-v",
  title: "V6 vs V8 vs V10 vs V12",
  slides: [
    // 1 — Portada
    page("bg-ink grain", `
    <div class="grid major"></div>
    <div class="speed" style="left:-200px;top:820px;width:1500px;height:200px;transform:rotate(-8deg)"></div>
    ${logo("light")}${counter(1, N)}
    <div class="abs" style="right:-150px;top:60px;opacity:.95">${frontV(90, { w: 860, id: "cv" })}</div>
    <div class="abs z" style="left:56px;top:770px">
      <div class="kicker">Motores en V · Guía visual</div>
      <div class="h-xl" style="margin-top:26px;font-size:168px">V6 · V8<br><span class="red">V10 · V12</span></div>
      <div class="lead" style="margin-top:34px;max-width:860px">Qué cambia de verdad entre cada uno: <b>ángulo, suavidad, sonido y consumo.</b></div>
    </div>
    ${swipe()}
    `),
    cfg({
      i: 2, name: "V6", kicker: "Configuración 01", deg: 60, n: 6, angle: "60° o 90°",
      title: `El <span class="red">equilibrio</span> justo`,
      ratings: [["Suavidad", 3], ["Potencia", 3], ["Consumo", 3], ["Complejidad", 3]],
      pro: "Compacto, más suave y elástico que un 4 cilindros.",
      con: "Dos culatas: más piezas y mantención más cara que un 4 en línea.",
      examples: "Ford F-150 (3.5 EcoBoost)<br>Toyota 4Runner (4.0)<br>VW Amarok (3.0 V6 TDI)", fact: "Es mucho más corto que un 6 en línea: por eso cabe atravesado en SUV y sedanes de tracción delantera.",
    }),
    cfg({
      i: 3, name: "V8", kicker: "Configuración 02", deg: 90, n: 8, angle: "90°",
      title: `El rey del <span class="red">torque</span>`,
      ratings: [["Suavidad", 4], ["Potencia", 4], ["Consumo", 4], ["Complejidad", 4]],
      pro: "Torque desde abajo y el sonido más reconocible del mundo.",
      con: "Consumo alto y peso extra sobre el eje delantero.",
      examples: "Ford Mustang GT (5.0)<br>RAM 1500 (5.7 HEMI)<br>Chevrolet Camaro SS (6.2)", fact: "Cigüeñal <b>cruzado</b>: sonido grave de muscle car. Cigüeñal <b>plano</b>: gira más alto y suena agudo (Ferrari, Mustang GT350).",
    }),
    cfg({
      i: 4, name: "V10", kicker: "Configuración 03", deg: 72, n: 10, angle: "72° o 90°",
      title: `Nacido para <span class="red">girar alto</span>`,
      ratings: [["Suavidad", 4], ["Potencia", 5], ["Consumo", 5], ["Complejidad", 5]],
      pro: "Sube de vueltas como pocos: el LFA corta a 9.000 rpm. Sonido agudo, casi de F1.",
      con: "Escaso, caro y complejo. Hoy casi solo existe en superdeportivos.",
      examples: "Lamborghini Huracán y Audi R8 (5.2)<br>Lexus LFA (4.8)<br>Dodge Viper (8.4)", fact: "La Fórmula 1 corrió con V10 de 3.0 litros hasta 2005, girando cerca de 19.000 rpm.",
    }),
    cfg({
      i: 5, name: "V12", kicker: "Configuración 04", deg: 60, n: 12, angle: "60° típico",
      title: `<span class="red">Suavidad</span> absoluta`,
      ratings: [["Suavidad", 5], ["Potencia", 5], ["Consumo", 5], ["Complejidad", 5]],
      pro: "Son dos 6 en línea unidos: equilibrio perfecto, prácticamente sin vibración.",
      con: "Largo, pesado, sediento y con mantenciones de lujo.",
      examples: "Ferrari 812 (6.5, 800 CV)<br>Lamborghini Aventador (6.5)<br>Rolls-Royce (6.75 biturbo)", fact: "60° es el ángulo “natural” del V12 (720° ÷ 12). Ferrari, en cambio, usa 65° en su V12 actual.",
    }),
    // 6 — Resumen
    page("bg-red grain", `
    <div class="speed" style="inset:0;opacity:.6"></div>
    ${logo("light")}${counter(6, N)}
    <div class="abs z" style="left:56px;top:170px;right:56px">
      <div class="kicker">Resumen para guardar</div>
      <div class="h-l" style="margin-top:24px">Más cilindros<br>≠ <span style="color:var(--ink)">mejor auto</span></div>
    </div>
    <div class="abs z" style="left:56px;right:56px;top:520px;background:var(--ink);border-radius:20px;padding:12px 34px">
      ${[
        ["V6", "60° / 90°", "SUV, pickups, sedanes", 3],
        ["V8", "90°", "Muscle cars, pickups grandes", 4],
        ["V10", "72° / 90°", "Superdeportivos", 4],
        ["V12", "60°", "Gran turismo y lujo", 5],
      ].map(([a, b, c, s], k) => `
        <div style="display:grid;grid-template-columns:150px 170px 1fr 150px;align-items:center;gap:18px;padding:26px 0;${k ? "border-top:1px solid rgba(255,255,255,.12)" : ""}">
          <div class="num" style="font-size:78px;font-style:italic;font-weight:900;color:var(--red)">${a}</div>
          <div class="num" style="font-size:40px;font-weight:700">${b}</div>
          <div class="small" style="opacity:.85">${c}</div>
          <div style="display:flex;gap:6px;justify-content:flex-end">${[1, 2, 3, 4, 5].map((q) => `<i style="width:18px;height:28px;transform:skewX(-18deg);background:${q <= s ? "#fff" : "rgba(255,255,255,.15)"}"></i>`).join("")}</div>
        </div>`).join("")}
      <div class="mono" style="font-size:15px;letter-spacing:.16em;opacity:.5;text-align:right;padding:0 0 16px">SUAVIDAD DE MARCHA →</div>
    </div>
    <div class="abs z" style="left:56px;right:56px;top:1130px;display:flex;align-items:center;justify-content:space-between">
      <div class="lead" style="font-weight:700;max-width:640px">¿Con cuál te quedas? <span style="font-weight:450">Déjalo en los comentarios.</span></div>
      <div class="chip k" style="font-size:22px;padding:16px 22px">Guárdalo ↓</div>
    </div>
    `),
  ],
};
