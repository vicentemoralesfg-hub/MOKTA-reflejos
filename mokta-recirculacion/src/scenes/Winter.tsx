import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { COLORS, FONT_UI, FPS, TEXT, beat } from "../config";
import { CarSection } from "../components/CarSection";
import { HvacButton, PressRipple } from "../components/HvacButton";
import { RecircIcon, SnowIcon } from "../components/Icons";
import { Bg, Chip, Flash, Grade, H, Marker, Pop, SUB, SceneIn, Slam, Teaser, Words } from "../components/Kinetic";
import { Windshield } from "../components/Windshield";
import { EASE_IN_OUT, lerp, pop, ramp, shake } from "../lib/anim";

/**
 * Error #1 (invierno): se prende la recirculación para no pasar frío →
 * el vapor de la respiración queda atrapado → toca el vidrio frío → se empaña.
 */
export const Winter: React.FC = () => {
  const f = useCurrentFrame();
  const B = {
    line: beat("winter", "line"),
    press: beat("winter", "press"),
    breath: beat("winter", "breath"),
    pov: beat("winter", "pov"),
    fogged: beat("winter", "fogged"),
    co2: beat("winter", "co2"),
  };
  const sh = shake(f, [0, B.press, B.fogged], 16);

  const partA = f < B.breath;
  const partB = f >= B.breath && f < B.pov;
  const partC = f >= B.pov;

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.ink }}>
      {partA || partB ? <Bg mood="cold" /> : null}

      {partA ? (
        <SceneIn>
          <AbsoluteFill style={{ translate: `${sh.x}px ${sh.y}px` }}>
            <div style={{ position: "absolute", top: 250, left: 0, right: 0, display: "flex", justifyContent: "center" }}>
              <Slam at={0} from={1.8}>
                <Chip color={COLORS.cold} icon={<SnowIcon size={46} stroke={8} />} size={46}>
                  {TEXT.winterChip}
                </Chip>
              </Slam>
            </div>
            <Words
              text={TEXT.winterLine}
              at={B.line}
              style={{ ...H, fontSize: 116, position: "absolute", top: 400, left: 70, right: 70 }}
            />
            <div style={{ position: "absolute", top: 800, left: (1080 - 360) / 2, width: 360, height: 360 }}>
              <PressRipple f={f} at={B.press} size={360} color={COLORS.led} />
              <HvacButton
                size={360}
                led={ramp(f, B.press, B.press + 3)}
                pressed={interpolate(f, [B.press - 3, B.press, B.press + 5], [0, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })}
                icon={<RecircIcon size={220} stroke={6} />}
              />
            </div>
            {/* escarcha en los bordes */}
            <AbsoluteFill style={{ boxShadow: "inset 0 0 220px rgba(120,200,255,0.25)", pointerEvents: "none" }} />
          </AbsoluteFill>
        </SceneIn>
      ) : null}

      {partB ? <BreathPart f={f - B.breath} /> : null}

      {partC ? (
        <AbsoluteFill>
          <AbsoluteFill style={{ scale: String(interpolate(f, [B.pov, B.pov + 78], [1.08, 1.0])) }}>
            <Windshield
              id="winter"
              t={(f - B.pov) / FPS + 8}
              fog={interpolate(f, [B.pov, B.fogged + 4], [0.12, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: EASE_IN_OUT })}
              hazeOpacity={0.56}
            />
          </AbsoluteFill>
          <AbsoluteFill style={{ translate: `${sh.x}px ${sh.y}px` }}>
            <div style={{ position: "absolute", top: 300, left: 60, right: 60 }}>
              <Pop at={B.pov + 2}>
                <div style={{ ...SUB, fontSize: 66 }}>{TEXT.winterGlass}</div>
              </Pop>
            </div>
            <div style={{ position: "absolute", top: 640, left: 0, right: 0, display: "flex", justifyContent: "center" }}>
              <Slam at={B.fogged}>
                <div style={{ ...H, fontSize: 190 }}>
                  <Marker at={B.fogged} color={COLORS.red}>
                    {TEXT.winterFogged}
                  </Marker>
                </div>
              </Slam>
            </div>
            <div style={{ position: "absolute", top: 1180, left: 0, right: 0, display: "flex", justifyContent: "center" }}>
              <Pop at={B.co2}>
                <Chip color={COLORS.led} size={38}>
                  {TEXT.winterCo2}
                </Chip>
              </Pop>
            </div>
          </AbsoluteFill>
          <Flash at={B.fogged} max={0.4} />
        </AbsoluteFill>
      ) : null}

      {!partC ? <Teaser at={0} text={TEXT.teaser} /> : null}
      <Grade />
    </AbsoluteFill>
  );
};

/** Corte del auto: los pasajeros respiran, el vapor viaja al vidrio y lo cubre; la humedad sube. */
const BreathPart: React.FC<{ f: number }> = ({ f }) => {
  const d = pop(f, 0, 14, 170);
  const hum = interpolate(f, [4, 60], [0.28, 0.96], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: EASE_IN_OUT });
  const humColor = hum > 0.75 ? COLORS.red : hum > 0.5 ? COLORS.led : COLORS.cold;
  return (
    <AbsoluteFill style={{ scale: String(lerp(1.1, 1, ramp(f, 0, 10))) }}>
      <div style={{ position: "absolute", top: 250, left: 60, right: 60 }}>
        <Words text={TEXT.winterBreath} at={0} stagger={2} style={{ ...SUB, fontSize: 56 }} />
        <Pop at={8} style={{ display: "flex", justifyContent: "center", marginTop: 14 }}>
          <div style={{ ...H, fontSize: 132 }}>
            <Marker at={10} color={COLORS.cold} textColor={COLORS.ink}>
              {TEXT.winterBreathHi}
            </Marker>
          </div>
        </Pop>
        <Pop at={34} style={{ marginTop: 22 }}>
          <div style={{ ...SUB, fontSize: 48, color: COLORS.dim }}>{TEXT.winterTrapped}</div>
        </Pop>
      </div>
      <div style={{ position: "absolute", top: 700, left: 50, opacity: Math.min(1, d * 2), translate: `0px ${lerp(60, 0, d)}px` }}>
        <CarSection t={f / FPS} width={980} mode="recirc" flowColor="rgba(244,246,248,0.7)" flowOpacity={0.55} intakeClosed={1} occupants vaporF={f} glassFog={ramp(f, 18, 64)} />
      </div>
      {/* medidor de humedad */}
      <div style={{ position: "absolute", top: 1260, left: 130, right: 130 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 12 }}>
          <span style={{ fontFamily: FONT_UI, fontWeight: 800, fontSize: 34, letterSpacing: 6, color: COLORS.white }}>HUMEDAD</span>
          <span style={{ fontFamily: FONT_UI, fontWeight: 800, fontSize: 34, letterSpacing: 4, color: humColor }}>{hum > 0.75 ? "MUY ALTA" : hum > 0.5 ? "ALTA" : "NORMAL"}</span>
        </div>
        <div style={{ height: 30, borderRadius: 15, background: "rgba(244,246,248,0.14)", overflow: "hidden" }}>
          <div
            style={{
              width: `${hum * 100}%`,
              height: "100%",
              borderRadius: 15,
              background: `linear-gradient(90deg, ${COLORS.cold}, ${humColor})`,
              boxShadow: `0 0 24px ${humColor}`,
            }}
          />
        </div>
      </div>
    </AbsoluteFill>
  );
};
