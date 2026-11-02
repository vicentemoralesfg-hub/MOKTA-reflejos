# Control de calidad técnico (medido sobre los archivos finales)

Generado por `estudio/scripts/qa_report.py` (ffprobe + ebur128 + blackdetect). Objetivo Reels: 1080×1920, 30 fps,
H.264 yuv420p, AAC 48 kHz, ≈ −14 LUFS integrados, pico real ≤ −1 dBFS.

## Videos
| Archivo | Resolución | fps | Duración | Video | Audio | Sonoridad | Pico real | Negros (≥0,1 s) | Peso |
|---|---|---|---|---|---|---|---|---|---|
| `videos/01_motor-a-3000-rpm/MOKTA_Motor3000rpm.mp4` | 1080×1920 | 30 | 38.20 s | h264 High yuv420p | aac 48 kHz | -14.1 LUFS | -1.8 dBFS | ninguno | 12.9 MB |
| `videos/02_lleno-o-hasta-el-clic/MOKTA_LlenoOHastaElClic.mp4` | 1080×1920 | 30 | 38.23 s | h264 High yuv420p | aac 48 kHz | -14.2 LUFS | -1.8 dBFS | ninguno | 6.4 MB |
| `videos/03_5-millones-de-km/MOKTA_5MillonesDeKm.mp4` | 1080×1920 | 30 | 44.77 s | h264 High yuv420p | aac 48 kHz | -14.2 LUFS | -1.7 dBFS | ninguno | 12.8 MB |
| `videos/04_caballos-de-fuerza/MOKTA_CaballosDeFuerza.mp4` | 1080×1920 | 30 | 43.93 s | h264 High yuv420p | aac 48 kHz | -14.1 LUFS | -1.8 dBFS | ninguno | 34.0 MB |

Ningún video tiene fotogramas negros. Voz: Qwen3-TTS (local); cada frase verificada con Whisper.

## Portadas
| Archivo | Tamaño | Peso |
|---|---|---|
| `videos/01_motor-a-3000-rpm/MOKTA_Motor3000rpm_portada.jpg` | 1080×1920 sRGB | 113 KB |
| `videos/02_lleno-o-hasta-el-clic/MOKTA_LlenoOHastaElClic_portada.jpg` | 1080×1920 sRGB | 106 KB |
| `videos/03_5-millones-de-km/MOKTA_5MillonesDeKm_portada.jpg` | 1080×1920 sRGB | 82 KB |
| `videos/04_caballos-de-fuerza/MOKTA_CaballosDeFuerza_portada.jpg` | 1080×1920 sRGB | 120 KB |
