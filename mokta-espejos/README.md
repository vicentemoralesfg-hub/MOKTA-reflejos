# MOKTA · El error de los espejos (Remotion)

Reel vertical 1080×1920 · 30 fps · H.264 + AAC · ≈52 s · locución ElevenLabs (voz `l1zE9xgNpUTaQCZzpNJa`, "Alberto Rodriguez").

Entrega final: `entrega/MOKTA_Espejos_v1.mp4`.

## Guion (locución)

> Si ves tu auto en este espejo, estás cometiendo el mismo error que el 95% de las personas.
> Ese pedazo de auto que ves ahí es espacio perdido... tu auto no se va a ir a ninguna parte.
> Con el espejo así, ves casi lo mismo que en el retrovisor central. Y a los costados quedan dos puntos ciegos.
> Ahí cabe un auto completo. Te cambias de pista... y no lo viste.
> La solución toma 10 segundos.
> Apoya la cabeza en la ventana y abre el espejo izquierdo hasta que apenas veas el costado de tu auto.
> Ahora inclínate hacia el centro y haz lo mismo con el derecho.
> Vuelve a tu posición: tu auto desaparece del espejo... y aparece la pista de al lado.
> Resultado: el auto que te adelanta pasa del retrovisor al espejo, y del espejo a tu vista, sin desaparecer nunca.
> Igual, antes de cambiarte de pista, mira sobre tu hombro.
> Mándale esto a alguien que todavía ve su auto en el espejo.

## Estructura del reel

| Tramo | Qué se ve | Recurso de retención |
|---|---|---|
| 0–6 s | Espejo lateral con un tercio ocupado por tu propio auto, contorno rojo, etiqueta "TU AUTO", contador 95 % | Portada con texto desde el fotograma 0, golpe de zoom, impacto sonoro |
| 6–11 s | Zoom al costado del auto: "ESPACIO PERDIDO", "≈ 1/3 DEL ESPEJO", alfiler "SIGUE AHÍ" | Humor breve, cambio de encuadre |
| 11–17 s | Vista cenital: los conos de los espejos se superponen con el central ("VEN CASI LO MISMO") y aparecen 2 puntos ciegos | Diagrama que explica el porqué |
| 17–22 s | Un auto se esconde en el punto ciego, cambio de pista, bocinazo, "!" | Tensión, sacudida, corte de música |
| 22–24 s | "LA SOLUCIÓN · 10 SEGUNDOS" | Reinicio de ritmo |
| 24–33 s | Interior: paso 1 (cabeza en la ventana, espejo izquierdo) y paso 2 (cabeza al centro, espejo derecho), con la vista real de cada espejo | Tutorial guardable |
| 33–37 s | Espejo grande: tu auto desaparece y aparece la pista de al lado, miniatura "ANTES" | Antes/después |
| 37–44 s | Conos corregidos, sin puntos ciegos; un auto adelanta: RETROVISOR → ESPEJO → TU VISTA | Prueba visual del resultado |
| 44–47 s | Intermitente + mirada sobre el hombro | Seguridad / credibilidad |
| 47–52 s | CTA "¿CONOCES A ALGUIEN ASÍ? → ENVÍASELO" y "GUÁRDALO" | Compartidos y guardados |

Base técnica: método de ajuste para eliminar puntos ciegos (BGE, Platzer, SAE 950601, 1995):
cabeza contra la ventana → espejo izquierdo hasta apenas ver el costado; cabeza al centro → igual con el derecho.

## Volver a renderizar

```bash
npm i
npx remotion studio                          # vista previa (composición MoktaEspejos)
npx remotion render MoktaEspejos out/render_v1.mp4 --codec=h264 --crf=16 --audio-codec=aac --audio-bitrate=320k
scripts/master.sh out/render_v1.mp4 entrega/MOKTA_Espejos_v1.mp4   # −14 LUFS, BT.709, faststart
```

En un servidor sin Chrome de Remotion: `REMOTION_CHROME=/ruta/a/chrome-headless-shell`.

## Dónde se cambia cada cosa

| Qué | Archivo |
|---|---|
| Tiempos de todas las escenas y efectos (anclados a palabras de la locución) | `src/lib/timeline.ts` |
| Subtítulos (agrupación, colores de palabras clave) | `src/components/Captions.tsx` |
| Espejo lateral (reflejo, auto propio, auto en el punto ciego) | `src/components/SideMirror.tsx` |
| Vista cenital (carretera, conos de visión, puntos ciegos, cámara) | `src/components/TopDown.tsx`, `src/components/CarTop.tsx` |
| Escenas | `src/scenes/` (MirrorScenes, TopDownScene, Cards) |
| Mezcla de audio y efectos | `src/Reel.tsx` |
| Colores y tipografías | `src/config.ts` |

## Audio

- `source/locucion_toma1.mp3` + `source/locucion_toma1_palabras.json`: locución original (ElevenLabs eleven_v4) y tiempos por palabra (Scribe).
- `scripts/prep_voice.py` → `public/vo/voz.wav` y `src/vo.json`: acorta pausas largas y acelera ×1,10 (sin cambiar el tono) para ritmo de reel; recalcula los tiempos. Si se cambia la voz, volver a ejecutarlo: el montaje se reajusta solo.
- `public/music/musica.wav`: música instrumental generada con ElevenLabs Music.
- `public/sfx/`: efectos generados con ElevenLabs (whoosh, impacto, bocina, motor del espejo, pop, acierto, error).
