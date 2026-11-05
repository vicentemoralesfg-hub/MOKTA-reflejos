import { page, logo, counter, swipe } from "../lib.mjs";
import { ttl } from "../lib2.mjs";

const N = 6;
const W = "#fff", R = "#E1080C";
const svg = (inner, w = 560) => `<svg viewBox="0 0 400 300" width="${w}" fill="none" stroke="${W}" stroke-width="10" stroke-linecap="round" stroke-linejoin="round">${inner}</svg>`;

const ICON = {
  fuel: svg(`<rect x="70" y="50" width="130" height="200" rx="14"/><rect x="95" y="80" width="80" height="60" rx="6" fill="${W}" stroke="none" opacity=".25"/>
    <path d="M200 110 h30 a20 20 0 0 1 20 20 v80 a16 16 0 0 0 32 0 V120 l-30 -34"/><path d="M50 250 h170"/>
    <path d="M300 150 l60 -40 v80z" fill="${R}" stroke="${R}"/>`),
  key: svg(`<rect x="60" y="70" width="170" height="160" rx="50"/><circle cx="145" cy="125" r="18" fill="${W}" stroke="none"/><path d="M110 185 h70"/>
    <path d="M230 150 h120 M330 150 v26 M300 150 v18" stroke="${R}" stroke-width="16"/>`),
  recirc: svg(`<path d="M50 200 h300 l-30 -60 h-60 l-30 -40 h-90 l-40 50 z"/><circle cx="110" cy="210" r="26"/><circle cx="290" cy="210" r="26"/>
    <path d="M150 145 a50 30 0 1 1 100 0" stroke="${R}"/><path d="M240 120 l12 26 -28 4" stroke="${R}"/>`),
  child: svg(`<rect x="90" y="40" width="200" height="230" rx="14"/><path d="M120 80 h140 v80 h-140z" opacity=".5"/><circle cx="250" cy="200" r="12" fill="${W}" stroke="none"/>
    <rect x="290" y="150" width="60" height="90" rx="10" stroke="${R}"/><path d="M305 150 v-20 a15 15 0 0 1 30 0 v20" stroke="${R}"/>`),
  jack: svg(`<path d="M30 150 h70 l40 -50 h120 l50 50 h60 v50 h-340z"/><circle cx="100" cy="210" r="28"/><circle cx="300" cy="210" r="28"/>
    <path d="M160 200 l14 0 M220 200 h14" stroke="${R}" stroke-width="14"/><path d="M180 290 l20 -80 20 80 z" stroke="${R}"/>`),
};

const feat = (i, n, title, svgI, what, how) => page("bg-ink grain", `
  <div class="grid"></div>
  ${logo("light")}${counter(i, N)}
  <div class="abs num" style="right:40px;top:110px;font-size:300px;font-style:italic;font-weight:900;color:transparent;-webkit-text-stroke:3px rgba(255,255,255,.12)">0${n}</div>
  <div class="abs z" style="left:56px;top:168px;right:56px"><div class="kicker">Función oculta · 0${n}</div><div class="h-m" style="margin-top:22px">${title}</div></div>
  <div class="abs z" style="left:0;right:0;top:400px;display:flex;justify-content:center">${svgI}</div>
  <div class="abs z" style="left:56px;right:56px;top:880px;display:grid;grid-template-columns:1fr 1fr;gap:26px">
    <div><div class="chip w">Qué es</div><div style="margin-top:16px;font-size:28px;line-height:1.4">${what}</div></div>
    <div><div class="chip r">Úsalo así</div><div style="margin-top:16px;font-size:28px;line-height:1.4">${how}</div></div>
  </div>
`);

export default {
  id: "24-funciones-ocultas-de-tu-auto",
  title: "5 funciones de tu auto que no conocías",
  slides: [
    page("bg-red grain", `
    <div class="speed" style="inset:0;opacity:.45"></div>
    ${logo("light")}${counter(1, N)}
    <div class="abs z" style="left:56px;right:56px;top:180px">
      <div class="kicker">Curiosidades</div>
      <div class="h-xl" style="margin-top:26px;font-size:130px">5 cosas<br>que tu auto<br><span style="color:var(--ink)">tiene y no<br>sabías</span></div>
    </div>
    <div class="abs z" style="left:56px;top:1080px;width:600px;font-size:28px;font-weight:700;line-height:1.3">La número 2 te puede salvar un día.</div>
    ${swipe("DESLIZA", "#fff")}
    `),
    feat(2, 1, `La flecha del <span class="red">estanque</span>`, ICON.fuel,
      "Junto al ícono del surtidor hay un pequeño triángulo: apunta al lado donde está la tapa del estanque.",
      "Ideal con un auto arrendado o prestado: llegas a la bomba por el lado correcto."),
    feat(3, 2, `La llave <span class="red">escondida</span>`, ICON.key,
      "Casi todos los controles con apertura a distancia guardan una llave metálica adentro.",
      "Si se agota la pila del control, sácala para abrir la puerta del conductor."),
    feat(4, 3, `Recirculación <span class="red">de aire</span>`, ICON.recirc,
      "El botón del auto con una flecha en círculo cierra la entrada de aire exterior.",
      "Úsala en túneles o detrás de un camión. Para desempañar, vuelve al aire exterior con A/C."),
    feat(5, 4, `Seguro <span class="red">para niños</span>`, ICON.child,
      "Una pequeña palanca en el canto de las puertas traseras impide abrirlas desde adentro.",
      "Actívalo si llevas niños atrás: la puerta solo se abrirá desde afuera."),
    feat(6, 5, `Puntos para <span class="red">la gata</span>`, ICON.jack,
      "Bajo las puertas hay muescas o marcas reforzadas para levantar el auto.",
      "Pon la gata solo ahí: en otro punto puedes abollar el piso o romper piezas."),
  ],
};
