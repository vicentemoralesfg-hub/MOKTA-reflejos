import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { COLORS, FONT_DISPLAY, FONT_UI, FPS, TEXT, beat } from "../config";
import { Windshield } from "../components/Windshield";
import { HvacButton, PressRipple } from "../components/HvacButton";
import { Dial, TempRing } from "../components/Gauges";
import { CheckIcon, FanIcon, ModeIcon, ModeKind, RearDefrostIcon, RecircIcon, ThermoIcon } from "../components/Icons";
import { Chip, Flash, Grade, H, Marker, Pop, Slam } from "../components/Kinetic";
import { EASE_IN_OUT, lerp, pop, ramp, shake } from "../lib/anim";

/**
 * Receta para desempañar al tiro: 4 pasos sobre el panel real; el vidrio se limpia de abajo hacia arriba
 * a medida que se completan. Al terminar: vidrio limpio + nota de la luneta trasera.
 */
export const Recipe: React.FC = () => {
  const f = useCurrentFrame();
  const S = [beat("recipe", "s1"), beat("recipe", "s2"), beat("recipe", "s3"), beat("recipe", "s4")];
  const done = beat("recipe", "done");
  const rear = beat("recipe", "rear");
  const sh = shake(f, [0, done], 14);

  // limpieza del vidrio: poco con cada paso, total tras el paso 4
  const clear = interpolate(f, [S[0], S[1] + 10, S[2] + 10, S[3] + 10, done - 6], [0, 0.18, 0.34, 0.5, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: EASE_IN_OUT,
  });
  const vents = ramp(f, S[0], S[0] + 10) * (0.55 + 0.45 * ramp(f, S[3], S[3] + 10));

  const current = S.filter((s) => f >= s).length - 1; // −1 antes del paso 1
  const listOut = ramp(f, done - 4, done + 6, EASE_IN_OUT);
  const titleSmall = ramp(f, S[0] - 8, S[0] + 4, EASE_IN_OUT);

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.ink }}>
      <AbsoluteFill style={{ scale: String(interpolate(f, [0, 300], [1.04, 1.0])) }}>
        <Windshield id="recipe" t={f / FPS + 14} fog={1} clear={clear} vents={vents} hazeOpacity={0.54} />
      </AbsoluteFill>
      <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(3,5,9,0.55) 0%, rgba(3,5,9,0) 30%, rgba(3,5,9,0) 52%, rgba(3,5,9,0.6) 70%)" }} />

      <AbsoluteFill style={{ translate: `${sh.x}px ${sh.y}px` }}>
        {/* título */}
        <div
          style={{
            position: "absolute",
            top: lerp(380, 214, titleSmall),
            left: 0,
            right: 0,
            scale: String(lerp(1, 0.62, titleSmall)),
            transformOrigin: "center top",
            opacity: 1 - listOut,
          }}
        >
          <Slam at={0} from={1.7}>
            <div style={{ ...H, fontSize: 112 }}>{TEXT.recipeTitle1}</div>
          </Slam>
          <Pop at={5} style={{ display: "flex", justifyContent: "center", marginTop: 14 }}>
            <div style={{ ...H, fontSize: 176 }}>
              <Marker at={7} color={COLORS.green} textColor={COLORS.ink}>
                {TEXT.recipeTitle2}
              </Marker>
            </div>
          </Pop>
        </div>

        {/* indicador de pasos (1·2·3·4) + paso actual */}
        <div style={{ position: "absolute", top: 410, left: 0, right: 0, display: "flex", justifyContent: "center", alignItems: "center", opacity: (1 - listOut) * ramp(f, S[0] - 6, S[0] + 2) }}>
          {TEXT.steps.map((s, i) => {
            const isDone = f >= S[i] + 30 || f >= done - 6;
            const isCur = i === current && !isDone;
            const p = pop(f, S[i], 10, 220);
            return (
              <React.Fragment key={s.n}>
                {i > 0 ? (
                  <div style={{ width: 86, height: 8, borderRadius: 4, background: "rgba(244,246,248,0.2)", overflow: "hidden" }}>
                    <div style={{ width: `${ramp(f, S[i] - 6, S[i] + 2) * 100}%`, height: "100%", background: COLORS.green }} />
                  </div>
                ) : null}
                <div
                  style={{
                    width: 92,
                    height: 92,
                    borderRadius: 46,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: isDone ? COLORS.green : isCur ? COLORS.white : "rgba(6,9,15,0.75)",
                    border: `4px solid ${isDone ? COLORS.green : isCur ? COLORS.white : "rgba(244,246,248,0.3)"}`,
                    color: isDone || isCur ? COLORS.ink : COLORS.dim,
                    fontFamily: FONT_DISPLAY,
                    fontWeight: 800,
                    fontSize: 58,
                    scale: String(f >= S[i] ? lerp(1.35, 1, p) : 1),
                    boxShadow: isCur ? `0 0 34px ${COLORS.white}88` : isDone ? `0 0 26px ${COLORS.green}88` : undefined,
                  }}
                >
                  {isDone ? <CheckIcon size={54} stroke={14} color={COLORS.ink} /> : s.n}
                </div>
              </React.Fragment>
            );
          })}
        </div>
        {current >= 0 ? (
          <div style={{ position: "absolute", top: 540, left: 70, right: 70, display: "flex", justifyContent: "center", opacity: 1 - listOut }}>
            {TEXT.steps.map((s, i) => {
              if (i !== current) return null;
              const p = pop(f, S[i], 12, 190);
              return (
                <div
                  key={s.n}
                  style={{
                    padding: "22px 40px 24px",
                    borderRadius: 32,
                    background: "rgba(6,9,15,0.88)",
                    border: `4px solid ${COLORS.green}`,
                    boxShadow: `0 0 50px ${COLORS.green}44, 0 20px 60px rgba(0,0,0,0.5)`,
                    textAlign: "center",
                    opacity: Math.min(1, p * 2.5),
                    scale: String(lerp(0.7, 1, p)),
                    translate: `${lerp(140, 0, p)}px 0px`,
                  }}
                >
                  <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 800, fontSize: 92, color: COLORS.white, lineHeight: 1 }}>{s.title}</div>
                  <div style={{ fontFamily: FONT_UI, fontWeight: 700, fontSize: 38, color: COLORS.green, marginTop: 10 }}>{s.sub}</div>
                </div>
              );
            })}
          </div>
        ) : null}

        {/* LISTO */}
        {f >= done ? (
          <div style={{ position: "absolute", top: 330, left: 0, right: 0, display: "flex", flexDirection: "column", alignItems: "center" }}>
            <Slam at={done} from={1.8}>
              <div style={{ display: "flex", alignItems: "center", gap: 26, ...H, fontSize: 190, color: COLORS.green, textShadow: `0 0 60px ${COLORS.green}88, 0 8px 30px rgba(0,0,0,0.6)` }}>
                <CheckIcon size={150} stroke={14} color={COLORS.green} />
                {TEXT.recipeDone}
              </div>
            </Slam>
          </div>
        ) : null}

        <Panel f={f} S={S} rear={rear} />

        {f >= rear ? (
          <div style={{ position: "absolute", top: 930, left: 0, right: 0, display: "flex", justifyContent: "center" }}>
            <Pop at={rear}>
              <Chip color={COLORS.led} icon={<RearDefrostIcon size={48} stroke={8} />} size={36}>
                {TEXT.recipeRear}
              </Chip>
            </Pop>
          </div>
        ) : null}
      </AbsoluteFill>
      <Flash at={done} max={0.3} color={COLORS.green} />
      <Grade grain={0.05} />
    </AbsoluteFill>
  );
};

const MODES: { kind: ModeKind; deg: number }[] = [
  { kind: "face", deg: -64 },
  { kind: "bilevel", deg: -32 },
  { kind: "feet", deg: 0 },
  { kind: "feetDefrost", deg: 32 },
  { kind: "defrost", deg: 64 },
];

/** Panel de climatización (abajo). Cada paso mueve su control con un destello. */
const Panel: React.FC<{ f: number; S: number[]; rear: number }> = ({ f, S, rear }) => {
  const enter = pop(f, 6, 14, 150);
  const turn = (at: number, a: number, b: number) => lerp(a, b, f < at ? 0 : pop(f, at, 10, 180));
  const modeAngle = turn(S[0], -64, 64);
  const fanAngle = turn(S[3], -110, 110);
  const tempAngle = turn(S[3], -40, 110);
  const glowAt = (at: number) => (f >= at && f < at + 40 ? 1 - ramp(f, at + 20, at + 40) : 0);
  const ring = (at: number) => glowAt(at) > 0 ? { boxShadow: `0 0 0 6px ${COLORS.green}, 0 0 50px ${COLORS.green}`, borderRadius: 40 } : {};
  const press = (at: number) => interpolate(f, [at - 3, at, at + 5], [0, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <div
      style={{
        position: "absolute",
        left: 40,
        right: 40,
        top: 1040,
        padding: "26px 26px 22px",
        borderRadius: 44,
        background: "linear-gradient(180deg, rgba(22,25,31,0.96) 0%, rgba(9,11,14,0.98) 100%)",
        border: "2px solid rgba(255,255,255,0.08)",
        boxShadow: "0 -20px 80px rgba(0,0,0,0.6)",
        translate: `0px ${lerp(520, 0, enter)}px`,
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-around", alignItems: "flex-start" }}>
        <div style={{ padding: 6, ...ring(S[3]) }}>
          <Dial size={190} angle={tempAngle} ring={<TempRing size={190} />} label="TEMPERATURA" pointerColor={tempAngle > 40 ? COLORS.red : COLORS.cold} marks={[{ deg: 0, node: <ThermoIcon size={30} stroke={8} /> }]} />
        </div>
        <div style={{ padding: 6, ...ring(S[3]) }}>
          <Dial
            size={190}
            angle={fanAngle}
            label="VENTILADOR"
            marks={[
              { deg: -110, node: <span style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 24 }}>0</span> },
              { deg: 0, node: <FanIcon size={30} stroke={7} />, active: f >= S[3] },
              { deg: 110, node: <span style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 24 }}>MÁX</span>, active: f >= S[3] },
            ]}
          />
        </div>
        <div style={{ padding: 6, ...ring(S[0]) }}>
          <Dial
            size={190}
            angle={modeAngle}
            label="MODO"
            pointerColor={f >= S[0] ? COLORS.green : COLORS.white}
            marks={MODES.map((m) => ({ deg: m.deg, node: <ModeIcon kind={m.kind} size={30} stroke={8} />, active: Math.abs(modeAngle - m.deg) < 10 }))}
          />
        </div>
      </div>
      <div style={{ display: "flex", justifyContent: "space-around", marginTop: 18 }}>
        <div style={{ position: "relative", padding: "6px 10px 2px", ...ring(S[1]) }}>
          <PressRipple f={f} at={S[1]} size={128} color={COLORS.green} />
          <HvacButton size={128} text="A/C" led={ramp(f, S[1], S[1] + 3)} ledColor={COLORS.green} pressed={press(S[1])} label={f >= S[1] ? "PRENDIDO" : "A/C"} labelColor={f >= S[1] ? COLORS.green : COLORS.dim} />
        </div>
        <div style={{ position: "relative", padding: "6px 10px 2px", ...ring(S[2]) }}>
          <PressRipple f={f} at={S[2]} size={128} color={COLORS.green} />
          <HvacButton
            size={128}
            icon={<RecircIcon size={80} stroke={6} />}
            led={1 - ramp(f, S[2], S[2] + 3)}
            pressed={press(S[2])}
            label={f >= S[2] ? "APAGADA" : "RECIRC."}
            labelColor={f >= S[2] ? COLORS.green : COLORS.dim}
          />
        </div>
        <div style={{ position: "relative", padding: "6px 10px 2px", ...ring(rear) }}>
          <PressRipple f={f} at={rear} size={128} color={COLORS.led} />
          <HvacButton size={128} icon={<RearDefrostIcon size={80} stroke={6} />} led={ramp(f, rear, rear + 3)} pressed={press(rear)} label="TRASERO" />
        </div>
      </div>
    </div>
  );
};

