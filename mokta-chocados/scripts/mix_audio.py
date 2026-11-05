#!/usr/bin/env python3
"""
Mezcla final: locución (ElevenLabs) + efectos y base musical (diseñados por Qwen3, sintetizados por
render_sfx.py), con los mismos tiempos que el video (timeline.json + vo.json + sfx.json).
Salida: public/audio/soundtrack.wav (48 kHz estéreo) + stems.
"""
import json, os, re, unicodedata
import numpy as np
from scipy import signal
from scipy.io import wavfile

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SR = 48000
TL = json.load(open(os.path.join(ROOT, "src", "data", "timeline.json")))
VO = json.load(open(os.path.join(ROOT, "src", "data", "vo.json")))
CUES = json.load(open(os.path.join(ROOT, "src", "data", "sfx.json")))
FPS = TL["fps"]
SFX_DIR = os.path.join(ROOT, "public", "audio", "sfx")

# --- escenas (misma cuenta que src/timeline.ts)
scenes, frm = {}, 0
for s in TL["scenes"]:
    d = round((s["voStart"] + VO[s["id"]]["duration"] + s["tail"]) * FPS)
    scenes[s["id"]] = dict(start=frm, dur=d, voStart=s["voStart"])
    frm += d
TOTAL_F = frm
N = int(TOTAL_F / FPS * SR) + 1


def norm(s):
    s = unicodedata.normalize("NFD", s.lower())
    s = "".join(c for c in s if unicodedata.category(c) != "Mn")
    return re.sub(r"[^a-z0-9,]", "", s)


def word_frame(sc, word, nth=0):
    t = norm(word)
    ws = [w for w in VO[sc]["words"] if norm(w["t"]) == t or norm(w["t"]).startswith(t)]
    w = ws[min(nth, len(ws) - 1)]
    return round((scenes[sc]["voStart"] + w["s"]) * FPS)


def load(path):
    sr, raw = wavfile.read(path)
    x = raw.astype(np.float32)
    if raw.dtype == np.int16:
        x /= 32768.0
    elif raw.dtype == np.int32:
        x /= 2147483648.0
    if x.ndim > 1:
        x = x.mean(axis=1)
    if sr != SR:
        x = signal.resample_poly(x, SR, sr)
    return x


def place(bus, x, t, g=1.0):
    i = int(round(t * SR))
    if i >= len(bus):
        return
    j = min(len(bus), i + len(x))
    bus[i:j] += x[: j - i] * g


# --- locución
vo = np.zeros(N, np.float32)
for sc, info in scenes.items():
    x = load(os.path.join(ROOT, "public", "audio", "vo", f"{sc}.wav"))
    place(vo, x, info["start"] / FPS + info["voStart"])
vo *= 0.89 / (np.abs(vo).max() + 1e-9)

# --- efectos
sfx = np.zeros(N, np.float32)
cache, missing = {}, set()


def get(name):
    if name not in cache:
        p = os.path.join(SFX_DIR, f"{name}.wav")
        cache[name] = load(p) if os.path.exists(p) else None
    return cache[name]


def cue(name, t, g):
    x = get(name)
    if x is None:
        missing.add(name)
        return
    place(sfx, x, t, g)


tr = CUES["transitions"]
for k, (sc, info) in enumerate(list(scenes.items())[1:]):
    cue(tr["sfx"][k % len(tr["sfx"])], (info["start"] + tr["off"]) / FPS, tr["gain"])
for c in CUES["cues"]:
    info = scenes[c["scene"]]
    if "word" in c:
        f = word_frame(c["scene"], c["word"], c.get("nth", 0))
    elif "end" in c:
        f = info["dur"] + c["end"]
    else:
        f = round(c["t"] * FPS)
    f += c.get("off", 0)
    cue(c["sfx"], (info["start"] + f) / FPS, c["gain"])
if missing:
    print("AVISO: efectos sin archivo:", sorted(missing))
sfx *= 0.5

# --- música: compases según la intensidad de cada escena
meta = json.load(open(os.path.join(SFX_DIR, "music_meta.json")))
bar_s = meta["bar_seconds"]
bars = {k: load(os.path.join(SFX_DIR, f"music_bar_{k}.wav")) for k in (0, 3, 10)}
INTENS = {"s01": 3, "s02": 10, "s03": 10, "s04": 10, "s05": 10, "s06": 10, "s07": 3, "s08": 10, "s09": 3, "s10": 10}
music = np.zeros(N + SR * 4, np.float32)
t = 0.0
hook_drop = (scenes["s02"]["start"]) / FPS
while t < TOTAL_F / FPS:
    sc = [k for k, v in scenes.items() if v["start"] / FPS <= t + 1e-6][-1]
    place(music, bars[INTENS[sc]], t)
    t += bar_s
music = music[:N]
# corte de silencio justo antes del "drop" de la escena 2 (efecto de tensión tras el gancho)
a, b = int((hook_drop - 0.35) * SR), int(hook_drop * SR)
music[a:b] *= np.linspace(1, 0, b - a)
# final: fundido en los últimos 1,5 s
music[-int(1.5 * SR):] *= np.linspace(1, 0, int(1.5 * SR))
music *= 0.26

# --- ducking de música bajo la voz
env = np.abs(vo)
env = signal.sosfilt(signal.butter(1, 8, "low", fs=SR, output="sos"), env)
env = env / (env.max() + 1e-9)
duck = 1 - 0.62 * np.clip(env * 6, 0, 1)
# suavizado asimétrico (ataque rápido, liberación lenta)
k_a, k_r = np.exp(-1 / (0.03 * SR)), np.exp(-1 / (0.35 * SR))
d2 = np.empty_like(duck)
prev = 1.0
for i in range(0, len(duck), 64):
    v = duck[i]
    prev = (k_a ** 64) * prev + (1 - k_a ** 64) * v if v < prev else (k_r ** 64) * prev + (1 - k_r ** 64) * v
    d2[i:i + 64] = prev
music *= d2

# --- master estéreo
mix = vo + sfx + music
wide = np.concatenate([np.zeros(int(0.012 * SR)), music])[:N]
L = mix + 0.25 * wide
Rr = mix - 0.25 * wide + 0.25 * music
st = np.stack([L, Rr], axis=1)
st = np.tanh(st * 1.1) / np.tanh(1.1)  # limitador suave
st *= 0.95 / (np.abs(st).max() + 1e-9)
out = os.path.join(ROOT, "public", "audio")
os.makedirs(os.path.join(out, "stems"), exist_ok=True)
wavfile.write(os.path.join(out, "soundtrack.wav"), SR, (np.clip(st, -1, 1) * 32767).astype(np.int16))
for name, x in (("voz", vo), ("efectos", sfx), ("musica", music)):
    wavfile.write(os.path.join(out, "stems", f"{name}.wav"), SR, x.astype(np.float32))
print(f"soundtrack.wav  {N/SR:.2f}s  ({TOTAL_F} fotogramas)")
