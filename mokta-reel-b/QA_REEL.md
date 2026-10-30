# MOKTA · Test de reflejos (propuesta B) — control de calidad

Archivo: `out/MOKTA_TestDeReflejos_B.mp4` (copia en `entregables/`).

## Formato

| Criterio | Valor | Esperado |
|---|---|---|
| Resolución | 1080×1920 | 1080×1920 (9:16) ✔ |
| Fotogramas por segundo | 30/1 | 30/1 constante ✔ |
| Fotogramas | 2400 | 2400 ✔ |
| Duración video / audio | 80.000 / 80.000 s | 80.000 s ✔ |
| Video | h264 High yuv420p bt709 | h264 High yuv420p bt709 ✔ |
| Audio | aac 48000 Hz 2 canales | aac 48000 Hz estéreo ✔ |
| Tamaño | 27.6 MB | < 100 MB ✔ |
| Sonoridad integrada | -14.8 LUFS | ≈ −14 LUFS ✔ |
| Pico real | -1.1 dBFS | ≤ −1 dBFS ✔ |

## La barrera aparece por sorpresa y el panel no la anuncia

Barrera: píxeles de lámina roja en la franja del horizonte. Panel: píxeles del instrumental que cambian más de 40 niveles respecto del fotograma anterior, compensando el leve movimiento del tablero con la suspensión. Umbral ≤ 20 px (ruido de compresión); cuando el cronómetro arranca cambian más de 300.

| Ronda | Fotograma de aparición | Barrera 2 fot. antes / 1 antes / aparición | Panel en la aparición | Panel 1 fotograma después |
|---|---|---|---|---|
| RONDA 1 · 120 | 465 (15.50 s) | 0 / 0 / 506 px ✔ | 0 px ✔ | 322 px |
| RONDA 2 · 160 | 1013 (33.77 s) | 0 / 0 / 447 px ✔ | 1 px ✔ | 320 px |
| RONDA FINAL · 210 | 1482 (49.40 s) | 0 / 0 / 472 px ✔ | 0 px ✔ | 381 px |

## Impacto y lectura

| Ronda | Fotograma del impacto | Luma media en el negro |
|---|---|---|
| RONDA 1 | 546 (18.20 s) | 0.00 ✔ |
| RONDA 2 | 1074 (35.80 s) | 0.00 ✔ |
| RONDA FINAL | 1529 (50.97 s) | 0.00 ✔ |

## La voz no anuncia la barrera

Pico de la pista de voz desde 1,2 s antes de la aparición hasta el impacto (debe ser silencio).

| Ronda | Ventana | Pico de voz |
|---|---|---|
| RONDA 1 | 14.30–18.20 s | 0.0000 ✔ |
| RONDA 2 | 32.57–35.80 s | 0.0000 ✔ |
| RONDA FINAL | 48.20–50.97 s | 0.0000 ✔ |

**Resultado: todos los controles pasan.**
