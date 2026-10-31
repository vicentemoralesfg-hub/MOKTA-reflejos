# MOKTA · El mito de calentar el auto v1 — Informe de control de calidad

Verificado sobre los MP4 finales de `entrega/` (`bash scripts/qa.sh` + comprobaciones manuales).

## Especificaciones (ffprobe / ffmpeg)
| Criterio | Con voz | Sin voz |
|---|---|---|
| Resolución / relación | 1080×1920, 9:16 ✔ | ✔ |
| FPS / fotogramas | 30 fps, 1455 ✔ | ✔ |
| Duración | 48,500 s ✔ | ✔ |
| Video | H.264 High, yuv420p, BT.709, faststart ✔ | ✔ |
| Audio | AAC-LC 48 kHz estéreo ✔ | ✔ |
| Sonoridad integrada | −14,0 LUFS ✔ | −14,0 LUFS ✔ |
| Pico verdadero | −1,0 dBTP ✔ | ≤ −1,0 dBTP ✔ |
| Fotogramas negros | 0 ✔ | 0 ✔ |
| Tramos congelados > 1 s | 0 ✔ (empuje de cámara continuo en todas las escenas) | 0 ✔ |

## Locución
- Transcripción automática (Whisper small) del audio final: coincide con el guion palabra por palabra
  (solo la ambigüedad b/v de "bencina", normal en español).
- Cada escena sincroniza sus textos con el instante real de la palabra en la voz (`cue()`).

## Sincronía
- Corte de "Para." en 2,500 s (fotograma 75); golpe sonoro en 2,53 s (+1 fotograma) ✔
- Revisión visual fotograma a fotograma de la transición del anillo "30 SEGUNDOS" a la lista de pasos (sin superposiciones).

## Revisado visualmente
Hoja de contactos cada 1,5 s del MP4 final: gancho (primer fotograma con pregunta, cronómetro y auto), sello "Para.",
bucle abierto, carburador, inyección, cilindro, gráfico, contador, 30 s, tablero, escarcha, cierre. Texto dentro de la
zona segura de Reels (y 230–1500 px, sin texto bajo los botones laterales).

## Limitaciones conocidas
- Voz sintética local (Kokoro-82M, voz `em_alex`, fonética latinoamericana; no es acento chileno). Generar la voz con
  ElevenLabs no fue posible: la cuenta conectada rechazó la generación ("Free Tier disabled"). Por eso se entrega también la
  versión sin voz, lista para grabar una locución propia encima (los tiempos del guion están en `src/timeline.json`).
- Música y efectos sintetizados por código (sin licencias de terceros).
- Las curvas de calentamiento (escena 7) son ilustrativas y así se indica en pantalla.
- Consumo en ralentí (0,6 L/h) corresponde a un sedán 2.0 L sin carga (Argonne/DOE); con motor frío o desempañador
  encendido el consumo real es mayor, así que ≈ 37 L/año es una estimación conservadora.
