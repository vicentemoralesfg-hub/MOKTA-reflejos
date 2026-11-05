import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { Bokeh, Camera, Flash, SceneIn, Stage } from "../components/Fx";
import { Check, Cross, Keys, Lock, Phone, ShareIcon, ValeVista } from "../components/Props";
import { Title } from "../components/Text";
import { pop, ramp, sceneClock, shake } from "../lib/anim";
import { sceneFrames } from "../timing";

const abs = (x: number, y: number, extra: React.CSSProperties = {}): React.CSSProperties => ({ position: "absolute", left: x, top: y, ...extra });

/* =================================================================== FOTO */
export const Foto: React.FC = () => {
  const f = useCurrentFrame();
  const t = sceneClock("Foto");
  const dur = sceneFrames("Foto");
  const x = t(51.42);
  return (
    <SceneIn dir="zoom">
      <Stage from="#14000a" to="#6b0018" glowA="#ff1744" glowB="#ff9f0a">
        <Camera dur={dur} zoom={[1.0, 1.07]} shakeXY={shake(f, x, 20, 12)}>
          {/* foto en el chat */}
          <div style={abs(60, 200, { rotate: "-6deg", scale: String(pop(f, t(49.8), 11, 200)) })}>
            <Phone width={430}>
              <div style={{ position: "absolute", inset: 0, padding: "120px 20px", fontFamily: "Inter", color: "#fff" }}>
                <div style={{ background: "#262b45", borderRadius: 24, padding: 14, width: 360 }}>
                  <div style={{ width: 332, height: 162, overflow: "hidden", borderRadius: 12 }}>
                    <ValeVista width={332} />
                  </div>
                  <div style={{ fontSize: 30, fontWeight: 600, marginTop: 14, lineHeight: 1.25 }}>Ahí te mando la foto del vale vista, ya está pagado</div>
                </div>
              </div>
            </Phone>
          </div>
          {/* papel con timbre */}
          <div style={abs(470, 640, { rotate: "7deg", scale: String(pop(f, t(50.6), 11, 200)) })}>
            <ValeVista width={560} />
          </div>
          {f >= x && (
            <>
              <div style={abs(300, 440, { scale: String(pop(f, x, 9, 240)) })}>
                <Cross size={190} draw={ramp(f, x, x + 8)} />
              </div>
              <div style={abs(820, 700, { scale: String(pop(f, x + 4, 9, 240)) })}>
                <Cross size={190} draw={ramp(f, x + 4, x + 12)} />
              </div>
            </>
          )}
          <AbsoluteFill style={{ top: 1060, alignItems: "center" }}>
            <Title at={t(51.76)} size={150} color="#fff" bg="#FF1744" rotate={-4}>
              No es pago
            </Title>
          </AbsoluteFill>
        </Camera>
        <Flash at={x} color="#ff1744" dur={8} peak={0.5} />
      </Stage>
    </SceneIn>
  );
};

/* ================================================================== REGLA */
export const Regla: React.FC = () => {
  const f = useCurrentFrame();
  const t = sceneClock("Regla");
  const dur = sceneFrames("Regla");
  const lockAt = t(54.74);
  const lp = pop(f, lockAt - 6, 12, 200);
  const closed = ramp(f, lockAt, lockAt + 4);
  return (
    <SceneIn dir="zoom">
      <Stage from="#000000" to="#16163a" glowA="#ffd60a" glowB="#ff1744">
        <AbsoluteFill style={{ background: "radial-gradient(ellipse 45% 30% at 50% 52%, #ffd60a33, transparent 70%)" }} />
        <Camera dur={dur} zoom={[1.0, 1.12]} shakeXY={shake(f, lockAt + 3, 24, 12)}>
          <AbsoluteFill style={{ alignItems: "center", top: 170 }}>
            <Title at={t(52.8)} size={124} rotate={-2}>
              Sin verificar
            </Title>
            <Title at={t(53.5)} size={78} color="#00e5ff" rotate={-2} style={{ marginTop: 14 }}>
              por canales oficiales
            </Title>
          </AbsoluteFill>
          <div style={abs(360, 520, { rotate: `${Math.sin(f / 6) * 12 * (1 - closed)}deg`, transformOrigin: "50% 0%" })}>
            <Keys size={360} />
          </div>
          {f >= lockAt - 6 && (
            <div style={abs(390, 640, { scale: String(lp), translate: `0px ${(1 - lp) * -200}px` })}>
              <Lock size={300} closed={closed} />
            </div>
          )}
          <AbsoluteFill style={{ top: 1110, alignItems: "center" }}>
            <Title at={lockAt} size={150} color="#FF1744" rotate={-3}>
              No hay llaves
            </Title>
          </AbsoluteFill>
        </Camera>
        <Flash at={lockAt + 3} color="#ffffff" dur={7} peak={0.6} />
      </Stage>
    </SceneIn>
  );
};

/* ================================================================= CIERRE */
export const Cierre: React.FC = () => {
  const f = useCurrentFrame();
  const t = sceneClock("Cierre");
  const dur = sceneFrames("Cierre");
  const items: [string, number][] = [
    ["Llama tú al banco emisor", t(56.5)],
    ["Confirma monto y beneficiario", t(56.9)],
    ["Cobra antes de entregar", t(57.3)],
  ];
  return (
    <SceneIn dir="up">
      <Stage from="#ff2e88" to="#5b1bd6" glowA="#ffd60a" glowB="#00e5ff" rays>
        <Bokeh color="#ffffff" seed="cta" count={16} />
        <Camera dur={dur} zoom={[1.0, 1.05]}>
          <AbsoluteFill style={{ alignItems: "center", top: 150 }}>
            <div style={{ scale: String(pop(f, t(55.65), 9, 200)), translate: `0px ${Math.sin(f / 5) * 8}px`, filter: "drop-shadow(0 12px 0 rgba(0,0,0,0.3))" }}>
              <ShareIcon size={170} />
            </div>
            <Title at={t(55.7)} size={150} color="#FFD60A" rotate={-3} style={{ marginTop: 10 }}>
              Compártelo
            </Title>
            <Title at={t(56.3)} size={64} rotate={-2} style={{ marginTop: 16 }}>
              con quien esté vendiendo su auto
            </Title>
          </AbsoluteFill>
          <div
            style={abs(80, 760, {
              width: 920,
              padding: "30px 40px",
              borderRadius: 40,
              background: "rgba(10,0,30,0.7)",
              border: "4px solid #ffffff44",
              fontFamily: "Barlow Condensed",
              fontWeight: 800,
              color: "#fff",
            })}
          >
            {items.map(([label, at], i) => {
              const p = pop(f, at, 12, 220);
              return (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 24, margin: "14px 0", opacity: Math.min(1, p * 2), translate: `${(1 - p) * 120}px 0px` }}>
                  <Check size={74} draw={ramp(f, at + 2, at + 10)} />
                  <div style={{ fontSize: 54, lineHeight: 1, textTransform: "uppercase" }}>{label}</div>
                </div>
              );
            })}
          </div>
          <AbsoluteFill style={{ top: 1260, alignItems: "center" }}>
            <div
              style={{
                fontFamily: "Barlow Condensed",
                fontWeight: 800,
                fontSize: 120,
                letterSpacing: 18,
                color: "#fff",
                opacity: ramp(f, t(57.4), t(57.9)),
                textShadow: "0 0 40px #ffffff88",
              }}
            >
              MOKTA
            </div>
          </AbsoluteFill>
        </Camera>
      </Stage>
    </SceneIn>
  );
};
