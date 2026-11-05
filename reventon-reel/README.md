# MOKTA · Reventón a alta velocidad (Remotion)

Reel vertical 1080×1920 · 30 fps · 60 s · H.264 + AAC.
Gancho: «Si se te revienta un neumático en plena carretera y tu primera reacción es frenar, podrías estar cometiendo un error que te puede costar la vida».

## Estructura narrativa

| Tiempo | Bloque | Qué se ve |
|---|---|---|
| 0–7 s | Gancho | Vista del conductor a 100 km/h → primer plano de la rueda que revienta (cámara lenta) → volante que tira → **FRENAR** → vista cenital: el auto se cruza → congelado **ERROR** |
| 7,9–18,4 s | Repetición | Rebobinado VHS → «Vas a 100…» → reventón + «¡Chuta!» del conductor → el auto tira a un lado → el pie va al freno → **FRENAR A FONDO** → el auto se cruza |
| 18,4–29 s | ¿Por qué? | Telestración cenital en cámara lenta: rueda reventada, se arrastra, tira hacia su lado, freno fuerte, peso hacia adelante, giro |
| 29–33,7 s | Segundo error | **EL VOLANTAZO**: el volante gira de golpe y el auto sale de su pista |
| 33,7–52 s | Revelación | «Entonces, ¿qué haces?» → 1 volante firme con las dos manos · 2 recto, sin movimientos bruscos · 3 suelta el acelerador y deja que pierda velocidad sola · freno suave, balizas, orillarse |
| 52–60 s | Cierre | «No es no frenar nunca. Es no frenar de golpe.» → «Guárdalo. Ojalá nunca lo necesites.» |

## Fuentes de seguridad (contenido)

Recomendaciones coincidentes de NHTSA, fabricantes de neumáticos y clubes automovilísticos ante un reventón:
sujetar el volante firme con ambas manos, no frenar de golpe, no dar volantazos, mantener el auto recto
corrigiendo con suavidad, soltar el acelerador gradualmente para que pierda velocidad, y solo con el auto
controlado frenar suave, encender las balizas y orillarse en un lugar seguro. No se usan cifras ni estadísticas.

## Audio

- **Voz**: ElevenLabs `eleven_v4`, voz `Tm8bVnJtlhPQUOb8KzSd` («Fernando – Chileno»), una sola toma de 957 caracteres
  (957 créditos de los 2.700 disponibles). Guion en `voz/guion.txt`, audio original en `voz/locucion_elevenlabs.mp3`.
- **Qwen3**:
  - `Qwen3-ASR-1.7B` verificó la locución palabra por palabra (`voz/asr.txt`) — coincide con el guion.
  - `Qwen3-ForcedAligner-0.6B` dio el tiempo de cada palabra (`src/words.json`): subtítulos, cortes y efectos se sincronizan con eso.
  - `Qwen3-TTS-12Hz-1.7B-VoiceDesign` generó la reacción del conductor («¡Chuta!», `voz/qwen_reaccion_2.wav`), verificada con Qwen3-ASR.
  - Qwen3 no tiene un modelo de efectos de sonido (solo voz/ASR), así que el reventón, golpeteo del neumático,
    chirridos, rebobinado, balizas, golpes, ambiente y música están **sintetizados** en `scripts/build_audio.py` (sin licencias de terceros).
- Mezcla: voz nivelada, efectos/ambiente/música con ducking bajo la voz; normalizado a −14 LUFS / −1 dBTP al ensamblar.

## Volver a generar

```bash
npm i
python3 scripts/build_timeline.py        # tiempos finales de cada palabra (requiere src/words.json)
python3 scripts/build_audio.py           # public/audio/mezcla.wav + stems
npx remotion studio                      # vista previa
npx remotion bundle src/index.ts --out-dir build
./scripts/render_chunks.sh               # render por bloques (reanudable)
./scripts/assemble.sh                    # out/MOKTA_Reventon_v1.mp4
```

Scripts Qwen3 (necesitan `pip install torch qwen-asr qwen-tts`): `scripts/align_voice.py`, `scripts/qwen_tts_reacciones.py`.

## Dónde se cambia cada cosa

| Qué | Archivo |
|---|---|
| Cortes y eventos (reventones, congelados, pasos) | `src/cues.json` |
| Pausas insertadas en la locución | `scripts/build_timeline.py` |
| Planos (escenario, tiempo, cámara, gráficos) | `src/Main.tsx` (`shotAt`) |
| Trayectorias del auto (frenar a fondo / volantazo / maniobra correcta) | `src/sim/car.ts` |
| Mundo 3D (autopista, auto, tránsito, humo, marcas) | `src/world/` |
| Subtítulos, cabina, títulos, telestración, pedales | `src/overlays/` |
| Diseño sonoro | `scripts/build_audio.py` |
