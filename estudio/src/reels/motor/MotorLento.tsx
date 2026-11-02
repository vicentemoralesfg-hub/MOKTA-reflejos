import React from "react";
import { AbsoluteFill, interpolate, staticFile, useCurrentFrame } from "remotion";
import { Audio } from "@remotion/media";
import { C, DISPLAY, UI, fmt } from "../../brand";
import { BACK_OUT, EASE_IN_OUT, inOut, ramp } from "../../lib/anim";
import { Engine, PHASE, strokeOf } from "./Engine";
import { REAL, TL, explosionsAt, realTimeAt, speedAt, thetaAt } from "./timeline";

const B = TL.beats;
const CX = 500;

const Headline: React.FC<{ lines: React.ReactNode[]; f: number; a: number; b: number; top?: number; size?: number }> = ({ lines, f, a, b, top = 250, size = 104 }) => {
  const o = inOut(f, a, a + 8, b - 6, b);
  if (o <= 0.001) return null;
  return (
    <div style={{ position: "absolute", top, left: 60, width: CX * 2 - 120, textAlign: "center", opacity: o, translate: `0px ${interpolate(ramp(f, a, a + 10), [0, 1], [20, 0])}px` }}>
      {lines.map((l, i) => (
        <div key={i} style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: size, lineHeight: 0.95, color: C.white, textShadow: "0 6px 30px rgba(0,0,0,0.8)" }}>
          {l}
        </div>
      ))}
    </div>
  );
};

const Y: React.FC<{ children: React.ReactNode }> = ({ children }) => <span style={{ color: C.yellow }}>{children}</span>;

export const MotorLento: React.FC<{ withAudio?: boolean }> = ({ withAudio = true }) => {
  const f = useCurrentFrame();
  const theta = thetaAt(f);
  const v = speedAt(f);
  const slowFactor = REAL / v; // 1 = tiempo real, 50 = 1/50
  const a1 = ((theta - PHASE[0]) % 720 + 720) % 720;

  // Cámara: acercamiento al cilindro 1 durante el bloque del pistón
  const zoom = ramp(f, B.piston, B.piston + 18, EASE_IN_OUT) * (1 - ramp(f, B.trip - 10, B.trip + 6, EASE_IN_OUT));
  const scale = 1 + 0.75 * zoom;
  const tx = interpolate(zoom, [0, 1], [0, 540 - 200 * 1.75]);
  const ty = interpolate(zoom, [0, 1], [-130, 1060 - 950 * 1.75]);
  const dim = ramp(f, B.trip, B.trip + 12) * 0.66;

  // Explosión visible a tiempo real: parpadeo cálido global
  const flicker = v > 200 ? 0.06 + 0.05 * Math.sin(f * 2.7) : 0;

  const explosions = explosionsAt(f);
  const hud = 1 - ramp(f, B.piston - 6, B.piston + 4);
  const legend = ramp(f, B.slow, B.slow + 10) * (1 - ramp(f, B.piston - 6, B.piston + 4));

  return (
    <AbsoluteFill style={{ background: "#07080B", overflow: "hidden" }}>
      <AbsoluteFill style={{ background: "radial-gradient(900px 900px at 50% 52%, rgba(255,120,40,0.10), transparent 70%)" }} />
      <AbsoluteFill style={{ transformOrigin: "0 0", transform: `translate(${tx}px, ${ty}px) scale(${scale})` }}>
        <Engine theta={theta} dTheta={v} highlight={Math.max(legend, zoom)} />
      </AbsoluteFill>
      <AbsoluteFill style={{ background: "#FF8A2A", opacity: flicker, mixBlendMode: "screen" }} />
      <AbsoluteFill style={{ background: "#05060A", opacity: dim }} />
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 50%, transparent 55%, rgba(0,0,0,0.6) 100%)" }} />

      {/* HUD: velocidad de reproducción, tiempo real y explosiones */}
      {hud > 0.01 ? (
        <div style={{ position: "absolute", top: 1345, left: 70, right: 150, display: "flex", justifyContent: "space-between", opacity: hud }}>
          {[
            ["VELOCIDAD", slowFactor < 1.05 ? "NORMAL" : `1/${Math.round(slowFactor)}`],
            ["TIEMPO REAL", `${fmt(realTimeAt(f), 3)} s`],
            ["EXPLOSIONES", fmt(explosions)],
          ].map(([k, val]) => (
            <div key={k} style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <div style={{ fontFamily: UI, fontWeight: 700, fontSize: 24, letterSpacing: 4, color: C.faint }}>{k}</div>
              <div style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: 56, color: k === "EXPLOSIONES" ? C.yellow : C.white, fontVariantNumeric: "tabular-nums" }}>{val}</div>
            </div>
          ))}
        </div>
      ) : null}

      {/* Leyenda de los 4 tiempos (cilindro 1) */}
      {legend > 0.01 ? (
        <div style={{ position: "absolute", top: 1440, left: 60, width: 820, display: "flex", gap: 10, opacity: legend }}>
          {(["ADMISIÓN", "COMPRESIÓN", "EXPLOSIÓN", "ESCAPE"] as const).map((s) => {
            const on = strokeOf(a1) === s;
            return (
              <div
                key={s}
                style={{
                  flex: 1,
                  textAlign: "center",
                  padding: "12px 0",
                  borderRadius: 14,
                  fontFamily: UI,
                  fontWeight: 800,
                  fontSize: 25,
                  letterSpacing: 1,
                  color: on ? C.ink : C.faint,
                  background: on ? (s === "EXPLOSIÓN" ? "#FF8A2A" : C.yellow) : "rgba(244,246,248,0.06)",
                }}
              >
                {s}
              </div>
            );
          })}
        </div>
      ) : null}

      {/* ---------- textos ---------- */}
      <Headline f={f} a={-20} b={B.slow - 20} size={94} lines={["TU MOTOR HACE ESTO", <Y key="y">100 VECES POR SEGUNDO</Y>]} />
      {f < B.slow - 20 ? (
        <div style={{ position: "absolute", top: 456, left: 0, width: CX * 2, textAlign: "center", fontFamily: UI, fontWeight: 600, fontSize: 36, color: C.dim, opacity: 1 - ramp(f, B.slow - 26, B.slow - 20) }}>
          4 cilindros · 3.000 rpm
        </div>
      ) : null}
      <Headline f={f} a={B.slow - 22} b={B.slow + 26} size={96} lines={["VAMOS A FRENARLO", <Y key="y">50 VECES</Y>]} />
      <Headline f={f} a={B.slow + 26} b={B.turns} size={88} lines={["ASPIRA, COMPRIME,", <Y key="y">EXPLOTA</Y>, "Y EXPULSA"]} />
      <Headline f={f} a={B.turns} b={B.piston} size={88} lines={["Y LOS 4 CILINDROS", <Y key="y">SE TURNAN</Y>]} />
      {f >= B.turns && f < B.piston ? (
        <div style={{ position: "absolute", top: 440, left: 0, width: CX * 2, textAlign: "center", fontFamily: UI, fontWeight: 600, fontSize: 36, color: C.dim, opacity: inOut(f, B.turns + 8, B.turns + 16, B.piston - 6, B.piston) }}>
          orden de encendido 1 · 3 · 4 · 2
        </div>
      ) : null}

      {/* bloque del pistón */}
      <Headline f={f} a={B.piston} b={B.piston + 80} size={84} lines={["CADA PISTÓN FRENA,", "SE DETIENE Y VUELVE", <Y key="y">100 VECES POR SEGUNDO</Y>]} />
      {f >= B.piston + 76 && f < B.trip ? (
        <div style={{ position: "absolute", top: 230, left: 70, width: CX * 2 - 140, opacity: inOut(f, B.piston + 76, B.piston + 86, B.trip - 8, B.trip) }}>
          <div style={{ fontFamily: UI, fontWeight: 600, fontSize: 38, color: C.dim, textAlign: "center" }}>Aceleración del pistón (3.000 rpm)</div>
          <div style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: 190, lineHeight: 1, color: C.yellow, textAlign: "center", scale: String(interpolate(ramp(f, B.piston + 76, B.piston + 90, BACK_OUT), [0, 1], [1.2, 1])) }}>
          ≈ 560 g
          </div>
          {[
            ["Pistón", 560, C.yellow],
            ["Piloto de caza", 9, C.white],
          ].map(([k, g], i) => {
            const p = ramp(f, B.piston + 92 + i * 8, B.piston + 112 + i * 8);
            return (
              <div key={k as string} style={{ display: "flex", alignItems: "center", gap: 18, marginTop: 14, opacity: p }}>
                <div style={{ width: 270, fontFamily: UI, fontWeight: 600, fontSize: 34, color: C.white, textAlign: "right", whiteSpace: "nowrap" }}>{k}</div>
                <div style={{ height: 26, width: Math.max(10, ((g as number) / 560) * 400 * p), borderRadius: 13, background: i === 0 ? C.yellow : C.white }} />
                <div style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: 40, color: i === 0 ? C.yellow : C.white }}>{g} g</div>
              </div>
            );
          })}
        </div>
      ) : null}

      {/* viaje */}
      {f >= B.trip && f < B.oil ? (
        <div style={{ position: "absolute", top: 560, left: 60, width: CX * 2 - 120, textAlign: "center", opacity: inOut(f, B.trip + 4, B.trip + 14, B.oil - 6, B.oil) }}>
          <div style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: 110, lineHeight: 0.95, color: C.white }}>SANTIAGO → VIÑA</div>
          <div style={{ fontFamily: UI, fontWeight: 600, fontSize: 40, color: C.dim, marginTop: 18 }}>son unas</div>
          <div style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: 196, lineHeight: 1, color: C.yellow, fontVariantNumeric: "tabular-nums" }}>
            {fmt(Math.round(425000 * ramp(f, B.trip + 14, B.trip + 60, EASE_IN_OUT) / 1000) * 1000)}
          </div>
          <div style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: 96, lineHeight: 1, color: C.white }}>EXPLOSIONES</div>
          <div style={{ fontFamily: UI, fontWeight: 500, fontSize: 30, color: C.faint, marginTop: 26 }}>≈ 1 h 25 min a ~2.500 rpm promedio · motor de 4 cilindros</div>
        </div>
      ) : null}

      {/* aceite */}
      <Headline f={f} a={B.oil + 4} b={B.cta} top={520} size={86} lines={["LO ÚNICO QUE", "LO MANTIENE VIVO:", <Y key="y">UNA CAPA DE ACEITE</Y>, <Y key="y2">MÁS DELGADA QUE UN PELO</Y>]} />

      {/* CTA */}
      {f >= B.cta ? (
        <AbsoluteFill style={{ alignItems: "center" }}>
          <div style={{ position: "absolute", top: 470, width: CX * 2 - 120, left: 60, textAlign: "center", fontFamily: DISPLAY, fontWeight: 800, fontSize: 120, lineHeight: 0.95, color: C.white, opacity: ramp(f, B.cta, B.cta + 10), scale: String(interpolate(ramp(f, B.cta, B.cta + 12, BACK_OUT), [0, 1], [1.12, 1])) }}>
            ¿HACE CUÁNTOS KM
            <br />
            <span style={{ color: C.yellow }}>CAMBIASTE EL ACEITE?</span>
          </div>
          <div style={{ position: "absolute", top: 820, left: CX - 330, width: 660, textAlign: "center", padding: "22px 0", borderRadius: 24, background: C.yellow, color: C.ink, fontFamily: UI, fontWeight: 700, fontSize: 42, opacity: ramp(f, B.cta + 14, B.cta + 24) }}>
            Responde con honestidad 👇
          </div>
          <div style={{ position: "absolute", top: 960, width: CX * 2, left: 0, textAlign: "center", fontFamily: UI, fontWeight: 600, fontSize: 38, color: C.white, opacity: ramp(f, B.cta + 22, B.cta + 32) * 0.9 }}>
            Mándaselo a quien "lo cambia el otro mes"
          </div>
          <div style={{ position: "absolute", top: 1100, width: CX * 2, left: 0, textAlign: "center", fontFamily: DISPLAY, fontWeight: 700, fontSize: 44, letterSpacing: 20, color: "rgba(244,246,248,0.6)", opacity: ramp(f, B.cta + 30, B.cta + 42) }}>
            MOKTA
          </div>
        </AbsoluteFill>
      ) : null}

      {withAudio ? <Audio src={staticFile("audio/motor-lento.wav")} /> : null}
    </AbsoluteFill>
  );
};
