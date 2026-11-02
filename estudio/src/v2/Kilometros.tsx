import React from "react";
import { AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame } from "remotion";
import { Audio } from "@remotion/media";
import { C, DISPLAY, UI, fmt } from "../brand";
import { BACK_OUT, EASE_IN_OUT, EASE_OUT, ramp } from "../lib/anim";
import { Captions } from "./comp/Captions";
import { Odometer } from "./comp/Odometer";
import { Photo } from "./comp/Photo";
import { VO, seg, total, wordAt } from "./lib/vo";
import voJson from "../vo/km.json";
import { FOTOS } from "./fotos";

/**
 * Reel · "El auto con más kilómetros del mundo"
 * Gancho con dato directo + pregunta de marca (4 opciones, cuenta regresiva) → ranking 3-2-1 con odómetro
 * y barras a escala → la Luna (NASA) → el secreto → pregunta.
 */
export const KM_VO = voJson as VO;
const vo = KM_VO;
const CX = 500;

const CARS = [
  { id: "p3", rank: 3, name: "TOYOTA TUNDRA", year: "2007 · EE. UU.", km: 1_609_000, note: "motor y caja originales", foto: FOTOS.tundra, brand: "TOYOTA" },
  { id: "p2", rank: 2, name: "MERCEDES-BENZ 240 D", year: "1976 · taxi en Grecia", km: 4_600_000, note: "hoy en el Museo Mercedes-Benz", foto: FOTOS.mercedes, brand: "MERCEDES-BENZ" },
  { id: "p1", rank: 1, name: "VOLVO P1800", year: "1966 · Irv Gordon", km: 5_230_000, note: "récord Guinness, un solo dueño", foto: FOTOS.volvo, brand: "VOLVO" },
];
const BRANDS = ["TOYOTA", "MERCEDES-BENZ", "VOLVO", "HONDA"];
const MOON_RT = 768_800; // ida y vuelta Tierra–Luna (km, distancia media 384.400)

const Bg: React.FC = () => (
  <AbsoluteFill style={{ background: C.ink }}>
    <AbsoluteFill style={{ background: "radial-gradient(1000px 800px at 50% 35%, rgba(127,211,255,0.08), transparent 70%)" }} />
  </AbsoluteFill>
);

const Title: React.FC<{ children: React.ReactNode; top?: number; size?: number; o?: number }> = ({ children, top = 250, size = 96, o = 1 }) => (
  <div style={{ position: "absolute", top, left: 60, width: CX * 2 - 120, textAlign: "center", fontFamily: DISPLAY, fontWeight: 800, fontSize: size, lineHeight: 0.95, color: C.white, opacity: o }}>
    {children}
  </div>
);

const Y: React.FC<{ children: React.ReactNode; c?: string }> = ({ children, c = C.yellow }) => <span style={{ color: c }}>{children}</span>;

export const Kilometros: React.FC<{ withAudio?: boolean }> = ({ withAudio = true }) => {
  const f = useCurrentFrame();
  const S = Object.fromEntries(vo.segments.map((s) => [s.id, seg(vo, s.id)]));
  const qEnd = S.p3.f0; // fin de la cuenta regresiva
  const cdStart = S.q.f1;

  // ------------------------------ gancho + pregunta
  const hookOn = f < qEnd;
  const odoHook = 5_230_000 - 1800 + Math.min(1800, f * 60);

  // ------------------------------ ranking
  const cur = [...CARS].reverse().find((c) => f >= S[c.id].f0 - 4);
  const rankOn = f >= S.p3.f0 - 2 && f < S.moon.f0;

  return (
    <AbsoluteFill style={{ background: C.ink, overflow: "hidden" }}>
      <Bg />

      {/* ============ GANCHO: dato directo ============ */}
      {hookOn ? (
        <AbsoluteFill style={{ opacity: 1 - ramp(f, qEnd - 6, qEnd - 1) }}>
          <AbsoluteFill style={{ background: "radial-gradient(900px 500px at 50% 700px, rgba(255,200,61,0.10), transparent 70%)" }} />
          <Title top={250} size={100}>
            UN SOLO AUTO
            <br />
            RECORRIÓ <Y>+5 MILLONES</Y>
            <br />
            DE KILÓMETROS
          </Title>
          <div style={{ position: "absolute", top: 640, left: 0, width: CX * 2, display: "flex", justifyContent: "center", scale: String(f < S.q.f0 ? 1.05 : 0.92), transition: "none" }}>
            <Odometer value={odoHook} size={112} accent={C.yellow} />
          </div>
          {/* pregunta de marca */}
          {f >= S.q.f0 - 3 ? (
            <div style={{ position: "absolute", top: 860, left: 70, width: CX * 2 - 140, opacity: ramp(f, S.q.f0 - 3, S.q.f0 + 6) }}>
              <div style={{ textAlign: "center", fontFamily: UI, fontWeight: 700, fontSize: 40, color: C.white, marginBottom: 22 }}>¿De qué marca es?</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                {BRANDS.map((b, i) => {
                  const p = ramp(f, S.q.f0 + i * 3, S.q.f0 + 8 + i * 3, BACK_OUT);
                  return (
                    <div
                      key={b}
                      style={{
                        height: 118,
                        borderRadius: 22,
                        background: "rgba(244,246,248,0.06)",
                        border: "2px solid rgba(244,246,248,0.18)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 16,
                        fontFamily: DISPLAY,
                        fontWeight: 800,
                        fontSize: b.length > 8 ? 52 : 60,
                        color: C.white,
                        letterSpacing: 1,
                        opacity: p,
                        scale: String(interpolate(p, [0, 1], [0.85, 1])),
                      }}
                    >
                      <span style={{ fontFamily: UI, fontSize: 30, color: C.yellow }}>{"ABCD"[i]}</span>
                      {b}
                    </div>
                  );
                })}
              </div>
            </div>
          ) : null}
          {/* cuenta regresiva */}
          {f >= cdStart && f < qEnd ? (
            <div style={{ position: "absolute", top: 1170 - 30, left: CX - 60, width: 120, height: 120 }}>
              <svg width={120} height={120} viewBox="0 0 120 120" style={{ position: "absolute", inset: 0 }}>
                <circle cx={60} cy={60} r={52} fill="rgba(0,0,0,0.4)" stroke="rgba(244,246,248,0.15)" strokeWidth={8} />
                <circle cx={60} cy={60} r={52} fill="none" stroke={C.yellow} strokeWidth={8} strokeLinecap="round" strokeDasharray={2 * Math.PI * 52} strokeDashoffset={(2 * Math.PI * 52 * (f - cdStart)) / (qEnd - cdStart)} transform="rotate(-90 60 60)" />
              </svg>
              <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: DISPLAY, fontWeight: 800, fontSize: 70, color: C.white }}>
                {Math.max(1, 3 - Math.floor(((f - cdStart) / (qEnd - cdStart)) * 3))}
              </div>
            </div>
          ) : null}
        </AbsoluteFill>
      ) : null}

      {/* ============ RANKING ============ */}
      {rankOn && cur ? (
        <AbsoluteFill>
          {(() => {
            const s = S[cur.id];
            const lf = f - (s.f0 - 4);
            const inP = ramp(lf, 0, 10, EASE_OUT);
            const odo = interpolate(lf, [6, 60], [0, cur.km], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: EASE_IN_OUT });
            const winner = cur.rank === 1;
            return (
              <AbsoluteFill key={cur.id} style={{ opacity: inP }}>
                <div style={{ position: "absolute", top: 250, left: 0, width: CX * 2, textAlign: "center", fontFamily: UI, fontWeight: 800, fontSize: 32, letterSpacing: 8, color: winner ? C.yellow : C.dim }}>
                  {winner ? "★ RÉCORD MUNDIAL" : `${cur.rank === 3 ? "TERCER" : "SEGUNDO"} LUGAR`}
                </div>
                {/* foto o panel */}
                <div style={{ position: "absolute", top: 310, left: 70, width: 860, height: 540, borderRadius: 30, overflow: "hidden", background: "linear-gradient(135deg, #151922, #0B0E14)", border: `2px solid ${winner ? C.yellow : "rgba(244,246,248,0.12)"}` }}>
                  {cur.foto ? (
                    <Img src={staticFile(cur.foto)} style={{ width: "100%", height: "100%", objectFit: "cover", transform: `scale(${1.04 + 0.06 * ramp(lf, 0, 120)})` }} />
                  ) : (
                    <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: DISPLAY, fontWeight: 800, fontSize: 380, color: "rgba(244,246,248,0.06)" }}>#{cur.rank}</div>
                  )}
                  <div style={{ position: "absolute", left: 24, top: 20, width: 110, height: 110, borderRadius: 24, background: winner ? C.yellow : C.white, color: C.ink, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: DISPLAY, fontWeight: 800, fontSize: 84 }}>
                    {cur.rank}
                  </div>
                </div>
                <div style={{ position: "absolute", top: 868, left: 60, width: CX * 2 - 120, textAlign: "center" }}>
                  <div style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: 84, lineHeight: 0.95, color: C.white }}>{cur.name}</div>
                  <div style={{ fontFamily: UI, fontWeight: 600, fontSize: 34, color: C.dim, marginTop: 8 }}>{cur.year}</div>
                </div>
                <div style={{ position: "absolute", top: 1010, left: 0, width: CX * 2, display: "flex", justifyContent: "center" }}>
                  <Odometer value={odo} size={88} accent={winner ? C.yellow : C.white} />
                </div>
                <div style={{ position: "absolute", top: 1128, left: 0, width: CX * 2, textAlign: "center", fontFamily: UI, fontWeight: 700, fontSize: 32, color: winner ? C.yellow : C.white, opacity: ramp(lf, 40, 52) }}>
                  {cur.note}
                </div>
                {winner ? (
                  <div style={{ position: "absolute", top: 330, right: 170, padding: "10px 22px", borderRadius: 16, background: C.green, color: C.ink, fontFamily: UI, fontWeight: 800, fontSize: 30, opacity: ramp(lf, 70, 80), scale: String(interpolate(ramp(lf, 70, 82, BACK_OUT), [0, 1], [0.6, 1])) }}>
                    RESPUESTA C ✓
                  </div>
                ) : null}
              </AbsoluteFill>
            );
          })()}
        </AbsoluteFill>
      ) : null}

      {/* ============ LA LUNA ============ */}
      {f >= S.moon.f0 - 4 && f < S.secret.f0 ? (
        <AbsoluteFill style={{ opacity: ramp(f, S.moon.f0 - 4, S.moon.f0 + 6) }}>
          <Photo src={FOTOS.earthrise as string} f={f - S.moon.f0} dur={S.secret.f0 - S.moon.f0} dim={0.2} from={{ s: 1.04, x: 0, y: -250 }} to={{ s: 1.12, x: 0, y: -300 }} />
          <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0) 45%, rgba(0,0,0,0) 60%, rgba(0,0,0,0.7) 100%)" }} />
          <div style={{ position: "absolute", top: 250, left: 60, width: CX * 2 - 120, textAlign: "center" }}>
            <div style={{ fontFamily: UI, fontWeight: 700, fontSize: 34, color: C.dim, letterSpacing: 4 }}>5.230.000 KM ÷ IDA Y VUELTA A LA LUNA</div>
            <div style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: 230, lineHeight: 1, color: C.white, fontVariantNumeric: "tabular-nums" }}>
              ×{fmt(Math.min(5_230_000 / MOON_RT, (5_230_000 / MOON_RT) * ramp(f, S.moon.f0, S.moon.f0 + 40, EASE_IN_OUT)), 1)}
            </div>
            <div style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: 70, color: C.yellow }}>CASI 7 VIAJES A LA LUNA</div>
          </div>
          <div style={{ position: "absolute", bottom: 440, left: 0, width: CX * 2, textAlign: "center", fontFamily: UI, fontWeight: 500, fontSize: 22, color: "rgba(244,246,248,0.45)" }}>
            Foto: NASA / Apolo 8 (dominio público) · distancia media Tierra–Luna 384.400 km
          </div>
        </AbsoluteFill>
      ) : null}

      {/* ============ EL SECRETO ============ */}
      {f >= S.secret.f0 - 4 && f < S.cta.f0 ? (
        <AbsoluteFill style={{ opacity: ramp(f, S.secret.f0 - 4, S.secret.f0 + 6) }}>
          <AbsoluteFill style={{ background: "radial-gradient(900px 600px at 50% 900px, rgba(255,200,61,0.10), transparent 70%)" }} />
          <div style={{ position: "absolute", top: 860, left: 0, width: CX * 2, display: "flex", justifyContent: "center" }}>
            <Odometer digits={6} value={5000 * Math.floor(Math.max(0, f - S.secret.f0) / 7) + 5000 * ramp((Math.max(0, f - S.secret.f0) % 7), 0, 4)} size={88} />
          </div>
          <Title top={300} size={92}>
            ¿SU SECRETO?
          </Title>
          <div style={{ position: "absolute", top: 440, left: 60, width: CX * 2 - 120, textAlign: "center", fontFamily: DISPLAY, fontWeight: 800, fontSize: 130, lineHeight: 0.95, color: C.yellow, opacity: ramp(f, wordAt(vo, "secret", "cambiar"), wordAt(vo, "secret", "cambiar") + 8) }}>
            ACEITE CADA
            <br />
            ~5.000 KM
          </div>
          <div style={{ position: "absolute", top: 760, left: 60, width: CX * 2 - 120, textAlign: "center", fontFamily: UI, fontWeight: 600, fontSize: 36, color: C.white, opacity: ramp(f, wordAt(vo, "secret", "falta") - 6, wordAt(vo, "secret", "falta") + 6) }}>
            (3.000–3.500 millas) y ninguna mantención saltada
          </div>
        </AbsoluteFill>
      ) : null}

      {/* ============ PREGUNTA FINAL ============ */}
      {f >= S.cta.f0 - 4 ? (
        <AbsoluteFill style={{ opacity: ramp(f, S.cta.f0 - 4, S.cta.f0 + 6) }}>
          <Title top={340} size={120}>
            ¿CUÁNTOS KM
            <br />
            TIENE <Y>EL TUYO?</Y>
          </Title>
          <div style={{ position: "absolute", top: 640, left: 0, width: CX * 2, display: "flex", justifyContent: "center", opacity: 0.9 }}>
            <Odometer digits={6} value={Math.floor(f * 37) % 300000} size={90} />
          </div>
          <div style={{ position: "absolute", top: 820, left: CX - 300, width: 600, textAlign: "center", padding: "20px 0", borderRadius: 22, background: C.yellow, color: C.ink, fontFamily: UI, fontWeight: 800, fontSize: 40, opacity: ramp(f, S.cta.f0 + 6, S.cta.f0 + 16) }}>
            Déjalo en los comentarios 👇
          </div>
          <div style={{ position: "absolute", top: 960, left: 0, width: CX * 2, textAlign: "center", fontFamily: DISPLAY, fontWeight: 700, fontSize: 44, letterSpacing: 20, color: "rgba(244,246,248,0.6)", opacity: ramp(f, S.cta.f0 + 14, S.cta.f0 + 26) }}>
            MOKTA
          </div>
        </AbsoluteFill>
      ) : null}

      <Captions
        vo={vo}
        f={f}
        fix={{ record: "récord", p1800: "P1800", "240d": "240 D" }}
        merges={[{ from: ["un", "millón", "600.000"], to: "1.600.000" }]} hide={(x) => x >= S.cta.f0 || x < qEnd} />
      {withAudio ? <Audio src={staticFile("audio/v2-km.wav")} /> : null}
    </AbsoluteFill>
  );
};

export const KM_TOTAL = total(vo, 2.0);
