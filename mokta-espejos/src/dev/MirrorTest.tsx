import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { SideMirror, PAN_RIGHT, PAN_SLIVER } from "../components/SideMirror";

export const MirrorTest: React.FC = () => {
  const f = useCurrentFrame();
  const t = f / 30;
  return (
    <AbsoluteFill style={{ background: "#0B111B", alignItems: "center", justifyContent: "space-around", flexDirection: "column" }}>
      <SideMirror t={t} pan={0} bodyAlert={1} width={900} />
      <SideMirror t={t} pan={PAN_SLIVER} sliver={1} width={900} />
      <SideMirror t={t} pan={PAN_RIGHT} blindCarMark={1} width={900} side="left" />
    </AbsoluteFill>
  );
};
