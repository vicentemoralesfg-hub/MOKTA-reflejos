import React from "react";
import { useCurrentFrame } from "remotion";
import { COLORS, FONT_UI, MarkerId, SceneId, mk } from "../config";
import { At, SceneShell } from "../components/SceneShell";
import { Tile } from "../components/Tile";
import { WearMeter } from "../components/WearMeter";
import { IconBump, IconCalendarX, IconPedals, IconRoute, IconTacho, IconThermo } from "../components/Icons";
import { EASE_OUT, ramp } from "../lib/anim";

type Item = { marker: MarkerId; title: string; sub: string; icon: (f: number) => React.ReactNode };

const CITY: Item[] = [
  {
    marker: "ciuCortos",
    title: "TRAYECTOS CORTOS",
    sub: "El motor apaga antes de calentarse",
    icon: (f) => <IconRoute size={104} color={COLORS.red} t={f} />,
  },
  {
    marker: "ciuFrenos",
    title: "FRENOS Y EMBRAGUE",
    sub: "Parar y partir todo el día",
    icon: (f) => <IconPedals size={104} color={COLORS.red} t={f} />,
  },
  {
    marker: "ciuMotor",
    title: "MOTOR SIEMPRE FRÍO",
    sub: "Aceite contaminado con bencina y humedad",
    icon: () => <IconThermo size={104} color={COLORS.red} level={0.18} snow />,
  },
];

const HABITS: Item[] = [
  {
    marker: "habFrio",
    title: "ACELERAR EN FRÍO",
    sub: "Revoluciones altas sin aceite a temperatura",
    icon: (f) => <IconTacho size={104} color={COLORS.red} value={0.82 + 0.06 * Math.sin(f / 2)} />,
  },
  {
    marker: "habLomos",
    title: "LOMOS DE TORO RÁPIDO",
    sub: "Amortiguadores, bujes y rótulas",
    icon: (f) => <IconBump size={104} color={COLORS.red} t={f} />,
  },
  {
    marker: "habMant",
    title: "MANTENCIONES SALTADAS",
    sub: "Aceite y filtros vencidos",
    icon: () => <IconCalendarX size={104} color={COLORS.red} />,
  },
];

const WearScene: React.FC<{ id: SceneId; items: Item[]; kicker: string; from: number; to: number }> = ({ id, items, kicker, from, to }) => {
  const f = useCurrentFrame();
  const ats = items.map((it) => mk(it.marker, id));
  // el medidor sube un escalón con cada ítem
  const step = (to - from) / items.length;
  const value = ats.reduce((v, a) => v + step * ramp(f, a, a + 12, EASE_OUT), from);
  const lastAt = ats[ats.length - 1];
  return (
    <SceneShell tint="red" glow={0.18 + 0.12 * value} shakes={id === "habitos" ? [{ at: lastAt, amp: 14 }] : []}>
      <At top={240} style={{ opacity: ramp(f, 0, 8) }}>
        <WearMeter value={value} title="DESGASTE REAL · AUTO A" subtitle="80.000 km" blink={f / 4} />
      </At>
      <At top={500}>
        <div style={{ fontFamily: FONT_UI, fontWeight: 700, fontSize: 30, letterSpacing: 6, color: COLORS.accent, marginBottom: 20, opacity: ramp(f, 2, 10, EASE_OUT) }}>
          {kicker}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
          {items.map((it, i) => (
            <Tile key={it.title} f={f} at={ats[i]} icon={it.icon(f)} title={it.title} sub={it.sub} color={COLORS.red} />
          ))}
        </div>
      </At>
    </SceneShell>
  );
};

export const City: React.FC = () => <WearScene id="ciudad" items={CITY} kicker="CÓMO SE USÓ" from={0.3} to={0.62} />;
export const Habits: React.FC = () => <WearScene id="habitos" items={HABITS} kicker="CÓMO LO MANEJARON" from={0.62} to={0.95} />;
