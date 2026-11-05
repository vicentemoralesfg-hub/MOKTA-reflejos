import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { EASE_IN_OUT, EASE_OUT, ramp, shake } from "../anim";
import { Background } from "../components/Background";
import { Captions } from "../components/Captions";
import { Cam, Stage, mapPt } from "../components/Stage";
import { Callout, Ficha, Icon, Slam, Stamp, ZoneBadge } from "../components/ui";
import { C } from "../theme";
import { at } from "../timeline";

const ID = "s05";

export const S05Red: React.FC = () => {
  const f = useCurrentFrame();
  const tLev = at(ID, "levanta");
  const tArr = at(ID, "arrugado");
  const tEstr = at(ID, "estructura");
  const tPilar = at(ID, "pilar");
  const tDobl = at(ID, "doblado");
  const tJaula = at(ID, "jaula");
  const tVolc = at(ID, "volcamiento");
  const tMisma = at(ID, "misma");
  const tBonito = at(ID, "bonito");

  const zoomRear = interpolate(f, [0, 14, tPilar - 8, tPilar + 6], [1.3, 2.3, 2.3, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: EASE_IN_OUT });
  const roll = interpolate(f, [tVolc - 2, tVolc + 22], [0, -360], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: EASE_IN_OUT });
  const cam: Cam = { left: 40, top: 560, width: 1000, zoom: zoomRear, fx: interpolate(f, [tPilar - 8, tPilar + 6], [140, 500], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: EASE_IN_OUT }), fy: 270, rot: roll, dx: 260 * ramp(f, 0, 14) * (1 - ramp(f, tPilar - 8, tPilar + 6, EASE_IN_OUT)) };
  const xray = ramp(f, tLev - 2, tLev + 8);
  const carpet = ramp(f, tLev + 4, tLev + 16, EASE_OUT);
  const wr = ramp(f, tArr, tArr + 10);
  const bend = ramp(f, tDobl, tDobl + 10, EASE_OUT);
  const cageOn = f >= tPilar;
  const allRed = f >= tMisma;
  const cyanCage = { color: C.cyan, glow: 1 };
  const redCage = { color: C.red, glow: 1.3 };
  const cage = (pid: "pillarA" | "pillarB" | "pillarC" | "roofRail" | "floor") => {
    if (!cageOn) return { opacity: 0.35 };
    if (allRed || (pid === "pillarB" && f >= tDobl)) return redCage;
    return cyanCage;
  };
  const P = (x: number, y: number) => mapPt(cam, x, y);
  const sh = shake(f, tDobl + 2, 20, 12);
  const sh2 = shake(f, tBonito, 18, 12);

  return (
    <AbsoluteFill>
      <Background zone="red" cy={40} flash={interpolate(f, [tMisma, tMisma + 5], [0.5, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })} />
      <ZoneBadge at={0} color={C.red} title="ZONA ROJA" sub="Peligro" icon={<Icon name="skull" size={44} />} />
      <AbsoluteFill style={{ translate: `${sh.x + sh2.x}px ${sh.y + sh2.y}px` }}>
        <Stage
          cam={cam}
          car={{
            id: "r-car",
            paint: "#8B5CF6",
            t: f,
            rearCrush: 0.22,
            xray,
            floorWrinkle: wr,
            pillarBend: bend,
            parts: {
              trunkFloor: f >= tArr ? { color: C.red, glow: 1.2 } : { color: C.cyan },
              rearRail: f >= tEstr ? { color: C.red, glow: 1.2 } : { opacity: 0.4 },
              pillarA: cage("pillarA"),
              pillarB: cage("pillarB"),
              pillarC: cage("pillarC"),
              roofRail: cage("roofRail"),
              floor: cage("floor"),
              seats: { opacity: 0.4 },
            },
          }}
        >
          {/* alfombra del maletero que se levanta */}
          {f < tPilar && (
            <g transform={`rotate(${-carpet * 62} 226 274)`} opacity={xray}>
              <rect x={52} y={266} width={174} height={12} rx={4} fill="#3A3F4B" stroke="#9AA3B5" strokeWidth={2} />
              {[0, 1, 2, 3, 4, 5, 6].map((i) => (
                <line key={i} x1={62 + i * 24} y1={268} x2={70 + i * 24} y2={276} stroke="#666E80" strokeWidth={2} />
              ))}
            </g>
          )}
          {/* grietas en la jaula */}
          {allRed && (
            <g stroke="#fff" strokeWidth={3} fill="none" opacity={0.9}>
              <path d="M500 190 l-14 8 l10 6 l-12 8" />
              <path d="M690 160 l-10 10 l12 2 l-8 12" />
              <path d="M260 160 l12 6 l-6 10 l12 4" />
            </g>
          )}
        </Stage>
        {f < tPilar - 6 && (
          <>
            <Callout at={tLev + 10} x={P(120, 262).x} y={P(120, 262).y} lx={700} ly={480} text="LEVANTA LA ALFOMBRA" color="#fff" out={tArr} />
            <Callout at={tArr + 4} x={P(130, 288).x} y={P(130, 288).y} lx={620} ly={1080} text="PISO ARRUGADO" sub="= golpe estructural" color={C.red} />
          </>
        )}
        {f >= tPilar && f < tVolc && (
          <Callout at={tDobl} x={P(490, 210).x} y={P(490, 210).y} lx={540} ly={470} text="PILAR DOBLADO" color={C.red} out={tVolc - 4} />
        )}
        {f >= tJaula - 2 && f < tVolc + 30 && (
          <Slam at={tJaula - 2} y={470} size={86} color={C.cyan} out={tVolc + 24}>
            JAULA DE SEGURIDAD
          </Slam>
        )}
      </AbsoluteFill>
      {f >= tJaula + 4 && (
        <Ficha
          at={tJaula + 4}
          top={1040}
          accent={C.red}
          rows={[
            { label: "REPUESTOS", level: 4, note: "ALTO" },
            { label: "MANO DE OBRA", level: 5, note: "SOLDADURA" },
            { label: "SEGURIDAD", level: 5, note: "CRÍTICA" },
            { label: "REVENTA", level: 5, note: "SE DESPLOMA" },
          ]}
        />
      )}
      <Stamp at={tBonito - 4} text="NO SE ARREGLA BONITO" color={C.red} y={460} size={84} rotate={-5} />
      <Captions id={ID} accent={C.red} keywords={["roja", "arrugado", "estructura", "doblado", "jaula", "bonito"]} y={1430} />
    </AbsoluteFill>
  );
};
