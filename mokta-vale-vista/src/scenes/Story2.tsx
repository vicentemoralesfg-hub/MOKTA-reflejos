import React from "react";
import { AbsoluteFill, interpolate, random, useCurrentFrame } from "remotion";
import { Camera, Flash, Glitch, SceneIn, Shine, Stage } from "../components/Fx";
import { Person } from "../components/Person";
import { Car, Check, Keys, ValeVista } from "../components/Props";
import { Tag, Title } from "../components/Text";
import { EASE_IN_OUT, lerp, pop, ramp, sceneClock, shake, slam } from "../lib/anim";
import { sceneFrames } from "../timing";

const clp = (n: number) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ".");
const abs = (x: number, y: number, extra: React.CSSProperties = {}): React.CSSProperties => ({ position: "absolute", left: x, top: y, ...extra });

/* ============================================================== DOCUMENTO */
export const Documento: React.FC = () => {
  const f = useCurrentFrame();
  const t = sceneClock("Documento");
  // Recorrido de cámara sobre el documento: logo → timbre → monto → plano completo
  const DOC = { x: 90, y: 700 };
  const keys = [0, t(14.95), t(15.75), t(16.45), t(17.4), sceneFrames("Documento")];
  const px = [540, DOC.x + 170, DOC.x + 755, DOC.x + 716, 540, 540];
  const py = [920, DOC.y + 48, DOC.y + 335, DOC.y + 192, 920, 920];
  const sc = [1.0, 1.9, 1.9, 1.9, 1.0, 1.06];
  const opt = { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: EASE_IN_OUT } as const;
  const kx = interpolate(f, keys, px, opt);
  const ky = interpolate(f, keys, py, opt);
  const ks = interpolate(f, keys, sc, opt);
  const hl = f >= t(16.45) && f < t(17.4) ? "monto" : f >= t(15.75) && f < t(16.45) ? "timbre" : f >= t(14.95) && f < t(15.75) ? "logo" : null;
  const chips: [string, number][] = [
    ["Logo", t(15.0)],
    ["Timbre", t(15.84)],
    ["Monto", t(16.52)],
  ];
  return (
    <SceneIn dir="zoom">
      <Stage from="#050a1f" to="#0f2a66" glowA="#00e5ff" glowB="#7b2ff7">
        <AbsoluteFill style={{ background: "radial-gradient(ellipse 60% 40% at 50% 48%, #ffffff22, transparent 70%)" }} />
        <AbsoluteFill style={{ transformOrigin: "0 0", translate: `${540 - ks * kx}px ${880 - ks * ky}px`, scale: String(ks) }}>
          <div style={abs(DOC.x, DOC.y)}>
            <ValeVista width={900} highlight={hl}>
              <Shine at={t(17.5)} dur={20} />
            </ValeVista>
          </div>
        </AbsoluteFill>
        {/* chips de verificación visual */}
        <div style={abs(0, 200, { width: 1080, display: "flex", justifyContent: "center", gap: 18 })}>
          {chips.map(([label, at]) => (
            <Tag key={label} at={at} color="#0d1b3d" rotate={0} size={50} icon={<Check size={50} draw={ramp(f, at + 2, at + 10)} />} style={{ border: "4px solid #2EE59D" }}>
              {label}
            </Tag>
          ))}
        </div>
        <AbsoluteFill style={{ top: 1180, alignItems: "center" }}>
          <Title at={t(17.5)} size={112} color="#2EE59D">
            Se ve perfecto
          </Title>
        </AbsoluteFill>
      </Stage>
    </SceneIn>
  );
};

/* ================================================================ ENTREGA */
export const Entrega: React.FC = () => {
  const f = useCurrentFrame();
  const t = sceneClock("Entrega");
  const dur = sceneFrames("Entrega");
  const sign = ramp(f, t(19.1), t(19.75), (x) => x);
  const kA = t(19.85);
  const kB = t(20.25);
  const kp = ramp(f, kA, kB, EASE_IN_OUT);
  const keyX = lerp(f, kA, kB, 250, 700, EASE_IN_OUT);
  const keyY = 760 - Math.sin(kp * Math.PI) * 300;
  const carX = lerp(f, t(19.85), dur + 2, -650, 1250, (x) => x);
  return (
    <SceneIn dir="left">
      <Stage from="#ff7b00" to="#c2006b" glowA="#ffd60a" glowB="#ff2e88" angle={150} rays>
        <Camera dur={dur} zoom={[1.04, 1.12]}>
          {/* auto alejándose al fondo */}
          {f >= t(19.85) && (
            <div style={abs(carX, 250, { filter: "drop-shadow(-40px 0 20px rgba(255,255,255,0.3))" })}>
              <Car width={620} wheelSpin={f * 40} />
            </div>
          )}
          <div style={abs(-30, 560)}>
            <Person who="pablo" mood="happy" size={480} look={1} />
          </div>
          <div style={abs(620, 560)}>
            <Person who="comprador" mood={f > kB ? "smirk" : "neutral"} size={480} look={-1} />
          </div>
          {/* contrato */}
          <div
            style={abs(250, 960, {
              width: 580,
              height: 330,
              background: "#fffdf5",
              borderRadius: 14,
              rotate: "-3deg",
              boxShadow: "0 30px 60px rgba(0,0,0,0.45)",
              padding: 28,
              fontFamily: "Barlow Condensed",
              fontWeight: 800,
              fontSize: 40,
              color: "#1b1b2f",
            })}
          >
            CONTRATO DE COMPRAVENTA
            {[0, 1, 2].map((i) => (
              <div key={i} style={{ height: 12, width: `${90 - i * 18}%`, background: "#d8d4c6", borderRadius: 6, marginTop: 18 }} />
            ))}
            <svg width={360} height={110} viewBox="0 0 360 110" style={{ position: "absolute", left: 40, bottom: 20 }}>
              <path
                d="M10,70 C30,20 50,95 80,45 S120,90 150,40 S200,80 230,50 S300,70 350,30"
                fill="none"
                stroke="#1438A6"
                strokeWidth={6}
                strokeLinecap="round"
                strokeDasharray={520}
                strokeDashoffset={520 * (1 - sign)}
              />
            </svg>
          </div>
          {/* llaves volando */}
          {f >= kA && f < kB + 12 && (
            <div style={abs(keyX - 90, keyY - 90, { rotate: `${kp * 540}deg`, scale: f > kB ? String(1 - ramp(f, kB, kB + 10)) : "1" })}>
              <Keys size={180} />
            </div>
          )}
        </Camera>
        <Flash at={kB} color="#ffd60a" dur={8} peak={0.5} />
      </Stage>
    </SceneIn>
  );
};

/* ================================================================== LUNES */
const Falling: React.FC<{ from: number }> = ({ from }) => {
  const f = useCurrentFrame();
  return (
    <>
      {new Array(16).fill(0).map((_, i) => {
        const x = random(`bx${i}`) * 1000;
        const sp = 9 + random(`bs${i}`) * 9;
        const y = -200 + (f - from) * sp + random(`by${i}`) * -500;
        const k = ramp(f, from + 6, from + 28);
        return (
          <div
            key={i}
            style={abs(x, y, {
              width: 150,
              height: 74,
              borderRadius: 8,
              background: "linear-gradient(135deg,#7ee8a5,#1f9e5b)",
              border: "3px solid #0d5c33",
              rotate: `${(f - from) * (random(`br${i}`) * 8 - 4)}deg`,
              opacity: 0.9 * (1 - k),
              filter: `blur(${k * 8}px)`,
            })}
          />
        );
      })}
    </>
  );
};

export const Lunes: React.FC = () => {
  const f = useCurrentFrame();
  const t = sceneClock("Lunes");
  const B = t(23.78);
  const C = t(25.05);
  const falso = t(23.2);
  const sh = shake(f, falso, 34, 16);
  const loading = ramp(f, t(21.2), t(22.2), (x) => x);
  const bad = f >= t(22.26);

  if (f < B) {
    return (
      <SceneIn dir="zoom">
        <Glitch a={falso} b={falso + 5}>
          <Stage from="#00141f" to="#005f73" glowA="#00e5ff" glowB="#ff1744">
            <Camera dur={B} zoom={[1.0, 1.08]} shakeXY={sh}>
              <div style={abs(640, 180)}>
                <Person who="cajera" mood={bad ? "serious" : "neutral"} size={360} look={-1} />
              </div>
              {/* monitor */}
              <div
                style={abs(70, 290, {
                  width: 560,
                  height: 380,
                  borderRadius: 22,
                  background: bad ? "linear-gradient(160deg,#3a0010,#12000a)" : "linear-gradient(160deg,#0b2a3c,#06121c)",
                  border: `6px solid ${bad ? "#ff1744" : "#2a4a5c"}`,
                  boxShadow: bad ? "0 0 60px #ff174488" : "0 20px 40px rgba(0,0,0,0.5)",
                  fontFamily: "Inter",
                  color: "#fff",
                  padding: 34,
                })}
              >
                <div style={{ fontSize: 24, opacity: 0.7 }}>Consulta de documento</div>
                <div style={{ fontSize: 30, fontWeight: 700, marginTop: 8 }}>Vale vista N° 0048 2271 9934</div>
                {!bad ? (
                  <>
                    <div style={{ marginTop: 50, height: 22, borderRadius: 11, background: "#16384a", overflow: "hidden" }}>
                      <div style={{ width: `${loading * 100}%`, height: "100%", background: "#00e5ff" }} />
                    </div>
                    <div style={{ marginTop: 18, fontSize: 26, opacity: 0.8 }}>Verificando…</div>
                  </>
                ) : (
                  <div style={{ marginTop: 40, display: "flex", alignItems: "center", gap: 20, scale: String(pop(f, t(22.26), 10, 220)) }}>
                    <div style={{ width: 90, height: 90, borderRadius: 45, background: "#ff1744", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Barlow Condensed", fontWeight: 800, fontSize: 80 }}>!</div>
                    <div style={{ fontFamily: "Barlow Condensed", fontWeight: 800, fontSize: 52, lineHeight: 1, color: "#ff5a7a" }}>
                      DOCUMENTO
                      <br />
                      NO REGISTRADO
                    </div>
                  </div>
                )}
              </div>
              <div style={abs(-40, 690, { width: 1160, height: 10, background: "#00e5ff", boxShadow: "0 0 40px 10px #00e5ff99" })} />
              <div style={abs(-40, 700, { width: 1160, height: 900, background: "linear-gradient(180deg,#082234,#020a12)" })} />
              <div style={abs(110, 760, { rotate: "-4deg" })}>
                <ValeVista width={860}>
                  {f >= falso && (
                    <div
                      style={{
                        position: "absolute",
                        left: 200,
                        top: 90,
                        padding: "0 50px",
                        border: "14px solid #FF1744",
                        borderRadius: 20,
                        color: "#FF1744",
                        fontFamily: "Barlow Condensed",
                        fontWeight: 800,
                        fontSize: 230,
                        lineHeight: 1.05,
                        rotate: "-14deg",
                        scale: String(slam(f, falso, 2.8)),
                        opacity: ramp(f, falso, falso + 3),
                        mixBlendMode: "multiply",
                      }}
                    >
                      FALSO
                    </div>
                  )}
                </ValeVista>
              </div>
            </Camera>
            {f >= falso && <AbsoluteFill style={{ background: "#ff003c", opacity: 0.22 * (1 - ramp(f, falso, falso + 24)) }} />}
            <Flash at={falso} color="#ff1744" dur={10} />
          </Stage>
        </Glitch>
        <div style={abs(80, 110)}>
          <Tag at={t(20.82)} color="#00e5ff" textColor="#00141f" rotate={-3} size={72}>
            Lunes · 9:00
          </Tag>
        </div>
      </SceneIn>
    );
  }

  if (f < C) {
    const lf = f - B;
    return (
      <AbsoluteFill style={{ scale: String(1.15 - 0.15 * ramp(lf, 0, 8)) }}>
        <Stage from="#0b1026" to="#2b3a67" glowA="#ff2e88" glowB="#00e5ff" angle={180}>
          {/* estacionamiento vacío */}
          <div style={abs(-60, 640, { width: 1200, height: 800, background: "linear-gradient(180deg,#2a2d3a,#15161f)", transform: "perspective(900px) rotateX(48deg)", transformOrigin: "50% 0%" })}>
            {[0, 1, 2, 3].map((i) => (
              <div key={i} style={{ position: "absolute", left: 120 + i * 300, top: 0, width: 14, height: 800, background: "#ffd60a" }} />
            ))}
            <div style={{ position: "absolute", left: 470, top: 300, width: 200, height: 90, borderRadius: "50%", background: "#000", opacity: 0.55, filter: "blur(6px)" }} />
          </div>
          <div style={abs(230, 380, { opacity: 0.5 + 0.5 * Math.abs(Math.sin(lf / 5)) })}>
            <Car ghost width={620} />
          </div>
          <div style={abs(300, 760, { scale: String(0.6 + 0.4 * pop(lf, 2, 9, 200)) })}>
            <Person who="pablo" mood="shock" size={480} />
          </div>
        </Stage>
      </AbsoluteFill>
    );
  }

  const lf = f - C;
  const amount = Math.round(interpolate(lf, [2, 26], [8900000, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: (x) => x * x }));
  const jitter = lf < 26 ? (random(`j${f}`) - 0.5) * 16 : 0;
  return (
    <AbsoluteFill style={{ scale: String(1.15 - 0.15 * ramp(lf, 0, 8)) }}>
      <Stage from="#1a0005" to="#5c0011" glowA="#ff1744" glowB="#ff9f0a">
        <Falling from={0} />
        <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", top: -160 }}>
          <div style={{ fontFamily: "Barlow Condensed", fontWeight: 700, fontSize: 64, color: "#ffb3c1", letterSpacing: 6 }}>DINERO RECIBIDO</div>
          <div
            style={{
              fontFamily: "Barlow Condensed",
              fontWeight: 800,
              fontSize: amount === 0 ? 360 : 200,
              color: amount === 0 ? "#FF1744" : "#fff",
              lineHeight: 1,
              translate: `${jitter}px 0px`,
              textShadow: amount === 0 ? "0 0 60px #ff1744" : "0 0 30px #ffffff55",
              scale: amount === 0 ? String(0.6 + 0.4 * pop(lf, 26, 9, 220)) : "1",
            }}
          >
            ${clp(amount)}
          </div>
        </AbsoluteFill>
      </Stage>
    </AbsoluteFill>
  );
};
