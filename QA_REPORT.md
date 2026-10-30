# MOKTA · Test de reflejos v1 — Informe de control de calidad

Archivo: MOKTA_TestDeReflejos_v1.mp4 · verificado sobre el MP4 final renderizado.

## Especificaciones (medido con ffprobe/ffmpeg)
| Criterio | Resultado |
|---|---|
| Resolución / relación | 1080×1920, 9:16 ✔ |
| FPS / fotogramas | 30 fps, 1007 fotogramas ✔ |
| Duración | 33,567 s (video y audio idénticos) ✔ |
| Video | H.264 High, yuv420p rango TV, BT.709, faststart ✔ |
| Audio | AAC-LC 48 kHz estéreo 320 kbps ✔ |
| Sonoridad | −13,4 LUFS integrados, pico −1,2 dBFS (objetivo Instagram ≈ −14) ✔ |
| Fotogramas negros | 0 detectados ✔ |

## Sorpresa: prueba de anticipación (luminancia en la zona de la barrera, 8 fotogramas previos)
| Ronda | Fotograma barrera | Antes | En la barrera |
|---|---|---|---|
| 120 km/h | 216 | 21,2–21,9 (plano) | 26,3 |
| 160 km/h | 504 | 21,2–21,8 (plano) | 27,2 |
| 210 km/h | 657 | 21,3–21,9 (plano) | 26,7 |
Sin destellos, cambios de exposición ni siluetas previas. Revisado también visualmente fotograma a fotograma.
Audio: variación de nivel 1 s antes vs. después de cada aparición = 0,01 / 0,20 / 0,45 dB (inaudible). Ningún sonido marca la aparición.

## Sincronía
Impacto sonoro de cada congelación: +2 ms respecto al fotograma de congelación en las tres rondas (1 fotograma = 33 ms) ✔

## Revisado visualmente
Gancho (primer fotograma = portada con texto y barrera), indicadores de ronda, cronómetro y cambio de color, tablas de resultado, revelación de distancias, CTA. Textos dentro de márgenes seguros de Reels.

## Detalle menor conocido
- Ronda final: el cronómetro rojo se desvanece sobre la barrera durante ~5 fotogramas (0,17 s) mientras entra la tabla. No afecta la lectura.

## Limitaciones
- Sin locución (diseñado para funcionar sin sonido; texto en pantalla).
- Logo de MOKTA no proporcionado: se usa el nombre en texto en el cierre.
- Los videos originales de 120/160/210 km/h no estaban en el material recibido (solo una grabación de pantalla del intento anterior): la carretera es 3D generada.
- Umbrales verde/amarillo/rojo basados en Green (2000) para frenado de conductores; el gesto de pausar en un teléfono añade latencia de la app, así que el resultado es orientativo, no una medición clínica.
- La distancia de detención final depende del modelo (1 s de reacción, ≈0,7 g, asfalto seco), indicado en pantalla.
