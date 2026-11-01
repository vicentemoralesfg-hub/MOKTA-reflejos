# MOKTA TTS — Locuciones locales con Qwen3-TTS

100 % local y gratuito (Qwen3-TTS de Alibaba, licencia Apache-2.0). No usa APIs, cuentas ni créditos.

## Instalación (una sola vez)

macOS / Linux:
```bash
bash instalar.sh
```
Windows (PowerShell):
```powershell
powershell -ExecutionPolicy Bypass -File instalar.ps1
```
El instalador detecta tu hardware (GPU NVIDIA → CUDA + bf16, Apple Silicon → MPS, si no hay GPU → CPU), crea `.venv`, instala dependencias, descarga los modelos (~9 GB) y ejecuta `python -m mokta_tts.doctor`.

## Uso diario

```bash
source .venv/bin/activate          # Windows: .\.venv\Scripts\Activate.ps1
python -m mokta_tts.generate guiones/mi_video.md
```

Salida en `salida/mi_video/`:

| Archivo | Para qué |
|---|---|
| `escenas/01-gancho.wav` … | Un WAV por escena (48 kHz, 24 bit, −16 LUFS, pico −1 dBTP) |
| `narracion_completa.wav` | Todas las escenas unidas, alineadas a frames (sirve como pista guía) |
| `voiceover.ts` | Duraciones en frames + subtítulos por palabra (`Caption` de `@remotion/captions`), listo para importar |
| `voiceover.json` | Lo mismo en JSON, con detalle por fragmento |
| `captions/<escena>.json` | Subtítulos por palabra de cada escena |
| `calidad.tsv` | Puntaje de cada fragmento (CER, timbre, limpieza) |

Es incremental: si cambias una frase, sólo se regenera ese fragmento (caché en `.cache/`). `--force` regenera todo; `--only 03-giro` genera sólo esa escena.

## Formato del guion

```markdown
## gancho [tension]
En 2019, una empresa con más de 1.200 empleados desapareció en menos de seis meses.
Nadie vio las señales. O eso creíamos.

## giro [sorpresa]
¿Y saben qué mostraba? Que la empresa perdía dinero con cada venta.
[pausa 0.6]
{tension} Cuanto más crecía… más rápido se acercaba al abismo.
```

- `## id [emoción]`: una escena = un WAV. Emociones: `neutral` (analítico), `tension`, `sorpresa`, `enfasis`
  (alias: suspenso, misterio, asombro, contundente, firme, cierre…).
- `{emoción}`: cambia la emoción a mitad de escena.
- `[pausa 0.8]`: silencio exacto en segundos.
- Línea en blanco = nuevo párrafo (pausa más larga). `// texto` = comentario.
- Números, %, monedas, horas y abreviaturas se pasan a palabras automáticamente
  ("1.200 empleados" → "mil doscientos empleados", "18%" → "dieciocho por ciento").
- La puntuación dirige la entonación: `…` suspenso, `¿?` pregunta, `¡!` énfasis, frases cortas = golpes.

## Integración con Remotion

1. Copia `salida/mi_video/` a `public/voiceover/mi_video/` de tu proyecto Remotion.
2. Copia `salida/mi_video/voiceover.ts` a `src/voiceover/mi_video.ts`.
3. Usa `remotion/MoktaVoiceover.tsx` (una `<Series.Sequence>` por escena con su `<Audio>`) o lee
   `voiceover[i].durationInFrames` / `startFrame` para sincronizar tus visuales. Los subtítulos ya vienen en `captions`.

## Cómo garantiza la calidad

1. **Voz fija**: la voz se diseñó con VoiceDesign y se congeló en `voices/mokta_narrador/`. En producción, el modelo
   Base clona esa voz (VoiceDesign solo cambia ligeramente el timbre en cada frase, por eso no se usa directo para producir).
2. **Emociones con el mismo timbre**: cada emoción tiene su referencia (`refs/*.wav`) y el timbre queda anclado a la voz maestra.
3. **Mejor de N tomas**: cada fragmento se genera 3 veces y se elige la mejor según: Whisper (detecta palabras
   omitidas o cambiadas), similitud de timbre, limpieza del audio (SQUIM), ritmo, expresividad y **acento latino**
   (penaliza la "z" de España). Si ninguna toma se entiende bien, genera más (hasta 6).
4. **Mezcla**: recorte de silencios, pausas según la puntuación, una sola ganancia de volumen para todo el video
   (respeta que la tensión suene más contenida que el énfasis), limitador de picos.

## Opciones útiles

| Opción | Efecto |
|---|---|
| `--takes 5` | Más tomas por fragmento → mejor resultado, más lento |
| `--takes 1` | Borrador rápido |
| `--temperature 0.65` | Más estable / menos variación (por defecto 0.75) |
| `--max-chars 180` | Fragmentos más cortos (más control, algo menos de fluidez) |
| `--fps 60` | Frames del proyecto Remotion |
| `--lufs -14` | Volumen objetivo (−14 YouTube directo; −16 si después mezclas con música) |
| `--scene-gap 0.6` | Silencio entre escenas en la pista completa |

## Otras herramientas

- `python -m mokta_tts.doctor` — revisa hardware, modelos y voces.
- `python -m mokta_tts.casting --out casting/ronda2 --seeds 3` — nuevo casting (personas en `mokta_tts/casting.py`).
- `python -m mokta_tts.voice --master casting/ronda2/X.wav --persona X --name otra_voz` — crea otra voz; úsala con `--voice otra_voz`.

## Rendimiento orientativo (por segundo de audio final, 3 tomas + control de calidad)

GPU NVIDIA ≥ 8 GB: ~1–3 s · Apple Silicon: ~5–10 s · CPU de 4 núcleos: ~25–35 s.
