# MOKTA · Últimos km de bencina v1 — Informe de control de calidad

Archivo: `entregables/MOKTA_Bencina_UltimosKm_v1.mp4` · medido sobre el MP4 final.

## Especificaciones (ffprobe / ffmpeg)
| Criterio | Resultado |
|---|---|
| Resolución / relación | 1080×1920, 9:16 ✔ |
| FPS / fotogramas | 30 fps, 1811 fotogramas ✔ |
| Duración | 60,37 s (video y audio iguales) ✔ |
| Video | H.264 High, yuv420p rango TV, BT.709, faststart ✔ |
| Audio | AAC-LC 48 kHz estéreo 320 kbps ✔ |
| Sonoridad | −13,9 LUFS integrados, pico −1,8 dBFS (objetivo Reels ≈ −14) ✔ |
| Fotogramas negros | 0 ✔ |
| Congelamientos ≥ 1,5 s | 0 ✔ |

## Sincronía
- Subtítulos y animaciones anclados a la alineación por palabra de ElevenLabs, re-escalada al tempo final (×1,15).
  Verificado: las pausas medidas en `voz.wav` coinciden con las predichas (±15 ms).
- Golpes sonoros vs. destellos/temblor de cámara (sello, desplome, ALTURA, razones 1-2-3, advertencia): +2 ms en los 7 casos (1 fotograma = 33 ms) ✔

## Revisado visualmente
Primer fotograma = portada (pregunta completa + marcador con aguja en movimiento), sello "NO ES TU IMAGINACIÓN",
km 1ª/2ª mitad (376 / 164 km), LITROS tachado → ALTURA, flotador/brazo/resistencia con señal, zona ciega,
transformación caja → estanque real (piso, eje, escape), rebanadas de 5 L y mini-marcadores, calibración y reserva,
gráfico bencina vs. aguja, bomba que se calienta, CTA con opciones y botón de comentarios.
Texto dentro de márgenes seguros de Reels (subtítulos en y≈1390–1500, nada clave bajo y=1520).

## Notas
- Voz: ElevenLabs `eleven_v4`, voz "David C – Viral Storytelling" (qRUgOhnxGASxirG4fKjv), toma B de 2; acelerada ×1,15 con rubberband (sin cambio de tono).
- Cifras (50 L, 600 km, reserva 10 %) = modelo ilustrativo; la forma del estanque está exagerada a propósito para que se lea en pantalla.
- Música y efectos sintetizados (sin licencias de terceros).
- Fotogramas 790–839 re-renderizados tras ocultar un "−0 L" transitorio y empalmados (PSNR 57 dB fuera del tramo, sin salto).

---

# v2 — Hibridación real (`entregables/MOKTA_Bencina_UltimosKm_v2.mp4`)

| Criterio | Resultado |
|---|---|
| Resolución / FPS / fotogramas | 1080×1920 · 30 fps · 1859 ✔ |
| Duración | 61,97 s ✔ |
| Sonoridad | −14,0 LUFS, pico −1,1 dBFS (limitador añadido en `assemble.sh`) ✔ |
| Fotogramas negros | 0 ✔ |

- Voz: ElevenLabs `eleven_v4`, "Fer – Chileno, relajado y natural" (Tm8bVnJtlhPQUOb8KzSd), **1 toma** (1.076 créditos); alineación por palabra con Scribe (0 créditos); ×1,10 sin cambio de tono.
- Toma real: conducción nocturna CC0 (Wikimedia Commons) en el parabrisas; cabina, autotest de agujas, zoom al marcador. Gráficos animados desde "El secreto"; el cierre vuelve a la cabina y empalma en bucle.
- Efectos: modelado físico local con espacialización binaural (llave, relé, motores paso a paso, bomba de bencina, swoosh metálico en cada transición, rodado, autos que pasan). No se usó ElevenLabs para efectos.
- No disponible en este entorno: Qwen (sin API key; los espacios públicos de Hugging Face rechazan uso anónimo por cuota) ni Wan (no alcanzaban los créditos de ElevenLabs: 4.545 requeridos, 2.840 disponibles).
