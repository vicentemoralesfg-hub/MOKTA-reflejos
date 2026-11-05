import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { Camera, Flash, Glitch, Rewind, SceneIn, Shine, Stage, Bokeh } from "../components/Fx";
import { Person } from "../components/Person";
import { Car, Phone, RedFlag, ValeVista } from "../components/Props";
import { Tag, Title } from "../components/Text";
import { lerp, pop, ramp, sceneClock, shake, slam, EASE_IN_OUT } from "../lib/anim";
import { interpolate } from "remotion";
import { sceneFrames } from "../timing";

const abs = (x: number, y: number, extra: React.CSSProperties = {}): React.CSSProperties => ({ position: "absolute", left: x, top: y, ...extra });

/* ================================================================ GANCHO */
export const Gancho: React.FC = () => {
  const f = useCurrentFrame();
  const t = sceneClock("Gancho");
  const dur = sceneFrames("Gancho");
  const hit = t(3.9);
  const sh = shake(f, hit, 30, 16);
  const tellerFocus = ramp(f, t(1.3), t(1.9));
  const que = t(4.66);
  const camZ = interpolate(f, [0, t(1.35), dur], [1.55, 1.04, 1.14], { extrapolateRight: "clamp", easing: EASE_IN_OUT });
  return (
    <AbsoluteFill>
      <Glitch a={que} b={que + 7}>
        <Stage from="#020b1f" to="#063a5c" glowA="#00e5ff" glowB="#ff2e88">
          <AbsoluteFill style={{ transformOrigin: "50% 49%", scale: String(camZ), translate: `${sh[0]}px ${sh[1]}px` }}>
            {/* cajera tras el mesón */}
            <div style={abs(330, 150, { filter: `blur(${(1 - tellerFocus) * 10}px)`, opacity: 0.55 + 0.45 * tellerFocus })}>
              <Person who="cajera" mood={f > hit ? "serious" : "neutral"} size={420} />
            </div>
            {/* mesón con neón */}
            <div style={abs(-40, 640, { width: 1160, height: 900, background: "linear-gradient(180deg,#0d2742,#04101f)" })} />
            <div style={abs(-40, 632, { width: 1160, height: 12, background: "#00e5ff", boxShadow: "0 0 40px 10px #00e5ffaa" })} />
            {/* vale vista */}
            <div style={abs(70, 720, { rotate: `${-5 + ramp(f, 0, 30) * 2}deg`, translate: `0px ${lerp(f, 0, 14, 40, 0)}px` })}>
              <ValeVista width={940} stampOpacity={1}>
                <Shine at={8} dur={22} />
                {f >= hit && (
                  <div
                    style={{
                      position: "absolute",
                      left: 90,
                      top: 100,
                      padding: "6px 40px",
                      border: "12px solid #FF1744",
                      borderRadius: 18,
                      color: "#FF1744",
                      fontFamily: "Barlow Condensed",
                      fontWeight: 800,
                      fontSize: 160,
                      whiteSpace: "nowrap",
                      lineHeight: 1,
                      rotate: "-12deg",
                      scale: String(slam(f, hit)),
                      opacity: ramp(f, hit, hit + 3),
                      background: "rgba(255,23,68,0.08)",
                      mixBlendMode: "multiply",
                    }}
                  >
                    SIN VALOR
                  </div>
                )}
              </ValeVista>
            </div>
          </AbsoluteFill>
          {f >= hit && <AbsoluteFill style={{ background: "#ff003c", opacity: 0.18 * (1 - ramp(f, hit, hit + 20)) }} />}
          <Flash at={hit} color="#ff1744" dur={10} />
        </Stage>
      </Glitch>
      {/* ¿QUÉ PASÓ? */}
      <AbsoluteFill style={{ alignItems: "center", top: 1110 }}>
        <Title at={que} out={t(4.98)} size={150} color="#FFD60A" rotate={-4}>
          ¿Qué pasó?
        </Title>
      </AbsoluteFill>
      <Rewind a={t(4.98)} label="3 DÍAS ANTES" />
      <div style={abs(80, 70, { fontFamily: "Inter", fontWeight: 600, fontSize: 24, color: "#ffffffaa", letterSpacing: 1 })}>
        RECREACIÓN · BANCO Y PERSONAJES FICTICIOS
      </div>
    </AbsoluteFill>
  );
};

/* ============================================================ PUBLICACIÓN */
const Bubble: React.FC<{ at: number; me?: boolean; children: React.ReactNode }> = ({ at, me, children }) => {
  const f = useCurrentFrame();
  if (f < at) return null;
  const p = pop(f, at, 11, 240);
  return (
    <div style={{ display: "flex", justifyContent: me ? "flex-end" : "flex-start", marginBottom: 16 }}>
      <div
        style={{
          maxWidth: "80%",
          padding: "14px 20px",
          borderRadius: 26,
          borderBottomLeftRadius: me ? 26 : 6,
          borderBottomRightRadius: me ? 6 : 26,
          background: me ? "linear-gradient(135deg,#3D8BFF,#6a5bff)" : "#262b45",
          color: "#fff",
          fontFamily: "Inter",
          fontWeight: 600,
          fontSize: 27,
          lineHeight: 1.25,
          scale: String(p),
          transformOrigin: me ? "100% 100%" : "0% 100%",
        }}
      >
        {children}
      </div>
    </div>
  );
};

export const Publicacion: React.FC = () => {
  const f = useCurrentFrame();
  const t = sceneClock("Publicacion");
  const dur = sceneFrames("Publicacion");
  const chat = t(6.72);
  const notif = pop(f, chat - 4, 12, 200);
  return (
    <SceneIn dir="right">
      <Stage from="#3b0a8f" to="#ff6a1a" glowA="#ffd60a" glowB="#ff2e88" angle={170} rays>
        <Camera dur={dur} zoom={[1.0, 1.06]} drift={[-10, 0]}>
          {/* teléfono */}
          <div style={abs(450, 170, { rotate: `${lerp(f, 0, 14, 10, -3)}deg`, translate: `${lerp(f, 0, 14, 300, 0)}px 0px` })}>
            <Phone width={540}>
              {f < chat ? (
                <div style={{ position: "absolute", inset: 0, fontFamily: "Inter", color: "#fff" }}>
                  <div style={{ height: 120, background: "#161a2e", display: "flex", alignItems: "flex-end", padding: "0 28px 16px", fontFamily: "Barlow Condensed", fontWeight: 800, fontSize: 40 }}>
                    <span style={{ color: "#FFD60A" }}>Auto</span>Market
                  </div>
                  <div style={{ height: 380, background: "linear-gradient(180deg,#66d0ff,#c6f0ff 60%,#4a4f63 60%)", position: "relative", overflow: "hidden" }}>
                    <div style={abs(20, 150)}>
                      <Car width={460} wheelSpin={0} lights={false} />
                    </div>
                  </div>
                  <div style={{ padding: "26px 28px" }}>
                    <div style={{ fontFamily: "Barlow Condensed", fontWeight: 800, fontSize: 76, color: "#2EE59D", lineHeight: 1 }}>$8.900.000</div>
                    <div style={{ fontWeight: 700, fontSize: 32, marginTop: 10 }}>Hatchback 2019 · 68.000 km</div>
                    <div style={{ fontSize: 24, opacity: 0.7, marginTop: 8 }}>Santiago · Publicado por Pablo</div>
                    <div style={{ marginTop: 34, height: 78, borderRadius: 20, background: "#3D8BFF", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 30 }}>
                      Enviar mensaje
                    </div>
                  </div>
                </div>
              ) : (
                <div style={{ position: "absolute", inset: 0, fontFamily: "Inter", color: "#fff" }}>
                  <div style={{ height: 150, background: "#161a2e", display: "flex", alignItems: "flex-end", gap: 16, padding: "0 24px 18px" }}>
                    <div style={{ width: 70, height: 70, borderRadius: 35, overflow: "hidden", background: "#ff2e88" }}>
                      <Person who="comprador" mood="smirk" size={70} style={{ scale: "1.5", translate: "0px 12px" }} />
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 30 }}>Comprador</div>
                      <div style={{ fontSize: 22, color: "#2EE59D" }}>en línea</div>
                    </div>
                  </div>
                  <div style={{ padding: "26px 22px" }}>
                    <Bubble at={t(6.8)}>¡Hola! ¿Sigue disponible?</Bubble>
                    <Bubble at={t(7.15)} me>Sí, disponible</Bubble>
                    <Bubble at={t(7.5)}>Te lo compro al tiro</Bubble>
                    <Bubble at={t(8.24)}>Se ve impecable, felicitaciones</Bubble>
                    <Bubble at={t(8.96)}>¿Lo cerramos hoy mismo?</Bubble>
                    <Bubble at={t(10.0)}>Pago el precio publicado, sin descuento</Bubble>
                  </div>
                </div>
              )}
            </Phone>
          </div>
          {/* notificación */}
          {f >= chat - 4 && f < chat + 22 && (
            <div
              style={abs(470, 120, {
                width: 500,
                padding: "18px 24px",
                borderRadius: 26,
                background: "rgba(255,255,255,0.95)",
                fontFamily: "Inter",
                fontWeight: 700,
                fontSize: 28,
                color: "#111",
                translate: `0px ${(1 - notif) * -140}px`,
                boxShadow: "0 20px 40px rgba(0,0,0,0.4)",
              })}
            >
              Nuevo mensaje · AutoMarket
            </div>
          )}
          {/* Pablo */}
          <div style={abs(-10, 820, { translate: `${lerp(f, 0, 12, -300, 0)}px 0px` })}>
            <Person who="pablo" mood={f > t(8.2) ? "happy" : "neutral"} size={460} look={1} />
          </div>
          {/* banderas rojas */}
          <div style={abs(50, 260)}>
            <Tag at={t(8.24)} color="#fff" textColor="#E0103A" size={56} icon={<RedFlag size={56} />} rotate={-5}>
              Amable
            </Tag>
          </div>
          <div style={abs(30, 440)}>
            <Tag at={t(8.96)} color="#fff" textColor="#E0103A" size={56} icon={<RedFlag size={56} />} rotate={3}>
              Apurado
            </Tag>
          </div>
          <div style={abs(40, 620)}>
            <Tag at={t(10.04)} color="#fff" textColor="#E0103A" size={56} icon={<RedFlag size={56} />} rotate={-3}>
              Sin regatear
            </Tag>
          </div>
        </Camera>
      </Stage>
    </SceneIn>
  );
};

/* ================================================================ VIERNES */
export const Viernes: React.FC = () => {
  const f = useCurrentFrame();
  const t = sceneClock("Viernes");
  const dur = sceneFrames("Viernes");
  const closed = f >= t(12.2) ? (Math.floor(f / 5) % 3 === 0 ? 0.35 : 1) : 0.15;
  const doc = pop(f, t(13.05), 12, 180);
  return (
    <SceneIn dir="zoom">
      <Stage from="#1a0638" to="#ff5e3a" glowA="#ffb800" glowB="#7b2ff7" angle={180}>
        <Camera dur={dur} zoom={[1.0, 1.1]} origin="50% 60%">
          {/* sol y ciudad */}
          <div style={abs(640, 140, { width: 360, height: 360, borderRadius: "50%", background: "radial-gradient(circle,#ffe259,#ff7a00 60%,transparent 70%)", opacity: 0.85 })} />
          <svg style={abs(0, 330)} width={1080} height={420} viewBox="0 0 1080 420">
            <path d="M0,420 L0,200 L80,200 L80,120 L160,120 L160,240 L220,240 L220,60 L300,60 L300,260 L380,260 L380,160 L460,160 L460,300 L560,300 L560,90 L640,90 L640,230 L720,230 L720,140 L820,140 L820,270 L900,270 L900,40 L980,40 L980,210 L1080,210 L1080,420Z" fill="#2a0b3f" opacity={0.9} />
          </svg>
          {/* fachada del banco */}
          <div style={abs(110, 440, { width: 860, height: 640, background: "linear-gradient(180deg,#30214d,#140c24)", borderRadius: 10, boxShadow: "0 0 80px rgba(0,0,0,0.6)" })}>
            <div style={{ position: "absolute", left: 0, right: 0, top: 26, textAlign: "center", fontFamily: "Barlow Condensed", fontWeight: 800, fontSize: 70, color: "#9fd4ff", textShadow: "0 0 24px #00a3e0" }}>
              BANCO ANDINO
            </div>
            <div style={{ position: "absolute", left: 60, right: 60, top: 130, bottom: 0, background: "repeating-linear-gradient(180deg,#5a5f73 0 18px,#3c4152 18px 24px)", borderRadius: "6px 6px 0 0" }} />
            <div
              style={{
                position: "absolute",
                left: 70,
                top: 200,
                width: 400,
                padding: "8px 0",
                textAlign: "center",
                border: "6px solid #ff1744",
                borderRadius: 16,
                fontFamily: "Barlow Condensed",
                fontWeight: 800,
                fontSize: 96,
                color: "#ff1744",
                background: "#14000699",
                opacity: closed,
                boxShadow: `0 0 ${50 * closed}px #ff1744`,
                textShadow: `0 0 ${30 * closed}px #ff1744`,
              }}
            >
              CERRADO
            </div>
          </div>
          {/* comprador */}
          <div style={abs(480, 610, { translate: `${lerp(f, t(10.85), t(11.3), 600, 0)}px 0px` })}>
            <Person who="comprador" mood="smirk" size={560} />
          </div>
          {/* vale vista en mano */}
          {f >= t(13.05) && (
            <div style={abs(40, 860, { rotate: `${-8 + 4 * doc}deg`, scale: String(0.3 + 0.7 * doc), transformOrigin: "80% 50%" })}>
              <ValeVista width={640} highlight={f >= t(13.8) && Math.floor(f / 6) % 2 === 0 ? "nombre" : f >= t(13.8) ? "nombre" : null}>
                <Shine at={t(13.2)} />
              </ValeVista>
            </div>
          )}
        </Camera>
        <div style={abs(80, 150)}>
          <Tag at={t(10.72)} color="#FFD60A" textColor="#14002b" rotate={-4} size={72}>
            Viernes · 18:47
          </Tag>
        </div>
      </Stage>
      <Bokeh color="#ffb800" seed="vie" count={14} />
    </SceneIn>
  );
};
