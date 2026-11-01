import React from "react";

/**
 * Íconos del tablero dibujados a mano (viewBox 100×100, trazo = currentColor).
 * Siguen los símbolos estándar de climatización: auto con flecha en bucle (recirculación),
 * auto con flecha que entra (aire exterior), parabrisas con flechas onduladas (desempañador delantero),
 * rectángulo con flechas onduladas (luneta trasera).
 */

type P = { size?: number; color?: string; stroke?: number; style?: React.CSSProperties };

const Svg: React.FC<P & { children: React.ReactNode }> = ({ size = 100, color = "currentColor", stroke = 6, style, children }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 100 100"
    fill="none"
    stroke={color}
    strokeWidth={stroke}
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{ overflow: "visible", ...style }}
  >
    {children}
  </svg>
);

/** Silueta de auto (perfil) abierta por abajo, compartida por recirculación y aire exterior. */
const CAR = "M6 74 L6 60 Q6 53 13 52 L28 49 L41 34 Q44 31 49 31 L70 31 Q75 31 78 35 L89 49 Q94 51 94 58 L94 74";

export const RecircIcon: React.FC<P> = (p) => (
  <Svg {...p}>
    <path d={CAR} />
    <path d="M68 52 L40 52 A8 8 0 0 0 40 68 L64 68" />
    <path d="M57 61 L65 68 L57 75" />
  </Svg>
);

export const FreshAirIcon: React.FC<P> = (p) => (
  <Svg {...p}>
    <path d={CAR} />
    <path d="M-6 40 L22 40 Q34 40 40 50 L48 62" />
    <path d="M38 60 L48 63 L50 52" />
  </Svg>
);

const wave = (x: number, y0: number, y1: number) => {
  const step = (y0 - y1) / 4;
  let d = `M${x} ${y0}`;
  for (let i = 0; i < 4; i++) d += ` q${i % 2 === 0 ? -5 : 5} ${-step / 2} 0 ${-step}`;
  return d;
};

const Waves: React.FC<{ y0: number; y1: number; xs: number[] }> = ({ y0, y1, xs }) => (
  <>
    {xs.map((x) => (
      <React.Fragment key={x}>
        <path d={wave(x, y0, y1)} />
        <path d={`M${x - 6} ${y1 + 7} L${x} ${y1} L${x + 6} ${y1 + 7}`} />
      </React.Fragment>
    ))}
  </>
);

export const FrontDefrostIcon: React.FC<P> = (p) => (
  <Svg {...p}>
    <path d="M22 80 L8 30 Q50 14 92 30 L78 80 Q50 74 22 80 Z" />
    <Waves y0={68} y1={34} xs={[34, 50, 66]} />
  </Svg>
);

export const RearDefrostIcon: React.FC<P> = (p) => (
  <Svg {...p}>
    <rect x="8" y="24" width="84" height="56" rx="8" />
    <Waves y0={70} y1={36} xs={[32, 50, 68]} />
  </Svg>
);

export const FanIcon: React.FC<P> = (p) => (
  <Svg {...p}>
    {[0, 120, 240].map((a) => (
      <path
        key={a}
        d="M50 50 C 40 34, 46 14, 58 16 C 70 18, 66 38, 50 50 Z"
        transform={`rotate(${a} 50 50)`}
      />
    ))}
    <circle cx="50" cy="50" r="5" />
  </Svg>
);

export const SnowIcon: React.FC<P> = (p) => (
  <Svg {...p}>
    {[0, 60, 120].map((a) => (
      <g key={a} transform={`rotate(${a} 50 50)`}>
        <path d="M50 8 L50 92" />
        <path d="M40 16 L50 26 L60 16" />
        <path d="M40 84 L50 74 L60 84" />
      </g>
    ))}
  </Svg>
);

export const SunIcon: React.FC<P> = (p) => (
  <Svg {...p}>
    <circle cx="50" cy="50" r="18" />
    {Array.from({ length: 8 }, (_, i) => (
      <path key={i} d="M50 8 L50 20" transform={`rotate(${i * 45} 50 50)`} />
    ))}
  </Svg>
);

export const DropIcon: React.FC<P> = (p) => (
  <Svg {...p}>
    <path d="M50 10 C 50 10 24 42 24 61 A26 26 0 0 0 76 61 C 76 42 50 10 50 10 Z" />
  </Svg>
);

export const FuelIcon: React.FC<P> = (p) => (
  <Svg {...p}>
    <rect x="16" y="14" width="44" height="74" rx="6" />
    <path d="M16 44 L60 44" />
    <path d="M60 30 L74 40 L74 74 Q74 82 81 82 Q88 82 88 74 L88 40 L78 30" />
  </Svg>
);

export const CheckIcon: React.FC<P> = (p) => (
  <Svg {...p}>
    <path d="M18 52 L40 74 L84 28" />
  </Svg>
);

export const XIcon: React.FC<P> = (p) => (
  <Svg {...p}>
    <path d="M22 22 L78 78 M78 22 L22 78" />
  </Svg>
);

export const BookmarkIcon: React.FC<P> = (p) => (
  <Svg {...p}>
    <path d="M24 10 L76 10 L76 90 L50 70 L24 90 Z" />
  </Svg>
);

export const CommentIcon: React.FC<P> = (p) => (
  <Svg {...p}>
    <path d="M14 22 Q14 12 24 12 L76 12 Q86 12 86 22 L86 60 Q86 70 76 70 L42 70 L22 88 L24 70 Q14 70 14 60 Z" />
  </Svg>
);

export const SendIcon: React.FC<P> = (p) => (
  <Svg {...p}>
    <path d="M90 10 L8 44 L42 56 L54 90 Z" />
    <path d="M90 10 L42 56" />
  </Svg>
);

export const ThermoIcon: React.FC<P> = (p) => (
  <Svg {...p}>
    <path d="M40 60 L40 18 A10 10 0 0 1 60 18 L60 60 A18 18 0 1 1 40 60 Z" />
    <path d="M50 70 L50 34" />
  </Svg>
);

/** Íconos de la perilla de modo (persona sentada + flechas). */
export type ModeKind = "face" | "bilevel" | "feet" | "feetDefrost" | "defrost";

const Person: React.FC = () => (
  <>
    <circle cx="34" cy="22" r="8" />
    <path d="M36 34 L40 60 L62 60 L66 84" />
  </>
);

export const ModeIcon: React.FC<P & { kind: ModeKind }> = ({ kind, ...p }) => {
  if (kind === "defrost") return <FrontDefrostIcon {...p} />;
  return (
    <Svg {...p}>
      <Person />
      {kind === "face" || kind === "bilevel" ? (
        <>
          <path d="M94 26 L56 26" />
          <path d="M64 18 L56 26 L64 34" />
        </>
      ) : null}
      {kind === "feet" || kind === "bilevel" || kind === "feetDefrost" ? (
        <>
          <path d="M96 84 L76 84" />
          <path d="M84 76 L76 84 L84 92" />
        </>
      ) : null}
      {kind === "feetDefrost" ? <path d="M58 6 Q78 0 98 8" /> : null}
    </Svg>
  );
};
