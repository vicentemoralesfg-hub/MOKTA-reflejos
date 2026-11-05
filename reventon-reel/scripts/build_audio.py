#!/usr/bin/env python3
"""
MOKTA · Reventón — banda sonora completa.

Genera public/audio/mezcla.wav (48 kHz, estéreo) y stems en public/audio/stems/:
  - voz:      locución ElevenLabs (voz/locucion.wav) recolocada según src/timeline.json
  - reaccion: "¡Chuta!" del conductor, generado con Qwen3-TTS-VoiceDesign (voz/qwen_reaccion_2.wav)
  - efectos:  reventón, neumático golpeteando, chirridos, frenazo, rebobinado, balizas, golpes… (síntesis)
  - ambiente: rodadura, viento, motor (síntesis, cambia en cada corte de cámara)
  - musica:   cama de tensión y pulso de la solución (síntesis)
Todo lo que no es voz se sintetiza aquí: sin samples de terceros.
Tiempos: src/timeline.json (palabras) + src/cues.json (cortes y eventos) — los mismos que usa el video.
"""
import json
import os

import numpy as np
from scipy import signal
from scipy.io import wavfile

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
TL = json.load(open(os.path.join(ROOT, "src", "timeline.json"), encoding="utf-8"))
C = json.load(open(os.path.join(ROOT, "src", "cues.json")))
W = TL["words"]
SR = 48000
DUR = TL["totalS"]
N = int(DUR * SR)
rng = np.random.default_rng(11)


def ws(i):
    return W[i]["s"]


def we(i):
    return W[i]["e"]


def I(t):
    return int(round(t * SR))


# ---------------------------------------------------------------- utilidades
def sos(kind, f, order=2):
    return signal.butter(order, f, btype=kind, fs=SR, output="sos")


def filt(s_, x):
    return signal.sosfilt(s_, x, axis=0)


def noise(n, seed=None):
    g = np.random.default_rng(seed) if seed is not None else rng
    return g.standard_normal(n)


def brown(n, seed=None):
    b = np.cumsum(noise(n, seed))
    b = filt(sos("high", 15), b)
    return b / (np.std(b) + 1e-9)


def env(n, a, r, curve=1.5):
    e = np.ones(n)
    na, nr = min(n, int(a * SR)), min(n, int(r * SR))
    if na > 0:
        e[:na] = np.linspace(0, 1, na) ** curve
    if nr > 0:
        e[n - nr:] *= np.linspace(1, 0, nr) ** curve
    return e


def expdec(n, tau):
    return np.exp(-np.arange(n) / SR / tau)


def st(x, pan=0.0):
    if x.ndim == 2:
        return x
    l = x * np.sqrt(0.5 * (1 - pan)) * 1.4142
    r = x * np.sqrt(0.5 * (1 + pan)) * 1.4142
    return np.stack([l, r], 1)


def put(buf, x, at, gain=1.0, pan=0.0):
    x = st(x, pan)
    i = I(at)
    if i < 0:
        x = x[-i:]
        i = 0
    j = min(len(buf), i + len(x))
    if j > i:
        buf[i:j] += x[: j - i] * gain


def db(v):
    return 10 ** (v / 20)


def norm(x, peak=1.0):
    return x / (np.max(np.abs(x)) + 1e-9) * peak


# ---------------------------------------------------------------- buses
voice = np.zeros((N, 2))
react = np.zeros((N, 2))
sfx = np.zeros((N, 2))
amb = np.zeros((N, 2))
mus = np.zeros((N, 2))

# ---------------------------------------------------------------- 1) voz
sr_v, v = wavfile.read(os.path.join(ROOT, "voz", "locucion.wav"))
v = v.astype(np.float64) / 32768.0
if v.ndim == 2:
    v = v.mean(1)
if sr_v != SR:
    v = signal.resample_poly(v, SR, sr_v)
v = filt(sos("high", 70), v)
# leve presencia
v = v + 0.25 * filt(sos("band", [2500, 5000]), v)
for a, b, o in TL["voiceSegments"]:
    seg = v[I(a):I(b)].copy()
    seg *= env(len(seg), 0.004, 0.012, 1)
    put(voice, seg, o)
# nivelador de voz: acerca cada tramo al nivel típico (±6 dB), sin bombeo
vm_ = voice[:, 0]
pw = filt(sos("low", 3), vm_ ** 2)
rms = np.sqrt(np.maximum(pw, 1e-12))
act_ = rms > 0.02 * np.max(rms)
target = np.median(rms[act_])
gain_ = np.where(act_, np.clip(target / rms, db(-6), db(6)), 1.0)
gain_ = filt(sos("low", 2), gain_)
gain_ = np.clip(gain_, db(-6), db(6))
voice = voice * gain_[:, None]
voice = voice / (np.max(np.abs(voice)) + 1e-9) * 0.7

# envolvente de voz para el ducking
vm = np.abs(voice[:, 0])
att = filt(sos("low", 18), vm)
venv = np.maximum.accumulate(np.zeros(1))  # placeholder
k = np.clip(att / (np.percentile(att[att > 1e-4], 70) + 1e-9), 0, 1)
# suavizado asimétrico (ataque rápido, suelta lenta)
duck = np.zeros(N)
a_c, r_c = np.exp(-1 / (0.02 * SR)), np.exp(-1 / (0.35 * SR))
acc = 0.0
for i0 in range(0, N, 48):
    tgt = k[i0]
    c = a_c if tgt > acc else r_c
    acc = tgt + (acc - tgt) * c ** 48
    duck[i0:i0 + 48] = acc


# ---------------------------------------------------------------- 2) generadores
def road(dur, kmh, inside, seed, flat=False):
    n = int(dur * SR)
    kk = kmh / 100.0
    out = np.zeros((n, 2))
    g = np.random.default_rng(seed)
    for ch in range(2):
        w_ = g.standard_normal(n)
        tire = filt(sos("band", [90, 650 + 500 * kk]), w_) * 0.55 + brown(n, seed + ch) * 0.4
        wind = filt(sos("band", [700, 6000]), g.standard_normal(n)) * (0.08 + 0.4 * kk * kk)
        out[:, ch] = tire * (0.35 + 0.5 * kk) + wind * (0.35 if inside else 1.0)
    f0 = 38 + 0.42 * kmh
    ts = np.arange(n) / SR
    eng = sum(np.sin(2 * np.pi * f0 * h * ts + h) / h ** 1.2 for h in range(1, 8))
    eng = filt(sos("low", 600), eng) * (0.22 if inside else 0.1)
    out += eng[:, None]
    if inside:
        out = filt(sos("low", 1100), out) * 1.3
    if flat:
        out += st(flap(dur, 13.4 * kk, 0.9), 0.3) * 0.0  # el golpeteo se agrega aparte
    return out * kk ** 0.5


def flap(dur, rate, gain=1.0, seed=3, rate_end=None):
    """Golpeteo del neumático reventado: un golpe por vuelta de rueda."""
    n = int(dur * SR)
    out = np.zeros(n)
    g = np.random.default_rng(seed)
    t = 0.0
    th_n = int(0.05 * SR)
    th = np.arange(th_n) / SR
    while t < dur:
        r = rate if rate_end is None else rate + (rate_end - rate) * (t / dur)
        if r <= 0.2:
            break
        i0 = int(t * SR)
        body = np.sin(2 * np.pi * (75 + g.random() * 20) * th) * np.exp(-th / 0.018)
        slap = filt(sos("band", [300, 2500]), g.standard_normal(th_n)) * np.exp(-th / 0.008) * 0.6
        x = (body + slap) * (0.75 + 0.5 * g.random())
        j = min(n, i0 + th_n)
        out[i0:j] += x[: j - i0]
        t += 1.0 / r * (0.92 + 0.16 * g.random())
    return out * gain


def bang(seed=1, size=1.0):
    """Reventón: transitorio seco + cuerpo grave + escape de aire + jirones."""
    n = int(1.6 * SR)
    g = np.random.default_rng(seed)
    ts = np.arange(n) / SR
    crack = g.standard_normal(n) * np.exp(-ts / 0.006)
    crack = filt(sos("high", 600), crack) * 1.4
    f = 38 + 110 * np.exp(-ts / 0.05)
    body = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-ts / 0.16) * 1.3
    air = filt(sos("band", [900, 7000]), g.standard_normal(n)) * np.exp(-ts / 0.22) * 0.55
    air *= np.clip(ts / 0.01, 0, 1)
    debris = np.zeros(n)
    for _ in range(26):
        t0 = 0.02 + g.random() * 0.75
        m = int(0.03 * SR)
        clk = filt(sos("band", [500, 4000]), g.standard_normal(m)) * np.exp(-np.arange(m) / SR / 0.006)
        i0 = int(t0 * SR)
        debris[i0:i0 + m] += clk * (0.15 + 0.3 * g.random()) * np.exp(-t0 / 0.5)
    x = crack + body + air + debris
    x = x / np.max(np.abs(x))
    # espacio: cola breve
    ir_n = int(0.9 * SR)
    ir = g.standard_normal(ir_n) * np.exp(-np.arange(ir_n) / SR / 0.25)
    ir = filt(sos("low", 3000), ir)
    wet = signal.fftconvolve(x, ir)[:n]
    x = x + 0.25 * wet / (np.max(np.abs(wet)) + 1e-9)
    return norm(x, size)


def screech(dur, seed=5, pitch=1.0, gain=1.0):
    n = int(dur * SR)
    g = np.random.default_rng(seed)
    ts = np.arange(n) / SR
    out = np.zeros(n)
    for fc, a in ((1050, 1.0), (1650, 0.6), (2450, 0.35)):
        fm = 1 + 0.06 * filt(sos("low", 4), g.standard_normal(n)) * 8
        base = filt(sos("band", [fc * pitch * 0.94, fc * pitch * 1.06], 3), g.standard_normal(n))
        out += base * a * fm
    rub = filt(sos("band", [120, 900]), g.standard_normal(n)) * 0.5
    x = (out + rub) * env(n, 0.06, 0.25)
    am = 1 + 0.25 * np.sin(2 * np.pi * 7.3 * ts) * np.sin(2 * np.pi * 0.9 * ts)
    return norm(x * am, gain)


def whoosh(dur, up=True, seed=7, gain=0.6, lo=300, hi=6000):
    n = int(dur * SR)
    g = np.random.default_rng(seed)
    x = g.standard_normal(n)
    out = np.zeros(n)
    steps = 24
    for s_ in range(steps):
        a, b = s_ * n // steps, (s_ + 1) * n // steps
        f = s_ / (steps - 1)
        fc = lo * (hi / lo) ** (f if up else 1 - f)
        seg = filt(sos("band", [fc * 0.7, min(fc * 1.4, 20000)]), x[max(0, a - 2000):b])[-(b - a):]
        out[a:b] = seg
    e = np.sin(np.pi * np.linspace(0, 1, n)) ** (1.5 if up else 1.0)
    return norm(out * e, gain)


def hit(gain=1.0, seed=9, f0=55):
    n = int(1.8 * SR)
    ts = np.arange(n) / SR
    f = f0 + 90 * np.exp(-ts / 0.04)
    sub = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-ts / 0.45)
    g = np.random.default_rng(seed)
    clk = filt(sos("band", [800, 6000]), g.standard_normal(n)) * np.exp(-ts / 0.01) * 0.5
    tail = filt(sos("low", 800), g.standard_normal(n)) * np.exp(-ts / 0.35) * 0.25
    return norm(sub + clk + tail, gain)


def heartbeat(gain=1.0):
    n = int(0.6 * SR)
    ts = np.arange(n) / SR
    def th(f0, dec, a, off):
        t2 = np.clip(ts - off, 0, None)
        f = f0 * np.exp(-t2 * 9) + 36
        return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t2 / dec) * a * (ts >= off)
    return norm(th(68, 0.07, 1.0, 0) + th(60, 0.06, 0.65, 0.17), gain)


def tick(gain=0.5, f=2600, seed=12):
    n = int(0.03 * SR)
    g = np.random.default_rng(seed)
    x = filt(sos("band", [f * 0.6, f * 1.6]), g.standard_normal(n)) * expdec(n, 0.004)
    x += np.sin(2 * np.pi * f * 0.5 * np.arange(n) / SR) * expdec(n, 0.006) * 0.5
    return norm(x, gain)


def ping(f=1320, gain=0.35):
    n = int(0.7 * SR)
    ts = np.arange(n) / SR
    x = (np.sin(2 * np.pi * f * ts) + 0.4 * np.sin(2 * np.pi * f * 2.01 * ts)) * np.exp(-ts / 0.18) * np.clip(ts / 0.003, 0, 1)
    return norm(x, gain)


def riser(dur, gain=0.6):
    n = int(dur * SR)
    ts = np.arange(n) / SR
    f = 120 * (8 ** (ts / dur))
    tone = np.sin(2 * np.pi * np.cumsum(f) / SR) + 0.5 * np.sin(2 * np.pi * np.cumsum(f * 1.5) / SR)
    nz = whoosh(dur, True, 21, 1.0, 200, 9000)
    x = (0.5 * tone + nz) * (ts / dur) ** 2
    return norm(x, gain)


def rewind_snd(dur, gain=0.7):
    n = int(dur * SR)
    ts = np.arange(n) / SR
    g = np.random.default_rng(31)
    whirr = filt(sos("band", [1500, 7000]), g.standard_normal(n)) * 0.4
    chirps = np.zeros(n)
    period = 0.085
    k_ = 0
    while k_ * period < dur:
        i0 = int(k_ * period * SR)
        m = int(0.06 * SR)
        tt = np.arange(m) / SR
        f = 900 + 2600 * (tt / 0.06) + 400 * (k_ % 3)
        c = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.sin(np.pi * tt / 0.06) ** 2
        chirps[i0:i0 + m] += c[: max(0, min(m, n - i0))]
        k_ += 1
    wob = np.sin(2 * np.pi * 9 * ts) * 0.3 + 1
    x = (whirr + chirps * 0.5) * wob * env(n, 0.05, 0.12)
    return norm(x, gain)


def kick(gain=1.0):
    n = int(0.35 * SR)
    ts = np.arange(n) / SR
    f = 46 + 120 * np.exp(-ts / 0.03)
    return norm(np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-ts / 0.16), gain)


def hat(gain=0.2, seed=40):
    n = int(0.05 * SR)
    g = np.random.default_rng(seed)
    return norm(filt(sos("high", 7000), g.standard_normal(n)) * expdec(n, 0.012), gain)


def pad(dur, freqs, lp=900, seed=0, gain=0.3):
    n = int(dur * SR)
    ts = np.arange(n) / SR
    x = np.zeros((n, 2))
    g = np.random.default_rng(seed)
    for i, f in enumerate(freqs):
        for ch in range(2):
            for d in (-0.15, 0.0, 0.13):
                ph = g.random() * 6.28
                fr = f * (1 + d / 100 + (0.0007 if ch else -0.0007))
                x[:, ch] += 2 * ((ts * fr + ph / 6.28) % 1) - 1
    x = filt(sos("low", lp), x) / (len(freqs) * 3)
    return x * gain


# ---------------------------------------------------------------- 3) ambiente por plano
def amb_seg(t0, t1, kind, kmh=100, seed=0, gain=1.0, flat_rate=None, flat_end=None, slow=False):
    dur = t1 - t0
    if dur <= 0:
        return
    if slow:
        n = int(dur * SR)
        x = brown(n, seed) * 0.6 + filt(sos("low", 160), noise(n, seed + 1)) * 0.8
        x = filt(sos("low", 380), x)
        drone = np.sin(2 * np.pi * 36.7 * np.arange(n) / SR) * 0.4
        y = st(x + drone) * 0.55
    else:
        y = road(dur, kmh, kind == "inside", seed)
    if flat_rate:
        f = flap(dur, flat_rate, 1.0, seed + 5, flat_end)
        if kind == "inside":
            f = filt(sos("low", 900), f)
        y = y + st(f, 0.35) * (0.9 if not slow else 0.7)
    y *= env(len(y), 0.006, 0.01, 1)[:, None]
    put(amb, y, t0, gain)


A = C
amb_seg(0, A["wheel"], "inside", 100, 1)
amb_seg(A["wheel"], A["burst1"], "outside", 100, 2, 1.3)
amb_seg(A["burst1"] + 0.03, A["pov2"], "outside", 100, 3, 1.0, slow=True, flat_rate=4.0)
amb_seg(A["pov2"], A["brakeChase"], "inside", 95, 4, 1.0, flat_rate=6.5, flat_end=6.0)
amb_seg(A["brakeChase"], A["drone1"], "outside", 85, 5, 1.0, flat_rate=10, flat_end=8)
amb_seg(A["drone1"], A["freeze1"], "outside", 55, 6, 0.8)
amb_seg(A["pov3"], A["burst2"], "inside", 100, 7, 0.9)
amb_seg(A["burst2"] + 0.02, A["dronePull"], "inside", 98, 8, 1.0, flat_rate=13.0, flat_end=12.5)
amb_seg(A["dronePull"], A["foot"], "outside", 95, 9, 0.9, flat_rate=7.0)
amb_seg(A["foot"], A["chaseBrake"], "inside", 90, 10, 0.55, flat_rate=7.5, flat_end=7.0)
amb_seg(A["chaseBrake"], A["drone2"], "outside", 85, 11, 1.0, flat_rate=11, flat_end=8)
amb_seg(A["drone2"], A["freeze2"], "outside", 50, 12, 0.8)
amb_seg(A["tele1"], A["vol1"], "outside", 60, 13, 0.7, slow=True, flat_rate=3.4, flat_end=2.0)
amb_seg(A["vol1"], A["volPov"], "outside", 70, 14, 0.8, slow=True, flat_rate=2.6)
amb_seg(A["volPov"], A["volDrone"], "inside", 90, 15, 1.0, flat_rate=5.5)
amb_seg(A["volDrone"], A["volFreeze"], "outside", 80, 16, 0.9)
amb_seg(A["step1"], A["step2"], "inside", 92, 17, 0.6, flat_rate=7.5, flat_end=7.0)
amb_seg(A["step2"], A["step3"], "outside", 88, 18, 0.55, flat_rate=11.5, flat_end=11.0)
amb_seg(A["step3"], A["step4"], "outside", 80, 19, 0.55, flat_rate=10.5, flat_end=8.0)
amb_seg(A["step4"], A["close"], "outside", 55, 20, 0.5, flat_rate=7.5, flat_end=0.6)
# cierre: auto detenido en la berma, tránsito lejano
n_end = int((DUR - A["close"]) * SR)
far = filt(sos("band", [80, 900]), brown(n_end, 77)) * 0.18
pass_by = np.zeros(n_end)
tp = 2.2
m = int(3.0 * SR)
tt = np.arange(m) / SR - 1.5
pass_by[int((tp - 1.5) * SR):int((tp - 1.5) * SR) + m] = filt(sos("band", [200, 3000]), noise(m, 78)) / (1 + (tt * 6) ** 2) * 0.7
put(amb, st(far + pass_by, -0.3) * env(n_end, 0.1, 3.0)[:, None], A["close"], 0.6)

# ---------------------------------------------------------------- 4) efectos
put(sfx, bang(1, 1.0), A["burst1"], 1.0, 0.25)
put(sfx, hit(0.6, 2, 42), A["burst1"], 0.8)
put(sfx, whoosh(0.35, False, 3, 0.4, 400, 5000), A["pov2"] - 0.05, 0.6)
# frenazo + chirrido
put(sfx, hit(0.5, 4, 50), A["brakeSlam1"], 0.7)
put(sfx, screech(A["freeze1"] - A["brakeSlam1"] + 0.1, 5, 1.0, 0.75), A["brakeSlam1"], 0.5, 0.1)
# congelado: golpe + latidos + pitido
put(sfx, hit(1.0, 6, 40), A["freeze1"], 1.0)
for kb in range(2):
    put(sfx, heartbeat(0.9), A["freeze1"] + 0.12 + kb * 0.75, 0.9)
n_r = int((A["rewind"] - A["freeze1"]) * SR)
ring_ = np.sin(2 * np.pi * 3100 * np.arange(n_r) / SR) * env(n_r, 0.05, 0.4) * 0.05
put(sfx, ring_, A["freeze1"], 1.0)
# rebobinado
rw = rewind_snd(A["pov3"] - A["rewind"], 0.75)
# deja espacio a "Rebobinemos": el rebobinado baja mientras se dice la palabra
gap = np.ones(len(rw))
g0, g1 = I(ws(26) - 0.05 - A["rewind"]), I(we(26) + 0.05 - A["rewind"])
gap[g0:g1] = 0.25
gap = filt(sos("low", 20), gap)
put(sfx, rw * gap, A["rewind"], 0.8)
put(sfx, whoosh(0.4, True, 8, 0.6), A["pov3"] - 0.3, 0.6)
# repetición: tensión, latido y reventón
for kb in range(2):
    put(sfx, heartbeat(0.55), A["pov3"] + 0.15 + kb * 0.62, 0.7)
put(sfx, bang(2, 1.0), A["burst2"], 1.15, 0.3)
put(sfx, hit(0.8, 10, 44), A["burst2"], 0.9)
# pedales
put(sfx, whoosh(0.5, True, 13, 0.35, 250, 2500), A["footLift"], 0.7, -0.2)
put(sfx, hit(0.7, 14, 48), A["footSlam"] - 0.03, 0.8)
n_c = int(0.06 * SR)
put(sfx, filt(sos("band", [600, 3000]), noise(n_c, 15)) * expdec(n_c, 0.01) * 0.8, A["footSlam"], 1.0)
put(sfx, screech(A["freeze2"] - A["chaseBrake"] + 0.05, 16, 1.03, 0.8), A["chaseBrake"], 0.45, -0.1)
put(sfx, hit(1.0, 17, 40), A["freeze2"], 0.9)
# telestración: sonidos de interfaz
for t_ui, kind in ((ws(66), "ping"), (ws(68), "sw"), (ws(70), "sw"), (ws(78), "hit"), (ws(81), "sw"), (ws(86), "sw")):
    if kind == "ping":
        put(sfx, ping(1320, 0.4), t_ui, 0.8, 0.3)
    elif kind == "sw":
        put(sfx, whoosh(0.45, True, int(t_ui * 10), 0.35, 500, 7000), t_ui - 0.05, 0.7)
    else:
        put(sfx, hit(0.45, 20, 60), t_ui, 0.7)
put(sfx, ping(990, 0.35), ws(30) + 0.05, 0.7, 0.3)
put(sfx, whoosh(0.45, True, 22, 0.3, 500, 7000), ws(33) - 0.05, 0.7)
# chirrido en cámara lenta (más grave) durante el giro analizado
put(sfx, screech(A["vol1"] - ws(84), 23, 0.55, 0.5), ws(84), 0.6)
# volantazo
put(sfx, whoosh(0.3, True, 24, 0.7, 300, 5000), A["volJerk"] - 0.08, 0.6)
put(sfx, screech(A["volFreeze"] - A["volJerk"], 25, 1.05, 0.7), A["volJerk"] + 0.05, 0.35, -0.3)
put(sfx, hit(1.0, 26, 42), A["volFreeze"], 1.0)
# "¿qué haces?": subida y caída
put(sfx, riser(A["step1"] - A["queHaces"], 0.55), A["queHaces"], 0.8)
put(sfx, hit(0.9, 27, 46), ws(104), 0.7)
put(sfx, hit(1.0, 28, 40), A["step1"], 0.9)
# pasos: cada número entra con un golpe y un ping
for t_s in (ws(106), ws(113), ws(121)):
    put(sfx, ping(1760, 0.3), t_s, 0.6, 0.2)
    put(sfx, whoosh(0.35, True, int(t_s * 7), 0.3), t_s - 0.12, 0.6)
put(sfx, ping(1175, 0.25), ws(107) + 0.1, 0.5)
# lista final: tics de verificación
for t_s in (ws(140), ws(142), ws(146)):
    put(sfx, ping(1568, 0.3), t_s + 0.05, 0.6, -0.2)
# relé de balizas (≈90 por minuto) desde que se encienden hasta el final
t_haz = ws(142) - 0.08
t_ = t_haz
kk = 0
while t_ < DUR - 0.2:
    put(sfx, tick(0.35, 2600 if kk % 2 == 0 else 2100, 50 + kk % 5), t_, 0.55 if t_ < A["end"] else 0.12, 0.15)
    t_ += 0.36 if kk % 2 == 0 else 0.307
    kk += 1
# cierre
put(sfx, hit(0.7, 29, 50), ws(150) - 0.06, 0.45)
put(sfx, hit(1.0, 30, 40), we(159) + 0.02, 0.8)
put(sfx, whoosh(0.5, True, 31, 0.4), ws(160) - 0.3, 0.6)
pop_n = int(0.25 * SR)
tp_ = np.arange(pop_n) / SR
pop = np.sin(2 * np.pi * (500 + 700 * tp_ / 0.25) * tp_) * np.exp(-tp_ / 0.05)
put(sfx, norm(pop, 0.5) + ping(2093, 0.2)[:pop_n], ws(160) + 0.1, 0.8)
put(sfx, hit(0.6, 32, 55), we(164) + 0.05, 0.6)

# reacción del conductor (Qwen3-TTS) justo después del reventón de la repetición
sr_q, q = wavfile.read(os.path.join(ROOT, "voz", "qwen_reaccion_2.wav")) if os.path.exists(os.path.join(ROOT, "voz", "qwen_reaccion_2.wav")) else (None, None)
if q is not None:
    q = q.astype(np.float64)
    if q.dtype.kind == "i" or np.max(np.abs(q)) > 2:
        q = q / 32768.0
    q = signal.resample_poly(q, SR, sr_q)
    q = filt(sos("high", 120), q)
    q = filt(sos("low", 7500), q)  # dentro del auto
    put(react, norm(q, 0.55), A["burst2"] + 0.16, 1.0, -0.1)

# ---------------------------------------------------------------- 5) música
D = 73.42
def place_pad(t0, t1, freqs, lp, gain, seed, a=0.08, r=0.15):
    p = pad(t1 - t0, freqs, lp, seed, gain)
    p *= env(len(p), a, r)[:, None]
    put(mus, p, t0)

Dm = [D, D * 1.5, D * 2 * 1.189]
Bb = [D * 0.794 * 2 / 2 * 2, D * 1.189 * 2, D * 1.498 * 2]
F = [D * 1.335 * 2 / 2, D * 1.682, D * 2]
# tensión: gancho, repetición, análisis, volantazo
place_pad(0, A["freeze1"], Dm, 700, 0.5, 1)
place_pad(A["pov3"], A["freeze2"], Dm, 600, 0.45, 2)
place_pad(A["porque"], A["vol1"], [D, D * 1.498, D * 2.378], 500, 0.4, 3, 0.4, 0.3)
place_pad(A["vol1"], A["volFreeze"], Dm, 900, 0.45, 4)
# pulso grave (tipo latido) durante la tensión
BPM = 96
beat = 60 / BPM
for t0, t1, gk in ((0.0, A["freeze1"], 0.55), (A["pov3"], A["burst2"], 0.35), (A["dronePull"], A["freeze2"], 0.5), (A["tele1"], A["vol1"], 0.35), (A["vol1"], A["volFreeze"], 0.5)):
    t_ = t0
    while t_ < t1 - 0.05:
        put(mus, kick(gk), t_)
        t_ += beat
# solución: pulso firme en Fa mayor / Re menor, sube hasta el cierre
place_pad(A["step1"], A["close"], [D * 1.335, D * 1.682, D * 2], 1300, 0.42, 5, 0.05, 0.6)
t_ = A["step1"]
kb = 0
while t_ < A["close"] - 0.05:
    put(mus, kick(0.75), t_)
    if kb % 2 == 1:
        put(mus, filt(sos("band", [180, 2500]), noise(int(0.12 * SR), 60 + kb)) * expdec(int(0.12 * SR), 0.04) * 0.4, t_)
    put(mus, hat(0.18, 80 + kb), t_ + beat / 2, 1.0, 0.3)
    # bajo
    n_b = int(beat * SR * 0.9)
    tb = np.arange(n_b) / SR
    root_ = D / 2 * (1.335 if (kb // 4) % 2 == 0 else 1.0)
    bass = np.sin(2 * np.pi * root_ * tb) * np.exp(-tb / 0.35) * 0.35
    put(mus, filt(sos("low", 300), bass), t_)
    t_ += beat
    kb += 1
# cierre: acorde que resuelve
place_pad(A["close"], DUR, [D, D * 1.335, D * 1.682, D * 2], 800, 0.22, 6, 0.3, 2.5)

# ---------------------------------------------------------------- 6) mezcla
def lufs_like(x):
    """RMS ponderado aproximado (para equilibrar buses, no reemplaza a loudnorm)."""
    y = filt(sos("high", 60), x)
    return 20 * np.log10(np.sqrt(np.mean(y ** 2)) + 1e-12)

voice_g = 1.0
mus_bus = mus * db(-18) * (1 - 0.6 * duck)[:, None]
amb_bus = amb * db(-20) * (1 - 0.7 * duck)[:, None]
sfx_bus = sfx * db(-9) * (1 - 0.62 * duck)[:, None]
react_bus = react * db(-1)

# reverberación corta común para efectos y música (espacio cinematográfico)
ir_n = int(1.4 * SR)
irg = np.random.default_rng(99)
ir = np.stack([irg.standard_normal(ir_n), irg.standard_normal(ir_n)], 1) * np.exp(-np.arange(ir_n) / SR / 0.35)[:, None]
ir = filt(sos("low", 4500), ir)
ir /= np.sqrt(np.sum(ir ** 2))
for bus, wetg in ((sfx_bus, 0.18), (mus_bus, 0.25)):
    wet = np.stack([signal.fftconvolve(bus[:, c], ir[:, c])[:N] for c in range(2)], 1)
    bus += wet * wetg

mix = voice * voice_g + react_bus + mus_bus + amb_bus + sfx_bus
# limitador suave
peak = np.max(np.abs(mix))
mix = np.tanh(mix / peak * 1.4) / np.tanh(1.4) * 0.95

out_dir = os.path.join(ROOT, "public", "audio")
os.makedirs(os.path.join(out_dir, "stems"), exist_ok=True)
def save(path, x):
    wavfile.write(path, SR, (np.clip(x, -1, 1) * 32767).astype(np.int16))
save(os.path.join(out_dir, "mezcla.wav"), mix)
import subprocess
for name, bus in (("voz", voice), ("reaccion_qwen3", react_bus), ("musica", mus_bus), ("ambiente", amb_bus), ("efectos", sfx_bus)):
    # stems normalizados a -1 dBFS de pico, en FLAC (sin pérdida, la mitad de peso)
    tmp = os.path.join(out_dir, "stems", f"{name}.wav")
    save(tmp, bus / max(1e-9, np.max(np.abs(bus))) * 0.9)
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", tmp, "-c:a", "flac", tmp[:-4] + ".flac"], check=True)
    os.remove(tmp)
print("ok", DUR, "s", {k: round(lufs_like(b), 1) for k, b in (("voz", voice), ("mus", mus_bus), ("amb", amb_bus), ("sfx", sfx_bus))})

if os.environ.get("AUDIO_DEBUG"):
    bg = react_bus + mus_bus + amb_bus + sfx_bus
    for t0 in np.arange(0, DUR, 2.0):
        a, b = I(t0), I(t0 + 2.0)
        vv = voice[a:b, 0]
        act = np.abs(filt(sos("low", 10), np.abs(vv))) > 0.01
        vr = 20 * np.log10(np.sqrt(np.mean(vv[act] ** 2)) + 1e-9) if act.any() else -99
        br = 20 * np.log10(np.sqrt(np.mean(bg[a:b][act] ** 2)) + 1e-9) if act.any() else -99
        bp = 20 * np.log10(np.max(np.abs(bg[a:b])) + 1e-9)
        print(f"{t0:5.1f} voz {vr:6.1f}  fondo {br:6.1f}  (pico fondo {bp:6.1f})  diferencia {vr - br:5.1f} dB")
if os.environ.get("AUDIO_DEBUG"):
    for t0 in (14.0, 32.0, 58.0):
        a, b = I(t0), I(t0 + 2.0)
        vv = voice[a:b, 0]
        act = np.abs(filt(sos("low", 10), np.abs(vv))) > 0.01
        print(t0, {n: round(20 * np.log10(np.sqrt(np.mean(x[a:b][act] ** 2)) + 1e-9), 1) for n, x in (("voz", voice), ("mus", mus_bus), ("amb", amb_bus), ("sfx", sfx_bus), ("react", react_bus))})
