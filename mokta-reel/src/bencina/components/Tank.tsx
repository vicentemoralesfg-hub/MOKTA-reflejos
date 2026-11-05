import React from "react";
import { C, FONT_D, FONT_UI } from "../theme";
import { BOTTOM, NECK, PIVOT, Pt, floatState, hToY, path } from "../tankModel";

let uid = 0;
const useId = (p: string) => React.useMemo(() => `${p}${uid++}`, [p]);

/**
 * Corte del estanque en coordenadas del modelo (x≈130..870, y 200..700).
 * Se coloca dentro de un <svg> mayor con un <g transform>.
 */
export const TankG: React.FC<{
  shape: Pt[];
  level: number;
  t: number;
  neck?: number; // opacidad del cuello de llenado
  wave?: number;
  fuelOpacity?: number;
  outline?: string;
  outlineWidth?: number;
  sender?: number; // opacidad del flotador/brazo/resistencia
  hi?: { float?: number; arm?: number; res?: number };
  children?: React.ReactNode;
  pump?: { opacity: number; heat: number; cool: number };
}> = ({
  shape,
  level,
  t,
  neck = 0,
  wave = 1,
  fuelOpacity = 1,
  outline = "rgba(244,246,248,0.85)",
  outlineWidth = 7,
  sender = 0,
  hi = {},
  children,
  pump,
}) => {
  const clipId = useId("tc");
  const gradId = useId("tf");
  const ys = hToY(level);
  // superficie con oleaje suave
  const pts: string[] = [];
  for (let x = 60; x <= 990; x += 15) {
    const y = ys + wave * (5 * Math.sin(x * 0.018 + t * 0.21) + 2.5 * Math.sin(x * 0.041 - t * 0.33));
    pts.push(`${x},${y.toFixed(1)}`);
  }
  const surface = `M${pts.join(" L")}`;
  const fill = `${surface} L990,${BOTTOM + 40} L60,${BOTTOM + 40} Z`;
  const fs = floatState(Math.min(level, 1.2));
  const resPts: string[] = [];
  for (let k = 0; k <= 22; k++) {
    const a = ((-50 + (81 * k) / 22) * Math.PI) / 180;
    const r = 70 + (k % 2 === 0 ? -7 : 7);
    resPts.push(`${(PIVOT[0] + r * Math.cos(a)).toFixed(1)},${(PIVOT[1] + r * Math.sin(a)).toFixed(1)}`);
  }
  const wiper: Pt = [PIVOT[0] + 70 * Math.cos(fs.phi), PIVOT[1] + 70 * Math.sin(fs.phi)];
  const glow = (v = 0) => (v > 0 ? `drop-shadow(0 0 ${10 * v}px ${C.fuel})` : undefined);

  return (
    <g>
      <defs>
        <clipPath id={clipId}>
          <path d={path(shape)} />
          {neck > 0 ? <path d={path(NECK)} /> : null}
        </clipPath>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={C.fuelLight} />
          <stop offset="18%" stopColor={C.fuel} />
          <stop offset="100%" stopColor={C.fuelDeep} />
        </linearGradient>
      </defs>
      {/* interior */}
      <path d={path(shape)} fill="rgba(127,211,255,0.05)" />
      {neck > 0 ? <path d={path(NECK)} fill="rgba(127,211,255,0.05)" opacity={neck} /> : null}
      <g clipPath={`url(#${clipId})`} opacity={fuelOpacity}>
        <path d={fill} fill={`url(#${gradId})`} opacity={0.92} />
        <path d={surface} stroke={C.fuelLight} strokeWidth={5} fill="none" opacity={0.9} />
        {/* burbujas/brillos sutiles */}
        {[0, 1, 2, 3, 4, 5].map((k) => {
          const bx = 200 + k * 110;
          const by = BOTTOM - ((t * (1.6 + k * 0.3) + k * 70) % Math.max(1, BOTTOM - ys));
          return <circle key={k} cx={bx} cy={by} r={4 + (k % 3)} fill="rgba(255,255,255,0.25)" />;
        })}
      </g>
      {pump ? <PumpModule {...pump} t={t} /> : null}
      {/* flotador + brazo + resistencia */}
      {sender > 0 ? (
        <g opacity={sender}>
          <rect x={PIVOT[0] - 10} y={200} width={20} height={480} rx={6} fill="#2A3444" stroke="#6E7B8F" strokeWidth={3} />
          <rect x={PIVOT[0] - 34} y={186} width={68} height={22} rx={6} fill="#3A4556" />
          <polyline
            points={resPts.join(" ")}
            fill="none"
            stroke={hi.res ? C.cyan : "#B8C4D4"}
            strokeWidth={5}
            strokeLinejoin="round"
            style={{ filter: hi.res ? `drop-shadow(0 0 ${12 * hi.res}px ${C.cyan})` : undefined }}
          />
          <line
            x1={PIVOT[0]}
            y1={PIVOT[1]}
            x2={fs.fx}
            y2={fs.fy}
            stroke={hi.arm ? C.fuelLight : "#C9D2DE"}
            strokeWidth={9}
            strokeLinecap="round"
            style={{ filter: glow(hi.arm) }}
          />
          <line x1={PIVOT[0]} y1={PIVOT[1]} x2={wiper[0]} y2={wiper[1]} stroke={C.cyan} strokeWidth={6} strokeLinecap="round" />
          <circle cx={wiper[0]} cy={wiper[1]} r={8} fill={C.cyan} />
          <circle cx={PIVOT[0]} cy={PIVOT[1]} r={14} fill="#1B2330" stroke="#C9D2DE" strokeWidth={4} />
          <g style={{ filter: glow(hi.float) }}>
            <rect x={fs.fx - 52} y={fs.fy - 26} width={104} height={52} rx={26} fill="#F4F6F8" stroke={C.ink} strokeWidth={3} />
            <rect x={fs.fx - 52} y={fs.fy - 2} width={104} height={8} fill={C.red} opacity={0.85} />
          </g>
        </g>
      ) : null}
      {/* pared */}
      <path d={path(shape)} fill="none" stroke={outline} strokeWidth={outlineWidth} strokeLinejoin="round" />
      {neck > 0 ? (
        <path d={`M${NECK[0][0]},${NECK[0][1]} L${NECK[3][0]},${NECK[3][1]} M${NECK[1][0]},${NECK[1][1]} L${NECK[2][0]},${NECK[2][1]}`} stroke={outline} strokeWidth={outlineWidth} opacity={neck} strokeLinecap="round" />
      ) : null}
      {children}
    </g>
  );
};

/** Bomba de bencina sumergida (escena del consejo). */
const PumpModule: React.FC<{ opacity: number; heat: number; cool: number; t: number }> = ({ opacity, heat, cool, t }) => {
  const x = 500;
  return (
    <g opacity={opacity}>
      {/* flujo de enfriamiento alrededor de la bomba */}
      {[0, 1, 2, 3].map((k) => {
        const ph = (t * 0.08 + k * 0.25) % 1;
        const yy = 690 - ph * 130;
        return (
          <g key={k} opacity={cool * Math.sin(ph * Math.PI)}>
            <path d={`M${x - 70},${yy} q-14,-14 0,-28`} stroke={C.cyan} strokeWidth={5} fill="none" strokeLinecap="round" />
            <path d={`M${x + 70},${yy} q14,-14 0,-28`} stroke={C.cyan} strokeWidth={5} fill="none" strokeLinecap="round" />
          </g>
        );
      })}
      <ellipse cx={x} cy={615} rx={110 * (0.6 + heat)} ry={95 * (0.6 + heat)} fill={C.red} opacity={0.5 * heat} style={{ filter: "blur(18px)" }} />
      <line x1={x} y1={560} x2={x} y2={200} stroke="#6E7B8F" strokeWidth={10} />
      <rect x={x - 46} y={556} width={92} height={114} rx={14} fill={heat > 0.05 ? `rgb(${Math.round(70 + 185 * heat)},${Math.round(80 - 20 * heat)},${Math.round(90 - 40 * heat)})` : "#3A4556"} stroke="#C9D2DE" strokeWidth={4} />
      <text x={x} y={632} textAnchor="middle" fontFamily={FONT_D} fontWeight={800} fontSize={52} fill={C.white}>
        M
      </text>
      <rect x={x - 60} y={668} width={120} height={22} rx={6} fill="#2A3444" stroke="#C9D2DE" strokeWidth={3} />
    </g>
  );
};

/** Llamada con línea guía: ancla (ax,ay) → etiqueta (lx,ly). p = progreso 0..1. */
export const Callout: React.FC<{
  ax: number;
  ay: number;
  lx: number;
  ly: number;
  text: string;
  p: number;
  color?: string;
  size?: number;
  align?: "start" | "middle" | "end";
}> = ({ ax, ay, lx, ly, text, p, color = C.fuel, size = 44, align = "middle" }) => {
  if (p <= 0) return null;
  const k = Math.min(1, p * 1.6);
  const ex = ax + (lx - ax) * k;
  const ey = ay + (ly - ay) * k;
  const tp = Math.max(0, Math.min(1, (p - 0.35) / 0.4));
  const w = text.length * size * 0.5 + 44;
  const bx = align === "middle" ? lx - w / 2 : align === "start" ? lx : lx - w;
  return (
    <g>
      <circle cx={ax} cy={ay} r={10} fill={color} opacity={Math.min(1, p * 3)} />
      <circle cx={ax} cy={ay} r={10 + 20 * k} fill="none" stroke={color} strokeWidth={3} opacity={(1 - k) * 0.8} />
      <line x1={ax} y1={ay} x2={ex} y2={ey} stroke={color} strokeWidth={4} />
      <g opacity={tp} transform={`translate(${lx} ${ly}) scale(${0.7 + 0.3 * tp}) translate(${-lx} ${-ly})`}>
        <rect x={bx} y={ly - size * 0.72} width={w} height={size * 1.4} rx={size * 0.3} fill={C.ink} stroke={color} strokeWidth={3} />
        <text
          x={bx + w / 2}
          y={ly + size * 0.34}
          textAnchor="middle"
          fontFamily={FONT_D}
          fontWeight={800}
          fontSize={size}
          letterSpacing={1}
          fill={color}
        >
          {text}
        </text>
      </g>
    </g>
  );
};

/** Etiqueta pequeña sin caja. */
export const Label: React.FC<{ x: number; y: number; text: string; color?: string; size?: number; o?: number; anchor?: "start" | "middle" | "end"; weight?: number; font?: string }> = ({
  x,
  y,
  text,
  color = C.white,
  size = 36,
  o = 1,
  anchor = "middle",
  weight = 700,
  font = FONT_UI,
}) => (
  <text x={x} y={y} textAnchor={anchor} fontFamily={font} fontWeight={weight} fontSize={size} fill={color} opacity={o}>
    {text}
  </text>
);
