import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { DriveView } from "../world/DriveView";
import { EASE_IN_OUT, inOut, ramp } from "../lib/anim";
import { fmt, kmhToMs } from "../physics";
import { Cockpit } from "../prototipo/Cockpit";
import { THEME } from "../prototipo/theme";
import { ClusterBrand } from "./Hud";
import { D, DECEL_G, ROUNDS, T } from "./config";

/**
 * Plano fijo del gancho y del CTA: auto detenido frente a la barrera iluminada por los focos.
 * En el gancho la cámara avanza muy despacio hacia la barrera (de 30 a 22 m) mientras habla la voz;
 * el CTA termina en el plano inicial del gancho, así el reel se repite sin salto.
 */
const STILL_S = 9000;
const NO_RIDE = { dx: 0, dy: 0, pitchDeg: 0, rollDeg: 0 };
const SPEEDS = ROUNDS.map((r) => r.speedKmh).join(" · ") + " km/h";
const FAR = 30;
const NEAR = 22;

const BarrierStill: React.FC<{ distance: number }> = ({ distance }) => (
  <DriveView s={STILL_S - distance} travelPerFrame={0} ride={NO_RIDE} seams={[]} barrierS={STILL_S} />
);

export const Hook: React.FC = () => {
  const f = useCurrentFrame();
  const dur = T.hook.duration;
  const dist = interpolate(f, [0, dur], [FAR, NEAR], { easing: EASE_IN_OUT });
  const pausar = ramp(f, T.hook.pausarAt, T.hook.pausarAt + 10);
  const rondas = ramp(f, T.hook.rondasAt, T.hook.rondasAt + 10);
  const out = 1 - ramp(f, dur - 8, dur);
  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      <BarrierStill distance={dist} />
      <AbsoluteFill style={{ alignItems: "center", top: 226, opacity: out }}>
        <div style={{ fontFamily: THEME.ui, fontWeight: 600, fontSize: 28, letterSpacing: 8, marginRight: -8, color: THEME.dim }}>TEST DE REFLEJOS</div>
        <div style={{ fontFamily: THEME.display, fontWeight: 800, fontSize: 136, lineHeight: 1, marginTop: 14, color: THEME.text, textShadow: "0 4px 30px rgba(0,0,0,0.6)" }}>
          PAUSA EL VIDEO
        </div>
        <div style={{ fontFamily: THEME.ui, fontWeight: 600, fontSize: 46, marginTop: 14, color: THEME.text }}>cuando veas esta barrera</div>
        <div style={{ fontFamily: THEME.ui, fontWeight: 600, fontSize: 38, marginTop: 18, color: THEME.amber, opacity: pausar, translate: `0px ${interpolate(pausar, [0, 1], [8, 0])}px` }}>
          Pausar = frenar
        </div>
      </AbsoluteFill>
      <AbsoluteFill style={{ alignItems: "center", top: 860, opacity: rondas * out }}>
        <div style={{ display: "flex", gap: 18, translate: `0px ${interpolate(rondas, [0, 1], [10, 0])}px` }}>
          {ROUNDS.map((r, i) => (
            <div
              key={r.id}
              style={{
                fontFamily: THEME.display,
                fontWeight: 700,
                fontSize: 44,
                color: THEME.text,
                padding: "6px 20px",
                borderRadius: 12,
                background: "rgba(5,7,11,0.72)",
                border: "1px solid rgba(255,255,255,0.12)",
                opacity: ramp(f, T.hook.rondasAt + i * 5, T.hook.rondasAt + i * 5 + 8),
              }}
            >
              {r.speedKmh} <span style={{ fontSize: 26, color: THEME.dim }}>km/h</span>
            </div>
          ))}
        </div>
      </AbsoluteFill>
      <Cockpit>
        <ClusterBrand sub={SPEEDS} />
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
    return { kmh: r.speedKmh, m, y: 600 + i * 92, g: ramp(f, R.barsAt + i * 14, R.barsAt + 24 + i * 14) };
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
        <text x={X0} y={532} fill={THEME.dim} opacity={rows[0].g} style={{ fontFamily: THEME.ui, fontWeight: 500, fontSize: 26 }}>
          Distancia para frenar (sin contar la reacción)
        </text>
        <g opacity={rows[0].g}>
          <line x1={xb} x2={xb} y1={552} y2={806} stroke={THEME.amber} strokeWidth={3} strokeDasharray="10 8" />
          <text x={xb + 12} y={832} fill={THEME.amber} style={{ fontFamily: THEME.ui, fontWeight: 600, fontSize: 25 }}>barrera · {D} m</text>
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

      <AbsoluteFill style={{ alignItems: "center", top: 870, opacity: fact }}>
        <div style={{ fontFamily: THEME.display, fontWeight: 700, fontSize: 56, color: THEME.text, textAlign: "center", lineHeight: 1.08, translate: `0px ${interpolate(fact, [0, 1], [10, 0])}px` }}>
          +75 % de velocidad = <span style={{ color: THEME.red }}>{fmt(ratio, 0)} veces</span>
          <br />
          la distancia para frenar
        </div>
        <div style={{ fontFamily: THEME.ui, fontWeight: 400, fontSize: 24, marginTop: 14, color: THEME.faint, textAlign: "center" }}>
          Estimación: frenada constante de 0,8 g en asfalto seco.
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
      <BarrierStill distance={FAR} />
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
