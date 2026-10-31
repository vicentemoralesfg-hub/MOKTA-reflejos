import React from "react";

type P = { size?: number; color?: string; style?: React.CSSProperties; stroke?: number };

const S: React.FC<P & { children: React.ReactNode; vb?: string }> = ({ size = 48, style, children, vb = "0 0 24 24" }) => (
  <svg width={size} height={size} viewBox={vb} style={{ display: "block", flexShrink: 0, ...style }}>
    {children}
  </svg>
);

export const Snowflake: React.FC<P> = ({ color = "#9FDCFF", stroke = 1.8, ...p }) => (
  <S {...p}>
    <g fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round">
      {[0, 60, 120].map((a) => (
        <g key={a} transform={`rotate(${a} 12 12)`}>
          <path d="M12 2v20" />
          <path d="M9 4.5l3 2.5 3-2.5M9 19.5l3-2.5 3 2.5" />
        </g>
      ))}
    </g>
  </S>
);

export const Sun: React.FC<P> = ({ color = "#FF8A3D", stroke = 1.8, ...p }) => (
  <S {...p}>
    <g fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round">
      <circle cx={12} cy={12} r={4.4} />
      {Array.from({ length: 8 }).map((_, i) => (
        <path key={i} d="M12 2.2v2.6" transform={`rotate(${i * 45} 12 12)`} />
      ))}
    </g>
  </S>
);

export const Check: React.FC<P> = ({ color = "#2BE38A", stroke = 2.6, ...p }) => (
  <S {...p}>
    <path d="M5 12.5l4.5 4.5L19 7.5" fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round" />
  </S>
);

export const Cross: React.FC<P> = ({ color = "#FF3B3B", stroke = 2.8, ...p }) => (
  <S {...p}>
    <path d="M6 6l12 12M18 6L6 18" fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round" />
  </S>
);

export const Key: React.FC<P> = ({ color = "#F4F6F8", stroke = 1.9, ...p }) => (
  <S {...p}>
    <g fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round">
      <circle cx={7.5} cy={12} r={4} />
      <path d="M11.5 12H21M17.5 12v3M20 12v2.2" />
    </g>
  </S>
);

export const Belt: React.FC<P> = ({ color = "#F4F6F8", stroke = 1.9, ...p }) => (
  <S {...p}>
    <g fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round">
      <circle cx={12} cy={4.6} r={2.2} />
      <path d="M8 21v-7.5a4 4 0 0 1 8 0V21" />
      <path d="M7.5 9.5l9.5 9" strokeWidth={stroke * 1.25} />
    </g>
  </S>
);

export const Stopwatch: React.FC<P> = ({ color = "#F4F6F8", stroke = 1.9, ...p }) => (
  <S {...p}>
    <g fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round">
      <circle cx={12} cy={13.5} r={7.5} />
      <path d="M12 13.5V9.5M10 2.5h4M18.5 6.5l1.4-1.4" />
    </g>
  </S>
);

export const Wheel: React.FC<P> = ({ color = "#F4F6F8", stroke = 1.9, ...p }) => (
  <S {...p}>
    <g fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round">
      <circle cx={12} cy={12} r={9} />
      <circle cx={12} cy={12} r={2.4} />
      <path d="M3.4 10.5c3.2-1.3 5.8-1.2 6.4 1.2M20.6 10.5c-3.2-1.3-5.8-1.2-6.4 1.2M12 14.4V21" />
    </g>
  </S>
);

export const Drop: React.FC<P> = ({ color = "#FFC83D", ...p }) => (
  <S {...p}>
    <path d="M12 2.5C9 7 6 10.4 6 14a6 6 0 0 0 12 0c0-3.6-3-7-6-11.5z" fill={color} />
    <path d="M9.2 14.6a2.9 2.9 0 0 0 2.4 2.6" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth={1.4} strokeLinecap="round" />
  </S>
);

export const Warning: React.FC<P> = ({ color = "#FFC83D", ...p }) => (
  <S {...p}>
    <path d="M12 3L2.5 20h19L12 3z" fill={color} />
    <path d="M12 9.5v5" stroke="#05070B" strokeWidth={2.4} strokeLinecap="round" />
    <circle cx={12} cy={17.3} r={1.3} fill="#05070B" />
  </S>
);

export const Thermo: React.FC<P & { level?: number; fill?: string }> = ({
  color = "#F4F6F8",
  level = 0.3,
  fill = "#43C6FF",
  stroke = 1.8,
  ...p
}) => (
  <S {...p}>
    <rect x={10} y={2.5} width={4} height={13.5} rx={2} fill="none" stroke={color} strokeWidth={stroke} />
    <rect x={11} y={4 + (1 - level) * 10} width={2} height={12 - (1 - level) * 10} fill={fill} />
    <circle cx={12} cy={18.2} r={3.4} fill={fill} stroke={color} strokeWidth={stroke} />
  </S>
);

export const Bubble: React.FC<P> = ({ color = "#05070B", stroke = 2.2, ...p }) => (
  <S {...p}>
    <path
      d="M4 5.5A2.5 2.5 0 0 1 6.5 3h11A2.5 2.5 0 0 1 20 5.5v8a2.5 2.5 0 0 1-2.5 2.5H10l-4.5 4v-4A1.5 1.5 0 0 1 4 14.5z"
      fill="none"
      stroke={color}
      strokeWidth={stroke}
      strokeLinejoin="round"
    />
  </S>
);

export const Send: React.FC<P> = ({ color = "#F4F6F8", stroke = 2, ...p }) => (
  <S {...p}>
    <path
      d="M21 3L10 14M21 3l-7 18-4-7-7-4 18-7z"
      fill="none"
      stroke={color}
      strokeWidth={stroke}
      strokeLinejoin="round"
      strokeLinecap="round"
    />
  </S>
);

export const Engine: React.FC<P> = ({ color = "#F4F6F8", stroke = 1.8, ...p }) => (
  <S {...p}>
    <path
      d="M4 9h2V7h4V5h5v2h3l2 2v3h1.5v4H20v2h-3l-2 2H8l-2-2H4v-3H2.5v-3H4z"
      fill="none"
      stroke={color}
      strokeWidth={stroke}
      strokeLinejoin="round"
    />
  </S>
);
