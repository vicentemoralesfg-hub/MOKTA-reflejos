#!/usr/bin/env python3
"""
Pistola 140 km/h · versión con ritmo más rápido (sin generar voz nueva).
Acelera tramos del video original (imagen, subtítulos y animaciones) y re-ubica la misma locución de ElevenLabs en la
nueva línea de tiempo, acelerando cada frase en el mismo factor que su tramo (atempo conserva el tono).
Tramos (tiempo original): gancho ×1,1 · preguntas 0:06–0:13 ×1,2 · explicación técnica 0:23–0:31 ×1,2.
Uso: python3 scripts/gun_fast.py <video_original.mp4> <el_full.mp3> <al.json> <segs_originales.json> <salida.mp4>
"""
import json, os, subprocess, sys, tempfile
import numpy as np, soundfile as sf
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import v2_audio as A
from sfx import SR, place, whoosh, stamp, riser, thump

video, mp3, alj, segj, out = sys.argv[1:6]
al = json.load(open(alj)); orig = json.load(open(segj))
SECT = [(0.0, 4.30, 1.1), (6.30, 13.25, 1.2), (23.20, 30.95, 1.2)]
dur = float(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", video], capture_output=True, text=True).stdout)

# tramos contiguos [a, b, factor]
cuts, t = [], 0.0
for a, b, k in SECT:
    if a > t: cuts.append((t, a, 1.0))
    cuts.append((a, b, k)); t = b
if t < dur: cuts.append((t, dur, 1.0))

def warp(x):
    y = 0.0
    for a, b, k in cuts:
        if x >= b: y += (b - a) / k
        else:
            y += max(0.0, x - a) / k; break
    return y

def factor(x):
    return next((k for a, b, k in cuts if a <= x < b), 1.0)

total = warp(dur)
tmp = tempfile.mkdtemp()
# ---- video
fc = "".join(f"[0:v]trim=start={a}:end={b},setpts=(PTS-STARTPTS)/{k}[v{i}];" for i, (a, b, k) in enumerate(cuts))
fc += "".join(f"[v{i}]" for i in range(len(cuts))) + f"concat=n={len(cuts)}:v=1:a=0,fps=30[v]"
vid = os.path.join(tmp, "v.mp4")
subprocess.run(["ffmpeg", "-loglevel", "error", "-y", "-i", video, "-filter_complex", fc, "-map", "[v]", "-an", "-c:v", "libx264", "-preset", "slow", "-crf", "17",
                "-pix_fmt", "yuv420p", "-colorspace", "bt709", "-color_primaries", "bt709", "-color_trc", "bt709", vid], check=True)
# ---- voz
full = os.path.join(tmp, "full.wav")
subprocess.run(["ffmpeg", "-loglevel", "error", "-y", "-i", mp3, "-ac", "1", "-ar", str(SR), full], check=True)
y, _ = sf.read(full, dtype="float32")
voice = np.zeros(int(total * SR) + SR, dtype=np.float32)
clips = []
for a, o in zip(al, orig):
    s0, e0 = max(0, a["start"] - 0.05), min(len(y) / SR, a["end"] + 0.08)
    c = y[int(s0 * SR): int(e0 * SR)].copy()
    f = int(0.012 * SR); c[:f] *= np.linspace(0, 1, f); c[-f:] *= np.linspace(1, 0, f)
    clips.append(c)
# grupos: frases de un mismo tramo acelerado se ajustan con UN factor común (ritmo parejo); el resto, frase a frase
sect_of = lambda x: next((j for j, (a, b, k) in enumerate(SECT) if a <= x < b), None)
groups = []
for i, o in enumerate(orig):
    sj = sect_of(o["s"] + 0.05)
    if groups and sj is not None and groups[-1][0] == sj: groups[-1][1].append(i)
    else: groups.append((sj, [i]))
GAP = 0.09
def stretch(c, k):
    if k <= 1.001: return c
    p = os.path.join(tmp, "x.wav"); q = os.path.join(tmp, "xt.wav"); sf.write(p, c, SR)
    subprocess.run(["ffmpeg", "-loglevel", "error", "-y", "-i", p, "-af", f"atempo={k:.4f}", q], check=True)
    return sf.read(q, dtype="float32")[0]
for sj, idx in groups:
    k = SECT[sj][2] if sj is not None else 1.0
    end_anchor = warp(orig[idx[-1] + 1]["s"]) - 0.06 if idx[-1] + 1 < len(orig) else total
    while True:  # sube el factor común hasta que el grupo calce antes de la frase siguiente
        t, ok, plan = 0.0, True, []
        for i in idx:
            st = max(warp(orig[i]["s"]) - 0.04, t + GAP if plan else 0.0)
            d = len(clips[i]) / SR / k
            plan.append((i, st)); t = st + d
        if t <= end_anchor or k >= 1.35: break
        k += 0.01
    for i, st in plan:
        c = stretch(clips[i], k); i0 = int(st * SR); n = min(len(c), len(voice) - i0)
        voice[i0:i0 + n] += c[:n]
        print(f"{i:02d} {orig[i]['s']:5.2f}→{st:5.2f}  ×{k:.2f}  {orig[i]['t'][:40]}")
voice = voice[: int(total * SR)]
voice = voice / (np.abs(voice).max() + 1e-9) * 0.89
n = len(voice)
# ---- música y efectos (mismos momentos, en la nueva línea de tiempo)
fx = np.zeros((n, 2))
music = A.pulse_bed(total, 112, 55.0, [1, 1.335, 1.5, 1.189], hats=True, bright=900)
for o in orig[1:]:
    place(fx, whoosh(0.35, up=True) * 0.12, warp(o["s"]) - 0.22)
place(fx, stamp(85) * 0.55, 0.0)
place(fx, riser(1.0, 150, 900) * 0.25, warp(orig[7]["s"]) - 0.8)
place(fx, thump(0.9, 50, 0.2) * 0.6, warp(orig[7]["s"]))
place(fx, whoosh(0.6, up=True) * 0.3, warp(orig[11]["s"]) - 0.1)
place(fx, stamp(80) * 0.5, warp(orig[14]["s"]) + 1.2)
place(fx, stamp(85) * 0.55, warp(orig[18]["s"]))
fx = A.duck(fx[:n], voice, -9)
music = A.duck(music[:n], voice) * 0.30
mix = A.soft_clip((np.stack([voice, voice], 1) + music + fx * 0.8) * 1.1)
mix = mix / (np.abs(mix).max() + 1e-9) * 0.9
f = int(0.35 * SR); mix[-f:] *= np.linspace(1, 0, f)[:, None]
wav = os.path.join(tmp, "mix.wav"); sf.write(wav, mix, SR, subtype="PCM_16")
subprocess.run(["bash", os.path.join(os.path.dirname(os.path.abspath(__file__)), "finalize_copy.sh"), vid, wav, out], check=True)
print(f"duración {dur:.2f} s → {total:.2f} s")
