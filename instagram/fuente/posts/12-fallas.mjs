import { fallaSingle } from "../fallas.mjs";

export default [
  fallaSingle({
    id: "12-toyota-hilux-28-dpf", title: "Toyota Hilux 2.8: el DPF", no: "02", car: "hilux",
    model: `Toyota Hilux<br><span class="red">2.8 diésel</span>`,
    specs: ["Motor 1GD-FTV", "2015 – 2020"],
    items: [
      ["doc", "El DPF no regenera bien", "El filtro de partículas se satura: humo blanco, olor fuerte y pérdida de potencia. En Australia, la justicia (2022, confirmado en 2023) falló en contra de Toyota por este defecto."],
      ["doc", "Toyota cambió la solución", "Desde 2018 agregó un botón de regeneración manual y actualizaciones de software."],
      ["wear", "Uso solo en ciudad", "Trayectos cortos impiden que el filtro se limpie solo. Necesita carretera a ritmo constante."],
    ],
    check: "Pide el historial de actualizaciones de software y mantenciones. Si se enciende la luz del DPF, haz unos 20 minutos de carretera o usa el botón de regeneración.",
    source: "Fuente: Toyota Australia (DPF Class Action) · Corte Federal de Australia.",
  }),
  fallaSingle({
    id: "13-peugeot-12-puretech", title: "Peugeot 1.2 PureTech", no: "03", car: "peugeot208",
    model: `Peugeot<br><span class="red">1.2 PureTech</span>`,
    specs: ["208 · 2008 · 308", "≈ 2014 – 2022"],
    items: [
      ["doc", "Correa bañada en aceite", "La correa de distribución trabaja dentro del aceite y se degrada. Sus restos pueden tapar el colador de la bomba de aceite."],
      ["doc", "Consumo excesivo de aceite", "Stellantis lo reconoció y amplió la garantía en Europa hasta 10 años / 175.000 km."],
      ["rep", "Menos asistencia de freno", "Restos de la correa pueden afectar la bomba de vacío del servofreno."],
    ],
    check: "Revisa el nivel de aceite (y si baja entre cambios). Pide boleta del último cambio de correa y verifica que use el aceite con la norma exacta del manual.",
    source: "Fuente: Stellantis · programa de extensión de garantía PureTech (Europa).",
  }),
  fallaSingle({
    id: "14-vw-dsg-7-dq200", title: "VW DSG de 7 marchas (DQ200)", no: "04", car: "golf7", carStyle: "width:570px;top:260px;",
    model: `VW DSG<br><span class="red">7 vel. seca</span>`,
    specs: ["Caja DQ200", "Golf · Polo · Jetta · A3"],
    items: [
      ["doc", "Falla de la mecatrónica", "El “cerebro” hidráulico de la caja pierde presión: entra en modo emergencia y se queda en una marcha. VW hizo llamados a revisión (China, 2013: ~384.000 autos)."],
      ["wear", "Embragues secos", "Tirones al salir y vibración en primera o retroceso. El taco los desgasta más rápido."],
      ["rep", "Golpes al cambiar lento", "Ruidos o golpes en cambios a baja velocidad."],
    ],
    check: "Pruébala en frío y en taco: debe salir suave, sin tirones. Escanea por códigos de la caja y pide historial de actualizaciones.",
    source: "Fuente: AQSIQ China · llamado a revisión Volkswagen DSG (2013).",
  }),
  fallaSingle({
    id: "15-ford-powershift-dps6", title: "Ford Powershift (DPS6)", no: "05", car: "fiesta", carStyle: "width:560px;top:250px;",
    model: `Ford<br><span class="red">Powershift</span>`,
    specs: ["Caja DPS6", "Fiesta · Focus · EcoSport", "≈ 2011 – 2017"],
    items: [
      ["doc", "Trepidación al partir", "Fugas de retenes contaminan los embragues secos: el auto “tirita” al acelerar desde detenido."],
      ["doc", "Falla del módulo (TCM)", "Pérdida de cambios o el auto queda en neutro. En EE.UU., Ford extendió la garantía del módulo y de los embragues."],
      ["rep", "Cambios lentos o bruscos", "Demora al subir de marcha y golpes al reducir."],
    ],
    check: "Pide registro de reprogramaciones y cambios de embrague. Prueba partidas en subida: cualquier vibración es señal de alerta.",
    source: "Fuente: Ford Motor Co. · programas de garantía extendida DPS6 (EE.UU.).",
  }),
  fallaSingle({
    id: "16-bmw-n20-cadena", title: "BMW motor N20", no: "06", car: "bmwf30",
    model: `BMW<br><span class="red">motor N20</span>`,
    specs: ["2.0 turbo", "320i · 328i · X1 · X3", "≈ 2011 – 2015"],
    items: [
      ["doc", "Guías de cadena", "Las guías plásticas de la cadena de distribución se desgastan: la cadena se estira y, si salta, el daño es mayor. BMW mejoró las piezas después."],
      ["wear", "Bomba de agua eléctrica", "Puede fallar sin aviso y provocar sobrecalentamiento."],
      ["rep", "Fugas de aceite", "Empaquetaduras de la base del filtro y de la tapa de válvulas."],
    ],
    check: "Escucha en ralentí: un zumbido o silbido metálico apunta a la cadena. Pide historial de cambio de cadena y revisa fugas bajo el motor.",
    source: "Fuente: boletines y reclamos documentados BMW N20 (EE.UU.).",
  }),
  fallaSingle({
    id: "17-nissan-cvt", title: "Nissan: cajas CVT", no: "07", car: "xtrail",
    model: `Nissan<br><span class="red">caja CVT</span>`,
    specs: ["Jatco CVT", "X-Trail · Qashqai · Sentra"],
    items: [
      ["doc", "Tirones y pérdida de fuerza", "Trepidación o patinaje; con calor, la caja entra en modo protección. Nissan enfrentó demandas y extendió garantías de CVT en EE.UU."],
      ["rep", "Zumbido creciente", "Un aullido que sube con la velocidad suele anticipar desgaste interno."],
      ["wear", "Aceite de CVT gastado", "Usa solo el fluido CVT que indica Nissan y cámbialo según el plan de uso severo."],
    ],
    check: "Haz una prueba de al menos 20 minutos con carretera: aceleración pareja, sin tirones ni zumbidos. Pide historial de cambio de aceite de la caja.",
    source: "Fuente: Nissan North America · extensiones de garantía CVT.",
  }),
  fallaSingle({
    id: "18-kia-hyundai-theta-ii", title: "Kia / Hyundai motor Theta II", no: "08", car: "sportage",
    model: `Kia · Hyundai<br><span class="red">Theta II GDI</span>`,
    specs: ["2.0T y 2.4 GDI", "Sportage · Sorento · Tucson", "≈ 2011 – 2019"],
    items: [
      ["doc", "Metales de biela", "Restos metálicos del mecanizado desgastan los metales de biela: golpeteo y riesgo de motor fundido. Llamados a revisión en EE.UU. (NHTSA)."],
      ["doc", "Software de detección", "La solución incluyó el sistema KSDS, que detecta vibraciones anormales y limita la potencia."],
      ["rep", "Consumo de aceite", "Baja de nivel entre cambios y golpeteo que crece con las vueltas."],
    ],
    check: "Consulta en el concesionario si el VIN tiene campañas pendientes. Escucha golpeteos rítmicos que suben con las rpm y revisa el nivel de aceite.",
    source: "Fuente: NHTSA · llamado 17V224 y campañas relacionadas.",
  }),
];
