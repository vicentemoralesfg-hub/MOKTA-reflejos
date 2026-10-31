import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { C, FONT_DISPLAY, FONT_UI, fmt } from "../config";
import { Big, Chapter, Foot, Reveal } from "../components/Text";
import { Drop } from "../art/Icons";
import { EASE_IN_OUT, EASE_OUT, impactShake, map, ramp } from "../lib/anim";
import { cue } from "../timeline";

/** 10 min/día × 365 = 60,8 h; ralentí ≈ 0,61 L/h (sedán 2.0 L, Argonne/DOE) → ≈ 37 L. */
const HOURS = (10 * 365) / 60;
const L_PER_H = 0.61;
const LITERS = HOURS * L_PER_H;

const Chip: React.FC<{ children: React.ReactNode; color?: string }> = ({ children, color = C.white }) => (
  <div
    style={{
      padding: "10px 28px",
      borderRadius: 22,
      background: "rgba(10,16,28,0.85)",
      border: "2px solid rgba(244,246,248,0.18)",
      fontFamily: FONT_DISPLAY,
      fontWeight: 800,
      fontSize: 96,
      lineHeight: 1,
      color,
      whiteSpace: "nowrap",
    }}
  >
    {children}
  </div>
);

const FuelGauge: React.FC<{ level: number }> = ({ level }) => {
  // level 1 = lleno (F), 0 = vacío (E)
  const ang = -60 + 120 * level;
  return (
    <svg width={300} height={190} viewBox="-150 -150 300 190">
      <path d="M -120 0 A 120 120 0 0 1 120 0" fill="none" stroke="rgba(244,246,248,0.18)" strokeWidth={16} strokeLinecap="round" />
      <path d="M -120 0 A 120 120 0 0 1 -84 -85" fill="none" stroke={C.red} strokeWidth={16} strokeLinecap="round" />
      {Array.from({ length: 5 }).map((_, i) => (
        <line
          key={i}
          x1={0}
          y1={-98}
          x2={0}
          y2={-80}
          stroke="rgba(244,246,248,0.6)"
          strokeWidth={4}
          transform={`rotate(${-60 + i * 30})`}
        />
      ))}
      <text x={-118} y={34} textAnchor="middle" fontFamily={FONT_UI} fontWeight={800} fontSize={28} fill={C.red}>
        E
      </text>
      <text x={118} y={34} textAnchor="middle" fontFamily={FONT_UI} fontWeight={800} fontSize={28} fill={C.white}>
        F
      </text>
      <g transform={`rotate(${ang})`}>
        <path d="M -6 0 L 0 -108 L 6 0 Z" fill={C.amber} />
      </g>
      <circle r={16} fill="#1A2333" stroke={C.amber} strokeWidth={4} />
    </svg>
  );
};

export const S08Horas: React.FC = () => {
  const f = useCurrentFrame();
  const tDiez = cue("horas", "diez", 4);
  const tDia = cue("horas", "dia", 24);
  const tSesenta = cue("horas", "sesenta", 35);
  const tAno = cue("horas", "ano", 63);
  const tQuem = cue("horas", "quemando", 74);
  const tMov = cue("horas", "moverte", 102);
  const hours = map(f, [tSesenta - 4, tSesenta + 18], [0, 60], EASE_OUT);
  const liters = map(f, [tQuem, tQuem + 26], [0, LITERS], EASE_OUT);
  const level = map(f, [tQuem, tQuem + 34], [1, 1 - LITERS / 45], EASE_IN_OUT);
  const sh = impactShake(f, tSesenta + 18, 12, 10);
  const pop = map(f, [tSesenta + 16, tSesenta + 19, tSesenta + 24], [1, 1.08, 1]);
  const cardsIn = ramp(f, tQuem - 6, tQuem + 4);
  const zeroIn = ramp(f, tMov - 6, tMov + 2);
  return (
    <AbsoluteFill style={{ background: "radial-gradient(ellipse 85% 60% at 50% 45%, #2A1F08 0%, #0E0B06 55%, #040302 100%)" }}>
      <Chapter n="03" label="LA BENCINA" color={C.amber} at={0} />

      <AbsoluteFill style={{ alignItems: "center", top: 360 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 22 }}>
          <Reveal at={tDiez - 4} from="scale">
            <Chip>
              10 <span style={{ fontSize: 54, color: C.dim }}>MIN</span>
            </Chip>
          </Reveal>
          <Reveal at={tDia - 8} from="scale">
            <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 800, fontSize: 90, color: C.amber }}>×</div>
          </Reveal>
          <Reveal at={tDia - 6} from="scale">
            <Chip>
              365 <span style={{ fontSize: 54, color: C.dim }}>DÍAS</span>
            </Chip>
          </Reveal>
        </div>
      </AbsoluteFill>

      <AbsoluteFill style={{ alignItems: "center", top: 520 }}>
        <Reveal at={tSesenta - 6} from="slam" dur={6}>
          <div style={{ display: "flex", alignItems: "baseline", gap: 18, transform: `translate(${sh.x}px, ${sh.y}px) scale(${pop})` }}>
            <span style={{ fontFamily: FONT_DISPLAY, fontWeight: 800, fontSize: 150, color: C.amber }}>=</span>
            <span
              style={{
                fontFamily: FONT_DISPLAY,
                fontWeight: 800,
                fontSize: 300,
                lineHeight: 0.9,
                color: C.white,
                fontVariantNumeric: "tabular-nums",
                textShadow: "0 0 50px rgba(255,200,61,0.45)",
              }}
            >
              {Math.round(hours)}
            </span>
            <span style={{ fontFamily: FONT_DISPLAY, fontWeight: 800, fontSize: 130, color: C.amber }}>HORAS</span>
          </div>
        </Reveal>
        <Reveal at={tAno - 4} from="up">
          <Big size={66} color={C.dim} style={{ marginTop: 4 }}>
            al año con el motor encendido
          </Big>
        </Reveal>
      </AbsoluteFill>

      <div
        style={{
          position: "absolute",
          left: 70,
          right: 140,
          top: 1010,
          display: "flex",
          gap: 24,
          opacity: cardsIn,
          transform: `translateY(${(1 - cardsIn) * 40}px)`,
        }}
      >
        <div
          style={{
            flex: 1.15,
            borderRadius: 30,
            background: "rgba(20,14,4,0.85)",
            border: `2px solid ${C.amber}55`,
            padding: "22px 20px 26px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <div style={{ fontFamily: FONT_UI, fontWeight: 800, fontSize: 26, letterSpacing: 3, color: C.amber }}>BENCINA QUEMADA</div>
          <FuelGauge level={level} />
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Drop size={56} color={C.amber} />
            <span style={{ fontFamily: FONT_DISPLAY, fontWeight: 800, fontSize: 110, lineHeight: 1, color: C.white }}>
              ≈{Math.round(liters)}
              <span style={{ fontSize: 60, color: C.dim }}> L</span>
            </span>
          </div>
          <div style={{ fontFamily: FONT_UI, fontWeight: 600, fontSize: 28, color: C.dim, marginTop: 6 }}>casi un estanque</div>
        </div>
        <div
          style={{
            flex: 1,
            borderRadius: 30,
            background: "rgba(20,6,6,0.85)",
            border: `2px solid ${C.red}55`,
            padding: "22px 20px 26px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ fontFamily: FONT_UI, fontWeight: 800, fontSize: 26, letterSpacing: 3, color: C.red }}>RECORRIDO</div>
          <div style={{ display: "flex", gap: 6, marginTop: 20 }}>
            {"000000".split("").map((d, i) => (
              <div
                key={i}
                style={{
                  width: 46,
                  height: 70,
                  borderRadius: 8,
                  background: "#0B0F16",
                  border: "2px solid rgba(244,246,248,0.15)",
                  fontFamily: FONT_DISPLAY,
                  fontWeight: 700,
                  fontSize: 56,
                  color: C.white,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {d}
              </div>
            ))}
          </div>
          <div
            style={{
              fontFamily: FONT_DISPLAY,
              fontWeight: 800,
              fontSize: 120,
              lineHeight: 1,
              color: C.red,
              opacity: zeroIn,
              transform: `scale(${1.5 - 0.5 * zeroIn})`,
              textShadow: `0 0 40px ${C.red}66`,
            }}
          >
            0 km
          </div>
          <div style={{ fontFamily: FONT_UI, fontWeight: 600, fontSize: 28, color: C.dim, opacity: zeroIn }}>ni un metro</div>
        </div>
      </div>
      <Foot at={tQuem} top={1468}>
        Ralentí ≈ {fmt(L_PER_H, 1)} L/h (sedán 2.0 L · Argonne/DOE) · 10 min × 365 días = {fmt(HOURS, 1)} h
      </Foot>
    </AbsoluteFill>
  );
};
