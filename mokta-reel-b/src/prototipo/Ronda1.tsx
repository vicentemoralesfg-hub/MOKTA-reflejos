import React from "react";
import { AbsoluteFill, Audio, interpolate, staticFile, useCurrentFrame } from "remotion";
import { DriveView } from "../world/DriveView";
import { rideAt } from "../lib/ride";
import { ramp, inOut } from "../lib/anim";
import { brakeOutcome, fmt, lastStopTime } from "../physics";
import { Cockpit } from "./Cockpit";
import { FPS, IMPACT_AT, R1, RESULT_AT, SEAMS, THEME, V } from "./theme";

/**
 * Prototipo · Ronda 1 (120 km/h), propuesta B.
 *  0 … introEnd        instrucción sobre el cielo; el auto ya va a 120 km/h
 *  eventAt             la barrera aparece a 90 m (un fotograma); el instrumental empieza a contar
 *  … IMPACT_AT         sin frenar, el auto llega a la barrera (2,70 s): cada fotograma pausado
 *                      muestra el resultado estimado de frenar en ese instante
 *  IMPACT_AT           corte a negro (impacto)
 *  RESULT_AT …         lectura: "Tenías 0,58 s" + escala tiempo → resultado
 */
const D = R1.barrierDistanceM;
const KMH = R1.speedKmh;
const T_LIMIT = lastStopTime(KMH, D, R1.decelG) ?? 0; // 0,576 s

const Label: React.FC<{ children: React.ReactNode; style?: React.CSSProperties }> = ({ children, style }) => (
  <div style={{ fontFamily: THEME.ui, fontWeight: 600, fontSize: 22, letterSpacing: 2.5, color: THEME.dim, ...style }}>
    {children}
  </div>
);

const Tab: React.FC<{ children: React.ReactNode; style?: React.CSSProperties }> = ({ children, style }) => (
  <span style={{ fontVariantNumeric: "tabular-nums", ...style }}>{children}</span>
);

/** Contenido de la pantalla del instrumental durante la conducción. */
const ClusterDrive: React.FC<{ f: number }> = ({ f }) => {
  const live = f >= R1.eventAt;
  const t = live ? (f - R1.eventAt) / FPS : 0;
  const o = brakeOutcome(KMH, t, D, R1.decelG);
  // El panel no debe anunciar la barrera: el cronómetro ya muestra "0,00 s" antes del evento y el
  // resultado entra con un fundido lineal de 8 fotogramas (sin aparición brusca que capte la mirada).
  const reveal = live ? Math.min(1, (f - R1.eventAt) / 8) : 0;
  const outcome = !live
    ? ""
    : o.stops
      ? o.marginM < 1
        ? "Te detienes a < 1 m"
        : `Te detienes a ${Math.floor(o.marginM)} m`
      : `Impacto a ≈ ${Math.round(o.impactKmh)} km/h`;
  const dot = o.stops ? THEME.green : THEME.red;

  return (
    <>
      <div style={{ position: "absolute", left: 34, top: 24 }}>
        <Label>RONDA 1 / 3</Label>
        <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginTop: 4 }}>
          <Tab style={{ fontFamily: THEME.display, fontWeight: 700, fontSize: 92, lineHeight: 1 }}>{KMH}</Tab>
          <span style={{ fontFamily: THEME.ui, fontWeight: 500, fontSize: 22, color: THEME.dim }}>km/h</span>
        </div>
      </div>
      <div style={{ position: "absolute", left: 236, top: 30, width: 1, height: 128, background: "rgba(255,255,255,0.10)" }} />
      <div style={{ position: "absolute", left: 262, top: 18, right: 16 }}>
        <Label>REACCIÓN</Label>
        <div style={{ fontFamily: THEME.display, fontWeight: 700, fontSize: 50, lineHeight: 1.0, marginTop: 2, color: THEME.text }}>
          <Tab>{fmt(t, 2)} s</Tab>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 8 }}>
          <div style={{ width: 10, height: 10, borderRadius: 5, background: dot, opacity: reveal }} />
          <Label>SI FRENAS AQUÍ</Label>
        </div>
        <div style={{ fontFamily: THEME.ui, fontWeight: 600, fontSize: 34, marginTop: 2, color: THEME.text, opacity: reveal, whiteSpace: "nowrap", minHeight: 44 }}>
          <Tab>{outcome}</Tab>
        </div>
      </div>
    </>
  );
};

/** Instrumental después del impacto: solo balizas de emergencia (intermitencia de 1,33 Hz, como el audio). */
const ClusterHazard: React.FC<{ f: number }> = ({ f }) => {
  const period = FPS * 0.75;
  const on = (f - RESULT_AT) % period < period * 0.5;
  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
      <svg width={70} height={62} viewBox="0 0 70 62" style={{ opacity: on ? 1 : 0.12 }}>
        <path d="M35 4 L66 58 L4 58 Z" fill="none" stroke={THEME.red} strokeWidth={6} strokeLinejoin="round" />
        <path d="M35 22 L50 48 L20 48 Z" fill="none" stroke={THEME.red} strokeWidth={4} strokeLinejoin="round" />
      </svg>
    </AbsoluteFill>
  );
};

const Instruction: React.FC<{ f: number }> = ({ f }) => {
  const a = inOut(f, 2, 12, R1.introEnd - 18, R1.introEnd);
  const b = inOut(f, 18, 28, R1.introEnd - 18, R1.introEnd);
  return (
    <AbsoluteFill style={{ alignItems: "center", top: 268, opacity: a }}>
      <div style={{ fontFamily: THEME.ui, fontWeight: 600, fontSize: 28, letterSpacing: 8, color: THEME.dim }}>TEST DE REFLEJOS</div>
      <div style={{ fontFamily: THEME.display, fontWeight: 800, fontSize: 132, lineHeight: 1, marginTop: 14, color: THEME.text, textShadow: "0 4px 30px rgba(0,0,0,0.6)" }}>
        PAUSA EL VIDEO
      </div>
      <div style={{ fontFamily: THEME.ui, fontWeight: 500, fontSize: 44, marginTop: 14, color: THEME.text }}>cuando veas la barrera</div>
      <div style={{ fontFamily: THEME.ui, fontWeight: 500, fontSize: 34, marginTop: 22, color: THEME.dim, opacity: b }}>
        Pausar = frenar
      </div>
    </AbsoluteFill>
  );
};

/** Escala tiempo de pausa → resultado, para quien pausó y para quien no. */
const ResultCard: React.FC<{ f: number }> = ({ f }) => {
  const k = f - RESULT_AT;
  const a = ramp(k, 0, 10);
  const grow = ramp(k, 8, 26);
  const late = ramp(k, 22, 34);
  const X0 = 120;
  const W = 840;
  const TMAX = 1.5;
  const x = (t: number) => X0 + (t / TMAX) * W;
  const ticks = [0.75, 1.0, 1.5];

  return (
    <AbsoluteFill style={{ opacity: a }}>
      <AbsoluteFill style={{ alignItems: "center", top: 300 }}>
        <div style={{ fontFamily: THEME.ui, fontWeight: 600, fontSize: 26, letterSpacing: 6, color: THEME.dim }}>
          RONDA 1 · {KMH} km/h · BARRERA A {D} m
        </div>
        <div style={{ fontFamily: THEME.ui, fontWeight: 500, fontSize: 46, marginTop: 40, color: THEME.text }}>Tenías</div>
        <div style={{ fontFamily: THEME.display, fontWeight: 800, fontSize: 176, lineHeight: 1, color: THEME.green }}>
          <Tab>{fmt(T_LIMIT, 2)} s</Tab>
        </div>
        <div style={{ fontFamily: THEME.ui, fontWeight: 500, fontSize: 36, marginTop: 12, color: THEME.dim, textAlign: "center", lineHeight: 1.3 }}>
          para empezar a frenar
          <br />y detenerte antes de la barrera
        </div>
      </AbsoluteFill>

      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
        {/* segmentos */}
        <rect x={X0} y={890} width={(x(T_LIMIT) - X0) * Math.min(1, grow * 2.6)} height={14} rx={7} fill={THEME.green} />
        <rect
          x={x(T_LIMIT) + 4}
          y={890}
          width={Math.max(0, (X0 + W - x(T_LIMIT) - 4) * interpolate(grow, [0.38, 1], [0, 1], { extrapolateLeft: "clamp" }))}
          height={14}
          rx={7}
          fill={THEME.red}
        />
        {/* marcas de impacto */}
        {ticks.map((t) => (
          <g key={t} opacity={late}>
            <line x1={x(t)} x2={x(t)} y1={880} y2={914} stroke="rgba(255,255,255,0.55)" strokeWidth={2} />
            <text x={x(t)} y={866} textAnchor="middle" fill={THEME.text} style={{ fontFamily: THEME.ui, fontWeight: 600, fontSize: 25 }}>
              {Math.round(brakeOutcome(KMH, t, D, R1.decelG).impactKmh)} km/h
            </text>
            <text x={x(t)} y={950} textAnchor="middle" fill={THEME.dim} style={{ fontFamily: THEME.ui, fontWeight: 500, fontSize: 24 }}>
              {fmt(t, t === 1 || t === 1.5 ? 1 : 2)} s
            </text>
          </g>
        ))}
        <g opacity={late}>
          <text x={X0} y={866} fill={THEME.green} style={{ fontFamily: THEME.ui, fontWeight: 600, fontSize: 25 }}>te detienes</text>
          <text x={X0} y={950} fill={THEME.dim} style={{ fontFamily: THEME.ui, fontWeight: 500, fontSize: 24 }}>0 s</text>
          <text x={x(T_LIMIT)} y={950} textAnchor="middle" fill={THEME.green} style={{ fontFamily: THEME.ui, fontWeight: 700, fontSize: 24 }}>
            {fmt(T_LIMIT, 2)}
          </text>
          <text x={540} y={1010} textAnchor="middle" fill={THEME.dim} style={{ fontFamily: THEME.ui, fontWeight: 500, fontSize: 25 }}>
            velocidad estimada al llegar a la barrera
          </text>
        </g>
      </svg>

      <AbsoluteFill style={{ alignItems: "center", top: 1080, opacity: late }}>
        <div style={{ fontFamily: THEME.ui, fontWeight: 400, fontSize: 24, color: THEME.faint, textAlign: "center", lineHeight: 1.45 }}>
          Estimación con frenada constante de 0,8 g en asfalto seco.
          <br />
          Pausar un video no equivale a frenar un auto.
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

export const Ronda1: React.FC<{ withAudio?: boolean }> = ({ withAudio = true }) => {
  const f = useCurrentFrame();
  const driving = f < IMPACT_AT;
  const fMove = Math.min(f, IMPACT_AT - 1);
  const s = R1.startS + (V * fMove) / FPS;
  const sEvent = R1.startS + (V * R1.eventAt) / FPS;
  const barrierS = f >= R1.eventAt ? sEvent + D : null;
  const seams = SEAMS.filter((p) => p > s - 6).slice(0, 24);
  const ride = rideAt(fMove / FPS, s, V, SEAMS);

  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      {withAudio ? <Audio src={staticFile("audio/r1.wav")} /> : null}
      {driving ? (
        <>
          <DriveView s={s} travelPerFrame={V / FPS} ride={ride} seams={seams} barrierS={barrierS} />
          <Instruction f={f} />
          <Cockpit lift={-ride.dy * 400}>
            <ClusterDrive f={f} />
          </Cockpit>
        </>
      ) : f >= RESULT_AT ? (
        <>
          <ResultCard f={f} />
          <AbsoluteFill style={{ opacity: ramp(f - RESULT_AT, 0, 12) }}>
            <Cockpit glow={0.5}>
              <ClusterHazard f={f} />
            </Cockpit>
          </AbsoluteFill>
        </>
      ) : null}
    </AbsoluteFill>
  );
};
