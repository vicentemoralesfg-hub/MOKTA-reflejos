import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { pop, ramp } from "../anim";
import { Background } from "../components/Background";
import { Captions } from "../components/Captions";
import { Icon, Slam } from "../components/ui";
import { C, FONT_DISPLAY, FONT_UI } from "../theme";
import { at } from "../timeline";

const ID = "s09";

const ITEMS = [
  { w: "escaner", icon: "scan" as const, t: "Pásale un escáner", s: "airbag · ABS · motor · módulos", c: C.cyan },
  { w: "cotiza", icon: "tag" as const, t: "Cotiza repuestos reales", s: "precios de hoy, no “al ojo”", c: C.gold },
  { w: "mide", icon: "ruler" as const, t: "Mide la carrocería", s: "cotas de chasis y luces entre paneles", c: "#FF4DFF" },
  { w: "calcula", icon: "coin" as const, t: "Calcula la reventa", s: "descuento por choque: ≈ −10% a −30%", c: C.green },
];

export const S09Checklist: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill>
      <Background zone="rule" cy={40} />
      <Slam at={0} y={290} size={118} color="#fff">
        ANTES DE OFERTAR
      </Slam>
      <div style={{ position: "absolute", left: 60, right: 60, top: 420, display: "flex", flexDirection: "column", gap: 26 }}>
        {ITEMS.map((it, i) => {
          const t = at(ID, it.w);
          const p = pop(f, t - 3, 10);
          const done = ramp(f, t + 6, t + 10);
          return (
            <div
              key={it.w}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 26,
                padding: "24px 28px",
                borderRadius: 30,
                background: "rgba(6,8,22,0.82)",
                border: `4px solid ${it.c}`,
                boxShadow: `0 0 ${20 + done * 30}px ${it.c}88`,
                translate: `${interpolate(p, [0, 1], [i % 2 ? 900 : -900, 0])}px 0px`,
                opacity: f >= t - 3 ? 1 : 0,
              }}
            >
              <div style={{ width: 104, height: 104, borderRadius: 26, background: it.c, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <Icon name={it.icon} size={64} />
              </div>
              <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
                <span style={{ fontFamily: FONT_DISPLAY, fontWeight: 800, fontSize: 62, color: "#fff", lineHeight: 1 }}>{it.t}</span>
                <span style={{ fontFamily: FONT_UI, fontWeight: 600, fontSize: 28, color: "rgba(255,255,255,0.75)", marginTop: 6 }}>{it.s}</span>
              </div>
              <div style={{ width: 76, height: 76, borderRadius: 99, border: `5px solid ${it.c}`, background: done > 0 ? it.c : "transparent", display: "flex", alignItems: "center", justifyContent: "center", scale: 0.6 + 0.4 * pop(f, t + 6, 8), flexShrink: 0 }}>
                {done > 0 && <Icon name="check" size={52} />}
              </div>
            </div>
          );
        })}
      </div>
      <Captions id={ID} accent={C.gold} keywords={["escaner", "cotiza", "mide", "calcula", "reventa"]} y={1430} />
    </AbsoluteFill>
  );
};
