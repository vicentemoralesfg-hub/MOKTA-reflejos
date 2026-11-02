import React from "react";
import { AbsoluteFill, interpolate, staticFile, useCurrentFrame } from "remotion";
import { Audio } from "@remotion/media";
import { C, DISPLAY, UI, fmt } from "../../brand";
import { BACK_OUT, EASE_IN_OUT, inOut, ramp } from "../../lib/anim";
import { Buddy } from "../../carruseles/asado/Buddy";
import T from "./timeline.json";

/**
 * Reel 04 · "¿Hasta el clic o redondeas?"
 * Debate (Team Clic vs Team Redondeo) → diagrama animado del estanque y el cánister → veredicto → pregunta.
 */
const K = T.k;
const CX = 500;
const GREEN = C.green;
const RED = C.red;
const FUEL = "#F2A93B";

// ---------------- geometría del diagrama
const TANK = { x: 170, y: 1080, w: 620, h: 280 };
const NECK = { x: 796, w: 50, top: 700, bottom: 1092 };
const VLINE = { x: 292, w: 18, top: 862, bottom: 1084 };
const CAN = { x: 150, y: 690, w: 300, h: 172 };

const bob = (f: number, speed = 0.18, amp = 10, ph = 0) => Math.sin(f * speed + ph) * amp;

const Caption: React.FC<{ f: number; a: number; b: number; lines: React.ReactNode[]; sub?: string }> = ({ f, a, b, lines, sub }) => {
  const o = inOut(f, a, a + 8, b - 6, b);
  if (o <= 0.001) return null;
  return (
    <div style={{ position: "absolute", top: 262, left: 60, width: CX * 2 - 120, textAlign: "center", opacity: o, translate: `0px ${interpolate(ramp(f, a, a + 10), [0, 1], [18, 0])}px` }}>
      {lines.map((l, i) => (
        <div key={i} style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: 84, lineHeight: 0.98, color: C.white }}>
          {l}
        </div>
      ))}
      {sub ? <div style={{ marginTop: 14, fontFamily: UI, fontWeight: 600, fontSize: 36, color: C.dim }}>{sub}</div> : null}
    </div>
  );
};

const Hook: React.FC<{ f: number }> = ({ f }) => {
  const out = ramp(f, K.diagram - 10, K.diagram, EASE_IN_OUT);
  const vs = ramp(f, 0, 10, BACK_OUT);
  return (
    <AbsoluteFill style={{ opacity: 1 - out }}>
      <div style={{ position: "absolute", left: 0, top: 0, width: 540, height: 1920, background: `linear-gradient(180deg, ${GREEN}22, ${GREEN}08)` }} />
      <div style={{ position: "absolute", left: 540, top: 0, width: 540, height: 1920, background: `linear-gradient(180deg, ${RED}26, ${RED}08)` }} />
      <div style={{ position: "absolute", top: 262, left: 40, width: CX * 2 - 80, textAlign: "center", fontFamily: DISPLAY, fontWeight: 800, fontSize: 128, lineHeight: 0.92, color: C.white }}>
        ¿HASTA EL <span style={{ color: GREEN }}>CLIC</span>
        <br />O <span style={{ color: RED }}>REDONDEAS?</span>
      </div>
      <div style={{ position: "absolute", left: 20, top: 640, translate: `0px ${bob(f, 0.22, 12)}px`, rotate: `${bob(f, 0.22, 2, 1)}deg` }}>
        <Buddy kind="hibrido" size={440} />
      </div>
      <div style={{ position: "absolute", left: 540, top: 640, translate: `0px ${bob(f, 0.26, 14, 2)}px`, rotate: `${bob(f, 0.26, 3, 0.5)}deg` }}>
        <Buddy kind="v8" size={440} flip />
      </div>
      <div style={{ position: "absolute", left: 40, top: 1160, width: 440, textAlign: "center", fontFamily: DISPLAY, fontWeight: 800, fontSize: 70, color: GREEN }}>TEAM CLIC</div>
      <div style={{ position: "absolute", left: 540, top: 1160, width: 440, textAlign: "center", fontFamily: DISPLAY, fontWeight: 800, fontSize: 70, color: RED }}>TEAM REDONDEO</div>
      <div style={{ position: "absolute", left: 40, top: 1250, width: 440, textAlign: "center", fontFamily: UI, fontWeight: 600, fontSize: 32, color: C.dim }}>«Se cortó, listo.»</div>
      <div style={{ position: "absolute", left: 540, top: 1250, width: 440, textAlign: "center", fontFamily: UI, fontWeight: 600, fontSize: 32, color: C.dim }}>«Redondéeme a 30 lucas.»</div>
      <div
        style={{
          position: "absolute",
          left: 540 - 70,
          top: 860,
          width: 140,
          height: 140,
          borderRadius: 70,
          background: C.yellow,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: DISPLAY,
          fontWeight: 800,
          fontSize: 76,
          color: C.ink,
          scale: String(interpolate(vs, [0, 1], [0.85, 1])),
          rotate: `${interpolate(vs, [0, 1], [-20, -8])}deg`,
          boxShadow: "0 0 60px rgba(255,200,61,0.5)",
        }}
      >
        VS
      </div>
    </AbsoluteFill>
  );
};

/** Ícono "check engine" (silueta de motor). */
const CheckEngine: React.FC<{ on: number; f: number }> = ({ on, f }) => {
  const pulse = 0.75 + 0.25 * Math.sin(f * 0.5);
  return (
    <g transform="translate(505 715) scale(1.3)" opacity={on}>
      <circle cx={70} cy={50} r={110} fill="#FFB21E" opacity={0.12 * pulse} />
      <path
        d="M10 30 h18 v-14 h26 v-10 h30 v10 h24 l14 14 h12 v-10 h12 v52 h-12 v-10 h-12 v18 h-62 l-14 -14 h-18 v-16 h-18 z"
        fill="none"
        stroke="#FFB21E"
        strokeWidth={8}
        strokeLinejoin="round"
        style={{ filter: `drop-shadow(0 0 ${14 * pulse}px #FFB21E)` }}
      />
    </g>
  );
};

const Diagram: React.FC<{ f: number }> = ({ f }) => {
  const tank = interpolate(f, [K.diagram, K.full], [0.18, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const neckToTip = ramp(f, K.full, K.clic, EASE_IN_OUT) * 0.78;
  const neckOver = ramp(f, K.round, K.round + 50) * 0.22;
  const neck = neckToTip + neckOver;
  const vline = ramp(f, K.round + 30, K.reach, EASE_IN_OUT);
  const soak = ramp(f, K.reach, K.reach + 30);
  const ce = ramp(f, K.check, K.check + 6);
  const flowing = (f >= K.diagram && f < K.clic) || (f >= K.round && f < K.reach);
  const surfY = TANK.y + TANK.h - 14 - tank * (TANK.h - 24);
  const neckH = NECK.bottom - NECK.top;
  const vH = VLINE.bottom - VLINE.top;

  return (
    <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: "absolute", inset: 0 }}>
      <defs>
        <linearGradient id="fuel" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#FFC85A" />
          <stop offset="1" stopColor="#C97A12" />
        </linearGradient>
        <clipPath id="tankClip">
          <rect x={TANK.x} y={TANK.y} width={TANK.w} height={TANK.h} rx={60} />
        </clipPath>
        <pattern id="carbon" width="22" height="22" patternUnits="userSpaceOnUse">
          <circle cx="6" cy="6" r="4" fill="#3A3F48" />
          <circle cx="17" cy="15" r="5" fill="#2E333B" />
        </pattern>
      </defs>

      {/* motor (destino de los vapores purgados) */}
      <rect x={CAN.x + 190} y={530} width={140} height={60} rx={14} fill="none" stroke="rgba(244,246,248,0.4)" strokeWidth={4} />
      <text x={CAN.x + 260} y={570} textAnchor="middle" fontFamily="Inter" fontWeight={700} fontSize={26} fill="rgba(244,246,248,0.6)">
        MOTOR
      </text>
      <line x1={CAN.x + 260} y1={590} x2={CAN.x + 260} y2={CAN.y} stroke="rgba(244,246,248,0.35)" strokeWidth={8} strokeDasharray="14 10" />

      {/* cánister */}
      <rect x={CAN.x} y={CAN.y} width={CAN.w} height={CAN.h} rx={26} fill="#1A1E25" stroke={soak > 0 ? `rgba(255,59,59,${0.5 + 0.5 * soak})` : "rgba(244,246,248,0.6)"} strokeWidth={6} />
      <rect x={CAN.x + 14} y={CAN.y + 14} width={CAN.w - 28} height={CAN.h - 28} rx={16} fill="url(#carbon)" />
      <rect x={CAN.x + 14} y={CAN.y + 14 + (CAN.h - 28) * (1 - soak)} width={CAN.w - 28} height={(CAN.h - 28) * soak} rx={16} fill={FUEL} opacity={0.75} />
      {soak > 0 ? <rect x={CAN.x - 10} y={CAN.y - 10} width={CAN.w + 20} height={CAN.h + 20} rx={34} fill="none" stroke={RED} strokeWidth={4} opacity={soak * (0.5 + 0.5 * Math.sin(f * 0.6))} /> : null}
      <text x={CAN.x} y={CAN.y - 22} fontFamily="Inter" fontWeight={800} fontSize={32} fill={C.white}>
        CÁNISTER
      </text>

      {/* línea de vapores */}
      <rect x={VLINE.x} y={VLINE.top} width={VLINE.w} height={vH} rx={9} fill="#14171D" stroke="rgba(244,246,248,0.55)" strokeWidth={4} />
      <rect x={VLINE.x + 3} y={VLINE.bottom - vH * vline} width={VLINE.w - 6} height={vH * vline} rx={6} fill={FUEL} />
      {/* burbujas de vapor que suben al cánister mientras se carga normal */}
      {f >= K.diagram && f < K.round + 30
        ? [0, 1, 2, 3].map((i) => {
            const ph = ((f - K.diagram) * 0.035 + i / 4) % 1;
            return <circle key={i} cx={VLINE.x + VLINE.w / 2} cy={VLINE.bottom - ph * vH} r={6} fill="rgba(220,235,255,0.75)" opacity={Math.sin(ph * Math.PI)} />;
          })
        : null}

      {/* estanque */}
      <rect x={TANK.x} y={TANK.y} width={TANK.w} height={TANK.h} rx={60} fill="#14171D" />
      <g clipPath="url(#tankClip)">
        <path
          d={`M ${TANK.x - 20} ${surfY} ${Array.from({ length: 14 })
            .map((_, i) => {
              const x = TANK.x - 20 + (i + 1) * 50;
              const y = surfY + Math.sin(f * 0.3 + i * 0.9) * (flowing ? 6 : 2);
              return `L ${x} ${y}`;
            })
            .join(" ")} L ${TANK.x + TANK.w + 40} ${TANK.y + TANK.h + 20} L ${TANK.x - 20} ${TANK.y + TANK.h + 20} Z`}
          fill="url(#fuel)"
        />
      </g>
      <rect x={TANK.x} y={TANK.y} width={TANK.w} height={TANK.h} rx={60} fill="none" stroke="rgba(244,246,248,0.7)" strokeWidth={6} />
      <text x={TANK.x + 40} y={TANK.y + 60} fontFamily="Inter" fontWeight={800} fontSize={30} fill="#FFFFFF" opacity={0.85} style={{ paintOrder: "stroke" }} stroke="rgba(7,9,13,0.55)" strokeWidth={6}>
        ESTANQUE
      </text>

      {/* cuello de llenado */}
      <rect x={NECK.x} y={NECK.top} width={NECK.w} height={neckH} rx={22} fill="#14171D" stroke="rgba(244,246,248,0.7)" strokeWidth={6} />
      <rect x={NECK.x + 6} y={NECK.bottom - neckH * neck} width={NECK.w - 12} height={neckH * neck} rx={16} fill={FUEL} />

      {/* pistola */}
      <g transform={`translate(${NECK.x + NECK.w / 2} ${NECK.top + 70}) rotate(-28)`}>
        <rect x={-14} y={-150} width={28} height={150} rx={10} fill="#2C3038" stroke="rgba(244,246,248,0.7)" strokeWidth={4} />
        <path d="M-40 -250 h80 a20 20 0 0 1 20 20 v60 h-120 v-60 a20 20 0 0 1 20 -20 z" fill="#3A3F48" stroke="rgba(244,246,248,0.7)" strokeWidth={4} />
        {flowing
          ? [0, 1, 2].map((i) => {
              const ph = ((f * 0.12 + i / 3) % 1) * 120;
              return <rect key={i} x={-5} y={-130 + ph} width={10} height={18} rx={5} fill={FUEL} />;
            })
          : null}
      </g>

      <CheckEngine on={ce} f={f} />
    </svg>
  );
};

export const Clic: React.FC<{ withAudio?: boolean }> = ({ withAudio = true }) => {
  const f = useCurrentFrame();
  const diag = ramp(f, K.diagram - 6, K.diagram + 8);
  const diagDim = ramp(f, K.verdict, K.verdict + 10) * 0.75 + ramp(f, K.cta - 8, K.cta) * 0.23;
  const clicBurst = f >= K.clic ? Math.max(0, 1 - (f - K.clic) / 18) : 0;
  const pesos = Math.round(interpolate(f, [K.round, K.reach], [29430, 30000], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) / 10) * 10;
  const verdict = ramp(f, K.verdict + 4, K.verdict + 14, BACK_OUT);
  const cta = f >= K.cta;

  return (
    <AbsoluteFill style={{ background: C.ink, overflow: "hidden" }}>
      {f < K.diagram ? <Hook f={f} /> : null}

      {f >= K.diagram - 6 ? (
        <AbsoluteFill style={{ opacity: diag }}>
          <Diagram f={f} />
          {/* ¡CLIC! */}
          {clicBurst > 0 ? (
            <div
              style={{
                position: "absolute",
                left: 640,
                top: 560,
                fontFamily: DISPLAY,
                fontWeight: 800,
                fontSize: 110,
                color: C.yellow,
                rotate: "-10deg",
                opacity: Math.min(1, clicBurst * 2),
                scale: String(interpolate(ramp(f, K.clic, K.clic + 6, BACK_OUT), [0, 1], [0.5, 1.1])),
                textShadow: "0 0 40px rgba(255,200,61,0.6)",
              }}
            >
              ¡CLIC!
            </div>
          ) : null}
          {/* contador del redondeo */}
          {f >= K.round && f < K.verdict ? (
            <div
              style={{
                position: "absolute",
                left: 560,
                top: 560,
                padding: "14px 24px",
                borderRadius: 18,
                background: "#0E1117",
                border: `3px solid ${f >= K.reach ? RED : "rgba(244,246,248,0.4)"}`,
                fontFamily: DISPLAY,
                fontWeight: 800,
                fontSize: 64,
                color: f >= K.reach ? RED : C.white,
                fontVariantNumeric: "tabular-nums",
                opacity: ramp(f, K.round, K.round + 8) * (1 - ramp(f, K.verdict - 8, K.verdict)),
              }}
            >
              $ {fmt(pesos)}
            </div>
          ) : null}
          {/* consecuencias */}
          {f >= K.check ? (
            <div style={{ position: "absolute", top: 1400, left: 60, width: CX * 2 - 120, display: "flex", justifyContent: "center", gap: 14, opacity: ramp(f, K.check + 4, K.check + 14) * (1 - ramp(f, K.verdict - 8, K.verdict)) }}>
              {["Olor a bencina", "Luz de falla", "Reparación evitable"].map((t, i) => (
                <div key={t} style={{ padding: "12px 18px", borderRadius: 14, background: "rgba(255,59,59,0.12)", border: "2px solid rgba(255,59,59,0.5)", fontFamily: UI, fontWeight: 700, fontSize: 28, color: "#FF8A8A", opacity: ramp(f, K.check + 4 + i * 5, K.check + 12 + i * 5) }}>
                  {t}
                </div>
              ))}
            </div>
          ) : null}
        </AbsoluteFill>
      ) : null}
      <AbsoluteFill style={{ background: C.ink, opacity: diagDim }} />

      <Caption f={f} a={K.diagram} b={K.full + 4} lines={["MIENTRAS CARGAS, LOS", <span key="s">VAPORES VAN AL <span style={{ color: C.yellow }}>CÁNISTER</span></span>]} sub="un filtro de carbón activado que los atrapa" />
      <Caption f={f} a={K.full + 4} b={K.round} lines={[<span key="s">EL <span style={{ color: C.yellow }}>CLIC</span> = ESTANQUE LLENO</span>]} sub="la pistola se corta sola cuando la bencina llega a su punta" />
      <Caption f={f} a={K.round} b={K.reach} lines={["PERO SI SIGUES", <span key="s">PARA <span style={{ color: RED }}>REDONDEAR…</span></span>]} />
      <Caption f={f} a={K.reach} b={K.verdict} lines={["LA BENCINA LÍQUIDA", <span key="s">LLEGA AL CÁNISTER</span>, <span key="t" style={{ color: RED }}>Y LO ARRUINA</span>]} />

      {/* veredicto */}
      {f >= K.verdict && f < K.cta ? (
        <AbsoluteFill style={{ opacity: 1 - ramp(f, K.cta - 8, K.cta) }}>
          <div style={{ position: "absolute", top: 300, left: 0, width: CX * 2, textAlign: "center", fontFamily: UI, fontWeight: 700, fontSize: 40, letterSpacing: 10, color: C.dim, opacity: ramp(f, K.verdict, K.verdict + 8) }}>
            VEREDICTO
          </div>
          <div
            style={{
              position: "absolute",
              top: 380,
              left: CX - 380,
              width: 760,
              padding: "26px 0 30px",
              textAlign: "center",
              border: `8px solid ${GREEN}`,
              borderRadius: 30,
              fontFamily: DISPLAY,
              fontWeight: 800,
              fontSize: 132,
              lineHeight: 0.92,
              color: GREEN,
              rotate: "-4deg",
              opacity: verdict,
              scale: String(interpolate(verdict, [0, 1], [1.6, 1])),
            }}
          >
            EL CLIC ES
            <br />
            EL LÍMITE
          </div>
          <div style={{ position: "absolute", left: CX - 200, top: 800, translate: `0px ${-Math.abs(Math.sin(f * 0.25)) * 40}px`, opacity: ramp(f, K.verdict + 10, K.verdict + 18) }}>
            <Buddy kind="hibrido" size={400} />
          </div>
        </AbsoluteFill>
      ) : null}

      {/* pregunta final */}
      {cta ? (
        <AbsoluteFill>
          <div style={{ position: "absolute", top: 300, left: 40, width: CX * 2 - 80, textAlign: "center", fontFamily: DISPLAY, fontWeight: 800, fontSize: 120, lineHeight: 0.92, color: C.white, opacity: ramp(f, K.cta, K.cta + 8), scale: String(interpolate(ramp(f, K.cta, K.cta + 12, BACK_OUT), [0, 1], [1.1, 1])) }}>
            ¿TEAM <span style={{ color: GREEN }}>CLIC</span>
            <br />O TEAM <span style={{ color: RED }}>REDONDEO</span>?
          </div>
          <div style={{ position: "absolute", left: 70, top: 640, translate: `0px ${bob(f, 0.22, 10)}px` }}>
            <Buddy kind="hibrido" size={330} />
          </div>
          <div style={{ position: "absolute", left: 560, top: 640, translate: `0px ${bob(f, 0.26, 10, 2)}px`, rotate: `${bob(f, 0.15, 4)}deg` }}>
            <Buddy kind="v8" size={330} flip />
          </div>
          <div style={{ position: "absolute", top: 1060, left: CX - 330, width: 660, textAlign: "center", padding: "22px 0", borderRadius: 24, background: C.yellow, color: C.ink, fontFamily: UI, fontWeight: 700, fontSize: 42, opacity: ramp(f, K.cta + 12, K.cta + 22) }}>
            Comenta tu bando 👇
          </div>
          <div style={{ position: "absolute", top: 1190, left: 60, width: CX * 2 - 120, textAlign: "center", fontFamily: UI, fontWeight: 600, fontSize: 36, color: C.white, opacity: ramp(f, K.cta + 20, K.cta + 30) * 0.9 }}>
            Mándaselo al que dice «redondéeme a 30 lucas»
          </div>
          <div style={{ position: "absolute", top: 1320, left: 0, width: CX * 2, textAlign: "center", fontFamily: DISPLAY, fontWeight: 700, fontSize: 44, letterSpacing: 20, color: "rgba(244,246,248,0.6)", opacity: ramp(f, K.cta + 28, K.cta + 40) }}>
            MOKTA
          </div>
        </AbsoluteFill>
      ) : null}

      {withAudio ? <Audio src={staticFile("audio/clic.wav")} /> : null}
    </AbsoluteFill>
  );
};
