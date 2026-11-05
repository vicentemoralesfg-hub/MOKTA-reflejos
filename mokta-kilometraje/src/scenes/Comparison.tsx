import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { COLORS, FONT_DISPLAY, FONT_UI, mk } from "../config";
import { At, SceneShell } from "../components/SceneShell";
import { CarSide } from "../components/Car";
import { Odometer } from "../components/Odometer";
import { EASE_OUT, pop, ramp } from "../lib/anim";

const Tag: React.FC<{ text: string; color?: string }> = ({ text, color = COLORS.white }) => (
  <div
    style={{
      fontFamily: FONT_DISPLAY,
      fontWeight: 800,
      fontSize: 50,
      letterSpacing: 3,
      color: COLORS.ink,
      background: color,
      padding: "4px 22px",
      borderRadius: 12,
    }}
  >
    {text}
  </div>
);

/** Mismo modelo, mismo año: dos autos idénticos. Uno con 80.000 km y otro con 200.000. ¿Cuál te llevas? */
export const Comparison: React.FC = () => {
  const f = useCurrentFrame();
  const mA = mk("cmpA", "comparacion");
  const mB = mk("cmpB", "comparacion");
  const mM = mk("cmpModelo", "comparacion");
  const mY = mk("cmpAnio", "comparacion");
  const mQ = mk("cmpCual", "comparacion");

  const arriveA = ramp(f, 0, 26, EASE_OUT);
  const arriveB = ramp(f, 6, 32, EASE_OUT);
  const odoA = interpolate(f, [mA - 4, mA + 22], [0, 80000], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: EASE_OUT });
  const odoB = interpolate(f, [mB - 4, mB + 24], [0, 200000], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: EASE_OUT });
  const spdA = f > mA - 4 && f < mA + 22 ? (80000 / 26) * 2.5 * (1 - (f - mA + 4) / 26) ** 2 : 0;
  const spdB = f > mB - 4 && f < mB + 24 ? (200000 / 28) * 2.5 * (1 - (f - mB + 4) / 28) ** 2 : 0;
  const q = pop(f, mQ, 8);
  const pick = ramp(f, mQ + 8, mQ + 20, EASE_OUT);
  const cursorY = interpolate(pick, [0, 1], [1080, 470]);
  const cursorX = interpolate(pick, [0, 1], [880, 780]);
  const tap = ramp(f, mQ + 20, mQ + 30);

  return (
    <SceneShell tint="neutral" glow={0.22}>
      {/* AUTO A */}
      <At top={235}>
        <div style={{ display: "flex", alignItems: "center", gap: 18, opacity: arriveA }}>
          <Tag text="AUTO A" color={f >= mQ + 26 ? COLORS.green : COLORS.white} />
        </div>
        <div style={{ translate: `${interpolate(arriveA, [0, 1], [-900, 0])}px 0px`, marginTop: 6 }}>
          <CarSide width={600} wheelRot={-arriveA * 900} />
        </div>
        <div style={{ marginTop: -8, opacity: ramp(f, mA - 8, mA) }}>
          <Odometer value={odoA} speed={spdA} size={0.58} tone={f > mA + 22 ? "green" : "dark"} />
        </div>
      </At>

      {/* separador: mismo modelo / mismo año */}
      <At top={668}>
        <div style={{ display: "flex", gap: 20 }}>
          {[
            { t: "MISMO MODELO", at: mM },
            { t: "MISMO AÑO", at: mY },
          ].map((c) => {
            const p = pop(f, c.at, 8);
            return (
              <div
                key={c.t}
                style={{
                  fontFamily: FONT_UI,
                  fontWeight: 700,
                  fontSize: 32,
                  letterSpacing: 4,
                  color: COLORS.accent,
                  border: `2px solid ${COLORS.accent}`,
                  borderRadius: 40,
                  padding: "10px 26px",
                  background: "rgba(127,211,255,0.08)",
                  opacity: p,
                  scale: String(interpolate(p, [0, 1], [0.5, 1])),
                }}
              >
                = {c.t}
              </div>
            );
          })}
        </div>
      </At>

      {/* AUTO B */}
      <At top={745}>
        <div style={{ opacity: arriveB }}>
          <Tag text="AUTO B" />
        </div>
        <div style={{ translate: `${interpolate(arriveB, [0, 1], [900, 0])}px 0px`, marginTop: 6 }}>
          <CarSide width={600} wheelRot={-arriveB * 900} />
        </div>
        <div style={{ marginTop: -8, opacity: ramp(f, mB - 8, mB) }}>
          <Odometer value={odoB} speed={spdB} size={0.58} tone={f > mB + 24 ? "red" : "dark"} />
        </div>
      </At>

      {/* ¿Cuál te llevas? */}
      {f >= mQ ? (
        <div
          style={{
            position: "absolute",
            right: 64,
            top: 470,
            width: 140,
            height: 140,
            borderRadius: 70,
            background: COLORS.yellow,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: FONT_DISPLAY,
            fontWeight: 800,
            fontSize: 120,
            color: COLORS.ink,
            scale: String(q * (1 + 0.05 * Math.sin(f / 3))),
            boxShadow: `0 0 60px ${COLORS.yellow}88`,
          }}
        >
          ?
        </div>
      ) : null}
      {f >= mQ + 8 ? (
        <div style={{ position: "absolute", left: cursorX - 40, top: cursorY - 40, width: 80, height: 80 }}>
          <div
            style={{
              position: "absolute",
              inset: 0,
              borderRadius: 40,
              border: `5px solid ${COLORS.white}`,
              scale: String(1 + tap * 1.6),
              opacity: tap > 0 ? 1 - tap : 0,
            }}
          />
          <div
            style={{
              position: "absolute",
              inset: 14,
              borderRadius: 26,
              background: "rgba(244,246,248,0.9)",
              boxShadow: "0 6px 20px rgba(0,0,0,0.6)",
              scale: String(1 - 0.2 * Math.sin(Math.PI * tap)),
            }}
          />
        </div>
      ) : null}
    </SceneShell>
  );
};
