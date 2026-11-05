# MOKTA · La estafa del falso vale vista (Remotion)

Reel vertical 1080×1920 · 30 fps · 59,9 s · H.264 + AAC · −14 LUFS.
**Video final:** `entrega/MOKTA_FalsoValeVista.mp4`

## Guion (locución ElevenLabs, voz «Fernando – Chileno», `Tm8bVnJtlhPQUOb8KzSd`, modelo eleven_v4)
Texto exacto en `guion.txt`. Gancho → historia (publicación, viernes con el banco cerrado, documento "perfecto",
entrega de llaves) → lunes en el banco (FALSO, auto perdido, $0) → qué es la estafa → 3 pasos para verificar →
"una foto o un papel con timbre no acreditan el pago" → "sin verificar por canales oficiales… no hay llaves" → CTA.
Banco, documento y personajes son ficticios (se indica en pantalla).

## Volver a generar
```bash
npm i
pip install numpy scipy faster-whisper     # solo si se rehace audio o alineación
python3 scripts/prep_voice.py   # raw/voz.mp3 → public/audio/voz.wav (pausas más cortas, +6 % tempo)
python3 scripts/align.py        # tiempos por palabra (whisper local) → raw/words_raw.json
python3 scripts/words.py        # tiempos + texto exacto del guion → src/words.json
python3 scripts/gen_audio.py    # música + efectos sintetizados + ducking → public/audio/mix.wav
npx remotion studio             # vista previa
./scripts/render.sh             # MP4 final en out/
```

## Dónde se cambia cada cosa
| Qué | Archivo |
|---|---|
| Inicio/fin de cada escena (segundos de locución) | `src/timing.ts` |
| Escenas | `src/scenes/Story1.tsx` (gancho, publicación, viernes), `Story2.tsx` (documento, entrega, lunes), `Teach.tsx` (explicación y 3 pasos), `Close.tsx` (foto, regla, cierre) |
| Personajes (Pablo, comprador, cajera) | `src/components/Person.tsx` |
| Auto, vale vista, teléfono, íconos | `src/components/Props.tsx` |
| Subtítulos palabra a palabra, titulares, etiquetas | `src/components/Text.tsx` |
| Efectos (cámara, grano, destellos, glitch, rebobinado) | `src/components/Fx.tsx` |
| Diseño sonoro (100 % sintetizado, sin licencias de terceros) | `scripts/gen_audio.py` |

Todo usa una sola referencia de tiempo: segundos de la locución (+0,2 s de entrada). Video, subtítulos y efectos
de sonido leen esos mismos valores, por eso quedan sincronizados.
