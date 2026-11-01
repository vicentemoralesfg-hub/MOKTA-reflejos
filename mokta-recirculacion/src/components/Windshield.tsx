import React, { useMemo } from "react";
import { AbsoluteFill } from "remotion";
import { HEIGHT, WIDTH } from "../config";
import { lerp, rand } from "../lib/anim";

/**
 * Vista del conductor: ciudad de noche con lluvia, a través del parabrisas.
 *  fog   0→1  el empañado avanza desde los bordes hacia el centro (condensación interior)
 *  clear 0→1  el desempañador lo limpia de abajo hacia arriba (salidas de aire del tablero)
 *  vents 0→1  brillo de las salidas del desempañador
 * La escena exterior se dibuja una vez y se reutiliza (<use>) desenfocada bajo la máscara de empañado.
 */

const HORIZON = 800;
const F = 866.7; // focal (px) → suelo a 2 m de distancia en y = 1320
const CAM_H = 1.2;
const SPEED = 11; // m/s, ciudad

const proj = (X: number, h: number, d: number) => ({
  x: WIDTH / 2 + (X * F) / d,
  y: HORIZON + ((CAM_H - h) * F) / d,
  k: F / d,
});

const Glow: React.FC<{ x: number; y: number; r: number; color: string; core?: number; o?: number }> = ({ x, y, r, color, core = 0.22, o = 1 }) => (
  <>
    <circle cx={x} cy={y} r={r} fill={`url(#glow-${color.replace("#", "")})`} opacity={o} />
    <circle cx={x} cy={y} r={Math.max(1.2, r * core)} fill="#fff8ee" opacity={0.9 * o} />
  </>
);

const GLOW_COLORS = ["#ffb347", "#ff3b30", "#ffffff", "#36e07a", "#ff4fd8", "#4fd6ff"];

const Outside: React.FC<{ t: number }> = ({ t }) => {
  const buildings = useMemo(() => {
    const out: { x: number; w: number; h: number; win: { x: number; y: number; o: number; c: string }[] }[] = [];
    let x = -20;
    let i = 0;
    while (x < WIDTH + 20) {
      const w = 50 + rand(i * 3.1) * 110;
      const h = 70 + rand(i * 7.7) * 260 * (Math.abs(x + w / 2 - WIDTH / 2) / 540 + 0.25);
      const win: { x: number; y: number; o: number; c: string }[] = [];
      for (let wy = 0; wy < h - 20; wy += 22) {
        for (let wx = 8; wx < w - 12; wx += 18) {
          const r = rand(i * 13 + wx * 0.37 + wy * 1.91);
          if (r > 0.62) win.push({ x: x + wx, y: HORIZON - h + 12 + wy, o: 0.25 + (r - 0.62) * 1.6, c: r > 0.93 ? "#cfe6ff" : "#ffcf86" });
        }
      }
      out.push({ x, w, h, win });
      x += w + 4;
      i++;
    }
    return out;
  }, []);

  // Faroles a ambos lados, avanzando hacia la cámara
  const lamps: React.ReactNode[] = [];
  for (let k = 0; k < 6; k++) {
    for (const side of [-1, 1]) {
      const d = ((k * 22 + (side > 0 ? 11 : 0) - t * SPEED) % 132 + 132) % 132 + 6;
      const top = proj(side * 7.5, 7, d);
      const base = proj(side * 7.5, 0, d);
      const o = Math.min(1, (132 - d) / 30);
      lamps.push(
        <g key={`l${k}${side}`} opacity={o}>
          <line x1={base.x} y1={base.y} x2={top.x} y2={top.y} stroke="#0a0c12" strokeWidth={Math.max(1.5, 0.18 * top.k)} />
          <Glow x={top.x - side * 0.6 * top.k} y={top.y} r={Math.min(150, 1.5 * top.k + 10)} color="#ffb347" />
          {/* reflejo en el asfalto mojado */}
          <rect x={top.x - side * 0.6 * top.k - 0.25 * top.k} y={HORIZON + 4} width={Math.max(2, 0.5 * top.k)} height={Math.min(560, base.y - HORIZON + 0.8 * top.k)} fill="url(#reflAmber)" opacity={0.5 * o} />
        </g>,
      );
    }
  }

  // Letreros y vitrinas (bokeh de colores a nivel de calle)
  const signs: React.ReactNode[] = [];
  for (let k = 0; k < 8; k++) {
    const side = k % 2 === 0 ? -1 : 1;
    const d = ((k * 17 + 5 - t * SPEED) % 136 + 136) % 136 + 9;
    const p = proj(side * (10 + rand(k) * 3), 2 + rand(k * 3) * 3, d);
    const c = GLOW_COLORS[(k % 3) + 3];
    signs.push(<Glow key={`s${k}`} x={p.x} y={p.y} r={Math.min(120, 1.1 * p.k + 6)} color={c} core={0.12} o={Math.min(1, (136 - d) / 30) * 0.85} />);
  }

  // Líneas de pista (segmentos que vienen hacia la cámara)
  const dashes: React.ReactNode[] = [];
  for (const X of [-1.75, 1.75]) {
    for (let k = 0; k < 14; k++) {
      const d0 = ((k * 9 - t * SPEED) % 126 + 126) % 126 + 1.5;
      const d1 = d0 + 3;
      const a = proj(X, 0, d0);
      const b = proj(X, 0, d1);
      const wA = 0.12 * a.k;
      const wB = 0.12 * b.k;
      dashes.push(
        <polygon
          key={`d${X}${k}`}
          points={`${a.x - wA},${a.y} ${a.x + wA},${a.y} ${b.x + wB},${b.y} ${b.x - wB},${b.y}`}
          fill="#c9d1dc"
          opacity={0.35}
        />,
      );
    }
  }

  // Auto de adelante (luces traseras) y uno que viene de frente
  const lead = proj(0.1, 0.8, 10 + Math.sin(t * 0.7) * 0.6);
  const onD = ((60 - t * (SPEED + 13)) % 70 + 70) % 70 + 4;
  const on = proj(-3.6, 0.7, onD);

  const green = proj(4.5, 5.2, 70);

  return (
    <g>
      <rect x={0} y={0} width={WIDTH} height={HORIZON + 4} fill="url(#sky)" />
      {buildings.map((b, i) => (
        <g key={i}>
          <rect x={b.x} y={HORIZON - b.h} width={b.w} height={b.h + 6} fill="#0b0f1b" />
          {b.win.map((w, j) => (
            <rect key={j} x={w.x} y={w.y} width={9} height={11} fill={w.c} opacity={w.o} />
          ))}
        </g>
      ))}
      <rect x={0} y={HORIZON - 40} width={WIDTH} height={60} fill="url(#hazeBand)" />
      <polygon points={`${WIDTH / 2 - 30},${HORIZON} ${WIDTH / 2 + 30},${HORIZON} ${WIDTH + 900},${HEIGHT} ${-900},${HEIGHT}`} fill="url(#road)" />
      {dashes}
      {lamps}
      {signs}
      <Glow x={green.x} y={green.y} r={34} color="#36e07a" core={0.18} />
      <rect x={green.x - 3} y={HORIZON + 2} width={6} height={160} fill="url(#reflGreen)" opacity={0.5} />
      {/* auto de adelante */}
      <rect x={lead.x - 0.95 * lead.k} y={lead.y - 0.55 * lead.k} width={1.9 * lead.k} height={0.95 * lead.k} rx={0.18 * lead.k} fill="#07090e" />
      {[-1, 1].map((s) => (
        <React.Fragment key={s}>
          <Glow x={lead.x + s * 0.72 * lead.k} y={lead.y - 0.1 * lead.k} r={0.9 * lead.k} color="#ff3b30" core={0.14} />
          <rect x={lead.x + s * 0.72 * lead.k - 7} y={lead.y + 0.4 * lead.k} width={14} height={300} fill="url(#reflRed)" opacity={0.55} />
        </React.Fragment>
      ))}
      {/* auto en sentido contrario */}
      {onD < 70
        ? [-1, 1].map((s) => (
            <React.Fragment key={`o${s}`}>
              <Glow x={on.x + s * 0.65 * on.k} y={on.y} r={Math.min(260, 1.6 * on.k + 8)} color="#ffffff" core={0.16} o={Math.min(1, (70 - onD) / 20)} />
              <rect x={on.x + s * 0.65 * on.k - 0.2 * on.k} y={on.y + 0.3 * on.k} width={Math.max(3, 0.4 * on.k)} height={Math.min(600, 4 * on.k)} fill="url(#reflWhite)" opacity={0.4 * Math.min(1, (70 - onD) / 20)} />
            </React.Fragment>
          ))
        : null}
    </g>
  );
};

/** Gotas de lluvia sobre el vidrio (por fuera). */
const Drops: React.FC<{ t: number }> = ({ t }) => {
  const drops = useMemo(
    () =>
      Array.from({ length: 150 }, (_, i) => ({
        x: rand(i * 1.7) * WIDTH,
        y: 120 + rand(i * 2.3) * 1200,
        r: 2.5 + Math.pow(rand(i * 5.1), 2.2) * 9,
        slide: rand(i * 9.3) > 0.9,
        sp: 40 + rand(i * 4.4) * 120,
      })),
    [],
  );
  return (
    <g>
      {drops.map((d, i) => {
        const y = d.slide ? ((d.y + t * d.sp - 120) % 1200) + 120 : d.y;
        return (
          <g key={i}>
            {d.slide ? <line x1={d.x} y1={y - d.r * 6} x2={d.x} y2={y} stroke="rgba(220,235,255,0.10)" strokeWidth={d.r * 0.8} strokeLinecap="round" /> : null}
            <circle cx={d.x} cy={y} r={d.r} fill="url(#drop)" />
            <circle cx={d.x - d.r * 0.3} cy={y - d.r * 0.35} r={d.r * 0.28} fill="rgba(255,255,255,0.55)" />
          </g>
        );
      })}
    </g>
  );
};

export const Windshield: React.FC<{
  id: string;
  t: number;
  fog: number;
  clear?: number;
  vents?: number;
  hazeOpacity?: number;
  showCabin?: boolean;
}> = ({ id, t, fog, clear = 0, vents = 0, hazeOpacity = 0.5, showCabin = true }) => {
  const a = lerp(1.08, -0.25, fog);
  const clearTop = lerp(1420, -260, clear);
  const ventR = lerp(0, 1, Math.min(1, clear * 2.2));
  const fid = (s: string) => `${id}-${s}`;
  return (
    <AbsoluteFill style={{ backgroundColor: "#04060b" }}>
      <svg width={WIDTH} height={HEIGHT} viewBox={`0 0 ${WIDTH} ${HEIGHT}`} style={{ position: "absolute", inset: 0 }}>
        <defs>
          <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#05070f" />
            <stop offset="0.7" stopColor="#121a30" />
            <stop offset="1" stopColor="#2f2640" />
          </linearGradient>
          <linearGradient id="hazeBand" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#5a4a6a" stopOpacity="0" />
            <stop offset="0.6" stopColor="#7a5e6a" stopOpacity="0.35" />
            <stop offset="1" stopColor="#7a5e6a" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="road" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#141824" />
            <stop offset="1" stopColor="#07090e" />
          </linearGradient>
          {[
            ["reflAmber", "#ffb347"],
            ["reflRed", "#ff3b30"],
            ["reflGreen", "#36e07a"],
            ["reflWhite", "#ffffff"],
          ].map(([n, c]) => (
            <linearGradient key={n} id={n} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor={c} stopOpacity="0.9" />
              <stop offset="1" stopColor={c} stopOpacity="0" />
            </linearGradient>
          ))}
          {GLOW_COLORS.map((c) => (
            <radialGradient key={c} id={`glow-${c.replace("#", "")}`}>
              <stop offset="0" stopColor={c} stopOpacity="0.95" />
              <stop offset="0.25" stopColor={c} stopOpacity="0.45" />
              <stop offset="1" stopColor={c} stopOpacity="0" />
            </radialGradient>
          ))}
          <radialGradient id="drop">
            <stop offset="0" stopColor="#ffffff" stopOpacity="0.04" />
            <stop offset="0.75" stopColor="#dfeaff" stopOpacity="0.16" />
            <stop offset="1" stopColor="#ffffff" stopOpacity="0.42" />
          </radialGradient>
          <radialGradient id={fid("creep")} cx="0.5" cy="0.46" r="0.78">
            <stop offset={Math.max(0, a)} stopColor="#000" />
            <stop offset={Math.max(0, a + 0.2)} stopColor="#fff" />
          </radialGradient>
          <linearGradient id={fid("clearG")} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#000" stopOpacity="0" />
            <stop offset="0.12" stopColor="#000" stopOpacity="1" />
          </linearGradient>
          <filter id={fid("blur")} x="-10%" y="-10%" width="120%" height="120%">
            <feGaussianBlur stdDeviation="20" />
          </filter>
          <filter id={fid("warp")} x="-20%" y="-20%" width="140%" height="140%">
            <feTurbulence type="fractalNoise" baseFrequency="0.009" numOctaves="2" seed="4" result="n" />
            <feDisplacementMap in="SourceGraphic" in2="n" scale="160" xChannelSelector="R" yChannelSelector="G" />
          </filter>
          <filter id={fid("tex")}>
            <feTurbulence type="fractalNoise" baseFrequency="0.006 0.009" numOctaves="3" seed="9" />
            <feColorMatrix type="matrix" values="0 0 0 0 0.86  0 0 0 0 0.9  0 0 0 0 0.95  0 0 0 2.2 -0.85" />
          </filter>
          <filter id={fid("speck")}>
            <feTurbulence type="fractalNoise" baseFrequency="0.42" numOctaves="1" seed="3" />
            <feColorMatrix type="matrix" values="0 0 0 0 0.95  0 0 0 0 0.97  0 0 0 0 1  0 0 0 9 -5.4" />
          </filter>
          <mask id={fid("mask")} maskUnits="userSpaceOnUse" x="0" y="0" width={WIDTH} height={HEIGHT}>
            <g filter={`url(#${fid("warp")})`}>
              <rect x={-100} y={-100} width={WIDTH + 200} height={HEIGHT + 200} fill={`url(#${fid("creep")})`} />
              {clear > 0 ? (
                <>
                  <rect x={-200} y={clearTop} width={WIDTH + 400} height={HEIGHT} fill={`url(#${fid("clearG")})`} />
                  <ellipse cx={300} cy={1330} rx={lerp(60, 520, ventR)} ry={lerp(30, 700, clear)} fill="#000" />
                  <ellipse cx={780} cy={1330} rx={lerp(60, 520, ventR)} ry={lerp(30, 700, clear)} fill="#000" />
                </>
              ) : null}
            </g>
          </mask>
          <linearGradient id={fid("dash")} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#1a1d24" />
            <stop offset="0.08" stopColor="#0c0e12" />
            <stop offset="1" stopColor="#050608" />
          </linearGradient>
          <radialGradient id="cluster">
            <stop offset="0" stopColor="#1d3550" stopOpacity="0.8" />
            <stop offset="1" stopColor="#1d3550" stopOpacity="0" />
          </radialGradient>
          <linearGradient id={fid("sheen")} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0.3" stopColor="#fff" stopOpacity="0" />
            <stop offset="0.45" stopColor="#fff" stopOpacity="0.05" />
            <stop offset="0.6" stopColor="#fff" stopOpacity="0" />
          </linearGradient>
        </defs>

        <g id={fid("out")}>
          <Outside t={t} />
          <Drops t={t} />
        </g>

        {/* capa empañada: escena desenfocada + neblina + textura de condensación */}
        {fog > 0.001 ? (
          <g mask={`url(#${fid("mask")})`}>
            <use href={`#${fid("out")}`} filter={`url(#${fid("blur")})`} />
            <rect width={WIDTH} height={HEIGHT} fill="#93a1b0" opacity={hazeOpacity} />
            <rect width={WIDTH} height={HEIGHT} filter={`url(#${fid("tex")})`} opacity={0.35} />
            <rect width={WIDTH} height={HEIGHT} filter={`url(#${fid("speck")})`} opacity={0.3} />
          </g>
        ) : null}

        <rect width={WIDTH} height={HEIGHT} fill={`url(#${fid("sheen")})`} />

        {showCabin ? (
          <g>
            {/* techo, pilares y espejo */}
            <path d={`M0 0 L${WIDTH} 0 L${WIDTH} 96 Q540 150 0 96 Z`} fill="#06070a" />
            <path d="M0 70 L170 118 L46 1360 L0 1360 Z" fill="#07080b" />
            <path d={`M${WIDTH} 70 L${WIDTH - 170} 118 L${WIDTH - 46} 1360 L${WIDTH} 1360 Z`} fill="#07080b" />
            <rect x={520} y={110} width={40} height={60} fill="#0a0b0f" />
            <rect x={380} y={160} width={320} height={96} rx={34} fill="#0d0f13" stroke="#1d2027" strokeWidth={3} />
            <rect x={398} y={176} width={284} height={64} rx={24} fill="#141822" opacity={0.9} />
            {/* tablero */}
            <path d={`M0 1350 Q540 1250 ${WIDTH} 1350 L${WIDTH} ${HEIGHT} L0 ${HEIGHT} Z`} fill={`url(#${fid("dash")})`} />
            {/* tablero de instrumentos y volante (vista del conductor) */}
            <ellipse cx={540} cy={1500} rx={300} ry={70} fill="url(#cluster)" />
            {[-150, 150].map((dx) => (
              <g key={dx}>
                <circle cx={540 + dx} cy={1500} r={92} fill="none" stroke="rgba(120,190,255,0.28)" strokeWidth={4} />
                <path d={`M${540 + dx - 70} ${1530} A76 76 0 1 1 ${540 + dx + 70} ${1530}`} fill="none" stroke="rgba(120,190,255,0.5)" strokeWidth={6} strokeDasharray="3 13" />
              </g>
            ))}
            <path d="M80 1920 Q90 1450 540 1430 Q990 1450 1000 1920" fill="none" stroke="#0e1014" strokeWidth={96} />
            <path d="M80 1920 Q90 1450 540 1430 Q990 1450 1000 1920" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={3} transform="translate(0 -46)" />
            <path d="M540 1430 L540 1620" stroke="#0e1014" strokeWidth={70} />
            {/* salidas del desempañador */}
            {Array.from({ length: 13 }, (_, i) => {
              const x = 250 + i * 48;
              const y = 1300 + Math.pow((x - 540) / 540, 2) * 70 - 6;
              return (
                <rect
                  key={i}
                  x={x - 18}
                  y={y}
                  width={36}
                  height={7}
                  rx={3.5}
                  fill={vents > 0.01 ? `rgba(190,230,255,${0.25 + 0.6 * vents})` : "#161920"}
                  style={vents > 0.01 ? { filter: `drop-shadow(0 0 ${10 * vents}px rgba(140,210,255,0.9))` } : undefined}
                />
              );
            })}
          </g>
        ) : null}
      </svg>
    </AbsoluteFill>
  );
};
