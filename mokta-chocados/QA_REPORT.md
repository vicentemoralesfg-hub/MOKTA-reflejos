# MOKTA · Autos chocados v1 — control de calidad

Archivo: `MOKTA_AutosChocados_v1.mp4` (verificado sobre el MP4 final).

| Criterio | Resultado |
|---|---|
| Resolución / relación | 1080×1920, 9:16 ✔ |
| FPS / fotogramas | 30 fps, 3.524 fotogramas ✔ |
| Duración | 117,5 s (video y audio iguales) ✔ |
| Video | H.264 High, yuv420p rango TV, BT.709, faststart ✔ |
| Audio | AAC 48 kHz estéreo 256 kbps ✔ |
| Sonoridad | -14.3 LUFS integrados, pico real -0.9 dBTP (objetivo Reels/TikTok ≈ −14) ✔ |
| Fotogramas negros | 0 ✔ |
| Primer fotograma | portada completa: dos autos, «PARECE BASURA» vs «IMPECABLE», mismo precio ✔ |

## Sincronía
Video, subtítulos, efectos y mezcla leen las mismas fuentes (`timeline.json` + `vo.json` + `sfx.json`):
cada animación y cada efecto se ancla a la palabra exacta de la locución.

## Revisado visualmente
40 fotogramas de control (4 por escena) + muestras del MP4 final a resolución completa. Corregido durante la revisión:
destellos que quedaban encendidos antes de su evento, textos de fichas que se partían, contadores con cifras intermedias
irregulares, alfombra del maletero girando al revés y una línea de desglose demasiado larga.

## Límites conocidos
- Cifras económicas ilustrativas (CLP), indicadas en pantalla; varían según modelo, año, repuestos y taller.
- Autos ilustrados (vector), no fotografías reales: sin derechos de imagen de terceros.
- Qwen3 no genera audio directamente: diseña recetas de síntesis (JSON) que se convierten en sonido con
  `scripts/render_sfx.py`. Las primeras recetas de Qwen3‑1.7B fueron demasiado simples; se mejoró el prompt
  (pautas por efecto y ejemplos) y se regeneraron. Para la música se usó Qwen3‑4B (mejor de 3 candidatas).
