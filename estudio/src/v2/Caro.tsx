import React from "react";
import { AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame } from "remotion";
import { Audio } from "@remotion/media";
import { C, DISPLAY, UI, fmt } from "../brand";
import { Captions } from "./comp/Captions";
import { BACK_OUT, Bg, CX, Countdown, Counter, Cta, EASE_IN_OUT, EASE_OUT, Options, PhotoCard, Title, Y, fadeWin, ramp } from "./comp/Ui";
import { VO, seg, total, wordAt } from "./lib/vo";
import voJson from "../vo/caro.json";
import { FOTOS } from "./fotos";

/**
 * Reel · "El auto más caro de la historia" — precio récord (€135 M, 2022) con contador, quiz de 4 opciones,
 * la historia (2 unidades, Uhlenhaut, subasta secreta), el segundo lugar (Ferrari 250 GTO, US$51,7 M) y la escala.
 */
export const CARO_VO = voJson as VO;
const vo = CARO_VO;
export const CARO_TOTAL = total(vo, 1.6);

const OPTS = [
  { label: "Ferrari 250 GTO", foto: "gto" },
  { label: "Mercedes 300 SLR", foto: "slr" },
  { label: "Bugatti La Voiture Noire", foto: "voiture_noire" },
  { label: "Rolls-Royce Boat Tail", foto: "boattail" },
];

/** 10.000 autos: grilla de 100 × 100 puntos que se llena. */
const Fleet: React.FC<{ p: number }> = ({ p }) => {
  const n = Math.floor(10000 * p);
  const cell = 7.6;
  const rows: React.ReactNode[] = [];
  for (let r = 0; r < 100; r++) {
    const filled = Math.max(0, Math.min(100, n - r * 100));
    if (filled <= 0) break;
    rows.push(<rect key={r} x={0} y={r * cell} width={filled * cell - 2} height={cell - 2} fill={C.yellow} opacity={0.9} />);
  }
  return (
    <svg width={100 * cell} height={100 * cell} viewBox={`0 0 ${100 * cell} ${100 * cell}`}>
      <rect x={0} y={0} width={100 * cell} height={100 * cell} fill="rgba(244,246,248,0.04)" />
      {rows}
    </svg>
  );
};

export const Caro: React.FC<{ withAudio?: boolean }> = ({ withAudio = true }) => {
  const f = useCurrentFrame();
  const S = Object.fromEntries(vo.segments.map((s) => [s.id, seg(vo, s.id)]));
  const qEnd = S.reveal.f0;

  return (
    <AbsoluteFill style={{ background: C.ink, overflow: "hidden" }}>
      <Bg f={f} tint="rgba(255,200,61,0.08)" />

      {/* ===== GANCHO: el precio ===== */}
      {f < qEnd ? (
        <AbsoluteFill style={{ opacity: 1 - ramp(f, qEnd - 5, qEnd) }}>
          {FOTOS.slr ? (
            <AbsoluteFill style={{ opacity: 0.35 }}>
              <Img src={staticFile(FOTOS.slr)} style={{ width: "100%", height: "100%", objectFit: "cover", filter: "blur(28px) brightness(0.5) saturate(0.4)", transform: "scale(1.2)" }} />
            </AbsoluteFill>
          ) : null}
          {/* el auto "tapado": se intuye la silueta, no el modelo; se va antes de que entren las opciones */}
          {FOTOS.slr && f < S.q.f0 + 4 ? (
            <div style={{ position: "absolute", left: 70, top: 640, width: 860, height: 500, borderRadius: 28, overflow: "hidden", border: "2px solid rgba(255,200,61,0.35)", opacity: 1 - ramp(f, S.q.f0 - 10, S.q.f0 - 2) }}>
              <Img src={staticFile(FOTOS.slr)} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "70% 50%", filter: `blur(${12 - 6 * ramp(f, 0, S.q.f0)}px) brightness(0.6) contrast(1.4) saturate(0)`, transform: `scale(${1.25 - 0.1 * ramp(f, 0, S.q.f0)})` }} />
              <AbsoluteFill style={{ display: "flex", alignItems: "center", justifyContent: "center", fontFamily: DISPLAY, fontWeight: 800, fontSize: 300, color: C.yellow, textShadow: "0 10px 60px rgba(0,0,0,0.8)", scale: String(1 + 0.04 * Math.sin(f / 5)) }}>?</AbsoluteFill>
            </div>
          ) : null}
          <div style={{ position: "absolute", top: 250, left: 50, width: CX * 2 - 100, textAlign: "center" }}>
            <div style={{ fontFamily: UI, fontWeight: 700, fontSize: 36, letterSpacing: 6, color: C.dim }}>SE VENDIÓ EN</div>
            <Counter value={135_000_000} p={interpolate(ramp(f, 0, Math.max(30, S.hook.f1 - 6), EASE_OUT), [0, 1], [0.6, 1])} size={150} prefix="€" />
            <div style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: 64, color: C.white, opacity: ramp(f, wordAt(vo, "q", ["caro"]) - 6, wordAt(vo, "q", ["caro"]) + 2) }}>EL AUTO MÁS CARO DE LA HISTORIA</div>
          </div>
          <Options
            f={f}
            at={S.q.f0 - 12}
            top={640}
            H={265}
            items={OPTS.map((o) => ({ label: o.label, src: o.foto ? FOTOS[o.foto] ?? null : null }))}
            hi={OPTS.map((_, i) => {
              // "ruleta": el resaltado recorre A→B→C→D mientras corre la cuenta regresiva
              if (f < S.q.f1 || f >= qEnd) return 0;
              const k = Math.floor((f - S.q.f1) / 7) % 4;
              return k === i ? 1 : 0;
            })}
          />
          <Countdown f={f} a={S.q.f1} b={qEnd} top={1180} />
        </AbsoluteFill>
      ) : null}

      {/* ===== LA RESPUESTA ===== */}
      {f >= qEnd - 4 && f < S.auction.f0 ? (
        <AbsoluteFill style={{ opacity: ramp(f, qEnd - 4, qEnd + 4) * (1 - ramp(f, S.auction.f0 - 6, S.auction.f0)) }}>
          <PhotoCard src={FOTOS.slr ?? null} f={f - qEnd} x={70} y={250} w={860} h={560} label="MERCEDES-BENZ 300 SLR" sub="«Uhlenhaut Coupé» · 1955" border={C.yellow} />
          <div style={{ position: "absolute", top: 270, right: 170, padding: "10px 20px", borderRadius: 16, background: C.green, color: C.ink, fontFamily: UI, fontWeight: 800, fontSize: 30, opacity: ramp(f, qEnd + 4, qEnd + 12), scale: String(interpolate(ramp(f, qEnd + 4, qEnd + 14, BACK_OUT), [0, 1], [0.6, 1])) }}>RESPUESTA B ✓</div>
          {f >= wordAt(vo, "reveal", ["solo"]) - 6 ? (
            <div style={{ position: "absolute", top: 850, left: 0, width: CX * 2, textAlign: "center", opacity: ramp(f, wordAt(vo, "reveal", ["solo"]) - 6, wordAt(vo, "reveal", ["solo"]) + 2) }}>
              <div style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: 150, color: C.yellow, lineHeight: 1 }}>2</div>
              <div style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: 56, color: C.white }}>FABRICADOS EN EL MUNDO</div>
            </div>
          ) : null}
          {f >= S.why.f0 - 4 ? (
            <AbsoluteFill style={{ background: C.ink, opacity: ramp(f, S.why.f0 - 4, S.why.f0 + 4) }}>
              <PhotoCard src={FOTOS.slr ?? null} f={f - S.why.f0 + 60} x={70} y={250} w={860} h={430} objectPosition="70% 50%" zoom={0.2} />
              <div style={{ position: "absolute", top: 720, left: 70, width: 860, display: "flex", flexDirection: "column", gap: 16 }}>
                {[
                  ["AUTO DE CARRERAS", "el 300 SLR dominó en 1955", wordAt(vo, "why", ["carreras"])],
                  ["CONVERTIDO EN COUPÉ", "para su ingeniero jefe", wordAt(vo, "why", ["coupe"])],
                  ["RUDOLF UHLENHAUT", "lo usaba como su auto de todos los días", wordAt(vo, "why", ["rudolf", "ulenhaut"])],
                ].map(([a, b, at]) => (
                  <div key={a as string} style={{ display: "flex", alignItems: "baseline", gap: 18, padding: "14px 22px", borderRadius: 18, background: "rgba(244,246,248,0.06)", border: "1px solid rgba(244,246,248,0.12)", opacity: ramp(f, (at as number) - 4, (at as number) + 4), translate: `${interpolate(ramp(f, (at as number) - 4, (at as number) + 8, EASE_OUT), [0, 1], [-40, 0])}px 0px` }}>
                    <div style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: 52, color: C.yellow, whiteSpace: "nowrap" }}>{a}</div>
                    <div style={{ fontFamily: UI, fontWeight: 600, fontSize: 28, color: C.dim }}>{b}</div>
                  </div>
                ))}
              </div>
            </AbsoluteFill>
          ) : null}
        </AbsoluteFill>
      ) : null}

      {/* ===== SUBASTA SECRETA ===== */}
      {f >= S.auction.f0 - 6 && f < S.second.f0 ? (
        <AbsoluteFill style={{ opacity: fadeWin(f, S.auction.f0, S.second.f0, 6, 4) }}>
          <Title top={260} size={100}>
            SUBASTA <Y>SECRETA</Y>
          </Title>
          {[
            ["5 DE MAYO DE 2022", wordAt(vo, "auction", ["dos", "2022"])],
            ["MUSEO MERCEDES-BENZ · STUTTGART", wordAt(vo, "auction", ["museo"])],
            ["SOLO INVITADOS DE LA MARCA", wordAt(vo, "auction", ["invitados"])],
          ].map(([t, at], i) => (
            <div key={t as string} style={{ position: "absolute", top: 440 + i * 110, left: 70, width: 860, textAlign: "center", padding: "18px 0", borderRadius: 18, background: "rgba(244,246,248,0.06)", border: "2px solid rgba(255,200,61,0.35)", fontFamily: UI, fontWeight: 800, fontSize: 36, letterSpacing: 2, color: C.white, opacity: ramp(f, (at as number) - 4, (at as number) + 4), scale: String(interpolate(ramp(f, (at as number) - 4, (at as number) + 8, BACK_OUT), [0, 1], [0.8, 1])) }}>
              {t}
            </div>
          ))}
          <div style={{ position: "absolute", top: 800, left: 0, width: CX * 2, textAlign: "center" }}>
            <Counter value={135} p={interpolate(ramp(f, S.auction.f0, S.auction.f0 + 40, EASE_OUT), [0, 1], [0.5, 1])} size={170} prefix="€" suffix=" M" />
            <div style={{ fontFamily: UI, fontWeight: 600, fontSize: 30, color: C.dim }}>≈ US$ 143 millones</div>
          </div>
        </AbsoluteFill>
      ) : null}

      {/* ===== EL SEGUNDO ===== */}
      {f >= S.second.f0 - 6 && f < S.compare.f0 ? (
        <AbsoluteFill style={{ opacity: fadeWin(f, S.second.f0, S.compare.f0, 6, 4) }}>
          <div style={{ position: "absolute", top: 250, left: 0, width: CX * 2, textAlign: "center", fontFamily: UI, fontWeight: 800, fontSize: 32, letterSpacing: 8, color: C.dim }}>SEGUNDO MÁS CARO EN SUBASTA</div>
          <PhotoCard src={FOTOS.w196 ?? null} f={f - S.second.f0} x={70} y={305} w={860} h={450} label="MERCEDES-BENZ W196 R" sub="F1 de 1954 · subastado en 2025 en el mismo museo" objectPosition="50% 60%" />
          {f >= wordAt(vo, "second", ["fangio"]) - 4 ? (
            <div style={{ position: "absolute", top: 325, right: 90, padding: "10px 18px", borderRadius: 14, background: C.yellow, color: C.ink, fontFamily: DISPLAY, fontWeight: 800, fontSize: 36, opacity: ramp(f, wordAt(vo, "second", ["fangio"]) - 4, wordAt(vo, "second", ["fangio"]) + 4), scale: String(interpolate(ramp(f, wordAt(vo, "second", ["fangio"]) - 4, wordAt(vo, "second", ["fangio"]) + 8, BACK_OUT), [0, 1], [0.6, 1])) }}>
              EL MODELO DE FANGIO
            </div>
          ) : null}
          <div style={{ position: "absolute", top: 790, left: 70, width: 860 }}>
            {[
              ["1° Mercedes 300 SLR · 2022", 143, C.yellow, S.second.f0 + 6],
              ["2° Mercedes W196 R · 2025", 53.9, C.white, S.second.f0 + 16],
              ["3° Ferrari 250 GTO · 2023", 51.7, C.red, wordAt(vo, "second", ["51", "millones"]) - 6],
            ].map(([k, v, col, at]) => {
              const p = ramp(f, at as number, (at as number) + 20, EASE_OUT);
              return (
                <div key={k as string} style={{ marginBottom: 14, opacity: Math.min(1, p * 3) }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontFamily: UI, fontWeight: 700, fontSize: 32, color: C.white }}>
                    <span>{k}</span>
                    <span style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: 48, color: col as string }}>US$ {fmt((v as number) * p, 1)} M</span>
                  </div>
                  <div style={{ height: 30, borderRadius: 15, background: "rgba(244,246,248,0.08)" }}>
                    <div style={{ height: "100%", width: `${((v as number) / 143) * 100 * p}%`, borderRadius: 15, background: col as string }} />
                  </div>
                </div>
              );
            })}
          </div>
        </AbsoluteFill>
      ) : null}

      {/* ===== 10.000 AUTOS ===== */}
      {f >= S.compare.f0 - 6 && f < S.cta.f0 ? (
        <AbsoluteFill style={{ opacity: fadeWin(f, S.compare.f0, S.cta.f0, 6, 4) }}>
          <div style={{ position: "absolute", top: 250, left: 0, width: CX * 2, textAlign: "center" }}>
            <Counter value={10000} p={ramp(f, S.compare.f0, S.cta.f0 - 8, EASE_IN_OUT)} size={150} />
            <div style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: 64, color: C.white, lineHeight: 1 }}>AUTOS NUEVOS</div>
          </div>
          <div style={{ position: "absolute", top: 470, left: 120 }}>
            <Fleet p={ramp(f, S.compare.f0, S.cta.f0 - 8, EASE_IN_OUT)} />
          </div>
          <div style={{ position: "absolute", top: 1255, left: 0, width: CX * 2, textAlign: "center", fontFamily: UI, fontWeight: 500, fontSize: 24, color: C.faint }}>cada cuadrito = 1 auto de US$ 14.000 · total ≈ US$ 143 M</div>
        </AbsoluteFill>
      ) : null}

      {f >= S.cta.f0 - 2 ? (
        <Cta
          f={f}
          a={S.cta.f0 + 4}
          title={
            <>
              CON ESE DINERO,
              <br />
              <Y>¿QUÉ AUTO TE COMPRAS?</Y>
            </>
          }
          pill="Comenta tu elección 👇"
          size={100}
        />
      ) : null}

      <Captions
        vo={vo}
        f={f}
        top={1290}
        fix={{ ulenhaut: "Uhlenhaut", ullenhout: "Uhlenhaut", ulenhout: "Uhlenhaut", cupe: "coupé", slr: "SLR", gto: "GTO", fangio: "Fangio", mercedes: "Mercedes", formula: "Fórmula" }}
        merges={[{ from: ["mercedes", "benz"], to: "Mercedes-Benz" }]}
        hide={(x) => x < qEnd - 2 || x >= S.cta.f0 - 4 || (x >= S.compare.f0 - 6 && x < S.cta.f0)}
      />
      {withAudio ? <Audio src={staticFile("audio/v2-caro.wav")} /> : null}
    </AbsoluteFill>
  );
};
