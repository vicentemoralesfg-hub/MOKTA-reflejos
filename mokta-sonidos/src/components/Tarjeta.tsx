import React from "react";
import { Img, interpolate, staticFile } from "remotion";
import { Auto, COLORS, FONT_BLOCK, FONT_DISPLAY } from "../config";

export const CARD_W = 940;
export const CARD_H = 520;

/** Trazo a mano alzada que abraza la tarjeta (superelipse, algo más de una vuelta, con irregularidad). */
const trazoCirculo = (w: number, h: number) => {
  const cx = w / 2;
  const cy = h / 2;
  const n = 3.4; // exponente: >2 hace que la curva siga las esquinas sin cortarlas
  const pts: string[] = [];
  const vueltas = 1.1;
  const pasos = 140;
  const sgnPow = (v: number) => Math.sign(v) * Math.pow(Math.abs(v), 2 / n);
  for (let i = 0; i <= pasos; i++) {
    const p = i / pasos;
    const th = -Math.PI * 0.7 + p * Math.PI * 2 * vueltas;
    const crece = 1 + p * 0.035; // la segunda pasada queda un poco más afuera
    const wob = 1 + Math.sin(th * 3 + 0.8) * 0.012;
    const x = cx + sgnPow(Math.cos(th)) * (w / 2) * crece * wob;
    const y = cy + sgnPow(Math.sin(th)) * (h / 2) * crece * wob;
    pts.push(`${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`);
  }
  return pts.join(" ");
};

export const Tarjeta: React.FC<{
  auto: Auto;
  letra: "A" | "B";
  color: string;
  /** 0→1 dibujo del círculo de respuesta correcta */
  circulo: number;
  /** 0→1 pop del check */
  check: number;
  /** 0→1 apagado de la opción incorrecta */
  apagar: number;
  /** pulso mientras suena el motor (0..1) */
  pulso: number;
  /** fotograma de la escena, para el leve zoom continuo de la foto */
  frame: number;
}> = ({ auto, letra, color, circulo, check, apagar, pulso, frame }) => {
  const pad = 44;
  const cw = CARD_W + pad * 2;
  const ch = CARD_H + pad * 2;
  return (
    <div style={{ position: "relative", width: CARD_W, height: CARD_H }}>
      {/* tarjeta */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: 40,
          overflow: "hidden",
          border: `9px solid ${COLORS.ink}`,
          boxShadow: `18px 18px 0 ${color}, 0 0 ${30 + pulso * 60}px ${color}${pulso > 0.01 ? "CC" : "00"}`,
          filter: `grayscale(${apagar}) brightness(${1 - apagar * 0.25}) contrast(${1 - apagar * 0.2})`,
          opacity: 1 - apagar * 0.35,
          background: COLORS.ink,
        }}
      >
        <Img
          src={staticFile(auto.imagen)}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            objectPosition: auto.encuadre,
            scale: String((auto.zoom ?? 1) * (1.03 + frame * 0.00025 + pulso * 0.03)),
            transformOrigin: auto.encuadre,
          }}
        />
        {/* degradado inferior para la etiqueta */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "linear-gradient(180deg, rgba(0,0,0,0) 60%, rgba(0,0,0,0.45) 100%)",
          }}
        />
        {/* nombre */}
        <div
          style={{
            position: "absolute",
            right: 26,
            bottom: 24,
            padding: "8px 26px 6px",
            background: COLORS.white,
            color: COLORS.ink,
            fontFamily: FONT_BLOCK,
            fontSize: 50,
            letterSpacing: 1,
            transform: "skewX(-10deg)",
            borderRadius: 10,
            border: `5px solid ${COLORS.ink}`,
            boxShadow: `6px 6px 0 ${color}`,
          }}
        >
          <div style={{ transform: "skewX(10deg)" }}>{auto.nombre}</div>
        </div>
      </div>

      {/* círculo de respuesta */}
      {circulo > 0 ? (
        <svg
          width={cw}
          height={ch}
          viewBox={`0 0 ${cw} ${ch}`}
          style={{ position: "absolute", left: -pad, top: -pad, overflow: "visible", rotate: "-1.5deg" }}
        >
          {[
            { c: COLORS.ink, w: 34 },
            { c: COLORS.lime, w: 20 },
          ].map((t) => (
            <path
              key={t.c}
              d={trazoCirculo(cw - 24, ch - 24)}
              transform="translate(12 12)"
              fill="none"
              stroke={t.c}
              strokeWidth={t.w}
              strokeLinecap="round"
              strokeLinejoin="round"
              pathLength={1}
              strokeDasharray="1 1"
              strokeDashoffset={1 - circulo}
            />
          ))}
        </svg>
      ) : null}

      {/* insignia de letra */}
      <div
        style={{
          position: "absolute",
          left: -34,
          top: -40,
          width: 150,
          height: 150,
          borderRadius: 75,
          background: color,
          border: `9px solid ${COLORS.ink}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: FONT_DISPLAY,
          fontSize: 104,
          color: COLORS.white,
          WebkitTextStroke: `6px ${COLORS.ink}`,
          paintOrder: "stroke fill",
          lineHeight: 1,
          paddingTop: 6,
          boxShadow: `0 10px 0 ${COLORS.ink}`,
          rotate: "-8deg",
          filter: `grayscale(${apagar})`,
        }}
      >
        {letra}
      </div>

      {/* check */}
      {check > 0 ? (
        <div
          style={{
            position: "absolute",
            right: -30,
            top: -56,
            width: 190,
            height: 190,
            borderRadius: 95,
            background: COLORS.lime,
            border: `10px solid ${COLORS.ink}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            scale: String(check),
            rotate: `${interpolate(check, [0, 1], [-40, 8])}deg`,
            boxShadow: `0 10px 0 ${COLORS.ink}`,
          }}
        >
          <svg width={110} height={110} viewBox="0 0 100 100">
            <path
              d="M18 54 L42 76 L84 26"
              fill="none"
              stroke={COLORS.white}
              strokeWidth={17}
              strokeLinecap="round"
              strokeLinejoin="round"
              pathLength={1}
              strokeDasharray="1 1"
              strokeDashoffset={1 - Math.min(1, check * 1.2)}
            />
          </svg>
        </div>
      ) : null}

    </div>
  );
};
