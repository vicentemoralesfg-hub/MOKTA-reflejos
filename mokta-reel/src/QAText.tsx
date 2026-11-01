import React, {useLayoutEffect, useRef} from 'react';
import {continueRender, delayRender, useCurrentFrame, useVideoConfig} from 'remotion';

/**
 * Capa de texto "auditable". Se comporta como un <div>, pero cuando el
 * fotograma ya está maquetado informa al script de QA (console.log, capturado
 * con onBrowserLog) de su id, texto, caja delimitadora y visibilidad efectiva.
 * Usa delayRender para que Remotion no capture el fotograma antes de medir.
 */
export const QAText: React.FC<
  React.HTMLAttributes<HTMLDivElement> & {qaId: string}
> = ({qaId, children, ...rest}) => {
  const ref = useRef<HTMLDivElement>(null);
  const frame = useCurrentFrame();
  const {width, height} = useVideoConfig();

  useLayoutEffect(() => {
    const handle = delayRender(`QA: midiendo capa de texto "${qaId}"`);
    let raf = 0;
    let tries = 0;
    const measure = () => {
      const el = ref.current;
      if (el) {
        const r = el.getBoundingClientRect();
        // Raíz = ancestro más externo (sin contar <body>/<html>) con la
        // proporción del video. Remotion monta además instancias ocultas
        // fuera de pantalla que no tienen ese contenedor: esas no informan.
        let root: {x: number; y: number; width: number} | null = null;
        for (let n = el.parentElement; n && n !== document.body; n = n.parentElement) {
          const b = n.getBoundingClientRect();
          if (b.width > 0 && b.height > 0 && Math.abs(b.width / b.height - width / height) < 0.01) {
            root = {x: b.x, y: b.y, width: b.width};
          }
        }
        if (!root) {
          // Puede que el lienzo aún no esté maquetado: reintentar unos frames.
          if (++tries < 10) {
            raf = requestAnimationFrame(measure);
            return;
          }
          continueRender(handle); // instancia fuera del lienzo: no se informa
          return;
        }
        const k = width / root.width; // corrige escalados (p. ej. --scale)
        let opacity = 1;
        let hidden = false;
        for (let n: HTMLElement | null = el; n; n = n.parentElement) {
          const cs = getComputedStyle(n);
          opacity *= parseFloat(cs.opacity || '1');
          if (cs.display === 'none' || cs.visibility === 'hidden') hidden = true;
        }
        console.log(
          '[qa-text]' +
            JSON.stringify({
              id: qaId,
              frame,
              text: (el.textContent ?? '').trim(),
              x: (r.x - root.x) * k,
              y: (r.y - root.y) * k,
              width: r.width * k,
              height: r.height * k,
              opacity,
              hidden,
            }),
        );
      }
      continueRender(handle);
    };
    raf = requestAnimationFrame(measure);
    return () => {
      cancelAnimationFrame(raf);
      continueRender(handle);
    };
  }, [frame, qaId, children, width, height]);

  return (
    <div ref={ref} data-qa-text={qaId} {...rest}>
      {children}
    </div>
  );
};
