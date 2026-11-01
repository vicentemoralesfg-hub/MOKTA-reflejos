# MOKTA · El botón que usas al revés v1 — Informe de control de calidad

Archivo: `entrega/MOKTA_BotonRecirculacion_v1.mp4` · verificado sobre el MP4 final con `scripts/qa.py`.

## Especificaciones (medido con ffprobe/ffmpeg)
| Criterio | Resultado |
|---|---|
| Resolución / relación | 1080×1920, 9:16 ✔ |
| FPS / fotogramas | 30 fps, 1290 fotogramas (los esperados por la timeline) ✔ |
| Duración | 43,000 s (video y audio idénticos) ✔ |
| Video | H.264 High, yuv420p rango TV, BT.709, faststart ✔ |
| Audio | AAC-LC 48 kHz estéreo ≈340 kbps ✔ |
| Sonoridad | −13,9 LUFS integrados, pico −0,9 dBFS (objetivo Instagram/TikTok ≈ −14) ✔ |
| Fotogramas negros | 0 detectados ✔ |
| Tamaño | 30,2 MB (bajo el límite de Reels/TikTok/Shorts) ✔ |

## Sincronía audio-imagen en los cortes
Salto de imagen máximo exactamente en el fotograma del corte; ataque del golpe/whoosh a −2 ms (1 fotograma = 33 ms) ✔

| Corte | Fotograma | Ataque de audio |
|---|---|---|
| Qué es | 135 | −2 ms |
| Error #1 · Invierno | 255 | −2 ms |
| Error #2 · Verano | 465 | −2 ms |
| La regla | 675 | −2 ms |
| Desempañar al tiro | 885 | −2 ms |
| Cierre | 1185 | −2 ms |

## Revisado visualmente
- Fotograma 0 = portada legible: "EL 90% USA ESTE BOTÓN" + botón + "AL REVÉS" de cabeza (gira y queda derecho a los 0,3–0,5 s).
- Ningún tramo sin movimiento > 1,5 s (en "La regla" se agregaron sellos ✓, acercamiento lento, LED que pulsa y el aviso "Guárdalo").
- Textos dentro de la zona segura de Reels (entre y ≈ 210 y 1490 px; nada importante en la franja inferior de la interfaz).
- Empañado progresivo (bordes → centro) y desempañado de abajo hacia arriba visible entre los pasos 2 y 4.
- Íconos según los símbolos estándar de climatización (recirculación, aire exterior, parabrisas, luneta trasera, A/C, modo, ventilador).

## Limitaciones
- Sin locución: la cuenta de ElevenLabs no tenía créditos (10 disponibles, 834 necesarios). El reel está diseñado para verse sin sonido; el guion de locución está en el README por si se agrega después.
- "90%" es la cifra editorial del gancho (pedida para el reel), no un dato de estudio. "33°" es un ejemplo ilustrativo.
- Escenas 100 % generadas por código (sin grabaciones reales del tablero); marca MOKTA en texto (no se proporcionó logo).
