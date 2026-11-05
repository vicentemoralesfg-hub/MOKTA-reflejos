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

---

# MOKTA · ¿Por qué los últimos km de bencina se van más rápido? (`MoktaBencina`)

Reel vertical 1080×1920 · 30 fps · 62 s · v2: locución ElevenLabs (voz "Fer – Chileno, relajado y natural", `Tm8bVnJtlhPQUOb8KzSd`, `eleven_v4`, 1 toma).

**v2 — hibridación real:** el gancho y el planteamiento ocurren dentro de una cabina: toma real de conducción nocturna en el parabrisas (CC0, ver `public/bencina/real/CREDITOS.md`), tablero, volante, autotest de agujas al encender y zoom al marcador mientras baja la bencina. Desde "El secreto" pasa a los gráficos animados; el cierre vuelve a la cabina (el video empalma en bucle).

Gancho: *"¿Por qué los últimos kilómetros de bencina parecen desaparecer mucho más rápido? No es tu imaginación."*

## Volver a generar

```bash
npm i
python3 scripts/bencina/prep_voice.py   # voz_original.mp3 → voz.wav (×1,10 sin cambiar tono) + words.json
python3 scripts/bencina/gen_audio.py    # música + efectos + mezcla → public/bencina/soundtrack.wav
npx remotion studio                     # vista previa (composición MoktaBencina)
npx remotion render src/index.ts MoktaBencina out/bencina_video.mp4 --codec=h264 --crf=16 --muted --props='{"withAudio":false}'
scripts/bencina/assemble.sh             # → out/MOKTA_Bencina_UltimosKm_v1.mp4 (−14 LUFS, AAC 320k)
```

## Sincronía (fuente única)

| Archivo | Qué contiene |
|---|---|
| `scripts/bencina/words_original.json` | Alineación por palabra de ElevenLabs (toma original) |
| `src/bencina/data/words.json` | Palabras en fotogramas, ya re-escaladas al tempo final |
| `src/bencina/data/cues.json` | Escenas y cues con nombre (`[palabra, desfase]`). Video y audio leen este archivo |

Para mover un efecto o una animación, cambia su cue en `cues.json` y vuelve a correr `gen_audio.py`.

## Estructura

```
src/bencina/
  BencinaReel.tsx      composición: escenas por rango, subtítulos, golpes de cámara, destellos, audio
  timing.ts            W(i) / cue(nombre) / escenas
  tankModel.ts         geometría del estanque, volumen por altura, flotador, curva de la aguja
  theme.ts             colores, tipografías, easing
  components/          Gauge (marcador), Tank (corte del estanque, flotador, brazo, resistencia, bomba), Common (fondo, subtítulos, chips)
  scenes/              Cockpit (cabina real: gancho, planteamiento, CTA) · Intro (secreto) · Mechanism (cómo funciona, razones 1 y 2) · Outro (razón 3, conclusión, consejo, CTA)
scripts/bencina/       prep_voice.py · gen_audio.py · assemble.sh · stills.mjs (fotogramas de revisión)
public/bencina/        voz_original.mp3 · voz.wav · soundtrack.wav · stems/
```

## Guion y física

1. **Gancho** — aguja cayendo, testigo de reserva, autonomía a 0 km; sello "NO ES TU IMAGINACIÓN".
2. **Planteamiento** — km recorridos vs. aguja: con el modelo, la 1ª mitad del marcador dura ~376 km y la 2ª ~164 km con el mismo consumo.
3. **El secreto** — el marcador no mide litros, mide altura.
4. **Cómo funciona** — flotador → brazo → resistencia variable → señal → aguja.
5. **Razón 1** — llenando hasta el tope, la bencina queda sobre el máximo del flotador (zona ciega): los primeros litros no mueven la aguja.
6. **Razón 2** — el estanque se amolda al piso, al eje y al escape y suele ser más angosto abajo: mismos 5 L = más altura = más aguja.
7. **Razón 3** — calibración de fábrica: aguanta arriba y marca E con reserva.
8. **Conclusión** — gráfico consumo real (recto) vs. aguja (plana y luego se desploma).
9. **Consejo** — no andar en reserva: la bomba sumergida se enfría con la propia bencina.
10. **CTA** — "¿Hasta dónde dejas bajar la aguja?" (½ · ¼ · reserva) → comentarios.

Las cifras (50 L, 600 km, 10 % de reserva) son un **modelo ilustrativo**; cada auto tiene su forma de estanque y su calibración.
Música y efectos 100 % sintetizados en `gen_audio.py` por modelado físico (llave al contacto, relé, motores paso a paso de las agujas, bomba de bencina, swoosh metálico, rodado, autos que pasan) con espacialización binaural (ITD + sombra de cabeza). Sin ElevenLabs para efectos.
