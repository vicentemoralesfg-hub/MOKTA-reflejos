import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { EASE_OUT, pop, ramp, rnd, shake } from "../anim";
import { Background } from "../components/Background";
import { Captions } from "../components/Captions";
import { Stage } from "../components/Stage";
import { cleanCar, uglyCar } from "../components/presets";
import { Icon } from "../components/ui";
import { C, FONT_DISPLAY, FONT_UI } from "../theme";
import { at } from "../timeline";

const ID = "s01";

const Card: React.FC<{ top: number; color: string; children: React.ReactNode; glow: number; f: number }> = ({ top, color, children, glow }) => (
  <div
    style={{
      position: "absolute",
      left: 40,
      right: 40,
      top,
      height: 540,
      borderRadius: 40,
      background: `linear-gradient(160deg, ${color}33, rgba(5,6,18,0.75) 60%)`,
      border: `4px solid ${color}`,
      boxShadow: `0 0 ${30 + glow * 70}px ${color}${glow > 0.5 ? "cc" : "77"}, inset 0 0 60px ${color}22`,
      overflow: "hidden",
    }}
  >
    {children}
  </div>
);

const Label: React.FC<{ text: string; color: string; p: number; x: number; y: number; rot?: number; dark?: boolean }> = ({ text, color, p, x, y, rot = -4, dark = true }) => (
  <div
    style={{
      position: "absolute",
      left: x,
      top: y,
      rotate: `${rot}deg`,
      scale: interpolate(p, [0, 1], [2.2, 1]),
      opacity: Math.min(1, p * 3),
      padding: "8px 26px",
      background: color,
      color: dark ? C.ink : "#fff",
      fontFamily: FONT_DISPLAY,
      fontWeight: 800,
      fontSize: 70,
      letterSpacing: 2,
      borderRadius: 12,
      boxShadow: `0 10px 30px rgba(0,0,0,0.5), 0 0 30px ${color}`,
      whiteSpace: "nowrap",
    }}
  >
    {text}
  </div>
);

const Price: React.FC<{ x: number; y: number; p: number }> = ({ x, y, p }) => (
  <div
    style={{
      position: "absolute",
      left: x,
      top: y,
      padding: "6px 18px",
      borderRadius: 14,
      background: "rgba(0,0,0,0.65)",
      border: "3px solid rgba(255,255,255,0.8)",
      color: "#fff",
      fontFamily: FONT_DISPLAY,
      fontWeight: 800,
      fontSize: 48,
      opacity: p,
      scale: interpolate(p, [0, 1], [0.6, 1]),
    }}
  >
    $4.500.000
  </div>
);

export const S01Hook: React.FC = () => {
  const f = useCurrentFrame();
  const tBasura = at(ID, "basura");
  const tOro = at(ID, "oro");
  const tImp = at(ID, "impecable");
  const tVolar = at(ID, "volar");
  const sh0 = shake(f, 0, 26, 12);
  const sh1 = shake(f, tVolar + 4, 30, 14);
  const sx = sh0.x + sh1.x;
  const sy = sh0.y + sh1.y;
  const gold = ramp(f, tOro - 2, tOro + 8);
  const zoomOut = interpolate(f, [tVolar, tVolar + 18], [1, 1.12], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: EASE_OUT });
  // destello de rayos X sobre el auto "impecable" (adelanto del giro final)
  const glitch = (f >= tVolar + 2 && f < tVolar + 5) || (f >= tVolar + 8 && f < tVolar + 10) ? 1 : 0;
  const drive = interpolate(f, [0, 12], [-260, 0], { extrapolateRight: "clamp", easing: EASE_OUT });
  const drive2 = interpolate(f, [0, 12], [260, 0], { extrapolateRight: "clamp", easing: EASE_OUT });

  return (
    <AbsoluteFill>
      <Background zone="intro" flash={interpolate(f, [0, 5], [0.9, 0], { extrapolateRight: "clamp" }) + interpolate(f, [tVolar + 3, tVolar + 9], [0.8, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })} />
      <AbsoluteFill style={{ translate: `${sx}px ${sy}px`, scale: zoomOut }}>
        {/* tarjeta superior: el "feo" */}
        <Card top={200} color={gold > 0 ? C.gold : C.red} glow={gold} f={f}>
          <Stage cam={{ left: 20 + drive, top: 150, width: 960 }} car={{ id: "h-ugly", ...uglyCar(), t: f, wheelRot: drive * 0.8 }} />
          {/* monedas de oro */}
          {gold > 0 &&
            Array.from({ length: 22 }, (_, i) => {
              const life = f - tOro - (i % 6);
              if (life < 0) return null;
              const ang = rnd(i) * Math.PI * 2;
              const v = 9 + rnd(i + 7) * 12;
              const x = 500 + Math.cos(ang) * v * life;
              const y = 280 + Math.sin(ang) * v * life + 0.6 * life * life;
              return (
                <div key={i} style={{ position: "absolute", left: x, top: y, width: 44, height: 44, borderRadius: 99, background: `radial-gradient(circle at 35% 35%, #FFF3B0, ${C.gold} 55%, #B07800)`, boxShadow: `0 0 20px ${C.gold}`, opacity: interpolate(life, [0, 30], [1, 0], { extrapolateRight: "clamp" }), rotate: `${life * 20}deg` }} />
              );
            })}
          <Price x={640} y={30} p={ramp(f, 4, 12)} />
          <Label text="PARECE BASURA" color={C.red} dark={false} p={pop(f, tBasura - 2, 8)} x={40} y={34} />
          {gold > 0 && <Label text="¿VALE ORO?" color={C.gold} p={pop(f, tOro, 8)} x={300} y={430} rot={3} />}
        </Card>

        {/* VS */}
        <div style={{ position: "absolute", left: 540, top: 772, translate: "-50% -50%", width: 140, height: 140, borderRadius: 999, background: C.ink, border: `6px solid ${C.gold}`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: FONT_DISPLAY, fontWeight: 800, fontSize: 70, color: C.gold, zIndex: 5, boxShadow: `0 0 40px ${C.gold}`, scale: 1 + 0.06 * Math.sin(f * 0.4) }}>
          VS
        </div>

        {/* tarjeta inferior: el "impecable" */}
        <Card top={808} color={glitch ? C.red : C.cyan} glow={ramp(f, tImp, tImp + 8) * 0.6} f={f}>
          <Stage
            cam={{ left: 20 + drive2, top: 150, width: 960 }}
            car={{
              id: "h-clean",
              ...cleanCar(),
              t: f,
              wheelRot: drive2 * 0.8,
              xray: glitch,
              parts: { rail: { color: C.red, glow: 1 }, airbagFront: { color: C.red, glow: 1 }, srs: { color: C.red }, pillarA: {}, floor: {}, roofRail: {} },
              frontCrush: glitch * 0.25,
            }}
          />
          {/* destellos */}
          {[0, 1, 2, 3].map((i) => {
            const ph = (f + i * 9) % 36;
            const s = Math.sin((ph / 36) * Math.PI);
            return (
              <svg key={i} width={70} height={70} viewBox="-10 -10 20 20" style={{ position: "absolute", left: [260, 520, 760, 400][i], top: [190, 160, 240, 300][i], opacity: s * ramp(f, tImp - 6, tImp), scale: 0.4 + s }}>
                <path d="M0 -10 L2 -2 L10 0 L2 2 L0 10 L-2 2 L-10 0 L-2 -2 Z" fill="#fff" />
              </svg>
            );
          })}
          <Price x={640} y={30} p={ramp(f, 6, 14)} />
          <Label text="IMPECABLE" color={C.cyan} p={pop(f, tImp - 2, 8)} x={40} y={34} rot={3} />
          {glitch > 0 && (
            <div style={{ position: "absolute", left: 360, top: 420, fontFamily: FONT_UI, fontWeight: 800, fontSize: 40, color: C.red, letterSpacing: 6, display: "flex", alignItems: "center", gap: 10 }}>
              <Icon name="warn" color={C.red} size={44} /> ¿SEGURO?
            </div>
          )}
        </Card>
      </AbsoluteFill>
      <Captions id={ID} accent={C.gold} keywords={["basura", "oro", "impecable", "volar", "cabeza"]} y={1400} />
    </AbsoluteFill>
  );
};
