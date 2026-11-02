#!/usr/bin/env python3
"""
Reel 03 · "Tu motor en cámara lenta" — sonido de motor sintetizado y sincronizado al ciclo.

Integra el mismo perfil de velocidad que el video (src/reels/motor/timeline.json) muestra a muestra:
cada vez que el ciclo cruza un múltiplo de 180° ocurre una explosión (4 cilindros, 4 tiempos).
  · A velocidad real (3.000 rpm) las explosiones llegan a 100 por segundo y se funden en el zumbido del motor.
  · En cámara lenta (1/50) cada explosión es un golpe grave individual, sincronizado con la chispa en pantalla.
"""
import json
import os
import sys

import numpy as np

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from sfx import SR, bp, env, hp, lp, place, save_wav, soft_clip, stamp, thump, tick, whoosh

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
T = json.load(open(os.path.join(ROOT, "src", "reels", "motor", "timeline.json")))
FPS = T["fps"]
B = T["beats"]
TOTAL = B["total"] / FPS
N = int(round(TOTAL * SR))
rng = np.random.default_rng(9)
REAL = 600.0


def speed_at(fr):
    s = T["speed"]
    fr = np.asarray(fr, dtype=float)
    out = np.full(fr.shape, float(s[-1][1]))
    for i in range(len(s) - 1):
        a, va = s[i]
        b, vb = s[i + 1]
        m = (fr >= a) & (fr <= b)
        u = (fr[m] - a) / (b - a)
        e = u * u * (3 - 2 * u)
        out[m] = np.exp(np.log(va) + (np.log(vb) - np.log(va)) * e)
    out[fr < s[0][0]] = s[0][1]
    return out


# ---- integración del ángulo del ciclo por muestra (misma regla que el video: suma por fotograma)
frames = np.arange(int(B["total"]) + 1)
v_frame = speed_at(frames)
theta_frame = np.concatenate([[0.0], np.cumsum(v_frame)])[: len(frames)]
t_s = np.arange(N) / SR
fr_f = t_s * FPS
i0 = np.clip(np.floor(fr_f).astype(int), 0, len(frames) - 2)
u = fr_f - i0
theta = theta_frame[i0] + v_frame[i0] * u          # interpolación lineal dentro del fotograma
s_ratio = v_frame[i0] / REAL                        # 1 = tiempo real

events = np.nonzero(np.diff(np.floor(theta / 180.0)) > 0)[0] + 1
print("explosiones sintetizadas:", len(events))

engine = np.zeros(N)
booms = np.zeros((N, 2))

# pulso corto (régimen real): ~12 ms, fundamental grave + ruido
pn = int(0.014 * SR)
pt = np.arange(pn) / SR
pulse = (np.sin(2 * np.pi * 95 * pt) * 0.9 + np.sin(2 * np.pi * 190 * pt + 0.5) * 0.4) * np.exp(-pt / 0.0045)
pulse += lp(rng.standard_normal(pn), 2200) * np.exp(-pt / 0.002) * 0.6

for e in events:
    s = s_ratio[e]
    if s > 0.12:
        g = min(1.0, (s - 0.12) / 0.5)
        j = min(N, e + pn)
        engine[e:j] += pulse[: j - e] * g
    if s < 0.5:
        g = min(1.0, (0.5 - s) / 0.35)
        x = thump(0.9, 70, 0.22) * 0.9
        x += lp(rng.standard_normal(len(x)), 900) * np.exp(-np.arange(len(x)) / SR / 0.06) * 0.6
        x = soft_clip(x * 1.3)
        place(booms, x * g * 0.8, e / SR)

# cuerpo del motor (resonancia del escape) y ruido mecánico, ligado a la velocidad
engine = lp(engine, 1800)
engine = engine + bp(engine, 60, 400) * 0.8
mech = bp(rng.standard_normal(N), 1500, 6000) * np.clip((s_ratio - 0.1) / 0.6, 0, 1) * 0.05
engine = soft_clip(engine * 2.2) * 0.5 + mech

# respiración lenta (admisión/escape) en cámara lenta: ruido filtrado modulado por el ciclo
breath = lp(rng.standard_normal(N), 700) * (0.5 + 0.5 * np.sin(np.deg2rad(theta) * 2)) * np.clip(1 - s_ratio * 4, 0, 1) * 0.12

bed = np.zeros((N, 2))
bed[:, 0] = engine + breath
bed[:, 1] = engine * 0.96 + breath * 1.04

# ---- música: drone y pulso de tensión; acorde en el cierre
mus = np.zeros((N, 2))


def saw(f, n):
    ts = np.arange(n) / SR
    return 2 * (ts * f - np.floor(0.5 + ts * f))


def pad(dur, freqs, lvl, lpf, a=0.8, r=1.0):
    n = int(dur * SR)
    x = sum(saw(f * (1 + d / 100), n) for f in freqs for d in (-0.2, 0, 0.2)) / (3 * len(freqs))
    x = lp(x, lpf, 2) * env(n, a, r)
    return np.stack([x, x * 0.97], 1) * lvl


slow0, tr, oil, cta = (B[k] / FPS for k in ("slow", "trip", "oil", "cta"))
A1 = 55.0
place(mus, pad(tr - slow0 + 0.5, [A1, A1 * 1.5, A1 * 2], 0.35, 500), slow0 - 0.2)
place(mus, pad(TOTAL - oil + 0.2, [A1 * 2, A1 * 2 * 1.189, A1 * 3, A1 * 4], 0.32, 1400, 1.0, 1.2), oil - 0.1)

# ---- efectos
fx = np.zeros((N, 2))
place(fx, whoosh(0.6, up=False) * 0.4, (B["slow"] - 30) / FPS)          # frenada del tiempo
place(fx, thump(1.2, 50, 0.3) * 0.6, B["slow"] / FPS - 0.1)
for k in ("turns", "piston"):
    place(fx, whoosh(0.4, up=True) * 0.18, B[k] / FPS - 0.2)
place(fx, stamp(80) * 0.7, (B["piston"] + 76) / FPS)                    # ≈ 560 g
place(fx, whoosh(0.7, up=True) * 0.35, (B["trip"] - 18) / FPS)          # vuelta a tiempo real
for fr in range(B["trip"] + 14, B["trip"] + 61, 2):                      # contador 425.000
    p = (fr - B["trip"] - 14) / 46
    place(fx, tick(1200 + 1200 * p, 0.03) * 0.12, fr / FPS)
place(fx, thump(0.6, 70, 0.12) * 0.5, (B["trip"] + 61) / FPS)
place(fx, whoosh(0.6, up=False) * 0.3, oil - 0.3)
place(fx, thump(0.8, 55, 0.15) * 0.6, cta)
place(fx, tick(1318, 0.15, 0.05) * 0.2, cta + 14 / FPS)

mix = bed * 0.9 + booms * 0.95 + mus * 0.55 + fx * 0.9
# bajar el motor bajo los textos del cierre
duck = np.ones(N)
duck[int(oil * SR):] = np.linspace(1, 0.55, N - int(oil * SR))
mix *= duck[:, None]
mix = soft_clip(mix * 1.2)
mix /= np.max(np.abs(mix)) + 1e-9
mix *= 0.9
f = int(0.3 * SR)
mix[-f:] *= np.linspace(1, 0, f)[:, None]
out = os.path.join(ROOT, "public", "audio", "motor-lento.wav")
save_wav(out, mix)
print(f"OK {out} · {TOTAL:.3f} s")
