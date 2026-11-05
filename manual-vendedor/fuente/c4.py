from lib import *

# =====================================================================
chapter("19", "Del conocimiento a la venta",
        "Saber de autos solo sirve si lo conviertes en recomendaciones útiles para cada cliente.")
h2("Preguntas para descubrir lo que el cliente necesita")
bl(["¿Para qué usará principalmente el auto? (ciudad, carretera, trabajo, campo, viajes, Uber/aplicaciones)",
    "¿Cuántas personas viajan normalmente? ¿Hay niños pequeños (sillas)? ¿Mascotas?",
    "¿Cuántos kilómetros recorre al mes aproximadamente?",
    "¿Sale a caminos de tierra, nieve, playa, cordillera? ¿Remolca algo (bote, carro, caballos)?",
    "¿Prefiere caja manual o automática? ¿Ha considerado un híbrido o eléctrico? ¿Tiene dónde cargar en casa?",
    "¿Dónde estaciona? (estacionamiento chico, subterráneo, calle)",
    "¿Qué es lo más importante para usted: consumo, seguridad, espacio, tecnología, diseño, potencia, valor de reventa?",
    "¿Cómo piensa pagarlo? ¿Tiene auto para dejar en parte de pago? ¿Qué cuota mensual le acomoda?",
    "¿Qué auto tiene hoy y qué le gusta o no le gusta de él?"])
h2("Perfiles típicos y qué destacar")
table(["Perfil", "Qué valora", "Qué recomendar / destacar"], [
    ["Joven / primer auto", "Precio, consumo, diseño, conectividad.", "Hatchback o SUV pequeño, CarPlay/Android Auto, bajo consumo, seguro y mantención económicos."],
    ["Familia con niños", "Seguridad, espacio, maletero, confort.", "SUV mediano o grande, ISOFIX, 6+ airbags, ADAS, salidas de aire traseras, maletero en litros, 7 asientos si son más de 5."],
    ["Uso intensivo / muchos km", "Consumo, confiabilidad, costo de mantención.", "Híbrido (ciudad) o diésel (carretera); cadena de distribución; plan de mantención y garantía."],
    ["Conductor de aplicaciones", "Consumo, durabilidad, espacio trasero, maletero.", "Sedán o SUV eficiente, híbrido; costo por km; asientos traseros cómodos."],
    ["Trabajo / campo / minería", "Robustez, carga, 4x4, durabilidad.", "Camioneta 4x4 diésel con reductora, carga útil, capacidad de arrastre, despeje, chasis de escalera."],
    ["Aventura / outdoor", "4x4, despeje, portaequipaje, autonomía.", "SUV o camioneta 4x4/AWD, neumáticos A/T, ángulos off-road, barras de techo, enchufe 220 V o V2L."],
    ["Ejecutivo", "Imagen, confort, tecnología, silencio.", "Sedán o SUV premium, tapiz de cuero, climatizador bi-zona, ACC, buen audio."],
    ["Adulto mayor", "Facilidad de acceso, visibilidad, simplicidad.", "SUV o crossover (asiento a la altura de la cadera), caja automática, cámara y sensores, mandos simples."],
    ["Entusiasta", "Potencia, manejo, sensaciones.", "Motor turbo, 0–100 km/h, caja DCT o manual, suspensión, frenos, modos de manejo."],
    ["Consciente del medioambiente", "Emisiones, eficiencia, tecnología.", "Híbrido, PHEV o eléctrico; costo por km; beneficios vigentes; autonomía real."],
], [1.2, 1.5, 2.6])
h2("La presentación del auto: recorrido en 6 puntos")
nl(["<b>Frente (¾ delantero):</b> diseño, luces (LED, automáticas), parrilla, sensores y cámara frontal si tiene.",
    "<b>Motor (capó abierto):</b> tipo de motor, potencia, torque, consumo, tipo de distribución, facilidad de mantención.",
    "<b>Lateral:</b> llantas y neumáticos, despeje, distancia entre ejes, espejos (calefaccionados, punto ciego), keyless.",
    "<b>Trasero y maletero:</b> litros, abertura, portalón eléctrico, abatimiento de asientos, rueda de repuesto, cámara.",
    "<b>Asientos traseros:</b> espacio para piernas y cabeza, salidas de aire, USB, ISOFIX, apoyabrazos.",
    "<b>Puesto del conductor:</b> posición de manejo, cluster, pantalla, conectividad, climatización, ADAS, modos de manejo. "
    "Invita al cliente a sentarse y a probar. Luego, <b>test drive</b>."])
h2("Durante el test drive")
bl(["Antes de partir, ajusta asiento, espejos y volante con el cliente; conecta su celular (CarPlay/Android Auto): se siente dueño.",
    "Elige una ruta que muestre virtudes: aceleración en una incorporación, suspensión en un tramo con lomos de toro, silencio en avenida, ACC en autopista si es posible.",
    "Muestra los asistentes de forma segura (sin forzar situaciones de riesgo).",
    "Deja que el cliente maneje y converse; observa qué le gusta y qué le preocupa."])
h2("Manejo de objeciones técnicas frecuentes")
table(["Objeción", "Respuesta sugerida"], [
    ["“El motor es muy chico.”", "“Es chico en cilindrada, pero con turbo: entrega más torque que muchos motores 1.8 o 2.0 sin turbo y gasta menos. Lo invito a probarlo en una subida.”"],
    ["“Las CVT se echan a perder.”", "“Las CVT actuales son muy confiables cuando se respeta su mantención con el aceite específico. Además son de las más eficientes y suaves en ciudad.”"],
    ["“Los turbo duran menos.”", "“Hoy la gran mayoría de los motores son turbo y están diseñados para durar igual que uno aspirado. La clave es usar el aceite correcto y respetar la mantención.”"],
    ["“Las marcas chinas no son confiables.”", "“Las marcas chinas han avanzado muchísimo: tienen garantías largas, buen equipamiento y varias tienen buenas evaluaciones de seguridad. Lo importante es revisar garantía, red de servicio y repuestos.”"],
    ["“El eléctrico no me sirve para viajar.”", "“Para el día a día cargas en casa. Para viajes, este modelo tiene X km de autonomía y carga del 10 al 80% en unos Y minutos. Planificamos la ruta juntos. Y si prefiere cero preocupación, un PHEV o híbrido es ideal.”"],
    ["“La batería del híbrido hay que cambiarla pronto y es carísima.”", "“Las baterías híbridas están diseñadas para durar la vida útil del auto y tienen garantía de 8 años en la mayoría de las marcas. Hay híbridos con cientos de miles de km con su batería original.”"],
    ["“Es más caro que el de la competencia.”", "“Comparemos versión por versión: este incluye X, Y, Z que el otro no trae o cobra aparte, más garantía de N años. Sumado, la diferencia real es menor o incluso conviene.”"],
    ["“Prefiero diésel porque gasta menos.”", "“Si hace muchos km en carretera, sí. Si es principalmente ciudad y trayectos cortos, un bencinero o un híbrido le saldrá más conveniente: menor precio, mantención más barata y sin riesgos de DPF.”"],
], [1.5, 3.5])
h2("Entrega del auto: checklist")
bl(["Explicar testigos del tablero, combustible correcto (octanaje o diésel) y cómo abrir la tapa del estanque.",
    "Configurar llaves, conectar el celular, explicar pantalla y app del auto.",
    "Explicar ADAS principales y cómo activarlos/desactivarlos; Start-Stop.",
    "Mostrar rueda de repuesto o kit de reparación, gata, llave de ruedas, triángulos y botiquín (elementos obligatorios), chaleco reflectante.",
    "Explicar plan de mantención, primera mantención (km/fecha) y condiciones de garantía.",
    "En eléctricos/PHEV: cómo cargar, cable, tipos de cargador, configuración de horarios de carga.",
    "Entregar documentos: factura o contrato, padrón (o comprobante de inscripción en trámite), SOAP, permiso de circulación, certificado de homologación o revisión técnica, manual."])

# =====================================================================
chapter("20", "Preguntas frecuentes de clientes (con respuestas modelo)",
        "Respuestas listas para usar. Adáptalas siempre a los datos de la ficha técnica del auto que estás vendiendo.")
h2("Motor y desempeño")
qa("¿Cuántos caballos tiene y eso es mucho o poco?",
   "Compara con el peso: una relación de 10–12 kg/HP es ágil; 13–16 kg/HP es normal; más de 16 kg/HP es tranquilo. "
   "“Tiene 150 HP para 1.350 kg; se va a sentir ágil incluso cargado.”")
qa("¿Qué es mejor, más caballos o más torque?",
   "“Para el día a día, el torque a bajas rpm es lo que más se siente: es la fuerza al partir, adelantar y subir. Los caballos importan para la velocidad y aceleración a alta velocidad.”")
qa("¿El motor es de correa o de cadena?",
   "Revisa la ficha o pregunta al servicio técnico. “Es de cadena, sin cambio programado” o “es de correa y se cambia a los X km; está considerado en el plan de mantención”.")
qa("¿Qué bencina usa?",
   "La indicada por el fabricante (manual y tapa del estanque): 93, 95 o 97 octanos. “Puede usar 95 sin problemas, que es lo recomendado; usar 97 no le da beneficios adicionales.”")
qa("¿Es turbo? ¿Qué cuidados tiene?",
   "“Sí. Solo necesita el aceite indicado y respetar la mantención; después de un viaje exigente, conviene dejarlo en ralentí unos segundos antes de apagar.”")
qa("¿Cuánto gasta?",
   "Entrega los valores de la etiqueta (urbano, extraurbano, mixto) y explica que el consumo real depende del manejo. Usa la fórmula de costo mensual del capítulo 14.")
qa("¿Cuál es la velocidad máxima / cuánto tarda en llegar a 100?",
   "Dato de la ficha. Contextualiza: “8,9 segundos es una aceleración ágil, por sobre el promedio de su segmento.”")
qa("¿Sirve para remolcar?",
   "Revisa la capacidad de arrastre con y sin freno. “Puede tirar hasta 750 kg sin freno y 1.500 kg con freno en el remolque; un carro de arrastre liviano está bien, un bote grande necesita una camioneta.”")
h2("Caja y tracción")
qa("¿Qué tipo de caja automática es?",
   "Convencional (convertidor de torque), CVT, doble embrague o AMT. Explica sus beneficios según el capítulo 6.")
qa("¿Es 4x4?",
   "Distingue: “Es AWD: reparte la fuerza a las 4 ruedas automáticamente cuando detecta pérdida de agarre, ideal para lluvia, ripio y nieve. "
   "No tiene reductora, así que no es para off-road extremo.” O: “Es 4x4 con reductora: puede subir pendientes y salir de barro o arena.”")
qa("¿Puedo usar el 4x4 en la carretera?",
   "AWD: sí, siempre funciona solo. 4x4 conectable (part-time) sin diferencial central: solo en superficies sueltas (tierra, nieve, ripio); en pavimento seco "
   "debe usarse en 2H porque puede forzar la transmisión.")
qa("¿Cada cuánto se cambia el embrague?",
   "“Depende mucho del uso; normalmente sobre 80.000–100.000 km. En ciudad con mucho taco, antes. No es un ítem de garantía porque es de desgaste.”")
h2("Seguridad")
qa("¿Cuántos airbags tiene? ¿Cuántas estrellas tiene en Latin NCAP?",
   "Dato de ficha y del sitio de Latin NCAP. Si no fue evaluado, dilo con honestidad y destaca el equipamiento de seguridad que tiene.")
qa("¿Frena solo?",
   "“Sí, tiene frenado autónomo de emergencia: si detecta un auto o peatón y usted no reacciona, frena solo. Es una ayuda, no reemplaza la atención del conductor.”")
qa("¿Tiene ISOFIX?",
   "“Sí, en las plazas laterales traseras (indicar cuántas). La silla se ancla directamente a la estructura.”")
h2("Mantención y garantía")
qa("¿Cada cuánto se hace la mantención y cuánto cuesta?",
   "Indica la pauta (km/tiempo) y los valores referenciales del servicio oficial. Si no los sabes: “Te envío la tabla de valores del servicio oficial hoy mismo”.")
qa("¿Pierdo la garantía si hago las mantenciones fuera de la marca?",
   "Depende de las condiciones de garantía de cada fabricante. Lee la póliza o consulta al área de postventa antes de responder.")
qa("¿Qué cubre la garantía?",
   "“Defectos de fabricación por X años o Y km. No cubre piezas de desgaste ni daños por mal uso o accidentes. La batería tiene garantía de …”")
h2("Híbridos y eléctricos")
qa("¿El híbrido hay que enchufarlo?",
   "“No. Un híbrido convencional se recarga solo. Solo los híbridos enchufables (PHEV) y los eléctricos se enchufan.”")
qa("¿Cuánto dura la batería?",
   "“Está diseñada para la vida útil del auto, con garantía de N años o km. Con el tiempo pierde un poco de capacidad, de forma gradual.”")
qa("¿Cuánto me cuesta cargarlo?",
   "Consumo (kWh/100 km) × km mensuales ÷ 100 × precio del kWh. Comparado con bencina suele ser varias veces más barato si se carga en casa.")
qa("¿Cuánto se demora en cargar?",
   "Explica AC (casa: horas, de noche) vs. DC (rápida: 10–80% en X minutos según potencia máxima del auto).")
qa("¿Qué pasa si se acaba la batería en la carretera?",
   "“El auto avisa con mucha anticipación y sugiere cargadores cercanos. Si llegara a quedarse sin carga, la asistencia en ruta lo traslada al cargador más cercano.”")
qa("¿Se puede lavar o andar con lluvia?",
   "“Sí, sin problema. Los sistemas eléctricos están sellados y cumplen normas de resistencia al agua. Respeta la capacidad de vadeo informada.”")
h2("Equipamiento")
qa("¿Tiene Apple CarPlay / Android Auto inalámbrico?", "Confirma en la ficha si es con cable o inalámbrico.")
qa("¿Cuántos litros tiene el maletero?", "Dato de ficha. Contextualiza: “Caben 2 maletas grandes y 2 de mano.”")
qa("¿Qué diferencia hay entre esta versión y la siguiente?",
   "Prepara una tabla comparativa de versiones antes de atender: motor, caja, tracción, seguridad, confort, tecnología, llantas y precio. Es la pregunta más común en la sala.")
h2("Usados")
qa("¿Por qué es más barato que otro igual?",
   "Explica factores: km, dueños, mantenciones, versión, estado, historial. Si tiene algún detalle, infórmalo.")
qa("¿Tiene las mantenciones al día? ¿Tuvo choques?",
   "Muestra el historial y el informe de inspección. Nunca afirmes algo que no puedas respaldar.")
qa("¿Cuántos dueños ha tenido?", "Consulta el historial en el Registro Civil.")
qa("¿Le hicieron el cambio de correa?", "Muestra la factura o registro. Si no hay, infórmalo como gasto próximo.")
h2("Trámites y dinero")
qa("¿Cuánto cuesta la transferencia?", "Impuesto de 1,5% sobre el mayor valor entre precio de venta y tasación fiscal, más gastos notariales/inscripción.")
qa("¿Cuánto es el permiso de circulación?", "Depende de la tasación fiscal del auto; se puede simular en el sitio del SII o la municipalidad.")
qa("¿Puedo dejar mi auto en parte de pago si todavía lo estoy pagando?",
   "“Sí, normalmente se puede: se tasa el auto, se paga la deuda pendiente con la financiera y la diferencia se abona al pie.” (confirmar procedimiento interno).")
qa("¿Qué es la CAE?", "“Es el costo total del crédito expresado en un porcentaje anual: incluye intereses, seguros y gastos. Es lo que sirve para comparar créditos.”")

# =====================================================================
chapter("21", "Mitos frecuentes (y la realidad)",
        "Los clientes llegan con ideas que escucharon por ahí. Corregirlas con respeto te posiciona como experto.")
table(["Mito", "Realidad"], [
    ["“Hay que calentar el motor 10 minutos antes de partir.”", "Los motores modernos con inyección solo necesitan 30–60 segundos; luego se maneja suave hasta que alcanza temperatura."],
    ["“La bencina de 97 hace que cualquier auto ande mejor.”", "Solo sirve si el fabricante la recomienda. En un motor diseñado para 93 o 95 no hay beneficio real."],
    ["“Más cilindrada siempre es mejor.”", "Un motor pequeño con turbo puede tener más fuerza y menor consumo que uno más grande sin turbo."],
    ["“Los autos automáticos gastan más.”", "Las cajas modernas (CVT, DCT, automáticas de 8 o más marchas) igualan o superan al manual en consumo."],
    ["“Los eléctricos no sirven en invierno.”", "Pierden algo de autonomía con frío, pero funcionan perfectamente; la bomba de calor y el preacondicionamiento ayudan."],
    ["“Las baterías de los híbridos duran pocos años.”", "Están diseñadas para durar la vida útil del auto y tienen garantías de 8 años o más en muchas marcas."],
    ["“Un auto que se deforma mucho en un choque es inseguro.”", "Las zonas de deformación están hechas para absorber energía y proteger a los ocupantes; la cabina debe permanecer intacta."],
    ["“El 4x4 hace que el auto frene mejor.”", "La tracción ayuda a partir y avanzar; para frenar, todos los autos usan sus 4 frenos. Lo que frena mejor son buenos neumáticos y ABS."],
    ["“Andar en neutro en bajada ahorra combustible.”", "En autos con inyección, al soltar el acelerador con una marcha puesta el consumo es casi cero; en neutro el motor sigue consumiendo. Además se pierde control (freno motor). Es peligroso."],
    ["“Hay que cambiar el aceite cada 5.000 km sí o sí.”", "Depende del aceite y del fabricante; con sintéticos modernos los intervalos suelen ser de 10.000–15.000 km. Se respeta lo que diga la pauta."],
    ["“El aire acondicionado gasta mucho más que andar con las ventanas abiertas.”", "En carretera, las ventanas abiertas aumentan la resistencia aerodinámica y pueden gastar lo mismo o más que el A/C."],
    ["“Los diésel son siempre más económicos.”", "Solo si se recorren muchos km; para uso urbano y pocos km, el mayor precio y la mantención no se compensan."],
], [1.8, 3.2])

# =====================================================================
chapter("22", "Glosario de la A a la Z",
        "Consulta rápida de términos. Si un cliente o una ficha usa una palabra que no conoces, búscala aquí.")
G = [
 ("Ackerman (geometría de dirección)", "diseño que hace que la rueda interior gire más que la exterior en una curva."),
 ("AdBlue", "solución de urea que reduce los NOx en diésel modernos (sistema SCR)."),
 ("Alternador", "generador movido por el motor que recarga la batería y alimenta el sistema eléctrico."),
 ("Amortiguador", "elemento que controla el rebote de la suspensión."),
 ("Ángulo de ataque / salida / ventral", "ángulos máximos de rampa que el vehículo puede enfrentar sin golpear su frente, cola o parte central."),
 ("Anticongelante / refrigerante", "líquido que enfría el motor y evita congelamiento y corrosión."),
 ("Árbol de levas", "eje que abre y cierra las válvulas."),
 ("Aro", "llanta; también se usa para indicar su diámetro en pulgadas."),
 ("Aspirado (atmosférico)", "motor sin turbo ni compresor."),
 ("AWD", "tracción integral automática o permanente en las cuatro ruedas."),
 ("Balanceo", "equilibrado del peso de la rueda para evitar vibraciones."),
 ("Ballesta", "resorte de hojas de acero, típico en ejes traseros de camionetas."),
 ("Bandeja", "brazo de suspensión que une la rueda al chasis."),
 ("Biela", "pieza que une el pistón al cigüeñal."),
 ("Block / bloque", "estructura principal del motor que contiene los cilindros."),
 ("Bomba de agua", "hace circular el refrigerante."),
 ("Bujía", "genera la chispa que enciende la mezcla en motores bencineros."),
 ("Bujía de precalentamiento (glow plug)", "calienta la cámara de combustión de un diésel para facilitar el arranque en frío."),
 ("Cabina doble / simple", "configuración de cabina en camionetas."),
 ("Caja de transferencia", "reparte la fuerza entre ejes en un 4x4; suele incluir la reductora."),
 ("Caliper / pinza de freno", "pieza que aprieta las pastillas contra el disco."),
 ("Cárter", "depósito de aceite en la parte baja del motor."),
 ("Catalizador", "dispositivo del escape que reduce gases contaminantes."),
 ("Chasis", "estructura base del vehículo."),
 ("Cigüeñal", "eje que convierte el movimiento lineal de los pistones en giro."),
 ("Cilindrada", "volumen total de los cilindros (cc o litros)."),
 ("Cilindro", "cámara donde se mueve el pistón y ocurre la combustión."),
 ("Climatizador", "aire acondicionado automático con temperatura programable."),
 ("Common rail", "sistema de inyección diésel de alta presión con un riel común."),
 ("Convertidor de torque", "acople hidráulico de las cajas automáticas convencionales."),
 ("Crossover", "vehículo con estética SUV construido sobre plataforma de auto."),
 ("Culata", "parte superior del motor que cierra los cilindros y contiene las válvulas."),
 ("CVT", "transmisión de variación continua, sin marchas fijas."),
 ("Deducible", "parte del costo de un siniestro que paga el asegurado."),
 ("Despeje", "altura libre entre el suelo y el punto más bajo del auto."),
 ("Diferencial", "mecanismo que permite que las ruedas de un eje giren a distinta velocidad."),
 ("Disco ventilado", "disco de freno con canales internos de ventilación."),
 ("Distancia entre ejes", "distancia entre centros de ruedas delanteras y traseras; indica espacio interior."),
 ("Distribución", "sistema que sincroniza cigüeñal y árbol de levas (correa, cadena o engranajes)."),
 ("DOHC / SOHC", "doble o simple árbol de levas en culata."),
 ("Downsizing", "uso de motores más pequeños, generalmente con turbo, para reducir consumo."),
 ("DPF", "filtro de partículas diésel."),
 ("ECU", "computadora que controla el motor (u otros sistemas)."),
 ("Embrague", "mecanismo que conecta y desconecta el motor de la caja."),
 ("Escáner OBD", "herramienta que lee códigos de falla del auto por el puerto OBD-II."),
 ("Espiral", "resorte helicoidal de la suspensión."),
 ("Estanque", "depósito de combustible."),
 ("Freno motor", "efecto de frenado que ocurre al soltar el acelerador con una marcha puesta."),
 ("Homocinética", "junta que transmite el giro a las ruedas delanteras mientras doblan."),
 ("Homologación", "certificación de que un modelo cumple las normas del país."),
 ("HP / CV / kW", "unidades de potencia."),
 ("Inyector", "pieza que pulveriza el combustible."),
 ("Intercooler", "radiador que enfría el aire comprimido por el turbo."),
 ("ISOFIX", "sistema de anclaje de sillas infantiles."),
 ("Junta de culata", "empaquetadura entre culata y block."),
 ("Keyless", "acceso y/o encendido sin usar la llave físicamente."),
 ("kWh", "unidad de energía; tamaño de la batería de un eléctrico."),
 ("Levas / paletas", "mandos tras el volante para cambiar marchas manualmente en un automático."),
 ("Llanta", "parte metálica de la rueda (aro)."),
 ("Lambda (sonda)", "sensor de oxígeno en el escape."),
 ("McPherson", "tipo de suspensión independiente muy común en el eje delantero."),
 ("Monocasco", "carrocería autoportante en que chasis y carrocería son una sola estructura."),
 ("Multilink", "suspensión independiente de varios brazos."),
 ("Neumático", "cubierta de goma de la rueda."),
 ("Nm", "Newton-metro, unidad de torque."),
 ("Octanaje", "resistencia de la bencina a la detonación."),
 ("OTA", "actualización de software a distancia."),
 ("Pastillas", "piezas de fricción de los frenos de disco."),
 ("Perfil", "altura del flanco del neumático como porcentaje del ancho."),
 ("Pick-up", "caja de carga de una camioneta."),
 ("Pistón", "pieza que sube y baja dentro del cilindro."),
 ("Plataforma", "base técnica compartida por varios modelos (suelo, ejes, estructura)."),
 ("Portalón", "tapa trasera que incluye el vidrio (hatchback, SUV)."),
 ("Prenda", "garantía inscrita sobre el auto a favor de quien financió su compra."),
 ("Radiador", "intercambiador que enfría el refrigerante con el aire."),
 ("Ralentí", "régimen de giro del motor detenido sin acelerar."),
 ("Recall", "llamado a revisión del fabricante para corregir un defecto sin costo."),
 ("Reductora", "marchas extra cortas de un 4x4 para condiciones extremas (4L)."),
 ("Regeneración", "recuperación de energía al frenar o soltar el acelerador en híbridos y eléctricos; también, limpieza del DPF."),
 ("Relación de compresión", "cuánto se comprime la mezcla en el cilindro."),
 ("Relación peso/potencia", "kg por cada HP; menor es más ágil."),
 ("Rótula", "articulación esférica de suspensión y dirección."),
 ("rpm", "revoluciones por minuto del motor."),
 ("Run flat", "neumático que puede rodar desinflado una distancia limitada."),
 ("Segmento", "categoría de tamaño de un auto (A, B, C, D, E, F)."),
 ("Servofreno", "asistencia que multiplica la fuerza en el pedal de freno."),
 ("Start-Stop", "apaga y enciende el motor automáticamente en detenciones."),
 ("Subviraje / sobreviraje", "cuando el auto “se va de frente” en una curva / cuando la cola se desliza hacia afuera."),
 ("SUV", "vehículo utilitario deportivo, carrocería alta."),
 ("Tacómetro", "indicador de rpm."),
 ("Tasación fiscal", "valor del vehículo asignado por el SII."),
 ("Termostato", "válvula que regula la temperatura del motor."),
 ("Torque (par motor)", "fuerza de giro del motor."),
 ("TPMS", "sistema de monitoreo de presión de neumáticos."),
 ("Tracción delantera / trasera", "eje que recibe la fuerza del motor."),
 ("Trocha", "distancia entre ruedas de un mismo eje."),
 ("Turbo", "compresor movido por gases de escape que aumenta la potencia."),
 ("Turbo lag", "pequeño retardo en la respuesta del turbo."),
 ("Válvulas", "abren y cierran el paso de aire y gases en el cilindro."),
 ("VIN", "número de identificación único del vehículo (17 caracteres)."),
 ("Volante bimasa", "volante motor con amortiguación interna, común en diésel."),
 ("Voladizo", "parte de la carrocería que sobresale delante o detrás de las ruedas."),
 ("Wallbox", "cargador mural para autos eléctricos."),
 ("WLTP", "ciclo de homologación de consumo y autonomía."),
 ("Zona de deformación", "parte de la carrocería diseñada para absorber energía en un choque."),
]
for t, d in G:
    gl(t, d)

# =====================================================================
chapter("23", "Siglas más usadas",
        "Las fichas técnicas están llenas de siglas. Aquí están las más comunes.")
SIG = [
 ("4WD / 4x4", "Tracción en las 4 ruedas (con reductora normalmente)"), ("ABS", "Sistema antibloqueo de frenos"),
 ("ACC", "Control crucero adaptativo"), ("AEB", "Frenado autónomo de emergencia"),
 ("AHB", "Luces altas automáticas"), ("AMT", "Caja manual automatizada"),
 ("AT", "Caja automática"), ("AWD", "Tracción integral"),
 ("BA / BAS", "Asistente de frenado de emergencia"), ("BEV", "Vehículo eléctrico a batería"),
 ("BSM / BSD", "Monitor de punto ciego"), ("CAE", "Carga anual equivalente (costo del crédito)"),
 ("CAV", "Certificado de anotaciones vigentes"), ("CC", "Centímetros cúbicos / control crucero"),
 ("CCS", "Sistema de carga combinado (AC + DC)"), ("CVT", "Transmisión de variación continua"),
 ("DCT / DSG", "Caja de doble embrague"), ("DOHC", "Doble árbol de levas en culata"),
 ("DPF", "Filtro de partículas diésel"), ("DRL", "Luces de circulación diurna"),
 ("EBD", "Distribución electrónica de frenado"), ("ECU", "Unidad de control electrónico"),
 ("EGR", "Recirculación de gases de escape"), ("EPB", "Freno de estacionamiento eléctrico"),
 ("EPS", "Dirección asistida eléctrica"), ("EREV", "Eléctrico de autonomía extendida"),
 ("ESP / ESC / VSC", "Control electrónico de estabilidad"), ("FCW", "Alerta de colisión frontal"),
 ("FWD", "Tracción delantera"), ("GDI", "Inyección directa de gasolina"),
 ("HDC", "Control de descenso en pendientes"), ("HEV", "Híbrido convencional"),
 ("HSA / HAC", "Asistente de partida en pendiente"), ("HUD", "Proyección de datos en el parabrisas"),
 ("ICE", "Motor de combustión interna"), ("LDW", "Alerta de salida de carril"),
 ("LKA", "Asistente de mantención de carril"), ("LSD", "Diferencial de deslizamiento limitado"),
 ("MHEV", "Híbrido ligero"), ("MPI", "Inyección multipunto"),
 ("MT", "Caja manual"), ("NEDC / WLTP / EPA / CLTC", "Ciclos de homologación de consumo"),
 ("NCAP", "Programa de evaluación de autos nuevos (choques)"), ("OBD", "Diagnóstico a bordo"),
 ("OTA", "Actualización por aire"), ("PBV", "Peso bruto vehicular"),
 ("PDC", "Sensores de estacionamiento"), ("PHEV", "Híbrido enchufable"),
 ("RCTA", "Alerta de tráfico cruzado trasero"), ("RWD", "Tracción trasera"),
 ("SOAP", "Seguro obligatorio de accidentes personales"), ("SOH / SOC", "Estado de salud / de carga de batería"),
 ("SRS", "Sistema de retención suplementario (airbags)"), ("SUV", "Vehículo utilitario deportivo"),
 ("TCS", "Control de tracción"), ("TPMS", "Monitor de presión de neumáticos"),
 ("TSR", "Reconocimiento de señales de tránsito"), ("V2L", "El auto entrega energía a aparatos externos"),
 ("VIN", "Número de identificación del vehículo"), ("VVT", "Distribución variable de válvulas"),
]
half = (len(SIG) + 1) // 2
rows = []
for i in range(half):
    a = SIG[i]
    b = SIG[i + half] if i + half < len(SIG) else ("", "")
    rows.append(["<b>%s</b>" % a[0], a[1], "<b>%s</b>" % b[0], b[1]])
table(["Sigla", "Significado", "Sigla", "Significado"], rows, [0.9, 1.6, 0.9, 1.6], pad=2.6)

# =====================================================================
chapter("24", "Conversiones y fórmulas rápidas",
        "Para responder al instante sin calculadora (o casi).")
table(["Conversión", "Equivalencia", "Ejemplo"], [
    ["Potencia: kW → HP / CV", "1 kW = 1,341 HP = 1,36 CV", "100 kW ≈ 134 HP ≈ 136 CV"],
    ["Potencia: HP → kW", "1 HP = 0,746 kW", "150 HP ≈ 112 kW"],
    ["Torque: kgfm → Nm", "1 kgfm = 9,81 Nm", "25 kgfm ≈ 245 Nm"],
    ["Torque: lb-ft → Nm", "1 lb-ft = 1,356 Nm", "200 lb-ft ≈ 271 Nm"],
    ["Consumo: L/100 km → km/L", "km/L = 100 ÷ L/100 km", "7 L/100 km ≈ 14,3 km/L"],
    ["Consumo: MPG (EE.UU.) → km/L", "× 0,425", "40 MPG ≈ 17 km/L"],
    ["Velocidad: mph → km/h", "× 1,609", "60 mph ≈ 97 km/h"],
    ["Distancia: millas → km", "× 1,609", "100 millas ≈ 161 km"],
    ["Pulgadas → cm", "× 2,54", "Aro 17\" ≈ 43 cm"],
    ["Presión: bar → PSI", "1 bar = 14,5 PSI", "2,3 bar ≈ 33 PSI"],
    ["Volumen: galón (EE.UU.) → litros", "× 3,785", "15 galones ≈ 57 L"],
    ["Cilindrada: cc → litros", "÷ 1.000 (redondeado)", "1.998 cc = 2.0 L"],
    ["Peso: libras → kg", "× 0,4536", "3.000 lb ≈ 1.361 kg"],
], [1.6, 1.6, 1.6])
h2("Fórmulas útiles")
table(["Qué calcular", "Fórmula"], [
    ["Autonomía con un estanque", "Capacidad del estanque (L) × rendimiento (km/L)"],
    ["Gasto mensual en combustible", "(km al mes ÷ km/L) × precio del litro"],
    ["Gasto mensual en electricidad", "(km al mes ÷ 100) × kWh/100 km × precio del kWh"],
    ["Relación peso/potencia", "Peso (kg) ÷ potencia (HP)"],
    ["Carga útil", "Peso bruto vehicular − peso en orden de marcha"],
    ["Diámetro total de un neumático (mm)", "(Aro × 25,4) + 2 × (ancho × perfil ÷ 100). Ej. 205/55 R16 ≈ 406 + 225 = 631 mm"],
    ["Tiempo de carga aproximado (AC)", "kWh a cargar ÷ potencia del cargador (kW) × ~1,1 (pérdidas)"],
    ["Antigüedad de un neumático", "Últimos 4 dígitos DOT: semana y año (ej. 1825 = semana 18 de 2025)"],
], [1.7, 3.3])

# =====================================================================
chapter("", "Resumen de una página",
        "Si tienes 5 minutos antes de atender a un cliente, repasa esto.")
bl(["<b>Potencia (HP)</b> = velocidad y aceleración a alta velocidad. <b>Torque (Nm)</b> = fuerza al partir, adelantar y subir; importa a qué rpm se entrega.",
    "<b>Turbo</b> = más fuerza con motor chico y menos consumo. <b>Aspirado</b> = simple y lineal.",
    "<b>Correa de distribución</b> = cambio obligatorio por km/años (verificar en usados). <b>Cadena</b> = sin cambio programado.",
    "<b>Cajas:</b> manual (barata y simple), automática convencional (suave y robusta), CVT (suave y eficiente), doble embrague (rápida y deportiva), AMT (económica, menos refinada).",
    "<b>Tracción:</b> FWD (eficiente, la más común), RWD (camionetas y deportivos), AWD (adherencia automática), 4x4 con reductora (off-road real).",
    "<b>Frenos:</b> disco/disco mejor que disco/tambor; ABS + EBD + BA son la base; ESP es clave para la seguridad.",
    "<b>Neumático 205/55 R16 91V</b> = ancho / perfil % / radial / aro / carga / velocidad. DOT = fecha. Mínimo legal 1,6 mm.",
    "<b>Seguridad:</b> airbags, ISOFIX, ESP, estrellas Latin NCAP y ADAS (AEB, ACC, LKA, BSM, RCTA).",
    "<b>Electrificados:</b> MHEV (asiste), HEV (no se enchufa), PHEV (se enchufa y anda eléctrico decenas de km), BEV (100% eléctrico). Autonomía: aclarar ciclo (WLTP, NEDC, CLTC, EPA). Carga AC lenta (casa) vs. DC rápida.",
    "<b>Consumo:</b> km/L (más es mejor) vs. L/100 km (menos es mejor). Urbano, extraurbano y mixto.",
    "<b>Usados:</b> CAV, multas, mantenciones, correa, choques (pintura, separaciones), km coherentes con el desgaste, prueba en frío y en ruta.",
    "<b>Trámites:</b> permiso de circulación (marzo), SOAP, revisión técnica, transferencia (1,5% de impuesto), prenda si hay crédito.",
    "<b>Créditos:</b> compara con la CAE y el costo total; nunca prometas aprobación.",
    "<b>Regla de oro:</b> Característica → Ventaja → Beneficio. Y si no sabes algo: “Lo confirmo y te respondo de inmediato”."])
sp(10)
p("<i>Este manual entrega información general y referencial con fines de formación comercial. Las especificaciones, plazos, montos, "
  "normativas y condiciones de garantía y financiamiento pueden variar según el modelo, la marca y la regulación vigente: verifica siempre "
  "la ficha técnica oficial del vehículo y las fuentes oficiales antes de informar a un cliente.</i>")
