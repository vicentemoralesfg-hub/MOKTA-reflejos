import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { DriveView } from "../world/DriveView";
import { rideAt } from "../lib/ride";
import { inOut, ramp } from "../lib/anim";
import { brakeOutcome, fmt, kmhToMs } from "../physics";
import { Cockpit } from "../prototipo/Cockpit";
import { THEME } from "../prototipo/theme";
import { ClusterDrive, ClusterHazard, Tab } from "./Hud";
import { D, DECEL_G, FPS, ROUNDS, SEAMS, kmhAt, lastStop, roundFrames, sAt } from "./config";

/**
 * Una ronda. Pausar = frenar.
 *  0 … rampFrames   (rondas 2 y 3) el auto acelera desde la velocidad anterior
 *  event            la barrera aparece a 90 m en un fotograma; el panel ya estaba en "0,00 s"
 *  … impact         sin frenar, el auto llega a la barrera: cada fotograma pausado muestra el
 *                   resultado estimado de frenar en ese instante
 *  impact           corte a negro (golpe)
 *  result …         lectura para todos: tiempo disponible o impacto mínimo + escala
 */
const DECOY_SPEED = 25; // m/s, auto en sentido contrario

/** Título de la ronda: se ve mientras la voz lo dice ("Ronda uno: 120") y sale al terminar la frase. */
const RoundTitle: React.FC<{ f: number; label: string; kmh: number; out: number }> = ({ f, label, kmh, out }) => {
  const a = inOut(f, 0, 8, out - 10, out);
  return (
    <AbsoluteFill style={{ alignItems: "center", top: 300, opacity: a }}>
      <div style={{ fontFamily: THEME.ui, fontWeight: 600, fontSize: 34, letterSpacing: 10, marginRight: -10, color: THEME.dim }}>{label}</div>
      <div style={{ display: "flex", alignItems: "baseline", gap: 14, marginTop: 4, translate: `0px ${interpolate(a, [0, 1], [12, 0])}px` }}>
        <span style={{ fontFamily: THEME.display, fontWeight: 800, fontSize: 168, lineHeight: 1, color: THEME.text, textShadow: "0 4px 30px rgba(0,0,0,0.6)" }}>{kmh}</span>
        <span style={{ fontFamily: THEME.display, fontWeight: 600, fontSize: 60, color: THEME.dim }}>km/h</span>
      </div>
    </AbsoluteFill>
  );
};

/**
 * Lectura de la ronda, en tres tiempos sincronizados con la voz (timeline.json):
 *  cardBigAt   cifra principal (con la primera frase)
 *  cardSubAt   explicación breve
 *  cardScaleAt escala "tu pausa → velocidad al llegar" (cuando la voz la menciona)
 */
const ResultCard: React.FC<{ index: number; k: number }> = ({ index, k }) => {
  const r = ROUNDS[index];
  const kmh = r.speedKmh;
  const tl = lastStop(kmh);
  const a = ramp(k, r.cardBigAt - 4, r.cardBigAt + 6);
  const sub = ramp(k, r.cardSubAt, r.cardSubAt + 10);
  const grow = ramp(k, r.cardScaleAt, r.cardScaleAt + 16);
  const late = ramp(k, r.cardScaleAt + 10, r.cardScaleAt + 20);
  const X0 = 120;
  const W = 840;
  const TMAX = 1.5;
  const x = (t: number) => X0 + (t / TMAX) * W;
  const impact = (t: number) => Math.round(brakeOutcome(kmh, t, D, DECEL_G).impactKmh);
  const brakingM = Math.round(kmhToMs(kmh) ** 2 / (2 * DECEL_G * 9.81));
  const ticks = tl !== null ? [0.75, 1.0, 1.5] : [0, 0.5, 1.0, 1.5];
  const greenEnd = tl !== null ? x(tl) : X0;

  return (
    <AbsoluteFill style={{ opacity: a }}>
      <AbsoluteFill style={{ alignItems: "center", top: 290 }}>
        <div style={{ fontFamily: THEME.ui, fontWeight: 600, fontSize: 26, letterSpacing: 6, marginRight: -6, color: THEME.dim }}>
          {r.label} · {kmh} km/h · BARRERA A {D} m
        </div>
        <div style={{ fontFamily: THEME.ui, fontWeight: 600, fontSize: 30, letterSpacing: 5, marginRight: -5, marginTop: 44, color: THEME.text }}>
          {tl !== null ? "TIEMPO PARA FRENAR A TIEMPO" : "IMPACTO AUNQUE FRENES AL INSTANTE"}
        </div>
        <div style={{ fontFamily: THEME.display, fontWeight: 800, fontSize: tl !== null ? 176 : 150, lineHeight: 1.08, color: tl !== null ? THEME.green : THEME.red }}>
          <Tab>{tl !== null ? `${fmt(tl, 2)} s` : `≈ ${impact(0)} km/h`}</Tab>
        </div>
        <div style={{ fontFamily: THEME.ui, fontWeight: 500, fontSize: 38, marginTop: 12, color: THEME.dim, textAlign: "center", lineHeight: 1.3, opacity: sub, translate: `0px ${interpolate(sub, [0, 1], [8, 0])}px` }}>
          {tl !== null ? null : (
            <>
              Frenar a {kmh}: <span style={{ color: THEME.text }}>{brakingM} m</span> · Barrera: <span style={{ color: THEME.text }}>{D} m</span>
            </>
          )}
        </div>
      </AbsoluteFill>

      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
        {tl !== null ? (
          <rect x={X0} y={890} width={(greenEnd - X0) * Math.min(1, grow * 2.6)} height={14} rx={7} fill={THEME.green} />
        ) : null}
        <rect
          x={greenEnd + (tl !== null ? 4 : 0)}
          y={890}
          width={Math.max(0, (X0 + W - greenEnd - (tl !== null ? 4 : 0)) * interpolate(grow, [tl !== null ? 0.38 : 0, 1], [0, 1], { extrapolateLeft: "clamp" }))}
          height={14}
          rx={7}
          fill={THEME.red}
        />
        {ticks.map((t) => (
          <g key={t} opacity={late}>
            <line x1={x(t)} x2={x(t)} y1={880} y2={914} stroke="rgba(255,255,255,0.55)" strokeWidth={2} />
            <text x={x(t)} y={866} textAnchor={t === 0 ? "start" : t === 1.5 ? "end" : "middle"} fill={THEME.text} style={{ fontFamily: THEME.ui, fontWeight: 600, fontSize: 26 }}>
              {impact(t)} km/h
            </text>
            <text x={x(t)} y={952} textAnchor={t === 0 ? "start" : t === 1.5 ? "end" : "middle"} fill={THEME.dim} style={{ fontFamily: THEME.ui, fontWeight: 500, fontSize: 25 }}>
              {t === 0 ? "0 s" : `${fmt(t, t === 0.75 ? 2 : 1)} s`}
            </text>
          </g>
        ))}
        {tl !== null ? (
          <g opacity={late}>
            <text x={X0} y={866} fill={THEME.green} style={{ fontFamily: THEME.ui, fontWeight: 600, fontSize: 26 }}>te detienes</text>
            <text x={X0} y={952} fill={THEME.dim} style={{ fontFamily: THEME.ui, fontWeight: 500, fontSize: 25 }}>0 s</text>
            <text x={greenEnd} y={952} textAnchor="middle" fill={THEME.green} style={{ fontFamily: THEME.ui, fontWeight: 700, fontSize: 25 }}>
              {fmt(tl, 2)}
            </text>
          </g>
        ) : null}
        <text x={540} y={1012} textAnchor="middle" opacity={late} fill={THEME.dim} style={{ fontFamily: THEME.ui, fontWeight: 500, fontSize: 26 }}>
          tu pausa → velocidad estimada al llegar a la barrera
        </text>
      </svg>

    </AbsoluteFill>
  );
};

export const RoundB: React.FC<{ index: number }> = ({ index }) => {
  const f = useCurrentFrame();
  const r = ROUNDS[index];
  const fr = roundFrames(index);
  const driving = f < fr.impact;
  const fMove = Math.min(f, fr.impact - 1);
  const kmhNow = kmhAt(index, fMove);
  const v = kmhToMs(kmhNow);
  const s = sAt(index, fMove);
  const barrierS = f >= fr.event ? sAt(index, fr.event) + D : null;
  const seamList = SEAMS[r.id];
  const seams = seamList.filter((p) => p > s - 6).slice(0, 24);
  const ride = rideAt(fMove / FPS, s, v, seamList);

  let decoyS: number | null = null;
  if (r.decoyPassAt !== undefined) {
    const pos = sAt(index, r.decoyPassAt) - (DECOY_SPEED * (fMove - r.decoyPassAt)) / FPS;
    if (pos > s - 8) decoyS = pos;
  }

  const roundLabel = index === ROUNDS.length - 1 ? "FINAL" : `${index + 1} / ${ROUNDS.length}`;

  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      {driving ? (
        <>
          <DriveView s={s} travelPerFrame={v / FPS} ride={ride} seams={seams} barrierS={barrierS} decoyS={decoyS} />
          <RoundTitle f={f} label={r.label} kmh={r.speedKmh} out={r.titleOut} />
          <Cockpit lift={-ride.dy * 400}>
            <ClusterDrive f={f} eventAt={fr.event} kmh={r.speedKmh} displayKmh={kmhNow} roundLabel={`RONDA ${roundLabel}`} />
          </Cockpit>
        </>
      ) : f >= fr.result ? (
        <>
          <ResultCard index={index} k={f - fr.result} />
          <AbsoluteFill style={{ opacity: ramp(f - fr.result, 0, 10) }}>
            <Cockpit glow={0.5}>
              <ClusterHazard f={f} f0={fr.result} />
            </Cockpit>
          </AbsoluteFill>
        </>
      ) : null}
    </AbsoluteFill>
  );
};
