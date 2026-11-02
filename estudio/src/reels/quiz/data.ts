/**
 * Reel 02 · "¿Mito o verdad?" — contenido y tiempos.
 * Grilla musical: 100 BPM → 1 pulso = 18 fotogramas a 30 fps. Todo cae en pulsos.
 *
 * Fuentes (ver contenido/02_reel_mito-o-verdad/fuentes.md):
 *  1. Flecha del indicador de combustible: convención de casi todos los fabricantes modernos.
 *  2. Neutro en bajada: corte de inyección en desaceleración con cambio puesto; en neutro el motor gasta en ralentí.
 *  3. Calentar el motor: DOE/fueleconomy.gov — ~30 s y manejar suave.
 *  4. Cargar tras el "clic": AAA / Consumer Reports — satura el cánister (sistema de recuperación de vapores).
 *  5. ABS: su fin es mantener la dirección al frenar a fondo; NHTSA — en ripio puede alargar la frenada.
 */
export const BEAT = 18;
export const BPM = 100;

export type Icon = "fuel" | "neutral" | "cold" | "nozzle" | "abs";
export type Q = { icon: Icon; claim: string; answer: "MITO" | "VERDAD"; why: string; key: string };

export const QUESTIONS: Q[] = [
  {
    icon: "fuel",
    claim: "La flechita junto al ícono de bencina te dice de qué lado cargar",
    answer: "VERDAD",
    why: "En casi todos los autos modernos apunta al lado de la tapa del estanque.",
    key: "apunta al lado de la tapa",
  },
  {
    icon: "neutral",
    claim: "Bajar una cuesta en neutro ahorra bencina",
    answer: "MITO",
    why: "Con cambio puesto y sin acelerar, la inyección se corta. En neutro sigue gastando… y pierdes freno motor.",
    key: "la inyección se corta",
  },
  {
    icon: "cold",
    claim: "Hay que calentar el motor 10 minutos antes de partir",
    answer: "MITO",
    why: "En autos con inyección bastan unos 30 segundos. Después maneja suave: se calienta más rápido andando.",
    key: "unos 30 segundos",
  },
  {
    icon: "nozzle",
    claim: "Seguir cargando después del «clic» puede dañar tu auto",
    answer: "VERDAD",
    why: "La bencina extra puede llegar al cánister (el filtro de vapores) y arruinarlo.",
    key: "al cánister",
  },
  {
    icon: "abs",
    claim: "El ABS está para que frenes en menos metros",
    answer: "MITO",
    why: "Está para que las ruedas no se bloqueen y puedas seguir doblando. En ripio, puede alargar la frenada.",
    key: "puedas seguir doblando",
  },
];

// Estructura en pulsos
export const HOOK_BEATS = 3;
export const Q_BEATS = 10; // 0 aparece · 2,3,4 cuenta 3-2-1 · 5 revelación · 5–10 explicación
export const END_BEATS = 9;
export const HOOK = HOOK_BEATS * BEAT;
export const QDUR = Q_BEATS * BEAT;
export const END = END_BEATS * BEAT;
export const TOTAL = HOOK + QUESTIONS.length * QDUR + END;
export const qStart = (i: number) => HOOK + i * QDUR;
