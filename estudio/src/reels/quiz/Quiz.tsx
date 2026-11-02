import React from "react";
import { AbsoluteFill, interpolate, staticFile, useCurrentFrame } from "remotion";
import { Audio } from "@remotion/media";
import { C, DISPLAY, UI } from "../../brand";
import { BACK_OUT, EASE_IN_OUT, ramp } from "../../lib/anim";
import { BEAT, END, HOOK, Q, QDUR, QUESTIONS, TOTAL, qStart } from "./data";
import { DashIcon } from "./Icons";

const CX = 500; // centro óptico (deja libre la columna de botones de Instagram)
const ANS = { MITO: C.red, VERDAD: C.green };

const Backdrop: React.FC<{ f: number; tint?: string; tintAmt?: number }> = ({ f, tint, tintAmt = 0 }) => (
  <AbsoluteFill style={{ background: C.ink }}>
    <AbsoluteFill
      style={{
        background: `radial-gradient(900px 700px at ${CX}px 560px, rgba(255,178,30,${0.08 + 0.02 * Math.sin(f / 9)}), transparent 70%)`,
      }}
    />
    {tint ? <AbsoluteFill style={{ background: `radial-gradient(1100px 900px at ${CX}px 1250px, ${tint}, transparent 70%)`, opacity: tintAmt * 0.35 }} /> : null}
    {/* retícula tenue tipo tablero */}
    <AbsoluteFill
      style={{
        backgroundImage:
          "linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)",
        backgroundSize: "60px 60px",
        maskImage: "radial-gradient(ellipse at 50% 45%, black 30%, transparent 75%)",
      }}
    />
  </AbsoluteFill>
);

const Progress: React.FC<{ idx: number; revealed: boolean; f: number }> = ({ idx, revealed, f }) => (
  <div style={{ position: "absolute", top: 250, left: 0, width: CX * 2, display: "flex", flexDirection: "column", alignItems: "center", gap: 18 }}>
    <div style={{ display: "flex", gap: 12 }}>
      {QUESTIONS.map((q, i) => {
        const done = i < idx || (i === idx && revealed);
        const cur = i === idx;
        return (
          <div
            key={i}
            style={{
              width: 92,
              height: 12,
              borderRadius: 6,
              background: done ? ANS[q.answer] : cur ? "rgba(244,246,248,0.85)" : "rgba(244,246,248,0.18)",
              opacity: cur && !revealed ? 0.6 + 0.4 * Math.abs(Math.sin(f / 10)) : 1,
            }}
          />
        );
      })}
    </div>
    <div style={{ fontFamily: UI, fontWeight: 700, fontSize: 30, letterSpacing: 6, color: C.dim }}>
      {idx + 1} DE {QUESTIONS.length}
    </div>
  </div>
);

/** Resalta la frase clave dentro de la explicación. */
const Why: React.FC<{ q: Q; p: number }> = ({ q, p }) => {
  const i = q.why.indexOf(q.key);
  const parts = i >= 0 ? [q.why.slice(0, i), q.why.slice(i, i + q.key.length), q.why.slice(i + q.key.length)] : [q.why, "", ""];
  return (
    <div
      style={{
        position: "absolute",
        top: 1338,
        left: 90,
        width: CX * 2 - 180,
        textAlign: "center",
        fontFamily: UI,
        fontWeight: 600,
        fontSize: 42,
        lineHeight: 1.3,
        color: C.white,
        opacity: p,
        translate: `0px ${interpolate(p, [0, 1], [18, 0])}px`,
      }}
    >
      {parts[0]}
      <span style={{ color: C.yellow }}>{parts[1]}</span>
      {parts[2]}
    </div>
  );
};

const Question: React.FC<{ q: Q; idx: number; f: number }> = ({ q, idx, f }) => {
  const appear = ramp(f, 0, 10, BACK_OUT);
  const claimIn = 0.3 + 0.7 * ramp(f, 0, 10);
  const cdStart = 2 * BEAT;
  const reveal = 5 * BEAT;
  const revealed = f >= reveal;
  const n = f < cdStart ? null : f < reveal ? 3 - Math.floor((f - cdStart) / BEAT) : null;
  const beatP = f >= cdStart && f < reveal ? ((f - cdStart) % BEAT) / BEAT : 0;
  const ringP = f >= cdStart && f < reveal ? (f - cdStart) / (reveal - cdStart) : 0;
  const choicesOn = ramp(f, BEAT, BEAT + 8);
  const r = ramp(f, reveal, reveal + 9, BACK_OUT);
  const rLin = ramp(f, reveal, reveal + 6);
  const why = ramp(f, reveal + 8, reveal + 18);
  const out = ramp(f, QDUR - 6, QDUR, EASE_IN_OUT);
  const color = ANS[q.answer];
  const flash = revealed ? Math.max(0, 1 - (f - reveal) / 6) : 0;

  return (
    <AbsoluteFill style={{ opacity: 1 - out, translate: `${-out * 60}px 0px` }}>
      <Backdrop f={f} tint={color} tintAmt={rLin} />
      <Progress idx={idx} revealed={revealed} f={f} />

      {/* ícono */}
      <div
        style={{
          position: "absolute",
          top: 390,
          left: CX - 150,
          width: 300,
          height: 300,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          scale: String(interpolate(appear, [0, 1], [0.6, 1])),
          opacity: 0.35 + 0.65 * ramp(f, 0, 5),
        }}
      >
        <DashIcon icon={q.icon} size={250} hl={revealed ? ramp(f, reveal + 8, reveal + 16) : 0} t={f} />
      </div>

      {/* afirmación */}
      <div
        style={{
          position: "absolute",
          top: 740,
          left: 70,
          width: CX * 2 - 140,
          height: 300,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          fontFamily: DISPLAY,
          fontWeight: 800,
          fontSize: q.claim.length > 48 ? 86 : 100,
          lineHeight: 1.0,
          textTransform: "uppercase",
          color: C.white,
          opacity: claimIn * (revealed ? interpolate(rLin, [0, 1], [1, 0.9]) : 1),
          translate: `0px ${interpolate(claimIn, [0, 1], [24, 0])}px`,
        }}
      >
        {q.claim}
      </div>

      {/* cuenta regresiva */}
      {n !== null ? (
        <div style={{ position: "absolute", top: 1068, left: CX - 70, width: 140, height: 140 }}>
          <svg width={140} height={140} viewBox="0 0 140 140" style={{ position: "absolute", inset: 0 }}>
            <circle cx={70} cy={70} r={62} fill="rgba(0,0,0,0.35)" stroke="rgba(244,246,248,0.15)" strokeWidth={8} />
            <circle
              cx={70}
              cy={70}
              r={62}
              fill="none"
              stroke={C.yellow}
              strokeWidth={8}
              strokeLinecap="round"
              strokeDasharray={2 * Math.PI * 62}
              strokeDashoffset={2 * Math.PI * 62 * ringP}
              transform="rotate(-90 70 70)"
            />
          </svg>
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: DISPLAY,
              fontWeight: 800,
              fontSize: 92,
              color: C.white,
              scale: String(interpolate(beatP, [0, 0.25, 1], [1.35, 1, 1])),
            }}
          >
            {n}
          </div>
        </div>
      ) : null}

      {/* opciones → sello */}
      {(["MITO", "VERDAD"] as const).map((opt, k) => {
        const correct = opt === q.answer;
        const baseX = k === 0 ? CX - 400 : CX + 20;
        const w = 380;
        const hidden = revealed && !correct;
        const toCenter = revealed && correct ? r : 0;
        const x = interpolate(toCenter, [0, 1], [baseX, CX - w / 2]);
        const y = interpolate(toCenter, [0, 1], [1232, 1110]);
        const sc = 1 + 0.25 * toCenter;
        return (
          <div
            key={opt}
            style={{
              position: "absolute",
              top: y,
              left: x,
              width: w,
              height: 118,
              borderRadius: 26,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 14,
              fontFamily: DISPLAY,
              fontWeight: 800,
              fontSize: 72,
              letterSpacing: 3,
              color: revealed && correct ? C.ink : ANS[opt],
              background: revealed && correct ? ANS[opt] : "rgba(7,9,13,0.6)",
              border: `5px solid ${ANS[opt]}`,
              boxShadow: revealed && correct ? `0 0 ${40 + 60 * flash}px ${ANS[opt]}aa` : "none",
              opacity: choicesOn * (hidden ? 1 - rLin : 1),
              scale: String(sc * interpolate(choicesOn, [0, 1], [0.9, 1])),
              rotate: revealed && correct ? `${-3 * toCenter}deg` : "0deg",
            }}
          >
            {opt}
            {revealed && correct ? <span style={{ fontSize: 60 }}>{opt === "MITO" ? "✗" : "✓"}</span> : null}
          </div>
        );
      })}

      {revealed ? <Why q={q} p={why} /> : null}
      <AbsoluteFill style={{ background: color, opacity: flash * 0.18, mixBlendMode: "screen" }} />
    </AbsoluteFill>
  );
};

const Hook: React.FC<{ f: number }> = ({ f }) => {
  const a = ramp(f, 0, 8, BACK_OUT);
  const b = ramp(f, 6, 16);
  const out = ramp(f, HOOK - 6, HOOK, EASE_IN_OUT);
  return (
    <AbsoluteFill style={{ opacity: 1 - out }}>
      <Backdrop f={f} />
      <AbsoluteFill style={{ alignItems: "center", top: 560, width: CX * 2 }}>
        {/* primer fotograma = portada: todo el título ya visible en f=0 */}
        <div style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: 200, lineHeight: 0.9, color: C.red, scale: String(interpolate(a, [0, 1], [1.12, 1])) }}>
          ¿MITO
        </div>
        <div style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 90, lineHeight: 1, color: C.dim }}>o</div>
        <div style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: 200, lineHeight: 0.9, color: C.green, scale: String(interpolate(ramp(f, 2, 10, BACK_OUT), [0, 1], [1.12, 1])) }}>
          VERDAD?
        </div>
        <div style={{ marginTop: 48, fontFamily: UI, fontWeight: 600, fontSize: 46, color: C.white, textAlign: "center", lineHeight: 1.3, opacity: b, translate: `0px ${interpolate(b, [0, 1], [16, 0])}px` }}>
          Si aciertas las 5,
          <br />
          sabes más que tu mecánico 🔧
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

const Score: React.FC<{ f: number }> = ({ f }) => {
  const rows = [
    { s: "5/5", t: "Sabes más que tu mecánico", c: C.green },
    { s: "3–4", t: "Nada mal. Casi.", c: C.yellow },
    { s: "0–2", t: "Guarda este video 😅", c: C.red },
  ];
  return (
    <AbsoluteFill>
      <Backdrop f={f} />
      <div style={{ position: "absolute", top: 380, width: CX * 2, textAlign: "center", fontFamily: DISPLAY, fontWeight: 800, fontSize: 130, lineHeight: 0.95, color: C.white, opacity: ramp(f, 0, 8), scale: String(interpolate(ramp(f, 0, 10, BACK_OUT), [0, 1], [1.2, 1])) }}>
        ¿CUÁNTAS
        <br />
        ACERTASTE?
      </div>
      <div style={{ position: "absolute", top: 700, left: 110, width: CX * 2 - 220 }}>
        {rows.map((r, i) => {
          const p = ramp(f, 10 + i * 6, 20 + i * 6);
          return (
            <div
              key={r.s}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 30,
                padding: "26px 34px",
                marginBottom: 20,
                borderRadius: 26,
                background: "rgba(244,246,248,0.06)",
                border: "1px solid rgba(244,246,248,0.1)",
                opacity: p,
                translate: `${interpolate(p, [0, 1], [-30, 0])}px 0px`,
              }}
            >
              <div style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: 76, color: r.c, width: 150 }}>{r.s}</div>
              <div style={{ fontFamily: UI, fontWeight: 600, fontSize: 42, color: C.white }}>{r.t}</div>
            </div>
          );
        })}
      </div>
      <div
        style={{
          position: "absolute",
          top: 1200,
          left: CX - 330,
          width: 660,
          textAlign: "center",
          padding: "24px 0",
          borderRadius: 26,
          background: C.yellow,
          color: C.ink,
          fontFamily: UI,
          fontWeight: 700,
          fontSize: 46,
          opacity: ramp(f, 34, 44),
          scale: String(interpolate(ramp(f, 34, 46, BACK_OUT), [0, 1], [0.85, 1])),
        }}
      >
        Comenta tu puntaje 👇
      </div>
      <div style={{ position: "absolute", top: 1380, width: CX * 2, textAlign: "center", fontFamily: DISPLAY, fontWeight: 700, fontSize: 44, letterSpacing: 20, color: "rgba(244,246,248,0.6)", opacity: ramp(f, 46, 60) }}>
        MOKTA
      </div>
    </AbsoluteFill>
  );
};

export const Quiz: React.FC<{ withAudio?: boolean }> = ({ withAudio = true }) => {
  const f = useCurrentFrame();
  const qi = Math.floor((f - HOOK) / QDUR);
  return (
    <AbsoluteFill style={{ background: C.ink }}>
      {f < HOOK ? <Hook f={f} /> : null}
      {f >= HOOK && qi < QUESTIONS.length ? <Question q={QUESTIONS[qi]} idx={qi} f={f - qStart(qi)} /> : null}
      {f >= TOTAL - END ? <Score f={f - (TOTAL - END)} /> : null}
      {withAudio ? <Audio src={staticFile("audio/mito-o-verdad.wav")} /> : null}
    </AbsoluteFill>
  );
};
