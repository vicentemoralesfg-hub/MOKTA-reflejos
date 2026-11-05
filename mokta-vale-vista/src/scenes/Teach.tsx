import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { Bokeh, Camera, Flash, SceneIn, Stage } from "../components/Fx";
import { Person } from "../components/Person";
import { BankIcon, Check, Cross, Keys, PhoneIcon, ValeVista } from "../components/Props";
import { Tag, Title } from "../components/Text";
import { lerp, pop, ramp, sceneClock, slam } from "../lib/anim";
import { sceneFrames } from "../timing";

const abs = (x: number, y: number, extra: React.CSSProperties = {}): React.CSSProperties => ({ position: "absolute", left: x, top: y, ...extra });

/** Tarjeta que entra deslizándose desde la derecha. */
const Card: React.FC<{ at: number; x?: number; y: number; w?: number; h: number; border: string; bg?: string; children: React.ReactNode }> = ({
  at,
  x = 70,
  y,
  w = 940,
  h,
  border,
  bg = "rgba(10,10,30,0.82)",
  children,
}) => {
  const f = useCurrentFrame();
  if (f < at) return null;
  const p = pop(f, at, 13, 200);
  return (
    <div
      style={abs(x, y, {
        width: w,
        height: h,
        borderRadius: 34,
        background: bg,
        border: `5px solid ${border}`,
        boxShadow: `0 0 50px ${border}66, 0 30px 60px rgba(0,0,0,0.5)`,
        translate: `${(1 - p) * 900}px 0px`,
        rotate: `${(1 - p) * 8}deg`,
        display: "flex",
        alignItems: "center",
        gap: 34,
        padding: "0 40px",
        color: "#fff",
        fontFamily: "Inter",
      })}
    >
      {children}
    </div>
  );
};

const CardText: React.FC<{ title: string; sub?: string; color?: string; size?: number }> = ({ title, sub, color = "#fff", size = 76 }) => (
  <div>
    <div style={{ fontFamily: "Barlow Condensed", fontWeight: 800, fontSize: size, lineHeight: 0.95, color, textTransform: "uppercase" }}>{title}</div>
    {sub && <div style={{ fontSize: 32, fontWeight: 500, opacity: 0.85, marginTop: 8, lineHeight: 1.2 }}>{sub}</div>}
  </div>
);

/** Número de paso + título. */
const StepHeader: React.FC<{ n: number; at: number; color: string; children: React.ReactNode }> = ({ n, at, color, children }) => {
  const f = useCurrentFrame();
  const p = pop(f, 0, 10, 200);
  const tp = pop(f, at, 12, 200);
  return (
    <div style={abs(70, 140, { display: "flex", alignItems: "center", gap: 34 })}>
      <div
        style={{
          width: 190,
          height: 190,
          flex: "0 0 190px",
          borderRadius: 50,
          background: color,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "Barlow Condensed",
          fontWeight: 800,
          fontSize: 170,
          color: "#0a0a14",
          scale: String(p),
          rotate: `${(1 - p) * -90}deg`,
          boxShadow: `0 0 60px ${color}aa`,
        }}
      >
        {n}
      </div>
      <div
        style={{
          fontFamily: "Barlow Condensed",
          fontWeight: 800,
          fontSize: 86,
          lineHeight: 0.95,
          color: "#fff",
          textTransform: "uppercase",
          opacity: Math.min(1, tp * 2),
          translate: `${(1 - tp) * 80}px 0px`,
        }}
      >
        {children}
      </div>
    </div>
  );
};

/* ============================================================ EXPLICACIÓN */
export const Explicacion: React.FC = () => {
  const f = useCurrentFrame();
  const t = sceneClock("Explicacion");
  const dur = sceneFrames("Explicacion");
  // dígitos adulterados
  const adult = f >= t(28.76) ? (Math.floor((f - t(28.76)) / 5) % 2 === 0 ? "$89.000" : "$8.900.000") : "$89.000";
  return (
    <SceneIn dir="up">
      <Stage from="#12002b" to="#5a0094" glowA="#ff2e88" glowB="#ffd60a" rays>
        <Camera dur={dur} zoom={[1.0, 1.05]}>
          <AbsoluteFill style={{ alignItems: "center", top: 150 }}>
            <Title at={t(26.7)} size={86} rotate={-2}>
              La estafa del
            </Title>
            <Title at={t(26.84)} size={150} color="#FFD60A" rotate={-3} style={{ marginTop: 6 }}>
              falso vale vista
            </Title>
          </AbsoluteFill>
          {/* documento girando antes de las tarjetas */}
          {f < t(27.9) && (
            <div style={abs(130, 560, { scale: String((0.45 + 0.37 * pop(f, 0, 12, 220)) * (1 - ramp(f, t(27.6), t(27.9)))), rotate: `${Math.sin(f / 8) * 6}deg` })}>
              <ValeVista width={820}>
                <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(20,0,40,0.45)", fontFamily: "Barlow Condensed", fontWeight: 800, fontSize: 300, color: "#FFD60A", textShadow: "0 0 40px #000" }}>
                  ?
                </div>
              </ValeVista>
            </div>
          )}
          <Card at={t(27.7)} y={500} h={230} border="#ff2e88">
            <div style={{ position: "relative", width: 150, height: 150, flex: "0 0 150px" }}>
              <div style={abs(0, 20, { width: 120, height: 80, background: "#cfe8ff", borderRadius: 10, rotate: "-10deg" })} />
              <div style={abs(30, 50, { width: 120, height: 80, background: "#fff", borderRadius: 10, rotate: "6deg", border: "3px dashed #ff2e88" })} />
            </div>
            <CardText title="Falsificado" sub="Una copia trucha, impresa en casa" color="#ff6fae" />
          </Card>
          <Card at={t(28.7)} y={760} h={230} border="#ffd60a">
            <div style={{ width: 150, flex: "0 0 150px", fontFamily: "Barlow Condensed", fontWeight: 800, fontSize: adult.length > 7 ? 44 : 60, color: "#ffd60a", textAlign: "center" }}>{adult}</div>
            <CardText title="Adulterado" sub="Un documento real con monto o datos alterados" color="#ffd60a" />
          </Card>
          <Card at={t(30.5)} y={1020} h={230} border="#00e5ff">
            <div style={{ width: 150, flex: "0 0 150px", height: 150, borderRadius: 75, background: "#00e5ff22", border: "5px solid #00e5ff", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Barlow Condensed", fontWeight: 800, fontSize: 110, color: "#00e5ff" }}>
              ?
            </div>
            <CardText title="Sin operación real" sub="El banco no lo respalda: no existe o no es válido" color="#7ff3ff" size={68} />
          </Card>
        </Camera>
      </Stage>
    </SceneIn>
  );
};

/* ========================================================== ANTES DE... */
export const AntesDe: React.FC = () => {
  const f = useCurrentFrame();
  const t = sceneClock("AntesDe");
  const dur = sceneFrames("AntesDe");
  return (
    <AbsoluteFill style={{ scale: String(1.25 - 0.25 * ramp(f, 0, 7)) }}>
      <Stage from="#FFD60A" to="#FF7A00" glowA="#ffffff" glowB="#ff2e88" rays>
        <Camera dur={dur} zoom={[1.0, 1.1]}>
          <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", top: -120 }}>
            <div style={{ rotate: `${Math.sin(f / 4) * 8}deg`, marginBottom: 20 }}>
              <Keys size={340} glow={false} />
            </div>
            <Title at={t(32.5)} size={120} color="#0a0a14" stroke="#fff" rotate={-3}>
              Antes de
            </Title>
            <Title at={t(32.84)} size={116} color="#fff" stroke="#0a0a14" rotate={-3}>
              entregar tu auto
            </Title>
          </AbsoluteFill>
        </Camera>
        <Flash at={0} dur={6} peak={0.7} />
      </Stage>
    </AbsoluteFill>
  );
};

/* ================================================================ PASO 1 */
export const Paso1: React.FC = () => {
  const f = useCurrentFrame();
  const t = sceneClock("Paso1");
  const dur = sceneFrames("Paso1");
  const ring = f >= t(35.2) ? Math.sin(f * 1.6) * 10 * (f < t(37.0) ? 1 : 0.2) : 0;
  const no = t(37.76);
  return (
    <SceneIn dir="right">
      <Stage from="#020617" to="#1e3aa8" glowA="#00e5ff" glowB="#2EE59D">
        <Camera dur={dur} zoom={[1.0, 1.05]}>
          <StepHeader n={1} at={t(34.5)} color="#FFD60A">
            Llama tú
            <br />
            al banco emisor
          </StepHeader>
          <Card at={t(34.95)} y={470} h={300} border="#2EE59D">
            <div style={{ position: "relative", flex: "0 0 150px", width: 150, height: 150, borderRadius: 75, background: "#2EE59D", display: "flex", alignItems: "center", justifyContent: "center", rotate: `${ring}deg` }}>
              <PhoneIcon size={90} color="#062a1c" />
              {f >= t(35.2) && f < t(37.6) && (
                <div style={{ position: "absolute", inset: -20 - ((f * 3) % 30), borderRadius: "50%", border: "4px solid #2EE59D", opacity: 1 - ((f * 3) % 30) / 30 }} />
              )}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 30, fontWeight: 600, color: "#9ff5cf" }}>
                <BankIcon size={38} color="#9ff5cf" /> Sitio oficial del banco
              </div>
              <div style={{ fontFamily: "Barlow Condensed", fontWeight: 800, fontSize: 70, lineHeight: 1, marginTop: 10 }}>BÚSCALO TÚ MISMO</div>
              <div style={{ fontSize: 28, opacity: 0.8, marginTop: 8 }}>Web oficial · app · sucursal</div>
            </div>
            {f >= t(37.0) && <Check size={110} draw={ramp(f, t(37.0), t(37.3))} />}
          </Card>
          <Card at={t(37.6)} y={830} h={300} border="#FF2D55" bg="rgba(40,0,12,0.85)">
            <div style={{ flex: "0 0 150px", width: 150, height: 150, borderRadius: 30, overflow: "hidden", background: "#3a0a1a" }}>
              <Person who="comprador" mood="smirk" size={150} style={{ scale: "1.5", translate: "0px 28px" }} />
            </div>
            <div style={{ flex: 1, position: "relative" }}>
              <div style={{ fontSize: 28, fontWeight: 600, color: "#ff9fb2" }}>Te lo da el comprador:</div>
              <div style={{ fontFamily: "Barlow Condensed", fontWeight: 800, fontSize: 58, lineHeight: 1.05, marginTop: 6 }}>
                “Llama a mi ejecutivo:
                <br />
                +56 9 XXXX XXXX”
              </div>
              {f >= no && <div style={abs(-10, 96, { height: 10, width: `${ramp(f, no, no + 6) * 105}%`, background: "#FF2D55", rotate: "-4deg", borderRadius: 5 })} />}
            </div>
            {f >= no && <Cross size={110} draw={ramp(f, no, no + 8)} />}
          </Card>
          <AbsoluteFill style={{ top: 1170, alignItems: "center" }}>
            <Tag at={t(37.76)} color="#FF2D55" size={74} rotate={-3}>
              Nunca a ese número
            </Tag>
          </AbsoluteFill>
        </Camera>
      </Stage>
    </SceneIn>
  );
};

/* ================================================================ PASO 2 */
const Row: React.FC<{ show: number; ok: number; label: string; value: string; strong?: boolean }> = ({ show, ok, label, value, strong }) => {
  const f = useCurrentFrame();
  if (f < show) return null;
  const p = pop(f, show, 12, 220);
  const done = f >= ok;
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "20px 30px",
        marginTop: 20,
        borderRadius: 24,
        background: done ? (strong ? "#2EE59D33" : "#ffffff14") : "#ffffff0a",
        border: `3px solid ${done ? "#2EE59D" : "#ffffff30"}`,
        translate: `${(1 - p) * -200}px 0px`,
        opacity: Math.min(1, p * 2),
        scale: done && strong ? String(1 + 0.04 * pop(f, ok, 8, 260)) : "1",
      }}
    >
      <div>
        <div style={{ fontSize: 28, fontWeight: 600, opacity: 0.75 }}>{label}</div>
        <div style={{ fontFamily: "Barlow Condensed", fontWeight: 800, fontSize: 64, lineHeight: 1 }}>{value}</div>
      </div>
      <div style={{ opacity: done ? 1 : 0.15 }}>
        <Check size={96} draw={done ? ramp(f, ok, ok + 8) : 0} color={done ? "#2EE59D" : "#555"} />
      </div>
    </div>
  );
};

export const Paso2: React.FC = () => {
  const f = useCurrentFrame();
  const t = sceneClock("Paso2");
  const dur = sceneFrames("Paso2");
  return (
    <SceneIn dir="right">
      <Stage from="#00140f" to="#00796b" glowA="#2EE59D" glowB="#00e5ff">
        <Camera dur={dur} zoom={[1.0, 1.05]}>
          <StepHeader n={2} at={t(39.4)} color="#2EE59D">
            Confirma
            <br />
            con el banco
          </StepHeader>
          <div
            style={abs(70, 420, {
              width: 940,
              padding: 34,
              borderRadius: 40,
              background: "rgba(0,20,16,0.8)",
              border: "4px solid #2EE59D66",
              color: "#fff",
              fontFamily: "Inter",
              boxShadow: "0 40px 80px rgba(0,0,0,0.5)",
              scale: String(0.9 + 0.1 * pop(f, 4, 14, 160)),
            })}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
              <div style={{ width: 300, height: 147, flex: "0 0 300px", borderRadius: 10, overflow: "hidden" }}>
                <ValeVista width={300} highlight={f >= t(43.3) ? "nombre" : f >= t(41.8) && f < t(43.3) ? "monto" : null} />
              </div>
              <div>
                <div style={{ fontSize: 26, opacity: 0.7, fontWeight: 600 }}>Pregunta directo al banco emisor</div>
                <div style={{ fontFamily: "Barlow Condensed", fontWeight: 800, fontSize: 52, lineHeight: 1 }}>¿ESTE DOCUMENTO ES VÁLIDO?</div>
              </div>
            </div>
            <Row show={t(40.2)} ok={t(41.0)} label="El documento" value="EXISTE Y ESTÁ VIGENTE" />
            <Row show={t(41.75)} ok={t(41.9)} label="Monto" value="$8.900.000" />
            <Row show={t(42.6)} ok={t(43.42)} label="Beneficiario" value="TÚ: PABLO ROJAS M." strong />
          </div>
        </Camera>
      </Stage>
    </SceneIn>
  );
};

/* ================================================================ PASO 3 */
export const Paso3: React.FC = () => {
  const f = useCurrentFrame();
  const t = sceneClock("Paso3");
  const dur = sceneFrames("Paso3");
  const B = t(46.95);
  const cobro = t(49.04);
  const handRot = f * 18;
  return (
    <SceneIn dir="right">
      <Stage from="#2a0845" to="#ff4e50" glowA="#ffd60a" glowB="#00e5ff" angle={165}>
        <Camera dur={dur} zoom={[1.0, 1.06]}>
          <StepHeader n={3} at={t(44.1)} color="#FF9F0A">
            ¿Puedes usar
            <br />
            la plata ya?
          </StepHeader>
          {f < B ? (
            <div style={abs(0, 440, { width: 1080, display: "flex", flexDirection: "column", alignItems: "center" })}>
              <svg width={520} height={520} viewBox="0 0 200 200" style={{ scale: String(pop(f, t(44.6), 12, 180)) }}>
                <circle cx={100} cy={100} r={90} fill="#1a0630" stroke="#FF9F0A" strokeWidth={10} />
                {new Array(12).fill(0).map((_, i) => (
                  <rect key={i} x={97} y={18} width={6} height={16} rx={3} fill="#ffd9a0" transform={`rotate(${i * 30} 100 100)`} />
                ))}
                <rect x={96} y={50} width={8} height={54} rx={4} fill="#fff" transform={`rotate(${handRot / 12} 100 100)`} />
                <rect x={97} y={30} width={6} height={74} rx={3} fill="#FF9F0A" transform={`rotate(${handRot} 100 100)`} />
                <circle cx={100} cy={100} r={9} fill="#fff" />
              </svg>
              <div style={{ marginTop: 30 }}>
                <Tag at={t(45.3)} color="#fff" textColor="#2a0845" size={62} rotate={-2}>
                  ¿Cuándo dispongo de los fondos?
                </Tag>
              </div>
            </div>
          ) : (
            <>
              <div style={abs(0, 420, { width: 1080, display: "flex", justifyContent: "center" })}>
                <Tag at={B} color="#FFD60A" textColor="#14002b" size={84} rotate={-4}>
                  Mejor aún
                </Tag>
              </div>
              {/* banco abierto */}
              <div style={abs(140, 560, { width: 800, height: 560, borderRadius: 16, background: "linear-gradient(180deg,#1b4d7a,#0b2240)", boxShadow: "0 30px 60px rgba(0,0,0,0.4)" })}>
                <div style={{ textAlign: "center", marginTop: 20, fontFamily: "Barlow Condensed", fontWeight: 800, fontSize: 60, color: "#9fd4ff" }}>BANCO ANDINO</div>
                <div style={{ position: "absolute", left: 250, top: 130, width: 300, height: 430, background: "linear-gradient(180deg,#9fe7ff,#3aa0d8)", borderRadius: "14px 14px 0 0" }} />
                <div style={{ position: "absolute", right: 30, top: 110, padding: "6px 18px", borderRadius: 12, background: "#2EE59D", color: "#03241a", fontFamily: "Barlow Condensed", fontWeight: 800, fontSize: 44 }}>ABIERTO</div>
              </div>
              <div style={abs(lerp(f, t(47.7), t(48.6), -400, 40), 700)}>
                <Person who="pablo" mood="happy" size={420} look={1} />
              </div>
              <div style={abs(lerp(f, t(47.8), t(48.7), 1400, 600), 700)}>
                <Person who="comprador" mood="neutral" size={420} look={-1} />
              </div>
              {f >= cobro && (
                <AbsoluteFill style={{ alignItems: "center", top: 600 }}>
                  <div
                    style={{
                      padding: "6px 50px",
                      border: "14px solid #2EE59D",
                      borderRadius: 24,
                      color: "#2EE59D",
                      background: "#03241acc",
                      fontFamily: "Barlow Condensed",
                      fontWeight: 800,
                      fontSize: 160,
                      lineHeight: 1.05,
                      rotate: "-8deg",
                      scale: String(slam(f, cobro, 2.4)),
                      boxShadow: "0 0 80px #2EE59D88",
                    }}
                  >
                    COBRADO
                  </div>
                </AbsoluteFill>
              )}
              <Flash at={cobro} color="#2EE59D" dur={8} peak={0.45} />
            </>
          )}
        </Camera>
      </Stage>
      {f >= B && <Bokeh color="#ffd60a" seed="p3" count={12} />}
    </SceneIn>
  );
};
