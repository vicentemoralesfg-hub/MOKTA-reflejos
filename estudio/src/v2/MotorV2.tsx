import React from "react";
import { AbsoluteFill, interpolate, staticFile, useCurrentFrame } from "remotion";
import { Audio } from "@remotion/media";
import { C, DISPLAY, UI } from "../brand";
import { BACK_OUT, EASE_IN_OUT, EASE_OUT, ramp } from "../lib/anim";
import { Engine, PHASE } from "../reels/motor/Engine";
import { Captions } from "./comp/Captions";
import { VO, seg, wordAt } from "./lib/vo";
import voJson from "../vo/motor.json";
import TH from "./motor_theta.json";

/**
 * Reel motor v2 · "A 3.000 rpm tu motor hace esto 100 veces por segundo"
 * Gancho directo + locución + subtítulos; el ciclo está anclado a la narración (θ precalculado).
 */
export const MOTOR_VO = voJson as VO;
const vo = MOTOR_VO;
const CX = 500;
export const MOTOR_TOTAL = TH.total;

const Y: React.FC<{ children: React.ReactNode; c?: string }> = ({ children, c = C.yellow }) => <span style={{ color: c }}>{children}</span>;

const strokeLabel = (a: number) => ["EXPLOTA", "BOTA LOS GASES", "ASPIRA", "COMPRIME"][Math.floor((((a % 720) + 720) % 720) / 180)];

/** Corte microscópico a escala (5 px por micrómetro): pared del cilindro, película de aceite, anillo y un pelo. */
const OilMacro: React.FC<{ f: number }> = ({ f }) => {
  const px = 5;
  const film = 5 * px; // ~5 µm
  const hairR = (70 * px) / 2; // pelo ~70 µm de diámetro
  const flow = (f * 3) % 40;
  const W0 = 70;
  const W1 = 360;
  return (
    <svg width={1080} height={900} viewBox="0 0 1080 900" style={{ position: "absolute", top: 390, left: 0 }}>
      <defs>
        <linearGradient id="steel" x1="0" x2="1">
          <stop offset="0" stopColor="#4D545F" />
          <stop offset="0.6" stopColor="#B9C1CC" />
          <stop offset="1" stopColor="#7A828E" />
        </linearGradient>
        <pattern id="flowP" width="10" height="40" patternUnits="userSpaceOnUse" patternTransform={`translate(0 ${flow})`}>
          <rect width="10" height="40" fill="#E6A93A" />
          <rect width="10" height="16" fill="#FFD36B" />
        </pattern>
      </defs>
      <rect x={W0} y={60} width={W1 - W0} height={560} fill="url(#steel)" />
      <text x={(W0 + W1) / 2} y={40} textAnchor="middle" fontFamily="Inter" fontWeight={700} fontSize={26} fill="#F4F6F8">CILINDRO</text>
      <rect x={W1} y={60} width={film} height={560} fill="url(#flowP)" />
      <rect x={W1 + film} y={230} width={230} height={200} rx={8} fill="#8F97A3" />
      <text x={W1 + film + 115} y={340} textAnchor="middle" fontFamily="Inter" fontWeight={800} fontSize={28} fill="#0B0E14">ANILLO</text>
      <g opacity={ramp(f, 8, 18)}>
        <line x1={W1} y1={660} x2={W1 + film} y2={660} stroke={C.yellow} strokeWidth={4} />
        <line x1={W1} y1={640} x2={W1} y2={680} stroke={C.yellow} strokeWidth={4} />
        <line x1={W1 + film} y1={640} x2={W1 + film} y2={680} stroke={C.yellow} strokeWidth={4} />
        <text x={W1 - 20} y={740} fontFamily="Barlow Condensed" fontWeight={800} fontSize={56} fill={C.yellow}>ACEITE ≈ 0,005 mm</text>
      </g>
      <g opacity={ramp(f, 28, 40)}>
        <circle cx={790} cy={330} r={hairR} fill="#3A2C20" stroke="#6E5640" strokeWidth={4} />
        <text x={790} y={330 + hairR + 60} textAnchor="middle" fontFamily="Barlow Condensed" fontWeight={800} fontSize={50} fill="#F4F6F8">UN PELO ≈ 0,07 mm</text>
      </g>
    </svg>
  );
};

export const MotorV2: React.FC<{ withAudio?: boolean }> = ({ withAudio = true }) => {
  const f = useCurrentFrame();
  const S = Object.fromEntries(vo.segments.map((s) => [s.id, seg(vo, s.id)]));
  const M = TH.marks;
  const fi = Math.min(f, TH.total);
  const theta = TH.theta[fi];
  const v = TH.speed[fi];
  const a1 = (((theta - PHASE[0]) % 720) + 720) % 720;

  // cámara: acercamiento al cilindro 1 durante el pistón
  const zoom = ramp(f, S.piston.f0 - 6, S.piston.f0 + 14, EASE_IN_OUT) * (1 - ramp(f, S.oil.f0 - 8, S.oil.f0 + 4, EASE_IN_OUT));
  const baseS = 0.96;
  const scale = baseS + (1.75 - baseS) * zoom;
  const tx = interpolate(zoom, [0, 1], [(1080 - 1080 * baseS) / 2, 500 - 200 * 1.75]);
  const ty = interpolate(zoom, [0, 1], [-150, 1000 - 950 * 1.75]);
  const oil = ramp(f, S.oil.f0 - 4, S.oil.f0 + 8);
  const ctaOn = f >= S.cta.f0 - 4;
  const engineDim = Math.max(oil * 0.88, 0);
  const flicker = v > 200 ? 0.07 + 0.05 * Math.sin(f * 2.7) : 0;

  return (
    <AbsoluteFill style={{ background: "#07080B", overflow: "hidden" }}>
      <AbsoluteFill style={{ background: "radial-gradient(900px 900px at 50% 55%, rgba(255,120,40,0.10), transparent 70%)" }} />
      <AbsoluteFill style={{ transformOrigin: "0 0", transform: `translate(${tx}px, ${ty}px) scale(${scale})`, opacity: 1 - engineDim }}>
        <Engine theta={theta} dTheta={v} highlight={f >= M.asp - 10 && f < S.oil.f0 ? 1 : 0} />
      </AbsoluteFill>
      <AbsoluteFill style={{ background: "#FF8A2A", opacity: flicker * (1 - engineDim), mixBlendMode: "screen" }} />
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 50%, transparent 55%, rgba(0,0,0,0.6) 100%)" }} />

      {/* ---------- GANCHO ---------- */}
      {f < S.slow.f0 ? (
        <div style={{ position: "absolute", top: 240, left: 40, width: CX * 2 - 80, textAlign: "center", fontFamily: DISPLAY, fontWeight: 800, lineHeight: 0.92, textShadow: "0 6px 30px rgba(0,0,0,0.85)" }}>
          <div style={{ fontSize: 120, color: C.yellow, scale: String(interpolate(ramp(f, 0, 10, BACK_OUT), [0, 1], [1.1, 1])) }}>A 3.000 RPM</div>
          <div style={{ fontSize: 88, color: C.white }}>TU MOTOR HACE ESTO</div>
          <div style={{ fontSize: 88, color: C.white }}>
            <Y>100 VECES</Y> POR SEGUNDO
          </div>
        </div>
      ) : null}

      {/* ---------- CÁMARA LENTA ---------- */}
      {f >= S.slow.f0 && f < M.asp - 6 ? (
        <div style={{ position: "absolute", top: 250, left: 40, width: CX * 2 - 80, textAlign: "center", fontFamily: DISPLAY, fontWeight: 800, fontSize: 110, lineHeight: 0.92, color: C.white, opacity: ramp(f, S.slow.f0, S.slow.f0 + 8) * (1 - ramp(f, M.asp - 12, M.asp - 6)) }}>
          <Y>50 VECES</Y>
          <br />
          MÁS LENTO
        </div>
      ) : null}

      {/* ---------- LOS 4 TIEMPOS (cilindro 1) ---------- */}
      {f >= M.asp - 8 && f < S.turns.f0 + 2 ? (
        <div style={{ position: "absolute", top: 250, left: 60, width: CX * 2 - 120, opacity: ramp(f, M.asp - 8, M.asp) * (1 - ramp(f, S.turns.f0 - 6, S.turns.f0 + 2)) }}>
          <div style={{ fontFamily: UI, fontWeight: 700, fontSize: 30, letterSpacing: 6, color: C.dim, textAlign: "center", marginBottom: 14 }}>CILINDRO 1</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            {["ASPIRA", "COMPRIME", "EXPLOTA", "BOTA LOS GASES"].map((s, i) => {
              const on = strokeLabel(a1) === s;
              return (
                <div
                  key={s}
                  style={{
                    padding: "16px 0",
                    borderRadius: 16,
                    textAlign: "center",
                    fontFamily: DISPLAY,
                    fontWeight: 800,
                    fontSize: 54,
                    color: on ? C.ink : "rgba(244,246,248,0.35)",
                    background: on ? (s === "EXPLOTA" ? "#FF8A2A" : C.yellow) : "rgba(244,246,248,0.06)",
                    scale: on ? "1.03" : "1",
                  }}
                >
                  <span style={{ fontFamily: UI, fontSize: 26, marginRight: 10, opacity: 0.7 }}>{i + 1}</span>
                  {s}
                </div>
              );
            })}
          </div>
        </div>
      ) : null}
      {f >= S.turns.f0 && f < S.piston.f0 - 6 ? (
        <div style={{ position: "absolute", top: 250, left: 40, width: CX * 2 - 80, textAlign: "center", fontFamily: DISPLAY, fontWeight: 800, fontSize: 96, lineHeight: 0.95, color: C.white, opacity: ramp(f, S.turns.f0, S.turns.f0 + 8) * (1 - ramp(f, S.piston.f0 - 12, S.piston.f0 - 6)) }}>
          4 CILINDROS TURNÁNDOSE
          <br />
          <Y>= 100 EXPLOSIONES/S</Y>
        </div>
      ) : null}

      {/* ---------- PISTÓN ---------- */}
      {f >= S.piston.f0 && f < S.oil.f0 - 4 ? (
        <div style={{ position: "absolute", top: 240, left: 50, width: CX * 2 - 100, opacity: ramp(f, S.piston.f0, S.piston.f0 + 8) * (1 - ramp(f, S.oil.f0 - 10, S.oil.f0 - 4)) }}>
          <div style={{ textAlign: "center", fontFamily: DISPLAY, fontWeight: 800, fontSize: 76, lineHeight: 0.95, color: C.white, textShadow: "0 6px 30px rgba(0,0,0,0.9)" }}>
            FRENA, SE DETIENE Y VUELVE
            <br />
            <Y>100 VECES POR SEGUNDO</Y>
          </div>
          {f >= wordAt(vo, "piston", ["quinientas", "500"]) - 6 ? (
            <div style={{ marginTop: 18, padding: "18px 26px", borderRadius: 22, background: "rgba(7,8,11,0.82)", opacity: ramp(f, wordAt(vo, "piston", ["quinientas", "500"]) - 6, wordAt(vo, "piston", ["quinientas", "500"]) + 4) }}>
              {[
                ["Pistón (motor 1,6 L)", 560, C.yellow, wordAt(vo, "piston", ["quinientas", "500"]) - 6],
                ["Piloto de caza", 9, C.white, S.pilot.f0 - 2],
              ].map(([k, g, col, at]) => {
                const p = ramp(f, at as number, (at as number) + 14, EASE_OUT);
                return (
                  <div key={k as string} style={{ display: "flex", alignItems: "center", gap: 16, margin: "6px 0", opacity: p > 0 ? 1 : 0 }}>
                    <div style={{ width: 300, fontFamily: UI, fontWeight: 700, fontSize: 32, color: C.white, whiteSpace: "nowrap" }}>{k}</div>
                    <div style={{ height: 26, width: Math.max(10, ((g as number) / 560) * 360 * p), borderRadius: 13, background: col as string }} />
                    <div style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: 48, color: col as string }}>{g} g</div>
                  </div>
                );
              })}
            </div>
          ) : null}
        </div>
      ) : null}

      {/* ---------- ACEITE ---------- */}
      {oil > 0 && !ctaOn ? (
        <AbsoluteFill style={{ opacity: oil }}>
          <div style={{ position: "absolute", top: 240, left: 50, width: CX * 2 - 100, textAlign: "center", fontFamily: DISPLAY, fontWeight: 800, fontSize: 80, lineHeight: 0.95, color: C.white }}>
            LO QUE LO MANTIENE VIVO:
            <br />
            <Y>UNA CAPA DE ACEITE</Y>
          </div>
          <OilMacro f={f - S.oil.f0} />
          <div style={{ position: "absolute", top: 1150, left: 0, width: CX * 2, textAlign: "center", fontFamily: UI, fontWeight: 500, fontSize: 24, color: C.faint }}>
            a escala · película típica entre anillo y cilindro: unas milésimas de milímetro
          </div>
        </AbsoluteFill>
      ) : null}

      {/* ---------- PREGUNTA ---------- */}
      {ctaOn ? (
        <AbsoluteFill style={{ opacity: ramp(f, S.cta.f0 - 4, S.cta.f0 + 6), background: "rgba(7,8,11,0.6)" }}>
          <div style={{ position: "absolute", top: 380, left: 40, width: CX * 2 - 80, textAlign: "center", fontFamily: DISPLAY, fontWeight: 800, fontSize: 112, lineHeight: 0.92, color: C.white }}>
            ¿CADA CUÁNTOS KM
            <br />
            <Y>CAMBIAS EL ACEITE?</Y>
          </div>
          <div style={{ position: "absolute", top: 660, left: CX - 300, width: 600, textAlign: "center", padding: "20px 0", borderRadius: 22, background: C.yellow, color: C.ink, fontFamily: UI, fontWeight: 800, fontSize: 40, opacity: ramp(f, S.cta.f0 + 8, S.cta.f0 + 18) }}>
            Responde con honestidad 👇
          </div>
          <div style={{ position: "absolute", top: 790, left: 0, width: CX * 2, textAlign: "center", fontFamily: DISPLAY, fontWeight: 700, fontSize: 44, letterSpacing: 20, color: "rgba(244,246,248,0.6)", opacity: ramp(f, S.cta.f0 + 18, S.cta.f0 + 30) }}>
            MOKTA
          </div>
        </AbsoluteFill>
      ) : null}

      <Captions vo={vo} f={f} top={1270} fix={{ vencina: "bencina", casa: "caza" }} hide={(x) => x < S.slow.f0 || x >= S.cta.f0 - 4} />
      {withAudio ? <Audio src={staticFile("audio/v2-motor.wav")} /> : null}
    </AbsoluteFill>
  );
};
