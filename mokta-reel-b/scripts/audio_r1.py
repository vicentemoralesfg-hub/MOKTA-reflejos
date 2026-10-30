#!/usr/bin/env python3
"""
MOKTA · Prototipo ronda 1 — diseño sonoro de referencia (procedural, sin samples de terceros).

Capas (perspectiva: dentro de la cabina):
  motor      2.450 rpm (sexta, ~120 km/h), 4 cilindros → encendido 81,7 Hz; la velocidad se oye en los
             armónicos 2–8 (160–650 Hz), porque un parlante de teléfono casi no reproduce < 200 Hz
  neumáticos ruido de rodadura 250–1.400 Hz + resonancia de cavidad (~215 Hz)
  viento     banda ancha suave, ráfagas lentas (a 120 km/h aún contenido)
  juntas     "ta-dum": eje delantero y trasero (2,7 m entre ejes → 81 ms a 120 km/h), en las MISMAS
             posiciones que dibuja el shader y que mueven la cámara (src/prototipo/seams.json)
  impacto    golpe grave de carrocería + quiebre de barrera plástica + restos; el ambiente se corta en seco
  balizas    relé de intermitentes sincronizado con el triángulo del instrumental

Regla: ningún sonido cambia en el fotograma de aparición de la barrera (la prueba es visual).
"""
import json
import math
import os

import numpy as np
from scipy import signal
from scipy.io import wavfile

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
T = json.load(open(os.path.join(ROOT, "src", "prototipo", "r1.json")))
SEAMS = json.load(open(os.path.join(ROOT, "src", "prototipo", "seams.json")))
SR = 48000
FPS = T["fps"]
V = T["speedKmh"] / 3.6
IMPACT_F = T["eventAt"] + math.ceil(T["barrierDistanceM"] / V * FPS - 1e-9)
RESULT_F = IMPACT_F + T["blackFrames"]
TOTAL_F = RESULT_F + T["resultFrames"]
DUR = TOTAL_F / FPS
N = int(round(DUR * SR))
t = np.arange(N) / SR
T_IMP = IMPACT_F / FPS
T_RES = RESULT_F / FPS
T_EVT = T["eventAt"] / FPS
FRONT, WHEELBASE = 1.0, 2.7
rng = np.random.default_rng(23)


def sos(kind, f, order=2):
    return signal.butter(order, f, btype=kind, fs=SR, output="sos")


def filt(s, x):
    return signal.sosfilt(s, x)


def peak(f0, q, x):
    b, a = signal.iirpeak(f0, q, fs=SR)
    return signal.lfilter(b, a, x)


def slow_noise(rate_hz, n, seed):
    """Ruido suave de baja frecuencia en [-1, 1]."""
    r = np.random.default_rng(seed)
    k = int(DUR * rate_hz) + 4
    pts = r.uniform(-1, 1, k)
    xs = np.linspace(0, DUR, k)
    return np.interp(t[:n], xs, pts)


def db(x):
    return 10 ** (x / 20)


def at(sec):
    return int(round(sec * SR))


# ------------------------------------------------------------------ motor
rpm = 2450 * (1 + 0.002 * slow_noise(0.7, N, 1))
crank = rpm / 60.0
phase = 2 * np.pi * np.cumsum(crank) / SR
orders = {0.5: 0.04, 1: 0.07, 1.5: 0.04, 2: 0.55, 2.5: 0.06, 3: 0.12, 4: 0.6, 5: 0.1,
          6: 0.55, 7: 0.07, 8: 0.4, 10: 0.22, 12: 0.12}
engine = np.zeros(N)
for o, a in orders.items():
    am = 1 + 0.08 * slow_noise(3.0, N, int(o * 10))
    engine += a * am * np.sin(o * phase + rng.uniform(0, 6.28))
# ruido de admisión/escape pulsado al ritmo del encendido
pulse = 0.5 + 0.5 * np.sin(2 * phase)
engine += 0.35 * filt(sos("band", [90, 420]), rng.normal(0, 1, N)) * pulse
engine = filt(sos("high", 35), engine)
engine = filt(sos("low", 1600), engine)  # paso a través del vano y el panel cortafuego
engine /= np.max(np.abs(engine))

# ------------------------------------------------------------------ neumáticos
w = rng.normal(0, 1, N)
tyre = filt(sos("band", [250, 1400]), w) + 0.5 * filt(sos("band", [1400, 3200]), w) * 0.4
tyre += 0.9 * peak(215, 7, rng.normal(0, 1, N))  # resonancia de cavidad
tyre *= 1 + 0.18 * slow_noise(0.8, N, 5)          # textura cambiante del asfalto
tyre /= np.max(np.abs(tyre))

# ------------------------------------------------------------------ viento
wind = filt(sos("band", [450, 5000]), rng.normal(0, 1, N))
wind *= 1 + 0.25 * slow_noise(0.35, N, 9)
wind /= np.max(np.abs(wind))

# ------------------------------------------------------------------ juntas ("ta-dum")
thumps = np.zeros(N)


def thump(at_s, amp):
    n = int(0.25 * SR)
    tt = np.arange(n) / SR
    body = np.sin(2 * np.pi * 58 * tt) * np.exp(-tt / 0.045) + 0.5 * np.sin(2 * np.pi * 118 * tt) * np.exp(-tt / 0.03)
    tick = filt(sos("band", [700, 2600]), rng.normal(0, 1, n)) * np.exp(-tt / 0.012) * 0.6
    x = (body + tick) * amp
    i = at(at_s)
    j = min(N, i + n)
    if 0 <= i < N:
        thumps[i:j] += x[: j - i]


hits = []
for p in SEAMS:
    tf = (p - FRONT - T["startS"]) / V
    tr = (p - FRONT + WHEELBASE - T["startS"]) / V
    for tc, a in ((tf, 1.0), (tr, 0.7)):
        if 0 <= tc < T_IMP:
            thump(tc, a)
            hits.append(tc)
assert all(abs(h - T_EVT) >= 0.35 for h in hits), "una junta suena junto a la aparición de la barrera"

# ------------------------------------------------------------------ cama de conducción (mezcla y corte en el impacto)
bed_l = db(-12) * engine + db(-10) * tyre + db(-22) * wind
bed_r = db(-12) * engine + db(-10) * np.roll(tyre, 211) + db(-22) * np.roll(wind, 977)
th = db(-9) * thumps
drive_l, drive_r = bed_l + th, bed_r + th
cut = at(T_IMP)
fade = int(0.004 * SR)
for x in (drive_l, drive_r):
    x[:fade] *= np.linspace(0, 1, fade)
    x[cut - fade:cut] *= np.linspace(1, 0, fade)
    x[cut:] = 0.0

# ------------------------------------------------------------------ impacto
imp_l = np.zeros(N)
imp_r = np.zeros(N)
n = int(1.6 * SR)
tt = np.arange(n) / SR
f_sweep = 95 * np.exp(-tt / 0.25) + 38
body = np.sin(2 * np.pi * np.cumsum(f_sweep) / SR) * np.exp(-tt / 0.32)
body += 0.8 * filt(sos("low", 320), rng.normal(0, 1, n)) * np.exp(-tt / 0.16)
crack_src = rng.normal(0, 1, n) * np.exp(-tt / 0.05)
crack = filt(sos("high", 700), crack_src) * 0.7
for f0, q, g in ((760, 6, 0.6), (1320, 8, 0.5), (2150, 9, 0.4), (3400, 10, 0.3)):
    crack += g * peak(f0, q, crack_src)
debris_l = np.zeros(n)
debris_r = np.zeros(n)
for k in range(34):
    t0 = 0.04 + rng.exponential(0.22)
    if t0 > 1.3:
        continue
    m = int(rng.uniform(0.002, 0.008) * SR)
    burst = filt(sos("band", [1800, 6500]), rng.normal(0, 1, m + 64))[64:] * np.exp(-np.arange(m) / (m / 3))
    g = 0.5 * math.exp(-t0 / 0.45) * rng.uniform(0.4, 1.0)
    pan = rng.uniform(0.2, 0.8)
    i = int(t0 * SR)
    j = min(n, i + m)
    debris_l[i:j] += burst[: j - i] * g * (1 - pan)
    debris_r[i:j] += burst[: j - i] * g * pan
hit = db(-1) * body + db(-5) * crack
i = cut
j = min(N, i + n)
imp_l[i:j] = (hit + db(-3) * debris_l)[: j - i]
imp_r[i:j] = (hit + db(-3) * debris_r)[: j - i]

# después del impacto: cabina en silencio (tono de sala muy bajo)
room = filt(sos("low", 400), rng.normal(0, 1, N)) * db(-52)
room[:cut] = 0

# ------------------------------------------------------------------ relé de balizas (sincronizado con el instrumental)
relay = np.zeros(N)


def click(at_s, f0, amp):
    m = int(0.03 * SR)
    tt2 = np.arange(m) / SR
    x = filt(sos("band", [1800, 4200]), rng.normal(0, 1, m)) * np.exp(-tt2 / 0.0025)
    x += 0.5 * np.sin(2 * np.pi * f0 * tt2) * np.exp(-tt2 / 0.006)
    i2 = at(at_s)
    if i2 < N:
        relay[i2:min(N, i2 + m)] += (x * amp)[: min(N, i2 + m) - i2]


period = 0.75
k = 0
while T_RES + k * period < DUR:
    click(T_RES + k * period, 620, 1.0)
    click(T_RES + k * period + period / 2, 540, 0.75)
    k += 1

out_l = drive_l + imp_l + room + db(-18) * relay
out_r = drive_r + imp_r + room + db(-18) * relay
end = int(0.01 * SR)
out_l[-end:] *= np.linspace(1, 0, end)
out_r[-end:] *= np.linspace(1, 0, end)
stereo = np.stack([out_l, out_r], 1)
stereo /= np.max(np.abs(stereo)) / db(-1.5)

os.makedirs(os.path.join(ROOT, "public", "audio"), exist_ok=True)
wavfile.write(os.path.join(ROOT, "public", "audio", "r1.wav"), SR, (stereo * 32767).astype(np.int16))

# ------------------------------------------------------------------ control: nada cambia en la aparición
def rms(a, b):
    seg = stereo[at(a):at(b), 0]
    return 20 * np.log10(np.sqrt(np.mean(seg ** 2)) + 1e-12)


print(f"duración {DUR:.3f} s · impacto {T_IMP:.3f} s · resultado {T_RES:.3f} s · juntas pisadas {len(hits)}")
print(f"RMS 0,5 s antes de la barrera {rms(T_EVT - 0.5, T_EVT):.2f} dB · 0,5 s después {rms(T_EVT, T_EVT + 0.5):.2f} dB")
bed = stereo[at(1):at(T_IMP - 0.1), 0]
spec = np.abs(np.fft.rfft(bed)) ** 2
fr = np.fft.rfftfreq(len(bed), 1 / SR)
print(f"energía de la cama de conducción sobre 200 Hz: {100 * spec[fr > 200].sum() / spec.sum():.0f} %")
