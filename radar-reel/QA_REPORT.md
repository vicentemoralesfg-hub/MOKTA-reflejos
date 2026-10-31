# ¿Cuándo te midieron? — Informe de control de calidad

Archivos: `entrega/CuandoTeMidieron_con_subtitulos.mp4` y `entrega/CuandoTeMidieron_sin_subtitulos.mp4`.
Todo medido sobre los MP4 finales con `scripts/qa.py` y `scripts/flicker.py`.

## Especificaciones (ambas versiones)
| Criterio | Resultado |
|---|---|
| Resolución / relación | 1080×1920, 9:16 ✔ |
| FPS / fotogramas | 30 fps, 1474 fotogramas ✔ |
| Duración | 49,13 s (video y audio idénticos; objetivo 45–50 s) ✔ |
| Video | H.264 High, yuv420p rango TV, BT.709, faststart ✔ |
| Audio | AAC-LC 48 kHz estéreo ~330 kbps ✔ |
| Sonoridad | −14,4 LUFS integrados, pico −1,3 dBFS ✔ |
| Fotogramas negros | 0 ✔ |
| Parpadeos (saltos fuera de cortes) | 0 en la base y en la versión sin subtítulos ✔ (los 4 de la versión con subtítulos son cambios de frase) |

## Sincronía
- Planos y subtítulos salen de los tiempos por palabra de la locución real (transcripción de ElevenLabs).
- Golpes de sonido: −6 a −7 ms respecto de la palabra («Más», «Más», «tres», «midieron», «doscientos»); 1 fotograma = 33 ms ✔
- Desfase audio del MP4 vs. mezcla: 0,0 ms ✔

## Revisión visual cuadro a cuadro (momentos clave)
Primer y último fotograma, primer fotograma de cada uno de los 21 planos y los reveals (+6 fotogramas):
gancho con «¿LA VES?» legible y cielo/carretera claros; patrulla en silueta sin balizas; radar más ancho que la
carretera (dos planos); láser de ≈1 m sobre el auto; cronómetro 0,40 s; píldoras «¿300 m?» y «¿1 km?»
iguales a la voz; tachado «MÁS» en cada «Más»; cámara lenta y «2,9 km» en el reveal; vuelta al primer cuadro
con «AQUÍ»; contador 1:15; «MEDIDO · 140 km/h · hace 1 min»; patente pixelada a 2,9 km vs. legible a ≈200 m;
cierre aéreo con las dos marcas y corte seco que enlaza con el primer fotograma.

## Problema encontrado y corregido
El primer render tenía 147 parpadeos: la carretera desaparecía en algunos fotogramas (conflicto de profundidad
entre la calzada y un plano de suelo de un solo triángulo gigante con búfer de profundidad logarítmico).
Se subdividió el suelo y se bajó 15 cm; se volvió a renderizar y la detección automática quedó en 0.

## Notas
- Locución: ElevenLabs, voz «Ezequiel» (latinoamericana neutra), tempo ×1,05 y dos pausas dramáticas añadidas.
- Música y efectos sintetizados por código (sin licencias de terceros).
- La onda del radar y el haz láser están estilizados (el láser real es infrarrojo e invisible); la letra chica va en `DESCRIPCION.md`.
