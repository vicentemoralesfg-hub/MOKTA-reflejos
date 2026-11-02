import React from "react";
import { AbsoluteFill } from "remotion";
import { C, DISPLAY, UI } from "../brand";
import { Engine } from "../reels/motor/Engine";

/** Imagen 02 · Póster "100 explosiones por segundo" (1080×1350). Acompaña / promociona el Reel 03. */
export const Explosiones: React.FC = () => (
  <AbsoluteFill style={{ background: "#07080B", overflow: "hidden" }}>
    <AbsoluteFill style={{ background: "radial-gradient(800px 700px at 50% 78%, rgba(255,120,40,0.22), transparent 70%)" }} />
    {/* motor detenido justo en una explosión del cilindro 3 (θ = 182°) */}
    <div style={{ position: "absolute", left: 164, top: 20, width: 1080, height: 1920, transformOrigin: "0 0", scale: "0.8" }}>
      <Engine theta={186} dTheta={0} />
    </div>
    <AbsoluteFill style={{ background: "linear-gradient(180deg, #07080B 0%, #07080B 28%, rgba(7,8,11,0) 41%)" }} />
    <div style={{ position: "absolute", top: 70, left: 0, right: 0, textAlign: "center" }}>
      <div style={{ fontFamily: UI, fontWeight: 700, fontSize: 34, letterSpacing: 8, color: C.dim }}>TU MOTOR HACE</div>
      <div style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: 330, lineHeight: 0.86, color: C.yellow, textShadow: "0 0 80px rgba(255,160,40,0.35)" }}>100</div>
      <div style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: 96, lineHeight: 0.95, color: C.white }}>EXPLOSIONES POR SEGUNDO</div>
      <div style={{ marginTop: 18, fontFamily: UI, fontWeight: 600, fontSize: 32, color: C.faint }}>4 cilindros · 3.000 rpm</div>
    </div>
    <div style={{ position: "absolute", bottom: 46, left: 0, right: 0, textAlign: "center", fontFamily: DISPLAY, fontWeight: 700, fontSize: 36, letterSpacing: 16, color: "rgba(244,246,248,0.5)" }}>MOKTA</div>
  </AbsoluteFill>
);
