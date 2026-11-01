#!/usr/bin/env python3
"""
MOKTA · Mito de calentar el auto — música y diseño sonoro 100 % sintetizados (sin samples de terceros).

Lee src/timeline.json (duraciones de escena + instante de cada palabra de la locución) y escribe:
  public/audio/mix.wav         locución + música (con ducking) + efectos   → versión principal
  public/audio/mix_sinvoz.wav  música + efectos (sin locución)             → versión alternativa
  public/audio/stems/*.wav     musica, efectos, voz
"""
import json
import os

import numpy as np
from scipy import signal
from scipy.io import wavfile

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
T = json.load(open(os.path.join(ROOT, "src", "timeline.json")))
SR = 48000
FPS = T["fps"]
rng = np.random.default_rng(21)

# ---------------------------------------------------------------- línea de tiempo
START = {}
t = 0
for b in T["beats"]:
    START[b["id"]] = t
    t += b["duration"]
TOTAL_F = t
TOTAL = TOTAL_F / FPS
N = int(round(TOTAL * SR))
BEAT = {b["id"]: b for b in T["beats"]}


def norm_w(s):
    import unicodedata

    s = unicodedata.normalize("NFD", s.lower())
    return "".join(c for c in s if c.isalnum() and unicodedata.category(c) != "Mn")


def at(bid, frame=0.0):
    """Segundos absolutos para el fotograma `frame` de la escena `bid`."""
    return (START[bid] + frame) / FPS


def cue(bid, word, fallback, nth=0):
    ws = [w for w in BEAT[bid].get("words", []) if norm_w(w["w"]) == norm_w(word)]
    fr = ws[nth]["t"] if len(ws) > nth else fallback
    return at(bid, fr)


def idx(sec):
    return int(round(sec * SR))


# ---------------------------------------------------------------- utilidades DSP
def sos_bp(lo, hi, order=2):
    return signal.butter(order, [lo, min(hi, SR / 2 - 100)], btype="band", fs=SR, output="sos")


def sos_lp(fc, order=2):
    return signal.butter(order, min(fc, SR / 2 - 100), btype="low", fs=SR, output="sos")


def sos_hp(fc, order=2):
    return signal.butter(order, fc, btype="high", fs=SR, output="sos")


def filt(sos, x):
    return signal.sosfilt(sos, x)


def noise(n):
    return rng.standard_normal(n)


def env_exp(n, dec):
    return np.exp(-np.arange(n) / SR / dec)


def fade(x, a=0.005, r=0.01):
    x = x.copy()
    na, nr = int(a * SR), int(r * SR)
    if na:
        x[:na] *= np.linspace(0, 1, na)[:, None] if x.ndim > 1 else np.linspace(0, 1, na)
    if nr:
        x[-nr:] *= np.linspace(1, 0, nr)[:, None] if x.ndim > 1 else np.linspace(1, 0, nr)
    return x


def place(buf, x, sec, gain=1.0, pan=0.0):
    i = idx(sec)
    if x.ndim == 1:
        x = np.stack([x * np.sqrt(1 - pan), x * np.sqrt(1 + pan)], 1)
    if i < 0:
        x = x[-i:]
        i = 0
    j = min(len(buf), i + len(x))
    if j > i:
        buf[i:j] += x[: j - i] * gain


def saw(f, ts):
    return 2 * (ts * f - np.floor(0.5 + ts * f))


def mtof(m):
    return 440.0 * 2 ** ((m - 69) / 12)


# ---------------------------------------------------------------- instrumentos
def kick(gain=1.0):
    n = int(0.42 * SR)
    ts = np.arange(n) / SR
    f = 46 + 110 * np.exp(-ts * 28)
    ph = 2 * np.pi * np.cumsum(f) / SR
    body = np.sin(ph) * np.exp(-ts / 0.16)
    click = filt(sos_hp(2500), noise(n)) * np.exp(-ts / 0.004) * 0.25
    return np.tanh((body + click) * 1.6) * gain


def snare(gain=1.0):
    n = int(0.3 * SR)
    ts = np.arange(n) / SR
    nz = filt(sos_bp(1200, 7000), noise(n)) * np.exp(-ts / 0.07)
    tone = np.sin(2 * np.pi * 190 * ts) * np.exp(-ts / 0.05) * 0.6
    clap = np.zeros(n)
    for k, d in enumerate((0, 0.011, 0.022)):
        i = int(d * SR)
        m = int(0.02 * SR)
        clap[i:i + m] += filt(sos_bp(900, 3500), noise(m)) * np.exp(-np.arange(m) / SR / 0.006)
    return (nz * 0.8 + tone + clap * 0.7) * gain


def hat(open_=False, gain=1.0):
    n = int((0.22 if open_ else 0.05) * SR)
    x = filt(sos_hp(7500, 4), noise(n)) * env_exp(n, 0.07 if open_ else 0.012)
    return x * gain


def pluck(f, dur=0.22, bright=3000, gain=1.0):
    n = int(dur * SR)
    ts = np.arange(n) / SR
    x = saw(f, ts) * 0.6 + saw(f * 1.005, ts) * 0.4
    x = filt(sos_lp(bright), x) * np.exp(-ts / (dur * 0.35))
    return fade(x, 0.002, 0.02) * gain


def bass_note(f, dur, gain=1.0, drive=1.0):
    n = int(dur * SR)
    ts = np.arange(n) / SR
    x = np.sin(2 * np.pi * f * ts) + 0.35 * saw(f, ts)
    x = filt(sos_lp(380), x)
    x = np.tanh(x * 1.4 * drive) * np.minimum(1, np.exp(-(ts - 0.02) / (dur * 0.9)))
    return fade(x, 0.004, 0.03) * gain


def pad(freqs, dur, lp=1200, gain=1.0):
    n = int(dur * SR)
    ts = np.arange(n) / SR
    x = np.zeros(n)
    for i, f in enumerate(freqs):
        for d in (-0.18, 0.0, 0.17):
            x += saw(f * (1 + d / 100), ts + i * 0.013)
    x = filt(sos_lp(lp), x) / (len(freqs) * 3)
    return fade(x, 0.08, 0.15) * gain


def riser(dur, f0=200, f1=2400, gain=1.0):
    n = int(dur * SR)
    ts = np.arange(n) / SR
    k = ts / dur
    out = np.zeros(n)
    w = noise(n)
    blocks = 30
    for b in range(blocks):
        a, z = b * n // blocks, (b + 1) * n // blocks
        c = f0 * (f1 / f0) ** (b / blocks)
        seg = filt(sos_bp(c * 0.7, c * 1.6), w[max(0, a - 3000):z])[-(z - a):]
        out[a:z] = seg
    sweep = np.sin(2 * np.pi * np.cumsum(f0 * (f1 / f0) ** k / 4) / SR) * 0.3
    return (out * 0.8 + sweep) * k ** 2 * gain


def whoosh(dur=0.45, up=True, gain=1.0):
    n = int(dur * SR)
    w = noise(n)
    out = np.zeros(n)
    blocks = 24
    for b in range(blocks):
        a, z = b * n // blocks, (b + 1) * n // blocks
        c = 300 * (10 ** (b / blocks if up else 1 - b / blocks))
        seg = filt(sos_bp(c * 0.6, min(c * 1.9, 20000)), w[max(0, a - 2000):z])[-(z - a):]
        out[a:z] = seg
    e = np.sin(np.linspace(0, np.pi, n)) ** 1.6
    return out * e * gain


def boom(dur=1.4, f0=70, f1=30, gain=1.0):
    n = int(dur * SR)
    ts = np.arange(n) / SR
    f = f1 + (f0 - f1) * np.exp(-ts * 5)
    x = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-ts / (dur * 0.33))
    crack = filt(sos_bp(120, 3000), noise(n)) * np.exp(-ts / 0.05) * 0.7
    tail = filt(sos_lp(900), noise(n)) * np.exp(-ts / 0.4) * 0.12
    return np.tanh((x + crack + tail) * 1.3) * gain


def tick(f=2600, dur=0.04, gain=1.0):
    n = int(dur * SR)
    ts = np.arange(n) / SR
    return (np.sin(2 * np.pi * f * ts) * 0.6 + filt(sos_hp(4000), noise(n)) * 0.4) * np.exp(-ts / 0.008) * gain


def click_mech(gain=1.0, f=1800):
    n = int(0.06 * SR)
    ts = np.arange(n) / SR
    x = filt(sos_bp(f * 0.6, f * 3), noise(n)) * np.exp(-ts / 0.006)
    x += np.sin(2 * np.pi * f * 0.5 * ts) * np.exp(-ts / 0.01) * 0.5
    return x * gain


def chime(root=mtof(77), gain=1.0, steps=(0, 4, 7, 12)):
    out = np.zeros(int(0.9 * SR))
    for k, s in enumerate(steps):
        f = root * 2 ** (s / 12)
        n = int(0.6 * SR)
        ts = np.arange(n) / SR
        x = (np.sin(2 * np.pi * f * ts) + 0.3 * np.sin(2 * np.pi * 2 * f * ts)) * np.exp(-ts / 0.18)
        i = int(k * 0.05 * SR)
        out[i:i + n] += x[: len(out) - i]
    return out * gain


def glitch(gain=1.0):
    n = int(0.05 * SR)
    ts = np.arange(n) / SR
    f = rng.choice([800, 1200, 1600, 2400, 3200])
    x = np.sign(np.sin(2 * np.pi * f * ts)) * np.exp(-ts / 0.02)
    return filt(sos_bp(400, 6000), x) * gain


# ---------------------------------------------------------------- motor (4 cilindros, 4 tiempos)
def engine(rpm, gain=1.0, rough=1.0):
    """rpm: array por muestra. Frecuencia de explosiones = rpm/60*2."""
    n = len(rpm)
    fire = rpm / 60 * 2
    jitter = 1 + 0.02 * rough * filt(sos_lp(6), noise(n)) * 6
    ph = 2 * np.pi * np.cumsum(fire * jitter) / SR
    pulses = (0.5 + 0.5 * np.cos(ph)) ** 10
    amp = 1 + 0.25 * rough * filt(sos_lp(3), noise(n)) * 8
    exc = pulses * amp
    low = filt(sos_bp(40, 260), exc) * 3.0
    mid = filt(sos_bp(250, 1400), noise(n) * exc) * 0.9
    harm = np.zeros(n)
    for h in (1, 2, 3, 4):
        harm += np.sin(ph * h / 2 + h) / h
    harm = filt(sos_lp(500), harm) * 0.45
    tickv = filt(sos_hp(3000), noise(n)) * ((0.5 + 0.5 * np.cos(ph * 2)) ** 30) * 0.05
    x = low + mid + harm + tickv
    return np.tanh(x * 0.9) * gain


def tape_stop(x, dur):
    n = len(x)
    nd = min(int(dur * SR), n)
    rate = np.linspace(1, 0, nd) ** 1.4
    pos = np.clip(np.cumsum(rate), 0, n - 1)
    return np.interp(pos, np.arange(n), x) * np.linspace(1, 0, nd) ** 0.6


# ================================================================ MÚSICA
# Lecho cinematográfico único y coherente (Re menor → resolución en Si♭/Fa mayor en "Lo correcto"):
# pulso grave + reloj + drones con reverberación + golpes en los capítulos + subidas antes de los momentos clave.
BPM = 100
SPB = 60 / BPM

t_para = at("para")
t_beat_in = cue("para", "estas", 14) - 0.05
t_carb = at("carburador")
t_iny = at("inyeccion")
t_benc = at("bencina")
t_lento = at("lento")
t_horas = at("horas")
t_corr = at("correcto")
t_suave = at("suave")
t_esc = at("escarcha")
t_cta = at("cta")


def reverb(x, dur=2.2, wet=0.3, lp=5000, seed=3):
    """Reverberación por convolución con una respuesta al impulso sintética (ruido con decaimiento)."""
    g = np.random.default_rng(seed)
    n = int(dur * SR)
    ts = np.arange(n) / SR
    out = np.zeros_like(x)
    for c in range(x.shape[1]):
        ir = g.standard_normal(n) * np.exp(-ts / (dur * 0.28))
        ir = filt(sos_lp(lp), ir)
        ir[: int(0.012 * SR)] = 0  # pre-delay
        ir /= np.sqrt(np.sum(ir ** 2)) + 1e-9
        out[:, c] = signal.fftconvolve(x[:, c], ir)[: len(x)]
    return x * (1 - wet) + out * wet * 1.6


def soft_pad(freqs, dur, lp=1400, gain=1.0, attack=0.6, release=0.8):
    """Pad cálido: senos desafinados + un poco de sierra filtrada, con trémolo lento."""
    n = int(dur * SR)
    ts = np.arange(n) / SR
    x = np.zeros(n)
    for i, f in enumerate(freqs):
        for d, w in ((-0.25, 0.5), (0.0, 0.7), (0.22, 0.5)):
            ff = f * (1 + d / 100)
            x += w * (np.sin(2 * np.pi * ff * ts + i) + 0.18 * saw(ff, ts + i * 0.01))
    x = filt(sos_lp(lp), x) / (len(freqs) * 1.7)
    x *= 1 + 0.08 * np.sin(2 * np.pi * 0.23 * ts)
    e = np.ones(n)
    na, nr = min(n, int(attack * SR)), min(n, int(release * SR))
    e[:na] = np.linspace(0, 1, na) ** 2
    e[-nr:] *= np.linspace(1, 0, nr) ** 1.5
    return x * e * gain


def bell(f, dur=1.6, gain=1.0):
    """Campana/piano suave: fundamental + armónicos con decaimientos distintos."""
    n = int(dur * SR)
    ts = np.arange(n) / SR
    x = np.sin(2 * np.pi * f * ts) * np.exp(-ts / 0.6)
    x += 0.35 * np.sin(2 * np.pi * 2 * f * ts) * np.exp(-ts / 0.25)
    x += 0.12 * np.sin(2 * np.pi * 3.01 * f * ts) * np.exp(-ts / 0.12)
    return fade(x, 0.003, 0.05) * gain


def sub_pulse(f, dur, gain=1.0):
    n = int(dur * SR)
    ts = np.arange(n) / SR
    x = np.sin(2 * np.pi * f * ts) * np.exp(-ts / (dur * 0.5))
    return fade(np.tanh(x * 1.5), 0.004, 0.02) * gain


def drone(f, dur, gain=1.0, lp=500, beat_hz=0.15):
    n = int(dur * SR)
    ts = np.arange(n) / SR
    x = np.sin(2 * np.pi * f * ts) + 0.5 * np.sin(2 * np.pi * f * 1.004 * ts) + 0.25 * saw(f * 2, ts)
    x = filt(sos_lp(lp), x) * (1 + 0.15 * np.sin(2 * np.pi * beat_hz * ts))
    return fade(x, min(0.8, dur / 3), min(0.8, dur / 3)) * gain


bed = np.zeros((N, 2))     # drones / pads (con reverberación)
perc = np.zeros((N, 2))    # pulso, reloj, golpes (más secos)
dry = np.zeros((N, 2))     # campanas (con reverberación larga)


def st(x, w=0.04):
    """Ensancha un mono a estéreo con un pequeño retardo."""
    d = int(w * 0.01 * SR)
    return np.stack([x, np.concatenate([np.zeros(d), x[:-d]]) if d else x], 1)


def clock(a, b, every, gain, f_hi=2500, f_lo=1900):
    k = 0
    t0 = a
    while t0 < b:
        place(perc, tick(f_hi if k % 2 == 0 else f_lo, 0.035, gain), t0, pan=0.25)
        t0 += every
        k += 1


def pulses(a, b, f, every, gain):
    t0 = a
    while t0 < b - 0.05:
        place(perc, sub_pulse(f, min(every * 0.95, 0.5), gain), t0)
        t0 += every


def kicks(a, b, every, gain):
    t0 = a
    while t0 < b - 0.05:
        place(perc, kick(gain), t0)
        t0 += every


D1, D2, F2, A2 = mtof(38), mtof(50), mtof(53), mtof(57)

# 1) gancho: tensión (drone + pulso de corazón + reloj) y subida hacia "Para."
place(bed, st(drone(mtof(38), t_para + 0.2, 0.55, 380)), 0)
place(bed, st(soft_pad([D2, F2, A2], t_para + 0.3, 900, 0.45, 0.4, 0.2)), 0)
pulses(0, t_para, mtof(26), SPB, 0.55)
clock(0, t_para, SPB / 2, 0.07)
place(bed, st(riser(1.6, 120, 3200, 0.5)), t_para - 1.6)

# 2) "Para." → silencio, y entra el pulso
pulses(t_beat_in, t_carb, mtof(26), SPB / 2, 0.42)
kicks(t_beat_in, t_carb, SPB * 2, 0.8)
clock(t_beat_in, t_carb, SPB / 2, 0.08)
place(bed, st(soft_pad([D2, F2, A2, mtof(60)], t_carb - t_beat_in, 1100, 0.5, 0.3, 0.3)), t_beat_in)

# 3) el origen (carburador): apagado, como de radio antigua + crepitar de vinilo
retro = np.zeros((N, 2))
_bed = bed
bed = retro
place(bed, st(soft_pad([mtof(46), mtof(50), mtof(53)], (t_iny - t_carb) / 2 + 0.3, 1000, 0.6, 0.3, 0.3)), t_carb)
place(bed, st(soft_pad([D2, F2, A2], (t_iny - t_carb) / 2 + 0.3, 1000, 0.6, 0.3, 0.3)), t_carb + (t_iny - t_carb) / 2)
bed = _bed
kicks(t_carb, t_iny, SPB * 2, 0.55)
retro_f = np.stack([filt(sos_bp(300, 2600), retro[:, c]) for c in range(2)], 1)
crackle = np.zeros(N)
for _ in range(int((t_iny - t_carb) * 40)):
    tt = t_carb + rng.random() * (t_iny - t_carb)
    i = idx(tt)
    m = int(0.002 * SR)
    crackle[i:i + m] += filt(sos_hp(2000), noise(m)) * rng.random() * 0.5
crackle[idx(t_carb):idx(t_iny)] += filt(sos_bp(800, 5000), noise(idx(t_iny) - idx(t_carb))) * 0.012
bed += retro_f + np.stack([crackle, crackle], 1) * 0.8

# 4) inyección: se abre el filtro, campanas limpias (lo moderno)
place(bed, st(soft_pad([D2, F2, A2, mtof(64)], t_benc - t_iny + 0.3, 2600, 0.45, 0.2, 0.4)), t_iny)
kicks(t_iny, t_benc, SPB, 0.7)
clock(t_iny, t_benc, SPB / 4, 0.05, 5200, 4200)
for k, m in enumerate([74, 77, 81, 84, 81, 77, 74, 77, 81, 86, 84, 81]):
    tt = t_iny + 0.45 + k * SPB / 2
    if tt < t_benc - 0.2:
        place(dry, st(bell(mtof(m), 1.2, 0.16)), tt, pan=0.3 if k % 2 else -0.3)

# 5) el daño: grave, disonante, pulso en corcheas
place(bed, st(drone(mtof(38), t_horas - t_benc, 0.7, 420, 0.4)), t_benc)
place(bed, st(drone(mtof(39), t_horas - t_benc, 0.16, 300, 0.33)), t_benc)  # segunda menor: inquietud
place(bed, st(soft_pad([D2, mtof(56), A2], t_horas - t_benc, 800, 0.4, 0.5, 0.4)), t_benc)
pulses(t_benc, t_horas, mtof(26), SPB / 2, 0.5)
kicks(t_benc, t_horas, SPB, 0.85)
clock(t_benc, t_horas, SPB / 2, 0.07)

# 6) la bencina: el reloj acelera, subida hacia la solución
place(bed, st(drone(mtof(38), t_corr - t_horas, 0.55, 600)), t_horas)
place(bed, st(soft_pad([D2, F2, A2, mtof(62)], t_corr - t_horas, 1300, 0.45, 0.3, 0.2)), t_horas)
pulses(t_horas, t_corr, mtof(26), SPB / 2, 0.5)
kicks(t_horas, t_corr, SPB, 0.85)
clock(t_horas, t_corr - 1.2, SPB / 4, 0.06, 3000, 2400)
place(bed, st(riser(1.4, 150, 4000, 0.55)), t_corr - 1.4)

# 7) lo correcto → resolución cálida (Si♭ – Fa – Do – Re m), campanas ascendentes
LIGHT = [[46, 50, 53, 57], [41, 45, 48, 52], [48, 52, 55, 59], [50, 53, 57, 60]]
bar = SPB * 4
t0, k = t_corr, 0
while t0 < t_cta - 0.1:
    d = min(bar, t_cta - t0)
    place(bed, st(soft_pad([mtof(m + 12) for m in LIGHT[k % 4]], d + 0.5, 2400, 0.5, 0.15, 0.5)), t0)
    place(perc, bass_note(mtof(LIGHT[k % 4][0] - 12), d * 0.95, 0.35), t0)
    t0 += bar
    k += 1
kicks(t_corr, t_esc, SPB, 0.7)
clock(t_corr, t_esc, SPB / 2, 0.05, 6000, 5000)
motif = [77, 81, 84, 89, 84, 81, 77, 81, 84, 86, 84, 81]
for j, m in enumerate(motif * 3):
    tt = t_corr + 0.3 + j * SPB / 2
    if tt < t_esc - 0.2:
        place(dry, st(bell(mtof(m), 1.4, 0.12)), tt, pan=0.25 if j % 2 else -0.25)

# 8) excepción (escarcha): cristalino, más liviano
for j in range(int((t_cta - t_esc) / (SPB / 2))):
    place(dry, st(bell(mtof([86, 89, 93, 96][j % 4]), 1.0, 0.08)), t_esc + j * SPB / 2, pan=0.4 if j % 2 else -0.4)
kicks(t_esc, t_cta, SPB * 2, 0.5)

# 9) cierre: pad abierto que vuelve al inicio
d_cta = TOTAL - t_cta
place(bed, st(soft_pad([mtof(58), mtof(62), mtof(65), mtof(69)], d_cta, 1800, 0.6, 0.3, 1.0)), t_cta)
pulses(t_cta, TOTAL - 0.4, mtof(26), SPB, 0.35)
for j, m in enumerate([77, 81, 84, 81]):
    place(dry, st(bell(mtof(m), 1.6, 0.12)), t_cta + 0.2 + j * SPB)

# golpes de capítulo (01 el origen, 02 el daño, 03 la bencina, 04 lo correcto)
for tc in (t_carb, t_benc, t_horas, t_corr):
    place(perc, boom(1.8, 60, 28, 0.55), tc)

music = reverb(bed, 2.6, 0.32, 4500) * 0.85 + reverb(dry, 3.2, 0.45, 6000) * 0.9 + reverb(perc, 0.9, 0.12, 3000) * 0.8
# nivelación suave por tramos: secciones parejas sin aplastar la dinámica
_env = np.sqrt(filt(sos_lp(0.6, 1), (music ** 2).mean(1)) + 1e-12)
_target = np.median(_env[_env > 1e-4])
music *= np.clip((_target / _env) ** 0.6, 0.5, 2.5)[:, None]
# corte seco en "Para." (todo se calla hasta que vuelve la voz)
music[idx(t_para):idx(t_beat_in)] *= 0.0

# ================================================================ EFECTOS
sfx = np.zeros((N, 2))

# --- gancho: motor en ralentí frío (rápido y algo irregular) + cronómetro acelerado
n_h = idx(t_para) + int(0.6 * SR)
rpm = 1150 + 40 * np.sin(np.arange(n_h) / SR * 2.1)
eng = engine(rpm, 0.55, rough=1.2)
eng_main = eng[: idx(t_para)].copy()
eng_main[: int(0.01 * SR)] *= np.linspace(0, 1, int(0.01 * SR))
place(sfx, eng_main, 0, 0.9)
place(sfx, tape_stop(eng[idx(t_para) - 1:], 0.35), t_para, 0.9)
for k in range(int(t_para / 0.1)):
    place(sfx, tick(3200 if k % 10 == 0 else 2400, 0.03, 0.12), k * 0.1 + 0.02, pan=0.3)
place(sfx, boom(0.9, 80, 40, 0.35), 0.0)

# --- "Para.": golpe + destello
place(sfx, boom(1.6, 75, 28, 1.0), t_para + 0.03)
place(sfx, filt(sos_hp(1500), noise(int(0.25 * SR))) * env_exp(int(0.25 * SR), 0.05) * 0.5, t_para + 0.03)
place(sfx, whoosh(0.3, True, 0.35), cue("para", "dano", 43) - 0.2)
place(sfx, boom(0.6, 90, 50, 0.4), cue("para", "dano", 43) - 0.12)

# --- teaser: cifras que parpadean
place(sfx, whoosh(0.4, False, 0.4), at("teaser") - 0.2)
for k in range(int((t_carb - at("teaser")) / 0.0667)):
    if rng.random() < 0.55:
        place(sfx, glitch(0.06), at("teaser") + k * 0.0667, pan=rng.uniform(-0.4, 0.4))
place(sfx, boom(0.7, 90, 45, 0.45), cue("teaser", "verdad", 65) - 0.1)

# --- carburador: proyector antiguo
place(sfx, whoosh(0.5, False, 0.45), t_carb - 0.25)
n_c = idx(t_iny) - idx(t_carb)
proj = np.zeros(n_c)
step = int(SR / 24)
for i in range(0, n_c - 300, step):
    proj[i:i + 300] += filt(sos_bp(1500, 6000), noise(300)) * np.exp(-np.arange(300) / SR / 0.002)
proj += filt(sos_bp(80, 300), noise(n_c)) * 0.05
place(sfx, proj * 0.22, t_carb)
place(sfx, boom(0.7, 70, 40, 0.35), cue("carburador", "carburador", 48) - 0.1)

# --- inyección: rebobinado al presente + pitidos de sensores + checks
place(sfx, riser(0.45, 300, 6000, 0.55), t_iny)
place(sfx, boom(0.5, 100, 60, 0.35), t_iny + 0.42)
for k in range(10):
    place(sfx, tick(1800 + 300 * (k % 3), 0.03, 0.06), cue("inyeccion", "ajusta", 40) + k * 0.18, pan=-0.3)
place(sfx, chime(mtof(81), 0.16), cue("inyeccion", "frio", 81) - 0.08)
place(sfx, chime(mtof(84), 0.16), cue("inyeccion", "calor", 101) - 0.08)

# --- bencina: inyector + golpe en "peor" + roce metálico
place(sfx, whoosh(0.45, True, 0.4), t_benc - 0.2)
period = 42 / FPS
for k in range(int((t_lento - t_benc) / period)):
    m = int(0.18 * SR)
    sp = filt(sos_bp(3000, 12000), noise(m)) * np.exp(-np.arange(m) / SR / 0.05)
    tt = t_benc + k * period
    extra = 1.0 if tt > cue("bencina", "extra", 93) - 0.3 else 0.45
    place(sfx, sp * 0.12 * extra, tt, pan=0.2)
place(sfx, boom(1.2, 70, 30, 0.75), cue("bencina", "peor", 33) - 0.05)
t_ac = cue("bencina", "aceite", 131)
n_s = idx(t_lento) - idx(t_ac)
if n_s > 0:
    sc = noise(n_s)
    res = sum(filt(sos_bp(f0 * 0.97, f0 * 1.03), sc) for f0 in (2300, 3700, 5200))
    am = (0.5 + 0.5 * np.sin(2 * np.pi * (1 / period) * np.arange(n_s) / SR)) ** 2
    place(sfx, res * am * 0.22 * np.linspace(0, 1, n_s) ** 0.5, t_ac)

# --- lento: cambio de titular
place(sfx, whoosh(0.4, True, 0.3), t_lento - 0.15)
place(sfx, boom(0.8, 80, 40, 0.5), cue("lento", "desgaste", 62) - 0.1)
place(sfx, boom(0.5, 100, 60, 0.3), cue("lento", "lentisimo", 35) - 0.1)

# --- horas: contador 0→60 + golpe
place(sfx, whoosh(0.45, False, 0.4), t_horas - 0.2)
t60 = cue("horas", "sesenta", 35)
for k in range(24):
    place(sfx, tick(1500 + 40 * k, 0.03, 0.1), t60 - 0.13 + k * (0.73 / 24))
place(sfx, boom(1.2, 70, 30, 0.8), t60 - 0.13 + 0.73)
tq = cue("horas", "quemando", 74)
for k in range(5):  # gorgoteo de bencina (burbujas)
    n_b = int(0.12 * SR)
    ts = np.arange(n_b) / SR
    f = 300 + 500 * ts / 0.12 + rng.random() * 80
    bub = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-ts / 0.03)
    place(sfx, bub * 0.18, tq + k * 0.17 + rng.random() * 0.05, pan=-0.2)
tm = cue("horas", "moverte", 102)
n_e = int(0.2 * SR)
buzz = np.sign(np.sin(2 * np.pi * 110 * np.arange(n_e) / SR)) * env_exp(n_e, 0.06)
place(sfx, filt(sos_lp(1200), buzz) * 0.08, tm - 0.2, pan=0.3)

# --- correcto: llave, cinturón, 30 s, partida
place(sfx, whoosh(0.5, True, 0.4), t_corr - 0.25)
te = cue("correcto", "enciendelo", 21)
place(sfx, click_mech(0.5, 1400), te - 0.1)
place(sfx, click_mech(0.4, 2200), te - 0.02)
n_st = int(1.0 * SR)
place(sfx, engine(np.linspace(260, 1150, n_st) ** 1.0, 0.35, 1.0) * np.linspace(0, 1, n_st) ** 0.5 * env_exp(n_st, 0.6), te + 0.05)
place(sfx, chime(mtof(84), 0.1, (0, 7)), te + 0.15)
tc = cue("correcto", "cinturon", 47)
place(sfx, click_mech(0.45, 2600), tc - 0.06)
place(sfx, click_mech(0.6, 1700), tc + 0.02)
place(sfx, chime(mtof(86), 0.1, (0, 7)), tc + 0.18)
t30 = cue("correcto", "treinta", 72)
place(sfx, whoosh(0.35, True, 0.35), t30 - 0.3)
for k in range(15):
    place(sfx, tick(2200 if k % 5 else 3000, 0.03, 0.12), t30 - 2 / FPS + k * (24 / FPS / 15))
place(sfx, chime(mtof(77), 0.35, (0, 4, 7, 12, 16)), t30 + 22 / FPS - 0.02)
place(sfx, boom(1.0, 80, 40, 0.6), t30 + 22 / FPS)
tmj = cue("correcto", "manejando", 113)
n_d = int(1.6 * SR)
place(sfx, engine(np.linspace(1150, 2300, n_d), 0.4, 0.5) * np.sin(np.linspace(0, np.pi, n_d)) ** 0.7, tmj - 0.25, pan=-0.3)
place(sfx, whoosh(0.9, False, 0.35), tmj, pan=-0.5)

# --- suave: intento de acelerón cortado + aguja de temperatura
place(sfx, whoosh(0.4, False, 0.3), t_suave - 0.2)
ta = cue("suave", "acelerones", 7)
n_r = int(1.3 * SR)
tr = np.arange(n_r) / SR
rpm_r = np.interp(tr, [0, 0.27, 0.6, 1.3], [900, 4600, 2100, 2100])
place(sfx, engine(rpm_r, 0.3, 0.6) * np.minimum(1, np.exp(-(tr - 0.6) / 0.6)), ta - 0.25)
place(sfx, chime(mtof(81), 0.22, (0, 4, 7)), cue("suave", "rapido", 126) - 0.15)

# --- escarcha: hielo crujiente + desempañador
place(sfx, whoosh(0.45, True, 0.35), t_esc - 0.2)
for k in range(60):
    tt = t_esc + 0.1 + rng.random() * 2.2
    m = int(0.004 * SR)
    place(sfx, filt(sos_hp(3500), noise(m)) * rng.random() * 0.35, tt, pan=rng.uniform(-0.6, 0.6))
tp = cue("escarcha", "primero", 75)
n_f = idx(t_cta) - idx(tp - 0.3)
if n_f > 0:
    blow = filt(sos_bp(300, 2500), noise(n_f)) * np.linspace(0, 1, n_f) ** 0.6 * 0.12
    place(sfx, blow * np.linspace(1, 0.4, n_f), tp - 0.3)

# --- cierre: tecleo del comentario + "enviar"
place(sfx, whoosh(0.5, False, 0.35), t_cta - 0.25)
tl = cue("cta", "leo", 63)
type_start = tl - 6 / FPS
for k in range(19):
    place(sfx, click_mech(0.12, 3000 + rng.random() * 800), type_start + k * (30 / FPS / 19), pan=0.1)
place(sfx, chime(mtof(88), 0.14, (0, 5)), type_start + 26 / FPS)

# ================================================================ VOZ + MEZCLA
def load_wav(p):
    sr, x = wavfile.read(p)
    x = x.astype(np.float64)
    if x.dtype.kind == "i" or np.abs(x).max() > 2:
        x /= 32768.0
    if x.ndim > 1:
        x = x.mean(1)
    if sr != SR:
        x = signal.resample_poly(x, SR, sr)
    return x


vo_path = os.path.join(ROOT, "public", "audio", "vo.wav")
vo = np.zeros(N)
if os.path.exists(vo_path):
    v = load_wav(vo_path)
    vo[: min(N, len(v))] = v[:N]
    # cadena de voz: paso alto, presencia y compresión suave
    vo = filt(sos_hp(90), vo)
    pres = filt(sos_bp(2500, 6000), vo)
    vo = vo + 0.35 * pres
    env = np.sqrt(filt(sos_lp(12, 1), vo ** 2) + 1e-9)
    thr = np.percentile(env[env > 1e-3], 60) if np.any(env > 1e-3) else 0.1
    gainc = np.where(env > thr, (thr / env) ** 0.45, 1.0)
    vo = vo * gainc
    vo /= np.abs(vo).max() + 1e-9

# ducking de la música bajo la voz
vo_env = filt(sos_lp(6, 1), np.abs(vo))
vo_env = np.clip(vo_env / (np.percentile(vo_env, 95) + 1e-9), 0, 1)
duck = 1 - 0.62 * vo_env
duck_sfx = 1 - 0.5 * vo_env

music /= np.abs(music).max() + 1e-9
sfx /= np.abs(sfx).max() + 1e-9


def master(x):
    x = np.tanh(x * 1.15) / np.tanh(1.15)
    x /= np.abs(x).max() + 1e-9
    x *= 0.93
    nfd = int(0.004 * SR)
    x[:nfd] *= np.linspace(0, 1, nfd)[:, None]
    x[-nfd:] *= np.linspace(1, 0, nfd)[:, None]
    return x


voice_st = np.stack([vo, vo], 1)
mix = voice_st * 1.0 + music * 0.30 * duck[:, None] + sfx * 0.42 * duck_sfx[:, None]
mix_nv = music * 0.55 + sfx * 0.55

out = os.path.join(ROOT, "public", "audio")
os.makedirs(os.path.join(out, "stems"), exist_ok=True)


def save(p, x):
    wavfile.write(p, SR, (np.clip(x, -1, 1) * 32767).astype(np.int16))


save(os.path.join(out, "mix.wav"), master(mix))
save(os.path.join(out, "mix_sinvoz.wav"), master(mix_nv))
save(os.path.join(out, "stems", "musica.wav"), music * 0.9)
save(os.path.join(out, "stems", "efectos.wav"), sfx * 0.9)
save(os.path.join(out, "stems", "voz.wav"), voice_st * 0.9)
print(f"OK · {TOTAL:.2f} s · {N} muestras")
