import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { BACK, EASE_OUT, clp, pop, ramp, shake } from "../anim";
import { Background } from "../components/Background";
import { Captions } from "../components/Captions";
import { Cam, Stage } from "../components/Stage";
import { WHITE } from "../components/presets";
import { Icon, ZoneBadge } from "../components/ui";
import { C, FONT_DISPLAY, FONT_UI } from "../theme";
import { at } from "../timeline";

const ID = "s06";

const ITEMS = [
  { w: "bolsa", label: "Bolsas de aire (2)", v: 900000, nth: 0 },
  { w: "modulo", label: "Módulo de control SRS", v: 450000, nth: 0 },
  { w: "sensores", label: "Sensores de impacto", v: 250000, nth: 0 },
  { w: "pretensores", label: "Pretensores de cinturón", v: 400000, nth: 0 },
  { w: "tablero", label: "Tablero / volante", v: 850000, nth: 0 },
];

export const S06Airbags: React.FC = () => {
  const f = useCurrentFrame();
  const tAir = at(ID, "airbags");
  const tMill = at(ID, "millones");
  const tEntre = at(ID, "entre");
  const deploy = interpolate(f, [tAir + 2, tAir + 7], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: BACK });
  const cam: Cam = { left: 40, top: 430, width: 1000, zoom: 1.35, fx: 600, fy: 220 };
  const times = ITEMS.map((it) => at(ID, it.w, it.nth));
  const sum = ITEMS.reduce((a, it, i) => a + (f >= times[i] ? it.v : 0), 0);
  const sh = shake(f, tAir + 2, 22, 12);
  const red = { color: C.red, glow: 1.2 };
  const dim = { opacity: 0.4 };
  const parts = {
    srs: f >= times[1] ? red : dim,
    pretensioner: f >= times[3] ? red : dim,
    seats: { opacity: 0.45 },
    floor: dim,
    pillarA: dim,
    pillarB: dim,
    roofRail: dim,
    harness: f >= times[2] ? { color: C.orange, glow: 0.6 } : dim,
    bumperBeam: f >= times[2] ? red : dim,
  };
  const blink = Math.floor(f / 6) % 2 === 0;

  return (
    <AbsoluteFill>
      <Background zone="red" cy={34} flash={interpolate(f, [tAir + 2, tAir + 7], [0.8, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })} />
      <ZoneBadge at={0} color={C.red} title="AIRBAGS" sub="Desplegados = alerta" icon={<Icon name="airbag" size={44} />} />
      <AbsoluteFill style={{ translate: `${sh.x}px ${sh.y}px` }}>
        <Stage cam={cam} car={{ id: "ab-car", paint: WHITE, t: f, xray: ramp(f, tAir + 8, tAir + 16) * 0.85, airbag: deploy, frontCrush: 0.2, bumperCrack: 1, parts }}>
          {f >= times[2] && (
            <g>
              {[[982, 250], [760, 300], [600, 300]].map(([x, y], i) => (
                <circle key={i} cx={x} cy={y} r={8 + 4 * Math.sin(f * 0.5 + i)} fill={C.red} style={{ filter: `drop-shadow(0 0 8px ${C.red})` }} />
              ))}
            </g>
          )}
        </Stage>
        {/* testigo SRS */}
        {f >= tAir + 6 && (
          <div style={{ position: "absolute", left: 70, top: 380, display: "flex", alignItems: "center", gap: 14, padding: "10px 22px", borderRadius: 16, background: "rgba(0,0,0,0.7)", border: `3px solid ${C.red}`, opacity: blink ? 1 : 0.35 }}>
            <div style={{ width: 54, height: 54, borderRadius: 99, background: C.red, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Icon name="airbag" size={38} />
            </div>
            <span style={{ fontFamily: FONT_DISPLAY, fontWeight: 800, fontSize: 44, color: C.red }}>SRS</span>
          </div>
        )}
      </AbsoluteFill>

      {/* boleta */}
      <div
        style={{
          position: "absolute",
          left: 90,
          right: 90,
          top: 960,
          padding: "22px 34px 18px",
          borderRadius: 24,
          background: "#FBFAF5",
          boxShadow: "0 30px 70px rgba(0,0,0,0.55)",
          opacity: ramp(f, times[0] - 4, times[0] + 4),
          translate: `0px ${interpolate(ramp(f, times[0] - 4, times[0] + 6, EASE_OUT), [0, 1], [120, 0])}px`,
          rotate: "-1.5deg",
        }}
      >
        <div style={{ fontFamily: FONT_UI, fontWeight: 800, fontSize: 24, letterSpacing: 6, color: "#6B6B78", marginBottom: 6 }}>NO ES SOLO LA BOLSA</div>
        {ITEMS.map((it, i) => {
          const p = pop(f, times[i], 8);
          if (f < times[i]) return <div key={it.w} style={{ height: 50 }} />;
          return (
            <div key={it.w} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", height: 50, borderBottom: "2px dashed #D9D6CC", translate: `${interpolate(p, [0, 1], [-60, 0])}px 0px`, opacity: Math.min(1, p * 2) }}>
              <span style={{ fontFamily: FONT_UI, fontWeight: 700, fontSize: 30, color: "#1A1A24" }}>{it.label}</span>
              <span style={{ fontFamily: FONT_DISPLAY, fontWeight: 800, fontSize: 40, color: C.redDeep }}>{clp(it.v)}</span>
            </div>
          );
        })}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 10 }}>
          <span style={{ fontFamily: FONT_DISPLAY, fontWeight: 800, fontSize: 46, color: "#1A1A24" }}>TOTAL</span>
          <span style={{ fontFamily: FONT_DISPLAY, fontWeight: 800, fontSize: 64, color: C.redDeep }}>{clp(sum)}</span>
        </div>
      </div>
      {f >= tEntre && (
        <div style={{ position: "absolute", left: 0, right: 0, top: 700, display: "flex", justifyContent: "center" }}>
          <div style={{ padding: "14px 40px", borderRadius: 24, background: C.red, color: "#fff", fontFamily: FONT_DISPLAY, fontWeight: 800, fontSize: 108, lineHeight: 1, rotate: "-4deg", scale: interpolate(pop(f, tMill - 4, 10), [0, 1], [0.2, 1]), opacity: ramp(f, tMill - 4, tMill), boxShadow: `0 0 60px ${C.red}, 0 20px 40px rgba(0,0,0,0.5)` }}>
            $2 A $4 MILLONES
          </div>
        </div>
      )}
      <Captions id={ID} accent={C.red} keywords={["airbags", "bolsa", "millones", "2", "4"]} y={1430} />
    </AbsoluteFill>
  );
};
