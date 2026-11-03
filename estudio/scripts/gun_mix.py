#!/usr/bin/env python3
"""
Video de la pistola (140 km/h): reemplaza la locución original por la de ElevenLabs sin tocar el video.
Cada frase nueva se coloca en la ventana de la frase original (acelerada hasta ×1,3 si es más larga) y se mezcla con
música sintetizada + efectos suaves; el video queda idéntico (se copia el stream), con audio a −14 LUFS.
Uso: python3 scripts/gun_mix.py <video_original.mp4> <el_full.mp3> <al.json> <segs_originales.json> <salida.mp4>
"""
import json, os, subprocess, sys, tempfile
import numpy as np, soundfile as sf
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import v2_audio as A
from sfx import SR, place, whoosh, stamp, riser, tick, thump

video, mp3, alj, segj, out = sys.argv[1:6]
al = json.load(open(alj)); orig = json.load(open(segj))
tmp = tempfile.mkdtemp()
full = os.path.join(tmp, "full.wav")
subprocess.run(["ffmpeg", "-loglevel", "error", "-y", "-i", mp3, "-ac", "1", "-ar", str(SR), full], check=True)
y, _ = sf.read(full, dtype="float32")
dur = float(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", video], capture_output=True, text=True).stdout)
total = dur
voice = np.zeros(int(total * SR), dtype=np.float32)
for i, (a, o) in enumerate(zip(al, orig)):
    s, e = max(0, a["start"] - 0.05), min(len(y) / SR, a["end"] + 0.08)
    clip = y[int(s * SR): int(e * SR)].copy()
    f = int(0.012 * SR); clip[:f] *= np.linspace(0, 1, f); clip[-f:] *= np.linspace(1, 0, f)
    nxt = orig[i + 1]["s"] if i + 1 < len(orig) else total
    avail = max(0.5, nxt - 0.08 - o["s"])
    d = len(clip) / SR
    k = min(1.3, max(1.0, d / avail))
    if k > 1.001:
        p = os.path.join(tmp, f"c{i}.wav"); q = os.path.join(tmp, f"c{i}t.wav")
        sf.write(p, clip, SR)
        subprocess.run(["ffmpeg", "-loglevel", "error", "-y", "-i", p, "-af", f"atempo={k:.4f}", q], check=True)
        clip, _ = sf.read(q, dtype="float32")
    i0 = int(max(0, o["s"] - 0.04) * SR)
    n = min(len(clip), len(voice) - i0)
    voice[i0:i0 + n] += clip[:n]
    print(f"{i:02d} ×{k:.2f}")
voice = voice / (np.abs(voice).max() + 1e-9) * 0.89
n = len(voice)
fx = np.zeros((n, 2))
music = A.pulse_bed(total, 104, 55.0, [1, 1.335, 1.5, 1.189], hats=True, bright=900)
for o in orig[1:]:
    place(fx, whoosh(0.4, up=True) * 0.12, o["s"] - 0.25)
place(fx, stamp(85) * 0.55, 0.0)
ix = {"far": 7, "gun": 11, "cta": 18}
place(fx, riser(1.2, 150, 900) * 0.25, orig[ix["far"]]["s"] - 0.9)
place(fx, thump(0.9, 50, 0.2) * 0.6, orig[ix["far"]]["s"])
place(fx, whoosh(0.7, up=True) * 0.3, orig[ix["gun"]]["s"] - 0.1)
place(fx, stamp(80) * 0.5, orig[14]["s"] + 1.2)
place(fx, stamp(85) * 0.55, orig[ix["cta"]]["s"])
v2 = np.stack([voice, voice], 1)
music = A.duck(music[:n], voice) * 0.32
mix = A.soft_clip((v2 + music + fx[:n] * 0.8) * 1.1)
mix = mix / (np.abs(mix).max() + 1e-9) * 0.9
f = int(0.35 * SR); mix[-f:] *= np.linspace(1, 0, f)[:, None]
wav = os.path.join(tmp, "mix.wav"); sf.write(wav, mix, SR, subtype="PCM_16")
subprocess.run(["bash", os.path.join(os.path.dirname(os.path.abspath(__file__)), "finalize_copy.sh"), video, wav, out], check=True)
