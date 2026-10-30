# MOKTA · Test de reflejos — Propuesta B (prototipo ronda 1)

Versión separada del proyecto original (`../mokta-reel`, sin cambios). Solo contiene la **ronda 1 (120 km/h)**
para aprobación de calidad antes de construir las rondas 2 y 3 y el cierre.

Mecánica: pausar = frenar. La barrera aparece a 90 m; cada fotograma pausado muestra en el instrumental
el tiempo de reacción y el resultado estimado de frenar en ese instante. Sin frenar, el auto llega a la
barrera a los 2,70 s (corte a negro + impacto) y luego se muestra la lectura "Tenías 0,58 s".

## Render

```bash
npm ci
python3 scripts/gen_seams.py      # juntas del asfalto (imagen, cámara y audio)
python3 scripts/audio_r1.py       # diseño sonoro de referencia → public/audio/r1.wav
npx remotion studio src/index.ts  # vista previa (composición PrototipoRonda1)
npx remotion bundle src/index.ts --out-dir build
npx remotion render build PrototipoRonda1 out/r1_raw.mp4 --codec=h264 --crf=16 --muted --props='{"withAudio":false}'
./scripts/assemble_r1.sh          # → out/MOKTA_PrototipoRonda1.mp4 (-14 LUFS, -1,3 dBTP)
```

En el contenedor sin GPU: `REMOTION_CHROME=/opt/pw-browsers/chromium_headless_shell-*/chrome-*/chrome-headless-shell`.

## Dónde está cada cosa

| Qué | Archivo |
|---|---|
| Tiempos (instrucción, aparición, negro, lectura), distancia, desaceleración | `src/prototipo/r1.json` |
| Modelo de frenado | `src/physics.ts` · verificación `scripts/modelo_frenado.py` · `MODELO_FRENADO.md` |
| Escena, instrumental, lectura final | `src/prototipo/Ronda1.tsx` |
| Tablero, volante, pantalla del instrumental | `src/prototipo/Cockpit.tsx` |
| Movimiento de cabeza/carrocería (juntas sincronizadas) | `src/lib/ride.ts` |
| Óptica (focal 1662 px ≈ 36° horizontal, horizonte por desplazamiento de lente), carretera, barrera | `src/world/` |
| Audio procedural (motor, neumáticos, viento, juntas, impacto, balizas) | `scripts/audio_r1.py` |
