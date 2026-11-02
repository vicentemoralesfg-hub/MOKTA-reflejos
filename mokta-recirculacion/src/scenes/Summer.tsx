import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { COLORS, FONT_DISPLAY, FPS, TEXT, beat } from "../config";
import { CarSection } from "../components/CarSection";
import { Gauge } from "../components/Gauges";
import { HvacButton, PressRipple } from "../components/HvacButton";
import { FuelIcon, RecircIcon, SunIcon } from "../components/Icons";
import { Bg, Chip, Flash, Grade, H, Marker, Pop, SUB, SceneIn, Slam, Teaser, Words } from "../components/Kinetic";
import { EASE_IN_OUT, lerp, pop, rand, ramp, shake } from "../lib/anim";

/**
 * Error #2 (verano): A/C prendido con la recirculación apagada →
 * el compresor enfría aire caliente de afuera sin parar → más esfuerzo, más bencina.
 */
export const Summer: React.FC = () => {
  const f = useCurrentFrame();
  const B = { line: beat("summer", "line"), press: beat("summer", "press"), flow: beat("summer", "flow"), fuel: beat("summer", "fuel") };
  const sh = shake(f, [0, B.press, B.fuel], 16);
  const partA = f < B.flow;
  const partB = f >= B.flow && f < B.fuel;
  const partC = f >= B.fuel;

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.ink }}>
      <Bg mood="hot" />
      <SunGlare f={f} />

      {partA ? (
        <SceneIn>
          <AbsoluteFill style={{ translate: `${sh.x}px ${sh.y}px` }}>
            <div style={{ position: "absolute", top: 250, left: 0, right: 0, display: "flex", justifyContent: "center" }}>
              <Slam at={0} from={1.8}>
                <Chip color={COLORS.hot} icon={<SunIcon size={46} stroke={8} />} size={46}>
                  {TEXT.summerChip}
                </Chip>
              </Slam>
            </div>
            <div style={{ position: "absolute", top: 400, left: 60, right: 60 }}>
              <Words text={TEXT.summerLine1} at={B.line} style={{ ...SUB, fontSize: 58 }} />
              <Pop at={B.line + 10} style={{ marginTop: 18 }}>
                <div style={{ ...H, fontSize: 100 }}>
                  {TEXT.summerLine2}{" "}
                  <Marker at={B.press} color={COLORS.red}>
                    {TEXT.summerLine2Hi}
                  </Marker>
                </div>
              </Pop>
            </div>
            <div style={{ position: "absolute", top: 830, left: 0, right: 0, display: "flex", justifyContent: "center", gap: 90 }}>
              <Pop at={8}>
                <HvacButton size={280} led={1} ledColor={COLORS.green} text="A/C" label="ENCENDIDO" labelColor={COLORS.green} />
              </Pop>
              <Pop at={12}>
                <div style={{ position: "relative" }}>
                  <PressRipple f={f} at={B.press} size={280} color={COLORS.red} />
                  <HvacButton
                    size={280}
                    led={1 - ramp(f, B.press, B.press + 3)}
                    pressed={interpolate(f, [B.press - 3, B.press, B.press + 5], [0, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })}
                    icon={<RecircIcon size={170} stroke={6} />}
                    label={f >= B.press ? "APAGADA" : "RECIRCULACIÓN"}
                    labelColor={f >= B.press ? COLORS.red : COLORS.dim}
                  />
                </div>
              </Pop>
            </div>
          </AbsoluteFill>
        </SceneIn>
      ) : null}

      {partB ? <FlowPart f={f - B.flow} /> : null}
      {partC ? <FuelPart f={f - B.fuel} /> : null}

      {!partC ? <Teaser at={0} text={TEXT.teaser} /> : null}
      <Flash at={B.fuel} max={0.25} color={COLORS.red} />
      <Grade />
    </AbsoluteFill>
  );
};

const SunGlare: React.FC<{ f: number }> = ({ f }) => (
  <AbsoluteFill
    style={{
      background: `radial-gradient(40% 24% at 88% 6%, rgba(255,210,120,${0.45 + 0.05 * Math.sin(f / 8)}) 0%, rgba(255,140,40,0.12) 45%, rgba(0,0,0,0) 75%)`,
    }}
  />
);

/** Aire caliente que entra sin parar + esfuerzo del compresor. */
const FlowPart: React.FC<{ f: number }> = ({ f }) => {
  const d = pop(f, 0, 14, 170);
  const load = interpolate(f, [6, 48], [0.3, 0.95], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: EASE_IN_OUT }) + (f > 48 ? Math.sin(f * 1.7) * 0.025 : 0);
  return (
    <AbsoluteFill style={{ scale: String(lerp(1.1, 1, ramp(f, 0, 10))) }}>
      <div style={{ position: "absolute", top: 250, left: 60, right: 60 }}>
        <Words text={TEXT.summerFlow} at={0} stagger={2} style={{ ...SUB, fontSize: 56 }} />
        <Pop at={12} style={{ display: "flex", justifyContent: "center", marginTop: 16 }}>
          <div style={{ ...H, fontSize: 140 }}>
            <Marker at={14} color={COLORS.hot} textColor={COLORS.ink}>
              {TEXT.summerFlowHi}
            </Marker>
          </div>
        </Pop>
      </div>
      <div style={{ position: "absolute", top: 600, left: 50, opacity: Math.min(1, d * 2), translate: `0px ${lerp(60, 0, d)}px` }}>
        <CarSection t={f / FPS} width={980} mode="fresh" flowColor={COLORS.hot} intakeClosed={0} occupants acGlow={0.6 + 0.4 * Math.sin(f / 2.2)} acColor={COLORS.red} outsideTemp="33°" />
      </div>
      <div style={{ position: "absolute", top: 1110, left: 0, right: 0, display: "flex", justifyContent: "center" }}>
        <Pop at={10}>
          <Gauge
            size={330}
            value={load}
            label="ESFUERZO DEL COMPRESOR"
            zones={[
              { from: 0, to: 0.55, color: "rgba(244,246,248,0.35)" },
              { from: 0.55, to: 0.8, color: COLORS.led },
              { from: 0.8, to: 1, color: COLORS.red },
            ]}
            glow={load > 0.8 ? COLORS.red : undefined}
          />
        </Pop>
      </div>
    </AbsoluteFill>
  );
};

/** Más esfuerzo = más bencina: la aguja cae y la plata se evapora. */
const FuelPart: React.FC<{ f: number }> = ({ f }) => {
  const sh = shake(f, [0], 16);
  const v = interpolate(f, [8, 54], [0.82, 0.18], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: EASE_IN_OUT });
  return (
    <AbsoluteFill style={{ translate: `${sh.x}px ${sh.y}px`, scale: String(lerp(1.12, 1, ramp(f, 0, 10))) }}>
      <div style={{ position: "absolute", top: 270, left: 0, right: 0 }}>
        <Slam at={0} from={1.8}>
          <div style={{ ...H, fontSize: 130 }}>{TEXT.summerFuel1}</div>
        </Slam>
        <Pop at={6} style={{ display: "flex", justifyContent: "center", marginTop: 12 }}>
          <div style={{ ...H, fontSize: 150 }}>
            <Marker at={8} color={COLORS.red}>
              {TEXT.summerFuel2}
            </Marker>
          </div>
        </Pop>
      </div>
      <div style={{ position: "absolute", top: 720, left: 0, right: 0, display: "flex", justifyContent: "center" }}>
        <Pop at={4}>
          <Gauge
            size={560}
            value={v}
            label="BENCINA"
            minLabel="E"
            maxLabel="F"
            zones={[
              { from: 0, to: 0.18, color: COLORS.red },
              { from: 0.18, to: 1, color: "rgba(244,246,248,0.3)" },
            ]}
            icon={<FuelIcon size={100} stroke={7} color={v < 0.3 ? COLORS.red : COLORS.white} />}
            glow={v < 0.3 ? COLORS.red : undefined}
          />
        </Pop>
      </div>
      {/* plata que se evapora */}
      {Array.from({ length: 12 }, (_, i) => {
        const start = 8 + i * 4;
        const age = f - start;
        if (age < 0 || age > 34) return null;
        const k = age / 34;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: 300 + rand(i * 3.7) * 480,
              top: lerp(1000, 640, k),
              fontFamily: FONT_DISPLAY,
              fontWeight: 800,
              fontSize: 60 + rand(i) * 40,
              color: COLORS.green,
              opacity: Math.sin(k * Math.PI) * 0.9,
              rotate: `${(rand(i * 9) - 0.5) * 40}deg`,
              textShadow: `0 0 20px ${COLORS.green}88`,
            }}
          >
            $
          </div>
        );
      })}
    </AbsoluteFill>
  );
};
