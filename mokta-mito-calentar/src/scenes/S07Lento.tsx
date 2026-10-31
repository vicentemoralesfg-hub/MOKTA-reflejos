import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { C, FONT_UI } from "../config";
import { Big, Foot, Marker, Reveal } from "../components/Text";
import { EASE_IN_OUT, map, ramp } from "../lib/anim";
import { cue } from "../timeline";

const W = 900;
const H = 760;
const X0 = 80;
const X1 = 860;
const Y_COLD = 520;
const Y_NORMAL = 130;
/** Fracción del eje de tiempo en que cada curva llega a la temperatura normal (ilustrativo, sin escala). */
const FAST_END = 0.36;
const SLOW_END = 0.96;

const xAt = (u: number) => X0 + (X1 - X0) * u;
/** Curva de calentamiento: sube rápido al principio y llega justo a la línea normal en `uEnd`. */
const curve = (uEnd: number, upToX: number) => {
  const pts: string[] = [];
  for (let x = X0; x <= upToX; x += 5) {
    const u = (x - X0) / (X1 - X0);
    const k = Math.min(1, u / uEnd);
    const y = Y_COLD - (Y_COLD - Y_NORMAL) * (1 - Math.pow(1 - k, 2.3));
    pts.push(`${x},${y.toFixed(1)}`);
  }
  return pts.join(" ");
};

export const S07Lento: React.FC = () => {
  const f = useCurrentFrame();
  const tCal = cue("lento", "calienta", 23);
  const tLent = cue("lento", "lentisimo", 35);
  const tDesg = cue("lento", "desgaste", 62);
  const tMucho = cue("lento", "mucho", 84);
  const swap = tDesg - 8;
  const pFast = map(f, [4, tCal + 2], [X0, X1], EASE_IN_OUT);
  const pSlow = map(f, [4, tLent + 28], [X0, X1], EASE_IN_OUT);
  const bars = ramp(f, tDesg - 4, tDesg + 12);
  const big = ramp(f, tMucho - 4, tMucho + 6);
  return (
    <AbsoluteFill style={{ background: "radial-gradient(ellipse 85% 60% at 50% 58%, #10203A 0%, #070C17 60%, #03050A 100%)" }}>
      <AbsoluteFill style={{ alignItems: "center", top: 300 }}>
        <Reveal at={2} out={swap} from="up">
          <Big size={96} color={C.dim}>
            Detenido se calienta
          </Big>
        </Reveal>
        <Reveal at={tLent - 5} out={swap} from="slam" dur={6} style={{ marginTop: 8 }}>
          <Big size={170}>
            <Marker at={tLent - 1} color={C.frost}>
              lentísimo
            </Marker>
          </Big>
        </Reveal>
      </AbsoluteFill>
      <AbsoluteFill style={{ alignItems: "center", top: 300 }}>
        <Reveal at={swap + 6} from="up">
          <Big size={110}>Más tiempo</Big>
        </Reveal>
        <Reveal at={tDesg - 2} from="slam" dur={6} style={{ marginTop: 8 }}>
          <Big size={150}>
            <Marker at={tDesg + 2} color={C.red} ink={C.white}>
              desgastándose
            </Marker>
          </Big>
        </Reveal>
      </AbsoluteFill>

      <div style={{ position: "absolute", left: (1080 - W) / 2 - 20, top: 680, opacity: ramp(f, 0, 8) }}>
        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ overflow: "visible" }}>
          <rect x={X0} y={Y_NORMAL} width={X1 - X0} height={Y_COLD - Y_NORMAL + 20} fill="rgba(67,198,255,0.05)" />
          <line x1={X0} y1={Y_COLD + 20} x2={X1 + 10} y2={Y_COLD + 20} stroke="rgba(244,246,248,0.35)" strokeWidth={3} />
          <line x1={X0} y1={60} x2={X0} y2={Y_COLD + 20} stroke="rgba(244,246,248,0.35)" strokeWidth={3} />
          <text x={X1 + 10} y={Y_COLD + 58} textAnchor="end" fontFamily={FONT_UI} fontWeight={600} fontSize={28} fill={C.dim}>
            tiempo →
          </text>
          <text
            x={X0 - 18}
            y={Y_COLD}
            textAnchor="start"
            fontFamily={FONT_UI}
            fontWeight={600}
            fontSize={28}
            fill={C.dim}
            transform={`rotate(-90 ${X0 - 18} ${Y_COLD})`}
          >
            temperatura →
          </text>
          <line x1={X0} y1={Y_NORMAL} x2={X1} y2={Y_NORMAL} stroke={C.green} strokeOpacity={0.6} strokeWidth={3} strokeDasharray="14 12" />
          <text x={X1} y={Y_NORMAL - 18} textAnchor="end" fontFamily={FONT_UI} fontWeight={700} fontSize={26} letterSpacing={2} fill={C.green} opacity={0.8}>
            TEMPERATURA NORMAL
          </text>
          <polyline points={curve(SLOW_END, pSlow)} fill="none" stroke={C.red} strokeWidth={10} strokeLinecap="round" strokeLinejoin="round" />
          <polyline points={curve(FAST_END, pFast)} fill="none" stroke={C.green} strokeWidth={10} strokeLinecap="round" strokeLinejoin="round" />
          <text x={X0 + 12} y={Y_NORMAL - 18} fontFamily={FONT_UI} fontWeight={800} fontSize={32} fill={C.green} opacity={ramp(f, 8, 16)}>
            ANDANDO SUAVE
          </text>
          <text x={xAt(0.4)} y={Y_COLD - 110} fontFamily={FONT_UI} fontWeight={800} fontSize={32} fill={C.red} opacity={ramp(f, 14, 22)}>
            DETENIDO (RALENTÍ)
          </text>
          {/* tiempo en frío = tiempo de desgaste */}
          <g opacity={bars}>
            <text x={X0} y={Y_COLD + 110} fontFamily={FONT_UI} fontWeight={700} fontSize={28} fill={C.dim}>
              tiempo en frío
            </text>
            <rect x={X0} y={Y_COLD + 130} width={(xAt(FAST_END) - X0) * bars} height={26} rx={13} fill={C.green} />
            <rect x={X0} y={Y_COLD + 170} width={(xAt(SLOW_END) - X0) * bars} height={26} rx={13} fill={C.red} />
          </g>
          <g opacity={big} transform={`translate(${xAt(SLOW_END)} ${Y_COLD + 244}) scale(${0.7 + 0.3 * big})`}>
            <text x={0} y={0} textAnchor="end" fontFamily={FONT_UI} fontWeight={900} fontSize={46} fill={C.red}>
              + DESGASTE
            </text>
          </g>
        </svg>
      </div>
      <Foot at={10} top={1478}>
        Curvas ilustrativas
      </Foot>
    </AbsoluteFill>
  );
};
