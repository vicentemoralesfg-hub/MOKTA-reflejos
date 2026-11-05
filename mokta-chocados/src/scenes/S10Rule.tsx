import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { EASE_OUT, pop, ramp, shake, flashAt } from "../anim";
import { Background } from "../components/Background";
import { Captions } from "../components/Captions";
import { Icon } from "../components/ui";
import { C, FONT_DISPLAY, FONT_UI } from "../theme";
import { at, scene } from "../timeline";

const ID = "s10";

const Row: React.FC<{ f: number; t: number; icon: "bolt" | "weld" | "airbag" | "drop"; text: string; color: string; from: number }> = ({ f, t, icon, text, color, from }) => {
  const p = pop(f, t - 2, 9);
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 22,
        padding: "14px 24px",
        borderRadius: 24,
        background: "rgba(5,6,18,0.82)",
        border: `4px solid ${color}`,
        boxShadow: `0 0 26px ${color}77`,
        opacity: f >= t - 2 ? 1 : 0,
        translate: `${interpolate(p, [0, 1], [from, 0])}px 0px`,
      }}
    >
      <div style={{ width: 82, height: 82, borderRadius: 99, background: color, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Icon name={icon} size={52} />
      </div>
      <span style={{ fontFamily: FONT_DISPLAY, fontWeight: 800, fontSize: 76, color: "#fff" }}>{text}</span>
    </div>
  );
};

export const S10Rule: React.FC = () => {
  const f = useCurrentFrame();
  const tRegla = at(ID, "regla");
  const tAper = at(ID, "aperna");
  const tOport = at(ID, "oportunidad");
  const tSuel = at(ID, "suelda");
  const tInfla = at(ID, "infla");
  const tMoja = at(ID, "moja");
  const tTrampa = at(ID, "trampa");
  const tGuarda = at(ID, "guardalo");
  const dur = scene(ID).duration;
  const outro = ramp(f, tGuarda - 4, tGuarda + 8);
  const sh = shake(f, tTrampa + 2, 22, 12);
  const endCard = ramp(f, dur - 62, dur - 50);

  return (
    <AbsoluteFill>
      <Background zone="rule" cy={38} flash={flashAt(f, tTrampa, (tTrampa + 5) - (tTrampa), 0.5)} />
      <AbsoluteFill style={{ opacity: 1 - outro, translate: `${sh.x}px ${sh.y - outro * 120}px` }}>
        <div style={{ position: "absolute", top: 230, left: 0, right: 0, textAlign: "center", fontFamily: FONT_DISPLAY, fontWeight: 800, fontSize: 110, color: C.gold, scale: interpolate(pop(f, Math.min(tRegla, 2), 10), [0, 1], [0.4, 1]), textShadow: `0 0 40px ${C.gold}88, 0 8px 0 #000` }}>
          LA REGLA SIMPLE
        </div>
        {/* oportunidad */}
        <div style={{ position: "absolute", left: 60, right: 60, top: 400, display: "flex", flexDirection: "column", gap: 16 }}>
          <Row f={f} t={tAper} icon="bolt" text="SE APERNA" color={C.green} from={-900} />
          <div style={{ alignSelf: "center", padding: "6px 34px", borderRadius: 999, background: C.green, color: C.ink, fontFamily: FONT_DISPLAY, fontWeight: 800, fontSize: 72, opacity: f >= tOport - 2 ? 1 : 0, scale: interpolate(pop(f, tOport - 2, 8), [0, 1], [1.8, 1]), boxShadow: `0 0 40px ${C.green}`, display: "flex", alignItems: "center", gap: 10 }}>
            <Icon name="check" size={60} /> OPORTUNIDAD
          </div>
        </div>
        {/* trampa */}
        <div style={{ position: "absolute", left: 60, right: 60, top: 760, display: "flex", flexDirection: "column", gap: 16 }}>
          <Row f={f} t={tSuel} icon="weld" text="SE SUELDA" color={C.red} from={900} />
          <Row f={f} t={tInfla} icon="airbag" text="SE INFLA" color={C.red} from={-900} />
          <Row f={f} t={tMoja} icon="drop" text="SE MOJA" color={C.red} from={900} />
          <div style={{ alignSelf: "center", padding: "6px 34px", borderRadius: 999, background: C.red, color: "#fff", fontFamily: FONT_DISPLAY, fontWeight: 800, fontSize: 92, opacity: f >= tTrampa - 2 ? 1 : 0, scale: interpolate(pop(f, tTrampa - 2, 8), [0, 1], [2, 1]), boxShadow: `0 0 50px ${C.red}`, display: "flex", alignItems: "center", gap: 10 }}>
            <Icon name="x" size={72} color="#fff" /> TRAMPA
          </div>
        </div>
      </AbsoluteFill>

      {/* guárdalo + cierre */}
      {f >= tGuarda - 4 && (
        <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", opacity: outro }}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 30, translate: `0px ${-180 - endCard * 40}px` }}>
            <div style={{ width: 230, height: 230, borderRadius: 60, background: C.gold, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 0 80px ${C.gold}`, scale: interpolate(pop(f, tGuarda, 12), [0, 1], [0.3, 1]), rotate: `${interpolate(f, [tGuarda, tGuarda + 12], [-20, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: EASE_OUT })}deg` }}>
              <svg viewBox="0 0 24 24" width={150} height={150}>
                <path d="M6 3h12v18l-6-4-6 4z" fill={f >= tGuarda + 10 ? C.ink : "none"} stroke={C.ink} strokeWidth={2.4} strokeLinejoin="round" />
              </svg>
            </div>
            <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 800, fontSize: 104, color: "#fff", textAlign: "center", lineHeight: 0.95, textShadow: "0 8px 0 #000" }}>
              GUÁRDALO
              <br />
              <span style={{ color: C.gold, fontSize: 70 }}>PARA TU PRÓXIMO REMATE</span>
            </div>
            <div style={{ marginTop: 30, opacity: endCard, display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
              <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 800, fontSize: 130, letterSpacing: 18, color: "#fff", textShadow: `0 0 40px ${C.cyan}` }}>MOKTA</div>
              <div style={{ fontFamily: FONT_UI, fontWeight: 700, fontSize: 30, letterSpacing: 6, color: C.cyan }}>COMENTA: ¿CUÁL COMPRARÍAS?</div>
            </div>
          </div>
        </AbsoluteFill>
      )}
      <Captions id={ID} accent={C.gold} keywords={["aperna", "oportunidad", "suelda", "infla", "moja", "trampa", "remate"]} y={1430} hide={[[tGuarda - 4, 99999]]} />
    </AbsoluteFill>
  );
};
