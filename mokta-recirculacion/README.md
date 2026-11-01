# MOKTA · El botón que usas al revés (Remotion)

Reel vertical 1080×1920 · 30 fps · H.264 + AAC · 43 s.
Tema: el botón de recirculación de aire y cómo desempañar el auto al tiro.

**Video final:** `entrega/MOKTA_BotonRecirculacion_v1.mp4` · portada: `entrega/portada.jpg`

## Guion (texto en pantalla, pensado para verse sin sonido)

| Tiempo | Escena | Qué pasa |
|---|---|---|
| 0,0–4,5 s | **Gancho** | Fotograma 0 = portada: "EL 90% USA ESTE BOTÓN" + botón de recirculación + "AL REVÉS" **de cabeza**, que gira y queda derecho. El vidrio se empaña detrás. Luego: "Un hábito de 2 segundos que… te empaña los vidrios / te quema bencina". |
| 4,5–8,5 s | **Qué es** | "Se llama RECIRCULACIÓN". Corte del auto: la toma de aire exterior se cierra (✕) y el aire empieza a dar vueltas dentro de la cabina. Aviso abajo: "Al final: cómo desempañar al tiro" (abre la curiosidad hasta el final). |
| 8,5–15,5 s | **Error #1 · Invierno** | "La prendes para no pasar frío" (clic, LED encendido) → la respiración suelta vapor de agua, queda atrapado y viaja a los vidrios; el medidor de humedad sube → vista del conductor: el parabrisas se empaña. "Y SE EMPAÑA". "Y sube el CO₂: da sueño". |
| 15,5–22,5 s | **Error #2 · Verano** | A/C prendido y la recirculación APAGADA → el compresor enfría aire caliente de afuera sin parar (aguja de esfuerzo en rojo) → "Más esfuerzo = MÁS BENCINA" (la aguja del estanque cae). |
| 22,5–29,5 s | **La regla** | "LO ESTÁS USANDO AL REVÉS" (vuelve a girar). Frío o lluvia → aire de afuera. Calor → recirculación. Notas: ventilar primero si el auto estuvo al sol; renovar el aire cada cierto rato. |
| 29,5–39,5 s | **Desempañar al tiro** | 4 pasos sobre un panel real; el vidrio se limpia de abajo hacia arriba con cada paso: 1 modo parabrisas · 2 A/C prendido (aunque sea invierno: seca el aire) · 3 recirculación apagada · 4 ventilador al máximo y temperatura caliente. "LISTO" + luneta trasera (botón del rectángulo). |
| 39,5–43,0 s | **Cierre** | "¿Lo usabas al revés?" · Comenta SÍ o NO · Guárdalo para el próximo día de lluvia · Mándaselo a quien anda todo empañado · MOKTA. |

Retención: algo cambia cada 1–2 s (golpe de texto, clic, corte, gráfico), cada escena entra con un "punch-in",
hay un bucle abierto ("Al final: cómo desempañar al tiro") desde el segundo 4,5, y el cierre vuelve a enganchar con el gancho al repetirse.

## Base técnica (lo que afirma el video)

- **Recirculación** cierra la toma de aire exterior y recircula el aire de la cabina.
- **Invierno / lluvia:** la respiración agrega vapor de agua; con la toma cerrada la humedad se acumula y se condensa en el vidrio frío. También sube el CO₂ de la cabina (somnolencia). Solución: aire de afuera.
- **Verano con A/C:** enfriar aire exterior caliente exige más al compresor (que mueve el motor) que volver a enfriar el aire ya frío de la cabina → más consumo. Solución: recirculación, ventilando primero si el auto estuvo al sol y renovando el aire cada cierto rato.
- **Desempañar:** modo parabrisas + A/C (el evaporador condensa la humedad y entrega aire seco, también con calefacción) + aire exterior + ventilador alto y temperatura caliente. La luneta trasera usa una resistencia eléctrica (botón del rectángulo).
- El **"90%"** es la cifra editorial del gancho pedida para el reel, no un dato de un estudio. Se cambia en `src/config.ts` (`hookTop`).
- "33°" afuera (verano) es un ejemplo ilustrativo.

## Texto sugerido para publicar

> ¿Tu auto se empaña cada vez que llueve? 👀 Probablemente estás usando este botón al revés.
> Frío o lluvia → aire de afuera. Calor → recirculación. Y para desempañar al tiro: modo parabrisas + A/C + recirculación apagada + ventilador al máximo.
> Guárdalo para el próximo día de lluvia 🌧️ y mándaselo a quien anda todo empañado.
>
> #autos #tipsdeautos #conducir #chile #mantencion #aireacondicionado #desempañar #mokta

## Volver a renderizar

```bash
npm i
python3 scripts/gen_audio.py       # regenera la pista (solo si cambias tiempos o efectos) — requiere numpy + scipy
npx remotion studio                # vista previa (composición "MoktaRecirculacion", escenas sueltas en "Escenas")
./scripts/render.sh                # video sin audio → out/video_only.mp4
./scripts/assemble.sh              # + audio normalizado −14 LUFS → out/MOKTA_BotonRecirculacion_v1.mp4
node scripts/stills.mjs out/stills 0 300 900   # fotogramas sueltos para revisar (a media resolución)
```

En una máquina normal Remotion descarga su propio Chrome; en el servidor de render se usa el Chrome headless
local mediante la variable `REMOTION_CHROME`.

## Dónde se cambia cada cosa

| Qué | Archivo |
|---|---|
| Duración de escenas, instantes de cada golpe ("beats") y efectos de sonido ("cues") | `src/timeline.json` |
| Textos, colores, tipografías | `src/config.ts` |
| Escenas | `src/scenes/` (Hook, Define, Winter, Summer, Rule, Recipe, Cta) |
| Botón del panel, perillas, indicadores, íconos | `src/components/HvacButton.tsx`, `Gauges.tsx`, `Icons.tsx` |
| Parabrisas (ciudad de noche con lluvia, empañado y desempañado) | `src/components/Windshield.tsx` |
| Corte del auto con el recorrido del aire y el vapor | `src/components/CarSection.tsx` |
| Animaciones de texto, fondos, grano | `src/components/Kinetic.tsx` |
| Música y efectos (100 % sintetizados, sin licencias de terceros) | `scripts/gen_audio.py` → `public/audio/` |

Si cambias `timeline.json`, vuelve a ejecutar `gen_audio.py`: video y audio leen el mismo archivo.
La música va a 120 BPM (1 pulso = 15 fotogramas) y todas las escenas empiezan en un pulso.

## Locución (opcional)

El reel funciona sin voz. Si quieres agregar locución, este guion calza con las escenas
(se intentó generar con ElevenLabs, voz chilena "Cristian Cornejo", pero la cuenta no tenía créditos suficientes):

> ¿Ves este botón? El 90% lo usa AL REVÉS… y ese error de dos segundos te empaña los vidrios y te quema bencina.
> Es la recirculación: el auto deja de tomar aire de afuera y respira el suyo.
> En invierno la prendes para no pasar frío. Pero cada vez que respiras, sueltas vapor de agua, que se queda adentro, toca el vidrio frío… y lo empaña.
> En verano, al revés: la apagas con el aire acondicionado prendido, y el compresor tiene que enfriar aire caliente de afuera sin parar. Más esfuerzo, más bencina.
> La regla: frío o lluvia, aire de afuera. Calor, recirculación.
> ¿Y para desempañar al tiro? Uno: modo parabrisas. Dos: aire acondicionado prendido, aunque sea invierno, porque quita la humedad. Tres: recirculación apagada. Cuatro: ventilador al máximo, con calor.
> Guárdalo, y mándaselo a quien anda con los vidrios empañados.
