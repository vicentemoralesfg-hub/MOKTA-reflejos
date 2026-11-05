import React from "react";
import { AbsoluteFill, Sequence, interpolate, staticFile, useCurrentFrame } from "remotion";
import { Video } from "@remotion/media";
import { GaugeG } from "../components/Gauge";
import { BACK, C, EASE_IN, EASE_IN_OUT, EASE_OUT, FONT_D, FONT_UI, lerpT, ramp } from "../theme";
import { fuelForNeedle, needleForFuel } from "../tankModel";
import { cue } from "../timing";

/**
 * Cabina "real": toma real de conducción nocturna (CC0, Wikimedia Commons) en el parabrisas,
 * tablero, volante e instrumentos. Una cámara (zoom) va del plano del conductor al marcador.
 */
const FUEL_C: [number, number] = [780, 1310]; // centro del marcador de bencina en el plano general
const GAUGE_D = 280;
const ZOOM = 2.9;
const CLOSE_TARGET: [number, number] = [540, 930];

const blink = (t: number, from: number, period = 7) => (Math.floor((t - from) / period) % 2 === 0 ? 1 : 0.25);

/** Velocímetro simple (decorativo) */
const Speedo: React.FC<{ v: number; on: number }> = ({ v, on }) => {
  const a = -120 + 240 * v;
  return (
    <g>
      <circle cx={0} cy={0} r={150} fill="#05080E" stroke="#3A4556" strokeWidth={6} />
      {Array.from({ length: 13 }).map((_, k) => {
        const ang = ((-120 + 20 * k) * Math.PI) / 180;
        return (
          <g key={k}>
            <line x1={Math.sin(ang) * 112} y1={-Math.cos(ang) * 112} x2={Math.sin(ang) * 132} y2={-Math.cos(ang) * 132} stroke={C.white} strokeWidth={k % 2 ? 2 : 4} opacity={on} />
            {k % 2 === 0 ? (
              <text x={Math.sin(ang) * 90} y={-Math.cos(ang) * 90 + 9} textAnchor="middle" fontFamily={FONT_D} fontWeight={700} fontSize={24} fill={C.white} opacity={0.85 * on}>
                {k * 20}
              </text>
            ) : null}
          </g>
        );
      })}
      <g transform={`rotate(${a})`}>
        <polygon points="-5,10 5,10 1.5,-128 -1.5,-128" fill={C.red} opacity={0.4 + 0.6 * on} />
      </g>
      <circle r={16} fill="#1B2330" stroke="#5B6678" strokeWidth={3} />
      <text x={0} y={70} textAnchor="middle" fontFamily={FONT_UI} fontWeight={600} fontSize={18} fill={C.dim} opacity={on}>
        km/h
      </text>
    </g>
  );
};

/** Grano de película (determinista por fotograma). */
const Grain: React.FC<{ t: number; o?: number }> = ({ t, o = 0.09 }) => (
  <svg width={1080} height={1920} style={{ position: "absolute", inset: 0, opacity: o, mixBlendMode: "overlay" }}>
    <filter id={`gr${t % 7}`}>
      <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves={2} seed={t % 97} />
      <feColorMatrix type="saturate" values="0" />
    </filter>
    <rect width={1080} height={1920} filter={`url(#gr${t % 7})`} />
  </svg>
);

export type CockpitState = {
  zoom: number; // 0 = plano conductor, 1 = primer plano del marcador
  fuel: number; // aguja 0..1
  lamp: number;
  on: number; // luz de tablero 0..1
  speed: number; // 0..1
  sweep?: number; // destello de reflejos
  lcd?: string;
};

export const CockpitWorld: React.FC<CockpitState & { videoFrom: number; children?: React.ReactNode }> = ({
  zoom,
  fuel,
  lamp,
  on,
  speed,
  lcd = "",
  videoFrom,
  children,
}) => {
  const t = useCurrentFrame();
  const s = 1 + (ZOOM - 1) * zoom;
  const fx = FUEL_C[0] + (CLOSE_TARGET[0] - FUEL_C[0]) * zoom;
  const fy = FUEL_C[1] + (CLOSE_TARGET[1] - FUEL_C[1]) * zoom;
  const hand = { x: 3 * Math.sin(t * 0.13) + 1.5 * Math.sin(t * 0.37), y: 2.5 * Math.cos(t * 0.11) + 1.2 * Math.sin(t * 0.29) };
  // reflejos de faroles que cruzan el vidrio
  const streak = (k: number) => ((t * (9 + k * 3) + k * 420) % 1700) - 300;
  const blur = zoom > 0.02 && zoom < 0.98 ? Math.sin(zoom * Math.PI) * 6 : 0;

  return (
    <AbsoluteFill style={{ background: "#020306", overflow: "hidden" }}>
      <AbsoluteFill
        style={{
          transformOrigin: "0 0",
          transform: `translate(${fx + hand.x}px, ${fy + hand.y}px) scale(${s}) translate(${-FUEL_C[0]}px, ${-FUEL_C[1]}px)`,
          filter: blur > 0.3 ? `blur(${blur}px)` : undefined,
        }}
      >
        {/* parabrisas: toma real */}
        <div style={{ position: "absolute", left: -482, top: -60, width: 2044, height: 1150, overflow: "hidden", filter: "contrast(1.08) saturate(1.05) brightness(0.92)" }}>
          <Sequence from={videoFrom} layout="none">
            <Video src={staticFile("bencina/real/noche_pov.mp4")} muted objectFit="cover" style={{ width: 2044, height: 1150 }} />
          </Sequence>
        </div>
        {/* tinte del vidrio, viñeta superior y reflejos que barren el parabrisas */}
        <div style={{ position: "absolute", left: 0, top: 0, width: 1080, height: 1100, background: "linear-gradient(180deg, rgba(4,8,16,0.55) 0%, rgba(4,8,16,0) 30%, rgba(4,8,16,0) 75%, rgba(2,3,6,0.85) 100%)" }} />
        {[0, 1, 2].map((k) => (
          <div
            key={k}
            style={{
              position: "absolute",
              top: -200,
              left: streak(k),
              width: 120 + 60 * k,
              height: 1400,
              rotate: "28deg",
              background: `linear-gradient(90deg, rgba(255,170,70,0) 0%, rgba(255,170,70,${0.16 - 0.04 * k}) 50%, rgba(255,170,70,0) 100%)`,
              mixBlendMode: "screen",
            }}
          />
        ))}
        {/* pilares A y espejo */}
        <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
          <path d="M0,0 L170,0 L40,1060 L0,1080 Z" fill="#030407" />
          <path d="M1080,0 L910,0 L1040,1060 L1080,1080 Z" fill="#030407" />
          <rect x={410} y={-20} width={260} height={110} rx={30} fill="#06080D" stroke="#141A24" strokeWidth={4} />
          {/* tablero */}
          <path d="M-20,1020 C200,960 880,960 1100,1020 L1100,1940 L-20,1940 Z" fill="url(#dashG)" />
          <defs>
            <linearGradient id="dashG" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#151B25" />
              <stop offset="8%" stopColor="#0A0E15" />
              <stop offset="100%" stopColor="#020306" />
            </linearGradient>
            <radialGradient id="binG" cx="50%" cy="40%" r="70%">
              <stop offset="0%" stopColor={`rgba(40,60,90,${0.5 * on})`} />
              <stop offset="100%" stopColor="#030508" />
            </radialGradient>
            <clipPath id="fuelGlass">
              <circle cx={FUEL_C[0]} cy={FUEL_C[1]} r={GAUGE_D / 2} />
            </clipPath>
          </defs>
          <path d="M-20,1022 C200,962 880,962 1100,1022" stroke="rgba(160,190,230,0.18)" strokeWidth={4} fill="none" />
          {/* visera del cuadro de instrumentos */}
          <path d="M70,1240 C110,1110 970,1110 1010,1240 L1010,1470 L70,1470 Z" fill="url(#binG)" stroke="#1C2430" strokeWidth={6} />
          <path d="M90,1236 C130,1124 950,1124 990,1236" stroke="rgba(255,255,255,0.08)" strokeWidth={10} fill="none" />
          <g transform={`translate(300 1310) scale(0.93)`}>
            <Speedo v={speed} on={on} />
          </g>
          {/* pantalla central */}
          <g opacity={1 - Math.min(1, zoom * 1.6)}>
          <rect x={455} y={1250} width={170} height={120} rx={14} fill="#03060A" stroke="#26303D" strokeWidth={3} />
          <text x={540} y={1300} textAnchor="middle" fontFamily={FONT_UI} fontWeight={700} fontSize={18} letterSpacing={3} fill={C.cyan} opacity={on}>
            AUTONOMÍA
          </text>
          <text x={540} y={1348} textAnchor="middle" fontFamily={FONT_D} fontWeight={800} fontSize={44} fill={lamp > 0.3 ? C.fuel : C.white} opacity={on}>
            {lcd}
          </text>
          </g>
          {/* marcador de bencina */}
          <g transform={`translate(${FUEL_C[0] - GAUGE_D / 2} ${FUEL_C[1] - GAUGE_D / 2}) scale(${GAUGE_D / 600})`} opacity={0.35 + 0.65 * on}>
            <GaugeG value={fuel} lamp={lamp} />
          </g>
          {/* reflejo en el vidrio del marcador */}
          <g clipPath="url(#fuelGlass)">
            {[0, 1].map((k) => {
              const x = FUEL_C[0] - 260 + (((t * (5 + 3 * k) + k * 190) % 520));
              return <rect key={k} x={x} y={FUEL_C[1] - 220} width={34 + 20 * k} height={440} fill={`rgba(255,190,110,${0.08 - 0.03 * k})`} transform={`rotate(24 ${x} ${FUEL_C[1]})`} style={{ mixBlendMode: "screen" }} />;
            })}
          </g>
          {/* volante */}
          <circle cx={540} cy={2090} r={640} fill="none" stroke="url(#wheelG)" strokeWidth={86} />
          <defs>
            <linearGradient id="wheelG" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#1A2029" />
              <stop offset="12%" stopColor="#07090D" />
              <stop offset="100%" stopColor="#020304" />
            </linearGradient>
          </defs>
          <path d="M-100,1960 C200,1430 880,1430 1180,1960" stroke="rgba(170,190,220,0.10)" strokeWidth={4} fill="none" />
        </svg>
        {children}
      </AbsoluteFill>
      {/* viñeta y grano (espacio de pantalla) */}
      <AbsoluteFill style={{ background: "radial-gradient(100% 75% at 50% 50%, rgba(0,0,0,0) 55%, rgba(0,0,0,0.6) 100%)" }} />
      <Grain t={t} />
    </AbsoluteFill>
  );
};

/* ---------------------------------------------------------------- GANCHO */
export const HookReal: React.FC = () => {
  const t = useCurrentFrame();
  const zA = cue("pushIn");
  const zB = cue("pushInEnd");
  const dive = cue("hookDive");
  const diveEnd = cue("hookDiveEnd");
  const stamp = cue("stamp");
  const on = ramp(t, 2, 5, (x) => x) * (t < 4 ? 0.6 : 1);
  // autotest de encendido: agujas barren y vuelven
  const sweep = Math.sin(Math.PI * ramp(t, 4, 24, EASE_IN_OUT));
  let v = 0.27 + 0.012 * Math.sin(t * 0.9);
  if (t < 24) v = 0.27 * ramp(t, 4, 24) + 0.73 * sweep * 1.0 + 0.0;
  if (t >= dive && t < diveEnd) v = 0.27 - 0.3 * ramp(t, dive, diveEnd, EASE_IN);
  if (t >= diveEnd) v = -0.03 + 0.035 * Math.exp(-(t - diveEnd) / 6) * Math.sin((t - diveEnd) * 1.1);
  const lampOn = dive + (diveEnd - dive) * 0.62;
  const lamp = t >= lampOn ? blink(t, lampOn) : t >= 4 && t < 14 ? 1 : 0; // testigos encienden en el autotest
  const range = Math.round(lerpT(t, dive, diveEnd, 84, 0, EASE_IN));
  const zoom = ramp(t, zA, zB, EASE_IN_OUT);
  const st = ramp(t, stamp, stamp + 6, EASE_OUT);
  const hud = ramp(t, zB - 6, zB + 4);

  return (
    <AbsoluteFill>
      <CockpitWorld zoom={zoom} fuel={v} lamp={lamp} on={on} speed={0.32 + 0.6 * sweep + 0.01 * Math.sin(t * 0.4)} lcd={`${range} km`} videoFrom={0} />
      {/* lectura de autonomía en primer plano */}
      <div style={{ position: "absolute", top: 205, left: 0, right: 0, textAlign: "center", opacity: hud * (1 - st) }}>
        <div style={{ fontFamily: FONT_UI, fontWeight: 700, fontSize: 30, letterSpacing: 9, color: C.dim }}>AUTONOMÍA</div>
        <div style={{ fontFamily: FONT_D, fontWeight: 800, fontSize: 120, lineHeight: 1, color: range <= 10 ? C.red : C.white, opacity: range <= 0 ? blink(t, diveEnd, 8) : 1, textShadow: "0 4px 30px rgba(0,0,0,0.8)" }}>
          {range} km
        </div>
      </div>
      {t >= stamp ? (
        <div style={{ position: "absolute", top: 190, left: 0, right: 0, display: "flex", justifyContent: "center", opacity: st }}>
          <div
            style={{
              border: `10px solid ${C.red}`,
              borderRadius: 26,
              padding: "12px 38px 18px",
              rotate: "-4deg",
              scale: String(interpolate(st, [0, 1], [1.9, 1])),
              background: "rgba(20,4,6,0.72)",
              boxShadow: `0 0 60px ${C.red}66`,
              textAlign: "center",
            }}
          >
            <div style={{ fontFamily: FONT_D, fontWeight: 800, fontSize: 100, lineHeight: 1, color: C.white }}>NO ES TU</div>
            <div style={{ fontFamily: FONT_D, fontWeight: 800, fontSize: 122, lineHeight: 1, color: C.red }}>IMAGINACIÓN</div>
          </div>
        </div>
      ) : null}
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------ PLANTEAMIENTO */
export const KM_TANK = 600;
const KM_DEAD = KM_TANK * (1 - fuelForNeedle(0.995));
const KM_HALF = KM_TANK * (1 - fuelForNeedle(0.5));
const KM_E = KM_TANK * (1 - fuelForNeedle(0.002));

const StatCard: React.FC<{ k: number; title: string; value: number; color: string }> = ({ k, title, value, color }) => (
  <div
    style={{
      opacity: k,
      translate: `0px ${interpolate(k, [0, 1], [24, 0])}px`,
      padding: "10px 28px",
      borderRadius: 20,
      background: "rgba(6,9,15,0.72)",
      border: `3px solid ${color}`,
      textAlign: "center",
      minWidth: 300,
      backdropFilter: "blur(6px)",
    }}
  >
    <div style={{ fontFamily: FONT_UI, fontWeight: 700, fontSize: 24, letterSpacing: 5, color: C.dim }}>{title}</div>
    <div style={{ fontFamily: FONT_D, fontWeight: 800, fontSize: 70, lineHeight: 1, color }}>{Math.round(value)} km</div>
  </div>
);

export const SetupReal: React.FC = () => {
  const t = useCurrentFrame();
  const refill = cue("refill");
  const refillEnd = cue("refillEnd");
  const kmRun = cue("kmRun");
  const kmRunEnd = cue("kmRunEnd");
  const half = cue("half");
  const halfEnd = cue("halfEnd");
  const crash = cue("crash");
  const crashEnd = cue("crashEnd");
  let km = 0;
  if (t >= crash) km = lerpT(t, crash, crashEnd, KM_HALF, KM_E, EASE_IN);
  else if (t >= half) km = lerpT(t, half, halfEnd, KM_DEAD, KM_HALF);
  else if (t >= kmRun) km = lerpT(t, kmRun, kmRunEnd, 0, KM_DEAD);
  let v = needleForFuel(1 - km / KM_TANK);
  if (t < refillEnd + 6) {
    const p = ramp(t, refill, refillEnd, EASE_OUT);
    v = p + 0.03 * Math.sin(ramp(t, refillEnd - 4, refillEnd + 6) * Math.PI);
  } else if (t < half) v = 1 - 0.004 * Math.abs(Math.sin(t * 1.7));
  if (t >= crashEnd) v = -0.02;
  const lampOn = crash + Math.round((crashEnd - crash) * 0.75);
  const lamp = t >= lampOn ? blink(t, lampOn) : 0;
  const stat1 = ramp(t, halfEnd - 4, halfEnd + 6, EASE_OUT);
  const stat2 = ramp(t, crashEnd - 6, crashEnd + 4, EASE_OUT);
  const red = ramp(t, crash, crashEnd) * (1 - ramp(t, crashEnd + 6, crashEnd + 20));
  const pop = ramp(t, refill - 2, refill + 8, BACK);

  return (
    <AbsoluteFill>
      <CockpitWorld zoom={1} fuel={v} lamp={lamp} on={1} speed={0.34 + 0.01 * Math.sin(t * 0.4)} lcd={`${Math.round(km)} km`} videoFrom={0} />
      <AbsoluteFill style={{ background: `radial-gradient(70% 50% at 50% 50%, rgba(255,59,59,${0.3 * red}) 0%, rgba(0,0,0,0) 70%)` }} />
      <div style={{ position: "absolute", top: 196, left: 0, right: 0, textAlign: "center", opacity: pop }}>
        <div style={{ fontFamily: FONT_UI, fontWeight: 700, fontSize: 28, letterSpacing: 8, color: C.cyan }}>KM RECORRIDOS</div>
        <div style={{ fontFamily: FONT_D, fontWeight: 800, fontSize: 132, lineHeight: 1, color: C.white, fontVariantNumeric: "tabular-nums", textShadow: "0 4px 30px rgba(0,0,0,0.8)" }}>
          {String(Math.round(km)).padStart(3, "0")}
        </div>
      </div>
      <div style={{ position: "absolute", top: 1215, left: 0, right: 0, display: "flex", justifyContent: "center", gap: 24 }}>
        <StatCard k={stat1} title="1ª MITAD" value={KM_HALF} color={C.white} />
        <StatCard k={stat2} title="2ª MITAD" value={KM_E - KM_HALF} color={C.red} />
      </div>
    </AbsoluteFill>
  );
};

/* ---------------------------------------------------------------------- CTA */
export const CtaReal: React.FC<{ from: number }> = ({ from }) => {
  const t = useCurrentFrame();
  const o1 = cue("opt1");
  const o2 = cue("opt2");
  const o3 = cue("opt3");
  const cm = cue("comment");
  const zoom = 1 - ramp(t, from, from + 26, EASE_IN_OUT);
  let v = 0.66;
  if (t >= o3) v = lerpT(t, o3, o3 + 10, 0.25, 0.04, EASE_OUT);
  else if (t >= o2) v = lerpT(t, o2, o2 + 10, 0.5, 0.25, EASE_OUT);
  else if (t >= o1) v = lerpT(t, o1, o1 + 10, 0.66, 0.5, EASE_OUT);
  const lamp = t >= o3 + 6 ? blink(t, o3 + 6) : 0;
  const opts: [number, string][] = [
    [o1, "½"],
    [o2, "¼"],
    [o3, "RESERVA"],
  ];
  const active = t >= o3 ? 2 : t >= o2 ? 1 : t >= o1 ? 0 : -1;
  const cK = ramp(t, cm - 2, cm + 8, BACK);
  const q = ramp(t, from + 4, from + 14, EASE_OUT);

  return (
    <AbsoluteFill>
      <CockpitWorld zoom={zoom} fuel={v} lamp={lamp} on={1} speed={0.33} lcd={t >= o3 ? "18 km" : "120 km"} videoFrom={from} />
      <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(0,0,0,0.65) 0%, rgba(0,0,0,0.15) 32%, rgba(0,0,0,0) 45%)", opacity: q }} />
      <div style={{ position: "absolute", top: 200, left: 50, right: 50, textAlign: "center", opacity: q, translate: `0px ${interpolate(q, [0, 1], [30, 0])}px` }}>
        <div style={{ fontFamily: FONT_D, fontWeight: 800, fontSize: 110, lineHeight: 1, color: C.white, textShadow: "0 6px 30px rgba(0,0,0,0.8)" }}>
          ¿HASTA DÓNDE DEJAS
          <br />
          BAJAR LA <span style={{ color: C.fuel }}>AGUJA?</span>
        </div>
      </div>
      <div style={{ position: "absolute", top: 860, left: 0, right: 0, display: "flex", justifyContent: "center", gap: 22 }}>
        {opts.map(([at, label], i) => {
          const k = ramp(t, at - 2, at + 7, BACK);
          const isActive = i === active;
          return (
            <div
              key={label}
              style={{
                padding: "8px 32px",
                borderRadius: 20,
                border: `4px solid ${isActive ? C.fuel : "rgba(244,246,248,0.45)"}`,
                background: isActive ? "rgba(40,24,4,0.8)" : "rgba(6,9,15,0.72)",
                fontFamily: FONT_D,
                fontWeight: 800,
                fontSize: 66,
                lineHeight: 1.1,
                color: isActive ? C.fuel : C.white,
                opacity: k,
                scale: String(interpolate(k, [0, 1], [0.5, 1])),
              }}
            >
              {label}
            </div>
          );
        })}
      </div>
      <div style={{ position: "absolute", top: 990, left: 0, right: 0, display: "flex", justifyContent: "center", opacity: cK, translate: `0px ${interpolate(cK, [0, 1], [30, 0])}px` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 18, padding: "18px 36px", borderRadius: 26, background: "rgba(244,246,248,0.95)", fontFamily: FONT_UI, fontWeight: 700, fontSize: 40, color: C.ink }}>
          <svg width={42} height={42} viewBox="0 0 24 24">
            <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3h11A2.5 2.5 0 0 1 20 5.5v8a2.5 2.5 0 0 1-2.5 2.5H10l-4.5 4v-4A1.5 1.5 0 0 1 4 14.5z" fill="none" stroke={C.ink} strokeWidth={2.2} strokeLinejoin="round" />
          </svg>
          Te leo en los comentarios
        </div>
      </div>
    </AbsoluteFill>
  );
};
