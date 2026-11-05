import React from "react";
import { useCurrentFrame } from "remotion";

/* ------------------------------------------------------------------ AUTO */
/** Hatchback rojo, vista lateral (viewBox 600×250). `wheelSpin` en grados. */
export const Car: React.FC<{ width?: number; wheelSpin?: number; color?: [string, string]; ghost?: boolean; lights?: boolean; style?: React.CSSProperties }> = ({
  width = 600,
  wheelSpin = 0,
  color = ["#FF3D5A", "#B3001E"],
  ghost = false,
  lights = true,
  style,
}) => {
  const wheel = (cx: number) => (
    <g transform={`rotate(${wheelSpin} ${cx} 196)`}>
      <circle cx={cx} cy={196} r={44} fill="#111" />
      <circle cx={cx} cy={196} r={27} fill="url(#rim)" />
      {[0, 72, 144, 216, 288].map((a) => (
        <rect key={a} x={cx - 4} y={172} width={8} height={24} rx={3} fill="#5d6470" transform={`rotate(${a} ${cx} 196)`} />
      ))}
      <circle cx={cx} cy={196} r={7} fill="#2a2f38" />
    </g>
  );
  if (ghost) {
    return (
      <svg viewBox="0 0 600 250" width={width} style={style}>
        <path
          d="M30,192 L28,142 Q30,92 78,72 L330,64 Q360,66 420,116 L548,130 Q586,138 588,160 L588,190 Z"
          fill="none"
          stroke="#ffffff"
          strokeWidth={5}
          strokeDasharray="18 14"
        />
        <circle cx={140} cy={196} r={44} fill="none" stroke="#fff" strokeWidth={5} strokeDasharray="12 10" />
        <circle cx={470} cy={196} r={44} fill="none" stroke="#fff" strokeWidth={5} strokeDasharray="12 10" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 600 250" width={width} style={{ overflow: "visible", ...style }}>
      <defs>
        <linearGradient id="carBody" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={color[0]} />
          <stop offset="0.55" stopColor={color[1]} />
          <stop offset="1" stopColor="#5a000f" />
        </linearGradient>
        <linearGradient id="glass" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#9be7ff" />
          <stop offset="0.5" stopColor="#1b2a5a" />
          <stop offset="1" stopColor="#0b1030" />
        </linearGradient>
        <radialGradient id="rim">
          <stop offset="0" stopColor="#e8edf5" />
          <stop offset="1" stopColor="#8b95a5" />
        </radialGradient>
        <radialGradient id="beam" cx="0" cy="0.5" r="1">
          <stop offset="0" stopColor="#fff6c2" stopOpacity="0.9" />
          <stop offset="1" stopColor="#fff6c2" stopOpacity="0" />
        </radialGradient>
      </defs>
      <ellipse cx={305} cy={238} rx={300} ry={14} fill="#000" opacity={0.45} />
      {lights && <path d="M586,150 L820,100 L820,230 Z" fill="url(#beam)" opacity={0.6} />}
      <path d="M30,192 L28,142 Q30,92 78,72 L330,64 Q360,66 420,116 L548,130 Q586,138 588,160 L588,190 Q588,200 576,200 L42,200 Q30,200 30,192Z" fill="url(#carBody)" />
      {/* reflejo superior */}
      <path d="M60,128 Q300,112 580,146" fill="none" stroke="#fff" strokeWidth={4} opacity={0.35} />
      {/* ventanas */}
      <path d="M78,82 L224,76 L224,122 L66,124 Q66,98 78,82Z" fill="url(#glass)" />
      <path d="M238,76 L326,72 Q350,74 398,118 L238,122Z" fill="url(#glass)" />
      <path d="M96,86 L140,84 L110,118 L80,118Z" fill="#fff" opacity={0.18} />
      {/* puertas */}
      <path d="M232,76 L232,196 M398,122 L404,190" stroke="#6a0012" strokeWidth={3} fill="none" />
      <rect x={250} y={136} width={34} height={7} rx={3} fill="#2a0008" />
      <rect x={412} y={136} width={30} height={7} rx={3} fill="#2a0008" />
      {/* luces */}
      <path d="M560,140 L588,148 L586,166 L560,160Z" fill={lights ? "#fff8d6" : "#ccc"} />
      <path d="M30,120 L44,118 L44,150 L30,152Z" fill="#ff1f3d" />
      {wheel(140)}
      {wheel(470)}
    </svg>
  );
};

/* ------------------------------------------------------------- VALE VISTA */
/** Documento de recreación (banco ficticio). 900×440 px. */
export const ValeVista: React.FC<{
  width?: number;
  highlight?: "logo" | "timbre" | "monto" | "nombre" | null;
  stampOpacity?: number;
  amountText?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}> = ({ width = 900, highlight = null, stampOpacity = 1, amountText = "$8.900.000", style, children }) => {
  const k = width / 900;
  const hl = (on: boolean): React.CSSProperties =>
    on ? { boxShadow: "0 0 0 6px #FFD60A, 0 0 40px 10px #FFD60Aaa", borderRadius: 10, background: "#fff7c2" } : {};
  return (
    <div style={{ width: 900, height: 440, scale: String(k), transformOrigin: "0 0", ...style }}>
      <div
        style={{
          position: "relative",
          width: 900,
          height: 440,
          borderRadius: 18,
          overflow: "hidden",
          fontFamily: "Inter",
          color: "#14304f",
          background:
            "repeating-radial-gradient(circle at 20% 120%, #dff3ff 0 6px, #ecf9ff 6px 12px), linear-gradient(135deg,#e8f6ff,#fdfcf3)",
          boxShadow: "0 40px 80px rgba(0,0,0,0.55), 0 0 0 2px #9cc9e6 inset",
        }}
      >
        <div style={{ position: "absolute", inset: 0, background: "repeating-linear-gradient(115deg, transparent 0 22px, rgba(40,120,200,0.06) 22px 24px)" }} />
        {/* encabezado */}
        <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: 92, background: "linear-gradient(90deg,#0b3d91,#1565c0 60%,#00a3e0)" }} />
        <div style={{ position: "absolute", left: 28, top: 14, display: "flex", alignItems: "center", gap: 14, padding: 6, ...hl(highlight === "logo") }}>
          <svg width={58} height={58} viewBox="0 0 60 60">
            <circle cx={30} cy={30} r={28} fill="#fff" />
            <path d="M8,44 L24,20 L32,32 L38,24 L52,44Z" fill="#0b3d91" />
            <path d="M24,20 L28,26 L20,26Z" fill="#fff" />
          </svg>
          <div style={{ fontFamily: "Barlow Condensed", fontWeight: 800, fontSize: 40, color: highlight === "logo" ? "#0b3d91" : "#fff", letterSpacing: 1 }}>
            BANCO ANDINO
          </div>
        </div>
        <div style={{ position: "absolute", right: 30, top: 18, textAlign: "right", color: "#fff" }}>
          <div style={{ fontFamily: "Barlow Condensed", fontWeight: 800, fontSize: 44, letterSpacing: 3 }}>VALE VISTA</div>
          <div style={{ fontSize: 15, opacity: 0.85, marginTop: -4 }}>N° 0048 2271 9934</div>
        </div>
        {/* cuerpo */}
        <div style={{ position: "absolute", left: 40, top: 118, fontSize: 17, fontWeight: 500, opacity: 0.8 }}>Santiago, viernes</div>
        <div style={{ position: "absolute", left: 40, top: 160, fontSize: 18, fontWeight: 600 }}>Páguese a la orden de:</div>
        <div
          style={{
            position: "absolute",
            left: 34,
            top: 186,
            padding: "4px 10px",
            fontFamily: "Barlow Condensed",
            fontWeight: 700,
            fontSize: 46,
            color: "#0b2340",
            ...hl(highlight === "nombre"),
          }}
        >
          PABLO ROJAS M.
        </div>
        <div style={{ position: "absolute", left: 40, top: 256, fontSize: 16, fontWeight: 600, letterSpacing: 0.5 }}>
          LA SUMA DE: OCHO MILLONES NOVECIENTOS MIL PESOS
        </div>
        <div
          style={{
            position: "absolute",
            right: 34,
            top: 150,
            width: 300,
            height: 84,
            borderRadius: 10,
            border: "3px solid #0b3d91",
            background: "#fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: "Barlow Condensed",
            fontWeight: 800,
            fontSize: 56,
            color: "#0b2340",
            ...hl(highlight === "monto"),
          }}
        >
          {amountText}
        </div>
        {/* firma */}
        <svg style={{ position: "absolute", left: 40, top: 300 }} width={330} height={100} viewBox="0 0 330 100">
          <path d="M10,70 C40,10 60,90 90,40 S140,80 160,30 S210,70 240,45 S300,60 320,40" fill="none" stroke="#14304f" strokeWidth={3} />
          <path d="M10,86 L320,86" stroke="#14304f" strokeWidth={2} opacity={0.6} />
          <text x={10} y={99} fontSize={12} fill="#14304f">Firma autorizada</text>
        </svg>
        {/* timbre */}
        <div style={{ position: "absolute", right: 70, top: 262, padding: 8, ...hl(highlight === "timbre") }}>
          <svg width={150} height={150} viewBox="0 0 150 150" style={{ opacity: stampOpacity, rotate: "-14deg" }}>
            <circle cx={75} cy={75} r={66} fill="none" stroke="#5b3fd1" strokeWidth={6} />
            <circle cx={75} cy={75} r={50} fill="none" stroke="#5b3fd1" strokeWidth={3} />
            <text x={75} y={70} textAnchor="middle" fontSize={20} fontWeight={800} fill="#5b3fd1" fontFamily="Barlow Condensed">BANCO</text>
            <text x={75} y={92} textAnchor="middle" fontSize={20} fontWeight={800} fill="#5b3fd1" fontFamily="Barlow Condensed">ANDINO</text>
            <text x={75} y={112} textAnchor="middle" fontSize={12} fontWeight={700} fill="#5b3fd1" fontFamily="Inter">CAJA 04</text>
          </svg>
        </div>
        <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 26, background: "#0b3d91", color: "#cfe7ff", fontSize: 12, display: "flex", alignItems: "center", paddingLeft: 40, letterSpacing: 4 }}>
          0048 · 2271 9934 · 0012
        </div>
        {children}
      </div>
    </div>
  );
};

/* ---------------------------------------------------------------- TELÉFONO */
export const Phone: React.FC<{ width?: number; children: React.ReactNode; style?: React.CSSProperties; screenBg?: string }> = ({
  width = 560,
  children,
  style,
  screenBg = "#0f1222",
}) => {
  const h = width * 2.05;
  return (
    <div
      style={{
        width,
        height: h,
        borderRadius: width * 0.12,
        background: "linear-gradient(145deg,#3a3f52,#0b0d14)",
        padding: width * 0.03,
        boxShadow: "0 50px 120px rgba(0,0,0,0.6), 0 0 0 3px #5a6078 inset",
        ...style,
      }}
    >
      <div style={{ position: "relative", width: "100%", height: "100%", borderRadius: width * 0.095, overflow: "hidden", background: screenBg }}>
        {children}
        <div style={{ position: "absolute", top: width * 0.025, left: "50%", translate: "-50% 0", width: width * 0.28, height: width * 0.06, borderRadius: 99, background: "#000" }} />
      </div>
    </div>
  );
};

/* ----------------------------------------------------------------- ÍCONOS */
export const Check: React.FC<{ size?: number; color?: string; draw?: number }> = ({ size = 80, color = "#2EE59D", draw = 1 }) => (
  <svg width={size} height={size} viewBox="0 0 100 100">
    <circle cx={50} cy={50} r={46} fill={color} />
    <path d="M28,52 L44,67 L73,36" fill="none" stroke="#06231a" strokeWidth={11} strokeLinecap="round" strokeLinejoin="round" strokeDasharray={70} strokeDashoffset={70 * (1 - draw)} />
  </svg>
);

export const Cross: React.FC<{ size?: number; color?: string; draw?: number }> = ({ size = 80, color = "#FF2D55", draw = 1 }) => (
  <svg width={size} height={size} viewBox="0 0 100 100">
    <circle cx={50} cy={50} r={46} fill={color} />
    <path d="M32,32 L68,68" stroke="#fff" strokeWidth={12} strokeLinecap="round" strokeDasharray={52} strokeDashoffset={52 * (1 - Math.min(1, draw * 2))} />
    <path d="M68,32 L32,68" stroke="#fff" strokeWidth={12} strokeLinecap="round" strokeDasharray={52} strokeDashoffset={52 * (1 - Math.max(0, draw * 2 - 1))} />
  </svg>
);

export const RedFlag: React.FC<{ size?: number }> = ({ size = 56 }) => {
  const f = useCurrentFrame();
  const w = Math.sin(f / 3) * 4;
  return (
    <svg width={size} height={size} viewBox="0 0 60 60">
      <rect x={10} y={6} width={5} height={50} rx={2} fill="#3a0a14" />
      <path d={`M15,8 Q30,${2 + w} 50,10 Q42,20 50,30 Q30,${24 - w} 15,30Z`} fill="#FF2D55" />
    </svg>
  );
};

export const Keys: React.FC<{ size?: number; glow?: boolean }> = ({ size = 200, glow = true }) => (
  <svg width={size} height={size} viewBox="0 0 200 200" style={{ overflow: "visible", filter: glow ? "drop-shadow(0 0 24px #FFD60Acc)" : undefined }}>
    <defs>
      <linearGradient id="gold" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor="#FFF1A8" />
        <stop offset="0.5" stopColor="#FFC300" />
        <stop offset="1" stopColor="#B97800" />
      </linearGradient>
    </defs>
    <circle cx={70} cy={50} r={30} fill="none" stroke="#d9dee8" strokeWidth={8} />
    <rect x={56} y={70} width={70} height={110} rx={22} fill="#1d2230" transform="rotate(-18 90 120)" />
    <circle cx={86} cy={108} r={10} fill="#FF2D55" transform="rotate(-18 90 120)" />
    <path d="M110,60 L170,140 L160,148 L152,138 L144,144 L136,134 L128,140 L100,72Z" fill="url(#gold)" />
    <circle cx={104} cy={62} r={18} fill="url(#gold)" />
    <circle cx={104} cy={62} r={7} fill="#1d2230" />
  </svg>
);

export const PhoneIcon: React.FC<{ size?: number; color?: string }> = ({ size = 80, color = "#fff" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24">
    <path
      fill={color}
      d="M6.6 10.8a15.1 15.1 0 0 0 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1A17 17 0 0 1 3 4c0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.3 0 .7-.2 1z"
    />
  </svg>
);

export const BankIcon: React.FC<{ size?: number; color?: string }> = ({ size = 80, color = "#fff" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24">
    <path fill={color} d="M12 2 2 7v2h20V7L12 2zm-7 9v7h3v-7H5zm5.5 0v7h3v-7h-3zM16 11v7h3v-7h-3zM2 20v2h20v-2H2z" />
  </svg>
);

export const ShareIcon: React.FC<{ size?: number; color?: string }> = ({ size = 80, color = "#fff" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24">
    <path fill={color} d="M3 20.5V14c0-4.4 3.6-8 8-8h2V2.5L21 9.5 13 16.5V13h-2c-3.3 0-6 1.6-8 7.5z" />
  </svg>
);

export const Lock: React.FC<{ size?: number; closed?: number }> = ({ size = 240, closed = 1 }) => (
  <svg width={size} height={size * 1.2} viewBox="0 0 200 240" style={{ overflow: "visible" }}>
    <path
      d="M50,110 L50,70 Q50,20 100,20 Q150,20 150,70 L150,110"
      fill="none"
      stroke="#cfd6e4"
      strokeWidth={22}
      strokeLinecap="round"
      transform={`translate(0 ${-(1 - closed) * 46})`}
    />
    <rect x={20} y={100} width={160} height={130} rx={26} fill="#FF2D55" />
    <rect x={20} y={100} width={160} height={40} rx={20} fill="#ff6b86" opacity={0.5} />
    <circle cx={100} cy={160} r={16} fill="#3a0010" />
    <rect x={93} y={165} width={14} height={36} rx={6} fill="#3a0010" />
  </svg>
);

/** Flechas de rebobinado (no depende de glifos de fuente). */
export const RewindArrows: React.FC<{ size?: number; color?: string }> = ({ size = 70, color = "#fff" }) => (
  <svg width={size * 1.4} height={size} viewBox="0 0 140 100">
    <path d="M70,10 L10,50 L70,90Z M130,10 L70,50 L130,90Z" fill={color} />
  </svg>
);
