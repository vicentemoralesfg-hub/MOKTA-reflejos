import React from "react";
import { AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame } from "remotion";
import { Audio } from "@remotion/media";
import { C, DISPLAY, UI, fmt } from "../brand";
import { Captions } from "./comp/Captions";
import { BACK_OUT, Bg, CX, Countdown, Cta, Options, PhotoCard, Title, Y, fadeWin, ramp } from "./comp/Ui";
import { VO, seg, total, wordAt } from "./lib/vo";
import voJson from "../vo/cero100.json";
import { FOTOS } from "./fotos";

/**
 * Reel · "¿Cuál llega primero a 100 km/h?" — quiz + carrera en tiempo real con los tiempos publicados:
 * BYD Seal AWD 3,8 s · Ferrari F40 4,1 s · Lamborghini Countach 25º Aniversario 4,9 s · Toyota Corolla híbrido 9,1 s.
 */
export const C100_VO = voJson as VO;
const vo = C100_VO;
export const C100_TOTAL = total(vo, 1.6);

const CARS = [
  { name: "Ferrari F40", year: "1987", cv: "478 CV", key: ["ferrari"], t: 4.1, foto: "f40", k: 0.8 },
  { name: "Lamborghini Countach", year: "1988", cv: "455 CV", key: ["lamborghini"], t: 4.9, foto: "countach", k: 0.8 },
  { name: "Toyota Corolla híbrido", year: "2023", cv: "140 CV", key: ["toyota"], t: 9.1, foto: "corolla", k: 0.85 },
  { name: "BYD Seal eléctrico", year: "2023", cv: "530 CV", key: ["byd", "bi"], t: 3.8, foto: "seal", k: 0.72 },
];
const RANK = [...CARS].sort((a, b) => a.t - b.t).map((c) => c.name);

const speed = (t: number, T: number, k: number) => (t <= 0 ? 0 : t >= T ? 100 : 100 * Math.pow(t / T, k));

const Torque: React.FC<{ f: number; a: number }> = ({ f, a }) => {
  const W = 820;
  const H = 480;
  const X = (rpm: number) => 70 + (rpm / 7000) * (W - 90);
  const Yv = (nm: number) => H - 50 - (nm / 720) * (H - 90);
  const f40 = [
    [1000, 300],
    [2000, 420],
    [3000, 520],
    [4000, 577],
    [5000, 565],
    [6000, 545],
    [7000, 505],
  ];
  const ev = [
    [0, 670],
    [4500, 670],
    [5500, 600],
    [7000, 480],
  ];
  const path = (pts: number[][]) => pts.map((p, i) => `${i ? "L" : "M"} ${X(p[0]).toFixed(1)} ${Yv(p[1]).toFixed(1)}`).join(" ");
  const pE = ramp(f, a, a + 18);
  const pF = ramp(f, a + 14, a + 40);
  return (
    <svg width={W + 40} height={H} viewBox={`0 0 ${W + 40} ${H}`} style={{ position: "absolute", left: 70, top: 470 }}>
      <line x1={70} y1={H - 50} x2={W} y2={H - 50} stroke="rgba(244,246,248,0.35)" strokeWidth={3} />
      <line x1={70} y1={20} x2={70} y2={H - 50} stroke="rgba(244,246,248,0.35)" strokeWidth={3} />
      {[0, 2000, 4000, 6000].map((r) => (
        <text key={r} x={X(r)} y={H - 14} textAnchor="middle" fontFamily="Inter" fontWeight={600} fontSize={22} fill="rgba(244,246,248,0.5)">
          {fmt(r)}
        </text>
      ))}
      <text x={W} y={H - 14} textAnchor="end" fontFamily="Inter" fontWeight={700} fontSize={22} fill="rgba(244,246,248,0.5)">rpm</text>
      <text x={78} y={34} fontFamily="Inter" fontWeight={700} fontSize={22} fill="rgba(244,246,248,0.5)">fuerza (torque)</text>
      <path d={path(ev)} fill="none" stroke={C.green} strokeWidth={8} strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - pE} />
      <path d={path(f40)} fill="none" stroke={C.red} strokeWidth={8} strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - pF} />
      <g opacity={pE}>
        <circle cx={X(0)} cy={Yv(670)} r={12} fill={C.green} />
        <text x={X(200)} y={Yv(670) - 22} fontFamily="Barlow Condensed" fontWeight={800} fontSize={40} fill={C.green}>ELÉCTRICO: 670 Nm DESDE 0</text>
      </g>
      <g opacity={ramp(f, a + 34, a + 42)}>
        <circle cx={X(4000)} cy={Yv(577)} r={12} fill={C.red} />
        <text x={X(4000)} y={Yv(577) + 56} textAnchor="middle" fontFamily="Barlow Condensed" fontWeight={800} fontSize={40} fill={C.red}>F40: 577 Nm A 4.000 rpm</text>
      </g>
    </svg>
  );
};

export const Cero100: React.FC<{ withAudio?: boolean }> = ({ withAudio = true }) => {
  const f = useCurrentFrame();
  const S = Object.fromEntries(vo.segments.map((s) => [s.id, seg(vo, s.id)]));
  const qEnd = S.go.f0;
  const start = S.go.f1 - 4; // salida al terminar "¡Partieron!"
  const t = (f - start) / 30;
  const raceOn = f >= qEnd - 4 && f < S.why.f0;

  return (
    <AbsoluteFill style={{ background: C.ink, overflow: "hidden" }}>
      <Bg f={f} tint="rgba(255,59,59,0.06)" />

      {/* ===== GANCHO + OPCIONES ===== */}
      {f < qEnd ? (
        <AbsoluteFill style={{ opacity: 1 - ramp(f, qEnd - 5, qEnd) }}>
          <Title top={250} size={96} pop={ramp(f, 0, 10, BACK_OUT)}>
            ¿CUÁL LLEGA PRIMERO
            <br />A <Y>100 KM/H?</Y>
          </Title>
          <Options
            f={f}
            at={-20}
            top={520}
            H={265}
            items={CARS.map((c) => ({ label: c.name.replace(" eléctrico", "").replace(" híbrido", ""), src: FOTOS[c.foto] ?? null, sub: `${c.year} · ${c.cv}` }))}
            hi={CARS.map((c, i) => {
              const a = wordAt(vo, "options", c.key as unknown as string[], S.options.start + i * 1.5);
              const b = i < 3 ? wordAt(vo, "options", CARS[i + 1].key as unknown as string[], S.options.start + (i + 1) * 1.5) : S.options.f1 + 8;
              return Math.min(ramp(f, a - 3, a + 3), 1 - ramp(f, b - 3, b + 1));
            })}
          />
          <Countdown f={f} a={S.options.f1} b={qEnd} top={1080} />
        </AbsoluteFill>
      ) : null}

      {/* ===== CARRERA ===== */}
      {raceOn ? (
        <AbsoluteFill style={{ opacity: ramp(f, qEnd - 4, qEnd + 2) * (1 - ramp(f, S.why.f0 - 6, S.why.f0)) }}>
          <div style={{ position: "absolute", top: 240, left: 0, width: CX * 2, textAlign: "center" }}>
            <div style={{ fontFamily: UI, fontWeight: 700, fontSize: 30, letterSpacing: 6, color: C.dim }}>0 → 100 KM/H</div>
            <div style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: 130, lineHeight: 1, color: t > 0 ? C.white : C.dim, fontVariantNumeric: "tabular-nums" }}>{fmt(Math.max(0, Math.min(t, 9.1)), 2)} s</div>
          </div>
          {CARS.map((c, i) => {
            // resalta el auto que la voz está nombrando en los resultados
            const ment = CARS.map((x) => {
              const k = x.key[0] === "byd" ? ["electrico"] : x.key[0] === "toyota" ? ["corolla"] : (x.key as unknown as string[]);
              return wordAt(vo, x.key[0] === "toyota" ? "corolla" : "result", k, -1);
            });
            const lastIdx = ment.reduce((best, a, j) => (a >= 0 && f >= a - 3 && (best < 0 || a > ment[best]) ? j : best), -1);
            const hiRow = lastIdx === i && f < S.why.f0 - 6 ? ramp(f, ment[i] - 3, ment[i] + 3) : 0;
            const v = speed(t, c.t, c.k);
            const done = t >= c.t;
            const rank = RANK.indexOf(c.name) + 1;
            const top = 440 + i * 190;
            const winner = rank === 1;
            return (
              <div key={c.name} style={{ position: "absolute", top, left: 60, width: 880, height: 170, scale: String(1 + 0.04 * hiRow), opacity: lastIdx >= 0 && f >= S.result.f0 ? 0.55 + 0.45 * Math.max(hiRow, lastIdx === i ? 1 : 0) : 1 }}>
                <div style={{ position: "absolute", left: 0, top: 10, width: 220, height: 150, borderRadius: 20, overflow: "hidden", border: `3px solid ${done && winner ? C.green : "rgba(244,246,248,0.15)"}`, background: "#151922" }}>
                  {FOTOS[c.foto] ? <Img src={staticFile(FOTOS[c.foto] as string)} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : null}
                </div>
                <div style={{ position: "absolute", left: 245, top: 6, fontFamily: DISPLAY, fontWeight: 800, fontSize: 42, color: C.white }}>
                  {c.name} <span style={{ fontFamily: UI, fontSize: 24, color: C.dim }}>{c.year}</span>
                </div>
                <div style={{ position: "absolute", left: 245, top: 70, width: 470, height: 40, borderRadius: 20, background: "rgba(244,246,248,0.08)", overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${v}%`, borderRadius: 20, background: done ? (winner ? C.green : C.yellow) : `linear-gradient(90deg, rgba(255,200,61,0.4), ${C.yellow})` }} />
                </div>
                <div style={{ position: "absolute", left: 245, top: 118, fontFamily: DISPLAY, fontWeight: 700, fontSize: 36, color: C.dim, fontVariantNumeric: "tabular-nums" }}>{Math.round(v)} km/h</div>
                {done ? (
                  <div style={{ position: "absolute", left: 730, top: 52, display: "flex", alignItems: "center", gap: 10, whiteSpace: "nowrap", scale: String(interpolate(ramp(t * 30, c.t * 30, c.t * 30 + 8, BACK_OUT), [0, 1], [0.5, 1])) }}>
                    <div style={{ width: 62, height: 62, borderRadius: 31, background: winner ? C.green : C.white, color: C.ink, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: DISPLAY, fontWeight: 800, fontSize: 40 }}>{rank}°</div>
                    <div style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: 46, color: winner ? C.green : C.white }}>{fmt(c.t, 1)} s</div>
                  </div>
                ) : null}
              </div>
            );
          })}
        </AbsoluteFill>
      ) : null}

      {/* ===== ¿POR QUÉ? ===== */}
      {f >= S.why.f0 - 6 && f < S.awd.f0 ? (
        <AbsoluteFill style={{ opacity: fadeWin(f, S.why.f0, S.awd.f0, 6, 4) }}>
          <Title top={250} size={84}>
            ¿CÓMO LE GANA
            <br />A UN <Y c={C.red}>FERRARI?</Y>
          </Title>
          <Torque f={f} a={wordAt(vo, "why", ["electrico"]) - 4} />
          <div style={{ position: "absolute", top: 960, left: 70, width: 860, textAlign: "center", fontFamily: UI, fontWeight: 500, fontSize: 22, color: C.faint }}>
            curvas ilustrativas · máximos de fábrica: BYD Seal AWD 670 Nm · Ferrari F40 577 Nm a 4.000 rpm
          </div>
        </AbsoluteFill>
      ) : null}

      {/* ===== DOS MOTORES ===== */}
      {f >= S.awd.f0 - 6 && f < S.cta.f0 ? (
        <AbsoluteFill style={{ opacity: fadeWin(f, S.awd.f0, S.cta.f0, 6, 4) }}>
          <PhotoCard src={FOTOS.seal ?? null} f={f - S.awd.f0} x={70} y={250} w={860} h={560} label="BYD Seal AWD" sub="sedán 100 % eléctrico" border={C.green} />
          <div style={{ position: "absolute", top: 850, left: 70, width: 860, display: "flex", justifyContent: "center", gap: 16 }}>
            {["2 MOTORES", "4×4", "530 CV", "670 Nm"].map((t, i) => (
              <div key={t} style={{ padding: "14px 22px", borderRadius: 16, background: "rgba(43,227,138,0.12)", border: `2px solid ${C.green}`, fontFamily: DISPLAY, fontWeight: 800, fontSize: 44, color: C.green, opacity: ramp(f, S.awd.f0 + i * 5, S.awd.f0 + 8 + i * 5), scale: String(interpolate(ramp(f, S.awd.f0 + i * 5, S.awd.f0 + 10 + i * 5, BACK_OUT), [0, 1], [0.6, 1])) }}>
                {t}
              </div>
            ))}
          </div>
        </AbsoluteFill>
      ) : null}

      {f >= S.cta.f0 - 2 ? (
        <Cta
          f={f}
          a={S.cta.f0 + 4}
          title={
            <>
              ¿CUÁL
              <br />
              <Y>ELEGISTE TÚ?</Y>
            </>
          }
          pill="Comenta A, B, C o D 👇"
          size={130}
        />
      ) : null}

      <Captions
        vo={vo}
        f={f}
        top={1290}
        fix={{ byd: "BYD", f40: "F40", cuntach: "Countach", countach: "Countach", corolla: "Corolla" }}
        merges={[{ from: ["gana", "un", "ferrari"], to: "gana a un Ferrari" }, { from: ["se", "honesto"], to: "Sé honesto" }]}
        hide={(x) => x < S.go.f0 - 2 || x >= S.cta.f0 - 4}
      />
      {withAudio ? <Audio src={staticFile("audio/v2-cero100.wav")} /> : null}
    </AbsoluteFill>
  );
};
