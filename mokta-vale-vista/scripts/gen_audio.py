#!/usr/bin/env python3
"""
MOKTA · El falso vale vista — música y efectos 100 % sintetizados + mezcla con la locución.

Entrada : public/audio/voz.wav (ElevenLabs, ya ajustada por prep_voice.py)
Salida  : public/audio/mix.wav (48 kHz estéreo) y stems en public/audio/stems/

Todos los tiempos se escriben en SEGUNDOS DE LOCUCIÓN, igual que en src/timing.ts y las escenas.
La voz entra VOICE_OFFSET s después del primer fotograma.
"""
import json
import os

import numpy as np
from scipy import signal
from scipy.io import wavfile

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SR = 48000
VOICE_OFFSET = 0.2
FPS = 30
rng = np.random.default_rng(11)

words = json.load(open(os.path.join(ROOT, "src", "words.json")))
VOICE_END = words[-1]["e"]
TOTAL_FRAMES = round((VOICE_END + 2.2 + VOICE_OFFSET) * FPS)
TOTAL = TOTAL_FRAMES / FPS
N = int(round(TOTAL * SR))


def gi(v):
    """segundo de locución → índice de muestra global"""
    return int(round((v + VOICE_OFFSET) * SR))


# ------------------------------------------------------------------ utilidades
def sos(kind, f, order=2):
    return signal.butter(order, f, btype=kind, fs=SR, output="sos")


def filt(kind, f, x, order=2):
    return signal.sosfilt(sos(kind, f, order), x)


def noise(n):
    return rng.standard_normal(n)


def t_(dur):
    return np.arange(int(dur * SR)) / SR


def expdec(dur, tau):
    return np.exp(-t_(dur) / tau)


def adsr(n, a=0.01, r=0.1):
    e = np.ones(n)
    na, nr = min(n, int(a * SR)), min(n, int(r * SR))
    if na:
        e[:na] = np.linspace(0, 1, na)
    if nr:
        e[-nr:] *= np.linspace(1, 0, nr)
    return e


def sweep_sine(f0, f1, dur, curve=3.0):
    tt = t_(dur)
    f = f1 + (f0 - f1) * np.exp(-tt * curve / dur * 3)
    return np.sin(2 * np.pi * np.cumsum(f) / SR)


def saw(freq, dur, detune=0.0):
    tt = t_(dur)
    return 2 * ((tt * freq * (1 + detune)) % 1) - 1


def norm(x, peak=1.0):
    m = np.max(np.abs(x)) + 1e-9
    return x / m * peak


IR = None


def reverb(x, wet=0.3, length=1.2):
    global IR
    if IR is None:
        n = int(length * SR)
        IR = noise(n) * np.exp(-np.arange(n) / SR / (length / 5))
        IR = filt("low", 6000, IR)
        IR /= np.sqrt(np.sum(IR ** 2))
    y = signal.fftconvolve(x, IR)[: len(x) + int(0.6 * SR)]
    out = np.zeros(len(y))
    out[: len(x)] += x * (1 - wet)
    out += y * wet
    return out


# ------------------------------------------------------------------ pistas
music = np.zeros((N, 2))
sfx = np.zeros((N, 2))


def place(buf, x, v, gain=1.0, pan=0.0):
    """Coloca un sonido mono x en el segundo de locución v."""
    i = gi(v)
    if i < 0:
        x = x[-i:]
        i = 0
    n = min(len(x), N - i)
    if n <= 0:
        return
    l = np.cos((pan + 1) * np.pi / 4)
    r = np.sin((pan + 1) * np.pi / 4)
    buf[i : i + n, 0] += x[:n] * gain * l * 1.414
    buf[i : i + n, 1] += x[:n] * gain * r * 1.414


def place_st(buf, x, v, gain=1.0):
    i = gi(v)
    n = min(len(x), N - i)
    buf[i : i + n] += x[:n] * gain


# ------------------------------------------------------------------ efectos
def kick(dur=0.45, f0=160, f1=42):
    return sweep_sine(f0, f1, dur, 4) * expdec(dur, 0.12)


def impact(dur=1.8):
    sub = sweep_sine(90, 28, dur, 2) * expdec(dur, 0.45)
    body = filt("low", 900, noise(int(dur * SR))) * expdec(dur, 0.09) * 1.4
    crack = filt("band", [1500, 7000], noise(int(dur * SR))) * expdec(dur, 0.025) * 0.8
    return norm(reverb(sub + body + crack, 0.35), 0.95)


def stamp():
    d = 0.5
    thud = sweep_sine(140, 55, d, 5) * expdec(d, 0.07)
    clk = filt("band", [800, 4000], noise(int(d * SR))) * expdec(d, 0.012)
    return norm(reverb(thud + clk * 0.7, 0.2), 0.9)


def whoosh(dur=0.45, up=False):
    n = int(dur * SR)
    tt = np.linspace(0, 1, n)
    nz = noise(n)
    lo = filt("band", [200, 1200], nz)
    hi = filt("band", [1500, 7000], nz)
    e1 = np.sin(np.pi * np.clip(tt / 0.8, 0, 1)) ** 2
    e2 = np.sin(np.pi * np.clip((tt - 0.2) / 0.8, 0, 1)) ** 2
    if up:
        e1, e2 = e1 * tt, e2 * tt
    return norm(lo * e1 + hi * e2 * 0.7, 0.8)


def ding(f=1320, dur=0.9):
    tt = t_(dur)
    x = (np.sin(2 * np.pi * f * tt) + 0.4 * np.sin(2 * np.pi * f * 2.0 * tt) + 0.2 * np.sin(2 * np.pi * f * 3.01 * tt)) * expdec(dur, 0.22)
    x[: int(0.003 * SR)] *= np.linspace(0, 1, int(0.003 * SR))
    return norm(reverb(x, 0.25), 0.7)


def check(f=880):
    a = ding(f, 0.5)
    b = ding(f * 1.5, 0.8)
    out = np.zeros(len(b) + int(0.08 * SR))
    out[: len(a)] += a * 0.7
    out[int(0.08 * SR) : int(0.08 * SR) + len(b)] += b
    return norm(out, 0.75)


def buzz(dur=0.32, pulses=2):
    seg = []
    for _ in range(pulses):
        tt = t_(dur)
        x = signal.square(2 * np.pi * 150 * tt) + signal.square(2 * np.pi * 157 * tt)
        x = filt("low", 2200, x) * adsr(len(tt), 0.005, 0.04)
        seg += [x, np.zeros(int(0.07 * SR))]
    return norm(np.concatenate(seg), 0.6)


def ping():
    a = np.sin(2 * np.pi * 1568 * t_(0.12)) * expdec(0.12, 0.05)
    b = np.sin(2 * np.pi * 2093 * t_(0.5)) * expdec(0.5, 0.12)
    return norm(reverb(np.concatenate([a, b]), 0.2), 0.6)


def bubble():
    d = 0.09
    return norm(sweep_sine(380, 950, d, -1) * adsr(int(d * SR), 0.004, 0.05), 0.5)


def keys_jingle(dur=0.6, count=14):
    out = np.zeros(int((dur + 0.4) * SR))
    for _ in range(count):
        st = int(rng.uniform(0, dur) * SR)
        f = rng.uniform(3000, 8500)
        d = rng.uniform(0.05, 0.18)
        tt = t_(d)
        x = np.sin(2 * np.pi * f * tt) * np.exp(-tt / (d / 4)) * rng.uniform(0.4, 1)
        out[st : st + len(x)] += x
    return norm(reverb(out, 0.2), 0.45)


def ring(dur=1.8):
    out = np.zeros(int(dur * SR))
    tt = t_(dur)
    tone = np.sin(2 * np.pi * 440 * tt) + np.sin(2 * np.pi * 480 * tt)
    gate = ((tt % 0.6) < 0.4).astype(float)
    gate = filt("low", 40, gate)
    out = tone * gate
    return norm(out, 0.35)


def tick():
    d = 0.03
    return norm(filt("band", [2500, 6000], noise(int(d * SR))) * expdec(d, 0.004), 0.5)


def cash_counter(dur=0.85):
    out = np.zeros(int(dur * SR))
    k = tick()
    for s in np.arange(0, dur - 0.03, 0.035):
        i = int(s * SR)
        out[i : i + len(k)] += k
    return out


def chaching():
    tt = t_(1.2)
    bell = sum(np.sin(2 * np.pi * f * tt) * a for f, a in [(2093, 1), (2637, 0.7), (3136, 0.5)]) * expdec(1.2, 0.3)
    cl = filt("band", [2000, 8000], noise(int(0.12 * SR))) * expdec(0.12, 0.02)
    out = np.zeros(len(tt) + int(0.12 * SR))
    out[: len(cl)] += cl
    out[int(0.1 * SR) : int(0.1 * SR) + len(bell)] += bell * 0.6
    return norm(reverb(out, 0.25), 0.6)


def scribble(dur=0.65):
    n = int(dur * SR)
    tt = t_(dur)
    am = 0.5 + 0.5 * np.sin(2 * np.pi * (9 + 4 * np.sin(2 * np.pi * 1.3 * tt)) * tt)
    return norm(filt("band", [1800, 6500], noise(n)) * am * adsr(n, 0.02, 0.08), 0.35)


def paper(dur=0.16):
    n = int(dur * SR)
    return norm(filt("band", [900, 8000], noise(n)) * np.sin(np.linspace(0, np.pi, n)) ** 2, 0.5)


def neon(dur=1.6, start_v=12.2):
    tt = t_(dur)
    hum = filt("low", 1800, saw(100, dur) + 0.5 * saw(200, dur))
    # parpadeo idéntico al video: apagado 1 de cada 3 bloques de 5 fotogramas
    fr = np.floor((tt + start_v + VOICE_OFFSET) * FPS)
    gate = np.where(np.floor(fr / 5) % 3 == 0, 0.25, 1.0)
    return norm(hum * gate * adsr(len(tt), 0.02, 0.3), 0.18)


def car_pass(dur=1.3):
    tt = t_(dur)
    p = tt / dur
    f = 85 * (1.12 - 0.24 * (p > 0.5) * ((p - 0.5) * 2) - 0.0 * p)
    ph = 2 * np.pi * np.cumsum(f) / SR
    eng = np.sin(ph) + 0.6 * np.sin(2 * ph) + 0.4 * np.sin(3 * ph) + 0.3 * signal.sawtooth(4 * ph)
    eng = filt("low", 1400, eng)
    road = filt("band", [300, 2500], noise(len(tt))) * 0.5
    env = np.exp(-((p - 0.5) ** 2) / 0.05)
    return norm((eng + road) * env, 0.7)


def rewind(dur=0.35):
    tt = t_(dur)
    f = 300 + 2400 * (tt / dur) ** 1.5
    x = signal.sawtooth(2 * np.pi * np.cumsum(f * (1 + 0.05 * np.sin(2 * np.pi * 30 * tt))) / SR)
    return norm(filt("band", [300, 6000], x) * adsr(len(tt), 0.01, 0.06), 0.45)


def glitch(dur=0.28):
    n = int(dur * SR)
    out = np.zeros(n)
    i = 0
    while i < n:
        L = int(rng.uniform(0.01, 0.04) * SR)
        kind = rng.integers(3)
        if kind == 0:
            seg = noise(L)
        elif kind == 1:
            seg = signal.square(2 * np.pi * rng.uniform(200, 1800) * t_(L / SR))
        else:
            seg = np.zeros(L)
        out[i : i + L] += seg[: max(0, min(L, n - i))]
        i += L
    out = np.round(out * 6) / 6  # bitcrush
    return norm(filt("high", 150, out), 0.4)


def riser(dur=1.95):
    tt = t_(dur)
    p = tt / dur
    nz = filt("band", [500, 9000], noise(len(tt))) * p ** 2
    f = 120 + 900 * p ** 2
    tone = signal.sawtooth(2 * np.pi * np.cumsum(f) / SR) * p ** 2 * 0.35
    return norm(nz + filt("low", 3000, tone), 0.6)


def shimmer(n_notes=5, base=1760):
    out = np.zeros(int(1.6 * SR))
    for k in range(n_notes):
        x = ding(base * [1, 1.25, 1.5, 2, 2.5][k % 5], 0.8) * 0.5
        st = int(k * 0.05 * SR)
        out[st : st + len(x)] += x[: len(out) - st]
    return norm(out, 0.5)


def heartbeat():
    a = kick(0.25, 90, 45) * 0.9
    b = kick(0.25, 80, 40) * 0.6
    out = np.zeros(int(0.6 * SR))
    out[: len(a)] += a
    out[int(0.22 * SR) : int(0.22 * SR) + len(b)] += b
    return filt("low", 300, out)


def lowdrone(dur, f=55):
    tt = t_(dur)
    x = saw(f, dur) + saw(f, dur, 0.007) + 0.5 * saw(f * 1.5, dur, -0.004)
    x = filt("low", 380, x)
    lfo = 0.75 + 0.25 * np.sin(2 * np.pi * 0.3 * tt)
    return norm(x * lfo * adsr(len(tt), 0.6, 0.6), 0.5)


# ------------------------------------------------------------------ SFX (segundos de locución)
CUTS = [5.2, 10.65, 14.65, 18.8, 20.75, 23.78, 25.05, 26.6, 32.45, 33.95, 39.3, 44.0, 46.95, 49.7, 52.7, 55.6]
for c in CUTS:
    place(sfx, whoosh(0.42), c - 0.22, 0.5, pan=rng.uniform(-0.4, 0.4))

# Gancho
place(sfx, impact(), -0.2, 0.75)
place(sfx, paper(0.25), -0.15, 0.4)
for k in range(5):
    place(sfx, heartbeat(), 0.35 + k * 0.72, 0.55)
place(sfx, impact(), 3.9, 1.0)
place(sfx, stamp(), 3.9, 0.9)
place(sfx, glitch(), 4.66, 0.6)
place(sfx, rewind(), 4.98, 0.6)

# Publicación
place(sfx, ping(), 6.62, 0.55)
for v, pan in [(6.8, -0.3), (7.15, 0.3), (7.5, -0.3), (8.24, -0.3), (8.96, -0.3), (10.0, -0.3)]:
    place(sfx, bubble(), v, 0.5, pan)
for v in [8.24, 8.96, 10.04]:
    place(sfx, buzz(0.09, 1), v + 0.03, 0.28, -0.5)

# Viernes
place(sfx, paper(0.12), 10.72, 0.35)
place(sfx, neon(1.6, 12.2), 12.2, 0.8)
place(sfx, paper(0.2), 13.05, 0.45)
place(sfx, ding(1760, 0.6), 13.8, 0.25)

# Documento
for v, f in [(15.0, 880), (15.84, 988), (16.52, 1108)]:
    place(sfx, check(f), v, 0.45)
place(sfx, shimmer(), 17.5, 0.45)

# Entrega
place(sfx, scribble(), 19.1, 0.6)
place(sfx, keys_jingle(0.5), 19.85, 0.6, -0.3)
place(sfx, keys_jingle(0.25, 8), 20.25, 0.5, 0.3)
place(sfx, car_pass(1.1), 19.9, 0.55)

# Lunes
place(sfx, paper(0.12), 20.82, 0.3)
for k in range(8):
    place(sfx, np.sin(2 * np.pi * 2400 * t_(0.04)) * expdec(0.04, 0.01), 21.2 + k * 0.125, 0.2)
place(sfx, buzz(0.3, 2), 22.26, 0.55)
place(sfx, impact(2.4), 23.2, 1.0)
place(sfx, stamp(), 23.2, 1.0)
place(sfx, glitch(0.2), 23.2, 0.5)
place(sfx, lowdrone(1.4, 41), 23.78, 0.6)
place(sfx, cash_counter(0.85), 25.07, 0.5)
place(sfx, kick(0.9, 120, 30) * 1.2, 25.92, 0.8)
place(sfx, buzz(0.5, 1), 25.92, 0.25)

# Explicación
place(sfx, impact(1.2), 26.7, 0.45)
for v in [27.7, 28.7, 30.5]:
    place(sfx, whoosh(0.3), v - 0.05, 0.4, 0.5)
    place(sfx, stamp(), v + 0.12, 0.35)

# Antes de entregar
place(sfx, impact(1.4), 32.45, 0.6)
place(sfx, keys_jingle(0.4, 10), 32.5, 0.45)

# Paso 1
place(sfx, stamp(), 33.97, 0.35)
place(sfx, ring(1.8), 35.2, 0.55)
place(sfx, check(988), 37.0, 0.5)
place(sfx, buzz(0.28, 2), 37.76, 0.5)

# Paso 2
place(sfx, stamp(), 39.32, 0.35)
for v, f in [(41.0, 880), (41.9, 1046), (43.42, 1318)]:
    place(sfx, check(f), v, 0.5)

# Paso 3
place(sfx, stamp(), 44.02, 0.35)
for k in range(int((46.9 - 44.6) / 0.5)):
    place(sfx, tick(), 44.6 + k * 0.5, 0.5)
place(sfx, impact(1.0), 46.97, 0.35)
place(sfx, impact(1.4), 49.04, 0.6)
place(sfx, stamp(), 49.04, 0.8)
place(sfx, chaching(), 49.12, 0.55)

# Foto
place(sfx, ping(), 49.8, 0.4)
place(sfx, paper(0.2), 50.6, 0.45)
place(sfx, buzz(0.18, 1), 51.42, 0.5)
place(sfx, buzz(0.18, 1), 51.55, 0.45)
place(sfx, impact(1.0), 51.76, 0.55)

# Regla
place(sfx, kick(0.8, 100, 35), 52.8, 0.6)
place(sfx, riser(1.9), 52.84, 0.45)
place(sfx, keys_jingle(1.4, 22), 52.9, 0.25)
place(sfx, impact(2.2), 54.74, 1.0)
place(sfx, stamp(), 54.74, 0.9)

# Cierre
place(sfx, whoosh(0.6, up=True), 55.45, 0.5)
place(sfx, shimmer(), 55.7, 0.4)
for v, f in [(56.5, 880), (56.9, 1046), (57.3, 1318)]:
    place(sfx, check(f), v, 0.32)
place(sfx, shimmer(5, 1318), 57.4, 0.35)

# ------------------------------------------------------------------ MÚSICA (100 BPM)
BPM = 100
BEAT = 60 / BPM
NOTES = {"A": 55.0, "F": 43.65, "C": 65.41, "G": 49.0, "E": 41.2, "D": 73.42}


def chord_freqs(root):
    third = {"A": 1.189, "F": 1.26, "C": 1.26, "G": 1.26, "E": 1.189, "D": 1.189}[root]
    return [NOTES[root] * 4, NOTES[root] * 4 * third, NOTES[root] * 4 * 1.498]


def pad(root, dur):
    x = sum(saw(f, dur, d) for f in chord_freqs(root) for d in (-0.004, 0.004))
    x = filt("low", 1500, x)
    return x * adsr(len(x), 0.25, 0.35) * 0.08


def bass_note(root, dur):
    x = saw(NOTES[root], dur) + 0.5 * saw(NOTES[root] * 2, dur)
    return filt("low", 420, x) * expdec(dur, dur * 0.6) * 0.45


def pluck(f, dur=0.22):
    x = signal.square(2 * np.pi * f * t_(dur)) * 0.5 + saw(f, dur)
    return filt("low", 2600, x) * expdec(dur, 0.06) * 0.11


def hat(open_=False):
    d = 0.12 if open_ else 0.04
    return filt("high", 7000, noise(int(d * SR))) * expdec(d, d / 3) * 0.16


def clap():
    d = 0.2
    nz = filt("band", [900, 5000], noise(int(d * SR)))
    env = expdec(d, 0.05)
    for o in (0.0, 0.012, 0.024):
        env[int(o * SR) : int(o * SR) + 30] += 0.6
    return nz * env * 0.32


def groove(v0, v1, prog, kick_pattern, hats_16=False, arp=True, gain=1.0, bass_8th=False):
    """Sección rítmica entre v0 y v1 (segundos de locución), alineada a pulsos de 100 BPM."""
    n_beats = int((v1 - v0) / BEAT)
    for b in range(n_beats):
        v = v0 + b * BEAT
        bar = b // 4
        root = prog[bar % len(prog)]
        if b % 4 == 0:
            place(music, pad(root, BEAT * 4), v, gain * 0.9, 0)
        if (b % 4) in kick_pattern:
            place(music, kick(0.4) * 0.8, v, gain)
        if b % 2 == 1:
            place(music, clap(), v, gain, 0.05)
        steps = 4 if hats_16 else 2
        for s in range(steps):
            place(music, hat(open_=(s == steps - 1 and b % 2 == 1)), v + s * BEAT / steps, gain * 0.9, 0.3)
        bsteps = 2 if bass_8th else 1
        for s in range(bsteps):
            place(music, bass_note(root, BEAT / bsteps), v + s * BEAT / bsteps, gain)
        if arp:
            cf = chord_freqs(root)
            for s in range(2):
                place(music, pluck(cf[(b * 2 + s) % 3] * 2), v + s * BEAT / 2, gain, -0.35 if s else 0.35)


# Gancho: dron oscuro
place(music, lowdrone(5.1, 55), -0.2, 0.5)
# Historia (5.2 → 20.75): groove ligero
groove(5.2, 20.75, ["A", "F", "C", "G"], kick_pattern=(0, 2), arp=True, gain=0.85)
# Revelación (20.75 → 26.6): sin batería, tensión
place(music, lowdrone(5.9, 41.2), 20.75, 0.6)
for k in range(int(5.8 / (BEAT * 2))):
    place(music, kick(0.5, 70, 35) * 0.6, 20.8 + k * BEAT * 2, 0.6)
# Enseñanza (26.6 → 52.7): ritmo decidido
groove(26.6, 52.7, ["F", "G", "A", "A"], kick_pattern=(0, 1, 2, 3), hats_16=True, arp=True, gain=0.8, bass_8th=True)
# Quiebre (52.7 → 54.74): solo pad grave; golpe; cierre (55.6 →)
place(music, pad("A", 2.0) * 1.5, 52.75, 0.8)
groove(54.74, TOTAL - VOICE_OFFSET, ["C", "G", "A", "F"], kick_pattern=(0, 2), hats_16=False, arp=True, gain=0.85)

# ------------------------------------------------------------------ voz + ducking + mezcla
sr_v, voice = wavfile.read(os.path.join(ROOT, "public", "audio", "voz.wav"))
assert sr_v == SR
voice = voice.astype(np.float64) / 32768.0
if voice.ndim > 1:
    voice = voice.mean(1)
vtrack = np.zeros(N)
i0 = gi(0)
vtrack[i0 : i0 + len(voice)] = voice[: N - i0]

# envolvente de la voz para atenuar música (-10 dB) y algo los efectos (-3 dB)
env = np.abs(vtrack)
env = filt("low", 6, env, 1)
env = np.clip(env / (np.percentile(env[env > 1e-4], 60) + 1e-9), 0, 1)
duck_m = 10 ** (-10 * env / 20)
duck_s = 10 ** (-3 * env / 20)

# final: fundido de la música
fade = np.ones(N)
nf = int(1.2 * SR)
fade[-nf:] = np.linspace(1, 0, nf)

music *= (duck_m * fade)[:, None]
sfx *= duck_s[:, None]

m_rms = np.sqrt(np.mean(music ** 2)) + 1e-9
s_peak = np.max(np.abs(sfx)) + 1e-9
v_rms = np.sqrt(np.mean(voice ** 2))
music *= (v_rms * 0.27) / m_rms
sfx *= 0.8 / s_peak

mix = music + sfx + vtrack[:, None] * 1.0
# limitador suave
mix = np.tanh(mix * 1.1) / np.tanh(1.1)

os.makedirs(os.path.join(ROOT, "public", "audio", "stems"), exist_ok=True)


def write(path, x):
    wavfile.write(path, SR, (np.clip(x, -1, 1) * 32767).astype(np.int16))


write(os.path.join(ROOT, "public", "audio", "mix.wav"), mix)
write(os.path.join(ROOT, "public", "audio", "stems", "musica.wav"), music)
write(os.path.join(ROOT, "public", "audio", "stems", "efectos.wav"), sfx)
print(f"mix.wav · {TOTAL:.2f} s · {TOTAL_FRAMES} fotogramas")
