# MOKTA · ¿Qué auto es? (Remotion)

Reel vertical 1080×1920 · 30 fps · H.264 + AAC · ≈41,5 s.

Juego de 3 rondas: aparecen dos autos (A y B), suena un motor real y el espectador elige.
Cuenta 3‑2‑1, se encierra la opción correcta con un trazo a mano + check y suena el "correct".

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

## Voz (ElevenLabs, mínimo de créditos)

Una sola generación (1 toma, 138 créditos, voz "Mauricio Viral", `eleven_multilingual_v2`) con todas las frases
separadas por pausas; luego se cortó por silencios en `public/voz/`:
`hook` · `ronda1` · `ronda2` · `ronda3` · `ab` ("¿A o B?", reutilizada en las 3 rondas) · `cta`.
ElevenLabs se usó solo para la voz.

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
