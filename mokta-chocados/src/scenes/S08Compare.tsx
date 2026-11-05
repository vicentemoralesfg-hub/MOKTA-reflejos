import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { EASE_OUT, clp, pop, rnd, shake } from "../anim";
import { Background } from "../components/Background";
import { Captions } from "../components/Captions";
import { Stage } from "../components/Stage";
import { WHITE, uglyCar } from "../components/presets";
import { Slam, Stamp } from "../components/ui";
import { C, FONT_DISPLAY, FONT_UI } from "../theme";
import { at } from "../timeline";

const ID = "s08";

/** Comparación ilustrativa (CLP). Mismo precio de compra, daños opuestos. */
const A = { compra: 4500000, rep: 1950000, tram: 300000, venta: 8300000 };
const B = { compra: 4500000, rep: 6050000, tram: 300000, venta: 6800000 };
const invA = A.compra + A.rep + A.tram; // 6.750.000
const invB = B.compra + B.rep + B.tram; // 10.850.000
const resA = A.venta - invA; // +1.550.000
const resB = B.venta - invB; // −4.050.000

const Val: React.FC<{ f: number; t: number; v: number; color?: string; sign?: boolean; size?: number; sub?: string }> = ({ f, t, v, color = "#fff", sign, size = 56, sub }) => {
  if (f < t) return <div style={{ height: size + (sub ? 26 : 0) }} />;
  const k = interpolate(f, [t, t + 14], [0, 1], { extrapolateRight: "clamp", easing: EASE_OUT });
  const n = Math.round((v * k) / 10000) * 10000 || 0;
  const nn = k >= 1 ? v : n;
  const txt = (sign ? (v >= 0 ? "+" : "−") : "") + clp(Math.abs(nn));
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", scale: interpolate(pop(f, t, 8), [0, 1], [0.5, 1]) }}>
      <span style={{ fontFamily: FONT_DISPLAY, fontWeight: 800, fontSize: size, color, lineHeight: 1, fontVariantNumeric: "tabular-nums", textShadow: `0 0 24px ${color}66` }}>{txt}</span>
      {sub && <span style={{ fontFamily: FONT_UI, fontWeight: 600, fontSize: 20, color: "rgba(255,255,255,0.75)", marginTop: 4, whiteSpace: "nowrap" }}>{sub}</span>}
    </div>
  );
};

export const S08Compare: React.FC = () => {
  const f = useCurrentFrame();
  const t45 = at(ID, "4,5");
  const tFeo = at(ID, "feo");
  const t19 = at(ID, "1,9");
  const tVendes = at(ID, "vendes");
  const t83 = at(ID, "8,3");
  const t15 = at(ID, "1,5");
  const tImp = at(ID, "impecable");
  const t6 = at(ID, "6");
  const tCon = at(ID, "con");
  const t68 = at(ID, "6,8");
  const tPierdes = at(ID, "pierdes");
  const tEnd = tPierdes + 30;

  const focusA = f >= tFeo && f < tImp ? 1 : 0;
  const focusB = f >= tImp && f < tEnd ? 1 : 0;
  const colA = 0.45 + 0.55 * (focusA || f < tFeo || f >= tEnd ? 1 : 0);
  const colB = 0.45 + 0.55 * (focusB || f < tFeo || f >= tEnd ? 1 : 0);
  const shB = shake(f, tPierdes + 2, 22, 16);
  const carsIn = interpolate(f, [0, 12], [0, 1], { extrapolateRight: "clamp", easing: EASE_OUT });

  const rows: { label: string; a: React.ReactNode; b: React.ReactNode; strong?: boolean }[] = [
    { label: "COMPRA EN REMATE", a: <Val f={f} t={t45} v={A.compra} />, b: <Val f={f} t={t45 + 3} v={B.compra} /> },
    {
      label: "REPARACIÓN",
      a: <Val f={f} t={t19} v={A.rep} color={C.green} sub="puertas · parachoques · foco · pintura" />,
      b: <Val f={f} t={t6} v={B.rep} color={C.red} sub="airbags · larguero · frente · escáner" />,
    },
    { label: "TRÁMITES Y TRASLADO", a: <Val f={f} t={t19 + 8} v={A.tram} size={44} />, b: <Val f={f} t={t6 + 8} v={B.tram} size={44} /> },
    { label: "TOTAL INVERTIDO", a: <Val f={f} t={tVendes - 6} v={invA} />, b: <Val f={f} t={tCon - 4} v={invB} /> },
    { label: "PRECIO DE REVENTA", a: <Val f={f} t={t83} v={A.venta} color={C.cyan} sub="sano $9,5 M · −13% por choque" />, b: <Val f={f} t={t68} v={B.venta} color={C.cyan} sub="sano $9,5 M · −28% por estructura" /> },
    { label: "RESULTADO", a: <Val f={f} t={t15} v={resA} sign color={C.green} size={78} />, b: <Val f={f} t={tPierdes} v={resB} sign color={C.red} size={78} />, strong: true },
  ];

  return (
    <AbsoluteFill>
      <Background zone="money" cy={30} />
      <Slam at={0} y={262} size={104} color={C.gold}>
        HAGAMOS NÚMEROS
      </Slam>

      {/* columnas */}
      {[0, 1].map((i) => {
        const focus = i === 0 ? focusA : focusB;
        const col = i === 0 ? C.green : C.red;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: i === 0 ? 30 : 550,
              top: 340,
              width: 500,
              height: 1000,
              borderRadius: 32,
              background: `linear-gradient(180deg, ${focus ? col + "33" : "rgba(255,255,255,0.06)"}, rgba(5,6,18,0.7))`,
              border: `4px solid ${focus ? col : "rgba(255,255,255,0.18)"}`,
              boxShadow: focus ? `0 0 50px ${col}77` : "none",
              opacity: i === 0 ? colA : colB,
            }}
          />
        );
      })}
      <div style={{ position: "absolute", left: 30, top: 350, width: 500, opacity: colA, translate: `${(1 - carsIn) * -500}px 0px` }}>
        <Stage cam={{ left: 15, top: 10, width: 470 }} car={{ id: "cmp-a", ...uglyCar(), t: f }} />
        {f >= tEnd - 8 && (
          <svg viewBox="0 0 24 16" width={110} height={74} style={{ position: "absolute", left: 195, top: -40, scale: pop(f, tEnd - 8, 10), filter: `drop-shadow(0 0 16px ${C.gold})` }}>
            <path d="M1 15 L3 4 L8 9 L12 1 L16 9 L21 4 L23 15 Z" fill={C.gold} stroke="#7A5200" strokeWidth={0.8} />
          </svg>
        )}
      </div>
      <div style={{ position: "absolute", left: 550, top: 350, width: 500, opacity: colB, translate: `${(1 - carsIn) * 500 + shB.x}px ${shB.y}px` }}>
        <Stage cam={{ left: 15, top: 10, width: 470 }} car={{ id: "cmp-b", paint: WHITE, shine: 1, bumperCrack: 1, t: f, xray: f >= t6 && f < t6 + 30 ? 0.9 : 0, airbag: f >= t6 ? 1 : 0, frontCrush: f >= t6 ? 0.18 : 0, parts: { rail: { color: C.red, glow: 1 }, srs: { color: C.red }, pretensioner: { color: C.red }, floor: { opacity: 0.4 } } }} />
      </div>
      {[
        { x: 280, t: "EL FEO", c: C.green, a: tFeo },
        { x: 800, t: "EL IMPECABLE", c: C.cyan, a: tImp },
      ].map((l) => (
        <div key={l.t} style={{ position: "absolute", left: l.x, top: 560, translate: "-50% 0", padding: "6px 22px", borderRadius: 999, background: f >= l.a ? l.c : "rgba(255,255,255,0.15)", color: f >= l.a ? C.ink : "#fff", fontFamily: FONT_DISPLAY, fontWeight: 800, fontSize: 44, whiteSpace: "nowrap", scale: f >= l.a ? interpolate(pop(f, l.a, 8), [0, 1], [1.4, 1]) : 1 }}>
          {l.t}
        </div>
      ))}

      {/* tabla */}
      <div style={{ position: "absolute", left: 30, right: 30, top: 640 }}>
        {rows.map((r) => (
          <div key={r.label} style={{ height: r.strong ? 150 : 112, display: "flex", flexDirection: "column", alignItems: "center", borderTop: r.strong ? `3px solid ${C.gold}88` : "2px solid rgba(255,255,255,0.12)" }}>
            <div style={{ fontFamily: FONT_UI, fontWeight: 800, fontSize: 22, letterSpacing: 4, color: r.strong ? C.gold : "rgba(255,255,255,0.65)", marginTop: 8 }}>{r.label}</div>
            <div style={{ display: "flex", width: "100%", marginTop: 6 }}>
              <div style={{ width: 500, display: "flex", justifyContent: "center", opacity: colA }}>{r.a}</div>
              <div style={{ width: 20 }} />
              <div style={{ width: 500, display: "flex", justifyContent: "center", opacity: colB }}>{r.b}</div>
            </div>
          </div>
        ))}
        <div style={{ textAlign: "center", fontFamily: FONT_UI, fontWeight: 600, fontSize: 21, color: "rgba(255,255,255,0.6)", marginTop: 6 }}>
          Ejemplo ilustrativo en CLP · varía según modelo, año, repuestos y taller
        </div>
      </div>

      {/* lluvia de monedas al ganar */}
      {f >= t15 &&
        f < t15 + 40 &&
        Array.from({ length: 14 }, (_, i) => {
          const life = f - t15 - (i % 4) * 2;
          if (life < 0) return null;
          return <div key={i} style={{ position: "absolute", left: 60 + rnd(i) * 440, top: 1200 - life * (16 + rnd(i + 4) * 10) + 0.5 * life * life * 0.6, width: 36, height: 36, borderRadius: 99, background: `radial-gradient(circle at 35% 35%, #FFF3B0, ${C.gold} 55%, #B07800)`, opacity: interpolate(life, [20, 34], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) }} />;
        })}

      {f >= tEnd && (
        <>
          <Stamp at={tEnd} text="BUEN NEGOCIO" color={C.green} x={280} y={1040} size={64} rotate={-8} />
          <Stamp at={tEnd + 4} text="PÉSIMA INVERSIÓN" color={C.red} x={800} y={1040} size={54} rotate={6} />
        </>
      )}
      <Captions id={ID} accent={C.gold} keywords={["feo", "impecable", "ganas", "pierdes", "1,5", "4"]} y={1450} hide={[]} />
    </AbsoluteFill>
  );
};
