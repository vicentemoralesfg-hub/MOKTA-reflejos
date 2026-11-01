# MOKTA · El mito de calentar el auto v2 — Informe de control de calidad

Verificado sobre los MP4 finales de `entrega/` (`bash scripts/qa.sh` + comprobaciones manuales).

## Especificaciones (ffprobe / ffmpeg)
| Criterio | Con voz | Sin voz |
|---|---|---|
| Resolución / relación | 1080×1920, 9:16 ✔ | ✔ |
| FPS / fotogramas | 30 fps, 1525 ✔ | ✔ |
| Duración | 50,833 s ✔ | ✔ |
| Video | H.264 High, yuv420p, BT.709, faststart ✔ | ✔ |
| Audio | AAC-LC 48 kHz estéreo ✔ | ✔ |
| Sonoridad integrada | −14,0 LUFS ✔ | −13,9 LUFS ✔ |
| Pico verdadero | −3,1 dBTP ✔ | ≤ −1 dBTP ✔ |
| Fotogramas negros | 0 ✔ | 0 ✔ |
| Tramos congelados > 1 s | 0 ✔ | 0 ✔ |

## Locución v2 (Qwen3-TTS VoiceDesign, dirigida por frase)
| Métrica | v1 (Kokoro) | v2 |
|---|---|---|
| Variación de tono (desv. estándar) | 3,6 semitonos | **5,7 semitonos** (+58 %) |
| Rango de tono (p5–p95) | 11,1 st | **18,5 st** |
| Ritmo | 3,4 palabras/s, pausas recortadas a 0,13 s | ≈ 3,3 palabras/s, pausas naturales (máx. 0,22 s; 0,5 s tras "¡Para!") |
| Transcripción automática del MP4 final | correcta | correcta palabra por palabra (solo b/v en "bencina") |

- 2–4 tomas por frase; elegida la de menor error de transcripción, timbre más consistente con el resto
  (similitud 0,80–0,92 con el centroide) y mayor variación de tono. Detalle: `public/audio/vo_takes/seleccion.txt` (local).
- Frases lentas aceleradas con Rubber Band R3 (sin cambio de tono), máx. ×1,3.

## Sincronía
- Corte de "¡Para!" en 2,333 s (fotograma 70); golpe sonoro +25 ms (< 1 fotograma) ✔
- Todas las animaciones ligadas a palabras (`cue()`) encuentran su palabra en la locución nueva (verificado por script).

## Revisado visualmente
Hoja de contactos cada 1,5 s del MP4 final (34 cuadros): gancho, "Para.", bucle abierto ("Quédate"), origen, inyección,
daño (paleta roja), gráfico, contador, 30 s, tablero, escarcha, cierre. Texto dentro de la zona segura de Reels.

## Limitaciones conocidas
- La voz es sintética (Qwen3-TTS, Apache 2.0): se pidió acento chileno en la descripción, pero el modelo no garantiza el acento.
  ElevenLabs (voces chilenas reales) no estuvo disponible: la capa gratuita respondió "ocupado" en dos intentos (sin cobro).
  Para acento 100 % chileno: grabar una voz humana con `scripts/vo_script.json` y correr `gen_vo.py build`.
- No es posible escuchar en este entorno: la elección de voz y tomas se hizo con métricas objetivas (arriba).
- Música y efectos sintetizados por código (sin licencias de terceros).
- Curvas de la escena 7 ilustrativas (indicado en pantalla); ≈ 37 L/año es estimación conservadora (sedán 2.0 L sin carga).
