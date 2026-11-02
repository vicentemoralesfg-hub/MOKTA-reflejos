# MOKTA · Videos listos para publicar (entrega 2)

Cuatro Reels 1080×1920 con **locución, subtítulos sincronizados palabra a palabra y gancho directo** en el primer segundo.
Cada carpeta trae el video final, la portada, el texto de publicación, los cálculos y las fuentes.
Especificaciones medidas en [`QA.md`](QA.md). La primera entrega quedó en [`archivo_v1/`](archivo_v1) (no publicar).

| # | Video | Gancho (lo primero que se ve y se escucha) | Qué aporta |
|---|---|---|---|
| 01 | [**A 3.000 rpm tu motor hace esto**](videos/01_motor-a-3000-rpm) | «A 3.000 revoluciones, tu motor hace esto 100 veces por segundo» | Los 4 tiempos explicados en simple y sincronizados con la voz; 560 g en el pistón; el aceite a escala junto a un pelo |
| 02 | [**¿Lleno… o hasta el clic?**](videos/02_lleno-o-hasta-el-clic) | «¿Lleno… o hasta el clic?» | Cómo sabe la pistola que el estanque está lleno sin electrónica (orificio, vacío, resorte) y por qué no hay que redondear |
| 03 | [**5 millones de km**](videos/03_5-millones-de-km) | «Un solo auto recorrió más de 5 millones de kilómetros» + ¿de qué marca? | Quiz de marcas con cuenta regresiva → ranking real (Toyota, Mercedes, Volvo) → casi 7 viajes a la Luna → el secreto |
| 04 | [**Caballos de fuerza**](videos/04_caballos-de-fuerza) | «Un caballo de verdad puede tener casi 15 caballos de fuerza» | Por qué un "caballo de fuerza" no es la fuerza de un caballo; Hilux = 14 caballos reales, Bugatti Chiron = 100 |

## Cómo se aplicó la crítica de la primera entrega
- **Ganchos directos:** cada video abre con una situación precisa o un dato llamativo, en pantalla y en voz, desde el fotograma 0.
- **Voz en todos:** narrador masculino en español latinoamericano diseñado una vez con Qwen3-TTS (VoiceDesign) y clonado
  para todas las frases → misma voz en los 4 videos. Cada frase se verificó transcribiéndola con Whisper; las que no se
  entendían se regeneraron (p. ej. "Usain Bolt").
- **Sin dibujitos:** fotos reales con licencia libre (Volvo, Mercedes, Toyota, NASA, Muybridge 1878, grabado de Watt 1782),
  odómetros, barras de datos y diagramas técnicos tipo rayos X.
- **Curiosidades y comparaciones de autos/motores**, en formatos con dinámica: quiz con cuenta regresiva, ranking 3-2-1,
  comparaciones visuales (manadas de caballos reales, viajes a la Luna, pistón vs. piloto de caza).
- **Explicación clara y verificable:** cada cifra tiene su cálculo y fuente en el `copy.md` correspondiente.

## Orden sugerido de publicación
1. **Caballos de fuerza** — la curiosidad más amplia (le interesa a cualquiera), ideal para abrir.
2. **5 millones de km** — quiz con marcas reales: genera comentarios ("yo dije Toyota").
3. **¿Lleno o hasta el clic?** — utilidad + debate; publicarlo un viernes o sábado (día de carga).
4. **A 3.000 rpm** — cierra la semana con el más técnico, con la pregunta del aceite.

## Créditos y licencias
- Voz: Qwen3-TTS (Alibaba Qwen, Apache-2.0), generada localmente. Música y efectos: sintetizados (sin licencias de terceros).
- Fotos: ver "Créditos de imágenes" en cada `copy.md` (CC0, dominio público y Library of Congress sin restricciones).
  Las patentes visibles se difuminaron.
