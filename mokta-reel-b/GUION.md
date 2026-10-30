# MOKTA · Test de reflejos — Guion de la voz

Duración total: **57.0 s** (1709 fotogramas a 30 fps). Tono: cercano, rápido y con intención; tuteo neutro.
Regla de oro: la voz **calla** antes y durante cada barrera (el silencio es parte del juego) y nunca anuncia cuándo aparece.

## GANCHO — desde 00:00.0

| Tiempo | Voz (se dice) | Subtítulo (se ve) | Máx. |
|---|---|---|---|
| 00:00.1 | Pausa el video en cuanto veas la barrera. | *(ya escrito en pantalla)* | 1.8 s |

## RONDA 1 · 120 km/h — desde 00:02.3

| Tiempo | Voz (se dice) | Subtítulo (se ve) | Máx. |
|---|---|---|---|
| 00:02.5 | Ronda uno. | *(ya escrito en pantalla)* | 0.7 s |
| 00:03.3 | Frena antes de que el choque sea mortal. | Frena antes de que el choque sea mortal. | 1.7 s |
| 00:06.4 | *(silencio · aparece la barrera · solo motor y carretera)* | | |
| 00:10.1 | *(impacto · corte a negro)* | | |
| 00:10.6 | Fácil. A ciento veinte te sobraban metros. | Fácil. A 120 te sobraban metros. | 2.4 s |

## RONDA 2 · 160 km/h — desde 00:13.4

| Tiempo | Voz (se dice) | Subtítulo (se ve) | Máx. |
|---|---|---|---|
| 00:13.6 | Ronda dos: ciento sesenta. | *(ya escrito en pantalla)* | 1.9 s |
| 00:15.6 | Ahora tienes medio segundo. | Ahora tienes medio segundo. | 1.2 s |
| 00:18.6 | *(silencio · aparece la barrera · solo motor y carretera)* | | |
| 00:21.4 | *(impacto · corte a negro)* | | |
| 00:21.9 | ¿Menos de medio segundo? Pasaste. Si no, zona mortal. | ¿Menos de medio segundo? Pasaste. Si no, zona mortal. | 3.2 s |

## RONDA FINAL · 210 km/h — desde 00:25.5

| Tiempo | Voz (se dice) | Subtítulo (se ve) | Máx. |
|---|---|---|---|
| 00:25.7 | Ronda final: doscientos diez. | *(ya escrito en pantalla)* | 1.8 s |
| 00:27.7 | Si pasas esta, eres el primero. | Si pasas esta, eres el primero. | 1.6 s |
| 00:30.5 | *(silencio · aparece la barrera · solo motor y carretera)* | | |
| 00:32.7 | *(impacto · corte a negro)* | | |
| 00:33.2 | Nadie la pasa. Ni reaccionando al instante: ciento treinta y siete kilómetros por hora. | Nadie la pasa. Ni reaccionando al instante: 137 km/h. | 4.3 s |

## CIERRE · LA FÍSICA — desde 00:37.9

| Tiempo | Voz (se dice) | Subtítulo (se ve) | Máx. |
|---|---|---|---|
| 00:38.0 | Misma barrera, misma distancia. A doscientos diez, tus reflejos ya no importan. | Misma barrera, misma distancia. A 210, tus reflejos ya no importan. | 4.0 s |
| 00:42.2 | Y la distancia para frenar crece con el cuadrado de la velocidad. | Y la distancia para frenar crece con el cuadrado de la velocidad. | 2.8 s |
| 00:45.1 | setenta y cinco por ciento más rápido… el triple de distancia. | 75% más rápido… el triple de distancia. | 3.2 s |
| 00:48.5 | Sobre setenta, el auto ya no puede protegerte. | Sobre 70, el auto ya no puede protegerte. | 2.3 s |

## LLAMADO A LA ACCIÓN — desde 00:51.2

| Tiempo | Voz (se dice) | Subtítulo (se ve) | Máx. |
|---|---|---|---|
| 00:51.4 | ¿Cuántas rondas pasaste? Comenta uno, dos o tres. | *(ya escrito en pantalla)* | 2.9 s |
| 00:54.4 | Y si alguien te dice tres, mándale esto. | *(ya escrito en pantalla)* | 1.9 s |

## Guía de grabación

- Graba cada frase como archivo separado `public/audio/voz/<ID>.wav` (mono, 48 kHz, sin música, 0,1 s de aire al inicio y final).
- La columna *Máx.* es la duración de la voz guía: puedes ir un poco más rápido; si vas más lento, `plan_guion.py` reacomoda todo solo.
- Después de grabar: `python3 scripts/plan_guion.py` → `gen_seams_reel.py` → `audio_reel.py` → render (ver README).
- Fuente actual de cada frase: HK (grabación), R1x (grabación), R1z (grabación), R1e (grabación), R2a (grabación), R2e (grabación), R2f (grabación), R3a (grabación), R3e (grabación), R3f (grabación), V5 (grabación), V2 (grabación), V3 (grabación), V6 (grabación), C3 (grabación), C4 (grabación).
