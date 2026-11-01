#!/usr/bin/env python3
"""
MOKTA · "El botón que usas al revés" — banda sonora procedural.

Genera public/audio/soundtrack.wav (48 kHz, estéreo) y stems (musica, efectos, ambiente)
a partir de src/timeline.json: misma fuente de tiempos que el video → sincronía exacta.

Todo se sintetiza aquí (sin samples ni música de terceros): libre de licencias.
Música: 120 BPM (1 pulso = 15 fotogramas), La menor, progresión Am–F–C–G (un acorde por compás).
"""
import json
import os
import re

import numpy as np
from scipy import signal
from scipy.io import wavfile

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
T = json.load(open(os.path.join(ROOT, "src", "timeline.json")))
SR = 48000
FPS = T["fps"]
BEAT = 60 / T["bpm"]
rng = np.random.default_rng(11)

# ---------------------------------------------------------------- línea de tiempo
scenes = []
t0 = 0
for s in T["scenes"]:
    scenes.append(dict(id=s["id"], music=s["music"], start=t0 / FPS, dur=s["duration"] / FPS, f0=t0, beats=s["beats"], cues=s["cues"]))
    t0 += s["duration"]
TOTAL = t0 / FPS
N = int(round(TOTAL * SR))


def sc(id_):
    return next(s for s in scenes if s["id"] == id_)


def idx(sec):
    return int(round(sec * SR))


# ---------------------------------------------------------------- utilidades
def butter(kind, fc, order=2):
    return signal.butter(order, fc, btype=kind, fs=SR, output="sos")


def filt(sos, x):
    return signal.sosfilt(sos, x)


def noise(n):
    return rng.standard_normal(n)


def env_exp(n, tau):
    return np.exp(-np.arange(n) / SR / tau)


def place(buf, x, at, gain=1.0, pan=0.0):
    i = idx(at)
    if x.ndim == 1:
        x = np.stack([x * np.sqrt(1 - pan), x * np.sqrt(1 + pan)], 1)
    if i < 0:
        x = x[-i:]
        i = 0
    j = min(N, i + len(x))
    if j > i:
        buf[i:j] += x[: j - i] * gain


def midi(m):
    return 440.0 * 2 ** ((m - 69) / 12)


def saw(f, n, phase=0.0):
    ts = np.arange(n) / SR
    return 2 * ((ts * f + phase) % 1.0) - 1


def reverb_ir(dur=1.2, tau=0.35, seed=5):
    g = np.random.default_rng(seed)
    n = int(dur * SR)
    ir = np.zeros((n, 2))
    for c in range(2):
        ir[:, c] = g.standard_normal(n) * env_exp(n, tau)
    ir = np.stack([filt(butter("low", 6000), ir[:, c]) for c in range(2)], 1)
    ir[0] = 0
    return ir / np.sqrt(np.sum(ir**2, 0))


IR = reverb_ir()


def reverb(x, wet=0.25):
    if x.ndim == 1:
        x = np.stack([x, x], 1)
    y = np.stack([signal.fftconvolve(x[:, c], IR[:, c])[: len(x)] for c in range(2)], 1)
    return x * (1 - wet) + y * wet


# ---------------------------------------------------------------- instrumentos
def kick(gain=1.0):
    n = int(0.42 * SR)
    ts = np.arange(n) / SR
    f = 46 + 110 * np.exp(-ts * 28)
    x = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-ts / 0.16)
    x += filt(butter("high", 2000), noise(n)) * np.exp(-ts / 0.004) * 0.25
    return np.tanh(x * 1.6) * gain


def clap(gain=1.0):
    n = int(0.3 * SR)
    ts = np.arange(n) / SR
    e = np.zeros(n)
    for o in (0.0, 0.011, 0.022):
        k = ts >= o
        e[k] += np.exp(-(ts[k] - o) / (0.007 if o < 0.02 else 0.09))
    return filt(butter("band", [900, 3500]), noise(n)) * e * gain


def hat(open_=False, gain=1.0):
    n = int((0.22 if open_ else 0.05) * SR)
    x = filt(butter("high", 7500), noise(n)) * env_exp(n, 0.07 if open_ else 0.012)
    return x * gain


def bass_note(f, dur, gain=1.0, cutoff=320):
    n = int(dur * SR)
    x = saw(f, n) * 0.6 + np.sin(2 * np.pi * f / 2 * np.arange(n) / SR) * 0.8
    x = filt(butter("low", cutoff), x)
    e = np.minimum(1, np.arange(n) / (0.004 * SR)) * np.exp(-np.arange(n) / SR / (dur * 0.9))
    return x * e * gain


def pluck(f, gain=1.0, cutoff=2500, dur=0.22):
    n = int(dur * SR)
    x = saw(f, n) + saw(f * 1.006, n, 0.3)
    x = filt(butter("low", min(cutoff, 16000)), x)
    return x * env_exp(n, dur / 3.2) * gain * 0.5


def pad(freqs, dur, cutoff=1200, gain=1.0):
    n = int(dur * SR)
    x = np.zeros(n)
    for f in freqs:
        for d in (-0.15, 0.0, 0.14):
            x += saw(f * (1 + d / 100), n, rng.random())
    x = filt(butter("low", cutoff), x) / (len(freqs) * 3)
    a = int(0.05 * SR)
    e = np.ones(n)
    e[:a] = np.linspace(0, 1, a)
    e[-a:] = np.linspace(1, 0, a)
    return x * e * gain


def bell(f, dur=1.6, gain=1.0):
    n = int(dur * SR)
    ts = np.arange(n) / SR
    x = np.zeros(n)
    for k, (m, a, tau) in enumerate(((1, 1, 0.8), (2.76, 0.5, 0.35), (5.4, 0.25, 0.18), (8.9, 0.12, 0.09))):
        x += np.sin(2 * np.pi * f * m * ts + k) * a * np.exp(-ts / tau)
    return x * gain * 0.4


# ---------------------------------------------------------------- 1) música
mus = np.zeros((N, 2))
drums = np.zeros((N, 2))
side = np.ones(N)  # ganancia de "sidechain" (bombeo con el bombo)

CHORDS = [  # (raíz MIDI para el bajo, notas del acorde)
    (45, [57, 60, 64]),  # Am
    (41, [57, 60, 65]),  # F
    (48, [55, 60, 64]),  # C
    (43, [55, 59, 62]),  # G
]
BAR = 4 * BEAT


def chord_at(t):
    return CHORDS[int(t // BAR) % 4]


STYLE = {
    "hook": dict(kick="half", clap=False, hats="16q", bass="pulse", pad=900, arp=0.0, arpCut=1500),
    "groove": dict(kick="four", clap=True, hats="8", bass="8", pad=1500, arp=0.45, arpCut=2600),
    "winter": dict(kick="four", clap=True, hats="8", bass="8", pad=850, arp=0.35, arpCut=1300),
    "summer": dict(kick="four", clap=True, hats="16", bass="8", pad=2600, arp=0.55, arpCut=5200, oct=12),
    "rule": dict(kick="four", clap=True, hats="16", bass="8", pad=1800, arp=0.5, arpCut=3200, holdUntil=45),
    "recipe": dict(kick="four", clap=True, hats="8", bass="8", pad=1400, arp=0.5, arpCut=2000, build=True),
    "cta": dict(kick="four", clap=True, hats="8", bass="8", pad=2200, arp=0.45, arpCut=3000),
}

for s in scenes:
    st = STYLE[s["music"]]
    nbeats = int(round(s["dur"] / BEAT))
    hold = st.get("holdUntil", 0) / FPS
    for b in range(nbeats):
        tb = s["start"] + b * BEAT
        rel = tb - s["start"]
        if rel < hold - 1e-6:
            continue
        root, notes = chord_at(tb)
        # bombo
        k_on = st["kick"] == "four" or (st["kick"] == "half" and b % 2 == 0)
        if k_on:
            place(drums, kick(0.95), tb)
            i = idx(tb)
            n = min(N - i, int(0.35 * SR))
            side[i : i + n] = np.minimum(side[i : i + n], 1 - 0.55 * env_exp(n, 0.11))
        if st["clap"] and b % 2 == 1:
            place(drums, reverb(clap(0.55), 0.3), tb, pan=0.05)
        # platillos
        if st["hats"] in ("8", "16", "16q"):
            steps = 2 if st["hats"] == "8" else 4
            for k in range(steps):
                g = (0.22 if k % 2 == 1 else 0.13) * (0.5 if st["hats"] == "16q" else 1)
                place(drums, hat(False, g), tb + k * BEAT / steps, pan=0.25)
            if st["hats"] == "16":
                place(drums, hat(True, 0.12), tb + BEAT / 2, pan=-0.25)
        # bajo
        if st["bass"] == "8":
            for k in range(2):
                place(mus, bass_note(midi(root - 12 + (12 if (b % 4 == 3 and k == 1) else 0)), BEAT / 2 * 0.95, 0.55), tb + k * BEAT / 2)
        elif st["bass"] == "pulse":
            place(mus, bass_note(midi(root - 12), BEAT * 0.9, 0.6, 220), tb)
        # arpegio
        if st["arp"] > 0:
            cut = st["arpCut"]
            if st.get("build"):
                cut = 1200 + 5000 * min(1, rel / (s["beats"]["done"] / FPS))
            seq = [notes[0], notes[1], notes[2], notes[1] + 12]
            for k in range(4):
                place(mus, pluck(midi(seq[(b * 4 + k) % 4] + st.get("oct", 0)), st["arp"], cut), tb + k * BEAT / 4, pan=0.3 if k % 2 else -0.3)

    # colchón armónico por compás (cortado en los límites de escena)
    tb = s["start"]
    while tb < s["start"] + s["dur"] - 1e-6:
        if tb - s["start"] >= hold - 1e-6:
            d = min(BAR - (tb % BAR), s["start"] + s["dur"] - tb)
            _, notes = chord_at(tb + 1e-3)
            p = pad([midi(m - 12) for m in notes] + [midi(notes[0])], d, st["pad"], 0.5)
            place(mus, np.stack([p, np.roll(p, 220)], 1), tb)
            tb += d
        else:
            tb += BEAT

# redoble creciente antes de "LISTO" en la receta
r = sc("recipe")
t_done = r["start"] + r["beats"]["done"] / FPS
t_roll = r["start"] + r["beats"]["s4"] / FPS
t = t_roll
while t < t_done - 0.02:
    k = (t - t_roll) / (t_done - t_roll)
    place(drums, clap(0.15 + 0.35 * k), t, pan=0.1)
    t += BEAT / (2 if k < 0.4 else 4 if k < 0.75 else 8)
# platillo (crash) en el "LISTO"
n = int(1.8 * SR)
crash = filt(butter("high", 4000), noise(n)) * env_exp(n, 0.5) * 0.35
place(drums, reverb(crash, 0.3), t_done)

# en "rule": silencio de batería hasta el giro, el sub sostiene la tensión
rl = sc("rule")
n = int(1.5 * SR)
sub = np.sin(2 * np.pi * 55 * np.arange(n) / SR) * np.minimum(1, np.arange(n) / (0.02 * SR)) * env_exp(n, 0.9) * 0.6
place(mus, sub, rl["start"])

mus *= side[:, None]
music = mus + drums

# ---------------------------------------------------------------- 2) ambiente (lluvia cuando se ve el parabrisas)
amb = np.zeros((N, 2))


def rain(dur, seed):
    n = int(dur * SR)
    g = np.random.default_rng(seed)
    out = np.zeros((n, 2))
    for c in range(2):
        w = g.standard_normal(n)
        bed = filt(butter("band", [400, 6000]), w) * 0.25
        drops = np.zeros(n)
        hits = g.integers(0, n, int(dur * 70))
        drops[hits] = g.uniform(0.3, 1.0, len(hits))
        drops = filt(butter("band", [1500, 7000]), drops) * 1.2
        out[:, c] = bed + drops
    a = int(0.08 * SR)
    out[:a] *= np.linspace(0, 1, a)[:, None]
    out[-a:] *= np.linspace(1, 0, a)[:, None]
    return out


for sid, f_from, f_to, g in (("hook", 0, None, 0.5), ("winter", "pov", None, 0.6), ("recipe", 0, None, 0.55), ("cta", 0, None, 0.4)):
    s = sc(sid)
    a = s["start"] + (s["beats"][f_from] if isinstance(f_from, str) else f_from) / FPS
    b = s["start"] + s["dur"]
    place(amb, rain(b - a, len(sid)) * g, a)

# ---------------------------------------------------------------- 3) efectos
sfx = np.zeros((N, 2))


def sweep_noise(dur, f0, f1, q=0.5, gain=1.0, shape=1.5):
    n = int(dur * SR)
    w = noise(n)
    out = np.zeros(n)
    blocks = 32
    for b in range(blocks):
        a, z = b * n // blocks, (b + 1) * n // blocks
        c = f0 * (f1 / f0) ** (b / (blocks - 1))
        lo, hi = max(40, c * (1 - q)), min(20000, c * (1 + q))
        seg = filt(butter("band", [lo, hi]), w[max(0, a - 3000) : z])[-(z - a) :]
        out[a:z] = seg
    return out * np.sin(np.linspace(0, np.pi, n)) ** shape * gain


def fx_boom():
    n = int(1.4 * SR)
    ts = np.arange(n) / SR
    f = 32 + 50 * np.exp(-ts * 5)
    x = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-ts / 0.5)
    x += filt(butter("band", [120, 2500]), noise(n)) * np.exp(-ts / 0.04) * 0.7
    return reverb(np.tanh(x * 1.4) * 0.9, 0.25)


def fx_hit():
    n = int(0.8 * SR)
    ts = np.arange(n) / SR
    f = 45 + 120 * np.exp(-ts * 22)
    x = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-ts / 0.2)
    x += filt(butter("band", [300, 5000]), noise(n)) * np.exp(-ts / 0.03) * 0.6
    return reverb(np.tanh(x * 1.5) * 0.8, 0.3)


def fx_pop():
    n = int(0.09 * SR)
    ts = np.arange(n) / SR
    f = 500 + 900 * (1 - np.exp(-ts * 60))
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-ts / 0.025) * 0.35


def fx_click():
    n = int(0.12 * SR)
    ts = np.arange(n) / SR
    x = filt(butter("high", 1500), noise(n)) * np.exp(-ts / 0.0025) * 0.8
    x += np.sin(2 * np.pi * 3200 * ts) * np.exp(-ts / 0.006) * 0.3
    x += np.sin(2 * np.pi * 140 * ts) * np.exp(-ts / 0.03) * 0.5
    y = np.zeros(int(0.2 * SR))
    y[: len(x)] += x
    o = int(0.07 * SR)
    y[o : o + len(x)] += x * 0.45  # el botón vuelve
    return y


def fx_clunk():
    n = int(0.6 * SR)
    ts = np.arange(n) / SR
    x = np.sin(2 * np.pi * 90 * ts) * np.exp(-ts / 0.06)
    x += sum(np.sin(2 * np.pi * f * ts) * np.exp(-ts / 0.12) * 0.12 for f in (820, 1330, 2110))
    x += filt(butter("band", [200, 3000]), noise(n)) * np.exp(-ts / 0.01) * 0.6
    return reverb(x * 0.8, 0.2)


def fx_breath():
    n = int(0.75 * SR)
    ts = np.arange(n) / SR
    e = np.sin(np.pi * np.clip(ts / 0.75, 0, 1)) ** 1.2
    x = filt(butter("band", [350, 2400]), noise(n)) * e
    return x * 0.5


def fx_fog():
    return sweep_noise(1.4, 600, 3500, 0.6, 0.35, 1.0)


def fx_buzz():
    n = int(0.42 * SR)
    ts = np.arange(n) / SR
    sq = np.sign(np.sin(2 * np.pi * 98 * ts)) + 0.6 * np.sign(np.sin(2 * np.pi * 147 * ts))
    gate = ((ts < 0.17) | (ts > 0.22)).astype(float)
    x = filt(butter("low", 2200), sq) * gate * env_exp(n, 0.3)
    return x * 0.28


def fx_coin():
    x = np.zeros(int(0.7 * SR))
    for k, f in enumerate((1568, 1175, 880)):
        b = bell(f, 0.5, 0.6)
        i = int(k * 0.09 * SR)
        x[i : i + len(b)] += b[: len(x) - i]
    return x


def fx_riser(dur):
    n = int(dur * SR)
    ts = np.arange(n) / SR
    x = sweep_noise(dur, 300, 9000, 0.4, 0.5, 0.3) * (ts / dur) ** 1.6
    f = 200 * (8 ** (ts / dur))
    x += np.sin(2 * np.pi * np.cumsum(f) / SR) * (ts / dur) ** 2 * 0.15
    return x


def fx_loop():
    n = int(1.2 * SR)
    x = sweep_noise(1.2, 500, 2200, 0.5, 0.5, 1.0)
    pan = np.sin(np.linspace(0, 2 * np.pi, n))
    return np.stack([x * np.sqrt(0.5 * (1 - pan)), x * np.sqrt(0.5 * (1 + pan))], 1) * 1.2


def fx_strain():
    n = int(2.3 * SR)
    ts = np.arange(n) / SR
    f = 55 + 40 * (ts / 2.3) ** 1.3
    trem = 1 + 0.35 * np.sin(2 * np.pi * (8 + 10 * ts / 2.3) * ts)
    x = filt(butter("low", 900), np.sign(np.sin(2 * np.pi * np.cumsum(f) / SR))) * trem
    x += filt(butter("band", [1500, 4000]), noise(n)) * 0.08
    e = np.minimum(1, ts / 0.3) * np.minimum(1, (2.3 - ts) / 0.2)
    return x * e * 0.16


def fx_drain():
    n = int(1.4 * SR)
    ts = np.arange(n) / SR
    f = 900 * np.exp(-ts * 1.6) + 120
    x = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-ts / 0.7) * 0.3
    gl = np.zeros(n)
    for k in range(9):
        i = int((0.05 + k * 0.13) * SR)
        m = int(0.06 * SR)
        tt = np.arange(m) / SR
        gl[i : i + m] += np.sin(2 * np.pi * (400 - 2500 * tt) * tt) * np.exp(-tt / 0.02) * 0.5
    return reverb(x + gl * 0.6, 0.25)


def fx_dial():
    x = np.zeros(int(0.4 * SR))
    for k in range(7):
        c = filt(butter("high", 2500), noise(int(0.012 * SR))) * env_exp(int(0.012 * SR), 0.002)
        i = int(k * 0.035 * SR)
        x[i : i + len(c)] += c * 0.5
    return x


def fx_step(k):
    m = [69, 72, 76, 81][k]
    return reverb(pluck(midi(m), 0.9, 6000, 0.8) + bell(midi(m + 12), 0.8, 0.3), 0.35)


def fx_fan():
    n = int(1.8 * SR)
    ts = np.arange(n) / SR
    x = sweep_noise(1.8, 400, 2400, 0.7, 0.6, 0.6)
    return x * np.minimum(1, ts / 1.0)


def fx_ding():
    x = bell(midi(81), 2.2, 0.9) + bell(midi(88), 2.2, 0.6) + bell(midi(93), 2.2, 0.35)
    return reverb(x, 0.4)


def fx_tick():
    n = int(0.05 * SR)
    ts = np.arange(n) / SR
    return np.sin(2 * np.pi * 2400 * ts) * np.exp(-ts / 0.01) * 0.25


FX = {
    "boom": lambda: fx_boom(),
    "hit": lambda: fx_hit(),
    "whoosh": lambda: sweep_noise(0.42, 500, 4500, 0.5, 0.55),
    "whooshDown": lambda: sweep_noise(0.5, 5000, 300, 0.5, 0.5),
    "swish": lambda: sweep_noise(0.28, 1200, 9000, 0.5, 0.6, 1.0),
    "pop": lambda: fx_pop(),
    "click": lambda: fx_click(),
    "clunk": lambda: fx_clunk(),
    "loopWhoosh": lambda: fx_loop(),
    "breath": lambda: fx_breath(),
    "fogHiss": lambda: fx_fog(),
    "buzz": lambda: fx_buzz(),
    "coin": lambda: fx_coin(),
    "strain": lambda: fx_strain(),
    "drain": lambda: fx_drain(),
    "dial": lambda: fx_dial(),
    "step1": lambda: fx_step(0),
    "step2": lambda: fx_step(1),
    "step3": lambda: fx_step(2),
    "step4": lambda: fx_step(3),
    "fan": lambda: fx_fan(),
    "ding": lambda: fx_ding(),
    "tick": lambda: fx_tick(),
}
GAIN = {"boom": 1.0, "hit": 0.85, "pop": 0.55, "click": 0.9, "whoosh": 0.7, "whooshDown": 0.7, "swish": 0.6, "riser": 0.7}

def resolve(s, ref):
    """Referencia de un efecto → fotograma relativo a la escena: 12 · "press" · "habit-3" · "end-30"."""
    if isinstance(ref, (int, float)):
        return ref
    m = re.fullmatch(r"([A-Za-z0-9]+)([+-]\d+)?", ref)
    base = s["dur"] * FPS if m.group(1) == "end" else s["beats"][m.group(1)]
    return int(round(base)) + int(m.group(2) or 0)


qa = []
for s in scenes:
    for ref, name in s["cues"]:
        fr = resolve(s, ref)
        at = s["start"] + fr / FPS
        if name == "riser":
            d = s["start"] + s["dur"] - at
            place(sfx, fx_riser(d), at, GAIN["riser"])
        else:
            place(sfx, FX[name](), at, GAIN.get(name, 0.8))
        qa.append(dict(t=round(at, 3), frame=s["f0"] + fr, cue=name, scene=s["id"]))

# ---------------------------------------------------------------- 4) locución (scripts/gen_voice.py)
VO_JSON = os.path.join(ROOT, "src", "voice.json")
vox = np.zeros((N, 2))
has_voice = os.path.exists(VO_JSON) and os.path.exists(os.path.join(ROOT, "public", "audio", "voice", "hook.wav"))
if has_voice:
    VJ = json.load(open(VO_JSON))

    def voice_chain(x):
        x = filt(butter("high", 85, 2), x)
        x = x + 0.35 * filt(butter("band", [2500, 6000], 2), x)  # presencia
        # compresor suave (seguidor de envolvente, 4:1 sobre −18 dB)
        env = np.sqrt(filt(butter("low", 18, 1), x**2) + 1e-12)
        db = 20 * np.log10(env / (np.max(env) + 1e-9) + 1e-9)
        gr = np.where(db > -18, (db + 18) * (1 - 1 / 4), 0)
        x = x * 10 ** (-gr / 20)
        return x / (np.max(np.abs(x)) + 1e-9)

    for s in scenes:
        path = os.path.join(ROOT, "public", "audio", "voice", f"{s['id']}.wav")
        if not os.path.exists(path):
            continue
        vsr, v = wavfile.read(path)
        v = v.astype(np.float64) / 32768
        if vsr != SR:
            v = signal.resample_poly(v, SR, vsr)
        v = voice_chain(v)
        place(vox, v, s["start"] + VJ["scenes"][s["id"]]["start"] / FPS)

# ducking: la música, el ambiente y los efectos bajan cuando habla la voz
vo_env = np.abs(vox[:, 0])
att = filt(butter("low", 30, 1), vo_env)
duck = np.clip(att / (np.percentile(att[att > 1e-4], 60) if has_voice and np.any(att > 1e-4) else 1), 0, 1)
# relajación lenta (~250 ms) para que la música no "bombee" entre palabras
rel = np.copy(duck)
k = np.exp(-1 / (0.25 * SR))
for i in range(1, N):
    if rel[i] < rel[i - 1] * k:
        rel[i] = rel[i - 1] * k
duck = rel

# ---------------------------------------------------------------- mezcla
if has_voice:
    bg = music * 0.36 * (1 - 0.78 * duck)[:, None] + amb * 0.14 * (1 - 0.6 * duck)[:, None] + sfx * 0.7 * (1 - 0.45 * duck)[:, None]
    m_ = np.abs(vox[:, 0]) > 0.05
    r = lambda x: 20 * np.log10(np.sqrt(np.mean(x[m_] ** 2)) + 1e-12)  # noqa: E731
    print(f"voz sobre fondo mientras habla: {r(vox * 1.05) - r(bg):+.1f} dB")
    mix = music * 0.36 * (1 - 0.78 * duck)[:, None] + amb * 0.14 * (1 - 0.6 * duck)[:, None] + sfx * 0.7 * (1 - 0.45 * duck)[:, None] + vox * 1.05
else:
    mix = music * 0.42 + amb * 0.16 + sfx * 0.85
mix = np.tanh(mix * 1.1) / np.tanh(1.1)
mix /= np.max(np.abs(mix)) + 1e-9
mix *= 0.9
fade = int(0.004 * SR)
mix[:fade] *= np.linspace(0, 1, fade)[:, None]
mix[-fade:] *= np.linspace(1, 0, fade)[:, None]

os.makedirs(os.path.join(ROOT, "public", "audio", "stems"), exist_ok=True)


def save(path, x):
    wavfile.write(path, SR, (np.clip(x, -1, 1) * 32767).astype(np.int16))


save(os.path.join(ROOT, "public", "audio", "soundtrack.wav"), mix)
for name, x in (("musica", music), ("ambiente", amb), ("efectos", sfx)) + ((("voz", vox),) if has_voice else ()):
    save(os.path.join(ROOT, "public", "audio", "stems", f"{name}.wav"), x / (np.max(np.abs(x)) + 1e-9) * 0.9)
json.dump(dict(total=TOTAL, cues=qa), open(os.path.join(ROOT, "public", "audio", "events.json"), "w"), indent=1)
print(f"OK · {TOTAL:.3f} s · {N} muestras · {len(qa)} efectos")
