# Control de calidad técnico (medido sobre los archivos finales)

Generado por `estudio/scripts/qa_report.py` (ffprobe + ebur128 + blackdetect). Objetivo Reels: 1080×1920, 30 fps,
H.264 yuv420p, AAC 48 kHz, ≈ −14 LUFS integrados, pico real ≤ −1 dBFS.

## Videos
| Archivo | Resolución | fps | Duración | Video | Audio | Sonoridad | Pico real | Negros (≥0,1 s) | Peso |
|---|---|---|---|---|---|---|---|---|---|
| `reels/R01_el-chat/MOKTA_R01_ElChat.mp4` | 1080×1920 | 30 | 19.50 s | h264 High yuv420p | aac 48 kHz | -14.3 LUFS | -1.1 dBFS | 8.73–9.33 s | 6.6 MB |
| `reels/R02_mito-o-verdad/MOKTA_R02_MitoOVerdad.mp4` | 1080×1920 | 30 | 37.20 s | h264 High yuv420p | aac 48 kHz | -14.0 LUFS | -1.1 dBFS | ninguno | 8.9 MB |
| `reels/R03_motor-en-camara-lenta/MOKTA_R03_MotorEnCamaraLenta.mp4` | 1080×1920 | 30 | 23.50 s | h264 High yuv420p | aac 48 kHz | -13.7 LUFS | -3.7 dBFS | ninguno | 8.8 MB |
| `reels/R04_hasta-el-clic/MOKTA_R04_HastaElClic.mp4` | 1080×1920 | 30 | 19.50 s | h264 High yuv420p | aac 48 kHz | -14.0 LUFS | -1.7 dBFS | ninguno | 3.5 MB |

Los únicos negros detectados son intencionales (Reel 01: corte a negro tras la revelación, 0,6 s).

## Imágenes / láminas
| Archivo | Tamaño | Peso |
|---|---|---|
| `carruseles/C01_motores-en-el-asado/MOKTA_C01_01.jpg` | 1080×1350 sRGB | 275 KB |
| `carruseles/C01_motores-en-el-asado/MOKTA_C01_02.jpg` | 1080×1350 sRGB | 209 KB |
| `carruseles/C01_motores-en-el-asado/MOKTA_C01_03.jpg` | 1080×1350 sRGB | 196 KB |
| `carruseles/C01_motores-en-el-asado/MOKTA_C01_04.jpg` | 1080×1350 sRGB | 214 KB |
| `carruseles/C01_motores-en-el-asado/MOKTA_C01_05.jpg` | 1080×1350 sRGB | 219 KB |
| `carruseles/C01_motores-en-el-asado/MOKTA_C01_06.jpg` | 1080×1350 sRGB | 232 KB |
| `carruseles/C01_motores-en-el-asado/MOKTA_C01_07.jpg` | 1080×1350 sRGB | 216 KB |
| `carruseles/C01_motores-en-el-asado/MOKTA_C01_08.jpg` | 1080×1350 sRGB | 239 KB |
| `carruseles/C02_lo-que-nadie-te-explico/MOKTA_C02_01.jpg` | 1080×1350 sRGB | 164 KB |
| `carruseles/C02_lo-que-nadie-te-explico/MOKTA_C02_02.jpg` | 1080×1350 sRGB | 172 KB |
| `carruseles/C02_lo-que-nadie-te-explico/MOKTA_C02_03.jpg` | 1080×1350 sRGB | 210 KB |
| `carruseles/C02_lo-que-nadie-te-explico/MOKTA_C02_04.jpg` | 1080×1350 sRGB | 172 KB |
| `carruseles/C02_lo-que-nadie-te-explico/MOKTA_C02_05.jpg` | 1080×1350 sRGB | 169 KB |
| `carruseles/C02_lo-que-nadie-te-explico/MOKTA_C02_06.jpg` | 1080×1350 sRGB | 170 KB |
| `carruseles/C02_lo-que-nadie-te-explico/MOKTA_C02_07.jpg` | 1080×1350 sRGB | 189 KB |
| `carruseles/C02_lo-que-nadie-te-explico/MOKTA_C02_08.jpg` | 1080×1350 sRGB | 173 KB |
| `carruseles/C02_lo-que-nadie-te-explico/MOKTA_C02_09.jpg` | 1080×1350 sRGB | 154 KB |
| `imagenes/I01_que-conductor-eres/MOKTA_I01_QueConductorEres.jpg` | 1080×1350 sRGB | 223 KB |
| `imagenes/I02_100-explosiones/MOKTA_I02_100Explosiones.jpg` | 1080×1350 sRGB | 140 KB |
| `reels/R01_el-chat/MOKTA_R01_portada.jpg` | 1080×1920 sRGB | 152 KB |
| `reels/R02_mito-o-verdad/MOKTA_R02_portada.jpg` | 1080×1920 sRGB | 79 KB |
| `reels/R03_motor-en-camara-lenta/MOKTA_R03_portada.jpg` | 1080×1920 sRGB | 128 KB |
| `reels/R04_hasta-el-clic/MOKTA_R04_portada.jpg` | 1080×1920 sRGB | 142 KB |
