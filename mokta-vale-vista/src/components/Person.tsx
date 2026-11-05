import React from "react";
import { useCurrentFrame } from "remotion";

export type Who = "pablo" | "comprador" | "cajera";
export type Mood = "happy" | "neutral" | "shock" | "smirk" | "serious" | "worried";

const SKIN: Record<Who, [string, string]> = {
  pablo: ["#F6C9A0", "#D99A6C"],
  comprador: ["#E2AC80", "#B97C52"],
  cajera: ["#F3C3A0", "#D49A73"],
};

/**
 * Personaje ilustrado (busto) en SVG. Parpadea y respira solo.
 * viewBox 300×360: se escala con `size` (ancho en px).
 */
export const Person: React.FC<{ who: Who; mood?: Mood; size?: number; style?: React.CSSProperties; look?: number }> = ({
  who,
  mood = "neutral",
  size = 420,
  style,
  look = 0,
}) => {
  const f = useCurrentFrame();
  const seedOff = who === "pablo" ? 0 : who === "comprador" ? 37 : 71;
  const blinkPhase = (f + seedOff) % 96;
  const blink = blinkPhase < 4 ? 0.12 : 1;
  const breathe = Math.sin((f + seedOff) / 14) * 3;
  const [skinA, skinB] = SKIN[who];
  const id = `${who}`;
  const shock = mood === "shock";
  const eyeRy = (shock ? 15 : 11) * blink;
  const pupil = shock ? 4.5 : 7;
  const browY = shock ? -14 : mood === "worried" ? -6 : mood === "smirk" ? -2 : 0;

  const mouth = (() => {
    switch (mood) {
      case "happy":
        return <path d="M122,196 Q150,226 178,196 Q150,212 122,196Z" fill="#7a2a1f" stroke="#5a1c14" strokeWidth={3} />;
      case "shock":
        return <ellipse cx={150} cy={206} rx={15} ry={20} fill="#4a1410" />;
      case "smirk":
        return <path d="M124,204 Q152,214 182,192" fill="none" stroke="#5a1c14" strokeWidth={6} strokeLinecap="round" />;
      case "worried":
        return <path d="M126,210 Q150,196 174,210" fill="none" stroke="#5a1c14" strokeWidth={6} strokeLinecap="round" />;
      case "serious":
        return <path d="M130,204 L170,204" fill="none" stroke="#5a1c14" strokeWidth={6} strokeLinecap="round" />;
      default:
        return <path d="M128,200 Q150,212 172,200" fill="none" stroke="#5a1c14" strokeWidth={6} strokeLinecap="round" />;
    }
  })();

  return (
    <svg viewBox="0 0 300 360" width={size} height={(size * 360) / 300} style={{ overflow: "visible", ...style }}>
      <defs>
        <linearGradient id={`${id}-skin`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={skinA} />
          <stop offset="1" stopColor={skinB} />
        </linearGradient>
        <linearGradient id={`${id}-body`} x1="0" y1="0" x2="0" y2="1">
          {who === "pablo" && (
            <>
              <stop offset="0" stopColor="#3D8BFF" />
              <stop offset="1" stopColor="#1438A6" />
            </>
          )}
          {who === "comprador" && (
            <>
              <stop offset="0" stopColor="#3a3340" />
              <stop offset="1" stopColor="#0d0b10" />
            </>
          )}
          {who === "cajera" && (
            <>
              <stop offset="0" stopColor="#13C4A8" />
              <stop offset="1" stopColor="#07786A" />
            </>
          )}
        </linearGradient>
        <linearGradient id={`${id}-lens`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#00e5ff" />
          <stop offset="0.5" stopColor="#3b1d6e" />
          <stop offset="1" stopColor="#ff2e88" />
        </linearGradient>
        <radialGradient id={`${id}-rim`} cx="0.5" cy="0.4" r="0.6">
          <stop offset="0.75" stopColor="#000" stopOpacity="0" />
          <stop offset="1" stopColor="#000" stopOpacity="0.25" />
        </radialGradient>
      </defs>

      <g transform={`translate(0 ${breathe * 0.4})`}>
        {/* cuerpo */}
        <path d="M18,372 Q26,252 150,238 Q274,252 282,372Z" fill={`url(#${id}-body)`} transform={`translate(0 ${-breathe * 0.2})`} />
        {who === "pablo" && <path d="M118,244 L150,290 L182,244 L168,240 L150,262 L132,240Z" fill="#fff" />}
        {who === "comprador" && (
          <>
            <path d="M120,246 L150,330 L180,246" fill="#e8e1d6" />
            <path d="M120,246 L96,300 L150,372 L112,250Z M180,246 L204,300 L150,372 L188,250Z" fill="#1a1520" />
            <path d="M126,262 Q150,300 174,262" fill="none" stroke="#f5c542" strokeWidth={4} />
          </>
        )}
        {who === "cajera" && (
          <>
            <path d="M112,246 Q150,280 188,246 L176,274 Q150,292 124,274Z" fill="#FFD60A" />
            <rect x={200} y={292} width={46} height={30} rx={5} fill="#fff" opacity={0.9} />
            <rect x={207} y={300} width={32} height={5} rx={2} fill="#07786A" />
            <rect x={207} y={309} width={22} height={4} rx={2} fill="#07786A" opacity={0.6} />
          </>
        )}

        {/* cuello */}
        <rect x={126} y={196} width={48} height={56} rx={18} fill={skinB} />

        {/* cabeza */}
        <g transform={`translate(${look * 4} 0)`}>
          {who === "cajera" && <circle cx={150} cy={44} r={34} fill="#2a1712" />}
          <ellipse cx={72} cy={146} rx={14} ry={20} fill={skinB} />
          <ellipse cx={228} cy={146} rx={14} ry={20} fill={skinB} />
          <ellipse cx={150} cy={140} rx={78} ry={90} fill={`url(#${id}-skin)`} />
          <ellipse cx={150} cy={140} rx={78} ry={90} fill={`url(#${id}-rim)`} />

          {/* pelo */}
          {who === "pablo" && (
            <path d="M70,138 Q62,48 150,40 Q240,44 232,138 Q222,96 196,86 Q170,100 120,84 Q92,96 70,138Z" fill="#3B2416" />
          )}
          {who === "cajera" && (
            <path d="M70,150 Q60,52 150,46 Q240,52 230,150 Q226,104 206,88 Q160,110 104,92 Q82,110 70,150Z" fill="#2a1712" />
          )}
          {who === "comprador" && (
            <>
              {/* barba de días */}
              <path d="M80,170 Q90,232 150,232 Q210,232 220,170 Q200,206 150,208 Q100,206 80,170Z" fill="#3a2418" opacity={0.35} />
              {/* jockey */}
              <path d="M68,118 Q70,40 150,38 Q230,40 232,118Z" fill="#141118" />
              <path d="M150,40 Q175,42 200,58" fill="none" stroke="#ff2e88" strokeWidth={6} />
              <path d="M120,112 Q210,96 284,124 Q240,134 120,124Z" fill="#0a080c" />
            </>
          )}

          {/* cejas */}
          <g transform={`translate(0 ${browY})`}>
            <path d={who === "comprador" ? "M100,112 L136,118" : "M100,108 Q118,98 136,106"} stroke="#2a1712" strokeWidth={8} strokeLinecap="round" fill="none" />
            <path d={mood === "smirk" ? "M164,112 Q184,100 202,104" : "M164,106 Q182,98 200,108"} stroke="#2a1712" strokeWidth={8} strokeLinecap="round" fill="none" />
          </g>

          {/* ojos */}
          {who === "comprador" ? (
            <g>
              <rect x={90} y={122} width={54} height={34} rx={12} fill={`url(#${id}-lens)`} />
              <rect x={156} y={122} width={54} height={34} rx={12} fill={`url(#${id}-lens)`} />
              <path d="M144,134 L156,134" stroke="#111" strokeWidth={5} />
              <path d="M98,128 L112,128" stroke="#fff" strokeWidth={4} opacity={0.7} strokeLinecap="round" />
              <path d="M164,128 L178,128" stroke="#fff" strokeWidth={4} opacity={0.7} strokeLinecap="round" />
            </g>
          ) : (
            <g>
              <ellipse cx={118} cy={138} rx={15} ry={eyeRy} fill="#fff" />
              <ellipse cx={182} cy={138} rx={15} ry={eyeRy} fill="#fff" />
              {blink > 0.5 && (
                <>
                  <circle cx={120 + look * 3} cy={139} r={pupil} fill="#21140e" />
                  <circle cx={184 + look * 3} cy={139} r={pupil} fill="#21140e" />
                  <circle cx={122 + look * 3} cy={136} r={2.4} fill="#fff" />
                  <circle cx={186 + look * 3} cy={136} r={2.4} fill="#fff" />
                </>
              )}
              {who === "cajera" && (
                <g fill="none" stroke="#1d1d2b" strokeWidth={4}>
                  <rect x={96} y={120} width={44} height={36} rx={10} />
                  <rect x={160} y={120} width={44} height={36} rx={10} />
                  <path d="M140,136 L160,136" />
                </g>
              )}
            </g>
          )}

          {/* nariz, mejillas, boca */}
          <path d="M150,148 Q144,170 152,176" fill="none" stroke={skinB} strokeWidth={5} strokeLinecap="round" />
          {who !== "comprador" && (
            <>
              <ellipse cx={100} cy={176} rx={14} ry={8} fill="#ff6b6b" opacity={0.28} />
              <ellipse cx={200} cy={176} rx={14} ry={8} fill="#ff6b6b" opacity={0.28} />
            </>
          )}
          {mouth}
          {shock && (
            <g fill="#8fd8ff" opacity={0.9}>
              <path d="M226,96 Q234,112 226,120 Q218,112 226,96Z" />
            </g>
          )}
        </g>
      </g>
    </svg>
  );
};
