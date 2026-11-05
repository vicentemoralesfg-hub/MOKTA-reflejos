# MOKTA · El kilometraje engaña (Remotion)

Reel vertical 1080×1920 · 30 fps · H.264 + AAC · 58,2 s · locución ElevenLabs (voz «Mario», `tomkxGQGz4b1kE0EM722`, modelo `eleven_v4`).

**Idea:** un auto con 80.000 km puede estar mucho más gastado que uno con 200.000. El odómetro cuenta vueltas de rueda,
no horas de motor ni cómo se manejó el auto.

## Guion (locución)

| Escena | Tiempo | Locución | En pantalla |
|---|---|---|---|
| Gancho | 0,0 s | «Si estás por comprar un auto, elegir el con menos kilómetros puede ser tu peor error financiero.» | «¿MENOS KM = MEJOR AUTO?» desde el primer fotograma, odómetro que gira hasta 80.000, «POCOS KM ✓» → timbre **ERROR FINANCIERO** y «✕ TRAMPA» |
| Comparación | 5,0 s | «Mismo modelo, mismo año. Uno con 80 mil kilómetros… y otro con 200 mil. ¿Cuál te llevas?» | Dos autos idénticos, odómetros 80.000 / 200.000, «= MISMO MODELO / = MISMO AÑO», «?» y toque sobre el auto A |
| Revelación | 10,9 s | «Porque el de 80 mil… está MUCHO más gastado.» | Escáner de rayos X sobre el auto A: motor, embrague y frenos en rojo; medidor a CRÍTICO; timbre **MUCHO MÁS GASTADO** |
| Odómetro | 14,2 s | «El odómetro cuenta vueltas de rueda, no horas de motor.» | Rueda ✓ vs. horas de motor ✕ |
| Taco | 17,1 s | «Este auto vivió en el taco, y Ford calcula que una hora en ralentí equivale a unos 50 kilómetros de uso del motor.» | Taco visto desde arriba, reloj 0:00 → 1:00 h, tarjeta «Odómetro +0 km / Uso del motor ≈50 km» con la referencia |
| Ciudad | 23,1 s | «Trayectos cortos, frenos y embrague todo el día, y un motor que casi nunca llega a su temperatura.» | Medidor de desgaste del auto A subiendo + 3 causas |
| Hábitos | 28,3 s | «Además, su dueño aceleraba en frío, pasaba rápido los lomos de toro y se saltaba las mantenciones.» | 3 causas más, medidor a CRÍTICO con alarma |
| Carretera | 33,4 s | «El de 200 mil hizo carretera: motor caliente, velocidad constante, casi sin frenar… y aceite cambiado a tiempo.» | Autopista con cordillera, auto B, desgaste BAJO + 4 ✓ |
| Veredicto | 40,0 s | «Son los kilómetros que menos desgastan.» | «MÁS KM ≠ MÁS DESGASTE», comparación A (crítico) vs. B (bajo) |
| Checklist | 42,0 s | «Antes de comprar, revisa cuatro cosas: historial de mantenciones, desgaste de volante, pedales y asiento, arranque en frío… y un escáner con un mecánico de confianza.» | «REVISA ESTO 0/4 → 4/4», cada tarjeta se marca al nombrarla |
| Verdad | 50,9 s | «Porque el kilometraje dice cuánto anduvo un auto… no cómo lo trataron.» | Frase final + odómetro descontrolado + «Compra el auto, no el número.» |
| CTA | 54,8 s | «Guarda este video para tu próxima compra.» | Ícono de guardar que se rellena, «y mándaselo a quien esté buscando auto», MOKTA |

### Recursos de retención usados
- Pregunta en pantalla desde el fotograma 0 y voz desde el primer instante (sin intro).
- Trampa → giro: el espectador elige el auto «obvio» y a los 11 s se le demuestra lo contrario.
- Un corte o evento visual cada 1–3 s, subtítulos palabra a palabra (funciona sin sonido), barras que se llenan y
  contador 0/4 → 4/4 (bucles abiertos que piden ver el final).
- Música con «drop» exactamente en el corte de la revelación, silencio de tensión antes de «MUCHO» y antes de «NO cómo».

### Datos y precisión
- «1 hora en ralentí ≈ 50 km»: referencia de mantención que Ford usa en vehículos con medidor de horas de motor
  (≈33 millas = 53 km por hora de ralentí). Se cita en pantalla como referencia de Ford; es una regla de mantención,
  no una medición de laboratorio.
- Los medidores de «desgaste real» son una escala cualitativa (bajo / medio / alto / crítico) e ilustrativa: no se
  inventan porcentajes. El veredicto lo indica en pantalla («Escala ilustrativa»).
- Los autos son dibujos genéricos (sin marca ni modelo real).

## Volver a renderizar

```bash
npm i
pip install numpy scipy               # para el audio
python3 scripts/build_timeline.py     # tiempos (escenas, subtítulos, marcas) desde la locución
./scripts/prepare_voice.sh            # voz: +8 % de velocidad sin cambiar tono, EQ y compresión
python3 scripts/gen_audio.py          # música + efectos + mezcla + masterización (-14 LUFS)
npx remotion studio                   # vista previa
./scripts/render.sh                   # MP4 final en out/MOKTA_KilometrajeEngana_v1.mp4
```

En un servidor sin descarga de Chrome: `REMOTION_CHROME=/ruta/a/chrome-headless-shell ./scripts/render.sh`.
`node scripts/stills.mjs auto` exporta 3 fotogramas de control por escena a `out/stills/`.

## Dónde se cambia cada cosa

| Qué | Archivo |
|---|---|
| Locución original y marcas por palabra (ElevenLabs) | `voz/` |
| Inicio de escenas, palabras que disparan animaciones, colores de énfasis de subtítulos | `scripts/build_timeline.py` → `src/data/timeline.json` |
| Colores, tipografías | `src/config.ts` |
| Escenas | `src/scenes/` |
| Odómetro, autos (perfil, rayos X, trasera), íconos, medidor, subtítulos | `src/components/` |
| Música y efectos (100 % sintetizados, sin licencias de terceros) | `scripts/gen_audio.py` → `public/audio/` |

Si cambias la locución: reemplaza `voz/locucion_elevenlabs.mp3` y `voz/palabras_elevenlabs.json` y vuelve a ejecutar
los cuatro primeros comandos. Video y audio leen el mismo `timeline.json`.

## Texto sugerido para la publicación

> ¿80.000 km o 200.000 km? 🤔 El número del odómetro no te dice cómo trataron el auto.
> Antes de comprar, revisa estas 4 cosas 👇
> 1️⃣ Historial de mantenciones  2️⃣ Volante, pedales y asiento  3️⃣ Arranque en frío  4️⃣ Escáner + mecánico de confianza
> Guárdalo para tu próxima compra y mándaselo a quien esté buscando auto.
>
> #autosusados #comprarauto #kilometraje #mecanica #autoschile #consejosautomotrices #mokta
