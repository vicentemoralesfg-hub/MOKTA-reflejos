from lib import *

# =====================================================================
chapter("", "Cómo usar este manual",
        "Este manual está pensado para que una persona que nunca ha trabajado con autos pueda, "
        "leyéndolo de principio a fin, conversar con seguridad sobre cualquier vehículo, entender una ficha "
        "técnica y responder las preguntas de un cliente con claridad y honestidad.")
p("Está organizado de lo general a lo específico. Primero se explica qué es un auto y cómo funciona "
  "como sistema; luego cada sistema por separado (motor, transmisión, frenos, etc.); después los temas "
  "comerciales (usados, trámites, financiamiento) y, al final, material de consulta rápida: preguntas "
  "frecuentes con respuestas modelo, mitos, glosario de la A a la Z, siglas y conversión de unidades.")
h2("Los recuadros que vas a encontrar")
say("Una forma simple, sin tecnicismos, de explicar el concepto a un cliente. Úsala tal cual o adáptala.")
key("Lo más importante de la sección. Si solo recuerdas una cosa, que sea esta.")
warn("Errores frecuentes, cosas que no se deben prometer o temas donde hay que verificar antes de responder.")
h2("Las 5 reglas de oro del vendedor que sabe de autos")
nl(["<b>Traduce características en beneficios.</b> Al cliente no le importa que el auto tenga “inyección directa”; "
    "le importa que gaste menos y ande con más fuerza. Siempre di qué es, qué hace y qué gana el cliente.",
    "<b>Pregunta antes de recomendar.</b> Cuántos son en la familia, cuántos km hace al mes, si anda en ciudad o "
    "carretera, si sale a terreno, cuánto quiere pagar al mes. Con eso eliges el auto correcto.",
    "<b>Nunca inventes.</b> Si no sabes un dato, di: “Déjame confirmarlo en la ficha técnica y te respondo de inmediato”. "
    "Un dato falso puede costar la venta, la reputación y hasta un reclamo legal.",
    "<b>Compara con respeto.</b> No hables mal de otras marcas; destaca lo que tu auto hace mejor.",
    "<b>Usa la ficha técnica como aliada.</b> Este manual te enseña a leerla. Con ella en mano puedes explicar "
    "cualquier auto, aunque nunca lo hayas visto antes."])

# =====================================================================
chapter("1", "El auto desde cero",
        "Un auto es un conjunto de sistemas que trabajan juntos para convertir energía (combustible o electricidad) "
        "en movimiento, de forma segura y cómoda.")
h2("Los grandes sistemas de un auto")
table(["Sistema", "Qué hace", "Comparación simple"], [
    ["Motor", "Genera la fuerza (combustión o eléctrico).", "El corazón."],
    ["Transmisión (caja de cambios)", "Adapta la fuerza y velocidad del motor a la que necesitan las ruedas.", "Los cambios de una bicicleta."],
    ["Tracción / tren motriz", "Lleva la fuerza a las ruedas (delanteras, traseras o las cuatro).", "Las piernas."],
    ["Suspensión", "Absorbe irregularidades del camino y mantiene las ruedas pegadas al suelo.", "Las rodillas."],
    ["Dirección", "Permite girar las ruedas delanteras.", "El manubrio."],
    ["Frenos", "Detienen el auto transformando movimiento en calor (o en energía, en híbridos/eléctricos).", "Las manos apretando la rueda."],
    ["Sistema eléctrico", "Batería, alternador, luces, computadoras, sensores.", "El sistema nervioso."],
    ["Carrocería y chasis", "Estructura que soporta todo y protege a los ocupantes.", "El esqueleto y la piel."],
    ["Habitáculo / interior", "Asientos, tablero, climatización, multimedia.", "La casa por dentro."],
    ["Seguridad", "Airbags, cinturones, ABS, control de estabilidad, asistentes.", "El sistema inmune."],
], [1.2, 2.6, 1.3])
h2("Cómo se mueve un auto (en una frase)")
p("El motor gira → la caja de cambios ajusta ese giro → los ejes y el diferencial lo llevan a las ruedas → "
  "los neumáticos empujan contra el suelo y el auto avanza. Todo lo demás (frenos, suspensión, dirección, "
  "electrónica) sirve para que ese movimiento sea controlable, seguro y cómodo.")
h2("Vocabulario básico del exterior")
table(["Parte", "Qué es"], [
    ["Capó", "Tapa delantera que cubre el motor (en la mayoría de los autos)."],
    ["Maletero / portalón", "Espacio de carga. En hatchback y SUV la tapa trasera, que incluye el vidrio, se llama portalón."],
    ["Parachoques (bumper)", "Pieza delantera y trasera que absorbe golpes leves."],
    ["Parrilla", "Rejilla frontal que deja pasar aire al radiador. Es el “rostro” de la marca."],
    ["Tapabarros / guardabarros", "Paneles laterales sobre las ruedas."],
    ["Pilares A, B, C (y D)", "Columnas que sostienen el techo: A junto al parabrisas, B entre puertas, C atrás (D en station wagon/SUV largos)."],
    ["Zócalo", "Parte baja de la carrocería bajo las puertas."],
    ["Llanta / aro", "La pieza metálica de la rueda. El neumático es la goma."],
    ["Barras de techo (rieles)", "Soportes longitudinales para montar portaequipaje o bicicletas."],
    ["Faros / focos", "Luces delanteras. Neblineros: luces bajas para niebla. DRL: luces de circulación diurna."],
    ["Spoiler / alerón", "Pieza aerodinámica, normalmente sobre el portalón o maletero."],
    ["Retrovisores (espejos)", "Pueden ser eléctricos, calefaccionados, abatibles eléctricamente y con luz de giro."],
], [1, 3])
h2("Vocabulario básico del interior")
table(["Parte", "Qué es"], [
    ["Tablero / panel de instrumentos (cluster)", "Zona tras el volante con velocímetro, tacómetro (rpm), indicador de combustible y testigos."],
    ["Consola central", "Zona entre los asientos delanteros: palanca de cambios, portavasos, apoyabrazos."],
    ["Pantalla de infoentretenimiento", "Pantalla central para radio, navegación, teléfono, cámara y ajustes."],
    ["Volante multifunción", "Volante con botones para audio, teléfono y control crucero."],
    ["Palanca de cambios / selector", "En manuales, palanca con las marchas; en automáticos: P (park), R (reversa), N (neutro), D (drive)."],
    ["Freno de mano / estacionamiento", "Mecánico (palanca) o eléctrico (botón, “EPB”)."],
    ["Pedales", "Manual: embrague (izquierda), freno (centro), acelerador (derecha). Automático: solo freno y acelerador."],
    ["Climatizador", "Aire acondicionado automático que mantiene la temperatura elegida."],
    ["Tapiz", "Material de los asientos: tela, ecocuero (cuero sintético), cuero, Alcántara (gamuza sintética)."],
], [1.3, 3])
key("Al presentar un auto, recórrelo siempre en el mismo orden (frente, lateral, trasero, maletero, "
    "puesto del conductor, asientos traseros, motor). Así no se te olvida nada y transmites orden y dominio.")

# =====================================================================
chapter("2", "Tipos de carrocería, segmentos y estructura",
        "Lo primero que el cliente define (muchas veces sin saberlo) es el tipo de auto. Saber nombrarlos y "
        "explicar sus ventajas te permite orientar la conversación desde el minuto uno.")
h2("Tipos de carrocería")
table(["Tipo", "Descripción", "Ideal para", "Ojo con"], [
    ["Hatchback", "Auto compacto con portalón trasero que incluye el vidrio. 3 o 5 puertas.", "Ciudad, estacionar fácil, primer auto.", "Maletero más pequeño que un sedán."],
    ["Sedán", "Tres volúmenes: motor, cabina y maletero separado.", "Familias pequeñas, viajes, imagen formal.", "Abertura de maletero más chica."],
    ["Station wagon (familiar)", "Sedán con techo alargado hasta atrás: gran maletero.", "Familias que viajan con mucha carga.", "Menos común hoy; menos despeje que un SUV."],
    ["SUV", "Vehículo utilitario deportivo: carrocería alta, buena visibilidad y despeje. Puede ser 4x2 o 4x4/AWD.", "Familias, caminos de tierra, sensación de seguridad.", "Consume más que un sedán equivalente."],
    ["Crossover (CUV)", "SUV construido sobre la base de un auto (monocasco). Más liviano y eficiente.", "Ciudad y viajes, imagen SUV.", "Capacidad off-road limitada."],
    ["Coupé", "2 puertas (o línea de techo inclinada), diseño deportivo.", "Quien prioriza diseño y manejo.", "Plazas traseras incómodas."],
    ["Convertible / cabriolet", "Techo removible o plegable (lona o rígido).", "Disfrute, segundo auto.", "Menos maletero, más ruido."],
    ["Camioneta (pickup)", "Cabina + pick-up (caja de carga abierta). Cabina simple, extendida o doble.", "Trabajo, carga, campo, minería, uso mixto.", "Tamaño, consumo, suspensión más firme vacía."],
    ["Minivan / monovolumen", "Un solo volumen alto, 5 a 8 asientos, puertas a veces correderas.", "Familias numerosas, transporte de personas.", "Imagen “poco deportiva”."],
    ["Van / furgón", "Vehículo comercial para carga o pasajeros.", "Empresas, reparto, transporte escolar.", "Equipamiento de confort básico."],
], [1.1, 2.2, 1.6, 1.4])
h2("Segmentos (tamaño y categoría)")
p("Los segmentos ordenan los autos por tamaño y precio. La clasificación más usada viene de Europa:")
table(["Segmento", "Nombre común", "Largo aprox.", "Ejemplos de tipo"], [
    ["A", "Citycar / urbano pequeño", "&lt; 3,7 m", "Autos muy pequeños para ciudad."],
    ["B", "Pequeño / subcompacto", "3,7 – 4,2 m", "Hatchback y sedán pequeños; SUV-B (SUV pequeño)."],
    ["C", "Compacto / mediano", "4,2 – 4,6 m", "Hatchback y sedán medianos; SUV-C (SUV mediano)."],
    ["D", "Mediano-grande / ejecutivo", "4,6 – 4,9 m", "Sedán grande, SUV-D (SUV grande de 5 o 7 asientos)."],
    ["E", "Grande / ejecutivo superior", "4,9 – 5,1 m", "Sedán y SUV de lujo."],
    ["F", "Lujo", "&gt; 5,1 m", "Limusinas y modelos insignia."],
], [0.8, 1.8, 1.1, 2.4])
say("“Este es un SUV del segmento C: más espacio que un SUV pequeño, pero sigue siendo fácil de estacionar en ciudad.”")
h2("Estructura: monocasco vs. chasis de escalera")
bl(["<b>Monocasco (unibody):</b> la carrocería y el chasis son una sola pieza. Más liviano, mejor comportamiento en "
    "curvas, más cómodo y con mejor absorción de impactos. Lo usan casi todos los autos, crossovers y la mayoría de los SUV.",
    "<b>Chasis de escalera (body-on-frame):</b> un bastidor de largueros de acero sobre el que se monta la carrocería. "
    "Más robusto, soporta más carga y torsión, ideal para trabajo pesado y off-road extremo. Lo usan camionetas pickup "
    "y SUV “todoterreno” de verdad. Es más pesado y menos refinado al manejar.",
    "<b>Zonas de deformación programada:</b> partes de la carrocería diseñadas para arrugarse en un choque y absorber energía, "
    "protegiendo la cabina (que es una “célula de seguridad” rígida). Un auto que se “arruga” mucho en un choque no es malo: "
    "está haciendo su trabajo.",
    "<b>Aceros de alta resistencia / ultra alta resistencia:</b> materiales que dan más rigidez y protección con menos peso. "
    "Es un buen argumento de seguridad cuando la ficha lo menciona."])
h2("Configuración de asientos y puertas")
bl(["<b>2+2:</b> dos asientos adelante y dos pequeños atrás (coupés).",
    "<b>5 plazas:</b> lo estándar. <b>7 plazas (3 corridas):</b> SUV grandes y minivans; la tercera corrida suele ser para niños o trayectos cortos.",
    "<b>Asientos abatibles 60/40 o 40/20/40:</b> el respaldo trasero se divide para abatir solo una parte y llevar objetos largos sin perder todas las plazas.",
    "<b>Cabina simple / extendida / doble</b> (camionetas): 2 puertas; 2 puertas con espacio extra; 4 puertas con asientos traseros completos."])

# =====================================================================
chapter("3", "El motor de combustión interna",
        "Es el tema que más preguntas genera. Si entiendes este capítulo, entiendes el 80% de una ficha técnica.")
h2("Cómo funciona: el ciclo de 4 tiempos")
p("Dentro del motor hay <b>cilindros</b> (tubos) y en cada uno un <b>pistón</b> que sube y baja. Arriba, las "
  "<b>válvulas</b> abren y cierran el paso del aire y de los gases. El pistón está unido a una <b>biela</b>, que hace "
  "girar el <b>cigüeñal</b> (como los pedales que hacen girar una bicicleta). Ese giro es lo que finalmente mueve el auto.")
story.append(Cycle())
p("En los motores <b>bencineros</b> (gasolina) la mezcla aire-combustible se enciende con una chispa de la <b>bujía</b>. "
  "En los <b>diésel</b> no hay bujías de encendido: el aire se comprime tanto que se calienta y el combustible se "
  "inflama solo al inyectarse (encendido por compresión).")
say("“El motor funciona como muchas pequeñas explosiones controladas que empujan unos pistones; esos pistones hacen "
    "girar un eje y ese giro termina moviendo las ruedas.”")
h2("Las cifras del motor y qué significan")
h3("Cilindrada (cc o litros)")
p("Es el volumen total que barren los pistones dentro de todos los cilindros. Se expresa en centímetros cúbicos (cc) "
  "o litros: 1.598 cc ≈ 1.6 L. <b>Más cilindrada</b> suele significar más fuerza, pero también más consumo. Hoy un motor "
  "pequeño con turbo (ej. 1.0 o 1.3 turbo) puede rendir igual o más que uno grande sin turbo (ej. 1.6 o 2.0).")
h3("Número y disposición de cilindros")
table(["Configuración", "Descripción", "Dónde se usa"], [
    ["3 cilindros en línea", "Compacto, liviano y eficiente. Algo más de vibración.", "Autos pequeños y SUV pequeños, casi siempre con turbo."],
    ["4 cilindros en línea (L4 / I4)", "El más común: buen equilibrio entre suavidad, costo y consumo.", "La gran mayoría de autos, SUV y camionetas."],
    ["V6 / V8", "Cilindros en dos filas en forma de V. Mucha potencia y suavidad.", "SUV grandes, deportivos, camionetas de alto rendimiento."],
    ["Bóxer (opuestos)", "Cilindros horizontales enfrentados. Centro de gravedad bajo.", "Algunas marcas específicas (deportivos y SUV)."],
    ["6 en línea", "Muy suave y equilibrado.", "Sedanes y SUV premium."],
], [1.3, 2.2, 2.0])
h3("Potencia (HP, CV, kW)")
p("Mide <b>cuánto trabajo puede hacer el motor por unidad de tiempo</b>: determina la <b>velocidad máxima</b> y qué tan "
  "rápido acelera el auto a altas velocidades. Se expresa en HP (horse power), CV (caballos de vapor, prácticamente igual: "
  "1 HP ≈ 1,014 CV) o kW (1 kW = 1,36 CV). Siempre se indica a qué rpm se logra: “120 HP a 6.000 rpm”.")
h3("Torque o par motor (Nm o kgfm)")
p("Es la <b>fuerza de giro</b> del motor: lo que sientes cuando el auto “empuja” al acelerar desde abajo, al adelantar "
  "o al subir una cuesta cargado. Se mide en Newton-metro (Nm) o kilográmetros (kgfm; 1 kgfm ≈ 9,8 Nm). "
  "Importa mucho el <b>rango de rpm</b> donde se entrega: “250 Nm entre 1.500 y 4.000 rpm” significa fuerza disponible "
  "casi siempre, sin tener que acelerar a fondo.")
key("<b>Potencia = qué tan rápido puedes llegar a ir. Torque = con cuánta fuerza empuja.</b> Para ciudad, cuestas, "
    "carga y remolque, el torque a bajas rpm es lo que más se siente. Los motores turbo y diésel destacan en torque; "
    "los eléctricos entregan su torque máximo desde 0 rpm.")
say("“La potencia es como la velocidad máxima de un corredor; el torque es su fuerza para arrancar y subir cerros. "
    "Este motor tiene mucho torque desde abajo, así que vas a sentir que empuja apenas pisas el acelerador.”")
h3("rpm (revoluciones por minuto)")
p("Cuántas vueltas da el cigüeñal por minuto. Se ve en el <b>tacómetro</b>. En ralentí (detenido) un motor gira a ~700–900 rpm; "
  "la zona roja (corte) suele estar sobre 6.000–7.000 rpm en bencineros y ~4.500–5.000 en diésel.")
h3("Relación peso/potencia")
p("Kilos que debe mover cada HP (peso ÷ potencia). Mientras <b>menor</b>, más ágil el auto. Un auto de 1.200 kg con 120 HP "
  "tiene 10 kg/HP; un SUV de 1.800 kg con el mismo motor tiene 15 kg/HP y se sentirá más lento. Sirve para explicar por qué "
  "el mismo motor se siente distinto en dos autos.")
h3("Aceleración 0–100 km/h y velocidad máxima")
p("Segundos que tarda en llegar de 0 a 100 km/h. Referencias: &gt;12 s tranquilo; 9–12 s normal; 7–9 s ágil; &lt;7 s deportivo; "
  "&lt;4 s superdeportivo (o eléctrico potente).")
h3("Relación de compresión")
p("Cuánto se comprime la mezcla en el cilindro (ej. 10,5:1 bencinero, 16:1 diésel). Mayor compresión = más eficiencia, "
  "pero exige combustible de mayor octanaje en bencineros.")
h2("Válvulas y árbol de levas")
bl(["Las <b>válvulas</b> dejan entrar aire (admisión) y salir gases (escape). Lo común hoy es <b>4 válvulas por cilindro</b> "
    "(un 4 cilindros = 16 válvulas, “16V”).",
    "El <b>árbol de levas</b> es el eje que abre y cierra las válvulas. <b>SOHC</b>: un árbol por fila de cilindros. "
    "<b>DOHC</b>: dos árboles (uno para admisión y otro para escape); mejor respiración y más potencia.",
    "<b>Distribución variable (VVT, VVT-i, i-VTEC, MIVEC, CVVT, VANOS, etc.):</b> cada marca le pone un nombre, pero la idea es "
    "la misma: cambiar el momento (y a veces cuánto) se abren las válvulas según las rpm, para tener fuerza abajo, potencia arriba "
    "y menor consumo.",
    "<b>Ciclo Atkinson / Miller:</b> variante de funcionamiento que prioriza eficiencia sobre potencia; típico en híbridos."])
h2("Alimentación: aspirado, turbo y compresor")
table(["Tipo", "Cómo funciona", "Ventajas", "Consideraciones"], [
    ["Aspiración natural (atmosférico)", "El motor “respira” solo el aire que aspira.", "Simple, respuesta lineal, menos mantención.", "Menos potencia por litro; pierde fuerza en altura."],
    ["Turbo (turbocompresor)", "Una turbina movida por los gases de escape mete más aire a presión.", "Mucha más fuerza con motor chico, menor consumo y emisiones, no pierde tanto en altura.", "Cuidar el aceite; esperar unos segundos antes de apagar tras exigirlo; leve retardo (“turbo lag”)."],
    ["Compresor (supercharger)", "Igual idea, pero movido por una correa del motor.", "Respuesta inmediata.", "Resta algo de eficiencia; poco común hoy."],
    ["Biturbo / twin-turbo", "Dos turbos (en serie o paralelo).", "Más potencia y menos retardo.", "Más complejidad."],
], [1.3, 1.9, 1.7, 1.7])
bl(["<b>Intercooler:</b> radiador que enfría el aire comprimido por el turbo; aire más frío = más denso = más potencia.",
    "<b>Turbo de geometría variable (VGT/VNT):</b> ajusta sus álabes para responder bien a bajas y altas rpm; muy común en diésel.",
    "<b>Downsizing:</b> tendencia a reemplazar motores grandes por motores más chicos con turbo, para bajar consumo y emisiones."])
say("“Este motor es 1.3 turbo: es pequeño, por eso gasta poco, pero el turbo le inyecta más aire y entrega la fuerza de un 1.8 o 2.0 normal.”")
h2("Sistemas de inyección")
bl(["<b>Carburador:</b> tecnología antigua (autos muy antiguos). Mezclaba aire y combustible de forma mecánica.",
    "<b>Inyección multipunto (MPI / MPFI):</b> un inyector por cilindro, en el múltiple de admisión. Confiable, económica de mantener.",
    "<b>Inyección directa (GDI, TSI, TFSI, EcoBoost, SkyActiv-G, etc.):</b> el combustible se inyecta directo en el cilindro, "
    "a alta presión. Más potencia y menor consumo. Puede acumular carbón en válvulas con los años si no se mantiene bien.",
    "<b>Inyección dual:</b> combina ambas para tener lo mejor de cada una.",
    "<b>Common rail (diésel):</b> riel común de alta presión que alimenta los inyectores; diésel moderno, silencioso y eficiente. "
    "Siglas comerciales: CRDi, HDi, TDI, dCi, D-4D, etc."])
h2("Bencina vs. diésel")
table(["Aspecto", "Bencinero (gasolina)", "Diésel (petróleo)"], [
    ["Encendido", "Chispa de bujía.", "Por compresión (bujías de precalentamiento solo para partir en frío)."],
    ["Torque", "Moderado, sube con las rpm.", "Alto a bajas rpm: ideal para carga, cuestas y remolque."],
    ["Consumo", "Mayor.", "Menor (20–30% menos aprox.) y el litro suele ser más barato."],
    ["Ruido / vibración", "Más silencioso y suave.", "Algo más ruidoso (los modernos son muy refinados)."],
    ["Mantención", "Más simple y barata.", "Más cara: filtros, inyectores, DPF, AdBlue en algunos."],
    ["Uso ideal", "Ciudad, recorridos cortos, pocos km/año.", "Muchos km/año, carretera, trabajo, camionetas."],
], [1, 2, 2])
bl(["<b>Octanaje (93, 95, 97 en Chile):</b> resistencia de la bencina a detonar antes de tiempo (“cascabeleo”). "
    "No significa “más potencia” por sí solo: se debe usar <b>el octanaje que indica el fabricante</b> (manual o tapa del estanque). "
    "Usar más octanaje que el recomendado no aporta beneficios reales; usar menos puede dañar motores de alta compresión o turbo.",
    "<b>Número de cetano:</b> equivalente del octanaje para el diésel (calidad de encendido).",
    "<b>DPF (filtro de partículas diésel):</b> atrapa el hollín. Se “regenera” quemándolo a alta temperatura, lo que requiere "
    "andar de vez en cuando en carretera a velocidad constante. Un diésel usado solo en trayectos urbanos cortos puede tapar el DPF.",
    "<b>AdBlue / urea (SCR):</b> líquido que se inyecta en el escape de algunos diésel modernos para reducir óxidos de nitrógeno (NOx). "
    "Tiene su propio estanque y hay que rellenarlo periódicamente; si se acaba, el auto puede limitar su potencia o no partir.",
    "<b>EGR (recirculación de gases):</b> devuelve parte de los gases de escape a la admisión para reducir emisiones.",
    "<b>Flex fuel:</b> motores que aceptan bencina y etanol en distintas mezclas (comunes en Brasil, poco en Chile)."])
warn("Cargar diésel en un auto bencinero (o al revés) es una de las fallas más caras. Si ocurre, <b>no se debe encender el motor</b>: "
     "hay que vaciar el estanque. Recuérdalo al entregar un auto: indica siempre el combustible correcto.")
h2("Otros componentes del motor que conviene conocer")
table(["Componente", "Función"], [
    ["Block (bloque)", "Cuerpo principal del motor donde están los cilindros. De hierro fundido o aluminio."],
    ["Culata (tapa de cilindros)", "Parte superior que cierra los cilindros y aloja válvulas, levas y bujías. La “junta de culata” sella entre culata y block."],
    ["Cárter", "Depósito inferior donde se acumula el aceite."],
    ["Cigüeñal", "Eje que convierte el sube y baja de los pistones en giro."],
    ["Volante motor", "Disco pesado al final del cigüeñal que suaviza el giro; ahí se acopla el embrague. “Volante bimasa”: versión con amortiguación, común en diésel."],
    ["Bujías", "Generan la chispa en bencineros. Se cambian según pauta (20.000–100.000 km según tipo)."],
    ["Bobinas", "Elevan el voltaje para que la bujía haga chispa."],
    ["Múltiple de admisión / escape", "Conductos que reparten el aire a los cilindros y recogen los gases."],
    ["Cuerpo de aceleración (mariposa)", "Válvula que regula cuánto aire entra, según cuánto pisas el acelerador (hoy es electrónico, “drive by wire”)."],
    ["ECU / ECM (computadora del motor)", "Cerebro electrónico que controla inyección, encendido, turbo, emisiones, etc."],
    ["Sensores (oxígeno/lambda, MAF, MAP, cigüeñal, temperatura, detonación)", "Informan a la ECU para que el motor funcione de forma óptima."],
    ["Start-Stop", "Apaga el motor al detenerse (en un semáforo) y lo enciende al soltar el freno; ahorra combustible en ciudad. Puede desactivarse con un botón."],
    ["Desactivación de cilindros", "Apaga algunos cilindros cuando se necesita poca fuerza (carretera a velocidad constante) para gastar menos."],
], [1.4, 3.6])

# =====================================================================
chapter("4", "Distribución: correa, cadena y correas auxiliares",
        "Una de las preguntas más típicas en la venta de autos, sobre todo usados: “¿es de correa o de cadena?” "
        "y “¿cuándo se cambia la correa?”.")
h2("¿Qué es la distribución?")
p("Es el sistema que <b>sincroniza el cigüeñal (pistones) con el árbol de levas (válvulas)</b>. Las válvulas tienen que abrirse "
  "y cerrarse en el momento exacto en que el pistón sube y baja. Esa sincronización se logra con una <b>correa dentada</b>, "
  "una <b>cadena</b> o, más raro, con engranajes.")
h2("Correa vs. cadena")
table(["", "Correa de distribución", "Cadena de distribución"], [
    ["Material", "Goma reforzada con fibras, con dientes.", "Metálica, como cadena de bicicleta."],
    ["Ruido", "Más silenciosa.", "Algo más ruidosa (las modernas son muy silenciosas)."],
    ["Mantención", "<b>Se cambia obligatoriamente</b> según pauta del fabricante: normalmente entre 60.000 y 120.000 km, "
     "o cada 4–6 años (lo que ocurra primero). Se cambia junto con tensor, poleas y casi siempre la bomba de agua (“kit de distribución”).",
     "Diseñada para durar la vida útil del motor; no tiene cambio programado. Se revisa si hace ruido (“cascabeleo” al partir en frío) o si hay falla de tensor."],
    ["Costo", "Mantención periódica (costo moderado a alto según motor).", "Sin costo programado; si falla, la reparación es cara."],
    ["Si se corta", "En muchos motores (“de interferencia”) las válvulas chocan con los pistones: daño grave del motor.", "Muy poco frecuente; aviso previo por ruido."],
    ["Variante", "Correa “húmeda” (bañada en aceite): algunos motores modernos; requiere aceite correcto y su pauta específica.", "—"],
], [0.9, 2.2, 2.2])
key("Al vender un usado, pregunta y verifica <b>cuándo se cambió la correa de distribución</b> (factura o registro en el libro de "
    "mantención). Si el auto está cerca o pasado del kilometraje o los años de cambio y no hay registro, debe informarse al "
    "cliente: es un gasto próximo que afecta la decisión y el precio.")
say("“Este motor tiene cadena de distribución: no requiere cambio programado como las correas, así que es un gasto "
    "menos en la mantención a largo plazo.” / “Este motor usa correa; según el fabricante se cambia a los 90.000 km. "
    "Este auto tiene 85.000 y aquí está la factura de que ya se hizo / o lo dejamos considerado.”")
h2("Correa de accesorios (alternador, poly-V, “correa del alternador”)")
p("Es distinta de la correa de distribución. Va por fuera del motor y mueve el <b>alternador</b>, el <b>compresor del aire "
  "acondicionado</b>, a veces la <b>bomba de agua</b> y la <b>bomba de dirección hidráulica</b>. Se revisa en las mantenciones y "
  "se cambia si está agrietada o hace ruido (chirrido al partir o al girar el volante). Si se corta, el auto pierde carga de "
  "batería, aire acondicionado y, en algunos, refrigeración: hay que detenerse.")
h2("Bomba de agua")
p("Hace circular el refrigerante por el motor. Puede ser mecánica (movida por la correa de distribución o de accesorios) o eléctrica. "
  "Cuando la mueve la correa de distribución, se recomienda cambiarla al mismo tiempo.")

# =====================================================================
chapter("5", "Sistemas de apoyo del motor",
        "Lubricación, refrigeración, admisión, escape, combustible y sistema eléctrico: lo que mantiene vivo al motor.")
h2("Lubricación: el aceite de motor")
p("El aceite reduce el roce entre piezas metálicas, enfría, limpia y protege contra la corrosión. Una bomba lo hace circular "
  "desde el cárter, pasando por el <b>filtro de aceite</b>.")
h3("Cómo leer la viscosidad: 5W-30")
bl(["El primer número con la <b>W</b> (de <i>winter</i>, invierno) indica la fluidez en frío: más bajo = fluye más rápido al partir, "
    "protegiendo mejor el motor en los primeros segundos (que es cuando más se desgasta).",
    "El segundo número indica la viscosidad a temperatura de funcionamiento (100 °C): más alto = aceite más “grueso”.",
    "Siempre se usa la viscosidad y la <b>norma</b> que indica el fabricante (API SP, ACEA C3, normas propias de cada marca, etc.)."])
table(["Tipo de aceite", "Características", "Cambio típico"], [
    ["Mineral", "Básico, derivado directo del petróleo. Autos antiguos.", "5.000 km aprox."],
    ["Semisintético", "Mezcla. Buena relación precio/protección.", "5.000–10.000 km."],
    ["Sintético", "Mayor protección, estabilidad y duración. Obligatorio en la mayoría de motores modernos y turbo.", "10.000–15.000 km o 1 año (según fabricante)."],
], [1, 2.6, 1.3])
warn("Los intervalos reales los define el <b>plan de mantención del fabricante</b>. Si el auto se usa en “condiciones severas” "
     "(mucho taco, polvo, trayectos cortos, remolque) los intervalos se acortan. Nunca prometas intervalos distintos a los oficiales.")
h2("Refrigeración")
bl(["El motor genera mucho calor. El <b>refrigerante</b> (anticongelante, de colores como verde, rosado, azul o naranjo según tipo) "
    "circula por el motor y se enfría en el <b>radiador</b>, ayudado por un <b>electroventilador</b>.",
    "El <b>termostato</b> es una válvula que mantiene el motor a su temperatura ideal (~90 °C).",
    "El <b>depósito de expansión</b> permite revisar el nivel (entre MIN y MAX, con motor frío). Nunca se debe abrir caliente.",
    "Se cambia según pauta (aprox. cada 2–5 años o 40.000–160.000 km según tipo, “long life”).",
    "Si la aguja de temperatura sube a rojo, hay que detenerse: seguir manejando puede dañar la junta de culata o el motor completo."])
h2("Admisión y escape")
bl(["<b>Filtro de aire de motor:</b> evita que entre polvo. Se cambia en mantenciones (10.000–30.000 km; antes en zonas de tierra).",
    "<b>Filtro de cabina (de polen):</b> filtra el aire que entra a la cabina. Muy relevante para alérgicos. Algunos son de carbón activado o “PM2.5”.",
    "<b>Catalizador:</b> transforma gases tóxicos (CO, HC, NOx) en gases menos dañinos. Obligatorio. Contiene metales preciosos (por eso a veces se roban).",
    "<b>Sonda lambda (sensor de oxígeno):</b> mide el oxígeno en el escape para ajustar la mezcla.",
    "<b>Silenciador:</b> reduce el ruido del escape.",
    "<b>Filtro de partículas de gasolina (GPF/OPF):</b> equivalente al DPF, en algunos bencineros de inyección directa recientes."])
h2("Sistema de combustible")
bl(["<b>Estanque:</b> su capacidad (litros) más el rendimiento determina la autonomía: estanque 50 L × 14 km/L ≈ 700 km.",
    "<b>Bomba de combustible:</b> eléctrica, dentro del estanque. Por eso se recomienda no andar siempre en reserva (el combustible la enfría).",
    "<b>Filtro de combustible:</b> se cambia según pauta; en diésel es crítico (el agua en el diésel daña los inyectores; muchos tienen trampa de agua).",
    "<b>Inyectores:</b> pulverizan el combustible. Combustible de mala calidad puede taparlos."])
h2("Sistema eléctrico")
table(["Componente", "Función", "Datos útiles"], [
    ["Batería (12 V)", "Arranca el motor y alimenta la electrónica con motor apagado.", "Duración típica 3–5 años. Capacidad en Ah y corriente de arranque en CCA. Autos con Start-Stop usan baterías especiales (EFB o AGM)."],
    ["Alternador", "Genera electricidad con el motor en marcha y recarga la batería.", "Si falla, se enciende el testigo de batería y el auto se apagará cuando se agote la batería."],
    ["Motor de partida (arranque)", "Hace girar el motor para encenderlo.", "Si “hace clic” y no gira, suele ser batería baja o motor de partida."],
    ["Fusibles y relés", "Protegen los circuitos.", "Caja en el motor y otra en el habitáculo."],
    ["Red CAN-bus", "“Red de computadoras” por donde se comunican los módulos del auto.", "Permite diagnóstico por escáner (conector OBD-II bajo el tablero)."],
    ["Sistema de 48 V", "Red eléctrica adicional en híbridos ligeros (MHEV).", "Ver capítulo de electrificación."],
], [1.2, 1.8, 2.4])
h2("Luces")
table(["Tecnología", "Características"], [
    ["Halógena", "Básica, luz amarillenta, económica."],
    ["Xenón / HID (bi-xenón)", "Luz blanca e intensa. Menos común hoy."],
    ["LED", "Luz blanca, eficiente, larga vida, enciende instantáneo. Hoy lo más común en versiones medias y altas."],
    ["Full LED", "Todas las luces exteriores (bajas, altas, posición, freno) con LED."],
    ["LED matricial / adaptativo (Matrix, Pixel)", "Luces altas “inteligentes” que apagan segmentos para no encandilar a otros autos."],
    ["Láser", "Muy alto alcance; autos de lujo."],
    ["DRL (luces diurnas)", "Luces de circulación diurna para ser visto de día."],
    ["Luces automáticas / auto high beam", "Se encienden solas al oscurecer / cambian solas entre altas y bajas."],
    ["Luces direccionales / cornering", "Giran o iluminan hacia la curva."],
], [1.5, 3.5])

# =====================================================================
chapter("6", "Transmisión, caja de cambios y tracción",
        "La caja de cambios define gran parte de la experiencia de manejo, del consumo y de la mantención.")
h2("¿Para qué sirve una caja de cambios?")
p("El motor entrega su mejor fuerza en un rango de rpm limitado. La caja usa <b>engranajes de distinto tamaño</b> (marchas) "
  "para que el motor trabaje siempre en su zona ideal: marchas cortas (1ª, 2ª) para partir y subir con fuerza; marchas largas "
  "(5ª, 6ª o más) para ir rápido gastando poco. <b>Más marchas</b> = el motor trabaja más cerca de su punto ideal = mejor "
  "consumo y aceleración más fluida.")
h2("Tipos de caja")
table(["Tipo", "Cómo funciona", "Ventajas", "Desventajas / cuidados"], [
    ["Manual (MT)", "El conductor cambia con palanca y pedal de embrague. 5 o 6 marchas.", "Más barata, simple, control total, mantención económica.", "Cansadora en taco. El embrague se desgasta según el uso (cambio típico 60.000–150.000 km)."],
    ["Automática convencional (AT)", "Convertidor de torque (acople hidráulico) + engranajes planetarios. 4 a 10 marchas.", "Muy suave y robusta, soporta bien el remolque.", "Algo más de consumo en modelos antiguos; mantención del aceite de caja según pauta."],
    ["CVT (variación continua)", "No tiene marchas fijas: dos poleas de diámetro variable y una correa/cadena metálica. Muchas simulan marchas.", "Muy suave, sin tirones, buen consumo en ciudad.", "Sensación de “motor acelerado” al exigirla (efecto “banda elástica”); requiere su aceite específico."],
    ["Doble embrague (DCT / DSG / PDK / EDC)", "Dos embragues: uno para marchas pares y otro para impares; prepara la siguiente marcha.", "Cambios rapidísimos, deportiva, eficiente.", "Puede ser algo brusca a muy baja velocidad (estacionar, taco). Mantención según pauta. Seca o húmeda (bañada en aceite)."],
    ["Manual automatizada (AMT)", "Caja manual con un robot que cambia y embraga.", "Barata y eficiente.", "Cambios lentos con “cabeceo”; menos refinada."],
    ["Reductor de una marcha", "Típico de autos eléctricos: no necesitan caja de varias marchas.", "Aceleración continua, sin cambios.", "—"],
    ["e-CVT / caja híbrida", "Sistema planetario que combina motor a combustión y eléctrico (híbridos).", "Muy eficiente y suave.", "—"],
], [1.1, 1.7, 1.4, 1.7])
h3("Letras y modos de una caja automática")
bl(["<b>P</b> Park (estacionamiento, bloquea la caja) · <b>R</b> Reversa · <b>N</b> Neutro · <b>D</b> Drive (avance).",
    "<b>M o +/–</b>: modo manual secuencial; <b>paletas</b> (levas) tras el volante para cambiar con los dedos.",
    "<b>S</b> Sport: cambia más tarde, más respuesta. <b>L / B</b>: marcha baja o retención (freno motor/regeneración en híbridos).",
    "<b>Modos de manejo</b> (Eco, Normal, Sport, Snow, Mud, Sand…): ajustan acelerador, caja, dirección y a veces tracción.",
    "<b>Kick-down</b>: pisar el acelerador a fondo hace bajar marchas para adelantar."])
say("“Esta caja es CVT: no vas a sentir tirones porque no tiene marchas fijas, y en ciudad es de las más eficientes.” / "
    "“Esta es de doble embrague: cambia en milésimas de segundo, como la de un auto deportivo.”")
h2("Embrague")
p("Disco que conecta y desconecta el motor de la caja. En manuales lo acciona el pedal izquierdo. Se desgasta con el uso "
  "(más en ciudad, cuestas y si se maneja con el pie apoyado en el pedal). Síntomas de desgaste: el motor sube de rpm pero el auto "
  "no avanza igual (“patina”), pedal que agarra muy arriba, olor a quemado. El “kit de embrague” incluye disco, prensa y rodamiento; "
  "en algunos diésel también se cambia el volante bimasa.")
h2("Tracción: ¿qué ruedas empujan?")
table(["Tipo", "Sigla", "Descripción", "Ideal para"], [
    ["Delantera", "FWD / 4x2", "El motor mueve las ruedas delanteras. Lo más común.", "Uso urbano y carretera; eficiente, buen espacio interior, predecible en lluvia."],
    ["Trasera", "RWD / 4x2", "El motor mueve las ruedas traseras.", "Camionetas de trabajo (mejor tracción con carga), autos deportivos y premium (mejor equilibrio)."],
    ["Integral / total permanente", "AWD", "Las cuatro ruedas reciben fuerza siempre o automáticamente cuando hace falta (“AWD on demand”).", "Lluvia, nieve, ripio, caminos rurales. Más seguridad y adherencia. No es para off-road extremo (en general no tiene reductora)."],
    ["4x4 conectable (part-time)", "4WD / 4x4", "El conductor activa la tracción 4x4 (botón o palanca). Normalmente con <b>reductora</b>.", "Off-road real: barro, arena, pendientes fuertes, campo. En pavimento seco se usa en 4x2 (2H)."],
    ["4x4 permanente", "Full-time 4WD", "4x4 siempre activa con diferencial central; con reductora.", "Todoterrenos que deben andar en cualquier superficie."],
], [1.1, 0.9, 2.2, 2.1])
h3("Conceptos clave de 4x4")
bl(["<b>2H / 4H / 4L:</b> 2H = 4x2 (tracción en un eje); 4H = 4x4 alta (velocidades normales en tierra, nieve, ripio); "
    "4L = 4x4 baja con <b>reductora</b> (marchas muy cortas que multiplican la fuerza: para subir o bajar pendientes extremas, "
    "barro, rocas, arena o sacar un vehículo pegado; se usa a muy baja velocidad).",
    "<b>Diferencial:</b> conjunto de engranajes que permite que las ruedas de un mismo eje giren a distinta velocidad en las curvas "
    "(la rueda exterior recorre más distancia). Problema: si una rueda pierde agarre, el diferencial manda la fuerza a esa rueda y el auto se queda.",
    "<b>Bloqueo de diferencial (trasero, central o delantero):</b> obliga a ambas ruedas a girar igual. Clave para off-road. Solo se usa en terreno suelto, nunca en pavimento.",
    "<b>Diferencial autoblocante (LSD):</b> limita mecánicamente la diferencia de giro; mejora la tracción.",
    "<b>Diferencial central / caja de transferencia:</b> reparte fuerza entre eje delantero y trasero en los 4x4.",
    "<b>Bloqueo electrónico / Torque vectoring:</b> la electrónica frena la rueda que patina o reparte fuerza entre ruedas para mejorar tracción y giro.",
    "<b>Ángulo de ataque, salida y ventral:</b> ángulos máximos de pendiente que puede enfrentar sin golpear la parte delantera, trasera o el centro. Mientras más grandes, mejor en off-road.",
    "<b>Capacidad de vadeo:</b> profundidad de agua que puede cruzar de forma segura (ej. 600–800 mm en camionetas y SUV 4x4).",
    "<b>Despeje (altura libre al suelo):</b> distancia entre el suelo y el punto más bajo del auto. Sedán ~140–160 mm; SUV ~170–220 mm; camioneta 4x4 ~220–300 mm."])
key("AWD = seguridad y adherencia automática en condiciones resbaladizas. 4x4 con reductora = capacidad todoterreno real. "
    "Si el cliente va a la nieve en invierno por camino pavimentado o ripio, un AWD basta; si va a sacar el auto del camino, necesita 4x4 con reductora.")
h2("Otros elementos del tren motriz")
bl(["<b>Palieres / semiejes y homocinéticas:</b> ejes que llevan la fuerza a las ruedas delanteras; las homocinéticas permiten que giren mientras doblan. "
    "Síntoma de desgaste: “trac-trac” al doblar con el volante girado a fondo. Están protegidas por <b>guardapolvos</b> (fuelles de goma).",
    "<b>Cardán (eje de transmisión):</b> eje largo que lleva la fuerza hacia el eje trasero en RWD y 4x4.",
    "<b>Relación final / de diferencial:</b> multiplicación final. “Corta” = más fuerza, menos velocidad máxima; “larga” = más velocidad y menor consumo en carretera."])
