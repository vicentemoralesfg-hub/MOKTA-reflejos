import React from "react";

/**
 * "Motorcitos": personajes-motor estilo sticker (contorno blanco + sombra), SVG puro.
 * viewBox 0 0 400 420. Cada uno se arma con el mismo cuerpo base + accesorios.
 */
export type Kind = "diesel" | "v8" | "turbo" | "hibrido" | "electrico" | "rotativo";

export const BUDDY_COLOR: Record<Kind, string> = {
  diesel: "#9AA65A",
  v8: "#E5383B",
  turbo: "#2F7DF6",
  hibrido: "#26B86E",
  electrico: "#16BFE0",
  rotativo: "#9161F2",
};

const shade = (hex: string, k: number) => {
  const n = parseInt(hex.slice(1), 16);
  const r = Math.max(0, Math.min(255, Math.round(((n >> 16) & 255) * k)));
  const g = Math.max(0, Math.min(255, Math.round(((n >> 8) & 255) * k)));
  const b = Math.max(0, Math.min(255, Math.round((n & 255) * k)));
  return `rgb(${r},${g},${b})`;
};

const INK = "#14161B";

const Eyes: React.FC<{ y: number; gx?: number; lids?: number; spiral?: boolean; dx?: number }> = ({ y, gx = 0, lids = 0, spiral, dx = 44 }) => (
  <g>
    {[-1, 1].map((s) => (
      <g key={s}>
        <ellipse cx={200 + s * dx} cy={y} rx={27} ry={30} fill="#fff" stroke={INK} strokeWidth={5} />
        {spiral ? (
          <path d={`M ${200 + s * dx} ${y} m -3 0 a 3 3 0 1 1 6 0 a 7 7 0 1 1 -14 0 a 11 11 0 1 1 22 0`} fill="none" stroke={INK} strokeWidth={4} />
        ) : (
          <circle cx={200 + s * dx + gx} cy={y + 4} r={12} fill={INK} />
        )}
        {lids > 0 ? <rect x={200 + s * dx - 29} y={y - 32} width={58} height={32 * lids + 2} fill="currentColor" /> : null}
        {!spiral ? <circle cx={200 + s * dx + gx + 4} cy={y - 1} r={4} fill="#fff" /> : null}
      </g>
    ))}
  </g>
);

export const Buddy: React.FC<{ kind: Kind; size?: number; flip?: boolean }> = ({ kind, size = 400, flip }) => {
  const c = BUDDY_COLOR[kind];
  const dark = shade(c, 0.72);
  const light = shade(c, 1.18);
  const fid = `stk-${kind}`;
  const small = kind === "turbo";
  const block = kind !== "rotativo";

  return (
    <svg width={size} height={(size * 420) / 400} viewBox="0 0 400 420" style={{ overflow: "visible", color: c, transform: flip ? "scaleX(-1)" : undefined }}>
      <defs>
        <filter id={fid} x="-20%" y="-20%" width="140%" height="140%">
          <feMorphology operator="dilate" radius={9} in="SourceAlpha" result="d" />
          <feFlood floodColor="#FFFFFF" />
          <feComposite in2="d" operator="in" result="outline" />
          <feDropShadow dx={0} dy={14} stdDeviation={10} floodColor="#000" floodOpacity={0.45} in="outline" result="shadow" />
          <feMerge>
            <feMergeNode in="shadow" />
            <feMergeNode in="outline" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <g filter={`url(#${fid})`} transform={small ? "translate(40 70) scale(0.8)" : undefined}>
        {/* humo diésel (detrás) */}
        {kind === "diesel" ? (
          <g fill="#3A3D44">
            <circle cx={340} cy={150} r={26} />
            <circle cx={366} cy={118} r={20} />
            <circle cx={382} cy={88} r={14} />
          </g>
        ) : null}

        {/* brazos */}
        <path d="M86 260 Q40 270 36 316" fill="none" stroke={INK} strokeWidth={12} strokeLinecap="round" />
        <path d="M314 260 Q360 270 364 316" fill="none" stroke={INK} strokeWidth={12} strokeLinecap="round" />
        <circle cx={36} cy={320} r={16} fill={light} stroke={INK} strokeWidth={5} />
        <circle cx={364} cy={320} r={16} fill={light} stroke={INK} strokeWidth={5} />

        {/* soportes (pies) */}
        <rect x={112} y={350} width={52} height={30} rx={10} fill={INK} />
        <rect x={236} y={350} width={52} height={30} rx={10} fill={INK} />

        {block ? (
          <g>
            {/* culata / tapas de válvulas */}
            {kind === "v8" ? (
              <g>
                <rect x={70} y={112} width={128} height={56} rx={18} fill={dark} stroke={INK} strokeWidth={6} transform="rotate(-14 134 140)" />
                <rect x={202} y={112} width={128} height={56} rx={18} fill={dark} stroke={INK} strokeWidth={6} transform="rotate(14 266 140)" />
                {[0, 1, 2, 3].map((i) => (
                  <g key={i}>
                    <rect x={86 + i * 26} y={92 + i * 6} width={12} height={22} rx={4} fill={INK} transform="rotate(-14 134 140)" />
                    <rect x={218 + i * 26} y={110 - i * 6} width={12} height={22} rx={4} fill={INK} transform="rotate(14 266 140)" />
                  </g>
                ))}
              </g>
            ) : (
              <g>
                <rect x={100} y={118} width={200} height={58} rx={18} fill={dark} stroke={INK} strokeWidth={6} />
                {Array.from({ length: kind === "turbo" ? 3 : kind === "electrico" ? 0 : 4 }).map((_, i, arr) => {
                  const n = arr.length;
                  const x = 200 - ((n - 1) * 40) / 2 + i * 40 - 7;
                  return <rect key={i} x={x} y={96} width={14} height={26} rx={5} fill={INK} />;
                })}
              </g>
            )}
            {/* bloque */}
            <rect x={80} y={164} width={240} height={196} rx={40} fill={c} stroke={INK} strokeWidth={6} />
            <rect x={80} y={316} width={240} height={44} rx={20} fill={dark} stroke={INK} strokeWidth={6} />
            <rect x={100} y={176} width={200} height={16} rx={8} fill={light} opacity={0.55} />
            {[106, 294].map((x) => (
              <circle key={x} cx={x} cy={300} r={6} fill={INK} opacity={0.5} />
            ))}
          </g>
        ) : (
          // Rotativo: cuerpo en triángulo de Reuleaux
          <g>
            <path d="M200 92 A 230 230 0 0 1 330 318 A 230 230 0 0 1 70 318 A 230 230 0 0 1 200 92 Z" fill={c} stroke={INK} strokeWidth={6} />
            <path d="M200 120 A 200 200 0 0 1 300 300" fill="none" stroke={light} strokeWidth={14} strokeLinecap="round" opacity={0.5} />
            <rect x={110} y={316} width={180} height={44} rx={20} fill={dark} stroke={INK} strokeWidth={6} />
          </g>
        )}

        {/* ---------- caras y accesorios ---------- */}
        {kind === "diesel" ? (
          <g>
            {/* jockey */}
            <path d="M104 132 Q200 60 296 132 Z" fill="#5A4A3A" stroke={INK} strokeWidth={6} />
            <path d="M96 134 H312 Q330 140 312 150 H96 Z" fill="#4A3C2E" stroke={INK} strokeWidth={6} />
            <Eyes y={232} gx={2} lids={0.35} />
            <path d="M150 226 l-26 -10 M250 226 l26 -10" stroke={INK} strokeWidth={0} />
            {/* bigote */}
            <path d="M200 282 C176 262 130 266 128 292 C150 284 176 300 200 290 C224 300 250 284 272 292 C270 266 224 262 200 282 Z" fill="#E9E4DA" stroke={INK} strokeWidth={5} />
            <path d="M184 306 Q200 314 216 306" fill="none" stroke={INK} strokeWidth={5} strokeLinecap="round" />
            {/* pinzas con choripán */}
            <path d="M364 320 L382 214 M364 320 L400 220" stroke="#B8BCC4" strokeWidth={8} strokeLinecap="round" />
            <rect x={372} y={186} width={60} height={26} rx={13} fill="#A0442A" stroke={INK} strokeWidth={5} transform="rotate(-20 402 199)" />
          </g>
        ) : null}

        {kind === "v8" ? (
          <g>
            {/* lentes de sol */}
            <path d="M126 220 H274" stroke={INK} strokeWidth={8} />
            <rect x={128} y={208} width={62} height={44} rx={16} fill={INK} />
            <rect x={210} y={208} width={62} height={44} rx={16} fill={INK} />
            <path d="M140 218 l16 0" stroke="#fff" strokeWidth={5} strokeLinecap="round" opacity={0.7} />
            <path d="M222 218 l16 0" stroke="#fff" strokeWidth={5} strokeLinecap="round" opacity={0.7} />
            <path d="M160 288 Q206 318 248 282" fill="none" stroke={INK} strokeWidth={7} strokeLinecap="round" />
            {/* parlante */}
            <rect x={2} y={266} width={74} height={96} rx={14} fill="#22252C" stroke={INK} strokeWidth={5} />
            <circle cx={39} cy={296} r={18} fill="#3A3E47" stroke="#55606E" strokeWidth={4} />
            <circle cx={39} cy={340} r={11} fill="#3A3E47" stroke="#55606E" strokeWidth={4} />
            <path d="M18 230 v-36 l22 -6 v36" fill="none" stroke={INK} strokeWidth={6} />
            <circle cx={14} cy={232} r={8} fill={INK} />
            <circle cx={36} cy={226} r={8} fill={INK} />
          </g>
        ) : null}

        {kind === "turbo" ? (
          <g>
            <path d="M136 200 l40 12 M264 200 l-40 12" stroke={INK} strokeWidth={9} strokeLinecap="round" />
            <Eyes y={240} gx={5} />
            <path d="M168 292 Q200 312 236 290" fill="none" stroke={INK} strokeWidth={7} strokeLinecap="round" />
            <path d="M224 300 l6 -10" stroke={INK} strokeWidth={5} strokeLinecap="round" />
            {/* turbo (caracol) */}
            <circle cx={346} cy={196} r={40} fill="#C9CED6" stroke={INK} strokeWidth={6} />
            <path d="M346 196 m -6 0 a 6 6 0 1 1 12 0 a 14 14 0 1 1 -28 0 a 24 24 0 1 1 48 0" fill="none" stroke={INK} strokeWidth={5} />
            <path d="M312 220 L320 250" stroke={INK} strokeWidth={10} strokeLinecap="round" />
            <path d="M392 168 q14 -6 20 4 M398 196 q16 0 18 10 M390 224 q12 6 10 16" fill="none" stroke="#fff" strokeWidth={5} strokeLinecap="round" />
          </g>
        ) : null}

        {kind === "hibrido" ? (
          <g>
            {/* brote */}
            <path d="M200 118 C200 96 200 86 204 72" stroke="#1B7A47" strokeWidth={7} fill="none" strokeLinecap="round" />
            <path d="M204 76 C226 52 262 60 262 60 C254 92 222 92 204 76 Z" fill="#7BE0A3" stroke={INK} strokeWidth={5} />
            <path d="M200 92 C182 74 154 80 154 80 C162 104 188 104 200 92 Z" fill="#7BE0A3" stroke={INK} strokeWidth={5} />
            {/* lentes redondos */}
            <Eyes y={236} gx={-3} />
            <circle cx={156} cy={236} r={36} fill="none" stroke={INK} strokeWidth={6} />
            <circle cx={244} cy={236} r={36} fill="none" stroke={INK} strokeWidth={6} />
            <path d="M192 236 h16" stroke={INK} strokeWidth={6} />
            <path d="M176 296 Q200 310 224 296" fill="none" stroke={INK} strokeWidth={6} strokeLinecap="round" />
            {/* táper */}
            <rect x={318} y={286} width={82} height={58} rx={10} fill="#E8F4EE" stroke={INK} strokeWidth={5} />
            <rect x={312} y={274} width={94} height={20} rx={8} fill="#26B86E" stroke={INK} strokeWidth={5} />
            <circle cx={340} cy={318} r={9} fill="#7BE0A3" />
            <circle cx={366} cy={322} r={7} fill="#F2B44A" />
          </g>
        ) : null}

        {kind === "electrico" ? (
          <g>
            <Eyes y={232} lids={0.45} />
            <path d="M176 290 Q200 304 224 290" fill="none" stroke={INK} strokeWidth={6} strokeLinecap="round" />
            {/* rayo */}
            <path d="M206 128 L176 160 H198 L186 184 L224 146 H200 Z" fill="#FFE14D" stroke={INK} strokeWidth={5} strokeLinejoin="round" />
            {/* cable con enchufe */}
            <path d="M320 330 C380 344 392 392 340 404 C300 412 300 380 330 376" fill="none" stroke={INK} strokeWidth={9} strokeLinecap="round" />
            <rect x={312} y={364} width={30} height={26} rx={6} fill="#D9DEE6" stroke={INK} strokeWidth={5} />
            <path d="M318 364 v-12 M336 364 v-12" stroke={INK} strokeWidth={5} strokeLinecap="round" />
          </g>
        ) : null}

        {kind === "rotativo" ? (
          <g>
            {/* pelo de genio */}
            <path d="M160 108 q-10 -30 14 -40 q-2 22 16 26 q4 -28 30 -30 q-6 24 10 32 q16 -18 36 -10 q-18 10 -16 28" fill="#3B2A63" stroke={INK} strokeWidth={5} />
            <Eyes y={236} spiral dx={40} />
            <path d="M172 296 Q190 284 206 298 Q220 310 232 292" fill="none" stroke={INK} strokeWidth={6} strokeLinecap="round" />
            {/* aceitera */}
            <path d="M330 300 h50 v44 h-50 z" fill="#E0A52E" stroke={INK} strokeWidth={5} />
            <path d="M378 306 L404 278" stroke={INK} strokeWidth={6} strokeLinecap="round" />
            <path d="M404 284 q6 12 0 18 q-6 -6 0 -18 z" fill="#E0A52E" stroke={INK} strokeWidth={3} />
          </g>
        ) : null}
      </g>
    </svg>
  );
};
