# MOKTA · Test de reflejos — Propuesta B (reel completo)

Versión separada del proyecto original (`../mokta-reel`, sin cambios).

**Mecánica:** pausar = frenar. En cada ronda la barrera aparece a 90 m; cada fotograma pausado muestra en el
instrumental el tiempo de reacción y el resultado estimado de frenar en ese instante (te detienes / impacto a X km/h).
Sin frenar, el auto llega a la barrera (2,70 / 2,03 / 1,54 s), corte a negro, y una lectura para todos.

| Bloque | Inicio | Contenido |
|---|---|---|
| Gancho | 0,0 s | Auto detenido frente a la barrera · "PAUSA EL VIDEO cuando veas esta barrera · Pausar = frenar" |
| Ronda 1 · 120 | 1,9 s | Barrera a los 5,4 s · lectura "Tenías 0,58 s" |
| Ronda 2 · 160 | 10,9 s | Acelera desde 120 · auto en sentido contrario · barrera a los 14,5 s · "Aunque frenaras al instante ≈ 85 km/h" |
| Ronda final · 210 | 19,1 s | Acelera desde 160 · barrera a los 21,2 s · "≈ 161 km/h" |
| Cierre | 25,7 s | "Misma barrera. Misma distancia." · distancias de frenado 71 / 126 / 217 m · "+75 % de velocidad = 3 veces la distancia para frenar" |
| CTA | 30,7 s | "¿A cuántos km/h chocaste en la ronda final?" · vuelve al plano del gancho (bucle) |

Duración 33,4 s · 1080×1920 · 30 fps.

## Render

```bash
npm ci
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
| Tiempos, velocidades, distancia, desaceleración | `src/reel/timeline.json` (lo leen `src/reel/config.ts` y `scripts/reel_timing.py`) |
| Modelo de frenado | `src/physics.ts` · verificación `scripts/modelo_frenado.py --check` · `MODELO_FRENADO.md` |
| Rondas (conducción, panel, lectura) | `src/reel/RoundB.tsx`, `src/reel/Hud.tsx` |
| Gancho, cierre, CTA | `src/reel/Scenes.tsx` |
| Tablero, volante, pantalla del instrumental | `src/prototipo/Cockpit.tsx` |
| Movimiento de cabeza/carrocería | `src/lib/ride.ts` |
| Carretera, barrera, focos, óptica | `src/world/` |
| Audio | `scripts/audio_reel.py` |
| Control de calidad del MP4 final | `scripts/qa_reel.py` → `QA_REEL.md` |
