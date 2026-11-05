import React from "react";
import { AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame } from "remotion";
import { Audio } from "@remotion/media";
import { Captions } from "../v2/comp/Captions";
import { VO, seg, total, wordAt } from "../v2/lib/vo";
import voJson from "../vo/vendidos.json";
import { FOTOS } from "../v2/fotos";
import { BACK_OUT, Bars3, Card3D, Chip, Countdown3, Cta3, DISPLAY, Decode, EASE_IN_OUT, EASE_OUT, Flash, Grad, MONO, Neon, Particles, QuizGrid, Stage, Theme, ThemeP, UI, Wipe, alpha, fmt, glow, punch, ramp, rnd, win } from "./kit";

/** Reel v3 · el auto más vendido: estética pop (naranja / rosa / turquesa sobre morado). */
export const VENV3_VO = voJson as VO;
const vo = VENV3_VO;
export const VENV3_TOTAL = total(vo, 1.6);

const TH: Theme = { bg0: "#10031C", bg1: "#3A0D52", a1: "#FF7A18", a2: "#FF3CAC", hot: "#2BD2FF", text: "#FFF8F2", ink: "#1A0600" };
const OPTS = [
  { label: "VW Escarabajo", foto: "beetle", key: ["escarabajo"] },
  { label: "Ford Modelo T", foto: "modelt", key: ["ford", "modelo"] },
  { label: "VW Golf", foto: "golf", key: ["golf"] },
  { label: "Toyota Corolla", foto: "corolla", key: ["corolla"] },
];
const RANK = [
  { id: "p4", name: "FORD MODELO T", sub: "1908–1927", units: 15_000_000, foto: "modelt", pos: 4, plus: "≈", col: "#C9A7FF" },
  { id: "p3", name: "VW ESCARABAJO", sub: "1938–2003", units: 21_500_000, foto: "beetle", pos: 3, plus: "+", col: TH.hot },
  { id: "p2", name: "VW GOLF", sub: "desde 1974", units: 37_000_000, foto: "golf", pos: 2, plus: "+", col: TH.a2 },
  { id: "p1", name: "TOYOTA COROLLA", sub: "desde 1966", units: 50_000_000, foto: "corolla", pos: 1, plus: "+", col: TH.a1 },
];

const Confetti: React.FC<{ f: number; at: number }> = ({ f, at }) => {
  if (f < at || f > at + 70) return null;
  const lf = f - at;
  const cols = [TH.a1, TH.a2, TH.hot, "#FFE14D", "#FFFFFF"];
  return (
    <svg width={1080} height={1920} style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
      {Array.from({ length: 90 }).map((_, i) => {
        const a = rnd(i, 3) * Math.PI - Math.PI;
        const v = 18 + rnd(i, 5) * 26;
        const x = 540 + Math.cos(a) * v * lf * 0.9;
        const y = 640 + Math.sin(a) * v * lf + 0.9 * lf * lf;
        return <rect key={i} x={x} y={y} width={12} height={22} rx={3} fill={cols[i % cols.length]} transform={`rotate(${lf * (8 + i % 7) * (i % 2 ? 1 : -1)} ${x} ${y})`} opacity={1 - lf / 70} />;
      })}
    </svg>
  );
};

export const VendidosV3: React.FC<{ withAudio?: boolean }> = ({ withAudio = true }) => {
  const f = useCurrentFrame();
  const S = Object.fromEntries(vo.segments.map((s) => [s.id, seg(vo, s.id)]));
  const qEnd = S.p4.f0;
  const cur = [...RANK].reverse().find((r) => f >= S[r.id].f0 - 4);

  return (
    <ThemeP value={TH}>
      <Stage f={f} aurora={1.1}>
        <Particles f={f} n={34} kind="dust" color={TH.a2} seed={6} o={0.5} />

        {/* ===== GANCHO ===== */}
        {f < qEnd + 2 ? (
          <AbsoluteFill style={{ opacity: 1 - ramp(f, qEnd - 4, qEnd + 2) }}>
            <div style={{ position: "absolute", top: 225, left: 70, fontFamily: MONO, fontSize: 28, color: TH.hot, textShadow: glow(TH.hot, 0.4) }}>
              <Decode text="> RANKING MUNDIAL · VENTAS HISTÓRICAS" f={f} at={-12} cps={3} />
            </div>
            <div style={{ position: "absolute", top: 268, left: 0, width: 1080, textAlign: "center", transform: `scale(${interpolate(ramp(f, 0, 16, EASE_OUT), [0, 1], [1.12, 1]) + punch(f, wordAt(vo, "hook", ["millones"]), 0.06)})` }}>
              <div style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: 168, lineHeight: 1, fontVariantNumeric: "tabular-nums" }}>
                <Grad from={TH.a1} to={TH.a2}>+{fmt(50_000_000 * interpolate(ramp(f, 0, S.hook.f1 - 8, EASE_OUT), [0, 1], [0.8, 1]))}</Grad>
              </div>
              <div style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: 70, color: TH.text, lineHeight: 1 }}>VENDIDOS DE UN SOLO AUTO</div>
              <div style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: 84, marginTop: 6, opacity: ramp(f, wordAt(vo, "hook", ["cual"]) - 4, wordAt(vo, "hook", ["cual"]) + 4) }}>
                <Neon c={TH.hot} k={1.2}>¿CUÁL ES?</Neon>
              </div>
            </div>
            <QuizGrid
              f={f}
              at={-24}
              top={620}
              H={290}
              items={OPTS.map((o) => ({ label: o.label, src: FOTOS[o.foto] ?? null }))}
              hi={OPTS.map((o, i) => {
                const a = wordAt(vo, "options", o.key, S.options.start + i * 1.0);
                const b = i < 3 ? wordAt(vo, "options", OPTS[i + 1].key, S.options.start + (i + 1) * 1.0) : S.options.f1 + 8;
                return Math.min(ramp(f, a - 3, a + 3), 1 - ramp(f, b - 3, b + 1));
              })}
            />
            <Countdown3 f={f} a={S.options.f1} b={qEnd} y={1300} size={140} />
          </AbsoluteFill>
        ) : null}

        {/* ===== RANKING ===== */}
        {cur && f >= qEnd - 2 && f < S.pace.f0 + 2 ? (
          <AbsoluteFill style={{ opacity: Math.min(ramp(f, qEnd - 2, qEnd + 4), 1 - ramp(f, S.pace.f0 - 4, S.pace.f0 + 2)) }}>
            {(() => {
              const s = S[cur.id];
              const lf = f - (s.f0 - 4);
              const top = cur.pos === 1;
              return (
                <AbsoluteFill key={cur.id}>
                  {/* número gigante detrás */}
                  <div style={{ position: "absolute", top: 120, right: 30, fontFamily: DISPLAY, fontWeight: 800, fontSize: 620, lineHeight: 1, color: alpha(cur.col, 0.16), transform: `translateX(${80 * (1 - ramp(lf, 0, 14, EASE_OUT))}px)` }}>{cur.pos}</div>
                  <div style={{ position: "absolute", top: 228, left: 0, width: 1080, textAlign: "center", fontFamily: MONO, fontWeight: 700, fontSize: 30, letterSpacing: 6, color: cur.col, textShadow: glow(cur.col, 0.5) }}>{top ? "★ EL MÁS VENDIDO DE LA HISTORIA ★" : `PUESTO ${cur.pos}`}</div>
                  <Card3D src={FOTOS[cur.foto] ?? null} f={lf} x={70} y={285} w={940} h={480} enter={ramp(lf, 0, 9, EASE_OUT)} rim={cur.col} label={cur.name} sub={cur.sub} ry={-14}>
                    {top ? (
                      <div style={{ position: "absolute", top: 20, right: 20, transform: `scale(${interpolate(ramp(lf, 40, 52, BACK_OUT), [0, 1], [0.2, 1])})`, opacity: ramp(lf, 40, 46) }}>
                        <Chip c="#3DFF9A" solid size={30}>RESPUESTA D ✓</Chip>
                      </div>
                    ) : null}
                  </Card3D>
                  <div style={{ position: "absolute", top: 790, left: 0, width: 1080, textAlign: "center", transform: `scale(${1 + punch(lf, 40, 0.08)})` }}>
                    <div style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: 132, lineHeight: 1, color: cur.col, fontVariantNumeric: "tabular-nums", textShadow: glow(cur.col, 0.7) }}>
                      {cur.plus}
                      {fmt(cur.units * ramp(lf, 4, 40, EASE_IN_OUT))}
                    </div>
                    <div style={{ fontFamily: UI, fontWeight: 700, fontSize: 28, color: alpha(TH.text, 0.65), letterSpacing: 4 }}>UNIDADES</div>
                  </div>
                </AbsoluteFill>
              );
            })()}
            <Bars3
              f={f}
              top={985}
              rowH={66}
              maxW={470}
              labelW={230}
              rows={[...RANK].reverse().map((r) => ({ label: r.name.replace("TOYOTA ", "").replace("FORD ", ""), value: r.units / 1e6, at: S[r.id].f0 + 20, unit: "M", color: r.col }))}
            />
            <Confetti f={f} at={S.p1.f0 + 36} />
          </AbsoluteFill>
        ) : null}

        {/* ===== UNO CADA 35 s ===== */}
        {f >= S.pace.f0 - 4 && f < S.earth.f0 + 2 ? (
          <AbsoluteFill style={{ opacity: win(f, S.pace.f0, S.earth.f0, 4, 6) }}>
            {(() => {
              const lf = Math.max(0, f - S.pace.f0);
              const cyc = 22;
              const n = Math.floor(lf / cyc) + 1;
              const p = (lf % cyc) / cyc;
              return (
                <>
                  <div style={{ position: "absolute", top: 240, left: 30, width: 1020, textAlign: "center", fontFamily: DISPLAY, fontWeight: 800, fontSize: 104, lineHeight: 0.92, color: TH.text }}>
                    UN COROLLA
                    <br />
                    <Grad from={TH.a1} to={TH.a2}>CADA 35 SEGUNDOS</Grad>
                  </div>
                  <svg width={400} height={400} style={{ position: "absolute", left: 340, top: 470, overflow: "visible", filter: `drop-shadow(0 0 20px ${TH.a1})` }}>
                    <circle cx={200} cy={200} r={170} fill={alpha(TH.bg0, 0.6)} stroke={alpha(TH.text, 0.15)} strokeWidth={14} />
                    <circle cx={200} cy={200} r={170} fill="none" stroke={`url(#pg)`} strokeWidth={14} strokeLinecap="round" strokeDasharray={2 * Math.PI * 170} strokeDashoffset={2 * Math.PI * 170 * (1 - p)} transform="rotate(-90 200 200)" />
                    <defs><linearGradient id="pg"><stop offset="0" stopColor={TH.a1} /><stop offset="1" stopColor={TH.a2} /></linearGradient></defs>
                    <circle cx={200 + 170 * Math.sin(p * Math.PI * 2)} cy={200 - 170 * Math.cos(p * Math.PI * 2)} r={16} fill="#FFFFFF" style={{ filter: "drop-shadow(0 0 12px #fff)" }} />
                    <text x={200} y={238} textAnchor="middle" fontFamily="Barlow Condensed" fontWeight={800} fontSize={120} fill={TH.text}>+{n}</text>
                  </svg>
                  {/* autos que se van apilando */}
                  <div style={{ position: "absolute", top: 930, left: 90, width: 900, display: "flex", flexWrap: "wrap", gap: 10, justifyContent: "center" }}>
                    {Array.from({ length: Math.min(12, n) }).map((_, i) => (
                      <div key={i} style={{ width: 132, height: 84, borderRadius: 14, overflow: "hidden", border: `2px solid ${i % 2 ? TH.a2 : TH.a1}`, boxShadow: `0 0 16px ${alpha(TH.a1, 0.5)}`, transform: `scale(${i === n - 1 ? interpolate(ramp(lf % cyc, 0, 8, BACK_OUT), [0, 1], [0.2, 1]) : 1})` }}>
                        <Img src={staticFile(FOTOS.corolla as string)} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      </div>
                    ))}
                  </div>
                  <div style={{ position: "absolute", top: 1160, left: 0, width: 1080, textAlign: "center", fontFamily: UI, fontWeight: 600, fontSize: 24, color: alpha(TH.text, 0.55) }}>en promedio · 50 millones en ~55 años (1966–2021)</div>
                </>
              );
            })()}
          </AbsoluteFill>
        ) : null}

        {/* ===== 5 VUELTAS A LA TIERRA ===== */}
        {f >= S.earth.f0 - 4 && f < S.cta.f0 + 2 ? (
          <AbsoluteFill style={{ opacity: win(f, S.earth.f0, S.cta.f0, 4, 6) }}>
            {(() => {
              const lf = Math.max(0, f - S.earth.f0);
              const loops = 5 * ramp(lf, 2, Math.max(20, wordAt(vo, "earth", ["cinco", "5"]) - S.earth.f0 + 4));
              const nl = Math.floor(loops);
              return (
                <>
                  <div style={{ position: "absolute", top: 230, left: 0, width: 1080, textAlign: "center" }}>
                    <div style={{ fontFamily: MONO, fontSize: 28, letterSpacing: 4, color: TH.hot, textShadow: glow(TH.hot, 0.4) }}>50 MILLONES EN FILA</div>
                    <div style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: 150, lineHeight: 1 }}>
                      <Grad from={TH.a1} to={TH.a2}>
                        {nl} {nl === 1 ? "VUELTA" : "VUELTAS"}
                      </Grad>
                    </div>
                    <div style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: 60, color: TH.text }}>A LA TIERRA</div>
                  </div>
                  <div style={{ position: "absolute", left: 240, top: 620, width: 600, height: 600, borderRadius: "50%", overflow: "hidden", boxShadow: `0 0 120px ${alpha(TH.hot, 0.6)}`, transform: `rotate(${lf * 0.4}deg)` }}>
                    <Img src={staticFile(FOTOS.tierra as string)} style={{ width: "100%", height: "100%", objectFit: "cover", transform: "scale(1.12)" }} />
                  </div>
                  <svg width={1080} height={1920} style={{ position: "absolute", inset: 0, filter: `drop-shadow(0 0 10px ${TH.a1})` }}>
                    {Array.from({ length: 5 }).map((_, i) => {
                      const p = Math.max(0, Math.min(1, loops - i));
                      const rx = 400 + i * 12, ry = 120 + i * 22;
                      const C = Math.PI * (3 * (rx + ry) - Math.sqrt((3 * rx + ry) * (rx + 3 * ry)));
                      return <ellipse key={i} cx={540} cy={920} rx={rx} ry={ry} fill="none" stroke={[TH.a1, TH.a2, TH.hot, "#FFE14D", TH.a1][i]} strokeWidth={6} strokeDasharray={C} strokeDashoffset={C * (1 - p)} transform={`rotate(${-18 + i * 9} 540 920)`} opacity={p > 0 ? 0.95 : 0} />;
                    })}
                  </svg>
                  <div style={{ position: "absolute", top: 1250, left: 0, width: 1080, textAlign: "center", fontFamily: UI, fontWeight: 500, fontSize: 22, color: alpha(TH.text, 0.5) }}>≈ 4,3 m por auto → 215.000 km · Tierra: 40.075 km · Foto: NASA / Apolo 17</div>
                </>
              );
            })()}
          </AbsoluteFill>
        ) : null}

        <Flash f={f} at={-4} color={TH.a1} d={18} y={420} />
        <Flash f={f} at={S.p1.f0 + 36} color={TH.a1} d={20} y={640} />
        <Wipe f={f} at={qEnd} />
        <Wipe f={f} at={S.p3.f0 - 4} d={12} c1={TH.hot} c2={TH.a2} />
        <Wipe f={f} at={S.p2.f0 - 4} d={12} c1={TH.a2} c2={TH.a1} />
        <Wipe f={f} at={S.p1.f0 - 4} d={12} c1={TH.a1} c2="#FFE14D" />
        <Wipe f={f} at={S.pace.f0} c1={TH.a2} c2={TH.hot} />
        <Wipe f={f} at={S.earth.f0} c1={TH.hot} c2={TH.a1} />

        {f >= S.cta.f0 - 2 ? (
          <AbsoluteFill>
            <Particles f={f} n={50} kind="rise" color={TH.a1} seed={8} o={0.6} />
            <Cta3 f={f} a={S.cta.f0 + 2} size={124} title={<>¿HAS TENIDO<br /><Grad from={TH.a1} to={TH.a2}>ALGUNO DE ESTOS?</Grad></>} pill="Cuéntanos cuál y de qué año 👇" />
            <div style={{ position: "absolute", top: 1010, left: 70, width: 940, display: "flex", gap: 12 }}>
              {OPTS.map((o, i) => (
                <div key={o.label} style={{ flex: 1, height: 160, borderRadius: 18, overflow: "hidden", border: `3px solid ${[TH.a1, TH.a2, TH.hot, "#FFE14D"][i]}`, boxShadow: `0 0 20px ${alpha([TH.a1, TH.a2, TH.hot, "#FFE14D"][i], 0.6)}`, transform: `translateY(${60 * (1 - ramp(f, S.cta.f0 + 12 + i * 3, S.cta.f0 + 22 + i * 3, BACK_OUT))}px) rotate(${(i - 1.5) * 3}deg)`, opacity: ramp(f, S.cta.f0 + 12 + i * 3, S.cta.f0 + 18 + i * 3) }}>
                  <Img src={staticFile(FOTOS[o.foto] as string)} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                </div>
              ))}
            </div>
          </AbsoluteFill>
        ) : null}

        <Captions vo={vo} f={f} top={1310} accent={TH.a1} pill fix={{ corolla: "Corolla", golf: "Golf", tierra: "Tierra", escarabajo: "Escarabajo", modelo: "Modelo" }} hide={(x) => x < S.p4.f0 - 2 || x >= S.cta.f0 - 4} />
      </Stage>
      {withAudio ? <Audio src={staticFile("audio/v2-vendidos.wav")} /> : null}
    </ThemeP>
  );
};
