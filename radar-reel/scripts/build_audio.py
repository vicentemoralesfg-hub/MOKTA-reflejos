#!/usr/bin/env python3
"""
Música ambiental oscura + efectos + mezcla con la locución.

Todo se sintetiza aquí (sin samples de terceros). Lee src/data/cues.json y
src/data/words.json, los mismos tiempos que usa Remotion.

Salida: public/audio/mix.wav (48 kHz, estéreo) y stems en public/audio/stems/.
"""
import json
import os

import numpy as np
from scipy import signal
from scipy.io import wavfile

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CUES = json.load(open(os.path.join(ROOT, "src/data/cues.json")))
WD = json.load(open(os.path.join(ROOT, "src/data/words.json")))
W = WD["words"]
FPS = CUES["fps"]
SR = 48000
N = int(WD["durationInFrames"] / FPS * SR)
T = N / SR
t = np.arange(N) / SR
rng = np.random.default_rng(11)


def shot_start(word):
    """Mismo criterio que src/timeline.ts: corte 0,12 s antes de la palabra."""
    if word == 0:
        return 0.0
    f = round((W[word]["start"] - 0.12) * FPS)
    f = max(f, round(W[word - 1]["end"] * FPS))
    return f / FPS


SHOT = {s["id"]: shot_start(s["word"]) for s in CUES["shots"]}


def idx(sec):
    return int(np.clip(round(sec * SR), 0, N))


def lp(x, fc, order=2):
    return signal.sosfilt(signal.butter(order, fc, "low", fs=SR, output="sos"), x)


def hp(x, fc, order=2):
    return signal.sosfilt(signal.butter(order, fc, "high", fs=SR, output="sos"), x)


def bp(x, lo, hi, order=2):
    return signal.sosfilt(signal.butter(order, [lo, hi], "band", fs=SR, output="sos"), x)


def smooth_env(points):
    """Envolvente lineal por tramos [(seg, valor)...] sobre todo el video."""
    xs, ys = zip(*points)
    return np.interp(t, xs, ys)


def reverb_ir(seconds=2.6, decay=3.2, seed=3):
    r = np.random.default_rng(seed)
    n = int(seconds * SR)
    tt = np.arange(n) / SR
    ir = r.standard_normal((2, n)) * np.exp(-decay * tt)
    ir[:, : int(0.012 * SR)] *= np.linspace(0, 1, int(0.012 * SR))
    ir = np.stack([lp(ir[0], 6000), lp(ir[1], 5200)])
    return ir / np.sqrt((ir ** 2).sum(axis=1, keepdims=True))


IR = reverb_ir()


def wet(x_mono, amount):
    return np.stack([signal.fftconvolve(x_mono, IR[c])[:N] for c in range(2)]) * amount


# ------------------------------------------------------------------ música
def saw(freq, phase=0.0):
    ph = np.cumsum(np.broadcast_to(freq, t.shape)) / SR + phase
    return 2 * (ph % 1.0) - 1


drop_start = W[85]["start"] - 0.05          # silencio de la música justo antes del "tres"
drop_end = SHOT["niUnPunto"]
riser_start = SHOT["kilometro"]

# Intensidad general (la tensión sube hasta el reveal de 3 km, cae y vuelve más grave)
inten = smooth_env([
    (0, 0.85), (SHOT["hook2"], 0.7), (SHOT["laVes"], 0.6), (SHOT["radarLanza"], 0.62), (SHOT["laserPistola"], 0.7), (SHOT["desdeDistancia"], 0.78),
    (riser_start, 0.9), (drop_start - 0.01, 1.0), (drop_start, 0.0), (drop_end - 0.4, 0.0),
    (drop_end, 0.75), (SHOT["yaTeMidieron"], 0.85), (SHOT["detalle"], 0.6), (SHOT["pillaron"], 0.7), (T, 0.75),
])

pad = np.zeros((2, N))
# Re menor oscuro: D2, A2, F3, C4 (novena menor suspendida), dos voces desafinadas por canal
for f0, g in [(73.42, 1.0), (110.0, 0.6), (174.61, 0.38), (261.63, 0.16)]:
    for c, det in enumerate([-0.18, 0.21]):
        pad[c] += g * (saw(f0 * (1 + det / 100)) + 0.6 * saw(f0 * (1 - det / 80), 0.37))
# Filtro que respira lento: corte entre 300 y 900 Hz
cut = 380 + 420 * (0.5 + 0.5 * np.sin(2 * np.pi * t / 9.0)) * inten
pad_f = np.zeros_like(pad)
blk = 2400
for c in range(2):
    zi = None
    sos_prev = None
    out = np.zeros(N)
    for a in range(0, N, blk):
        fc = float(np.clip(cut[a], 120, 4000))
        sos = signal.butter(2, fc, "low", fs=SR, output="sos")
        if zi is None:
            zi = signal.sosfilt_zi(sos) * 0
        out[a:a + blk], zi = signal.sosfilt(sos, pad[c, a:a + blk], zi=zi)
    pad_f[c] = out
pad = pad_f * 0.05

# Sub: nota pedal D1 suave
sub = 0.11 * np.sin(2 * np.pi * 36.71 * t) * (0.6 + 0.4 * np.sin(2 * np.pi * t / 6.0))

# Pulso tipo latido (dos golpes graves), sube de tempo con la tensión
pulse = np.zeros(N)
beat = 0.0
while beat < T:
    for k, amp in [(0.0, 1.0), (0.24, 0.6)]:
        s0 = idx(beat + k)
        n = int(0.32 * SR)
        e = np.exp(-np.arange(n) / SR * 14)
        fr = 58 * np.exp(-np.arange(n) / SR * 5)
        tone = np.sin(2 * np.pi * np.cumsum(fr) / SR) * e * amp
        pulse[s0:s0 + n] += tone[: max(0, min(n, N - s0))]
    bpm = 54 + 26 * float(np.interp(beat, t, inten))
    beat += 60.0 / bpm
pulse = lp(pulse, 180) * 0.32

# Brillo: ruido filtrado muy bajo, estéreo
air = np.stack([bp(rng.standard_normal(N), 2500, 7000), bp(rng.standard_normal(N), 2600, 7500)]) * 0.006

music = pad + np.stack([sub, sub]) + np.stack([pulse, pulse]) * 0.9 + air
music *= np.stack([inten, inten])

# Subida (riser) hacia el reveal de 3 km
a, b = idx(riser_start), idx(drop_start)
n = b - a
tr = np.arange(n) / SR
riser = bp(rng.standard_normal(n), 400, 5000) * np.linspace(0, 1, n) ** 2.2 * 0.05
sweep = np.sin(2 * np.pi * np.cumsum(np.linspace(110, 330, n)) / SR) * np.linspace(0, 1, n) ** 2 * 0.035
music[:, a:b] += np.stack([riser + sweep, riser * 0.9 + sweep])
music += wet(music.mean(axis=0), 0.35)

# ------------------------------------------------------------------ efectos
fx = np.zeros(N)
fx_st = np.zeros((2, N))


def add(buf, start_sec, x):
    s0 = idx(start_sec)
    m = min(len(x), N - s0)
    if m > 0:
        buf[s0:s0 + m] += x[:m]


def env(n, attack, decay):
    tt = np.arange(n) / SR
    return np.minimum(tt / max(attack, 1e-4), 1) * np.exp(-tt * decay)


def boom(gain=1.0, length=1.6):
    n = int(length * SR)
    tt = np.arange(n) / SR
    fr = 30 + 42 * np.exp(-tt * 7)
    body = np.sin(2 * np.pi * np.cumsum(fr) / SR) * env(n, 0.004, 3.2)
    thump = lp(rng.standard_normal(n), 900) * env(n, 0.001, 22) * 0.6
    return (body + thump) * gain


def ping(gain=1.0):
    n = int(1.4 * SR)
    tt = np.arange(n) / SR
    x = (np.sin(2 * np.pi * 1320 * tt) + 0.4 * np.sin(2 * np.pi * 1980 * tt)) * env(n, 0.003, 4.5)
    return x * gain * 0.12


def zap(gain=1.0):
    n = int(0.9 * SR)
    tt = np.arange(n) / SR
    fr = 300 + 2400 * (1 - np.exp(-tt * 9))
    x = np.sin(2 * np.pi * np.cumsum(fr) / SR) * env(n, 0.01, 6)
    x += bp(rng.standard_normal(n), 2000, 6000) * env(n, 0.002, 14) * 0.5
    return x * gain * 0.07


def beep(freq=2093, dur=0.075, gain=1.0):
    n = int(dur * SR)
    tt = np.arange(n) / SR
    x = np.sin(2 * np.pi * freq * tt) * np.minimum(1, np.minimum(tt, dur - tt) / 0.006)
    return x * gain * 0.09


def whoosh(length=0.9, gain=1.0):
    n = int(length * SR)
    tt = np.arange(n) / SR
    e = np.sin(np.pi * tt / length) ** 2
    x = bp(rng.standard_normal(n), 300, 2400) * e
    return x * gain * 0.05


for h in CUES["hits"]:
    w = W[h["word"]]
    kind = h["kind"]
    if kind == "ping":
        # tres pulsos de radar (coinciden con las ondas del plano)
        # pulsos de radar: uno por plano de radar (pasan rápido)
        for sid, g in [("radarLanza", 1.0), ("radarAncha", 0.75), ("radarMedir", 0.85), ("radarFrente", 0.6)]:
            add(fx, SHOT[sid] + 0.12, ping(g))
    elif kind == "laser":
        add(fx, w["start"] - 0.1, zap())
    elif kind == "lock":
        add(fx, w["end"] - 0.15, beep())
        add(fx, w["end"] - 0.03, beep(2637))
    elif kind == "hit":
        add(fx, w["start"] - 0.01, boom(h.get("gain", 1.0) * 0.55, 1.4))
    elif kind == "hookLock":
        # el punto láser cae sobre tu auto: doble pitido de "medido" y golpe (tiempos del plano, no de la voz)
        lock = SHOT["hook1"] + 0.14
        add(fx, lock - 0.02, beep(2093, 0.07, 1.4))
        add(fx, lock + 0.1, beep(2637, 0.09, 1.4))
        add(fx, lock + 0.02, boom(0.6, 1.4))
    elif kind == "brake":
        # chirrido de neumáticos al frenar (t = 1,2 s del plano "Más adelante la ves. Frenas.")
        n = int(0.9 * SR)
        tt = np.arange(n) / SR
        sq = bp(rng.standard_normal(n), 1800, 4200) * (0.6 + 0.4 * np.sin(2 * np.pi * 23 * tt)) * env(n, 0.03, 3.2)
        add(fx, SHOT["laVes"] + 1.2, sq * 0.05)
    elif kind == "big":
        add(fx, w["start"] - 0.01, boom(1.0, 2.6))
        add(fx, w["start"] - 0.01, boom(0.5, 2.6) * 0.0 + lp(rng.standard_normal(int(2.6 * SR)), 300) * env(int(2.6 * SR), 0.01, 1.6) * 0.15)

# Motor y viento desde el primer cuadro (gancho en plena acción) y en la llegada a la patrulla
for sid, dur, g in [("hook1", SHOT["hook2"] - SHOT["hook1"] + 0.25, 1.0), ("laVes", 1.3, 0.6)]:
    n = int(dur * SR)
    tt = np.arange(n) / SR
    e = np.minimum(1, (n - np.arange(n)) / (0.25 * SR))
    rumble = lp(rng.standard_normal(n), 140) * 2.2 + np.sin(2 * np.pi * (52 + 6 * tt) * tt) * 0.25
    wind = bp(rng.standard_normal(n), 600, 3000) * 0.5
    add(fx, SHOT[sid], (rumble + wind) * e * 0.05 * g)

# Zumbido muy leve del láser mientras el haz está activo
a, b = idx(W[48]["start"]), idx(SHOT["trescientos"])
n = b - a
hum = (np.sin(2 * np.pi * 220 * np.arange(n) / SR) * 0.5 + np.sin(2 * np.pi * 330 * np.arange(n) / SR) * 0.25)
hum *= np.minimum(1, np.minimum(np.arange(n), n - np.arange(n)) / (0.3 * SR)) * 0.006
fx[a:b] += hum

# Whoosh en cada corte (centrado en el corte, con variación de tono para que no suene repetido)
def cut_whoosh(i, gain):
    n = int(0.42 * SR)
    tt = np.arange(n) / SR
    e = np.sin(np.pi * tt / 0.42) ** 3
    lo = 500 + 900 * ((i * 0.618) % 1)
    x = bp(rng.standard_normal(n), lo, lo * 4) * e
    sweep = np.sin(2 * np.pi * np.cumsum(np.linspace(180 + 60 * (i % 3), 70, n)) / SR) * e * 0.25
    return (x + sweep) * gain * 0.06


for i, s_ in enumerate(CUES["shots"][1:], start=1):
    add(fx, SHOT[s_["id"]] - 0.28, cut_whoosh(i, 0.9 if s_["id"] in ("mas1", "mas2", "tresKm", "yaTeMidieron", "doscientos") else 0.6))

fx_st = np.stack([fx, fx]) + wet(fx, 0.45)

# ------------------------------------------------------------------ voz y mezcla
sr, voice = wavfile.read(os.path.join(ROOT, "public/audio/voz.wav"))
voice = voice.astype(np.float64)[:N]
if np.abs(voice).max() > 2:  # PCM 16 bits
    voice /= 32768.0
voice = np.pad(voice, (0, N - len(voice)))
voice = hp(voice, 70)
v_st = np.stack([voice, voice]) + wet(voice, 0.035)

# Ducking: la música baja ~7 dB bajo la voz
venv = np.abs(signal.hilbert(lp(voice, 3000)))
venv = lp(venv, 6, 1)
duck = 1 - 0.55 * np.clip(venv / (np.percentile(venv, 95) + 1e-9), 0, 1)
music_d = music * np.stack([duck, duck])

# fades mínimos para evitar clics (el loop corta en seco a propósito)
fade = np.ones(N)
fade[: int(0.01 * SR)] = np.linspace(0, 1, int(0.01 * SR))
fade[-int(0.04 * SR):] = np.linspace(1, 0, int(0.04 * SR))
pcm16 = lambda x: (np.clip(x, -1, 1) * 32767).astype(np.int16)
os.makedirs(os.path.join(ROOT, "public/audio/stems"), exist_ok=True)

# sin música: voz + efectos (whooshes y golpes), normalizado por separado
dry = (v_st * 1.0 + fx_st * 0.42) * fade
wavfile.write(os.path.join(ROOT, "public/audio/mix_sin_musica.wav"), SR, pcm16((dry / np.abs(dry).max() * 0.89).T))

mix = (v_st * 1.0 + music_d * 0.72 + fx_st * 0.42) * fade
peak = np.abs(mix).max()
mix = mix / peak * 0.89
wavfile.write(os.path.join(ROOT, "public/audio/mix.wav"), SR, pcm16(mix.T))
for name, x in [("musica", music_d * 0.72), ("efectos", fx_st * 0.42), ("voz", v_st)]:
    wavfile.write(os.path.join(ROOT, f"public/audio/stems/{name}.wav"), SR, pcm16((x / peak * 0.89).T))
print(f"mezcla: {T:.2f}s, pico normalizado desde {peak:.3f}")
for k, v in SHOT.items():
    print(f"  {k:14s} {v:6.2f}s")
