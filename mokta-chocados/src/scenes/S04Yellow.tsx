import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { EASE_IN, EASE_IN_OUT, EASE_OUT, pop, ramp, rnd, shake, flashAt } from "../anim";
import { Background } from "../components/Background";
import { Captions } from "../components/Captions";
import { Cam, Stage, mapPt } from "../components/Stage";
import { WHITE } from "../components/presets";
import { Callout, Counter, Ficha, Icon, Slam, ZoneBadge } from "../components/ui";
import { C, FONT_DISPLAY, FONT_UI } from "../theme";
import { at } from "../timeline";

const ID = "s04";

export const S04Yellow: React.FC = () => {
  const f = useCurrentFrame();
  const tChoque = at(ID, "choque");
  const tGolpe = at(ID, "golpe");
  const tPara = at(ID, "parachoques");
  const tRad = at(ID, "radiador");
  const tSop = at(ID, "soportes");
  const tNeg = at(ID, "negocio");
  const tLarg = at(ID, "larguero");
  const tMotor = at(ID, "motor");
  const tBanc = at(ID, "bancada");
  const tPres = at(ID, "presupuesto");
  const tExpl = at(ID, "explota");

  // el auto avanza y golpea el muro
  const hit = tChoque + 4;
  const drive = interpolate(f, [0, hit], [-420, 0], { extrapolateRight: "clamp", easing: EASE_IN });
  const crush1 = ramp(f, hit, hit + 5, EASE_OUT) * 0.32;
  const crush2 = ramp(f, tLarg, tLarg + 14, EASE_IN_OUT) * 0.38;
  const crush = crush1 + crush2;
  const xray = ramp(f, tGolpe - 4, tGolpe + 6);
  const zoom = interpolate(f, [tGolpe, tGolpe + 16, tPres - 6, tPres + 6], [1, 1.75, 1.75, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: EASE_IN_OUT });
  const cam: Cam = { left: -40 + drive, top: 560, width: 1000, zoom, fx: 880, fy: 260 };
  const sh = shake(f, hit, 30, 16);
  const sh2 = shake(f, tLarg + 4, 18, 14);
  const sh3 = shake(f, tExpl + 2, 30, 16);

  const ok = { color: C.green, glow: 1 };
  const mid = { color: C.yellow, glow: 1 };
  const bad = { color: C.red, glow: 1.2 };
  const dim = { opacity: 0.35 };
  const parts = {
    bumperBeam: f >= tPara ? ok : dim,
    crashBox: f >= tPara ? ok : dim,
    radiator: f >= tRad ? mid : dim,
    support: f >= tSop ? mid : dim,
    rail: f >= tLarg ? bad : dim,
    engine: f >= tMotor ? { color: "#C9F1FF", glow: 0.4 } : dim,
    floor: dim,
    pillarA: dim,
    roofRail: dim,
    pillarB: dim,
  };
  const P = (x: number, y: number) => mapPt(cam, x, y);
  // onda de choque recorriendo la estructura
  const wave = interpolate(f, [tGolpe, tSop + 10], [985, 900], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const wave2 = interpolate(f, [tLarg, tLarg + 22], [930, 720], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const wallX = mapPt({ ...cam, left: -40 }, 988 - 100 * crush, 0).x;

  return (
    <AbsoluteFill>
      <Background zone="yellow" cy={40} flash={flashAt(f, hit, (hit + 5) - (hit), 0.85)} speed={f < hit ? 3 : 0.6} />
      <ZoneBadge at={0} color={C.yellow} title="ZONA AMARILLA" sub="Precaución" icon={<Icon name="warn" size={44} />} />
      <AbsoluteFill style={{ translate: `${sh.x + sh2.x + sh3.x}px ${sh.y + sh2.y + sh3.y}px` }}>
        {/* muro */}
        <div style={{ position: "absolute", left: wallX, top: 480, width: 300, height: 560, background: "repeating-linear-gradient(135deg,#FFC63D 0 40px,#14161F 40px 80px)", borderLeft: "10px solid #FFE08A", opacity: 1 - xray * 0.6, boxShadow: "0 0 40px rgba(0,0,0,0.6)" }} />
        <Stage
          cam={cam}
          car={{
            id: "y-car",
            paint: WHITE,
            t: f,
            frontCrush: crush,
            bumperCrack: ramp(f, hit, hit + 3),
            brokenHeadlight: ramp(f, hit, hit + 3),
            wheelRot: drive * 0.9,
            xray,
            parts,
          }}
        >
          {xray > 0 && f < tLarg + 30 && (
            <g opacity={xray}>
              <circle cx={wave} cy={268} r={26 + ((f * 3) % 30)} fill="none" stroke={f >= tLarg ? C.red : C.yellow} strokeWidth={5} opacity={0.8} />
              {f >= tLarg && <circle cx={wave2} cy={272} r={20 + ((f * 3) % 26)} fill="none" stroke={C.red} strokeWidth={6} />}
            </g>
          )}
          {/* medición en bancada */}
          {f >= tBanc && (
            <g opacity={ramp(f, tBanc, tBanc + 6) * (1 - ramp(f, tPres - 6, tPres))}>
              {[
                [760, 300, 900, 300],
                [760, 300, 940, 262],
                [900, 300, 940, 262],
              ].map(([x1, y1, x2, y2], i) => {
                const p = ramp(f, tBanc + i * 4, tBanc + i * 4 + 8);
                return <line key={i} x1={x1} y1={y1} x2={x1 + (x2 - x1) * p} y2={y1 + (y2 - y1) * p} stroke="#FF4DFF" strokeWidth={3} strokeDasharray="8 6" />;
              })}
              {[[760, 300], [900, 300], [940, 262]].map(([x, y], i) => (
                <circle key={i} cx={x} cy={y} r={7} fill="#FF4DFF" />
              ))}
            </g>
          )}
        </Stage>
        {f >= tBanc && f < tPres && (
          <>
            {[
              { p: P(830, 300), t: "+18 mm" },
              { p: P(915, 270), t: "−12 mm" },
            ].map((m, i) => (
              <div key={i} style={{ position: "absolute", left: m.p.x, top: m.p.y - 70 - i * 10, translate: "-50% -50%", padding: "4px 14px", borderRadius: 10, background: "#FF4DFF", color: C.ink, fontFamily: FONT_DISPLAY, fontWeight: 800, fontSize: 40, scale: pop(f, tBanc + 6 + i * 5, 8) }}>
                {m.t}
              </div>
            ))}
          </>
        )}
        <Callout at={tPara} x={P(978, 268).x} y={P(978, 268).y} lx={760} ly={470} text="PARACHOQUES" sub="absorbe ✓" color={C.green} out={tLarg - 4} />
        <Callout at={tRad} x={P(924, 255).x} y={P(924, 255).y} lx={420} ly={470} text="RADIADOR" sub="se cambia" color={C.yellow} out={tLarg - 4} />
        <Callout at={tSop} x={P(906, 296).x} y={P(906, 296).y} lx={520} ly={1080} text="SOPORTES" sub="apernados/soldables" color={C.yellow} out={tLarg - 4} />
        <Callout at={tLarg} x={P(850, 272).x} y={P(850, 272).y} lx={330} ly={1080} text="LARGUERO" sub="la viga del motor" color={C.red} out={tBanc - 2} />
        {f >= tNeg && f < tLarg - 2 && (
          <div style={{ position: "absolute", left: 0, right: 0, top: 1180, display: "flex", justifyContent: "center" }}>
            <div style={{ padding: "10px 30px", borderRadius: 999, background: C.green, color: C.ink, fontFamily: FONT_DISPLAY, fontWeight: 800, fontSize: 64, display: "flex", alignItems: "center", gap: 12, scale: pop(f, tNeg, 8), boxShadow: `0 0 30px ${C.green}` }}>
              <Icon name="check" size={56} /> AÚN HAY NEGOCIO
            </div>
          </div>
        )}
        {f >= tLarg + 2 && f < tBanc && <Slam at={tLarg + 2} y={1210} size={96} color={C.red}>⚠ ESTRUCTURA</Slam>}
      </AbsoluteFill>

      {f >= tBanc - 2 && (
        <Ficha
          at={tBanc - 2}
          top={1040}
          accent={C.yellow}
          title="SI LLEGÓ AL LARGUERO"
          rows={[
            { label: "REPUESTOS", level: 3, note: "MEDIO" },
            { label: "MANO DE OBRA", level: 5, note: "BANCADA" },
            { label: "SEGURIDAD", level: 4, note: "AFECTADA" },
            { label: "REVENTA", level: 4, note: "CAE" },
          ]}
        />
      )}
      {/* presupuesto que explota */}
      {f >= tPres && (
        <div style={{ position: "absolute", left: 0, right: 0, top: 380, display: "flex", flexDirection: "column", alignItems: "center", scale: interpolate(pop(f, tPres, 10), [0, 1], [0.3, 1]) }}>
          <div style={{ fontFamily: FONT_UI, fontWeight: 800, fontSize: 30, letterSpacing: 6, color: "#fff" }}>PRESUPUESTO</div>
          <Counter from={600000} to={3400000} a={tPres + 2} b={tExpl + 6} style={{ fontFamily: FONT_DISPLAY, fontWeight: 800, fontSize: 150, color: f >= tExpl ? C.red : C.yellow, textShadow: `0 0 40px ${f >= tExpl ? C.red : C.yellow}, 0 8px 0 #000` }} />
        </div>
      )}
      {f >= tExpl &&
        Array.from({ length: 18 }, (_, i) => {
          const life = f - tExpl;
          const ang = (i / 18) * Math.PI * 2;
          const r = life * (22 + rnd(i) * 14);
          return <div key={i} style={{ position: "absolute", left: 540 + Math.cos(ang) * r, top: 480 + Math.sin(ang) * r, width: 26, height: 26, rotate: `${life * 30}deg`, background: i % 2 ? C.red : C.orange, opacity: interpolate(life, [0, 22], [1, 0], { extrapolateRight: "clamp" }) }} />;
        })}
      <Captions id={ID} accent={C.yellow} keywords={["amarilla", "larguero", "bancada", "medicion", "explota", "negocio"]} y={1430} />
    </AbsoluteFill>
  );
};
