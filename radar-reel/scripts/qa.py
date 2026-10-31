#!/usr/bin/env python3
"""
Control de calidad sobre un MP4 final.
Uso: python3 scripts/qa.py out/CuandoTeMidieron_con_subtitulos.mp4 [etiqueta]

- Especificaciones (ffprobe), sonoridad (EBU R128), fotogramas negros.
- Hojas de contacto: primer/último fotograma, primer fotograma de cada plano y los reveals.
- Sincronía: compara el ataque de cada golpe en el audio con la palabra a la que está anclado.
"""
import json
import os
import subprocess
import sys

import numpy as np

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CUES = json.load(open(os.path.join(ROOT, "src/data/cues.json")))
WD = json.load(open(os.path.join(ROOT, "src/data/words.json")))
W = WD["words"]
FPS = CUES["fps"]
src = sys.argv[1]
tag = sys.argv[2] if len(sys.argv) > 2 else "qa"
out = os.path.join(ROOT, "out/qa")
os.makedirs(out, exist_ok=True)


def run(cmd):
    return subprocess.run(cmd, capture_output=True, text=True).stdout + subprocess.run(cmd, capture_output=True, text=True).stderr


def shot_start(word):
    if word == 0:
        return 0
    f = round((W[word]["start"] - 0.12) * FPS)
    return max(f, round(W[word - 1]["end"] * FPS))


# ---------------------------------------------------------------- specs
probe = json.loads(subprocess.run(["ffprobe", "-v", "error", "-show_streams", "-show_format", "-of", "json", src],
                                  capture_output=True, text=True).stdout)
v = next(s for s in probe["streams"] if s["codec_type"] == "video")
a = next(s for s in probe["streams"] if s["codec_type"] == "audio")
print(f"video: {v['codec_name']} {v.get('profile')} {v['width']}x{v['height']} {v['r_frame_rate']} {v['pix_fmt']} "
      f"{v.get('color_space')}/{v.get('color_transfer')}/{v.get('color_primaries')} frames={v.get('nb_frames')} dur={v.get('duration')}")
print(f"audio: {a['codec_name']} {a['sample_rate']} Hz ch={a['channels']} {int(a.get('bit_rate', 0)) // 1000} kbps dur={a.get('duration')}")
print(f"esperado: {WD['durationInFrames']} fotogramas = {WD['durationInFrames'] / FPS:.3f} s")

loud = subprocess.run(["ffmpeg", "-hide_banner", "-i", src, "-af", "ebur128=peak=true", "-f", "null", "-"],
                      capture_output=True, text=True).stderr
summ = loud[loud.rfind("Summary:"):]
for key in ["I:", "LRA:", "Peak:"]:
    for line in summ.splitlines():
        if line.strip().startswith(key):
            print("sonoridad", line.strip())
            break

black = subprocess.run(["ffmpeg", "-hide_banner", "-i", src, "-vf", "blackdetect=d=0.05:pix_th=0.06", "-an", "-f", "null", "-"],
                       capture_output=True, text=True).stderr
bl = [l for l in black.splitlines() if "black_start" in l]
print(f"fotogramas negros: {len(bl)} tramos", *bl, sep="\n  ")

# ---------------------------------------------------------------- ritmo
cuts = [shot_start(s["word"]) for s in CUES["shots"]]
lens = [(b - a) / FPS for a, b in zip(cuts, cuts[1:] + [WD["durationInFrames"]])]
print(f"planos: {len(cuts)} · más largo {max(lens):.2f} s (límite {CUES['maxShotSeconds']} s) · promedio {sum(lens) / len(lens):.2f} s")
for sh, ln in zip(CUES["shots"], lens):
    if ln > CUES["maxShotSeconds"]:
        print(f"  ⚠ {sh['id']} dura {ln:.2f} s")

# ---------------------------------------------------------------- hojas de contacto
reveal_words = {79: "MÁS 1", 82: "MÁS 2", 85: "3 km", 94: "punto", 108: "ya te", 110: "midieron", 133: "200 m", 140: "final"}
key = [0, 1, 4, 8, WD["durationInFrames"] - 1] + cuts + [round(W[i]["start"] * FPS) + 6 for i in reveal_words]
key = sorted(set(k for k in key if 0 <= k < WD["durationInFrames"]))
sel = "+".join(f"eq(n\\,{k})" for k in key)
subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", src, "-vf", f"select='{sel}',scale=270:480,"
                "drawtext=text='%{frame_num}':x=6:y=6:fontsize=22:fontcolor=yellow:box=1:boxcolor=black", "-vsync", "0",
                os.path.join(out, f"{tag}_k%03d.jpg")], check=True)
files = sorted(f for f in os.listdir(out) if f.startswith(f"{tag}_k"))
# los números en pantalla son el índice del select; se imprime el mapa
print("fotogramas clave:", key)
cols = 6
for sheet in range(0, len(files), 18):
    chunk = files[sheet:sheet + 18]
    args = []
    for f in chunk:
        args += ["-i", os.path.join(out, f)]
    n = len(chunk)
    lay = "|".join(f"{(k % cols) * 270}_{(k // cols) * 480}" for k in range(n))
    subprocess.run(["ffmpeg", "-v", "error", "-y", *args, "-filter_complex",
                    "".join(f"[{k}:v]" for k in range(n)) + f"xstack=inputs={n}:fill=black:layout={lay}[o]",
                    "-map", "[o]", os.path.join(out, f"{tag}_hoja{sheet // 18}.jpg")], check=True)
for f in files:
    os.remove(os.path.join(out, f))

# ---------------------------------------------------------------- sincronía de golpes
# Se mide sobre el stem de efectos (aislado): en la mezcla, la voz confunde la detección del ataque.
from scipy import signal
from scipy.io import wavfile

sr, fx = wavfile.read(os.path.join(ROOT, "public/audio/stems/efectos.wav"))
fx = signal.sosfilt(signal.butter(2, 150, "low", fs=sr, output="sos"), fx.astype(float).mean(axis=1) / 32768)
hop = int(sr * 0.002)
env = np.sqrt(np.convolve(fx ** 2, np.ones(hop) / hop, "same"))[::hop]
print("sincronía de golpes (ataque vs. inicio de la palabra; objetivo −10 ms):")
for h in CUES["hits"]:
    if h["kind"] not in ("hit", "big"):
        continue
    t0 = W[h["word"]]["start"]
    i0, i1 = int((t0 - 0.2) / 0.002), int((t0 + 0.2) / 0.002)
    seg = env[i0:i1]
    onset = (i0 + int(np.argmax(seg > seg.max() * 0.2))) * 0.002
    print(f"  palabra {h['word']:3d} '{W[h['word']]['text']}': {1000 * (onset - t0):+5.0f} ms  (1 fotograma = 33 ms)")
# el audio del MP4 debe estar alineado con la mezcla (sin desfase del contenedor)
pcm = subprocess.run(["ffmpeg", "-v", "error", "-i", src, "-ac", "1", "-ar", "8000", "-f", "s16le", "-"], capture_output=True).stdout
a_mp4 = np.frombuffer(pcm, np.int16).astype(float)
pcm2 = subprocess.run(["ffmpeg", "-v", "error", "-i", os.path.join(ROOT, "public/audio/mix.wav"), "-ac", "1", "-ar", "8000", "-f", "s16le", "-"], capture_output=True).stdout
a_mix = np.frombuffer(pcm2, np.int16).astype(float)
n = min(len(a_mp4), len(a_mix), 8000 * 20)
c = signal.correlate(a_mp4[:n], a_mix[:n], mode="full", method="fft")
lag = (np.argmax(c) - (n - 1)) / 8000
print(f"desfase audio MP4 vs. mezcla: {1000 * lag:+.1f} ms")
