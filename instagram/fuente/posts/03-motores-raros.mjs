import { page, logo, counter, swipe, A } from "../lib.mjs";
import { frontBoxer, rotary, topLayout } from "../engines.mjs";
import { credit } from "../credits.mjs";

const N = 4;

const cols3 = (pro, con, ex) => `
  <div class="abs z" style="left:56px;right:56px;top:1100px;display:grid;grid-template-columns:1fr 1fr 1.1fr;gap:26px">
    <div><div class="chip r">+ A favor</div><div style="margin-top:12px;font-size:22px;line-height:1.36">${pro}</div></div>
    <div><div class="chip w">− En contra</div><div style="margin-top:12px;font-size:22px;line-height:1.36">${con}</div></div>
    <div><div class="chip o">Lo encuentras en</div><div style="margin-top:12px;font-size:22px;line-height:1.36">${ex}</div></div>
  </div>`;

const fact = (t, top = 880) => `
  <div class="abs z" style="left:56px;right:56px;top:${top}px;border-left:6px solid var(--red);padding:6px 0 6px 26px">
    <div class="mono" style="font-size:15px;letter-spacing:.2em;color:var(--red);font-weight:700">DATO CLAVE</div>
    <div style="margin-top:10px;font-size:25px;line-height:1.38">${t}</div>
  </div>`;

export default {
  id: "03-boxer-rotativo-w",
  title: "Bóxer, rotativo y W",
  slides: [
    page("bg-ink grain", `
    <div class="grid major"></div>
    ${logo("light")}${counter(1, N)}
    <div class="abs" style="left:60px;right:0;top:150px;display:flex;justify-content:center;opacity:.95">${frontBoxer({ w: 960, id: "cb" })}</div>
    <div class="abs z" style="left:56px;right:56px;top:640px">
      <div class="kicker">Configuraciones poco comunes</div>
      <div class="h-xl" style="margin-top:24px;font-size:112px">Bóxer,<br>rotativo<br><span class="red">y motor W</span></div>
      <div class="lead" style="margin-top:28px;max-width:880px">Los motores “raros” que se ganaron fanáticos en todo el mundo.</div>
    </div>
    ${swipe()}
    `),
    page("bg-ink grain", `
    <div class="grid"></div>
    ${logo("light")}${counter(2, N)}
    <div class="abs z" style="left:56px;top:168px;right:56px"><div class="kicker">Bóxer · Cilindros opuestos</div><div class="h-m" style="margin-top:22px">Plano y <span class="red">bajito</span></div></div>
    <div class="abs" style="left:40px;top:380px;z-index:3">${frontBoxer({ w: 600, id: "b2" })}</div>
    <img class="car" src="${A("cut/forester.png")}" style="right:-60px;top:520px;width:560px">
    ${fact("Los pistones se mueven en direcciones opuestas, como dos boxeadores chocando los guantes. De ahí su nombre.", 880)}
    ${cols3("Centro de gravedad bajo y gran equilibrio: el auto se siente plantado en curvas.", "Es ancho y algunas mantenciones (como las bujías) son más laboriosas.", "Subaru Forester, XV / Crosstrek, WRX<br>Porsche 911 y 718")}
    <div class="abs mono" style="left:56px;bottom:24px;font-size:12.5px;opacity:.4;z-index:40">${credit("forester")}</div>
    `),
    page("bg-ink grain", `
    <div class="grid"></div>
    ${logo("light")}${counter(3, N)}
    <div class="abs z" style="left:56px;top:168px;right:56px"><div class="kicker">Rotativo · Wankel</div><div class="h-m" style="margin-top:22px">Sin pistones,<br><span class="red">sin bielas</span></div></div>
    <div class="abs" style="left:30px;top:380px;z-index:3">${rotary({ w: 480, id: "r3" })}</div>
    <img class="car" src="${A("cut/rx7.png")}" style="right:-50px;top:520px;width:600px">
    ${fact("Un rotor triangular gira dentro de una carcasa ovalada. Por cada vuelta del rotor, el eje da tres.", 880)}
    ${cols3("Compacto, liviano, muy suave y le encanta girar alto.", "Sellos de vértice que se desgastan, consume aceite por diseño y gasta más bencina.", "Mazda RX-7 y RX-8<br>Mazda MX-30 R-EV (como generador)")}
    <div class="abs mono" style="left:56px;bottom:24px;font-size:12.5px;opacity:.4;z-index:40">${credit("rx7")}</div>
    `),
    page("bg-ink grain", `
    <div class="grid"></div>
    ${logo("light")}${counter(4, N)}
    <div class="abs z" style="left:56px;top:168px;right:56px"><div class="kicker">Motor W · Dos V en uno</div><div class="h-m" style="margin-top:22px">16 cilindros<br><span class="red">en poco espacio</span></div></div>
    <div class="abs z" style="left:56px;top:420px">
      <div class="mono" style="font-size:15px;letter-spacing:.2em;opacity:.55;margin-bottom:14px">VISTA SUPERIOR · W16 · 4 FILAS</div>
      ${topLayout("w", 16, { w: 410, id: "w4" })}
    </div>
    <div class="abs z" style="left:620px;right:56px;top:440px;display:grid;gap:30px">
      <div><div class="num chrome" style="font-size:120px;font-style:italic">1.500</div><div class="mono" style="font-size:15px;letter-spacing:.16em;opacity:.6">CV DEL BUGATTI CHIRON (8.0 W16)</div></div>
      <div><div class="num" style="font-size:96px;color:var(--red);font-style:italic">4 turbos</div><div class="mono" style="font-size:15px;letter-spacing:.16em;opacity:.6">Y 64 VÁLVULAS</div></div>
    </div>
    ${fact("Une dos bancadas en V muy cerradas sobre un mismo cigüeñal: muchos cilindros con el largo de un V8.", 880)}
    ${cols3("Muchísima potencia en un motor corto.", "Complejo, pesado y carísimo de mantener.", "Bugatti Veyron y Chiron (W16)<br>Bentley y Audi A8 (W12)")}
    `),
  ],
};
