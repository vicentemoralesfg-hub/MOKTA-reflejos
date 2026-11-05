#!/usr/bin/env python3
"""
Convierte las recetas diseñadas por Qwen3 (assets/sfx_recipes.json) en WAV (public/audio/sfx/*.wav)
y sintetiza la base musical a partir del patrón que también diseñó Qwen3.

Los parámetros que entrega el modelo se validan y se acotan a rangos seguros (frecuencias audibles,
duraciones razonables, ganancias 0..1) antes de sintetizar.
"""
import json, os
import numpy as np
from scipy import signal
from scipy.io import wavfile

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SR = 48000
rng = np.random.default_rng(3)
R = json.load(open(os.path.join(ROOT, "assets", "sfx_recipes.json")))
OUT = os.path.join(ROOT, "public", "audio", "sfx")
os.makedirs(OUT, exist_ok=True)


def num(v, d, lo, hi):
    try:
        v = float(v)
        if not np.isfinite(v):
            raise ValueError
    except Exception:
        v = d
    return float(min(hi, max(lo, v)))


def white(n):
    return rng.standard_normal(n)


def pink(n):
    w = white(n)
    b, a = [0.049922035, -0.095993537, 0.050612699, -0.004408786], [1, -2.494956002, 2.017265875, -0.522189400]
    return signal.lfilter(b, a, w) * 4


def brown(n):
    x = np.cumsum(white(n))
    x = signal.sosfilt(signal.butter(1, 10, "high", fs=SR, output="sos"), x)
    return x / (np.abs(x).max() + 1e-9)


def sweep_phase(f0, f1, n):
    f0, f1 = max(f0, 1.0), max(f1, 1.0)
    fr = f0 * (f1 / f0) ** np.linspace(0, 1, n)  # barrido exponencial
    return 2 * np.pi * np.cumsum(fr) / SR


def tv_filter(x, kind, c0, c1, q):
    """Filtro con corte variable en el tiempo (por bloques, con estado continuo)."""
    if kind not in ("lowpass", "highpass", "bandpass"):
        return x
    n = len(x)
    blocks = max(1, n // 512)
    out = np.zeros_like(x)
    zi = None
    cuts = c0 * (c1 / c0) ** np.linspace(0, 1, blocks)
    for i in range(blocks):
        a, b = i * n // blocks, (i + 1) * n // blocks
        fc = float(min(SR * 0.45, max(30, cuts[i])))
        if kind == "bandpass":
            bw = fc / max(0.3, q)
            lo, hi = max(20, fc - bw / 2), min(SR * 0.45, fc + bw / 2)
            if hi <= lo + 5:
                hi = lo + 50
            sos = signal.butter(2, [lo, hi], "bandpass", fs=SR, output="sos")
        else:
            sos = signal.butter(2, fc, "low" if kind == "lowpass" else "high", fs=SR, output="sos")
        if zi is None or zi.shape[0] != sos.shape[0]:
            zi = np.zeros((sos.shape[0], 2))
        out[a:b], zi = signal.sosfilt(sos, x[a:b], zi=zi)
    return out


def layer(L, total):
    src = str(L.get("source", "noise")).lower()
    start = num(L.get("start"), 0, 0, total)
    length = num(L.get("length"), total - start, 0.005, max(0.01, total - start))
    n = max(16, int(length * SR))
    f0 = num(L.get("freq_start"), 200, 20, 16000)
    f1 = num(L.get("freq_end"), f0, 20, 16000)
    if src in ("sine", "square", "saw", "triangle", "fm"):
        ph = sweep_phase(f0, f1, n)
        if src == "sine":
            x = np.sin(ph)
        elif src == "square":
            x = np.tanh(np.sin(ph) * 6)
        elif src == "saw":
            x = 2 * ((ph / (2 * np.pi)) % 1.0) - 1
        elif src == "triangle":
            x = 2 * np.abs(2 * ((ph / (2 * np.pi)) % 1.0) - 1) - 1
        else:
            ratio = num(L.get("fm_ratio"), 2, 0.1, 12)
            idx = num(L.get("fm_index"), 3, 0, 20)
            x = np.sin(ph + idx * np.sin(ph * ratio))
    elif src == "pink":
        x = pink(n)
    elif src == "brown":
        x = brown(n)
    elif src == "click":
        x = np.zeros(n)
        x[: min(n, 96)] = white(min(n, 96))
    else:
        x = white(n)
    x = x / (np.abs(x).max() + 1e-9)
    flt = L.get("filter") or {}
    if isinstance(flt, dict):
        kind = str(flt.get("type", "none")).lower()
        c0 = num(flt.get("cutoff_start"), 1000, 30, 20000)
        c1 = num(flt.get("cutoff_end"), c0, 30, 20000)
        x = tv_filter(x, kind, c0, c1, num(flt.get("q"), 0.7, 0.3, 12))
        x = x / (np.abs(x).max() + 1e-9)
    att = num(L.get("attack"), 0.005, 0.0005, length)
    dec = num(L.get("decay"), length, 0.005, 6)
    t = np.arange(n) / SR
    env = np.minimum(1, t / att)
    if str(L.get("curve", "exp")) == "lin":
        env *= np.clip(1 - np.maximum(0, t - att) / dec, 0, 1)
    else:
        env *= np.exp(-np.maximum(0, t - att) / (dec / 4.6))
    x = x * env
    drive = num(L.get("drive"), 0, 0, 1)
    if drive > 0:
        x = np.tanh(x * (1 + drive * 8)) / np.tanh(1 + drive * 8)
    gain = num(L.get("gain"), 0.6, 0, 1)
    rep = int(num(L.get("repeat"), 1, 1, 40))
    every = num(L.get("repeat_every"), length, 0.005, 2)
    jit = num(L.get("jitter"), 0, 0, 1)
    out = np.zeros(int(total * SR) + n + int(rep * every * SR) + 10)
    for k in range(rep):
        off = start + k * every + (rng.uniform(-0.5, 0.5) * every * jit if k else 0)
        g = gain * (1 - jit * rng.uniform(0, 0.6)) if k else gain
        i = max(0, int(off * SR))
        out[i : i + n] += x * g
    return out


def reverb(x, amt):
    if amt <= 0:
        return x
    n = int(SR * (0.4 + amt * 1.2))
    ir = white(n) * np.exp(-np.linspace(0, 7, n))
    ir = signal.sosfilt(signal.butter(2, 5000, "low", fs=SR, output="sos"), ir)
    wet = signal.fftconvolve(x, ir)[: len(x)]
    wet /= np.abs(wet).max() + 1e-9
    return x * (1 - amt * 0.4) + wet * amt * 0.5 * (np.abs(x).max() + 1e-9)


def render(name, rec):
    total = num(rec.get("duration"), 1, 0.03, 4)
    layers = rec.get("layers") or []
    acc = np.zeros(int(total * SR) + SR * 3)
    for L in layers[:6]:
        if isinstance(L, dict):
            y = layer(L, total)
            m = min(len(acc), len(y))
            acc[:m] += y[:m]
    acc = reverb(acc, num(rec.get("reverb"), 0.1, 0, 0.8))
    # recorte de cola silenciosa
    nz = np.where(np.abs(acc) > 1e-3 * (np.abs(acc).max() + 1e-9))[0]
    acc = acc[: (nz[-1] + 1 if len(nz) else len(acc))]
    acc = signal.sosfilt(signal.butter(1, 25, "high", fs=SR, output="sos"), acc)
    fade = min(len(acc), int(0.01 * SR))
    acc[-fade:] *= np.linspace(1, 0, fade)
    acc = acc / (np.abs(acc).max() + 1e-9) * 0.89
    wavfile.write(os.path.join(OUT, f"{name}.wav"), SR, acc.astype(np.float32))
    return len(acc) / SR


for name, item in R["sounds"].items():
    d = render(name, item["recipe"])
    print(f"sfx {name:12s} {d:5.2f}s  ({len(item['recipe'].get('layers', []))} capas)")

# ----------------------------------------------------------------- música
def steps(v, n=16, default=0):
    v = list(v) if isinstance(v, list) else []
    v = (v + [default] * n)[:n]
    return v


M = (R.get("music") or {}).get("pattern") or {}
BPM = num(M.get("bpm"), 124, 90, 150)
ROOT_HZ = num(M.get("key_root_hz"), 55, 30, 220)
while ROOT_HZ > 70:
    ROOT_HZ /= 2
pat = {k: [1 if (x and x not in (0, "0")) else 0 for x in steps(M.get(k))] for k in ("kick", "snare", "hat", "open_hat")}
bass = steps(M.get("bass"), default=None)
chords = M.get("chords") if isinstance(M.get("chords"), list) and M.get("chords") else [[0, 3, 7]] * 4
chords = [[int(num(n, 0, -12, 24)) for n in (c if isinstance(c, list) and c else [0, 3, 7])][:4] for c in (chords + chords * 4)[:4]]
json.dump({"bpm": BPM, "root_hz": ROOT_HZ, "pattern": pat, "bass": bass, "chords": chords},
          open(os.path.join(OUT, "music_pattern_used.json"), "w"), indent=1)
step_s = 60 / BPM / 4
print(f"música: {BPM:.0f} BPM, raíz {ROOT_HZ:.1f} Hz")


def kick():
    n = int(0.35 * SR)
    ph = sweep_phase(140, 42, n)
    return np.sin(ph) * np.exp(-np.linspace(0, 6, n)) * 1.0


def snare():
    n = int(0.22 * SR)
    nz = signal.sosfilt(signal.butter(2, [1500, 7000], "band", fs=SR, output="sos"), white(n))
    tone = np.sin(2 * np.pi * 190 * np.arange(n) / SR)
    return (nz * 0.6 + tone * 0.4) * np.exp(-np.linspace(0, 9, n))


def hat(open_=False):
    n = int((0.25 if open_ else 0.05) * SR)
    nz = signal.sosfilt(signal.butter(2, 7500, "high", fs=SR, output="sos"), white(n))
    return nz * np.exp(-np.linspace(0, 5 if open_ else 9, n)) * 0.35


def note(semi, dur, kind):
    n = int(dur * SR)
    fq = ROOT_HZ * 2 ** (semi / 12)
    t = np.arange(n) / SR
    if kind == "bass":
        x = sum(np.sin(2 * np.pi * fq * h * t) / h for h in (1, 2, 3))
        x = np.tanh(x * 1.5) * np.exp(-t * 3.5)
    else:  # pad
        fq *= 4
        x = sum(2 * ((fq * d * t) % 1) - 1 for d in (0.995, 1.0, 1.006))
        x = signal.sosfilt(signal.butter(2, 1600, "low", fs=SR, output="sos"), x) / 3
        a = np.minimum(1, t / 0.08) * np.minimum(1, (dur - t) / 0.15)
        x = x * np.clip(a, 0, 1)
    return x


def music_bar(intensity):
    """Un compás (16 semicorcheas). intensity: 0 = solo pad/bajo filtrado, 1 = completo."""
    bar = np.zeros(int(16 * step_s * SR) + SR)
    K, S_, H, OH = kick(), snare(), hat(), hat(True)
    for i in range(16):
        p = int(i * step_s * SR)
        if intensity >= 0.5:
            if pat["kick"][i]: bar[p:p + len(K)] += K * 0.9
            if pat["snare"][i]: bar[p:p + len(S_)] += S_ * 0.6
        if intensity >= 0.25:
            if pat["hat"][i]: bar[p:p + len(H)] += H
            if pat["open_hat"][i]: bar[p:p + len(OH)] += OH * 0.8
        b = bass[i]
        if b is not None:
            try:
                bn = note(float(b), step_s * 1.8, "bass")
                bar[p:p + len(bn)] += bn * 0.45
            except Exception:
                pass
    for c in range(4):
        p = int(c * 4 * step_s * SR)
        for s in chords[c]:
            pn = note(s, 4 * step_s, "pad")
            bar[p:p + len(pn)] += pn * 0.12
    return bar


bars = {k: music_bar(k) for k in (0.0, 0.3, 1.0)}
bar_len = int(16 * step_s * SR)
for k, b in bars.items():
    wavfile.write(os.path.join(OUT, f"music_bar_{int(k*10)}.wav"), SR, (b / (np.abs(b).max() + 1e-9) * 0.8).astype(np.float32))
json.dump({"bar_seconds": bar_len / SR, "bpm": BPM}, open(os.path.join(OUT, "music_meta.json"), "w"))
print("ok")
