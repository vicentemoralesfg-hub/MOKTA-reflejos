# Modelo de frenado — Propuesta B (verificado)

**Es una estimación, no una medición.** Sirve para mostrar cómo cambia el resultado con la velocidad;
no mide los reflejos del espectador ni predice un frenado real.

## Supuestos
- La barrera aparece a **90 m**. El tiempo de reacción `t` es el instante de la pausa.
- Durante `t` el auto mantiene la velocidad → **distancia de reacción** `dr = v·t`.
- Luego frena con desaceleración **constante de 0,8 g** (7,848 m/s²) → **distancia de frenado** `df = v²/(2a)`.
- **Distancia total de detención** `dt = dr + df`.
- Si `dt ≤ 90 m` se detiene y sobran `90 − dt` m. Si no, **velocidad de impacto estimada** `√(v² − 2a(90 − dr))`.

## Lo que el modelo NO incluye (todas hacen el resultado real peor, salvo la frenada)
- Tiempo de respuesta del sistema de frenos (~0,1–0,3 s hasta la desaceleración plena).
- Pausar ≠ frenar: frenar exige mover el pie; ante un imprevisto real la reacción típica es mayor (Green, 2000: ≈0,7–0,75 s esperado, ≈1,25 s inesperado, ≈1,5 s sorpresa).
- Latencia del teléfono y de la app al pausar.
- Pendiente, estado de neumáticos y calzada. Un auto moderno en prueba frena ≈1,0 g; 0,8 g es un valor conservador habitual.

Verificación cruzada: `python3 scripts/modelo_frenado.py --check` compara 183 casos contra `src/physics.ts` (0 diferencias).

Modelo: D = 90 m · a = 0,8 g = 7,848 m/s² · 30 fps

## Constantes por velocidad

| km/h | m/s | m por fotograma | frenado df | tiempo hasta la barrera sin frenar | ventana (fotogramas) | último instante para detenerse |
|---|---|---|---|---|---|---|
| 120 | 33,33 | 1,11 m | 70,8 m | 2,700 s | 81,0 | 0,576 s (17,3 fot.) |
| 160 | 44,44 | 1,48 m | 125,8 m | 2,025 s | 60,8 | imposible: df > 90 m (faltan 35,8 m con reacción 0) |
| 210 | 58,33 | 1,94 m | 216,8 m | 1,543 s | 46,3 | imposible: df > 90 m (faltan 126,8 m con reacción 0) |

## 120 km/h

| reacción | dist. reacción | dist. frenado | dist. total | resultado |
|---|---|---|---|---|
| 0,00 s | 0,0 m | 70,8 m | 70,8 m | se detiene, sobran 19,2 m |
| 0,30 s | 10,0 m | 70,8 m | 80,8 m | se detiene, sobran 9,2 m |
| 0,50 s | 16,7 m | 70,8 m | 87,5 m | se detiene, sobran 2,5 m |
| 0,58 s | 19,3 m | 70,8 m | 90,1 m | impacto ≈ 5 km/h |
| 0,75 s | 25,0 m | 70,8 m | 95,8 m | impacto ≈ 34 km/h |
| 1,00 s | 33,3 m | 70,8 m | 104,1 m | impacto ≈ 54 km/h |
| 1,25 s | 41,7 m | 70,8 m | 112,5 m | impacto ≈ 68 km/h |
| 1,50 s | 50,0 m | 70,8 m | 120,8 m | impacto ≈ 79 km/h |

## 160 km/h

| reacción | dist. reacción | dist. frenado | dist. total | resultado |
|---|---|---|---|---|
| 0,00 s | 0,0 m | 125,8 m | 125,8 m | impacto ≈ 85 km/h |
| 0,30 s | 13,3 m | 125,8 m | 139,2 m | impacto ≈ 100 km/h |
| 0,50 s | 22,2 m | 125,8 m | 148,1 m | impacto ≈ 109 km/h |
| 0,58 s | 25,8 m | 125,8 m | 151,6 m | impacto ≈ 112 km/h |
| 0,75 s | 33,3 m | 125,8 m | 159,2 m | impacto ≈ 119 km/h |
| 1,00 s | 44,4 m | 125,8 m | 170,3 m | impacto ≈ 128 km/h |
| 1,25 s | 55,6 m | 125,8 m | 181,4 m | impacto ≈ 136 km/h |
| 1,50 s | 66,7 m | 125,8 m | 192,5 m | impacto ≈ 144 km/h |

## 210 km/h

| reacción | dist. reacción | dist. frenado | dist. total | resultado |
|---|---|---|---|---|
| 0,00 s | 0,0 m | 216,8 m | 216,8 m | impacto ≈ 161 km/h |
| 0,30 s | 17,5 m | 216,8 m | 234,3 m | impacto ≈ 171 km/h |
| 0,50 s | 29,2 m | 216,8 m | 246,0 m | impacto ≈ 178 km/h |
| 0,58 s | 33,8 m | 216,8 m | 250,6 m | impacto ≈ 181 km/h |
| 0,75 s | 43,8 m | 216,8 m | 260,5 m | impacto ≈ 186 km/h |
| 1,00 s | 58,3 m | 216,8 m | 275,1 m | impacto ≈ 194 km/h |
| 1,25 s | 72,9 m | 216,8 m | 289,7 m | impacto ≈ 202 km/h |
| 1,50 s | 87,5 m | 216,8 m | 304,3 m | impacto ≈ 209 km/h |

## Sensibilidad (reacción 0,5 s)

| desaceleración | 120 | 160 | 210 |
|---|---|---|---|
| 0,7 g | ≈ 37 km/h | ≈ 116 km/h | ≈ 182 km/h |
| 0,8 g | sobran 2,5 m | ≈ 109 km/h | ≈ 178 km/h |
| 0,9 g | sobran 10,4 m | ≈ 100 km/h | ≈ 174 km/h |
| 1,0 g | sobran 16,7 m | ≈ 91 km/h | ≈ 169 km/h |

Detenerse a 160 km/h en 90 m con reacción 0 exige ≥ 1,12 g.
Relación de distancias de frenado 210/120 = (210/120)² = 3,062 (independiente de a).
