from lib import *

# =====================================================================
chapter("14", "Consumo, rendimiento y emisiones",
        "“¿Cuánto gasta?” es probablemente la pregunta más repetida en una sala de ventas.")
h2("Cómo se expresa el consumo")
bl(["<b>km/L</b> (kilómetros por litro): forma usada en Chile. <b>Más es mejor</b>. Ej.: 15 km/L.",
    "<b>L/100 km</b> (litros cada 100 km): forma europea. <b>Menos es mejor</b>. Ej.: 6,7 L/100 km.",
    "Conversión: km/L = 100 ÷ (L/100 km). 5 L/100 km = 20 km/L; 6,7 = 15; 8 = 12,5; 10 = 10; 12,5 = 8.",
    "<b>MPG</b> (millas por galón): EE.UU. 1 MPG (EE.UU.) ≈ 0,425 km/L.",
    "<b>kWh/100 km</b>: consumo de autos eléctricos. 15 kWh/100 km es un consumo eficiente."])
h2("Ciclos: urbano, extraurbano y mixto")
p("La <b>etiqueta de eficiencia energética vehicular</b> (obligatoria en Chile para autos nuevos livianos y medianos) informa el rendimiento "
  "<b>urbano</b> (ciudad, con detenciones), <b>extraurbano</b> (carretera) y <b>mixto</b> (combinado), además de las emisiones de CO<sub>2</sub> en g/km. "
  "Son valores de laboratorio para comparar autos entre sí; el consumo real depende del uso.")
table(["Factor", "Efecto en el consumo"], [
    ["Estilo de manejo", "Aceleraciones y frenadas bruscas pueden aumentar el consumo 20–40%."],
    ["Velocidad", "A 120 km/h se gasta bastante más que a 100 km/h (la resistencia del aire crece con el cuadrado de la velocidad)."],
    ["Taco y trayectos cortos", "El motor frío y las detenciones elevan mucho el consumo (aquí brillan los híbridos y eléctricos)."],
    ["Aire acondicionado", "Puede sumar 5–20% según condiciones."],
    ["Presión de neumáticos baja", "Aumenta la resistencia a la rodadura."],
    ["Carga, portaequipaje en el techo", "Más peso y peor aerodinámica."],
    ["Mantención", "Filtros sucios, bujías gastadas o aceite viejo empeoran el rendimiento."],
], [1.3, 3.7])
h2("Aerodinámica")
p("El <b>coeficiente aerodinámico (Cx o Cd)</b> mide qué tan fácil corta el aire la carrocería. Valores típicos: autos 0,25–0,32; SUV 0,32–0,40; "
  "camionetas 0,40+. Menor = menos consumo y ruido en carretera. Algunos autos tienen <b>persianas activas</b> en la parrilla que se cierran a alta velocidad.")
h2("Emisiones y normas")
bl(["<b>CO<sub>2</sub> (dióxido de carbono):</b> gas de efecto invernadero; directamente proporcional al combustible quemado.",
    "<b>CO, HC, NOx, material particulado (MP):</b> contaminantes locales regulados por las normas de emisión.",
    "<b>Normas Euro (Euro 4, 5, 6…):</b> límites de emisiones cada vez más estrictos. Chile exige normas equivalentes a Euro 6 para vehículos livianos nuevos (confirma la etapa vigente).",
    "<b>Impuesto verde</b> (Chile): impuesto que pagan los autos nuevos livianos y medianos en su primera venta, calculado según emisiones y rendimiento. Los menos contaminantes pagan menos.",
    "<b>Restricción vehicular</b> (Santiago): depende de la norma de emisión / año del auto y de los episodios ambientales. Revisa el calendario vigente antes de responder."])
say("“El consumo homologado es de 16 km/L mixto. En la práctica, en ciudad con taco puede ser algo menos, y en carretera a velocidad constante, "
    "probablemente lo superes. Depende mucho de cómo se maneje.”")
h2("Cómo calcular el costo de uso para un cliente")
nl(["Pregunta cuántos km recorre al mes (ej. 1.500 km).",
    "Divide por el rendimiento (1.500 ÷ 15 km/L = 100 litros).",
    "Multiplica por el precio del litro vigente: ese es su gasto mensual aproximado en combustible.",
    "En eléctricos: (km ÷ 100) × consumo kWh/100 km × precio kWh. Ej. 1.500 km × 16 kWh/100 km = 240 kWh al mes.",
    "Compara entre opciones: es una herramienta muy potente para justificar un híbrido, diésel o eléctrico."])

# =====================================================================
chapter("15", "Mantención, desgaste y testigos del tablero",
        "Saber de mantención te permite dar confianza en la compra y explicar el estado real de un usado.")
h2("El plan de mantención")
p("Cada fabricante define un <b>plan de mantención</b> por kilometraje y tiempo (lo que ocurra primero), típicamente cada <b>10.000 km o 1 año</b> "
  "(a veces 5.000, 15.000 o 20.000 km). Cumplirlo en un servicio autorizado (o según las condiciones que exija la marca) es requisito para mantener "
  "la <b>garantía</b>. Se registra en el <b>libro o registro digital de mantenciones</b>.")
table(["Ítem", "Frecuencia típica (referencial: siempre manda la pauta del fabricante)"], [
    ["Aceite y filtro de aceite", "Cada 5.000–15.000 km o 1 año."],
    ["Filtro de aire de motor", "Cada 20.000–40.000 km (antes en caminos de tierra)."],
    ["Filtro de cabina (polen)", "Cada 10.000–20.000 km o 1 año."],
    ["Filtro de combustible", "Diésel: 20.000–40.000 km. Bencina: muchos son “de por vida” dentro del estanque."],
    ["Bujías", "Normales 20.000–40.000 km; iridio/platino 60.000–120.000 km."],
    ["Correa de distribución (si tiene)", "60.000–120.000 km o 4–6 años."],
    ["Líquido de frenos", "Cada 2 años / 40.000 km."],
    ["Refrigerante", "Cada 2–5 años según tipo."],
    ["Aceite de caja automática / CVT / DCT", "Según pauta (40.000–100.000 km); algunas se declaran “de por vida”, pero conviene revisar."],
    ["Aceite de diferenciales y caja de transferencia (4x4)", "40.000–80.000 km, o antes con uso severo/vadeo."],
    ["Pastillas de freno", "Según desgaste (20.000–60.000 km)."],
    ["Neumáticos", "Según desgaste (40.000–70.000 km aprox.) o 5–6 años de antigüedad."],
    ["Batería 12 V", "3–5 años."],
    ["Escobillas limpiaparabrisas", "Cada 6–12 meses."],
    ["Alineación y balanceo", "Cada 10.000 km o al cambiar neumáticos."],
    ["Amortiguadores", "Revisar desde 40.000–60.000 km; cambio típico 60.000–100.000 km."],
], [1.7, 3.3])
h2("Testigos (luces) del tablero")
p("El color indica la urgencia: <b>rojo</b> = detenerse lo antes posible de forma segura; <b>amarillo/ámbar</b> = revisar pronto; "
  "<b>verde/azul</b> = sistema funcionando (informativo).")
table(["Testigo", "Color", "Significado y qué hacer"], [
    ["Aceite (aceitera)", "Rojo", "Baja presión de aceite. Detener y apagar el motor inmediatamente; revisar nivel. Seguir puede destruir el motor."],
    ["Temperatura (termómetro)", "Rojo", "Motor sobrecalentado. Detenerse, no abrir el depósito caliente."],
    ["Batería", "Rojo", "El alternador no está cargando. El auto se apagará pronto; ir al taller."],
    ["Frenos (!) en círculo", "Rojo", "Freno de mano puesto o nivel bajo de líquido de frenos/falla. No circular si persiste."],
    ["Airbag / SRS", "Rojo", "Falla en el sistema de airbags: podrían no activarse."],
    ["Cinturón", "Rojo", "Algún ocupante sin cinturón."],
    ["Puerta / capó / maletero abierto", "Rojo", "Algo mal cerrado."],
    ["Check engine (motor)", "Ámbar", "Falla de motor o emisiones detectada por la ECU. Fijo: revisar pronto. <b>Parpadeando</b>: falla grave (falla de encendido), bajar la carga y llevar al taller."],
    ["ABS", "Ámbar", "Falla del ABS: los frenos funcionan, pero sin antibloqueo."],
    ["ESP / control de estabilidad", "Ámbar", "Parpadeando: está actuando (normal en piso resbaloso). Fijo: desactivado o con falla."],
    ["TPMS (neumático con !)", "Ámbar", "Presión baja en algún neumático."],
    ["Bujía de precalentamiento (espiral)", "Ámbar", "Diésel: esperar a que se apague antes de dar arranque. Si parpadea en marcha, falla."],
    ["DPF", "Ámbar", "Filtro de partículas saturado: hacer un tramo en carretera o ir al taller."],
    ["AdBlue", "Ámbar", "Nivel bajo de AdBlue: rellenar."],
    ["Combustible", "Ámbar", "Reserva."],
    ["Mantención (llave)", "Ámbar", "Toca mantención programada."],
    ["Luces / intermitentes / crucero", "Verde", "Informativo: sistema activo."],
    ["Luces altas", "Azul", "Luces altas encendidas."],
    ["READY", "Verde", "Híbridos/eléctricos: el auto está listo para andar (aunque no se escuche el motor)."],
], [1.5, 0.6, 3])
h2("Síntomas comunes y su posible causa")
table(["Síntoma", "Posible causa"], [
    ["Chirrido al partir o al girar el volante", "Correa de accesorios suelta o gastada."],
    ["Chirrido metálico al frenar", "Pastillas gastadas (testigo sonoro)."],
    ["Vibración en el volante al frenar", "Discos deformados."],
    ["Vibración en el volante a 80–120 km/h", "Ruedas desbalanceadas."],
    ["Auto se va hacia un lado", "Alineación, presión dispareja o problema de frenos."],
    ["“Clac-clac” en baches", "Bieletas, bujes o amortiguadores."],
    ["“Trac-trac” al doblar a fondo", "Homocinéticas."],
    ["Humo azul por el escape", "Consumo de aceite (anillos, sellos de válvulas, turbo)."],
    ["Humo blanco espeso y persistente", "Posible refrigerante en la combustión (junta de culata). Algo de vapor al partir en frío es normal."],
    ["Humo negro", "Exceso de combustible (diésel: inyectores, filtro de aire, exigencia)."],
    ["Motor “tironea” o tiembla en ralentí", "Bujías, bobinas, inyectores, sensores, soportes de motor."],
    ["Cascabeleo metálico al partir en frío", "Posible tensor o cadena de distribución."],
    ["Manchas bajo el auto", "Aceite (café/negro), refrigerante (verde/rosado, olor dulce), líquido de frenos o dirección. Agua transparente del aire acondicionado es normal."],
    ["Embrague que patina", "Kit de embrague desgastado."],
    ["Golpe al cambiar en automático", "Aceite de caja o falla de la caja; revisar."],
], [1.8, 3.2])

# =====================================================================
chapter("16", "Cómo evaluar un auto usado",
        "Un buen vendedor de usados conoce el auto antes que el cliente y comunica su estado con transparencia.")
h2("Revisión de documentos")
nl(["<b>Certificado de Anotaciones Vigentes (CAV)</b> del Registro Civil: dueño actual, prendas, prohibiciones de enajenar, embargos, "
    "y cantidad de dueños anteriores (hay certificado de historial).",
    "<b>Padrón</b> (certificado de inscripción): datos del auto (VIN, número de motor, color, año).",
    "<b>Permiso de circulación</b> vigente, <b>SOAP</b> vigente y <b>revisión técnica</b> vigente (incluye análisis de gases).",
    "<b>Certificado de multas</b> (Registro de Multas de Tránsito No Pagadas): las multas impagas impiden renovar el permiso.",
    "<b>Libro o historial de mantenciones</b> y facturas (especialmente correa de distribución, embrague, frenos, neumáticos).",
    "Verificar que el <b>VIN</b> y el <b>número de motor</b> físicos coincidan con los documentos.",
    "Revisar si tiene <b>campañas de llamado a revisión (recall)</b> pendientes con la marca.",
    "Consultar si tiene historial de <b>siniestros</b> (informes de historial vehicular disponibles en el mercado)."])
h2("Inspección exterior")
bl(["Mirar la carrocería a contraluz y de lado: ondulaciones indican reparaciones.",
    "<b>Diferencias de tono</b> entre paneles, <b>exceso de pintura</b> en gomas o molduras, <b>separaciones dispares</b> entre puertas y paneles: señales de choque reparado.",
    "Un <b>medidor de espesor de pintura</b> permite detectar paneles repintados (pintura original típica 80–150 micras; mucho más alto indica masilla o repintado).",
    "Revisar fecha de los vidrios (grabada en cada vidrio): si uno es más nuevo, fue reemplazado.",
    "Pernos de capó, tapabarros y bisagras con marcas de herramientas: piezas desmontadas.",
    "Óxido en zócalos, bajos y pick-up de camionetas.",
    "Neumáticos: profundidad, desgaste parejo (desgaste irregular = alineación o suspensión), fecha DOT, misma marca en un eje.",
    "Luces: opacas, empañadas, con humedad o trizadas."])
h2("Inspección interior")
bl(["El desgaste del volante, pomo de cambios, pedales y asiento del conductor debe ser coherente con el kilometraje: si el auto marca 40.000 km y el volante está pelado, sospecha de <b>kilometraje adulterado</b>.",
    "Probar todo: alzavidrios, espejos, aire acondicionado (que enfríe bien), calefacción, multimedia, cámaras, sensores, luces interiores, bocina, limpiaparabrisas.",
    "Olor a humedad o manchas en alfombras: posible filtración o inundación. Olor a tabaco o mascotas afecta el valor.",
    "Al dar contacto todos los testigos deben encenderse unos segundos y luego apagarse (si el de airbag no se enciende nunca, puede estar anulado)."])
h2("Inspección del motor")
bl(["Partir con el <b>motor frío</b> (pide que no lo hayan encendido antes): ruidos, humo y facilidad de arranque se notan más.",
    "Nivel y aspecto del aceite (no lechoso — color café con leche indica refrigerante mezclado).",
    "Fugas de aceite o refrigerante; nivel de refrigerante.",
    "Ruidos anormales: golpeteo, cascabeleo, silbidos.",
    "Escanear con un <b>lector OBD-II</b>: códigos de falla guardados o borrados recientemente."])
h2("Prueba de ruta")
bl(["Que la caja cambie suave en todas las marchas (también en reversa).",
    "Embrague (manual): que no patine en marchas altas al acelerar.",
    "Dirección: que vaya derecho y el volante centrado; sin ruidos al girar.",
    "Frenos: firmes, sin vibraciones, sin desviarse.",
    "Suspensión: sin golpes ni rebotes en lomos de toro.",
    "Ruidos de rodamientos (zumbido que aumenta con la velocidad).",
    "Temperatura del motor estable."])
h2("Factores que afectan el precio de un usado")
table(["Factor", "Comentario"], [
    ["Año y kilometraje", "Referencia: 15.000–20.000 km por año es un uso normal en Chile."],
    ["Versión y equipamiento", "Una versión full se vende más rápido y a mejor precio."],
    ["Número de dueños", "Un dueño con historial completo es lo más valorado."],
    ["Mantenciones en la marca", "Aumentan la confianza y el valor."],
    ["Historial de choques", "Choques estructurales bajan mucho el valor."],
    ["Estado estético", "Pintura, interior, neumáticos."],
    ["Demanda del modelo", "Algunos modelos y marcas tienen mejor valor de reventa."],
    ["Tipo de combustible y transmisión", "Automáticos y SUV suelen ser más demandados; diésel depende del segmento."],
    ["Color", "Colores neutros (blanco, gris, plata, negro) suelen venderse más rápido."],
], [1.5, 3.5])
warn("Si sabes de una falla o de un choque importante, debes informarlo. Ocultar información relevante expone a la empresa a reclamos bajo la "
     "Ley del Consumidor y destruye la confianza. Lo honesto también vende: “Tuvo un choque leve en el parachoques trasero, reparado; aquí está el informe”.")

# =====================================================================
chapter("17", "Documentos y trámites en Chile",
        "Preguntas típicas: “¿qué papeles tiene?”, “¿cuánto cuesta transferir?”, “¿cuándo le toca la revisión técnica?”. "
        "Los montos y plazos cambian: confirma siempre la información vigente en las fuentes oficiales.")
table(["Documento / trámite", "Qué es", "Dónde / cuándo"], [
    ["Padrón (Certificado de Inscripción)", "“Carnet” del vehículo: dueño, patente, VIN, motor, año, color.", "Registro Civil (Registro Nacional de Vehículos Motorizados)."],
    ["Certificado de Anotaciones Vigentes (CAV)", "Dueño actual, prendas, prohibiciones, embargos, medidas precautorias.", "Registro Civil, en línea."],
    ["Patente (placa patente única, PPU)", "Formato actual: 4 letras y 2 números (ej. BBCD·12). Autos antiguos: 2 letras y 4 números.", "Se asigna al inscribir el auto por primera vez."],
    ["Permiso de circulación", "Impuesto anual municipal para circular. Se calcula según la tasación fiscal del auto (SII).", "Municipalidad (presencial o en línea). Autos particulares: en marzo, pudiendo pagarse en dos cuotas (marzo y agosto)."],
    ["SOAP", "Seguro Obligatorio de Accidentes Personales: cubre gastos médicos, invalidez y muerte de <b>personas</b> por accidentes. <b>No cubre daños materiales</b>.", "Se contrata antes de pagar el permiso; vigencia anual."],
    ["Revisión técnica", "Inspección de seguridad y emisiones (incluye análisis de gases).", "Plantas de revisión técnica, según el último dígito de la patente. Los autos nuevos tienen un plazo inicial antes de su primera revisión (confirmar regla vigente)."],
    ["Certificado de homologación", "Acredita que el modelo cumple las normas chilenas (emisiones, seguridad). Lo emite el 3CV del Ministerio de Transportes.", "Autos nuevos; reemplaza la revisión técnica inicial."],
    ["Registro de multas no pagadas", "Multas de tránsito impagas asociadas a la patente.", "Registro Civil; impiden renovar el permiso de circulación."],
    ["Factura", "Documento de compra de un auto nuevo (o usado vendido por empresa).", "Necesaria para inscribir el auto a nombre del primer dueño."],
], [1.4, 2.2, 1.9])
h2("Transferencia de un auto usado")
nl(["Se firma un <b>contrato de compraventa</b>: en una notaría, en el Registro Civil, o mediante la <b>transferencia electrónica</b> habilitada en línea "
    "(con ClaveÚnica, según las condiciones vigentes).",
    "El comprador paga el <b>impuesto a la transferencia</b>: <b>1,5% del valor mayor entre el precio de venta y la tasación fiscal</b> del SII.",
    "Se solicita la inscripción a nombre del nuevo dueño en el Registro Civil, que emite el nuevo padrón.",
    "El auto no debe tener prendas ni prohibiciones vigentes (si las tiene, primero hay que <b>alzarlas</b>, por ejemplo pagando el crédito).",
    "Se recomienda revisar multas, permiso de circulación, SOAP y revisión técnica vigentes al momento de la venta."])
key("Un auto con <b>crédito vigente</b> normalmente tiene una <b>prenda</b> inscrita a favor de la financiera: no puede transferirse libremente hasta pagar la deuda "
    "y alzar la prenda. Al recibir un auto en parte de pago, siempre revisa el CAV.")
h2("Otros conceptos útiles")
bl(["<b>Tasación fiscal:</b> valor que el SII asigna a cada modelo y año; base para el permiso de circulación y el impuesto de transferencia.",
    "<b>VIN (número de chasis / bastidor):</b> código único de 17 caracteres que identifica cada auto. Está grabado en el chasis, en una placa visible "
    "en la base del parabrisas y en el padrón. El 10º carácter indica el año modelo.",
    "<b>Año modelo vs. año de fabricación:</b> un auto “modelo 2026” puede haberse fabricado en 2025. Lo que figura en documentos es el año modelo.",
    "<b>Impuesto verde:</b> se paga una vez, en la compra del auto nuevo; normalmente ya incluido en el precio informado (confirmar con cada marca).",
    "<b>Vehículos diésel:</b> suelen pagar un recargo en el permiso de circulación.",
    "<b>Vehículos eléctricos e híbridos:</b> han contado con beneficios en el permiso de circulación (rebajas transitorias). Verifica la vigencia antes de ofrecerlos como argumento."])

# =====================================================================
chapter("18", "Garantías, financiamiento y seguros",
        "Saber explicar los números y las condiciones genera confianza y cierra ventas.")
h2("Garantías")
table(["Tipo", "Descripción"], [
    ["Garantía legal", "La establece la Ley del Consumidor: si un producto nuevo presenta fallas, el consumidor puede optar por cambio, reparación o devolución dentro del plazo legal (actualmente 6 meses desde la compra). Confirma condiciones con el área legal."],
    ["Garantía del fabricante (convencional)", "La ofrece la marca: típicamente 3 a 7 años o 100.000–200.000 km (lo que ocurra primero). Exige cumplir el plan de mantención."],
    ["Garantía de batería / tren motriz", "En eléctricos e híbridos, la batería de alta tensión suele tener garantía separada (ej. 8 años o 160.000 km)."],
    ["Garantía de pintura y corrosión", "Plazos propios (ej. 3 años pintura, 6–12 años corrosión)."],
    ["Garantía extendida", "Extensión pagada de la cobertura, al terminar la de fábrica."],
    ["Garantía de usados", "Algunas automotoras ofrecen cobertura mecánica limitada (motor y caja) por meses o km. Explica claramente qué cubre y qué no."],
], [1.4, 3.6])
bl(["<b>Qué no cubre normalmente una garantía:</b> piezas de desgaste (pastillas, discos, neumáticos, plumillas, embrague, ampolletas), daños por mal uso, "
    "accidentes, modificaciones, falta de mantención, uso de combustible o aceite inadecuado.",
    "<b>Recall (llamado a revisión):</b> campaña del fabricante para corregir gratis un defecto detectado en una serie de autos. Es positivo informarlo."])
h2("Financiamiento")
table(["Opción", "Cómo funciona", "Para quién"], [
    ["Contado", "Pago total.", "Quien tiene el dinero; a veces hay mejores descuentos con financiamiento."],
    ["Crédito automotriz convencional", "Pie (ej. 20–40%) + cuotas fijas (12 a 60 meses o más). El auto queda con prenda hasta pagarlo.", "La mayoría de los clientes."],
    ["Crédito inteligente / compra inteligente", "Pie + cuotas más bajas + una <b>cuota final grande</b> (a menudo con un valor futuro garantizado). Al final: pagas la cuota final, refinancias o entregas el auto en parte de pago por uno nuevo.", "Quien quiere cuotas bajas y renovar el auto cada 2–4 años."],
    ["Leasing", "Arriendo con opción de compra al final.", "Principalmente empresas y personas con giro (ventajas tributarias; consultar con su contador)."],
    ["Renting / arriendo de largo plazo", "Arriendo mensual que incluye mantención, seguro y a veces reemplazo; no se compra el auto.", "Empresas y personas que no quieren preocuparse de nada."],
    ["Parte de pago (retoma)", "El auto del cliente se recibe como parte del pie.", "Clientes que renuevan su auto."],
], [1.3, 2.4, 1.6])
h3("Conceptos financieros que debes manejar")
bl(["<b>Pie:</b> pago inicial. Más pie = cuota menor y menos intereses.",
    "<b>Tasa de interés:</b> mensual o anual.",
    "<b>CAE (Carga Anual Equivalente):</b> indicador obligatorio en Chile que expresa el costo total del crédito en % anual, incluyendo intereses, seguros y gastos. "
    "<b>Es el número correcto para comparar créditos.</b>",
    "<b>Costo total del crédito:</b> suma de todo lo que se paga. Debe informarse al cliente.",
    "<b>Seguro de desgravamen:</b> paga la deuda si el titular fallece (a veces también invalidez). <b>Seguro de cesantía</b>: cubre cuotas ante desempleo.",
    "<b>Gastos operacionales:</b> notaría, inscripción de prenda, impuesto de timbres y estampillas.",
    "<b>Preaprobación / evaluación crediticia:</b> la financiera revisa ingresos, deudas y comportamiento de pago del cliente."])
warn("Nunca prometas aprobación de crédito ni tasas antes de la evaluación. Informa siempre la CAE y el costo total: es una exigencia legal y "
     "protege la relación con el cliente.")
h2("Seguros")
table(["Seguro", "Qué cubre"], [
    ["SOAP (obligatorio)", "Lesiones y muerte de personas en accidentes. No cubre daños al auto ni a terceros en sus bienes."],
    ["Seguro automotriz “todo riesgo”", "Daños propios (choque, volcamiento), robo, daños a terceros (responsabilidad civil), y adicionales (asistencia en ruta, auto de reemplazo, cristales)."],
    ["Responsabilidad civil", "Daños materiales y personales que causes a otros."],
    ["Pérdida total", "Cuando la reparación supera un % del valor (frecuentemente 75%) o el auto es robado y no aparece."],
    ["Deducible", "Monto que paga el asegurado en cada siniestro (ej. 3, 5, 10 UF). <b>Deducible más alto = prima más baja.</b>"],
    ["Seguro para crédito", "Las financieras exigen seguro todo riesgo mientras el auto tenga prenda."],
], [1.5, 3.5])
p("La <b>prima</b> (lo que se paga al año o al mes) depende del modelo, año, valor, comuna, edad y antecedentes del conductor, uso y deducible. "
  "Los autos con más asistentes de seguridad y menor índice de robo suelen tener primas más bajas.")
