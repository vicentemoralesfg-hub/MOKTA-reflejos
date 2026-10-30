# MOKTA · Test de reflejos (propuesta B) — control de calidad

Archivo: `out/MOKTA_TestDeReflejos_B.mp4` (copia en `entregables/`).

## Formato

| Criterio | Valor | Esperado |
|---|---|---|
| Resolución | 1080×1920 | 1080×1920 (9:16) ✔ |
| Fotogramas por segundo | 30/1 | 30/1 constante ✔ |
| Fotogramas | 1002 | 1002 ✔ |
| Duración video / audio | 33.400 / 33.400 s | 33.400 s ✔ |
| Video | h264 High yuv420p bt709 | h264 High yuv420p bt709 ✔ |
| Audio | aac 48000 Hz 2 canales | aac 48000 Hz estéreo ✔ |
| Tamaño | 14.6 MB | < 100 MB ✔ |
| Sonoridad integrada | -13.4 LUFS | ≈ −14 LUFS ✔ |
| Pico real | -1.4 dBFS | ≤ −1 dBFS ✔ |

## La barrera aparece por sorpresa y el panel no la anuncia

Barrera: píxeles de lámina roja en la franja del horizonte. Panel: píxeles de la pantalla del instrumental que cambian más de 40 niveles respecto del fotograma anterior.

| Ronda | Fotograma de aparición | Barrera 2 fot. antes / 1 antes / aparición | Panel en la aparición | Panel 1 fotograma después |
|---|---|---|---|---|
| RONDA 1 · 120 | 162 (5.40 s) | 0 / 0 / 529 px ✔ | 0 px ✔ | 2861 px |
| RONDA 2 · 160 | 435 (14.50 s) | 0 / 0 / 477 px ✔ | 0 px ✔ | 2889 px |
| RONDA FINAL · 210 | 637 (21.23 s) | 0 / 0 / 425 px ✔ | 0 px ✔ | 324 px |

## Impacto y lectura

| Ronda | Fotograma del impacto | Luma media en el negro |
|---|---|---|
| RONDA 1 | 243 (8.10 s) | 0.00 ✔ |
| RONDA 2 | 496 (16.53 s) | 0.00 ✔ |
| RONDA FINAL | 684 (22.80 s) | 0.00 ✔ |

**Resultado: todos los controles pasan.**
