import React from "react";
import { AbsoluteFill, interpolate, staticFile, useCurrentFrame } from "remotion";
import { Audio } from "@remotion/media";
import { Captions } from "../v2/comp/Captions";
import { VO, seg, total, wordAt } from "../v2/lib/vo";
import voJson from "../vo/caro.json";
import { FOTOS } from "../v2/fotos";
import { BACK_OUT, Bars3, Card3D, Chip, Countdown3, Cta3, DISPLAY, Decode, EASE_IN_OUT, EASE_OUT, Flash, Grad, MONO, Neon, Particles, QuizGrid, Stage, Theme, ThemeP, UI, Wipe, alpha, fmt, glow, punch, ramp, win } from "./kit";

/** Reel v3 · el auto más caro: estética de bóveda (oro metálico + esmeralda sobre negro). */
export const CAROV3_VO = voJson as VO;
const vo = CAROV3_VO;
export const CAROV3_TOTAL = total(vo, 1.6);

const TH: Theme = { bg0: "#030403", bg1: "#0E2A20", a1: "#F5C542", a2: "#1FE0A5", hot: "#FF4D6D", text: "#FFF9EC", ink: "#1A1200" };
const GOLD1 = "#FFF1B8", GOLD2 = "#C8901E";
const OPTS = [
  { label: "Ferrari 250 GTO", foto: "gto" },
  { label: "Mercedes 300 SLR", foto: "slr" },
  { label: "Bugatti La Voiture Noire", foto: "voiture_noire" },
  { label: "Rolls-Royce Boat Tail", foto: "boattail" },
];

const Gold: React.FC<{ children: React.ReactNode }> = ({ children }) => <Grad from={GOLD1} to={GOLD2} angle={170}>{children}</Grad>;

/** caja fuerte cerrada con dial girando (el auto sigue siendo un misterio) */
const Vault: React.FC<{ f: number; o: number }> = ({ f, o }) => (
  <div style={{ position: "absolute", left: 90, top: 650, width: 900, height: 520, borderRadius: 34, opacity: o, background: "linear-gradient(145deg, #1b1f1c, #070908)", border: `3px solid ${alpha(TH.a1, 0.7)}`, boxShadow: `0 40px 90px rgba(0,0,0,0.7), 0 0 50px ${alpha(TH.a1, 0.25)}, inset 0 2px 0 rgba(255,255,255,0.12)` }}>
    {[40, 860 - 40].map((x) => [40, 480 - 40].map((y) => <div key={`${x}${y}`} style={{ position: "absolute", left: x, top: y, width: 22, height: 22, borderRadius: 11, background: `radial-gradient(circle at 35% 35%, ${GOLD1}, ${GOLD2})` }} />))}
    <svg width={900} height={520} style={{ position: "absolute", inset: 0 }}>
      <defs>
        <radialGradient id="dial" cx="40%" cy="35%"><stop offset="0" stopColor={GOLD1} /><stop offset="0.6" stopColor={GOLD2} /><stop offset="1" stopColor="#5a3d08" /></radialGradient>
      </defs>
      <g transform={`translate(450 260) rotate(${Math.sin(f / 9) * 70 + f * 3})`}>
        <circle r={150} fill="url(#dial)" style={{ filter: `drop-shadow(0 0 20px ${alpha(TH.a1, 0.6)})` }} />
        <circle r={112} fill="#121512" stroke={alpha(GOLD1, 0.6)} strokeWidth={3} />
        {Array.from({ length: 40 }).map((_, i) => (
          <line key={i} x1={0} y1={-126} x2={0} y2={i % 5 ? -136 : -146} stroke="#2a1d04" strokeWidth={i % 5 ? 3 : 5} transform={`rotate(${i * 9})`} />
        ))}
      </g>
    </svg>
    <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: DISPLAY, fontWeight: 800, fontSize: 190, color: TH.text, textShadow: glow(TH.a1, 1), transform: `scale(${1 + 0.05 * Math.sin(f / 5)})` }}>?</div>
  </div>
);

const Fleet: React.FC<{ p: number }> = ({ p }) => {
  const n = Math.floor(10000 * p);
  const cell = 8;
  const rows: React.ReactNode[] = [];
  for (let r = 0; r < 100; r++) {
    const filled = Math.max(0, Math.min(100, n - r * 100));
    if (filled <= 0) break;
    rows.push(<rect key={r} x={0} y={r * cell} width={filled * cell - 2} height={cell - 2} fill={r % 2 ? GOLD2 : TH.a1} />);
  }
  return (
    <svg width={800} height={800} viewBox="0 0 800 800" style={{ filter: `drop-shadow(0 0 18px ${alpha(TH.a1, 0.5)})` }}>
      <rect x={0} y={0} width={800} height={800} rx={10} fill={alpha(TH.text, 0.04)} stroke={alpha(TH.a1, 0.4)} strokeWidth={2} />
      {rows}
    </svg>
  );
};

export const CaroV3: React.FC<{ withAudio?: boolean }> = ({ withAudio = true }) => {
  const f = useCurrentFrame();
  const S = Object.fromEntries(vo.segments.map((s) => [s.id, seg(vo, s.id)]));
  const qEnd = S.reveal.f0;

  return (
    <ThemeP value={TH}>
      <Stage f={f} aurora={0.9}>
        <Particles f={f} n={40} kind="dust" color={TH.a1} seed={11} o={0.55} />

        {/* ===== GANCHO: el precio ===== */}
        {f < qEnd + 2 ? (
          <AbsoluteFill style={{ opacity: 1 - ramp(f, qEnd - 4, qEnd + 2) }}>
            <div style={{ position: "absolute", top: 225, left: 70, fontFamily: MONO, fontSize: 28, color: TH.a2, textShadow: glow(TH.a2, 0.4) }}>
              <Decode text="> SUBASTA PRIVADA · PRECIO FINAL" f={f} at={-12} cps={3} />
            </div>
            <div style={{ position: "absolute", top: 280, left: 0, width: 1080, textAlign: "center", transform: `scale(${interpolate(ramp(f, 0, 16, EASE_OUT), [0, 1], [1.12, 1]) + punch(f, S.hook.f1 - 6, 0.07)})` }}>
              <div style={{ fontFamily: UI, fontWeight: 800, fontSize: 34, letterSpacing: 8, color: alpha(TH.text, 0.7) }}>SE VENDIÓ EN</div>
              <div style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: 168, lineHeight: 1, fontVariantNumeric: "tabular-nums" }}>
                <Gold>€{fmt(135_000_000 * interpolate(ramp(f, 0, Math.max(30, S.hook.f1 - 6), EASE_OUT), [0, 1], [0.6, 1]))}</Gold>
              </div>
              <div style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: 66, color: TH.text, opacity: ramp(f, wordAt(vo, "q", ["caro"]) - 6, wordAt(vo, "q", ["caro"]) + 2) }}>
                EL AUTO MÁS CARO <Neon c={TH.a1}>DE LA HISTORIA</Neon>
              </div>
            </div>
            {f < S.q.f0 + 4 ? <Vault f={f} o={1 - ramp(f, S.q.f0 - 10, S.q.f0 - 2)} /> : null}
            <QuizGrid
              f={f}
              at={S.q.f0 - 12}
              top={640}
              H={290}
              blur={9}
              items={OPTS.map((o) => ({ label: o.label, src: FOTOS[o.foto] ?? null }))}
              hi={OPTS.map((_, i) => (f >= S.q.f1 && f < qEnd && Math.floor((f - S.q.f1) / 7) % 4 === i ? 1 : 0))}
            />
            <Countdown3 f={f} a={S.q.f1} b={qEnd} y={1300} size={140} />
          </AbsoluteFill>
        ) : null}

        {/* ===== RESPUESTA + POR QUÉ ===== */}
        {f >= qEnd - 2 && f < S.auction.f0 + 2 ? (
          <AbsoluteFill style={{ opacity: Math.min(ramp(f, qEnd - 2, qEnd + 4), 1 - ramp(f, S.auction.f0 - 4, S.auction.f0 + 2)) }}>
            <Card3D src={FOTOS.slr ?? null} f={f - qEnd + 30} x={60} y={250} w={960} h={520} enter={ramp(f, qEnd - 2, qEnd + 14, EASE_OUT)} rim={TH.a1} objectPosition="65% 55%" zoom={0.2} label="MERCEDES-BENZ 300 SLR" sub="«Uhlenhaut Coupé» · 1955">
              <div style={{ position: "absolute", top: 20, right: 20, transform: `scale(${interpolate(ramp(f, qEnd + 4, qEnd + 14, BACK_OUT), [0, 1], [0.2, 1])})` }}>
                <Chip c="#3DFF9A" solid size={30}>RESPUESTA B ✓</Chip>
              </div>
            </Card3D>
            {f < S.why.f0 + 2 ? (
              <div style={{ position: "absolute", top: 820, left: 0, width: 1080, textAlign: "center", opacity: win(f, wordAt(vo, "reveal", ["solo"]) - 4, S.why.f0 + 2, 4, 6), transform: `scale(${interpolate(ramp(f, wordAt(vo, "reveal", ["solo"]) - 4, wordAt(vo, "reveal", ["solo"]) + 10, BACK_OUT), [0, 1], [1.6, 1])})` }}>
                <div style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: 230, lineHeight: 1 }}><Gold>2</Gold></div>
                <div style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: 56, color: TH.text, letterSpacing: 4 }}>FABRICADOS EN EL MUNDO</div>
              </div>
            ) : null}
            {f >= S.why.f0 - 2 ? (
              <div style={{ position: "absolute", top: 810, left: 70, width: 940, display: "flex", flexDirection: "column", gap: 16 }}>
                {[
                  ["🏁  AUTO DE CARRERAS", "el 300 SLR dominó 1955", wordAt(vo, "why", ["carreras"])],
                  ["🔧  CONVERTIDO EN COUPÉ", "para su ingeniero jefe", wordAt(vo, "why", ["coupe", "cupe"])],
                  ["👤  RUDOLF UHLENHAUT", "lo usaba como auto de todos los días", wordAt(vo, "why", ["rudolf", "ullenhout", "ulenhaut"])],
                ].map(([t, s2, at]) => (
                  <div key={t as string} style={{ display: "flex", alignItems: "center", gap: 18, padding: "18px 24px", borderRadius: 22, background: `linear-gradient(90deg, ${alpha(TH.a1, 0.16)}, ${alpha(TH.a1, 0.03)})`, border: `2px solid ${alpha(TH.a1, 0.6)}`, boxShadow: `0 0 26px ${alpha(TH.a1, 0.2)}`, opacity: ramp(f, (at as number) - 3, (at as number) + 5), transform: `translateX(${-80 * (1 - ramp(f, (at as number) - 3, (at as number) + 10, BACK_OUT))}px)` }}>
                    <div style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: 46, color: TH.a1, textShadow: glow(TH.a1, 0.4), whiteSpace: "nowrap" }}>{t}</div>
                    <div style={{ fontFamily: UI, fontWeight: 600, fontSize: 26, color: alpha(TH.text, 0.75) }}>{s2}</div>
                  </div>
                ))}
              </div>
            ) : null}
          </AbsoluteFill>
        ) : null}

        {/* ===== SUBASTA SECRETA ===== */}
        {f >= S.auction.f0 - 4 && f < S.second.f0 + 2 ? (
          <AbsoluteFill style={{ opacity: win(f, S.auction.f0, S.second.f0, 4, 6) }}>
            <div style={{ position: "absolute", top: 250, left: 0, width: 1080, textAlign: "center", fontFamily: DISPLAY, fontWeight: 800, fontSize: 120, color: TH.text }}>
              <Decode text="SUBASTA " f={f} at={S.auction.f0 - 2} cps={1.6} caret={false} />
              <Neon c={TH.a1} k={1.2}><Decode text="SECRETA" f={f} at={S.auction.f0 + 4} cps={1.6} /></Neon>
            </div>
            {[
              ["📅  5 DE MAYO DE 2022", wordAt(vo, "auction", ["2022", "dos"])],
              ["🏛  MUSEO MERCEDES-BENZ · STUTTGART", wordAt(vo, "auction", ["museo"])],
              ["🔒  SOLO INVITADOS DE LA MARCA", wordAt(vo, "auction", ["invitados"])],
            ].map(([t, at], i) => (
              <div key={t as string} style={{ position: "absolute", top: 420 + i * 100, left: 0, width: 1080, display: "flex", justifyContent: "center", opacity: ramp(f, (at as number) - 4, (at as number) + 4), transform: `scale(${interpolate(ramp(f, (at as number) - 4, (at as number) + 8, BACK_OUT), [0, 1], [0.6, 1])})` }}>
                <Chip c={i === 2 ? TH.a2 : TH.a1} size={34}>{t}</Chip>
              </div>
            ))}
            <div style={{ position: "absolute", top: 760, left: 0, width: 1080, textAlign: "center" }}>
              <div style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: 210, lineHeight: 1 }}>
                <Gold>€{fmt(135 * interpolate(ramp(f, S.auction.f0, S.auction.f0 + 40, EASE_OUT), [0, 1], [0.5, 1]))} M</Gold>
              </div>
              <div style={{ fontFamily: UI, fontWeight: 700, fontSize: 30, color: alpha(TH.text, 0.65) }}>≈ US$ 143 millones</div>
            </div>
          </AbsoluteFill>
        ) : null}

        {/* ===== EL SEGUNDO ===== */}
        {f >= S.second.f0 - 4 && f < S.compare.f0 + 2 ? (
          <AbsoluteFill style={{ opacity: win(f, S.second.f0, S.compare.f0, 4, 6) }}>
            <div style={{ position: "absolute", top: 232, left: 0, width: 1080, textAlign: "center", fontFamily: MONO, fontSize: 30, letterSpacing: 4, color: TH.a2, textShadow: glow(TH.a2, 0.4) }}>2° MÁS CARO EN SUBASTA</div>
            <Card3D src={FOTOS.w196 ?? null} f={f - S.second.f0} x={60} y={290} w={960} h={470} enter={ramp(f, S.second.f0 - 2, S.second.f0 + 14, EASE_OUT)} rim={TH.a2} objectPosition="50% 60%" label="MERCEDES-BENZ W196 R" sub="F1 de 1954 · subastado en 2025 en el mismo museo">
              {f >= wordAt(vo, "second", ["fangio"]) - 4 ? (
                <div style={{ position: "absolute", top: 20, right: 20, transform: `scale(${interpolate(ramp(f, wordAt(vo, "second", ["fangio"]) - 4, wordAt(vo, "second", ["fangio"]) + 8, BACK_OUT), [0, 1], [0.2, 1])}) rotate(3deg)` }}>
                  <Chip c={TH.a1} solid size={34}>EL MODELO DE FANGIO</Chip>
                </div>
              ) : null}
            </Card3D>
            <Bars3
              f={f}
              top={800}
              rowH={84}
              maxW={430}
              labelW={300}
              rows={[
                { label: "1° 300 SLR · 2022", value: 143, color: TH.a1, at: S.second.f0 + 6, unit: "M US$" },
                { label: "2° W196 R · 2025", value: 53.9, color: TH.a2, at: S.second.f0 + 16, unit: "M US$", dec: 1 },
                { label: "3° 250 GTO · 2023", value: 51.7, color: TH.hot, at: wordAt(vo, "second", ["51", "millones"]) - 6, unit: "M US$", dec: 1 },
              ]}
            />
          </AbsoluteFill>
        ) : null}

        {/* ===== 10.000 AUTOS ===== */}
        {f >= S.compare.f0 - 4 && f < S.cta.f0 + 2 ? (
          <AbsoluteFill style={{ opacity: win(f, S.compare.f0, S.cta.f0, 4, 6) }}>
            <div style={{ position: "absolute", top: 230, left: 0, width: 1080, textAlign: "center" }}>
              <div style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: 170, lineHeight: 1, fontVariantNumeric: "tabular-nums" }}>
                <Gold>{fmt(10000 * ramp(f, S.compare.f0, S.cta.f0 - 8, EASE_IN_OUT))}</Gold>
              </div>
              <div style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: 64, color: TH.text }}>AUTOS NUEVOS</div>
            </div>
            <div style={{ position: "absolute", top: 470, left: 140, transform: `perspective(1400px) rotateX(${18 - 18 * ramp(f, S.compare.f0, S.cta.f0, EASE_IN_OUT)}deg)` }}>
              <Fleet p={ramp(f, S.compare.f0, S.cta.f0 - 8, EASE_IN_OUT)} />
            </div>
            <div style={{ position: "absolute", top: 1290, left: 0, width: 1080, textAlign: "center", fontFamily: UI, fontWeight: 600, fontSize: 24, color: alpha(TH.text, 0.6) }}>cada cuadrito = 1 auto de US$ 14.000 · total ≈ US$ 143 M</div>
          </AbsoluteFill>
        ) : null}

        <Flash f={f} at={-4} color={TH.a1} d={18} y={420} />
        <Flash f={f} at={qEnd} color={TH.a1} d={20} y={520} />
        <Wipe f={f} at={S.auction.f0} c1={GOLD1} c2={GOLD2} />
        <Wipe f={f} at={S.second.f0} c1={TH.a2} c2={TH.a1} />
        <Wipe f={f} at={S.compare.f0} c1={GOLD1} c2={GOLD2} />

        {f >= S.cta.f0 - 2 ? (
          <AbsoluteFill>
            <Particles f={f} n={60} kind="rise" color={TH.a1} seed={13} o={0.7} />
            <Cta3 f={f} a={S.cta.f0 + 2} size={96} title={<>CON ESE DINERO,<br /><Gold>¿QUÉ AUTO TE COMPRAS?</Gold></>} pill="Comenta tu elección 👇" />
          </AbsoluteFill>
        ) : null}

        <Captions
          vo={vo}
          f={f}
          top={1310}
          accent={TH.a1}
          pill
          fix={{ ulenhaut: "Uhlenhaut", ullenhout: "Uhlenhaut", ulenhout: "Uhlenhaut", cupe: "coupé", slr: "SLR", gto: "GTO", fangio: "Fangio", mercedes: "Mercedes", formula: "Fórmula" }}
          merges={[{ from: ["mercedes", "benz"], to: "Mercedes-Benz" }]}
          hide={(x) => x < qEnd - 2 || x >= S.cta.f0 - 4 || (x >= S.compare.f0 - 6 && x < S.cta.f0)}
        />
      </Stage>
      {withAudio ? <Audio src={staticFile("audio/v2-caro.wav")} /> : null}
    </ThemeP>
  );
};
