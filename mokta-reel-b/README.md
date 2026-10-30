# MOKTA · Test de reflejos — Propuesta B (reel completo)

Versión separada del proyecto original (`../mokta-reel`, sin cambios).

**Mecánica:** pausar = frenar. En cada ronda la barrera aparece a 90 m; cada fotograma pausado muestra en el
instrumental el tiempo de reacción y el resultado estimado de frenar en ese instante (te detienes / impacto a X km/h).
Sin frenar, el auto llega a la barrera (2,70 / 2,03 / 1,54 s), corte a negro, y una lectura para todos.

**El guion manda el ritmo.** `src/reel/guion.json` contiene la voz; `scripts/plan_guion.py` mide cada frase y
coloca las escenas a su alrededor (presentación hablada → silencio → barrera → ventana sin voz → impacto →
lectura hablada). Guion completo con tiempos: [`GUION.md`](GUION.md).

| Bloque | Inicio | Contenido |
|---|---|---|
| Gancho | 0:00 | La voz plantea la situación y la regla ("pausar es frenar"); acercamiento lento a la barrera |
| Ronda 1 · 120 | 0:09 | Barrera a los 0:15,5 · lectura "0,58 s para frenar a tiempo" |
| Ronda 2 · 160 | 0:26 | Barrera a los 0:33,8 · "aunque frenaras al instante, chocabas a 85" |
| Ronda final · 210 | 0:45 | Barrera a los 0:49,4 · "impacto a más de 160" |
| Cierre | 0:59 | Distancia de frenado ∝ v² · "+75 % de velocidad = el triple de distancia" |
| CTA | 1:13 | "¿A cuántos km/h chocaste en la ronda final?" · vuelve al plano del gancho |

Duración 80 s · 1080×1920 · 30 fps. Subtítulos palabra por palabra (`src/reel/Subtitles.tsx`).

**Voz:** el MP4 actual lleva una **voz guía sintetizada** (espeak-ng + MBROLA) solo para validar ritmo y
sincronía. Para la versión final, graba cada frase en `public/audio/voz/<ID>.wav` (ver la guía al final de
`GUION.md`) y vuelve a ejecutar la cadena: todo se reacomoda a la duración real de cada toma.

## Render

```bash
npm ci
apt-get install espeak-ng mbrola mbrola-es4   # solo para la voz guía
python3 scripts/plan_guion.py       # guion → timeline.json, subtitulos.json, voz.wav, GUION.md
python3 scripts/gen_seams_reel.py   # juntas del asfalto (imagen, cámara y audio)
python3 scripts/audio_reel.py       # diseño sonoro → public/audio/reel.wav
npx remotion bundle src/index.ts --out-dir build
npx remotion render build MoktaReflejosB out/reel_raw.mp4 --codec=h264 --crf=16 --muted --props='{"withAudio":false}'
./scripts/assemble_reel.sh          # → out/MOKTA_TestDeReflejos_B.mp4
```

En el contenedor sin GPU: `REMOTION_CHROME=/opt/pw-browsers/chromium_headless_shell-*/chrome-*/chrome-headless-shell`.
El prototipo de la ronda 1 sigue disponible como composición `PrototipoRonda1`.

## Dónde está cada cosa

| Qué | Archivo |
|---|---|
| Guion de la voz (fuente del ritmo) | `src/reel/guion.json` → `scripts/plan_guion.py` → `GUION.md` |
| Velocidades, distancia, desaceleración | `src/reel/escenas.json` |
| Tiempos (generados) | `src/reel/timeline.json`, `src/reel/subtitulos.json`, `src/reel/voz_tiempos.json` |
| Modelo de frenado | `src/physics.ts` · verificación `scripts/modelo_frenado.py --check` · `MODELO_FRENADO.md` |
| Rondas (conducción, panel, lectura) | `src/reel/RoundB.tsx`, `src/reel/Hud.tsx` |
| Gancho, cierre, CTA | `src/reel/Scenes.tsx` |
| Subtítulos dinámicos | `src/reel/Subtitles.tsx` |
| Tablero, volante, pantalla del instrumental | `src/prototipo/Cockpit.tsx` |
| Movimiento de cabeza/carrocería | `src/lib/ride.ts` |
| Carretera, barrera, focos, óptica | `src/world/` |
| Audio | `scripts/audio_reel.py` |
| Control de calidad del MP4 final | `scripts/qa_reel.py` → `QA_REEL.md` |
