# MOKTA · Videos listos para publicar

## Entrega 4 · Voz ElevenLabs en todos los videos
Se reemplazó la locución de **7 videos** por una sola voz de ElevenLabs (**Bendjy Price**, español chileno, modelo `eleven_v4`),
sin volver a usar Qwen3 ni otra voz local. Criterio de la voz: la única chilena masculina de la biblioteca descrita como
natural, clara y de dicción nítida para narración/educativo, que calza con el tono serio y curioso de los videos.
Cada guion se generó en **una toma** (misma entonación de principio a fin) y se segmentó por frase midiendo tiempos con
Whisper (solo para medir, no genera voz); subtítulos, cortes y efectos se re-sincronizaron a la nueva locución.

| Video | Carpeta | Nota |
|---|---|---|
| Pistola láser (140 km/h) | [`00_pistola-140-kmh`](videos/00_pistola-140-kmh) | Video recibido: imagen intacta, solo audio nuevo |
| A 3.000 rpm | [`01_motor-a-3000-rpm`](videos/01_motor-a-3000-rpm) | Ciclo del motor re-sincronizado con la voz |
| ¿Lleno o hasta el clic? | [`02_lleno-o-hasta-el-clic`](videos/02_lleno-o-hasta-el-clic) | |
| 5 millones de km | [`03_5-millones-de-km`](videos/03_5-millones-de-km) | |
| ¿Cuál llega primero a 100? | [`06_0-a-100-quien-gana`](videos/06_0-a-100-quien-gana) | "BYD" deletreado para que se pronuncie bien |
| El auto más vendido | [`07_el-auto-mas-vendido`](videos/07_el-auto-mas-vendido) | |
| El auto más caro | [`08_el-auto-mas-caro`](videos/08_el-auto-mas-caro) | **Gancho nuevo**: ya no muestra foto ni silueta del auto (tarjeta cerrada con "?") y las 4 opciones aparecen desenfocadas hasta la respuesta |

Quedan con voz Qwen3 (anteriores): *Caballos de fuerza* (04) y *El motor más potente* (05), que no estaban en el pedido.

---


## Entrega 3 · 4 videos nuevos (comparaciones y quiz de autos, con voz)
Mismo estándar de la entrega 2 (voz, gancho directo desde el fotograma 0, subtítulos palabra a palabra, fotos reales,
datos con fuente), con **algo cambiando en pantalla cada 1–2 segundos** durante todo el video: contadores, barras que se
reescalan, opciones que se iluminan cuando la voz las nombra, carrera en tiempo real, paneos de foto y efectos de sonido
sincronizados.

| # | Video | Gancho (lo primero que se ve y se escucha) | Qué aporta |
|---|---|---|---|
| 05 | [**El motor más potente del mundo**](videos/05_el-motor-mas-potente) | «Tu auto tiene unos 100 caballos. El motor más potente del mundo tiene casi 109.000» | Escalera de potencia Hilux → F1 → Bugatti → camión minero de Codelco → motor de barco; 13,5 m de alto a escala; gira a 102 rpm |
| 06 | [**¿Cuál llega primero a 100 km/h?**](videos/06_0-a-100-quien-gana) | La pregunta + 4 opciones: Ferrari F40, Countach, Corolla híbrido, BYD Seal | Carrera 0-100 en tiempo real con cronómetro; por qué un eléctrico le gana a un Ferrari (fuerza desde 0 rpm) |
| 07 | [**El auto más vendido de la historia**](videos/07_el-auto-mas-vendido) | «+50.000.000 vendidos de un solo auto. ¿Cuál es?» | Ranking Modelo T → Escarabajo → Golf → Corolla; uno cada 35 s; 5 vueltas a la Tierra |
| 08 | [**El auto más caro de la historia**](videos/08_el-auto-mas-caro) | «Este auto se vendió en 135 millones de euros» | Quiz → Mercedes 300 SLR Uhlenhaut; la subasta secreta; el 2° (W196 R de Fangio); = 10.000 autos nuevos |

**Orden sugerido:** 06 (0-100, el más comentable: "¿cuál elegiste?") → 08 (precio récord) → 05 (motor de barco) → 07 (ranking).
Todos terminan con una pregunta concreta para comentarios.

**Correcciones durante la verificación:** el 2° auto más caro en subasta ya no es el Ferrari 250 GTO (US$51,7 M, 2023)
sino el Mercedes W196 R (€51,2 M ≈ US$53,9 M, feb. 2025): se regeneró esa frase de la locución y la escena.
También se cambió "lo usaba para ir a las carreras" por el dato documentado (lo usaba como auto de todos los días),
y el 0-100 del Countach 25° Aniversario quedó en 4,9 s (dato de fábrica; el "4,7 s" que circula es 0-60 mph).

---

## Entrega 2

Cuatro Reels 1080×1920 con **locución, subtítulos sincronizados palabra a palabra y gancho directo** en el primer segundo.
Cada carpeta trae el video final, la portada, el texto de publicación, los cálculos y las fuentes.
Especificaciones medidas en [`QA.md`](QA.md). La primera entrega quedó en [`archivo_v1/`](archivo_v1) (no publicar).

| # | Video | Gancho (lo primero que se ve y se escucha) | Qué aporta |
|---|---|---|---|
| 01 | [**A 3.000 rpm tu motor hace esto**](videos/01_motor-a-3000-rpm) | «A 3.000 revoluciones, tu motor hace esto 100 veces por segundo» | Los 4 tiempos explicados en simple y sincronizados con la voz; 560 g en el pistón; el aceite a escala junto a un pelo |
| 02 | [**¿Lleno… o hasta el clic?**](videos/02_lleno-o-hasta-el-clic) | «¿Lleno… o hasta el clic?» | Cómo sabe la pistola que el estanque está lleno sin electrónica (orificio, vacío, resorte) y por qué no hay que redondear |
| 03 | [**5 millones de km**](videos/03_5-millones-de-km) | «Un solo auto recorrió más de 5 millones de kilómetros» + ¿de qué marca? | Quiz de marcas con cuenta regresiva → ranking real (Toyota, Mercedes, Volvo) → casi 7 viajes a la Luna → el secreto |
| 04 | [**Caballos de fuerza**](videos/04_caballos-de-fuerza) | «Un caballo de verdad puede tener casi 15 caballos de fuerza» | Por qué un "caballo de fuerza" no es la fuerza de un caballo; Hilux = 14 caballos reales, Bugatti Chiron = 100 |

### Cómo se aplicó la crítica de la primera entrega
- **Ganchos directos:** cada video abre con una situación precisa o un dato llamativo, en pantalla y en voz, desde el fotograma 0.
- **Voz en todos:** narrador masculino en español latinoamericano diseñado una vez con Qwen3-TTS (VoiceDesign) y clonado
  para todas las frases → misma voz en los 4 videos. Cada frase se verificó transcribiéndola con Whisper; las que no se
  entendían se regeneraron (p. ej. "Usain Bolt").
- **Sin dibujitos:** fotos reales con licencia libre (Volvo, Mercedes, Toyota, NASA, Muybridge 1878, grabado de Watt 1782),
  odómetros, barras de datos y diagramas técnicos tipo rayos X.
- **Curiosidades y comparaciones de autos/motores**, en formatos con dinámica: quiz con cuenta regresiva, ranking 3-2-1,
  comparaciones visuales (manadas de caballos reales, viajes a la Luna, pistón vs. piloto de caza).
- **Explicación clara y verificable:** cada cifra tiene su cálculo y fuente en el `copy.md` correspondiente.

### Orden sugerido de publicación (entrega 2)
1. **Caballos de fuerza** — la curiosidad más amplia (le interesa a cualquiera), ideal para abrir.
2. **5 millones de km** — quiz con marcas reales: genera comentarios ("yo dije Toyota").
3. **¿Lleno o hasta el clic?** — utilidad + debate; publicarlo un viernes o sábado (día de carga).
4. **A 3.000 rpm** — cierra la semana con el más técnico, con la pregunta del aceite.

## Créditos y licencias
- Voz: Qwen3-TTS (Alibaba Qwen, Apache-2.0), generada localmente. Música y efectos: sintetizados (sin licencias de terceros).
- Fotos: ver "Créditos de imágenes" en cada `copy.md` (CC0, dominio público, Library of Congress sin restricciones y,
  en la entrega 3, CC BY / CC BY-SA de Wikimedia Commons: el crédito al autor va en el texto de la publicación o en los
  comentarios). Registro completo en `estudio/public/fotos/creditos.json`.
  Las patentes visibles se difuminaron.
