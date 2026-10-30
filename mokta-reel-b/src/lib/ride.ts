/**
 * Movimiento de cabeza/carrocería a velocidad de crucero. Sobrio y físico:
 *  - balanceo lento de suspensión (≈1,2 Hz, milímetros)
 *  - golpe amortiguado al pisar cada junta del asfalto: eje delantero y, una distancia entre ejes
 *    después, eje trasero (las mismas juntas que dibuja el shader y que suenan en el audio).
 */
export type Ride = { dx: number; dy: number; pitchDeg: number; rollDeg: number };

export const FRONT_AXLE_M = 1.0; // ojo del conductor → eje delantero
export const WHEELBASE_M = 2.7;

const bump = (dt: number, amp: number) =>
  dt < 0 || dt > 0.6 ? 0 : amp * Math.exp(-dt / 0.07) * Math.sin(2 * Math.PI * 9 * dt);

export const rideAt = (tSec: number, s: number, v: number, seams: number[]): Ride => {
  let dy = 0.0035 * Math.sin(2 * Math.PI * 1.17 * tSec) + 0.0015 * Math.sin(2 * Math.PI * 2.3 * tSec + 1.1);
  let pitch = 0.035 * Math.sin(2 * Math.PI * 0.9 * tSec + 0.4);
  // a más velocidad las juntas golpean más seco (amplitud ∝ √v, referencia 120 km/h)
  const k = Math.sqrt(v / 33.33);
  for (const p of seams) {
    const dFront = (s + FRONT_AXLE_M - p) / v; // segundos desde que el eje delantero pisó la junta
    const dRear = (s + FRONT_AXLE_M - WHEELBASE_M - p) / v;
    dy += k * (bump(dFront, -0.0045) + bump(dRear, -0.003));
    pitch += k * (bump(dFront, 0.06) - bump(dRear, 0.04));
  }
  return {
    dx: 0.002 * Math.sin(2 * Math.PI * 0.43 * tSec + 2.0),
    dy,
    pitchDeg: pitch,
    rollDeg: 0.04 * Math.sin(2 * Math.PI * 0.61 * tSec + 0.7),
  };
};
