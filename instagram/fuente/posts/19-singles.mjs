import { page, logo } from "../lib.mjs";

// ---------- Neumático: cómo leerlo ----------
const tireSvg = `<svg viewBox="0 0 1000 1000" width="1000" height="1000">
  <defs>
    <radialGradient id="rub" cx=".5" cy=".5" r=".5"><stop offset=".55" stop-color="#1a1a1d"/><stop offset=".8" stop-color="#232327"/><stop offset="1" stop-color="#0c0c0e"/></radialGradient>
    <radialGradient id="rim" cx=".45" cy=".4" r=".6"><stop offset="0" stop-color="#f4f5f7"/><stop offset=".5" stop-color="#9aa0a8"/><stop offset="1" stop-color="#3a3c42"/></radialGradient>
    <path id="arc" d="M ${500 + 345 * Math.cos(2.4)} ${500 + 345 * Math.sin(2.4)} A 345 345 0 0 1 ${500 + 345 * Math.cos(4.0)} ${500 + 345 * Math.sin(4.0)}"/>
    <path id="arc2" d="M ${500 + 370 * Math.cos(2.35)} ${500 + 370 * Math.sin(2.35)} A 370 370 0 0 0 ${500 + 370 * Math.cos(1.0)} ${500 + 370 * Math.sin(1.0)}"/>
  </defs>
  <circle cx="500" cy="500" r="480" fill="url(#rub)"/>
  ${Array.from({ length: 72 }, (_, k) => `<rect x="494" y="18" width="12" height="38" rx="3" fill="#2c2c31" transform="rotate(${k * 5} 500 500)"/>`).join("")}
  <circle cx="500" cy="500" r="408" fill="none" stroke="rgba(255,255,255,.06)" stroke-width="2"/>
  <circle cx="500" cy="500" r="268" fill="url(#rim)"/>
  <circle cx="500" cy="500" r="250" fill="#141417"/>
  ${Array.from({ length: 10 }, (_, k) => `<path d="M500 500 L ${500 + 246 * Math.cos((k * 36 - 4) * Math.PI / 180)} ${500 + 246 * Math.sin((k * 36 - 4) * Math.PI / 180)} A 246 246 0 0 1 ${500 + 246 * Math.cos((k * 36 + 4) * Math.PI / 180)} ${500 + 246 * Math.sin((k * 36 + 4) * Math.PI / 180)}Z" fill="url(#rim)" stroke="#0c0c0e" stroke-width="3"/>`).join("")}
  <circle cx="500" cy="500" r="250" fill="none" stroke="#c9ccd2" stroke-width="10"/>
  <circle cx="500" cy="500" r="64" fill="url(#rim)" stroke="#E1080C" stroke-width="8"/>
  <text font-family="Barlow C" font-weight="800" font-size="70" fill="#e6e8ec" letter-spacing="5"><textPath href="#arc" startOffset="50%" text-anchor="middle">205/55 R16 91V</textPath></text>
  <text font-family="Barlow C" font-weight="700" font-size="44" fill="#E1080C" letter-spacing="3"><textPath href="#arc2" startOffset="50%" text-anchor="middle">DOT XXXX XXXX 2324</textPath></text>
</svg>`;

const spec = (big, label, desc, color = "#fff") => `
  <div>
    <div class="num" style="font-size:66px;color:${color}">${big}</div>
    <div class="mono" style="font-size:15px;letter-spacing:.16em;opacity:.6;margin-top:6px;text-transform:uppercase">${label}</div>
    <div style="font-size:21px;line-height:1.32;margin-top:8px;opacity:.9">${desc}</div>
  </div>`;

const neumatico = {
  id: "19-como-leer-tu-neumatico",
  title: "Cómo leer tu neumático",
  slides: [page("bg-ink grain", `
    <div class="abs" style="left:430px;top:150px;width:840px;z-index:1;filter:drop-shadow(0 40px 60px rgba(0,0,0,.6))">${tireSvg.replace('width="1000" height="1000"', 'width="840" height="840"')}</div>
    <div class="abs" style="left:0;right:0;top:880px;bottom:0;z-index:2;background:linear-gradient(180deg,rgba(10,10,11,0),#0a0a0b 90px)"></div>
    ${logo("light")}
    <div class="abs z" style="left:56px;top:160px;width:470px">
      <div class="kicker">Guía visual</div>
      <div class="h-m" style="margin-top:22px;font-size:62px">Tu neumático<br><span class="red">te habla</span></div>
      
    </div>
    <div class="abs z" style="left:56px;width:400px;top:420px;display:grid;grid-template-columns:1fr 1fr;gap:34px 26px">
      ${spec("205", "Ancho", "Milímetros de lado a lado.")}
      ${spec("55", "Perfil", "Alto del flanco: 55% del ancho.")}
      ${spec("R16", "Aro", "Diámetro de la llanta en pulgadas.")}
      ${spec("91V", "Carga / vel.", "91 = 615 kg por rueda. V = hasta 240 km/h.", "var(--red)")}
    </div>
    <div class="abs z" style="left:56px;right:56px;top:940px;display:grid;grid-template-columns:1.25fr 1fr;gap:26px">
      <div class="card" style="padding:26px 30px">
        <div class="mono" style="font-size:15px;letter-spacing:.16em;color:var(--red);font-weight:700">FECHA DE FABRICACIÓN</div>
        <div style="display:flex;align-items:baseline;gap:16px;margin-top:10px"><span class="num" style="font-size:76px">23</span><span class="num" style="font-size:76px;color:var(--red)">24</span></div>
        <div style="font-size:21px;line-height:1.32;margin-top:4px;opacity:.9">Los últimos 4 dígitos del código DOT: <b>semana 23</b> del año <b>2024</b>.</div>
      </div>
      <div class="card" style="padding:26px 30px;background:var(--red);border:0">
        <div class="mono" style="font-size:15px;letter-spacing:.16em;font-weight:700">MÍNIMO LEGAL EN CHILE</div>
        <div class="num" style="font-size:76px;margin-top:10px">1,6 mm</div>
        <div style="font-size:21px;line-height:1.32;margin-top:4px">de profundidad del dibujo. Bajo eso: cámbialo.</div>
      </div>
    </div>
    <div class="abs z" style="left:56px;right:56px;top:1205px;font-size:23px;line-height:1.36;opacity:.88">
      <b style="color:var(--red)">Ojo con la edad:</b> aunque tenga dibujo, el caucho se endurece. Desde los 5 años, revísalo cada año.
    </div>
  `)],
};

// ---------- 93 vs 97 ----------
const octanaje = {
  id: "22-bencina-93-o-97",
  title: "¿Bencina 93 o 97?",
  slides: [page("bg-red grain", `
    <div class="speed" style="inset:0;opacity:.5"></div>
    ${logo("light")}
    <div class="abs z" style="left:56px;top:160px;right:56px">
      <div class="kicker">Mito o verdad</div>
      <div class="h-l" style="margin-top:22px;font-size:96px">“La 97 le da<br>más fuerza<br><span style="color:var(--ink)">a mi auto”</span></div>
    </div>
    <div class="abs z" style="left:56px;top:560px;display:flex;align-items:center;gap:22px">
      <div style="background:var(--ink);color:#fff;font-family:Archivo;font-stretch:125%;font-weight:900;font-style:italic;font-size:64px;padding:10px 30px 12px;transform:skewX(-10deg)">MITO</div>
      <div style="font-size:26px;font-weight:600;max-width:600px;line-height:1.3">…si tu manual pide 93.</div>
    </div>
    <div class="abs z" style="left:56px;right:56px;top:720px;background:var(--ink);border-radius:22px;padding:34px 36px;display:grid;gap:26px">
      <div style="display:grid;grid-template-columns:150px 1fr;gap:24px;align-items:start">
        <div class="num" style="font-size:72px;color:var(--red)">01</div>
        <div style="font-size:25px;line-height:1.38">El octanaje <b>no es energía</b>: mide cuánto resiste la bencina a detonar antes de tiempo (el “cascabeleo”).</div>
      </div>
      <div style="display:grid;grid-template-columns:150px 1fr;gap:24px;align-items:start;border-top:1px solid rgba(255,255,255,.12);padding-top:24px">
        <div class="num" style="font-size:72px;color:var(--red)">02</div>
        <div style="font-size:25px;line-height:1.38">Si tu motor fue diseñado para 93, la 97 no le suma potencia: <b>solo le suma gasto</b>.</div>
      </div>
      <div style="display:grid;grid-template-columns:150px 1fr;gap:24px;align-items:start;border-top:1px solid rgba(255,255,255,.12);padding-top:24px">
        <div class="num" style="font-size:72px;color:var(--red)">03</div>
        <div style="font-size:25px;line-height:1.38">Al revés <b>sí importa</b>: si tu auto pide 95 o 97 (típico en turbo y deportivos), cargar 93 puede restarle rendimiento.</div>
      </div>
    </div>
    <div class="abs z" style="left:56px;right:56px;top:1205px;display:flex;justify-content:space-between;align-items:center">
      <div style="font-size:26px;font-weight:700">Regla simple: usa lo que dice el manual<br><span style="font-weight:450">(o la tapa del estanque).</span></div>
      <div class="chip k" style="font-size:22px;padding:16px 22px">Compártelo →</div>
    </div>
  `)],
};

// ---------- 100 veces por segundo ----------
const rpm = {
  id: "23-a-6000-rpm",
  title: "Lo que pasa a 6.000 rpm",
  slides: [page("bg-ink grain", `
    <div class="grid major"></div>
    <svg class="abs" style="left:-760px;top:260px;opacity:.9" width="1100" height="1100" viewBox="0 0 1100 1100">
      <circle cx="550" cy="550" r="500" fill="none" stroke="rgba(255,255,255,.07)" stroke-width="60"/>
      <circle cx="550" cy="550" r="500" fill="none" stroke="#E1080C" stroke-width="60" stroke-dasharray="${Math.PI * 1000 * 0.7} 4000" transform="rotate(130 550 550)"/>
      ${Array.from({ length: 60 }, (_, k) => `<line x1="550" y1="20" x2="550" y2="${k % 5 ? 60 : 90}" stroke="rgba(255,255,255,${k % 5 ? .2 : .6})" stroke-width="4" transform="rotate(${k * 6} 550 550)"/>`).join("")}
    </svg>
    ${logo("light")}
    <div class="abs z" style="right:56px;top:170px;text-align:right">
      <div class="kicker" style="justify-content:flex-end">Dato que vuela cabezas</div>
      <div class="h-m" style="margin-top:22px">A 6.000 rpm,<br>cada pistón sube<br>y baja…</div>
    </div>
    <div class="abs z" style="right:40px;top:470px;text-align:right">
      <div class="num chrome" style="font-size:390px;font-style:italic;font-weight:900;letter-spacing:-.03em;line-height:.8;padding-right:14px">100</div>
      <div class="h-s" style="margin-top:10px">veces <span class="red">por segundo</span></div>
    </div>
    <div class="abs z" style="left:56px;right:56px;top:1000px;display:grid;grid-template-columns:1fr 1fr 1fr;gap:24px">
      <div class="card" style="padding:24px 26px"><div class="num" style="font-size:62px">50</div><div style="font-size:21px;line-height:1.32;margin-top:8px;opacity:.85">veces por segundo se abre cada válvula.</div></div>
      <div class="card" style="padding:24px 26px"><div class="num" style="font-size:62px">≈ 62<span style="font-size:32px"> km/h</span></div><div style="font-size:21px;line-height:1.32;margin-top:8px;opacity:.85">velocidad media del pistón (carrera de 86 mm).</div></div>
      <div class="card" style="padding:24px 26px;background:var(--red);border:0"><div class="num" style="font-size:62px">19.000</div><div style="font-size:21px;line-height:1.32;margin-top:8px">rpm giraban los V10 de Fórmula 1 en 2005.</div></div>
    </div>
    <div class="abs z" style="left:56px;right:56px;bottom:52px;font-size:22px;opacity:.75;line-height:1.35">Por eso el aceite correcto y a tiempo no es un detalle: es lo único entre metal y metal.</div>
  `)],
};

// ---------- 120 vs 100 ----------
const vel = {
  id: "24-100-vs-120-kmh",
  title: "100 vs 120 km/h en carretera",
  slides: [page("bg-ink grain", `
    <div class="speed" style="left:-100px;right:-100px;top:420px;height:420px;opacity:.6"></div>
    ${logo("light")}
    <div class="abs z" style="left:56px;top:165px;right:56px">
      <div class="kicker">Física de carretera</div>
      <div class="h-l" style="margin-top:22px;font-size:100px">¿Ir a 120<br><span class="red">te conviene?</span></div>
    </div>
    <div class="abs z" style="left:56px;right:56px;top:470px;display:grid;grid-template-columns:1fr 1fr;gap:24px">
      <div class="card" style="padding:30px 32px">
        <div class="mono" style="font-size:15px;letter-spacing:.16em;opacity:.6">RESISTENCIA DEL AIRE</div>
        <div class="num" style="font-size:120px;color:var(--red);margin-top:10px">+44%</div>
        <div style="font-size:22px;line-height:1.35;margin-top:8px">Crece con el <b>cuadrado</b> de la velocidad.</div>
      </div>
      <div class="card" style="padding:30px 32px">
        <div class="mono" style="font-size:15px;letter-spacing:.16em;opacity:.6">POTENCIA PARA VENCERLA</div>
        <div class="num" style="font-size:120px;color:var(--red);margin-top:10px">+73%</div>
        <div style="font-size:22px;line-height:1.35;margin-top:8px">Crece con el <b>cubo</b>. Y eso lo paga el estanque.</div>
      </div>
    </div>
    <div class="abs z" style="left:56px;right:56px;top:820px;background:#fff;color:var(--ink);border-radius:22px;padding:32px 36px">
      <div class="mono" style="font-size:15px;letter-spacing:.16em;color:var(--red);font-weight:700">¿Y CUÁNTO TIEMPO GANAS? · VIAJE DE 300 KM</div>
      <div style="display:grid;grid-template-columns:1fr 1fr 1fr;align-items:end;gap:20px;margin-top:16px">
        <div><div class="num" style="font-size:88px">3:00 h</div><div class="mono" style="font-size:16px;opacity:.6;letter-spacing:.12em">A 100 KM/H</div></div>
        <div><div class="num" style="font-size:88px">2:30 h</div><div class="mono" style="font-size:16px;opacity:.6;letter-spacing:.12em">A 120 KM/H</div></div>
        <div style="text-align:right"><div class="num" style="font-size:88px;color:var(--red)">30 min</div><div class="mono" style="font-size:16px;opacity:.6;letter-spacing:.12em">SIN PARAR NUNCA</div></div>
      </div>
    </div>
    <div class="abs z" style="left:56px;right:56px;top:1120px;font-size:27px;line-height:1.38;max-width:900px">
      En la vida real, con peajes, tráfico y paradas, la diferencia se achica. <b>El mayor consumo, no.</b>
    </div>
  `)],
};

// ---------- Hábitos que cuestan plata ----------
const habit = (n, t, d) => `
  <div style="display:grid;grid-template-columns:96px 1fr;gap:20px;padding:24px 0;border-top:1px solid rgba(10,10,11,.12)">
    <div class="num" style="font-size:66px;color:var(--red);font-style:italic">${n}</div>
    <div><div style="font-family:Archivo;font-stretch:115%;font-weight:900;font-size:29px;text-transform:uppercase;font-style:italic">${t}</div>
    <div style="font-size:22px;line-height:1.36;margin-top:6px;opacity:.78">${d}</div></div>
  </div>`;
const habitos = {
  id: "21-habitos-que-cuestan-plata",
  title: "6 hábitos que te cuestan plata",
  slides: [page("bg-paper grain", `
    <div class="grid"></div>
    ${logo("dark")}
    <div class="abs z" style="left:56px;top:160px;right:56px">
      <div class="kicker">Parte 1 · Mantención</div>
      <div class="h-l" style="margin-top:22px;font-size:80px;color:var(--ink)">6 hábitos que<br><span class="red">cuestan plata</span></div>
    </div>
    <div class="abs z" style="left:56px;right:56px;top:440px">
      ${habit("01", "Mano en la palanca", "En cajas mecánicas, el peso empuja las horquillas contra los sincronizadores.")}
      ${habit("02", "Pie sobre el embrague", "Aunque sea apenas, desgasta el rodamiento de empuje y el disco.")}
      ${habit("03", "Exigir el motor en frío", "El aceite aún no lubrica bien. Maneja suave los primeros minutos.")}
      ${habit("04", "Frenar encima del lomo de toro", "Frena antes y pásalo suelto: tu suspensión lo agradece.")}
      ${habit("05", "Andar siempre en reserva", "La bomba de bencina se enfría con el mismo combustible.")}
      ${habit("06", "Volante a tope y sostenido", "Fuerza la bomba de la dirección hidráulica. Gira y suelta un poco.")}
    </div>
    <div class="abs z" style="left:56px;right:56px;bottom:46px;display:flex;justify-content:space-between;align-items:center;color:var(--ink)">
      <div style="font-size:24px;font-weight:700">¿Cuál de estos haces tú? 👇</div>
      <div class="chip r" style="font-size:20px;padding:14px 20px">Guárdalo</div>
    </div>
  `)],
};

export default [neumatico, habitos, octanaje, rpm, vel];
