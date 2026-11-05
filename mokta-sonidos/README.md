# MOKTA · ¿Qué auto es? (Remotion)

Reel vertical 1080×1920 · 30 fps · H.264 + AAC · ≈76 s · fondo claro.

Juego de 3 rondas: aparecen dos autos (A y B), la voz presenta la ronda, suena ~7 s de motor real
(con barra de tiempo), cuenta 3‑2‑1 de un segundo por número, se encierra la opción correcta con un trazo
a mano + check ("correct") y la voz revela la respuesta junto a un dato técnico.

| Ronda | A | B | Suena | Respuesta |
|---|---|---|---|---|
| 1 | Ferrari | Lamborghini | Lamborghini Aventador SVJ (V12) | **B** |
| 2 | Ford Mustang | Nissan GT‑R | Mustang Shelby GT500 (V8) | **A** |
| 3 | Bugatti | Fórmula 1 | Ferrari F2004 F1 V10 (túnel de Mónaco) | **B** |

## Volver a renderizar

```bash
npm i
npx remotion studio                       # vista previa
npx remotion render QueAutoEs out/QueAutoEs.mp4 --codec=h264 --crf=17 --audio-codec=aac
```

Sin descarga de Chrome (servidor): `REMOTION_CHROME=/ruta/a/chrome-headless-shell npx remotion render ...`

## Dónde se cambia cada cosa

| Qué | Archivo |
|---|---|
| Autos de cada ronda, respuesta correcta, encuadre de la foto, colores, tiempos | `src/config.ts` |
| Tarjeta A/B, círculo de respuesta y check | `src/components/Tarjeta.tsx` |
| Ecualizador que reacciona al audio real del motor | `src/components/Ecualizador.tsx` |
| Fondo animado | `src/components/Fondo.tsx` |
| Gancho / Ronda / Cierre | `src/scenes/` |
| Música y su atenuación mientras suena cada motor | `src/Video.tsx` |
| Frases de la voz | `scripts/generar_voz.py` → `public/voz/` + `src/voz.json` |

### Ritmo de cada ronda (≈21–23 s)

Título "RONDA N" (voz) → entran A y B → la voz presenta ("¿Ferrari… o Lamborghini? ¡Escucha con atención!")
→ **≈7 s de motor** con ecualizador y barra de tiempo, música apagada → "¿A o B?" + **cuenta 3‑2‑1 de 1 s por
número** → trazo que encierra la respuesta + check → la voz revela ("¡Era el Lamborghini!") y aparece el dato
técnico.

## Voz (Qwen3-TTS, código abierto — sin ElevenLabs)

Motor: **Qwen3-TTS** (Alibaba Qwen, Apache 2.0), corriendo local en CPU. Flujo "diseñar y clonar":

1. **Diseño de la voz** con `Qwen3-TTS-12Hz-1.7B-VoiceDesign` a partir de una descripción en texto
   (locutor latinoamericano de motor/concurso, entusiasta, ritmo pausado). Se probaron 5 descripciones y se
   eligió la que sonó realmente grave y masculina (110–210 Hz), más pausada (≈5,3 sílabas/s) y con más
   variación de entonación. Esa toma es `public/voz/_referencia.wav`.
2. **Todas las frases** se generan con `Qwen3-TTS-12Hz-1.7B-Base` clonando esa referencia (misma voz en todo
   el video). 2 tomas por frase; se elige automáticamente la que Whisper transcribe correctamente y tiene más
   expresividad. Resultado de cada frase en `public/voz/_informe.json`.
3. Las duraciones quedan en `src/voz.json` y el video acomoda sus tiempos a ellas.

```bash
pip install qwen-tts faster-whisper librosa soundfile        # + sox del sistema
huggingface-cli download Qwen/Qwen3-TTS-12Hz-1.7B-Base --local-dir modelos/Qwen3-TTS-12Hz-1.7B-Base
python scripts/generar_voz.py --modelos modelos               # todas las frases
python scripts/generar_voz.py --modelos modelos --solo r2_revela   # rehacer una sola
```

Para cambiar lo que dice la voz: edita `FRASES` en `scripts/generar_voz.py` y vuelve a ejecutarlo.

## Créditos de material externo

**Sonidos de motor** (Internet Archive, archive.org; recortados y normalizados a −14 LUFS en `public/autos/`):
- Lamborghini Aventador SVJ — `novitec-lamborghini-aventador-svj-insane-sound` ("Novitec Lamborghini Aventador SVJ INSANE SOUND")
- Ford Mustang Shelby GT500 — `youtube-QHEKQ5adFv4` ("Mustang Shelby GT500 Engine")
- Ferrari F2004 F1 V10 — `ferrari-f-2004-f-1-v-10-pure-sound-inside-the-iconic-monaco-tunnel-f-2004-formula-1`
- Arranque del gancho: Bugatti Bolide — `bugatti-bolide-cold-start-bugatti-bolide-racecar-hypercar-viral-coldstart-startup`

Estos clips son subidas de terceros sin licencia declarada: antes de publicar con fines comerciales,
conviene verificar los derechos o reemplazarlos (basta con cambiar los `.wav` de `public/autos/`).

**Efectos y música** (Mixkit, licencia gratuita de Mixkit):
- Check: "Correct answer tone" (#2870) → `public/sfx/check.mp3`
- Whooshes: "Cinematic whoosh fast transition" (#1492), "Fast whoosh transition" (#1490), "Metal hit woosh" (#1485)
- Cuenta regresiva: "Explainer video pops whoosh light pop" (#3005)
- Música: "Need for speed" (#369)

**Fotos** (Unsplash, licencia Unsplash): Ferrari `photo-1614200179396`, Lamborghini `photo-1617650728468`,
Mustang `photo-1611566026373`, Nissan GT‑R `photo-1609964729554`, Bugatti `photo-1627454820903`,
Fórmula 1 `photo-1752886157329`.

**Tipografías** (Google Fonts, OFL): Anton, Archivo Black — incluidas en `public/fonts/`.
