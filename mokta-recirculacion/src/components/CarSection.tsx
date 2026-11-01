import React, { useMemo } from "react";
import { COLORS, FONT_DISPLAY } from "../config";
import { lerp, rand } from "../lib/anim";

/**
 * Corte lateral del auto (frente a la izquierda) con el recorrido del aire.
 *  - "fresh": entra por la toma bajo el parabrisas, pasa por la caja del A/C, cruza la cabina y sale atrás.
 *  - "recirc": la toma se cierra y el mismo aire da vueltas dentro de la cabina.
 * Vapor: sale de los pasajeros, viaja al vidrio y se queda pegado (condensación).
 */

type Pt = [number, number];

const FRESH: Pt[] = [
  [-40, 222], [120, 262], [290, 252], [334, 268], [372, 300], [418, 250], [520, 232], [640, 246], [780, 284], [880, 330], [1040, 344],
];
const RECIRC: Pt[] = [
  [380, 302], [424, 250], [530, 236], [660, 250], [726, 300], [690, 346], [560, 352], [440, 346], [380, 302],
];

const polyLen = (pts: Pt[]) => {
  const seg: number[] = [];
  let total = 0;
  for (let i = 1; i < pts.length; i++) {
    const l = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
    seg.push(l);
    total += l;
  }
  return { seg, total };
};

/** Punto y dirección a una fracción u (0..1) del largo de la polilínea, con esquinas suavizadas por promedio. */
const at = (pts: Pt[], u: number) => {
  const { seg, total } = polyLen(pts);
  let d = (((u % 1) + 1) % 1) * total;
  for (let i = 0; i < seg.length; i++) {
    if (d <= seg[i] || i === seg.length - 1) {
      const k = Math.min(1, d / seg[i]);
      const [x0, y0] = pts[i];
      const [x1, y1] = pts[i + 1];
      return { x: lerp(x0, x1, k), y: lerp(y0, y1, k), a: Math.atan2(y1 - y0, x1 - x0) };
    }
    d -= seg[i];
  }
  return { x: pts[0][0], y: pts[0][1], a: 0 };
};

const Flow: React.FC<{ pts: Pt[]; t: number; color: string; n: number; speed: number; opacity: number; size?: number }> = ({
  pts,
  t,
  color,
  n,
  speed,
  opacity,
  size = 1,
}) => {
  const { total } = polyLen(pts);
  const d = pts.map((p, i) => `${i === 0 ? "M" : "L"}${p[0]} ${p[1]}`).join(" ");
  return (
    <g opacity={opacity}>
      <path d={d} stroke={color} strokeOpacity={0.16} strokeWidth={26 * size} fill="none" strokeLinejoin="round" strokeLinecap="round" />
      {Array.from({ length: n }, (_, i) => {
        const u = i / n + (t * speed) / total;
        const p = at(pts, u);
        const deg = (p.a * 180) / Math.PI;
        return (
          <g key={i} transform={`translate(${p.x} ${p.y}) rotate(${deg}) scale(${size})`}>
            <path d="M-12 -9 L2 0 L-12 9" stroke={color} strokeWidth={6} fill="none" strokeLinecap="round" strokeLinejoin="round" />
          </g>
        );
      })}
    </g>
  );
};

const HEADS: Pt[] = [
  [548, 200],
  [742, 206],
];

/** Puntos de destino del vapor sobre los vidrios (parabrisas y laterales). */
const GLASS_TARGETS: Pt[] = Array.from({ length: 70 }, (_, i) => {
  const r = rand(i * 3.3);
  if (r < 0.45) {
    const k = rand(i * 7.1);
    return [lerp(342, 462, k) + 6, lerp(256, 152, k) + 4] as Pt; // parabrisas
  }
  const x = lerp(486, 820, rand(i * 5.9));
  const yTop = x < 712 ? 156 : lerp(156, 246, (x - 712) / 120);
  return [x, lerp(yTop + 8, 244, rand(i * 2.2))] as Pt; // ventanas laterales
});

export const CarSection: React.FC<{
  t: number;
  width?: number;
  mode: "fresh" | "recirc" | "none";
  flowColor?: string;
  flowOpacity?: number;
  intakeClosed?: number;
  occupants?: boolean;
  /** fotogramas desde que empieza a salir vapor (negativo = sin vapor) */
  vaporF?: number;
  glassFog?: number;
  acGlow?: number;
  acColor?: string;
  outsideTemp?: string;
  outsideTempColor?: string;
}> = ({
  t,
  width = 960,
  mode,
  flowColor = COLORS.cold,
  flowOpacity = 1,
  intakeClosed = 0,
  occupants = true,
  vaporF = -1,
  glassFog = 0,
  acGlow = 0,
  acColor = COLORS.cold,
  outsideTemp,
  outsideTempColor = COLORS.hot,
}) => {
  const vapor = useMemo(
    () =>
      GLASS_TARGETS.map((g, i) => ({
        head: HEADS[i % 2],
        g,
        delay: rand(i * 4.7) * 50 + (i % 5) * 4,
        dur: 22 + rand(i * 8.1) * 18,
        wob: rand(i * 1.3) * 6.28,
      })),
    [],
  );
  const glassFill = `rgba(214,226,238,${lerp(0.08, 0.72, glassFog)})`;
  const flapAngle = lerp(-38, 0, intakeClosed);

  return (
    <svg width={width} height={(width * 520) / 1000} viewBox="0 0 1000 520" style={{ overflow: "visible" }}>
      <defs>
        <linearGradient id="carBody" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#2a313d" />
          <stop offset="1" stopColor="#141922" />
        </linearGradient>
        <radialGradient id="acGlow">
          <stop offset="0" stopColor={acColor} stopOpacity="0.9" />
          <stop offset="1" stopColor={acColor} stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* suelo */}
      <line x1={-40} y1={466} x2={1040} y2={466} stroke="rgba(244,246,248,0.12)" strokeWidth={3} />

      {/* carrocería */}
      <path
        d="M70 395 L58 330 Q60 300 95 292 L330 262 L468 142 Q480 130 502 130 L718 132 Q745 134 762 152 L872 250 Q940 264 946 300 L950 378 Q950 395 934 395 L862 395 A74 74 0 0 0 718 395 L288 395 A74 74 0 0 0 142 395 Z"
        fill="url(#carBody)"
        stroke="rgba(244,246,248,0.55)"
        strokeWidth={4}
        strokeLinejoin="round"
      />
      {/* cabina (interior más oscuro) */}
      <path d="M338 262 L466 150 L716 150 Q736 152 748 164 L846 254 L862 352 L352 352 Z" fill="#0b0e14" />
      {/* vidrios */}
      <path d="M342 260 L468 150" stroke={glassFill} strokeWidth={14} strokeLinecap="round" />
      <path d="M484 156 L606 156 L606 246 L478 246 Z" fill={glassFill} stroke="rgba(244,246,248,0.25)" strokeWidth={2} />
      <path d="M622 156 L712 156 Q732 158 744 170 L822 246 L622 246 Z" fill={glassFill} stroke="rgba(244,246,248,0.25)" strokeWidth={2} />

      {/* ruedas */}
      {[215, 790].map((x) => (
        <g key={x}>
          <circle cx={x} cy={398} r={60} fill="#0a0c10" stroke="rgba(244,246,248,0.45)" strokeWidth={4} />
          <circle cx={x} cy={398} r={26} fill="#1b2029" stroke="rgba(244,246,248,0.3)" strokeWidth={3} />
        </g>
      ))}

      {/* tablero + caja de climatización */}
      <path d="M340 264 L430 258 Q440 258 440 270 L440 300 L352 318 Z" fill="#1d232d" />
      <circle cx={386} cy={306} r={60} fill="url(#acGlow)" opacity={acGlow} />
      <rect x={350} y={286} width={72} height={44} rx={8} fill="#232a35" stroke={acGlow > 0.05 ? acColor : "rgba(244,246,248,0.35)"} strokeWidth={3} />
      <text x={386} y={316} textAnchor="middle" fontFamily={FONT_DISPLAY} fontWeight={700} fontSize={24} fill={acGlow > 0.05 ? acColor : "rgba(244,246,248,0.6)"}>
        A/C
      </text>

      {/* toma de aire exterior (compuerta) */}
      <g transform="translate(330 266)">
        <line x1={0} y1={0} x2={26} y2={0} stroke="rgba(244,246,248,0.6)" strokeWidth={4} transform={`rotate(${flapAngle})`} strokeLinecap="round" />
      </g>

      {/* asientos y pasajeros */}
      {occupants ? (
        <g fill="#2a3240" stroke="rgba(244,246,248,0.25)" strokeWidth={2}>
          <path d="M590 346 L560 222 Q556 210 568 210 L578 210 Q586 212 590 224 L612 346 Z" />
          <rect x={500} y={330} width={112} height={20} rx={8} />
          <path d="M790 346 L766 232 Q762 222 772 222 L780 222 Q788 224 792 234 L810 346 Z" />
          <rect x={690} y={330} width={120} height={20} rx={8} />
          {HEADS.map(([x, y]) => (
            <g key={x}>
              <circle cx={x} cy={y} r={25} fill="#3a4556" />
              <path d={`M${x + 4} ${y + 24} L${x + 20} ${y + 92} L${x - 46} ${y + 118}`} fill="none" stroke="#3a4556" strokeWidth={22} strokeLinecap="round" strokeLinejoin="round" />
            </g>
          ))}
        </g>
      ) : null}

      {/* flujo de aire */}
      {mode === "fresh" ? <Flow pts={FRESH} t={t} color={flowColor} n={16} speed={260} opacity={flowOpacity} /> : null}
      {mode === "recirc" ? <Flow pts={RECIRC} t={t} color={flowColor} n={11} speed={200} opacity={flowOpacity} /> : null}

      {/* compuerta cerrada */}
      {intakeClosed > 0.05 ? (
        <g transform={`translate(300 214) scale(${lerp(0.4, 1, intakeClosed)})`} opacity={intakeClosed}>
          <circle r={26} fill={COLORS.red} />
          <path d="M-10 -10 L10 10 M10 -10 L-10 10" stroke="#fff" strokeWidth={6} strokeLinecap="round" />
        </g>
      ) : null}

      {/* vapor de los pasajeros → vidrio */}
      {vaporF >= 0
        ? vapor.map((v, i) => {
            const age = vaporF - v.delay;
            if (age < 0) return null;
            const k = Math.min(1, age / v.dur);
            const e = 1 - Math.pow(1 - k, 2);
            const x = lerp(v.head[0] - 22, v.g[0], e) + Math.sin(age * 0.25 + v.wob) * 10 * (1 - k);
            const y = lerp(v.head[1] - 10, v.g[1], e) + Math.cos(age * 0.21 + v.wob) * 8 * (1 - k);
            const r = k < 1 ? 6 : 7;
            return (
              <circle
                key={i}
                cx={x}
                cy={y}
                r={r}
                fill={k < 1 ? "rgba(190,225,255,0.85)" : "rgba(235,244,252,0.95)"}
                stroke={k < 1 ? "rgba(92,200,255,0.9)" : "none"}
                strokeWidth={2}
              />
            );
          })
        : null}

      {outsideTemp ? (
        <g transform="translate(40 150)">
          <text x={0} y={0} fontFamily={FONT_DISPLAY} fontWeight={800} fontSize={64} fill={outsideTempColor}>
            {outsideTemp}
          </text>
          <text x={2} y={34} fontFamily={FONT_DISPLAY} fontWeight={600} fontSize={26} fill="rgba(244,246,248,0.7)" letterSpacing={3}>
            AFUERA
          </text>
        </g>
      ) : null}
    </svg>
  );
};
