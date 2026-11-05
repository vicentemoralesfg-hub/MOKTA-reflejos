# MOKTA · El error de los espejos v2 — Control de calidad

Archivo: `entrega/MOKTA_Espejos_v2.mp4` · verificado sobre el MP4 final (`scripts/qa.sh`).

| Criterio | Resultado |
|---|---|
| Resolución / relación | 1080×1920, 9:16 ✔ |
| FPS / fotogramas | 30 fps, 1559 fotogramas ✔ |
| Duración | 51,97 s ✔ |
| Video | H.264 High, yuv420p rango TV, BT.709, GOP 1 s, faststart ✔ |
| Audio | AAC-LC 48 kHz estéreo 320 kbps ✔ |
| Sonoridad | −14,0 LUFS integrados, pico real −1,0 dBTP (objetivo Reels ≈ −14) ✔ |
| Voz sobre música | tramos con voz ≈ −13,7 LUFS; música sola ≈ −24 LUFS (voz ~10–12 dB por encima) ✔ |
| Fotogramas negros | 0 ✔ |
| Silencios > 0,6 s | ninguno ✔ |
| Portada (fotograma 0) | frase completa del gancho legible ("SI VES TU AUTO EN ESTE ESPEJO / ESTÁS COMETIENDO EL MISMO ERROR QUE EL 95% DE LAS PERSONAS") + espejo con tu auto marcado en rojo ✔ |
| Textos | dentro de la zona segura de Reels (subtítulos centrados en y ≈ 1420, márgenes ≥ 90 px) ✔ |

## Sincronía
Todas las escenas, etiquetas y efectos se anclan a palabras de la transcripción (`src/lib/timeline.ts`),
por lo que cada efecto cae sobre la palabra que lo motiva (p. ej. "95%", "espacio perdido", "puntos ciegos",
"chocas" (choque), "Cómo pasa" (rebobinado), "10 segundos", "retrovisor", "al espejo", "a tu vista").

## Notas
- La cifra "95 %" es la del gancho pedido; no hay un estudio público que la respalde con ese número exacto.
- La locución original (59,4 s) se aceleró ×1,10 y se acortaron pausas largas para ritmo de reel (50,7 s de voz).
