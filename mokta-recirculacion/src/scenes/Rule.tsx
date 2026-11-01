import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { COLORS, FONT_DISPLAY, FONT_UI, TEXT, beat, scene } from "../config";
import { HvacButton } from "../components/HvacButton";
import { BookmarkIcon, CheckIcon, DropIcon, RecircIcon, SnowIcon, SunIcon } from "../components/Icons";
import { Bg, Chip, Flash, Flip, Grade, H, Marker, Pop, Slam } from "../components/Kinetic";
import { EASE_IN_OUT, lerp, pop, ramp, shake } from "../lib/anim";

/** La regla: frío o lluvia → aire de afuera · calor → recirculación. */
export const Rule: React.FC = () => {
  const f = useCurrentFrame();
  const B = { flip: beat("rule", "flip"), hit: beat("rule", "flipHit"), cold: beat("rule", "cold"), hot: beat("rule", "hot"), notes: beat("rule", "notes"), save: beat("rule", "save") };
  const sh = shake(f, [0, B.hit], 20);
  const leadOut = ramp(f, B.cold - 8, B.cold, EASE_IN_OUT);

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.ink }}>
      <Bg mood="neutral" />
      <AbsoluteFill style={{ translate: `${sh.x}px ${sh.y}px`, rotate: `${sh.r}deg`, scale: String(lerp(1, 1.035, ramp(f, B.cold, scene("rule").duration, (x) => x))) }}>
        {leadOut < 1 ? (
          <div style={{ position: "absolute", top: 600, left: 0, right: 0, opacity: 1 - leadOut, scale: String(lerp(1, 0.7, leadOut)) }}>
            <Slam at={0} from={1.6}>
              <div style={{ ...H, fontSize: 124 }}>{TEXT.ruleLead}</div>
            </Slam>
            <div style={{ display: "flex", justifyContent: "center", marginTop: 20 }}>
              <Flip at={B.flip}>
                <div style={{ ...H, fontSize: 230 }}>
                  <Marker at={-10} color={COLORS.red}>
                    {TEXT.ruleFlip}
                  </Marker>
                </div>
              </Flip>
            </div>
          </div>
        ) : null}

        <RuleCard
          f={f}
          at={B.cold}
          top={236}
          from={-1}
          color={COLORS.cold}
          icons={
            <>
              <SnowIcon size={56} stroke={8} />
              <DropIcon size={56} stroke={8} />
            </>
          }
          title={TEXT.ruleColdTitle}
          led={0}
          action={TEXT.ruleColdDo}
          state="APAGADA"
          why={TEXT.ruleColdWhy}
          stampAt={B.cold + 16}
        />
        <RuleCard
          f={f}
          at={B.hot}
          top={760}
          from={1}
          color={COLORS.hot}
          icons={<SunIcon size={60} stroke={8} />}
          title={TEXT.ruleHotTitle}
          led={1}
          action={TEXT.ruleHotDo}
          state="PRENDIDA"
          why={TEXT.ruleHotWhy}
          stampAt={B.hot + 26}
        />

        <div style={{ position: "absolute", top: 1290, left: 90, right: 90, display: "flex", flexDirection: "column", gap: 14 }}>
          {[TEXT.ruleNote1, TEXT.ruleNote2].map((n, i) => (
            <Pop key={n} at={B.notes + i * 12} from={0.9} dy={16}>
              <div style={{ display: "flex", alignItems: "center", gap: 16, fontFamily: FONT_UI, fontWeight: 600, fontSize: 33, color: COLORS.white }}>
                <span style={{ width: 14, height: 14, borderRadius: 7, background: COLORS.hot, flexShrink: 0 }} />
                {n}
              </div>
            </Pop>
          ))}
        </div>
        {f >= B.save ? (
          <div style={{ position: "absolute", top: 1420, left: 0, right: 0, display: "flex", justifyContent: "center" }}>
            <Pop at={B.save}>
              <Chip color={COLORS.led} solid icon={<BookmarkIcon size={40} stroke={9} />} size={36}>
                {TEXT.ruleSave}
              </Chip>
            </Pop>
          </div>
        ) : null}
      </AbsoluteFill>
      <Flash at={B.hit} max={0.4} />
      <Grade />
    </AbsoluteFill>
  );
};

const RuleCard: React.FC<{
  f: number;
  at: number;
  top: number;
  from: number;
  color: string;
  icons: React.ReactNode;
  title: string;
  led: number;
  action: string;
  state: string;
  why: string;
  stampAt: number;
}> = ({ f, at, top, from, color, icons, title, led, action, state, why, stampAt }) => {
  const st = pop(f, stampAt, 9, 220);
  const p = pop(f, at, 13, 170);
  if (f < at) return null;
  return (
    <div
      style={{
        position: "absolute",
        top,
        left: 60,
        right: 60,
        height: 470,
        borderRadius: 40,
        padding: "34px 44px",
        background: `linear-gradient(160deg, ${color}26 0%, rgba(6,9,15,0.9) 60%)`,
        border: `4px solid ${color}`,
        boxShadow: `0 30px 80px rgba(0,0,0,0.5), 0 0 60px ${color}33`,
        translate: `${lerp(from * 1100, 0, p)}px 0px`,
        rotate: `${lerp(from * 6, 0, p)}deg`,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 18, color }}>
        {icons}
        <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 800, fontSize: 88, color, lineHeight: 1 }}>{title}</div>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 40, marginTop: 30 }}>
        <HvacButton size={190} led={led > 0 ? 0.75 + 0.25 * Math.sin(f / 4) : 0} icon={<RecircIcon size={118} stroke={6} />} />
        <div>
          <div style={{ fontFamily: FONT_UI, fontWeight: 700, fontSize: 32, letterSpacing: 4, color: COLORS.dim }}>RECIRCULACIÓN {state}</div>
          <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 800, fontSize: 96, color: COLORS.white, lineHeight: 1, marginTop: 6, textTransform: "uppercase" }}>{action}</div>
        </div>
      </div>
      <div style={{ marginTop: 26, fontFamily: FONT_UI, fontWeight: 600, fontSize: 34, color: COLORS.white, opacity: 0.85 }}>{why}</div>
      {f >= stampAt ? (
        <div
          style={{
            position: "absolute",
            top: 30,
            right: 34,
            width: 96,
            height: 96,
            borderRadius: 48,
            background: COLORS.green,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: `0 0 40px ${COLORS.green}aa`,
            scale: String(lerp(2.2, 1, st)),
            opacity: Math.min(1, st * 3),
            rotate: `${lerp(-30, 0, st)}deg`,
          }}
        >
          <CheckIcon size={60} stroke={15} color={COLORS.ink} />
        </div>
      ) : null}
    </div>
  );
};
