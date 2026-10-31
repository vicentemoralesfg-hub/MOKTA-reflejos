import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { C, FONT_DISPLAY, FONT_UI } from "../config";
import { Big, Foot, Marker, Reveal, Sub } from "../components/Text";
import { EASE_IN_OUT, map, noise1, ramp } from "../lib/anim";
import { cue } from "../timeline";

const pol = (r: number, a: number) => [r * Math.sin((a * Math.PI) / 180), -r * Math.cos((a * Math.PI) / 180)];
const arc = (r: number, a0: number, a1: number) => {
  const [x0, y0] = pol(r, a0);
  const [x1, y1] = pol(r, a1);
  const large = Math.abs(a1 - a0) > 180 ? 1 : 0;
  return `M ${x0} ${y0} A ${r} ${r} 0 ${large} 1 ${x1} ${y1}`;
};

const rpmAng = (rpm: number) => -135 + (270 * rpm) / 8000;

const Tach: React.FC<{ rpm: number; warn: number }> = ({ rpm, warn }) => (
  <svg width={440} height={440} viewBox="-220 -220 440 440">
    <circle r={210} fill="#070B12" stroke="rgba(244,246,248,0.12)" strokeWidth={6} />
    <path d={arc(178, -135, 135)} fill="none" stroke="rgba(244,246,248,0.12)" strokeWidth={20} />
    <path d={arc(178, rpmAng(3000), 135)} fill="none" stroke={C.amber} strokeWidth={20} opacity={0.35 + 0.55 * warn} />
    {Array.from({ length: 9 }).map((_, i) => {
      const a = rpmAng(i * 1000);
      const [x0, y0] = pol(158, a);
      const [x1, y1] = pol(134, a);
      const [tx, ty] = pol(108, a);
      return (
        <g key={i}>
          <line x1={x0} y1={y0} x2={x1} y2={y1} stroke={C.white} strokeWidth={5} />
          <text
            x={tx}
            y={ty + 13}
            textAnchor="middle"
            fontFamily={FONT_DISPLAY}
            fontWeight={700}
            fontSize={38}
            fill={i >= 3 ? C.amber : C.white}
          >
            {i}
          </text>
        </g>
      );
    })}
    <text x={0} y={70} textAnchor="middle" fontFamily={FONT_UI} fontWeight={600} fontSize={22} fill={C.dim}>
      x1000 rpm
    </text>
    <g transform={`rotate(${rpmAng(rpm)})`}>
      <path d="M -7 18 L 0 -170 L 7 18 Z" fill={C.red} />
    </g>
    <circle r={22} fill="#1A2333" stroke={C.red} strokeWidth={5} />
    <text x={0} y={150} textAnchor="middle" fontFamily={FONT_DISPLAY} fontWeight={800} fontSize={44} fill={C.white}>
      {Math.round(rpm / 100) * 100}
    </text>
  </svg>
);

const Temp: React.FC<{ level: number }> = ({ level }) => {
  // level 0 = frío (C), 0.5 = normal (centro), 1 = caliente (H)
  const ang = -60 + 120 * level;
  const ok = level > 0.47;
  const col = ok ? C.green : C.cyan;
  return (
    <svg width={300} height={300} viewBox="-150 -150 300 300">
      <circle r={140} fill="#070B12" stroke="rgba(244,246,248,0.12)" strokeWidth={5} />
      <path d={arc(112, -60, -15)} fill="none" stroke={C.cyan} strokeWidth={14} opacity={0.7} />
      <path d={arc(112, -12, 12)} fill="none" stroke={C.green} strokeWidth={14} />
      <path d={arc(112, 40, 60)} fill="none" stroke={C.red} strokeWidth={14} opacity={0.7} />
      <text x={-104} y={10} textAnchor="middle" fontFamily={FONT_UI} fontWeight={800} fontSize={28} fill={C.cyan}>
        C
      </text>
      <text x={104} y={10} textAnchor="middle" fontFamily={FONT_UI} fontWeight={800} fontSize={28} fill={C.red}>
        H
      </text>
      <g transform={`rotate(${ang})`}>
        <path d="M -5 12 L 0 -100 L 5 12 Z" fill={col} />
      </g>
      <circle r={16} fill="#1A2333" stroke={col} strokeWidth={4} />
      <text x={0} y={80} textAnchor="middle" fontFamily={FONT_UI} fontWeight={800} fontSize={30} letterSpacing={2} fill={col}>
        {ok ? "NORMAL" : "FRÍO"}
      </text>
    </svg>
  );
};

export const S10Suave: React.FC = () => {
  const f = useCurrentFrame();
  const tAcel = cue("suave", "acelerones", 7);
  const tHasta = cue("suave", "hasta", 21);
  const tTemp = cue("suave", "temperatura", 47);
  const tAnd = cue("suave", "andando", 82);
  const tRap = cue("suave", "rapido", 126);
  // rpm: un intento de acelerón (se corta) y luego conducción suave ~2.000
  const rev = map(f, [tAcel - 2, tAcel + 6, tAcel + 16], [900, 4600, 2100], EASE_IN_OUT);
  const rpm = Math.max(800, rev + noise1(f / 6, 3) * 120);
  const warn = Math.abs(Math.sin(f / 4)) * ramp(f, tAcel, tAcel + 4) * (1 - ramp(f, tAcel + 20, tAcel + 30));
  const temp = Math.min(0.52, map(f, [0, tAnd], [0.02, 0.14]) + map(f, [tAnd, tRap + 4], [0, 0.4], EASE_IN_OUT));
  const gIn = ramp(f, 0, 10);
  return (
    <AbsoluteFill style={{ background: "radial-gradient(ellipse 85% 60% at 50% 55%, #121B2C 0%, #070B13 60%, #020306 100%)" }}>
      <AbsoluteFill style={{ alignItems: "center", top: 300 }}>
        <Reveal at={Math.max(2, tAcel - 4)} from="slam" dur={6}>
          <Big size={150} color={C.amber}>
            Sin acelerones
          </Big>
        </Reveal>
        <Reveal at={tHasta - 3} from="up" style={{ marginTop: 14 }}>
          <Sub size={44}>
            hasta que llegue a su <b style={{ color: C.green }}>temperatura normal</b>
          </Sub>
        </Reveal>
      </AbsoluteFill>

      <div style={{ position: "absolute", left: 90, top: 640, opacity: gIn, transform: `scale(${0.9 + 0.1 * gIn})` }}>
        <Tach rpm={rpm} warn={warn} />
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: 436,
            textAlign: "center",
            fontFamily: FONT_UI,
            fontWeight: 800,
            fontSize: 28,
            letterSpacing: 3,
            color: C.amber,
            opacity: ramp(f, tAcel + 4, tAcel + 10),
          }}
        >
          EN FRÍO: BAJO 3.000
        </div>
      </div>
      <div style={{ position: "absolute", left: 600, top: 720, opacity: ramp(f, tTemp - 8, tTemp) * gIn }}>
        <Temp level={temp} />
      </div>

      <AbsoluteFill style={{ alignItems: "center", top: 1170 }}>
        <Reveal at={tAnd - 4} from="up">
          <Big size={96}>Andando se calienta</Big>
        </Reveal>
        <Reveal at={tRap - 22} from="slam" dur={6} style={{ marginTop: 8 }}>
          <Big size={120}>
            <Marker at={tRap - 16} color={C.green}>
              mucho más rápido
            </Marker>
          </Big>
        </Reveal>
      </AbsoluteFill>
      <Foot at={tTemp} top={1462}>
        ¿Sin aguja de temperatura? Espera a que se apague la luz azul.
      </Foot>
    </AbsoluteFill>
  );
};
