#!/usr/bin/env python3
"""
Control de calidad del MP4 final.
Uso: python3 scripts/qa.py out/MOKTA_BotonRecirculacion_v1.mp4
 - formato (ffprobe), sonoridad (ebur128), fotogramas negros
 - sincronía: en cada corte de escena compara el salto de imagen con el ataque del audio (golpe/whoosh)
"""
import json
import subprocess
import sys

import numpy as np

vid = sys.argv[1]
T = json.load(open("src/timeline.json"))
FPS = T["fps"]


def run(cmd):
    return subprocess.run(cmd, capture_output=True, text=True)


p = json.loads(run(["ffprobe", "-v", "error", "-show_streams", "-show_format", "-of", "json", vid]).stdout)
for s in p["streams"]:
    if s["codec_type"] == "video":
        print(f"video  {s['width']}x{s['height']} {s['codec_name']} {s.get('profile')} {s['pix_fmt']} {s.get('color_range')}/{s.get('color_space')} fps={s['r_frame_rate']} frames={s.get('nb_frames')} dur={float(s['duration']):.3f}s")
    else:
        print(f"audio  {s['codec_name']} {s['sample_rate']} Hz ch={s['channels']} {int(s.get('bit_rate', 0)) // 1000} kbps dur={float(s['duration']):.3f}s")
print(f"tamaño {int(p['format']['size']) / 1e6:.1f} MB")

e = run(["ffmpeg", "-hide_banner", "-i", vid, "-af", "ebur128=peak=true", "-f", "null", "-"]).stderr
summ = e[e.rfind("Summary:"):]
I = [l.strip() for l in summ.splitlines() if l.strip().startswith(("I:", "Peak:"))]
print("sonoridad", " · ".join(I))

b = run(["ffmpeg", "-hide_banner", "-i", vid, "-vf", "blackdetect=d=0.03:pix_th=0.06", "-an", "-f", "null", "-"]).stderr
print("negros:", "ninguno" if "black_start" not in b else [l for l in b.splitlines() if "black_start" in l])

# --- sincronía en los cortes
W, H = 108, 192
fr = np.frombuffer(subprocess.run(["ffmpeg", "-v", "error", "-i", vid, "-vf", f"scale={W}:{H}", "-f", "rawvideo", "-pix_fmt", "gray", "-"], capture_output=True).stdout, np.uint8).reshape(-1, H, W).astype(float)
diff = np.r_[0, np.abs(np.diff(fr, axis=0)).mean(axis=(1, 2))]
SR = 48000
au = np.frombuffer(subprocess.run(["ffmpeg", "-v", "error", "-i", vid, "-ac", "1", "-ar", str(SR), "-f", "s16le", "-"], capture_output=True).stdout, np.int16).astype(float) / 32768
hop = SR // 1000  # envolvente cada 1 ms
env = np.sqrt(np.convolve(au**2, np.ones(hop * 5) / (hop * 5), "same"))[::hop]

print("\ncorte  fotograma  salto_img(máx ±2)  ataque_audio(ms vs corte)")
f0 = 0
for s in T["scenes"]:
    if f0 > 0:
        win = diff[f0 - 2 : f0 + 3]
        k = int(np.argmax(win)) - 2
        t_ms = f0 * 1000 / FPS
        seg = env[int(t_ms) - 120 : int(t_ms) + 200]
        d = np.diff(seg)
        a = int(np.argmax(d)) - 120
        print(f"{s['id']:7s} {f0:6d}   {diff[f0]:6.1f} (pico en {k:+d})   {a:+5d} ms")
    f0 += s["duration"]
print(f"\nfotogramas: {len(fr)} (esperados {f0})")
