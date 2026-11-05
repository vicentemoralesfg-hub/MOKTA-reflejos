import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { COLORS, FONT_DISPLAY, FONT_UI, mk } from "../config";
import { At, SceneShell } from "../components/SceneShell";
import { IconClock } from "../components/Icons";
import { EASE_OUT, hash, ramp } from "../lib/anim";

const LANES = [230, 540, 850];
const CAR_COLORS = ["#8a95a3", "#5d6773", "#a6463f", "#3f5f86", "#c9d2dc", "#2f3540", "#7b6a52"];

/** avance acumulado (px) de un carril en modo "para y parte" */
const crawl = (f: number, phase: number) => {
  let s = 0;
  for (let k = 0; k < f; k++) s += Math.max(0, Math.sin(k * 0.07 + phase)) ** 3 * 4.2;
  return s;
};
const moving = (f: number, phase: number) => Math.max(0, Math.sin(f * 0.07 + phase)) ** 3 > 0.08;

const TopCar: React.FC<{ x: number; y: number; color: string; brake: boolean; hero?: boolean }> = ({ x, y, color, brake, hero }) => (
  <div style={{ position: "absolute", left: x - 78, top: y - 150, width: 156, height: 300 }}>
    {hero ? (
      <div style={{ position: "absolute", inset: -14, borderRadius: 54, border: `5px solid ${COLORS.yellow}`, boxShadow: `0 0 40px ${COLORS.yellow}88` }} />
    ) : null}
    <div style={{ position: "absolute", inset: 0, borderRadius: 44, background: color, boxShadow: "0 18px 30px rgba(0,0,0,0.55)" }} />
    <div style={{ position: "absolute", left: 18, right: 18, top: 62, height: 58, borderRadius: "18px 18px 8px 8px", background: "#141b24" }} />
    <div style={{ position: "absolute", left: 22, right: 22, top: 128, height: 92, borderRadius: 10, background: "rgba(0,0,0,0.12)" }} />
    <div style={{ position: "absolute", left: 24, right: 24, top: 222, height: 40, borderRadius: "8px 8px 16px 16px", background: "#141b24" }} />
    {[18, 108].map((l) => (
      <div
        key={l}
        style={{
          position: "absolute",
          left: l,
          top: 286,
          width: 30,
          height: 12,
          borderRadius: 4,
          background: brake ? "#ff2a2a" : "#7a1a1d",
          boxShadow: brake ? "0 10px 40px 14px rgba(255,30,30,0.55)" : "none",
        }}
      />
    ))}
  </div>
);

/** Este auto vivió en el taco. Ford: 1 hora en ralentí ≈ 50 km de uso del motor. */
export const Traffic: React.FC = () => {
  const f = useCurrentFrame();
  const mFord = mk("tacoFord", "taco");
  const mHora = mk("tacoHora", "taco");
  const m50 = mk("tacoCincuenta", "taco");
  const heroPhase = 1.2;
  const heroCrawl = crawl(f, heroPhase);
  const cardIn = ramp(f, mFord - 2, mFord + 12, EASE_OUT);
  const engineKm = interpolate(f, [mHora, m50 + 4], [0, 50], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: EASE_OUT });
  const hours = interpolate(f, [0, mFord], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const mins = Math.floor(hours * 60);

  return (
    <SceneShell tint="red" glow={0.22}>
      {/* carretera vista desde arriba (cámara sigue al AUTO A) */}
      <div style={{ position: "absolute", left: 0, right: 0, top: 200, height: 640, overflow: "hidden" }}>
        <div style={{ position: "absolute", left: 70, right: 70, top: 0, bottom: 0, background: "#16191f", borderRadius: 30 }} />
        {[385, 695].map((x) => (
          <div
            key={x}
            style={{
              position: "absolute",
              left: x - 4,
              top: -100,
              width: 8,
              height: 900,
              backgroundImage: "linear-gradient(rgba(255,255,255,0.55) 50%, transparent 50%)",
              backgroundSize: "8px 100px",
              backgroundPosition: `0px ${heroCrawl % 100}px`,
            }}
          />
        ))}
        {LANES.map((lx, li) => {
          const phase = li === 1 ? heroPhase : 0.3 + li * 1.7;
          const rel = crawl(f, phase) - heroCrawl;
          return [-1, 0, 1, 2].map((k) => {
            const hero = li === 1 && k === 0;
            const y = 300 + k * 360 - (hero ? 0 : rel) + (li === 1 ? 0 : (li - 1) * 120);
            const yy = hero ? 300 : ((((y + 400) % 1440) + 1440) % 1440) - 400;
            const color = hero ? "#C9D2DC" : CAR_COLORS[Math.floor(hash(li * 10 + k) * CAR_COLORS.length)];
            return <TopCar key={`${li}-${k}`} x={lx} y={yy} color={color} brake={!moving(f, phase)} hero={hero} />;
          });
        })}
        {/* humo de ralentí */}
        {[0, 1, 2, 3].map((k) => {
          const age = ((f + k * 9) % 36) / 36;
          return (
            <div
              key={k}
              style={{
                position: "absolute",
                left: 560 + Math.sin(k * 2 + f / 9) * 14,
                top: 470 + age * 120,
                width: 40 + age * 60,
                height: 40 + age * 60,
                marginLeft: -(20 + age * 30),
                borderRadius: "50%",
                background: "rgba(200,205,215,0.35)",
                opacity: (1 - age) * 0.6,
                filter: "blur(8px)",
              }}
            />
          );
        })}
        <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: 120, background: "linear-gradient(#05070B, transparent)" }} />
        <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 120, background: "linear-gradient(transparent, #05070B)" }} />
      </div>

      {/* reloj del taco */}
      <div
        style={{
          position: "absolute",
          left: 90,
          top: 230,
          display: "flex",
          alignItems: "center",
          gap: 16,
          padding: "14px 26px 14px 16px",
          borderRadius: 24,
          background: "rgba(5,7,11,0.82)",
          border: `2px solid ${COLORS.panelBorder}`,
          opacity: ramp(f, 4, 12),
        }}
      >
        <IconClock size={74} color={COLORS.yellow} turns={hours} />
        <div>
          <div style={{ fontFamily: FONT_UI, fontWeight: 700, fontSize: 24, letterSpacing: 4, color: COLORS.dim }}>EN EL TACO</div>
          <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 800, fontSize: 60, lineHeight: 1, color: COLORS.white, fontVariantNumeric: "tabular-nums" }}>
            {hours >= 1 ? "1:00" : `0:${`${mins}`.padStart(2, "0")}`} h
          </div>
        </div>
      </div>
      <div
        style={{
          position: "absolute",
          right: 90,
          top: 230,
          fontFamily: FONT_DISPLAY,
          fontWeight: 800,
          fontSize: 44,
          color: COLORS.ink,
          background: COLORS.yellow,
          borderRadius: 12,
          padding: "6px 18px",
          opacity: ramp(f, 4, 12),
        }}
      >
        AUTO A
      </div>

      {/* tarjeta Ford */}
      <At top={790} style={{ opacity: cardIn, translate: `0px ${interpolate(cardIn, [0, 1], [120, 0])}px` }}>
        <div
          style={{
            width: 920,
            borderRadius: 34,
            background: "rgba(10,13,19,0.94)",
            border: `2px solid ${COLORS.panelBorder}`,
            padding: "26px 34px 22px",
            boxSizing: "border-box",
            boxShadow: "0 30px 80px rgba(0,0,0,0.7)",
          }}
        >
          <div style={{ fontFamily: FONT_UI, fontWeight: 700, fontSize: 30, letterSpacing: 4, color: COLORS.accent }}>
            SEGÚN FORD · 1 HORA EN RALENTÍ
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 14 }}>
            <div>
              <div style={{ fontFamily: FONT_UI, fontWeight: 600, fontSize: 30, color: COLORS.dim }}>Odómetro</div>
              <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 800, fontSize: 112, lineHeight: 1, color: COLORS.faint }}>+0 km</div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontFamily: FONT_UI, fontWeight: 600, fontSize: 30, color: COLORS.dim }}>Uso del motor</div>
              <div
                style={{
                  fontFamily: FONT_DISPLAY,
                  fontWeight: 800,
                  fontSize: 112,
                  lineHeight: 1,
                  color: COLORS.red,
                  fontVariantNumeric: "tabular-nums",
                  textShadow: `0 0 40px ${COLORS.red}66`,
                }}
              >
                ≈{Math.round(engineKm)} km
              </div>
            </div>
          </div>
          <div style={{ fontFamily: FONT_UI, fontWeight: 500, fontSize: 22, color: COLORS.faint, marginTop: 10 }}>
            Referencia de mantención de Ford para motores con medidor de horas (≈33 millas por hora de ralentí).
          </div>
        </div>
      </At>
    </SceneShell>
  );
};
