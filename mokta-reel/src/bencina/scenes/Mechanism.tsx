import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { Gauge } from "../components/Gauge";
import { Callout, TankG } from "../components/Tank";
import { ReasonChip } from "../components/Common";
import { BACK, C, EASE_IN_OUT, EASE_OUT, FONT_D, FONT_UI, lerpT, ramp } from "../theme";
import {
  BOX,
  BOX_T,
  CAPACITY_L,
  FLOAT_HMAX,
  PHI_MAX,
  PIVOT,
  REAL,
  REAL_T,
  floatState,
  hToY,
  morph,
  needleForFuel,
  path,
} from "../tankModel";
import { cue } from "../timing";

/** Coordenadas de pantalla para un punto del modelo con transformación (tx, ty, s). */
const toScreen = (tx: number, ty: number, s: number) => (x: number, y: number): [number, number] => [tx + x * s, ty + y * s];
const pulse = (t: number, at: number, len = 40) => ramp(t, at, at + 6) * (1 - ramp(t, at + len, at + len + 14));

/* ============================================================ CÓMO FUNCIONA */
export const Mechanism: React.FC<{ from: number }> = ({ from }) => {
  const t = useCurrentFrame();
  const s = 1.12;
  const tx = 540 - 500 * s;
  const ty = 930 - 450 * s;
  const S = toScreen(tx, ty, s);
  const h = lerpT(t, cue("levelDrop"), cue("levelDropEnd"), 0.78, 0.3, EASE_IN_OUT);
  const fs = floatState(h);
  const signal = cue("signal");
  const nm = cue("needleMove");
  const sig = ramp(t, signal - 4, signal + 6);
  const gk = ramp(t, nm - 2, nm + 8, BACK) * (1 - ramp(t, nm + 30, nm + 44));
  const [fx, fy] = S(fs.fx, fs.fy);
  const [ax, ay] = S((PIVOT[0] + fs.fx) / 2, (PIVOT[1] + fs.fy) / 2);
  const [rx, ry] = S(PIVOT[0] + 70, PIVOT[1]);
  const [sx0, sy0] = S(PIVOT[0], 186);
  const gaugeC: [number, number] = [250, 400];
  const wire = `M${sx0},${sy0} L${sx0},595 L${gaugeC[0]},595 L${gaugeC[0]},${gaugeC[1] + 150}`;
  const segs = 12;
  const lit = fs.gauge * segs;
  const enter = ramp(t, from, from + 12, EASE_OUT);

  return (
    <AbsoluteFill>
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
        <path d={wire} stroke="#3E4A5C" strokeWidth={8} fill="none" strokeLinejoin="round" opacity={enter} />
        <path
          d={wire}
          stroke={C.cyan}
          strokeWidth={8}
          fill="none"
          strokeLinejoin="round"
          strokeDasharray="18 30"
          strokeDashoffset={-t * 7}
          opacity={sig}
          style={{ filter: `drop-shadow(0 0 8px ${C.cyan})` }}
        />
        <g transform={`translate(${tx} ${ty + 50 * (1 - enter)}) scale(${s})`} opacity={enter}>
          <TankG
            shape={BOX}
            level={h}
            t={t}
            sender={1}
            hi={{
              float: pulse(t, cue("lblFloat")),
              arm: pulse(t, cue("lblArm")),
              res: Math.max(pulse(t, cue("lblRes")), sig * 0.6),
            }}
          />
        </g>
        <Callout ax={fx} ay={fy} lx={330} ly={700} text="FLOTADOR" p={ramp(t, cue("lblFloat"), cue("lblFloat") + 14, (x) => x)} />
        <Callout ax={ax} ay={ay} lx={330} ly={1290} text="BRAZO" p={ramp(t, cue("lblArm"), cue("lblArm") + 14, (x) => x)} color={C.fuelLight} />
        <Callout ax={rx} ay={ry} lx={760} ly={1290} text="RESISTENCIA" p={ramp(t, cue("lblRes"), cue("lblRes") + 14, (x) => x)} color={C.cyan} />
      </svg>
      {/* medidor de señal */}
      <div style={{ position: "absolute", left: 520, top: 268, width: 470, opacity: Math.max(0.35 * enter, sig) }}>
        <div style={{ fontFamily: FONT_UI, fontWeight: 700, fontSize: 28, letterSpacing: 7, color: C.cyan }}>SEÑAL ELÉCTRICA</div>
        <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
          {Array.from({ length: segs }).map((_, k) => (
            <div
              key={k}
              style={{
                flex: 1,
                height: 74,
                borderRadius: 6,
                background: k < lit ? C.cyan : "rgba(127,211,255,0.12)",
                opacity: k < lit ? 0.5 + 0.5 * Math.min(1, lit - k) : 1,
                boxShadow: k < lit ? `0 0 14px ${C.cyan}88` : "none",
              }}
            />
          ))}
        </div>
        <div style={{ fontFamily: FONT_D, fontWeight: 700, fontSize: 36, color: C.white, marginTop: 10, whiteSpace: "nowrap" }}>
          FLOTADOR → RESISTENCIA → AGUJA
        </div>
      </div>
      <Gauge
        cx={gaugeC[0]}
        cy={gaugeC[1]}
        size={300 * (1 + 0.18 * gk)}
        value={fs.gauge}
        style={{ filter: gk > 0 ? `drop-shadow(0 0 ${30 * gk}px ${C.red})` : undefined, opacity: enter }}
      />
    </AbsoluteFill>
  );
};

/* ================================================================ RAZÓN 1 */
export const Reason1: React.FC = () => {
  const t = useCurrentFrame();
  const s = 0.92;
  const tx = 470 - 500 * s;
  const ty = 905 - 450 * s;
  const fillA = cue("fillTop");
  const fillB = cue("fillTopEnd");
  const dropA = cue("firstLiters");
  const dropB = cue("firstLitersEnd");
  let h = 0.55;
  if (t >= dropA) h = lerpT(t, dropA, dropB, 1.07, FLOAT_HMAX + 0.006, EASE_IN_OUT);
  else if (t >= fillA) h = lerpT(t, fillA, fillB, 0.55, 1.07, EASE_IN_OUT);
  const fs = floatState(h);
  const liters = (hh: number) => CAPACITY_L * BOX_T.volumeAt(Math.min(hh, 1)) + Math.max(0, hh - 1) * 22;
  const L = liters(h);
  const Lfull = liters(1.07);
  const maxK = ramp(t, cue("maxLine"), cue("maxLine") + 12, EASE_OUT);
  const blindK = ramp(t, cue("blindZone"), cue("blindZone") + 10, EASE_OUT);
  const noMove = cue("noMove");
  const nmK = ramp(t, noMove - 2, noMove + 8, BACK);
  const pour = t >= fillA - 4 && t < fillB + 2 ? ramp(t, fillA - 4, fillA + 2) * (1 - ramp(t, fillB - 4, fillB + 2)) : 0;
  const yMax = hToY(FLOAT_HMAX);
  const yTop = hToY(1);
  const drained = Math.max(0, Lfull - L);
  const stop = [PIVOT[0] - 40 * Math.cos(PHI_MAX), PIVOT[1] - 40 * Math.sin(PHI_MAX)];

  return (
    <AbsoluteFill>
      <ReasonChip n={1} title="LLENO HASTA EL TOPE" at={cue("r1")} />
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
        <defs>
          <pattern id="hatch" width={22} height={22} patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
            <rect width={22} height={22} fill="rgba(255,176,32,0.18)" />
            <line x1={0} y1={0} x2={0} y2={22} stroke={C.fuelLight} strokeWidth={8} opacity={0.55} />
          </pattern>
        </defs>
        <g transform={`translate(${tx} ${ty}) scale(${s})`}>
          {pour > 0 ? (
            <rect x={900 - 10 * pour} y={-80} width={20 * pour} height={170} rx={10} fill={C.fuel} opacity={0.9} />
          ) : null}
          <TankG shape={BOX} level={h} t={t} neck={1} sender={1} hi={{ float: fs.pinnedTop ? 0.6 * blindK : 0 }}>
            {/* zona ciega */}
            <g opacity={blindK}>
              <rect x={136} y={yTop} width={728} height={yMax - yTop} fill="url(#hatch)" />
              <text x={280} y={(yTop + yMax) / 2 + 19} textAnchor="middle" fontFamily={FONT_D} fontWeight={800} fontSize={56} fill={C.white} stroke={C.ink} strokeWidth={9} paintOrder="stroke">
                ZONA CIEGA
              </text>
            </g>
            {/* máximo del flotador */}
            <line x1={120} x2={120 + 760 * maxK} y1={yMax} y2={yMax} stroke={C.cyan} strokeWidth={6} strokeDasharray="22 14" />
            <g opacity={ramp(t, cue("maxLine") + 6, cue("maxLine") + 14)}>
              <rect x={150} y={yMax + 14} width={420} height={58} rx={12} fill={C.ink} stroke={C.cyan} strokeWidth={3} />
              <text x={360} y={yMax + 56} textAnchor="middle" fontFamily={FONT_D} fontWeight={800} fontSize={44} fill={C.cyan}>
                MÁXIMO DEL FLOTADOR
              </text>
            </g>
            {/* tope mecánico del brazo */}
            <circle cx={stop[0]} cy={stop[1]} r={12} fill={C.red} opacity={maxK} style={{ filter: `drop-shadow(0 0 10px ${C.red})` }} />
          </TankG>
        </g>
      </svg>
      {/* litros */}
      <div style={{ position: "absolute", left: 90, top: 1180 }}>
        <div style={{ fontFamily: FONT_UI, fontWeight: 700, fontSize: 26, letterSpacing: 6, color: C.dim }}>LITROS</div>
        <div style={{ display: "flex", alignItems: "baseline", gap: 14 }}>
          <div style={{ fontFamily: FONT_D, fontWeight: 800, fontSize: 104, lineHeight: 1, color: C.fuel, fontVariantNumeric: "tabular-nums" }}>
            {Math.round(L)} L
          </div>
          {t >= dropA && drained >= 0.5 ? (
            <div style={{ fontFamily: FONT_D, fontWeight: 800, fontSize: 56, color: C.red }}>
              −{Math.round(drained)} L
            </div>
          ) : null}
        </div>
      </div>
      {/* aguja sigue en lleno */}
      <div
        style={{
          position: "absolute",
          left: 420,
          top: 1196,
          padding: "10px 22px",
          borderRadius: 16,
          background: C.panel,
          border: `3px solid ${C.white}`,
          opacity: nmK,
          scale: String(interpolate(nmK, [0, 1], [0.7, 1])),
          textAlign: "center",
        }}
      >
        <div style={{ fontFamily: FONT_UI, fontWeight: 700, fontSize: 24, letterSpacing: 5, color: C.dim }}>AGUJA</div>
        <div style={{ fontFamily: FONT_D, fontWeight: 800, fontSize: 52, lineHeight: 1, color: C.white }}>SIGUE EN F</div>
      </div>
      <Gauge cx={830} cy={1255} size={250} value={fs.gauge} style={{ filter: nmK > 0 ? `drop-shadow(0 0 ${24 * nmK}px ${C.white})` : undefined }} />
    </AbsoluteFill>
  );
};

/* ================================================================ RAZÓN 2 */
const SLICE_TOP: [number, number] = [0.62, 0.72];
const SLICE_BOT: [number, number] = [0.1, 0.2];

const Slice: React.FC<{ v: [number, number]; shape: typeof REAL; k: number; clip: string; label: string; strong?: boolean; t: number }> = ({
  v,
  k,
  clip,
  label,
  strong,
  t,
}) => {
  if (k <= 0) return null;
  const y0 = hToY(REAL_T.heightAt(v[1]));
  const y1 = hToY(REAL_T.heightAt(v[0]));
  const glow = strong ? 0.5 + 0.5 * Math.sin(t * 0.35) : 0;
  return (
    <g opacity={k}>
      <g clipPath={`url(#${clip})`}>
        <rect x={100} y={y0} width={820} height={y1 - y0} fill={strong ? C.white : C.fuelLight} opacity={0.42 + 0.2 * glow} />
      </g>
      <line x1={100} x2={900} y1={y0} y2={y0} stroke={C.white} strokeWidth={4} strokeDasharray="10 8" />
      <line x1={100} x2={900} y1={y1} y2={y1} stroke={C.white} strokeWidth={4} strokeDasharray="10 8" />
      {/* cota de altura */}
      <line x1={92} x2={92} y1={y0} y2={y1} stroke={strong ? C.fuel : C.white} strokeWidth={8} />
      <line x1={72} x2={112} y1={y0} y2={y0} stroke={strong ? C.fuel : C.white} strokeWidth={8} />
      <line x1={72} x2={112} y1={y1} y2={y1} stroke={strong ? C.fuel : C.white} strokeWidth={8} />
      <text
        x={strong ? 540 : 500}
        y={(y0 + y1) / 2 + 22}
        textAnchor="middle"
        fontFamily={FONT_D}
        fontWeight={800}
        fontSize={64}
        fill={C.ink}
        stroke={C.white}
        strokeWidth={0}
      >
        {label}
      </text>
    </g>
  );
};

export const Reason2: React.FC = () => {
  const t = useCurrentFrame();
  const s = 1.08;
  const tx = 540 - 500 * s;
  const ty = 815 - 450 * s;
  const S = toScreen(tx, ty, s);
  const m = ramp(t, cue("morph"), cue("morphEnd"), EASE_IN_OUT);
  const shape = morph(BOX, REAL, m);
  const boxX = ramp(t, cue("boxX"), cue("boxX") + 6, EASE_OUT) * (1 - ramp(t, cue("morph") + 2, cue("morph") + 10));
  const narrow = cue("narrow");
  const sliceA = cue("sliceTop");
  const sliceB = cue("sliceBottom");
  const same = cue("sameLiter");
  const labelsOut = 1 - ramp(t, narrow - 4, narrow + 4);
  const arrows = ramp(t, narrow, narrow + 10, EASE_OUT) * (1 - ramp(t, sliceA - 4, sliceA + 4));
  const kTop = ramp(t, sliceA, sliceA + 8, EASE_OUT);
  const kBot = ramp(t, sliceB, sliceB + 8, EASE_OUT);
  const ctx = (at: number) => ramp(t, at - 2, at + 8, BACK);
  const piso = ctx(cue("lblPiso"));
  const eje = ctx(cue("lblEje"));
  const esc = ctx(cue("lblEscape"));
  const gK = ramp(t, same - 2, same + 8, BACK);
  const loop = (a: number, b: number) => {
    if (t < same) return a;
    const ph = ((t - same) % 36) / 36;
    return a + (b - a) * ramp(ph, 0.1, 0.65, EASE_IN_OUT);
  };
  const nTopA = needleForFuel(SLICE_TOP[1]);
  const nTopB = needleForFuel(SLICE_TOP[0]);
  const nBotA = needleForFuel(SLICE_BOT[1]);
  const nBotB = needleForFuel(SLICE_BOT[0]);
  const more = ramp(t, cue("moreNeedle") - 2, cue("moreNeedle") + 8, BACK);

  const [pisoX, pisoY] = S(330, 182);
  const [ejeX, ejeY] = S(165, 620);
  const [escX, escY] = S(510, 652);

  return (
    <AbsoluteFill>
      <ReasonChip n={2} title="LA FORMA DEL ESTANQUE" at={cue("r2")} />
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
        <defs>
          <clipPath id="r2clip">
            <path d={path(shape)} />
          </clipPath>
        </defs>
        <g transform={`translate(${tx} ${ty}) scale(${s})`}>
          {/* contexto: piso, eje, escape */}
          <g opacity={piso * 0.9}>
            <path d="M90,182 L512,182 L552,210 L905,210" stroke="#5B6678" strokeWidth={22} fill="none" strokeLinejoin="round" />
          </g>
          <g opacity={eje * (1 - 0.7 * kBot)} transform={`translate(165 620) scale(${0.6 + 0.4 * eje}) translate(-165 -620)`}>
            <line x1={-40} x2={165} y1={620} y2={620} stroke="#5B6678" strokeWidth={26} />
            <circle cx={165} cy={620} r={112} fill="#1B2330" stroke="#5B6678" strokeWidth={14} />
            <circle cx={165} cy={620} r={30} fill="#5B6678" />
          </g>
          <g opacity={esc} transform={`translate(510 652) scale(${0.6 + 0.4 * esc}) translate(-510 -652)`}>
            <circle cx={510} cy={652} r={42} fill="#1B2330" stroke="#8A96A8" strokeWidth={12} />
          </g>
          <TankG shape={shape} level={0.95} t={t} fuelOpacity={1 - 0.45 * Math.max(kTop, 0)}>
            <Slice v={SLICE_TOP} shape={shape} k={kTop} clip="r2clip" label="5 L" t={t} />
            <Slice v={SLICE_BOT} shape={shape} k={kBot} clip="r2clip" label="5 L" strong t={t} />
            {/* anchos */}
            <g opacity={arrows}>
              <line x1={140} x2={860} y1={320} y2={320} stroke={C.white} strokeWidth={8} />
              <polygon points="130,320 160,302 160,338" fill={C.white} />
              <polygon points="870,320 840,302 840,338" fill={C.white} />
              <text x={500} y={300} textAnchor="middle" fontFamily={FONT_D} fontWeight={800} fontSize={58} fill={C.white}>
                ANCHO
              </text>
              <line x1={350} x2={645} y1={672} y2={672} stroke={C.fuel} strokeWidth={8} />
              <polygon points="340,672 368,656 368,688" fill={C.fuel} />
              <polygon points="655,672 627,656 627,688" fill={C.fuel} />
            </g>
          </TankG>
          {/* X sobre la caja */}
          <g opacity={boxX}>
            <line x1={200} y1={240} x2={200 + 600 * boxX} y2={240 + 420 * boxX} stroke={C.red} strokeWidth={22} strokeLinecap="round" />
            <line x1={800} y1={240} x2={800 - 600 * boxX} y2={240 + 420 * boxX} stroke={C.red} strokeWidth={22} strokeLinecap="round" />
          </g>
        </g>
        <g opacity={labelsOut}>
          <CalloutLite ax={pisoX} ay={pisoY} lx={330} ly={450} text="PISO" k={piso} />
          <CalloutLite ax={ejeX} ay={ejeY} lx={190} ly={1240} text="EJE" k={eje} />
          <CalloutLite ax={escX} ay={escY} lx={560} ly={1240} text="ESCAPE" k={esc} />
        </g>
        <g opacity={arrows}>
          <text x={540} y={1250} textAnchor="middle" fontFamily={FONT_D} fontWeight={800} fontSize={66} fill={C.fuel}>
            ANGOSTO ABAJO
          </text>
        </g>
        {/* más nivel */}
        <g opacity={more * (1 - gK)}>
          <text x={540} y={1250} textAnchor="middle" fontFamily={FONT_D} fontWeight={800} fontSize={66} fill={C.fuel}>
            ¡EL DOBLE DE ALTURA!
          </text>
        </g>
      </svg>
      {gK > 0 ? (
        <>
          <Gauge
            cx={300}
            cy={1250}
            size={250 * (0.7 + 0.3 * gK)}
            value={loop(nTopA, nTopB)}
            caption="ARRIBA"
            band={{ from: nTopB, to: nTopA, color: C.fuel, opacity: 0.85 }}
            style={{ opacity: gK }}
          />
          <Gauge
            cx={780}
            cy={1250}
            size={250 * (0.7 + 0.3 * gK)}
            value={loop(nBotA, nBotB)}
            caption="ABAJO"
            captionColor={C.fuel}
            band={{ from: Math.max(0.001, nBotB), to: nBotA, color: C.fuel, opacity: 0.85 }}
            style={{ opacity: gK }}
          />
          <div
            style={{
              position: "absolute",
              top: 1218,
              left: 0,
              right: 0,
              textAlign: "center",
              fontFamily: FONT_D,
              fontWeight: 800,
              fontSize: 54,
              color: C.white,
              opacity: gK,
            }}
          >
            5 L = 5 L
          </div>
        </>
      ) : null}
    </AbsoluteFill>
  );
};

const CalloutLite: React.FC<{ ax: number; ay: number; lx: number; ly: number; text: string; k: number }> = ({ ax, ay, lx, ly, text, k }) => (
  <Callout ax={ax} ay={ay} lx={lx} ly={ly} text={text} p={k} color={C.cyan} size={50} />
);
