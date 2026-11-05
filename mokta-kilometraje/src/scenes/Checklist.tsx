import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { COLORS, FONT_DISPLAY, FONT_UI, MarkerId, mk } from "../config";
import { At, SceneShell } from "../components/SceneShell";
import { IconCheck, IconDoc, IconKeyCold, IconScanner, IconWheel } from "../components/Icons";
import { EASE_OUT, pop, ramp } from "../lib/anim";

const ITEMS: { marker: MarkerId; title: string; sub: string; icon: (f: number) => React.ReactNode }[] = [
  { marker: "chk1", title: "HISTORIAL DE MANTENCIONES", sub: "Boletas con fecha y kilometraje", icon: () => <IconDoc size={96} color={COLORS.accent} /> },
  { marker: "chk2", title: "VOLANTE, PEDALES Y ASIENTO", sub: "¿Gastados con pocos km? Alerta", icon: (f) => <IconWheel size={96} color={COLORS.accent} t={f} /> },
  { marker: "chk3", title: "ARRANQUE EN FRÍO", sub: "Ruidos, humo o testigos", icon: () => <IconKeyCold size={96} color={COLORS.accent} /> },
  { marker: "chk4", title: "ESCÁNER + MECÁNICO", sub: "De tu confianza, no del vendedor", icon: (f) => <IconScanner size={96} color={COLORS.accent} t={f} /> },
];

/** Antes de comprar, revisa 4 cosas. */
export const Checklist: React.FC = () => {
  const f = useCurrentFrame();
  const done = ITEMS.filter((it) => f >= mk(it.marker, "checklist") + 14).length;
  return (
    <SceneShell tint="neutral" glow={0.24}>
      <At top={225}>
        <div style={{ fontFamily: FONT_UI, fontWeight: 700, fontSize: 34, letterSpacing: 8, color: COLORS.accent, opacity: ramp(f, 0, 8) }}>
          ANTES DE COMPRAR
        </div>
        <div style={{ display: "flex", alignItems: "baseline", gap: 26, marginTop: 6 }}>
          <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 800, fontSize: 132, lineHeight: 1, color: COLORS.white, scale: String(interpolate(ramp(f, 0, 10), [0, 1], [1.1, 1])) }}>
            REVISA ESTO
          </div>
          <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 800, fontSize: 80, color: done === 4 ? COLORS.green : COLORS.yellow, fontVariantNumeric: "tabular-nums" }}>
            {done}/4
          </div>
        </div>
      </At>
      <At top={445}>
        <div style={{ display: "flex", flexDirection: "column", gap: 22, marginRight: 50 }}>
          {ITEMS.map((it) => {
            const at = mk(it.marker, "checklist");
            const p = ramp(f, at - 4, at + 8, EASE_OUT);
            const c = ramp(f, at + 12, at + 20);
            const checked = f >= at + 12;
            return (
              <div
                key={it.title}
                style={{
                  width: 880,
                  height: 226,
                  boxSizing: "border-box",
                  borderRadius: 30,
                  background: COLORS.panel,
                  border: `2px solid ${checked ? COLORS.green + "aa" : COLORS.panelBorder}`,
                  display: "flex",
                  alignItems: "center",
                  gap: 24,
                  padding: "0 28px",
                  opacity: p,
                  translate: `${interpolate(p, [0, 1], [-700, 0])}px 0px`,
                  boxShadow: checked ? `0 0 ${40 * (1 - ramp(f, at + 12, at + 40)) + 10}px ${COLORS.green}44` : "0 20px 50px rgba(0,0,0,0.5)",
                }}
              >
                <div style={{ width: 120, height: 120, borderRadius: 24, background: "rgba(127,211,255,0.10)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  {it.icon(f)}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 800, fontSize: 56, lineHeight: 0.96, color: COLORS.white }}>{it.title}</div>
                  <div style={{ fontFamily: FONT_UI, fontWeight: 500, fontSize: 32, lineHeight: 1.2, color: COLORS.dim, marginTop: 10, whiteSpace: "nowrap" }}>{it.sub}</div>
                </div>
                <div
                  style={{
                    width: 84,
                    height: 84,
                    borderRadius: 42,
                    flexShrink: 0,
                    border: `4px solid ${checked ? COLORS.green : "rgba(255,255,255,0.25)"}`,
                    background: checked ? COLORS.green : "transparent",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    scale: String(checked ? interpolate(pop(f, at + 12, 8), [0, 1], [0.6, 1]) : 1),
                  }}
                >
                  <IconCheck size={64} color={COLORS.ink} progress={c} />
                </div>
              </div>
            );
          })}
        </div>
      </At>
    </SceneShell>
  );
};
