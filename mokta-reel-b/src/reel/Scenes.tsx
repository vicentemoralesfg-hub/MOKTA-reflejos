import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { DriveView } from "../world/DriveView";
import { inOut, ramp } from "../lib/anim";
import { fmt, kmhToMs } from "../physics";
import { Cockpit } from "../prototipo/Cockpit";
import { THEME } from "../prototipo/theme";
import { ClusterBrand } from "./Hud";
import { D, DECEL_G, ROUNDS, T } from "./config";

/**
 * Plano fijo del gancho y del CTA: auto detenido frente a la barrera iluminada por los focos.
 * El CTA termina en el mismo plano con el que empieza el gancho (el reel se repite sin salto).
 */
const STILL_S = 9000;
const NO_RIDE = { dx: 0, dy: 0, pitchDeg: 0, rollDeg: 0 };
const SPEEDS = ROUNDS.map((r) => r.speedKmh).join(" · ") + " km/h";

const BarrierStill: React.FC = () => (
  <DriveView s={STILL_S} travelPerFrame={0} ride={NO_RIDE} seams={[]} barrierS={STILL_S + 24} />
);

export const Hook: React.FC = () => {
  const f = useCurrentFrame();
  const b = ramp(f, 10, 20);
  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      <BarrierStill />
      <AbsoluteFill style={{ alignItems: "center", top: 226 }}>
        <div style={{ fontFamily: THEME.ui, fontWeight: 600, fontSize: 28, letterSpacing: 8, marginRight: -8, color: THEME.dim }}>
          TEST DE REFLEJOS · 3 RONDAS
        </div>
        <div style={{ fontFamily: THEME.display, fontWeight: 800, fontSize: 136, lineHeight: 1, marginTop: 14, color: THEME.text, textShadow: "0 4px 30px rgba(0,0,0,0.6)" }}>
          PAUSA EL VIDEO
        </div>
        <div style={{ fontFamily: THEME.ui, fontWeight: 600, fontSize: 46, marginTop: 14, color: THEME.text }}>cuando veas esta barrera</div>
        <div style={{ fontFamily: THEME.ui, fontWeight: 500, fontSize: 36, marginTop: 18, color: THEME.dim, opacity: b, translate: `0px ${interpolate(b, [0, 1], [8, 0])}px` }}>
          Pausar = frenar
        </div>
      </AbsoluteFill>
      <Cockpit>
        <ClusterBrand sub={SPEEDS} />
      </Cockpit>
    </AbsoluteFill>
  );
};

/** Cierre: misma barrera, misma distancia; solo cambia la velocidad (distancia de frenado ∝ v²). */
export const Reveal: React.FC = () => {
  const f = useCurrentFrame();
  const title = ramp(f, 0, 10);
  const PX = 3.2; // px por metro
  const X0 = 120;
  const xb = X0 + D * PX;
  const rows = ROUNDS.map((r, i) => {
    const m = kmhToMs(r.speedKmh) ** 2 / (2 * DECEL_G * 9.81);
    return { kmh: r.speedKmh, m, y: 660 + i * 100, g: ramp(f, 22 + i * 12, 46 + i * 12) };
  });
  const fact = ramp(f, 76, 88);
  const ratio = (ROUNDS[2].speedKmh / ROUNDS[0].speedKmh) ** 2;
  const out = 1 - ramp(f, T.reveal.duration - 8, T.reveal.duration);

  return (
    <AbsoluteFill style={{ backgroundColor: "#030406", opacity: out }}>
      <AbsoluteFill style={{ alignItems: "center", top: 290, opacity: title }}>
        <div style={{ fontFamily: THEME.display, fontWeight: 800, fontSize: 92, lineHeight: 1.02, color: THEME.text, textAlign: "center" }}>
          Misma barrera.
          <br />
          Misma distancia.
        </div>
        <div style={{ fontFamily: THEME.ui, fontWeight: 500, fontSize: 40, marginTop: 16, color: THEME.dim }}>Solo cambió la velocidad.</div>
      </AbsoluteFill>

      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
        <text x={X0} y={590} fill={THEME.dim} opacity={rows[0].g} style={{ fontFamily: THEME.ui, fontWeight: 500, fontSize: 26 }}>
          Distancia para frenar (sin contar la reacción)
        </text>
        {/* línea de la barrera */}
        <g opacity={rows[0].g}>
          <line x1={xb} x2={xb} y1={612} y2={912} stroke={THEME.amber} strokeWidth={3} strokeDasharray="10 8" />
          <text x={xb + 12} y={940} fill={THEME.amber} style={{ fontFamily: THEME.ui, fontWeight: 600, fontSize: 25 }}>barrera · {D} m</text>
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

      <AbsoluteFill style={{ alignItems: "center", top: 990, opacity: fact }}>
        <div style={{ fontFamily: THEME.display, fontWeight: 700, fontSize: 56, color: THEME.text, textAlign: "center", lineHeight: 1.1 }}>
          +75 % de velocidad = <span style={{ color: THEME.red }}>{fmt(ratio, 0)} veces</span>
          <br />
          la distancia para frenar
        </div>
        <div style={{ fontFamily: THEME.ui, fontWeight: 400, fontSize: 24, marginTop: 22, color: THEME.faint, textAlign: "center", lineHeight: 1.45 }}>
          Física básica: la distancia de frenado crece con el cuadrado de la velocidad.
          <br />
          Estimación con frenada constante de 0,8 g en asfalto seco.
        </div>
      </AbsoluteFill>

      <Cockpit glow={0.5}>
        <ClusterBrand />
      </Cockpit>
    </AbsoluteFill>
  );
};

export const Cta: React.FC = () => {
  const f = useCurrentFrame();
  const dur = T.cta.duration;
  // entra sobre el plano oscurecido y, al final, vuelve al plano limpio del gancho (bucle)
  const dim = inOut(f, 0, 10, dur - 14, dur - 2);
  const text = inOut(f, 4, 14, dur - 16, dur - 6);
  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      <BarrierStill />
      <AbsoluteFill style={{ background: "rgba(2,3,6,0.6)", opacity: dim }} />
      <AbsoluteFill style={{ alignItems: "center", top: 236, opacity: text }}>
        <div style={{ fontFamily: THEME.display, fontWeight: 800, fontSize: 108, lineHeight: 1.0, color: THEME.text, textAlign: "center" }}>
          ¿A cuántos km/h
          <br />
          chocaste en la
          <br />
          <span style={{ color: THEME.red }}>ronda final</span>?
        </div>
      </AbsoluteFill>
      <AbsoluteFill style={{ alignItems: "center", top: 900, opacity: text }}>
        <div style={{ fontFamily: THEME.ui, fontWeight: 600, fontSize: 42, color: THEME.text }}>Coméntalo</div>
        <div style={{ fontFamily: THEME.ui, fontWeight: 500, fontSize: 36, marginTop: 10, color: THEME.dim }}>
          y envíaselo a quien maneja rápido
        </div>
      </AbsoluteFill>
      <Cockpit>
        <ClusterBrand sub={SPEEDS} />
      </Cockpit>
    </AbsoluteFill>
  );
};
