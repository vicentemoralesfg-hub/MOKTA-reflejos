import React from "react";
import { C } from "../theme";

/**
 * Sedán de perfil (frente a la derecha), dibujado en un viewBox 1000×400.
 * Todo el daño es paramétrico para poder animarlo: abolladuras, rayas, parachoques caído,
 * frente/trasera aplastados, pilar doblado, piso del maletero arrugado, airbags, rayos X, corrosión.
 */

export type PartId =
  | "bumperBeam" | "crashBox" | "radiator" | "support" | "rail" | "engine"
  | "floor" | "rearRail" | "trunkFloor" | "pillarA" | "pillarB" | "pillarC" | "roofRail"
  | "airbagFront" | "airbagCurtain" | "srs" | "harness" | "ecu" | "bcm" | "seats" | "pretensioner";

export type PartStyle = { color?: string; glow?: number; opacity?: number };

export type Dent = { x: number; y: number; rx: number; ry: number; k?: number };

export type CarProps = {
  id: string; // prefijo único para gradientes
  paint?: string;
  width?: number;
  style?: React.CSSProperties;
  wheelRot?: number;
  dents?: Dent[];
  dentK?: number; // 0..1 intensidad global
  scratches?: number; // 0..1
  scuffs?: number; // 0..1 (manchas de pintura saltada)
  brokenHeadlight?: number;
  crackedGlass?: number;
  bumperDrop?: number; // 0..1 parachoques delantero colgando
  bumperCrack?: number; // 0..1 trizadura leve
  frontCrush?: number;
  rearCrush?: number;
  pillarBend?: number;
  floorWrinkle?: number;
  airbag?: number; // 0..1 despliegue
  xray?: number; // 0..1
  parts?: Partial<Record<PartId, PartStyle>>;
  corrosion?: number;
  shine?: number; // brillo extra (auto "impecable")
  waterLine?: number; // 0..1 nivel de agua dentro del dibujo (0 = nada)
  t?: number; // fotograma, para animaciones internas (chispas, brillo)
  showShadow?: boolean;
};

// ---------------------------------------------------------------- geometría
type P = [number, number];

const crushFront = (p: P, c: number): P => {
  if (c <= 0 || p[0] < 740) return p;
  const t = Math.min(1, (p[0] - 740) / 245);
  const dx = -c * 105 * Math.pow(t, 1.15);
  let dy = 0;
  if (p[1] < 262) dy = -c * 22 * Math.sin(Math.PI * t) + c * 7 * Math.sin(p[0] * 0.11) * t;
  return [p[0] + dx, p[1] + dy];
};
const crushRear = (p: P, c: number): P => {
  if (c <= 0 || p[0] > 250) return p;
  const t = Math.min(1, (250 - p[0]) / 220);
  const dx = c * 80 * Math.pow(t, 1.15);
  let dy = 0;
  if (p[1] < 262) dy = -c * 16 * Math.sin(Math.PI * t) + c * 6 * Math.sin(p[0] * 0.13) * t;
  return [p[0] + dx, p[1] + dy];
};

type Cmd = [string, ...number[]];
const BODY: Cmd[] = [
  ["M", 44, 302],
  ["L", 34, 262],
  ["Q", 30, 228, 58, 218],
  ["L", 168, 204],
  ["Q", 196, 200, 214, 190],
  ["L", 318, 124],
  ["Q", 336, 110, 372, 108],
  ["L", 586, 106],
  ["Q", 618, 108, 640, 122],
  ["L", 752, 194],
  ["Q", 770, 202, 800, 204],
  ["L", 910, 212],
  ["Q", 962, 218, 974, 244],
  ["L", 982, 282],
  ["Q", 984, 302, 966, 306],
  ["L", 874, 306],
  ["Q", 872, 226, 780, 226],
  ["Q", 688, 226, 686, 306],
  ["L", 326, 306],
  ["Q", 324, 226, 232, 226],
  ["Q", 140, 226, 138, 306],
  ["Z"],
];

const GLASS: Cmd[] = [
  ["M", 336, 126],
  ["Q", 350, 116, 376, 115],
  ["L", 584, 113],
  ["Q", 610, 115, 628, 128],
  ["L", 726, 196],
  ["L", 290, 198],
  ["Z"],
];

const pathOf = (cmds: Cmd[], f: (p: P) => P) =>
  cmds
    .map(([c, ...n]) => {
      const out: number[] = [];
      for (let i = 0; i < n.length; i += 2) {
        const q = f([n[i], n[i + 1]]);
        out.push(Math.round(q[0] * 10) / 10, Math.round(q[1] * 10) / 10);
      }
      return c + out.join(" ");
    })
    .join(" ");

const poly = (pts: P[], f: (p: P) => P, close = false) =>
  "M" + pts.map((p) => f(p).map((v) => Math.round(v * 10) / 10).join(" ")).join(" L") + (close ? " Z" : "");

// ---------------------------------------------------------------- componente
export const Car: React.FC<CarProps> = ({
  id,
  paint = C.blue,
  width = 900,
  style,
  wheelRot = 0,
  dents = [],
  dentK = 1,
  scratches = 0,
  scuffs = 0,
  brokenHeadlight = 0,
  crackedGlass = 0,
  bumperDrop = 0,
  bumperCrack = 0,
  frontCrush = 0,
  rearCrush = 0,
  pillarBend = 0,
  floorWrinkle = 0,
  airbag = 0,
  xray = 0,
  parts = {},
  corrosion = 0,
  shine = 0,
  waterLine = 0,
  t = 0,
  showShadow = true,
}) => {
  const f = (p: P): P => crushRear(crushFront(p, frontCrush), rearCrush);
  const body = pathOf(BODY, f);
  const glass = pathOf(GLASS, f);
  const solid = 1 - xray;
  const g = (s: string) => `${id}-${s}`;
  const xr = C.cyan;

  const part = (pid: PartId, base: string): { stroke: string; fill: string; op: number; glow: number } => {
    const ps = parts[pid] ?? {};
    const col = ps.color ?? base;
    return { stroke: col, fill: col, op: (ps.opacity ?? 1) * xray, glow: ps.glow ?? 0 };
  };
  const glowF = (gl: number) => (gl > 0 ? `drop-shadow(0 0 ${6 + gl * 22}px ${"currentColor"})` : undefined);

  // --- piezas internas (rayos X)
  const P_ = (pid: PartId, base: string, el: React.ReactNode) => {
    const s = part(pid, base);
    if (s.op <= 0.001) return null;
    return (
      <g key={pid} style={{ color: s.stroke, opacity: s.op, filter: glowF(s.glow) }}>
        {el}
      </g>
    );
  };

  const railKink = frontCrush * 20;
  const railPts: P[] = [
    [720, 296], [770, 262], [850, 262 - railKink * 0.4], [895, 262 + railKink], [940, 262], [940, 282], [895, 282 + railKink], [850, 282 - railKink * 0.4], [776, 282], [728, 304],
  ];
  const bendB = pillarBend * 34;
  const wr = floorWrinkle;
  const trunkFloor: P[] = [];
  for (let i = 0; i <= 16; i++) {
    const x = 48 + i * 11;
    const amp = wr * (i % 2 === 0 ? -14 : 12) * Math.sin((Math.PI * i) / 16);
    trunkFloor.push([x, 288 + amp]);
  }

  const internal = (
    <g fill="none" strokeLinecap="round" strokeLinejoin="round">
      {P_("seats", "rgba(150,220,255,0.55)",
        <g stroke="currentColor" strokeWidth={4} fill="currentColor" fillOpacity={0.12}>
          <path d="M560 290 L560 250 Q560 238 572 238 L630 238 L636 252 L604 254 L600 290 Z" />
          <path d="M572 238 L558 150 Q556 138 566 140 L580 142 L594 236" />
          <path d="M350 292 L350 252 L440 252 L440 292 Z" />
          <path d="M352 252 L338 160 Q338 150 348 152 L362 156 L372 250" />
        </g>)}
      {P_("harness", "#FFB547",
        <path stroke="currentColor" strokeWidth={5} strokeDasharray="2 0"
          d="M880 238 C 840 260, 790 250, 760 270 S 700 292, 640 290 S 520 294, 430 288 S 250 292, 180 280 S 90 262, 60 240" />)}
      {P_("ecu", "#FFB547",
        <g stroke="currentColor" strokeWidth={4} fill="currentColor" fillOpacity={0.35}>
          <rect x={846} y={226} width={30} height={20} rx={3} />
        </g>)}
      {P_("bcm", "#FFB547",
        <g stroke="currentColor" strokeWidth={4} fill="currentColor" fillOpacity={0.35}>
          <rect x={414} y={268} width={30} height={18} rx={3} />
        </g>)}
      {P_("srs", "#FF5A7A",
        <g stroke="currentColor" strokeWidth={4} fill="currentColor" fillOpacity={0.4}>
          <rect x={656} y={262} width={30} height={18} rx={3} />
        </g>)}
      {P_("pretensioner", "#FF5A7A",
        <g stroke="currentColor" strokeWidth={4} fill="currentColor" fillOpacity={0.4}>
          <circle cx={520} cy={280} r={9} />
          <path d="M520 271 L520 140" strokeDasharray="6 5" />
        </g>)}
      {P_("floor", xr,
        <path stroke="currentColor" strokeWidth={9} d={poly([[140, 300], [880, 300]], f)} />)}
      {P_("rearRail", xr,
        <path stroke="currentColor" strokeWidth={6} fill="currentColor" fillOpacity={0.18}
          d={poly([[40, 262], [210, 262], [240, 294], [240, 302], [205, 280], [40, 280]], f, true)} />)}
      {P_("trunkFloor", xr, <path stroke="currentColor" strokeWidth={7} d={poly(trunkFloor, f)} />)}
      {P_("rail", xr,
        <path stroke="currentColor" strokeWidth={6} fill="currentColor" fillOpacity={0.22} d={poly(railPts, f, true)} />)}
      {P_("engine", "rgba(170,230,255,0.9)",
        <g stroke="currentColor" strokeWidth={4} fill="currentColor" fillOpacity={0.12}>
          <path d={poly([[800, 218], [900, 218], [906, 288], [796, 288]], (p) => f([p[0] + frontCrush * 0, p[1]]), true)} />
          <path d={poly([[812, 232], [890, 232]], f)} />
          <path d={poly([[812, 250], [890, 250]], f)} />
        </g>)}
      {P_("support", xr,
        <path stroke="currentColor" strokeWidth={5} d={poly([[906, 210], [944, 214], [944, 298], [906, 298]], f, true)} />)}
      {P_("radiator", "#7CF7FF",
        <g stroke="currentColor" strokeWidth={4} fill="currentColor" fillOpacity={0.25}>
          <path d={poly([[914, 218], [934, 220], [934, 290], [914, 290]], f, true)} />
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <path key={i} d={poly([[914, 228 + i * 11], [934, 228 + i * 11]], f)} />
          ))}
        </g>)}
      {P_("crashBox", xr,
        <path stroke="currentColor" strokeWidth={5} fill="currentColor" fillOpacity={0.25}
          d={poly([[944, 254], [972, 254], [972, 276], [944, 276]], f, true)} />)}
      {P_("bumperBeam", xr,
        <path stroke="currentColor" strokeWidth={6} fill="currentColor" fillOpacity={0.3}
          d={poly([[972, 236], [984, 238], [986, 296], [972, 298]], f, true)} />)}
      {P_("pillarA", xr, <path stroke="currentColor" strokeWidth={10} d={poly([[632, 120], [752, 198]], f)} />)}
      {P_("pillarB", xr,
        <path stroke="currentColor" strokeWidth={12} d={`M507 110 Q ${507 - bendB} 210 507 302`} />)}
      {P_("pillarC", xr, <path stroke="currentColor" strokeWidth={10} d={poly([[328, 120], [214, 196]], f)} />)}
      {P_("roofRail", xr,
        <path stroke="currentColor" strokeWidth={9} d={pathOf([["M", 322, 124], ["Q", 338, 110, 372, 108], ["L", 586, 106], ["Q", 618, 108, 640, 122]], f)} />)}
      {P_("airbagFront", "#FFE14A",
        <g stroke="currentColor" strokeWidth={4} fill="currentColor" fillOpacity={0.18}>
          <circle cx={694} cy={206} r={10} />
        </g>)}
      {P_("airbagCurtain", "#FFE14A",
        <path stroke="currentColor" strokeWidth={4} fill="currentColor" fillOpacity={0.15} d="M350 122 L600 118 L606 128 L350 132 Z" />)}
    </g>
  );

  // --- airbags desplegados (se ven con y sin rayos X)
  const ab = airbag;
  const airbags =
    ab > 0 ? (
      <g>
        <ellipse cx={680} cy={200} rx={70 * ab} ry={58 * ab} fill="#FFF6D6" stroke="#E8D9A8" strokeWidth={3} opacity={Math.min(1, ab * 2)} />
        <ellipse cx={668} cy={190} rx={30 * ab} ry={20 * ab} fill="#FFFFFF" opacity={0.7 * ab} />
        <path
          d={`M346 ${122} L604 118 L612 ${118 + 62 * ab} Q480 ${126 + 72 * ab} 340 ${122 + 60 * ab} Z`}
          fill="#FFF6D6" stroke="#E8D9A8" strokeWidth={3} opacity={Math.min(1, ab * 2) * 0.95}
        />
      </g>
    ) : null;

  const lightX = 0.5 + 0.5 * Math.sin(t * 0.05);

  return (
    <svg viewBox="0 0 1000 400" width={width} height={(width * 400) / 1000} style={{ overflow: "visible", ...style }}>
      <defs>
        <linearGradient id={g("paint")} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#FFFFFF" stopOpacity={0.55} />
          <stop offset="0.18" stopColor={paint} />
          <stop offset="0.62" stopColor={paint} />
          <stop offset="1" stopColor="#000" stopOpacity={0.55} />
        </linearGradient>
        <linearGradient id={g("paintBase")} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={paint} />
          <stop offset="1" stopColor={paint} />
        </linearGradient>
        <linearGradient id={g("glass")} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#4A6A9A" />
          <stop offset="0.5" stopColor="#0E1A33" />
          <stop offset="1" stopColor="#1C2E52" />
        </linearGradient>
        <radialGradient id={g("dent")}>
          <stop offset="0" stopColor="#000" stopOpacity={0.85} />
          <stop offset="0.55" stopColor="#000" stopOpacity={0.45} />
          <stop offset="1" stopColor="#000" stopOpacity={0} />
        </radialGradient>
        <radialGradient id={g("rust")}>
          <stop offset="0" stopColor={C.rust} stopOpacity={0.95} />
          <stop offset="0.7" stopColor="#7A3510" stopOpacity={0.6} />
          <stop offset="1" stopColor="#7A3510" stopOpacity={0} />
        </radialGradient>
        <linearGradient id={g("sheen")} x1="0" y1="0" x2="1" y2="0">
          <stop offset={Math.max(0, lightX - 0.15)} stopColor="#fff" stopOpacity={0} />
          <stop offset={lightX} stopColor="#fff" stopOpacity={0.55} />
          <stop offset={Math.min(1, lightX + 0.15)} stopColor="#fff" stopOpacity={0} />
        </linearGradient>
        <clipPath id={g("bodyClip")}>
          <path d={body} />
        </clipPath>
        <linearGradient id={g("water")} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#5CC8FF" stopOpacity={0.75} />
          <stop offset="1" stopColor="#0A4FA8" stopOpacity={0.9} />
        </linearGradient>
      </defs>

      {showShadow && <ellipse cx={510} cy={388} rx={470} ry={18} fill="#000" opacity={0.45} />}

      {/* ---------- carrocería sólida ---------- */}
      <g opacity={solid}>
        <path d={body} fill={`url(#${g("paint")})`} />
        <path d={glass} fill={`url(#${g("glass")})`} />
        {/* reflejos del vidrio */}
        <g clipPath={`url(#${g("bodyClip")})`} opacity={0.5}>
          <path d="M420 112 L470 112 L400 200 L350 200 Z" fill="#fff" opacity={0.18} />
          <path d="M600 112 L620 112 L560 200 L540 200 Z" fill="#fff" opacity={0.14} />
        </g>
        {/* pilar B */}
        <rect x={498} y={112} width={18} height={88} fill={paint} />
        <rect x={498} y={112} width={18} height={88} fill="#000" opacity={0.35} />
        {/* línea de hombro (brillo) */}
        <path d={poly([[214, 204], [520, 206], [905, 214]], f)} stroke="#fff" strokeOpacity={0.45 + shine * 0.4} strokeWidth={4} fill="none" />
        {/* líneas de puertas */}
        <g stroke="#000" strokeOpacity={0.55} strokeWidth={3} fill="none">
          <path d="M296 204 L318 300" />
          <path d="M507 200 L507 304" />
          <path d={poly([[728, 198], [742, 292]], f)} />
          <path d={poly([[300, 300], [745, 300]], f)} />
        </g>
        {/* manillas */}
        <rect x={430} y={222} width={44} height={9} rx={4} fill="#000" opacity={0.45} />
        <rect x={640} y={222} width={44} height={9} rx={4} fill="#000" opacity={0.45} />
        {/* espejo */}
        <path d="M704 196 L728 190 Q738 190 736 202 L712 206 Z" fill={paint} stroke="#000" strokeOpacity={0.4} strokeWidth={2} />
        {/* faro y foco trasero */}
        <path d={poly([[922, 224], [968, 230], [974, 248], [930, 246]], f, true)} fill="#EAF6FF" />
        <path d={poly([[930, 230], [962, 234], [966, 244], [934, 242]], f, true)} fill={C.cyan} opacity={0.5} />
        <path d={poly([[34, 230], [64, 224], [66, 246], [36, 250]], f, true)} fill="#FF2340" />
        {/* parrilla */}
        <path d={poly([[948, 262], [980, 266]], f)} stroke="#000" strokeOpacity={0.6} strokeWidth={5} />
        <path d={poly([[946, 280], [982, 284]], f)} stroke="#000" strokeOpacity={0.5} strokeWidth={4} />
        {/* brillo que recorre la pintura */}
        <g clipPath={`url(#${g("bodyClip")})`}>
          <rect x={0} y={0} width={1000} height={400} fill={`url(#${g("sheen")})`} opacity={0.25 + shine * 0.6} />
          {/* abolladuras */}
          {dents.map((d, i) => (
            <g key={i} opacity={(d.k ?? 1) * dentK}>
              <ellipse cx={d.x} cy={d.y} rx={d.rx} ry={d.ry} fill={`url(#${g("dent")})`} />
              <ellipse cx={d.x - d.rx * 0.25} cy={d.y - d.ry * 0.35} rx={d.rx * 0.5} ry={d.ry * 0.28} fill="#fff" opacity={0.28} />
              <path
                d={`M${d.x - d.rx * 0.9} ${d.y - d.ry * 0.1} Q ${d.x - d.rx * 0.2} ${d.y - d.ry * 1.0} ${d.x + d.rx * 0.9} ${d.y - d.ry * 0.25}`}
                stroke="#fff" strokeOpacity={0.75} strokeWidth={3} fill="none"
              />
              <path
                d={`M${d.x - d.rx * 0.7} ${d.y + d.ry * 0.3} L ${d.x - d.rx * 0.1} ${d.y - d.ry * 0.05} L ${d.x + d.rx * 0.35} ${d.y + d.ry * 0.45} L ${d.x + d.rx * 0.75} ${d.y + d.ry * 0.2}`}
                stroke="#000" strokeOpacity={0.7} strokeWidth={3.5} fill="none" strokeLinejoin="round"
              />
            </g>
          ))}
          {/* rayas */}
          {scratches > 0 && (
            <g stroke="#E9EEF5" strokeWidth={2} strokeLinecap="round" opacity={scratches}>
              {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
                <path key={i} d={`M${340 + i * 38} ${236 + (i % 3) * 9} l ${70 + (i % 4) * 14} ${-6 + (i % 2) * 10}`} />
              ))}
              {[0, 1, 2, 3].map((i) => (
                <path key={`b${i}`} d={`M${150 + i * 22} ${238 + i * 7} l 48 -4`} />
              ))}
            </g>
          )}
          {/* pintura saltada */}
          {scuffs > 0 && (
            <g opacity={scuffs}>
              <path d="M612 262 l 40 -8 l 26 14 l -18 18 l -44 -4 Z" fill="#AEB7C2" />
              <path d="M170 250 l 32 -6 l 14 16 l -30 10 Z" fill="#AEB7C2" />
              <path d="M930 286 l 36 2 l 6 14 l -40 2 Z" fill="#AEB7C2" />
            </g>
          )}
          {/* corrosión */}
          {corrosion > 0 && (
            <g opacity={corrosion}>
              {[
                [300, 296, 40], [480, 292, 52], [700, 296, 36], [880, 290, 30], [120, 294, 34], [560, 286, 28],
              ].map(([x, y, r], i) => (
                <ellipse key={i} cx={x} cy={y - 8} rx={r * 1.4 * (0.6 + 0.4 * corrosion)} ry={r * 0.7 * (0.6 + 0.4 * corrosion)} fill={`url(#${g("rust")})`} />
              ))}
            </g>
          )}
        </g>
        {/* faro roto */}
        {brokenHeadlight > 0 && (
          <g opacity={brokenHeadlight}>
            <path d={poly([[922, 224], [968, 230], [974, 248], [930, 246]], f, true)} fill="#1B2533" />
            <path d="M936 228 L950 240 L944 247 M950 240 L966 236 M950 240 L960 248" stroke="#CFE8FF" strokeWidth={2} fill="none" />
          </g>
        )}
        {/* vidrio trizado */}
        {crackedGlass > 0 && (
          <g stroke="#E8F4FF" strokeWidth={1.8} fill="none" opacity={crackedGlass}>
            <path d="M650 160 L620 130 M650 160 L700 150 M650 160 L640 196 M650 160 L606 176 M650 160 L688 190 M632 142 L612 152 M676 154 L690 132" />
            <circle cx={650} cy={160} r={10} />
          </g>
        )}
        {/* parachoques delantero colgando */}
        {bumperDrop > 0 && (
          <g>
            <path d={poly([[906, 256], [978, 262], [984, 300], [906, 306]], f, true)} fill="#0B0F1A" />
            <g transform={`rotate(${bumperDrop * 16} 906 258)`}>
              <path d={poly([[906, 256], [978, 262], [984, 300], [966, 306], [906, 306]], f, true)} fill={`url(#${g("paint")})`} stroke="#000" strokeOpacity={0.5} strokeWidth={2} />
              <path d={poly([[946, 280], [982, 284]], f)} stroke="#000" strokeOpacity={0.5} strokeWidth={4} />
            </g>
          </g>
        )}
        {bumperCrack > 0 && (
          <path d="M958 262 L948 274 L956 282 L946 296" stroke="#0B0F1A" strokeWidth={3} fill="none" opacity={bumperCrack} />
        )}
        {/* parachoques trasero (separación) */}
        <path d={poly([[36, 258], [120, 256]], f)} stroke="#000" strokeOpacity={0.4} strokeWidth={3} />
      </g>

      {/* ---------- rayos X ---------- */}
      {xray > 0 && (
        <g>
          <path d={body} fill={C.cyan} fillOpacity={0.06 * xray} stroke={C.cyan} strokeOpacity={0.9 * xray} strokeWidth={3}
            style={{ filter: `drop-shadow(0 0 8px ${C.cyan})` }} />
          <path d={glass} fill="none" stroke={C.cyan} strokeOpacity={0.4 * xray} strokeWidth={2} />
          {internal}
        </g>
      )}

      {/* agua dentro del auto */}
      {waterLine > 0 && (
        <g clipPath={`url(#${g("bodyClip")})`}>
          <path
            d={`M0 ${400 - waterLine * 300} ${Array.from({ length: 21 }, (_, i) => `L${i * 50} ${400 - waterLine * 300 + Math.sin(i * 0.9 + t * 0.25) * 6}`).join(" ")} L1000 400 L0 400 Z`}
            fill={`url(#${g("water")})`}
          />
        </g>
      )}

      {airbags}

      {/* ruedas */}
      {[232, 780].map((cx) => {
        const p = f([cx, 318]);
        return (
          <g key={cx} transform={`translate(${p[0]} ${318}) rotate(${wheelRot})`}>
            <circle r={68} fill="#0B0D12" opacity={solid + xray * 0.3} />
            <circle r={68} fill="none" stroke={C.cyan} strokeOpacity={xray * 0.8} strokeWidth={3} />
            <circle r={44} fill="#AEB8C6" opacity={solid} />
            <circle r={44} fill="none" stroke={C.cyan} strokeOpacity={xray * 0.7} strokeWidth={2} />
            {[0, 72, 144, 216, 288].map((a) => (
              <rect key={a} x={-5} y={-42} width={10} height={36} rx={4} fill="#5B6676" opacity={solid} transform={`rotate(${a})`} />
            ))}
            <circle r={11} fill="#2A303B" opacity={solid} />
          </g>
        );
      })}
    </svg>
  );
};
