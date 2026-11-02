#!/usr/bin/env python3
"""
Reel 01 · "El chat" — diseño sonoro 100 % sintetizado (sin samples ni música de terceros).
Lee src/reels/chat/timeline.json (los mismos fotogramas que el video) y escribe public/audio/el-chat.wav.

Capas:
  1. Cabina: rumor de autopista MUY bajo durante el chat (la pista que casi nadie nota).
  2. Interfaz: vibración + "pop" de mensajes entrantes, "envío" de los propios.
  3. Revelación: el rumor se abre, chirrido de neumáticos del auto de adelante y luego el propio.
  4. Corte: golpe sordo, silencio y pitido (acúfeno).
  5. Datos y cierre: pulso grave, ticks del contador, acorde final.
"""
import json
import os
import sys

import numpy as np
from scipy import signal
from scipy.io import wavfile

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from sfx import (SR, bp, brown, env, hp, lp, place, pop_in, pop_out, soft_clip, thump, tick, vibrate, whoosh)

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
T = json.load(open(os.path.join(ROOT, "src", "reels", "chat", "timeline.json")))
FPS = T["fps"]
f2s = lambda f: f / FPS
TOTAL = f2s(T["total"])
N = int(round(TOTAL * SR))
rng = np.random.default_rng(3)
mix = np.zeros((N, 2))

REVEAL, CRASH, DATA, END = (f2s(T[k]) for k in ("reveal", "crash", "data", "end"))

# ------------------------------------------------------------ 1) cabina
def cabin(dur, level, open_=0.0, seed=0):
    n = int(dur * SR)
    g = np.random.default_rng(seed)
    out = np.zeros((n, 2))
    ts = np.arange(n) / SR
    for ch in range(2):
        rumble = lp(brown(n, g), 180, 4)
        tire = bp(g.standard_normal(n), 250, 900 + 2500 * open_, 2)
        wind = bp(g.standard_normal(n), 1200, 6000, 2) * open_
        out[:, ch] = rumble * 0.9 + tire * (0.10 + 0.35 * open_) + wind * 0.25
    eng = sum(np.sin(2 * np.pi * 34 * h * ts + h) / h for h in range(1, 6)) * 0.25
    out += lp(eng, 300)[:, None]
    return out / (np.max(np.abs(out)) + 1e-9) * level

chat_bed = cabin(REVEAL + 0.05, 0.065, 0.0, 1) * env(int((REVEAL + 0.05) * SR), 0.3, 0.02)[:, None]
place(mix, chat_bed, 0.0)
reveal_bed = cabin(CRASH - REVEAL, 0.42, 1.0, 2) * env(int((CRASH - REVEAL) * SR), 0.12, 0.0)[:, None]
place(mix, reveal_bed, REVEAL)

# ------------------------------------------------------------ 2) interfaz del chat
place(mix, vibrate(0.32) * 0.5, 0.0)
place(mix, pop_in() * 0.55, 0.02)
for m in T["msgs"]:
    if m["at"] == 0:
        continue
    t0 = f2s(m["at"])
    if m["from"] == "them":
        place(mix, pop_in() * 0.5, t0)
    else:
        place(mix, pop_out() * 0.45, t0)

# ------------------------------------------------------------ 3) revelación: chirridos
def screech(dur, f0, gain, seed, rise=0.4):
    n = int(dur * SR)
    g = np.random.default_rng(seed)
    ts = np.arange(n) / SR
    jitter = lp(g.standard_normal(n), 12, 2)
    jitter /= np.max(np.abs(jitter)) + 1e-9
    f = f0 * (1 + 0.06 * jitter + 0.015 * np.sin(2 * np.pi * 7 * ts))
    ph = 2 * np.pi * np.cumsum(f) / SR
    tone = np.sin(ph) + 0.45 * np.sin(2 * ph + 0.3) + 0.2 * np.sin(3 * ph + 1.1)
    am = 0.75 + 0.25 * lp(g.standard_normal(n), 30, 2) / 0.05
    am = np.clip(am, 0.3, 1.3)
    noise = bp(g.standard_normal(n), f0 * 0.7, f0 * 3.5, 2) * 0.9
    x = (tone * am * 0.6 + noise) * env(n, rise, 0.02, 1.6)
    return soft_clip(x * 1.4) * gain

# el auto de adelante (lejos, más agudo, entra con la revelación)
place(mix, np.stack([screech(CRASH - REVEAL, 1350, 0.20, 5, 0.25) * 0.85, screech(CRASH - REVEAL, 1360, 0.20, 6, 0.25)], 1), REVEAL + 0.05)
# el propio frenazo, tarde (fotograma 34 de la revelación)
slam = REVEAL + 34 / FPS
place(mix, np.stack([screech(CRASH - slam, 980, 0.55, 7, 0.08), screech(CRASH - slam, 990, 0.55, 8, 0.08)], 1), slam)
place(mix, whoosh(0.55, up=False) * 0.35, REVEAL - 0.02)
# latido que se acelera
for i, t in enumerate(np.cumsum([0.0, 0.42, 0.36, 0.3])):
    place(mix, thump(0.25, 62, 0.09) * 0.55, REVEAL + 0.15 + t)

# ------------------------------------------------------------ 4) corte
# cortar todo exactamente en el fotograma del corte
cut = int(round(CRASH * SR))
fade = int(0.004 * SR)
mix[cut - fade:cut] *= np.linspace(1, 0, fade)[:, None]
mix[cut:] = 0
place(mix, thump(0.7, 46, 0.11) * 0.6, CRASH)
n = int(2.2 * SR)
ts = np.arange(n) / SR
ring = np.sin(2 * np.pi * 4700 * ts) * env(n, 0.05, 1.6, 1.4) * 0.05
place(mix, np.stack([ring, ring * 0.92], 1), CRASH + 0.12)

# ------------------------------------------------------------ 5) datos y cierre
def pad(dur, freqs, level, lpf=1200, a=0.6, r=0.8):
    n = int(dur * SR)
    ts = np.arange(n) / SR
    x = np.zeros(n)
    for i, f in enumerate(freqs):
        for d in (-0.15, 0.0, 0.14):
            ff = f * (1 + d / 100)
            x += 2 * (ts * ff - np.floor(0.5 + ts * ff))
    x = lp(x / (len(freqs) * 3), lpf, 2) * env(n, a, r)
    return np.stack([x, x * 0.96], 1) * level

D2 = 73.42
place(mix, pad(END - DATA + 0.6, [D2, D2 * 1.5, D2 * 2.0], 0.22, 500, 0.8, 0.6), DATA)
for k in range(int((END - DATA) / 0.6)):
    place(mix, thump(0.22, 55, 0.08) * 0.35, DATA + 0.3 + k * 0.6)
place(mix, thump(0.6, 70, 0.12) * 0.6, DATA)
# contador: ticks durante el recorrido (fotogramas 65–127 de la escena de datos)
for fr in range(65, 128, 3):
    p = (fr - 65) / 62
    place(mix, tick(1500 + 900 * p, 0.03) * 0.16, DATA + fr / FPS)
place(mix, thump(0.5, 80, 0.1) * 0.5, DATA + 127 / FPS)
place(mix, tick(1046, 0.18, 0.06) * 0.25, DATA + 131 / FPS)
place(mix, tick(1568, 0.22, 0.07) * 0.2, DATA + 134 / FPS)
# cierre
place(mix, thump(0.8, 60, 0.15) * 0.7, END)
place(mix, pad(TOTAL - END, [D2 * 2 * 0.794 * 2, D2 * 2 * 1.189, D2 * 2 * 1.498, D2 * 2], 0.26, 1500, 0.4, 1.0), END)
place(mix, pop_in() * 0.45, END + 30 / FPS)
place(mix, tick(1318, 0.15, 0.05) * 0.18, END + 48 / FPS)

# ------------------------------------------------------------ mezcla
mix = soft_clip(mix * 1.1)
mix /= np.max(np.abs(mix)) + 1e-9
mix *= 0.9
e = int(0.01 * SR)
mix[:e] *= np.linspace(0.6, 1, e)[:, None]
mix[-int(0.3 * SR):] *= np.linspace(1, 0, int(0.3 * SR))[:, None]
out = os.path.join(ROOT, "public", "audio", "el-chat.wav")
os.makedirs(os.path.dirname(out), exist_ok=True)
wavfile.write(out, SR, (np.clip(mix, -1, 1) * 32767).astype(np.int16))
print(f"OK {out} · {TOTAL:.3f} s")
