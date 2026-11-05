# Control de calidad técnico (medido sobre los archivos finales)

Generado por `estudio/scripts/qa_report.py` (ffprobe + ebur128 + blackdetect). Objetivo Reels: 1080×1920, 30 fps,
H.264 yuv420p, AAC 48 kHz, ≈ −14 LUFS integrados, pico real ≤ −1 dBFS.

## Videos
| Archivo | Resolución | fps | Duración | Video | Audio | Sonoridad | Pico real | Negros (≥0,1 s) | Peso |
|---|---|---|---|---|---|---|---|---|---|
| `videos/00_pistola-140-kmh/MOKTA_PistolaLaser.mp4` | 1080×1920 | 30 | 47.77 s | h264 High yuv420p | aac 48 kHz | -14.1 LUFS | -1.9 dBFS | ninguno | 30.9 MB |
| `videos/01_motor-a-3000-rpm/MOKTA_Motor3000rpm.mp4` | 1080×1920 | 30 | 43.07 s | h264 High yuvj420p | aac 48 kHz | -14.1 LUFS | -1.8 dBFS | ninguno | 12.7 MB |
| `videos/02_lleno-o-hasta-el-clic/MOKTA_LlenoOHastaElClic.mp4` | 1080×1920 | 30 | 37.57 s | h264 High yuv420p | aac 48 kHz | -14.1 LUFS | -0.6 dBFS | ninguno | 23.6 MB |
| `videos/03_5-millones-de-km/MOKTA_5MillonesDeKm.mp4` | 1080×1920 | 30 | 45.67 s | h264 High yuv420p | aac 48 kHz | -14.2 LUFS | -1.8 dBFS | ninguno | 38.8 MB |
| `videos/04_caballos-de-fuerza/MOKTA_CaballosDeFuerza.mp4` | 1080×1920 | 30 | 43.93 s | h264 High yuv420p | aac 48 kHz | -14.1 LUFS | -1.8 dBFS | ninguno | 34.0 MB |
| `videos/05_el-motor-mas-potente/MOKTA_MotorMasPotente.mp4` | 1080×1920 | 30 | 43.73 s | h264 High yuv420p | aac 48 kHz | -14.1 LUFS | -1.8 dBFS | ninguno | 16.5 MB |
| `videos/06_0-a-100-quien-gana/MOKTA_Cero100.mp4` | 1080×1920 | 30 | 45.57 s | h264 High yuv420p | aac 48 kHz | -14.1 LUFS | -1.8 dBFS | ninguno | 28.1 MB |
| `videos/07_el-auto-mas-vendido/MOKTA_MasVendido.mp4` | 1080×1920 | 30 | 47.17 s | h264 High yuv420p | aac 48 kHz | -14.1 LUFS | -1.9 dBFS | ninguno | 32.3 MB |
| `videos/08_el-auto-mas-caro/MOKTA_AutoMasCaro.mp4` | 1080×1920 | 30 | 54.30 s | h264 High yuv420p | aac 48 kHz | -14.2 LUFS | -1.7 dBFS | ninguno | 26.1 MB |

Ningún video tiene fotogramas negros. Voz: Qwen3-TTS (local); cada frase verificada con Whisper.

## Portadas
| Archivo | Tamaño | Peso |
|---|---|---|
| `videos/01_motor-a-3000-rpm/MOKTA_Motor3000rpm_portada.jpg` | 1080×1920 sRGB | 113 KB |
| `videos/02_lleno-o-hasta-el-clic/MOKTA_LlenoOHastaElClic_portada.jpg` | 1080×1920 sRGB | 149 KB |
| `videos/03_5-millones-de-km/MOKTA_5MillonesDeKm_portada.jpg` | 1080×1920 sRGB | 178 KB |
| `videos/04_caballos-de-fuerza/MOKTA_CaballosDeFuerza_portada.jpg` | 1080×1920 sRGB | 120 KB |
| `videos/05_el-motor-mas-potente/MOKTA_MotorMasPotente_portada.jpg` | 1080×1920 sRGB | 136 KB |
| `videos/06_0-a-100-quien-gana/MOKTA_Cero100_portada.jpg` | 1080×1920 sRGB | 237 KB |
| `videos/07_el-auto-mas-vendido/MOKTA_MasVendido_portada.jpg` | 1080×1920 sRGB | 232 KB |
| `videos/08_el-auto-mas-caro/MOKTA_AutoMasCaro_portada.jpg` | 1080×1920 sRGB | 142 KB |
