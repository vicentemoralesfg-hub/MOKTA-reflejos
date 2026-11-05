# MOKTA · Protocolo de Inspección Pre-Compra

Guía técnica de campo para inspectores MOKTA que evalúan autos usados antes de comprarlos (Chile).

**Documento listo para usar:**
- `dist/MOKTA_Protocolo_Inspeccion_PreCompra.pdf`: A4, para imprimir o llevar en el celular.
- `dist/MOKTA_Protocolo_Inspeccion_PreCompra.html`: autocontenido (fuentes incluidas), se abre en cualquier navegador.

## Contenido (20 capítulos)
Semáforo de riesgo (OK · Precaución · Alerta · STOP) · flujo y kit · consultas previas (CAV, multas, robo, PRT) ·
documentación y VIN · carrocería, pintura (µm) y estructura · vidrios y ópticas · neumáticos, llantas y frenos ·
interior, inundación y electrónica · testigos del tablero · vano motor, fluidos, humo y batería · bajos ·
prueba de ruta y diagnóstico por ruidos · post-ruta y OBD2 · módulos (diésel, híbrido, EV, 4x4, GNC/GLP, flota, zona franca…) ·
señales de alerta maestras · banco de preguntas clave · situaciones especiales · puntaje, dictamen, negociación y cierre seguro ·
**hoja de campo imprimible** · glosario.

## Editar y regenerar
El contenido está en `src/partes/*.html` (un archivo por capítulo) y el diseño en `src/estilos.css`.

```bash
node build.mjs                 # genera dist/*.html y dist/*.pdf (usa Playwright + Chromium)
node build.mjs --png ./prev    # además exporta cada página como PNG para revisión
```

Atajos de sintaxis dentro de los capítulos:
- `<ck> … </ck>` → tabla de chequeo. Una fila por línea: `Punto :: Cómo revisar :: Normal :: Alerta :: y|r|k`
  (`y` Precaución, `r` Alerta, `k` STOP).
- `<qs> … </qs>` → preguntas clave. Una por línea: `Pregunta :: Por qué :: Respuesta de alerta`.

Los contadores de la portada (puntos de control y preguntas) se calculan solos al generar.
Las fuentes se toman de `../mokta-reel/public/fonts`.
