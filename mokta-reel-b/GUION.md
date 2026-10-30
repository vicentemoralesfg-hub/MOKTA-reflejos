# MOKTA · Test de reflejos — Guion de la voz

Duración total: **65.9 s** (1976 fotogramas a 30 fps). Tono: cercano, rápido y con intención; tuteo neutro.
Regla de oro: la voz **calla** antes y durante cada barrera (el silencio es parte del juego) y nunca anuncia cuándo aparece.

## GANCHO — desde 00:00.0

| Tiempo | Voz (se dice) | Subtítulo (se ve) | Máx. |
|---|---|---|---|
| 00:00.1 | ¿Alcanzarías a frenar a ciento veinte? | ¿Alcanzarías a frenar a 120? | 1.7 s |
| 00:01.9 | Pausa el video cuando veas esta barrera. Pausar es frenar. | Pausa el video cuando veas esta barrera. Pausar es frenar. | 3.1 s |

## RONDA 1 · 120 km/h — desde 00:05.3

| Tiempo | Voz (se dice) | Subtítulo (se ve) | Máx. |
|---|---|---|---|
| 00:05.5 | Ronda uno de tres… y la última no se gana con reflejos. | Ronda uno de tres… y la última no se gana con reflejos. | 3.4 s |
| 00:09.0 | Ojos en la carretera… y el dedo listo. | Ojos en la carretera… y el dedo listo. | 2.1 s |
| 00:12.5 | *(silencio · aparece la barrera · solo motor y carretera)* | | |
| 00:15.2 | *(impacto · corte a negro)* | | |
| 00:15.7 | Según el cálculo, tenías cincuenta y ocho centésimas de segundo para frenar a tiempo. | Según el cálculo, tenías 0,58 de segundo para frenar a tiempo. | 3.7 s |
| 00:19.5 | Si pausaste después, mira la escala: a esa velocidad chocaste. | Si pausaste después, mira la escala: a esa velocidad chocaste. | 3.4 s |

## RONDA 2 · 160 km/h — desde 00:23.3

| Tiempo | Voz (se dice) | Subtítulo (se ve) | Máx. |
|---|---|---|---|
| 00:23.5 | Ronda dos: ciento sesenta. | *(ya escrito en pantalla)* | 1.9 s |
| 00:25.5 | Solo cuarenta más. ¿Qué tanto puede cambiar? | Solo 40 más. ¿Qué tanto puede cambiar? | 2.0 s |
| 00:29.2 | *(silencio · aparece la barrera · solo motor y carretera)* | | |
| 00:31.2 | *(impacto · corte a negro)* | | |
| 00:31.7 | Todo. Aunque frenaras al instante, chocabas a unos ochenta y cinco. | Todo. Aunque frenaras al instante, chocabas a unos 85. | 3.3 s |
| 00:35.2 | A ciento sesenta, frenar toma ciento veintiséis metros. La barrera estaba a noventa. | A 160, frenar toma 126 metros. La barrera estaba a 90. | 4.5 s |

## RONDA FINAL · 210 km/h — desde 00:40.0

| Tiempo | Voz (se dice) | Subtítulo (se ve) | Máx. |
|---|---|---|---|
| 00:40.2 | Ronda final: doscientos diez. | *(ya escrito en pantalla)* | 1.8 s |
| 00:42.2 | Último intento. | Último intento. | 0.7 s |
| 00:44.2 | *(silencio · aparece la barrera · solo motor y carretera)* | | |
| 00:45.7 | *(impacto · corte a negro)* | | |
| 00:46.2 | Te lo dije: ni con reflejos perfectos. Impacto a más de ciento sesenta. | Te lo dije: ni con reflejos perfectos. Impacto a más de 160. | 3.8 s |

## CIERRE · LA FÍSICA — desde 00:50.4

| Tiempo | Voz (se dice) | Subtítulo (se ve) | Máx. |
|---|---|---|---|
| 00:50.5 | Y la distancia para frenar crece con el cuadrado de la velocidad. | Y la distancia para frenar crece con el cuadrado de la velocidad. | 2.8 s |
| 00:53.5 | setenta y cinco por ciento más rápido… el triple de distancia. | 75% más rápido… el triple de distancia. | 3.2 s |
| 00:56.9 | Y eso, sin contar tu reacción. La física no negocia. | Y eso, sin contar tu reacción. La física no negocia. | 3.2 s |

## LLAMADO A LA ACCIÓN — desde 01:00.5

| Tiempo | Voz (se dice) | Subtítulo (se ve) | Máx. |
|---|---|---|---|
| 01:00.6 | ¿A cuántos kilómetros por hora chocaste en la ronda final? Coméntalo. | *(ya escrito en pantalla)* | 2.9 s |
| 01:03.7 | Y mándaselo a quien maneja rápido. | *(ya escrito en pantalla)* | 1.6 s |

## Guía de grabación

- Graba cada frase como archivo separado `public/audio/voz/<ID>.wav` (mono, 48 kHz, sin música, 0,1 s de aire al inicio y final).
- La columna *Máx.* es la duración de la voz guía: puedes ir un poco más rápido; si vas más lento, `plan_guion.py` reacomoda todo solo.
- Después de grabar: `python3 scripts/plan_guion.py` → `gen_seams_reel.py` → `audio_reel.py` → render (ver README).
- Fuente actual de cada frase: H1 (grabación), H2 (grabación), R1a (grabación), R1b (grabación), R1c (grabación), R1d (grabación), R2a (grabación), R2b (grabación), R2c (grabación), R2d (grabación), R3a (grabación), R3b (grabación), R3c (grabación), V2 (grabación), V3 (grabación), V4 (grabación), C1 (grabación), C2 (grabación).
