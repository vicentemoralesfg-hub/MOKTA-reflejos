import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { EASE_IN_OUT, EASE_OUT, pop, ramp, rnd } from "../anim";
import { Background } from "../components/Background";
import { Captions } from "../components/Captions";
import { Cam, Stage, mapPt } from "../components/Stage";
import { uglyCar } from "../components/presets";
import { Callout, Ficha, Icon, PriceChip, Stamp, ZoneBadge } from "../components/ui";
import { C, FONT_DISPLAY } from "../theme";
import { at } from "../timeline";

const ID = "s03";

export const S03Green: React.FC = () => {
  const f = useCurrentFrame();
  const tPuertas = at(ID, "puertas");
  const tPara = at(ID, "parachoques");
  const tTapa = at(ID, "tapabarros");
  const tFocos = at(ID, "focos");
  const tAper = at(ID, "apernadas");
  const tCamb = at(ID, "cambian");
  const tRep = at(ID, "repuestos");
  const tEstr = at(ID, "estructura");
  const tPlata = at(ID, "plata");

  const cam: Cam = { left: 40, top: 470, width: 1000, zoom: interpolate(f, [0, 20], [1.25, 1], { extrapolateRight: "clamp", easing: EASE_OUT }) };
  // barrido antes/después
  const wipe = interpolate(f, [tCamb, tCamb + 26], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: EASE_IN_OUT });
  const wipeX = cam.left + wipe * 1000;
  const xr = interpolate(f, [tEstr - 4, tEstr + 6, tPlata - 8, tPlata], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const calloutsOut = tCamb - 2;
  const P = (x: number, y: number) => mapPt(cam, x, y);
  const pD = P(560, 250);
  const pB = P(960, 285);
  const pT = P(182, 246);
  const pF = P(950, 236);

  const greenCage = { color: C.green, glow: 0.8 };
  return (
    <AbsoluteFill>
      <Background zone="green" cy={36} flash={interpolate(f, [tPlata, tPlata + 6], [0.5, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })} />
      <ZoneBadge at={0} color={C.green} title="ZONA VERDE" sub="Oportunidad" icon={<Icon name="bolt" size={44} />} />

      {/* auto dañado (fondo) y reparado (recortado por el barrido) */}
      <Stage cam={cam} car={{ id: "g-ugly", ...uglyCar(), t: f, xray: xr, parts: { floor: greenCage, pillarA: greenCage, pillarB: greenCage, pillarC: greenCage, roofRail: greenCage, rail: greenCage, rearRail: greenCage } }} />
      <div style={{ position: "absolute", inset: 0, clipPath: `inset(0px ${1080 - wipeX}px 0px 0px)` }}>
        <Stage cam={cam} car={{ id: "g-fixed", paint: C.blue, shine: 1, t: f, xray: xr, parts: { floor: greenCage, pillarA: greenCage, pillarB: greenCage, pillarC: greenCage, roofRail: greenCage, rail: greenCage, rearRail: greenCage } }} />
      </div>
      {wipe > 0 && wipe < 1 && (
        <div style={{ position: "absolute", left: wipeX - 6, top: 400, width: 12, height: 560, background: C.green, boxShadow: `0 0 40px 12px ${C.green}`, borderRadius: 6 }} />
      )}
      {wipe > 0 && (
        <>
          <div style={{ position: "absolute", left: 70, top: 410, fontFamily: FONT_DISPLAY, fontWeight: 800, fontSize: 46, color: "#fff", opacity: ramp(f, tCamb + 26, tCamb + 32) * (1 - ramp(f, tEstr - 6, tEstr)), letterSpacing: 3 }}>ANTES → DESPUÉS</div>
        </>
      )}

      {/* señalización de piezas */}
      <Callout at={tPuertas} x={pD.x} y={pD.y} lx={300} ly={420} text="PUERTAS" color={C.green} out={calloutsOut} />
      <Callout at={tPara} x={pB.x} y={pB.y} lx={860} ly={900} text="PARACHOQUES" color={C.green} out={calloutsOut} />
      <Callout at={tTapa} x={pT.x} y={pT.y} lx={230} ly={900} text="TAPABARROS" color={C.green} out={calloutsOut} />
      <Callout at={tFocos} x={pF.x} y={pF.y} lx={850} ly={420} text="FOCOS" color={C.green} out={calloutsOut} />

      {/* pernos */}
      {f >= tAper && f < tCamb + 4 &&
        [P(300, 210), P(505, 208), P(735, 206), P(908, 258), P(122, 258), P(505, 296)].map((p, i) => {
          const s = pop(f, tAper + i * 2, 8);
          return (
            <div key={i} style={{ position: "absolute", left: p.x, top: p.y, translate: "-50% -50%", width: 64, height: 64, borderRadius: 99, background: C.green, display: "flex", alignItems: "center", justifyContent: "center", scale: s, rotate: `${(f - tAper) * 18}deg`, boxShadow: `0 0 24px ${C.green}`, opacity: 1 - ramp(f, tCamb, tCamb + 4) }}>
              <Icon name="bolt" size={40} />
            </div>
          );
        })}
      {f >= tAper && f < tCamb + 4 && (
        <div style={{ position: "absolute", left: 0, right: 0, top: 940, textAlign: "center", fontFamily: FONT_DISPLAY, fontWeight: 800, fontSize: 88, color: C.green, scale: interpolate(pop(f, tAper, 8), [0, 1], [0.3, 1]), opacity: 1 - ramp(f, tCamb, tCamb + 4), textShadow: "0 6px 0 #000" }}>
          SE SACAN CON LLAVE
        </div>
      )}

      {/* repuestos usados */}
      <PriceChip at={tRep} x={290} y={990} value="$150 mil" label="puerta usada" color={C.green} out={tEstr - 9} />
      <PriceChip at={tRep + 5} x={790} y={1060} value="$120 mil" label="parachoques" color={C.green} out={tEstr - 9} />
      <PriceChip at={tRep + 10} x={300} y={1130} value="$90 mil" label="foco alternativo" color={C.green} out={tEstr - 9} />
      <PriceChip at={tRep + 15} x={780} y={1200} value="$140 mil" label="pintura x pieza" color={C.green} out={tEstr - 9} />

      {/* ficha */}
      {f >= tEstr - 2 && (
        <Ficha
          at={tEstr - 2}
          top={990}
          accent={C.green}
          rows={[
            { label: "REPUESTOS", level: 1, note: "BARATOS" },
            { label: "MANO DE OBRA", level: 2, note: "SIMPLE" },
            { label: "SEGURIDAD", level: 1, note: "INTACTA" },
            { label: "REVENTA", level: 2, note: "SE MANTIENE" },
          ]}
        />
      )}
      {xr > 0.5 && f < tPlata && (
        <div style={{ position: "absolute", left: 0, right: 0, top: 410, textAlign: "center", fontFamily: FONT_DISPLAY, fontWeight: 800, fontSize: 60, color: C.green, letterSpacing: 2, display: "flex", justifyContent: "center", alignItems: "center", gap: 14 }}>
          <Icon name="check" color={C.green} size={60} /> ESTRUCTURA INTACTA
        </div>
      )}

      {/* billetes */}
      {f >= tPlata &&
        Array.from({ length: 16 }, (_, i) => {
          const life = f - tPlata - (i % 5) * 2;
          if (life < 0) return null;
          const x = 540 + (rnd(i) - 0.5) * 1000;
          const y = -80 + life * (14 + rnd(i + 3) * 10);
          return (
            <div key={i} style={{ position: "absolute", left: x, top: y, width: 150, height: 74, borderRadius: 8, background: "linear-gradient(135deg,#43E08A,#0E9F5A)", border: "3px solid #BDF7D5", rotate: `${(rnd(i + 9) - 0.5) * 80 + life * 4}deg`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: FONT_DISPLAY, fontWeight: 800, fontSize: 40, color: "#064E2C" }}>
              $
            </div>
          );
        })}
      <Stamp at={tPlata} text="ESTO ES PLATA" color={C.green} y={700} size={118} rotate={-6} />
      <Captions id={ID} accent={C.green} keywords={["verde", "apernadas", "intacta", "plata", "usados"]} y={1430} />
    </AbsoluteFill>
  );
};
