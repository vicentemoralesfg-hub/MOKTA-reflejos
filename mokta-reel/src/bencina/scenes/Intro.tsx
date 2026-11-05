import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { Gauge } from "../components/Gauge";
import { TankG } from "../components/Tank";
import { BACK, C, EASE_IN, EASE_OUT, FONT_D, FONT_UI, lerpT, ramp } from "../theme";
import { BOX, fuelForNeedle, needleForFuel } from "../tankModel";
import { W, cue } from "../timing";

/* ---------------------------------------------------------------- utilidades */
const blink = (t: number, from: number, period = 7) => (Math.floor((t - from) / period) % 2 === 0 ? 1 : 0.25);

/** Palabras de la locución en grande, iluminándose al ser dichas. */
const KineticLines: React.FC<{
  lines: [number, string, boolean?][][];
  size: number;
  top: number;
  lead?: number;
  dimOpacity?: number;
  style?: React.CSSProperties;
}> = ({ lines, size, top, lead = 3, dimOpacity = 0.42, style }) => {
  const t = useCurrentFrame();
  return (
    <div style={{ position: "absolute", top, left: 60, right: 60, textAlign: "center", ...style }}>
      {lines.map((line, li) => (
        <div key={li} style={{ display: "flex", justifyContent: "center", gap: size * 0.3, lineHeight: 1.0 }}>
          {line.map(([wi, text, key]) => {
            const on = t >= W(wi) - lead;
            const k = W(wi) - lead <= 0 ? 1 : ramp(t, W(wi) - lead, W(wi) - lead + 6, BACK);
            return (
              <span
                key={wi}
                style={{
                  fontFamily: FONT_D,
                  fontWeight: 800,
                  fontSize: size,
                  color: key && on ? C.fuel : C.white,
                  opacity: on ? 1 : dimOpacity,
                  display: "inline-block",
                  scale: String(on ? interpolate(k, [0, 1], [1.18, 1]) : 1),
                  textShadow: on && key ? `0 0 34px ${C.fuel}66` : "0 6px 30px rgba(0,0,0,0.6)",
                }}
              >
                {text}
              </span>
            );
          })}
        </div>
      ))}
    </div>
  );
};

/* ===================================================================== GANCHO */
export const Hook: React.FC = () => {
  const t = useCurrentFrame();
  const dive = cue("hookDive");
  const diveEnd = cue("hookDiveEnd");
  const stamp = cue("stamp");
  let v: number;
  if (t < dive) v = 0.27 + 0.014 * Math.sin(t * 0.9) + 0.008 * Math.sin(t * 2.3);
  else if (t < diveEnd) v = 0.27 - 0.3 * ramp(t, dive, diveEnd, EASE_IN);
  else v = -0.03 + 0.035 * Math.exp(-(t - diveEnd) / 6) * Math.sin((t - diveEnd) * 1.1);
  const lampOn = t >= dive ? dive + (diveEnd - dive) * 0.62 : Infinity;
  const lamp = t >= lampOn ? blink(t, lampOn) : 0;
  const range = Math.round(lerpT(t, dive, diveEnd, 84, 0, EASE_IN));
  const out = ramp(t, stamp - 4, stamp + 3);
  const st = ramp(t, stamp, stamp + 6, EASE_OUT);

  return (
    <AbsoluteFill>
      <div style={{ opacity: 1 - out, translate: `0px ${-60 * out}px` }}>
        <KineticLines
          top={250}
          size={98}
          lines={[
            [[0, "¿POR"], [1, "QUÉ"], [2, "LOS"], [3, "ÚLTIMOS", true]],
            [[4, "KILÓMETROS"], [5, "DE"], [6, "BENCINA"]],
            [[7, "PARECEN"], [8, "DESAPARECER", true]],
            [[9, "MUCHO"], [10, "MÁS"], [11, "RÁPIDO?", true]],
          ]}
        />
      </div>
      {/* sello */}
      {t >= stamp ? (
        <div
          style={{
            position: "absolute",
            top: 300,
            left: 0,
            right: 0,
            display: "flex",
            justifyContent: "center",
            opacity: st,
          }}
        >
          <div
            style={{
              border: `10px solid ${C.red}`,
              borderRadius: 26,
              padding: "14px 40px 20px",
              rotate: "-4deg",
              scale: String(interpolate(st, [0, 1], [1.9, 1])),
              background: "rgba(255,59,59,0.10)",
              boxShadow: `0 0 60px ${C.red}55`,
              textAlign: "center",
            }}
          >
            <div style={{ fontFamily: FONT_D, fontWeight: 800, fontSize: 112, lineHeight: 1, color: C.white }}>
              NO ES TU
            </div>
            <div style={{ fontFamily: FONT_D, fontWeight: 800, fontSize: 132, lineHeight: 1, color: C.red }}>
              IMAGINACIÓN
            </div>
          </div>
        </div>
      ) : null}
      <Gauge cx={540} cy={1010} size={640} value={v} lamp={lamp} />
      {/* autonomía */}
      <div style={{ position: "absolute", top: 1345, left: 0, right: 0, textAlign: "center" }}>
        <div style={{ fontFamily: FONT_UI, fontWeight: 700, fontSize: 30, letterSpacing: 8, color: C.dim }}>AUTONOMÍA</div>
        <div
          style={{
            fontFamily: FONT_D,
            fontWeight: 800,
            fontSize: 112,
            lineHeight: 1,
            color: range <= 10 ? C.red : C.white,
            opacity: range <= 0 ? blink(t, diveEnd, 8) : 1,
            fontVariantNumeric: "tabular-nums",
          }}
        >
          {range} km
        </div>
      </div>
    </AbsoluteFill>
  );
};

/* =============================================================== PLANTEAMIENTO */
export const KM_TANK = 600; // autonomía de ejemplo con el estanque lleno (50 L · 12 km/L)
const KM_DEAD = KM_TANK * (1 - fuelForNeedle(0.995));
const KM_HALF = KM_TANK * (1 - fuelForNeedle(0.5));
const KM_E = KM_TANK * (1 - fuelForNeedle(0.002));

const StatCard: React.FC<{ k: number; title: string; value: number; color: string }> = ({ k, title, value, color }) => (
  <div
    style={{
      opacity: k,
      translate: `0px ${interpolate(k, [0, 1], [24, 0])}px`,
      padding: "14px 30px",
      borderRadius: 22,
      background: C.panel,
      border: `3px solid ${color}`,
      textAlign: "center",
      minWidth: 330,
    }}
  >
    <div style={{ fontFamily: FONT_UI, fontWeight: 700, fontSize: 26, letterSpacing: 5, color: C.dim }}>{title}</div>
    <div style={{ fontFamily: FONT_D, fontWeight: 800, fontSize: 78, lineHeight: 1, color }}>
      {Math.round(value)} km
    </div>
  </div>
);

export const Setup: React.FC = () => {
  const t = useCurrentFrame();
  const refill = cue("refill");
  const refillEnd = cue("refillEnd");
  const kmRun = cue("kmRun");
  const kmRunEnd = cue("kmRunEnd");
  const half = cue("half");
  const halfEnd = cue("halfEnd");
  const crash = cue("crash");
  const crashEnd = cue("crashEnd");

  let km = 0;
  if (t >= crash) km = lerpT(t, crash, crashEnd, KM_HALF, KM_E, EASE_IN);
  else if (t >= half) km = lerpT(t, half, halfEnd, KM_DEAD, KM_HALF);
  else if (t >= kmRun) km = lerpT(t, kmRun, kmRunEnd, 0, KM_DEAD);
  let v = needleForFuel(1 - km / KM_TANK);
  if (t < refillEnd + 6) {
    const p = ramp(t, refill, refillEnd, EASE_OUT);
    v = p * 1.0 + 0.03 * Math.sin(ramp(t, refillEnd - 4, refillEnd + 6) * Math.PI);
  } else if (t < half) {
    v = 1 - 0.004 * Math.abs(Math.sin(t * 1.7));
  }
  if (t >= crashEnd) v = -0.02;
  const lampOn = crash + Math.round((crashEnd - crash) * 0.75);
  const lamp = t >= lampOn ? blink(t, lampOn) : 0;
  const stat1 = ramp(t, halfEnd - 4, halfEnd + 6, EASE_OUT);
  const stat2 = ramp(t, crashEnd - 6, crashEnd + 4, EASE_OUT);
  const red = ramp(t, crash, crashEnd) * (1 - ramp(t, crashEnd + 6, crashEnd + 20));


  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ background: `radial-gradient(70% 50% at 50% 50%, rgba(255,59,59,${0.28 * red}) 0%, rgba(0,0,0,0) 70%)` }} />
      <div style={{ position: "absolute", top: 210, left: 0, right: 0, textAlign: "center" }}>
        <div style={{ fontFamily: FONT_UI, fontWeight: 700, fontSize: 30, letterSpacing: 8, color: C.cyan }}>KM RECORRIDOS</div>
        <div
          style={{
            fontFamily: FONT_D,
            fontWeight: 800,
            fontSize: 150,
            lineHeight: 1,
            color: C.white,
            fontVariantNumeric: "tabular-nums",
          }}
        >
          {String(Math.round(km)).padStart(3, "0")}
        </div>
      </div>
      <Gauge
        cx={540}
        cy={830}
        size={660}
        value={v}
        lamp={lamp}
        tickGlow={t >= half ? { v: 0.5, amount: 1 } : null}
        band={t >= refill && t < kmRunEnd ? { from: 0, to: Math.max(0.001, Math.min(1, v)), color: C.fuel, opacity: 0.55 } : null}
      />
      <div style={{ position: "absolute", top: 1190, left: 0, right: 0, display: "flex", justifyContent: "center", gap: 28 }}>
        <StatCard k={stat1} title="1ª MITAD" value={KM_HALF} color={C.white} />
        <StatCard k={stat2} title="2ª MITAD" value={KM_E - KM_HALF} color={C.red} />
      </div>
    </AbsoluteFill>
  );
};

/* ===================================================================== SECRETO */
export const Secret: React.FC<{ from: number }> = ({ from }) => {
  const t = useCurrentFrame();
  const shrink = ramp(t, from, from + 12, EASE_OUT);
  const strike = cue("strike");
  const altura = cue("altura");
  const part2 = W(38) - 3;
  const out1 = ramp(t, part2, part2 + 8, EASE_OUT);
  const litrosIn = ramp(t, W(37) - 3, W(37) + 5, BACK);
  const strikeK = ramp(t, strike, strike + 6, EASE_OUT);
  const tankIn = ramp(t, part2 + 2, part2 + 12, EASE_OUT);
  const ruler = ramp(t, altura - 6, altura + 10, EASE_OUT);
  const altK = ramp(t, altura, altura + 7, EASE_OUT);
  const level = 0.62;
  const sx = 0.82;
  const tx = 540 - 500 * sx;
  const ty = 1010 - 450 * sx;
  const surfaceY = ty + (700 - level * 500) * sx;
  const bottomY = ty + 700 * sx;

  return (
    <AbsoluteFill>
      {/* parte 1: el marcador no mide litros */}
      <div style={{ opacity: 1 - out1, translate: `${-160 * out1}px 0px` }}>
        <div
          style={{
            position: "absolute",
            top: 230,
            left: 0,
            right: 0,
            textAlign: "center",
            fontFamily: FONT_UI,
            fontWeight: 700,
            fontSize: 40,
            letterSpacing: 12,
            color: C.cyan,
            opacity: ramp(t, W(31) - 3, W(31) + 4),
          }}
        >
          EL SECRETO
        </div>
        <Gauge
          cx={540}
          cy={interpolate(shrink, [0, 1], [830, 560])}
          size={interpolate(shrink, [0, 1], [660, 420])}
          value={0.5 + 0.03 * Math.sin(t * 0.25)}
        />
        <KineticLines
          top={810}
          size={86}
          dimOpacity={0}
          lines={[[[33, "TU"], [34, "MARCADOR"], [35, "NO"], [36, "MIDE"]]]}
        />
        <div
          style={{
            position: "absolute",
            top: 920,
            left: 0,
            right: 0,
            display: "flex",
            justifyContent: "center",
            opacity: litrosIn,
          }}
        >
          <div style={{ position: "relative", scale: String(interpolate(litrosIn, [0, 1], [1.3, 1])) }}>
            <div
              style={{
                fontFamily: FONT_D,
                fontWeight: 800,
                fontSize: 250,
                lineHeight: 1,
                color: strikeK > 0 ? `rgba(244,246,248,${1 - 0.55 * strikeK})` : C.white,
              }}
            >
              LITROS
            </div>
            <div
              style={{
                position: "absolute",
                left: -20,
                top: "50%",
                height: 22,
                width: `calc(${strikeK * 100}% + 40px)`,
                background: C.red,
                borderRadius: 11,
                rotate: "-6deg",
                boxShadow: `0 0 30px ${C.red}`,
              }}
            />
          </div>
        </div>
      </div>

      {/* parte 2: mide ALTURA */}
      {t >= part2 ? (
        <>
          <div style={{ position: "absolute", top: 220, left: 0, right: 0, textAlign: "center", opacity: tankIn }}>
            <div style={{ fontFamily: FONT_D, fontWeight: 800, fontSize: 96, lineHeight: 1, color: C.white }}>MIDE</div>
            <div
              style={{
                fontFamily: FONT_D,
                fontWeight: 800,
                fontSize: 230,
                lineHeight: 0.95,
                color: C.fuel,
                opacity: altK,
                scale: String(interpolate(altK, [0, 1], [1.8, 1])),
                textShadow: `0 0 60px ${C.fuel}88`,
              }}
            >
              ALTURA
            </div>
          </div>
          <svg width={1080} height={1920} style={{ position: "absolute", inset: 0, opacity: tankIn }}>
            <g transform={`translate(${tx} ${ty + 60 * (1 - tankIn)}) scale(${sx})`}>
              <TankG shape={BOX} level={level} t={t} />
            </g>
            {/* regla de altura */}
            <g opacity={ruler}>
              {Array.from({ length: 11 }).map((_, k) => {
                const y = bottomY - (k / 10) * (bottomY - (ty + 200 * sx));
                return <line key={k} x1={96} x2={k % 5 === 0 ? 150 : 128} y1={y} y2={y} stroke={C.dim} strokeWidth={k % 5 === 0 ? 5 : 3} />;
              })}
              <line x1={96} x2={96} y1={bottomY} y2={ty + 200 * sx} stroke={C.dim} strokeWidth={4} />
              <line
                x1={190}
                x2={190}
                y1={bottomY - 6}
                y2={bottomY - (bottomY - surfaceY) * ruler + 14}
                stroke={C.fuel}
                strokeWidth={12}
                strokeLinecap="round"
              />
              <polygon
                points={`${190 - 26},${bottomY - (bottomY - surfaceY) * ruler + 30} ${190 + 26},${bottomY - (bottomY - surfaceY) * ruler + 30} 190,${bottomY - (bottomY - surfaceY) * ruler - 6}`}
                fill={C.fuel}
              />
              <line x1={150} x2={990} y1={surfaceY} y2={surfaceY} stroke={C.fuelLight} strokeWidth={3} strokeDasharray="14 12" opacity={ruler} />
            </g>
          </svg>
        </>
      ) : null}
    </AbsoluteFill>
  );
};
