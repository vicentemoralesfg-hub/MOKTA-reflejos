import React from "react";
import { AbsoluteFill, interpolate, staticFile, useCurrentFrame } from "remotion";
import { Audio } from "@remotion/media";
import { C, DISPLAY, UI } from "../brand";
import { BACK_OUT, EASE_IN_OUT, EASE_OUT, ramp } from "../lib/anim";
import { Captions } from "./comp/Captions";
import { VO, seg, total, wordAt } from "./lib/vo";
import voJson from "../vo/clic.json";

/**
 * Reel bencina v2 · "¿Lleno o hasta el clic?"
 * Estética técnica (rayos X): cómo sabe la pistola que el estanque está lleno (orificio sensor → vacío →
 * diafragma → resorte = CLIC) y qué pasa si sigues cargando (la bencina llega al cánister).
 */
export const CLIC_VO = voJson as VO;
const vo = CLIC_VO;
export const CLIC_TOTAL = total(vo, 1.8);
const CX = 500;

const LINE = "rgba(191,230,255,0.9)";
const FAINT = "rgba(191,230,255,0.22)";
const FUEL = "#F2A93B";
const AIR = "#9FD8FF";
const BG = "#05080D";

const Y: React.FC<{ children: React.ReactNode; c?: string }> = ({ children, c = C.yellow }) => <span style={{ color: c }}>{children}</span>;

const Grid: React.FC = () => (
  <AbsoluteFill
    style={{
      backgroundImage: `linear-gradient(${FAINT} 1px, transparent 1px), linear-gradient(90deg, ${FAINT} 1px, transparent 1px)`,
      backgroundSize: "60px 60px",
      opacity: 0.25,
      maskImage: "radial-gradient(ellipse at 50% 45%, black 25%, transparent 75%)",
    }}
  />
);

const Label: React.FC<{ x: number; y: number; tx: number; ty: number; text: string; o: number; color?: string; anchor?: "start" | "end" }> = ({ x, y, tx, ty, text, o, color = LINE, anchor = "start" }) => (
  <g opacity={o}>
    <circle cx={x} cy={y} r={6} fill={color} />
    <polyline points={`${x},${y} ${tx},${ty} ${anchor === "start" ? tx + 30 : tx - 30},${ty}`} fill="none" stroke={color} strokeWidth={2.5} />
    <text x={anchor === "start" ? tx + 40 : tx - 40} y={ty + 10} textAnchor={anchor} fontFamily="Inter" fontWeight={800} fontSize={30} letterSpacing={2} fill={color} stroke={BG} strokeWidth={8} style={{ paintOrder: "stroke" }}>
      {text}
    </text>
  </g>
);

/**
 * Corte de la pistola dentro del cuello de llenado (vista vertical, escala de detalle).
 * level: altura de la bencina en el cuello (px desde abajo); air: 0..1 flujo de aire por el orificio;
 * vac: 0..1 vacío en el diafragma; shut: 0..1 válvula cerrada.
 */
const Nozzle: React.FC<{ f: number; level: number; air: number; vac: number; shut: number; flow: number; labels: Record<string, number> }> = ({ f, level, air, vac, shut, flow, labels }) => {
  const TIP = 1120;
  const PORT = 1080;
  const surface = 1700 - level;
  const covered = surface <= PORT + 4;
  return (
    <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: "absolute", inset: 0 }}>
      <defs>
        <linearGradient id="metal" x1="0" x2="1">
          <stop offset="0" stopColor="#1A2230" />
          <stop offset="0.5" stopColor="#2B3646" />
          <stop offset="1" stopColor="#1A2230" />
        </linearGradient>
        <linearGradient id="fuelG" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#FFD36B" />
          <stop offset="1" stopColor="#C97A12" />
        </linearGradient>
        <clipPath id="neckIn">
          <rect x={392} y={760} width={296} height={1000} />
        </clipPath>
        <clipPath id="spoutIn">
          <rect x={514} y={560} width={52} height={TIP - 560} />
        </clipPath>
      </defs>

      {/* cuello de llenado */}
      <rect x={380} y={760} width={320} height={1000} fill="rgba(191,230,255,0.04)" />
      <line x1={380} y1={760} x2={380} y2={1760} stroke={LINE} strokeWidth={4} />
      <line x1={700} y1={760} x2={700} y2={1760} stroke={LINE} strokeWidth={4} />
      <rect x={350} y={740} width={380} height={24} fill="url(#metal)" stroke={LINE} strokeWidth={3} />
      {/* bencina subiendo en el cuello */}
      <g clipPath="url(#neckIn)">
        <path
          d={`M 380 ${surface} ${Array.from({ length: 9 })
            .map((_, i) => `L ${392 + i * 40} ${surface + Math.sin(f * 0.35 + i) * (flow > 0.1 ? 5 : 1.5)}`)
            .join(" ")} L 720 ${surface} L 720 1800 L 380 1800 Z`}
          fill="url(#fuelG)"
          opacity={0.9}
        />
      </g>

      {/* cuerpo de la pistola */}
      <path d="M 370 300 H 770 Q 800 300 800 330 V 540 Q 800 570 770 570 H 600 V 560 H 480 V 570 H 370 Q 340 570 340 540 V 330 Q 340 300 370 300 Z" fill="url(#metal)" stroke={LINE} strokeWidth={4} />
      {/* manguera */}
      <path d="M 800 360 H 1000" stroke={LINE} strokeWidth={4} />
      <path d="M 800 420 H 1000" stroke={LINE} strokeWidth={4} />
      {/* conducto principal hacia la válvula */}
      <path d="M 800 375 H 600 V 520" fill="none" stroke={FAINT} strokeWidth={30} />
      {/* válvula principal (vástago + platillo) */}
      <g transform={`translate(0 ${-shut * 26})`}>
        <rect x={532} y={350} width={16} height={150} fill="#9AA6B8" />
        <rect x={500} y={490} width={80} height={16} rx={4} fill="#C7D1DE" />
      </g>
      <rect x={490} y={512} width={100} height={8} fill={LINE} opacity={0.6} />
      {/* resorte */}
      <path d={`M 540 ${330} ${Array.from({ length: 8 }).map((_, i) => `L ${i % 2 ? 556 : 524} ${336 + i * (14 - shut * 4)}`).join(" ")}`} fill="none" stroke="#F4F6F8" strokeWidth={4} />
      {/* cámara del diafragma */}
      <circle cx={690} cy={470} r={58} fill="rgba(191,230,255,0.06)" stroke={LINE} strokeWidth={4} />
      <path d={`M 632 470 Q 690 ${470 + 40 * vac} 748 470`} fill="none" stroke={vac > 0.5 ? C.yellow : "#F4F6F8"} strokeWidth={5} />
      {/* traba que libera el resorte */}
      <path d={`M 690 ${470 + 30 * vac} L 600 ${440 + 30 * vac} L 556 ${420 + 40 * shut}`} fill="none" stroke="#9AA6B8" strokeWidth={6} strokeLinecap="round" />

      {/* boquilla (spout) */}
      <rect x={500} y={560} width={80} height={TIP - 560} fill="url(#metal)" stroke={LINE} strokeWidth={4} />
      <g clipPath="url(#spoutIn)">
        <rect x={514} y={560} width={52} height={TIP - 560} fill="#0A0F18" />
        {flow > 0.02
          ? Array.from({ length: 14 }).map((_, i) => {
              const yy = 560 + ((i * 46 + f * 14) % (TIP - 560));
              return <rect key={i} x={522} y={yy} width={22} height={26} rx={8} fill={FUEL} opacity={0.85 * flow} />;
            })
          : null}
      </g>
      {/* chorro saliendo por la punta */}
      {flow > 0.02 && !covered ? <rect x={520} y={TIP} width={40} height={Math.max(0, surface - TIP)} fill={FUEL} opacity={0.6 * flow} /> : null}

      {/* tubo sensor: del orificio a la cámara del diafragma */}
      <path d={`M 574 ${PORT} V 600 Q 574 470 632 470`} fill="none" stroke={C.blue} strokeWidth={5} opacity={0.9} />
      <circle cx={580} cy={PORT} r={9} fill={BG} stroke={covered ? FUEL : C.blue} strokeWidth={4} />
      {air > 0.02
        ? Array.from({ length: 6 }).map((_, i) => {
            const t = ((f * 0.04 + i / 6) % 1);
            const yy = PORT - t * (PORT - 600);
            return <circle key={i} cx={574} cy={yy} r={6} fill={AIR} opacity={air * Math.sin(t * Math.PI)} />;
          })
        : null}
      {/* aire entrando por el orificio */}
      {air > 0.02 ? (
        <g opacity={air}>
          {[0, 1, 2].map((i) => {
            const t = ((f * 0.06 + i / 3) % 1);
            return <circle key={i} cx={640 - t * 54} cy={PORT + 10 - t * 10} r={5} fill={AIR} opacity={Math.sin(t * Math.PI)} />;
          })}
        </g>
      ) : null}

      <Label x={580} y={PORT} tx={445} ty={960} text="ORIFICIO SENSOR" o={labels.port ?? 0} color={C.blue} anchor="end" />
      <Label x={690} y={470} tx={735} ty={650} text="DIAFRAGMA" o={labels.diaphragm ?? 0} />
      <Label x={540} y={360} tx={250} ty={250} text="RESORTE" o={labels.spring ?? 0} anchor="end" />
      <Label x={380} y={1300} tx={230} ty={1180} text="CUELLO DEL ESTANQUE" o={labels.neck ?? 0} anchor="end" />
    </svg>
  );
};

/** Sistema completo: estanque, cuello, línea de vapores, cánister, motor. */
const System: React.FC<{ f: number; tank: number; neck: number; vline: number; soak: number; labels: number }> = ({ f, tank, neck, vline, soak, labels }) => {
  const T = { x: 170, y: 1000, w: 620, h: 260 };
  const N = { x: 770, w: 46, top: 600, bottom: 1012 };
  const V = { x: 292, w: 16, top: 772, bottom: 1004 };
  const K = { x: 150, y: 610, w: 300, h: 160 };
  const surf = T.y + T.h - 12 - tank * (T.h - 22);
  return (
    <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: "absolute", inset: 0 }}>
      <defs>
        <linearGradient id="fuelS" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#FFD36B" />
          <stop offset="1" stopColor="#C97A12" />
        </linearGradient>
        <clipPath id="tankC">
          <rect x={T.x} y={T.y} width={T.w} height={T.h} rx={50} />
        </clipPath>
        <pattern id="carb" width="18" height="18" patternUnits="userSpaceOnUse">
          <circle cx="5" cy="5" r="3.5" fill="rgba(191,230,255,0.35)" />
          <circle cx="14" cy="13" r="4" fill="rgba(191,230,255,0.25)" />
        </pattern>
      </defs>
      {/* motor y purga */}
      <g opacity={1 - soak}>
        <rect x={K.x + 180} y={440} width={150} height={60} rx={12} fill="none" stroke={FAINT} strokeWidth={3} />
        <text x={K.x + 255} y={480} textAnchor="middle" fontFamily="Inter" fontWeight={800} fontSize={24} fill={LINE} opacity={0.6}>MOTOR</text>
        <line x1={K.x + 255} y1={500} x2={K.x + 255} y2={K.y} stroke={FAINT} strokeWidth={6} strokeDasharray="12 10" />
      </g>
      {/* cánister */}
      <rect x={K.x} y={K.y} width={K.w} height={K.h} rx={22} fill="rgba(191,230,255,0.05)" stroke={soak > 0 ? C.red : LINE} strokeWidth={4} />
      <rect x={K.x + 12} y={K.y + 12} width={K.w - 24} height={K.h - 24} rx={14} fill="url(#carb)" />
      <rect x={K.x + 12} y={K.y + 12 + (K.h - 24) * (1 - soak)} width={K.w - 24} height={(K.h - 24) * soak} rx={14} fill={FUEL} opacity={0.75} />
      {soak > 0 ? <rect x={K.x - 10} y={K.y - 10} width={K.w + 20} height={K.h + 20} rx={30} fill="none" stroke={C.red} strokeWidth={3} opacity={soak * (0.5 + 0.5 * Math.sin(f * 0.5))} /> : null}
      {/* línea de vapores */}
      <rect x={V.x} y={V.top} width={V.w} height={V.bottom - V.top} fill="rgba(191,230,255,0.05)" stroke={LINE} strokeWidth={3} />
      <rect x={V.x + 3} y={V.bottom - (V.bottom - V.top) * vline} width={V.w - 6} height={(V.bottom - V.top) * vline} fill={FUEL} />
      {vline < 0.05
        ? [0, 1, 2, 3].map((i) => {
            const t = ((f * 0.03 + i / 4) % 1);
            return <circle key={i} cx={V.x + V.w / 2} cy={V.bottom - t * (V.bottom - V.top)} r={5} fill={AIR} opacity={Math.sin(t * Math.PI) * 0.8} />;
          })
        : null}
      {/* estanque */}
      <rect x={T.x} y={T.y} width={T.w} height={T.h} rx={50} fill="rgba(191,230,255,0.04)" />
      <g clipPath="url(#tankC)">
        <path d={`M ${T.x - 10} ${surf} ${Array.from({ length: 14 }).map((_, i) => `L ${T.x - 10 + (i + 1) * 50} ${surf + Math.sin(f * 0.3 + i) * 2}`).join(" ")} L ${T.x + T.w + 30} ${T.y + T.h + 10} L ${T.x - 10} ${T.y + T.h + 10} Z`} fill="url(#fuelS)" opacity={0.9} />
      </g>
      <rect x={T.x} y={T.y} width={T.w} height={T.h} rx={50} fill="none" stroke={LINE} strokeWidth={4} />
      {/* cuello */}
      <rect x={N.x} y={N.top} width={N.w} height={N.bottom - N.top} fill="rgba(191,230,255,0.05)" stroke={LINE} strokeWidth={4} />
      <rect x={N.x + 5} y={N.bottom - (N.bottom - N.top) * neck} width={N.w - 10} height={(N.bottom - N.top) * neck} fill={FUEL} />
      {/* pistola (pequeña) */}
      <path d={`M ${N.x + 8} ${N.top + 70} V ${N.top - 40} L ${N.x + 70} ${N.top - 120} H ${N.x + 150}`} fill="none" stroke={LINE} strokeWidth={10} strokeLinejoin="round" />
      <g opacity={labels}>
        <text x={T.x + 40} y={T.y + 50} fontFamily="Inter" fontWeight={800} fontSize={28} letterSpacing={3} fill="#0B0E14" opacity={0.8}>ESTANQUE</text>
        <text x={K.x} y={K.y - 20} fontFamily="Inter" fontWeight={800} fontSize={30} letterSpacing={3} fill={soak > 0 ? C.red : LINE}>CÁNISTER</text>
        <text x={K.x} y={K.y + K.h + 40} fontFamily="Inter" fontWeight={600} fontSize={24} fill={LINE} opacity={0.7}>filtro de carbón · solo para vapores</text>
      </g>
    </svg>
  );
};

export const ClicV2: React.FC<{ withAudio?: boolean }> = ({ withAudio = true }) => {
  const f = useCurrentFrame();
  const S = Object.fromEntries(vo.segments.map((s) => [s.id, seg(vo, s.id)]));
  const fClic = wordAt(vo, "click", ["clic"], S.click.f1 / 30) as number;
  const fTapa = wordAt(vo, "click", ["tapa"]);
  const fVacio = wordAt(vo, "click", ["vacio"]);
  const fResorte = wordAt(vo, "click", ["resorte"]);

  // ---------- estado de la pistola (vista de detalle) ----------
  const level = interpolate(f, [0, S.hole.f0, fTapa, fTapa + 14], [120, 300, 560, 640], { extrapolateRight: "clamp", easing: EASE_IN_OUT });
  const air = (f >= S.hole.f0 - 10 ? 1 : 0.6) * (1 - ramp(f, fTapa + 6, fTapa + 14));
  const vac = ramp(f, fVacio - 4, fResorte + 6);
  const shut = ramp(f, fClic - 2, fClic + 1, BACK_OUT);
  const flow = 1 - shut;
  const detailOn = f < S.over.f0 + 16;
  const sysIn = ramp(f, S.over.f0 + 4, S.over.f0 + 16, EASE_IN_OUT);

  // cámara de detalle: gancho amplio → acercamiento a la punta → diafragma
  const camS = interpolate(f, [0, S.hole.f0 - 10, S.hole.f0 + 8, fTapa, fVacio, S.over.f0], [0.9, 0.9, 1.25, 1.25, 1.15, 1.05], { extrapolateRight: "clamp", easing: EASE_IN_OUT });
  const camY = interpolate(f, [0, S.hole.f0 - 10, S.hole.f0 + 8, fTapa, fVacio, S.over.f0], [200, 200, -180, -220, 60, 60], { extrapolateRight: "clamp", easing: EASE_IN_OUT });
  const flash = f >= fClic ? Math.max(0, 1 - (f - fClic) / 8) : 0;

  // ---------- sistema ----------
  const tank = 1;
  const neck = interpolate(f, [S.over.f0, S.over.f0 + 30], [0.75, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const vline = ramp(f, S.over.f0 + 20, wordAt(vo, "over", ["canister", "cánister"]) + 10, EASE_IN_OUT);
  const soak = ramp(f, S.damage.f0 - 6, S.damage.f0 + 16);

  return (
    <AbsoluteFill style={{ background: BG, overflow: "hidden" }}>
      <Grid />
      {/* ===== DETALLE: pistola ===== */}
      {detailOn ? (
        <AbsoluteFill style={{ opacity: 1 - sysIn, transformOrigin: "540px 900px", transform: `translateY(${camY}px) scale(${camS})` }}>
          <Nozzle
            f={f}
            level={level}
            air={air}
            vac={vac}
            shut={shut}
            flow={flow}
            labels={{
              port: ramp(f, S.hole.f0 + 4, S.hole.f0 + 14),
              diaphragm: ramp(f, fVacio - 2, fVacio + 8),
              spring: ramp(f, fResorte - 2, fResorte + 8),
              neck: ramp(f, S.warn.f0, S.warn.f0 + 10) * (1 - ramp(f, S.how.f0, S.how.f0 + 8)),
            }}
          />
        </AbsoluteFill>
      ) : null}
      <AbsoluteFill style={{ background: C.white, opacity: flash * 0.22 }} />

      {/* ===== SISTEMA ===== */}
      {sysIn > 0 ? (
        <AbsoluteFill style={{ opacity: sysIn }}>
          <System f={f} tank={tank} neck={neck} vline={vline} soak={soak} labels={ramp(f, S.over.f0 + 6, S.over.f0 + 16)} />
        </AbsoluteFill>
      ) : null}

      {/* ===== TEXTOS ===== */}
      {f < S.warn.f0 ? (
        <div style={{ position: "absolute", top: 230, left: 40, width: CX * 2 - 80, textAlign: "center", fontFamily: DISPLAY, fontWeight: 800, lineHeight: 0.9 }}>
          <div style={{ fontSize: 170, color: C.white, scale: String(interpolate(ramp(f, 0, 8, BACK_OUT), [0, 1], [1.08, 1])) }}>¿LLENO</div>
          <div style={{ fontSize: 120, color: C.yellow }}>O HASTA EL CLIC?</div>
        </div>
      ) : null}
      {f >= S.warn.f0 && f < S.how.f0 ? (
        <div style={{ position: "absolute", top: 250, left: 50, width: CX * 2 - 100, textAlign: "center", fontFamily: DISPLAY, fontWeight: 800, fontSize: 96, lineHeight: 0.95, color: C.white, opacity: ramp(f, S.warn.f0, S.warn.f0 + 6) }}>
          DESPUÉS DEL CLIC
          <br />
          <Y c={C.red}>LE HACES DAÑO</Y>
        </div>
      ) : null}
      {f >= S.how.f0 && f < S.hole.f0 - 8 ? (
        <div style={{ position: "absolute", top: 250, left: 50, width: CX * 2 - 100, textAlign: "center", fontFamily: DISPLAY, fontWeight: 800, fontSize: 92, lineHeight: 0.95, color: C.white, opacity: ramp(f, S.how.f0, S.how.f0 + 6) }}>
          ¿CÓMO SABE QUE
          <br />
          ESTÁ <Y>LLENO?</Y>
          <div style={{ fontFamily: UI, fontWeight: 700, fontSize: 34, color: C.dim, marginTop: 16, opacity: ramp(f, wordAt(vo, "how", ["nada"]) - 4, wordAt(vo, "how", ["nada"]) + 6) }}>0 sensores · 0 electrónica · 0 batería</div>
        </div>
      ) : null}
      {f >= fClic - 1 && f < S.over.f0 + 6 ? (
        <div style={{ position: "absolute", top: 230, left: 0, width: CX * 2, textAlign: "center", fontFamily: DISPLAY, fontWeight: 800, fontSize: 210, color: C.yellow, lineHeight: 1, scale: String(interpolate(ramp(f, fClic - 1, fClic + 6, BACK_OUT), [0, 1], [1.5, 1])), textShadow: "0 0 50px rgba(255,200,61,0.5)" }}>
          ¡CLIC!
        </div>
      ) : null}
      {f >= S.over.f0 && f < S.damage.f0 ? (
        <div style={{ position: "absolute", top: 250, left: 50, width: CX * 2 - 100, textAlign: "center", fontFamily: DISPLAY, fontWeight: 800, fontSize: 88, lineHeight: 0.95, color: C.white, opacity: ramp(f, S.over.f0 + 4, S.over.f0 + 12) }}>
          SI SIGUES CARGANDO…
          <br />
          <Y>LLEGA AL CÁNISTER</Y>
        </div>
      ) : null}
      {f >= S.damage.f0 && f < S.cta.f0 ? (
        <AbsoluteFill>
          <div style={{ position: "absolute", top: 250, left: 50, width: CX * 2 - 100, textAlign: "center", fontFamily: DISPLAY, fontWeight: 800, fontSize: 96, lineHeight: 0.95, color: C.red, opacity: ramp(f, S.damage.f0, S.damage.f0 + 6) }}>
            CÁNISTER DAÑADO
          </div>
          <div style={{ position: "absolute", top: 380, left: 70, width: CX * 2 - 140, display: "flex", flexDirection: "column", gap: 12 }}>
            {[
              ["OLOR A BENCINA", wordAt(vo, "damage", ["olor"])],
              ["LUZ DE FALLA EN EL TABLERO", wordAt(vo, "damage", ["luz"])],
              ["REPARACIÓN EVITABLE", wordAt(vo, "damage", ["reparacion"])],
            ].map(([t, at]) => (
              <div key={t as string} style={{ padding: "10px 20px", borderRadius: 14, background: "rgba(255,59,59,0.12)", border: "2px solid rgba(255,59,59,0.55)", fontFamily: UI, fontWeight: 800, fontSize: 30, letterSpacing: 2, color: "#FF9A9A", opacity: ramp(f, (at as number) - 3, (at as number) + 5), translate: `${interpolate(ramp(f, (at as number) - 3, (at as number) + 6, EASE_OUT), [0, 1], [-20, 0])}px 0px` }}>
                {t}
              </div>
            ))}
          </div>
        </AbsoluteFill>
      ) : null}
      {f >= S.cta.f0 ? (
        <AbsoluteFill style={{ background: `rgba(5,8,13,${0.85 * ramp(f, S.cta.f0, S.cta.f0 + 8)})` }}>
          <div style={{ position: "absolute", top: 360, left: 40, width: CX * 2 - 80, textAlign: "center", fontFamily: DISPLAY, fontWeight: 800, fontSize: 132, lineHeight: 0.92, color: C.white, opacity: ramp(f, S.cta.f0, S.cta.f0 + 8), scale: String(interpolate(ramp(f, S.cta.f0, S.cta.f0 + 12, BACK_OUT), [0, 1], [1.1, 1])) }}>
            EL CLIC
            <br />
            <Y>ES EL LÍMITE</Y>
          </div>
          <div style={{ position: "absolute", top: 680, left: CX - 320, width: 640, textAlign: "center", padding: "20px 0", borderRadius: 22, background: C.yellow, color: C.ink, fontFamily: UI, fontWeight: 800, fontSize: 40, opacity: ramp(f, wordAt(vo, "cta", ["redondea"]) - 10, wordAt(vo, "cta", ["redondea"])) }}>
            ¿Tú redondeas? Comenta 👇
          </div>
          <div style={{ position: "absolute", top: 820, left: 0, width: CX * 2, textAlign: "center", fontFamily: DISPLAY, fontWeight: 700, fontSize: 44, letterSpacing: 20, color: "rgba(244,246,248,0.6)", opacity: ramp(f, S.cta.f0 + 24, S.cta.f0 + 36) }}>
            MOKTA
          </div>
        </AbsoluteFill>
      ) : null}

      <Captions vo={vo} f={f} top={1290} fix={{ vencina: "bencina", canister: "cánister", click: "clic" }} merges={[{ from: ["olora"], to: "olor a" }]} hide={(x) => x < S.warn.f0 || x >= S.cta.f0} />
      {withAudio ? <Audio src={staticFile("audio/v2-clic.wav")} /> : null}
    </AbsoluteFill>
  );
};
