import React from "react";
import { AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame } from "remotion";
import { Audio } from "@remotion/media";
import { C, DISPLAY, UI } from "../brand";
import { BACK_OUT, EASE_IN_OUT, EASE_OUT, ramp } from "../lib/anim";
import { Captions } from "./comp/Captions";
import { Gallop, Herd } from "./comp/Gallop";
import { Photo } from "./comp/Photo";
import { VO, seg, total, wordAt } from "./lib/vo";
import voJson from "../vo/caballos.json";
import { FOTOS } from "./fotos";

/**
 * Reel · "Un caballo de verdad tiene casi 15 caballos de fuerza"
 * Material de archivo real: Muybridge 1878 (galope), grabado de la máquina de Watt (1782), retrato de Watt.
 */
export const HP_VO = voJson as VO;
const vo = HP_VO;
const CX = 500;
const SEPIA_BG = "#0B0907";

const Y: React.FC<{ children: React.ReactNode; c?: string }> = ({ children, c = C.yellow }) => <span style={{ color: c }}>{children}</span>;

const Grain: React.FC<{ f: number; o?: number }> = ({ f, o = 0.08 }) => (
  <AbsoluteFill
    style={{
      opacity: o,
      backgroundImage: "radial-gradient(rgba(255,255,255,0.5) 1px, transparent 1.2px)",
      backgroundSize: `${3 + (f % 3)}px ${3 + ((f + 1) % 3)}px`,
      mixBlendMode: "overlay",
    }}
  />
);

const Bar: React.FC<{ label: string; value: number; max: number; p: number; color?: string; unit?: string; sub?: string }> = ({ label, value, max, p, color = C.white, unit = "HP", sub }) => (
  <div style={{ marginBottom: 26, opacity: Math.min(1, p * 2) }}>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", fontFamily: UI, fontWeight: 700, fontSize: 34, color: C.white, marginBottom: 8 }}>
      <span>{label}</span>
      <span style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: 56, color }}>
        {(value * p).toFixed(Number.isInteger(value) && value >= 10 ? 0 : 1).replace(".", ",")} {unit}
      </span>
    </div>
    <div style={{ height: 30, borderRadius: 15, background: "rgba(244,246,248,0.08)", overflow: "hidden" }}>
      <div style={{ height: "100%", width: `${(value / max) * 100 * p}%`, borderRadius: 15, background: color }} />
    </div>
    {sub ? <div style={{ fontFamily: UI, fontWeight: 500, fontSize: 24, color: C.faint, marginTop: 6 }}>{sub}</div> : null}
  </div>
);

export const Caballos: React.FC<{ withAudio?: boolean }> = ({ withAudio = true }) => {
  const f = useCurrentFrame();
  const S = Object.fromEntries(vo.segments.map((s) => [s.id, seg(vo, s.id)]));
  // cada escena entra con fundido cruzado sobre la anterior (sin fotogramas vacíos)
  const inS = (id: string, next: string) => f >= S[id].f0 - 8 && f < S[next].f0;
  const fade = (id: string) => ramp(f, S[id].f0 - 8, S[id].f0 - 1);

  return (
    <AbsoluteFill style={{ background: SEPIA_BG, overflow: "hidden" }}>
      {/* ============ GANCHO: el caballo real ============ */}
      {f < S.why.f0 ? (
        <AbsoluteFill>
          <div style={{ position: "absolute", left: -260, top: 470, scale: "1" }}>
            <Gallop f={f} w={1600} />
          </div>
          <AbsoluteFill style={{ background: "linear-gradient(180deg, #0B0907 0%, #0B0907 23%, rgba(11,9,7,0) 30%, rgba(11,9,7,0) 66%, #0B0907 76%)" }} />
          <div style={{ position: "absolute", top: 250, left: 50, width: CX * 2 - 100, textAlign: "center" }}>
            <div style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: 86, lineHeight: 0.95, color: C.white }}>UN CABALLO DE VERDAD TIENE</div>
            <div style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: 190, lineHeight: 0.9, color: C.yellow, scale: String(interpolate(ramp(f, 0, 10, BACK_OUT), [0, 1], [1.12, 1])) }}>≈15 HP</div>
          </div>
          <div style={{ position: "absolute", top: 1200, left: 0, width: CX * 2, textAlign: "center", fontFamily: UI, fontWeight: 500, fontSize: 24, color: C.faint }}>
            Eadweard Muybridge, 1878 · potencia máxima medida: Stevenson y Wassersug, Nature (1993)
          </div>
        </AbsoluteFill>
      ) : null}

      {/* ============ ¿POR QUÉ? ============ */}
      {inS("why", "watt") ? (
        <AbsoluteFill style={{ opacity: fade("why") }}>
          <div style={{ position: "absolute", left: 90, top: 760, opacity: 0.35 }}>
            <Herd f={f} n={6} cols={3} w={820} />
          </div>
          <div style={{ position: "absolute", top: 300, left: 50, width: CX * 2 - 100, textAlign: "center", fontFamily: DISPLAY, fontWeight: 800, lineHeight: 0.92 }}>
            <div style={{ fontSize: 150, color: C.white }}>100 HP</div>
            <div style={{ fontSize: 120, color: C.red, opacity: ramp(f, wordAt(vo, "why", "tira") - 4, wordAt(vo, "why", "tira") + 4) }}>≠</div>
            <div style={{ fontSize: 110, color: C.white, opacity: ramp(f, wordAt(vo, "why", "como") - 2, wordAt(vo, "why", "como") + 6) }}>100 CABALLOS</div>
          </div>
        </AbsoluteFill>
      ) : null}

      {/* ============ JAMES WATT ============ */}
      {inS("watt", "peak") ? (
        <AbsoluteFill style={{ opacity: fade("watt") }}>
          <Photo src={FOTOS.watt as string} f={f - S.watt.f0} dur={S.peak.f0 - S.watt.f0} dim={0.55} from={{ s: 1.2, x: 60, y: 120 }} to={{ s: 1.4, x: 20, y: 80 }} grade="sepia(0.5) contrast(1.1)" />
          <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(11,9,7,0.85) 0%, rgba(11,9,7,0.2) 35%, rgba(11,9,7,0.2) 60%, rgba(11,9,7,0.9) 100%)" }} />
          <div style={{ position: "absolute", top: 250, left: 70, display: "flex", gap: 28, alignItems: "center", opacity: ramp(f, S.watt.f0, S.watt.f0 + 8) }}>
            <div style={{ width: 210, height: 260, borderRadius: 18, overflow: "hidden", border: "3px solid rgba(244,246,248,0.25)" }}>
              <Img src={staticFile("fotos/james_watt.jpg")} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "75% 20%", filter: "contrast(1.05)" }} />
            </div>
            <div>
              <div style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: 92, lineHeight: 0.95, color: C.white }}>JAMES WATT</div>
              <div style={{ fontFamily: UI, fontWeight: 600, fontSize: 34, color: C.dim }}>inventor escocés · 1736–1819</div>
            </div>
          </div>
          <div style={{ position: "absolute", top: 860, left: 70, width: CX * 2 - 140, textAlign: "center", opacity: ramp(f, wordAt(vo, "watt", "eso") - 6, wordAt(vo, "watt", "eso") + 4) }}>
            <div style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: 84, lineHeight: 0.95, color: C.yellow }}>1 HP = UN CABALLO DE MOLINO, TODO EL DÍA</div>
            <div style={{ fontFamily: UI, fontWeight: 700, fontSize: 36, color: C.white, marginTop: 14 }}>= 745,7 watts</div>
          </div>
        </AbsoluteFill>
      ) : null}

      {/* ============ TIRÓN vs JORNADA + BOLT ============ */}
      {inS("peak", "hilux") ? (
        <AbsoluteFill style={{ opacity: fade("peak") }}>
          <div style={{ position: "absolute", left: 90, top: 250, width: 820 }}>
            <Gallop f={f} w={820} style={{ borderRadius: 18 }} />
          </div>
          <div style={{ position: "absolute", left: 90, top: 790, width: 820 }}>
            <Bar label="Caballo, todo el día" value={1} max={15} p={ramp(f, S.peak.f0, S.peak.f0 + 16, EASE_OUT)} />
            <Bar label="Caballo, en un tirón" value={14.9} max={15} p={ramp(f, wordAt(vo, "peak", ["quince", "15"]) - 8, wordAt(vo, "peak", ["quince", "15"]) + 12, EASE_OUT)} color={C.yellow} />
            <Bar label="Usain Bolt (récord 2009)" value={3.5} max={15} p={ramp(f, S.bolt.f0, S.bolt.f0 + 18, EASE_OUT)} color={C.blue} sub={f >= S.bolt.f0 ? "pico calculado: 2.619 W · Gómez et al., Eur. J. Phys. (2013)" : undefined} />
          </div>
        </AbsoluteFill>
      ) : null}

      {/* ============ HILUX ============ */}
      {inS("hilux", "chiron") ? (
        <AbsoluteFill style={{ opacity: fade("hilux") }}>
          <div style={{ position: "absolute", top: 250, left: 60, width: CX * 2 - 120, textAlign: "center" }}>
            <div style={{ fontFamily: UI, fontWeight: 700, fontSize: 32, letterSpacing: 6, color: C.dim }}>TOYOTA HILUX 2.8 · 204 CV</div>
            <div style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: 110, lineHeight: 0.95, color: C.white }}>
              = <Y>14</Y> CABALLOS
            </div>
            <div style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: 58, color: C.white, opacity: 0.85 }}>REALES A TODO GALOPE</div>
          </div>
          <div style={{ position: "absolute", top: 560, left: 90 }}>
            <Herd f={f} n={14} cols={4} w={820} reveal={ramp(f, wordAt(vo, "hilux", "equivale") - 4, wordAt(vo, "hilux", ["catorce", "14"]) + 6)} />
          </div>
        </AbsoluteFill>
      ) : null}

      {/* ============ BUGATTI CHIRON ============ */}
      {inS("chiron", "cta") ? (
        <AbsoluteFill style={{ opacity: fade("chiron") }}>
          <div style={{ position: "absolute", top: 250, left: 60, width: CX * 2 - 120, textAlign: "center" }}>
            <div style={{ fontFamily: UI, fontWeight: 700, fontSize: 32, letterSpacing: 6, color: C.dim }}>BUGATTI CHIRON · 1.500 CV</div>
            <div style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: 110, lineHeight: 0.95, color: C.white }}>
              = <Y>100</Y> CABALLOS
            </div>
          </div>
          <div style={{ position: "absolute", top: 450, left: 70, scale: String(interpolate(ramp(f, S.chiron.f0, S.cta.f0, EASE_IN_OUT), [0, 1], [1.06, 1])) }}>
            <Herd f={f} n={100} cols={10} w={860} gap={4} reveal={ramp(f, wordAt(vo, "chiron", ["mil", "1"]) - 4, wordAt(vo, "chiron", "fondo") + 4)} />
          </div>
        </AbsoluteFill>
      ) : null}

      {/* ============ PREGUNTA ============ */}
      {f >= S.cta.f0 - 8 ? (
        <AbsoluteFill style={{ opacity: fade("cta") }}>
          <div style={{ position: "absolute", left: 90, top: 900, opacity: 0.25 }}>
            <Herd f={f} n={12} cols={4} w={820} />
          </div>
          <div style={{ position: "absolute", top: 300, left: 50, width: CX * 2 - 100, textAlign: "center", fontFamily: DISPLAY, fontWeight: 800, fontSize: 116, lineHeight: 0.92, color: C.white }}>
            ¿CUÁNTOS CABALLOS
            <br />
            TIENE <Y>TU AUTO?</Y>
          </div>
          <div style={{ position: "absolute", top: 590, left: CX - 400, width: 800, textAlign: "center", padding: "20px 16px", borderRadius: 22, background: C.yellow, color: C.ink, fontFamily: UI, fontWeight: 800, fontSize: 36, opacity: ramp(f, wordAt(vo, "cta", "comenta") - 4, wordAt(vo, "cta", "comenta") + 6) }}>
            Comenta y te decimos cuántos caballos reales son 👇
          </div>
          <div style={{ position: "absolute", top: 790, left: 0, width: CX * 2, textAlign: "center", fontFamily: DISPLAY, fontWeight: 700, fontSize: 44, letterSpacing: 20, color: "rgba(244,246,248,0.6)", opacity: ramp(f, S.cta.f0 + 20, S.cta.f0 + 32) }}>
            MOKTA
          </div>
        </AbsoluteFill>
      ) : null}

      <Grain f={f} o={0.06} />
      <Captions vo={vo} f={f} fix={{ watt: "Watt", hilux: "Hilux", chiron: "Chiron", bugatti: "Bugatti", usain: "Usain", bolt: "Bolt" }} hide={(x) => x < S.why.f0 - 2 || x >= S.cta.f0 - 4} />
      {withAudio ? <Audio src={staticFile("audio/v2-caballos.wav")} /> : null}
    </AbsoluteFill>
  );
};

export const HP_TOTAL = total(vo, 2.0);
