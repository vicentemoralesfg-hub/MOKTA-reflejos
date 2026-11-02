# MOKTA · Estudio de contenido (Remotion)

Proyecto fuente de todas las piezas de [`../contenido`](../contenido). Reels 1080×1920 a 30 fps y láminas 1080×1350.
Todo es código: escenas en React/SVG, audio sintetizado en Python (numpy/scipy), sin assets de terceros
salvo las fuentes Barlow Condensed e Inter (licencia OFL, incluidas en `public/fonts`).

## Preparar
```bash
npm install
pip install numpy scipy        # para los generadores de audio
npx remotion studio            # vista previa de todo
```
En un servidor sin Chrome propio: `export REMOTION_CHROME=/ruta/a/chrome-headless-shell`.

## Rehacer una pieza
| Pieza | Audio | Composición |
|---|---|---|
| R01 El chat | `python3 scripts/audio_chat.py` | `R01-ElChat` |
| R02 ¿Mito o verdad? | `python3 scripts/audio_quiz.py` | `R02-MitoOVerdad` |
| R03 Motor en cámara lenta | `python3 scripts/audio_motor.py` | `R03-MotorLento` |
| R04 ¿Hasta el clic? | `python3 scripts/audio_clic.py` | `R04-Clic` |

```bash
npx remotion render R03-MotorLento out/R03_raw.mp4 --codec=h264 --crf=14 --muted --props='{"withAudio":false}'
scripts/finalize.sh out/R03_raw.mp4 public/audio/motor-lento.wav ../contenido/reels/R03_motor-en-camara-lenta/MOKTA_R03_MotorEnCamaraLenta.mp4
```
`finalize.sh` une video y audio: H.264 High yuv420p BT.709, AAC 48 kHz, −14 LUFS (dos pasadas) con limitador, faststart.

Carruseles e imágenes (cada lámina es un `<Still>`):
```bash
node scripts/carousel.mjs C01 out/c01     # C01-Asado-01 … 08
node scripts/carousel.mjs C02 out/c02     # C02-Secretos-01 … 09
node scripts/carousel.mjs I0  out/img     # I01-Conductores, I02-Explosiones
```

## Control de calidad
- `node scripts/stills.mjs <Composición> <carpeta> 0,30,60-120:3` → fotogramas sueltos; `scripts/sheet.sh <carpeta> hoja.jpg` → hoja de contacto.
- `python3 scripts/qa_report.py` → mide todos los entregables y reescribe `../contenido/QA.md`.

## Dónde se cambia cada cosa
| Qué | Archivo |
|---|---|
| Colores, tipografías, zonas seguras | `src/brand.ts` |
| Mensajes y tiempos del chat | `src/reels/chat/timeline.json` (lo lee también el audio) |
| Preguntas del quiz | `src/reels/quiz/data.ts` (grilla a 100 BPM) |
| Rampa de cámara lenta del motor | `src/reels/motor/timeline.json` (video y audio integran el mismo ángulo) |
| Tiempos del reel del clic | `src/reels/clic/timeline.json` |
| Personajes "motorcitos" | `src/carruseles/asado/Buddy.tsx` |
| Textos de carruseles | `src/carruseles/*/` |
| Síntesis de sonidos (pops, golpes, sellos…) | `scripts/sfx.py` |

---

# Entrega 2 · videos con locución (`src/v2/`)

| Video | Composición | Guion de voz | Audio |
|---|---|---|---|
| A 3.000 rpm | `V2-Motor` | `vo/motor.json` | `python3 scripts/v2_motor_theta.py && python3 scripts/v2_audio.py motor` |
| ¿Lleno o hasta el clic? | `V2-Clic` | `vo/clic.json` | `python3 scripts/v2_audio.py clic` |
| 5 millones de km | `V2-Kilometros` | `vo/km.json` | `python3 scripts/v2_audio.py km` |
| Caballos de fuerza | `V2-Caballos` | `vo/caballos.json` | `python3 scripts/v2_audio.py caballos` |

## Voz (local, sin servicios pagados)
```bash
pip install torch --index-url https://download.pytorch.org/whl/cpu
pip install qwen-tts faster-whisper num2words librosa
python3 scripts/vo_generate.py km caballos motor clic     # clona la voz de vo/narrador_ref.wav frase por frase
python3 scripts/vo_speed.py km 1.08                        # +8 % de ritmo sin cambiar el tono (reescala los tiempos)
python3 scripts/vo_patch.py caballos bolt "texto A" "texto B"   # rehace una sola frase (nombres propios)
```
- `vo/narrador_ref.wav` se diseñó con **Qwen3-TTS-12Hz-1.7B-VoiceDesign** ("hombre chileno de 35 años, voz grave…")
  y se clona con **Qwen3-TTS-12Hz-1.7B-Base** (Apache-2.0). Cada frase se valida con faster-whisper; los tiempos de
  palabra resultantes (`src/vo/*.json`) mueven los cortes del video y los subtítulos.
- Para cambiar un texto: editar `vo/<pieza>.json`, regenerar esa pieza, aplicar `vo_speed.py` y volver a mezclar el audio.

## Render
```bash
npx remotion render V2-Kilometros out/V2_km_raw.mp4 --codec=h264 --crf=15 --muted --props='{"withAudio":false}'
scripts/finalize.sh out/V2_km_raw.mp4 public/audio/v2-km.wav ../contenido/videos/03_5-millones-de-km/MOKTA_5MillonesDeKm.mp4
```
Fotos: `public/fotos/` con sus licencias en `public/fotos/creditos.json`; registro en `src/v2/fotos.ts`.
