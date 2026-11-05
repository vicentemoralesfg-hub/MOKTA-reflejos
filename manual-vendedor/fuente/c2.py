from lib import *

# =====================================================================
chapter("7", "Suspensión y dirección",
        "La suspensión define la comodidad y la estabilidad; la dirección, qué tan fácil y preciso es manejar.")
h2("Para qué sirve la suspensión")
p("Mantiene las ruedas en contacto con el suelo (agarre = seguridad), absorbe baches (comodidad) y controla el balanceo de la "
  "carrocería en curvas y frenadas. Siempre hay un equilibrio: más blanda = más cómoda pero se inclina más; más firme = más "
  "estable y deportiva pero transmite más los baches.")
h2("Componentes")
table(["Componente", "Función"], [
    ["Resortes (espirales)", "Soportan el peso y absorben los golpes."],
    ["Amortiguadores", "Frenan el rebote del resorte para que el auto no “flote”. Desgaste: el auto rebota, se inclina mucho, frena peor; revisión cada ~40.000–80.000 km."],
    ["Ballestas (paquete de hojas)", "Láminas de acero curvas que hacen de resorte; típico del eje trasero de camionetas (soportan mucha carga)."],
    ["Barra estabilizadora", "Une ambos lados del eje y reduce el balanceo en curvas."],
    ["Bandejas / brazos de suspensión", "Brazos que unen la rueda al chasis."],
    ["Rótulas, bujes, terminales", "Articulaciones y gomas que permiten el movimiento; se desgastan y producen ruidos o juego."],
    ["Bieletas", "Unen la barra estabilizadora a la suspensión; típica fuente de “clac-clac” en baches."],
    ["Topes y cazoletas", "Soportes superiores del amortiguador."],
], [1.4, 3.6])
h2("Tipos de suspensión")
table(["Tipo", "Descripción", "Dónde"], [
    ["McPherson", "Amortiguador y resorte en un conjunto que además guía la rueda. Simple, compacta y económica.", "Eje delantero de la gran mayoría de autos y SUV."],
    ["Doble horquilla (doble triángulo, double wishbone)", "Dos brazos en forma de A. Mejor control de la rueda.", "Deportivos, camionetas (delantera), SUV de alta gama."],
    ["Multilink (multibrazo)", "Varios brazos independientes. Excelente confort y estabilidad.", "Eje trasero de autos y SUV de gama media-alta."],
    ["Eje de torsión (barra de torsión, semi-independiente)", "Viga que une las dos ruedas traseras. Económica, compacta, deja más espacio de maletero.", "Eje trasero de autos pequeños y medianos."],
    ["Eje rígido", "Eje sólido que une ambas ruedas. Muy robusto, gran recorrido.", "Eje trasero de camionetas y todoterrenos (con ballestas o espirales)."],
    ["Neumática / adaptativa", "Bolsas de aire o amortiguadores electrónicos que cambian altura o firmeza.", "Autos premium y SUV de lujo."],
], [1.5, 2.6, 1.6])
bl(["<b>Independiente</b>: cada rueda se mueve sola (más confort y agarre). <b>Dependiente / rígida</b>: las ruedas del eje se mueven juntas (más robustez y carga)."])
say("“Atrás tiene suspensión multilink: cada rueda trabaja independiente, así que en los baches y las curvas el auto se "
    "siente más firme y cómodo que uno con eje rígido.”")
h2("Dirección")
table(["Tipo", "Características"], [
    ["Mecánica", "Sin asistencia: pesada al estacionar. Autos muy antiguos o básicos."],
    ["Hidráulica", "Bomba movida por el motor con aceite hidráulico. Buena sensación, pero consume algo de energía; requiere revisar el líquido."],
    ["Electrohidráulica", "Bomba hidráulica movida por motor eléctrico."],
    ["Eléctrica / electroasistida (EPS)", "Motor eléctrico asiste el giro. Lo más común hoy: ahorra combustible, se puede ajustar (más liviana en ciudad, más firme en carretera) y permite asistentes como mantención de carril y estacionamiento automático."],
    ["Dirección variable / progresiva", "Cambia la relación de giro según la velocidad."],
    ["Dirección en las 4 ruedas", "Las ruedas traseras también giran levemente: menor radio de giro y más estabilidad. Alta gama."],
], [1.4, 3.6])
bl(["<b>Cremallera:</b> mecanismo que transforma el giro del volante en movimiento lateral de las ruedas.",
    "<b>Radio (diámetro) de giro:</b> espacio que necesita el auto para dar una vuelta completa (ej. 10,5 m). Menor = más fácil de maniobrar en ciudad.",
    "<b>Volante regulable en altura y profundidad:</b> mejor posición de manejo para personas de distinto tamaño."])
h2("Alineación y balanceo")
bl(["<b>Alineación:</b> ajustar los ángulos de las ruedas (convergencia, caída, avance) para que el auto vaya derecho y los neumáticos se gasten parejo. "
    "Se hace al cambiar neumáticos, tras un golpe fuerte o si el auto “se va” hacia un lado o el volante queda chueco.",
    "<b>Balanceo:</b> equilibrar el peso de cada rueda con pequeños contrapesos para evitar vibraciones (se siente en el volante a 80–120 km/h).",
    "<b>Rotación de neumáticos:</b> intercambiar posiciones (cada ~10.000 km) para que se desgasten parejo."])

# =====================================================================
chapter("8", "Frenos",
        "El sistema de seguridad más importante. El cliente pregunta poco por los frenos, pero valora mucho que le expliques que son buenos.")
h2("Cómo funcionan")
p("Al pisar el pedal, un <b>servofreno</b> (ayuda por vacío o eléctrica) multiplica la fuerza; la <b>bomba de freno</b> empuja el "
  "<b>líquido de frenos</b> por cañerías hasta las ruedas, donde las <b>pinzas (calipers)</b> aprietan las <b>pastillas</b> contra el "
  "<b>disco</b> (o las <b>balatas</b> contra el <b>tambor</b>). El roce transforma el movimiento en calor y el auto se detiene.")
table(["Tipo", "Descripción", "Ventajas", "Dónde"], [
    ["Disco sólido", "Disco metálico macizo.", "Simple y efectivo.", "Ejes traseros o autos pequeños."],
    ["Disco ventilado", "Disco con canales internos que disipan el calor.", "Resiste mejor el calentamiento en frenadas repetidas (bajadas largas).", "Eje delantero de la mayoría."],
    ["Disco perforado / ranurado", "Con agujeros o ranuras.", "Mejor evacuación de calor y gases; uso deportivo.", "Deportivos."],
    ["Tambor", "Cilindro con balatas que empujan hacia afuera.", "Barato, duradero, buen freno de mano.", "Eje trasero de autos económicos y camionetas."],
    ["Carbono-cerámicos", "Discos de compuesto cerámico.", "Muy livianos y resistentes al calor; carísimos.", "Superdeportivos."],
], [1.1, 1.6, 1.8, 1.4])
p("Cuando una ficha dice <b>“disco/disco”</b> significa discos en las cuatro ruedas (mejor); <b>“disco/tambor”</b> significa discos "
  "adelante y tambores atrás (suficiente para autos livianos; el eje delantero hace ~70% del trabajo de frenado).")
h2("Mantención de frenos")
bl(["<b>Pastillas:</b> duran ~20.000–60.000 km según uso. Muchas tienen un testigo sonoro (chirrido) o sensor en el tablero.",
    "<b>Discos:</b> duran 2–3 cambios de pastillas; se reemplazan si tienen espesor bajo el mínimo o están deformados (vibración en el pedal o volante al frenar).",
    "<b>Líquido de frenos (DOT 3, DOT 4, DOT 5.1):</b> absorbe humedad con el tiempo; se cambia cada ~2 años o según pauta.",
    "Señales de alerta: chirrido metálico, pedal esponjoso o que baja mucho, auto que se tira a un lado al frenar, testigo rojo de frenos."])
h2("Electrónica de frenado")
table(["Sistema", "Qué hace", "Cómo explicarlo"], [
    ["ABS (antibloqueo)", "Evita que las ruedas se bloqueen al frenar fuerte.", "“Puedes frenar a fondo y seguir esquivando el obstáculo con el volante.” Se siente como vibración en el pedal: es normal."],
    ["EBD (distribución electrónica de frenado)", "Reparte la fuerza entre ruedas según la carga.", "“Frena mejor aunque vayas cargado.”"],
    ["BA / BAS (asistente de frenado)", "Detecta una frenada de emergencia y aplica la máxima fuerza.", "“Si frenas de golpe, el auto completa la frenada por ti.”"],
    ["ESS (señal de frenado de emergencia)", "Las luces de freno o intermitentes parpadean en frenadas bruscas.", "“Avisa al de atrás que frenaste fuerte.”"],
    ["Freno de estacionamiento eléctrico (EPB)", "Botón en vez de palanca.", "“Libera espacio y se suelta solo al acelerar.”"],
    ["Auto Hold", "Mantiene el auto detenido sin pisar el freno (semáforos, taco).", "“En el taco puedes soltar el pie del freno.”"],
    ["Freno regenerativo", "En híbridos y eléctricos, el motor eléctrico frena y recarga la batería.", "“Al frenar, recupera energía.” Además las pastillas duran mucho más."],
    ["Freno multicolisión", "Frena automáticamente después de un primer impacto para evitar choques secundarios.", "“Si chocas, el auto frena solo para no seguir avanzando.”"],
], [1.4, 1.8, 2.3])

# =====================================================================
chapter("9", "Neumáticos y llantas",
        "Son el único punto de contacto del auto con el suelo: cada neumático toca el piso con una superficie del tamaño de una mano.")
h2("Cómo leer la medida de un neumático")
story.append(TireCode())
table(["Dato", "Ejemplo", "Significado"], [
    ["Ancho", "205", "Ancho de la banda de rodadura en milímetros."],
    ["Perfil (serie)", "55", "Altura del flanco como % del ancho (55% de 205 mm ≈ 113 mm). Perfil bajo (35–50) = más deportivo y preciso, menos cómodo; perfil alto (60–80) = más cómodo y resistente a baches."],
    ["Construcción", "R", "Radial (prácticamente todos los neumáticos actuales)."],
    ["Aro / diámetro de llanta", "16", "Diámetro de la llanta en pulgadas."],
    ["Índice de carga", "91", "Peso máximo por neumático (91 = 615 kg). Debe ser igual o mayor al indicado por el fabricante."],
    ["Índice de velocidad", "V", "Velocidad máxima soportada: Q 160, R 170, S 180, T 190, H 210, V 240, W 270, Y 300 km/h."],
], [1.1, 0.7, 3.2])
p("En camionetas también se ve la nomenclatura en pulgadas, por ejemplo <b>31x10.5 R15</b> (31\" de diámetro total, 10,5\" de ancho, aro 15), "
  "o la letra <b>LT</b> (light truck, carga liviana) con más capas y mayor resistencia.")
h2("Otras marcas del flanco")
bl(["<b>DOT + 4 dígitos (ej. 2324):</b> fecha de fabricación: semana 23 del año 2024. Se recomienda no usar neumáticos de más de 5–6 años aunque tengan dibujo (la goma se endurece y agrieta).",
    "<b>TWI / indicador de desgaste:</b> pequeños relieves dentro de los canales. El mínimo legal de profundidad en Chile es 1,6 mm; se recomienda cambiar a los 2–3 mm por seguridad en lluvia.",
    "<b>M+S (Mud and Snow):</b> apto para barro y nieve leve. <b>Símbolo de montaña con copo de nieve (3PMSF):</b> neumático certificado para invierno severo.",
    "<b>XL / Reinforced:</b> estructura reforzada, mayor carga.",
    "<b>Treadwear / Traction / Temperature (UTQG):</b> índice de duración relativa (ej. 400), adherencia en mojado (AA, A, B, C) y resistencia al calor (A, B, C).",
    "<b>Run Flat (RFT, ZP, SSR):</b> permite seguir rodando ~80 km a 80 km/h tras un pinchazo. Muchos autos con run flat no traen rueda de repuesto."])
h2("Tipos de neumático según uso")
table(["Tipo", "Uso"], [
    ["Pasajero / turismo", "Autos de ciudad y carretera."],
    ["HP / UHP (high performance)", "Deportivos: máximo agarre en pavimento."],
    ["H/T (highway terrain)", "SUV y camionetas que andan mayormente en pavimento: silenciosos y duraderos."],
    ["A/T (all terrain)", "Uso mixto 50/50 pavimento y tierra: tacos más marcados."],
    ["M/T (mud terrain)", "Off-road extremo, barro y roca: ruidosos en pavimento."],
    ["Invierno / nieve", "Goma más blanda para bajas temperaturas, con laminillas para nieve y hielo."],
    ["All season / 4 estaciones", "Compromiso para todo el año."],
    ["Baja resistencia a la rodadura (eco)", "Mejoran el consumo; común en híbridos y eléctricos."],
], [1.5, 3.5])
h2("Llantas (aros)")
bl(["<b>Acero (con o sin tapas):</b> económicas, resistentes, se reparan fácil. Versiones de entrada y camionetas de trabajo.",
    "<b>Aleación (aluminio):</b> más livianas, mejor disipación de calor de los frenos y mejor estética. Versiones medias y altas.",
    "<b>Diamantadas / bitono:</b> aleación con acabado pulido; muy estéticas, pero sensibles a rayones con la vereda.",
    "<b>Aro más grande</b> = mejor estética y precisión, pero neumáticos más caros, menos confort y más riesgo de daño en baches."])
h2("Rueda de repuesto y presión")
bl(["<b>Repuesto de medida completa:</b> igual a las demás. <b>Temporal (“galletita”)</b>: más angosto, solo para llegar al taller (máx. ~80 km/h). "
    "<b>Kit de reparación (sellante + compresor)</b>: sin repuesto, ahorra peso y espacio.",
    "<b>Presión:</b> la indicada en la etiqueta del marco de la puerta del conductor, tapa del estanque o manual (en PSI o bar; 1 bar ≈ 14,5 PSI). Se mide en frío, una vez al mes. "
    "Presión baja = más consumo, desgaste en bordes y riesgo de reventón.",
    "<b>TPMS:</b> sensor de presión de neumáticos que avisa en el tablero si alguno pierde aire. Directo (sensor en cada rueda, muestra la presión exacta) o indirecto (usa el ABS para detectar diferencias)."])
say("“Este auto trae sensor de presión de neumáticos: si se te pincha uno o pierde aire, el tablero te avisa antes de que sea peligroso.”")

# =====================================================================
chapter("10", "Seguridad: pasiva, activa y asistentes (ADAS)",
        "La seguridad es uno de los argumentos de venta más poderosos, especialmente para familias. Conviene dominarla en detalle.")
h2("Seguridad pasiva: protege cuando el choque ya ocurre")
table(["Elemento", "Detalle"], [
    ["Airbags frontales", "Conductor (volante) y acompañante (tablero). Obligatorios en Chile en autos nuevos."],
    ["Airbags laterales", "En los costados de los asientos: protegen tórax y cadera."],
    ["Airbags de cortina", "Bajan desde el techo cubriendo las ventanas: protegen la cabeza delante y atrás."],
    ["Airbag de rodilla", "Bajo el volante: protege las piernas del conductor."],
    ["Airbag central", "Entre los asientos delanteros: evita que conductor y acompañante choquen entre sí."],
    ["Desactivación de airbag del acompañante", "Interruptor para instalar una silla de bebé mirando hacia atrás en el asiento delantero."],
    ["Cinturones de 3 puntas", "En todas las plazas, incluida la central trasera."],
    ["Pretensores y limitadores de carga", "Tensan el cinturón al detectar choque y luego liberan un poco para no dañar el tórax."],
    ["Apoyacabezas activos", "Reducen el “latigazo cervical” en impactos traseros."],
    ["ISOFIX / LATCH + Top Tether", "Anclajes para fijar sillas de niños directamente a la estructura del auto, sin depender del cinturón. Mucho más seguro y fácil de instalar."],
    ["Célula de seguridad y zonas de deformación", "Estructura rígida en cabina y frente/cola diseñados para absorber energía."],
    ["Columna de dirección colapsable, pedales retráctiles", "Se desplazan en un choque para no herir al conductor."],
    ["eCall / llamada de emergencia (SOS)", "Llama automáticamente a emergencias tras un choque, en autos con conectividad."],
], [1.6, 3.4])
h2("Seguridad activa: ayuda a evitar el choque")
table(["Sistema", "Sigla / otros nombres", "Qué hace"], [
    ["Control de estabilidad", "ESP, ESC, VSC, VSA, DSC", "Detecta derrapes y frena ruedas individualmente para devolver el auto a su trayectoria. Es el sistema que más vidas ha salvado después del cinturón."],
    ["Control de tracción", "TCS, ASR, TRC", "Evita que las ruedas patinen al acelerar (lluvia, ripio)."],
    ["Asistente de partida en pendiente", "HSA, HAC, HHC", "Retiene el auto 2–3 segundos al soltar el freno en subida, para que no se vaya hacia atrás."],
    ["Control de descenso", "HDC, DAC", "Baja pendientes pronunciadas a velocidad lenta y constante sin pisar el freno (off-road)."],
    ["Control anti-vuelco", "ROM, RSC", "Detecta riesgo de volcamiento y actúa sobre frenos y motor."],
    ["Estabilizador de remolque", "TSA, TSM", "Corrige el zigzagueo del remolque."],
], [1.5, 1.3, 2.7])
h2("ADAS: asistentes avanzados a la conducción")
p("Usan <b>cámaras</b>, <b>radares</b> y <b>sensores ultrasónicos</b> para ver el entorno. Cada marca les pone nombre comercial "
  "propio (paquetes tipo “Sensing”, “Safety Sense”, “Co-Pilot”, “i-Activsense”, “SmartSense”, etc.), pero las funciones son las mismas:")
table(["Función", "Sigla habitual", "Qué hace"], [
    ["Frenado autónomo de emergencia", "AEB, FCA, CMBS", "Detecta un auto, peatón o ciclista adelante y frena solo si el conductor no reacciona."],
    ["Alerta de colisión frontal", "FCW", "Avisa con sonido y luz de un posible choque."],
    ["Control crucero", "CC", "Mantiene una velocidad fija sin pisar el acelerador."],
    ["Control crucero adaptativo", "ACC", "Mantiene la velocidad <b>y la distancia</b> con el auto de adelante; frena y acelera solo. Versión “Stop &amp; Go” llega a detenerse y retoma en el taco."],
    ["Limitador de velocidad", "SL", "Impide superar la velocidad elegida."],
    ["Alerta de salida de carril", "LDW", "Avisa si el auto se sale del carril sin poner el intermitente."],
    ["Asistente de mantención de carril", "LKA, LKAS", "Corrige suavemente la dirección para mantener el auto en el carril."],
    ["Centrado de carril", "LFA, LCA, LTA", "Mantiene el auto centrado de forma continua (con ACC = conducción semiautónoma nivel 2)."],
    ["Monitor de punto ciego", "BSM, BSD, BLIS", "Luz en el espejo si hay un vehículo en el punto ciego."],
    ["Alerta de tráfico cruzado trasero", "RCTA, RCTW", "Avisa de autos que vienen de lado al salir en reversa de un estacionamiento."],
    ["Reconocimiento de señales", "TSR", "Lee las señales de tránsito (velocidad máxima) y las muestra en el tablero."],
    ["Luces altas automáticas", "AHB, HBA", "Cambia sola entre luces altas y bajas."],
    ["Detector de fatiga", "DAA, DAW, DMS", "Detecta somnolencia o distracción y sugiere descansar."],
    ["Cámara de retroceso", "—", "Imagen trasera con líneas guía al poner reversa."],
    ["Cámara 360°", "AVM, SVM", "Vista aérea virtual del auto para estacionar."],
    ["Sensores de estacionamiento", "PDC", "Pitidos que aumentan al acercarse a un obstáculo (delanteros y/o traseros)."],
    ["Estacionamiento automático", "IPA, Park Assist", "El auto gira el volante (y a veces acelera y frena) para estacionarse solo."],
    ["Alerta de ocupante trasero", "ROA", "Recuerda revisar el asiento trasero al bajar (niños, mascotas)."],
    ["Alerta de salida segura", "SEA", "Avisa si al abrir la puerta se acerca un auto o ciclista."],
], [1.7, 1.0, 2.8])
warn("Los ADAS <b>asisten</b>, no reemplazan al conductor. Ningún auto a la venta hoy en Chile es “autónomo”: el conductor siempre debe "
     "mantener las manos en el volante y la atención en el camino. No prometas que “el auto se maneja solo”.")
h2("Niveles de conducción autónoma (SAE)")
table(["Nivel", "Descripción"], [
    ["0", "Sin automatización (puede haber alertas)."],
    ["1", "Asiste en una cosa: dirección O velocidad (ej. ACC)."],
    ["2", "Asiste dirección Y velocidad a la vez, el conductor supervisa todo el tiempo (ACC + centrado de carril). Es lo más avanzado común hoy."],
    ["3", "El auto maneja en condiciones específicas y el conductor puede desatender, pero debe retomar si se le pide. Muy limitado y regulado."],
    ["4–5", "Conducción autónoma real (con o sin restricciones). Solo pilotos y robotaxis en ciertas ciudades del mundo."],
], [0.6, 4.4])
h2("Pruebas de choque: Latin NCAP y otros")
bl(["<b>Latin NCAP</b> evalúa autos vendidos en Latinoamérica con 0 a 5 estrellas: protección de adultos, de niños, de peatones y "
    "asistencias de seguridad. Los protocolos se endurecen con los años, así que compara estrellas del mismo año o protocolo.",
    "<b>Euro NCAP</b> (Europa), <b>IIHS / NHTSA</b> (EE.UU.), <b>ANCAP</b> (Australia), <b>C-NCAP</b> (China), <b>ASEAN NCAP</b>. "
    "Ojo: un mismo modelo puede tener distinto equipamiento y estructura según el mercado; la nota europea no siempre aplica al auto vendido en Chile.",
    "En Chile existe la <b>Ley de Seguridad Vehicular</b> que exige gradualmente equipamiento mínimo en autos nuevos (airbags frontales y laterales, "
    "control de estabilidad, ABS, anclajes ISOFIX, entre otros). Confirma siempre la normativa vigente."])
say("“Este auto tiene 6 airbags y control de estabilidad, que es el sistema que más accidentes evita después del cinturón. "
    "Además trae ISOFIX: la silla de tu hijo queda anclada directo a la estructura.”")

# =====================================================================
chapter("11", "Híbridos y eléctricos",
        "Es el tema con más dudas de los clientes hoy, y donde un vendedor bien preparado marca la diferencia.")
h2("Tipos de electrificación")
table(["Tipo", "Sigla", "Cómo funciona", "¿Se enchufa?", "Autonomía eléctrica"], [
    ["Híbrido ligero / suave", "MHEV (48 V o 12 V)", "Un pequeño motor-generador eléctrico ayuda al motor a combustión al partir y acelerar; mejora el Start-Stop. No mueve el auto solo.", "No", "Ninguna (solo asiste)."],
    ["Híbrido convencional / autorrecargable", "HEV / FHEV", "Motor a combustión + motor eléctrico + batería pequeña que se recarga sola al frenar y con el motor. Puede andar unos metros solo eléctrico a baja velocidad.", "No", "1–2 km a baja velocidad."],
    ["Híbrido enchufable", "PHEV", "Batería más grande que se carga enchufándola. Anda decenas de km 100% eléctrico y luego funciona como híbrido.", "Sí", "40–100+ km según modelo (ciclo WLTP)."],
    ["Eléctrico de autonomía extendida", "EREV / REEV", "Las ruedas las mueve siempre el motor eléctrico; un motor a combustión pequeño solo genera electricidad.", "Sí", "100–200+ km eléctricos y luego con el generador."],
    ["Eléctrico a batería", "BEV / EV", "Solo motor(es) eléctrico(s) y batería. Cero emisiones locales.", "Sí", "250–600+ km según modelo."],
    ["Celda de combustible (hidrógeno)", "FCEV", "Genera electricidad a partir de hidrógeno; solo emite agua.", "No (se carga hidrógeno)", "500+ km. Muy poco disponible."],
], [1.2, 0.9, 2.3, 0.8, 1.2])
say("“Un híbrido normal no se enchufa nunca: se recarga solo al frenar. Un híbrido enchufable lo puedes cargar en tu casa y hacer "
    "tu día a día en modo eléctrico, y para viajes largos usa bencina sin ninguna preocupación.”")
h2("La batería")
bl(["<b>Capacidad (kWh):</b> el “tamaño del estanque”. Autos eléctricos: ~30–100 kWh. Se habla de capacidad bruta y neta (utilizable).",
    "<b>Química:</b> <b>LFP</b> (litio-ferrofosfato): más durable, segura, económica, se puede cargar al 100% habitualmente, algo menos densa. "
    "<b>NMC/NCM</b> (níquel-manganeso-cobalto): más densa (más autonomía en menos peso); se recomienda cargar al 80–90% en el día a día.",
    "<b>Degradación:</b> pérdida gradual de capacidad. En autos modernos suele ser baja (en general, del orden de 1–2% por año en uso normal). "
    "Factores que la aceleran: cargas rápidas DC muy frecuentes, mantener la batería al 100% o cerca de 0% por largos periodos, calor extremo.",
    "<b>Garantía de batería:</b> normalmente 8 años o 160.000 km (garantiza típicamente un mínimo de ~70% de capacidad). Verifica la del modelo específico.",
    "<b>SOH (State of Health):</b> estado de salud de la batería en %. Clave al vender un eléctrico usado: pedir el informe.",
    "<b>SOC (State of Charge):</b> nivel de carga actual en %.",
    "<b>Gestión térmica:</b> sistema que calienta o enfría la batería; mejora vida útil y velocidad de carga."])
h2("Autonomía: ciclos de homologación")
table(["Ciclo", "Comentario"], [
    ["NEDC", "Antiguo ciclo europeo, muy optimista. Ya no se usa en Europa, pero aún aparece en algunas fichas."],
    ["WLTP", "Ciclo actual europeo/internacional, más realista. Valor de referencia más usado."],
    ["EPA", "Ciclo de EE.UU., el más conservador (más cercano al uso real en carretera)."],
    ["CLTC", "Ciclo chino; bastante optimista. Común en marcas chinas."],
], [1, 4])
p("La autonomía real depende de la velocidad (en carretera a 120 km/h se consume bastante más que en ciudad), uso de climatización, "
  "temperatura (con frío la autonomía cae), carga, neumáticos y estilo de manejo. Regla práctica: espera entre 70% y 90% de la cifra WLTP en uso mixto, "
  "y algo menos en carretera rápida o con mucho frío.")
warn("Siempre aclara en qué ciclo está la autonomía informada (WLTP, NEDC, CLTC o EPA). Comparar un auto con autonomía CLTC contra otro con EPA "
     "es comparar peras con manzanas.")
h2("Carga")
table(["Tipo", "Potencia", "Dónde", "Tiempo aprox. (batería 60 kWh)"], [
    ["Enchufe doméstico (Modo 2, cargador portátil)", "~2–3 kW", "Cualquier enchufe de casa (idealmente circuito dedicado).", "20–30 horas de 0 a 100%."],
    ["Wallbox / cargador mural AC monofásico", "7 kW (hasta 7,4)", "Casa, edificio, oficina. Requiere instalación certificada (en Chile, declarada ante la SEC).", "8–10 horas (cargar de noche)."],
    ["AC trifásico", "11–22 kW", "Empresas, estacionamientos públicos.", "3–6 horas (si el auto acepta esa potencia)."],
    ["Carga rápida DC", "50–150 kW", "Electrolineras públicas, carreteras.", "30–60 min de 10% a 80%."],
    ["Carga ultrarrápida DC", "150–350+ kW", "Electrolineras de última generación.", "15–30 min de 10% a 80%."],
], [1.7, 0.9, 1.6, 1.4])
bl(["<b>AC (corriente alterna):</b> carga lenta; el cargador va dentro del auto (“cargador a bordo, OBC”), que limita la potencia máxima en AC (ej. 6,6 kW, 7 kW, 11 kW).",
    "<b>DC (corriente continua):</b> carga rápida; la estación entrega directo a la batería. Cada auto tiene una <b>potencia máxima de carga DC</b> (ej. 100 kW).",
    "<b>Curva de carga:</b> la potencia es máxima con la batería baja y disminuye sobre ~80%. Por eso se habla de “10 a 80%”.",
    "<b>kW vs kWh:</b> kW es potencia (velocidad de carga, como litros por minuto de una manguera); kWh es energía (cantidad, como los litros del estanque)."])
h3("Conectores")
table(["Conector", "Uso"], [
    ["Tipo 1 (J1772)", "AC, usado en autos de origen norteamericano/japonés antiguos."],
    ["Tipo 2 (Mennekes)", "AC, estándar europeo y el más común en Chile para AC."],
    ["CCS1 / CCS Combo 1", "Tipo 1 + dos pines DC para carga rápida."],
    ["CCS2 / CCS Combo 2", "Tipo 2 + dos pines DC. Es el estándar de carga rápida establecido en Chile."],
    ["CHAdeMO", "Carga rápida DC, estándar japonés (en retirada)."],
    ["GB/T", "Estándar chino (AC y DC). Algunos autos chinos importados lo usan; existen adaptadores."],
    ["NACS (Tesla)", "Estándar norteamericano en expansión."],
], [1.4, 3.6])
h2("Conceptos de manejo eléctrico")
bl(["<b>Freno regenerativo / niveles de regeneración:</b> al soltar el acelerador el motor eléctrico frena y recarga la batería; suele ajustarse con levas.",
    "<b>One-pedal / i-Pedal:</b> con regeneración máxima se puede manejar casi solo con el acelerador; al soltarlo el auto se detiene.",
    "<b>Bomba de calor:</b> calefacción eficiente que reduce la pérdida de autonomía en invierno.",
    "<b>Preacondicionamiento:</b> climatizar la cabina o la batería mientras el auto está enchufado (vía app).",
    "<b>V2L (vehicle-to-load):</b> el auto entrega energía a aparatos externos (camping, herramientas). <b>V2H/V2G</b>: a la casa o a la red.",
    "<b>Consumo eléctrico:</b> se mide en kWh/100 km (ej. 15 kWh/100 km). Para calcular costo: consumo × precio del kWh.",
    "<b>Mantención:</b> mucho menor: no hay aceite de motor, bujías, correa de distribución, embrague ni filtros de combustible; los frenos se desgastan menos. "
    "Sí hay: neumáticos (se desgastan algo más por el peso y el torque), líquido de frenos, refrigerante de batería, filtro de cabina, revisión de suspensión.",
    "<b>Ruido:</b> son muy silenciosos; por norma emiten un sonido a baja velocidad (AVAS) para alertar a peatones."])
h2("Ventajas y consideraciones (para conversar honestamente)")
table(["Ventajas", "Consideraciones"], [
    ["Costo por km mucho menor que la bencina (especialmente cargando en casa).", "Precio de compra más alto (aunque la brecha se ha reducido)."],
    ["Mantención más simple y barata.", "Necesita idealmente dónde cargar en casa o en el trabajo."],
    ["Aceleración inmediata y silencio.", "Viajes largos requieren planificar paradas de carga."],
    ["Cero emisiones locales; beneficios como menor permiso de circulación y acceso a ciertas exenciones (verificar vigencia).", "Valor de reventa en evolución; depende del estado de la batería."],
    ["Híbridos: gran ahorro en ciudad sin cambiar hábitos ni enchufar.", "Reparaciones de alta tensión requieren talleres especializados."],
], [1, 1])
key("Para elegir: <b>muchos km en ciudad y sin dónde enchufar → híbrido (HEV)</b>. <b>Trayectos diarios cortos, carga en casa y viajes ocasionales → PHEV</b>. "
    "<b>Carga en casa y uso mayormente urbano/regional → eléctrico (BEV)</b>.")

# =====================================================================
chapter("12", "Interior, confort y tecnología",
        "Es lo que el cliente ve, toca y usa todos los días. Muchas ventas se deciden aquí.")
h2("Conectividad y multimedia")
table(["Elemento", "Qué es / qué decir"], [
    ["Pantalla táctil (pulgadas)", "Tamaño medido en diagonal (ej. 8\", 10,25\", 12,3\")."],
    ["Apple CarPlay / Android Auto", "Proyecta el celular en la pantalla del auto: Waze, Google Maps, Spotify, WhatsApp por voz. Puede ser con cable o <b>inalámbrico</b>."],
    ["Bluetooth", "Llamadas manos libres y música desde el celular."],
    ["Puertos USB-A / USB-C", "Carga y conexión de datos. Pregunta cuántos hay y si hay atrás."],
    ["Cargador inalámbrico (Qi)", "Base para cargar el celular sin cable."],
    ["Navegador integrado (GPS)", "Navegación propia del auto, sin depender del celular."],
    ["Sistema de audio", "Número de parlantes y marca (Bose, Harman Kardon, JBL, Bang &amp; Olufsen, etc.)."],
    ["Auto conectado / app", "App para ver ubicación, abrir/cerrar, encender climatización, revisar carga, recibir alertas."],
    ["Actualizaciones OTA (over the air)", "El auto recibe mejoras de software por internet, como un celular."],
    ["Asistente de voz", "Comandos por voz (“tengo frío”, “llévame a…”)."],
    ["Wi-Fi hotspot", "El auto genera una red Wi-Fi para los pasajeros (requiere plan de datos)."],
], [1.5, 3.5])
h2("Instrumentación")
bl(["<b>Cluster análogo:</b> agujas tradicionales. <b>Semi-digital:</b> agujas + pantalla central. <b>Digital (virtual cockpit):</b> pantalla configurable completa.",
    "<b>Computador a bordo:</b> muestra consumo instantáneo y promedio, autonomía restante, temperatura exterior, kilómetros parciales.",
    "<b>HUD (Head-Up Display):</b> proyecta velocidad y navegación en el parabrisas, para no bajar la vista."])
h2("Climatización")
bl(["<b>Aire acondicionado manual:</b> perillas, el conductor ajusta todo.",
    "<b>Climatizador automático:</b> eliges la temperatura (ej. 21 °C) y el auto la mantiene solo.",
    "<b>Bi-zona / tri-zona / cuatro zonas:</b> temperaturas independientes para conductor, acompañante y atrás.",
    "<b>Salidas de aire traseras:</b> muy valoradas por familias en verano.",
    "<b>Ionizador / purificador / filtro PM2.5:</b> mejoran la calidad del aire interior.",
    "<b>Desempañador trasero y parabrisas calefaccionado:</b> útiles en invierno y zonas lluviosas."])
h2("Asientos y tapicería")
bl(["<b>Tela, ecocuero (cuero sintético), cuero natural, Alcántara/microfibra.</b> Ecocuero: fácil de limpiar, ideal con niños y mascotas.",
    "<b>Regulación manual o eléctrica</b> (número de posiciones, ej. “eléctrico de 8 vías”), <b>soporte lumbar</b>, <b>memoria</b> de posiciones.",
    "<b>Asientos calefaccionados / ventilados / con masaje.</b> Volante calefaccionado.",
    "<b>Asientos traseros abatibles (60/40), reclinables, deslizables.</b> Tercera corrida en 7 plazas.",
    "<b>Apoyabrazos central trasero con portavasos</b>, bolsillos, mesas plegables."])
h2("Comodidades y accesos")
table(["Elemento", "Descripción"], [
    ["Llave inteligente / Keyless entry", "Abrir y cerrar el auto sin sacar la llave del bolsillo (tocando la manilla)."],
    ["Encendido por botón (Push Start)", "Encender el motor con un botón, llevando la llave encima."],
    ["Encendido remoto", "Encender el motor (y climatizar) a distancia con la llave o app."],
    ["Llave digital", "El celular o una tarjeta NFC funciona como llave."],
    ["Portalón eléctrico / manos libres", "Se abre con botón o pasando el pie bajo el parachoques."],
    ["Techo solar / sunroof", "Panel de vidrio que se abre sobre los asientos delanteros."],
    ["Techo panorámico", "Gran superficie de vidrio sobre ambas filas (puede o no abrirse)."],
    ["Espejo electrocrómico", "Se oscurece solo para no encandilar con luces de atrás."],
    ["Sensor de lluvia / luces", "Activan automáticamente limpiaparabrisas y luces."],
    ["Alzavidrios eléctricos “one touch” / antipinzamiento", "Suben o bajan con un toque; se detienen si detectan una mano."],
    ["Iluminación ambiental", "Luces LED de colores en el interior."],
    ["Cortinas parasol traseras", "Protegen del sol a los pasajeros traseros."],
    ["Enchufe 12 V / 220 V", "Para conectar aparatos."],
], [1.6, 3.4])
h2("Maletero y capacidad de carga")
bl(["Se mide en <b>litros</b> (norma VDA, con bloques estándar). Referencias: hatchback pequeño 250–350 L; sedán 400–550 L; SUV mediano 450–600 L; con asientos abatidos 1.200–1.800 L.",
    "Importan también la <b>forma</b>, la <b>altura del umbral de carga</b> (qué tan alto hay que levantar las cosas), si el piso queda plano al abatir y si hay doble fondo.",
    "En camionetas: <b>dimensiones del pick-up</b> (largo × ancho × alto, y ancho entre pasos de rueda) y <b>carga útil</b> en kg (normalmente 700–1.100 kg).",
    "<b>Capacidad de arrastre (remolque):</b> peso máximo que puede tirar, con freno en el remolque y sin freno (ej. 3.500 kg con freno / 750 kg sin freno)."])

# =====================================================================
chapter("13", "Cómo leer una ficha técnica completa",
        "Con todo lo anterior, ya puedes interpretar cualquier ficha técnica. Aquí tienes cada dato, qué significa y cómo usarlo en la venta.")
h2("Dimensiones")
table(["Dato", "Qué es", "Para qué sirve en la venta"], [
    ["Largo total", "De parachoques a parachoques.", "Tamaño, si cabe en el estacionamiento o garaje."],
    ["Ancho", "Sin espejos (a veces se informa con espejos).", "Espacio interior a lo ancho (3 adultos atrás)."],
    ["Alto", "Hasta el techo (sin o con barras).", "Acceso a estacionamientos subterráneos, posición de manejo."],
    ["Distancia entre ejes", "Distancia entre el centro de las ruedas delanteras y traseras.", "<b>Más distancia = más espacio interior para las piernas</b> y más estabilidad en carretera."],
    ["Trocha (vía)", "Distancia entre ruedas de un mismo eje.", "Más ancha = más estabilidad."],
    ["Despeje", "Altura libre al suelo.", "Lomos de toro, caminos rurales, off-road."],
    ["Voladizos", "Lo que sobresale delante y detrás de las ruedas.", "Ángulos de ataque/salida."],
], [1.2, 1.8, 2.2])
h2("Pesos")
table(["Dato", "Qué es"], [
    ["Peso en orden de marcha (curb weight)", "Peso del auto listo para andar, con fluidos y estanque casi lleno (a veces incluye 75 kg del conductor)."],
    ["Peso bruto vehicular (PBV / GVW)", "Peso máximo autorizado: auto + pasajeros + carga."],
    ["Carga útil (payload)", "PBV menos peso en orden de marcha: cuánto puedes cargar entre personas y equipaje."],
    ["Peso máximo de remolque", "Con y sin freno en el remolque."],
    ["Peso bruto combinado", "Auto + remolque, cargados."],
], [1.7, 3.3])
h2("Ejemplo práctico de lectura")
p("Supongamos esta ficha: <i>“Motor 1.5 turbo, 4 cilindros, 16V DOHC, inyección directa, 170 HP a 5.500 rpm, 250 Nm entre 1.500 y 4.000 rpm. "
  "Caja CVT con 8 marchas simuladas y levas. Tracción delantera. Suspensión McPherson / multilink. Frenos disco ventilado / disco. "
  "Neumáticos 225/55 R18. 6 airbags, ESP, ACC, AEB, LKA, BSM. Distancia entre ejes 2.700 mm. Maletero 520 L. Rendimiento mixto 14,5 km/L.”</i>")
p("Cómo lo explicarías:")
bl(["“Tiene un motor 1.5 turbo de 170 caballos: rinde como un motor mucho más grande, pero gasta como uno chico: unos 14,5 km por litro mixto.”",
    "“Sus 250 Nm de torque están disponibles desde 1.500 rpm, o sea, desde que aceleras sientes que empuja, incluso con la familia y el maletero lleno.”",
    "“La caja es CVT: muy suave, sin tirones, y si quieres manejar más deportivo tienes levas detrás del volante.”",
    "“Atrás tiene suspensión multilink y frenos de disco en las cuatro ruedas: más confort y mejor frenado que la mayoría de su segmento.”",
    "“Viene con 6 airbags y un paquete completo de asistentes: control crucero adaptativo que mantiene distancia solo, frenado autónomo de emergencia, "
    "mantención de carril y monitor de punto ciego.”",
    "“La distancia entre ejes de 2,7 metros se traduce en mucho espacio para las piernas atrás, y el maletero de 520 litros alcanza para el equipaje de vacaciones de una familia de cuatro.”"])
key("La fórmula de oro: <b>Característica → Ventaja → Beneficio</b>. “Tiene control crucero adaptativo (característica), que mantiene la distancia con el auto de adelante "
    "(ventaja), así en carretera llegas menos cansado y más seguro (beneficio).”")
