#!/usr/bin/env python3
"""
Reel 02 · "¿Mito o verdad?" — pista sintetizada a 100 BPM (1 pulso = 18 fotogramas).
Batería + bajo + acordes; en cada pregunta: tic-tac en la cuenta 3-2-1, sello y remate
(VERDAD = dos notas que suben, MITO = dos notas que bajan). Sin samples: libre de licencias.
"""
import os
import sys

import numpy as np

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from sfx import SR, bp, env, hp, lp, place, save_wav, soft_clip, stamp, thump, tick, whoosh

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BPM = 100
BEAT = 60 / BPM
ANSWERS = ["VERDAD", "MITO", "MITO", "VERDAD", "MITO"]
HOOK_B, Q_B, END_B = 3, 10, 9
TOTAL_B = HOOK_B + Q_B * len(ANSWERS) + END_B
TOTAL = TOTAL_B * BEAT
N = int(round(TOTAL * SR))
rng = np.random.default_rng(5)
drums = np.zeros((N, 2))
music = np.zeros((N, 2))
fx = np.zeros((N, 2))
b2t = lambda b: b * BEAT


def kick():
    n = int(0.32 * SR)
    ts = np.arange(n) / SR
    f = 46 + 90 * np.exp(-ts * 30)
    x = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-ts / 0.12)
    x[: int(0.003 * SR)] += rng.standard_normal(int(0.003 * SR)) * 0.4
    return x


def clap():
    n = int(0.22 * SR)
    ts = np.arange(n) / SR
    x = bp(rng.standard_normal(n), 900, 5200) * np.exp(-ts / 0.05)
    for d in (0.008, 0.016):
        k = int(d * SR)
        x[k:] += bp(rng.standard_normal(n - k), 900, 5200) * np.exp(-ts[: n - k] / 0.01) * 0.6
    return x * 0.7


def hat(open_=False):
    n = int((0.12 if open_ else 0.04) * SR)
    ts = np.arange(n) / SR
    return hp(rng.standard_normal(n), 7000, 2) * np.exp(-ts / (0.04 if open_ else 0.012)) * 0.35


def saw(f, n):
    ts = np.arange(n) / SR
    return 2 * (ts * f - np.floor(0.5 + ts * f))


def bass_note(f, dur):
    n = int(dur * SR)
    x = saw(f, n) + 0.5 * saw(f * 1.005, n)
    cutoff_env = np.exp(-np.arange(n) / SR / 0.09)
    y = lp(x, 260) * 0.6 + lp(x, 1400) * 0.4 * cutoff_env
    return y * env(n, 0.004, 0.03) * 0.5


def chord(freqs, dur, bright=1800):
    n = int(dur * SR)
    x = np.zeros(n)
    for f in freqs:
        for d in (-0.2, 0, 0.2):
            x += saw(f * (1 + d / 100), n)
    return lp(x / (3 * len(freqs)), bright, 2) * env(n, 0.01, dur * 0.6)


def bell(f, dur=0.5):
    n = int(dur * SR)
    ts = np.arange(n) / SR
    x = np.sin(2 * np.pi * f * ts) + 0.4 * np.sin(2 * np.pi * f * 2.01 * ts) * np.exp(-ts / 0.08)
    return x * np.exp(-ts / 0.22)


D2, F2, G2, A2, C3 = 73.42, 87.31, 98.0, 110.0, 130.81
prog = [D2, D2, F2, C3 / 2 * 1.0, D2, G2, A2, A2 / 1.0]  # un acorde por compás (raíces)

# ---------------------------------------------------------------- estructura por pulso
cd_beats = set()      # pulsos con "3,2,1"
reveal_beats = {}     # pulso -> respuesta
q_starts = []
for i, a in enumerate(ANSWERS):
    s = HOOK_B + i * Q_B
    q_starts.append(s)
    for k in (2, 3, 4):
        cd_beats.add(s + k)
    reveal_beats[s + 5] = a
end_b = HOOK_B + Q_B * len(ANSWERS)

for b in range(TOTAL_B):
    t = b2t(b)
    in_cd = b in cd_beats
    bar = b // 4
    root = prog[bar % len(prog)]
    # batería: el gancho arranca con golpe; en la cuenta regresiva queda solo bombo + tic
    if b >= 1 and b < end_b + 6:
        place(drums, kick() * (0.9 if not in_cd else 0.7), t)
        if not in_cd:
            if b % 2 == 1:
                place(drums, clap(), t)
            for h in range(2):
                place(drums, hat(open_=(h == 1 and b % 4 == 3)), t + h * BEAT / 2, pan=0.2)
    # bajo
    if b >= 1 and b < end_b + 8:
        place(music, bass_note(root, BEAT * 0.48), t)
        place(music, bass_note(root * (2 if b % 2 else 1), BEAT * 0.4) * 0.7, t + BEAT / 2)
    # acordes (pad corto en cada compás)
    if b % 4 == 0 and b >= HOOK_B:
        tri = [root * 4, root * 4 * 1.189, root * 4 * 1.498]
        place(music, np.stack([chord(tri, BEAT * 3.6), chord(tri, BEAT * 3.6) * 0.97], 1) * 0.35, t)
    if in_cd:
        k = b - (b - HOOK_B) // Q_B * Q_B - HOOK_B  # 2,3,4
        place(fx, tick(1200 + 180 * (k - 2), 0.09, 0.03) * 0.7, t)
        place(fx, tick(2400 + 360 * (k - 2), 0.05, 0.01) * 0.35, t)
    if b in reveal_beats:
        a = reveal_beats[b]
        place(fx, stamp(85) * 0.9, t)
        crash = hp(rng.standard_normal(int(1.2 * SR)), 4000) * np.exp(-np.arange(int(1.2 * SR)) / SR / 0.35) * 0.18
        place(fx, np.stack([crash, crash[::-1] * 0 + crash], 1), t)
        if a == "VERDAD":
            place(fx, bell(880) * 0.4, t + 0.02)
            place(fx, bell(1318.5) * 0.4, t + 0.16)
        else:
            place(fx, (lp(saw(220, int(0.3 * SR)), 1500) * env(int(0.3 * SR), 0.005, 0.1)) * 0.3, t + 0.02)
            place(fx, (lp(saw(207.65, int(0.45 * SR)), 1200) * env(int(0.45 * SR), 0.005, 0.25)) * 0.3, t + 0.17)

# transiciones entre preguntas
for s in q_starts:
    place(fx, whoosh(0.5, up=True) * 0.25, b2t(s) - 0.3)
    place(fx, tick(1800, 0.06, 0.015) * 0.25, b2t(s))
# gancho: dos golpes (¿MITO / VERDAD?)
place(fx, stamp(70) * 0.9, 0.0)
place(fx, stamp(95) * 0.7, 2 / 30)
place(fx, whoosh(0.45, up=False) * 0.3, 0.0)
# cierre: filas del puntaje + acorde final
te = b2t(end_b)
place(fx, thump(0.8, 60, 0.15) * 0.7, te)
for i in range(3):
    place(fx, tick(1500 + 250 * i, 0.07, 0.02) * 0.35, te + (10 + i * 6) / 30)
place(fx, bell(1046.5, 0.8) * 0.3, te + 34 / 30)
place(fx, bell(1568, 0.8) * 0.25, te + 38 / 30)
final = [D2 * 4, D2 * 4 * 1.26, D2 * 4 * 1.498, D2 * 8]
place(music, np.stack([chord(final, TOTAL - te - 1.5, 2400), chord(final, TOTAL - te - 1.5, 2400)], 1) * 0.3, te + 1.5)

mix = drums * 0.55 + music * 0.6 + fx * 0.9
mix = soft_clip(mix * 1.3)
mix /= np.max(np.abs(mix)) + 1e-9
mix *= 0.9
f = int(0.25 * SR)
mix[-f:] *= np.linspace(1, 0, f)[:, None]
out = os.path.join(ROOT, "public", "audio", "mito-o-verdad.wav")
save_wav(out, mix)
print(f"OK {out} · {TOTAL:.3f} s ({TOTAL_B} pulsos)")
