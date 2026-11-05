import { fallaSingle } from "../fallas.mjs";

export default [
  fallaSingle({
    id: "11-honda-crv-15-turbo", title: "Honda CR-V 1.5 turbo", no: "09", car: "crv",
    model: `Honda CR-V<br><span class="red">1.5 turbo</span>`,
    specs: ["Motor L15B turbo", "CR-V 2017 – 2018", "Civic 2016 – 2018"],
    items: [
      ["doc", "Bencina en el aceite", "Combustible sin quemar pasa por los anillos y diluye el aceite: el nivel sube y huele a bencina. Honda extendió la garantía del motor en EE.UU. y Canadá (2019)."],
      ["doc", "Actualización de software", "Honda reprogramó el motor para que se caliente más rápido y reduzca la dilución."],
      ["rep", "Peor en frío y trayectos cortos", "Si el motor no alcanza temperatura, la bencina no se evapora del aceite."],
    ],
    check: "Mide el aceite: si está sobre el máximo y huele a bencina, hay dilución. Verifica con el VIN que tenga hecha la actualización.",
    source: "Fuente: American Honda · extensión de garantía 1.5 turbo (2019).",
  }),
  fallaSingle({
    id: "12-toyota-24-2az-fe", title: "Toyota 2.4 (2AZ-FE): consumo de aceite", no: "10", car: "rav4xa30",
    model: `Toyota 2.4<br><span class="red">2AZ-FE</span>`,
    specs: ["RAV4 · Camry · Corolla", "≈ 2006 – 2011"],
    items: [
      ["doc", "Consumo excesivo de aceite", "Los anillos de pistón se carbonizan y dejan pasar aceite a la cámara. Toyota creó un programa de garantía en EE.UU. con cambio de pistones y anillos (ya cerrado)."],
      ["rep", "Humo azul y bujías sucias", "Señales de que el aceite se está quemando dentro del motor."],
      ["wear", "Bomba de agua", "Con los años suele filtrar refrigerante: revisa bajo el auto y el nivel en frío."],
    ],
    check: "Pregunta cuánto aceite completa entre cambios. Si necesita cerca de 1 litro cada ~2.000 km, es señal de alerta.",
    source: "Fuente: Toyota Motor Sales · Warranty Enhancement ZE7 (EE.UU.).",
  }),
  fallaSingle({
    id: "13-chevrolet-cruze-14-turbo", title: "Chevrolet Cruze 1.4 turbo", no: "11", car: "cruze",
    model: `Chevrolet Cruze<br><span class="red">1.4 turbo</span>`,
    specs: ["Primera generación", "≈ 2011 – 2016"],
    items: [
      ["doc", "Bomba de agua", "Fugas por el sello. En EE.UU., GM amplió su cobertura a 10 años / 150.000 millas (boletín 14371)."],
      ["rep", "Fugas de refrigerante", "Carcasa del termostato, salida de agua y mangueras: piezas plásticas que se trizan con el calor."],
      ["rep", "Válvula PCV y tapa de válvulas", "Su membrana falla: fugas de aceite, silbido y ralentí inestable."],
    ],
    check: "Revisa el nivel de refrigerante en frío y busca olor dulce o manchas bajo el motor. Un silbido en ralentí puede ser la PCV.",
    source: "Fuente: GM · Special Coverage 14371 (EE.UU.) · boletines técnicos.",
  }),
  fallaSingle({
    id: "14-peugeot-citroen-16-thp", title: "Peugeot / Citroën 1.6 THP", no: "12", car: "p308",
    model: `Peugeot · Citroën<br><span class="red">1.6 THP</span>`,
    specs: ["308 · 3008 · 208 · DS3 · C4", "Mini Cooper S ≈ 2007 – 2010"],
    carStyle: "width:560px;top:270px;",
    items: [
      ["rep", "Cadena que se estira", "El tensor pierde presión y la cadena se suelta: cascabeleo metálico al arrancar en frío. En Austria, dueños presentaron una demanda colectiva (2011)."],
      ["rep", "Carbón en las válvulas", "Por su inyección directa: tirones, ralentí inestable y pérdida de fuerza."],
      ["wear", "Consumo de aceite", "Revisa el nivel seguido: a este motor le afecta mucho andar bajo."],
    ],
    check: "Escucha el arranque en frío: 2 o 3 segundos de cascabeleo metálico apuntan a la cadena. Pide historial de cambio de cadena y tensor.",
    source: "Fuente: reportes de talleres especialistas y propietarios (motor EP6).",
  }),
  fallaSingle({
    id: "15-vw-12-14-tsi-ea111", title: "VW 1.2 y 1.4 TSI (EA111)", no: "13", car: "golf6",
    model: `VW 1.2 · 1.4<br><span class="red">TSI (EA111)</span>`,
    specs: ["Golf VI · Polo · Jetta · A1 · A3", "≈ 2008 – 2012"],
    carStyle: "width:560px;top:280px;",
    items: [
      ["rep", "Cadena que se estira", "La cadena y su tensor originales se desgastan antes de tiempo. Si salta, el daño al motor es mayor."],
      ["doc", "VW cambió las piezas", "Lanzó cadena y tensor revisados y, desde 2012, la nueva generación (EA211) usa correa."],
      ["wear", "Bobinas y bujías", "Tironeo o falla de encendido: piezas de desgaste en motores turbo."],
    ],
    check: "Escucha el arranque en frío y pide historial: si ya cambiaron la cadena por piezas actualizadas, es un punto a favor.",
    source: "Fuente: catálogos OE de VW (piezas revisadas) · talleres especialistas.",
  }),
];
