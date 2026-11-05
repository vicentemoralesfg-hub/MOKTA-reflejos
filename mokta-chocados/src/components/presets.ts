import { C } from "../theme";
import { CarProps, Dent } from "./Car";

/** Auto A: "el feo". Mucho daño visible, todo en piezas apernadas. */
export const UGLY_DENTS: Dent[] = [
  { x: 410, y: 252, rx: 62, ry: 34 },
  { x: 620, y: 258, rx: 54, ry: 30 },
  { x: 182, y: 246, rx: 40, ry: 24 },
  { x: 860, y: 236, rx: 34, ry: 16 },
];

export const uglyCar = (k = 1): Partial<CarProps> => ({
  paint: C.blue,
  dents: UGLY_DENTS,
  dentK: k,
  scratches: k,
  scuffs: k,
  brokenHeadlight: k,
  bumperDrop: 0.85 * k,
  crackedGlass: k,
});

/** Auto B: "el impecable". Casi sin daño visible. */
export const cleanCar = (): Partial<CarProps> => ({
  paint: "#EEF2F7",
  shine: 1,
});

export const WHITE = "#EEF2F7";
