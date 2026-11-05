import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { Gauge } from "../components/Gauge";
import { Callout, TankG } from "../components/Tank";
import { ReasonChip } from "../components/Common";
import { BACK, C, EASE_IN, EASE_IN_OUT, EASE_OUT, FONT_D, FONT_UI, lerpT, ramp } from "../theme";
import { BOX, CAPACITY_L, RESERVE, needleForFuel } from "../tankModel";
import { W, cue } from "../timing";

const blink = (t: number, from: number, period = 7) => (Math.floor((t - from) / period) % 2 === 0 ? 1 : 0.25);

/* ================================================================ RAZÓN 3 */
export const Reason3: React.FC = () => {
  const t = useCurrentFrame();
  const calib = cue("calib");
  const holdA = cue("holdTop");
  const holdB = cue("holdTopEnd");
  const empA = cue("toEmpty");
  const empB = cue("toEmptyEnd");
  const reserve = cue("reserve");
  const FUEL_HOLD = 0.83;
  let fuel = 1;
  if (t >= empA) fuel = lerpT(t, empA, empB, FUEL_HOLD, RESERVE, EASE_IN);
  else if (t >= holdA) fuel = lerpT(t, holdA, holdB, 1, FUEL_HOLD, EASE_IN_OUT);
  let v = needleForFuel(fuel);
  if (t >= calib && t < calib + 30) v = 1 - Math.sin(Math.PI * ramp(t, calib, calib + 30, EASE_IN_OUT));
  const lampOn = empA + Math.round((empB - empA) * 0.8);
  const lamp = t >= lampOn ? blink(t, lampOn) : 0;
  const calibK = ramp(t, calib - 2, calib + 8, BACK) * (1 - ramp(t, holdA - 6, holdA + 2));
  const holdK = ramp(t, holdA, holdA + 8, EASE_OUT) * (1 - ramp(t, empA + 4, empA + 12));
  const resK = ramp(t, reserve - 2, reserve + 8, BACK);
  const eK = ramp(t, empB - 2, empB + 8, BACK);
  const liters = fuel * CAPACITY_L;
  const barX = 140;
  const barW = 800;
  const gear = (t - calib) * 6;

  return (
    <AbsoluteFill>
      <ReasonChip n={3} title="CALIBRADA A PROPÓSITO" at={cue("r3")} />
      <Gauge
        cx={540}
        cy={720}
        size={600}
        value={v}
        lamp={lamp}
        band={holdK > 0 ? { from: 0.84, to: 1, color: C.fuel, opacity: 0.9 * holdK } : null}
      />
      {/* ajuste de fábrica */}
      <div
        style={{
          position: "absolute",
          top: 1030,
          left: 0,
          right: 0,
          display: "flex",
          justifyContent: "center",
          opacity: calibK,
          scale: String(interpolate(calibK, [0, 1], [0.7, 1])),
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 18, padding: "10px 28px", borderRadius: 18, background: C.panel, border: `3px solid ${C.cyan}` }}>
          <svg width={54} height={54} viewBox="-30 -30 60 60" style={{ rotate: `${gear}deg` }}>
            {Array.from({ length: 8 }).map((_, k) => (
              <rect key={k} x={-5} y={-28} width={10} height={14} rx={2} fill={C.cyan} transform={`rotate(${k * 45})`} />
            ))}
            <circle r={17} fill="none" stroke={C.cyan} strokeWidth={8} />
          </svg>
          <div style={{ fontFamily: FONT_D, fontWeight: 800, fontSize: 56, color: C.cyan }}>AJUSTE DE FÁBRICA</div>
        </div>
      </div>
      {/* aguanta arriba */}
      <div
        style={{
          position: "absolute",
          top: 448,
          left: 760,
          fontFamily: FONT_D,
          fontWeight: 800,
          fontSize: 60,
          color: C.fuel,
          opacity: holdK,
          rotate: "18deg",
          textShadow: "0 4px 18px rgba(0,0,0,0.8)",
        }}
      >
        AGUANTA
      </div>
      {/* E no es cero */}
      <div
        style={{
          position: "absolute",
          top: 452,
          left: 120,
          padding: "6px 18px",
          borderRadius: 14,
          background: C.red,
          fontFamily: FONT_D,
          fontWeight: 800,
          fontSize: 52,
          color: C.white,
          rotate: "-18deg",
          opacity: eK,
          scale: String(interpolate(eK, [0, 1], [0.6, 1])),
        }}
      >
        E ≠ 0 L
      </div>
      {/* barra de litros reales */}
      <div style={{ position: "absolute", top: 1130, left: barX, width: barW, opacity: ramp(t, holdA - 8, holdA) }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
          <div style={{ fontFamily: FONT_UI, fontWeight: 700, fontSize: 28, letterSpacing: 6, color: C.dim }}>LITROS REALES</div>
          <div style={{ fontFamily: FONT_D, fontWeight: 800, fontSize: 74, color: C.fuel, fontVariantNumeric: "tabular-nums", lineHeight: 1 }}>
            {Math.round(liters)} L
          </div>
        </div>
        <div style={{ position: "relative", height: 64, borderRadius: 18, background: "rgba(244,246,248,0.08)", border: "3px solid rgba(244,246,248,0.3)", marginTop: 8, overflow: "hidden" }}>
          <div
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              bottom: 0,
              width: `${fuel * 100}%`,
              background: `linear-gradient(90deg, ${C.fuelDeep}, ${C.fuel})`,
              boxShadow: resK > 0 ? `0 0 ${40 * resK}px ${C.fuel}` : undefined,
              opacity: resK > 0 ? 0.75 + 0.25 * Math.sin(t * 0.5) : 1,
            }}
          />
        </div>
        <div
          style={{
            marginTop: 12,
            fontFamily: FONT_D,
            fontWeight: 800,
            fontSize: 54,
            color: C.fuel,
            opacity: resK,
            translate: `0px ${interpolate(resK, [0, 1], [16, 0])}px`,
          }}
        >
          ↑ RESERVA: TODAVÍA QUEDA BENCINA
        </div>
      </div>
    </AbsoluteFill>
  );
};

/* ============================================================== CONCLUSIÓN */
const KM_TANK = 600;
export const Payoff: React.FC = () => {
  const t = useCurrentFrame();
  const x0 = 150;
  const x1 = 930;
  const yT = 430;
  const yB = 1110;
  const X = (km: number) => x0 + (km / KM_TANK) * (x1 - x0);
  const Y = (v: number) => yB - v * (yB - yT);
  const p1 = ramp(t, cue("realLine"), cue("realLineEnd"), EASE_IN_OUT);
  const p2 = ramp(t, cue("needleCurve"), cue("needleCurveEnd"), EASE_IN_OUT);
  const same = ramp(t, cue("sameRate"), cue("sameRate") + 10, EASE_OUT);
  const axes = ramp(t, W(149) - 3, W(149) + 8, EASE_OUT);
  const curve: string[] = [];
  for (let km = 0; km <= KM_TANK; km += 6) curve.push(`${X(km).toFixed(1)},${Y(needleForFuel(1 - km / KM_TANK)).toFixed(1)}`);
  const curvePath = `M${curve.join(" L")}`;
  const area = `${curvePath} L${X(KM_TANK)},${Y(0)} L${X(0)},${Y(1)} Z`;
  const headKm1 = KM_TANK * p1;
  const headKm2 = KM_TANK * p2;

  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", top: 222, left: 0, right: 0, textAlign: "center", opacity: axes }}>
        <div style={{ fontFamily: FONT_D, fontWeight: 800, fontSize: 82, lineHeight: 1, color: C.white }}>
          <span style={{ color: C.fuel }}>BENCINA</span> VS. <span style={{ color: C.red, opacity: ramp(t, cue("needleCurve") - 4, cue("needleCurve") + 4) }}>AGUJA</span>
        </div>
      </div>
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
        <defs>
          <clipPath id="p1clip">
            <rect x={0} y={0} width={X(headKm1) + 4} height={1920} />
          </clipPath>
          <clipPath id="p2clip">
            <rect x={0} y={0} width={X(headKm2) + 4} height={1920} />
          </clipPath>
        </defs>
        <g opacity={axes}>
          {[0.25, 0.5, 0.75, 1].map((v) => (
            <line key={v} x1={x0} x2={x1} y1={Y(v)} y2={Y(v)} stroke="rgba(244,246,248,0.08)" strokeWidth={2} />
          ))}
          <line x1={x0} x2={x0} y1={yT - 20} y2={yB} stroke={C.line} strokeWidth={5} />
          <line x1={x0} x2={x1 + 20} y1={yB} y2={yB} stroke={C.line} strokeWidth={5} />
          <text x={x0 - 18} y={Y(1) + 14} textAnchor="end" fontFamily={FONT_D} fontWeight={800} fontSize={44} fill={C.white}>F</text>
          <text x={x0 - 18} y={Y(0) + 14} textAnchor="end" fontFamily={FONT_D} fontWeight={800} fontSize={44} fill={C.red}>E</text>
          <text x={x1 + 10} y={yB + 62} textAnchor="end" fontFamily={FONT_UI} fontWeight={700} fontSize={30} letterSpacing={4} fill={C.dim}>
            KM RECORRIDOS →
          </text>
        </g>
        {/* área de diferencia */}
        <path d={area} fill={C.red} opacity={0.16 * p2} clipPath="url(#p2clip)" />
        {/* consumo real (recto) */}
        <g clipPath="url(#p1clip)">
          <line x1={X(0)} y1={Y(1)} x2={X(KM_TANK)} y2={Y(0)} stroke={C.fuel} strokeWidth={12} strokeLinecap="round" />
        </g>
        {p1 > 0 && p1 < 1 ? <circle cx={X(headKm1)} cy={Y(1 - headKm1 / KM_TANK)} r={16} fill={C.fuelLight} /> : null}
        {/* escalones iguales */}
        <g opacity={same}>
          {[0, 100, 200, 300, 400, 500].map((km) => {
            const a = 1 - km / KM_TANK;
            const b = 1 - (km + 100) / KM_TANK;
            return (
              <path
                key={km}
                d={`M${X(km)},${Y(a)} L${X(km + 100)},${Y(a)} L${X(km + 100)},${Y(b)}`}
                stroke={C.fuelLight}
                strokeWidth={4}
                strokeDasharray="8 8"
                fill="none"
              />
            );
          })}
        </g>
        {/* aguja */}
        <g clipPath="url(#p2clip)">
          <path d={curvePath} stroke={C.red} strokeWidth={13} fill="none" strokeLinejoin="round" strokeLinecap="round" style={{ filter: `drop-shadow(0 0 12px ${C.red}88)` }} />
        </g>
        {p2 > 0 && p2 < 1 ? <circle cx={X(headKm2)} cy={Y(needleForFuel(1 - headKm2 / KM_TANK))} r={16} fill={C.white} /> : null}
        <Callout ax={X(250)} ay={Y(1 - 250 / KM_TANK)} lx={330} ly={1010} text="CONSUMO PAREJO" p={same} color={C.fuel} size={46} />
        <Callout
          ax={X(470)}
          ay={Y(needleForFuel(1 - 470 / KM_TANK))}
          lx={790}
          ly={560}
          text="SE DESPLOMA"
          p={ramp(t, cue("needleCurveEnd") - 6, cue("needleCurveEnd") + 10, (x) => x)}
          color={C.red}
          size={46}
        />
      </svg>
    </AbsoluteFill>
  );
};

/* ================================================================== CONSEJO */
export const Tip: React.FC<{ from: number }> = ({ from }) => {
  const t = useCurrentFrame();
  const warn = cue("warn");
  const pumpAt = cue("pump");
  const coolAt = cue("cooling");
  const heatAt = cue("heat");
  const h = lerpT(t, from, heatAt + 18, 0.42, 0.06, EASE_IN_OUT);
  const heatK = Math.max(0, Math.min(1, (0.24 - h) / 0.16));
  const cool = ramp(t, coolAt - 2, coolAt + 8) * (1 - heatK);
  const wK = ramp(t, warn - 2, warn + 7, BACK);
  const s = 1.0;
  const tx = 540 - 500 * s;
  const ty = 905 - 450 * s;

  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ background: `radial-gradient(60% 40% at 50% 60%, rgba(255,59,59,${0.22 * heatK}) 0%, rgba(0,0,0,0) 70%)` }} />
      <div style={{ position: "absolute", top: 214, left: 0, right: 0, display: "flex", justifyContent: "center", opacity: wK }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 22,
            padding: "14px 34px",
            borderRadius: 24,
            background: "rgba(255,176,32,0.12)",
            border: `5px solid ${C.fuel}`,
            scale: String(interpolate(wK, [0, 1], [1.5, 1])),
          }}
        >
          <svg width={96} height={86} viewBox="0 0 100 90">
            <path d="M50 6 L95 84 L5 84 Z" fill={C.fuel} stroke={C.fuel} strokeWidth={6} strokeLinejoin="round" />
            <rect x={45} y={30} width={10} height={30} rx={4} fill={C.ink} />
            <circle cx={50} cy={71} r={6} fill={C.ink} />
          </svg>
          <div style={{ fontFamily: FONT_D, fontWeight: 800, fontSize: 86, lineHeight: 1, color: C.white }}>
            NO ANDES EN <span style={{ color: C.fuel }}>RESERVA</span>
          </div>
        </div>
      </div>
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
        <g transform={`translate(${tx} ${ty}) scale(${s})`}>
          <TankG shape={BOX} level={h} t={t} pump={{ opacity: 1, heat: heatK, cool }} />
        </g>
        <Callout ax={540} ay={ty + 600} lx={300} ly={1260} text="BOMBA" p={ramp(t, pumpAt, pumpAt + 14, (x) => x)} color={C.white} size={50} />
        <Callout
          ax={660}
          ay={ty + 640}
          lx={790}
          ly={1260}
          text={heatK > 0.35 ? "SE CALIENTA" : "SE ENFRÍA"}
          p={ramp(t, coolAt, coolAt + 14, (x) => x)}
          color={heatK > 0.35 ? C.red : C.cyan}
          size={50}
        />
      </svg>
    </AbsoluteFill>
  );
};

/* ===================================================================== CTA */
export const Cta: React.FC = () => {
  const t = useCurrentFrame();
  const o1 = cue("opt1");
  const o2 = cue("opt2");
  const o3 = cue("opt3");
  const cm = cue("comment");
  let v = 0.66 + 0.01 * Math.sin(t * 0.5);
  if (t >= o3) v = lerpT(t, o3, o3 + 10, 0.25, 0.04, EASE_OUT);
  else if (t >= o2) v = lerpT(t, o2, o2 + 10, 0.5, 0.25, EASE_OUT);
  else if (t >= o1) v = lerpT(t, o1, o1 + 10, 0.66, 0.5, EASE_OUT);
  const lamp = t >= o3 + 6 ? blink(t, o3 + 6) : 0;
  const opts: [number, string][] = [
    [o1, "½"],
    [o2, "¼"],
    [o3, "RESERVA"],
  ];
  const active = t >= o3 ? 2 : t >= o2 ? 1 : t >= o1 ? 0 : -1;
  const cK = ramp(t, cm - 2, cm + 8, BACK);

  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", top: 220, left: 50, right: 50, textAlign: "center" }}>
        {[
          [[180, "¿Y"], [181, "TÚ,"]],
          [[182, "HASTA"], [183, "DÓNDE"], [184, "DEJAS"]],
          [[185, "BAJAR"], [186, "LA"], [187, "AGUJA?"]],
        ].map((line, li) => (
          <div key={li} style={{ display: "flex", justifyContent: "center", gap: 24 }}>
            {(line as [number, string][]).map(([wi, txt]) => {
              const on = t >= W(wi) - 3;
              const k = ramp(t, W(wi) - 3, W(wi) + 3, BACK);
              return (
                <span
                  key={wi}
                  style={{
                    fontFamily: FONT_D,
                    fontWeight: 800,
                    fontSize: 112,
                    lineHeight: 1,
                    color: wi === 187 && on ? C.fuel : C.white,
                    opacity: on ? 1 : 0.22,
                    display: "inline-block",
                    scale: String(on ? interpolate(k, [0, 1], [1.2, 1]) : 1),
                  }}
                >
                  {txt}
                </span>
              );
            })}
          </div>
        ))}
      </div>
      <Gauge cx={540} cy={920} size={540} value={v} lamp={lamp} />
      <div style={{ position: "absolute", top: 1220, left: 0, right: 0, display: "flex", justifyContent: "center", gap: 24 }}>
        {opts.map(([at, label], i) => {
          const k = ramp(t, at - 2, at + 7, BACK);
          const isActive = i === active;
          return (
            <div
              key={label}
              style={{
                padding: "10px 34px",
                borderRadius: 20,
                border: `4px solid ${isActive ? C.fuel : "rgba(244,246,248,0.35)"}`,
                background: isActive ? "rgba(255,176,32,0.16)" : C.panel,
                fontFamily: FONT_D,
                fontWeight: 800,
                fontSize: 70,
                lineHeight: 1.1,
                color: isActive ? C.fuel : C.white,
                opacity: k,
                scale: String(interpolate(k, [0, 1], [0.5, 1])),
              }}
            >
              {label}
            </div>
          );
        })}
      </div>
      <div
        style={{
          position: "absolute",
          top: 1380,
          left: 0,
          right: 0,
          display: "flex",
          justifyContent: "center",
          opacity: cK,
          translate: `0px ${interpolate(cK, [0, 1], [30, 0])}px`,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 20,
            padding: "20px 38px",
            borderRadius: 26,
            background: "rgba(244,246,248,0.95)",
            fontFamily: FONT_UI,
            fontWeight: 700,
            fontSize: 42,
            color: C.ink,
          }}
        >
          <svg width={44} height={44} viewBox="0 0 24 24">
            <path
              d="M4 5.5A2.5 2.5 0 0 1 6.5 3h11A2.5 2.5 0 0 1 20 5.5v8a2.5 2.5 0 0 1-2.5 2.5H10l-4.5 4v-4A1.5 1.5 0 0 1 4 14.5z"
              fill="none"
              stroke={C.ink}
              strokeWidth={2.2}
              strokeLinejoin="round"
            />
          </svg>
          Te leo en los comentarios
        </div>
      </div>
    </AbsoluteFill>
  );
};
