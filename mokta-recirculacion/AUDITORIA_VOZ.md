# Auditoría crítica de la voz (Qwen3-TTS) — MOKTA · El botón que usas al revés

**Objetivo:** una voz que se entienda, que vaya con el video y que transmita emoción y énfasis donde corresponde. Debe mantener la atención y despertar curiosidad, con un ritmo de reel, sin perder el propósito del video.

**Método:** cada decisión se tomó con mediciones objetivas sobre el audio (`scripts/voice_metrics.py`, `scripts/gen_voice.py`, `scripts/audit_voice.py`, `scripts/qa_voice.py`). Se midió:
- inteligibilidad, transcribiendo con Whisper
- ritmo (sílabas/s) y pausas
- expresividad (variación de tono en semitonos)
- énfasis (cuánto más fuerte o agudo suenan las palabras clave)
- registro (tono medio)
- timbre (embedding de hablante de Qwen3)
- sincronía palabra ↔ golpe visual

Limitación honesta: estas métricas reemplazan la escucha, no la igualan. Indican problemas concretos y medibles, pero no garantizan cómo lo percibe una persona.

## 1. Qué fallaba en la versión anterior (Piper)

| Indicador | Piper (versión anterior) | Qwen3 (esta versión) |
|---|---|---|
| Silencio entre escenas | **0,55 – 2,0 s** (la voz se cortaba y la imagen seguía sola) | **0,27 – 0,30 s** (una pausa corta, de 0,97 s, tras "¡Listo!") |
| Tiempo con voz | 84 % | **94 %** |
| Énfasis en palabras clave | **−0,7 st / −0,1 dB** (las bajaba) | **+2,4 st / +1,7 dB** |
| Expresividad (variación de tono) | 2,7 st (monótona) | **4,9 st** |
| Velocidad de articulación | 6,6 sílabas/s | 6,6 sílabas/s (6,1–7,0) |
| Duración del reel | 54,0 s | **48,2 s** |
| Inteligibilidad (MP4 final, con música) | 100 % | 100 % |

**Diagnóstico:** la velocidad por sílaba era la misma. Lo que mataba el ritmo eran los huecos de hasta 2 s entre escenas y una entonación plana, que bajaba justo en las palabras importantes.

## 2. Decisiones y alternativas descartadas

| Prueba | Resultado medido | Decisión |
|---|---|---|
| Qwen3 VoiceDesign, 3 descripciones de voz | Una salió femenina (408 Hz), otras agudas (216–254 Hz) | ✗ |
| Descripción con "voz masculina grave" (D, E, F) | **E**, "experto en autos hablando a cámara": 139 Hz, 5,7 st de expresividad, +4,9 st de énfasis, 100 % inteligible | ✔ personaje elegido |
| Narración completa en **una sola toma** (3 semillas) | En 56–60 s el modelo pierde el personaje (sube a 266–315 Hz) y acumula 5–15 s de pausas | ✗ |
| **VoiceDesign por escena** con emoción propia | Timbre 0,964–0,987 contra la referencia: equivale a otro locutor (voces distintas miden 0,946–0,979) | ✗ (cambio de voz entre escenas) |
| **Clonar el personaje E** por escena (modelo Base, flujo recomendado por Qwen) | Timbre 0,985–0,996 (mismo locutor), énfasis y expresividad conservados | ✔ |
| Referencias "más rápidas" para clonar (R1, R3) | R1 aguda (215 Hz); R3 rápida pero plana (2,8 st) | ✗ se mantuvo E |
| Ritmo: pausas recortadas a 0,28 s + aceleración 1,12× | 50,4 s; articulación 5,8–6,7 síl/s, aún lenta para un reel | ↑ |
| Ritmo: pausas a 0,28 s + **1,18×** (conserva el tono) | 48,2 s; 6,1–7,0 síl/s; 100 % inteligible | ✔ |
| "Verano" y "La regla" | Énfasis débil o registro muy bajo (96 Hz) → se reescribieron con exclamaciones (¡la dejas apagada!, ¡aire de afuera!, ¡recirculación!) + 5 tomas más | ✔ "Verano": +4,5 st en "¡más bencina!" |

Puntaje de selección por toma: inteligibilidad (excluyente) + mismo timbre (excluyente bajo 0,985) + énfasis + expresividad + velocidad, con penalización si el tono se aleja más de 3 semitonos del registro del personaje. Así la energía no se cae de una escena a otra. Tabla completa de las 52 tomas: `out/voice_takes/audit.json` (no versionada, se regenera).

## 3. Resultado por escena (voz elegida)

| Escena | Duración | Voz | Articulación | Tono | Expresividad | Énfasis | Toma |
|---|---|---|---|---|---|---|---|
| Gancho | 6,70 s | 6,46 s | 6,5 síl/s | 154 Hz | 6,3 st | +3,0 st / +2,0 dB | clone s1 |
| Qué es | 4,90 s | 4,63 s | 6,4 | 157 Hz | 4,4 st | +2,8 st / +1,2 dB | clone s3 |
| Error #1 · Invierno | 7,53 s | 7,23 s | 7,0 | 147 Hz | 5,4 st | −1,7 st / +1,9 dB | clone s3 |
| Error #2 · Verano | 8,63 s | 8,36 s | 6,1 | 166 Hz | 5,2 st | +4,5 st / +2,0 dB | clone s5 |
| La regla | 6,03 s | 5,74 s | 6,5 | 167 Hz | 4,4 st | −0,1 st / +1,5 dB | clone s7 |
| Desempañar al tiro | 10,97 s | 10,00 s | 7,0 | 115 Hz | 4,8 st | +5,1 st / +1,7 dB | clone s1 |
| Cierre | 3,43 s | 2,90 s | 7,0 | 132 Hz | 4,1 st | +3,0 st / +0,7 dB | clone s1 |

Notas críticas:
- En "Invierno" y "La regla" el énfasis de tono sale ≈0 o negativo porque las palabras clave van al final de la frase, donde el tono baja naturalmente. El énfasis de volumen sí es positivo (+1,5 a +1,9 dB).
- La receta va en un registro más grave (115 Hz) que los errores (147–167 Hz). Calza con el arco del video, problema (alarma) → solución (tono de experto). La diferencia total entre escenas es de 6,5 semitonos.
- Las pausas dramáticas quedaron donde generan curiosidad: "El 90 % usa este botón… ¡al revés!" (Whisper la transcribe como dos frases) y "toca el vidrio frío… ¡y se empaña!".

## 4. Voz ↔ video (verificado sobre el MP4 final)

- **Inteligibilidad con música y efectos:** Whisper transcribe todo el guion correctamente. "vencina", "en fría" y "para brisas" son solo cómo escribe "bencina", "enfría" y "parabrisas".
- **Sincronía golpe visual ↔ palabra:** error medio de **69 ms** respecto a lo previsto (1 fotograma = 33 ms). Los pasos 1·2·3·4 de la receta caen entre −13 y −67 ms de "uno/dos/tres/cuatro". El clic de "prendes" cae en la palabra. "Y SE EMPAÑA" llega con "se empaña".
- **Golpe nuevo en el gancho:** "AL REVÉS" gira en el primer segundo (anzuelo visual). Cuando la voz dice "¡al revés!" (2,4 s), el texto late en grande con destello rojo e impacto, a +60 ms de la palabra.
- **Cortes:** cada corte cae en la pausa entre frases (0,27–0,30 s) y lleva su golpe sonoro: +4 a +10 dB en los primeros 80 ms. Para eso, los efectos se recuperan del "ducking" en 80 ms.
- **Mezcla:** la voz queda ~11 dB sobre la música mientras habla. −14,0 LUFS integrados.

Problemas encontrados y corregidos en esta auditoría:
1. **Los golpes de los cortes quedaban atenuados por el ducking** (se medía primero la voz, +130 ms). Se corrigió con una recuperación rápida de los efectos.
2. **El botón del gancho tapaba el texto** "Un hábito de 2 segundos…" durante su subida. Ahora sube antes y el texto entra con la voz.
3. **"Error #2 · Verano" mostraba la pantalla casi vacía 1,4 s** mientras la voz decía "Error dos: en verano". Los botones ahora aparecen de inmediato.
4. **El verificador no reconocía "uno/dos/tres/cuatro"** porque Whisper escribe "1.". Se corrigió en el script.

## 5. Limitaciones que siguen

- Acento: latinoamericano. El modelo recibió "hablante de Chile", pero no se puede garantizar un acento chileno marcado.
- La aceleración de 1,18× (WSOLA) conserva el tono; con una velocidad tan moderada no deja artefactos medibles en la inteligibilidad.
- Las métricas no reemplazan la escucha humana. Si algo no convence al oído, se puede cambiar la toma de una escena sin tocar el resto. Las tomas y sus puntajes se regeneran con `scripts/qwen_voice.py` y `scripts/gen_voice.py`.
