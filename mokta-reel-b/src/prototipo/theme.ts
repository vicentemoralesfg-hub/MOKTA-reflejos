import timeline from "./r1.json";
import seamsJson from "./seams.json";
import { kmhToMs } from "../physics";

export const R1 = timeline;
export const SEAMS: number[] = seamsJson;
export const FPS = R1.fps;
export const V = kmhToMs(R1.speedKmh);

/** Fotograma en que el auto llega a la barrera sin frenar (primer fotograma con distancia ≤ 0). */
export const IMPACT_AT = R1.eventAt + Math.ceil((R1.barrierDistanceM / V) * FPS - 1e-9);
export const RESULT_AT = IMPACT_AT + R1.blackFrames;
export const R1_DURATION = RESULT_AT + R1.resultFrames;

export const THEME = {
  text: "#EEF1F4",
  dim: "rgba(238,241,244,0.52)",
  faint: "rgba(238,241,244,0.28)",
  green: "#3DD68C",
  red: "#FF4D3D",
  amber: "#FFA726",
  display: "Barlow Condensed",
  ui: "Inter",
};
