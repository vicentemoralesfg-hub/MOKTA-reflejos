import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { COLORS, FONT_DISPLAY, FONT_UI, FPS, ROUNDS, TEXT, kmhToMs, stoppingDistance } from "../config";
import { DriveView } from "../world/DriveView";
import { EASE_OUT, ramp } from "../lib/anim";

/** Fondo: la carretera sigue, atenuada (continuidad visual, sin cortes a negro). */
const Backdrop: React.FC<{ kmh: number; dim: number; offset: number }> = ({ kmh, dim, offset }) => {
  const f = useCurrentFrame();
  const v = kmhToMs(kmh);
  return (
    <>
      <DriveView s={offset + (v * f) / FPS} travelPerFrame={v / FPS} shakeT={f / FPS} shakeAmp={0.006} barrierS={null} />
      <AbsoluteFill style={{ background: `rgba(2,3,8,${dim})` }} />
    </>
  );
};

export const Reveal: React.FC = () => {
  const f = useCurrentFrame();
  const dists = ROUNDS.map((r) => stoppingDistance(r.speedKmh));
  const maxD = Math.max(...dists);
  const BAR_MAX = 600;
  const speedUp = Math.round((ROUNDS[2].speedKmh / ROUNDS[0].speedKmh - 1) * 100);
  const ratio = dists[2] / dists[0];

  return (
    <AbsoluteFill>
      <Backdrop kmh={210} dim={0.74} offset={9000} />
      <AbsoluteFill style={{ alignItems: "center", top: 300 }}>
        <div
          style={{
            fontFamily: FONT_DISPLAY,
            fontWeight: 800,
            fontSize: 104,
            color: COLORS.white,
            opacity: ramp(f, 0, 10),
            translate: `0px ${interpolate(ramp(f, 0, 12), [0, 1], [20, 0])}px`,
          }}
        >
          {TEXT.revealTop}
        </div>
        <div
          style={{
            marginTop: 10,
            fontFamily: FONT_UI,
            fontWeight: 600,
            fontSize: 42,
            color: COLORS.dim,
            opacity: ramp(f, 10, 20),
          }}
        >
          {TEXT.revealSub}
        </div>
      </AbsoluteFill>

      <div style={{ position: "absolute", top: 560, left: 90, right: 90 }}>
        {ROUNDS.map((r, i) => {
          const a = 18 + i * 12;
          const p = ramp(f, a, a + 26, EASE_OUT);
          const isMax = i === ROUNDS.length - 1;
          const c = isMax ? COLORS.red : COLORS.white;
          const w = (dists[i] / maxD) * BAR_MAX * p;
          return (
            <div key={r.id} style={{ marginBottom: 40, opacity: ramp(f, a - 4, a + 4) }}>
              <div
                style={{
                  fontFamily: FONT_DISPLAY,
                  fontWeight: 600,
                  fontSize: 40,
                  color: COLORS.dim,
                  marginBottom: 8,
                }}
              >
                {r.speedKmh} km/h
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 22 }}>
                <div
                  style={{
                    height: 30,
                    width: w,
                    borderRadius: 15,
                    background: isMax
                      ? `linear-gradient(90deg, ${COLORS.red}88, ${COLORS.red})`
                      : "linear-gradient(90deg, rgba(244,246,248,0.25), rgba(244,246,248,0.85))",
                    boxShadow: isMax ? `0 0 30px ${COLORS.red}66` : "none",
                  }}
                />
                <div
                  style={{
                    fontFamily: FONT_DISPLAY,
                    fontWeight: 800,
                    fontSize: isMax ? 84 : 66,
                    color: c,
                    whiteSpace: "nowrap",
                    lineHeight: 1,
                  }}
                >
                  {Math.round(dists[i] * p)} m
                </div>
              </div>
              {isMax ? (
                <div
                  style={{
                    marginTop: 10,
                    fontFamily: FONT_UI,
                    fontWeight: 500,
                    fontSize: 34,
                    color: COLORS.dim,
                    opacity: ramp(f, a + 26, a + 36),
                  }}
                >
                  ≈ 3 canchas de fútbol
                </div>
              ) : null}
            </div>
          );
        })}
      </div>

      <AbsoluteFill style={{ alignItems: "center", top: 1150, opacity: ramp(f, 72, 84) }}>
        <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 64, color: COLORS.white }}>
          +{speedUp}% de velocidad
        </div>
        <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 800, fontSize: 82, color: COLORS.white, lineHeight: 1.05 }}>
          = <span style={{ color: COLORS.red }}>×{ratio.toFixed(1).replace(".", ",")}</span> distancia
        </div>
      </AbsoluteFill>

      <div
        style={{
          position: "absolute",
          top: 1418,
          left: 90,
          right: 90,
          textAlign: "center",
          fontFamily: FONT_UI,
          fontWeight: 500,
          fontSize: 26,
          color: "rgba(244,246,248,0.48)",
          opacity: ramp(f, 84, 96),
        }}
      >
        {TEXT.revealFoot}
      </div>
    </AbsoluteFill>
  );
};

export const Cta: React.FC = () => {
  const f = useCurrentFrame();
  const a = ramp(f, 0, 12);
  const b = ramp(f, 18, 30);
  const c = ramp(f, 30, 42);
  return (
    <AbsoluteFill>
      <Backdrop kmh={120} dim={0.55} offset={12000} />
      <AbsoluteFill style={{ alignItems: "center", top: 470 }}>
        <div
          style={{
            fontFamily: FONT_DISPLAY,
            fontWeight: 800,
            fontSize: 140,
            lineHeight: 0.98,
            color: COLORS.white,
            textAlign: "center",
            opacity: a,
            translate: `0px ${interpolate(a, [0, 1], [24, 0])}px`,
            textShadow: "0 8px 40px rgba(0,0,0,0.6)",
          }}
        >
          {TEXT.ctaTop}
          <br />
          caíste en <span style={{ color: COLORS.red }}>rojo</span>?
        </div>
      </AbsoluteFill>
      <AbsoluteFill style={{ alignItems: "center", top: 930 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 22,
            padding: "26px 40px",
            borderRadius: 26,
            background: "rgba(244,246,248,0.94)",
            color: COLORS.ink,
            fontFamily: FONT_UI,
            fontWeight: 700,
            fontSize: 42,
            opacity: b,
            translate: `0px ${interpolate(b, [0, 1], [22, 0])}px`,
          }}
        >
          <svg width="40" height="40" viewBox="0 0 24 24">
            <path
              d="M4 5.5A2.5 2.5 0 0 1 6.5 3h11A2.5 2.5 0 0 1 20 5.5v8a2.5 2.5 0 0 1-2.5 2.5H10l-4.5 4v-4h0A1.5 1.5 0 0 1 4 14.5z"
              fill="none"
              stroke={COLORS.ink}
              strokeWidth="2.2"
              strokeLinejoin="round"
            />
          </svg>
          {TEXT.ctaComment}
        </div>
        <div
          style={{
            marginTop: 30,
            fontFamily: FONT_UI,
            fontWeight: 600,
            fontSize: 40,
            color: COLORS.white,
            opacity: c * 0.9,
            translate: `0px ${interpolate(c, [0, 1], [18, 0])}px`,
          }}
        >
          {TEXT.ctaShare}
        </div>
      </AbsoluteFill>
      <div
        style={{
          position: "absolute",
          top: 1380,
          left: 0,
          right: 0,
          textAlign: "center",
          fontFamily: FONT_DISPLAY,
          fontWeight: 700,
          fontSize: 40,
          letterSpacing: 18,
          color: "rgba(244,246,248,0.55)",
          opacity: ramp(f, 40, 54),
        }}
      >
        MOKTA
      </div>
    </AbsoluteFill>
  );
};
