# MOKTA · El botón que usas al revés (Remotion)

Reel vertical 1080×1920 · 30 fps · H.264 + AAC · 54 s · con locución en español (TTS neural).
Tema: el botón de recirculación de aire y cómo desempañar el auto al tiro.

**Video final:** `entrega/MOKTA_BotonRecirculacion_v1.mp4` · portada: `entrega/portada.jpg`

## Guion (locución + texto en pantalla; también se entiende sin sonido)

| Tiempo | Escena | Qué pasa |
|---|---|---|
| 0,0–6,5 s | **Gancho** | Fotograma 0 = portada: "EL 90% USA ESTE BOTÓN" + botón de recirculación + "AL REVÉS" **de cabeza**, que gira y queda derecho. El vidrio se empaña detrás. Luego: "Un hábito de 2 segundos que… te empaña los vidrios / te quema bencina". |
| 6,5–12,0 s | **Qué es** | "Se llama RECIRCULACIÓN". Corte del auto: la toma de aire exterior se cierra (✕) y el aire empieza a dar vueltas dentro de la cabina. Aviso abajo: "Al final: cómo desempañar al tiro" (abre la curiosidad hasta el final). |
| 12,0–20,5 s | **Error #1 · Invierno** | "La prendes para no pasar frío" (clic, LED encendido) → la respiración suelta vapor de agua, queda atrapado y viaja a los vidrios; el medidor de humedad sube → vista del conductor: el parabrisas se empaña. "Y SE EMPAÑA". "Y sube el CO₂: da sueño". |
| 20,5–29,5 s | **Error #2 · Verano** | A/C prendido y la recirculación APAGADA → el compresor enfría aire caliente de afuera sin parar (aguja de esfuerzo en rojo) → "Más esfuerzo = MÁS BENCINA" (la aguja del estanque cae). |
| 29,5–37,0 s | **La regla** | "LO ESTÁS USANDO AL REVÉS" (vuelve a girar). Frío o lluvia → aire de afuera. Calor → recirculación. Notas: ventilar primero si el auto estuvo al sol; renovar el aire cada cierto rato. |
| 37,0–50,0 s | **Desempañar al tiro** | 4 pasos sobre un panel real; el vidrio se limpia de abajo hacia arriba con cada paso: 1 modo parabrisas · 2 A/C prendido (aunque sea invierno: seca el aire) · 3 recirculación apagada · 4 ventilador al máximo y temperatura caliente. "LISTO" + luneta trasera (botón del rectángulo). |
| 50,0–54,0 s | **Cierre** | "¿Lo usabas al revés?" · Comenta SÍ o NO · Guárdalo para el próximo día de lluvia · Mándaselo a quien anda todo empañado · MOKTA. |

Retención: algo cambia cada 1–2 s (golpe de texto, clic, corte, gráfico), cada escena entra con un "punch-in",
hay un bucle abierto ("Al final: cómo desempañar al tiro") desde el segundo 6,5, y el cierre vuelve a enganchar con el gancho al repetirse.
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
pip install piper-tts faster-whisper numpy scipy   # solo para regenerar voz/audio
python3 scripts/gen_voice.py       # locución + re-sincroniza timeline.json con la voz (si cambias src/voice.json)
python3 scripts/gen_audio.py       # música, efectos, ambiente y voz → public/audio/soundtrack.wav
npx remotion studio                # vista previa (composición "MoktaRecirculacion", escenas sueltas en "Escenas")
./scripts/render.sh                # video sin audio → out/video_only.mp4
./scripts/assemble.sh              # + audio normalizado −14 LUFS → out/MOKTA_BotonRecirculacion_v1.mp4
python3 scripts/qa.py out/MOKTA_BotonRecirculacion_v1.mp4        # formato, sonoridad, negros, sincronía de cortes
python3 scripts/qa_voice.py out/MOKTA_BotonRecirculacion_v1.mp4  # transcribe el MP4 final y mide golpe visual vs palabra
node scripts/stills.mjs out/stills 0 300 900   # fotogramas sueltos para revisar (a media resolución)
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
| Texto de la locución, voz, velocidad, pronunciaciones corregidas, palabra que dispara cada golpe | `src/voice.json` |
| Generación de la voz + sincronía por palabra | `scripts/gen_voice.py` → `public/audio/voice/` |
| Música, efectos y mezcla con la voz (la música baja cuando habla) | `scripts/gen_audio.py` → `public/audio/` |

Si cambias `voice.json`, ejecuta `gen_voice.py` y luego `gen_audio.py`. Si cambias `timeline.json` a mano, ejecuta `gen_audio.py`:
video y audio leen el mismo archivo. La música va a 120 BPM (1 pulso = 15 fotogramas) y todas las escenas empiezan en un pulso.

## Locución

- **Motor:** [Piper](https://github.com/OHF-Voice/piper1-gpl), TTS neural que corre local (sin costo por uso).
- **Voz:** `es_MX-claude-high`: español latinoamericano, calidad alta, **licencia Apache-2.0** (sirve para uso comercial).
  Se descartaron las voces de España (acento ajeno para Chile), la argentina `daniela` (licencia CC BY-SA)
  y `es_MX-ald` (se entendía peor). ElevenLabs no se pudo usar: la cuenta no tenía créditos ni generaciones gratis disponibles.
- **Control de calidad automático:** cada escena se genera en hasta 6 tomas, se transcribe con Whisper y se queda la que mejor se entiende.
  "Recirculación", "vidrio(s)", "frío" y "revés" se envían como fonemas IPA porque la voz los pronunciaba mal ("reciclación", "vidridos").
- **Sincronía:** Whisper entrega el tiempo de cada palabra y `gen_voice.py` reescribe la duración de cada escena y los golpes visuales
  (`src/voice.json` → `anchors`). Mezcla: la música baja ~11 dB mientras habla la voz (la voz queda ≈10 dB sobre el fondo).

Guion locutado:

> El noventa por ciento usa este botón al revés. Un hábito de dos segundos que te empaña los vidrios, y te quema bencina.
> Es la recirculación: cierra el aire de afuera, y tu auto respira su propio aire.
> En invierno, la prendes para no pasar frío. Pero tu respiración suelta vapor de agua, que queda atrapado, toca el vidrio frío… y se empaña.
> En verano, con el aire acondicionado prendido, la dejas apagada. Y el compresor enfría aire caliente, sin parar. Más esfuerzo, más bencina.
> O sea: lo estás usando al revés. Con frío, o lluvia: aire de afuera. Con calor: recirculación.
> ¿Y para desempañar al tiro? Uno: modo parabrisas. Dos: aire acondicionado, aunque sea invierno. Tres: la recirculación, apagada. Cuatro: ventilador al máximo, con calor. ¡Listo!
> ¿Lo usabas al revés? Comenta: sí, o no.

Para usar otra voz (por ejemplo ElevenLabs cuando haya créditos), reemplaza los archivos `public/audio/voice/<escena>.wav`
y ejecuta `python3 scripts/gen_voice.py --keep-audio` (solo mide las palabras y re-sincroniza) y luego `gen_audio.py`.
