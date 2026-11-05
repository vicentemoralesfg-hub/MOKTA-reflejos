import React from "react";
import { AbsoluteFill } from "remotion";
import { CarState, localToWorld } from "../sim/car";
import { Pose, projector } from "../world/camera";
import { clamp01, rise } from "../tl";
import { COL } from "./style";
import { Tag } from "./Titles";

type P = { x: number; y: number };

const arrowHead = (a: P, b: P, size = 34) => {
  const ang = Math.atan2(b.y - a.y, b.x - a.x);
  const l = { x: b.x - Math.cos(ang - 0.45) * size, y: b.y - Math.sin(ang - 0.45) * size };
  const r = { x: b.x - Math.cos(ang + 0.45) * size, y: b.y - Math.sin(ang + 0.45) * size };
  return `M ${l.x} ${l.y} L ${b.x} ${b.y} L ${r.x} ${r.y}`;
};

const pathLen = (pts: P[]) => pts.reduce((acc, p, i) => (i ? acc + Math.hypot(p.x - pts[i - 1].x, p.y - pts[i - 1].y) : 0), 0);

/** Polilínea que se dibuja progresivamente (0..1) con punta de flecha. */
const Stroke: React.FC<{ pts: P[]; k: number; color: string; w?: number; head?: boolean }> = ({ pts, k, color, w = 12, head = true }) => {
  if (k <= 0 || pts.length < 2) return null;
  const L = pathLen(pts);
  const d = pts.map((p, i) => `${i ? "L" : "M"} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(" ");
  // punto final visible
  let acc = 0;
  let tip = pts[0];
  let prev = pts[0];
  for (let i = 1; i < pts.length; i++) {
    const seg = Math.hypot(pts[i].x - pts[i - 1].x, pts[i].y - pts[i - 1].y);
    if (acc + seg >= L * k) {
      const f = (L * k - acc) / Math.max(seg, 1e-6);
      prev = pts[i - 1];
      tip = { x: pts[i - 1].x + (pts[i].x - pts[i - 1].x) * f, y: pts[i - 1].y + (pts[i].y - pts[i - 1].y) * f };
      break;
    }
    acc += seg;
    prev = pts[i - 1];
    tip = pts[i];
  }
  return (
    <g style={{ filter: `drop-shadow(0 0 10px ${color}aa) drop-shadow(0 4px 10px rgba(0,0,0,0.6))` }}>
      <path d={d} fill="none" stroke={color} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round" strokeDasharray={`${L * k} ${L + 10}`} />
      {head ? <path d={arrowHead(prev, tip)} fill="none" stroke={color} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round" /> : null}
    </g>
  );
};

export type TeleCues = {
  ring?: number;
  drag?: number;
  pull?: number;
  brake?: number;
  weight?: number;
  spin?: number;
  lane?: number;
  laneColor?: string;
};

export const Tele: React.FC<{ T: number; pose: Pose; s: CarState; cues: TeleCues }> = ({ T, pose, s, cues }) => {
  const pr = projector(pose);
  const W = (lx: number, lz: number, y = 0.4) => {
    const [x, z] = localToWorld(s, lx, lz);
    return pr(x, y, z);
  };
  const els: React.ReactNode[] = [];
  const tags: React.ReactNode[] = [];

  if (cues.lane !== undefined && T >= cues.lane) {
    const k = rise(T, cues.lane, cues.lane + 0.5);
    const col = cues.laneColor ?? COL.green;
    for (const lx of [0.05, 3.45]) {
      const a = pr(lx, 0.02, s.z + 14);
      const b = pr(lx, 0.02, s.z - 60);
      els.push(
        <line key={`ln${lx}`} x1={a.x} y1={a.y} x2={a.x + (b.x - a.x) * k} y2={a.y + (b.y - a.y) * k} stroke={col} strokeWidth={10} opacity={0.85} style={{ filter: `drop-shadow(0 0 12px ${col})` }} />,
      );
    }
    const c = pr(1.75, 0.02, s.z - 8);
    tags.push(<Tag key="lt" x={c.x} y={c.y} text="TU CARRIL" color={col} o={k} anchor="c" size={40} />);
  }

  if (cues.ring !== undefined && T >= cues.ring) {
    const k = rise(T, cues.ring, cues.ring + 0.3);
    const c = W(0.82, -1.38, 0.3);
    const pulse = 1 + 0.08 * Math.sin((T - cues.ring) * 9);
    els.push(
      <g key="ring">
        <circle cx={c.x} cy={c.y} r={78 * pulse * (0.6 + 0.4 * k)} fill="rgba(255,59,48,0.18)" stroke={COL.red} strokeWidth={9} opacity={k} style={{ filter: "drop-shadow(0 0 14px rgba(255,59,48,0.9))" }} />
      </g>,
    );
    tags.push(<Tag key="rt" x={c.x + 100} y={c.y - 40} text="REVENTADA" color={COL.red} o={k} size={44} />);
  }

  if (cues.drag !== undefined && T >= cues.drag) {
    const k = rise(T, cues.drag, cues.drag + 0.45);
    const pts = [0, 0.25, 0.5, 0.75, 1].map((f) => W(1.25, -1.38 + f * 2.2, 0.3));
    els.push(<Stroke key="drag" pts={pts} k={k} color={COL.amber} />);
    const e = pts[pts.length - 1];
    tags.push(<Tag key="dt" x={e.x + 26} y={e.y + 10} text="SE ARRASTRA" color={COL.amber} o={clamp01(k * 1.5)} size={44} />);
  }

  if (cues.pull !== undefined && T >= cues.pull) {
    const k = rise(T, cues.pull, cues.pull + 0.5);
    const pts = Array.from({ length: 14 }, (_, i) => {
      const f = i / 13;
      return W(0.0 + f * f * 2.1, -2.5 - f * 2.5, 0.6);
    });
    els.push(<Stroke key="pull" pts={pts} k={k} color={COL.amber} w={14} />);
    const e = pts[pts.length - 1];
    tags.push(<Tag key="pt" x={e.x - 40} y={e.y + 4} text="TIRA HACIA ESE LADO" color={COL.amber} o={clamp01(k * 1.5)} anchor="r" size={42} />);
  }

  if (cues.brake !== undefined && T >= cues.brake) {
    const k = rise(T, cues.brake, cues.brake + 0.25);
    tags.push(<Tag key="bt" x={80} y={330} text="■ FRENO A FONDO" color={COL.red} o={k} size={50} />);
  }

  if (cues.weight !== undefined && T >= cues.weight) {
    const k = rise(T, cues.weight, cues.weight + 0.6);
    const a = W(0, 0.2, 0.9);
    const b = W(0, -1.9, 0.9);
    const p = { x: a.x + (b.x - a.x) * k, y: a.y + (b.y - a.y) * k };
    els.push(
      <g key="w">
        <line x1={a.x} y1={a.y} x2={p.x} y2={p.y} stroke="rgba(255,255,255,0.7)" strokeWidth={6} strokeDasharray="10 12" />
        <circle cx={p.x} cy={p.y} r={46} fill={COL.white} opacity={0.95} style={{ filter: "drop-shadow(0 0 16px rgba(255,255,255,0.8))" }} />
      </g>,
    );
    tags.push(<Tag key="wt" x={p.x - 70} y={p.y} text="PESO" color={COL.white} o={clamp01(k * 2)} anchor="r" size={44} />);
  }

  if (cues.spin !== undefined && T >= cues.spin) {
    const k = rise(T, cues.spin, cues.spin + 0.6);
    const R = 3.4;
    const pts = Array.from({ length: 28 }, (_, i) => {
      const a = -Math.PI * 0.95 + (i / 27) * Math.PI * 1.35;
      return pr(s.x + Math.cos(a) * R, 0.5, s.z + Math.sin(a) * R);
    });
    els.push(<Stroke key="spin" pts={pts} k={k} color={COL.red} w={15} />);
    const e = pts[pts.length - 1];
    tags.push(<Tag key="st" x={e.x + 20} y={e.y + 50} text="GIRA" color={COL.red} o={clamp01(k * 1.5)} size={56} />);
  }

  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
        {els}
      </svg>
      {tags}
    </AbsoluteFill>
  );
};
