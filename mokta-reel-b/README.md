# MOKTA · Test de reflejos — Propuesta B (reel completo)

Versión separada del proyecto original (`../mokta-reel`, sin cambios).

**Mecánica:** pausar = frenar. La barrera aparece a 125 m en las tres rondas. Se **pasa** la ronda si, frenando en
el instante de la pausa, el auto se detiene o choca a 70 km/h o menos (límite de protección en choque frontal del
enfoque Sistema Seguro; detrás de la barrera hay un muro de hormigón). El panel da el veredicto en cada fotograma:
**TE DETIENES** (verde) · **CHOQUE GRAVE** ≤ 70 km/h (ámbar) · **RIESGO MORTAL** > 70 km/h (rojo).
Ronda 1: pasas antes de 2,35 s · Ronda 2: antes de 0,52 s · Ronda final: imposible (137 km/h aun frenando al instante).

| Bloque | Inicio | Contenido |
|---|---|---|
| Gancho | 0:00.0 | Auto a ~186 km/h hacia la barrera · "Pausa el video en cuanto veas la barrera" · impacto |
| Ronda 1 · 120 | 0:02.3 | "Ronda uno. Frena antes de que el choque sea mortal." · barrera a los 0:06.4 · "Fácil." |
| Ronda 2 · 160 | 0:13.4 | "Ahora tienes medio segundo." · barrera a los 0:18.6 · "¿Menos de medio segundo? Pasaste." |
| Ronda final · 210 | 0:25.5 | "Si pasas esta, eres el primero." · barrera a los 0:30.5 · "Nadie la pasa: 137 km/h." |
| Cierre | 0:37.9 | "A 210, tus reflejos ya no importan" · distancia de frenado ∝ v² · "Sobre 70, el auto ya no puede protegerte." |
| CTA | 0:51.2 | "¿Cuántas rondas pasaste? Comenta 1, 2 o 3. Y si alguien te dice 3, mándale esto." |

Duración 57 s · 1080×1920 · 30 fps. Subtítulos palabra por palabra (`src/reel/Subtitles.tsx`).

**Video final:** `entregables/MOKTA_TestDeReflejos_final.mp4` · guía de publicación en [`PUBLICACION.md`](PUBLICACION.md).

**Voz:** locución generada con ElevenLabs (voz `2LHmGJw77TBxtmz5srqw`, español latinoamericano neutro,
modelo `eleven_v4`), una sola toma con pausas largas entre frases: `voz_elevenlabs/toma3.mp3`.
`scripts/importar_voz.py voz_elevenlabs/toma3.mp3 1.2` la separa en las 21 frases (`public/audio/voz/<ID>.wav`)
y la acelera un 20 % sin cambiar el tono. Si falta alguna frase, `plan_guion.py` usa la voz guía sintetizada.
Para cambiar de voz o de toma: generar otra locución con el mismo texto y orden, importarla y volver a ejecutar la cadena.

## Render

```bash
npm ci
apt-get install espeak-ng mbrola mbrola-es4   # solo para la voz guía
python3 scripts/importar_voz.py voz_elevenlabs/toma3.mp3 1.2   # locución → frases
python3 scripts/importar_voz.py voz_elevenlabs/toma4.mp3 1.2   # frases nuevas del inicio
python3 scripts/importar_voz.py voz_elevenlabs/toma5.mp3 1.2   # frases de la mecánica de umbral
python3 scripts/alinear_palabras.py voz_elevenlabs/toma3_palabras.json   # tiempos reales por palabra
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
