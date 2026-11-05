# Plantillas MOKTA para redes

Formatos: **historia 1080×1920** y **publicación 1080×1350 (4:5)**, cada uno en fondo **blanco** y **negro**.

| Tipo | Para qué sirve |
|---|---|
| `base` | Fondo de marca limpio (logo + detalle rojo). Para repost, texto libre o stickers. |
| `aviso` | Anuncios: horarios, novedades, comunicados. Logo, etiqueta "AVISO", espacio para título y texto, pie con @usuario. |
| `foto` | Publicación con foto. El área de la foto es **transparente**: pon la foto debajo del PNG (en Canva: foto atrás, plantilla encima). |

- `bases/` — plantillas vacías listas para usar (12 PNG).
- `ejemplos/` — las mismas con texto de muestra, como referencia de tamaños y jerarquía.
- `logo/` — logo con fondo transparente en negro y en blanco.
- `vista-previa.png` — todas juntas.

## Guía rápida
- **Títulos:** Barlow Condensed ExtraBold, en mayúsculas, 2–3 líneas como máximo.
- **Texto:** Inter Regular, en gris, de 1 a 3 líneas.
- **Rojo:** `#E2080C`, solo para la línea y las etiquetas. No lo uses para bloques grandes.
- **Historias:** deja libres unos 250 px arriba y 340 px abajo (ahí va la interfaz de Instagram); las plantillas ya lo respetan.

## Regenerar o editar
Los textos, el usuario (`@moktacars`) y las medidas están en `fuente/plantilla.html`. Para volver a generar los PNG:

```bash
cd plantillas-redes
NODE_PATH=$(npm root -g) node fuente/render.mjs
```
