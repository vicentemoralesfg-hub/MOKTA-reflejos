import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { COLORS, FONT_DISPLAY, MarkerId, mk } from "../config";
import { At, SceneShell } from "../components/SceneShell";
import { CarRear } from "../components/Car";
import { WearMeter } from "../components/WearMeter";
import { IconBrakeOff, IconCheck, IconOil, IconSpeedo, IconThermo } from "../components/Icons";
import { EASE_OUT, pop, ramp } from "../lib/anim";

const W = 1080;
const H = 520;
const HY = 190; // horizonte (px)
const F = 900; // distancia focal (px)
const CAM_H = 1.4; // altura de cámara (m)

/** proyección: punto a distancia d (m) y desplazamiento lateral X (m) → pantalla */
const px = (X: number, d: number) => W / 2 + (X * F) / d;
const py = (d: number) => HY + (F * CAM_H) / d;

const Road: React.FC<{ f: number }> = ({ f }) => {
  const travel = f * 0.9; // m por fotograma (≈ 97 km/h)
  const quad = (x0: number, x1: number, d0: number, d1: number, fill: string, key: string) => (
    <polygon key={key} points={`${px(x0, d0)},${py(d0)} ${px(x1, d0)},${py(d0)} ${px(x1, d1)},${py(d1)} ${px(x0, d1)},${py(d1)}`} fill={fill} />
  );
  const dashes: React.ReactNode[] = [];
  for (let k = 0; k < 40; k++) {
    const d0 = 2.5 + k * 9 - (travel % 9);
    if (d0 < 2.2) continue;
    for (const X of [-1.8, 1.8]) dashes.push(quad(X - 0.08, X + 0.08, d0, d0 + 3.5, "rgba(255,255,255,0.85)", `d${k}${X}`));
  }
  const posts: React.ReactNode[] = [];
  for (let k = 0; k < 20; k++) {
    const d = 4 + k * 15 - (travel % 15);
    if (d < 4) continue;
    for (const X of [-7, 7]) {
      const x = px(X, d);
      const top = HY + (F * (CAM_H - 1.1)) / d;
      const w = Math.max(1.5, (0.15 * F) / d);
      posts.push(<rect key={`p${k}${X}`} x={x - w / 2} y={top} width={w} height={py(d) - top} fill="#d7dde4" />);
      posts.push(<rect key={`r${k}${X}`} x={x - w / 2} y={top} width={w} height={(py(d) - top) * 0.22} fill={COLORS.yellow} />);
    }
  }
  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
      <defs>
        <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#0b1a2e" />
          <stop offset="0.75" stopColor="#1f5c74" />
          <stop offset="1" stopColor="#f2a65a" />
        </linearGradient>
        <linearGradient id="ground" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#2d3a2a" />
          <stop offset="1" stopColor="#11160f" />
        </linearGradient>
      </defs>
      <rect width={W} height={HY + 2} fill="url(#sky)" />
      {/* cordillera */}
      <path
        d={`M0 ${HY} L0 ${HY - 40} L90 ${HY - 70} L170 ${HY - 52} L260 ${HY - 118} L330 ${HY - 96} L420 ${HY - 150} L500 ${HY - 112} L590 ${HY - 160} L660 ${HY - 120} L760 ${HY - 138} L850 ${HY - 84} L940 ${HY - 104} L1080 ${HY - 60} L1080 ${HY} Z`}
        fill="#24364a"
      />
      <path d={`M420 ${HY - 150} L445 ${HY - 132} L470 ${HY - 136} L500 ${HY - 112} L470 ${HY - 124} L445 ${HY - 122} Z M590 ${HY - 160} L615 ${HY - 140} L640 ${HY - 130} L660 ${HY - 120} L630 ${HY - 128} Z`} fill="#dfe8f1" opacity={0.8} />
      <rect y={HY} width={W} height={H - HY} fill="url(#ground)" />
      {quad(-5.6, 5.6, 1.5, 2000, "#262a31", "road")}
      {quad(-5.6, -5.45, 1.5, 2000, "rgba(255,255,255,0.7)", "el")}
      {quad(5.45, 5.6, 1.5, 2000, "rgba(255,255,255,0.7)", "er")}
      {dashes}
      {posts}
    </svg>
  );
};

const CHIPS: { marker: MarkerId; text: string; icon: React.ReactNode }[] = [
  { marker: "carCaliente", text: "MOTOR CALIENTE", icon: <IconThermo size={78} color={COLORS.green} level={0.55} /> },
  { marker: "carVelocidad", text: "VELOCIDAD CONSTANTE", icon: <IconSpeedo size={78} color={COLORS.green} value={0.45} /> },
  { marker: "carFrenar", text: "CASI SIN FRENAR", icon: <IconBrakeOff size={78} color={COLORS.green} /> },
  { marker: "carAceite", text: "ACEITE A TIEMPO", icon: <IconOil size={78} color={COLORS.green} /> },
];

/** El de 200 mil hizo carretera: motor caliente, velocidad constante, casi sin frenar, aceite a tiempo. */
export const Highway: React.FC = () => {
  const f = useCurrentFrame();
  const bob = Math.sin(f * 0.9) * 1.2;
  return (
    <SceneShell tint="green" glow={0.22}>
      <div style={{ position: "absolute", left: 0, top: 200, width: W, height: H, overflow: "hidden" }}>
        <Road f={f} />
        <div style={{ position: "absolute", left: W / 2 - 190, top: 262 }}>
          <CarRear width={380} bob={bob} />
        </div>
        <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: 90, background: "linear-gradient(#05070B, transparent)" }} />
        <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 110, background: "linear-gradient(transparent, #05070B)" }} />
        <div
          style={{
            position: "absolute",
            left: 80,
            top: 50,
            fontFamily: FONT_DISPLAY,
            fontWeight: 800,
            fontSize: 46,
            color: COLORS.ink,
            background: COLORS.white,
            borderRadius: 12,
            padding: "4px 18px",
            opacity: ramp(f, 2, 10),
          }}
        >
          AUTO B · 200.000 km
        </div>
        <div
          style={{
            position: "absolute",
            right: 80,
            top: 40,
            textAlign: "right",
            fontFamily: FONT_DISPLAY,
            fontWeight: 800,
            fontSize: 96,
            lineHeight: 0.9,
            color: COLORS.white,
            textShadow: "0 4px 20px rgba(0,0,0,0.7)",
            opacity: ramp(f, mk("carVelocidad", "carretera"), mk("carVelocidad", "carretera") + 6),
          }}
        >
          {97 + Math.round(Math.sin(f / 11))}
          <div style={{ fontSize: 34, color: COLORS.dim }}>km/h</div>
        </div>
      </div>

      <At top={735} style={{ opacity: ramp(f, 4, 14) }}>
        <WearMeter value={interpolate(f, [4, 40], [0, 0.26], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: EASE_OUT })} title="DESGASTE REAL · AUTO B" />
      </At>

      <At top={880}>
        <div style={{ display: "grid", gridTemplateColumns: "450px 450px", gap: 20 }}>
          {CHIPS.map((c) => {
            const at = mk(c.marker, "carretera");
            const p = pop(f, at, 9);
            return (
              <div
                key={c.text}
                style={{
                  height: 130,
                  borderRadius: 26,
                  background: COLORS.panel,
                  border: `2px solid ${COLORS.green}66`,
                  display: "flex",
                  alignItems: "center",
                  gap: 14,
                  padding: "0 18px",
                  boxSizing: "border-box",
                  opacity: Math.min(1, p * 1.5),
                  scale: String(interpolate(p, [0, 1], [0.7, 1])),
                  position: "relative",
                }}
              >
                {c.icon}
                <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 800, fontSize: 46, lineHeight: 0.98, color: COLORS.white, flex: 1 }}>{c.text}</div>
                <div
                  style={{
                    position: "absolute",
                    top: -16,
                    right: -10,
                    width: 52,
                    height: 52,
                    borderRadius: 26,
                    background: COLORS.green,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <IconCheck size={44} color={COLORS.ink} progress={ramp(f, at + 4, at + 12)} />
                </div>
              </div>
            );
          })}
        </div>
      </At>
    </SceneShell>
  );
};
