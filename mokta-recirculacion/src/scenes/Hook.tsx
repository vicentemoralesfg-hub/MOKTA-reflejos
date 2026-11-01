import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { COLORS, FONT_DISPLAY, FPS, TEXT, beat } from "../config";
import { Windshield } from "../components/Windshield";
import { HvacButton } from "../components/HvacButton";
import { DropIcon, FuelIcon, RecircIcon } from "../components/Icons";
import { Flash, Flip, Grade, H, Marker, Pop, SUB } from "../components/Kinetic";
import { EASE_IN_OUT, EASE_OUT, lerp, pop, ramp, shake } from "../lib/anim";

/**
 * Gancho. Fotograma 0 = portada: "EL 90% USA ESTE BOTÓN" + botón + "AL REVÉS" de cabeza, con el vidrio empañándose.
 * En el fotograma 8 "AL REVÉS" gira y queda derecho (golpe en 16). Desde el 60: el hábito y sus dos consecuencias.
 */
export const Hook: React.FC = () => {
  const f = useCurrentFrame();
  const B = {
    flip: beat("hook", "flip"),
    hit: beat("hook", "flipHit"),
    habit: beat("hook", "habit"),
    c1: beat("hook", "c1"),
    c2: beat("hook", "c2"),
  };
  const sh = shake(f, [0, B.hit, B.habit, B.c2], 14);

  // Parte A → B: el botón sube y se achica, los textos A salen hacia arriba
  const move = ramp(f, B.habit - 4, B.habit + 10, EASE_IN_OUT);
  const aOut = ramp(f, B.habit - 6, B.habit + 2, EASE_IN_OUT);
  const btnSize = lerp(430, 250, move);
  const btnTop = lerp(640, 250, move);
  const pulse = 0.85 + 0.15 * Math.sin(f / 3.2);

  // Empuje de cámara constante + golpe final hacia la siguiente escena
  const push = interpolate(f, [0, 135], [1.0, 1.06]) + ramp(f, 118, 135, (x) => x * x * x) * 0.25;

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.ink }}>
      <AbsoluteFill style={{ scale: String(push) }}>
        <Windshield id="hook" t={f / FPS + 3} fog={interpolate(f, [0, 70], [0.55, 1], { extrapolateRight: "clamp", easing: EASE_OUT })} hazeOpacity={0.55} />
        <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(3,5,9,0.72) 0%, rgba(3,5,9,0.35) 45%, rgba(3,5,9,0.7) 100%)" }} />
      </AbsoluteFill>

      <AbsoluteFill style={{ translate: `${sh.x}px ${sh.y}px`, rotate: `${sh.r}deg` }}>
        {/* --- Parte A --- */}
        <div style={{ position: "absolute", top: 222, left: 0, right: 0, opacity: 1 - aOut, translate: `0px ${-120 * aOut}px` }}>
          <div style={{ ...H, fontSize: 250, scale: String(lerp(1.1, 1, ramp(f, 0, 10))) }}>{TEXT.hookTop}</div>
          <div style={{ ...H, fontSize: 104, marginTop: 6, letterSpacing: 1 }}>{TEXT.hookMid}</div>
        </div>
        {/* flecha "este" → botón */}
        <svg
          width={200}
          height={200}
          viewBox="0 0 200 200"
          style={{ position: "absolute", left: 760, top: 572, opacity: (1 - aOut) * ramp(f, 2, 8), overflow: "visible" }}
        >
          <path
            d="M100 0 Q130 110 14 148"
            stroke={COLORS.led}
            strokeWidth={10}
            fill="none"
            strokeLinecap="round"
            strokeDasharray={260}
            strokeDashoffset={lerp(260, 0, ramp(f, 2, 12))}
          />
          <path d="M40 122 L12 149 L46 170" stroke={COLORS.led} strokeWidth={10} fill="none" strokeLinecap="round" strokeLinejoin="round" opacity={ramp(f, 10, 13)} />
        </svg>

        <div style={{ position: "absolute", top: 1130, left: 0, right: 0, display: "flex", justifyContent: "center", opacity: 1 - aOut }}>
          <Flip at={B.flip}>
            <div style={{ ...H, fontSize: 176 }}>
              <Marker at={-10} color={COLORS.red}>
                {TEXT.hookFlip}
              </Marker>
            </div>
          </Flip>
        </div>

        {/* --- Botón (persiste) --- */}
        <div style={{ position: "absolute", top: btnTop, left: (1080 - btnSize) / 2, width: btnSize }}>
          <div
            style={{
              position: "absolute",
              inset: -btnSize * 0.25,
              borderRadius: "50%",
              background: `radial-gradient(circle, ${COLORS.led}55 0%, ${COLORS.led}00 65%)`,
              opacity: pulse,
            }}
          />
          <HvacButton size={btnSize} led={1} icon={<RecircIcon size={btnSize * 0.62} stroke={6} />} />
        </div>

        {/* --- Parte B --- */}
        <div style={{ position: "absolute", top: 560, left: 60, right: 60 }}>
          <Pop at={B.habit} from={0.8}>
            <div style={{ ...SUB, fontSize: 56 }}>
              Un hábito de{" "}
              <Marker at={B.habit + 4} color={COLORS.led} textColor={COLORS.ink} rotate={-1.5}>
                2 segundos
              </Marker>{" "}
              que…
            </div>
          </Pop>
        </div>
        {[
          { at: B.c1, icon: <DropIcon size={92} stroke={8} color={COLORS.cold} />, text: TEXT.hookC1, color: COLORS.cold, top: 720 },
          { at: B.c2, icon: <FuelIcon size={92} stroke={8} color={COLORS.red} />, text: TEXT.hookC2, color: COLORS.red, top: 930 },
        ].map((c) => {
          const p = pop(f, c.at, 11, 190);
          return (
            <div
              key={c.text}
              style={{
                position: "absolute",
                top: c.top,
                left: 80,
                right: 80,
                height: 170,
                borderRadius: 34,
                background: "rgba(6,9,15,0.82)",
                border: `4px solid ${c.color}`,
                boxShadow: `0 20px 60px rgba(0,0,0,0.5), 0 0 50px ${c.color}44`,
                display: "flex",
                alignItems: "center",
                gap: 34,
                padding: "0 44px",
                opacity: Math.min(1, p * 2.5),
                translate: `${lerp(-200, 0, p)}px 0px`,
                rotate: `${lerp(-4, 0, p)}deg`,
              }}
            >
              {c.icon}
              <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 800, fontSize: 84, color: COLORS.white, textTransform: "uppercase", lineHeight: 1 }}>{c.text}</div>
            </div>
          );
        })}
      </AbsoluteFill>
      <Flash at={B.hit} max={0.35} />
      <Flash at={B.c2} max={0.2} color={COLORS.red} />
      <Grade />
    </AbsoluteFill>
  );
};
