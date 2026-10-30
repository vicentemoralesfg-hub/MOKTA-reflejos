import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { DriveView } from "../world/DriveView";
import { EASE_OUT, inOut, ramp } from "../lib/anim";
import { rideAt } from "../lib/ride";
import { fmt, kmhToMs } from "../physics";
import { Cockpit } from "../prototipo/Cockpit";
import { THEME } from "../prototipo/theme";
import { ClusterBrand } from "./Hud";
import { D, DECEL_G, FPS, ROUNDS, T } from "./config";

/**
 * Gancho: el auto ya va a toda velocidad de noche y la barrera está a la vista (a HOOK_D m). La cámara
 * se acerca a ella mientras la voz da la instrucción; justo antes de llegar, corte a negro (impacto).
 * La velocidad se calcula para que el auto llegue a la barrera en el último fotograma del gancho.
 * El CTA termina en el primer plano del gancho (barrera a HOOK_D m), así el reel se repite sin salto.
 */
const STILL_S = 9000;
const NO_RIDE = { dx: 0, dy: 0, pitchDeg: 0, rollDeg: 0 };
const SPEEDS = ROUNDS.map((r) => r.speedKmh).join(" · ") + " km/h";
export const HOOK_D = 110;
export const HOOK_BLACK = 4; // fotogramas de negro al final del gancho (impacto)
const HOOK_SEAMS = Array.from({ length: 12 }, (_, i) => STILL_S - HOOK_D + 14 + i * 23 + ((i * 37) % 11));

/**
 * Estelas de velocidad del gancho: trazos tenues que salen del punto de fuga hacia los bordes del
 * parabrisas, más rápidos cuanto más lejos del centro (perspectiva). Solo en la periferia (r > 380 px):
 * no tapan la carretera ni la barrera.
 */
const STREAKS = Array.from({ length: 34 }, (_, i) => {
  const h = (n: number) => {
    const x = Math.sin(i * 12.9898 + n * 78.233) * 43758.5453;
    return x - Math.floor(x);
  };
  return { ang: h(1) * Math.PI * 2, phase: h(2), len: 0.18 + h(3) * 0.22, w: 1.5 + h(4) * 2 };
});
const VP = { x: 540, y: 700 };
const SpeedStreaks: React.FC<{ f: number; strength: number }> = ({ f, strength }) => (
  <svg width={1080} height={1224} style={{ position: "absolute", left: 0, top: 0 }}>
    {STREAKS.map((st, i) => {
      const t = (st.phase + f * 0.045) % 1; // 0 → 1: del centro hacia el borde
      const r0 = 380 + 1100 * t * t;
      const r1 = r0 * (1 + st.len);
      const cx = Math.cos(st.ang);
      const cy = Math.sin(st.ang);
      const a = strength * Math.min(1, t * 3) * (1 - t) * 0.5;
      return (
        <line
          key={i}
          x1={VP.x + cx * r0}
          y1={VP.y + cy * r0}
          x2={VP.x + cx * r1}
          y2={VP.y + cy * r1}
          stroke="rgba(210,225,255,1)"
          strokeOpacity={a}
          strokeWidth={st.w}
          strokeLinecap="round"
        />
      );
    })}
  </svg>
);

const BarrierStill: React.FC<{ distance: number }> = ({ distance }) => (
  <DriveView s={STILL_S - distance} travelPerFrame={0} ride={NO_RIDE} seams={[]} barrierS={STILL_S} />
);

export const Hook: React.FC = () => {
  const f = useCurrentFrame();
  const dur = T.hook.duration;
  const run = dur - HOOK_BLACK; // fotogramas hasta llegar a la barrera
  const v = HOOK_D / (run / FPS); // m/s
  const kmh = Math.round(v * 3.6);
  const fm = Math.min(f, run - 1);
  const s = STILL_S - HOOK_D + (v * fm) / FPS;
  const seams = HOOK_SEAMS.filter((p) => p > s - 6);
  const ride = rideAt(fm / FPS, s, v, HOOK_SEAMS);
  // entrada con impulso: la imagen arranca 8 % más cerca y se asienta en 10 fotogramas
  const punch = interpolate(f, [0, 10], [1.08, 1], { extrapolateRight: "clamp", easing: EASE_OUT }) * (1 + 0.06 * (fm / run));
  const title = interpolate(f, [0, 6], [1.12, 1], { extrapolateRight: "clamp", easing: EASE_OUT });
  const pausar = ramp(f, T.hook.pausarAt, T.hook.pausarAt + 8);
  if (f >= run) return <AbsoluteFill style={{ backgroundColor: "#000" }} />;
  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      <AbsoluteFill style={{ scale: String(punch) }}>
        <DriveView s={s} travelPerFrame={v / FPS} ride={ride} seams={seams} barrierS={STILL_S} />
      </AbsoluteFill>
      <SpeedStreaks f={f} strength={1} />
      {/* velo oscuro detrás del título: se lee aunque la barrera llene la pantalla */}
      <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(0,0,0,0.62) 0%, rgba(0,0,0,0.5) 22%, rgba(0,0,0,0) 40%)" }} />
      <AbsoluteFill style={{ alignItems: "center", top: 226 }}>
        <div style={{ fontFamily: THEME.ui, fontWeight: 600, fontSize: 28, letterSpacing: 8, marginRight: -8, color: THEME.dim }}>TEST DE REFLEJOS</div>
        <div style={{ fontFamily: THEME.display, fontWeight: 800, fontSize: 140, lineHeight: 1, marginTop: 14, color: THEME.text, textShadow: "0 4px 30px rgba(0,0,0,0.7)", scale: String(title) }}>
          PAUSA EL VIDEO
        </div>
        <div style={{ fontFamily: THEME.ui, fontWeight: 600, fontSize: 46, marginTop: 14, color: THEME.text, textShadow: "0 2px 16px rgba(0,0,0,0.8)" }}>en cuanto veas la barrera</div>
        <div style={{ fontFamily: THEME.ui, fontWeight: 600, fontSize: 38, marginTop: 18, color: THEME.amber, opacity: pausar, translate: `0px ${interpolate(pausar, [0, 1], [8, 0])}px` }}>
          Pausar = frenar
        </div>
      </AbsoluteFill>
      <Cockpit lift={-ride.dy * 400}>
        <ClusterBrand sub={`${kmh} km/h`} />
      </Cockpit>
    </AbsoluteFill>
  );
};

/**
 * Cierre: misma barrera, misma distancia; solo cambia la velocidad (distancia de frenado ∝ v²).
 * Título con V1, barras con V2 ("crece con el cuadrado"), dato ×3 con V3. Todo sobre y = 1060
 * para dejar libre la banda de subtítulos.
 */
export const Reveal: React.FC = () => {
  const f = useCurrentFrame();
  const R = T.reveal;
  const title = ramp(f, 0, 10);
  const PX = 3.2; // px por metro
  const X0 = 120;
  const xb = X0 + D * PX;
  const rows = ROUNDS.map((r, i) => {
    const m = kmhToMs(r.speedKmh) ** 2 / (2 * DECEL_G * 9.81);
    return { kmh: r.speedKmh, m, y: 600 + i * 92, g: ramp(f, R.barsAt + i * 8, R.barsAt + 18 + i * 8) };
  });
  const fact = ramp(f, R.factAt, R.factAt + 12);
  const ratio = (ROUNDS[2].speedKmh / ROUNDS[0].speedKmh) ** 2;
  const out = 1 - ramp(f, R.duration - 8, R.duration);

  return (
    <AbsoluteFill style={{ backgroundColor: "#030406", opacity: out }}>
      <AbsoluteFill style={{ alignItems: "center", top: 236, opacity: title }}>
        <div style={{ fontFamily: THEME.display, fontWeight: 800, fontSize: 88, lineHeight: 1.02, color: THEME.text, textAlign: "center" }}>
          Misma barrera.
          <br />
          Misma distancia.
        </div>
        <div style={{ fontFamily: THEME.ui, fontWeight: 500, fontSize: 38, marginTop: 14, color: THEME.dim }}>Solo cambió la velocidad.</div>
      </AbsoluteFill>

      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
        <text x={X0} y={532} fill={THEME.dim} opacity={rows[0].g} style={{ fontFamily: THEME.ui, fontWeight: 500, fontSize: 28 }}>
          Distancia para frenar (sin contar la reacción)
        </text>
        <g opacity={rows[0].g}>
          <line x1={xb} x2={xb} y1={552} y2={806} stroke={THEME.amber} strokeWidth={3} strokeDasharray="10 8" />
          <text x={xb + 12} y={834} fill={THEME.amber} style={{ fontFamily: THEME.ui, fontWeight: 600, fontSize: 28 }}>barrera · {D} m</text>
        </g>
        {rows.map((row) => {
          const len = row.m * PX * row.g;
          const inside = Math.min(len, D * PX);
          return (
            <g key={row.kmh} opacity={Math.min(1, row.g * 3)}>
              <text x={X0} y={row.y - 14} fill={THEME.text} style={{ fontFamily: THEME.ui, fontWeight: 600, fontSize: 28 }}>{row.kmh} km/h</text>
              <text x={960} y={row.y - 12} textAnchor="end" fill={row.m > D ? THEME.red : THEME.text} style={{ fontFamily: THEME.display, fontWeight: 700, fontSize: 40 }}>
                {Math.round(row.m)} m
              </text>
              <rect x={X0} y={row.y} width={inside} height={22} rx={4} fill="rgba(238,241,244,0.78)" />
              {len > D * PX ? <rect x={xb} y={row.y} width={len - D * PX} height={22} rx={4} fill={THEME.red} /> : null}
            </g>
          );
        })}
      </svg>

      <AbsoluteFill style={{ alignItems: "center", top: 864, opacity: fact }}>
        <div style={{ fontFamily: THEME.display, fontWeight: 700, fontSize: 56, color: THEME.text, textAlign: "center", lineHeight: 1.08, translate: `0px ${interpolate(fact, [0, 1], [10, 0])}px` }}>
          +75 % de velocidad = <span style={{ color: THEME.red }}>{fmt(ratio, 0)} veces</span>
          <br />
          la distancia para frenar
        </div>
        <div style={{ fontFamily: THEME.ui, fontWeight: 500, fontSize: 28, marginTop: 14, color: THEME.dim, textAlign: "center", lineHeight: 1.35 }}>
          Estimación: frenada constante de 0,8 g en asfalto seco.
          <br />
          En Chile, el máximo en autopista es 120 km/h.
        </div>
      </AbsoluteFill>

      <Cockpit glow={0.5}>
        <ClusterBrand />
      </Cockpit>
    </AbsoluteFill>
  );
};

/** CTA: la pregunta entra con la voz (C1) y la invitación a compartir con C2; termina en el plano del gancho. */
export const Cta: React.FC = () => {
  const f = useCurrentFrame();
  const C = T.cta;
  const dur = C.duration;
  const dim = inOut(f, 0, 10, dur - 14, dur - 2);
  const title = inOut(f, C.titleAt - 2, C.titleAt + 8, dur - 16, dur - 6);
  const comment = inOut(f, C.commentAt - 2, C.commentAt + 8, dur - 16, dur - 6);
  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      <BarrierStill distance={HOOK_D} />
      <AbsoluteFill style={{ background: "rgba(2,3,6,0.6)", opacity: dim }} />
      <AbsoluteFill style={{ alignItems: "center", top: 236, opacity: title }}>
        <div style={{ fontFamily: THEME.display, fontWeight: 800, fontSize: 108, lineHeight: 1.0, color: THEME.text, textAlign: "center" }}>
          ¿A cuántos km/h
          <br />
          chocaste en la
          <br />
          <span style={{ color: THEME.red }}>ronda final</span>?
        </div>
        <div style={{ fontFamily: THEME.ui, fontWeight: 600, fontSize: 42, marginTop: 26, color: THEME.amber }}>Coméntalo</div>
      </AbsoluteFill>
      <AbsoluteFill style={{ alignItems: "center", top: 900, opacity: comment }}>
        <div style={{ fontFamily: THEME.ui, fontWeight: 500, fontSize: 40, color: THEME.text, textAlign: "center", lineHeight: 1.3 }}>
          Y mándaselo a quien
          <br />
          maneja rápido
        </div>
      </AbsoluteFill>
      <Cockpit>
        <ClusterBrand sub={SPEEDS} />
      </Cockpit>
    </AbsoluteFill>
  );
};
