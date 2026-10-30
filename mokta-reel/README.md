# MOKTA · Test de reflejos (Remotion)

Reel vertical 1080×1920 · 30 fps · H.264 + AAC · 33,6 s.

## Volver a renderizar

```bash
npm i
python3 scripts/gen_audio.py          # regenera la pista (solo si cambias tiempos)
npx remotion studio                   # vista previa
npx remotion render MoktaReflejos out/mokta.mp4 --codec=h264 --crf=16 --audio-codec=aac
```

En una máquina normal Remotion descarga su propio Chrome. En un servidor sin GPU, `remotion.config.ts`
usa WebGL por software (`swangle`) y opcionalmente un Chrome local vía la variable `REMOTION_CHROME`.

## Dónde se cambia cada cosa

| Qué | Archivo |
|---|---|
| Tiempos (aparición de la barrera, ventana de reacción, duración de escenas), velocidades, distancia de aparición, umbrales de color | `src/timeline.json` |
| Textos, colores, tipografías, modelo de frenado | `src/config.ts` |
| Gancho / Rondas / Revelación / CTA | `src/scenes/` |
| Cronómetro, velocidad, indicador de ronda, tabla de resultado | `src/hud/` |
| Carretera 3D, barrera, entorno, auto distractor, cámara | `src/world/` |
| Diseño sonoro (100 % sintetizado, sin licencias de terceros) | `scripts/gen_audio.py` → `public/audio/` |

Si cambias `timeline.json`, vuelve a ejecutar `gen_audio.py`: video y audio leen el mismo archivo.

## Mecánica

1. Conducción a velocidad constante. Nada cambia antes de la barrera: luz, sonido y HUD son estacionarios.
2. La barrera aparece en un único fotograma a 70 m; en ese mismo fotograma arranca el cronómetro.
3. El auto sigue avanzando 1,10 s (ventana para pausar). Si el espectador pausa, ve su tiempo, su color y los metros recorridos sin frenar.
4. El mundo se congela y aparece la tabla de lectura (verde / amarillo / rojo con metros exactos a esa velocidad).

Umbrales: verde < 0,50 s · amarillo 0,50–0,75 s · rojo > 0,75 s.
Base: Green (2000), *How long does it take to stop?* — ~0,70–0,75 s es el mejor caso de frenado cuando el conductor espera la señal (≈0,5 s percepción + ≈0,2 s movimiento).
A 30 fps los cortes caen en fotogramas exactos: no hay fotogramas de color ambiguo.

Cierre: distancia total de detención con 1 s de reacción y ≈0,7 g (114 / 188 / 306 m).

## Estructura

```
src/
  timeline.json      fuente única de tiempos
  config.ts          parámetros, textos, colores, física
  Root.tsx           composición principal + escenas sueltas (carpeta "Escenas")
  MoktaReel.tsx      secuencia completa + audio
  scenes/            Hook, RoundScene, Outro (Reveal + Cta)
  hud/               Hud (cronómetro, velocidad, ronda), ResultCard
  world/             RoadWorld (3D), DriveView (cielo, etalonaje), shaders, texturas
  lib/               fuentes locales, utilidades de animación
scripts/gen_audio.py diseño sonoro procedural
public/fonts         Barlow Condensed + Inter (OFL, incluidas)
public/audio         soundtrack.wav + stems (ambiente, música, efectos)
```
