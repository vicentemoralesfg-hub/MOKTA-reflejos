import React from "react";

/** Íconos de línea propios (sin dependencias). Todos en un lienzo 100×100. */
type P = { size?: number; color?: string; t?: number };

const Svg: React.FC<{ size: number; children: React.ReactNode }> = ({ size, children }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" fill="none" strokeLinecap="round" strokeLinejoin="round">
    {children}
  </svg>
);

export const IconRoute: React.FC<P> = ({ size = 100, color = "#fff", t = 0 }) => (
  <Svg size={size}>
    <path d="M22 78 C 22 58, 50 64, 50 46 S 78 34, 78 22" stroke={color} strokeWidth={6} strokeDasharray="9 9" strokeDashoffset={-t * 3} />
    <circle cx={22} cy={78} r={8} fill={color} />
    <path d="M78 8 C 70 8 66 14 66 20 C 66 28 78 38 78 38 C 78 38 90 28 90 20 C 90 14 86 8 78 8 Z" fill={color} />
    <circle cx={78} cy={20} r={4} fill="#05070B" />
  </Svg>
);

export const IconPedals: React.FC<P> = ({ size = 100, color = "#fff", t = 0 }) => {
  const a = Math.max(0, Math.sin(t * 0.5)) * 8;
  const b = Math.max(0, Math.sin(t * 0.5 + 2.2)) * 8;
  return (
    <Svg size={size}>
      <path d="M30 10 L30 40" stroke={color} strokeWidth={6} />
      <rect x={14} y={40 + a} width={32} height={46} rx={8} stroke={color} strokeWidth={6} />
      <path d="M70 10 L70 36" stroke={color} strokeWidth={6} />
      <rect x={56} y={36 + b} width={28} height={36} rx={8} stroke={color} strokeWidth={6} />
    </Svg>
  );
};

export const IconThermo: React.FC<P & { level?: number; snow?: boolean }> = ({ size = 100, color = "#fff", level = 0.2, snow }) => (
  <Svg size={size}>
    <path d="M40 14 a10 10 0 0 1 20 0 v44 a18 18 0 1 1 -20 0 z" stroke={color} strokeWidth={6} />
    <rect x={46} y={60 - 44 * level} width={8} height={44 * level + 8} rx={4} fill={color} />
    <circle cx={50} cy={74} r={10} fill={color} />
    {snow ? (
      <g stroke={color} strokeWidth={4}>
        <path d="M82 20 v24 M71 26 l22 12 M71 38 l22 -12" />
      </g>
    ) : null}
  </Svg>
);

export const IconTacho: React.FC<P & { value?: number }> = ({ size = 100, color = "#fff", value = 0.5 }) => {
  const ang = -210 + 240 * value;
  const r = (ang * Math.PI) / 180;
  return (
    <Svg size={size}>
      <path d="M18 72 A 36 36 0 1 1 82 72" stroke={color} strokeWidth={6} />
      <path d="M70 30 A 36 36 0 0 1 82 72" stroke="#FF3B3B" strokeWidth={8} />
      <path d={`M50 58 L ${50 + 30 * Math.cos(r)} ${58 + 30 * Math.sin(r)}`} stroke={color} strokeWidth={6} />
      <circle cx={50} cy={58} r={6} fill={color} />
    </Svg>
  );
};

export const IconBump: React.FC<P> = ({ size = 100, color = "#fff", t = 0 }) => {
  const x = ((t * 2.2) % 120) - 20;
  const y = x > 30 && x < 70 ? -Math.sin(((x - 30) / 40) * Math.PI) * 16 : 0;
  return (
    <Svg size={size}>
      <path d="M4 80 L 30 80 Q 50 56 70 80 L 96 80" stroke={color} strokeWidth={6} />
      <g transform={`translate(${x - 14} ${56 + y})`}>
        <rect x={0} y={0} width={28} height={12} rx={4} fill={color} />
        <circle cx={6} cy={14} r={4} fill={color} />
        <circle cx={22} cy={14} r={4} fill={color} />
      </g>
    </Svg>
  );
};

export const IconCalendarX: React.FC<P> = ({ size = 100, color = "#fff" }) => (
  <Svg size={size}>
    <rect x={14} y={20} width={72} height={66} rx={10} stroke={color} strokeWidth={6} />
    <path d="M14 38 H86 M32 12 v14 M68 12 v14" stroke={color} strokeWidth={6} />
    <path d="M38 52 L62 76 M62 52 L38 76" stroke="#FF3B3B" strokeWidth={7} />
  </Svg>
);

export const IconSpeedo: React.FC<P & { value?: number }> = ({ size = 100, color = "#fff", value = 0.5 }) => {
  const ang = -210 + 240 * value;
  const r = (ang * Math.PI) / 180;
  return (
    <Svg size={size}>
      <path d="M18 72 A 36 36 0 1 1 82 72" stroke={color} strokeWidth={6} />
      {[0, 0.25, 0.5, 0.75, 1].map((v) => {
        const a = ((-210 + 240 * v) * Math.PI) / 180;
        return <path key={v} d={`M ${50 + 28 * Math.cos(a)} ${58 + 28 * Math.sin(a)} L ${50 + 34 * Math.cos(a)} ${58 + 34 * Math.sin(a)}`} stroke={color} strokeWidth={4} />;
      })}
      <path d={`M50 58 L ${50 + 26 * Math.cos(r)} ${58 + 26 * Math.sin(r)}`} stroke={color} strokeWidth={6} />
      <circle cx={50} cy={58} r={6} fill={color} />
    </Svg>
  );
};

export const IconBrakeOff: React.FC<P> = ({ size = 100, color = "#fff" }) => (
  <Svg size={size}>
    <circle cx={50} cy={50} r={30} stroke={color} strokeWidth={6} />
    <circle cx={50} cy={50} r={10} stroke={color} strokeWidth={5} />
    {[0, 60, 120, 180, 240, 300].map((a) => {
      const r = (a * Math.PI) / 180;
      return <circle key={a} cx={50 + 20 * Math.cos(r)} cy={50 + 20 * Math.sin(r)} r={3} fill={color} />;
    })}
    <path d="M20 80 L80 20" stroke={color} strokeWidth={7} />
  </Svg>
);

export const IconOil: React.FC<P> = ({ size = 100, color = "#fff" }) => (
  <Svg size={size}>
    <path d="M50 10 C 50 10 22 44 22 62 a28 28 0 0 0 56 0 C 78 44 50 10 50 10 Z" stroke={color} strokeWidth={6} />
    <path d="M36 64 a14 14 0 0 0 12 12" stroke={color} strokeWidth={5} />
  </Svg>
);

export const IconDoc: React.FC<P> = ({ size = 100, color = "#fff" }) => (
  <Svg size={size}>
    <path d="M24 8 H62 L80 26 V92 H24 Z" stroke={color} strokeWidth={6} />
    <path d="M62 8 V26 H80" stroke={color} strokeWidth={5} />
    <path d="M36 44 H68 M36 58 H68 M36 72 H56" stroke={color} strokeWidth={5} />
  </Svg>
);

export const IconWheel: React.FC<P> = ({ size = 100, color = "#fff", t = 0 }) => (
  <Svg size={size}>
    <g transform={`rotate(${Math.sin(t * 0.3) * 12} 50 50)`}>
      <circle cx={50} cy={50} r={38} stroke={color} strokeWidth={7} />
      <circle cx={50} cy={50} r={9} stroke={color} strokeWidth={5} />
      <path d="M14 46 Q 50 36 86 46 M50 59 V88" stroke={color} strokeWidth={6} />
    </g>
  </Svg>
);

export const IconKeyCold: React.FC<P> = ({ size = 100, color = "#fff" }) => (
  <Svg size={size}>
    <circle cx={34} cy={60} r={18} stroke={color} strokeWidth={6} />
    <path d="M47 47 L80 14 M68 26 L78 36 M60 34 L68 42" stroke={color} strokeWidth={6} />
    <g stroke={color} strokeWidth={4}>
      <path d="M78 58 v28 M66 65 l24 14 M66 79 l24 -14" />
    </g>
  </Svg>
);

export const IconScanner: React.FC<P & { t?: number }> = ({ size = 100, color = "#fff", t = 0 }) => (
  <Svg size={size}>
    <rect x={20} y={10} width={60} height={64} rx={10} stroke={color} strokeWidth={6} />
    <rect x={30} y={20} width={40} height={26} rx={4} stroke={color} strokeWidth={4} />
    <path d={`M33 40 L41 ${30 + 6 * Math.sin(t * 0.5)} L49 36 L57 ${26 + 8 * Math.sin(t * 0.4 + 1)} L67 32`} stroke={color} strokeWidth={3.5} />
    <path d="M36 58 h28" stroke={color} strokeWidth={5} />
    <path d="M50 74 V92 M38 92 H62" stroke={color} strokeWidth={6} />
  </Svg>
);

export const IconCheck: React.FC<P & { progress?: number }> = ({ size = 100, color = "#fff", progress = 1 }) => (
  <Svg size={size}>
    <path d="M24 52 L42 70 L78 32" stroke={color} strokeWidth={11} strokeDasharray={90} strokeDashoffset={90 * (1 - progress)} />
  </Svg>
);

export const IconX: React.FC<P & { progress?: number }> = ({ size = 100, color = "#fff", progress = 1 }) => (
  <Svg size={size}>
    <path d="M26 26 L74 74" stroke={color} strokeWidth={12} strokeDasharray={70} strokeDashoffset={70 * (1 - Math.min(1, progress * 2))} />
    <path d="M74 26 L26 74" stroke={color} strokeWidth={12} strokeDasharray={70} strokeDashoffset={70 * (1 - Math.max(0, progress * 2 - 1))} />
  </Svg>
);

export const IconBookmark: React.FC<P & { fill?: number }> = ({ size = 100, color = "#fff", fill = 0 }) => (
  <Svg size={size}>
    <clipPath id="bmk">
      <rect x={0} y={100 - 100 * fill} width={100} height={100} />
    </clipPath>
    <path d="M24 10 H76 V92 L50 70 L24 92 Z" stroke={color} strokeWidth={7} />
    <path d="M24 10 H76 V92 L50 70 L24 92 Z" fill={color} clipPath="url(#bmk)" />
  </Svg>
);

export const IconClock: React.FC<P & { turns?: number }> = ({ size = 100, color = "#fff", turns = 0 }) => {
  const a = turns * 2 * Math.PI - Math.PI / 2;
  const h = (turns / 12) * 2 * Math.PI - Math.PI / 2;
  return (
    <Svg size={size}>
      <circle cx={50} cy={50} r={40} stroke={color} strokeWidth={6} />
      <path d={`M50 50 L ${50 + 30 * Math.cos(a)} ${50 + 30 * Math.sin(a)}`} stroke={color} strokeWidth={5} />
      <path d={`M50 50 L ${50 + 20 * Math.cos(h)} ${50 + 20 * Math.sin(h)}`} stroke={color} strokeWidth={7} />
      <circle cx={50} cy={50} r={5} fill={color} />
    </Svg>
  );
};

export const IconEngine: React.FC<P> = ({ size = 100, color = "#fff" }) => (
  <Svg size={size}>
    <path d="M18 40 H30 V30 H52 V36 H70 L78 44 H88 V74 H78 L70 82 H34 L26 72 H18 Z" stroke={color} strokeWidth={6} />
    <path d="M8 50 V64 M18 57 H8" stroke={color} strokeWidth={6} />
  </Svg>
);
