# MOKTA · El botón que usas al revés v1 (voz Qwen3-TTS) — Informe de control de calidad

Archivo: `entrega/MOKTA_BotonRecirculacion_v1.mp4` · verificado sobre el MP4 final con `scripts/qa.py` y `scripts/qa_voice.py`.
La auditoría de la voz (ritmo, emoción, énfasis, decisiones y alternativas descartadas) está en [`AUDITORIA_VOZ.md`](AUDITORIA_VOZ.md).

## Especificaciones (medido con ffprobe/ffmpeg)
| Criterio | Resultado |
|---|---|
| Resolución / relación | 1080×1920, 9:16 ✔ |
| FPS / fotogramas | 30 fps, 1446 fotogramas (los esperados por la timeline) ✔ |
| Duración | 48,200 s (video y audio idénticos) ✔ |
| Video | H.264 High, yuv420p rango TV, BT.709, faststart ✔ |
| Audio | AAC-LC 48 kHz estéreo ≈343 kbps ✔ |
| Sonoridad | −14,0 LUFS integrados, pico −1,2 dBFS (objetivo Instagram/TikTok ≈ −14) ✔ |
| Voz sobre el fondo mientras habla | ≈ +11 dB ✔ |
| Fotogramas negros | 0 ✔ |
| Tamaño | 32,3 MB ✔ |

## Voz en el MP4 final (Whisper, con música y efectos)
> El 90 % usa este botón. Al revés. Un hábito de dos segundos que te empaña los vidrios y te quema vencina. Se llama recirculación. Cierra el aire de afuera y el auto respira su propio aire. Error 1. En invierno lo aprendes por el frío, pero tu respiración suelta vapor, queda atrapado, toca el vidrio frío y se empaña. Error 2. En verano, con aire acondicionado, la dejas apagada y el compresor en fría aire caliente sin parar. Más esfuerzo, más vencina. O sea, lo estás usando al revés, frío o lluvia, aire de afuera, calor, recirculación, y para desempañar al tiro. Uno, modo para brisas. Dos, aire acondicionado, aunque sea invierno. Tres, recirculación apagada. Cuatro, ventilador al máximo. Listo. Tú lo usabas al revés, comenta sí o no y guárdalo.

Todo el guion se reconoce. "vencina", "en fría" y "para brisas" son solo cómo escribe Whisper "bencina", "enfría" y "parabrisas".
"lo aprendes" en vez de "la prendes" es una ambigüedad de transcripción en el habla rápida: en la toma aislada se oye "la prendes".

## Sincronía golpe visual ↔ palabra
Error medio respecto de lo previsto: **69 ms** (1 fotograma = 33 ms). Ejemplos (voz → golpe):
- "al revés" 2,44 → 2,50 s
- "prendes" (clic) → +127 ms
- "uno/dos/tres/cuatro" 35,20 / 36,78 / 39,72 / 41,56 → 35,13 / 36,77 / 39,67 / 41,53 s
- "listo" 43,52 → 43,37 s
- "comenta" 46,12 → 46,07 s

## Cortes
Salto de imagen máximo exactamente en el fotograma del corte. Cada corte cae en la pausa entre frases (0,27–0,30 s) con su golpe sonoro: +4,1 a +10,0 dB en los primeros 80 ms respecto de los 100 ms previos ✔

| Corte | Fotograma | Golpe |
|---|---|---|
| Qué es | 201 | +5,9 dB |
| Error #1 · Invierno | 348 | +6,0 dB |
| Error #2 · Verano | 574 | +4,5 dB |
| La regla | 833 | +10,0 dB |
| Desempañar al tiro | 1014 | +8,4 dB |
| Cierre | 1343 | +4,1 dB |

## Revisado visualmente
- Un fotograma por segundo de los 48 s. Textos dentro de la zona segura de Reels, sin superposiciones.
- Corregido en esta versión:
  - el botón del gancho tapaba "Un hábito de 2 segundos…" al subir
  - "Error #2 · Verano" mostraba la pantalla casi vacía 1,4 s
  - Se re-renderizaron solo esas escenas y se empalmaron; los puntos de unión se verificaron fotograma a fotograma.
- Golpe visual nuevo cuando la voz dice "¡al revés!" (el texto late con destello rojo).

## Limitaciones
- Voz sintética (Qwen3-TTS, Apache-2.0) con acento latinoamericano; no se puede garantizar un acento chileno marcado.
- "90%" es la cifra editorial del gancho (pedida para el reel), no un dato de estudio. "33°" es un ejemplo ilustrativo.
- Escenas 100 % generadas por código (sin grabaciones reales del tablero); marca MOKTA en texto (no se proporcionó logo).
