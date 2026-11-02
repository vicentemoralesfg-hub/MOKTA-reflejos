import React from "react";
import { AbsoluteFill, interpolate } from "remotion";
import { EASE_IN_OUT, ramp, wobble } from "../../lib/anim";
import { ChatUI } from "./ChatUI";
import { T } from "./script";

/**
 * Revelación: el chat estaba en un celular, en un soporte del tablero, de noche,
 * en una autopista a 100 km/h. El auto de adelante ya está frenando.
 * Escena 100 % procedural (proyección en perspectiva simple), 1080×1920.
 */

const HZ = 760; // horizonte
const CX = 560; // punto de fuga (el conductor va a la izquierda del centro del carril)
const FOCAL = 950;
const CAM_H = 1.2;

const P = (X: number, Y: number, Z: number) => [CX + (FOCAL * X) / Z, HZ + (FOCAL * (CAM_H - Y)) / Z] as const;
const poly = (pts: (readonly [number, number])[]) => pts.map((p) => `${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(" ");

// Celular en el soporte (coordenadas de escena)
export const PHONE = { cx: 724, cy: 1392, w: 330, rot: -2.5 };
const PH_H = (PHONE.w * 1920) / 1080;

const SPEED = 100 / 3.6;

const Road: React.FC<{ s: number }> = ({ s }) => {
  const zNear = 1.6;
  const zFar = 600;
  const road = poly([P(-2.3, 0, zNear), P(-2.3, 0, zFar), P(6.4, 0, zFar), P(6.4, 0, zNear)]);
  // Segmentos discontinuos (3 m pintados, 9 m de separación) a X = 2,15
  const dashes: string[] = [];
  const period = 12;
  const off = s % period;
  for (let k = 0; k < 40; k++) {
    const z0 = k * period - off + 2;
    const z1 = z0 + 3;
    if (z1 < zNear) continue;
    const a = Math.max(z0, zNear);
    dashes.push(poly([P(2.08, 0, a), P(2.08, 0, z1), P(2.22, 0, z1), P(2.22, 0, a)]));
  }
  const edgeL = poly([P(-1.62, 0, zNear), P(-1.62, 0, zFar), P(-1.5, 0, zFar), P(-1.5, 0, zNear)]);
  const edgeR = poly([P(5.85, 0, zNear), P(5.85, 0, zFar), P(5.97, 0, zFar), P(5.97, 0, zNear)]);
  // Barrera central de hormigón
  const barrier = poly([P(-2.3, 0, zNear), P(-2.3, 0.8, zNear), P(-2.3, 0.8, zFar), P(-2.3, 0, zFar)]);
  const barrierTop = poly([P(-2.3, 0.8, zNear), P(-2.15, 0.8, zNear), P(-2.15, 0.8, zFar), P(-2.3, 0.8, zFar)]);
  return (
    <g>
      <polygon points={road} fill="url(#asphalt)" />
      <polygon points={road} fill="url(#headlights)" />
      <polygon points={edgeL} fill="#D8D2C2" opacity={0.55} />
      <polygon points={edgeR} fill="#D8D2C2" opacity={0.5} />
      {dashes.map((d, i) => (
        <polygon key={i} points={d} fill="#E8E2D0" opacity={0.7} />
      ))}
      <polygon points={barrier} fill="#2A2C31" />
      <polygon points={barrierTop} fill="#4A4C52" />
    </g>
  );
};

const Lamps: React.FC<{ s: number }> = ({ s }) => {
  const period = 38;
  const off = s % period;
  const items: React.ReactNode[] = [];
  for (let k = 12; k >= 0; k--) {
    const z = k * period - off + 6;
    if (z < 2.2) continue;
    const [bx, by] = P(-2.25, 0.8, z);
    const [tx, ty] = P(-2.25, 10, z);
    const [ax, ay] = P(-0.6, 9.7, z);
    const r = Math.min(90, (FOCAL * 0.5) / z);
    const sw = Math.max(1, (FOCAL * 0.16) / z);
    // charco de luz sobre la calzada
    const [px, py] = P(0.2, 0, z);
    const pr = (FOCAL * 4.5) / z;
    items.push(
      <g key={k}>
        <ellipse cx={px} cy={py} rx={pr * 1.4} ry={pr * 0.35} fill="url(#pool)" opacity={Math.min(1, 30 / z)} />
        <line x1={bx} y1={by} x2={tx} y2={ty} stroke="#1C1E23" strokeWidth={sw} />
        <line x1={tx} y1={ty} x2={ax} y2={ay} stroke="#1C1E23" strokeWidth={sw * 0.8} />
        <circle cx={ax} cy={ay} r={r * 2.4} fill="url(#lampGlow)" />
        <ellipse cx={ax} cy={ay + r * 0.1} rx={r * 0.55} ry={r * 0.22} fill="#FFE2B8" />
      </g>,
    );
  }
  return <g>{items}</g>;
};

const City: React.FC = () => {
  // luces lejanas de la ciudad (deterministas)
  const dots: React.ReactNode[] = [];
  let seed = 11;
  const rnd = () => {
    seed = (seed * 16807) % 2147483647;
    return seed / 2147483647;
  };
  for (let i = 0; i < 220; i++) {
    const x = rnd() * 1080;
    const y = HZ - 6 - Math.pow(rnd(), 2.2) * 70;
    const warm = rnd() > 0.35;
    dots.push(<circle key={i} cx={x} cy={y} r={0.8 + rnd() * 1.8} fill={warm ? "#FFC98A" : "#CFE3FF"} opacity={0.35 + rnd() * 0.5} />);
  }
  return (
    <g>
      {/* cordillera */}
      <path
        d="M0 640 L120 600 L210 618 L330 548 L420 590 L520 520 L610 566 L700 505 L820 572 L930 540 L1080 600 L1080 760 L0 760 Z"
        fill="#0C1220"
      />
      <path d="M300 556 L330 548 L352 560 M505 528 L520 520 L540 532 M688 512 L700 505 L716 516" stroke="#3A4560" strokeWidth="2" fill="none" opacity="0.6" />
      <rect x={0} y={HZ - 90} width={1080} height={90} fill="url(#cityHaze)" />
      {dots}
    </g>
  );
};

/** Parte trasera del auto de adelante, a distancia z (m), frenando. */
const LeadCar: React.FC<{ z: number; brake: number; f: number }> = ({ z, brake, f }) => {
  const X0 = 0.4;
  const k = FOCAL / z;
  const [cx, groundY] = P(X0, 0, z);
  const wBody = 1.8 * k;
  const yOf = (Y: number) => groundY - Y * k;
  const flick = 0.92 + 0.08 * Math.sin(f * 2.1);
  const glow = brake * flick;
  const lit = Math.min(1, 9 / z); // nuestros focos lo iluminan más cuando está cerca
  return (
    <g>
      {/* sombra */}
      <ellipse cx={cx} cy={groundY + 2} rx={wBody * 0.62} ry={k * 0.12} fill="#000" opacity={0.65} />
      {/* reflejo rojo en el asfalto */}
      <ellipse cx={cx} cy={groundY + k * 0.35} rx={wBody * 0.7} ry={k * 0.55} fill="url(#redSpill)" opacity={0.75 * glow} />
      {/* neumáticos */}
      <rect x={cx - wBody * 0.46} y={yOf(0.34)} width={wBody * 0.17} height={k * 0.34} rx={k * 0.05} fill="#050506" />
      <rect x={cx + wBody * 0.29} y={yOf(0.34)} width={wBody * 0.17} height={k * 0.34} rx={k * 0.05} fill="#050506" />
      {/* carrocería baja */}
      <rect x={cx - wBody / 2} y={yOf(0.98)} width={wBody} height={k * 0.72} rx={k * 0.14} fill="#1A1C22" />
      <rect x={cx - wBody / 2} y={yOf(0.98)} width={wBody} height={k * 0.72} rx={k * 0.14} fill="url(#bodyLit)" opacity={0.4 + 0.6 * lit} />
      {/* parachoques */}
      <rect x={cx - wBody * 0.49} y={yOf(0.5)} width={wBody * 0.98} height={k * 0.2} rx={k * 0.08} fill="#121318" />
      {/* patente (sin texto legible) */}
      <rect x={cx - k * 0.19} y={yOf(0.78)} width={k * 0.38} height={k * 0.14} rx={k * 0.02} fill="#C9CCD2" opacity={0.25 + 0.55 * lit} />
      {/* cabina */}
      <path
        d={`M ${cx - wBody * 0.44} ${yOf(0.98)} L ${cx - wBody * 0.36} ${yOf(1.42)} Q ${cx} ${yOf(1.5)} ${cx + wBody * 0.36} ${yOf(1.42)} L ${cx + wBody * 0.44} ${yOf(0.98)} Z`}
        fill="#16181D"
      />
      {/* luneta trasera */}
      <path
        d={`M ${cx - wBody * 0.38} ${yOf(1.03)} L ${cx - wBody * 0.32} ${yOf(1.37)} Q ${cx} ${yOf(1.43)} ${cx + wBody * 0.32} ${yOf(1.37)} L ${cx + wBody * 0.38} ${yOf(1.03)} Z`}
        fill="url(#glass)"
      />
      {/* focos traseros */}
      {[-1, 1].map((side) => (
        <g key={side}>
          <rect
            x={side < 0 ? cx - wBody * 0.49 : cx + wBody * 0.27}
            y={yOf(0.95)}
            width={wBody * 0.22}
            height={k * 0.13}
            rx={k * 0.04}
            fill={glow > 0.1 ? "#FF4A3D" : "#5A0E0E"}
          />
          <rect
            x={side < 0 ? cx - wBody * 0.47 : cx + wBody * 0.29}
            y={yOf(0.93)}
            width={wBody * 0.18}
            height={k * 0.07}
            rx={k * 0.03}
            fill="#FFD9D2"
            opacity={glow}
          />
          <circle
            cx={side < 0 ? cx - wBody * 0.38 : cx + wBody * 0.38}
            cy={yOf(0.885)}
            r={k * 0.9}
            fill="url(#brakeGlow)"
            opacity={glow}
          />
        </g>
      ))}
      {/* tercera luz de freno */}
      <rect x={cx - k * 0.22} y={yOf(1.44)} width={k * 0.44} height={k * 0.035} rx={k * 0.015} fill="#FF5A4D" opacity={0.3 + 0.7 * glow} />
      <ellipse cx={cx} cy={yOf(1.425)} rx={k * 0.7} ry={k * 0.22} fill="url(#brakeGlow)" opacity={0.6 * glow} />
    </g>
  );
};

const Interior: React.FC<{ flash: number }> = ({ flash }) => (
  <g>
    {/* techo */}
    <path d="M0 0 H1080 V150 Q540 205 0 150 Z" fill="#06070A" />
    {/* espejo retrovisor */}
    <rect x={455} y={168} width={250} height={92} rx={30} fill="#0B0C10" stroke="#24262C" strokeWidth={3} />
    <rect x={470} y={182} width={220} height={64} rx={22} fill="#101218" />
    <circle cx={540} cy={214} r={5} fill="#FFF4D6" opacity={0.75} />
    <circle cx={612} cy={214} r={5} fill="#FFF4D6" opacity={0.75} />
    <rect x={570} y={120} width={20} height={52} fill="#08090C" />
    {/* pilares A */}
    <path d="M0 150 L118 168 L0 1180 Z" fill="#050608" />
    <path d="M1080 150 L962 168 L1080 1180 Z" fill="#050608" />
    {/* tablero */}
    <path d="M0 1240 Q540 1150 1080 1240 V1920 H0 Z" fill="#08090C" />
    <path d="M0 1240 Q540 1150 1080 1240" stroke="#2C2F36" strokeWidth={3} fill="none" opacity={0.9} />
    <path d="M0 1268 Q540 1180 1080 1268" stroke="#14161B" strokeWidth={10} fill="none" />
    {/* reflejo del tablero en el parabrisas */}
    <path d="M60 1180 Q540 1100 1020 1180 L1020 1210 Q540 1135 60 1210 Z" fill="#9AB4FF" opacity={0.035} />
    {/* tablero de instrumentos (brillo tras el volante) */}
    <ellipse cx={300} cy={1440} rx={260} ry={110} fill="url(#cluster)" />
    {/* volante */}
    <circle cx={300} cy={1760} r={420} fill="none" stroke="#0A0B0E" strokeWidth={78} />
    <circle cx={300} cy={1760} r={458} fill="none" stroke="#1E2026" strokeWidth={4} opacity={0.8} />
    <path d="M300 1760 L80 1520 M300 1760 L520 1520" stroke="#0A0B0E" strokeWidth={60} />
    {/* rojo del frenazo sobre el interior */}
    <rect x={0} y={0} width={1080} height={1920} fill="#FF1E1E" opacity={flash * 0.12} />
  </g>
);

const Defs: React.FC = () => (
  <defs>
    <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stopColor="#020308" />
      <stop offset="0.75" stopColor="#0A1020" />
      <stop offset="1" stopColor="#1B1A22" />
    </linearGradient>
    <linearGradient id="cityHaze" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stopColor="#3A2A1E" stopOpacity="0" />
      <stop offset="1" stopColor="#5A3E26" stopOpacity="0.55" />
    </linearGradient>
    <linearGradient id="asphalt" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stopColor="#15161B" />
      <stop offset="1" stopColor="#0C0D10" />
    </linearGradient>
    <radialGradient id="headlights" cx="0.33" cy="0.98" r="0.55" gradientTransform="scale(1.6 1)">
      <stop offset="0" stopColor="#FFF1D6" stopOpacity="0.18" />
      <stop offset="0.6" stopColor="#FFF1D6" stopOpacity="0.05" />
      <stop offset="1" stopColor="#FFF1D6" stopOpacity="0" />
    </radialGradient>
    <radialGradient id="pool">
      <stop offset="0" stopColor="#FFC27A" stopOpacity="0.16" />
      <stop offset="1" stopColor="#FFC27A" stopOpacity="0" />
    </radialGradient>
    <radialGradient id="lampGlow">
      <stop offset="0" stopColor="#FFD7A0" stopOpacity="0.85" />
      <stop offset="0.25" stopColor="#FFB86A" stopOpacity="0.28" />
      <stop offset="1" stopColor="#FF9A40" stopOpacity="0" />
    </radialGradient>
    <radialGradient id="brakeGlow">
      <stop offset="0" stopColor="#FF6A5A" stopOpacity="0.95" />
      <stop offset="0.18" stopColor="#FF2A20" stopOpacity="0.55" />
      <stop offset="0.5" stopColor="#E01010" stopOpacity="0.16" />
      <stop offset="1" stopColor="#C00000" stopOpacity="0" />
    </radialGradient>
    <radialGradient id="redSpill">
      <stop offset="0" stopColor="#FF2A1A" stopOpacity="0.45" />
      <stop offset="1" stopColor="#FF2A1A" stopOpacity="0" />
    </radialGradient>
    <linearGradient id="glass" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stopColor="#2A3140" />
      <stop offset="0.5" stopColor="#0B0D12" />
      <stop offset="1" stopColor="#1B2230" />
    </linearGradient>
    <linearGradient id="bodyLit" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stopColor="#8A8F9C" stopOpacity="0.55" />
      <stop offset="0.5" stopColor="#4A4E58" stopOpacity="0.25" />
      <stop offset="1" stopColor="#000" stopOpacity="0" />
    </linearGradient>
    <radialGradient id="cluster">
      <stop offset="0" stopColor="#4FA3FF" stopOpacity="0.22" />
      <stop offset="1" stopColor="#4FA3FF" stopOpacity="0" />
    </radialGradient>
    <radialGradient id="screenSpill">
      <stop offset="0" stopColor="#BFD4FF" stopOpacity="0.16" />
      <stop offset="1" stopColor="#BFD4FF" stopOpacity="0" />
    </radialGradient>
  </defs>
);

/**
 * lf = fotograma local de la revelación (0 = último fotograma del chat a pantalla completa).
 */
export const NightScene: React.FC<{ lf: number }> = ({ lf }) => {
  const dur = T.crash - T.reveal; // 52
  const t = lf / 30;
  const s = 5000 + SPEED * t; // posición en la autopista (m)
  // Auto de adelante: frena a ~8 m/s² mientras tú sigues a 100 km/h
  const z = Math.max(3.1, 13 - 3.4 * t * t);
  const brake = 1;

  // Cámara: de "el celular llena la pantalla" a plano completo; luego empuje hacia el auto
  const pull = ramp(lf, 0, 20, EASE_IN_OUT);
  const push = ramp(lf, 18, dur, (x) => x * x);
  const s0 = (1080 / PHONE.w) * 1.1; // un poco más: las esquinas del celular quedan fuera de cuadro
  const logS = interpolate(pull, [0, 1], [Math.log(s0), 0]) + Math.log(1 + 0.22 * push);
  const scale = Math.exp(logS);
  const tx = interpolate(pull, [0, 1], [PHONE.cx, 540]) + interpolate(push, [0, 1], [0, 30]);
  const ty = interpolate(pull, [0, 1], [PHONE.cy, 960]) + interpolate(push, [0, 1], [0, -90]);
  const rot = interpolate(pull, [0, 1], [-PHONE.rot, 0]);

  // Frenazo propio (tarde): cabeceo y vibración crecientes
  const slam = ramp(lf, 34, 40);
  const shakeAmp = 2 + 6 * pull + 26 * slam;
  const sx = wobble(t * 9, 3) * shakeAmp;
  const sy = wobble(t * 11, 8) * shakeAmp + slam * 26;
  const blur = Math.abs(ramp(lf, 1, 19, EASE_IN_OUT) - ramp(lf - 1, 1, 19, EASE_IN_OUT)) * 70;

  const phoneScale = PHONE.w / 1080;
  return (
    <AbsoluteFill style={{ background: "#000", overflow: "hidden" }}>
      <AbsoluteFill
        style={{
          transformOrigin: "0 0",
          transform: `translate(${540 + sx}px, ${960 + sy}px) rotate(${rot}deg) scale(${scale}) translate(${-tx}px, ${-ty}px)`,
          // el desenfoque se aplica antes de escalar: se divide por la escala para obtener px de pantalla
          filter: blur > 0.3 ? `blur(${(Math.min(5, blur) / scale).toFixed(2)}px)` : undefined,
        }}
      >
        <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: "absolute", inset: 0 }}>
          <Defs />
          <rect x={0} y={0} width={1080} height={HZ + 2} fill="url(#sky)" />
          <City />
          <Road s={s} />
          <LeadCar z={z} brake={brake} f={lf} />
          <Lamps s={s} />
          <Interior flash={slam} />
          {/* luz de la pantalla sobre el tablero */}
          <ellipse cx={PHONE.cx} cy={PHONE.cy + 120} rx={420} ry={360} fill="url(#screenSpill)" />
          {/* soporte del celular */}
          <rect x={PHONE.cx - 40} y={PHONE.cy + PH_H / 2 + 6} width={80} height={120} rx={14} fill="#0F1014" />
        </svg>

        {/* Celular con el chat (sigue "escribiendo…") */}
        <div
          style={{
            position: "absolute",
            left: PHONE.cx - PHONE.w / 2 - 14,
            top: PHONE.cy - PH_H / 2 - 14,
            width: PHONE.w + 28,
            height: PH_H + 28,
            borderRadius: 46,
            background: "#0A0A0C",
            boxShadow: "0 0 0 2px #2A2C31, 0 20px 60px rgba(0,0,0,0.6), 0 0 120px rgba(150,180,255,0.18)",
            rotate: `${PHONE.rot}deg`,
          }}
        >
          <div
            style={{
              position: "absolute",
              left: 14,
              top: 14,
              width: PHONE.w,
              height: PH_H,
              borderRadius: 34,
              overflow: "hidden",
            }}
          >
            <div style={{ width: 1080, height: 1920, transformOrigin: "0 0", scale: String(phoneScale) }}>
              <ChatUI f={T.reveal + lf} sheen={false} shake={0} />
            </div>
            {/* reflejo en el vidrio del celular */}
            <AbsoluteFill style={{ background: "linear-gradient(120deg, rgba(255,255,255,0.10), rgba(255,255,255,0) 40%)", opacity: pull }} />
          </div>
        </div>
      </AbsoluteFill>

      {/* viñeta + grano */}
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 45%, transparent 55%, rgba(0,0,0,0.55) 100%)", opacity: pull }} />
    </AbsoluteFill>
  );
};
