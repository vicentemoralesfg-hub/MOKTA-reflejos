import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { Car } from "./components/Car";
import { C } from "./theme";

export const CarTest: React.FC = () => {
  const t = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: "#1a1440", alignItems: "center", justifyContent: "space-around" }}>
      <Car id="a" paint={C.blue} width={1000} t={t}
        dents={[{ x: 410, y: 255, rx: 46, ry: 26 }, { x: 610, y: 262, rx: 40, ry: 22 }, { x: 180, y: 248, rx: 30, ry: 18 }]}
        scratches={1} scuffs={1} brokenHeadlight={1} bumperDrop={0.7} crackedGlass={1} />
      <Car id="b" paint="#E9EDF2" width={1000} t={t} shine={1} bumperCrack={1} />
      <Car id="c" paint={C.blue} width={1000} t={t} xray={1} frontCrush={0.7} pillarBend={0.6} floorWrinkle={1} rearCrush={0.4}
        parts={{ rail: { color: C.red, glow: 1 }, harness: {}, ecu: {}, srs: {}, seats: {} }} airbag={0.8} />
    </AbsoluteFill>
  );
};
