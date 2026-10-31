# ¿Cuándo te midieron? (Remotion + @remotion/three)

Video vertical 1080×1920 · 30 fps · 49,1 s · H.264 + AAC. Dos versiones: con y sin subtítulos.

## Volver a producir

```bash
npm ci
pip install numpy scipy
python3 scripts/build_voice.py     # tempo + pausas de la locución → public/audio/voz.wav, src/data/words.json
python3 scripts/build_audio.py     # música + efectos + mezcla → public/audio/mix.wav
npx remotion studio                # vista previa (composiciones ConSubtitulos / SinSubtitulos / Planos)

# render (en servidor sin GPU: remotion.config.ts usa WebGL por software "swangle")
npx remotion render src/index.ts SinSubtitulos out/base.mp4 --props='{"subtitles":false,"withAudio":false}' --muted --codec=h264 --crf=12
npx remotion render src/index.ts SoloSubtitulos out/subs.mov --codec=prores --prores-profile=4444 --pixel-format=yuva444p10le --image-format=png --muted
scripts/assemble.sh                # → out/CuandoTeMidieron_con_subtitulos.mp4 y _sin_subtitulos.mp4
```

El 3D se renderiza una sola vez; los subtítulos se componen encima con alfa.

## Dónde se cambia cada cosa

| Qué | Archivo |
|---|---|
| Inicio de cada plano (anclado a una palabra), golpes de sonido, pausas, palabras resaltadas | `src/data/cues.json` |
| Locución original (ElevenLabs, voz "Ezequiel") y tiempos por palabra | `public/audio/voz_raw.mp3`, `scripts/words_raw.json` |
| Cámaras, autos, radar, láser, etiquetas de cada plano | `src/shots.ts` |
| Mundo low-poly (carretera, pinos, cerros, cielo, autos, haz, onda) | `src/world/` |
| Subtítulos, píldoras HUD, velocímetro, visor de patente | `src/hud/` |
| Música y efectos (100 % sintetizados, sin licencias de terceros) | `scripts/build_audio.py` |

## Sincronía

`cues.json` define cada plano por la palabra con la que empieza; el corte cae 0,12 s antes de esa palabra.
`build_audio.py` usa el mismo criterio, así que cortes, subtítulos y golpes salen de la misma fuente.

Datos, respaldo y texto para la descripción: `DESCRIPCION.md`.
