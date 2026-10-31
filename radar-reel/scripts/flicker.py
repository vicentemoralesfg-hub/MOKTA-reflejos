#!/usr/bin/env python3
"""Detecta parpadeos: saltos de imagen entre fotogramas consecutivos que no coinciden con un corte de plano."""
import json, math, os, subprocess, sys
import numpy as np
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
src = sys.argv[1]
cues = json.load(open(os.path.join(ROOT, "src/data/cues.json")))
W = json.load(open(os.path.join(ROOT, "src/data/words.json")))["words"]
def ss(word):
    if word == 0: return 0
    f = math.floor((W[word]["start"] - 0.12) * 30 + 0.5); return max(f, math.floor(W[word - 1]["end"] * 30 + 0.5))
cuts = {ss(s["word"]): s["id"] for s in cues["shots"]}
raw = subprocess.run(["ffmpeg", "-v", "error", "-i", src, "-vf", "scale=135:240,format=gray", "-f", "rawvideo", "-"], capture_output=True).stdout
fr = np.frombuffer(raw, np.uint8).reshape(-1, 240, 135).astype(float)
d = np.abs(np.diff(fr, axis=0)).mean(axis=(1, 2))  # d[i] = salto entre i e i+1
bad = []
for i in range(1, len(d) - 1):
    if (i + 1) in cuts:  # salto hacia el primer fotograma de un plano: es un corte
        continue
    local = np.median(d[max(0, i - 4): i + 5])
    # un parpadeo: salto grande respecto del movimiento normal, que además "rebota"
    if d[i] > max(4.0, 2.5 * local):
        bad.append((i, round(d[i], 1), round(local, 1)))
print(f"fotogramas: {len(fr)} · saltos sospechosos fuera de cortes: {len(bad)}")
for b in bad[:40]:
    shot = max(k for k in cuts if k <= b[0])
    print(f"  {b[0]}→{b[0]+1}  salto={b[1]} (normal≈{b[2]})  plano={cuts[shot]}")
