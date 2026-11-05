import vo from "../vo.json";
import { FPS } from "../config";

/**
 * Línea de tiempo derivada de la locución (src/vo.json, generado por scripts/prep_voice.py).
 * Todas las escenas y efectos se anclan a palabras: si se regenera la voz, el montaje se reajusta solo.
 */

export type Word = { text: string; start: number; end: number };
export const WORDS: Word[] = vo.words;
export const VO_DURATION = vo.durationS;

/** Pequeño margen para que la voz no empiece en el fotograma 0 exacto. */
export const VO_OFFSET = 0.05;
export const TAIL_S = 1.2;
export const TOTAL_FRAMES = Math.ceil((VO_OFFSET + VO_DURATION + TAIL_S) * FPS);

const norm = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9%]/g, "");

/** Inicio (s, ya con desfase) de la n-ésima aparición de una frase en la locución. */
export const at = (phrase: string, occurrence = 1): number => {
  const target = phrase.split(/\s+/).map(norm);
  let found = 0;
  for (let i = 0; i <= WORDS.length - target.length; i++) {
    if (target.every((w, j) => norm(WORDS[i + j].text) === w)) {
      found++;
      if (found === occurrence) return WORDS[i].start + VO_OFFSET;
    }
  }
  throw new Error(`Frase no encontrada en la locución: "${phrase}" (#${occurrence})`);
};

/** Fin (s) de la n-ésima aparición de una frase. */
export const endOf = (phrase: string, occurrence = 1): number => {
  const target = phrase.split(/\s+/).map(norm);
  let found = 0;
  for (let i = 0; i <= WORDS.length - target.length; i++) {
    if (target.every((w, j) => norm(WORDS[i + j].text) === w)) {
      found++;
      if (found === occurrence) return WORDS[i + target.length - 1].end + VO_OFFSET;
    }
  }
  throw new Error(`Frase no encontrada en la locución: "${phrase}" (#${occurrence})`);
};

/** Marcas del guion (segundos). */
export const T = {
  hook: 0,
  pct: at("95%"),
  danger: at("Y ese error"),
  change: at("te cambias de carril"),
  crash: at("chocas"),
  neverSaw: at("nunca viste"),
  how: at("Cómo pasa"),
  waste: at("Ese pedazo"),
  wasteWord: at("espacio perdido"),
  overlap: at("El espejo mira"),
  central: at("retrovisor central"),
  sides: at("y a tu lado"),
  blind: at("punto ciego"),
  fits: at("donde cabe"),
  fix: at("La solución"),
  tenSec: at("10 segundos"),
  step1: at("Apoya la cabeza"),
  window: at("ventana"),
  openLeft: at("y abre el espejo"),
  barely: at("apenas veas"),
  step2: at("Luego inclínate"),
  center: at("centro"),
  sameRight: at("y haz lo mismo"),
  back: at("Vuelve a tu posición"),
  vanish: at("desaparece"),
  appears: at("y aparece el carril"),
  result: at("Ahora el auto"),
  overtakes: at("el auto que te adelanta"),
  rear: at("retrovisor", 2),
  toMirror: at("al espejo"),
  toView: at("a tu vista"),
  never: at("sin desaparecer nunca"),
  still: at("Igual"),
  shoulder: at("mira sobre tu hombro"),
  cta: at("Mándale esto"),
  end: VO_OFFSET + VO_DURATION,
};
