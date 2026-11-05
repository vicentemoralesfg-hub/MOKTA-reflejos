#!/usr/bin/env python3
"""
MOKTA · El kilometraje engaña — banda sonora.

Mezcla en public/audio/soundtrack.wav (48 kHz estéreo) y deja stems en public/audio/stems/:
  - voz:     out/voz_procesada.wav (scripts/prepare_voice.sh)
  - música:  sintetizada aquí (sin samples ni música de terceros: libre de licencias)
  - efectos: sintetizados aquí, en los mismos instantes que las animaciones (src/data/timeline.json)
La música baja automáticamente cuando habla la voz (ducking).
"""
import json
import os
import subprocess

import numpy as np
from scipy import signal
from scipy.io import wavfile

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
TL = json.load(open(os.path.join(ROOT, "src", "data", "timeline.json")))
SR = 48000
FPS = TL["fps"]
TOTAL = TL["totalFrames"] / FPS
N = int(round(TOTAL * SR))
rng = np.random.default_rng(11)

SC = {s["id"]: dict(start=s["from"] / FPS, end=(s["from"] + s["duration"]) / FPS) for s in TL["scenes"]}
MK = {k: v["t"] for k, v in TL["markers"].items()}


def idx(t):
    return int(round(t * SR))


def sos_bp(lo, hi, order=2):
    return signal.butter(order, [lo, hi], btype="band", fs=SR, output="sos")


def sos_lp(fc, order=2):
    return signal.butter(order, fc, btype="low", fs=SR, output="sos")


def sos_hp(fc, order=2):
    return signal.butter(order, fc, btype="high", fs=SR, output="sos")


def filt(sos, x):
    return signal.sosfilt(sos, x)


def noise(n):
    return rng.standard_normal(n)


def env(n, a, d, curve=1.0):
    e = np.ones(n)
    na, nd = max(1, int(a * SR)), max(1, int(d * SR))
    e[:na] = np.linspace(0, 1, na)
    tail = np.exp(-np.arange(n - na) / (nd / 5.0)) ** curve
    e[na:] = tail
    return e


def place(buf, x, t, gain=1.0, pan=0.0):
    i = idx(t)
    if x.ndim == 1:
        x = np.stack([x * np.sqrt(1 - pan) / np.sqrt(1), x * np.sqrt(1 + pan)], 1) / np.sqrt(2) * np.sqrt(2)
    if i < 0:
        x = x[-i:]
        i = 0
    j = min(len(buf), i + len(x))
    if j > i:
        buf[i:j] += x[: j - i] * gain


def norm(x, peak=1.0):
    m = np.max(np.abs(x)) + 1e-9
    return x / m * peak


# ------------------------------------------------------------------ efectos
def whoosh(dur=0.42, up=True, bright=1.0):
    n = int(dur * SR)
    w = noise(n)
    tt = np.linspace(0, 1, n)
    out = np.zeros(n)
    # barrido de filtro por bloques
    blocks = 24
    for b in range(blocks):
        a, z = b * n // blocks, (b + 1) * n // blocks
        p = (b + 0.5) / blocks
        fc = 300 * (14 * bright) ** (p if up else 1 - p)
        out[a:z] = filt(sos_bp(max(80, fc * 0.6), min(18000, fc * 1.6)), w)[a:z]
    e = np.sin(np.pi * tt) ** 1.6
    return norm(out * e, 0.9)


def impact(big=1.0):
    n = int(1.6 * SR)
    tt = np.arange(n) / SR
    f = 34 + 80 * np.exp(-tt * 18)
    boom = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-tt * (3.2 / big))
    crack = filt(sos_bp(900, 7000), noise(n)) * np.exp(-tt * 38)
    body = filt(sos_lp(500), noise(n)) * np.exp(-tt * 9)
    x = boom * 1.0 + crack * 0.35 + body * 0.5
    return norm(np.tanh(x * 1.6), 0.95)


def thwack():
    n = int(0.35 * SR)
    tt = np.arange(n) / SR
    x = filt(sos_bp(150, 2500), noise(n)) * np.exp(-tt * 30) + np.sin(2 * np.pi * 110 * tt) * np.exp(-tt * 20)
    return norm(x, 0.9)


def tick(freq=2200, dur=0.06):
    n = int(dur * SR)
    tt = np.arange(n) / SR
    x = np.sin(2 * np.pi * freq * tt) * np.exp(-tt * 70) + filt(sos_hp(3000), noise(n)) * np.exp(-tt * 200) * 0.4
    return norm(x, 0.8)


def ding():
    n = int(0.7 * SR)
    tt = np.arange(n) / SR
    x = (np.sin(2 * np.pi * 1318.5 * tt) + 0.6 * np.sin(2 * np.pi * 1975.5 * tt) + 0.25 * np.sin(2 * np.pi * 2637 * tt)) * np.exp(-tt * 7)
    x *= np.minimum(1, tt / 0.003)
    return norm(x, 0.8)


def odo_roll(dur):
    """trinquete del odómetro: clics cada vez más espaciados + golpe final"""
    n = int((dur + 0.3) * SR)
    x = np.zeros(n)
    t = 0.0
    k = 0
    while t < dur:
        p = t / dur
        gap = 0.018 + 0.11 * p ** 2.2
        c = tick(2600 + 600 * rng.random(), 0.03) * (0.55 + 0.45 * (1 - p))
        i = idx(t)
        x[i:i + len(c)] += c[: n - i]
        t += gap
        k += 1
    clunk = thwack() * 0.9
    i = idx(dur)
    x[i:i + len(clunk)] += clunk[: n - i]
    return x


def riser(dur):
    n = int(dur * SR)
    tt = np.arange(n) / SR
    p = tt / dur
    w = noise(n)
    out = np.zeros(n)
    blocks = 40
    for b in range(blocks):
        a, z = b * n // blocks, (b + 1) * n // blocks
        fc = 200 * 40 ** ((b + 0.5) / blocks)
        out[a:z] = filt(sos_bp(fc * 0.7, min(18000, fc * 1.4)), w)[a:z]
    tone = np.sin(2 * np.pi * np.cumsum(120 + 900 * p ** 2) / SR) * 0.25
    return norm((out + tone) * p ** 2.2, 0.85)


def scan_hum(dur):
    n = int(dur * SR)
    tt = np.arange(n) / SR
    saw = signal.sawtooth(2 * np.pi * 110 * tt) * 0.4 + signal.sawtooth(2 * np.pi * 165.3 * tt) * 0.25
    x = filt(sos_bp(300, 2400), saw) * (0.6 + 0.4 * np.sin(2 * np.pi * 9 * tt))
    beep = np.sin(2 * np.pi * 1760 * tt) * ((tt * 6) % 1 < 0.08) * 0.5
    e = np.minimum(1, tt / 0.05) * np.minimum(1, (dur - tt) / 0.15)
    return norm((x + beep) * e, 0.7)


def alarm(count=2):
    beep_n = int(0.12 * SR)
    gap_n = int(0.07 * SR)
    out = np.zeros(count * (beep_n + gap_n))
    tt = np.arange(beep_n) / SR
    b = signal.square(2 * np.pi * 880 * tt) * 0.5 + np.sin(2 * np.pi * 1760 * tt) * 0.3
    b = filt(sos_lp(5000), b) * np.minimum(1, tt / 0.005) * np.minimum(1, (0.12 - tt) / 0.01)
    for k in range(count):
        out[k * (beep_n + gap_n): k * (beep_n + gap_n) + beep_n] = b
    return norm(out, 0.7)


def horn(dur=0.5):
    n = int(dur * SR)
    tt = np.arange(n) / SR
    x = signal.sawtooth(2 * np.pi * 415 * tt) + signal.sawtooth(2 * np.pi * 523 * tt)
    x = filt(sos_bp(350, 2500), x) * np.minimum(1, tt / 0.02) * np.minimum(1, (dur - tt) / 0.05)
    return norm(x, 0.6)


def idle_engine(dur):
    n = int(dur * SR)
    tt = np.arange(n) / SR
    f0 = 26
    x = sum(np.sin(2 * np.pi * f0 * h * tt + h) / h for h in range(1, 10))
    x += filt(sos_lp(400), noise(n)) * 0.6
    x *= 1 + 0.15 * np.sin(2 * np.pi * 3.1 * tt)
    e = np.minimum(1, tt / 0.3) * np.minimum(1, (dur - tt) / 0.3)
    return norm(filt(sos_lp(900), x) * e, 0.6)


def road_wind(dur):
    n = int(dur * SR)
    tt = np.arange(n) / SR
    w = filt(sos_bp(500, 4000), noise(n)) * (0.8 + 0.2 * np.sin(2 * np.pi * 0.4 * tt))
    tire = filt(sos_bp(90, 500), noise(n)) * 0.8
    e = np.minimum(1, tt / 0.25) * np.minimum(1, (dur - tt) / 0.3)
    return norm((w + tire) * e, 0.6)


def tap():
    n = int(0.08 * SR)
    tt = np.arange(n) / SR
    x = np.sin(2 * np.pi * 900 * tt * (1 - tt * 4)) * np.exp(-tt * 60)
    return norm(x, 0.7)


# ------------------------------------------------------------------ música (A menor, 100 BPM)
BPM = 100
BEAT = 60 / BPM
BAR = 4 * BEAT
T0 = SC["revelacion"]["start"] - 4 * BAR  # el "drop" cae en un compás exacto: el corte de la revelación
while T0 > 0:
    T0 -= BAR


def note(m):
    return 440 * 2 ** ((m - 69) / 12)


PROG = [  # (raíz MIDI, acorde MIDI)  Am – F – C – G
    (45, [57, 60, 64]),
    (41, [57, 60, 65]),
    (48, [55, 60, 64]),
    (43, [55, 59, 62]),
]
PROG_LIFT = [  # carretera: F – G – Am – C (más luminoso)
    (41, [57, 60, 65]),
    (43, [55, 59, 62]),
    (45, [57, 60, 64]),
    (48, [55, 60, 64]),
]


def section(t):
    """intensidad por sección: 0 sin música, 1 tensión, 2 beat suave, 3 beat completo, 4 lift, 5 breakdown"""
    if t < SC["gancho"]["end"]:
        return 1
    if t < SC["revelacion"]["start"]:
        return 2
    if t < SC["carretera"]["start"]:
        return 3
    if t < SC["veredicto"]["end"]:
        return 4
    if t < SC["verdad"]["start"]:
        return 3
    if t < SC["cta"]["start"]:
        return 5
    return 2


def kick():
    n = int(0.45 * SR)
    tt = np.arange(n) / SR
    f = 46 + 110 * np.exp(-tt * 30)
    x = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-tt * 7.5)
    x += filt(sos_hp(2000), noise(n)) * np.exp(-tt * 250) * 0.25
    return np.tanh(x * 1.4)


def clap():
    n = int(0.25 * SR)
    tt = np.arange(n) / SR
    e = np.exp(-tt * 22) * (1 + 0.6 * ((tt < 0.012) | ((tt > 0.018) & (tt < 0.026))))
    return filt(sos_bp(900, 5000), noise(n)) * e * 0.8


def hat(open_=False):
    n = int((0.22 if open_ else 0.05) * SR)
    tt = np.arange(n) / SR
    return filt(sos_hp(7000), noise(n)) * np.exp(-tt * (14 if open_ else 90)) * 0.5


def saw_voice(freq, dur, cutoff, detune=0.006):
    n = int(dur * SR)
    tt = np.arange(n) / SR
    x = sum(signal.sawtooth(2 * np.pi * freq * (1 + d) * tt + rng.random() * 6) for d in (-detune, 0, detune)) / 3
    return filt(sos_lp(cutoff), x)


music = np.zeros((N, 2))
drums = np.zeros((N, 2))
K, C, HC, HO = kick(), clap(), hat(), hat(True)
nbars = int((TOTAL - T0) / BAR) + 2
for b in range(nbars):
    bt = T0 + b * BAR
    if bt > TOTAL:
        break
    sec = section(max(0, bt + 0.01))
    prog = PROG_LIFT if sec == 4 else PROG
    root, chord = prog[b % 4]
    # pad
    if sec in (1, 2, 3, 4, 5):
        cut = {1: 700, 2: 1100, 3: 1600, 4: 2600, 5: 900}[sec]
        pad = sum(saw_voice(note(m), BAR + 0.4, cut) for m in chord) / 3
        e = np.minimum(1, np.arange(len(pad)) / (0.25 * SR)) * np.minimum(1, (len(pad) - np.arange(len(pad))) / (0.4 * SR))
        place(music, pad * e * (0.16 if sec != 5 else 0.22), bt, pan=0)
    # sub bajo en corcheas
    if sec in (1, 2, 3, 4, 5):
        for k in range(8):
            t = bt + k * BEAT / 2
            if sec == 1 and k % 2:
                continue
            n = int(BEAT / 2 * SR)
            tt = np.arange(n) / SR
            s = np.sin(2 * np.pi * note(root - 12 if root > 40 else root) * tt) * np.exp(-tt * 3) * np.minimum(1, tt / 0.004)
            place(music, s * (0.42 if sec != 5 else 0.3), t)
    # arpegio (pluck) en semicorcheas
    if sec in (3, 4):
        notes = chord + [chord[0] + 12, chord[1] + 12]
        for k in range(16):
            t = bt + k * BEAT / 4
            m = notes[[0, 2, 1, 3, 2, 4, 3, 1][k % 8]] + 12
            n = int(0.16 * SR)
            tt = np.arange(n) / SR
            pl = filt(sos_lp(2500 if sec == 3 else 4200), signal.square(2 * np.pi * note(m) * tt, 0.3)) * np.exp(-tt * 22)
            place(music, pl * 0.06, t, pan=0.35 if k % 2 else -0.35)
    # batería
    for k in range(4):
        t = bt + k * BEAT
        if sec in (2, 3, 4):
            place(drums, K, t, 0.85 if sec != 2 else 0.6)
        if sec in (3, 4) and k in (1, 3):
            place(drums, C, t, 0.5)
        if sec == 1:
            place(drums, K * 0.5, t, 0.5 if k == 0 else 0.0)
    for k in range(8):
        t = bt + k * BEAT / 2
        if sec in (2, 3, 4):
            place(drums, HO if (sec == 4 and k % 2) else HC, t, 0.35 if k % 2 else 0.2, pan=0.25)
        if sec == 1:
            for s16 in range(2):
                place(drums, HC, t + s16 * BEAT / 4, 0.12, pan=0.25)

# silencio breve antes del drop (tensión) y antes del "NO" de la verdad
def gap(t0, t1, buf):
    a, b = idx(t0), idx(t1)
    ramp = np.ones(b - a)
    ramp[: min(len(ramp), 600)] = np.linspace(1, 0, min(len(ramp), 600))
    ramp[600:] = 0
    buf[a:b] *= ramp[:, None]


gap(MK["revMucho"] - 0.7, MK["revMucho"], music)
gap(MK["revMucho"] - 0.7, MK["revMucho"], drums)
gap(MK["verNo"] - 0.35, MK["verNo"], music)

music_bus = music + drums
# fundido final
fade = np.ones(N)
fs = idx(TOTAL - 1.2)
fade[fs:] = np.linspace(1, 0, N - fs) ** 1.5
music_bus *= fade[:, None]

# ------------------------------------------------------------------ voz + ducking
sr_v, vo = wavfile.read(os.path.join(ROOT, "out", "voz_procesada.wav"))
assert sr_v == SR
vo = vo.astype(np.float64)
if vo.ndim > 1:
    vo = vo.mean(1)
vo = vo / 32768.0 if np.max(np.abs(vo)) > 2 else vo
voice = np.zeros((N, 2))
place(voice, np.stack([vo, vo], 1), TL["voiceOffset"])

# envolvente de la voz → reducción de la música (hasta -10 dB)
v = np.abs(voice[:, 0])
win = int(0.03 * SR)
envv = np.convolve(v, np.ones(win) / win, mode="same")
envv = envv / (np.percentile(envv[envv > 1e-4], 95) + 1e-9)
envv = np.clip(envv, 0, 1)
# ataque rápido, liberación lenta
sm = np.zeros_like(envv)
a_c, r_c = np.exp(-1 / (0.01 * SR)), np.exp(-1 / (0.25 * SR))
prev = 0.0
for i in range(0, N, 32):
    x = envv[i]
    c = a_c if x > prev else r_c
    prev = c ** 32 * prev + (1 - c ** 32) * x
    sm[i:i + 32] = prev
duck = 10 ** (-10 * sm / 20)
music_bus *= duck[:, None]

# ------------------------------------------------------------------ efectos en la línea de tiempo
fx = np.zeros((N, 2))
cuts = [s["start"] for k, s in SC.items() if k != "gancho"]
for c in cuts:
    place(fx, whoosh(0.4, up=True), c - 0.22, 0.42)

# gancho: odómetro + timbre ERROR
place(fx, odo_roll(26 / FPS), 0.0, 0.5)
place(fx, ding() * 0.6, 32 / FPS, 0.3)  # "POCOS KM ✓"
place(fx, impact(1.2), MK["hookError"], 0.9)
place(fx, thwack(), MK["hookError"], 0.5)

# comparación
for t in (MK["cmpModelo"], MK["cmpAnio"]):
    place(fx, tick(1500, 0.08), t, 0.35)
place(fx, odo_roll(26 / FPS), MK["cmpA"] - 4 / FPS, 0.4, pan=-0.2)
place(fx, odo_roll(28 / FPS), MK["cmpB"] - 4 / FPS, 0.4, pan=0.2)
place(fx, tap(), MK["cmpCual"] + 20 / FPS, 0.6)
place(fx, riser(SC["revelacion"]["start"] - MK["cmpCual"] + 0.05), MK["cmpCual"] - 0.05, 0.38)

# revelación: escáner + golpe en "MUCHO"
place(fx, scan_hum(36 / FPS), SC["revelacion"]["start"] + 4 / FPS, 0.3)
place(fx, impact(1.4), MK["revMucho"], 1.0)
place(fx, thwack(), MK["revMucho"], 0.5)

# odómetro vs horas
place(fx, tick(1900), MK["odoVueltas"], 0.4)
place(fx, thwack(), MK["odoNo"], 0.6)
place(fx, alarm(1), MK["odoNo"] + 0.03, 0.25)

# taco: motor en ralentí, bocina, tarjeta Ford
dur_taco = SC["taco"]["end"] - SC["taco"]["start"]
place(fx, idle_engine(dur_taco), SC["taco"]["start"], 0.28)
place(fx, horn(0.45), MK["tacoTaco"] + 0.1, 0.18, pan=0.5)
place(fx, whoosh(0.35, up=False), MK["tacoFord"] - 0.1, 0.35)
place(fx, odo_roll(1.4), MK["tacoHora"], 0.25)

# ciudad + hábitos: cada fila
for k in ("ciuCortos", "ciuFrenos", "ciuMotor", "habFrio", "habLomos", "habMant"):
    place(fx, whoosh(0.28, up=True, bright=0.6), MK[k] - 0.08, 0.3)
    place(fx, thwack(), MK[k] + 0.12, 0.28)
place(fx, alarm(3), MK["habMant"] + 0.35, 0.3)

# carretera
dur_car = SC["carretera"]["end"] - SC["carretera"]["start"]
place(fx, road_wind(dur_car), SC["carretera"]["start"], 0.22)
for k in ("carCaliente", "carVelocidad", "carFrenar", "carAceite"):
    place(fx, ding(), MK[k] + 6 / FPS, 0.28)

# veredicto
place(fx, impact(0.8), SC["veredicto"]["start"], 0.6)

# checklist
for k in ("chk1", "chk2", "chk3", "chk4"):
    place(fx, whoosh(0.25, up=True, bright=0.7), MK[k] - 0.15, 0.25)
    place(fx, ding(), MK[k] + 12 / FPS, 0.4)

# verdad
place(fx, impact(1.3), MK["verNo"], 0.8)

# CTA
place(fx, tap(), MK["ctaGuarda"] + 16 / FPS, 0.7)
place(fx, ding(), MK["ctaGuarda"] + 18 / FPS, 0.45)
place(fx, impact(0.7), MK["ctaGuarda"] + 1.35, 0.35)

# ------------------------------------------------------------------ mezcla
def rms(x):
    return np.sqrt(np.mean(x[np.abs(x) > 1e-5] ** 2)) if np.any(np.abs(x) > 1e-5) else 1


voice_g = 0.22 / rms(voice)
music_g = 0.07 / rms(music_bus)
fx_g = 0.8 / max(1e-9, np.max(np.abs(fx)))
mix = voice * voice_g + music_bus * music_g + fx * fx_g

out_dir = os.path.join(ROOT, "public", "audio")
os.makedirs(os.path.join(out_dir, "stems"), exist_ok=True)
os.makedirs(os.path.join(ROOT, "out"), exist_ok=True)

# stems con el mismo factor de escala que la mezcla (sin recortes)
scale = 0.95 / np.max(np.abs(mix))
for name, x in (("voz", voice * voice_g), ("musica", music_bus * music_g), ("efectos", fx * fx_g)):
    wavfile.write(os.path.join(out_dir, "stems", f"{name}.wav"), SR, (np.clip(x * scale, -1, 1) * 32767).astype(np.int16))

# masterización: limitador + normalización de sonoridad en dos pasadas (-14 LUFS, -1 dBTP: estándar de Reels)
raw = os.path.join(ROOT, "out", "mezcla_float.wav")
wavfile.write(raw, SR, (mix * scale).astype(np.float32))
chain = "alimiter=limit=0.9:attack=3:release=60:level=false"
p1 = subprocess.run(["ffmpeg", "-hide_banner", "-i", raw, "-af", f"{chain},loudnorm=I=-14:TP=-1.5:LRA=9:print_format=json", "-f", "null", "-"],
                    capture_output=True, text=True).stderr
m = json.loads(p1[p1.rindex("{"):p1.rindex("}") + 1])
ln = (f"loudnorm=I=-14:TP=-1.5:LRA=9:measured_I={m['input_i']}:measured_TP={m['input_tp']}:measured_LRA={m['input_lra']}"
      f":measured_thresh={m['input_thresh']}:offset={m['target_offset']}:linear=true")
subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", raw, "-af", f"{chain},{ln},aresample=48000", "-ar", "48000", "-c:a", "pcm_s16le",
                os.path.join(out_dir, "soundtrack.wav")], check=True)
print(f"soundtrack.wav {TOTAL:.2f} s · música {BPM} BPM, drop en {SC['revelacion']['start']:.2f} s · medido {m['input_i']} LUFS → -14")
