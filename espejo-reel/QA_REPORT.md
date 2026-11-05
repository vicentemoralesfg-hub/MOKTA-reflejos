# MOKTA · La palanca del espejo retrovisor v1 — Informe de control de calidad

Archivo: `entrega/MOKTA_PalancaEspejo_v1.mp4`, revisado sobre el MP4 final renderizado (`scripts/qa.py`).

## Especificaciones (ffprobe / ffmpeg)
| Criterio | Resultado |
|---|---|
| Resolución / relación | 1080×1920, 9:16 ✔ |
| FPS / fotogramas | 30 fps, 1400 fotogramas ✔ |
| Duración | 46,667 s (video y audio iguales) ✔ |
| Video | H.264 High, yuv420p rango TV, BT.709, faststart ✔ |
| Audio | AAC-LC 48 kHz estéreo 320 kbps ✔ |
| Sonoridad | −14,3 LUFS integrados, pico −1,0 dBTP (objetivo Instagram/TikTok ≈ −14) ✔ |
| Fotogramas negros | 0 ✔ |

## Sincronía
- Todas las animaciones y efectos se anclan a los tiempos por palabra de la locución (`src/vo_words.json`).
- Clic de la palanca: transitorio de audio en 17,200 s y destello del espejo en el fotograma 516 (17,200 s): **0 ms** de diferencia.
- Clic de vuelta a DÍA, clic en el diagrama, impacto del «90%» y sello ✕: 0 ms respecto a su fotograma.

## Mezcla
- Voz −16,9 LUFS · música ~12,5 dB por debajo de la voz mientras habla (*ducking* automático) · efectos sintetizados.
- El final de la música cae en el cierre del CTA.

## Revisado visualmente
Primer fotograma (portada con encandilamiento y subtítulo), «90%», zoom a la palanca, macro DÍA/NOCHE,
espejo girado con ✕, clic → caída del encandilamiento, ANTES/DESPUÉS, diagrama de rayos (día → noche → 4 %),
electrocrómico, aviso de día, CTA. Textos dentro de los márgenes seguros de Reels (subtítulos en y ≈ 1365).

## Limitaciones
- Ilustración vectorial (no grabación real): el espejo, la palanca y la carretera están dibujados.
- El diagrama exagera el ángulo de la cuña (11°) para que la separación de los reflejos se vea (indicado en pantalla).
- El «90%» es la cifra del gancho entregado, no un dato medido.
- La dirección «hacia ti» es la que indican los manuales (p. ej. Kia); en algún modelo puede variar.
