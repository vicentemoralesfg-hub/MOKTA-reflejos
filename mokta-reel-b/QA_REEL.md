# MOKTA · Test de reflejos (propuesta B) — control de calidad

Archivo: `out/MOKTA_TestDeReflejos_B.mp4` (copia en `entregables/`).

## Formato

| Criterio | Valor | Esperado |
|---|---|---|
| Resolución | 1080×1920 | 1080×1920 (9:16) ✔ |
| Fotogramas por segundo | 30/1 | 30/1 constante ✔ |
| Fotogramas | 1709 | 1709 ✔ |
| Duración video / audio | 56.967 / 56.966 s | 56.967 s ✔ |
| Video | h264 High yuv420p bt709 | h264 High yuv420p bt709 ✔ |
| Audio | aac 48000 Hz 2 canales | aac 48000 Hz estéreo ✔ |
| Tamaño | 23.0 MB | < 100 MB ✔ |
| Sonoridad integrada | -14.7 LUFS | ≈ −14 LUFS ✔ |
| Pico real | -1.6 dBFS | ≤ −1 dBFS ✔ |

## La barrera aparece por sorpresa y el panel no la anuncia

Barrera: píxeles de lámina roja en la franja del horizonte. Panel: píxeles del instrumental que cambian más de 40 niveles respecto del fotograma anterior, compensando el leve movimiento del tablero con la suspensión. Umbral ≤ 20 px (ruido de compresión); cuando el cronómetro arranca cambian más de 300.

| Ronda | Fotograma de aparición | Barrera 2 fot. antes / 1 antes / aparición | Panel en la aparición | Panel 1 fotograma después |
|---|---|---|---|---|
| RONDA 1 · 120 | 191 (6.37 s) | 0 / 0 / 54 px ✔ | 0 px ✔ | 325 px |
| RONDA 2 · 160 | 557 (18.57 s) | 0 / 0 / 31 px ✘ | 0 px ✔ | 321 px |
| RONDA FINAL · 210 | 916 (30.53 s) | 0 / 0 / 21 px ✘ | 2 px ✔ | 327 px |

## Impacto y lectura

| Ronda | Fotograma del impacto | Luma media en el negro |
|---|---|---|
| RONDA 1 | 304 (10.13 s) | 0.00 ✔ |
| RONDA 2 | 642 (21.40 s) | 0.00 ✔ |
| RONDA FINAL | 981 (32.70 s) | 0.00 ✔ |

## La voz no anuncia la barrera

Pico de la pista de voz desde 1,2 s antes de la aparición hasta el impacto (debe ser silencio).

| Ronda | Ventana | Pico de voz |
|---|---|---|
| RONDA 1 | 5.17–10.13 s | 0.0000 ✔ |
| RONDA 2 | 17.37–21.40 s | 0.0000 ✔ |
| RONDA FINAL | 29.33–32.70 s | 0.0000 ✔ |

**Resultado: HAY CONTROLES QUE FALLAN.**
