# MOKTA · Autos chocados: ¿oportunidad o trampa? (Remotion)

Reel vertical 1080×1920 · 30 fps · H.264 + AAC · ≈ 1 min 57 s.
Cómo distinguir qué autos chocados conviene comprar para reparar y revender en Chile, y cuáles son una pésima inversión.

## Estructura del video

| # | Escena | Qué muestra |
|---|---|---|
| 1 | Gancho | «¿Por qué este auto chocado que parece basura vale más oro que uno que está impecable?» — dos autos al mismo precio, cara a cara |
| 2 | Planteamiento | Remate → reparar → vender: millones o pérdida. «No es cuánto daño se ve, es DÓNDE está» + semáforo verde/amarillo/rojo |
| 3 | Zona verde | Puertas, parachoques, tapabarros, focos: piezas apernadas, antes/después, repuestos usados con precio, estructura intacta en rayos X |
| 4 | Zona amarilla | Choque frontal animado: la onda de choque recorre parachoques → radiador → soportes → larguero; bancada y medición; presupuesto que explota |
| 5 | Zona roja | Piso del maletero arrugado bajo la alfombra, pilar doblado, jaula de seguridad, volcamiento |
| 6 | Airbags | Despliegue + boleta: bolsas, módulo SRS, sensores, pretensores, tablero → $2–4 millones |
| 7 | Inundado | Impecable por fuera; agua, cortocircuito y corrosión por dentro; 3 señales para detectarlo |
| 8 | Comparación económica | Dos autos de $4.500.000: el «feo» deja +$1.550.000; el «impecable» pierde −$4.050.000 |
| 9 | Checklist | Escáner, cotizar repuestos reales, medir carrocería, calcular la reventa con descuento por choque |
| 10 | Regla y cierre | «Si se aperna, es oportunidad. Si se suelda, se infla o se moja… es trampa.» + CTA |

Cifras ilustrativas en CLP (se indica en pantalla); varían según modelo, año, repuestos y taller.

## Audio

- **Voz:** ElevenLabs, voz `Tm8bVnJtlhPQUOb8KzSd` («Fernando – Chileno»), modelo `eleven_v4`, un bloque por escena (`assets/vo_raw`, no versionado).
  `scripts/process_vo.py` elige la toma, recorta pausas largas y acelera ×1,10 sin cambiar el tono → `public/audio/vo/`.
  Los tiempos por palabra (Whisper local) se alinean al guion exacto con `scripts/build_words.py` → `src/data/vo.json`
  (subtítulos y sincronía de todas las animaciones).
- **Efectos y música:** diseñados por **Qwen3** (pesos abiertos, ejecutado localmente en CPU).
  `scripts/qwen_sfx_design.py` pide a `Qwen/Qwen3-1.7B` una *receta de síntesis* en JSON para cada uno de los 18 efectos
  (capas, barridos de frecuencia, envolventes, filtros, saturación, repeticiones).
  `scripts/qwen_music_pick.py` pide a `Qwen/Qwen3-4B-Instruct-2507` varios patrones de batería/bajo/acordes y guarda el que
  mejor cumple las reglas del prompt. Todo queda en `assets/sfx_recipes.json`.
  `scripts/render_sfx.py` sintetiza esas recetas (valores acotados a rangos seguros) → `public/audio/sfx/`.
- **Mezcla:** `scripts/mix_audio.py` coloca voz, efectos (`src/data/sfx.json`) y música con *ducking* bajo la voz → `public/audio/soundtrack.wav`.
  `scripts/assemble.sh` normaliza a −14 LUFS / −1 dBTP.

## Volver a renderizar

```bash
npm i
npx remotion studio                          # vista previa (composición AutosChocados + escenas sueltas)
python3 scripts/qwen_sfx_design.py <modelo>  # (opcional) volver a diseñar efectos con Qwen3
python3 scripts/render_sfx.py                # si cambian las recetas
python3 scripts/mix_audio.py                 # si cambian tiempos o efectos
./scripts/render_chunks.sh                   # render por bloques, reanudable (CONC=3 CH=150)
./scripts/assemble.sh                        # → out/MOKTA_AutosChocados_v1.mp4
```

## Dónde se cambia cada cosa

| Qué | Archivo |
|---|---|
| Inicio de la voz y cola de cada escena | `src/data/timeline.json` |
| Texto/tiempos de la locución | `src/data/vo.json` (generado) |
| Efectos sincronizados (por palabra o tiempo) | `src/data/sfx.json` |
| Auto ilustrado, daños, rayos X | `src/components/Car.tsx`, `presets.ts` |
| Cámara, mapa de zonas | `src/components/Stage.tsx` |
| Fondos, subtítulos, fichas, sellos, iconos | `src/components/` |
| Escenas | `src/scenes/S01…S10` |
| Colores y tipografías | `src/theme.ts` |
