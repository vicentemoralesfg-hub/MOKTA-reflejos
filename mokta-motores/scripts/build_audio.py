#!/usr/bin/env python3
"""
MOKTA · ¿Reconoces el motor? — construye la pista final y los datos del visualizador.

Lee src/quiz.json (tiempos, mismos fotogramas que el video) y scripts/clips.json (qué tramo de cada
grabación real suena en cada fase). Escribe:
  public/audio/soundtrack.wav   pista final 48 kHz estéreo (−14 LUFS, pico ≤ −1 dBTP)
  src/viz.json                  espectro y nivel por fotograma, calculados de la pista final

Reglas de mezcla:
  * Los motores son el protagonista: sin música bajo la escucha. Los efectos (tic de cuenta regresiva,
    impacto, acierto) son cortos, sintetizados aquí y mezclados por debajo del motor.
  * Silencios tácticos: tarjeta de ronda y hueco antes de cada revelación.
  * Cada grabación se nivela por loudness (BS.1770) para que ninguna ronda "gane" por volumen.
"""
import json
import os
import subprocess
import sys

import numpy as np
import pyloudnorm as pyln
import soundfile as sf

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SR = 48000
Q = json.load(open(os.path.join(ROOT, "src/quiz.json")))
C = json.load(open(os.path.join(ROOT, "scripts/clips.json")))
V = json.load(open(os.path.join(ROOT, "scripts/voice.json")))
FPS = Q["fps"]
SRC_DIR = os.path.join(ROOT, C.get("sourceDir", "assets/engines"))
meter = pyln.Meter(SR)


def fr(n):  # fotogramas → muestras
    return int(round(n * SR / FPS))


_cache = {}


def load(name):
    if name not in _cache:
        path = name if os.path.isabs(name) else os.path.join(SRC_DIR, name)
        wav = path + ".48k.wav"
        if not os.path.exists(wav):
            subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", path, "-ac", "2", "-ar", str(SR), "-c:a", "pcm_f32le", wav], check=True)
        x, sr = sf.read(wav, dtype="float32", always_2d=True)
        assert sr == SR
        _cache[name] = x
    return _cache[name]


def fade(x, fin=0.004, fout=0.004):
    x = x.copy()
    a, b = int(fin * SR), int(fout * SR)
    if a:
        x[:a] *= np.linspace(0, 1, a)[:, None] ** 2
    if b:
        x[-b:] *= np.linspace(1, 0, b)[:, None] ** 2
    return x


def seg(name, t0, t1, fin=0.004, fout=0.004):
    x = load(name)
    return fade(x[int(t0 * SR): int(t1 * SR)], fin, fout)


def join(parts, xf=0.035):
    """Concatena con fundido cruzado corto (equal-power) para que no haya clics."""
    n = int(xf * SR)
    out = parts[0]
    for p in parts[1:]:
        if len(out) > n and len(p) > n:
            t = np.linspace(0, np.pi / 2, n)[:, None]
            mid = out[-n:] * np.cos(t) + p[:n] * np.sin(t)
            out = np.concatenate([out[:-n], mid, p[n:]])
        else:
            out = np.concatenate([out, p])
    return out


def gain_to(x, lufs):
    l = meter.integrated_loudness(x) if len(x) > SR * 0.5 else -30
    if not np.isfinite(l):
        return x
    return x * (10 ** ((lufs - l) / 20))


def fit(x, n, fout=0.06):
    """Recorta (o rellena con silencio) a n muestras, con salida suave."""
    if len(x) >= n:
        return fade(x[:n], 0.0, fout)
    return np.concatenate([x, np.zeros((n - len(x), 2), np.float32)])


# ---------- efectos sintetizados (sin licencias de terceros) ----------
rng = np.random.default_rng(7)


def env(n, a, d):
    t = np.arange(n) / SR
    return np.minimum(1, t / max(a, 1e-4)) * np.exp(-t / d)


def tick(level=0.16):
    n = int(0.09 * SR)
    t = np.arange(n) / SR
    s = (np.sin(2 * np.pi * 2350 * t) * 0.7 + np.sin(2 * np.pi * 4700 * t) * 0.3) * env(n, 0.0005, 0.018)
    return np.stack([s, s], 1).astype(np.float32) * level


def impact(level=0.55):
    n = int(0.9 * SR)
    t = np.arange(n) / SR
    f = 95 * np.exp(-t * 5) + 38
    boom = np.sin(2 * np.pi * np.cumsum(f) / SR) * env(n, 0.002, 0.22)
    noise = rng.standard_normal(n) * env(n, 0.001, 0.05)
    # suavizado simple del ruido (paso bajo de 1 polo)
    for i in range(1, n):
        noise[i] = noise[i] * 0.25 + noise[i - 1] * 0.75
    s = boom * 0.9 + noise * 0.5
    return np.stack([s, s], 1).astype(np.float32) * level


def ding(level=0.12):
    n = int(0.6 * SR)
    t = np.arange(n) / SR
    a = np.sin(2 * np.pi * 1046.5 * t) * env(n, 0.002, 0.16)
    b = np.zeros(n)
    k = int(0.08 * SR)
    b[k:] = np.sin(2 * np.pi * 1568 * t[: n - k]) * env(n - k, 0.002, 0.22)
    s = a + b
    return np.stack([s, s * 0.9], 1).astype(np.float32) * level


def thump(level=0.5, f0=60):
    n = int(0.35 * SR)
    t = np.arange(n) / SR
    f = f0 * np.exp(-t * 6) + 30
    s = np.sin(2 * np.pi * np.cumsum(f) / SR) * env(n, 0.002, 0.08)
    return np.stack([s, s], 1).astype(np.float32) * level


def riser(dur, level=0.06):
    n = int(dur * SR)
    t = np.arange(n) / SR
    noise = rng.standard_normal(n)
    out = np.zeros(n)
    a = 0.0
    for i in range(n):  # paso alto variable → "aire" que sube
        k = 0.02 + 0.5 * (i / n)
        a = a + k * (noise[i] - a)
        out[i] = noise[i] - a
    s = out * (t / dur) ** 2
    return np.stack([s, s], 1).astype(np.float32) * level


# ---------- montaje ----------
hook = Q["hook"]["duration"]
total = hook + sum(r["intro"] + r["listen"] + r["countdown"] + r["gap"] + r["reveal"] for r in Q["rounds"]) + Q["cta"]["duration"]
N = fr(total)
eng = np.zeros((N, 2), np.float32)  # bus de motores
fx = np.zeros((N, 2), np.float32)  # bus de efectos
vo = np.zeros((N, 2), np.float32)  # bus de locución (ElevenLabs)
VO_SRC = os.path.join(ROOT, V["source"])
L_VOICE = V.get("lufs", -15.0)
_vo_gain = None


def voice(line):
    """Tramo de la locución, nivelado con la misma ganancia para todas las frases."""
    global _vo_gain
    if _vo_gain is None:
        full = load(VO_SRC)
        _vo_gain = 10 ** ((L_VOICE - meter.integrated_loudness(full)) / 20)
    a, b = V["lines"][line]
    return seg(VO_SRC, a, b, 0.01, 0.04) * _vo_gain


def put(bus, at, x):
    a = fr(at) if isinstance(at, (int, np.integer)) else int(at)
    b = min(len(bus), a + len(x))
    bus[a:b] += x[: b - a]


L_LISTEN = C.get("lufsListen", -17.0)
L_REVEAL = C.get("lufsReveal", -15.5)

# Gancho: locución + cama de motor misteriosa (por debajo de la voz) + adelanto del último motor
put(vo, 0, voice("hookA"))
put(vo, C["hook"]["voiceBAt"], voice("hookB"))
put(fx, 0, thump(0.35, 70))
for b in C["hook"]["bursts"]:
    x = gain_to(seg(b["src"], b["t"], b["t"] + b["dur"], 0.003, 0.05), b.get("lufs", L_LISTEN + 1))
    put(eng, b["at"], x)
    if b.get("hit"):
        put(fx, b["at"], thump(0.3, 70))

start = hook
for r in Q["rounds"]:
    c = C["rounds"][r["id"]]
    t_listen = start + r["intro"]
    t_count = t_listen + r["listen"]
    t_gap = t_count + r["countdown"]
    t_rev = t_gap + r["gap"]
    t_end = t_rev + r["reveal"]

    # tarjeta de ronda: silencio + golpe seco (en la final, latidos)
    put(vo, start + 1, voice(r["id"]))
    if r.get("final"):
        for k, at in enumerate([0, 27, 36]):
            put(fx, start + at, thump(0.55 if k != 2 else 0.4, 55))
    else:
        put(fx, start, thump(0.35, 75))

    # escucha + cuenta regresiva: el motor suena sin interrupción
    listen = join([seg(c["src"], a, b) for a, b in c["listen"]])
    listen = gain_to(listen, c.get("lufsListen", L_LISTEN))
    listen = fit(listen, fr(t_gap - t_listen), fout=0.025)
    listen[: int(0.006 * SR)] *= np.linspace(0, 1, int(0.006 * SR))[:, None]
    put(eng, t_listen, listen)

    # tic por segundo de cuenta regresiva (agudo y corto: no tapa al motor)
    for s in range(r["countdown"] // FPS):
        put(fx, t_count + s * FPS, tick(0.13 + 0.03 * s))
    # aire que sube en el último segundo
    put(fx, t_gap - FPS, riser(1.0, 0.035))

    # revelación: impacto + acierto + el tramo más espectacular
    a, b = c["reveal"]
    rev = gain_to(seg(c["src"], a, b, 0.002, 0.2), c.get("lufsReveal", L_REVEAL))
    tail = C.get("ctaTail") if r.get("final") else None
    n_rev = fr(t_end - t_rev) + (fr(C["ctaTailFrames"]) if tail else 0)
    rev = fit(rev, n_rev, fout=0.35 if not tail else 1.8)
    put(eng, t_rev, rev)
    put(fx, t_rev, impact(0.5))
    put(fx, t_rev + 3, ding(0.10))
    start = t_end

# cierre: locución + golpe cuando aparece el llamado a comentar
put(vo, start + 6, voice("cta"))
put(fx, start + 40, thump(0.4, 65))

# el motor baja 9 dB mientras habla la locución (envolvente suave de 60 ms)
act = (np.abs(vo).max(1) > 1e-4).astype(np.float32)
k = int(0.06 * SR)
act = np.convolve(act, np.ones(k) / k, mode="same")
act = np.convolve(np.minimum(1, act * 3), np.ones(k * 3) / (k * 3), mode="same")
duck = 1 - act * (1 - 10 ** (-9 / 20))
mix = eng * duck[:, None] + fx + vo
# loudness final en dos pasos con ffmpeg (lineal) y limitador de picos
tmp = os.path.join(ROOT, "public/audio/_premix.wav")
os.makedirs(os.path.dirname(tmp), exist_ok=True)
sf.write(tmp, mix, SR, subtype="FLOAT")
out = os.path.join(ROOT, "public/audio/soundtrack.wav")
m = subprocess.run(
    ["ffmpeg", "-hide_banner", "-i", tmp, "-af", "loudnorm=I=-14:TP=-1.5:LRA=11:print_format=json", "-f", "null", "-"],
    capture_output=True, text=True,
).stderr
js = json.loads(m[m.rindex("{"): m.rindex("}") + 1])
af = (
    f"loudnorm=I=-14:TP=-1.5:LRA=11:measured_I={js['input_i']}:measured_TP={js['input_tp']}:"
    f"measured_LRA={js['input_lra']}:measured_thresh={js['input_thresh']}:offset={js['target_offset']}:linear=true,"
    f"alimiter=limit=0.84:attack=1:release=60:level=disabled"
)
subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", tmp, "-af", af, "-ar", str(SR), "-c:a", "pcm_s24le", out], check=True)
os.remove(tmp)

# ---------- datos del visualizador (desde la pista final) ----------
y, _ = sf.read(out, dtype="float32", always_2d=True)
y = y.mean(1)
y = np.concatenate([y, np.zeros(fr(total) + 4096 - len(y), np.float32)]) if len(y) < fr(total) + 4096 else y
BANDS = 24
edges = np.geomspace(40, 10000, BANDS + 1)
W = 4096
win = np.hanning(W)
freqs = np.fft.rfftfreq(W, 1 / SR)
idx = [np.where((freqs >= edges[i]) & (freqs < edges[i + 1]))[0] for i in range(BANDS)]
frames, level = [], []
for k in range(total):
    c0 = fr(k) + SR // (2 * FPS)
    w = y[max(0, c0 - W // 2): c0 + W // 2]
    if len(w) < W:
        w = np.pad(w, (0, W - len(w)))
    sp = np.abs(np.fft.rfft(w * win)) / (W / 4)
    db = [20 * np.log10(np.sqrt(np.mean(sp[i] ** 2)) + 1e-9) if len(i) else -120 for i in idx]
    # inclinación +3 dB/oct para que los agudos se vean
    db = [d + 3 * np.log2(edges[i] / 40) for i, d in enumerate(db)]
    frames.append([round(float(np.clip((d + 62) / 50, 0, 1)), 2) for d in db])
    seg_ = y[fr(k): fr(k + 1)]
    rms = 20 * np.log10(np.sqrt(np.mean(seg_ ** 2)) + 1e-9) if len(seg_) else -120
    level.append(round(float(np.clip((rms + 42) / 34, 0, 1)), 3))
json.dump({"fps": FPS, "bands": BANDS, "frames": frames, "level": level}, open(os.path.join(ROOT, "src/viz.json"), "w"), separators=(",", ":"))

lufs = meter.integrated_loudness(sf.read(out, dtype="float32")[0])
print(f"OK · {total} fotogramas · {total / FPS:.2f} s · {lufs:.1f} LUFS · pico {20 * np.log10(np.abs(sf.read(out)[0]).max()):.2f} dBFS")
