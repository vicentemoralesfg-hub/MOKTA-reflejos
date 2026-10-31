# ¿Cuándo te midieron? v2 — Informe de control de calidad

Archivos: `entrega/CuandoTeMidieron_con_musica.mp4` y `entrega/CuandoTeMidieron_sin_musica.mp4`
(ambos con subtítulos; la versión sin música conserva voz, whooshes y golpes).
Medido sobre los MP4 finales con `scripts/qa.py` y `scripts/flicker.py`.

## Especificaciones (ambas versiones)
| Criterio | Resultado |
|---|---|
| Resolución / relación | 1080×1920, 9:16 ✔ |
| FPS / fotogramas | 30 fps, 1593 fotogramas ✔ |
| Duración | 53,10 s (máximo pedido: 55 s) ✔ |
| Video | H.264 High, yuv420p rango TV, BT.709, faststart ✔ |
| Audio | AAC-LC 48 kHz estéreo ~330 kbps ✔ |
| Sonoridad | −14,5 LUFS integrados, pico −1,3 dBFS ✔ |
| Fotogramas negros | 0 ✔ |

## Ritmo
- 31 planos; el más largo dura 2,47 s (límite 2,5 s); promedio 1,71 s ✔
- Corte nuevo en cada reveal: «Más», «Más», «tres kilómetros», «ya te midieron», «doscientos metros» ✔
- «Cuando la ves…» y «ya te midieron» en planos separados; el contador de tiempo va en su propio plano ✔
- Radar: cuatro planos cortos (1,4–2,1 s), cada uno con un encuadre distinto ✔
- Nunca se repite el mismo tipo de encuadre en dos planos seguidos ✔

## Sincronía
- Planos, subtítulos y golpes se anclan a los tiempos por palabra de la locución.
- Golpes: entre −6 y −8 ms respecto de la palabra (1 fotograma = 33 ms) ✔
- Whoosh en cada uno de los 30 cortes ✔
- Desfase del audio del MP4 vs. la mezcla: 0,0 ms ✔

## Revisión cuadro a cuadro en tamaño celular (270×480 por cuadro)
Primer y último fotograma, primer fotograma de los 31 planos y cada reveal (+6 fotogramas): gancho con
«¿LA VES?» y asfalto texturado sin luna en cuadro; letrero 120 y velocímetro que pasa a rojo; patrulla
grande con barra de luces y puertas blancas, iluminada por los focos; agente en silueta con la pistola;
onda azul más ancha que la carretera hasta los pinos; rayo de ≈1 m junto a la puerta; píldoras
«¿300 m?»/«¿1 km?» iguales a la voz; destello y tinte rojo en «tres kilómetros» y «ya te midieron»;
«AQUÍ» + «2,9 km» en el horizonte; tarjeta «MEDIDO · 140 km/h / hace 1 min» centrada; visor partido
pixelado (2,9 km) vs. nítido (200 m, patente legible); final con «MIDE: 2,9 km» y «FOTO: 200 m» y corte
directo al primer cuadro. Todas las píldoras de historia tienen el tamaño de los subtítulos o más.

## Problemas encontrados y corregidos en esta revisión
- Plano subjetivo del radar: el paso de cada onda generaba destellos cian cada ~7 fotogramas (parpadeo
  de ~4 por segundo). Se espaciaron las ondas, se suavizó el pulso y la onda se desvanece al cruzar la
  cámara; se volvió a renderizar ese plano. Detector de parpadeos: 1 salto leve, que es el disparo
  intencional de la primera onda.
- Locución: la frase «Y te puede medir hasta…» quedaba 7 dB sobre «desde una patrulla…»; se igualó el
  nivel por segmento (todos dentro de ±1 dB).

## Locución
Los créditos de ElevenLabs no alcanzaban para regenerar el guion completo (quedaban 135 de 790).
Las frases que no cambiaron vienen de la toma aprobada (eleven_v4). Las nuevas o modificadas
(«Y te puede medir hasta…», «Pero la pistola láser es otra cosa. Un rayo del ancho de una puerta.»,
«Te mide a tres kilómetros… doscientos metros.», «Entonces… ¿cuándo te pillaron de verdad?») se
generaron con la misma voz en eleven_flash_v2_5. El montaje, el tempo (×1,07) y las pausas están en
`src/data/cues.json` → `voice`. Con créditos se puede regenerar todo en una sola toma y volver a correr
`build_voice.py`.
