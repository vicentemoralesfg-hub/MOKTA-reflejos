#!/usr/bin/env python3
"""
Locución: toma elegida por escena -> recorta pausas largas, acelera levemente (sin cambiar el tono)
y deja cada bloque en public/audio/vo/sXX.wav (48 kHz mono).

Entradas: assets/vo_raw/*.mp3 (ElevenLabs, voz Tm8bVnJtlhPQUOb8KzSd) y assets/words_raw.json
(tiempos por palabra de las tomas originales, para saber dónde están las pausas).
"""
import json, os, subprocess
import numpy as np

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SR = 48000
PICK = {"s01": "a", "s02": "b", "s03": "a", "s04": "a", "s05": "b",
        "s06": "b", "s07": "a", "s08": "a", "s09": "a", "s10": "a"}
MAX_GAP = 0.26      # pausa máxima entre palabras (s) antes de acelerar
TEMPO = 1.10        # aceleración final
words = json.load(open(os.path.join(ROOT, "assets", "words_raw.json")))
outdir = os.path.join(ROOT, "public", "audio", "vo")
os.makedirs(outdir, exist_ok=True)


def load(path):
    b = subprocess.run(["ffmpeg", "-v", "error", "-i", path, "-ac", "1", "-ar", str(SR), "-f", "f32le", "-"],
                       capture_output=True, check=True).stdout
    return np.frombuffer(b, np.float32).copy()


def rms_env(x, win=480):
    p = np.convolve(x * x, np.ones(win) / win, mode="same")
    return np.sqrt(p)


for scene, take in PICK.items():
    name = f"{scene}{take}.mp3"
    x = load(os.path.join(ROOT, "assets", "vo_raw", name))
    env = rms_env(x)
    quiet = env < 0.012
    w = words[name]
    # recorte de cabeza/cola
    start = max(0, int((w[0]["s"] - 0.06) * SR))
    end = min(len(x), int((w[-1]["e"] + 0.18) * SR))
    # pausas internas: buscar el tramo silencioso más largo dentro de cada hueco y acortarlo
    cuts = []
    for a, b in zip(w[:-1], w[1:]):
        g0, g1 = int(a["e"] * SR), int(b["s"] * SR)
        if g1 - g0 < MAX_GAP * SR:
            continue
        q = quiet[g0:g1]
        # tramo silencioso continuo más largo
        best, cur, bs = (0, 0), 0, 0
        for i, v in enumerate(q):
            if v:
                if cur == 0:
                    bs = i
                cur += 1
                if cur > best[1]:
                    best = (bs, cur)
            else:
                cur = 0
        s0, ln = best
        keep = int(MAX_GAP * SR)
        excess = ln - keep
        if excess > SR * 0.03:
            c0 = g0 + s0 + keep // 2
            cuts.append((c0, c0 + excess))
    segs, pos = [], start
    for c0, c1 in cuts:
        segs.append(x[pos:c0])
        pos = c1
    segs.append(x[pos:end])
    # unir con microfundidos de 8 ms
    fade = int(0.008 * SR)
    y = segs[0]
    for s in segs[1:]:
        r = np.linspace(1, 0, fade, dtype=np.float32)
        y = np.concatenate([y[:-fade], y[-fade:] * r + s[:fade] * (1 - r), s[fade:]])
    tmp = os.path.join(outdir, f"{scene}.tmp.f32")
    y.astype(np.float32).tofile(tmp)
    out = os.path.join(outdir, f"{scene}.wav")
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "f32le", "-ar", str(SR), "-ac", "1", "-i", tmp,
                    "-af", f"atempo={TEMPO},afade=t=in:d=0.01,afade=t=out:st={len(y)/SR/TEMPO-0.04:.3f}:d=0.04",
                    "-ar", str(SR), "-c:a", "pcm_s24le", out], check=True)
    os.remove(tmp)
    d = float(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", out],
                             capture_output=True, text=True).stdout)
    print(f"{scene}: {len(x)/SR:.2f}s -> {d:.2f}s ({len(cuts)} pausas recortadas)")
