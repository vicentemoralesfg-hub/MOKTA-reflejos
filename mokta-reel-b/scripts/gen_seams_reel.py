#!/usr/bin/env python3
"""Juntas del asfalto para las tres rondas (s en metros). Las comparten shader, cámara y audio.
Ninguna junta se pisa a menos de 0,35 s de la aparición de la barrera."""
import json, os, random, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from reel_timing import ROOT, T, FPS, s_at, round_frames

FRONT = 1.0
out = {}
for i, r in enumerate(T["rounds"]):
    rnd = random.Random(11 + i)
    fr = round_frames(i)
    s_event_front = s_at(i, fr["event"]) + FRONT
    v = r["speedKmh"] / 3.6
    seams, s = [], r["startS"] - 60.0
    while s < r["startS"] + 900:
        s += rnd.uniform(16, 52) * (v / 33.3) ** 0.3
        if abs(s - s_event_front) < 0.35 * v or abs(s - (s_event_front - 2.7)) < 0.35 * v:
            continue
        seams.append(round(s, 2))
    out[r["id"]] = seams
json.dump(out, open(os.path.join(ROOT, "src", "reel", "seams.json"), "w"))
print({k: len(v) for k, v in out.items()})
