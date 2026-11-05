import React from "react";
import { useCurrentFrame } from "remotion";
import { C } from "../theme";
import { Car, CarProps } from "./Car";

/**
 * Ubica un auto en pantalla. left/top/width en px; zoom alrededor del punto (fx, fy) en coordenadas del auto.
 * mapPt() convierte un punto del auto (viewBox 1000×400) a coordenadas de pantalla con la misma cámara.
 */
export type Cam = { left: number; top: number; width: number; zoom?: number; fx?: number; fy?: number; dx?: number; dy?: number; rot?: number };

export const mapPt = (cam: Cam, x: number, y: number) => {
  const k = cam.width / 1000;
  const z = cam.zoom ?? 1;
  const fx = cam.left + (cam.fx ?? 500) * k;
  const fy = cam.top + (cam.fy ?? 200) * k;
  const px = cam.left + x * k;
  const py = cam.top + y * k;
  return { x: fx + (px - fx) * z + (cam.dx ?? 0), y: fy + (py - fy) * z + (cam.dy ?? 0) };
};

export const Stage: React.FC<{ cam: Cam; car: Omit<CarProps, "width">; children?: React.ReactNode; style?: React.CSSProperties }> = ({ cam, car, children, style }) => {
  const k = cam.width / 1000;
  const z = cam.zoom ?? 1;
  const fx = (cam.fx ?? 500) * k;
  const fy = (cam.fy ?? 200) * k;
  return (
    <div
      style={{
        position: "absolute",
        left: cam.left + (cam.dx ?? 0),
        top: cam.top + (cam.dy ?? 0),
        width: cam.width,
        height: cam.width * 0.4,
        transformOrigin: `${fx}px ${fy}px`,
        scale: z,
        rotate: `${cam.rot ?? 0}deg`,
        ...style,
      }}
    >
      <Car width={cam.width} {...car} />
      {children && (
        <svg viewBox="0 0 1000 400" width={cam.width} height={cam.width * 0.4} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
          {children}
        </svg>
      )}
    </div>
  );
};

/** Mapa de calor por zonas sobre el auto (mismo viewBox). */
export const ZoneOverlay: React.FC<{ green?: number; yellow?: number; red?: number }> = ({ green = 0, yellow = 0, red = 0 }) => {
  const t = useCurrentFrame();
  const pulse = 0.75 + 0.25 * Math.sin(t * 0.35);
  return (
    <g style={{ mixBlendMode: "normal" }}>
      {green > 0 && (
        <g opacity={green * pulse} fill={C.green} fillOpacity={0.45} stroke={C.green} strokeWidth={4} style={{ filter: `drop-shadow(0 0 12px ${C.green})` }}>
          <path d="M296 206 L507 204 L507 300 L318 300 Z" />
          <path d="M507 204 L728 200 L742 292 L507 300 Z" />
          <path d="M904 254 L980 262 L984 300 L904 304 Z" />
          <path d="M36 258 L120 256 L120 302 L44 302 Z" />
        </g>
      )}
      {yellow > 0 && (
        <g opacity={yellow * pulse} fill={C.yellow} fillOpacity={0.4} stroke={C.yellow} strokeWidth={4} style={{ filter: `drop-shadow(0 0 12px ${C.yellow})` }}>
          <path d="M760 206 L910 214 Q962 218 974 244 L982 282 L904 254 L870 300 L790 240 Z" />
        </g>
      )}
      {red > 0 && (
        <g opacity={red * pulse} fill="none" stroke={C.red} strokeWidth={14} strokeLinecap="round" style={{ filter: `drop-shadow(0 0 14px ${C.red})` }}>
          <path d="M632 120 L752 198" />
          <path d="M507 110 L507 302" />
          <path d="M328 120 L214 196" />
          <path d="M322 124 Q338 110 372 108 L586 106 Q618 108 640 122" />
          <path d="M140 300 L880 300" />
        </g>
      )}
    </g>
  );
};
