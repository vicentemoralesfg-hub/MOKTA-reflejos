import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { C, FONT_DISPLAY, FONT_UI } from "../config";
import { Car } from "../art/Car";
import { Flash } from "../components/Overlays";
import { Big, Chapter } from "../components/Text";
import { Belt, Check, Key, Stopwatch, Wheel } from "../art/Icons";
import { EASE_BACK, EASE_IN_OUT, EASE_OUT, impactShake, lerp, map, ramp } from "../lib/anim";
import { beat, cue } from "../timeline";

const ROW_Y = [560, 700, 840, 980];

const Row: React.FC<{ i: number; at: number; icon: React.ReactNode; text: React.ReactNode; f: number; dim?: number }> = ({
  i,
  at,
  icon,
  text,
  f,
  dim = 0,
}) => {
  if (f < at) return null;
  const p = ramp(f, at, at + 8, EASE_OUT);
  const c = ramp(f, at + 6, at + 12, EASE_BACK);
  return (
    <div
      style={{
        position: "absolute",
        left: 110,
        right: 150,
        top: ROW_Y[i],
        height: 116,
        display: "flex",
        alignItems: "center",
        gap: 26,
        padding: "0 30px",
        borderRadius: 30,
        background: "rgba(8,22,16,0.82)",
        border: `2px solid ${C.green}44`,
        opacity: p * (1 - dim * 0.75),
        transform: `translateX(${(1 - p) * -90}px)`,
        filter: dim > 0 ? `blur(${dim * 6}px)` : undefined,
      }}
    >
      <div
        style={{
          width: 72,
          height: 72,
          borderRadius: 36,
          background: "rgba(43,227,138,0.14)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {icon}
      </div>
      <div style={{ flex: 1, fontFamily: FONT_UI, fontWeight: 800, fontSize: 48, color: C.white }}>{text}</div>
      <div style={{ transform: `scale(${c})`, opacity: c > 0 ? 1 : 0 }}>
        <Check size={64} />
      </div>
    </div>
  );
};

export const S09Correcto: React.FC = () => {
  const f = useCurrentFrame();
  const D = beat("correcto").duration;
  const tEnc = cue("correcto", "enciendelo", 21);
  const tCint = cue("correcto", "cinturon", 47);
  const tTreinta = cue("correcto", "treinta", 72);
  const tManej = cue("correcto", "manejando", 113);
  const tSal = cue("correcto", "sal", 107);

  // titular: grande al centro → se encoge arriba
  const shrink = ramp(f, tEnc - 8, tEnc, EASE_IN_OUT);
  const hIn = ramp(f, 0, 6);
  // momento héroe: 30 segundos
  const heroIn = ramp(f, tTreinta - 6, tTreinta + 2, EASE_OUT);
  const heroOut = ramp(f, tSal - 7, tSal - 1, EASE_IN_OUT);
  const hero = heroIn * (1 - heroOut);
  const secs = map(f, [tTreinta - 2, tTreinta + 22], [0, 30], EASE_IN_OUT);
  const done = f >= tTreinta + 22;
  const sh = impactShake(f, tTreinta + 22, 14, 10);
  const R = 250;
  const circ = 2 * Math.PI * R;
  // auto que parte
  const drive = ramp(f, tManej - 4, D, EASE_IN_OUT);
  const carIn = ramp(f, tManej - 6, tManej + 2);
  return (
    <AbsoluteFill style={{ background: "radial-gradient(ellipse 85% 60% at 50% 50%, #0B2A20 0%, #061410 55%, #020605 100%)" }}>
      <Chapter n="04" label="LO CORRECTO" color={C.green} at={0} />

      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: lerp(720, 360, shrink),
          transform: `scale(${lerp(1, 0.66, shrink) * (0.8 + 0.2 * hIn)})`,
          transformOrigin: "50% 0%",
          opacity: hIn * (1 - hero * 0.8),
        }}
      >
        <Big size={150} style={{ whiteSpace: "nowrap" }}>
          ¿Lo correcto?
        </Big>
      </div>

      <Row i={0} at={tEnc - 4} f={f} dim={hero} icon={<Key size={46} color={C.green} />} text="Enciéndelo" />
      <Row i={1} at={tCint - 6} f={f} dim={hero} icon={<Belt size={46} color={C.green} />} text="Ponte el cinturón" />
      <Row
        i={2}
        at={tSal}
        f={f}
        icon={<Stopwatch size={46} color={C.green} />}
        text={
          <span>
            Espera <span style={{ color: C.green }}>~30 segundos</span>
          </span>
        }
      />
      <Row i={3} at={tManej - 4} f={f} icon={<Wheel size={46} color={C.green} />} text="Sal manejando suave" />

      {/* auto que parte suave */}
      <div
        style={{
          position: "absolute",
          left: lerp(300, -900, drive),
          top: 1170,
          opacity: carIn,
          filter: drive > 0.05 ? `blur(${drive * 3}px)` : undefined,
        }}
      >
        <Car width={620} frost={map(drive, [0, 0.6], [0.5, 0])} wheelAngle={-drive * 900} />
      </div>
      {drive > 0.02
        ? [0, 1, 2].map((i) => (
            <div
              key={i}
              style={{
                position: "absolute",
                left: lerp(900, -300, drive) + 380 + i * 60,
                top: 1250 + i * 50,
                width: 160 - i * 30,
                height: 5,
                borderRadius: 3,
                background: "rgba(244,246,248,0.35)",
                opacity: carIn * (1 - drive * 0.6),
              }}
            />
          ))
        : null}

      {/* momento héroe: 30 s */}
      {hero > 0.001 ? (
        <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", opacity: hero }}>
          <AbsoluteFill style={{ background: "rgba(2,8,6,0.55)" }} />
          <div
            style={{ position: "relative", transform: `translate(${sh.x}px, ${sh.y}px) scale(${0.75 + 0.25 * heroIn - heroOut * 0.3})` }}
          >
            <svg width={620} height={620} viewBox="-310 -310 620 620">
              <circle r={R} fill="rgba(4,14,10,0.9)" stroke="rgba(244,246,248,0.12)" strokeWidth={26} />
              <circle
                r={R}
                fill="none"
                stroke={C.green}
                strokeWidth={26}
                strokeLinecap="round"
                strokeDasharray={`${(circ * secs) / 30} ${circ}`}
                transform="rotate(-90)"
                style={{ filter: `drop-shadow(0 0 ${done ? 30 : 12}px ${C.green})` }}
              />
              {Array.from({ length: 30 }).map((_, i) => (
                <line
                  key={i}
                  x1={0}
                  y1={-R + 40}
                  x2={0}
                  y2={-R + (i % 5 === 0 ? 70 : 56)}
                  stroke="rgba(244,246,248,0.4)"
                  strokeWidth={i % 5 === 0 ? 5 : 3}
                  transform={`rotate(${i * 12})`}
                />
              ))}
            </svg>
            <div
              style={{
                position: "absolute",
                inset: 0,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <div
                style={{
                  fontFamily: FONT_DISPLAY,
                  fontWeight: 800,
                  fontSize: 260,
                  lineHeight: 0.85,
                  color: done ? C.green : C.white,
                  fontVariantNumeric: "tabular-nums",
                  textShadow: done ? `0 0 50px ${C.green}` : "none",
                }}
              >
                {Math.floor(secs)}
              </div>
              <div style={{ fontFamily: FONT_UI, fontWeight: 800, fontSize: 40, letterSpacing: 8, color: C.green }}>SEGUNDOS</div>
            </div>
          </div>
          <div
            style={{
              position: "absolute",
              top: 1400,
              fontFamily: FONT_UI,
              fontWeight: 700,
              fontSize: 40,
              color: C.white,
              opacity: ramp(f, tTreinta + 20, tTreinta + 28),
            }}
          >
            lo justo para que circule el aceite
          </div>
        </AbsoluteFill>
      ) : null}
      <Flash at={tTreinta + 22} color={C.green} peak={0.4} dur={8} />
    </AbsoluteFill>
  );
};
