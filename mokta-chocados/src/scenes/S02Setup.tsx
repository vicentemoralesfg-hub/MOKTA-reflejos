import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { EASE_IN_OUT, EASE_OUT, pop, ramp, shake, flashAt } from "../anim";
import { Background } from "../components/Background";
import { Captions } from "../components/Captions";
import { Stage, ZoneOverlay } from "../components/Stage";
import { uglyCar } from "../components/presets";
import { Icon, Stamp } from "../components/ui";
import { C, FONT_DISPLAY, FONT_UI } from "../theme";
import { at } from "../timeline";

const ID = "s02";

export const S02Setup: React.FC = () => {
  const f = useCurrentFrame();
  const tRemate = at(ID, "remate");
  const tRep = at(ID, "repararlos");
  const tRev = at(ID, "revenderlos");
  const tMill = at(ID, "millones");
  const tHund = at(ID, "hundirte");
  const tSecreto = at(ID, "secreto");
  const tDonde = at(ID, "donde");

  // gráfico: sube con "millones", se desploma con "hundirte"
  const up = ramp(f, tMill - 6, tMill + 10);
  const down = ramp(f, tHund, tHund + 8, EASE_IN_OUT);
  const pts: [number, number][] = [];
  for (let i = 0; i <= 40; i++) {
    const x = i / 40;
    const yUp = 1 - x * 0.85 - Math.sin(x * 14) * 0.05;
    const yDown = x < 0.7 ? yUp : yUp + (x - 0.7) * 3.4;
    pts.push([60 + x * 840 * Math.min(1, up * 1.05), 420 * Math.max(0.02, Math.min(1.1, yUp * (1 - down) + yDown * down))]);
  }
  const lineCol = down > 0.3 ? C.red : C.green;
  const sh = shake(f, tHund + 4, 24, 14);
  const graphOut = ramp(f, tSecreto - 6, tSecreto + 4);
  const repaired = ramp(f, tRep, tRep + 14);
  const xray = ramp(f, tSecreto, tSecreto + 10);
  const zones = ramp(f, tDonde, tDonde + 8);
  const carIn = interpolate(f, [0, 10], [-900, 0], { extrapolateRight: "clamp", easing: EASE_OUT });

  return (
    <AbsoluteFill>
      <Background zone="intro" cy={45} flash={flashAt(f, tDonde, (tDonde + 6) - (tDonde), 0.6)} />
      <AbsoluteFill style={{ translate: `${sh.x}px ${sh.y}px` }}>
        {/* gráfico de plata */}
        <div style={{ position: "absolute", left: 90, top: 230, width: 900, height: 470, opacity: (1 - graphOut) * Math.min(1, up * 4), translate: `0px ${-graphOut * 80}px` }}>
          <svg width={960} height={470} style={{ overflow: "visible" }}>
            <g stroke="rgba(255,255,255,0.15)" strokeWidth={2}>
              {[0, 1, 2, 3, 4].map((i) => (
                <line key={i} x1={60} x2={900} y1={20 + i * 100} y2={20 + i * 100} />
              ))}
            </g>
            <path d={"M" + pts.map((p) => p.join(" ")).join(" L")} fill="none" stroke={lineCol} strokeWidth={14} strokeLinecap="round" strokeLinejoin="round" style={{ filter: `drop-shadow(0 0 16px ${lineCol})` }} />
            {up > 0 && <circle cx={pts[40][0]} cy={pts[40][1]} r={18} fill={lineCol} />}
          </svg>
          <div style={{ position: "absolute", left: 60, top: -30, fontFamily: FONT_DISPLAY, fontWeight: 800, fontSize: 64, color: C.green, opacity: up * (1 - down), letterSpacing: 2 }}>+ MILLONES</div>
          <div style={{ position: "absolute", right: 0, bottom: -10, fontFamily: FONT_DISPLAY, fontWeight: 800, fontSize: 84, color: C.red, opacity: down, scale: interpolate(pop(f, tHund, 8), [0, 1], [1.8, 1]), letterSpacing: 2 }}>O TE HUNDES</div>
        </div>

        {/* auto en remate */}
        <Stage
          cam={{ left: 60 + carIn, top: 760 - xray * 300, width: 960 }}
          car={{ id: "s02car", ...uglyCar(1 - repaired * (1 - xray)), t: f, xray, parts: { floor: {}, rail: {}, pillarA: {}, pillarB: {}, pillarC: {}, roofRail: {}, rearRail: {}, radiator: {}, crashBox: {}, bumperBeam: {}, engine: {} }, shine: repaired }}
        >
          <ZoneOverlay green={zones} yellow={ramp(f, tDonde + 6, tDonde + 14)} red={ramp(f, tDonde + 12, tDonde + 20)} />
        </Stage>
        <Stamp at={tRemate} text="REMATE" color={C.gold} y={720} x={300} rotate={-10} size={96} />
        {f >= tRev && f < tSecreto && (
          <div style={{ position: "absolute", left: 640, top: 690, padding: "8px 24px", borderRadius: 12, background: C.green, color: C.ink, fontFamily: FONT_DISPLAY, fontWeight: 800, fontSize: 64, rotate: "6deg", scale: interpolate(pop(f, tRev, 8), [0, 1], [0.3, 1]), boxShadow: `0 0 30px ${C.green}` }}>
            SE VENDE
          </div>
        )}
        {f >= tRep && f < tRev + 6 && (
          <div style={{ position: "absolute", left: 470, top: 640, rotate: `${(f - tRep) * 24}deg`, opacity: 1 - ramp(f, tRev, tRev + 6) }}>
            <Icon name="wrench" color={C.cyan} size={110} />
          </div>
        )}

        {/* leyenda semáforo */}
        {zones > 0 && (
          <div style={{ position: "absolute", left: 60, right: 60, top: 980, display: "flex", flexDirection: "column", gap: 18 }}>
            {[
              { c: C.green, t: "VERDE", s: "OPORTUNIDAD", i: "bolt" as const },
              { c: C.yellow, t: "AMARILLO", s: "PRECAUCIÓN", i: "warn" as const },
              { c: C.red, t: "ROJO", s: "PELIGRO", i: "skull" as const },
            ].map((z, i) => {
              const p = pop(f, tDonde + i * 6, 10);
              return (
                <div key={z.t} style={{ display: "flex", alignItems: "center", gap: 24, padding: "12px 26px", borderRadius: 22, background: "rgba(5,6,18,0.8)", border: `4px solid ${z.c}`, boxShadow: `0 0 26px ${z.c}88`, translate: `${interpolate(p, [0, 1], [i % 2 ? 700 : -700, 0])}px 0px` }}>
                  <div style={{ width: 70, height: 70, borderRadius: 99, background: z.c, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 0 24px ${z.c}` }}>
                    <Icon name={z.i} size={42} />
                  </div>
                  <span style={{ fontFamily: FONT_DISPLAY, fontWeight: 800, fontSize: 66, color: z.c }}>{z.t}</span>
                  <span style={{ marginLeft: "auto", fontFamily: FONT_UI, fontWeight: 800, fontSize: 30, color: "#fff", letterSpacing: 4 }}>{z.s}</span>
                </div>
              );
            })}
          </div>
        )}
        {f >= tSecreto && (
          <div style={{ position: "absolute", top: 230, left: 0, right: 0, textAlign: "center", fontFamily: FONT_DISPLAY, fontWeight: 800, fontSize: 92, color: "#fff", lineHeight: 1, opacity: ramp(f, tSecreto, tSecreto + 6) }}>
            <span style={{ opacity: 1 - 0.5 * ramp(f, tDonde - 4, tDonde) }}>NO ES CUÁNTO…</span>
            <br />
            <span style={{ color: C.gold, display: "inline-block", fontSize: 130, scale: interpolate(pop(f, tDonde, 8), [0, 1], [0, 1]), textShadow: `0 0 40px ${C.gold}` }}>ES DÓNDE</span>
          </div>
        )}
      </AbsoluteFill>
      <Captions id={ID} accent={C.gold} keywords={["millones", "hundirte", "donde", "remate"]} y={1430} />
    </AbsoluteFill>
  );
};
