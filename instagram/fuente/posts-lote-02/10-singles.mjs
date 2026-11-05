import { page, logo } from "../lib.mjs";
import { head, warn, card, label, ttl } from "../lib2.mjs";

const one = (id, title, html) => ({ id, title, slides: [html] });
const MT = `<linearGradient id="mt" x1="0" x2="1" y1="0" y2="1"><stop offset="0" stop-color="#f4f5f7"/><stop offset=".5" stop-color="#8b9099"/><stop offset="1" stop-color="#d9dbe0"/></linearGradient>`;

// ---------- Tracción ----------
const chassis = (t) => {
  const red = "#E1080C", off = "#2c2d31";
  const fr = t === "fwd" || t === "awd" || t === "4x4", rr = t === "rwd" || t === "awd" || t === "4x4";
  const wheel = (x, y, on) => `<rect x="${x}" y="${y}" width="30" height="62" rx="8" fill="${on ? red : off}" stroke="${on ? "#fff" : "rgba(255,255,255,.3)"}" stroke-width="3"/>`;
  return `<svg viewBox="0 0 200 300" width="170">
    <rect x="40" y="20" width="120" height="260" rx="40" fill="none" stroke="rgba(255,255,255,.35)" stroke-width="3"/>
    <rect x="70" y="44" width="60" height="44" rx="6" fill="#3a3c42"/>
    ${fr ? `<line x1="40" y1="76" x2="160" y2="76" stroke="${red}" stroke-width="6"/>` : `<line x1="40" y1="76" x2="160" y2="76" stroke="rgba(255,255,255,.2)" stroke-width="4"/>`}
    ${rr ? `<line x1="100" y1="88" x2="100" y2="226" stroke="${red}" stroke-width="6"/><line x1="40" y1="226" x2="160" y2="226" stroke="${red}" stroke-width="6"/>` : `<line x1="40" y1="226" x2="160" y2="226" stroke="rgba(255,255,255,.2)" stroke-width="4"/>`}
    ${t === "awd" ? `<circle cx="100" cy="150" r="16" fill="#16171a" stroke="#fff" stroke-width="3"/>` : ""}
    ${t === "4x4" ? `<rect x="80" y="130" width="40" height="34" rx="5" fill="#16171a" stroke="#fff" stroke-width="3"/><text x="100" y="153" text-anchor="middle" font-family="Barlow C" font-weight="800" font-size="18" fill="#fff">4L</text>` : ""}
    ${wheel(18, 45, fr)}${wheel(152, 45, fr)}${wheel(18, 195, rr)}${wheel(152, 195, rr)}
  </svg>`;
};
const tcard = (t, name, desc, ideal) => card(`
  <div style="display:grid;grid-template-columns:160px 1fr;gap:18px;align-items:center;height:100%">
    <div>${chassis(t).replace('width="170"', 'width="160"')}</div>
    <div>${ttl(name, 30)}<div style="font-size:23px;line-height:1.36;margin-top:10px;opacity:.85">${desc}</div>
    <div class="mono" style="font-size:16px;letter-spacing:.12em;color:var(--red);margin-top:12px;font-weight:700">IDEAL: ${ideal}</div></div>
  </div>`, "padding:24px 24px");

const traccion = one("05-traccion-4x2-awd-4x4", "4x2, AWD o 4x4", page("bg-ink grain", `
  <div class="grid"></div>
  ${head(0, 0, "Tracción", `¿4x2, AWD <span class="red">o 4x4?</span>`)}
  <div class="abs z" style="left:56px;right:56px;top:400px;display:grid;grid-template-columns:1fr 1fr;grid-auto-rows:330px;gap:20px">
    ${tcard("fwd", "Delantera", "La más común. Liviana, eficiente y económica.", "CIUDAD")}
    ${tcard("rwd", "Trasera", "Mejor equilibrio. Típica en pickups 4x2 y deportivos.", "CARGA Y RUTA")}
    ${tcard("awd", "AWD", "Reparte fuerza a las 4 ruedas por sí sola, cuando hace falta.", "LLUVIA Y RIPIO")}
    ${tcard("4x4", "4x4 + reductora", "Se conecta a voluntad. La 4L multiplica la fuerza a baja velocidad.", "BARRO Y CERRO")}
  </div>
  ${warn("En una 4x4 sin diferencial central, no uses 4H en asfalto seco: fuerza la transmisión al girar.")}
`));

// ---------- Inyección ----------
const inj = (direct) => `<svg viewBox="0 0 340 400" width="330"><defs>${MT}</defs>
  <path d="M10 70 H120 L150 110" stroke="#3a3c42" stroke-width="40" fill="none"/>
  <rect x="120" y="60" width="200" height="70" rx="10" fill="#26272c" stroke="rgba(255,255,255,.3)" stroke-width="2"/>
  <rect x="140" y="126" width="160" height="250" fill="#08080a" stroke="rgba(255,255,255,.35)" stroke-width="3"/>
  <rect x="144" y="250" width="152" height="80" rx="8" fill="url(#mt)"/>
  <path d="M150 110 l14 22" stroke="#c9ccd2" stroke-width="10" stroke-linecap="round"/>
  ${direct
    ? `<rect x="250" y="20" width="18" height="120" rx="4" transform="rotate(20 259 80)" fill="#E1080C"/><path d="M270 140 L230 200 M270 140 L250 210 M270 140 L275 212" stroke="#ffb000" stroke-width="5" stroke-dasharray="3 7" stroke-linecap="round"/>`
    : `<rect x="40" y="0" width="18" height="70" rx="4" transform="rotate(-25 49 35)" fill="#E1080C"/><path d="M62 64 L110 84 M62 64 L100 100 M62 64 L118 70" stroke="#ffb000" stroke-width="5" stroke-dasharray="3 7" stroke-linecap="round"/>
       <circle cx="160" cy="132" r="9" fill="#5a4a2a"/><circle cx="148" cy="118" r="6" fill="#5a4a2a"/>`}
</svg>`;
const inyeccion = one("06-inyeccion-directa-vs-indirecta", "Inyección directa vs indirecta", page("bg-graphite grain", `
  <div class="grid"></div>
  ${head(0, 0, "Tecnología de motor", `Inyección directa<br><span class="red">vs indirecta</span>`, { color: "font-size:68px" })}
  <div class="abs z" style="left:56px;right:56px;top:420px;display:grid;grid-template-columns:1fr 1fr;gap:30px">
    <div>${inj(false)}${ttl("Indirecta · MPI", 32)}<div style="font-size:22px;line-height:1.38;margin-top:10px;opacity:.85">Inyecta en el múltiple de admisión. La bencina “lava” las válvulas al pasar.</div></div>
    <div>${inj(true)}${ttl("Directa · GDI / TSI", 32, "color:var(--red)")}<div style="font-size:22px;line-height:1.38;margin-top:10px;opacity:.85">Inyecta dentro del cilindro a muy alta presión. Más potencia y menos consumo.</div></div>
  </div>
  <div class="abs z" style="left:56px;right:56px;top:1030px;display:grid;grid-template-columns:1fr 1fr;gap:30px">
    <div style="font-size:22px;line-height:1.38"><b class="red">Su punto débil (GDI):</b> carbón en las válvulas de admisión → tirones, ralentí inestable y pérdida de fuerza.</div>
    <div style="font-size:22px;line-height:1.38"><b>Lo mejor de ambos:</b> sistemas como el D-4S de Toyota combinan los dos tipos de inyector.</div>
  </div>
  <div class="abs z mono" style="left:56px;right:56px;bottom:50px;font-size:16px;opacity:.6;line-height:1.5">EN GDI: ACEITE CON LA NORMA CORRECTA, CAMBIOS A TIEMPO Y BENCINA DE CALIDAD.</div>
`));

// ---------- Desgaste de neumáticos ----------
const tread = (kind) => {
  const n = 9, w = 30, gap = 6;
  const h = (i) => {
    const x = (i - (n - 1) / 2) / ((n - 1) / 2);
    if (kind === "ok") return 40;
    if (kind === "center") return 40 - 26 * (1 - x * x);
    if (kind === "edges") return 14 + 26 * (1 - x * x);
    if (kind === "one") return 26 + 16 * x;
    if (kind === "cup") return [40, 18, 40, 22, 40, 16, 40, 20, 40][i];
  };
  return `<svg viewBox="0 0 330 90" width="300">${Array.from({ length: n }, (_, i) => `<rect x="${i * (w + gap) + 3}" y="${70 - h(i)}" width="${w}" height="${h(i)}" rx="4" fill="${kind === "ok" ? "#2c2d31" : "#E1080C"}"/>`).join("")}<rect x="0" y="70" width="330" height="16" rx="4" fill="#16171a"/></svg>`;
};
const trow = (kind, t, c) => `
  <div style="display:grid;grid-template-columns:320px 1fr;gap:26px;align-items:center;padding:30px 0;border-top:1px solid rgba(10,10,11,.12)">
    <div>${tread(kind)}</div>
    <div><div style="font-family:Archivo;font-stretch:115%;font-weight:900;font-style:italic;font-size:28px;text-transform:uppercase">${t}</div><div style="font-size:22px;line-height:1.35;margin-top:6px;opacity:.8">${c}</div></div>
  </div>`;
const neumaticos = one("17-desgaste-de-neumaticos", "Lo que el desgaste de tus neumáticos dice", page("bg-paper grain", `
  <div class="grid"></div>
  ${head(0, 0, "Diagnóstico visual", `Tus neumáticos<br><span class="red">te delatan</span>`, { dark: true })}
  <div class="abs z" style="left:56px;right:56px;top:420px;color:var(--ink)">
    ${trow("ok", "Parejo", "Presión, alineación y suspensión en orden.")}
    ${trow("center", "Gastado al centro", "Exceso de presión.")}
    ${trow("edges", "Gastado en ambos bordes", "Falta de presión: el más común y el que más combustible gasta.")}
    ${trow("one", "Gastado en un solo borde", "Alineación descuadrada (o piezas de suspensión gastadas).")}
    ${trow("cup", "Desgaste en parches", "Amortiguadores cansados o ruedas sin balancear.")}
  </div>
  <div class="abs z" style="left:56px;right:56px;bottom:46px;display:flex;justify-content:space-between;align-items:center;color:var(--ink)">
    <div style="font-size:23px;font-weight:700">Rota tus neumáticos cada ~10.000 km.</div><div class="chip r" style="font-size:20px;padding:14px 20px">Guárdalo</div>
  </div>
`));

// ---------- Batería ----------
const vrow = (v, pct, txt, w) => `
  <div style="display:grid;grid-template-columns:150px 1fr 220px;gap:20px;align-items:center;padding:14px 0;border-top:1px solid rgba(255,255,255,.1)">
    <div class="num" style="font-size:44px">${v}</div>
    <div class="bar" style="height:20px"><i style="width:${w}%;${w < 30 ? "background:#ffb000" : ""}"></i></div>
    <div style="font-size:21px;opacity:.85;text-align:right">${txt}</div>
  </div>`;
const bateria = one("18-bateria-senales-y-voltaje", "Batería: señales y voltaje", page("bg-ink grain", `
  <div class="grid"></div>
  ${head(0, 0, "Batería", `¿Te va a dejar <span class="red">botado?</span>`)}
  <div class="abs z" style="left:56px;top:410px;width:420px;height:250px;border-radius:22px;background:#0f1a12;border:3px solid #2c2d31;display:grid;place-items:center;box-shadow:inset 0 0 50px rgba(25,195,125,.15)">
    <div style="text-align:center"><div class="num" style="font-size:120px;color:#7dffb8;text-shadow:0 0 22px rgba(25,195,125,.6)">12,6 V</div><div class="mono" style="font-size:15px;opacity:.6;letter-spacing:.16em">MOTOR APAGADO · EN REPOSO</div></div>
  </div>
  <div class="abs z" style="left:510px;right:56px;top:420px;font-size:23px;line-height:1.42">
    ${ttl("Señales de alerta", 28, "color:var(--red)")}
    <ul style="margin-top:12px;padding-left:24px"><li>Arranque lento o “cansado”.</li><li>Luces que bajan al encender.</li><li>Bornes con polvo blanco o verde.</li><li>Tiene más de 3 a 5 años.</li></ul>
  </div>
  <div class="abs z" style="left:56px;right:56px;top:700px">
    ${label("Carga aproximada (batería de plomo-ácido, 12 V)")}
    <div style="margin-top:10px">
      ${vrow("12,6 V", 100, "100% · Cargada", 100)}
      ${vrow("12,4 V", 75, "≈ 75%", 75)}
      ${vrow("12,2 V", 50, "≈ 50% · Cárgala", 50)}
      ${vrow("12,0 V", 25, "≈ 25%", 25)}
      ${vrow("< 11,9", 5, "Descargada", 6)}
    </div>
  </div>
  ${warn("Con el motor encendido debe marcar entre 13,7 y 14,7 V. Menos que eso: revisa el alternador.")}
`));

// ---------- Aceite 5W-30 ----------
const aceite = one("19-como-leer-el-aceite-5w30", "Cómo leer el aceite 5W-30", page("bg-red grain", `
  <div class="speed" style="inset:0;opacity:.4"></div>
  ${head(0, 0, "Aceite de motor", `¿Qué significa<br><span style="color:var(--ink)">5W-30?</span>`)}
  <div class="abs z" style="left:0;right:0;top:450px;text-align:center"><span class="num" style="font-size:300px;font-style:italic;font-weight:900;letter-spacing:-.02em">5W<span style="color:var(--ink)">-</span>30</span></div>
  <div class="abs z" style="left:56px;right:56px;top:760px;display:grid;grid-template-columns:1fr 1fr 1fr;gap:20px">
    <div style="background:var(--ink);border-radius:20px;padding:26px"><div class="num" style="font-size:66px;color:var(--red)">5</div><div style="font-size:21px;line-height:1.36;margin-top:8px">Fluidez en frío. Más bajo = llega antes a lubricar al arrancar.</div></div>
    <div style="background:var(--ink);border-radius:20px;padding:26px"><div class="num" style="font-size:66px;color:var(--red)">W</div><div style="font-size:21px;line-height:1.36;margin-top:8px">“Winter”: indica que está probado para el frío.</div></div>
    <div style="background:var(--ink);border-radius:20px;padding:26px"><div class="num" style="font-size:66px;color:var(--red)">30</div><div style="font-size:21px;line-height:1.36;margin-top:8px">Espesor a temperatura de trabajo (100 °C).</div></div>
  </div>
  <div class="abs z" style="left:56px;right:56px;top:1080px;display:grid;grid-template-columns:1fr 1fr;gap:26px">
    <div style="font-size:23px;line-height:1.38"><b>La norma importa tanto como el número:</b> busca en el envase la que pide tu manual (API, ACEA o la del fabricante).</div>
    <div style="font-size:23px;line-height:1.38"><b style="color:var(--ink)">Mito:</b> “más espeso protege más”. En motores modernos, usa exactamente la viscosidad del manual.</div>
  </div>
`));

// ---------- Pastillas de freno ----------
const pad = (mm, w, red) => `<div style="text-align:center">
  <svg viewBox="0 0 240 200" width="300"><defs>${MT}</defs><rect x="20" y="20" width="200" height="40" rx="6" fill="url(#mt)"/>
  <rect x="30" y="60" width="180" height="${w}" rx="8" fill="${red ? "#E1080C" : "#3a3c42"}"/>
  <rect x="0" y="${60 + w + 8}" width="240" height="30" rx="4" fill="#5a5c62"/></svg>
  <div class="num" style="font-size:54px;${red ? "color:var(--red)" : ""}">${mm}</div></div>`;
const pastillas = one("20-pastillas-de-freno", "Pastillas de freno: cuándo cambiarlas", page("bg-ink grain", `
  <div class="grid"></div>
  ${head(0, 0, "Frenos", `¿Cuándo cambiar<br>las <span class="red">pastillas?</span>`, { color: "font-size:64px" })}
  <div class="abs z" style="left:56px;right:56px;top:420px;display:grid;grid-template-columns:1fr 1fr;gap:20px;align-items:end">
    ${pad("≈ 10–12 mm", 70, false)}${pad("3 mm", 18, true)}
  </div>
  <div class="abs z mono" style="left:56px;right:56px;top:752px;display:grid;grid-template-columns:1fr 1fr;text-align:center;font-size:15px;letter-spacing:.16em;opacity:.6"><span>NUEVA</span><span>CÁMBIALA</span></div>
  <div class="abs z" style="left:56px;right:56px;top:800px;display:grid;grid-template-columns:1fr 1fr;gap:20px">
    ${card(`${ttl("Chirrido agudo", 26)}<div style="font-size:21px;line-height:1.36;margin-top:8px;opacity:.85">Es el testigo metálico avisando que queda poco.</div>`)}
    ${card(`${ttl("Ruido de metal con metal", 26, "color:var(--red)")}<div style="font-size:21px;line-height:1.36;margin-top:8px;opacity:.85">Ya no queda pastilla: estás dañando el disco. Urgente.</div>`)}
    ${card(`${ttl("Volante o pedal que vibra", 26)}<div style="font-size:21px;line-height:1.36;margin-top:8px;opacity:.85">Discos deformados o gastados.</div>`)}
    ${card(`${ttl("Se tira hacia un lado", 26)}<div style="font-size:21px;line-height:1.36;margin-top:8px;opacity:.85">Desgaste disparejo o un caliper pegado.</div>`)}
  </div>
  <div class="abs z" style="left:56px;right:56px;bottom:48px;font-size:22px;line-height:1.38;opacity:.85">Cambiarlas a tiempo es barato. Esperar al ruido metálico suma discos a la cuenta.</div>
`));

// ---------- Uso severo ----------
const box = (t, d) => `<div style="display:grid;grid-template-columns:52px 1fr;gap:20px;align-items:start;padding:20px 0;border-top:1px solid rgba(10,10,11,.12)">
  <div style="width:46px;height:46px;border:3px solid var(--ink);border-radius:8px;transform:skewX(-8deg)"></div>
  <div><div style="font-family:Archivo;font-stretch:115%;font-weight:900;font-style:italic;font-size:28px;text-transform:uppercase">${t}</div><div style="font-size:22px;line-height:1.35;margin-top:4px;opacity:.78">${d}</div></div></div>`;
const severo = one("21-uso-severo", "¿Tu auto está en uso severo?", page("bg-paper grain", `
  <div class="grid"></div>
  ${head(0, 0, "Mantención", `¿Uso normal<br>o <span class="red">uso severo?</span>`, { dark: true })}
  <div class="abs z" style="left:56px;right:56px;top:420px;color:var(--ink)">
    <div style="font-size:25px;line-height:1.38;margin-bottom:14px">Marca lo que te pasa seguido:</div>
    ${box("Trayectos cortos", "Menos de 10 km: el motor no alcanza a calentarse bien.")}
    ${box("Taco y mucho ralentí", "El motor trabaja horas sin que el auto avance.")}
    ${box("Tierra o polvo", "Caminos rurales, ripio o faenas.")}
    ${box("Carga o remolque", "Pickups con peso, carros o casas rodantes.")}
    ${box("Calor o frío extremos", "Norte en verano, sur en invierno o mucha altura.")}
  </div>
  <div class="abs z" style="left:0;right:0;bottom:0;height:190px;background:var(--ink);color:#fff;padding:34px 56px">
    <div style="font-size:26px;line-height:1.38"><b class="red">¿Marcaste dos o más?</b> Usa los intervalos de <b>uso severo</b> de tu manual para aceite y filtros. Son más cortos, y el taco de Santiago califica.</div>
  </div>
`));

// ---------- Torque vs potencia ----------
const chart = `<svg viewBox="0 0 900 380" width="968">
  <line x1="60" y1="330" x2="880" y2="330" stroke="rgba(255,255,255,.3)" stroke-width="2"/><line x1="60" y1="20" x2="60" y2="330" stroke="rgba(255,255,255,.3)" stroke-width="2"/>
  ${[1000, 2000, 3000, 4000, 5000, 6000].map((r, k) => `<text x="${60 + (k + 1) * 130}" y="362" text-anchor="middle" font-family="Barlow C" font-weight="700" font-size="24" fill="rgba(255,255,255,.55)">${r / 1000}k</text>`).join("")}
  <path d="M60 250 C 200 120, 260 90, 330 90 L 640 90 C 720 92, 780 130, 840 170" stroke="#fff" stroke-width="7" fill="none"/>
  <path d="M60 320 C 300 240, 600 80, 790 50 C 820 48, 840 60, 860 80" stroke="#E1080C" stroke-width="7" fill="none"/>
  <text x="400" y="74" font-family="Archivo" font-stretch="118%" font-weight="900" font-style="italic" font-size="30" fill="#fff">TORQUE</text>
  <text x="640" y="36" font-family="Archivo" font-stretch="118%" font-weight="900" font-style="italic" font-size="30" fill="#E1080C">POTENCIA</text>
  <text x="870" y="320" text-anchor="end" font-family="JBM" font-size="18" fill="rgba(255,255,255,.5)">RPM</text>
</svg>`;
const torque = one("22-torque-vs-potencia", "Torque vs potencia", page("bg-ink grain", `
  <div class="grid"></div>
  ${head(0, 0, "Explicado simple", `Torque vs <span class="red">potencia</span>`)}
  <div class="abs z" style="left:56px;right:56px;top:410px;display:grid;grid-template-columns:1fr 1fr;gap:22px">
    ${card(`${ttl("Torque · Nm", 30)}<div style="font-size:22px;line-height:1.38;margin-top:10px;opacity:.88">La <b>fuerza</b> con que gira el motor. Es el empujón que sientes al salir o al subir un cerro.</div>`)}
    ${card(`${ttl("Potencia · CV / hp", 30, "color:var(--red)")}<div style="font-size:22px;line-height:1.38;margin-top:10px;opacity:.88">Qué tan <b>rápido</b> entrega esa fuerza. Define la aceleración en alta y la velocidad máxima.</div>`)}
  </div>
  <div class="abs z" style="left:56px;right:56px;top:700px">${chart}</div>
  <div class="abs z" style="left:56px;right:56px;top:1100px;background:#fff;color:var(--ink);border-radius:20px;padding:24px 30px;display:grid;grid-template-columns:1fr auto;gap:20px;align-items:center">
    <div><div class="mono" style="font-size:15px;letter-spacing:.14em;color:var(--red);font-weight:700">LA FÓRMULA</div><div class="num" style="font-size:44px;margin-top:6px">kW = Nm × rpm ÷ 9.549</div></div>
    <div style="font-size:20px;line-height:1.35;max-width:330px">Ej.: 300 Nm a 5.000 rpm = 157 kW ≈ <b>213 CV</b></div>
  </div>
`));

// ---------- Start-Stop ----------
const startstop = one("23-start-stop-mito", "¿El Start-Stop daña el motor?", page("bg-red grain", `
  <div class="speed" style="inset:0;opacity:.45"></div>
  ${head(0, 0, "Mito o verdad", `“El Start-Stop<br>destruye<br><span style="color:var(--ink)">el motor”</span>`)}
  <div class="abs z" style="left:56px;top:500px;display:flex;align-items:center;gap:22px">
    <div style="background:var(--ink);color:#fff;font-family:Archivo;font-stretch:125%;font-weight:900;font-style:italic;font-size:64px;padding:10px 30px 12px;transform:skewX(-10deg)">MITO</div>
    <div style="font-size:26px;font-weight:600;max-width:600px;line-height:1.3">El sistema está diseñado para eso.</div>
  </div>
  <div class="abs z" style="left:56px;right:56px;top:650px;background:var(--ink);border-radius:22px;padding:36px 34px;display:grid;gap:28px">
    ${[["01", "El motor de arranque es reforzado: está hecho para muchísimos más encendidos."], ["02", "Usa una batería especial (AGM o EFB) que aguanta ciclos constantes."], ["03", "Solo apaga el motor si está temperado y la batería tiene carga suficiente."]].map(([n, t], k) => `
      <div style="display:grid;grid-template-columns:110px 1fr;gap:20px;align-items:center;${k ? "border-top:1px solid rgba(255,255,255,.12);padding-top:28px" : ""}"><div class="num" style="font-size:70px;color:var(--red)">${n}</div><div style="font-size:26px;line-height:1.38">${t}</div></div>`).join("")}
  </div>
  <div class="abs z" style="left:56px;right:56px;bottom:52px;font-size:24px;line-height:1.36"><b>Lo que sí importa:</b> al cambiar la batería, usa una AGM o EFB igual a la original. Una común dura poco y el sistema falla.</div>
`));

// ---------- Airbag ----------
const airbag = one("25-airbag-30-milisegundos", "Un airbag se infla en 30 ms", page("bg-ink grain", `
  <div class="grid major"></div>
  ${logo("light")}
  <div class="abs z" style="left:56px;top:170px"><div class="kicker">Seguridad · Dato real</div></div>
  <div class="abs z" style="left:40px;right:40px;top:230px;text-align:center"><span class="num chrome" style="font-size:420px;font-style:italic;font-weight:900;letter-spacing:-.03em;line-height:.9">30</span><span class="num red" style="font-size:150px;font-style:italic">ms</span></div>
  <div class="abs z h-s" style="left:40px;right:40px;top:640px;text-align:center;font-size:40px">Es lo que tarda un airbag<br>en <span class="red">inflarse por completo</span></div>
  <div class="abs z" style="left:56px;right:56px;top:770px;text-align:center;font-size:24px;opacity:.75">Un parpadeo dura entre 100 y 400 ms: el airbag es varias veces más rápido.</div>
  <div class="abs z" style="left:56px;right:56px;top:880px;display:grid;grid-template-columns:1fr 1fr 1fr;gap:20px">
    ${card(`<div class="num" style="font-size:56px;color:var(--red)">25 cm</div><div style="font-size:21px;line-height:1.36;margin-top:8px">Distancia mínima recomendada entre tu pecho y el volante.</div>`)}
    ${card(`<div class="num" style="font-size:56px;color:var(--red)">0</div><div style="font-size:21px;line-height:1.36;margin-top:8px">Pies en el tablero. Jamás: el airbag sale con muchísima fuerza.</div>`)}
    ${card(`<div class="num" style="font-size:56px;color:var(--red)">Atrás</div><div style="font-size:21px;line-height:1.36;margin-top:8px">Los niños, siempre en el asiento trasero con su silla.</div>`)}
  </div>
  <div class="abs z" style="left:56px;right:56px;bottom:52px;font-size:22px;opacity:.75">Y recuerda: el airbag complementa al cinturón, no lo reemplaza.</div>
`));

// ---------- ABS / TCS / ESP ----------
const carTop = (mode) => `<svg viewBox="0 0 220 300" width="190">
  <rect x="55" y="40" width="110" height="220" rx="40" fill="#1d1e22" stroke="rgba(255,255,255,.5)" stroke-width="3"/>
  <rect x="72" y="80" width="76" height="50" rx="10" fill="#0b0b0d"/>
  ${[[38, 70], [162, 70], [38, 190], [162, 190]].map(([x, y], k) => `<rect x="${x}" y="${y}" width="22" height="44" rx="6" fill="${(mode === "abs") || (mode === "tcs" && k < 2) || (mode === "esp" && k === 3) ? "#E1080C" : "#3a3c42"}" stroke="#fff" stroke-width="2"/>`).join("")}
  ${mode === "abs" ? `<path d="M110 30 V0 M98 14 l12 -14 12 14" stroke="#fff" stroke-width="5" fill="none" transform="rotate(180 110 15) translate(0 -270)"/>` : ""}
  ${mode === "esp" ? `<path d="M110 280 C 150 300, 200 260, 200 220" stroke="#ffb000" stroke-width="5" fill="none" stroke-dasharray="6 8"/><path d="M190 222 l10 -14 10 16" stroke="#ffb000" stroke-width="5" fill="none"/>` : ""}
  ${mode === "tcs" ? `<path d="M40 60 c-10 -10 -10 -20 0 -30 M180 60 c10 -10 10 -20 0 -30" stroke="#ffb000" stroke-width="5" fill="none"/>` : ""}
</svg>`;
const abs = one("26-abs-tcs-esp", "ABS, control de tracción y ESP", page("bg-graphite grain", `
  <div class="grid"></div>
  ${head(0, 0, "Seguridad activa", `ABS, TCS <span class="red">y ESP</span>`)}
  <div class="abs z lead" style="left:56px;top:300px;font-size:30px;opacity:.9">Tres siglas que trabajan para que no pierdas el control.</div>
  <div class="abs z" style="left:56px;right:56px;top:440px;display:grid;grid-template-columns:1fr 1fr 1fr;gap:20px">
    ${[["abs", "ABS", "Al frenar", "Evita que las ruedas se bloqueen para que puedas seguir doblando mientras frenas."], ["tcs", "TCS", "Al acelerar", "Evita que las ruedas patinen al salir, sobre todo con lluvia o ripio."], ["esp", "ESP / ESC", "En curvas", "Frena ruedas por separado y baja la potencia para corregir un derrape."]].map(([m, n, w, d]) => card(`
      <div style="display:grid;place-items:center;height:290px">${carTop(m)}</div>
      ${ttl(n, 40, m === "esp" ? "color:var(--red)" : "")}<div class="mono" style="font-size:15px;letter-spacing:.16em;opacity:.6;margin-top:6px">${w.toUpperCase()}</div>
      <div style="font-size:21px;line-height:1.36;margin-top:12px;opacity:.88">${d}</div>`, "padding:24px 24px")).join("")}
  </div>
  ${warn("En una frenada de emergencia con ABS: pisa a fondo y mantén. Si el pedal vibra y suena, es normal: está funcionando.")}
`));

export default [traccion, inyeccion, neumaticos, bateria, aceite, pastillas, severo, torque, startstop, airbag, abs];
