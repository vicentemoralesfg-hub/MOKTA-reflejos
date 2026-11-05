import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { EASE_IN_OUT, pop, ramp, rnd } from "../anim";
import { Background } from "../components/Background";
import { Captions } from "../components/Captions";
import { Cam, Stage } from "../components/Stage";
import { WHITE } from "../components/presets";
import { Icon, Slam, ZoneBadge } from "../components/ui";
import { C, FONT_DISPLAY, FONT_UI } from "../theme";
import { at } from "../timeline";

const ID = "s07";

export const S07Flood: React.FC = () => {
  const f = useCurrentFrame();
  const tInund = at(ID, "inundado");
  const tFuera = at(ID, "fuera");
  const tDentro = at(ID, "dentro");
  const tCable = at(ID, "cableado");
  const tMod = at(ID, "modulos");
  const tCorr = at(ID, "corrosion");
  const tMeses = at(ID, "meses");
  const tBarro = at(ID, "barro");
  const tOlor = at(ID, "olor");
  const tOxido = at(ID, "oxido");
  const tHuye = at(ID, "huye");

  // ola que cubre la pantalla al decir "inundado" y luego baja
  const wave = interpolate(f, [tInund - 4, tInund + 10, tFuera - 4, tFuera + 8], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: EASE_IN_OUT });
  const xray = interpolate(f, [tDentro, tDentro + 8, tCorr - 4, tCorr + 4], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const waterIn = interpolate(f, [tDentro, tDentro + 20, tCorr - 4, tCorr + 4], [0, 0.42, 0.42, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const corr = ramp(f, tCorr, tMeses + 14);
  const listOn = f >= tBarro - 4;
  const cam: Cam = { left: 40, top: listOn ? 430 : 600, width: 1000, zoom: 1 };
  if (listOn) cam.top = interpolate(f, [tBarro - 4, tBarro + 6], [600, 400], { extrapolateRight: "clamp", easing: EASE_IN_OUT });
  const zapOn = f >= tCable + 2 && f < tCorr;
  const glitch = zapOn && (f % 7 < 2);
  const amber = { color: C.orange, glow: 1 };
  const parts = {
    harness: f >= tCable ? (glitch ? { color: "#fff", glow: 1.6 } : amber) : { opacity: 0.4 },
    ecu: f >= tMod ? { color: glitch ? "#fff" : C.red, glow: 1.3 } : { opacity: 0.4 },
    bcm: f >= tMod ? { color: glitch ? "#fff" : C.red, glow: 1.3 } : { opacity: 0.4 },
    srs: f >= tMod ? { color: C.red, glow: 1 } : { opacity: 0.4 },
    seats: { opacity: 0.45 },
    floor: { opacity: 0.4 },
  };

  return (
    <AbsoluteFill>
      <Background zone="water" cy={45} />
      <ZoneBadge at={0} color={C.cyan} title="INUNDADO" sub="El más traicionero" icon={<Icon name="drop" size={44} />} />
      <Stage cam={cam} car={{ id: "w-car", paint: WHITE, shine: 1, t: f, xray, waterLine: waterIn, corrosion: corr, parts }}>
        {/* chispas */}
        {zapOn &&
          [[760, 270], [640, 290], [430, 280], [860, 236]].map(([x, y], i) => {
            const on = (f + i * 3) % 9 < 3;
            if (!on) return null;
            return (
              <g key={i} stroke="#FFF7B0" strokeWidth={3} style={{ filter: "drop-shadow(0 0 8px #FFE14A)" }}>
                {[0, 1, 2, 3, 4].map((k) => {
                  const a = rnd(f + k + i * 10) * Math.PI * 2;
                  const r = 14 + rnd(f * 3 + k) * 26;
                  return <line key={k} x1={x} y1={y} x2={x + Math.cos(a) * r} y2={y + Math.sin(a) * r} />;
                })}
              </g>
            );
          })}
      </Stage>
      {/* burbujas dentro */}
      {waterIn > 0.1 &&
        Array.from({ length: 14 }, (_, i) => {
          const y = 860 - ((f * (3 + rnd(i) * 3) + rnd(i + 5) * 200) % 220);
          return <div key={i} style={{ position: "absolute", left: 160 + rnd(i + 2) * 760, top: y + (cam.top - 600), width: 10 + rnd(i) * 14, height: 10 + rnd(i) * 14, borderRadius: 99, border: "2px solid rgba(255,255,255,0.7)", opacity: xray }} />;
        })}

      {f >= tFuera && f < tDentro && (
        <div style={{ position: "absolute", left: 0, right: 0, top: 440, display: "flex", justifyContent: "center" }}>
          <div style={{ padding: "10px 30px", borderRadius: 999, background: "#fff", color: C.ink, fontFamily: FONT_DISPLAY, fontWeight: 800, fontSize: 62, scale: pop(f, tFuera, 8), boxShadow: "0 0 40px #fff" }}>✨ POR FUERA: IMPECABLE</div>
        </div>
      )}
      {f >= tDentro && f < tCorr && (
        <div style={{ position: "absolute", left: 0, right: 0, top: 440, display: "flex", justifyContent: "center" }}>
          <div style={{ padding: "10px 30px", borderRadius: 999, background: C.orange, color: C.ink, fontFamily: FONT_DISPLAY, fontWeight: 800, fontSize: 62, scale: pop(f, tDentro, 8), boxShadow: `0 0 40px ${C.orange}` }}>⚡ POR DENTRO: CORTOCIRCUITO</div>
        </div>
      )}
      {f >= tCorr && f < tBarro - 4 && (
        <div style={{ position: "absolute", left: 0, right: 0, top: 440, display: "flex", justifyContent: "center" }}>
          <div style={{ padding: "10px 30px", borderRadius: 999, background: C.rust, color: "#fff", fontFamily: FONT_DISPLAY, fontWeight: 800, fontSize: 62, scale: pop(f, tCorr, 8), boxShadow: `0 0 40px ${C.rust}` }}>
            CORROSIÓN ·{" "}
            <span style={{ fontVariantNumeric: "tabular-nums" }}>+{Math.round(interpolate(f, [tCorr, tMeses + 10], [0, 6], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }))} MESES</span>
          </div>
        </div>
      )}

      {/* señales */}
      {listOn && (
        <div style={{ position: "absolute", left: 80, right: 80, top: 880, display: "flex", flexDirection: "column", gap: 18 }}>
          {[
            { t: tBarro, txt: "Barro bajo la alfombra" },
            { t: tOlor, txt: "Olor a humedad" },
            { t: tOxido, txt: "Óxido en rieles del asiento" },
          ].map((s, i) => {
            const p = pop(f, s.t, 9);
            return (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 22, padding: "16px 26px", borderRadius: 22, background: "rgba(3,10,30,0.82)", border: `3px solid ${C.cyan}`, opacity: f >= s.t ? 1 : 0.0, translate: `${interpolate(p, [0, 1], [-600, 0])}px 0px` }}>
                <div style={{ width: 64, height: 64, borderRadius: 99, background: C.yellow, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Icon name="warn" size={40} />
                </div>
                <span style={{ fontFamily: FONT_UI, fontWeight: 800, fontSize: 40, color: "#fff" }}>{s.txt}</span>
              </div>
            );
          })}
        </div>
      )}

      {/* ola */}
      {wave > 0 && (
        <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
          <defs>
            <linearGradient id="wv" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#7FD8FF" stopOpacity={0.85} />
              <stop offset="1" stopColor="#0A3E9A" stopOpacity={0.95} />
            </linearGradient>
          </defs>
          <path
            d={`M0 ${1920 - wave * 1400} ${Array.from({ length: 28 }, (_, i) => `L${i * 40} ${1920 - wave * 1400 + Math.sin(i * 0.6 + f * 0.3) * 30}`).join(" ")} L1080 1920 L0 1920 Z`}
            fill="url(#wv)"
          />
        </svg>
      )}
      {f >= tHuye - 2 && (
        <AbsoluteFill style={{ background: `rgba(255,46,77,${0.35 * ramp(f, tHuye - 2, tHuye + 3)})` }}>
          <Slam at={tHuye - 2} y={760} size={260} color="#fff">
            ¡HUYE!
          </Slam>
        </AbsoluteFill>
      )}
      <Captions id={ID} accent={C.cyan} keywords={["inundado", "impecable", "cableado", "modulos", "corrosion", "huye"]} y={1430} />
    </AbsoluteFill>
  );
};
