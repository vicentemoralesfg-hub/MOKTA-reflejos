# MOKTA · Reventón v1 — Informe de control de calidad

Archivo: `MOKTA_Reventon_v1.mp4` · medido sobre el MP4 final.

## Especificaciones (ffprobe / ffmpeg)
| Criterio | Resultado |
|---|---|
| Resolución / relación | 1080×1920, 9:16 ✔ |
| FPS / fotogramas | 30 fps, 1800 fotogramas ✔ |
| Duración | 60,000 s (video y audio idénticos) ✔ |
| Video | H.264 High 4.2, yuv420p rango TV, BT.709, faststart ✔ |
| Audio | AAC-LC 48 kHz estéreo 320 kbps ✔ |
| Sonoridad | −13,9 LUFS integrados, pico −1,1 dBFS (objetivo Reels ≈ −14) ✔ |
| Fotogramas negros | 0 ✔ |

## Voz
- ElevenLabs `eleven_v4`, voz `Tm8bVnJtlhPQUOb8KzSd`, **1 toma = 957 créditos** (de 2.700; quedan ≈1.743).
- Qwen3-ASR sobre la locución limpia: coincide palabra por palabra con el guion (`voz/asr.txt`).
- Qwen3-ASR sobre la **mezcla final** (voz + efectos + música): 98,2 % de coincidencia con el guion (`voz/asr_mezcla_final.txt`).
  Diferencias: «rebobinemos»→«revolvemos» (ese tramo aislado sí se transcribe «Rebobinemos», tanto en la mezcla como en la voz sola: es un error de decodificación del ASR, no de enmascaramiento), «puede»→«puedes», tilde de «Guárdalo».
- Relación voz/fondo durante el habla: 8–16 dB en casi todo el video; 5–6 dB solo en los golpes dramáticos («frenar a fondo», «el volantazo»).

## Sincronía
- Reventón de la repetición: sonido a +2 ms del corte de imagen; pisotón al freno: +3 ms (1 fotograma = 33 ms) ✔
- Destello del reventón del gancho en el fotograma 14 (0,467 s) con el sonido a 0,45 s ✔
- Subtítulos palabra a palabra con los tiempos de Qwen3-ForcedAligner (resolución 80 ms).

## Revisado visualmente (hojas de contacto de todo el video)
Gancho, primer plano del reventón, «FRENAR», giro cenital y congelado «ERROR», rebobinado, «Vas a 100», inserto de pedales, telestración (rueda reventada, se arrastra, tira hacia ese lado, freno, peso, giro), volantazo, «¿QUÉ HACES?», pasos 1–3 con velocímetro, lista final con balizas, cierre y tarjeta «GUÁRDALO». Textos dentro de márgenes seguros de Reels.

## Limitaciones conocidas
- Imagen 3D generada en tiempo real (three.js) con estética cinematográfica estilizada; no es metraje real.
- Qwen3 no tiene modelo de efectos de sonido: Qwen3 se usó para verificación (ASR), alineación de palabras (ForcedAligner) y la reacción «¡Chuta!» del conductor (TTS-VoiceDesign). El resto del sonido está sintetizado en `scripts/build_audio.py`.
- La exclamación «¡Chuta!» va mezclada bajo el golpeteo del neumático: se percibe como reacción, no necesariamente como palabra nítida.
- Las trayectorias del auto son coreografiadas (plausibles, no simulación física) y muestran lo que *puede* pasar, como dice la locución.
- Logo de MOKTA no proporcionado: el cierre usa el nombre en texto.
