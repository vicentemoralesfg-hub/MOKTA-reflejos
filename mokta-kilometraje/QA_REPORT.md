# MOKTA · El kilometraje engaña v1 — Informe de control de calidad

Archivo: `entrega/MOKTA_KilometrajeEngana_v1.mp4` · verificado sobre el MP4 final (`scripts/qa_final.sh`).

## Especificaciones (ffprobe / ffmpeg)
| Criterio | Resultado |
|---|---|
| Resolución / relación | 1080×1920, 9:16 ✔ |
| FPS / fotogramas | 30 fps, 1746 fotogramas ✔ |
| Duración | 58,2 s (video y audio) ✔ |
| Video | H.264 High, yuv420p rango TV, BT.709, faststart ✔ |
| Audio | AAC-LC 48 kHz estéreo |
| Sonoridad | −14,0 LUFS integrados, pico −1,4 dBFS (objetivo Reels ≈ −14) ✔ |
| Fotogramas negros | 0 ✔ |

## Locución
- ElevenLabs, voz `tomkxGQGz4b1kE0EM722` («Mario»), modelo `eleven_v4`. Se generaron 2 tomas; se eligió la A.
- Verificación independiente con Whisper (local): la toma A se transcribe palabra por palabra igual al guion
  (la B confundía «kilometraje» con «kilómetro»).
- Acelerada 8 % sin cambio de tono (rubberband) para ritmo de reel: 61,3 s → 56,7 s.

## Sincronía
- Subtítulos y animaciones salen de las marcas por palabra de ElevenLabs escaladas a la velocidad final.
  Contrastadas con Whisper sobre la voz procesada: mediana −78 ms (los subtítulos aparecen apenas antes de la palabra, como se busca).
- Impactos sonoros vs. fotograma visual: «error» −7 ms · «MUCHO» 0 ms · «NO cómo» −11 ms (1 fotograma = 33 ms) ✔
- Voz sobre música: ≈15 dB de diferencia mientras se habla (la música baja automáticamente con la voz).

## Revisado visualmente
Hoja de contactos cada 2 s + fotogramas a resolución completa de cada escena: textos dentro de márgenes
(80 px laterales, sin texto clave en los 220 px superiores), subtítulos legibles sobre cualquier fondo, sin superposiciones
entre subtítulos y gráficos, tarjetas del checklist alejadas de los íconos laterales de Reels.

## Limitaciones conocidas
- La música y los efectos son sintetizados (sin licencias de terceros); si prefieres una canción en tendencia, súbela
  desde la app de Instagram/TikTok con volumen bajo: la voz ya está masterizada.
- El dato de Ford es una regla de mantención (≈33 millas por hora de ralentí), no una medición universal de desgaste;
  así se cita en pantalla.
- Medidores de desgaste: escala cualitativa e ilustrativa (indicado en pantalla en el veredicto).
