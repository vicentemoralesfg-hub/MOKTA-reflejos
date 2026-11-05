#!/usr/bin/env python3
"""
MOKTA · Marcador de bencina — diseño sonoro y mezcla.

Lee la misma fuente de tiempos que el video:
  src/bencina/data/words.json  (palabras → fotogramas)
  src/bencina/data/cues.json   (escenas y cues con nombre)
Escribe:
  public/bencina/soundtrack.wav        voz + música + efectos (48 kHz estéreo)
  public/bencina/stems/{voz,musica,efectos}.wav

Música y efectos 100 % sintetizados aquí (sin samples de terceros → libres de licencias).
La música se agacha (ducking) bajo la voz.
"""
import json
import os

import numpy as np
from scipy import signal
from scipy.io import wavfile

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
WORDS = json.load(open(os.path.join(ROOT, "src/bencina/data/words.json")))
CUES = json.load(open(os.path.join(ROOT, "src/bencina/data/cues.json")))
FPS = WORDS["fps"]
SR = 48000
rng = np.random.default_rng(11)

words = WORDS["words"]


def W(i):
    return int(round(words[i]["start"]))


def cue(name):
    i, off = CUES["cues"][name]
    return (W(i) + off) / FPS  # segundos


TOTAL_F = int(round(words[-1]["end"])) + CUES["tailFrames"]
TOTAL = TOTAL_F / FPS
N = int(round(TOTAL * SR))
scenes = []
for k, (sid, wi) in enumerate(CUES["scenes"]):
    a = 0 if k == 0 else W(wi) - CUES["lead"]
    b = (W(CUES["scenes"][k + 1][1]) - CUES["lead"]) if k + 1 < len(CUES["scenes"]) else TOTAL_F
    scenes.append((sid, a / FPS, b / FPS))
S = {sid: (a, b) for sid, a, b in scenes}


# ---------------------------------------------------------------- utilidades
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


def env(n, a, r, curve=1.0):
    e = np.ones(n)
    na, nr = int(a * SR), int(r * SR)
    if na > 0:
        e[:na] = np.linspace(0, 1, na) ** curve
    if nr > 0:
        e[-nr:] *= np.linspace(1, 0, nr) ** curve
    return e


def place(buf, x, at, gain=1.0, pan=0.0):
    i = int(round(at * SR))
    if x.ndim == 1:
        x = np.stack([x * np.sqrt(1 - pan), x * np.sqrt(1 + pan)], 1)
    if i < 0:
        x = x[-i:]
        i = 0
    j = min(len(buf), i + len(x))
    if j > i:
        buf[i:j] += x[: j - i] * gain


def ts(n):
    return np.arange(n) / SR


# ---------------------------------------------------------------- instrumentos
def kick(gain=1.0):
    n = int(0.42 * SR)
    t = ts(n)
    f = 46 + 110 * np.exp(-t * 28)
    x = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / 0.16)
    click = filt(sos_hp(2000), noise(n)) * np.exp(-t / 0.004) * 0.25
    return np.tanh((x + click) * 1.6) * gain


def clap(gain=1.0):
    n = int(0.3 * SR)
    t = ts(n)
    e = np.zeros(n)
    for d in (0.0, 0.011, 0.022):
        k = int(d * SR)
        e[k:] += np.exp(-(t[: n - k]) / (0.012 if d < 0.02 else 0.09))
    x = filt(sos_bp(900, 5200), noise(n)) * e
    return x * gain * 0.6


def hat(open_=False, gain=1.0):
    n = int((0.22 if open_ else 0.05) * SR)
    t = ts(n)
    x = filt(sos_hp(7000), noise(n)) * np.exp(-t / (0.07 if open_ else 0.012))
    return x * gain


def saw(f, t):
    return 2 * (t * f - np.floor(0.5 + t * f))


def pluck(f, dur=0.32, gain=1.0, bright=2600):
    n = int(dur * SR)
    t = ts(n)
    x = (saw(f, t) * 0.6 + np.sin(2 * np.pi * f * 2 * t) * 0.25) * np.exp(-t / 0.11)
    x = filt(sos_lp(bright), x)
    return x * env(n, 0.003, 0.05) * gain


def bass_note(f, dur, gain=1.0):
    n = int(dur * SR)
    t = ts(n)
    x = np.sin(2 * np.pi * f * t) + 0.35 * filt(sos_lp(420), saw(f, t))
    return np.tanh(x * 1.3) * env(n, 0.006, 0.06) * gain


def pad(freqs, dur, lp=1400, gain=1.0):
    n = int(dur * SR)
    t = ts(n)
    x = np.zeros(n)
    for f in freqs:
        for d in (-0.18, 0.0, 0.16):
            x += saw(f * (1 + d / 100), t + rng.random())
    x = filt(sos_lp(lp), x) / (3 * len(freqs))
    return x * env(n, 0.35, 0.4) * gain


# ---------------------------------------------------------------- música
BPM = 100
beat = 60 / BPM
bar = 4 * beat
A1 = 55.0
# i – VI – III – VII en La menor
PROG = [
    (A1, [220.0, 261.63, 329.63]),
    (A1 * 0.794, [174.61, 220.0, 261.63]),
    (A1 * 1.189, [196.0, 261.63, 329.63]),
    (A1 * 1.0595 * 1.0, [196.0, 246.94, 293.66]),
]
PROG[3] = (49.0, [196.0, 246.94, 293.66])

drums = np.zeros((N, 2))
bass = np.zeros((N, 2))
keys = np.zeros((N, 2))
pads = np.zeros((N, 2))

stamp = cue("stamp")
altura = cue("altura")
sec_a, sec_b = S["secret"]
tip_a, tip_b = S["tip"]
cta_a = S["cta"][0]
r1_a = S["r1"][0]


def section(tm):
    """Intensidad de la música en el instante tm."""
    if tm < stamp:
        return "intro"
    if sec_a <= tm < S["mechanism"][0]:
        return "break"
    if tip_a <= tm < tip_b:
        return "thin"
    if tm >= cta_a:
        return "outro"
    return "full"


nbars = int(np.ceil(TOTAL / bar)) + 1
for b in range(nbars):
    t0 = b * bar
    root, chord = PROG[b % 4]
    # pad de fondo en todo el tema
    sec0 = section(t0)
    place(pads, pad(chord, bar + 0.4, lp=900 if sec0 in ("intro", "break") else 1600, gain=0.55), t0, pan=0.0)
    for k in range(16):  # semicorcheas
        tm = t0 + k * beat / 4
        if tm >= TOTAL:
            break
        sec = section(tm)
        # bombo
        if sec in ("full", "thin", "outro") and k in (0, 6, 8, 11 if sec == "full" else 99):
            place(drums, kick(0.9), tm)
        # palmas
        if sec in ("full", "outro") and k in (4, 12):
            place(drums, clap(0.7), tm, pan=0.05)
        # hats (también en la intro: reloj que avanza)
        if sec != "break" and k % 2 == 0:
            g = 0.22 if k % 4 == 2 else 0.12
            if sec == "intro":
                g *= 0.9
            place(drums, hat(False, g), tm, pan=0.25 if k % 4 == 2 else -0.15)
        if sec == "full" and k == 14:
            place(drums, hat(True, 0.12), tm, pan=0.3)
        # bajo
        if sec in ("full", "thin", "outro") and k in (0, 3, 6, 8, 10, 14):
            f = root * (2 if k in (6, 14) else 1)
            place(bass, bass_note(f, beat / 4 * (2 if k in (0, 8) else 1.4), 0.55), tm)
        # arpegio (desde la razón 1)
        if sec == "full" and tm >= r1_a and k % 2 == 0:
            f = chord[(k // 2) % 3] * (2 if (k // 2) % 4 == 3 else 1)
            place(keys, pluck(f, 0.3, 0.16), tm, pan=(-0.45 if (k // 2) % 2 else 0.45))

# riser hacia "ALTURA" y hacia el sello del gancho


def riser(dur, gain=1.0):
    n = int(dur * SR)
    t = ts(n)
    x = np.zeros(n)
    blocks = 30
    w = noise(n)
    for bb in range(blocks):
        a, z = bb * n // blocks, (bb + 1) * n // blocks
        c = 300 * (20 ** (bb / blocks))
        x[a:z] = filt(sos_bp(c * 0.7, c * 1.6), w[max(0, a - 3000):z])[-(z - a):]
    tone = np.sin(2 * np.pi * np.cumsum(180 + 700 * (t / dur) ** 2) / SR) * 0.25
    return (x * 0.8 + tone) * (t / dur) ** 2 * gain


music = drums * 0.9 + bass * 1.0 + keys * 1.0 + pads * 0.55
place(music, riser(stamp - 0.2, 0.18), 0.15)
place(music, riser(altura - sec_a, 0.35), sec_a)
# final: acorde que se sostiene y se apaga
end_n = int(2.2 * SR)
end_pad = pad([220.0, 261.63, 329.63, 440.0], 2.2, lp=2200, gain=0.8) * np.exp(-ts(end_n) / 0.9)
place(music, end_pad, TOTAL - 2.2)
# fundido final de la música
fade_n = int(0.8 * SR)
music[-fade_n:] *= np.linspace(1, 0, fade_n)[:, None]

# ---------------------------------------------------------------- voz + ducking
sr_v, voice = wavfile.read(os.path.join(ROOT, "public/bencina/voz.wav"))
assert sr_v == SR, sr_v
voice = voice.astype(np.float64)
if voice.ndim > 1:
    voice = voice.mean(1)
voice /= np.max(np.abs(voice)) + 1e-9
vbuf = np.zeros(N)
vbuf[: min(N, len(voice))] = voice[: min(N, len(voice))]
# envolvente para el ducking (ataque rápido, liberación lenta)
rms = np.sqrt(filt(sos_lp(12, 1), vbuf ** 2).clip(0))
rms /= rms.max() + 1e-9
envd = np.zeros_like(rms)
att = np.exp(-1 / (0.012 * SR))
rel = np.exp(-1 / (0.35 * SR))
acc = 0.0
for i in range(0, N, 32):  # control a ~1,5 kHz
    v = rms[i]
    acc = v + (acc - v) * (att ** 32 if v > acc else rel ** 32)
    envd[i:i + 32] = acc
duck = 1 - 0.62 * np.clip(envd * 2.2, 0, 1)
music *= duck[:, None]

# ---------------------------------------------------------------- efectos
sfx = np.zeros((N, 2))


def boom(dur=1.1, gain=1.0):
    n = int(dur * SR)
    t = ts(n)
    f = 32 + 70 * np.exp(-t * 7)
    x = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / (dur * 0.33))
    crack = filt(sos_bp(200, 3500), noise(n)) * np.exp(-t / 0.03) * 0.9
    tail = filt(sos_lp(900), noise(n)) * np.exp(-t / 0.35) * 0.12
    return np.tanh((x + crack + tail) * 1.4) * gain


def whoosh(dur=0.42, up=True, gain=1.0):
    n = int(dur * SR)
    w = noise(n)
    out = np.zeros(n)
    blocks = 24
    for bb in range(blocks):
        a, z = bb * n // blocks, (bb + 1) * n // blocks
        frac = bb / blocks if up else 1 - bb / blocks
        c = 350 * (10 ** frac)
        out[a:z] = filt(sos_bp(c * 0.6, c * 1.9), w[max(0, a - 2000):z])[-(z - a):]
    return out * np.sin(np.linspace(0, np.pi, n)) ** 1.6 * gain


def blip(f=1400, dur=0.07, gain=1.0):
    n = int(dur * SR)
    t = ts(n)
    x = np.sin(2 * np.pi * f * t + 2 * np.sin(2 * np.pi * f * 1.5 * t) * np.exp(-t / 0.01))
    return x * np.exp(-t / 0.018) * gain


def pop(gain=1.0):
    n = int(0.09 * SR)
    t = ts(n)
    f = 380 + 900 * np.exp(-t * 60)
    x = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / 0.03)
    return x * gain


def chime(gain=1.0):
    out = np.zeros(int(1.0 * SR))
    for k, f in enumerate((1318.5, 987.8)):
        n = int(0.7 * SR)
        t = ts(n)
        x = (np.sin(2 * np.pi * f * t) + 0.3 * np.sin(2 * np.pi * f * 2.01 * t)) * np.exp(-t / 0.25)
        i = int(k * 0.16 * SR)
        out[i:i + n] += x * env(n, 0.002, 0.05)
    return out * gain


def click(gain=1.0, f=3200):
    n = int(0.012 * SR)
    t = ts(n)
    return filt(sos_bp(f * 0.6, f * 1.6), noise(n)) * np.exp(-t / 0.0025) * gain


def ratchet(a, b, rate0, rate1, gain=0.25, f=3200, pan=0.0):
    tm = a
    k = 0
    while tm < b:
        p = (tm - a) / max(1e-6, b - a)
        place(sfx, click(gain * (0.8 + 0.4 * rng.random()), f * (0.9 + 0.2 * rng.random())), tm, pan=pan)
        tm += 1 / (rate0 + (rate1 - rate0) * p)
        k += 1


def liquid(dur, gain=1.0, pour=True):
    n = int(dur * SR)
    t = ts(n)
    base = filt(sos_bp(250, 2600 if pour else 900), noise(n)) * (0.6 if pour else 0.25)
    bub = np.zeros(n)
    nb = int(dur * (38 if pour else 14))
    for _ in range(nb):
        i = rng.integers(0, max(1, n - int(0.06 * SR)))
        m = int(0.05 * SR)
        tt = ts(m)
        f0 = rng.uniform(300, 900) if pour else rng.uniform(160, 420)
        bub[i:i + m] += np.sin(2 * np.pi * np.cumsum(f0 * (1 + 2.5 * tt / 0.05)) / SR) * np.exp(-tt / 0.012) * rng.uniform(0.3, 1)
    am = 1 + 0.3 * np.sin(2 * np.pi * 7 * t)
    return (base * am + bub * 0.5) * env(n, 0.06, 0.18) * gain


def sizzle(dur, gain=1.0):
    n = int(dur * SR)
    t = ts(n)
    x = filt(sos_hp(3500), noise(n)) * (0.5 + 0.5 * (rng.random(n) > 0.92))
    return x * (t / dur) ** 1.5 * env(n, 0.02, 0.25) * gain


def zap(gain=1.0):
    n = int(0.35 * SR)
    t = ts(n)
    f = 900 + 1800 * (t / 0.35)
    sq = np.sign(np.sin(2 * np.pi * np.cumsum(f) / SR))
    return filt(sos_lp(5000), sq) * np.exp(-t / 0.12) * gain


def sweep(dur, f0, f1, gain=1.0):
    n = int(dur * SR)
    t = ts(n)
    f = f0 * (f1 / f0) ** (t / dur)
    x = np.sin(2 * np.pi * np.cumsum(f) / SR) + 0.25 * np.sin(4 * np.pi * np.cumsum(f) / SR)
    return x * env(n, 0.08, 0.15) * gain


# arranque inmediato (primer fotograma con golpe grave suave, sin tapar la voz)
place(sfx, boom(0.9, 0.35), 0.0)
place(sfx, blip(1800, 0.06, 0.18), 0.0)

# transiciones de escena
for sid, a, b in scenes[1:]:
    place(sfx, whoosh(0.4, up=True, gain=0.32), a - 0.24, pan=0.2)

# golpes
for nm, g in (("stamp", 1.0), ("crash", 1.0), ("altura", 0.9), ("r1", 0.75), ("r2", 0.75), ("r3", 0.75), ("warn", 0.8)):
    place(sfx, boom(1.2, g), cue(nm))

# testigo de reserva (mismos instantes que el video)
f2s = lambda f: f / FPS  # noqa: E731
dive, dive_end = cue("hookDive"), cue("hookDiveEnd")
place(sfx, chime(0.3), dive + (dive_end - dive) * 0.62)
crash, crash_end = cue("crash"), cue("crashEnd")
place(sfx, chime(0.3), crash + round((crash_end - crash) * FPS * 0.75) / FPS)
empA, empB = cue("toEmpty"), cue("toEmptyEnd")
place(sfx, chime(0.28), empA + round((empB - empA) * FPS * 0.8) / FPS)
place(sfx, chime(0.22), cue("opt3") + f2s(6))

# agujas que se mueven (trinquete)
ratchet(dive, dive_end, 10, 34, 0.22)
ratchet(cue("refill"), cue("refillEnd"), 30, 14, 0.18)
ratchet(cue("half"), cue("halfEnd"), 12, 18, 0.16)
ratchet(crash, crash_end, 14, 40, 0.24)
ratchet(cue("levelDrop"), cue("levelDropEnd"), 6, 6, 0.10)
ratchet(cue("calib"), cue("calib") + f2s(30), 30, 30, 0.14)
ratchet(empA, empB, 10, 36, 0.2)
for o in ("opt1", "opt2", "opt3"):
    ratchet(cue(o), cue(o) + f2s(10), 26, 12, 0.14)

# odómetro
ratchet(cue("kmRun"), cue("kmRunEnd"), 16, 16, 0.07, f=5200, pan=-0.2)

# líquidos
place(sfx, liquid(cue("refillEnd") - cue("refill") + 0.3, 0.5, True), cue("refill"))
place(sfx, liquid(cue("fillTopEnd") - cue("fillTop") + 0.3, 0.5, True), cue("fillTop"), pan=0.3)
place(sfx, liquid(cue("levelDropEnd") - cue("levelDrop"), 0.35, False), cue("levelDrop"))
place(sfx, liquid(cue("firstLitersEnd") - cue("firstLiters"), 0.35, False), cue("firstLiters"))
place(sfx, liquid(cue("heat") + f2s(18) - tip_a, 0.3, False), tip_a)

# etiquetas / aparición de elementos
for nm in ("lblFloat", "lblArm", "lblRes", "maxLine", "blindZone", "noMove", "lblPiso", "lblEje", "lblEscape", "narrow",
           "sliceTop", "sliceBottom", "sameLiter", "moreNeedle", "calib", "holdTop", "reserve", "sameRate", "pump",
           "cooling", "opt1", "opt2", "opt3"):
    place(sfx, pop(0.32), cue(nm), pan=float(rng.uniform(-0.3, 0.3)))
place(sfx, pop(0.35), f2s(W(37) - 3))  # "LITROS"
place(sfx, whoosh(0.22, up=False, gain=0.45), cue("strike") - 0.05)  # tachado
place(sfx, whoosh(0.16, up=True, gain=0.4), cue("boxX") - 0.03, pan=-0.3)
place(sfx, whoosh(0.16, up=True, gain=0.4), cue("boxX") + 0.08, pan=0.3)
place(sfx, sweep(cue("morphEnd") - cue("morph"), 140, 420, 0.06), cue("morph"))
place(sfx, zap(0.18), cue("signal"))
for k in range(4):
    place(sfx, blip(1500 + 250 * k, 0.05, 0.12), cue("signal") + 0.12 + k * 0.08)
place(sfx, blip(2200, 0.08, 0.2), cue("needleMove"))
place(sfx, sweep(cue("realLineEnd") - cue("realLine"), 300, 600, 0.05), cue("realLine"))
place(sfx, sweep(cue("needleCurveEnd") - cue("needleCurve"), 700, 220, 0.06), cue("needleCurve"))
place(sfx, sizzle(1.6, 0.18), cue("heat") - 0.6)
place(sfx, blip(1046, 0.18, 0.28), cue("comment"))
place(sfx, blip(1568, 0.22, 0.24), cue("comment") + 0.09)

# ---------------------------------------------------------------- mezcla
vst = np.stack([vbuf, vbuf], 1)
mix = vst * 1.0 + music * 0.26 + sfx * 0.42
mix = np.tanh(mix * 1.05) / np.tanh(1.05)
mix /= np.max(np.abs(mix)) + 1e-9
mix *= 0.9
fade = int(0.004 * SR)
mix[:fade] *= np.linspace(0, 1, fade)[:, None]
mix[-fade:] *= np.linspace(1, 0, fade)[:, None]


def save(path, x):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    wavfile.write(path, SR, (np.clip(x, -1, 1) * 32767).astype(np.int16))


save(os.path.join(ROOT, "public/bencina/soundtrack.wav"), mix)
for name, x in (("voz", vst), ("musica", music), ("efectos", sfx)):
    save(os.path.join(ROOT, "public/bencina/stems", f"{name}.wav"), x / (np.max(np.abs(x)) + 1e-9) * 0.9)
print(f"OK · {TOTAL:.3f} s ({TOTAL_F} fotogramas) · escenas: " + ", ".join(f"{s}@{a:.2f}" for s, a, _ in scenes))
