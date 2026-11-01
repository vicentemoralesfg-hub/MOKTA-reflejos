import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { COLORS, FONT_DISPLAY, FONT_UI, FPS, TEXT, beat } from "../config";
import { Windshield } from "../components/Windshield";
import { BookmarkIcon, CommentIcon, SendIcon } from "../components/Icons";
import { Grade, H, Marker, Pop, Slam } from "../components/Kinetic";
import { ramp, shake } from "../lib/anim";

/** Cierre: pregunta para comentarios + guardar + compartir. Fondo: vidrio limpio, de noche. */
export const Cta: React.FC = () => {
  const f = useCurrentFrame();
  const B = { comment: beat("cta", "comment"), save: beat("cta", "save"), share: beat("cta", "share"), brand: beat("cta", "brand") };
  const sh = shake(f, [0], 14);
  const row = (icon: React.ReactNode, text: string) => (
    <div style={{ display: "flex", alignItems: "center", gap: 22, fontFamily: FONT_UI, fontWeight: 700, fontSize: 42, color: COLORS.white, textShadow: "0 2px 14px rgba(0,0,0,0.8)" }}>
      {icon}
      {text}
    </div>
  );
  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.ink }}>
      <Windshield id="cta" t={f / FPS + 22} fog={0} vents={0.4} />
      <AbsoluteFill style={{ background: "rgba(3,5,9,0.6)" }} />
      <AbsoluteFill style={{ translate: `${sh.x}px ${sh.y}px` }}>
        <div style={{ position: "absolute", top: 330, left: 0, right: 0 }}>
          <Slam at={0} from={1.7}>
            <div style={{ ...H, fontSize: 150 }}>{TEXT.ctaQ1}</div>
          </Slam>
          <Pop at={5} style={{ display: "flex", justifyContent: "center", marginTop: 16 }}>
            <div style={{ ...H, fontSize: 196 }}>
              <Marker at={6} color={COLORS.red}>
                {TEXT.ctaQ2}
              </Marker>
            </div>
          </Pop>
        </div>
        <div style={{ position: "absolute", top: 820, left: 0, right: 0, display: "flex", justifyContent: "center" }}>
          <Pop at={B.comment}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 22,
                padding: "26px 44px",
                borderRadius: 30,
                background: COLORS.white,
                color: COLORS.ink,
                fontFamily: FONT_UI,
                fontWeight: 800,
                fontSize: 50,
                boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
              }}
            >
              <CommentIcon size={54} stroke={8} color={COLORS.ink} />
              <span>
                Comenta <span style={{ color: COLORS.green }}>SÍ</span> o <span style={{ color: COLORS.red }}>NO</span>
              </span>
            </div>
          </Pop>
        </div>
        <div style={{ position: "absolute", top: 1000, left: 90, right: 90, display: "flex", flexDirection: "column", gap: 28, alignItems: "center" }}>
          <Pop at={B.save}>{row(<BookmarkIcon size={46} stroke={8} color={COLORS.led} />, TEXT.ctaSave)}</Pop>
          <Pop at={B.share}>{row(<SendIcon size={46} stroke={8} color={COLORS.cold} />, TEXT.ctaShare)}</Pop>
        </div>
        <div
          style={{
            position: "absolute",
            top: 1330,
            left: 0,
            right: 0,
            textAlign: "center",
            fontFamily: FONT_DISPLAY,
            fontWeight: 700,
            fontSize: 46,
            letterSpacing: 20,
            color: "rgba(244,246,248,0.7)",
            opacity: ramp(f, B.brand, B.brand + 12),
          }}
        >
          {TEXT.brand}
        </div>
      </AbsoluteFill>
      <Grade />
    </AbsoluteFill>
  );
};
