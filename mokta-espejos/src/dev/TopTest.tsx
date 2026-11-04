import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { TopDown } from "../components/TopDown";
import { COLORS } from "../config";

export const TopTest: React.FC<{ mode: number }> = ({ mode }) => {
  const t = useCurrentFrame() / 30;
  if (mode === 0)
    return (
      <AbsoluteFill>
        <TopDown t={t} cam={{ ax: 540, ay: 640, fx: 540, fy: 1000, s: 0.85 }} vL={0} vR={0} overlap={1} blindZones={1}
          cars={[{ id: "th", x: 290, y: 1220, color: COLORS.threat }, { id: "far", x: 790, y: 300, color: "#3E7BD6" }]} />
      </AbsoluteFill>
    );
  if (mode === 1)
    return (
      <AbsoluteFill>
        <TopDown t={t} cam={{ ax: 540, ay: 760, fx: 540, fy: 990, s: 2.6 }} vL={-0.83} vR={0} aimL={0} interior={1} headDx={-22} sightL={1} sideOpacityR={0.3} rearOpacity={0.3} />
      </AbsoluteFill>
    );
  return (
    <AbsoluteFill>
      <TopDown t={t} cam={{ ax: 540, ay: 520, fx: 540, fy: 1000, s: 0.66 }} vL={1} vR={1} sideGreen={1} peripheral={1}
        cars={[{ id: "ov", x: 290, y: 1750, color: COLORS.threat, mark: 1 }]} />
    </AbsoluteFill>
  );
};
