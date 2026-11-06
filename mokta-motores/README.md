# MOKTA · ¿Reconoces el motor? (Remotion)

Reel vertical 1080×1920 · 30 fps · H.264 + AAC. Concurso de 7 rondas: el espectador escucha un motor
real y elige entre cuatro configuraciones antes de que se revele la respuesta.

## Volver a renderizar

```bash
npm i
python3 scripts/build_audio.py        # pista final + datos del visualizador (solo si cambias tiempos o tramos)
npx remotion studio                   # vista previa
npx remotion render MoktaMotores out/mokta_motores.mp4 --codec=h264 --crf=16 --audio-codec=aac --audio-bitrate=320k
```

`build_audio.py` necesita `numpy scipy soundfile pyloudnorm` y `ffmpeg`, y las grabaciones originales en
`assets/engines/` (ver `CREDITOS.md` para la fuente exacta de cada una).

## Dónde se cambia cada cosa

| Qué | Archivo |
|---|---|
| Rondas, alternativas, respuesta, textos de la ficha, duración de cada fase (fotogramas) | `src/quiz.json` |
| Qué tramo de cada grabación suena en la escucha y en la revelación, niveles | `scripts/clips.json` |
| Colores, textos fijos, tipografías | `src/config.ts` |
| Gancho / Ronda / Cierre | `src/scenes/` |
| Visualizador, alternativas, cabecera, tarjeta de revelación, fondo | `src/components/` |
| Mezcla, efectos sintetizados, normalización, datos del visualizador | `scripts/build_audio.py` |

Video y audio leen la misma `quiz.json`: si cambias una duración, vuelve a ejecutar `build_audio.py`.

## Estructura de una ronda

1. **Tarjeta de ronda** (silencio táctico + golpe grave). En la final: latidos.
2. **Escucha**: el motor suena sin ninguna pista visual (solo el visualizador, que reacciona a la pista real).
3. **Alternativas** A–D aparecen a mitad de la escucha; el motor sigue sonando.
4. **Cuenta regresiva 3-2-1** en el aro del visualizador, con un tic agudo por segundo (no tapa el motor).
5. **Silencio** de 6–12 fotogramas: se corta el motor.
6. **Revelación**: destello, impacto, la alternativa correcta en verde, la foto del auto se abre desde el
   centro, configuración en tipografía gigante, ficha corta y foto del motor; suena el tramo más espectacular.
