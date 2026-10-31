import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { C, FONT_DISPLAY, FONT_UI } from "../config";
import { Big, Reveal, Sub } from "../components/Text";
import { Check, Snowflake, Sun } from "../art/Icons";
import { EASE_IN_OUT, EASE_OUT, map, rand, ramp } from "../lib/anim";
import { beat, cue } from "../timeline";

type Pt = [number, number];
const along = (pts: Pt[], t: number): Pt => {
  const lens = pts.slice(1).map((p, i) => Math.hypot(p[0] - pts[i][0], p[1] - pts[i][1]));
  const total = lens.reduce((a, b) => a + b, 0);
  let d = (((t % 1) + 1) % 1) * total;
  for (let i = 0; i < lens.length; i++) {
    if (d <= lens[i]) {
      const k = d / lens[i];
      return [pts[i][0] + (pts[i + 1][0] - pts[i][0]) * k, pts[i][1] + (pts[i + 1][1] - pts[i][1]) * k];
    }
    d -= lens[i];
  }
  return pts[pts.length - 1];
};

const SENSORS: { y: number; label: string }[] = [
  { y: 130, label: "TEMPERATURA" },
  { y: 320, label: "OXÍGENO" },
  { y: 510, label: "AIRE" },
];

const Diagram: React.FC<{ f: number; on: number }> = ({ f, on }) => {
  const traces: Pt[][] = SENSORS.map((s) => [
    [215, s.y],
    [300, s.y],
    [300, 320 + (s.y - 320) * 0.35],
    [360, 320 + (s.y - 320) * 0.35],
  ]);
  const out: Pt[] = [
    [540, 320],
    [640, 320],
    [640, 170],
    [735, 170],
  ];
  const pulses = [];
  traces.forEach((tr, i) => {
    for (let k = 0; k < 2; k++) {
      const [x, y] = along(tr, f / 26 + i * 0.33 + k * 0.5);
      pulses.push(<circle key={`${i}-${k}`} cx={x} cy={y} r={7} fill={C.cyan} opacity={on} />);
    }
  });
  for (let k = 0; k < 3; k++) {
    const [x, y] = along(out, f / 18 + k / 3);
    pulses.push(<circle key={`o${k}`} cx={x} cy={y} r={8} fill={C.green} opacity={on} />);
  }
  // niebla fina del inyector (bien atomizada)
  const mist = [];
  for (let i = 0; i < 70; i++) {
    const age = (f * 1.4 + i * 3.7) % 40;
    const a = age / 40;
    const ang = (rand(i * 2.1) - 0.5) * 0.7;
    const r = a * 230;
    mist.push(
      <circle
        key={i}
        cx={790 + Math.sin(ang) * r}
        cy={300 + Math.cos(ang) * r}
        r={1.6 + rand(i) * 2.2}
        fill="#BFEFFF"
        opacity={(1 - a) * 0.9 * on}
      />,
    );
  }
  return (
    <svg viewBox="0 0 900 640" width={830} height={590} style={{ overflow: "visible" }}>
      {traces.map((tr, i) => (
        <polyline
          key={i}
          points={tr.map((p) => p.join(",")).join(" ")}
          fill="none"
          stroke="rgba(67,198,255,0.35)"
          strokeWidth={5}
          strokeLinejoin="round"
        />
      ))}
      <polyline
        points={out.map((p) => p.join(",")).join(" ")}
        fill="none"
        stroke="rgba(43,227,138,0.4)"
        strokeWidth={5}
        strokeLinejoin="round"
      />
      {SENSORS.map((s, i) => (
        <g key={i}>
          <rect x={20} y={s.y - 34} width={196} height={68} rx={34} fill="rgba(8,20,38,0.9)" stroke={C.cyan} strokeWidth={3} />
          <circle cx={56} cy={s.y} r={10 + 3 * Math.sin(f / 5 + i)} fill={C.cyan} opacity={0.9} />
          <text
            x={128}
            y={s.y + 9}
            textAnchor="middle"
            fontFamily={FONT_UI}
            fontWeight={700}
            fontSize={i === 0 ? 22 : 27}
            letterSpacing={2}
            fill={C.white}
          >
            {s.label}
          </text>
        </g>
      ))}
      {/* ECU */}
      <g>
        {Array.from({ length: 7 }).map((_, i) => (
          <g key={i}>
            <rect x={378 + i * 22} y={222} width={10} height={22} fill="#7FA6C9" />
            <rect x={378 + i * 22} y={396} width={10} height={22} fill="#7FA6C9" />
          </g>
        ))}
        <rect x={360} y={240} width={180} height={160} rx={18} fill="#0C1C33" stroke={C.cyan} strokeWidth={4} />
        <rect x={360} y={240} width={180} height={160} rx={18} fill={C.cyan} opacity={0.08 + 0.06 * Math.sin(f / 4)} />
        <text x={450} y={335} textAnchor="middle" fontFamily={FONT_DISPLAY} fontWeight={800} fontSize={64} fill={C.white}>
          ECU
        </text>
      </g>
      {/* inyector */}
      <g>
        <rect x={752} y={60} width={76} height={150} rx={18} fill="#1D3352" stroke="#9FC6E8" strokeWidth={3} />
        <rect x={770} y={210} width={40} height={60} rx={6} fill="#2A4466" stroke="#9FC6E8" strokeWidth={3} />
        <path d="M 776 270 L 804 270 L 796 296 L 784 296 Z" fill="#9FC6E8" />
        <text x={790} y={44} textAnchor="middle" fontFamily={FONT_UI} fontWeight={700} fontSize={28} letterSpacing={2} fill={C.white}>
          INYECTOR
        </text>
        {mist}
      </g>
    </svg>
  );
};

export const S05Inyeccion: React.FC = () => {
  const f = useCurrentFrame();
  const D = beat("inyeccion").duration;
  const tIny = cue("inyeccion", "inyeccion", 11);
  const tAjusta = cue("inyeccion", "ajusta", 40);
  const tFrio = cue("inyeccion", "frio", 81);
  const tCalor = cue("inyeccion", "calor", 101);
  // rodillo de años 1975 → HOY
  const roll = ramp(f, 0, 12, EASE_IN_OUT);
  const year = Math.round(map(roll, [0, 1], [1975, 2026]));
  const rollOut = ramp(f, 12, 18);
  const diagIn = ramp(f, tAjusta - 14, tAjusta);
  const zoom = map(f, [0, D], [1, 1.05], EASE_OUT);
  const Pill: React.FC<{ at: number; icon: React.ReactNode; label: string; color: string }> = ({ at, icon, label, color }) => (
    <Reveal at={at - 3} from="scale">
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 16,
          padding: "16px 28px",
          borderRadius: 24,
          background: "rgba(6,12,24,0.8)",
          border: `3px solid ${color}`,
          fontFamily: FONT_UI,
          fontWeight: 800,
          fontSize: 40,
          color: C.white,
          boxShadow: `0 0 40px ${color}44`,
        }}
      >
        {icon}
        {label}
        <Check size={48} />
      </div>
    </Reveal>
  );
  return (
    <AbsoluteFill style={{ background: "radial-gradient(ellipse 90% 60% at 50% 55%, #0D2140 0%, #060C18 60%, #03050A 100%)" }}>
      {/* grilla técnica */}
      <AbsoluteFill
        style={{
          backgroundImage:
            "linear-gradient(rgba(67,198,255,0.06) 2px, transparent 2px), linear-gradient(90deg, rgba(67,198,255,0.06) 2px, transparent 2px)",
          backgroundSize: "60px 60px",
          backgroundPosition: `0 ${f * 0.8}px`,
          transform: `scale(${zoom})`,
        }}
      />
      {/* año */}
      <AbsoluteFill
        style={{ alignItems: "center", justifyContent: "center", opacity: 1 - rollOut, transform: `scale(${1 + rollOut * 0.4})` }}
      >
        <div
          style={{
            fontFamily: FONT_DISPLAY,
            fontWeight: 800,
            fontSize: 330,
            color: roll < 0.5 ? C.sepia : C.cyan,
            fontVariantNumeric: "tabular-nums",
            filter: `blur(${Math.sin(roll * Math.PI) * 6}px)`,
            textShadow: `0 0 60px ${roll < 0.5 ? "rgba(216,185,138,0.4)" : "rgba(67,198,255,0.5)"}`,
          }}
        >
          {year}
        </div>
      </AbsoluteFill>

      <AbsoluteFill style={{ alignItems: "center", top: 300 }}>
        <Reveal at={Math.max(4, tIny - 8)} from="up">
          <Big size={86} color={C.dim}>
            Hoy
          </Big>
        </Reveal>
        <Reveal at={tIny - 2} from="slam" dur={7} style={{ marginTop: 6 }}>
          <Big size={142} color={C.cyan} glow="rgba(67,198,255,0.5)">
            Inyección
            <br />
            electrónica
          </Big>
        </Reveal>
      </AbsoluteFill>

      <div
        style={{
          position: "absolute",
          left: 125,
          top: 670,
          opacity: diagIn,
          transform: `translateY(${(1 - diagIn) * 50}px) scale(${0.93 + 0.07 * diagIn})`,
          transformOrigin: "50% 50%",
        }}
      >
        <Diagram f={f} on={diagIn} />
      </div>

      <AbsoluteFill style={{ alignItems: "center", top: 1296 }}>
        <Reveal at={tAjusta - 3} from="up">
          <Sub size={50}>
            ajusta la mezcla <b style={{ color: C.green }}>sola</b>
          </Sub>
        </Reveal>
        <div style={{ display: "flex", gap: 22, marginTop: 26 }}>
          <Pill at={tFrio} icon={<Snowflake size={44} color={C.frost} />} label="Frío" color={C.frost} />
          <Pill at={tCalor} icon={<Sun size={44} color={C.heat} />} label="Calor" color={C.heat} />
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
