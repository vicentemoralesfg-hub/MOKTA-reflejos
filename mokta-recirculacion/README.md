# MOKTA · El botón que usas al revés (Remotion)

Reel vertical 1080×1920 · 30 fps · H.264 + AAC · 48,2 s · con locución en español (Qwen3-TTS).
Tema: el botón de recirculación de aire y cómo desempañar el auto al tiro.

**Video final:** `entrega/MOKTA_BotonRecirculacion_v1.mp4` · portada: `entrega/portada.jpg` · auditoría de la voz: [`AUDITORIA_VOZ.md`](AUDITORIA_VOZ.md)

## Guion (locución + texto en pantalla; también se entiende sin sonido)

| Tiempo | Escena | Qué pasa |
|---|---|---|
| 0,0–6,7 s | **Gancho** | Fotograma 0 = portada: "EL 90% USA ESTE BOTÓN" + botón de recirculación + "AL REVÉS" **de cabeza**, que gira y queda derecho. El vidrio se empaña detrás. Luego: "Un hábito de 2 segundos que… te empaña los vidrios / te quema bencina". |
| 6,7–11,6 s | **Qué es** | "Se llama RECIRCULACIÓN". Corte del auto: la toma de aire exterior se cierra (✕) y el aire empieza a dar vueltas dentro de la cabina. Aviso abajo: "Al final: cómo desempañar al tiro" (abre la curiosidad hasta el final). |
| 11,6–19,1 s | **Error #1 · Invierno** | "La prendes para no pasar frío" (clic, LED encendido) → la respiración suelta vapor de agua, queda atrapado y viaja a los vidrios; el medidor de humedad sube → vista del conductor: el parabrisas se empaña. "Y SE EMPAÑA". "Y sube el CO₂: da sueño". |
| 19,1–27,8 s | **Error #2 · Verano** | A/C prendido y la recirculación APAGADA → el compresor enfría aire caliente de afuera sin parar (aguja de esfuerzo en rojo) → "Más esfuerzo = MÁS BENCINA" (la aguja del estanque cae). |
| 27,8–33,8 s | **La regla** | "LO ESTÁS USANDO AL REVÉS" (vuelve a girar). Frío o lluvia → aire de afuera. Calor → recirculación. Notas: ventilar primero si el auto estuvo al sol; renovar el aire cada cierto rato. |
| 33,8–44,8 s | **Desempañar al tiro** | 4 pasos sobre un panel real; el vidrio se limpia de abajo hacia arriba con cada paso: 1 modo parabrisas · 2 A/C prendido (aunque sea invierno: seca el aire) · 3 recirculación apagada · 4 ventilador al máximo y temperatura caliente. "LISTO" + luneta trasera (botón del rectángulo). |
| 44,8–48,2 s | **Cierre** | "¿Lo usabas al revés?" · Comenta SÍ o NO · Guárdalo para el próximo día de lluvia · Mándaselo a quien anda todo empañado · MOKTA. |

Retención: algo cambia cada 1–2 s (golpe de texto, clic, corte, gráfico), cada escena entra con un "punch-in",
hay un bucle abierto ("Al final: cómo desempañar al tiro") desde el segundo 6,7, y el cierre vuelve a enganchar con el gancho al repetirse.
Cada golpe visual (clic del botón, "Y SE EMPAÑA", cada paso de la receta…) cae en la palabra exacta en que lo dice la voz.

## Base técnica (lo que afirma el video)

- **Recirculación** cierra la toma de aire exterior y recircula el aire de la cabina.
- **Invierno / lluvia:** la respiración agrega vapor de agua; con la toma cerrada la humedad se acumula y se condensa en el vidrio frío. También sube el CO₂ de la cabina (somnolencia). Solución: aire de afuera.
- **Verano con A/C:** enfriar aire exterior caliente exige más al compresor (que mueve el motor) que volver a enfriar el aire ya frío de la cabina → más consumo. Solución: recirculación, ventilando primero si el auto estuvo al sol y renovando el aire cada cierto rato.
- **Desempañar:** modo parabrisas + A/C (el evaporador condensa la humedad y entrega aire seco, también con calefacción) + aire exterior + ventilador alto y temperatura caliente. La luneta trasera usa una resistencia eléctrica (botón del rectángulo).
- El **"90%"** es la cifra editorial del gancho pedida para el reel, no un dato de un estudio. Se cambia en `src/config.ts` (`hookTop`).
- "33°" afuera (verano) es un ejemplo ilustrativo.

## Texto sugerido para publicar

> ¿Tu auto se empaña cada vez que llueve? 👀 Probablemente estás usando este botón al revés.
> Frío o lluvia → aire de afuera. Calor → recirculación. Y para desempañar al tiro: modo parabrisas + A/C + recirculación apagada + ventilador al máximo.
> Guárdalo para el próximo día de lluvia 🌧️ y mándaselo a quien anda todo empañado.
>
> #autos #tipsdeautos #conducir #chile #mantencion #aireacondicionado #desempañar #mokta

## Volver a renderizar

```bash
npm i
# voz (Qwen3-TTS; corre en CPU, ~3× tiempo real). En un entorno virtual aparte:
python3 -m venv .venv-tts && .venv-tts/bin/pip install torch --index-url https://download.pytorch.org/whl/cpu
.venv-tts/bin/pip install qwen-tts faster-whisper librosa scipy soundfile
.venv-tts/bin/python scripts/qwen_voice.py          # tomas por escena → out/voice_takes/ (usa public/audio/voice/reference.wav)
.venv-tts/bin/python scripts/gen_voice.py           # elige la mejor toma, ajusta ritmo, re-sincroniza src/timeline.json
python3 scripts/audit_voice.py                      # tabla de ritmo / tono / énfasis por escena
python3 scripts/gen_audio.py                        # música, efectos, ambiente y voz → public/audio/soundtrack.wav
npx remotion studio                                 # vista previa (composición "MoktaRecirculacion", escenas sueltas en "Escenas")
./scripts/render.sh                                 # video sin audio → out/video_only.mp4
./scripts/assemble.sh                               # + audio normalizado −14 LUFS → out/MOKTA_BotonRecirculacion_v1.mp4
python3 scripts/qa.py out/MOKTA_BotonRecirculacion_v1.mp4                 # formato, sonoridad, negros, golpes en los cortes
.venv-tts/bin/python scripts/qa_voice.py out/MOKTA_BotonRecirculacion_v1.mp4  # transcribe el MP4 final y mide golpe visual vs palabra
```

En una máquina normal Remotion descarga su propio Chrome; en el servidor de render se usa el Chrome headless
local mediante la variable `REMOTION_CHROME`.

## Dónde se cambia cada cosa

| Qué | Archivo |
|---|---|
| Duración de escenas, instantes de cada golpe ("beats") y efectos de sonido ("cues") | `src/timeline.json` |
| Textos, colores, tipografías | `src/config.ts` |
| Escenas | `src/scenes/` (Hook, Define, Winter, Summer, Rule, Recipe, Cta) |
| Botón del panel, perillas, indicadores, íconos | `src/components/HvacButton.tsx`, `Gauges.tsx`, `Icons.tsx` |
| Parabrisas (ciudad de noche con lluvia, empañado y desempañado) | `src/components/Windshield.tsx` |
| Corte del auto con el recorrido del aire y el vapor | `src/components/CarSection.tsx` |
| Animaciones de texto, fondos, grano | `src/components/Kinetic.tsx` |
| Texto de la locución, persona y emoción por escena, ritmo (tope de pausas, aceleración), palabras clave, palabra que dispara cada golpe | `src/voice.json` |
| Generación de tomas con Qwen3-TTS (referencia diseñada + clon) | `scripts/qwen_voice.py` → `out/voice_takes/` |
| Selección de la mejor toma, ritmo y sincronía por palabra | `scripts/gen_voice.py` → `public/audio/voice/` |
| Métricas de voz (ritmo, tono, énfasis) y auditoría | `scripts/voice_metrics.py`, `scripts/audit_voice.py`, `scripts/qa_voice.py` |
| Música, efectos y mezcla con la voz (la música baja cuando habla) | `scripts/gen_audio.py` → `public/audio/` |

Si cambias `voice.json`, ejecuta `qwen_voice.py` (si cambió un texto), `gen_voice.py` y luego `gen_audio.py`. Si cambias `timeline.json` a mano, ejecuta `gen_audio.py`:
video y audio leen el mismo archivo. La música va a 120 BPM sobre una rejilla de pulso continua: los cortes caen donde termina cada frase de la voz.

## Locución

- **Motor:** [Qwen3-TTS](https://github.com/QwenLM/Qwen3-TTS) 1.7B (licencia **Apache-2.0**, uso comercial permitido), corriendo local en CPU.
- **Personaje:** se diseñó con VoiceDesign ("hombre de ~32 años, barítono grave, español latinoamericano de Chile, experto en autos
  hablando a cámara en un reel viral: ritmo rápido, dicción clara, entonación dinámica, enfático en las palabras clave").
  Ese clip es `public/audio/voice/reference.wav`. Cada escena se genera **clonando** ese timbre con el modelo Base, para que sea el mismo locutor de principio a fin.
- **Selección:** 52 tomas (3–8 por escena). Se eligió la que mejor se entiende, conserva el timbre, enfatiza las palabras clave, varía el tono y no cae de energía.
- **Ritmo:** pausas internas acotadas a 0,28 s y aceleración de 1,18× que conserva el tono. Cortes en la pausa entre frases (0,27–0,30 s).
- **Detalle y números:** [`AUDITORIA_VOZ.md`](AUDITORIA_VOZ.md).

Guion locutado:

> El noventa por ciento usa este botón… ¡al revés! Un hábito de dos segundos que te empaña los vidrios y te quema bencina.
> Se llama recirculación: cierra el aire de afuera, y el auto respira su propio aire.
> Error uno: en invierno la prendes por el frío. Pero tu respiración suelta vapor, queda atrapado, toca el vidrio frío… ¡y se empaña!
> Error dos: en verano, con aire acondicionado, ¡la dejas apagada! Y el compresor enfría aire caliente sin parar. Más esfuerzo… ¡más bencina!
> O sea… ¡lo estás usando al revés! Frío o lluvia: ¡aire de afuera! Calor: ¡recirculación!
> ¿Y para desempañar al tiro? Uno: modo parabrisas. Dos: aire acondicionado, aunque sea invierno. Tres: recirculación apagada. Cuatro: ventilador al máximo. ¡Listo!
> ¿Tú lo usabas al revés? Comenta sí o no… y guárdalo.

Para usar otra voz (por ejemplo una grabación propia), reemplaza `public/audio/voice/<escena>.wav` y ejecuta
`gen_voice.py --keep-audio` (solo mide las palabras y re-sincroniza) y luego `gen_audio.py`.
