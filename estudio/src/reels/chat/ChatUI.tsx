import React from "react";
import { AbsoluteFill, interpolate } from "remotion";
import { UI } from "../../brand";
import { BACK_OUT, EASE_OUT, ramp, wobble } from "../../lib/anim";
import { MSGS, Msg, T } from "./script";

/**
 * Pantalla de chat genérica (modo oscuro), 1080×1920, sin marcas reales.
 * Se dibuja en función del fotograma `f`; también se reutiliza dentro del
 * celular en la escena de revelación (con `f` congelado en el último estado).
 */

const BG = "#0D1117";
const BUBBLE_THEM = "#20262E";
const BUBBLE_ME = "#2B59C3";
const TEXT = "#E9EDEF";
const META = "rgba(233,237,239,0.55)";

const clock = (m: number) => `23:${String(14 + m).padStart(2, "0")}`;

/** Historial del día anterior: da contexto (no fuiste al matri) y llena la pantalla como un chat real. */
const HISTORY: { from: "them" | "me"; text: string; time: string }[] = [
  { from: "them", text: "¿al final no vai al matri? 😢", time: "18:02" },
  { from: "me", text: "no puedo, tengo turno 😩", time: "18:05" },
  { from: "them", text: "ya, te cuento TODO", time: "18:05" },
];

const Chip: React.FC<{ label: string }> = ({ label }) => (
  <div style={{ display: "flex", justifyContent: "center", padding: "22px 0 4px" }}>
    <div style={{ fontFamily: UI, fontSize: 30, fontWeight: 500, color: META, background: "#161B22", padding: "10px 24px", borderRadius: 16 }}>
      {label}
    </div>
  </div>
);

const Check: React.FC = () => (
  <svg width="30" height="18" viewBox="0 0 30 18" style={{ marginLeft: 6 }}>
    <path d="M1 9.5l5 5L16 3.5" fill="none" stroke="#9FD8FF" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M11 14.5L22 3.5" fill="none" stroke="#9FD8FF" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

/** Fila que crece de 0 a su altura natural (truco grid 0fr→1fr): empuja el chat hacia arriba con suavidad. */
const Grow: React.FC<{ p: number; children: React.ReactNode; clip?: boolean }> = ({ p, children, clip }) => (
  // Sin recorte: el globo nuevo "sube" desde detrás del borde inferior, como en un chat real.
  <div style={{ display: "grid", gridTemplateRows: `${p}fr`, overflow: clip ? "hidden" : "visible" }}>
    <div style={{ minHeight: 0 }}>{children}</div>
  </div>
);

const Bubble: React.FC<{ m: Msg & { time?: string }; f: number; first: boolean }> = ({ m, f, first }) => {
  const me = m.from === "me";
  const local = f - m.at;
  const pop = m.at === 0 ? 1 : ramp(local, 0, 9, BACK_OUT);
  const op = m.at === 0 ? 1 : ramp(local, 0, 4);
  return (
    <div
      style={{
        display: "flex",
        justifyContent: me ? "flex-end" : "flex-start",
        padding: `${first ? 18 : 6}px 34px 0`,
      }}
    >
      <div
        style={{
          maxWidth: 800,
          background: me ? BUBBLE_ME : BUBBLE_THEM,
          color: TEXT,
          fontFamily: UI,
          fontWeight: 500,
          fontSize: 50,
          lineHeight: 1.22,
          padding: "20px 28px 16px",
          borderRadius: 30,
          borderTopLeftRadius: !me && first ? 8 : 30,
          borderTopRightRadius: me && first ? 8 : 30,
          boxShadow: "0 2px 0 rgba(0,0,0,0.25)",
          transformOrigin: me ? "100% 100%" : "0% 100%",
          scale: String(interpolate(pop, [0, 1], [0.86, 1])),
          opacity: op,
        }}
      >
        {m.text}
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            float: "right",
            marginLeft: 22,
            marginTop: 22,
            fontSize: 26,
            fontWeight: 400,
            color: META,
          }}
        >
          {m.time ?? clock(Math.floor(m.at / 60))}
          {me ? <Check /> : null}
        </span>
      </div>
    </div>
  );
};

const Typing: React.FC<{ f: number; from: number }> = ({ f, from }) => {
  const local = f - from;
  const p = ramp(local, 0, 6, BACK_OUT);
  return (
    <div style={{ display: "flex", padding: "6px 34px 0" }}>
      <div
        style={{
          background: BUBBLE_THEM,
          borderRadius: 30,
          padding: "26px 30px",
          display: "flex",
          gap: 12,
          transformOrigin: "0% 100%",
          scale: String(interpolate(p, [0, 1], [0.7, 1])),
          opacity: ramp(local, 0, 3),
        }}
      >
        {[0, 1, 2].map((i) => {
          const ph = ((local - i * 4) % 18) / 18;
          const up = Math.max(0, Math.sin(ph * Math.PI * 2));
          return (
            <div
              key={i}
              style={{
                width: 18,
                height: 18,
                borderRadius: 9,
                background: TEXT,
                opacity: 0.45 + 0.45 * up,
                translate: `0px ${-up * 8}px`,
              }}
            />
          );
        })}
      </div>
    </div>
  );
};

export const ChatUI: React.FC<{ f: number; sheen?: boolean; shake?: number }> = ({ f, sheen = true, shake = 1 }) => {
  // Mensajes visibles + indicador de "escribiendo" activo
  const typingStarts = MSGS.filter((m) => m.typingFrom !== undefined).map((m) => [m.typingFrom as number, m.at]);
  typingStarts.push([T.finalTypingFrom, 99999]);
  const activeTyping = typingStarts.find(([a, b]) => f >= a && f < b);
  // el indicador se encoge (6 fotogramas) cuando llega el mensaje que reemplaza
  const leaving = typingStarts.find(([, b]) => f >= b && f < b + 6);
  const status = activeTyping ? "escribiendo…" : "en línea";

  // Vibración de mano/auto en movimiento (pista sutil: el celular nunca está quieto)
  const t = f / 30;
  const dy = wobble(t * 1.7, 1) * 2.6 * shake + Math.sin(t * 31) * 0.9 * shake;
  const dx = wobble(t * 1.3, 4) * 1.6 * shake;
  const rot = wobble(t * 0.9, 7) * 0.12 * shake;

  // Reflejos de luminarias que barren la pantalla (pista: vas de noche por una autopista)
  const period = 41;
  const ph = ((f + 17) % period) / period;
  const sweepX = interpolate(ph, [0, 1], [-900, 1900]);

  return (
    <AbsoluteFill style={{ background: BG, overflow: "hidden" }}>
      <AbsoluteFill style={{ translate: `${dx}px ${dy}px`, rotate: `${rot}deg`, scale: "1.02" }}>
        {/* Fondo con textura muy sutil */}
        <AbsoluteFill
          style={{
            background:
              "radial-gradient(1200px 900px at 20% 10%, rgba(255,255,255,0.035), transparent 60%), radial-gradient(900px 900px at 90% 80%, rgba(255,255,255,0.03), transparent 60%)",
          }}
        />

        {/* Cabecera */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 250,
            background: "#161B22",
            display: "flex",
            alignItems: "flex-end",
            padding: "0 34px 30px",
            gap: 24,
            boxShadow: "0 2px 12px rgba(0,0,0,0.35)",
          }}
        >
          <svg width="40" height="64" viewBox="0 0 20 32">
            <path d="M15 4L4 16l11 12" fill="none" stroke={TEXT} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <div
            style={{
              width: 104,
              height: 104,
              borderRadius: 52,
              background: "linear-gradient(135deg,#F7A8C4,#B07CF2)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: UI,
              fontWeight: 700,
              fontSize: 48,
              color: "#fff",
            }}
          >
            C
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <div style={{ fontFamily: UI, fontWeight: 600, fontSize: 50, color: TEXT }}>Cata 🫶</div>
            <div style={{ fontFamily: UI, fontWeight: 400, fontSize: 34, color: activeTyping ? "#4ADE80" : META }}>{status}</div>
          </div>
        </div>

        {/* Mensajes, anclados abajo */}
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: 250,
            bottom: 1920 - 1488,
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-end",
            overflow: "hidden",
          }}
        >
          <div style={{ flexShrink: 0 }}>
          <Chip label="AYER" />
          {HISTORY.map((h, i) => (
            <Bubble key={`h${i}`} m={{ at: 0, from: h.from, text: h.text, time: h.time }} f={f} first={i === 0 || HISTORY[i - 1].from !== h.from} />
          ))}
          <Chip label="HOY" />
          {MSGS.map((m, i) => {
            if (f < m.at) return null;
            const prev = MSGS[i - 1];
            const first = !prev || prev.from !== m.from;
            const g = m.at === 0 ? 1 : ramp(f - m.at, 0, 8, EASE_OUT);
            return (
              <Grow key={i} p={g}>
                <Bubble m={m} f={f} first={first} />
              </Grow>
            );
          })}
          {activeTyping ? (
            <Grow p={ramp(f - activeTyping[0], 0, 6)}>
              <Typing f={f} from={activeTyping[0]} />
            </Grow>
          ) : leaving ? (
            <Grow p={1 - ramp(f - leaving[1], 0, 6)} clip>
              <div style={{ opacity: 1 - ramp(f - leaving[1], 0, 3) }}>
                <Typing f={f} from={leaving[0]} />
              </div>
            </Grow>
          ) : null}
          </div>
        </div>

        {/* Barra de escritura */}
        <div
          style={{
            position: "absolute",
            left: 24,
            right: 24,
            top: 1512,
            height: 110,
            display: "flex",
            gap: 18,
            alignItems: "center",
          }}
        >
          <div
            style={{
              flex: 1,
              height: 104,
              borderRadius: 52,
              background: "#161B22",
              display: "flex",
              alignItems: "center",
              padding: "0 40px",
              fontFamily: UI,
              fontSize: 42,
              color: META,
            }}
          >
            Mensaje
          </div>
          <div style={{ width: 104, height: 104, borderRadius: 52, background: "#2B59C3", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="44" height="44" viewBox="0 0 24 24">
              <path d="M12 3a3 3 0 0 0-3 3v6a3 3 0 0 0 6 0V6a3 3 0 0 0-3-3zm-7 9a7 7 0 0 0 14 0M12 19v3" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>
        </div>
      </AbsoluteFill>

      {/* Barrido de luz (luminarias) sobre el vidrio */}
      {sheen ? (
        <AbsoluteFill
          style={{
            background: `linear-gradient(105deg, transparent ${0}px, rgba(255,186,110,0.0) 0%, rgba(255,186,110,0.075) 50%, rgba(255,186,110,0) 100%)`,
            width: 520,
            left: sweepX,
            rotate: "12deg",
            top: -300,
            height: 2600,
            mixBlendMode: "screen",
          }}
        />
      ) : null}
    </AbsoluteFill>
  );
};
