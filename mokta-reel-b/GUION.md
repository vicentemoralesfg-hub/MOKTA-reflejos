# MOKTA · Test de reflejos — Guion de la voz

Duración total: **84.3 s** (2528 fotogramas a 30 fps). Tono: cercano, rápido y con intención; tuteo neutro.
Regla de oro: la voz **calla** antes y durante cada barrera (el silencio es parte del juego) y nunca anuncia cuándo aparece.

## GANCHO — desde 00:00.0

| Tiempo | Voz (se dice) | Subtítulo (se ve) | Máx. |
|---|---|---|---|
| 00:00.2 | Vas de noche a ciento veinte… y de pronto, aparece esto. | Vas de noche a 120… y de pronto, aparece esto. | 3.5 s |
| 00:04.1 | Cuando la veas, pausa el video. Pausar es frenar. | Cuando la veas, pausa el video. Pausar es frenar. | 3.1 s |
| 00:07.5 | Tres rondas. Cada una, más rápida. | Tres rondas. Cada una, más rápida. | 2.3 s |

## RONDA 1 · 120 km/h — desde 00:10.3

| Tiempo | Voz (se dice) | Subtítulo (se ve) | Máx. |
|---|---|---|---|
| 00:10.7 | Ronda uno: ciento veinte. | *(ya escrito en pantalla)* | 1.7 s |
| 00:12.7 | Ojos en la carretera… y el dedo listo. | Ojos en la carretera… y el dedo listo. | 2.2 s |
| 00:17.4 | *(silencio · aparece la barrera · solo motor y carretera)* | | |
| 00:20.1 | *(impacto · corte a negro)* | | |
| 00:20.7 | Tenías cincuenta y ocho centésimas de segundo para frenar a tiempo. | Tenías 0,58 de segundo para frenar a tiempo. | 3.2 s |
| 00:24.2 | Si pausaste después, mira la escala: a esa velocidad chocaste. | Si pausaste después, mira la escala: a esa velocidad chocaste. | 3.5 s |

## RONDA 2 · 160 km/h — desde 00:28.5

| Tiempo | Voz (se dice) | Subtítulo (se ve) | Máx. |
|---|---|---|---|
| 00:28.8 | Ronda dos: ciento sesenta. | *(ya escrito en pantalla)* | 1.9 s |
| 00:31.0 | Solo cuarenta más. ¿Qué tanto puede cambiar? | Solo 40 más. ¿Qué tanto puede cambiar? | 2.3 s |
| 00:35.9 | *(silencio · aparece la barrera · solo motor y carretera)* | | |
| 00:38.0 | *(impacto · corte a negro)* | | |
| 00:38.6 | Todo. Aunque frenaras al instante, chocabas a ochenta y cinco. | Todo. Aunque frenaras al instante, chocabas a 85. | 3.4 s |
| 00:42.4 | A ciento sesenta, frenar toma ciento veintiséis metros. La barrera estaba a noventa. | A 160, frenar toma 126 metros. La barrera estaba a 90. | 4.8 s |

## RONDA FINAL · 210 km/h — desde 00:47.8

| Tiempo | Voz (se dice) | Subtítulo (se ve) | Máx. |
|---|---|---|---|
| 00:48.1 | Ronda final: doscientos diez. | *(ya escrito en pantalla)* | 1.9 s |
| 00:50.3 | Último intento. | Último intento. | 0.8 s |
| 00:52.5 | *(silencio · aparece la barrera · solo motor y carretera)* | | |
| 00:54.1 | *(impacto · corte a negro)* | | |
| 00:54.8 | Ni con reflejos perfectos: impacto a más de ciento sesenta. | Ni con reflejos perfectos: impacto a más de 160. | 3.7 s |
| 00:58.7 | A esta velocidad, reaccionar rápido ya casi no te salva. | A esta velocidad, reaccionar rápido ya casi no te salva. | 3.1 s |

## CIERRE · LA FÍSICA — desde 01:02.5

| Tiempo | Voz (se dice) | Subtítulo (se ve) | Máx. |
|---|---|---|---|
| 01:02.8 | Misma barrera. Misma distancia. Solo cambió la velocidad. | *(ya escrito en pantalla)* | 3.4 s |
| 01:06.5 | Y la distancia para frenar crece con el cuadrado de la velocidad. | Y la distancia para frenar crece con el cuadrado de la velocidad. | 3.1 s |
| 01:09.9 | setenta y cinco por ciento más rápido… el triple de distancia. | 75% más rápido… el triple de distancia. | 3.6 s |
| 01:13.8 | Y eso, sin contar tu reacción. La física no negocia. | Y eso, sin contar tu reacción. La física no negocia. | 3.5 s |

## LLAMADO A LA ACCIÓN — desde 01:17.9

| Tiempo | Voz (se dice) | Subtítulo (se ve) | Máx. |
|---|---|---|---|
| 01:18.2 | ¿A cuántos kilómetros por hora chocaste en la ronda final? Coméntalo. | *(ya escrito en pantalla)* | 3.1 s |
| 01:21.6 | Y mándaselo a quien maneja rápido. | *(ya escrito en pantalla)* | 1.9 s |

## Guía de grabación

- Graba cada frase como archivo separado `public/audio/voz/<ID>.wav` (mono, 48 kHz, sin música, 0,1 s de aire al inicio y final).
- La columna *Máx.* es la duración de la voz guía: puedes ir un poco más rápido; si vas más lento, `plan_guion.py` reacomoda todo solo.
- Después de grabar: `python3 scripts/plan_guion.py` → `gen_seams_reel.py` → `audio_reel.py` → render (ver README).
- Fuente actual de cada frase: H1 (grabación), H2 (grabación), H3 (grabación), R1a (grabación), R1b (grabación), R1c (grabación), R1d (grabación), R2a (grabación), R2b (grabación), R2c (grabación), R2d (grabación), R3a (grabación), R3b (grabación), R3c (grabación), R3d (grabación), V1 (grabación), V2 (grabación), V3 (grabación), V4 (grabación), C1 (grabación), C2 (grabación).
