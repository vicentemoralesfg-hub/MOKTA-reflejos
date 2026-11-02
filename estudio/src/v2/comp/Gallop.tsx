import React from "react";
import { Img, staticFile } from "remotion";

/** Galope real de Muybridge (1878): 11 fotografías en bucle, 15 fps (2 fotogramas de video por foto). */
export const MUY = Array.from({ length: 11 }, (_, i) => `fotos/muybridge/f${String(i + 1).padStart(2, "0")}.jpg`);

export const Gallop: React.FC<{ f: number; w: number; phase?: number; fps?: number; style?: React.CSSProperties; sepia?: number }> = ({
  f,
  w,
  phase = 0,
  fps = 15,
  style,
  sepia = 1,
}) => {
  const idx = (Math.floor(((f + phase) * fps) / 30) % 11 + 11) % 11;
  const h = (w * 545) / 900;
  return (
    <div style={{ width: w, height: h, overflow: "hidden", position: "relative", ...style }}>
      <Img
        src={staticFile(MUY[idx])}
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          filter: `sepia(${0.35 * sepia}) contrast(1.15) brightness(0.95)`,
        }}
      />
    </div>
  );
};

/** Manada: n caballos en grilla, cada uno en una fase distinta del galope. */
export const Herd: React.FC<{ f: number; n: number; cols: number; w: number; gap?: number; reveal?: number }> = ({ f, n, cols, w, gap = 6, reveal = 1 }) => {
  const cell = (w - gap * (cols - 1)) / cols;
  const shown = Math.round(n * reveal);
  return (
    <div style={{ display: "grid", gridTemplateColumns: `repeat(${cols}, ${cell}px)`, gap }}>
      {Array.from({ length: n }).map((_, i) => (
        <div key={i} style={{ opacity: i < shown ? 1 : 0.08, borderRadius: 4, overflow: "hidden" }}>
          <Gallop f={f} w={cell} phase={(i * 7) % 22} />
        </div>
      ))}
    </div>
  );
};
