import React from "react";
import { AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame } from "remotion";
import { Audio } from "@remotion/media";
import { Captions } from "../v2/comp/Captions";
import { Odometer } from "../v2/comp/Odometer";
import { VO, seg, total, wordAt } from "../v2/lib/vo";
import voJson from "../vo/km.json";
import { FOTOS } from "../v2/fotos";
import { BACK_OUT, Card3D, Chip, Countdown3, Cta3, DISPLAY, Decode, EASE_IN_OUT, EASE_OUT, Flash, Grad, MONO, Neon, Particles, QuizGrid, Stage, Theme, ThemeP, UI, Wipe, alpha, fmt, glow, punch, ramp, win } from "./kit";

/** Reel v3 · 5 millones de km: carretera nocturna (ámbar de odómetro + cian sobre azul noche). */
export const KMV3_VO = voJson as VO;
const vo = KMV3_VO;
export const KMV3_TOTAL = total(vo, 1.8);

const TH: Theme = { bg0: "#02060F", bg1: "#0C1D40", a1: "#FFB000", a2: "#00E5FF", hot: "#FF3D6E", text: "#F6F8FF", ink: "#140C00" };
const CARS = [
  { id: "p3", rank: 3, name: "TOYOTA TUNDRA", year: "2007 · EE. UU.", km: 1_609_000, note: "motor y caja originales", foto: FOTOS.tundra },
  { id: "p2", rank: 2, name: "MERCEDES-BENZ 240 D", year: "1976 · taxi en Grecia", km: 4_600_000, note: "hoy en el Museo Mercedes-Benz", foto: FOTOS.mercedes },
  { id: "p1", rank: 1, name: "VOLVO P1800", year: "1966 · Irv Gordon", km: 5_230_000, note: "récord Guinness · un solo dueño", foto: FOTOS.volvo },
];
const BRANDS = ["TOYOTA", "MERCEDES-BENZ", "VOLVO", "HONDA"];
const MOON_RT = 768_800;

export const KmV3: React.FC<{ withAudio?: boolean }> = ({ withAudio = true }) => {
  const f = useCurrentFrame();
  const S = Object.fromEntries(vo.segments.map((s) => [s.id, seg(vo, s.id)]));
  const qEnd = S.p3.f0;
  const cur = [...CARS].reverse().find((c) => f >= S[c.id].f0 - 4);
  const odoHook = 5_230_000 - 2400 + Math.min(2400, f * 80);

  return (
    <ThemeP value={TH}>
      <Stage f={f} grid gridSpeed={f < qEnd ? 14 : 8} aurora={1}>
        <Particles f={f} n={30} kind="dust" color={TH.a1} seed={2} o={0.45} />

        {/* ===== GANCHO ===== */}
        {f < qEnd + 2 ? (
          <AbsoluteFill style={{ opacity: 1 - ramp(f, qEnd - 4, qEnd + 2), transform: `scale(${1 + punch(f, S.q.f0, 0.05)})` }}>
            <div style={{ position: "absolute", top: 220, left: 70, fontFamily: MONO, fontSize: 28, color: TH.a2, textShadow: glow(TH.a2, 0.4) }}>
              <Decode text="> REGISTRO GUINNESS · KILOMETRAJE" f={f} at={-12} cps={3} />
            </div>
            <div style={{ position: "absolute", top: 270, left: 30, width: 1020, textAlign: "center", fontFamily: DISPLAY, fontWeight: 800, fontSize: 104, lineHeight: 0.92, color: TH.text, transform: `scale(${interpolate(ramp(f, 0, 14, EASE_OUT), [0, 1], [1.08, 1])})` }}>
              UN SOLO AUTO
              <br />
              RECORRIÓ <Neon c={TH.a1} k={1.2}>+5 MILLONES</Neon>
              <br />
              DE KILÓMETROS
            </div>
            <div style={{ position: "absolute", top: 620, left: 0, width: 1080, display: "flex", justifyContent: "center", transform: `scale(${f < S.q.f0 ? 1.08 : 0.9})`, filter: `drop-shadow(0 0 30px ${alpha(TH.a1, 0.6)})` }}>
              <Odometer value={odoHook} size={112} accent={TH.a1} />
            </div>
            {f >= S.q.f0 - 4 ? (
              <AbsoluteFill style={{ opacity: ramp(f, S.q.f0 - 4, S.q.f0 + 6) }}>
                <div style={{ position: "absolute", top: 790, left: 0, width: 1080, textAlign: "center", fontFamily: DISPLAY, fontWeight: 800, fontSize: 64, color: TH.text }}>
                  ¿DE QUÉ <Neon c={TH.a2}>MARCA</Neon> ES?
                </div>
                <QuizGrid f={f} at={S.q.f0} top={880} H={150} items={BRANDS.map((b) => ({ label: b }))} hi={BRANDS.map((_, i) => (f >= S.q.f1 && f < qEnd && Math.floor((f - S.q.f1) / 7) % 4 === i ? 1 : 0))} />
              </AbsoluteFill>
            ) : null}
            <Countdown3 f={f} a={S.q.f1} b={qEnd} y={1290} size={140} />
          </AbsoluteFill>
        ) : null}

        {/* ===== RANKING ===== */}
        {cur && f >= qEnd - 2 && f < S.moon.f0 + 2 ? (
          <AbsoluteFill style={{ opacity: Math.min(ramp(f, qEnd - 2, qEnd + 4), 1 - ramp(f, S.moon.f0 - 4, S.moon.f0 + 2)) }}>
            {(() => {
              const s = S[cur.id];
              const lf = f - (s.f0 - 4);
              const winner = cur.rank === 1;
              const col = winner ? TH.a1 : TH.a2;
              const odo = interpolate(lf, [6, 56], [0, cur.km], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: EASE_IN_OUT });
              return (
                <AbsoluteFill key={cur.id} style={{ transform: `scale(${1 + punch(lf, 0, 0.06)})` }}>
                  <div style={{ position: "absolute", top: 230, left: 0, width: 1080, textAlign: "center", fontFamily: MONO, fontWeight: 700, fontSize: 32, letterSpacing: 6, color: col, textShadow: glow(col, 0.5) }}>
                    {winner ? "★ RÉCORD MUNDIAL ★" : `${cur.rank === 3 ? "TERCER" : "SEGUNDO"} LUGAR`}
                  </div>
                  <Card3D src={cur.foto ?? null} f={lf} x={70} y={290} w={940} h={560} enter={ramp(lf, 0, 14, EASE_OUT)} rim={col} label={cur.name} sub={cur.year}>
                    <div style={{ position: "absolute", left: 26, top: 22, width: 120, height: 120, borderRadius: 26, background: col, color: TH.ink, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: DISPLAY, fontWeight: 800, fontSize: 92, boxShadow: glow(col, 0.8) }}>{cur.rank}</div>
                  </Card3D>
                  <div style={{ position: "absolute", top: 900, left: 0, width: 1080, display: "flex", justifyContent: "center", filter: `drop-shadow(0 0 26px ${alpha(col, 0.55)})` }}>
                    <Odometer value={odo} size={96} accent={col} />
                  </div>
                  <div style={{ position: "absolute", top: 1048, left: 0, width: 1080, display: "flex", justifyContent: "center", gap: 14, opacity: ramp(lf, 36, 46) }}>
                    <Chip c={col} size={30}>{cur.note}</Chip>
                    {winner ? (
                      <div style={{ transform: `scale(${interpolate(ramp(lf, 60, 72, BACK_OUT), [0, 1], [0.3, 1])})`, opacity: ramp(lf, 60, 66) }}>
                        <Chip c="#3DFF9A" solid size={30}>RESPUESTA C ✓</Chip>
                      </div>
                    ) : null}
                  </div>
                  {/* barra de "camino recorrido" comparada con el récord */}
                  <div style={{ position: "absolute", top: 1150, left: 120, width: 840, height: 16, borderRadius: 8, background: alpha(TH.text, 0.1) }}>
                    <div style={{ width: `${(odo / 5_230_000) * 100}%`, height: "100%", borderRadius: 8, background: `linear-gradient(90deg, ${TH.a2}, ${col})`, boxShadow: `0 0 20px ${col}` }} />
                  </div>
                </AbsoluteFill>
              );
            })()}
          </AbsoluteFill>
        ) : null}

        {/* ===== LUNA ===== */}
        {f >= S.moon.f0 - 4 && f < S.secret.f0 + 2 ? (
          <AbsoluteFill style={{ opacity: win(f, S.moon.f0, S.secret.f0, 4, 6) }}>
            <AbsoluteFill style={{ transform: `scale(${1.15 + 0.12 * ramp(f, S.moon.f0, S.secret.f0)}) translateY(-120px)` }}>
              <Img src={staticFile(FOTOS.earthrise as string)} style={{ width: "100%", height: "100%", objectFit: "cover", filter: "saturate(1.3) contrast(1.1)" }} />
            </AbsoluteFill>
            <AbsoluteFill style={{ background: `linear-gradient(180deg, ${alpha(TH.bg0, 0.85)} 0%, transparent 40%, transparent 60%, ${alpha(TH.bg0, 0.85)} 100%)` }} />
            {/* trayectoria ida y vuelta */}
            <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
              {Array.from({ length: 7 }).map((_, i) => {
                const p = ramp(f, S.moon.f0 + i * 5, S.moon.f0 + 14 + i * 5, EASE_IN_OUT);
                return <path key={i} d={`M 220 1200 Q 540 ${560 - i * 26} 860 ${820 - i * 8}`} fill="none" stroke={i % 2 ? TH.a2 : TH.a1} strokeWidth={4} strokeDasharray="1400" strokeDashoffset={1400 * (1 - p)} opacity={0.85} style={{ filter: `drop-shadow(0 0 8px ${TH.a1})` }} />;
              })}
            </svg>
            <div style={{ position: "absolute", top: 240, left: 30, width: 1020, textAlign: "center" }}>
              <div style={{ fontFamily: MONO, fontSize: 28, color: TH.a2, letterSpacing: 2, textShadow: glow(TH.a2, 0.4) }}>5.230.000 KM ÷ IDA Y VUELTA A LA LUNA</div>
              <div style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: 250, lineHeight: 1, color: TH.text, textShadow: glow(TH.a1, 0.8) }}>×{fmt((5_230_000 / MOON_RT) * ramp(f, S.moon.f0, S.moon.f0 + 40, EASE_IN_OUT), 1)}</div>
              <div style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: 76 }}>
                <Grad from={TH.a1} to={TH.hot}>CASI 7 VIAJES A LA LUNA</Grad>
              </div>
            </div>
            <div style={{ position: "absolute", top: 1440, left: 0, width: 1080, textAlign: "center", fontFamily: UI, fontWeight: 500, fontSize: 22, color: alpha(TH.text, 0.5) }}>Foto: NASA / Apolo 8 · distancia media Tierra–Luna 384.400 km</div>
          </AbsoluteFill>
        ) : null}

        {/* ===== EL SECRETO ===== */}
        {f >= S.secret.f0 - 4 && f < S.cta.f0 + 2 ? (
          <AbsoluteFill style={{ opacity: win(f, S.secret.f0, S.cta.f0, 4, 6) }}>
            <div style={{ position: "absolute", top: 260, left: 30, width: 1020, textAlign: "center", fontFamily: DISPLAY, fontWeight: 800, fontSize: 100, color: TH.text }}>¿SU SECRETO?</div>
            <div style={{ position: "absolute", top: 400, left: 30, width: 1020, textAlign: "center", fontFamily: DISPLAY, fontWeight: 800, fontSize: 150, lineHeight: 0.92, opacity: ramp(f, wordAt(vo, "secret", "cambiar") - 2, wordAt(vo, "secret", "cambiar") + 6), transform: `scale(${interpolate(ramp(f, wordAt(vo, "secret", "cambiar") - 2, wordAt(vo, "secret", "cambiar") + 12, BACK_OUT), [0, 1], [1.4, 1])})` }}>
              <Grad from={TH.a1} to={TH.hot}>ACEITE CADA</Grad>
              <br />
              <Neon c={TH.a1} k={1.2}>~5.000 KM</Neon>
            </div>
            {/* gota de aceite que cae en cada vuelta de 5.000 km */}
            {(() => {
              const lf = Math.max(0, f - S.secret.f0);
              const cyc = lf % 10;
              return (
                <>
                  <div style={{ position: "absolute", top: 760, left: 0, width: 1080, display: "flex", justifyContent: "center", filter: `drop-shadow(0 0 24px ${alpha(TH.a1, 0.6)})` }}>
                    <Odometer digits={6} value={5000 * Math.floor(lf / 10) + 5000 * ramp(cyc, 0, 6)} size={92} accent={TH.a1} />
                  </div>
                  <svg width={120} height={160} style={{ position: "absolute", left: 480, top: 900 + cyc * 8, opacity: 1 - cyc / 10 }}>
                    <path d="M60 10 C 60 10 20 70 20 100 A 40 40 0 0 0 100 100 C 100 70 60 10 60 10 Z" fill={TH.a1} style={{ filter: `drop-shadow(0 0 14px ${TH.a1})` }} />
                  </svg>
                </>
              );
            })()}
            <div style={{ position: "absolute", top: 1120, left: 0, width: 1080, display: "flex", justifyContent: "center", opacity: ramp(f, wordAt(vo, "secret", "falta") - 6, wordAt(vo, "secret", "falta") + 4) }}>
              <Chip c={TH.a2} size={30}>3.000–3.500 millas · ninguna mantención saltada</Chip>
            </div>
          </AbsoluteFill>
        ) : null}

        <Flash f={f} at={-4} color={TH.a1} d={18} y={700} />
        <Flash f={f} at={S.p1.f0 - 4 + 60} color={TH.a1} d={18} y={980} />
        <Wipe f={f} at={qEnd} />
        <Wipe f={f} at={S.moon.f0} c1={TH.a2} c2={TH.a1} />
        <Wipe f={f} at={S.secret.f0} />

        {f >= S.cta.f0 - 2 ? (
          <>
            <Particles f={f} n={50} kind="warp" color={TH.a1} seed={5} speed={1.2} o={0.6} cy={600} />
            <Cta3 f={f} a={S.cta.f0 + 2} size={130} title={<>¿CUÁNTOS KM<br />TIENE <Grad from={TH.a1} to={TH.hot}>EL TUYO?</Grad></>} pill="Déjalo en los comentarios 👇" />
          </>
        ) : null}

        <Captions vo={vo} f={f} top={1300} accent={TH.a1} pill fix={{ record: "récord", p1800: "P1800", "240d": "240 D", luna: "Luna" }} merges={[{ from: ["un", "millón", "600.000"], to: "1.600.000" }]} hide={(x) => x >= S.cta.f0 || x < qEnd} />
      </Stage>
      {withAudio ? <Audio src={staticFile("audio/v2-km.wav")} /> : null}
    </ThemeP>
  );
};
