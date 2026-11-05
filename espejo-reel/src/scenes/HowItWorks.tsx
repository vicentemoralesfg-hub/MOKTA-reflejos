import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { COLORS, FONT_DISPLAY, FONT_UI } from "../config";
import { wf, we } from "../timeline";
import { BACK, EASE_IN_OUT, EASE_OUT, mix, ramp } from "../lib/anim";
import { GEO, THETA_DAY, THETA_NIGHT, THICK_TOP, Vec, clipRay, toWorld, trace } from "../lib/optics";

/**
 * ¿Cómo funciona? Corte lateral del espejo prismático con trazado de rayos real.
 * Secuencia (anclada a la locución):
 *  título → cuña de vidrio → reflejo plateado a tus ojos (encandila) →
 *  la palanca gira el espejo → ese reflejo se va al techo → solo llega el del vidrio (4 %).
 */

const P = (p: Vec) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`;

const along = (pts: Vec[], s: number): Vec => {
  const seg = pts.slice(1).map((p, i) => Math.hypot(p.x - pts[i].x, p.y - pts[i].y));
  const total = seg.reduce((a, b) => a + b, 0);
  let d = s * total;
  for (let i = 0; i < seg.length; i++) {
    if (d <= seg[i] || i === seg.length - 1) {
      const k = seg[i] > 0 ? Math.min(1, d / seg[i]) : 0;
      return { x: pts[i].x + (pts[i + 1].x - pts[i].x) * k, y: pts[i].y + (pts[i + 1].y - pts[i].y) * k };
    }
    d -= seg[i];
  }
  return pts[pts.length - 1];
};

const Beam: React.FC<{ pts: Vec[]; width: number; color: string; opacity: number; draw?: number; glow?: number; flow?: number; f?: number }> = ({
  pts,
  width,
  color,
  opacity,
  draw = 1,
  glow = 1,
  flow = 0,
  f = 0,
}) => {
  if (opacity <= 0 || draw <= 0) return null;
  const d = `M ${pts.map(P).join(" L ")}`;
  const len = pts.slice(1).reduce((a, p, i) => a + Math.hypot(p.x - pts[i].x, p.y - pts[i].y), 0);
  const nDots = flow > 0 ? Math.max(2, Math.round(len / 110)) : 0;
  return (
    <g opacity={opacity}>
      {glow > 0 ? (
        <path d={d} fill="none" stroke={color} strokeWidth={width * 3.2} strokeOpacity={0.18 * glow} strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - draw} />
      ) : null}
      <path d={d} fill="none" stroke={color} strokeWidth={width} strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - draw} />
      <path d={d} fill="none" stroke="#ffffff" strokeWidth={Math.max(1, width * 0.35)} strokeOpacity={0.85} strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - draw} />
      {Array.from({ length: nDots }, (_, i) => {
        const s = ((i + (f * 7) / len) / nDots) % 1;
        if (s > draw) return null;
        const p = along(pts, s);
        return <circle key={i} cx={p.x} cy={p.y} r={width * 0.55 + 2} fill="#ffffff" opacity={flow * Math.sin(s * Math.PI) ** 0.3} />;
      })}
    </g>
  );
};

const Label: React.FC<{ x: number; y: number; text: string; color?: string; p: number; size?: number; anchor?: "left" | "center" | "right" }> = ({
  x,
  y,
  text,
  color = COLORS.white,
  p,
  size = 46,
  anchor = "center",
}) =>
  p <= 0 ? null : (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        translate: `${anchor === "center" ? "-50%" : anchor === "right" ? "-100%" : "0"} -50%`,
        scale: String(interpolate(p, [0, 1], [0.7, 1])),
        opacity: Math.min(1, p * 2),
        fontFamily: FONT_DISPLAY,
        fontWeight: 800,
        fontSize: size,
        letterSpacing: 2,
        color,
        whiteSpace: "nowrap",
        textShadow: "0 0 18px rgba(0,0,0,0.9), 0 3px 0 rgba(0,0,0,0.8)",
      }}
    >
      {text}
    </div>
  );

/** Ojo del conductor (mira hacia la izquierda, al espejo). */
const Eye: React.FC<{ glare: number; f: number }> = ({ glare, f }) => {
  const { x, y } = GEO.eye;
  const squint = 0.15 + 0.55 * glare * (0.9 + 0.1 * Math.sin(f * 0.9));
  const lid = 34 * (1 - squint);
  return (
    <g>
      {glare > 0.02 ? (
        <g opacity={glare}>
          <circle cx={x - 6} cy={y} r={140} fill="url(#eyeGlow)" />
          {Array.from({ length: 10 }, (_, i) => {
            const a = (i / 10) * Math.PI * 2 + f * 0.02;
            return (
              <line
                key={i}
                x1={x - 6 + Math.cos(a) * 70}
                y1={y + Math.sin(a) * 70}
                x2={x - 6 + Math.cos(a) * (110 + 20 * Math.sin(f * 0.5 + i))}
                y2={y + Math.sin(a) * (110 + 20 * Math.sin(f * 0.5 + i))}
                stroke={COLORS.yellow}
                strokeWidth={6}
                strokeLinecap="round"
              />
            );
          })}
        </g>
      ) : null}
      <path d={`M ${x - 62},${y} Q ${x},${y - lid * 1.9} ${x + 58},${y} Q ${x},${y + lid * 1.9} ${x - 62},${y} Z`} fill="#f4f6f8" />
      <clipPath id="eyeClip">
        <path d={`M ${x - 62},${y} Q ${x},${y - lid * 1.9} ${x + 58},${y} Q ${x},${y + lid * 1.9} ${x - 62},${y} Z`} />
      </clipPath>
      <g clipPath="url(#eyeClip)">
        <circle cx={x - 18} cy={y} r={27} fill="#3d7bd9" />
        <circle cx={x - 18} cy={y} r={12 - 5 * glare} fill="#05070b" />
        <circle cx={x - 26} cy={y - 9} r={5} fill="#fff" />
      </g>
      <path d={`M ${x - 62},${y} Q ${x},${y - lid * 1.9} ${x + 58},${y}`} fill="none" stroke="#05070b" strokeWidth={6} />
      <path d={`M ${x - 62},${y} Q ${x},${y - 58} ${x + 58},${y - 6}`} fill="none" stroke="#9aa6b8" strokeWidth={4} opacity={0.5} />
    </g>
  );
};

export const HowItWorks: React.FC<{ from: number }> = ({ from }) => {
  const f = useCurrentFrame() + from;

  // ----------------------------------------------------------- tiempos
  const tTitle = wf(68);
  const tWedge = wf(70);
  const tZoomOut = wf(77);
  const tBeam = wf(80);
  const tSilver = wf(83);
  const tBright = wf(87);
  const tPull = wf(90);
  const tRot0 = wf(94);
  const tRot1 = we(96);
  const tRoof = wf(98);
  const tGlass = wf(103);
  const tGlassWord = wf(108);
  const t4 = wf(111);

  // ----------------------------------------------------------- estado del espejo
  const intro = ramp(f, tZoomOut, tZoomOut + 22, EASE_IN_OUT);
  const rot = ramp(f, tRot0, tRot1, EASE_IN_OUT);
  const th = mix(mix(0, THETA_DAY, intro), THETA_NIGHT, rot);
  const tr = trace(th);

  // cámara: primero encuadre de la cuña, luego plano general
  const wedgeCenter = toWorld({ x: GEO.backX + THICK_TOP / 2, y: 0 }, 0);
  const camS = mix(2.05, 1, intro);
  const camX = mix(540 - wedgeCenter.x * 2.05, 0, intro);
  const camY = mix(760 - wedgeCenter.y * 2.05, 0, intro);

  const title = ramp(f, tTitle - 2, tTitle + 6, BACK) * (1 - ramp(f, tWedge - 4, tWedge + 2));
  const dia = ramp(f, tWedge - 4, tWedge + 8);
  const world = ramp(f, tZoomOut + 4, tZoomOut + 20);

  // ----------------------------------------------------------- rayos
  const drawIn = ramp(f, tBeam, tBeam + 10, EASE_OUT);
  const drawOut = ramp(f, tBeam + 8, tBeam + 18, EASE_OUT);
  const silverEnd = clipRay(tr.r, tr.silverDir, { stopAtEye: rot < 0.5 }).end;
  const frontClip = clipRay(tr.hit, tr.frontDir, { stopAtEye: rot > 0.5 });
  const roofHit = rot > 0.85 ? clipRay(tr.r, tr.silverDir).end : null;
  const eyeGlare = ramp(f, tBeam + 16, tBeam + 22) * (1 - ramp(f, tRot0 + 4, tRot0 + 16));
  const brightPulse = ramp(f, tBright, tBright + 4) * (1 - ramp(f, tPull, tPull + 8));
  const frontHi = ramp(f, tGlass, tGlass + 8);

  const silverLabel = ramp(f, tSilver, tSilver + 8, BACK);
  const glassLabel = ramp(f, tGlassWord, tGlassWord + 8, BACK);
  const roofLabel = ramp(f, tRoof + 10, tRoof + 18, BACK);
  const pct = ramp(f, t4 - 2, t4 + 14, EASE_OUT);
  const pctVal = Math.round(mix(100, 4, pct));

  const tabArrow = ramp(f, tPull, tPull + 6) * (1 - ramp(f, tRot1 + 2, tRot1 + 10));

  const { b0, b1, f0, f1 } = tr.corners;
  const lip = (a: Vec, b: Vec, c: Vec, d: Vec) => `M ${P(a)} L ${P(b)} L ${P(c)} L ${P(d)} Z`;
  const H = GEO.halfH;
  const bx = GEO.backX;

  return (
    <AbsoluteFill style={{ background: "radial-gradient(120% 80% at 40% 40%, #0b1426 0%, #050912 60%, #020408 100%)" }}>
      {/* rejilla de plano */}
      <AbsoluteFill
        style={{
          opacity: 0.5 * dia,
          backgroundImage:
            "linear-gradient(rgba(127,211,255,0.07) 1.5px, transparent 1.5px), linear-gradient(90deg, rgba(127,211,255,0.07) 1.5px, transparent 1.5px)",
          backgroundSize: "60px 60px",
        }}
      />
      <AbsoluteFill style={{ transform: `translate(${camX}px, ${camY}px) scale(${camS})`, transformOrigin: "0 0", opacity: dia }}>
        <svg width={1080} height={1920} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
          <defs>
            <linearGradient id="silver" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#f4f7fb" />
              <stop offset="0.3" stopColor="#9aa7b8" />
              <stop offset="0.55" stopColor="#eef2f7" />
              <stop offset="1" stopColor="#7d8899" />
            </linearGradient>
            <radialGradient id="eyeGlow">
              <stop offset="0" stopColor="#fff6dc" stopOpacity="0.9" />
              <stop offset="0.5" stopColor="#ffd23d" stopOpacity="0.25" />
              <stop offset="1" stopColor="#ffd23d" stopOpacity="0" />
            </radialGradient>
            <radialGradient id="roofGlow">
              <stop offset="0" stopColor="#fffbe8" stopOpacity="1" />
              <stop offset="0.35" stopColor="#ffd23d" stopOpacity="0.45" />
              <stop offset="1" stopColor="#ffd23d" stopOpacity="0" />
            </radialGradient>
            <linearGradient id="carNose" x1="1" y1="0" x2="0" y2="0">
              <stop offset="0" stopColor="#1a1f29" />
              <stop offset="1" stopColor="#0d1118" />
            </linearGradient>
          </defs>

          {/* habitáculo (corte) */}
          <g opacity={world}>
            <path d={`M 0,380 H 1080 V ${GEO.roofY} H 0 Z`} fill="#141b2a" />
            <line x1={0} y1={GEO.roofY} x2={1080} y2={GEO.roofY} stroke="#5d6b85" strokeWidth={4} />
            <text x={60} y={428} fill="#7f8ba3" fontFamily={FONT_UI} fontWeight={700} fontSize={28} letterSpacing={6}>
              TECHO
            </text>
            {/* parabrisas */}
            <path d={`M 175,${GEO.roofY} L -40,980`} stroke="#7fd3ff" strokeOpacity={0.35} strokeWidth={10} />
            <text x={40} y={1010} fill="#5c7aa0" fontFamily={FONT_UI} fontWeight={600} fontSize={24} letterSpacing={4} transform="rotate(-68 40 1010)">
              PARABRISAS
            </text>
            {/* auto de atrás (asoma por la derecha) */}
            <g>
              <path d="M 1020,700 Q 1040,690 1080,688 L 1120,688 L 1120,800 L 1012,800 Q 1000,760 1020,700 Z" fill="url(#carNose)" stroke="#2a3344" strokeWidth={3} />
              <circle cx={1030} cy={738} r={16} fill="#fff8e6" />
              <circle cx={1030} cy={738} r={60} fill="url(#roofGlow)" opacity={0.7} />
            </g>
            <text x={1040} y={640} textAnchor="end" fill="#aeb9cc" fontFamily={FONT_UI} fontWeight={700} fontSize={28} letterSpacing={4}>
              AUTO DE ATRÁS
            </text>
            <Eye glare={Math.max(eyeGlare, 0.0) * (0.75 + 0.25 * brightPulse)} f={f} />
            <text x={GEO.eye.x} y={GEO.eye.y + 92} textAnchor="middle" fill="#aeb9cc" fontFamily={FONT_UI} fontWeight={700} fontSize={28} letterSpacing={4}>
              TUS OJOS
            </text>
          </g>

          {/* brazo de montaje */}
          <path d={`M 196,${GEO.roofY} L ${GEO.pivot.x - 6},${GEO.pivot.y - 12}`} stroke="#2a3140" strokeWidth={26} strokeLinecap="round" opacity={world} />
          <circle cx={GEO.pivot.x} cy={GEO.pivot.y} r={18} fill="#2a3140" stroke="#4a5568" strokeWidth={3} opacity={world} />

          {/* rayos (detrás del vidrio) */}
          <Beam pts={[GEO.source, tr.hit]} width={11} color="#dfeaff" opacity={1} draw={drawIn} flow={1} f={f} />
          <Beam pts={[tr.hit, tr.q, tr.r]} width={9} color="#fff3c8" opacity={drawOut > 0 ? 1 : 0} draw={drawOut} glow={0.5} />
          <Beam
            pts={[tr.r, silverEnd]}
            width={mix(14, 13, rot) * (1 + 0.15 * brightPulse)}
            color="#ffd23d"
            opacity={1}
            draw={drawOut}
            flow={1}
            f={f}
          />
          <Beam pts={[tr.hit, frontClip.end]} width={mix(3.5, 5, frontHi)} color={frontHi > 0 ? COLORS.green : "#9fb3cc"} opacity={mix(0.45, 1, frontHi)} draw={drawOut} glow={frontHi} flow={frontHi} f={f} />
          {roofHit ? <circle cx={roofHit.x} cy={GEO.roofY} r={90} fill="url(#roofGlow)" opacity={ramp(f, tRoof, tRoof + 8)} /> : null}

          {/* espejo (corte): carcasa, cuña de vidrio, capa plateada, palanca */}
          <g>
            <path
              d={lip(toWorld({ x: 2, y: -H - 20 }, th), toWorld({ x: bx + THICK_TOP + 10, y: -H - 20 }, th), toWorld({ x: bx + THICK_TOP + 10, y: -H }, th), toWorld({ x: 2, y: -H }, th))}
              fill="#1d232e"
              stroke="#4a5568"
              strokeWidth={3}
            />
            <path
              d={lip(toWorld({ x: 2, y: H }, th), toWorld({ x: bx + GEO.thinBottom + 10, y: H }, th), toWorld({ x: bx + GEO.thinBottom + 10, y: H + 20 }, th), toWorld({ x: 2, y: H + 20 }, th))}
              fill="#1d232e"
              stroke="#4a5568"
              strokeWidth={3}
            />
            <path
              d={lip(toWorld({ x: 2, y: -H }, th), toWorld({ x: bx - 6, y: -H }, th), toWorld({ x: bx - 6, y: H }, th), toWorld({ x: 2, y: H }, th))}
              fill="#161b24"
              stroke="#4a5568"
              strokeWidth={3}
            />
            {/* palanca */}
            <path
              d={lip(
                toWorld({ x: bx + GEO.thinBottom - 14, y: H + 18 }, th),
                toWorld({ x: bx + GEO.thinBottom + 30, y: H + 18 }, th),
                toWorld({ x: bx + GEO.thinBottom + 56, y: H + 64 }, th),
                toWorld({ x: bx + GEO.thinBottom + 20, y: H + 64 }, th),
              )}
              fill={tabArrow > 0 ? COLORS.yellow : "#2a3140"}
              stroke="#5a6578"
              strokeWidth={3}
            />
            {/* vidrio */}
            <path d={`M ${P(b1)} L ${P(f1)} L ${P(f0)} L ${P(b0)} Z`} fill="rgba(150,215,255,0.22)" stroke="#bfe6ff" strokeWidth={3} />
            {/* capa plateada */}
            <line x1={b1.x} y1={b1.y} x2={b0.x} y2={b0.y} stroke="url(#silver)" strokeWidth={10} strokeLinecap="round" />
            {silverLabel > 0 ? (
              <line x1={b1.x} y1={b1.y} x2={b0.x} y2={b0.y} stroke="#ffffff" strokeWidth={18} strokeOpacity={0.35 * silverLabel * (0.6 + 0.4 * Math.sin(f * 0.4))} strokeLinecap="round" />
            ) : null}
            {glassLabel > 0 ? (
              <line x1={f1.x} y1={f1.y} x2={f0.x} y2={f0.y} stroke={COLORS.green} strokeWidth={8} strokeOpacity={glassLabel * (0.6 + 0.4 * Math.sin(f * 0.4))} strokeLinecap="round" />
            ) : null}
          </g>

        </svg>

      </AbsoluteFill>

      {/* rótulos en coordenadas de pantalla */}
      <Label x={540} y={1150} text="CUÑA DE VIDRIO" color={COLORS.accent} p={ramp(f, tWedge + 4, tWedge + 12, BACK) * (1 - ramp(f, tZoomOut, tZoomOut + 8))} size={84} />
      <Label x={70} y={1150} anchor="left" text="CAPA PLATEADA" color="#E6ECF4" p={silverLabel * (1 - glassLabel)} size={50} />
      {silverLabel * (1 - glassLabel) > 0 ? (
        <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
          <path
            d={`M 170,1118 L ${b0.x * 0.7 + b1.x * 0.3},${b0.y * 0.7 + b1.y * 0.3}`}
            stroke="#E6ECF4"
            strokeWidth={4}
            strokeDasharray="10 8"
            opacity={silverLabel * (1 - glassLabel)}
          />
        </svg>
      ) : null}
      <Label x={GEO.eye.x} y={GEO.eye.y - 150} text="¡ENCANDILA!" color={COLORS.yellow} p={ramp(f, tBright, tBright + 6, BACK) * (1 - ramp(f, tPull, tPull + 6))} size={60} />
      <Label x={70} y={1150} anchor="left" text="VIDRIO FRONTAL" color={COLORS.green} p={glassLabel} size={50} />
      {glassLabel > 0 ? (
        <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
          <path d={`M 190,1118 L ${f0.x * 0.7 + f1.x * 0.3},${f0.y * 0.7 + f1.y * 0.3}`} stroke={COLORS.green} strokeWidth={4} strokeDasharray="10 8" opacity={glassLabel} />
        </svg>
      ) : null}
      {roofHit ? <Label x={roofHit.x} y={GEO.roofY + 60} text="¡AL TECHO!" color={COLORS.yellow} p={roofLabel} size={52} /> : null}

      {/* palanca: flecha "hacia ti" */}
      {tabArrow > 0
        ? (() => {
            const tp = toWorld({ x: bx + GEO.thinBottom + 40, y: GEO.halfH + 44 }, th);
            const wob = 10 * Math.sin(f * 0.6);
            return (
              <div style={{ position: "absolute", left: tp.x + 30 + wob, top: tp.y + 20, opacity: tabArrow, display: "flex", alignItems: "center", gap: 14 }}>
                <svg width={120} height={60} viewBox="0 0 120 60">
                  <path d="M 4,22 H 76 V 6 L 116,30 L 76,54 V 38 H 4 Z" fill={COLORS.yellow} stroke="rgba(0,0,0,0.6)" strokeWidth={3} />
                </svg>
                <span style={{ fontFamily: FONT_DISPLAY, fontWeight: 800, fontSize: 52, color: COLORS.yellow, whiteSpace: "nowrap", textShadow: "0 3px 0 rgba(0,0,0,0.8)" }}>
                  HACIA TI
                </span>
              </div>
            );
          })()
        : null}

      {/* 4 % */}
      {pct > 0 ? (
        <div
          style={{
            position: "absolute",
            left: 770,
            top: 1050,
            translate: "-50% -50%",
            textAlign: "center",
            scale: String(interpolate(ramp(f, t4 - 2, t4 + 8, BACK), [0, 1], [0.6, 1])),
          }}
        >
          <div
            style={{
              fontFamily: FONT_DISPLAY,
              fontWeight: 800,
              fontSize: 230,
              lineHeight: 0.9,
              color: COLORS.green,
              textShadow: `0 0 50px ${COLORS.green}88, 0 6px 0 rgba(0,0,0,0.8)`,
            }}
          >
            {pctVal}%
          </div>
          <div style={{ fontFamily: FONT_UI, fontWeight: 700, fontSize: 34, color: COLORS.white, letterSpacing: 1, whiteSpace: "nowrap", opacity: ramp(f, t4 + 10, t4 + 18) }}>
            de la luz llega a tus ojos
          </div>
        </div>
      ) : null}

      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 1232,
          textAlign: "center",
          fontFamily: FONT_UI,
          fontWeight: 500,
          fontSize: 24,
          letterSpacing: 3,
          color: "rgba(244,246,248,0.45)",
          opacity: world,
        }}
      >
        ESQUEMA · ÁNGULOS EXAGERADOS PARA QUE SE VEAN
      </div>

      {/* título */}
      {title > 0 ? (
        <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
          <div
            style={{
              fontFamily: FONT_DISPLAY,
              fontWeight: 800,
              fontSize: 168,
              lineHeight: 0.92,
              textAlign: "center",
              color: COLORS.white,
              scale: String(interpolate(title, [0, 1], [0.7, 1])),
              opacity: Math.min(1, title * 1.5),
              textShadow: "0 0 60px rgba(127,211,255,0.45), 0 8px 0 rgba(0,0,0,0.6)",
              translate: "0 -80px",
            }}
          >
            ¿CÓMO
            <br />
            <span style={{ color: COLORS.accent }}>FUNCIONA?</span>
          </div>
        </AbsoluteFill>
      ) : null}
    </AbsoluteFill>
  );
};
