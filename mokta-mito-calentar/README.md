# MOKTA · El mito de calentar el auto (Remotion)

Reel vertical 1080×1920 · 30 fps · 51,7 s · H.264 + AAC. **v3**: una sola voz de narrador (Qwen3-TTS: diseñada una vez y clonada en todas las frases), texto en pantalla sincronizado palabra por palabra, música cinematográfica y efectos 100 % sintetizados. Análisis: `ANALISIS_v1.md` (v1 → v2) y `ANALISIS_v2_voz.md` (voz v2 → v3).

**Entregables** (`entrega/`)

| Archivo | Qué es |
|---|---|
| `MOKTA_MitoCalentarAuto_v3.mp4` | Versión principal: voz + música + efectos |
| `MOKTA_MitoCalentarAuto_v3_sinvoz.mp4` | Misma imagen, solo música + efectos (para poner voz propia o un audio en tendencia) |
| `portada.jpg` | Portada sugerida para el Reel |
| `texto_publicacion.md` | Descripción, hashtags y fuentes para la publicación |

## Estructura del guion (retención)

| # | Escena | Qué hace para retener |
|---|---|---|
| 1 | Gancho (0–2,3 s) | Pregunta directa + auto con escarcha "calentando" + cronómetro que corre de 00:00 a 10:00 desde el primer fotograma |
| 2 | "Para." | Corte seco: el plano se congela en rojo, golpe sonoro, sello gigante |
| 3 | Bucle abierto | "Te digo cuánto hay que esperar de verdad": cronómetro con cifras borrosas (la respuesta llega en la escena 9) |
| 4–5 | 01 · El origen | Carburador (look de película antigua, el "chupete") → rodillo de años → inyección electrónica |
| 6–7 | 02 · El daño | Cilindro en corte: bencina extra que lava la película de aceite → roce. Gráfico: detenido se calienta lentísimo |
| 8 | 03 · La bencina | 10 min × 365 días = 60 horas · ≈ 37 L · 0 km |
| 9 | 04 · Lo correcto | Pago del bucle: anillo de **30 segundos** + checklist (encender, cinturón, 30 s, manejar suave) |
| 10 | Sin acelerones | Tacómetro (bajo 3.000 en frío) + aguja de temperatura |
| 11 | La excepción | Parabrisas escarchado que se despeja: "primero ver, después partir" |
| 12 | Cierre | Pregunta para comentarios + "mándaselo a…" y el fondo vuelve al plano inicial (bucle) |

Cambio visual o sonoro cada 1–2 s, capítulos numerados arriba para dar sensación de avance, y toda la información también en texto: el video se entiende sin sonido.

## Datos y fuentes

- **Origen del mito**: los motores con carburador necesitaban calor para atomizar bien la bencina; la inyección electrónica (masiva desde fines de los 80/90) ajusta la mezcla con sensores.
- **30 segundos y luego manejar suave**: Recursos Naturales Canadá (NRCan) — "la mejor forma de calentar el auto es manejarlo"; su guía de 2005 indica ≤ 30 s, su página actual habla de 2–3 min como máximo incluso con frío invernal (por eso la nota "frío extremo: 2–3 min como máximo").
- **Bencina extra que lava el aceite**: con el motor frío la mezcla es más rica; parte de la bencina se condensa en las paredes del cilindro y puede arrastrar la película de aceite / diluirlo. En ralentí el motor tarda más en calentarse, así que pasa más tiempo en ese estado.
- **Consumo en ralentí**: ≈ 0,16 gal/h ≈ 0,61 L/h para un sedán 2.0 L (Argonne National Laboratory, publicado por el DOE de EE.UU.). 10 min × 365 días = 60,8 h → ≈ 37 L.
- Las curvas de temperatura de la escena 7 son ilustrativas (indicado en pantalla).

## Volver a generar

```bash
npm i
python3 scripts/gen_textures.py         # grano de película + escarcha (PNG procedurales)
python3 scripts/gen_vo.py design 5     # diseña 5 voces candidatas (Qwen3-TTS VoiceDesign) y fija la referencia
python3 scripts/gen_vo.py takes 3       # clona esa voz en cada frase (Qwen3-TTS Base), 3 tomas
python3 scripts/gen_vo.py build         # elige tomas (misma voz ±1,5 st, 0 errores), ritmo global → src/timeline.json
python3 scripts/gen_audio.py            # música + efectos + mezclas → public/audio/
npx remotion studio                     # vista previa (composición MitoCalentarAuto + escenas sueltas)
npx remotion render MitoCalentarAuto out/video_muted.mp4 --muted --codec=h264 --crf=15 --props='{"audio":null}'
bash scripts/assemble.sh                # normaliza a −14 LUFS y genera entrega/*.mp4
```

`gen_vo.py` necesita `pip install qwen-tts faster-whisper resemblyzer praat-parselmouth num2words`, `torch`/`torchaudio` CPU
de la misma versión (p. ej. 2.9.1) y `rubberband-cli`. Si cambias el texto de una frase (`scripts/vo_script.json`), borra sus tomas en
`public/audio/vo_takes/`, vuelve a correr `gen_vo.py takes` + `build` y luego `gen_audio.py` (la voz de referencia se mantiene
en `public/audio/vo_ref/ref.wav`, así que la frase nueva sale con la misma voz):
las escenas se re-sincronizan solas porque buscan cada palabra con `cue()`.

¿Locución humana? Graba siguiendo `scripts/vo_script.json`, guarda cada frase como `public/audio/vo_takes/<escena>_0.wav`
y corre `gen_vo.py build`: el video se ajusta a tu voz.

En un servidor sin Chrome de Remotion, define `REMOTION_CHROME` con la ruta de un Chrome headless.

## Dónde se cambia cada cosa

| Qué | Archivo |
|---|---|
| Texto de la locución y descripción de la voz | `scripts/vo_script.json` |
| Voz de referencia (la única del video) | `public/audio/vo_ref/ref.wav` |
| Duración de escenas y palabra→fotograma (generado) | `src/timeline.json` |
| Colores, tipografías, zona segura | `src/config.ts` |
| Escenas | `src/scenes/S01Hook.tsx` … `S12Cta.tsx` |
| Ilustraciones (auto, calle, carburador, cilindro, íconos) | `src/art/` |
| Grano, viñeta, nieve, escarcha, textos animados | `src/components/` |
| Música y efectos | `scripts/gen_audio.py` |
