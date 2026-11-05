import { page, logo, counter, swipe } from "../lib.mjs";
import { sideInline, vibeWave } from "../engines.mjs";

const N = 5;

function slide({ i, n, title, sub, amp, vibTxt, pro, con, examples, dw }) {
  return page("bg-ink grain", `
  <div class="grid"></div>
  <div class="abs" style="left:0;top:0;width:430px;height:600px;background:linear-gradient(180deg,rgba(225,8,12,.0),rgba(225,8,12,.10));z-index:0"></div>
  ${logo("light")}${counter(i, N)}
  <div class="abs z" style="left:56px;top:168px"><div class="kicker">En línea · ${String(i - 1).padStart(2, "0")}</div></div>
  <div class="abs z num slice" style="left:40px;top:190px;font-size:420px;font-style:italic;font-weight:900;color:var(--red);--sh:8px">${n}</div>
  <div class="abs z" style="left:${n === 3 || n === 5 ? 330 : 350}px;top:250px;right:56px">
    <div class="h-m">Cilindros<br>en línea</div>
    <div class="lead" style="margin-top:22px;font-size:30px;opacity:.9">${sub}</div>
  </div>
  <div class="abs z" style="left:0;right:0;top:575px;display:flex;justify-content:center">${sideInline(n, { h: 330, id: "s" + i })}</div>
  <div class="abs z card" style="left:56px;right:56px;top:930px;padding:22px 30px;display:grid;grid-template-columns:250px 1fr 230px;align-items:center;gap:20px">
    <div style="font-family:Archivo;font-stretch:115%;font-weight:700;font-size:20px;letter-spacing:.14em;text-transform:uppercase">Vibración<br>natural</div>
    <div>${vibeWave(amp, { w: 380, h: 70 })}</div>
    <div class="num" style="font-size:40px;text-align:right">${vibTxt}</div>
  </div>
  <div class="abs z" style="left:56px;right:56px;top:1080px;display:grid;grid-template-columns:1fr 1fr 1.1fr;gap:26px">
    <div><div class="chip r">+ A favor</div><div style="margin-top:12px;font-size:22px;line-height:1.36">${pro}</div></div>
    <div><div class="chip w">− En contra</div><div style="margin-top:12px;font-size:22px;line-height:1.36">${con}</div></div>
    <div><div class="chip o">Lo encuentras en</div><div style="margin-top:12px;font-size:22px;line-height:1.36">${examples}</div></div>
  </div>
  `);
}

export default {
  id: "02-motores-en-linea",
  title: "Motores en línea: 3, 4, 5 y 6 cilindros",
  slides: [
    page("bg-red grain", `
    <div class="speed" style="inset:0;opacity:.5"></div>
    ${logo("light")}${counter(1, N)}
    <div class="abs z" style="left:56px;top:160px;right:56px">
      <div class="kicker">Motores en línea</div>
      <div class="h-xl" style="margin-top:24px;font-size:150px;line-height:.86">3 · 4<br><span style="color:var(--ink)">5 · 6</span></div>
      <div class="lead" style="margin-top:26px;max-width:900px;font-weight:600;font-size:31px">Mismo diseño, personalidades opuestas. ¿Cuál vibra, cuál suena mejor y cuál dura más?</div>
    </div>
    <div class="abs" style="left:0;right:0;bottom:130px;display:flex;justify-content:center;filter:drop-shadow(0 30px 40px rgba(0,0,0,.45))">${sideInline(6, { h: 520, id: "c" })}</div>
    ${swipe("DESLIZA", "#fff")}
    `),
    slide({
      i: 2, n: 3, dw: 520, amp: 0.85, vibTxt: "ALTA",
      sub: "El rey de la ciudad y del bajo consumo.",
      pro: "Menos piezas y menos fricción: ideal para autos chicos y livianos.",
      con: "Vibra en ralentí. Exigido en carretera y con carga, pierde su ventaja de consumo.",
      examples: "Kia Morning 1.0<br>Ford 1.0 EcoBoost<br>VW 1.0 TSI (Polo, T-Cross)",
    }),
    slide({
      i: 3, n: 4, dw: 660, amp: 0.45, vibTxt: "MEDIA",
      sub: "El más común del mundo, por algo será.",
      pro: "Simple, económico de fabricar y de mantener. Repuestos en todas partes.",
      con: "Vibración secundaria: sobre ~2.0 L muchos necesitan ejes de balance.",
      examples: "Toyota Corolla 2.0<br>Mazda 3 2.5<br>Toyota Hilux 2.8 diésel",
    }),
    slide({
      i: 4, n: 5, dw: 800, amp: 0.25, vibTxt: "BAJA",
      sub: "El raro con más carácter. Suena a rally.",
      pro: "Más torque y suavidad que un 4, sin el largo de un 6. Sonido inconfundible.",
      con: "Poco común: menos especialistas y repuestos más caros.",
      examples: "Ford Ranger 3.2 TDCi<br>Audi RS 3 (2.5 TFSI)<br>Volvo 850 / S60 (clásicos)",
    }),
    slide({
      i: 5, n: 6, dw: 940, amp: 0.02, vibTxt: "CASI CERO",
      sub: "Equilibrio perfecto de fábrica.",
      pro: "Se compensa solo: sin ejes de balance y con una suavidad de auto de lujo.",
      con: "Es largo: casi siempre va longitudinal, con tracción trasera o 4x4.",
      examples: "BMW 3.0 B58 (M340i)<br>Toyota 2JZ (Supra MK4)<br>Mazda CX-60 3.3",
    }),
  ],
};
