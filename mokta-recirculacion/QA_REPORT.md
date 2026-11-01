# MOKTA · El botón que usas al revés v1 (con locución) — Informe de control de calidad

Archivo: `entrega/MOKTA_BotonRecirculacion_v1.mp4` · verificado sobre el MP4 final con `scripts/qa.py` y `scripts/qa_voice.py`.

## Especificaciones (medido con ffprobe/ffmpeg)
| Criterio | Resultado |
|---|---|
| Resolución / relación | 1080×1920, 9:16 ✔ |
| FPS / fotogramas | 30 fps, 1620 fotogramas (los esperados por la timeline) ✔ |
| Duración | 54,000 s (video y audio idénticos) ✔ |
| Video | H.264 High, yuv420p rango TV, BT.709, faststart ✔ |
| Audio | AAC-LC 48 kHz estéreo ≈336 kbps ✔ |
| Sonoridad | −14,6 LUFS integrados, pico −1,3 dBFS (objetivo Instagram/TikTok ≈ −14) ✔ |
| Voz sobre el fondo mientras habla | +10,4 dB (la música baja ~11 dB con la voz) ✔ |
| Fotogramas negros | 0 detectados ✔ |
| Tamaño | 35,7 MB (bajo el límite de Reels/TikTok/Shorts) ✔ |

## Locución: ¿se entiende? (Whisper sobre el MP4 final, con música y efectos)
> El 90 % usa este botón al revés un hábito de dos segundos que te empaña, los vidrios y te quema vencina. Es la recirculación sierra, el aire de afuera y tu auto respira su propio aire. En invierno, la prendes para no pasar frío pero tu respiración suelta vapor de agua que queda atrapado, toca el vidrio frío y se empaña. En verano, con el aire acondicionado prendido, la dejas apagada y el compresor en fría, aire caliente sin parar, más esfuerzo, más vencina. O sea, lo estás usando al revés con frío o lluvia, aire de afuera, con calor, recirculación. Y para desempañar al tiro, uno, modo para brisas, dos, aire acondicionado, aunque sea invierno, tres, la recirculación apagada, cuatro, ventilador al máximo, con calor. ¡Listo! ¿Lo usabas al revés, comenta, sí o no?

Todas las palabras clave se reconocen. Las diferencias son de ortografía, no de pronunciación: "vencina"/"bencina" y "sierra"/"cierra" suenan igual en el español de Chile, y "en fría", "para brisas" son solo cortes de palabra.
Antes de la corrección fonética la voz decía "reciclación" y "vidridos". Se arregló enviando esas palabras como fonemas IPA y eligiendo, de 6 tomas por escena, la que mejor se entiende.

## Sincronía golpe visual ↔ palabra (Whisper sobre el MP4 final)
Cada golpe se adelanta a propósito 2–4 fotogramas a su palabra (lo visual levemente antes del audio se percibe sincronizado).
Error medio respecto de lo previsto: **39 ms** (1 fotograma = 33 ms). Ejemplos:

| Golpe | Palabra | Voz | Golpe |
|---|---|---|---|
| Clic del botón (invierno) | "prendes" | 13,18 s | 13,17 s |
| "Y SE EMPAÑA" | "se empaña" | 19,04 s | 19,00 s |
| Recirculación APAGADA (verano) | "apagada" | 23,56 s | 23,57 s |
| Paso 1 · 2 · 3 · 4 | "uno" · "dos" · "tres" · "cuatro" | 38,62 · 40,14 · 43,12 · 45,10 s | 38,57 · 40,10 · 43,10 · 45,10 s |
| "LISTO" | "listo" | 48,02 s | 47,90 s |

La tarjeta "Frío o lluvia" entra 0,36 s después de "con frío" a propósito, para que se alcance a ver el giro de "AL REVÉS".

## Sincronía en los cortes
Salto de imagen máximo exactamente en el fotograma del corte; ataque del golpe/whoosh a −1/−2 ms ✔

| Corte | Fotograma | Ataque de audio |
|---|---|---|
| Qué es | 195 | −2 ms |
| Error #1 · Invierno | 360 | −2 ms |
| Error #2 · Verano | 615 | −2 ms |
| La regla | 885 | −1 ms |
| Desempañar al tiro | 1110 | −2 ms |
| Cierre | 1500 | −2 ms |

## Revisado visualmente
- Fotograma 0 = portada legible: "EL 90% USA ESTE BOTÓN" + botón + "AL REVÉS" de cabeza (gira y queda derecho en los primeros 0,5 s).
- Un fotograma por segundo de los 54 s: textos dentro de la zona segura de Reels (y ≈ 210–1490 px), sin superposiciones.
  Se corrigió el indicador de pasos 1·2·3·4, que por 8 fotogramas tapaba el título de la receta. La escena se volvió a renderizar y se empalmó, con los puntos de unión verificados fotograma a fotograma.
- Empañado progresivo (bordes → centro) y desempañado de abajo hacia arriba sincronizados con los pasos de la voz.

## Limitaciones
- Voz sintética (Piper, `es_MX-claude-high`, Apache-2.0): acento latinoamericano neutro/mexicano, no chileno.
  ElevenLabs (voz chilena) no estuvo disponible: la cuenta no tenía créditos ni generaciones gratis.
  Con otra voz basta reemplazar `public/audio/voice/*.wav` y ejecutar `gen_voice.py --keep-audio` + `gen_audio.py`.
- "90%" es la cifra editorial del gancho (pedida para el reel), no un dato de estudio. "33°" es un ejemplo ilustrativo.
- Escenas 100 % generadas por código (sin grabaciones reales del tablero); marca MOKTA en texto (no se proporcionó logo).
