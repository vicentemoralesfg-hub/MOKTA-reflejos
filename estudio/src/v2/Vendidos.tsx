import React from "react";
import { AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame } from "remotion";
import { Audio } from "@remotion/media";
import { C, DISPLAY, UI, fmt } from "../brand";
import { Captions } from "./comp/Captions";
import { BACK_OUT, Bars, Bg, CX, Countdown, Counter, Cta, EASE_IN_OUT, EASE_OUT, Options, PhotoCard, Title, Y, fadeWin, ramp } from "./comp/Ui";
import { VO, seg, total, wordAt } from "./lib/vo";
import voJson from "../vo/vendidos.json";
import { FOTOS } from "./fotos";

/**
 * Reel · "El auto más vendido de la historia" — quiz de 4 opciones + ranking 4→1 con contador y barras +
 * ritmo de venta (uno cada 35 s) + la fila de Corollas alrededor de la Tierra.
 */
export const VEN_VO = voJson as VO;
const vo = VEN_VO;
export const VEN_TOTAL = total(vo, 1.6);

const OPTS = [
  { label: "VW Escarabajo", foto: "beetle", key: ["escarabajo"] },
  { label: "Ford Modelo T", foto: "modelt", key: ["ford", "modelo"] },
  { label: "VW Golf", foto: "golf", key: ["golf"] },
  { label: "Toyota Corolla", foto: "corolla", key: ["corolla"] },
];
const RANK = [
  { id: "p4", name: "FORD MODELO T", sub: "1908–1927", units: 15_000_000, foto: "modelt", pos: 4, plus: "≈" },
  { id: "p3", name: "VOLKSWAGEN ESCARABAJO", sub: "1938–2003", units: 21_500_000, foto: "beetle", pos: 3, plus: "+" },
  { id: "p2", name: "VOLKSWAGEN GOLF", sub: "desde 1974", units: 37_000_000, foto: "golf", pos: 2, plus: "+" },
  { id: "p1", name: "TOYOTA COROLLA", sub: "desde 1966", units: 50_000_000, foto: "corolla", pos: 1, plus: "+" },
];

export const Vendidos: React.FC<{ withAudio?: boolean }> = ({ withAudio = true }) => {
  const f = useCurrentFrame();
  const S = Object.fromEntries(vo.segments.map((s) => [s.id, seg(vo, s.id)]));
  const qEnd = S.p4.f0;
  const cur = [...RANK].reverse().find((r) => f >= S[r.id].f0 - 4);

  return (
    <AbsoluteFill style={{ background: C.ink, overflow: "hidden" }}>
      <Bg f={f} tint="rgba(127,211,255,0.08)" />

      {/* ===== GANCHO ===== */}
      {f < qEnd ? (
        <AbsoluteFill style={{ opacity: 1 - ramp(f, qEnd - 5, qEnd) }}>
          <div style={{ position: "absolute", top: 250, left: 50, width: CX * 2 - 100, textAlign: "center" }}>
            <Counter value={50_000_000} p={interpolate(ramp(f, 0, S.hook.f1 - 8, EASE_OUT), [0, 1], [0.8, 1])} size={170} prefix="+" />
            <div style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: 70, color: C.white, lineHeight: 1 }}>VENDIDOS DE UN SOLO AUTO</div>
            <div style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: 80, color: C.yellow, marginTop: 8, opacity: ramp(f, wordAt(vo, "hook", ["cual"]) - 4, wordAt(vo, "hook", ["cual"]) + 4) }}>¿CUÁL ES?</div>
          </div>
          <Options
            f={f}
            at={-20}
            top={620}
            H={265}
            items={OPTS.map((o) => ({ label: o.label, src: FOTOS[o.foto] ?? null }))}
            hi={OPTS.map((o, i) => {
              const a = wordAt(vo, "options", o.key, S.options.start + i * 1.0);
              const b = i < 3 ? wordAt(vo, "options", OPTS[i + 1].key, S.options.start + (i + 1) * 1.0) : S.options.f1 + 8;
              return Math.min(ramp(f, a - 3, a + 3), 1 - ramp(f, b - 3, b + 1));
            })}
          />
          <Countdown f={f} a={S.options.f1} b={qEnd} top={1170} />
        </AbsoluteFill>
      ) : null}

      {/* ===== RANKING ===== */}
      {cur && f < S.pace.f0 ? (
        <AbsoluteFill style={{ opacity: ramp(f, qEnd - 4, qEnd + 2) * (1 - ramp(f, S.pace.f0 - 6, S.pace.f0)) }}>
          {(() => {
            const s = S[cur.id];
            const lf = f - (s.f0 - 4);
            const top = cur.pos === 1;
            return (
              <AbsoluteFill key={cur.id}>
                <div style={{ position: "absolute", top: 250, left: 0, width: CX * 2, textAlign: "center", fontFamily: UI, fontWeight: 800, fontSize: 32, letterSpacing: 8, color: top ? C.yellow : C.dim }}>
                  {top ? "★ EL MÁS VENDIDO DE LA HISTORIA" : `PUESTO ${cur.pos}`}
                </div>
                <PhotoCard
                  src={FOTOS[cur.foto] ?? null}
                  f={lf}
                  x={70 + interpolate(ramp(lf, 0, 10, EASE_OUT), [0, 1], [80, 0])}
                  y={305}
                  w={860}
                  h={440}
                  label={cur.name}
                  sub={cur.sub}
                  border={top ? C.yellow : undefined}
                />
                <div style={{ position: "absolute", left: 90, top: 325, width: 100, height: 100, borderRadius: 22, background: top ? C.yellow : C.white, color: C.ink, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: DISPLAY, fontWeight: 800, fontSize: 76 }}>{cur.pos}</div>
                <div style={{ position: "absolute", top: 770, left: 0, width: CX * 2, textAlign: "center" }}>
                  <Counter value={cur.units} p={ramp(lf, 4, 40, EASE_IN_OUT)} size={124} prefix={cur.plus} color={top ? C.yellow : C.white} />
                  <div style={{ fontFamily: UI, fontWeight: 700, fontSize: 30, color: C.dim, marginTop: -4 }}>unidades</div>
                </div>
                {top ? (
                  <div style={{ position: "absolute", top: 260, right: 150, padding: "8px 18px", borderRadius: 14, background: C.green, color: C.ink, fontFamily: UI, fontWeight: 800, fontSize: 28, opacity: ramp(lf, 40, 50), scale: String(interpolate(ramp(lf, 40, 52, BACK_OUT), [0, 1], [0.6, 1])) }}>RESPUESTA D ✓</div>
                ) : null}
              </AbsoluteFill>
            );
          })()}
          <Bars
            f={f}
            top={960}
            rowH={60}
            maxW={480}
            rows={[...RANK].reverse().map((r) => ({ label: r.name.replace("VOLKSWAGEN", "VW").replace("TOYOTA ", ""), value: r.units / 1e6, at: S[r.id].f0 + 20, unit: "M", color: r.pos === 1 ? C.yellow : undefined }))}
          />
        </AbsoluteFill>
      ) : null}

      {/* ===== RITMO: uno cada 35 s ===== */}
      {f >= S.pace.f0 - 6 && f < S.earth.f0 ? (
        <AbsoluteFill style={{ opacity: fadeWin(f, S.pace.f0, S.earth.f0, 6, 4) }}>
          <Title top={260} size={90}>
            UN COROLLA <Y>CADA 35 s</Y>
          </Title>
          {(() => {
            const lf = f - S.pace.f0;
            const cyc = 36; // el reloj da una vuelta cada 36 fotogramas (35 s "comprimidos")
            const p = (lf % cyc) / cyc;
            const n = Math.floor(lf / cyc);
            return (
              <div style={{ position: "absolute", top: 450, left: CX - 230, width: 460, height: 460 }}>
                <svg width={460} height={460} viewBox="0 0 460 460">
                  <circle cx={230} cy={230} r={200} fill="rgba(244,246,248,0.04)" stroke="rgba(244,246,248,0.15)" strokeWidth={14} />
                  <circle cx={230} cy={230} r={200} fill="none" stroke={C.yellow} strokeWidth={14} strokeLinecap="round" strokeDasharray={2 * Math.PI * 200} strokeDashoffset={2 * Math.PI * 200 * (1 - p)} transform="rotate(-90 230 230)" />
                  <line x1={230} y1={230} x2={230 + 160 * Math.sin(p * 2 * Math.PI)} y2={230 - 160 * Math.cos(p * 2 * Math.PI)} stroke={C.white} strokeWidth={8} strokeLinecap="round" />
                </svg>
                <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                  <div style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: 110, color: C.white, marginTop: 160 }}>+{n + 1}</div>
                </div>
              </div>
            );
          })()}
          <div style={{ position: "absolute", top: 960, left: 0, width: CX * 2, textAlign: "center", fontFamily: UI, fontWeight: 600, fontSize: 32, color: C.dim }}>
            en promedio, desde 1966 · 50 millones ÷ 55 años
          </div>
        </AbsoluteFill>
      ) : null}

      {/* ===== LA TIERRA ===== */}
      {f >= S.earth.f0 - 6 && f < S.cta.f0 ? (
        <AbsoluteFill style={{ opacity: fadeWin(f, S.earth.f0, S.cta.f0, 6, 4) }}>
          {(() => {
            const lf = f - S.earth.f0;
            const loops = 5 * ramp(lf, 2, Math.max(20, S.cta.f0 - S.earth.f0 - 8));
            return (
              <>
                <div style={{ position: "absolute", top: 470, left: CX - 280, width: 560, height: 560, borderRadius: 280, overflow: "hidden", scale: String(1 + 0.04 * Math.sin(lf / 20)) }}>
                  <Img src={staticFile(FOTOS.tierra as string)} style={{ width: "100%", height: "100%", objectFit: "cover", transform: "scale(1.12)" }} />
                </div>
                <svg width={1080} height={1100} viewBox="0 0 1080 1100" style={{ position: "absolute", top: 200, left: 0 }}>
                  {Array.from({ length: 5 }).map((_, k) => {
                    const pk = Math.max(0, Math.min(1, loops - k));
                    return (
                      <ellipse key={k} cx={CX} cy={550} rx={330 + k * 22} ry={110 + k * 16} fill="none" stroke={C.yellow} strokeWidth={6} opacity={0.9 - k * 0.12} pathLength={1} strokeDasharray={1} strokeDashoffset={1 - pk} transform={`rotate(${-18 + k * 6} ${CX} 550)`} />
                    );
                  })}
                </svg>
                <div style={{ position: "absolute", top: 250, left: 0, width: CX * 2, textAlign: "center" }}>
                  <div style={{ fontFamily: UI, fontWeight: 700, fontSize: 30, letterSpacing: 5, color: C.dim }}>50 MILLONES EN FILA</div>
                  <div style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: 130, color: C.yellow, lineHeight: 1 }}>{fmt(Math.floor(loops))} {Math.floor(loops) === 1 ? "VUELTA" : "VUELTAS"}</div>
                </div>
                <div style={{ position: "absolute", top: 1060, left: 0, width: CX * 2, textAlign: "center", fontFamily: UI, fontWeight: 500, fontSize: 24, color: C.faint }}>
                  ≈ 4,3 m por auto → 215.000 km · Tierra: 40.075 km · Foto: NASA / Apolo 17
                </div>
              </>
            );
          })()}
        </AbsoluteFill>
      ) : null}

      {f >= S.cta.f0 - 2 ? (
        <AbsoluteFill>
          <Cta
            f={f}
            a={S.cta.f0 + 4}
            title={
              <>
                ¿HAS TENIDO
                <br />
                <Y>ALGUNO DE ESTOS?</Y>
              </>
            }
            pill="Cuéntanos cuál y de qué año 👇"
          />
          <div style={{ position: "absolute", top: 880, left: 70, width: 860, display: "flex", gap: 10, opacity: ramp(f, S.cta.f0 + 12, S.cta.f0 + 22) }}>
            {OPTS.map((o, i) =>
              FOTOS[o.foto] ? (
                <div key={o.label} style={{ flex: 1, height: 150, borderRadius: 16, overflow: "hidden", translate: `0px ${interpolate(ramp(f, S.cta.f0 + 12 + i * 3, S.cta.f0 + 22 + i * 3, BACK_OUT), [0, 1], [40, 0])}px` }}>
                  <Img src={staticFile(FOTOS[o.foto] as string)} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                </div>
              ) : null,
            )}
          </div>
        </AbsoluteFill>
      ) : null}

      <Captions vo={vo} f={f} top={1290} fix={{ corolla: "Corolla", golf: "Golf", tierra: "Tierra", escarabajo: "Escarabajo", modelo: "Modelo" }} hide={(x) => x < S.p4.f0 - 2 || x >= S.cta.f0 - 4} />
      {withAudio ? <Audio src={staticFile("audio/v2-vendidos.wav")} /> : null}
    </AbsoluteFill>
  );
};
