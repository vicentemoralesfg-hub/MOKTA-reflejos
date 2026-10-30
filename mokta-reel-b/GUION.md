# MOKTA · Test de reflejos — Guion de la voz

Duración total: **80.0 s** (2400 fotogramas a 30 fps). Tono: cercano, rápido y con intención; tuteo neutro.
Regla de oro: la voz **calla** antes y durante cada barrera (el silencio es parte del juego) y nunca anuncia cuándo aparece.

## GANCHO — desde 00:00.0

| Tiempo | Voz (se dice) | Subtítulo (se ve) | Máx. |
|---|---|---|---|
| 00:00.2 | Vas de noche a ciento veinte… y de pronto, aparece esto. | Vas de noche a 120… y de pronto, aparece esto. | 2.9 s |
| 00:03.5 | Cuando la veas, pausa el video. Pausar es frenar. | Cuando la veas, pausa el video. Pausar es frenar. | 2.8 s |
| 00:06.5 | Tres rondas. Cada una, más rápida. | Tres rondas. Cada una, más rápida. | 2.2 s |

## RONDA 1 · 120 km/h — desde 00:09.3

| Tiempo | Voz (se dice) | Subtítulo (se ve) | Máx. |
|---|---|---|---|
| 00:09.6 | Ronda uno: ciento veinte. | *(ya escrito en pantalla)* | 1.3 s |
| 00:11.2 | Ojos en la carretera… y el dedo listo. | Ojos en la carretera… y el dedo listo. | 1.8 s |
| 00:15.5 | *(silencio · aparece la barrera · solo motor y carretera)* | | |
| 00:18.2 | *(impacto · corte a negro)* | | |
| 00:18.9 | Tenías cincuenta y ocho centésimas de segundo para frenar a tiempo. | Tenías 0,58 de segundo para frenar a tiempo. | 3.2 s |
| 00:22.3 | Si pausaste después, mira la escala: a esa velocidad chocaste. | Si pausaste después, mira la escala: a esa velocidad chocaste. | 3.4 s |

## RONDA 2 · 160 km/h — desde 00:26.4

| Tiempo | Voz (se dice) | Subtítulo (se ve) | Máx. |
|---|---|---|---|
| 00:26.7 | Ronda dos: ciento sesenta. | *(ya escrito en pantalla)* | 1.6 s |
| 00:28.6 | Solo cuarenta más. ¿Qué tanto puede cambiar? | Solo 40 más. ¿Qué tanto puede cambiar? | 2.5 s |
| 00:33.8 | *(silencio · aparece la barrera · solo motor y carretera)* | | |
| 00:35.8 | *(impacto · corte a negro)* | | |
| 00:36.5 | Todo. Aunque frenaras al instante, chocabas a ochenta y cinco. | Todo. Aunque frenaras al instante, chocabas a 85. | 3.2 s |
| 00:40.0 | A ciento sesenta, frenar toma ciento veintiséis metros. La barrera estaba a noventa. | A 160, frenar toma 126 metros. La barrera estaba a 90. | 4.3 s |

## RONDA FINAL · 210 km/h — desde 00:45.0

| Tiempo | Voz (se dice) | Subtítulo (se ve) | Máx. |
|---|---|---|---|
| 00:45.3 | Ronda final: doscientos diez. | *(ya escrito en pantalla)* | 1.7 s |
| 00:47.3 | Último intento. | Último intento. | 0.7 s |
| 00:49.4 | *(silencio · aparece la barrera · solo motor y carretera)* | | |
| 00:51.0 | *(impacto · corte a negro)* | | |
| 00:51.6 | Ni con reflejos perfectos: impacto a más de ciento sesenta. | Ni con reflejos perfectos: impacto a más de 160. | 3.3 s |
| 00:55.3 | A esta velocidad, reaccionar rápido ya casi no te salva. | A esta velocidad, reaccionar rápido ya casi no te salva. | 2.8 s |

## CIERRE · LA FÍSICA — desde 00:58.8

| Tiempo | Voz (se dice) | Subtítulo (se ve) | Máx. |
|---|---|---|---|
| 00:59.1 | Misma barrera. Misma distancia. Solo cambió la velocidad. | *(ya escrito en pantalla)* | 3.4 s |
| 01:02.8 | Y la distancia para frenar crece con el cuadrado de la velocidad. | Y la distancia para frenar crece con el cuadrado de la velocidad. | 3.1 s |
| 01:06.2 | setenta y cinco por ciento más rápido… el triple de distancia. | 75% más rápido… el triple de distancia. | 3.3 s |
| 01:09.8 | Y eso, sin contar tu reacción. La física no negocia. | Y eso, sin contar tu reacción. La física no negocia. | 3.1 s |

## LLAMADO A LA ACCIÓN — desde 01:13.5

| Tiempo | Voz (se dice) | Subtítulo (se ve) | Máx. |
|---|---|---|---|
| 01:13.8 | ¿A cuántos kilómetros por hora chocaste en la ronda final? Coméntalo. | *(ya escrito en pantalla)* | 3.5 s |
| 01:17.6 | Y mándaselo a quien maneja rápido. | *(ya escrito en pantalla)* | 1.5 s |

## Guía de grabación

- Graba cada frase como archivo separado `public/audio/voz/<ID>.wav` (mono, 48 kHz, sin música, 0,1 s de aire al inicio y final).
- La columna *Máx.* es la duración de la voz guía: puedes ir un poco más rápido; si vas más lento, `plan_guion.py` reacomoda todo solo.
- Después de grabar: `python3 scripts/plan_guion.py` → `gen_seams_reel.py` → `audio_reel.py` → render (ver README).
- Fuente actual de cada frase: H1 (voz guía), H2 (voz guía), H3 (voz guía), R1a (voz guía), R1b (voz guía), R1c (voz guía), R1d (voz guía), R2a (voz guía), R2b (voz guía), R2c (voz guía), R2d (voz guía), R3a (voz guía), R3b (voz guía), R3c (voz guía), R3d (voz guía), V1 (voz guía), V2 (voz guía), V3 (voz guía), V4 (voz guía), C1 (voz guía), C2 (voz guía).
