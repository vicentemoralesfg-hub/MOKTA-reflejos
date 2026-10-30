import React from "react";
import { AbsoluteFill } from "remotion";
import { brakeOutcome, fmt } from "../physics";
import { THEME } from "../prototipo/theme";
import { D, DECEL_G, FPS } from "./config";

export const Label: React.FC<{ children: React.ReactNode; style?: React.CSSProperties }> = ({ children, style }) => (
  <div style={{ fontFamily: THEME.ui, fontWeight: 600, fontSize: 24, letterSpacing: 2.5, color: THEME.dim, ...style }}>
    {children}
  </div>
);

export const Tab: React.FC<{ children: React.ReactNode; style?: React.CSSProperties }> = ({ children, style }) => (
  <span style={{ fontVariantNumeric: "tabular-nums", ...style }}>{children}</span>
);

/**
 * Instrumental durante la conducción. El panel no anuncia la barrera: el cronómetro ya marca
 * "0,00 s" antes del evento y el resultado entra con un fundido lineal de 8 fotogramas.
 */
export const ClusterDrive: React.FC<{
  f: number;
  eventAt: number;
  kmh: number;
  displayKmh: number;
  roundLabel: string;
}> = ({ f, eventAt, kmh, displayKmh, roundLabel }) => {
  const live = f >= eventAt;
  const t = live ? (f - eventAt) / FPS : 0;
  const o = brakeOutcome(kmh, t, D, DECEL_G);
  const reveal = live ? Math.min(1, (f - eventAt) / 8) : 0;
  const outcome = !live
    ? ""
    : o.stops
      ? o.marginM < 1
        ? "Te detienes a < 1 m"
        : `Te detienes a ${Math.floor(o.marginM)} m`
      : `Impacto a ≈ ${Math.round(o.impactKmh)} km/h`;

  return (
    <>
      <div style={{ position: "absolute", left: 34, top: 22 }}>
        <Label>{roundLabel}</Label>
        <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginTop: 2 }}>
          <Tab style={{ fontFamily: THEME.display, fontWeight: 700, fontSize: 92, lineHeight: 1 }}>{Math.round(displayKmh)}</Tab>
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
          <div style={{ width: 10, height: 10, borderRadius: 5, background: o.stops ? THEME.green : THEME.red, opacity: reveal }} />
          <Label>SI FRENAS AQUÍ</Label>
        </div>
        <div style={{ fontFamily: THEME.ui, fontWeight: 600, fontSize: 34, marginTop: 2, color: THEME.text, opacity: reveal, whiteSpace: "nowrap", minHeight: 44 }}>
          <Tab>{outcome}</Tab>
        </div>
      </div>
    </>
  );
};

/** Balizas de emergencia (1,33 Hz). `f0` = fotograma en que empiezan; el audio usa el mismo período. */
export const HAZARD_PERIOD_S = 0.75;
export const ClusterHazard: React.FC<{ f: number; f0: number }> = ({ f, f0 }) => {
  const period = FPS * HAZARD_PERIOD_S;
  const on = (f - f0) % period < period * 0.5;
  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
      <svg width={70} height={62} viewBox="0 0 70 62" style={{ opacity: on ? 1 : 0.12 }}>
        <path d="M35 4 L66 58 L4 58 Z" fill="none" stroke={THEME.red} strokeWidth={6} strokeLinejoin="round" />
        <path d="M35 22 L50 48 L20 48 Z" fill="none" stroke={THEME.red} strokeWidth={4} strokeLinejoin="round" />
      </svg>
    </AbsoluteFill>
  );
};

/** Pantalla de inicio del instrumental con la marca (gancho, cierre y CTA). */
export const ClusterBrand: React.FC<{ sub?: string }> = ({ sub = "TEST DE REFLEJOS" }) => (
  <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
    <div style={{ fontFamily: THEME.display, fontWeight: 700, fontSize: 56, letterSpacing: 22, marginRight: -22, color: THEME.text }}>
      MOKTA
    </div>
    <div style={{ fontFamily: THEME.ui, fontWeight: 600, fontSize: 20, letterSpacing: 6, marginRight: -6, marginTop: 6, color: THEME.dim }}>
      {sub}
    </div>
  </AbsoluteFill>
);
