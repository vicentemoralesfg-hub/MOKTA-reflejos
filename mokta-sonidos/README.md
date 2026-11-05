# MOKTA · ¿Qué auto es? (Remotion)

Reel vertical 1080×1920 · 30 fps · H.264 + AAC · ≈50 s · fondo claro.

Juego de 3 rondas. La voz solo dice el gancho ("¿Puedes adivinar el auto… solo por su sonido?") y
"¡Ronda uno / dos / tres!". Nada más: aparecen A y B, suena ~7,5 s de motor real (música apagada),
cuenta 3‑2‑1 de 1 s por número y se encierra la opción correcta con un trazo a mano + check, con el
sonido de "correcto" como único sonido.

| Ronda | A | B | Suena | Respuesta |
|---|---|---|---|---|
| 1 | Ferrari | Lamborghini | Lamborghini Aventador SVJ (V12) | **B** |
| 2 | Ford Mustang | Nissan GT‑R | Ford Mustang GTD (V8 5.2) en Nürburgring | **A** |
| 3 | Bugatti | Fórmula 1 | Williams FW14B F1 V10 (1992, Mansell) | **B** |

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

### Ritmo de cada ronda (≈14 s)

"¡Ronda N!" (voz, ~1 s) → entran A y B → **7,5 s de motor** con ecualizador y barra de tiempo, sin música →
"¿A O B?" en pantalla + **cuenta 3‑2‑1** (1 s por número) → trazo + check con solo el sonido de correcto (~2 s).

## Voz (Qwen3-TTS, código abierto — sin ElevenLabs)

Motor: **Qwen3-TTS** (Alibaba Qwen, Apache 2.0), corriendo local en CPU. Flujo "diseñar y clonar":

1. **Diseño de la voz** con `Qwen3-TTS-12Hz-1.7B-VoiceDesign` a partir de una descripción en texto
   (locutor latinoamericano de motor/concurso, entusiasta, ritmo pausado). Se probaron 5 descripciones y se
   eligió la que sonó realmente grave y masculina (110–210 Hz), más pausada (≈5,3 sílabas/s) y con más
   variación de entonación. Esa toma es `public/voz/_referencia.wav`.
2. **Las 4 frases** (gancho + "¡Ronda uno/dos/tres!") se generan con `Qwen3-TTS-12Hz-1.7B-Base` clonando esa
   referencia (misma voz en todo el video). 2–3 tomas por frase; se elige automáticamente la que Whisper transcribe correctamente y tiene más
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

**Sonidos de motor** (Internet Archive, archive.org; ventanas de 7,5 s recortadas y normalizadas a −14 LUFS en `public/autos/`):
- Ronda 1 · Lamborghini Aventador SVJ — `novitec-lamborghini-aventador-svj-insane-sound`, 182,0–189,5 s
- Ronda 2 · Ford Mustang GTD — `youtube-gsc4HNGbipo` ("2025 Ford Mustang GTD … Nürburgring SOUND!"), 92,0–99,5 s
- Ronda 3 · Williams FW14B F1 V10 — `1992-williams-fw-14-b-f-1-ex-mansell-formula-1-v-10-engine-sound`, 34,0–41,4 s
- Arranque del gancho: Bugatti Bolide — `bugatti-bolide-cold-start-bugatti-bolide-racecar-hypercar-viral-coldstart-startup`

**Verificación "solo motor"**: cada fuente se pasó por el clasificador de audio AST entrenado en AudioSet
(`MIT/ast-finetuned-audioset-10-10-0.4593`) segundo a segundo y se eligió la ventana de 7 s con más
"Vehicle/Engine" y sin "Music" ni "Speech" (todas las ventanas finales: música ≤ 0,13, voz ≤ 0,08).
Así se descartó el clip anterior de la ronda 2 (era heavy metal, no un motor) y los tramos con música de
fondo del video del Lamborghini.

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
