#!/usr/bin/env python3
"""
Reel 04 · "¿Hasta el clic o redondeas?" — música juguetona (cuerdas pulsadas Karplus-Strong a 120 BPM)
+ efectos: carga de combustible, el CLIC de la pistola, caja registradora del redondeo, gorgoteo,
alerta de "check engine", sello del veredicto. Todo sintetizado. Lee src/reels/clic/timeline.json.
"""
import json
import os
import sys

import numpy as np

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from sfx import SR, bp, env, hp, lp, place, save_wav, soft_clip, stamp, thump, tick, whoosh

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
T = json.load(open(os.path.join(ROOT, "src", "reels", "clic", "timeline.json")))
K = T["k"]
FPS = T["fps"]
f2s = lambda f: f / FPS
TOTAL = f2s(K["total"])
N = int(round(TOTAL * SR))
rng = np.random.default_rng(21)
BEAT = 0.5  # 120 BPM


def pluck(freq, dur=0.6, bright=0.5):
    """Karplus-Strong vectorizado por periodos."""
    n = int(dur * SR)
    L = max(2, int(round(SR / freq)))
    buf = rng.uniform(-1, 1, L)
    buf = lp(buf, 1500 + 6000 * bright)
    out = np.zeros(n + L)
    out[:L] = buf
    k = L
    while k < n:
        prev = out[k - L:k]
        nxt = 0.5 * (prev + np.roll(prev, 1)) * 0.996
        m = min(L, n - k)
        out[k:k + m] = nxt[:m]
        k += L
    return out[:n] * env(n, 0.002, 0.08)


def note(n):  # MIDI → Hz
    return 440 * 2 ** ((n - 69) / 12)


mus = np.zeros((N, 2))
drm = np.zeros((N, 2))
fx = np.zeros((N, 2))

# progresión I–V–vi–IV en Do (un acorde por compás de 4 pulsos)
chords = [[60, 64, 67], [55, 59, 62], [57, 60, 64], [53, 57, 60]]
roots = [36, 43, 45, 41]
pattern = [0, 1, 2, 1, 0, 2, 1, 2]  # arpegio en corcheas
music_end = TOTAL - 0.2
nb = int(music_end / BEAT)
for b in range(nb):
    t = b * BEAT
    bar = b // 4
    ch = chords[bar % 4]
    # silencio musical breve en el clic y en la llegada al cánister (los efectos mandan)
    if abs(t - f2s(K["clic"])) < 0.4 or (f2s(K["reach"]) - 0.1 < t < f2s(K["check"]) + 0.3):
        continue
    for h in range(2):
        i = pattern[(b * 2 + h) % 8]
        pan = -0.3 if h == 0 else 0.3
        place(mus, pluck(note(ch[i] + 12), 0.55, 0.6) * 0.35, t + h * BEAT / 2, pan=pan)
    if b % 2 == 0:
        place(mus, pluck(note(roots[bar % 4]), 0.9, 0.2) * 0.6, t)
    # batería liviana
    k = thump(0.25, 70, 0.07) * 0.55
    place(drm, k, t)
    if b % 2 == 1:
        n = int(0.15 * SR)
        clap = bp(rng.standard_normal(n), 1000, 6000) * np.exp(-np.arange(n) / SR / 0.04)
        place(drm, clap * 0.35, t)
    n = int(0.03 * SR)
    hat = hp(rng.standard_normal(n), 8000) * np.exp(-np.arange(n) / SR / 0.01)
    place(drm, hat * 0.18, t + BEAT / 2, pan=0.2)

# ---------------- efectos
def pour(dur, level=0.3):
    n = int(dur * SR)
    ts = np.arange(n) / SR
    x = bp(rng.standard_normal(n), 300, 2500)
    glug = 0.6 + 0.4 * np.sin(2 * np.pi * (7 + 2 * np.sin(2 * np.pi * 0.7 * ts)) * ts)
    return x * glug * env(n, 0.08, 0.15) * level


def click():
    n = int(0.08 * SR)
    ts = np.arange(n) / SR
    x = hp(rng.standard_normal(n), 2500) * np.exp(-ts / 0.004) * 1.2
    x += np.sin(2 * np.pi * 1800 * ts) * np.exp(-ts / 0.01) * 0.6
    x += np.sin(2 * np.pi * 420 * ts) * np.exp(-ts / 0.03) * 0.5
    return x


def boing(f0=300, f1=700, dur=0.35):
    n = int(dur * SR)
    ts = np.arange(n) / SR
    f = f0 + (f1 - f0) * (1 - np.exp(-ts * 12)) + 40 * np.sin(2 * np.pi * 14 * ts) * np.exp(-ts * 6)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-ts / 0.12) * 0.5


def chime(f, dur=0.5):
    n = int(dur * SR)
    ts = np.arange(n) / SR
    return (np.sin(2 * np.pi * f * ts) + 0.3 * np.sin(2 * np.pi * f * 2.76 * ts) * np.exp(-ts / 0.06)) * np.exp(-ts / 0.18)


# gancho
place(fx, boing(260, 620) * 0.8, 0.02, pan=-0.4)
place(fx, boing(200, 480) * 0.8, 0.18, pan=0.4)
place(fx, stamp(110) * 0.5, 0.0)
place(fx, whoosh(0.5, up=True) * 0.3, f2s(K["diagram"]) - 0.35)
# carga normal → clic
place(fx, pour(f2s(K["clic"] - K["diagram"]), 0.28), f2s(K["diagram"]))
place(fx, click() * 0.9, f2s(K["clic"]))
place(fx, chime(1568, 0.4) * 0.2, f2s(K["clic"]) + 0.05)
# redondeo: más carga + caja registradora
place(fx, pour(f2s(K["reach"] - K["round"]), 0.33), f2s(K["round"]))
for fr in range(K["round"] + 4, K["reach"], 6):
    place(fx, tick(2600, 0.04, 0.008) * 0.28, f2s(fr), pan=0.3)
place(fx, chime(2093, 0.6) * 0.35, f2s(K["reach"]))  # "ding" de los $30.000
# llega al cánister: gorgoteo + golpe grave
n = int(1.0 * SR)
ts = np.arange(n) / SR
gurgle = bp(rng.standard_normal(n), 120, 900) * (0.5 + 0.5 * np.sign(np.sin(2 * np.pi * 9 * ts))) * env(n, 0.05, 0.4) * 0.6
place(fx, gurgle, f2s(K["reach"]) + 0.1)
place(fx, thump(0.8, 50, 0.18) * 0.7, f2s(K["reach"]))
# check engine: doble alerta
for i in range(2):
    place(fx, chime(988, 0.25) * 0.4, f2s(K["check"]) + i * 0.22)
# veredicto
place(fx, whoosh(0.4, up=False) * 0.3, f2s(K["verdict"]) - 0.1)
place(fx, stamp(80) * 0.9, f2s(K["verdict"] + 6))
place(fx, boing(300, 760) * 0.6, f2s(K["verdict"] + 12))
# final
place(fx, boing(260, 620) * 0.6, f2s(K["cta"]) + 0.05, pan=-0.4)
place(fx, boing(200, 480) * 0.6, f2s(K["cta"]) + 0.2, pan=0.4)
place(fx, tick(1318, 0.15, 0.05) * 0.2, f2s(K["cta"] + 12))

mix = mus * 0.75 + drm * 0.6 + fx * 0.95
mix = soft_clip(mix * 1.2)
mix /= np.max(np.abs(mix)) + 1e-9
mix *= 0.9
f = int(0.3 * SR)
mix[-f:] *= np.linspace(1, 0, f)[:, None]
out = os.path.join(ROOT, "public", "audio", "clic.wav")
save_wav(out, mix)
print(f"OK {out} · {TOTAL:.3f} s")
