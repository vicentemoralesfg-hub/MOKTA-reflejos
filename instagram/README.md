# MOKTA Cars · Contenido para Instagram

**24 publicaciones · 55 imágenes · 1080 × 1350 px (4:5) · PNG listo para subir**

Cada diapositiva de los carruseles es una imagen independiente (`01.png`, `02.png`…). Súbelas en orden.

## Sistema visual

- **Colores del logo:** negro tinta `#0A0A0B`, rojo MOKTA `#E1080C`, blanco. Cuando hace falta, se suma un fondo papel `#F1EEE8` (fichas de fallas y resúmenes). Los colores ámbar, verde y azul solo aparecen en el carrusel del tablero, porque son los colores reales de los testigos.
- **Tipografía:** Archivo extendida itálica en los titulares (sigue la forma ancha e inclinada del logo), Barlow Condensed para las cifras, Inter para los textos y JetBrains Mono para las etiquetas técnicas.
- **Firma:** el logo va en la esquina superior izquierda y el contador de diapositiva en la superior derecha. También se repiten la barra roja del logo junto a cada antetítulo, las bandas diagonales y el corte horizontal sobre los números grandes.
- **Fotos reales con fondo transparente** en todas las comparativas y fichas de fallas. Las patentes legibles se difuminaron.

## Publicaciones

| # | Publicación | Formato | Tema |
|---|---|---|---|
| 01 | V6 · V8 · V10 · V12 | Carrusel 6 | Motores |
| 02 | Motores en línea: 3, 4, 5 y 6 cilindros | Carrusel 5 | Motores |
| 03 | Bóxer, rotativo y W | Carrusel 4 | Motores |
| 04 | Atmosférico vs Turbo vs Biturbo (+ pérdida por altura en Chile) | Carrusel 5 | Motores |
| 05 | Toyota Hilux 2.8 vs VW Amarok V6 | Carrusel 4 | Comparativa |
| 06 | Kia Morning vs Hyundai Grand i10 | Infografía | Comparativa |
| 07 | Toyota Corolla vs Mazda 3 | Infografía | Comparativa |
| 08 | Toyota RAV4 Híbrido vs Mazda CX-5 | Infografía | Comparativa |
| 09 | BMW 320i vs Mercedes-Benz C 200 | Infografía | Comparativa |
| 10 | Ford Ranger 3.2 usada: qué revisar | Carrusel 4 | Fallas |
| 11 | Toyota Hilux 2.8 (2015–2020): el DPF | Ficha | Fallas |
| 12 | Peugeot 1.2 PureTech | Ficha | Fallas |
| 13 | VW DSG 7 vel. seca (DQ200) | Ficha | Fallas |
| 14 | Ford Powershift (DPS6) | Ficha | Fallas |
| 15 | BMW motor N20 | Ficha | Fallas |
| 16 | Nissan caja CVT | Ficha | Fallas |
| 17 | Kia / Hyundai Theta II GDI | Ficha | Fallas |
| 18 | Luces del tablero | Carrusel 5 | Mantención |
| 19 | Cómo leer tu neumático | Infografía | Mantención |
| 20 | Revisa tu auto en 5 minutos | Carrusel 6 | Mantención |
| 21 | 6 hábitos que te cuestan plata | Imagen | Mantención |
| 22 | ¿Bencina 93 o 97? | Imagen | Mito o verdad |
| 23 | Lo que pasa a 6.000 rpm | Imagen | Curiosidades |
| 24 | ¿Ir a 120 te conviene? | Imagen | Curiosidades |

**Orden sugerido para publicar** (alterna formatos y temas): 01 → 06 → 18 → 11 → 22 → 05 → 02 → 12 → 19 → 07 → 04 → 10 → 23 → 08 → 20 → 13 → 21 → 09 → 03 → 14 → 24 → 15 → 16 → 17.

## Criterios de los datos

- **Fichas técnicas:** cifras de fábrica de versiones vendidas en Chile (Autocosmos Chile, fichas de Hyundai Chile y de cada marca). Cada comparativa indica la versión comparada. Morning y Grand i10 se comparan en su versión 1.2; Hilux es la 2.8 automática.
- **Fallas:** cada punto lleva una etiqueta.
  - **Documentada:** hay llamado a revisión, extensión de garantía, fallo judicial o reconocimiento del fabricante.
  - **Reportada:** es un patrón frecuente según talleres especialistas y propietarios.
  - **Desgaste normal:** es una pieza que se gasta con el uso.
  - Cada ficha indica su fuente principal al pie.
- **Altura (pub. 04):** la pérdida estimada de un motor atmosférico se calcula con la densidad del aire de la atmósfera estándar ISA (Santiago ≈ 5 %, Calama ≈ 20 %, Cristo Redentor ≈ 27 %, Paso de Jama ≈ 35 %).
- **Velocidad (pub. 24):** es física básica. La resistencia del aire crece con el cuadrado de la velocidad (+44 % al pasar de 100 a 120 km/h) y la potencia necesaria para vencerla, con el cubo (+73 %).
- Antes de publicar, conviene revisar precios, versiones y garantías vigentes con cada concesionario: cambian sin aviso.

## Fotos y licencias

Las fotos son de **Wikimedia Commons** (licencias Creative Commons, mayormente CC BY-SA 4.0). Cada imagen lleva el crédito del autor al pie, como exige la licencia: no lo borres. Autores: Vauxford, Alex Neman, LuvsMG481, Just a Man, Mr.choppers, Elise240SX, Alexander-93, OSX, Kevauto, EurovisionNim.

`recortes-transparentes/` contiene todos los autos recortados en PNG con fondo transparente (y el logo en versión clara y oscura) para que los reutilices.

## Editar o regenerar

`fuente/` contiene las plantillas (HTML/CSS generado con JavaScript) y las tipografías:

```bash
cd instagram/fuente
node render.mjs            # renderiza todo en fuente/out/ (requiere Playwright)
node render.mjs 06         # solo los archivos de posts/ que contienen "06"
```

Los textos y las cifras están en `fuente/posts/*.mjs`. Los colores y tipografías, en `fuente/base.css`.
