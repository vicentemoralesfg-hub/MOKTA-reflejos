import React from "react";
import { AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame } from "remotion";
import { Audio } from "@remotion/media";
import { Captions } from "../v2/comp/Captions";
import { VO, seg, total, wordAt } from "../v2/lib/vo";
import voJson from "../vo/cero100.json";
import { FOTOS } from "../v2/fotos";
import { BACK_OUT, Card3D, Chip, Countdown3, Cta3, DISPLAY, Decode, EASE_OUT, Flash, Grad, MONO, Neon, Particles, QuizGrid, Stage, Theme, ThemeP, UI, Wipe, alpha, fmt, glow, punch, ramp, shake, win } from "./kit";

/** Reel v3 · 0-100: estética de telemetría de carrera (magenta / cian / lima sobre violeta profundo). */
export const C100V3_VO = voJson as VO;
const vo = C100V3_VO;
export const C100V3_TOTAL = total(vo, 1.6);

const TH: Theme = { bg0: "#07030F", bg1: "#220A3D", a1: "#FF2E88", a2: "#00E1FF", hot: "#FFB800", text: "#FBF7FF", ink: "#12051F" };
const LIME = "#B6FF3B";
const CARS = [
  { name: "Ferrari F40", short: "Ferrari F40", year: "1987", cv: "478 CV", key: ["ferrari"], t: 4.1, foto: "f40", k: 0.8, col: TH.a1 },
  { name: "Lamborghini Countach", short: "Countach", year: "1988", cv: "455 CV", key: ["lamborghini"], t: 4.9, foto: "countach", k: 0.8, col: TH.hot },
  { name: "Toyota Corolla híbrido", short: "Corolla híbrido", year: "2023", cv: "140 CV", key: ["toyota"], t: 9.1, foto: "corolla", k: 0.85, col: TH.a2 },
  { name: "BYD Seal eléctrico", short: "BYD Seal", year: "2023", cv: "530 CV", key: ["byd"], t: 3.8, foto: "seal", k: 0.72, col: LIME },
];
const RANK = [...CARS].sort((a, b) => a.t - b.t).map((c) => c.name);
const speed = (t: number, T: number, k: number) => (t <= 0 ? 0 : t >= T ? 100 : 100 * Math.pow(t / T, k));

const Torque: React.FC<{ f: number; a: number }> = ({ f, a }) => {
  const W = 880, H = 560;
  const X = (rpm: number) => 80 + (rpm / 7000) * (W - 110);
  const Yv = (nm: number) => H - 60 - (nm / 720) * (H - 110);
  const f40 = [[1000, 300], [2000, 420], [3000, 520], [4000, 577], [5000, 565], [6000, 545], [7000, 505]];
  const ev = [[0, 670], [4500, 670], [5500, 600], [7000, 480]];
  const path = (pts: number[][]) => pts.map((p, i) => `${i ? "L" : "M"} ${X(p[0]).toFixed(1)} ${Yv(p[1]).toFixed(1)}`).join(" ");
  const area = (pts: number[][]) => `${path(pts)} L ${X(pts[pts.length - 1][0])} ${Yv(0)} L ${X(pts[0][0])} ${Yv(0)} Z`;
  const pE = ramp(f, a, a + 18), pF = ramp(f, a + 14, a + 40);
  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: "absolute", left: 100, top: 470, overflow: "visible" }}>
      <defs>
        <linearGradient id="gE" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor={LIME} stopOpacity={0.45} /><stop offset="1" stopColor={LIME} stopOpacity={0} /></linearGradient>
        <linearGradient id="gF" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor={TH.a1} stopOpacity={0.45} /><stop offset="1" stopColor={TH.a1} stopOpacity={0} /></linearGradient>
        <clipPath id="cE"><rect x={0} y={0} width={X(0) + (W - X(0)) * pE} height={H} /></clipPath>
        <clipPath id="cF"><rect x={0} y={0} width={X(0) + (W - X(0)) * pF} height={H} /></clipPath>
      </defs>
      {[0, 2000, 4000, 6000].map((r) => (
        <g key={r}>
          <line x1={X(r)} y1={30} x2={X(r)} y2={Yv(0)} stroke={alpha(TH.text, 0.08)} strokeWidth={2} />
          <text x={X(r)} y={H - 18} textAnchor="middle" fontFamily="Inter" fontWeight={700} fontSize={24} fill={alpha(TH.text, 0.55)}>{fmt(r)}</text>
        </g>
      ))}
      <line x1={X(0)} y1={Yv(0)} x2={W} y2={Yv(0)} stroke={alpha(TH.text, 0.4)} strokeWidth={3} />
      <text x={W} y={H - 18} textAnchor="end" fontFamily="Inter" fontWeight={800} fontSize={24} fill={alpha(TH.text, 0.55)}>rpm</text>
      <g clipPath="url(#cE)"><path d={area(ev)} fill="url(#gE)" /><path d={path(ev)} fill="none" stroke={LIME} strokeWidth={9} strokeLinecap="round" style={{ filter: `drop-shadow(0 0 10px ${LIME})` }} /></g>
      <g clipPath="url(#cF)"><path d={area(f40)} fill="url(#gF)" /><path d={path(f40)} fill="none" stroke={TH.a1} strokeWidth={9} strokeLinecap="round" style={{ filter: `drop-shadow(0 0 10px ${TH.a1})` }} /></g>
      <g opacity={pE}>
        <circle cx={X(0)} cy={Yv(670)} r={14 + 4 * Math.sin(f / 4)} fill={LIME} style={{ filter: `drop-shadow(0 0 12px ${LIME})` }} />
        <text x={X(250)} y={Yv(670) - 26} fontFamily="Barlow Condensed" fontWeight={800} fontSize={46} fill={LIME}>ELÉCTRICO: 670 Nm DESDE 0</text>
      </g>
      <g opacity={ramp(f, a + 34, a + 42)}>
        <circle cx={X(4000)} cy={Yv(577)} r={14 + 4 * Math.sin(f / 4)} fill={TH.a1} style={{ filter: `drop-shadow(0 0 12px ${TH.a1})` }} />
        <text x={X(4000)} y={Yv(577) + 62} textAnchor="middle" fontFamily="Barlow Condensed" fontWeight={800} fontSize={46} fill={TH.a1}>F40: 577 Nm A 4.000 rpm</text>
      </g>
    </svg>
  );
};

export const Cero100V3: React.FC<{ withAudio?: boolean }> = ({ withAudio = true }) => {
  const f = useCurrentFrame();
  const S = Object.fromEntries(vo.segments.map((s) => [s.id, seg(vo, s.id)]));
  const qEnd = S.go.f0;
  const start = S.go.f1 - 4;
  const t = (f - start) / 30;
  const raceOn = f >= qEnd - 4 && f < S.why.f0 + 4;
  const mention = CARS.map((x) => (x.key[0] === "byd" ? wordAt(vo, "result", ["electrico"], -1) : x.key[0] === "toyota" ? wordAt(vo, "corolla", ["corolla"], -1) : wordAt(vo, "result", x.key, -1)));
  const lastIdx = mention.reduce((best, a, j) => (a >= 0 && f >= a - 3 && (best < 0 || a > mention[best]) ? j : best), -1);
  const sk = shake(f, qEnd, 22, 16);
  const camS = 1 + punch(f, qEnd, 0.1, 16) + 0.03 * ramp(f, start, start + 120);

  return (
    <ThemeP value={TH}>
      <Stage f={f} grid gridSpeed={raceOn ? 22 : 6} aurora={1}>
        <Particles f={f} n={raceOn ? 70 : 30} kind="warp" color={raceOn ? LIME : TH.a2} seed={4} speed={raceOn ? 2.4 : 0.6} o={raceOn ? 0.8 : 0.35} cy={760} />
        <AbsoluteFill style={{ transform: `translate(${sk.x}px, ${sk.y}px) scale(${camS})`, transformOrigin: "540px 900px" }}>
          {/* ===== GANCHO + OPCIONES ===== */}
          {f < qEnd + 2 ? (
            <AbsoluteFill style={{ opacity: 1 - ramp(f, qEnd - 4, qEnd + 2) }}>
              <div style={{ position: "absolute", top: 220, left: 70, fontFamily: MONO, fontSize: 28, color: TH.a2, textShadow: glow(TH.a2, 0.4) }}>
                <Decode text="> TELEMETRÍA · 0–100 KM/H" f={f} at={-10} cps={3} />
              </div>
              <div style={{ position: "absolute", top: 270, left: 30, width: 1020, textAlign: "center", fontFamily: DISPLAY, fontWeight: 800, fontSize: 104, lineHeight: 0.9, color: TH.text, transform: `scale(${interpolate(ramp(f, 0, 14, EASE_OUT), [0, 1], [1.07, 1])})` }}>
                ¿CUÁL LLEGA PRIMERO
                <br />
                <Grad from={TH.a1} to={TH.hot}>A 100 KM/H?</Grad>
              </div>
              <QuizGrid
                f={f}
                at={-24}
                top={540}
                H={300}
                items={CARS.map((c) => ({ label: c.short, src: FOTOS[c.foto] ?? null, sub: `${c.year} · ${c.cv}` }))}
                hi={CARS.map((c, i) => {
                  const a = wordAt(vo, "options", c.key, S.options.start + i * 1.4);
                  const b = i < 3 ? wordAt(vo, "options", CARS[i + 1].key, S.options.start + (i + 1) * 1.4) : S.options.f1 + 8;
                  return Math.min(ramp(f, a - 3, a + 3), 1 - ramp(f, b - 3, b + 1));
                })}
              />
              <Countdown3 f={f} a={S.options.f1} b={qEnd} y={1265} />
            </AbsoluteFill>
          ) : null}

          {/* ===== ¡PARTIERON! ===== */}
          {f >= qEnd - 2 && f < start + 26 ? (
            <div style={{ position: "absolute", top: 250, left: 0, width: 1080, textAlign: "center", fontFamily: DISPLAY, fontWeight: 800, fontSize: 190, opacity: win(f, qEnd, start + 26, 2, 8), transform: `scale(${interpolate(ramp(f, qEnd - 2, qEnd + 8, BACK_OUT), [0, 1], [2.2, 1])}) rotate(-5deg)`, zIndex: 5 }}>
              <Neon c={LIME} k={1.6}>¡PARTIERON!</Neon>
            </div>
          ) : null}

          {/* ===== CARRERA ===== */}
          {raceOn ? (
            <AbsoluteFill style={{ opacity: ramp(f, qEnd - 4, qEnd + 4) * (1 - ramp(f, S.why.f0 - 4, S.why.f0 + 4)) }}>
              <div style={{ position: "absolute", top: 225, left: 0, width: 1080, textAlign: "center", opacity: ramp(f, start + 20, start + 28) }}>
                <div style={{ fontFamily: MONO, fontSize: 28, letterSpacing: 6, color: TH.a2, textShadow: glow(TH.a2, 0.4) }}>0 → 100 KM/H</div>
                <div style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: 150, lineHeight: 1, color: TH.text, fontVariantNumeric: "tabular-nums", textShadow: glow(t > 0 && t < 9.1 ? TH.a1 : LIME, 0.7) }}>{fmt(Math.max(0, Math.min(t, 9.1)), 2)}s</div>
              </div>
              {CARS.map((c, i) => {
                const v = speed(t, c.t, c.k);
                const done = t >= c.t;
                const rank = RANK.indexOf(c.name) + 1;
                const top = 440 + i * 200;
                const hl = lastIdx === i && f >= S.result.f0 ? 1 : 0;
                const dim = lastIdx >= 0 && f >= S.result.f0 && !hl ? 0.45 : 1;
                const X0 = 60, X1 = 860;
                const px = X0 + (X1 - X0) * (v / 100);
                return (
                  <div key={c.name} style={{ position: "absolute", top, left: 0, width: 1080, height: 180, opacity: dim, transform: `scale(${1 + 0.04 * hl})`, transformOrigin: "540px 90px" }}>
                    <div style={{ position: "absolute", left: 60, top: 0, fontFamily: DISPLAY, fontWeight: 800, fontSize: 44, color: TH.text }}>
                      {c.name} <span style={{ fontFamily: UI, fontSize: 24, color: alpha(TH.text, 0.6) }}>{c.year}</span>
                    </div>
                    <div style={{ position: "absolute", right: 140, top: 6, fontFamily: MONO, fontSize: 30, color: c.col, textShadow: glow(c.col, 0.4), fontVariantNumeric: "tabular-nums" }}>{String(Math.round(v)).padStart(3, " ")} km/h</div>
                    {/* pista */}
                    <div style={{ position: "absolute", left: X0, top: 96, width: X1 - X0 + 60, height: 14, borderRadius: 7, background: alpha(TH.text, 0.08) }} />
                    <div style={{ position: "absolute", left: X0, top: 96, width: Math.max(0, px - X0), height: 14, borderRadius: 7, background: `linear-gradient(90deg, transparent, ${c.col})`, boxShadow: `0 0 24px ${c.col}` }} />
                    {/* meta */}
                    <div style={{ position: "absolute", left: X1 + 40, top: 60, width: 16, height: 86, background: `repeating-linear-gradient(180deg, #fff 0 12px, #111 12px 24px)`, opacity: 0.8 }} />
                    {/* auto */}
                    <div style={{ position: "absolute", left: px - 70, top: 52, width: 120, height: 100, borderRadius: 22, overflow: "hidden", border: `4px solid ${c.col}`, boxShadow: `0 0 30px ${c.col}, -${Math.min(60, v)}px 0 40px ${alpha(c.col, 0.5)}`, transform: `skewX(${-Math.min(14, v / 6) * (done ? 0 : 1)}deg)` }}>
                      {FOTOS[c.foto] ? <Img src={staticFile(FOTOS[c.foto] as string)} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : null}
                    </div>
                    {done ? (
                      <div style={{ position: "absolute", left: 470, top: 132, display: "flex", alignItems: "center", gap: 10, transform: `scale(${interpolate(ramp(t * 30, c.t * 30, c.t * 30 + 8, BACK_OUT), [0, 1], [0.3, 1])})` }}>
                        <Chip c={rank === 1 ? LIME : c.col} solid={rank === 1} size={32}>
                          {rank}° · {fmt(c.t, 1)} s
                        </Chip>
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </AbsoluteFill>
          ) : null}

          {/* ===== ¿POR QUÉ? ===== */}
          {f >= S.why.f0 - 4 && f < S.awd.f0 + 4 ? (
            <AbsoluteFill style={{ opacity: win(f, S.why.f0, S.awd.f0, 6, 6) }}>
              <div style={{ position: "absolute", top: 250, left: 30, width: 1020, textAlign: "center", fontFamily: DISPLAY, fontWeight: 800, fontSize: 96, lineHeight: 0.92, color: TH.text }}>
                ¿CÓMO LE GANA
                <br />A UN <Neon c={TH.a1} k={1.2}>FERRARI?</Neon>
              </div>
              <Torque f={f} a={wordAt(vo, "why", ["electrico"]) - 4} />
              <div style={{ position: "absolute", top: 1060, left: 70, width: 940, textAlign: "center", fontFamily: UI, fontWeight: 500, fontSize: 22, color: alpha(TH.text, 0.45) }}>curvas ilustrativas · máximos de fábrica: BYD Seal AWD 670 Nm · Ferrari F40 577 Nm a 4.000 rpm</div>
            </AbsoluteFill>
          ) : null}

          {/* ===== DOS MOTORES ===== */}
          {f >= S.awd.f0 - 4 && f < S.cta.f0 + 2 ? (
            <AbsoluteFill style={{ opacity: win(f, S.awd.f0, S.cta.f0, 4, 6) }}>
              <Card3D src={FOTOS.seal ?? null} f={f - S.awd.f0} x={70} y={250} w={940} h={600} enter={ramp(f, S.awd.f0 - 4, S.awd.f0 + 12, EASE_OUT)} rim={LIME} label="BYD Seal AWD" sub="sedán 100 % eléctrico" />
              <div style={{ position: "absolute", top: 890, left: 0, width: 1080, display: "flex", justifyContent: "center", gap: 14 }}>
                {["2 MOTORES", "4×4", "530 CV", "670 Nm"].map((tx, i) => (
                  <div key={tx} style={{ transform: `scale(${interpolate(ramp(f, S.awd.f0 + 6 + i * 5, S.awd.f0 + 16 + i * 5, BACK_OUT), [0, 1], [0.3, 1])})`, opacity: ramp(f, S.awd.f0 + 6 + i * 5, S.awd.f0 + 12 + i * 5) }}>
                    <Chip c={LIME} solid={i === 0} size={40}>{tx}</Chip>
                  </div>
                ))}
              </div>
            </AbsoluteFill>
          ) : null}
        </AbsoluteFill>

        <Flash f={f} at={qEnd} color={LIME} d={18} y={600} />
        <Flash f={f} at={start + 3.8 * 30} color={LIME} d={14} y={1100} ring={false} />
        <Wipe f={f} at={S.why.f0} />
        <Wipe f={f} at={S.awd.f0} c1={LIME} c2={TH.a2} />

        {f >= S.cta.f0 - 2 ? (
          <>
            <Particles f={f} n={60} kind="warp" color={TH.a1} seed={9} speed={1.4} o={0.6} cy={640} />
            <Cta3 f={f} a={S.cta.f0 + 2} size={150} title={<>¿CUÁL<br /><Grad from={TH.a1} to={TH.hot}>ELEGISTE TÚ?</Grad></>} pill="Comenta A, B, C o D 👇" />
          </>
        ) : null}

        <Captions
          vo={vo}
          f={f}
          top={1310}
          accent={TH.a1}
          ink="#FFFFFF"
          pill
          fix={{ byd: "BYD", f40: "F40", cuntach: "Countach", countach: "Countach", corolla: "Corolla" }}
          merges={[{ from: ["gana", "un", "ferrari"], to: "gana a un Ferrari" }, { from: ["se", "honesto"], to: "Sé honesto" }, { from: ["ganó", "en", "eléctrico"], to: "Ganó el eléctrico" }]}
          hide={(x) => x < S.go.f0 - 2 || x >= S.cta.f0 - 4}
        />
      </Stage>
      {withAudio ? <Audio src={staticFile("audio/v2-cero100.wav")} /> : null}
    </ThemeP>
  );
};
