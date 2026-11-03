import React from "react";
import { AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame } from "remotion";
import { Audio } from "@remotion/media";
import { C, DISPLAY, UI, fmt } from "../brand";
import { Captions } from "./comp/Captions";
import { BACK_OUT, Bars, Bg, CX, Counter, Cta, EASE_IN_OUT, EASE_OUT, PhotoCard, Title, Y, fadeWin, ramp } from "./comp/Ui";
import { VO, seg, total, wordAt } from "./lib/vo";
import voJson from "../vo/potencia.json";
import { FOTOS } from "./fotos";

/**
 * Reel · "El motor más potente del mundo" — escalera de potencia que se "aleja" en cada salto:
 * tu auto (100) → Hilux (204) → F1 (~1.000) → Bugatti Chiron (1.500) → CAT 797F (~4.000) → Wärtsilä RT-flex96C (108.920).
 */
export const POT_VO = voJson as VO;
const vo = POT_VO;
export const POT_TOTAL = total(vo, 1.6);

const STEPS = [
  { id: "hilux", label: "Toyota Hilux 2.8", short: "Hilux 2.8", hp: 204, foto: "hilux", sub: "204 CV", pos: "50% 60%" },
  { id: "f1", label: "Fórmula 1", short: "Fórmula 1", hp: 1000, foto: "f1", sub: "≈ 1.000 HP (motor híbrido)", pos: "60% 62%" },
  { id: "bugatti", label: "Bugatti Chiron", short: "Bugatti", hp: 1500, foto: "chiron", sub: "1.500 CV · W16 cuádruple turbo", pos: "50% 55%" },
  { id: "cat", label: "Caterpillar 797F", short: "CAT 797F", hp: 4000, foto: "cat797", sub: "camión minero · 363 t de carga", pos: "50% 92%" },
  { id: "barco", label: "Wärtsilä RT-flex96C", short: "Wärtsilä", hp: 108920, foto: "wartsila", sub: "mueve al Emma Mærsk · 397 m de eslora", pos: "50% 40%" },
] as const;

const Dial: React.FC<{ f: number; rpm: number; label: string; color: string; x: number; per: string }> = ({ f, rpm, label, color, x, per }) => {
  // rotación visible: el motor del auto se dibuja con desenfoque; el del barco, girando lento y nítido
  const deg = ((f / 30) * (rpm / 60) * 360) % 360;
  return (
    <div style={{ position: "absolute", left: x, top: 560, width: 380, textAlign: "center" }}>
      <svg width={300} height={300} viewBox="0 0 300 300">
        <circle cx={150} cy={150} r={130} fill="rgba(244,246,248,0.04)" stroke="rgba(244,246,248,0.2)" strokeWidth={4} />
        {rpm > 600
          ? Array.from({ length: 10 }).map((_, k) => (
              <line key={k} x1={150} y1={150} x2={150 + 115 * Math.cos(((deg + k * 7) * Math.PI) / 180)} y2={150 + 115 * Math.sin(((deg + k * 7) * Math.PI) / 180)} stroke={color} strokeWidth={10} strokeLinecap="round" opacity={0.12} />
            ))
          : null}
        <line x1={150} y1={150} x2={150 + 115 * Math.cos((deg * Math.PI) / 180)} y2={150 + 115 * Math.sin((deg * Math.PI) / 180)} stroke={color} strokeWidth={12} strokeLinecap="round" />
        <circle cx={150} cy={150} r={16} fill={color} />
      </svg>
      <div style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: 76, color, lineHeight: 1 }}>{fmt(rpm)} RPM</div>
      <div style={{ fontFamily: UI, fontWeight: 600, fontSize: 30, color: C.dim }}>{label}</div>
      <div style={{ marginTop: 22, display: "inline-block", padding: "8px 18px", borderRadius: 14, border: `2px solid ${color}`, fontFamily: UI, fontWeight: 800, fontSize: 32, color }}>{per}</div>
    </div>
  );
};

export const Potencia: React.FC<{ withAudio?: boolean }> = ({ withAudio = true }) => {
  const f = useCurrentFrame();
  const S = Object.fromEntries(vo.segments.map((s) => [s.id, seg(vo, s.id)]));
  const ladderStart = S.sube.f0;
  const cur = [...STEPS].reverse().find((s) => f >= S[s.id].f0 - 4);
  const ladderOn = f >= ladderStart - 6 && f < S.size.f0;
  const bars = [
    { label: "Tu auto", value: 100, at: ladderStart, unit: "HP" },
    ...STEPS.map((s, i) => ({ label: s.short, value: s.hp, at: S[s.id].f0, unit: "HP", color: i === STEPS.length - 1 ? C.yellow : i === 3 ? C.blue : undefined })),
  ];

  return (
    <AbsoluteFill style={{ background: C.ink, overflow: "hidden" }}>
      <Bg f={f} tint="rgba(255,200,61,0.07)" />

      {/* ===== GANCHO ===== */}
      {f < ladderStart ? (
        <AbsoluteFill style={{ opacity: 1 - ramp(f, ladderStart - 6, ladderStart) }}>
          {(() => {
            const wM = wordAt(vo, "hook", ["motor"]);
            const wC = wordAt(vo, "hook", ["casi"]);
            const p = ramp(f, wM, S.hook.f1, EASE_IN_OUT); // sube desde que aparece la etiqueta (nunca se ve "0 HP")
            const shake = p > 0 && p < 1 ? Math.sin(f * 2.1) * 3 * p : 0;
            const swap = ramp(f, wM - 6, wM + 6);
            return (
              <>
                {/* fondo: un auto común → el barco que mueve el motor más potente */}
                <AbsoluteFill style={{ opacity: 1 - swap }}>
                  <Img src={staticFile(FOTOS.corolla as string)} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "42% 50%", filter: "brightness(0.32) blur(3px)", transform: `scale(${1.15 + f / 900})` }} />
                </AbsoluteFill>
                <AbsoluteFill style={{ opacity: swap }}>
                  <Img src={staticFile(FOTOS.emma as string)} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "50% 50%", filter: "brightness(0.3) blur(3px)", transform: `scale(${1.25 - 0.1 * ramp(f, wM, S.hook.f1 + 20)})` }} />
                </AbsoluteFill>
                <div style={{ position: "absolute", top: 300, left: 60, width: CX * 2 - 120, textAlign: "center", scale: String(interpolate(ramp(f, 0, 10, BACK_OUT), [0, 1], [1.15, 1])) }}>
                  <div style={{ fontFamily: UI, fontWeight: 700, fontSize: 40, letterSpacing: 8, color: C.dim }}>TU AUTO</div>
                  <div style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: 170, color: C.white, lineHeight: 1 }}>≈ 100 HP</div>
                </div>
                <div style={{ position: "absolute", top: 690, left: 40, width: CX * 2 - 80, textAlign: "center", opacity: ramp(f, wM - 4, wM + 4), translate: `${shake}px 0` }}>
                  <div style={{ fontFamily: UI, fontWeight: 700, fontSize: 38, letterSpacing: 5, color: C.dim }}>EL MOTOR MÁS POTENTE DEL MUNDO</div>
                  <div style={{ whiteSpace: "nowrap" }}><Counter value={108920} p={p} size={180} suffix=" HP" /></div>
                </div>
                {/* comparación a escala: la barra de tu auto se encoge hasta ser una línea */}
                {(() => {
                  const max = 100 + (108920 - 100) * p;
                  const wA = Math.max(4, 650 * (100 / max));
                  const wB = 650 * Math.min(1, (108920 * p) / max);
                  return (
                    <div style={{ position: "absolute", top: 1010, left: 90, width: 820 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 14, height: 70, opacity: ramp(f, 4, 12) }}>
                        <div style={{ width: 150, textAlign: "right", fontFamily: UI, fontWeight: 700, fontSize: 30, color: C.white }}>Tu auto</div>
                        <div style={{ width: wA * ramp(f, 6, 22, EASE_OUT), height: 44, background: C.white, borderRadius: 8 }} />
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 14, height: 70, opacity: ramp(f, wC - 2, wC + 6) }}>
                        <div style={{ width: 150, textAlign: "right", fontFamily: UI, fontWeight: 700, fontSize: 30, color: C.yellow }}>¿?</div>
                        <div style={{ width: wB, height: 44, background: C.yellow, borderRadius: 10, boxShadow: "0 0 40px rgba(255,200,61,0.4)" }} />
                      </div>
                      <div style={{ marginTop: 18, textAlign: "center", fontFamily: DISPLAY, fontWeight: 800, fontSize: 56, color: C.white, opacity: ramp(f, S.hook.f1 - 6, S.hook.f1 + 2) }}>
                        <Y>1.089</Y> VECES TU AUTO
                      </div>
                    </div>
                  );
                })()}
              </>
            );
          })()}
        </AbsoluteFill>
      ) : null}

      {/* ===== ESCALERA ===== */}
      {ladderOn ? (
        <AbsoluteFill style={{ opacity: ramp(f, ladderStart - 6, ladderStart + 2) * (1 - ramp(f, S.size.f0 - 6, S.size.f0)) }}>
          {f < (cur ? S[cur.id].f0 - 4 : 1e9) || !cur ? (
            <Title top={330} size={120} pop={ramp(f, ladderStart, ladderStart + 10, BACK_OUT)}>
              VAMOS <Y>SUBIENDO</Y>
            </Title>
          ) : null}
          {cur ? (
            <div key={cur.id} style={{ opacity: ramp(f, S[cur.id].f0 - 4, S[cur.id].f0 + 4) }}>
              <PhotoCard
                src={FOTOS[cur.foto] ?? null}
                f={f - S[cur.id].f0}
                x={70 + interpolate(ramp(f, S[cur.id].f0 - 4, S[cur.id].f0 + 8, EASE_OUT), [0, 1], [60, 0])}
                y={250}
                w={860}
                h={430}
                label={cur.label}
                sub={cur.sub}
                objectPosition={cur.id === "cat" ? `50% ${interpolate(ramp(f, S.cat.f0, S.cat.f1 - 10, EASE_IN_OUT), [0, 1], [8, 95])}%` : cur.pos}
                zoom={cur.id === "barco" ? 0.25 : 0.1}
                border={cur.id === "barco" ? C.yellow : undefined}
              />
              <div style={{ position: "absolute", top: 270, right: 170, padding: "10px 20px", borderRadius: 16, background: C.yellow, color: C.ink, fontFamily: DISPLAY, fontWeight: 800, fontSize: 56, scale: String(interpolate(ramp(f, S[cur.id].f0, S[cur.id].f0 + 10, BACK_OUT), [0, 1], [0.6, 1])) }}>
                {fmt(cur.hp)} HP
              </div>
            </div>
          ) : null}
          <Bars rows={bars} f={f} top={720} rowH={70} />
          {f >= S.cat.f0 && f < S.barco.f0 - 4 ? (
            <div style={{ position: "absolute", top: 1170, left: 70, width: 860, display: "flex", justifyContent: "center", gap: 16 }}>
              {[
                ["SE USA EN CHILE · CODELCO", wordAt(vo, "cat", ["codelco"])],
                ["CARGA 360 t ≈ 240 AUTOS", wordAt(vo, "cat", ["carga"])],
              ].map(([t, a]) => (
                <div key={t as string} style={{ padding: "12px 18px", borderRadius: 14, background: "rgba(127,211,255,0.12)", border: `2px solid ${C.blue}`, fontFamily: DISPLAY, fontWeight: 800, fontSize: 30, color: C.blue, whiteSpace: "nowrap", opacity: ramp(f, (a as number) - 3, (a as number) + 5), scale: String(interpolate(ramp(f, (a as number) - 3, (a as number) + 8, BACK_OUT), [0, 1], [0.6, 1])) }}>
                  {t}
                </div>
              ))}
            </div>
          ) : null}

          {f >= S.barco.f0 + 20 ? (
            <div style={{ position: "absolute", top: 1180, left: 0, width: CX * 2, textAlign: "center", fontFamily: DISPLAY, fontWeight: 800, fontSize: 52, color: C.white, opacity: ramp(f, S.barco.f0 + 20, S.barco.f0 + 30) }}>
              = <Y>1.089</Y> AUTOS DE 100 HP
            </div>
          ) : null}
        </AbsoluteFill>
      ) : null}

      {/* ===== TAMAÑO ===== */}
      {f >= S.size.f0 - 6 && f < S.rpm.f0 ? (
        <AbsoluteFill style={{ opacity: fadeWin(f, S.size.f0, S.rpm.f0, 6, 4) }}>
          <Title top={170} size={80} pop={ramp(f, S.size.f0, S.size.f0 + 10, BACK_OUT)}>
            ALTO DEL <Y>MOTOR</Y>
          </Title>
          {/* escala real: 900 px = 13,5 m → 66,7 px por metro */}
          {[1, 2, 3, 4].map((k) => (
            <div key={k} style={{ position: "absolute", left: 90, top: 1150 - k * 225, width: 820, height: 0, borderTop: "3px dashed rgba(244,246,248,0.22)", opacity: ramp(f, S.size.f0 + 8 + k * 4, S.size.f0 + 14 + k * 4) }}>
              <div style={{ position: "absolute", right: 0, top: -40, fontFamily: UI, fontWeight: 700, fontSize: 28, color: C.dim }}>piso {k}</div>
            </div>
          ))}
          <div style={{ position: "absolute", left: 90, top: 1150, width: 820, height: 4, background: "rgba(244,246,248,0.5)" }} />
          {/* persona de 1,75 m */}
          <div style={{ position: "absolute", left: 150, top: 1150 - 117, width: 90, height: 117, borderRadius: "14px 14px 0 0", background: C.white, opacity: ramp(f, S.size.f0, S.size.f0 + 8) }} />
          <div style={{ position: "absolute", left: 110, top: 1150 - 117 - 80, width: 170, textAlign: "center", fontFamily: UI, fontWeight: 800, fontSize: 30, color: C.white, lineHeight: 1.05, opacity: ramp(f, S.size.f0, S.size.f0 + 8) }}>
            TÚ
            <br />
            <span style={{ fontWeight: 600, color: C.dim }}>1,75 m</span>
          </div>
          {/* motor de 13,5 m */}
          {(() => {
            const g = ramp(f, S.size.f0 + 4, S.size.f0 + 40, EASE_OUT);
            const hpx = 900 * g;
            return (
              <>
                <div style={{ position: "absolute", left: 380, top: 1150 - hpx, width: 300, height: hpx, borderRadius: "18px 18px 0 0", background: `linear-gradient(180deg, ${C.yellow}, #C99A1E)`, boxShadow: "0 0 60px rgba(255,200,61,0.35)" }} />
                <div style={{ position: "absolute", left: 380, top: 1150 - hpx + 24, width: 300, textAlign: "center", fontFamily: DISPLAY, fontWeight: 800, fontSize: 100, color: C.ink, lineHeight: 0.9, opacity: ramp(f, S.size.f0 + 24, S.size.f0 + 34) }}>
                  {String(Math.round(13.5 * g * 10) / 10).replace(".", ",")}
                  <div style={{ fontSize: 44 }}>METROS</div>
                </div>
              </>
            );
          })()}
          {f >= wordAt(vo, "size", ["piston"]) - 4 ? (
            <div style={{ position: "absolute", top: 1170, left: 70, width: 860, textAlign: "center", fontFamily: DISPLAY, fontWeight: 800, fontSize: 56, color: C.white, opacity: ramp(f, wordAt(vo, "size", ["piston"]) - 4, wordAt(vo, "size", ["piston"]) + 4) }}>
              CADA PISTÓN: <Y>96 cm</Y> DE DIÁMETRO
            </div>
          ) : null}
        </AbsoluteFill>
      ) : null}

      {/* ===== GIRA LENTO ===== */}
      {f >= S.rpm.f0 - 6 && f < S.cta.f0 ? (
        <AbsoluteFill style={{ opacity: fadeWin(f, S.rpm.f0, S.cta.f0, 6, 4) }}>
          <Title top={300} size={92}>
            PERO GIRA <Y>LENTO</Y>
          </Title>
          <Dial f={f} rpm={3000} label="tu auto en carretera" color={C.white} x={60} per="50 por segundo" />
          <Dial f={f} rpm={102} label="el motor del barco" color={C.yellow} x={540} per="1,7 por segundo" />
        </AbsoluteFill>
      ) : null}

      {f >= S.cta.f0 - 2 ? (
        <Cta
          f={f}
          a={S.cta.f0 + 4}
          title={
            <>
              ¿QUÉ MOTOR
              <br />
              <Y>COMPARAMOS AHORA?</Y>
            </>
          }
          pill="Comenta tu propuesta 👇"
        />
      ) : null}

      <Captions vo={vo} f={f} top={1290} fix={{ vartsila: "Wärtsilä", varsila: "Wärtsilä", codelco: "Codelco", rey: "rey" }} hide={(x) => x < ladderStart - 2 || x >= S.cta.f0 - 4} />
      {withAudio ? <Audio src={staticFile("audio/v2-potencia.wav")} /> : null}
    </AbsoluteFill>
  );
};
