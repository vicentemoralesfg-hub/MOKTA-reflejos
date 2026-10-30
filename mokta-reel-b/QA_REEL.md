# MOKTA · Test de reflejos (propuesta B) — control de calidad

Archivo: `out/MOKTA_TestDeReflejos_B.mp4` (copia en `entregables/`).

## Formato

| Criterio | Valor | Esperado |
|---|---|---|
| Resolución | 1080×1920 | 1080×1920 (9:16) ✔ |
| Fotogramas por segundo | 30/1 | 30/1 constante ✔ |
| Fotogramas | 1773 | 1773 ✔ |
| Duración video / audio | 59.100 / 59.100 s | 59.100 s ✔ |
| Video | h264 High yuv420p bt709 | h264 High yuv420p bt709 ✔ |
| Audio | aac 48000 Hz 2 canales | aac 48000 Hz estéreo ✔ |
| Tamaño | 21.5 MB | < 100 MB ✔ |
| Sonoridad integrada | -14.7 LUFS | ≈ −14 LUFS ✔ |
| Pico real | -1.9 dBFS | ≤ −1 dBFS ✔ |

## La barrera aparece por sorpresa y el panel no la anuncia

Barrera: píxeles de lámina roja en la franja del horizonte. Panel: píxeles del instrumental que cambian más de 40 niveles respecto del fotograma anterior, compensando el leve movimiento del tablero con la suspensión. Umbral ≤ 20 px (ruido de compresión); cuando el cronómetro arranca cambian más de 300.

| Ronda | Fotograma de aparición | Barrera 2 fot. antes / 1 antes / aparición | Panel en la aparición | Panel 1 fotograma después |
|---|---|---|---|---|
| RONDA 1 · 120 | 171 (5.70 s) | 0 / 0 / 589 px ✔ | 0 px ✔ | 323 px |
| RONDA 2 · 160 | 673 (22.43 s) | 0 / 0 / 496 px ✔ | 0 px ✔ | 324 px |
| RONDA FINAL · 210 | 1122 (37.40 s) | 0 / 0 / 442 px ✔ | 0 px ✔ | 324 px |

## Impacto y lectura

| Ronda | Fotograma del impacto | Luma media en el negro |
|---|---|---|
| RONDA 1 | 252 (8.40 s) | 0.00 ✔ |
| RONDA 2 | 734 (24.47 s) | 0.00 ✔ |
| RONDA FINAL | 1169 (38.97 s) | 0.00 ✔ |

## La voz no anuncia la barrera

Pico de la pista de voz desde 1,2 s antes de la aparición hasta el impacto (debe ser silencio).

| Ronda | Ventana | Pico de voz |
|---|---|---|
| RONDA 1 | 4.50–8.40 s | 0.0000 ✔ |
| RONDA 2 | 21.23–24.47 s | 0.0000 ✔ |
| RONDA FINAL | 36.20–38.97 s | 0.0000 ✔ |

**Resultado: todos los controles pasan.**
