# Análisis crítico de la voz v2 → v3 (una sola voz)

## Qué estaba mal en la v2
1. **Sonaban varias personas.** Cada frase se generó "diseñando" la voz de nuevo a partir de una descripción + una
   instrucción de emoción distinta. El modelo interpretaba cada vez a una persona diferente. Medido sobre el audio final:
   el tono medio por frase iba de **115 Hz a 236 Hz (12,3 semitonos)**. "¡Para!" (236 Hz) y "Quédate" (120 Hz) son,
   en la práctica, dos locutores distintos. El control de timbre que usé (Resemblyzer ≥ 0,8) era demasiado permisivo y no lo detectó.
2. **Ritmo distinto en cada frase.** Cada frase se aceleró con su propio factor (×1,00 a ×1,30): unas corrían y otras no,
   lo que suena artificial y cuesta seguir.
3. **Exceso de "actuación".** Pedir una emoción distinta por frase empujaba al modelo a cambiar registro y timbre,
   en vez de mantener a un narrador reconocible que va subiendo y bajando la intensidad.

## Qué cambia en la v3
| Decisión | Detalle |
|---|---|
| Una sola voz | Se diseña **una vez** (Qwen3-TTS VoiceDesign): narrador masculino de registro medio, cálido, seguro e intrigante, dicción muy clara. 5 candidatas con la misma descripción (salieron de 98 a 191 Hz: por eso hay que elegir una y fijarla). Elegida la de mayor variación expresiva (±4,9 st), buena armonicidad y énfasis enérgico (142 Hz). |
| Clonada en todo el video | Las 12 frases se generan con el modelo **Base** clonando esa referencia (mismo timbre siempre). La emoción sale de la puntuación ("¡Para!", "¿Lo correcto?", "¡casi un estanque…!") y del estilo enérgico de la referencia. |
| Controles estrictos | Cada toma debe quedar a **±1,5 semitonos** del tono de la referencia; se elige la de mayor similitud de timbre con la referencia y cero errores de transcripción. |
| Mismo ritmo | Un **único** factor de tempo para todo el video (no uno por frase). |
| Guion e imagen | Sin cambios de contenido (solo la puntuación expresiva de la voz). |
