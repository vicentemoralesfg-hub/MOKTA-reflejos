# MOKTA · La palanca del espejo retrovisor (Remotion)

Reel vertical 1080×1920 · 30 fps · H.264 + AAC · 46,7 s.

**Gancho:** «Si te han encandilado de noche, estás cometiendo el mismo error que el 90% de los conductores con esta palanca».

## Estructura del video

| Bloque | Qué se ve | Locución |
|---|---|---|
| Gancho (0–7 s) | Vista del conductor de noche, retrovisor encandilando, «90%» y zoom a la palanca | «Si te han encandilado… con ESTA palanca» |
| Palanca (7–10,5 s) | Macro de la palanca con sus posiciones DÍA / NOCHE; espejo sin palanca + «te lo cuento al final» | «No es un adorno. Y si tu espejo no la tiene, quédate hasta el final» |
| El error (10,5–15 s) | El espejo se gira entero y se pierde la visión trasera (✕) | «La mayoría mueve el espejo entero… y se queda sin ver atrás» |
| Lo correcto (15–21 s) | Clic de la palanca: el encandilamiento cae en el momento; comparación ANTES / DESPUÉS | «Tira la palanca hacia ti… y sigues viendo al auto de atrás» |
| Cómo funciona (21–35,5 s) | Corte lateral con trazado de rayos real: cuña de vidrio, capa plateada → ojos; al girar, ese reflejo va al techo y solo llega el del vidrio (4 %) | «El espejo es una cuña de vidrio…» |
| Electrocrómico (35,5–39,5 s) | Espejo sin palanca que se oscurece solo (sensor + LED) | «¿Tu espejo no tiene palanca? Es electrocrómico» |
| De día (39,5–42,5 s) | En posición noche de día se ve oscuro → palanca a DÍA, se ve nítido | «Y ojo: de día, vuelve a dejarla como estaba» |
| CTA (42,5–46,7 s) | Guárdalo / Compártelo / MOKTA | «Guárdalo y compártelo con alguien que maneje de noche» |

## Volver a renderizar

```bash
npm i
pip install numpy scipy pillow     # para la locución y la mezcla
python3 scripts/prep_vo.py         # solo si cambias la locución original (source/)
scripts/render.sh                  # mezcla + render + normalización → out/MOKTA_PalancaEspejo_v1.mp4
npx remotion studio                # vista previa
scripts/stills.sh hoja 0 500 900   # hoja de contactos de fotogramas sueltos
```

`scripts/render.sh` usa el Chrome headless del contenedor si existe (`REMOTION_CHROME`); en una máquina normal Remotion descarga el suyo.

## Dónde se cambia cada cosa

| Qué | Archivo |
|---|---|
| Tiempos | `src/vo_words.json` (tiempos por palabra de la locución). Todas las animaciones y efectos se anclan a palabras con `wf(i)` / `we(i)` — si cambia la locución, todo se re-sincroniza |
| Cortes de escena | `src/timeline.ts` (y los mismos cortes en `scripts/mix_audio.py`) |
| Subtítulos (bloques, colores de palabras clave) | `src/components/Captions.tsx` |
| Espejo retrovisor (carcasa, palanca, reflejo, encandilamiento, electrocrómico) | `src/components/Mirror.tsx` |
| Óptica del diagrama (cuña, Snell, ángulos día/noche) | `src/lib/optics.ts` |
| Escenas | `src/scenes/` |
| Efectos de sonido y mezcla | `scripts/mix_audio.py` |
| Edición de la locución (pausas, ritmo +9 %) | `scripts/prep_vo.py` |

## Audio

- **Locución:** ElevenLabs, voz `Wl3O9lmFSMgGFTTwuS6f` (Martin Alvarez), modelo eleven_v4. Original sin editar en `source/vo_tomaA.mp3`; tiempos por palabra (alineación de ElevenLabs Scribe) en `source/vo_tomaA_words.json`.
- **Música:** ElevenLabs Music v2.5, instrumental (`source/musica_tomaB.mp3`), con *ducking* bajo la voz (~12 dB por debajo) y su final cayendo en el cierre.
- **Efectos:** 100 % sintetizados en `scripts/mix_audio.py` (clic mecánico de la palanca, impactos, barridos, etc.).
- **Master:** −14 LUFS integrados, −1 dBTP (objetivo de Instagram/TikTok).

## Notas de contenido

- Manuales de fabricantes (p. ej. Kia) indican **tirar la palanca hacia ti** para la posición noche.
- El 4 % es la reflexión de una cara de vidrio sin recubrimiento (Fresnel, n ≈ 1,5); la capa plateada refleja casi toda la luz.
- El diagrama exagera el ángulo de la cuña (11°) para que la separación de los reflejos se vea; se indica en pantalla.
- El «90%» es la cifra del gancho entregado.
