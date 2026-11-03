# Control de calidad técnico (medido sobre los archivos finales)

Generado por `estudio/scripts/qa_report.py` (ffprobe + ebur128 + blackdetect). Objetivo Reels: 1080×1920, 30 fps,
H.264 yuv420p, AAC 48 kHz, ≈ −14 LUFS integrados, pico real ≤ −1 dBFS.

## Videos
| Archivo | Resolución | fps | Duración | Video | Audio | Sonoridad | Pico real | Negros (≥0,1 s) | Peso |
|---|---|---|---|---|---|---|---|---|---|
| `videos/00_pistola-140-kmh/MOKTA_PistolaLaser.mp4` | 1080×1920 | 30 | 50.63 s | h264 High yuvj420p | aac 48 kHz | -14.1 LUFS | -1.8 dBFS | ninguno | 17.8 MB |
| `videos/01_motor-a-3000-rpm/MOKTA_Motor3000rpm.mp4` | 1080×1920 | 30 | 43.07 s | h264 High yuv420p | aac 48 kHz | -14.1 LUFS | -1.9 dBFS | ninguno | 13.7 MB |
| `videos/02_lleno-o-hasta-el-clic/MOKTA_LlenoOHastaElClic.mp4` | 1080×1920 | 30 | 41.33 s | h264 High yuv420p | aac 48 kHz | -14.1 LUFS | -1.7 dBFS | ninguno | 6.5 MB |
| `videos/03_5-millones-de-km/MOKTA_5MillonesDeKm.mp4` | 1080×1920 | 30 | 50.27 s | h264 High yuv420p | aac 48 kHz | -14.2 LUFS | -1.8 dBFS | ninguno | 13.3 MB |
| `videos/04_caballos-de-fuerza/MOKTA_CaballosDeFuerza.mp4` | 1080×1920 | 30 | 43.93 s | h264 High yuv420p | aac 48 kHz | -14.1 LUFS | -1.8 dBFS | ninguno | 34.0 MB |
| `videos/05_el-motor-mas-potente/MOKTA_MotorMasPotente.mp4` | 1080×1920 | 30 | 43.73 s | h264 High yuv420p | aac 48 kHz | -14.1 LUFS | -1.8 dBFS | ninguno | 16.5 MB |
| `videos/06_0-a-100-quien-gana/MOKTA_Cero100.mp4` | 1080×1920 | 30 | 49.97 s | h264 High yuv420p | aac 48 kHz | -14.1 LUFS | -1.8 dBFS | ninguno | 10.7 MB |
| `videos/07_el-auto-mas-vendido/MOKTA_MasVendido.mp4` | 1080×1920 | 30 | 51.73 s | h264 High yuv420p | aac 48 kHz | -14.1 LUFS | -1.8 dBFS | ninguno | 18.3 MB |
| `videos/08_el-auto-mas-caro/MOKTA_AutoMasCaro.mp4` | 1080×1920 | 30 | 59.57 s | h264 High yuv420p | aac 48 kHz | -14.2 LUFS | -1.9 dBFS | ninguno | 13.0 MB |

Ningún video tiene fotogramas negros. Voz: Qwen3-TTS (local); cada frase verificada con Whisper.

## Portadas
| Archivo | Tamaño | Peso |
|---|---|---|
| `videos/01_motor-a-3000-rpm/MOKTA_Motor3000rpm_portada.jpg` | 1080×1920 sRGB | 113 KB |
| `videos/02_lleno-o-hasta-el-clic/MOKTA_LlenoOHastaElClic_portada.jpg` | 1080×1920 sRGB | 106 KB |
| `videos/03_5-millones-de-km/MOKTA_5MillonesDeKm_portada.jpg` | 1080×1920 sRGB | 82 KB |
| `videos/04_caballos-de-fuerza/MOKTA_CaballosDeFuerza_portada.jpg` | 1080×1920 sRGB | 120 KB |
| `videos/05_el-motor-mas-potente/MOKTA_MotorMasPotente_portada.jpg` | 1080×1920 sRGB | 136 KB |
| `videos/06_0-a-100-quien-gana/MOKTA_Cero100_portada.jpg` | 1080×1920 sRGB | 188 KB |
| `videos/07_el-auto-mas-vendido/MOKTA_MasVendido_portada.jpg` | 1080×1920 sRGB | 210 KB |
| `videos/08_el-auto-mas-caro/MOKTA_AutoMasCaro_portada.jpg` | 1080×1920 sRGB | 198 KB |
