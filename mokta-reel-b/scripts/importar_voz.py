#!/usr/bin/env python3
"""
Importa una locución completa (una sola toma con pausas largas entre frases, en el orden de guion.json)
y la separa en public/audio/voz/<ID>.wav, que plan_guion.py usa en lugar de la voz guía.

  python3 scripts/importar_voz.py locucion.mp3 [tempo]

tempo (opcional, por defecto 1.0): acelera la locución sin cambiar el tono (ffmpeg atempo).

Corta en los N−1 silencios más largos (N = número de frases del guion) y compara cada trozo con la
duración de la voz guía para detectar un corte equivocado.
"""
import json
import os
import subprocess
import sys

import numpy as np
from scipy.io import wavfile

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
G = json.load(open(os.path.join(ROOT, "src", "reel", "guion.json")))
SR = 48000
ids = [ln["id"] for ln in G["hook"]["lines"]]
for r in G["rounds"]:
    ids += [ln["id"] for ln in r["intro"]] + [ln["id"] for ln in r["result"]]
ids += [ln["id"] for ln in G["reveal"]["lines"]] + [ln["id"] for ln in G["cta"]["lines"]]

src = sys.argv[1]
tempo = float(sys.argv[2]) if len(sys.argv) > 2 else 1.0
raw = subprocess.run(["ffmpeg", "-v", "error", "-i", src, "-af", f"atempo={tempo}", "-ac", "1", "-ar", str(SR), "-f", "s16le", "-"],
                     capture_output=True, check=True).stdout
x = np.frombuffer(raw, np.int16).astype(np.float64) / 32768.0

hop = int(0.01 * SR)
env = np.array([np.sqrt(np.mean(x[i:i + hop] ** 2)) for i in range(0, len(x) - hop, hop)])
thr = max(0.006, np.percentile(env, 30) * 1.5)
quiet = env < thr
runs, i = [], 0
while i < len(quiet):
    if quiet[i]:
        j = i
        while j < len(quiet) and quiet[j]:
            j += 1
        if i > 0 and j < len(quiet):  # solo silencios internos
            runs.append((j - i, i, j))
        i = j
    else:
        i += 1
need = len(ids) - 1
runs.sort(reverse=True)
if len(runs) < need:
    sys.exit(f"Solo encontré {len(runs)} pausas y necesito {need}")
cuts = sorted(runs[:need], key=lambda r: r[1])
print(f"pausa más corta usada: {cuts and min(c[0] for c in cuts) * 10} ms · siguiente candidata: {runs[need][0] * 10 if len(runs) > need else '—'} ms")

bounds = [0] + [(a + b) // 2 for _, a, b in cuts] + [len(env)]
os.makedirs(os.path.join(ROOT, "public", "audio", "voz"), exist_ok=True)
guide = {}
for ln_id in ids:
    gp = os.path.join(ROOT, "public", "audio", "voz_guia", f"{ln_id}.wav")
    if os.path.exists(gp):
        sr, g = wavfile.read(gp)
        guide[ln_id] = len(g) / sr
rows = []
for k, ln_id in enumerate(ids):
    seg = x[bounds[k] * hop: bounds[k + 1] * hop]
    e = np.abs(seg) > thr * 2
    nz = np.nonzero(e)[0]
    seg = seg[max(0, nz[0] - int(0.06 * SR)): nz[-1] + int(0.08 * SR)] if len(nz) else seg
    wavfile.write(os.path.join(ROOT, "public", "audio", "voz", f"{ln_id}.wav"), SR, (seg * 32767).astype(np.int16))
    d = len(seg) / SR
    ratio = d / guide[ln_id] if ln_id in guide else float("nan")
    rows.append((ln_id, d, ratio))
for ln_id, d, ratio in rows:
    flag = "  ← revisar" if not (0.55 < ratio < 1.8) else ""
    print(f"{ln_id:4s} {d:5.2f} s  (×{ratio:.2f} de la voz guía){flag}")
