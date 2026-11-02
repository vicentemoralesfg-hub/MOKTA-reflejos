# MOKTA · El mito de calentar el auto v3 — Informe de control de calidad

Verificado sobre los MP4 finales de `entrega/` (`bash scripts/qa.sh` + comprobaciones manuales).

## Especificaciones (ffprobe / ffmpeg)
| Criterio | Con voz | Sin voz |
|---|---|---|
| Resolución / relación | 1080×1920, 9:16 ✔ | ✔ |
| FPS / fotogramas | 30 fps, 1552 ✔ | ✔ |
| Duración | 51,733 s ✔ | ✔ |
| Video | H.264 High, yuv420p, BT.709, faststart ✔ | ✔ |
| Audio | AAC-LC 48 kHz estéreo ✔ | ✔ |
| Sonoridad integrada | −14,0 LUFS ✔ | −14,0 LUFS ✔ |
| Pico verdadero | −2,1 dBTP ✔ | ≤ −1 dBTP ✔ |
| Fotogramas negros | 0 ✔ | 0 ✔ |
| Tramos congelados > 1 s | 0 ✔ | 0 ✔ |

## Locución v3 (una sola voz: Qwen3-TTS VoiceDesign → clonada con Qwen3-TTS Base)
| Métrica | v2 | v3 |
|---|---|---|
| Tono medio por frase | 115–236 Hz (12,3 st: varias voces) | **127–151 Hz (3,0 st: una voz)** |
| Similitud de timbre con la referencia | — | 0,90–0,94 |
| Variación expresiva | 5,7 st | 4,6 st |
| Ritmo | distinto por frase | ×1,20 global (~3,1 palabras/s) |
| Transcripción del MP4 final | correcta | correcta palabra por palabra (solo b/v en "bencina") |

- Voz elegida entre 5 candidatas diseñadas con la misma descripción (98–191 Hz): narrador de registro medio (142 Hz), la más expresiva.
- 3 tomas clonadas por frase; elegida la de 0 errores de transcripción, tono a ±1,5 st de la referencia (una frase a 1,9 st:
  la más cercana de sus 3 tomas) y mayor similitud de timbre. Detalle: `public/audio/vo_takes/seleccion.txt` (local).

## Sincronía
- Corte de "¡Para!" en 2,433 s (fotograma 73); golpe sonoro +30 ms (< 1 fotograma) ✔
- Todas las animaciones ligadas a palabras (`cue()`) encuentran su palabra en la locución nueva (verificado por script).

## Revisado visualmente
Hoja de contactos cada 1,5 s del MP4 final (35 cuadros): gancho, "Para.", bucle abierto ("Quédate"), origen, inyección,
daño (paleta roja), gráfico, contador, 30 s, tablero, escarcha, cierre. Texto dentro de la zona segura de Reels.

## Limitaciones conocidas
- La voz es sintética (Qwen3-TTS, Apache 2.0): se pidió acento chileno suave en la descripción, pero el modelo no lo garantiza.
  Para acento 100 % chileno: grabar una voz humana con `scripts/vo_script.json` y correr `gen_vo.py build`.
- No es posible escuchar en este entorno: la elección de voz y tomas se hizo con métricas objetivas (arriba).
- Música y efectos sintetizados por código (sin licencias de terceros).
- Curvas de la escena 7 ilustrativas (indicado en pantalla); ≈ 37 L/año es estimación conservadora (sedán 2.0 L sin carga).
