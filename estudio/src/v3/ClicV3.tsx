import React from "react";
import { AbsoluteFill, interpolate, staticFile, useCurrentFrame } from "remotion";
import { Audio } from "@remotion/media";
import { Captions } from "../v2/comp/Captions";
import { VO, seg, total, wordAt } from "../v2/lib/vo";
import voJson from "../vo/clic.json";
import { BACK_OUT, Chip, DISPLAY, Decode, EASE_IN_OUT, EASE_OUT, Flash, MONO, Neon, Particles, Stage, Theme, ThemeP, alpha, glow, punch, ramp, shake } from "./kit";

/**
 * Reel v3 · "¿Lleno o hasta el clic?"
 * Un solo mundo vectorial 2.5D: la pistola (detalle) vive DENTRO del cuello del estanque. La cámara entra al tubo,
 * muestra el orificio sensor y el CLIC, y luego sale en un zoom-out continuo hasta revelar estanque + cánister.
 * Color con función: cian/verde = bencina que fluye bien · naranja/rojo = bencina donde no debe llegar.
 */
export const CLIC3_VO = voJson as VO;
const vo = CLIC3_VO;
export const CLIC3_TOTAL = total(vo, 1.6);

const TH: Theme = { bg0: "#020814", bg1: "#0A1F3D", a1: "#00F0FF", a2: "#39FF88", hot: "#FF4D2E", text: "#F2F7FF", ink: "#03101C" };
const CY = TH.a1, GR = TH.a2, HOT = TH.hot, ORG = "#FF9F1C";
const STEEL = "rgba(190,225,255,0.95)";

/* mundo: coordenadas del sistema completo (1080×1920). El detalle de la pistola se dibuja a escala 1/Z dentro del cuello. */
const NECK = { x: 770, w: 46, top: 600, bottom: 1012 };
const Z = 320 / NECK.w; // el cuello del detalle mide 320 px de ancho
const NX = NECK.x + NECK.w / 2 - 540 / Z;
const NY = NECK.top - 760 / Z;

const Defs: React.FC<{ danger: number }> = ({ danger }) => {
  const c1 = danger > 0.5 ? ORG : CY;
  const c2 = danger > 0.5 ? HOT : GR;
  return (
    <defs>
      <linearGradient id="steel" x1="0" x2="1">
        <stop offset="0" stopColor="#141B28" />
        <stop offset="0.18" stopColor="#56677F" />
        <stop offset="0.32" stopColor="#C9D6E8" />
        <stop offset="0.45" stopColor="#5D6E86" />
        <stop offset="0.8" stopColor="#202A3A" />
        <stop offset="1" stopColor="#0F141E" />
      </linearGradient>
      <linearGradient id="steelV" x1="0" x2="0" y1="0" y2="1">
        <stop offset="0" stopColor="#7C8DA6" />
        <stop offset="0.25" stopColor="#D8E3F2" />
        <stop offset="0.5" stopColor="#4C5B71" />
        <stop offset="1" stopColor="#151C28" />
      </linearGradient>
      <linearGradient id="fuel" x1="0" x2="0" y1="0" y2="1">
        <stop offset="0" stopColor={CY} />
        <stop offset="1" stopColor={GR} />
      </linearGradient>
      <linearGradient id="fuelD" x1="0" x2="0" y1="0" y2="1">
        <stop offset="0" stopColor={c1} />
        <stop offset="1" stopColor={c2} />
      </linearGradient>
      <linearGradient id="danger" x1="0" x2="0" y1="0" y2="1">
        <stop offset="0" stopColor={ORG} />
        <stop offset="1" stopColor={HOT} />
      </linearGradient>
      <linearGradient id="glass" x1="0" x2="1" y1="0" y2="1">
        <stop offset="0" stopColor="rgba(160,220,255,0.18)" />
        <stop offset="0.5" stopColor="rgba(160,220,255,0.04)" />
        <stop offset="1" stopColor="rgba(160,220,255,0.12)" />
      </linearGradient>
      <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="7" result="b" />
        <feMerge>
          <feMergeNode in="b" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
      <filter id="glowS" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="2.5" result="b" />
        <feMerge>
          <feMergeNode in="b" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
      <filter id="shadow" x="-30%" y="-30%" width="160%" height="160%">
        <feDropShadow dx="0" dy="18" stdDeviation="16" floodColor="#000" floodOpacity="0.7" />
      </filter>
      <pattern id="carbon" width="18" height="18" patternUnits="userSpaceOnUse">
        <circle cx="5" cy="5" r="3.6" fill="#1D2633" />
        <circle cx="14" cy="13" r="4.2" fill="#121A25" />
        <circle cx="5" cy="5" r="1.4" fill="#3B4A60" />
      </pattern>
      <clipPath id="neckIn">
        <rect x={392} y={760} width={296} height={1000} />
      </clipPath>
      <clipPath id="spoutIn">
        <rect x={514} y={560} width={52} height={560} />
      </clipPath>
    </defs>
  );
};

/** La pistola dentro del cuello (coordenadas de detalle). */
const Nozzle: React.FC<{ f: number; level: number; air: number; vac: number; shut: number; flow: number; lab: Record<string, number> }> = ({ f, level, air, vac, shut, flow, lab }) => {
  const TIP = 1120, PORT = 1080;
  const surface = 1700 - level;
  const covered = surface <= PORT + 4;
  const Label = ({ x, y, tx, ty, text, o, color = STEEL, end = false }: { x: number; y: number; tx: number; ty: number; text: string; o: number; color?: string; end?: boolean }) =>
    o > 0.01 ? (
      <g opacity={o} filter="url(#glowS)">
        <circle cx={x} cy={y} r={8} fill={color} />
        <polyline points={`${x},${y} ${tx},${ty} ${end ? tx - 34 : tx + 34},${ty}`} fill="none" stroke={color} strokeWidth={3} />
        <rect x={end ? tx - 44 - text.length * 19.5 : tx + 40} y={ty - 26} width={text.length * 19.5 + 8} height={50} rx={10} fill="rgba(2,8,20,0.85)" stroke={color} strokeWidth={2} />
        <text x={end ? tx - 40 : tx + 44} y={ty + 11} textAnchor={end ? "end" : "start"} fontFamily="Inter" fontWeight={800} fontSize={30} letterSpacing={1} fill={color}>
          {text}
        </text>
      </g>
    ) : null;
  return (
    <g>
      {/* cuello de llenado: vidrio con reflejo */}
      <rect x={380} y={760} width={320} height={1000} fill="url(#glass)" />
      <rect x={392} y={760} width={14} height={1000} fill="rgba(255,255,255,0.08)" />
      <g clipPath="url(#neckIn)">
        <path d={`M 380 ${surface} ${Array.from({ length: 9 }).map((_, i) => `L ${392 + i * 40} ${surface + Math.sin(f * 0.35 + i) * (flow > 0.1 ? 6 : 1.5)}`).join(" ")} L 720 ${surface} L 720 1800 L 380 1800 Z`} fill="url(#fuel)" opacity={0.92} filter="url(#glow)" />
        {Array.from({ length: 16 }).map((_, i) => {
          const yy = 1760 - ((i * 97 + f * (3 + (i % 4))) % Math.max(10, 1760 - surface));
          return yy > surface + 8 ? <circle key={i} cx={410 + ((i * 53) % 270)} cy={yy} r={3 + (i % 4) * 2} fill="rgba(255,255,255,0.55)" /> : null;
        })}
      </g>
      <line x1={380} y1={760} x2={380} y2={1760} stroke={STEEL} strokeWidth={5} />
      <line x1={700} y1={760} x2={700} y2={1760} stroke={STEEL} strokeWidth={5} />
      <rect x={346} y={734} width={388} height={30} rx={8} fill="url(#steelV)" filter="url(#shadow)" />

      {/* cuerpo de la pistola: metal con brillo */}
      <g filter="url(#shadow)">
        <path d="M 370 300 H 770 Q 806 300 806 336 V 534 Q 806 570 770 570 H 600 V 560 H 480 V 570 H 370 Q 334 570 334 534 V 336 Q 334 300 370 300 Z" fill="url(#steelV)" stroke="rgba(255,255,255,0.35)" strokeWidth={3} />
        <path d="M 360 318 H 780" stroke="rgba(255,255,255,0.55)" strokeWidth={6} strokeLinecap="round" />
        <path d="M 806 352 H 1040" stroke="#1B2433" strokeWidth={46} strokeLinecap="round" />
        <path d="M 806 344 H 1040" stroke="rgba(255,255,255,0.18)" strokeWidth={6} />
      </g>
      {/* conducto con flujo */}
      <path d="M 1040 352 H 600 V 520" fill="none" stroke="rgba(0,240,255,0.12)" strokeWidth={30} />
      {flow > 0.02 ? <path d="M 1040 352 H 600 V 520" fill="none" stroke={CY} strokeWidth={10} strokeDasharray="22 26" strokeDashoffset={-f * 9} opacity={flow} filter="url(#glowS)" /> : null}
      {/* válvula + resorte */}
      <g transform={`translate(0 ${-shut * 26})`}>
        <rect x={532} y={350} width={16} height={150} fill="#9AA6B8" />
        <rect x={500} y={490} width={80} height={16} rx={4} fill="#E3EBF5" />
      </g>
      <path d={`M 540 330 ${Array.from({ length: 8 }).map((_, i) => `L ${i % 2 ? 558 : 522} ${336 + i * (14 - shut * 4)}`).join(" ")}`} fill="none" stroke={shut > 0.5 ? TH.a2 : "#F4F6F8"} strokeWidth={5} filter={shut > 0.5 ? "url(#glowS)" : undefined} />
      {/* diafragma */}
      <circle cx={690} cy={470} r={60} fill="rgba(0,240,255,0.06)" stroke={STEEL} strokeWidth={4} />
      <path d={`M 630 470 Q 690 ${470 + 44 * vac} 750 470`} fill="none" stroke={vac > 0.5 ? CY : "#F4F6F8"} strokeWidth={6} filter={vac > 0.3 ? "url(#glowS)" : undefined} />
      <path d={`M 690 ${470 + 30 * vac} L 600 ${440 + 30 * vac} L 556 ${420 + 40 * shut}`} fill="none" stroke="#B9C6D8" strokeWidth={7} strokeLinecap="round" />
      {/* boquilla */}
      <rect x={498} y={560} width={84} height={TIP - 560} rx={8} fill="url(#steel)" />
      <g clipPath="url(#spoutIn)">
        <rect x={514} y={560} width={52} height={TIP - 560} fill="#06101E" />
        {flow > 0.02
          ? Array.from({ length: 14 }).map((_, i) => {
              const yy = 560 + ((i * 46 + f * 16) % (TIP - 560));
              return <rect key={i} x={522} y={yy} width={22} height={28} rx={10} fill={i % 3 ? CY : GR} opacity={0.9 * flow} filter="url(#glowS)" />;
            })
          : null}
      </g>
      {flow > 0.02 && !covered ? (
        <g opacity={0.85 * flow} filter="url(#glow)">
          <rect x={522} y={TIP} width={36} height={Math.max(0, surface - TIP)} rx={14} fill="url(#fuel)" />
          {Array.from({ length: 6 }).map((_, i) => (
            <circle key={i} cx={540 + Math.sin(i * 2 + f / 3) * 30} cy={surface - 6 - ((f * 5 + i * 13) % 40)} r={5} fill={GR} />
          ))}
        </g>
      ) : null}
      {/* tubo sensor + aire */}
      <path d={`M 574 ${PORT} V 600 Q 574 470 630 470`} fill="none" stroke={CY} strokeWidth={6} opacity={0.95} filter="url(#glowS)" />
      <circle cx={580} cy={PORT} r={11} fill={TH.bg0} stroke={covered ? GR : CY} strokeWidth={5} />
      {air > 0.02
        ? Array.from({ length: 7 }).map((_, i) => {
            const t = (f * 0.045 + i / 7) % 1;
            return <circle key={i} cx={574} cy={PORT - t * (PORT - 600)} r={7} fill="#E6FBFF" opacity={air * Math.sin(t * Math.PI)} filter="url(#glowS)" />;
          })
        : null}
      {air > 0.02
        ? [0, 1, 2].map((i) => {
            const t = (f * 0.07 + i / 3) % 1;
            return <circle key={i} cx={650 - t * 64} cy={PORT + 12 - t * 12} r={6} fill="#E6FBFF" opacity={air * Math.sin(t * Math.PI)} />;
          })
        : null}
      <Label x={580} y={PORT} tx={440} ty={960} text="ORIFICIO SENSOR" o={lab.port ?? 0} color={CY} end />
      <Label x={690} y={470} tx={740} ty={650} text="DIAFRAGMA" o={lab.dia ?? 0} />
      <Label x={540} y={360} tx={300} ty={230} text="RESORTE" o={lab.spring ?? 0} color={GR} end />
    </g>
  );
};

/** Estanque, línea de vapores, cánister y motor (coordenadas del mundo). */
const System: React.FC<{ f: number; neck: number; vline: number; soak: number; lab: number; danger: number }> = ({ f, neck, vline, soak, lab, danger }) => {
  const T = { x: 150, y: 1000, w: 660, h: 280 };
  const V = { x: 292, w: 18, top: 772, bottom: 1004 };
  const K = { x: 130, y: 600, w: 320, h: 172 };
  const surf = T.y + 22;
  const vTop = V.bottom - (V.bottom - V.top) * vline;
  return (
    <g>
      {/* motor y purga */}
      <g opacity={1 - soak * 0.7}>
        <rect x={K.x + 190} y={430} width={170} height={70} rx={14} fill="url(#steelV)" filter="url(#shadow)" />
        <text x={K.x + 275} y={476} textAnchor="middle" fontFamily="Inter" fontWeight={800} fontSize={26} fill="#0B1220">MOTOR</text>
        <line x1={K.x + 275} y1={500} x2={K.x + 275} y2={K.y} stroke={CY} strokeWidth={6} strokeDasharray="12 12" strokeDashoffset={f * 2} opacity={0.6} />
      </g>
      {/* cánister */}
      <g filter="url(#shadow)">
        <rect x={K.x} y={K.y} width={K.w} height={K.h} rx={24} fill="#0D1522" stroke={soak > 0.05 ? HOT : STEEL} strokeWidth={5} />
        <rect x={K.x + 14} y={K.y + 14} width={K.w - 28} height={K.h - 28} rx={14} fill="url(#carbon)" />
        <rect x={K.x + 14} y={K.y + 14 + (K.h - 28) * (1 - soak)} width={K.w - 28} height={(K.h - 28) * soak} rx={14} fill="url(#danger)" opacity={0.85} filter="url(#glow)" />
      </g>
      {soak > 0.05 ? <rect x={K.x - 14} y={K.y - 14} width={K.w + 28} height={K.h + 28} rx={34} fill="none" stroke={HOT} strokeWidth={4} opacity={soak * (0.5 + 0.5 * Math.sin(f * 0.5))} filter="url(#glow)" /> : null}
      {/* línea de vapores */}
      <rect x={V.x} y={V.top} width={V.w} height={V.bottom - V.top} rx={6} fill="rgba(160,220,255,0.06)" stroke={STEEL} strokeWidth={3} />
      {vline > 0.01 ? <rect x={V.x + 3} y={vTop} width={V.w - 6} height={V.bottom - vTop} rx={4} fill="url(#danger)" filter="url(#glow)" /> : null}
      {vline < 0.05
        ? [0, 1, 2, 3].map((i) => {
            const t = (f * 0.03 + i / 4) % 1;
            return <circle key={i} cx={V.x + V.w / 2} cy={V.bottom - t * (V.bottom - V.top)} r={5} fill="#E6FBFF" opacity={Math.sin(t * Math.PI) * 0.8} />;
          })
        : null}
      {/* estanque de vidrio */}
      <g filter="url(#shadow)">
        <rect x={T.x} y={T.y} width={T.w} height={T.h} rx={56} fill="url(#glass)" stroke={STEEL} strokeWidth={5} />
      </g>
      <clipPath id="tankC">
        <rect x={T.x} y={T.y} width={T.w} height={T.h} rx={56} />
      </clipPath>
      <g clipPath="url(#tankC)">
        <path d={`M ${T.x - 10} ${surf} ${Array.from({ length: 15 }).map((_, i) => `L ${T.x - 10 + (i + 1) * 50} ${surf + Math.sin(f * 0.3 + i) * 3}`).join(" ")} L ${T.x + T.w + 30} ${T.y + T.h + 10} L ${T.x - 10} ${T.y + T.h + 10} Z`} fill="url(#fuel)" opacity={0.85} />
        {Array.from({ length: 22 }).map((_, i) => {
          const yy = T.y + T.h - ((i * 37 + f * (1.5 + (i % 3))) % (T.h - 30));
          return <circle key={i} cx={T.x + 40 + ((i * 97) % (T.w - 80))} cy={yy} r={2 + (i % 4)} fill="rgba(255,255,255,0.5)" />;
        })}
        <rect x={T.x + 30} y={T.y + 14} width={T.w - 60} height={10} rx={5} fill="rgba(255,255,255,0.25)" />
      </g>
      {/* cuello (parte baja; la alta la dibuja el detalle) */}
      <rect x={NECK.x} y={NECK.top + 143} width={NECK.w} height={NECK.bottom - NECK.top - 143} fill="url(#glass)" stroke={STEEL} strokeWidth={4} />
      <rect x={NECK.x + 5} y={NECK.bottom - (NECK.bottom - NECK.top) * neck} width={NECK.w - 10} height={Math.max(0, (NECK.bottom - NECK.top) * neck - 2)} fill={danger > 0.5 ? "url(#fuelD)" : "url(#fuel)"} filter="url(#glowS)" />
      <g opacity={lab}>
        <text x={T.x + 50} y={T.y + T.h - 40} fontFamily="Inter" fontWeight={800} fontSize={30} letterSpacing={4} fill="#03101C" opacity={0.85}>ESTANQUE</text>
        <text x={K.x} y={K.y - 26} fontFamily="Inter" fontWeight={800} fontSize={34} letterSpacing={3} fill={soak > 0.05 ? HOT : CY} filter="url(#glowS)">CÁNISTER</text>
        <text x={K.x} y={K.y + K.h + 44} fontFamily="Inter" fontWeight={600} fontSize={25} fill={STEEL} opacity={0.8}>filtro de carbón · solo para vapores</text>
      </g>
    </g>
  );
};

const BigLine: React.FC<{ top: number; size: number; o?: number; s?: number; children: React.ReactNode }> = ({ top, size, o = 1, s = 1, children }) => (
  <div style={{ position: "absolute", top, left: 30, width: 1020, textAlign: "center", fontFamily: DISPLAY, fontWeight: 800, fontSize: size, lineHeight: 0.92, color: TH.text, opacity: o, transform: `scale(${s})`, textShadow: "0 10px 40px rgba(0,0,0,0.7)" }}>
    {children}
  </div>
);

export const ClicV3: React.FC<{ withAudio?: boolean }> = ({ withAudio = true }) => {
  const f = useCurrentFrame();
  const S = Object.fromEntries(vo.segments.map((s) => [s.id, seg(vo, s.id)]));
  const fClic = wordAt(vo, "click", ["clic"], S.click.f1 / 30 - 0.3);
  const fTapa = wordAt(vo, "click", ["tapa"]);
  const fVacio = wordAt(vo, "click", ["vacio"]);
  const fResorte = wordAt(vo, "click", ["resorte"]);
  const fHookClic = wordAt(vo, "hook", ["clic", "hasta"], S.hook.end - 0.3);

  // ---------- estado físico ----------
  const level = interpolate(f, [0, S.hole.f0, fTapa, fTapa + 12], [120, 300, 560, 640], { extrapolateRight: "clamp", easing: EASE_IN_OUT });
  const air = (f >= S.hole.f0 - 10 ? 1 : 0.6) * (1 - ramp(f, fTapa + 4, fTapa + 12));
  const vac = ramp(f, fVacio - 4, fResorte + 6);
  const shut = ramp(f, fClic - 2, fClic + 1, BACK_OUT);
  const flow = 1 - shut;
  const zA = S.over.f0 - 2; // inicio del zoom-out continuo
  const zB = zA + 34;
  const neck = 0.89 + 0.11 * ramp(f, zB, zB + 20);
  const vline = ramp(f, zB + 6, wordAt(vo, "over", ["canister", "cánister"]) + 10, EASE_IN_OUT);
  const soak = ramp(f, S.damage.f0 - 6, S.damage.f0 + 18);
  const danger = ramp(f, zB, zB + 30);

  // ---------- cámara ----------
  // detalle (coords de la pistola): gancho con zoom-in → punta → diafragma → encuadre neutro antes de salir
  const k = [0, 22, S.hole.f0 - 8, S.hole.f0 + 10, fTapa, fVacio, zA];
  const dS = interpolate(f, k, [1.3, 0.92, 0.92, 1.3, 1.3, 1.14, 1.0], { extrapolateRight: "clamp", easing: EASE_IN_OUT });
  const dY = interpolate(f, k, [520, 420, 420, -200, -240, 60, 0], { extrapolateRight: "clamp", easing: EASE_IN_OUT });
  // zoom-out continuo del mundo (escala logarítmica para que se sienta constante)
  const u = ramp(f, zA, zB, EASE_IN_OUT);
  const Zc = Math.pow(Z, 1 - u);
  const b = (1 / Zc - 1 / Z) / (1 - 1 / Z);
  const Wx = (NX + 540 / Z) * (1 - b) + 540 * b;
  const Wy = (NY + 960 / Z) * (1 - b) + 960 * b;
  const sk = shake(f, fClic, 18, 14);
  const df = ramp(f, S.damage.f0 - 4, S.damage.f0 + 22, EASE_IN_OUT) * (1 - ramp(f, S.cta.f0 - 4, S.cta.f0 + 10, EASE_IN_OUT));
  const world =
    f < zA
      ? `translate(${540 + sk.x} ${900 + dY + sk.y}) scale(${dS * (1 + punch(f, fClic, 0.06))}) translate(-540 -900) scale(${Z}) translate(${-NX} ${-NY})`
      : `translate(540 ${960 + 40 * (1 - u)}) scale(${Zc * (1 + 0.04 * Math.sin(Math.PI * u)) * (1 + 0.35 * df)}) translate(${-(Wx + (330 - 540) * df)} ${-(Wy + (790 - 960) * df)})`;

  const hookS = interpolate(f, [0, 20], [1.25, 1], { extrapolateRight: "clamp", easing: EASE_OUT }) + punch(f, fHookClic, 0.08);

  return (
    <ThemeP value={TH}>
      <Stage f={f} aurora={0.9} tint={danger > 0.5 ? HOT : TH.a2}>
        {/* grilla de plano técnico */}
        <AbsoluteFill style={{ backgroundImage: `linear-gradient(${alpha(CY, 0.08)} 1px, transparent 1px), linear-gradient(90deg, ${alpha(CY, 0.08)} 1px, transparent 1px)`, backgroundSize: "54px 54px", backgroundPosition: `0 ${f * 0.6}px` }} />
        <Particles f={f} n={36} kind="dust" color={danger > 0.5 ? ORG : CY} seed={3} o={0.5} />

        {/* ===== MUNDO (pistola dentro del cuello + sistema) ===== */}
        <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: "absolute", inset: 0, opacity: f < S.warn.f0 ? 0.55 + 0.45 * ramp(f, S.warn.f0 - 8, S.warn.f0) : 1, filter: f < S.warn.f0 ? `blur(${3 * (1 - ramp(f, S.warn.f0 - 8, S.warn.f0))}px)` : undefined }}>
          <Defs danger={danger} />
          <g transform={world}>
            <g opacity={ramp(f, zA, zA + 16)}>
              <System f={f} neck={neck} vline={vline} soak={soak} lab={ramp(f, zB - 4, zB + 10)} danger={danger} />
            </g>
            <g transform={`translate(${NX} ${NY}) scale(${1 / Z})`}>
              <Nozzle
                f={f}
                level={level}
                air={air}
                vac={vac}
                shut={shut}
                flow={flow}
                lab={{
                  port: ramp(f, S.hole.f0 + 4, S.hole.f0 + 12) * (1 - ramp(f, zA - 8, zA)),
                  dia: ramp(f, fVacio - 2, fVacio + 8) * (1 - ramp(f, zA - 8, zA)),
                  spring: ramp(f, fResorte - 2, fResorte + 8) * (1 - ramp(f, zA - 8, zA)),
                }}
              />
            </g>
          </g>
        </svg>

        {/* destello del clic */}
        <Flash f={f} at={fClic} color={GR} d={18} x={540} y={760} />
        <Flash f={f} at={-4} color={CY} d={18} x={540} y={520} />
        <Flash f={f} at={fHookClic} color={GR} d={14} x={540} y={600} ring={false} />

        {/* ===== GANCHO: terminal ===== */}
        {f < S.warn.f0 + 2 ? (
          <AbsoluteFill style={{ opacity: 1 - ramp(f, S.warn.f0 - 4, S.warn.f0 + 2), transform: `scale(${hookS})`, transformOrigin: "540px 560px" }}>
            <div style={{ position: "absolute", top: 250, left: 70, fontFamily: MONO, fontSize: 30, color: CY, textShadow: glow(CY, 0.4) }}>
              <Decode text="> MOKTA://diagnóstico_carga.exe" f={f} at={-8} cps={3} />
            </div>
            <div style={{ position: "absolute", top: 330, left: 30, width: 1020, textAlign: "center", fontFamily: DISPLAY, fontWeight: 800, lineHeight: 0.9 }}>
              <div style={{ fontSize: 210, color: TH.text, textShadow: glow(CY, 0.5) }}>
                <Decode text="¿LLENO" f={f} at={-4} cps={1.1} caret={false} />
              </div>
              <div style={{ fontSize: 132 }}>
                <Neon c={GR} k={1.2}>
                  <Decode text="O HASTA EL CLIC?" f={f} at={Math.max(9, fHookClic - 22)} cps={1.4} />
                </Neon>
              </div>
            </div>
            <div style={{ position: "absolute", top: 655, left: 0, width: 1080, display: "flex", justifyContent: "center", gap: 18, opacity: ramp(f, 30, 40) }}>
              <Chip c={GR} size={30}>● FLUJO OK</Chip>
              <Chip c={HOT} size={30}>▲ SOBRECARGA</Chip>
            </div>
          </AbsoluteFill>
        ) : null}

        {/* ===== ADVERTENCIA ===== */}
        {f >= S.warn.f0 - 2 && f < S.how.f0 + 2 ? (
          <AbsoluteFill style={{ opacity: Math.min(ramp(f, S.warn.f0 - 2, S.warn.f0 + 4), 1 - ramp(f, S.how.f0 - 3, S.how.f0 + 2)) }}>
            <AbsoluteFill style={{ background: `linear-gradient(180deg, ${alpha(HOT, 0.28)} 0%, transparent 40%)` }} />
            <BigLine top={240} size={104} s={1 + punch(f, S.warn.f0, 0.08)}>
              DESPUÉS DEL CLIC
              <br />
              <Neon c={HOT} k={1.3}>LE HACES DAÑO</Neon>
            </BigLine>
            <div style={{ position: "absolute", top: 500, left: 0, width: 1080, display: "flex", justifyContent: "center", opacity: ramp(f, S.warn.f0 + 10, S.warn.f0 + 18) }}>
              <Chip c={HOT} size={30}>⚠ A TU AUTO, NO A LA PISTOLA</Chip>
            </div>
          </AbsoluteFill>
        ) : null}

        {/* ===== ¿CÓMO SABE? ===== */}
        {f >= S.how.f0 - 2 && f < S.hole.f0 + 2 ? (
          <AbsoluteFill style={{ opacity: Math.min(ramp(f, S.how.f0 - 2, S.how.f0 + 4), 1 - ramp(f, S.hole.f0 - 4, S.hole.f0 + 2)) }}>
            <BigLine top={240} size={98}>
              ¿CÓMO SABE QUE
              <br />
              ESTÁ <Neon c={CY}>LLENO?</Neon>
            </BigLine>
            <div style={{ position: "absolute", top: 470, left: 0, width: 1080, display: "flex", justifyContent: "center", gap: 14 }}>
              {["0 SENSORES", "0 CHIPS", "0 BATERÍA"].map((t, i) => {
                const a = wordAt(vo, "how", ["nada"]) - 4 + i * 5;
                return (
                  <div key={t} style={{ opacity: ramp(f, a, a + 6), transform: `translateY(${20 * (1 - ramp(f, a, a + 8, BACK_OUT))}px)` }}>
                    <Chip c={i === 1 ? GR : CY} size={30}>{t}</Chip>
                  </div>
                );
              })}
            </div>
          </AbsoluteFill>
        ) : null}

        {/* ===== ¡CLIC! ===== */}
        {f >= fClic - 1 && f < zA + 10 ? (
          <div style={{ position: "absolute", top: 230, left: 0, width: 1080, textAlign: "center", fontFamily: DISPLAY, fontWeight: 800, fontSize: 240, lineHeight: 1, opacity: 1 - ramp(f, zA, zA + 10), transform: `scale(${interpolate(ramp(f, fClic - 1, fClic + 7, BACK_OUT), [0, 1], [1.8, 1])}) rotate(-4deg)` }}>
            <Neon c={GR} k={1.6}>¡CLIC!</Neon>
          </div>
        ) : null}

        {/* ===== SOBRECARGA ===== */}
        {f >= zA + 8 && f < S.damage.f0 + 2 ? (
          <AbsoluteFill style={{ opacity: Math.min(ramp(f, zA + 8, zA + 16), 1 - ramp(f, S.damage.f0 - 4, S.damage.f0 + 2)) }}>
            <BigLine top={240} size={92}>
              SI SIGUES CARGANDO…
              <br />
              <Neon c={ORG}>LLEGA AL CÁNISTER</Neon>
            </BigLine>
          </AbsoluteFill>
        ) : null}

        {/* ===== DAÑO ===== */}
        {f >= S.damage.f0 - 2 && f < S.cta.f0 + 2 ? (
          <AbsoluteFill style={{ opacity: Math.min(ramp(f, S.damage.f0 - 2, S.damage.f0 + 4), 1 - ramp(f, S.cta.f0 - 3, S.cta.f0 + 2)) }}>
            <AbsoluteFill style={{ background: `radial-gradient(700px 500px at 290px 690px, ${alpha(HOT, 0.25 + 0.1 * Math.sin(f / 3))}, transparent 70%)` }} />
            <BigLine top={235} size={104} s={1 + punch(f, S.damage.f0, 0.07)}>
              <Neon c={HOT} k={1.4}>CÁNISTER DAÑADO</Neon>
            </BigLine>
            <div style={{ position: "absolute", top: 370, left: 520, width: 480, display: "flex", flexDirection: "column", gap: 14, alignItems: "flex-start" }}>
              {[
                ["👃  OLOR A BENCINA", wordAt(vo, "damage", ["olor"])],
                ["⚠  LUZ DE FALLA", wordAt(vo, "damage", ["luz"])],
                ["$  REPARACIÓN EVITABLE", wordAt(vo, "damage", ["reparacion"])],
              ].map(([t, at]) => (
                <div key={t as string} style={{ opacity: ramp(f, (at as number) - 3, (at as number) + 4), transform: `translateX(${60 * (1 - ramp(f, (at as number) - 3, (at as number) + 8, BACK_OUT))}px)` }}>
                  <Chip c={HOT} size={30}>{t}</Chip>
                </div>
              ))}
            </div>
          </AbsoluteFill>
        ) : null}

        {/* ===== CIERRE ===== */}
        {f >= S.cta.f0 - 2 ? (
          <AbsoluteFill style={{ background: `rgba(2,8,20,${0.8 * ramp(f, S.cta.f0 - 2, S.cta.f0 + 8)})` }}>
            <Particles f={f} n={60} kind="warp" color={GR} seed={7} speed={1.2} o={0.7} cy={700} />
            <BigLine top={330} size={150} o={ramp(f, S.cta.f0, S.cta.f0 + 8)} s={interpolate(ramp(f, S.cta.f0, S.cta.f0 + 14, BACK_OUT), [0, 1], [1.3, 1])}>
              EL CLIC
              <br />
              <Neon c={GR} k={1.4}>ES EL LÍMITE</Neon>
            </BigLine>
            <div style={{ position: "absolute", top: 700, left: 0, width: 1080, display: "flex", justifyContent: "center", opacity: ramp(f, wordAt(vo, "cta", ["redondea"]) - 10, wordAt(vo, "cta", ["redondea"])), scale: String(1 + 0.03 * Math.sin(f / 5)) }}>
              <Chip c={GR} solid size={42}>¿Tú redondeas? Comenta 👇</Chip>
            </div>
            <div style={{ position: "absolute", top: 840, left: 0, width: 1080, textAlign: "center", fontFamily: DISPLAY, fontWeight: 800, fontSize: 54, letterSpacing: 22, color: TH.text, opacity: ramp(f, S.cta.f0 + 20, S.cta.f0 + 32), textShadow: glow(CY, 0.4) }}>MOKTA</div>
          </AbsoluteFill>
        ) : null}

        <Captions vo={vo} f={f} top={1300} accent={danger > 0.5 ? ORG : GR} pill fix={{ vencina: "bencina", canister: "cánister", click: "clic" }} merges={[{ from: ["olora"], to: "olor a" }]} hide={(x) => x < S.warn.f0 || x >= S.cta.f0} />
      </Stage>
      {withAudio ? <Audio src={staticFile("audio/v2-clic.wav")} /> : null}
    </ThemeP>
  );
};
