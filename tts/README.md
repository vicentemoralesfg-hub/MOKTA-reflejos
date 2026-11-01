# MOKTA TTS — voces locales con Qwen3-TTS

Locuciones en español latino, 100 % locales y gratis (Qwen3-TTS, Apache-2.0). Sin APIs ni créditos.
La voz oficial `mokta_narrador` ya viene incluida en `voices/`. Guía completa: [GUIA.md](GUIA.md).

## Instalar (una vez)

```bash
cd tts && bash instalar.sh            # Windows: powershell -ExecutionPolicy Bypass -File instalar.ps1
source .venv/bin/activate             # Windows: .\.venv\Scripts\Activate.ps1
```
Detecta GPU NVIDIA / Apple Silicon / CPU y descarga los modelos (~9 GB).

## Generar locuciones

```bash
python -m mokta_tts.generate guiones/ejemplo.md
```
Crea `salida/ejemplo/` con un WAV por escena, `voiceover.ts` (frames + subtítulos) para Remotion y un informe de calidad.

## Crear una voz nueva

1. **Casting**: describe la voz y genera varias candidatas con el mismo guion de prueba.
   ```bash
   python -m mokta_tts.casting --out casting/locutora --seeds 4 --nombre locutora \
     --describir "Female narrator, around 35, neutral Latin American Spanish, warm mid-low voice, calm and analytical documentary tone."
   ```
   Las descripciones en inglés suelen funcionar mejor. Cada candidata se puntúa
   (inteligibilidad, limpieza, tono, acento latino) y el ranking queda en `casting/locutora/reporte.json`.

2. **Escucha** las 2 o 3 mejores (`casting/locutora/*.wav`) y elige una.
   Descarta las que tengan `seseo_delta` bajo −4: tienen acento de España.

3. **Congela la voz**: crea el paquete con su banco de emociones (neutral, tensión, sorpresa, énfasis).
   Usa la misma descripción del paso 1.
   ```bash
   python -m mokta_tts.voice --master casting/locutora/locutora_s2.wav --name locutora \
     --persona "Female narrator, around 35, neutral Latin American Spanish, warm mid-low voice, calm and analytical documentary tone."
   ```
   Queda en `voices/locutora/`.

4. **Úsala**:
   ```bash
   python -m mokta_tts.generate guiones/mi_video.md --voice locutora
   ```
