# MOKTA · El error de los espejos (Remotion)

Reel vertical 1080×1920 · 30 fps · H.264 + AAC · ≈52 s · locución ElevenLabs (voz `l1zE9xgNpUTaQCZzpNJa`, "Alberto Rodriguez").

Entrega final: `entrega/MOKTA_Espejos_v2.mp4` (51,97 s). La v1 queda en `entrega/MOKTA_Espejos_v1.mp4`.

## Guion (locución v2)

> Si ves tu auto en este espejo, estás cometiendo el mismo error que el 95% de las personas.
> Y ese error es peligroso: te cambias de carril... y chocas con un auto que nunca viste.
> ¿Cómo pasa? Ese pedazo de auto que ves en el espejo es espacio perdido. El espejo mira casi lo mismo que tu retrovisor central... y a tu lado queda un punto ciego donde cabe un auto completo.
> La solución toma 10 segundos.
> Apoya la cabeza en la ventana y abre el espejo izquierdo hasta que apenas veas el costado de tu auto.
> Luego inclínate hacia el centro y haz lo mismo con el derecho.
> Vuelve a tu posición: tu auto desaparece del espejo... y aparece el carril de al lado.
> Ahora, el auto que te adelanta pasa del retrovisor al espejo, y del espejo a tu vista, sin desaparecer nunca.
> Igual, antes de cambiarte de carril, mira sobre tu hombro.
> Mándale esto a alguien que todavía ve su auto en el espejo.

## Estructura del reel (v2)

| Tramo | Qué se ve | Recurso de retención |
|---|---|---|
| 0–6 s | La frase completa del gancho en pantalla desde el fotograma 0 ("SI VES TU AUTO EN ESTE ESPEJO" arriba, espejo al centro, "ESTÁS COMETIENDO EL MISMO ERROR QUE EL 95% DE LAS PERSONAS" abajo); cada palabra se marca al decirla | Portada legible, karaoke, sacudidas en "error" y "95%" |
| 6–11 s | Consecuencia: tu espejo dice "CARRIL LIBRE" mientras un auto va a tu lado ("NO LO VES"); intermitente, cambio de carril y choque "¡PUM!" → "NO ESTABA LIBRE" | Ironía visual, choque con sonido real, corte de música |
| 11–12,5 s | "◀◀ REBOBINA" hacia antes del choque | Bucle abierto: ¿cómo pasó? |
| 12,5–16 s | Zoom al espejo: "TU AUTO", "ESPACIO PERDIDO", "≈ 1/3 DEL ESPEJO" | Cambio de encuadre |
| 16–22,5 s | Vista cenital: los conos se superponen con el central ("VEN CASI LO MISMO"), "PUNTO CIEGO", el auto "INVISIBLE EN TU ESPEJO" | Explicación visual |
| 22,5–24,5 s | "LA SOLUCIÓN · 10 SEGUNDOS" | Reinicio de ritmo |
| 24,5–33,5 s | Paso 1 (cabeza en la ventana, espejo izquierdo) y paso 2 (cabeza al centro, espejo derecho) con la vista real de cada espejo | Tutorial guardable |
| 33,5–37,7 s | Espejo grande: tu auto desaparece y aparece el carril de al lado, miniatura "ANTES" | Antes/después |
| 37,7–44,6 s | Conos corregidos, sin puntos ciegos; un auto adelanta: RETROVISOR → ESPEJO → TU VISTA | Prueba del resultado |
| 44,6–47,9 s | Intermitente + mirada sobre el hombro | Seguridad |
| 47,9–52 s | "¿CONOCES A ALGUIEN ASÍ? → ENVÍASELO" y "GUÁRDALO" | Compartidos y guardados |

Base técnica: método de ajuste para eliminar puntos ciegos (BGE, Platzer, SAE 950601, 1995):
cabeza contra la ventana → espejo izquierdo hasta apenas ver el costado; cabeza al centro → igual con el derecho.

## Volver a renderizar

```bash
npm i
npx remotion studio                          # vista previa (composición MoktaEspejos)
npx remotion render MoktaEspejos out/render_v2.mp4 --codec=h264 --crf=16 --audio-codec=aac --audio-bitrate=320k
scripts/master.sh out/render_v2.mp4 entrega/MOKTA_Espejos_v2.mp4   # −14 LUFS, BT.709, faststart
```

En un servidor sin Chrome de Remotion: `REMOTION_CHROME=/ruta/a/chrome-headless-shell`.

## Dónde se cambia cada cosa

| Qué | Archivo |
|---|---|
| Tiempos de todas las escenas y efectos (anclados a palabras de la locución) | `src/lib/timeline.ts` |
| Subtítulos (agrupación, colores de palabras clave) | `src/components/Captions.tsx` |
| Espejo lateral (reflejo, auto propio, auto en el punto ciego) | `src/components/SideMirror.tsx` |
| Vista cenital (carretera, conos de visión, puntos ciegos, cámara) | `src/components/TopDown.tsx`, `src/components/CarTop.tsx` |
| Escenas | `src/scenes/` (HookScene, TopDownScene: choque/explicación/pasos/resultado, MirrorScenes, Cards) |
| Mezcla de audio y efectos | `src/Reel.tsx` |
| Colores y tipografías | `src/config.ts` |

## Audio

- `source/locucion_v2_toma1.mp3` + `source/locucion_v2_toma1_palabras.json`: locución v2 (ElevenLabs eleven_v4) y tiempos por palabra (Scribe). La v1 queda en `source/locucion_v1_*`.
- `scripts/prep_voice.py` → `public/vo/voz.wav` y `src/vo.json`: acorta pausas largas y acelera ×1,10 (sin cambiar el tono) para ritmo de reel; recalcula los tiempos. Si se cambia la voz, volver a ejecutarlo: el montaje se reajusta solo.
- `public/music/musica.wav`: música instrumental generada con ElevenLabs Music.
- `public/sfx/`: efectos generados con ElevenLabs (whoosh, impacto, choque, bocina, intermitente, rebobinado, motor del espejo, pop, acierto, error).
