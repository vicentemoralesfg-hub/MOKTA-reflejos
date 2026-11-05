#!/usr/bin/env python3
"""
Control de calidad sobre el MP4 final.
  - especificaciones (ffprobe), sonoridad (ebur128), fotogramas negros
  - sincronía del clic de la palanca: transitorio de audio vs. caída de brillo del espejo
Uso: python3 scripts/qa.py out/MOKTA_PalancaEspejo_v1.mp4
"""
import json
import os
import subprocess
import sys

import numpy as np

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
F = sys.argv[1] if len(sys.argv) > 1 else os.path.join(ROOT, "out", "MOKTA_PalancaEspejo_v1.mp4")
FPS = 30
W = json.load(open(os.path.join(ROOT, "src", "vo_words.json")))["words"]
we = lambda i: round(W[i]["end"] * FPS)


def run(cmd):
    return subprocess.run(cmd, capture_output=True, text=True).stdout + subprocess.run(cmd, capture_output=True, text=True).stderr


probe = json.loads(subprocess.run(["ffprobe", "-v", "error", "-show_streams", "-show_format", "-of", "json", F],
                                  capture_output=True, text=True).stdout)
v = [s for s in probe["streams"] if s["codec_type"] == "video"][0]
a = [s for s in probe["streams"] if s["codec_type"] == "audio"][0]
print(f"Video: {v['width']}x{v['height']} {v['codec_name']} {v['profile']} {v['pix_fmt']} {v['r_frame_rate']} fps, "
      f"{v.get('nb_frames')} fotogramas, {float(v['duration']):.3f} s")
print(f"Audio: {a['codec_name']} {a['sample_rate']} Hz {a['channels']} canales, {float(a['duration']):.3f} s")

ebu = subprocess.run(["ffmpeg", "-hide_banner", "-i", F, "-af", "ebur128=peak=true", "-f", "null", "-"],
                     capture_output=True, text=True).stderr
summ = ebu[ebu.rfind("Summary:"):]
for key in ("I:", "LRA:", "Peak:"):
    line = [l.strip() for l in summ.splitlines() if l.strip().startswith(key)]
    print("Sonoridad", line[0] if line else "?")

bd = subprocess.run(["ffmpeg", "-hide_banner", "-i", F, "-vf", "blackdetect=d=0.05:pix_th=0.06", "-an", "-f", "null", "-"],
                    capture_output=True, text=True).stderr
print("Tramos negros:", bd.count("black_start"))

# --- sincronía del clic: brillo del espejo (zona central) alrededor del clic
click = we(56) - 2
f0, f1 = click - 6, click + 12
raw = subprocess.run(["ffmpeg", "-v", "error", "-i", F, "-vf", f"select='between(n\\,{f0}\\,{f1})',crop=600:200:240:560,scale=60:20,format=gray",
                      "-vsync", "0", "-f", "rawvideo", "-"], capture_output=True).stdout
fr = np.frombuffer(raw, np.uint8).reshape(-1, 20, 60).mean(axis=(1, 2))
flash = int(np.argmax(np.diff(fr))) + f0 + 1  # destello del clic (subida brusca)
print("Brillo del espejo alrededor del clic:", " ".join(f"{x:.0f}" for x in fr))

# transitorio del clic en la pista de efectos (la mezcla tiene la voz encima)
from scipy.io import wavfile
sr, sfx = wavfile.read(os.path.join(ROOT, "public", "audio", "stems", "efectos.wav"))
sfx = np.abs(sfx.astype(float).mean(axis=1))
a0, a1 = int((click / FPS - 0.15) * sr), int((click / FPS + 0.2) * sr)
seg = sfx[a0:a1]
t_click = (a0 + int(np.argmax(seg > 0.3 * seg.max()))) / sr
print(f"Clic de audio: {t_click:.3f} s · destello del clic: fotograma {flash} ({flash / FPS:.3f} s) · "
      f"diferencia {1000 * (t_click - flash / FPS):+.0f} ms")
