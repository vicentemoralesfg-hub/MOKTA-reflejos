# Análisis crítico de la v1 → cambios en la v2

## 1. Voz (el problema principal)
| Problema en v1 | Por qué importa | Cambio en v2 |
|---|---|---|
| Voz sintética genérica (Kokoro `em_alex`), sin acento chileno ni dirección actoral | En un reel la voz es la emoción: si suena a lector automático, el espectador lo nota en 1 s y se va | Qwen3-TTS VoiceDesign: timbre descrito (hombre chileno ~30 años, cálido, cercano, estilo creador de contenido de autos) + **una instrucción de emoción por frase** |
| Misma energía en el gancho, en "Para.", en el daño y en la solución | El guion tiene un arco (curiosidad → alarma → intriga → gravedad → incredulidad → alivio → cercanía) que la voz no seguía | Cada escena con su emoción: provocadora, orden seca, cómplice, narrativa, grave, incrédula, aliviada, amistosa |
| Pausas recortadas a 0,13 s y velocidad 1,28× para que cupiera | Ritmo mecánico, sin respiración ni énfasis antes de los datos clave | Pausas naturales (solo se acortan las > 0,22 s; 0,5 s tras "¡Para!") y ritmo de reel con Rubber Band (sin cambiar el tono) |
| "Para." sonaba como una palabra más | Es el golpe que corta el scroll | Instrucción explícita: orden seca + pausa |
| Elección sin criterio medible | No es posible escuchar en este entorno | 2 tomas por frase, elegidas por inteligibilidad (Whisper), mismo timbre (Resemblyzer) y variación de tono (Praat) |

Resultado sobre la locución completa: variación de tono 3,6 → **5,7 semitonos** (+58 %), rango 11,1 → **18,5 st**; transcripción del MP4 final sin errores.
Nota: la primera tanda de tomas habló demasiado lento (el video habría durado 67 s); se regeneró con dirección de ritmo de reel y se ajustó con Rubber Band hasta ~3,3 palabras/s → 50,8 s.

## 2. Guion
- Muletilla "Y…" al inicio de 4 frases → quitada donde no aporta.
- El dato más tangible ("casi un estanque de bencina") solo estaba escrito, no se decía → ahora lo dice la voz.
- El bucle abierto no pedía quedarse → "Quédate, porque te voy a decir cuánto hay que esperar de verdad".
- "Y como así se calienta…" era ambiguo → "Y como detenido se calienta lentísimo…" (coincide con el texto en pantalla).
- "Hoy, la inyección…" → "Pero hoy…": marca el contraste con el carburador.
- Frases acortadas para compensar el ritmo más natural: bucle abierto ("Quédate: te digo…"), carburador, "hasta que tome temperatura".

## 3. Imagen
- Escenas 5–7 (inyección, cilindro, gráfico) compartían el mismo fondo azul: monotonía justo en la mitad, donde más se abandona → el cilindro pasa a una paleta roja de peligro.
- El texto del bucle abierto se ajusta a la nueva frase ("Quédate").
- Las tarjetas de bencina aparecen cuando la voz dice "casi un estanque".

## 4. Música
- v1: pads de sierra y arpegios simples que cambiaban de estilo en cada sección → sonaba sintética y poco cohesiva.
- v2: un solo lecho cinematográfico coherente (pulso grave, reloj, drones con reverberación, golpes en los cambios de capítulo, subidas antes de "Para." y del anillo de 30 s, resolución cálida en "Lo correcto"), siempre por debajo de la voz.

## 5. Lo que se mantiene (funcionaba)
Primer fotograma con pregunta + cronómetro + auto con escarcha; corte "Para." en rojo; anillo de 30 s como pago del bucle; capítulos numerados; todo legible sin sonido; cierre que vuelve al plano inicial; datos con fuente en pantalla.
