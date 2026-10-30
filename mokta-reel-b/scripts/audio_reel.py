#!/usr/bin/env python3
"""
MOKTA · Reel completo (propuesta B) — diseño sonoro procedural, sin música ni samples de terceros.

Lee src/reel/timeline.json y src/reel/seams.json (los mismos que usa el video) y genera
public/audio/reel.wav (48 kHz, estéreo).

  gancho / cierre / CTA  auto detenido en ralentí (~780 rpm), cabina en silencio: el final empalma con el inicio
  rondas                 motor en sexta (rpm ∝ velocidad: 2.450 / 3.270 / 4.290), neumáticos +22·log10(v/120) dB,
                         viento +50·log10(v/120) dB; las rondas 2 y 3 empiezan acelerando (más carga, más armónicos)
  juntas                 eje delantero + trasero en las mismas posiciones que dibuja el shader y mueven la cámara
  ronda 2                auto en sentido contrario que pasa ~2 s antes de la barrera (izquierda)
  impacto                golpe grave + quiebre de barrera plástica + restos; el ambiente se corta en seco
  lectura                relé de balizas sincronizado con el triángulo del instrumental (0,75 s)

  voz                    public/audio/voz.wav (guion, generada por plan_guion.py); el ambiente baja 8 dB al hablar

Regla: ningún sonido cambia en el fotograma de aparición de la barrera (la prueba es visual).
"""
import json
import math
import os
import sys

import numpy as np
from scipy import signal
from scipy.io import wavfile

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from reel_timing import ROOT, T, FPS, kmh_at, layout, round_frames, s_at  # noqa: E402

SEAMS = json.load(open(os.path.join(ROOT, "src", "reel", "seams.json")))
SR = 48000
L = layout()
DUR = L["total"] / FPS
N = int(round(DUR * SR))
FRONT, WHEELBASE = 1.0, 2.7
HAZARD = 0.75
rng = np.random.default_rng(23)


def sos(kind, f, order=2):
    return signal.butter(order, f, btype=kind, fs=SR, output="sos")


def filt(s, x):
    return signal.sosfilt(s, x)


def peak(f0, q, x):
    b, a = signal.iirpeak(f0, q, fs=SR)
    return signal.lfilter(b, a, x)


def db(x):
    return 10 ** (x / 20)


def at(sec):
    return int(round(sec * SR))


def slow(rate, n, seed):
    r = np.random.default_rng(seed)
    k = int(n / SR * rate) + 4
    return np.interp(np.arange(n) / SR, np.linspace(0, n / SR, k), r.uniform(-1, 1, k))


ORDERS = {0.5: 0.04, 1: 0.07, 1.5: 0.04, 2: 0.55, 2.5: 0.06, 3: 0.12, 4: 0.6, 5: 0.1,
          6: 0.55, 7: 0.07, 8: 0.4, 10: 0.22, 12: 0.12}


def engine(rpm, load, seed):
    """rpm y load por muestra. load (0–1) sube los armónicos altos al acelerar."""
    n = len(rpm)
    r = np.random.default_rng(seed)
    phase = 2 * np.pi * np.cumsum(rpm / 60.0) / SR
    x = np.zeros(n)
    for o, a in ORDERS.items():
        bright = 1 + load * (0.6 if o >= 6 else 0.2)
        x += a * bright * (1 + 0.08 * slow(3.0, n, seed + int(o * 10))) * np.sin(o * phase + r.uniform(0, 6.28))
    x += 0.35 * (1 + load) * filt(sos("band", [90, 420]), r.normal(0, 1, n)) * (0.5 + 0.5 * np.sin(2 * phase))
    x = filt(sos("high", 35), x)
    return filt(sos("low", 1600 + 900 * float(np.mean(load))), x)


def noise_bed(n, seed):
    r = np.random.default_rng(seed)
    w = r.normal(0, 1, n)
    tyre = filt(sos("band", [250, 1400]), w) + 0.2 * filt(sos("band", [1400, 3200]), w)
    tyre += 0.9 * peak(215, 7, r.normal(0, 1, n))
    tyre *= 1 + 0.18 * slow(0.8, n, seed + 1)
    wind = filt(sos("band", [450, 5000]), r.normal(0, 1, n)) * (1 + 0.25 * slow(0.35, n, seed + 2))
    return tyre / np.max(np.abs(tyre)), wind / np.max(np.abs(wind))


out_l = np.zeros(N)
out_r = np.zeros(N)


def add(x, start_s, gain=1.0, pan=0.5):
    i = at(start_s)
    j = min(N, i + len(x))
    if i >= N or j <= 0:
        return
    out_l[i:j] += x[: j - i] * gain * math.sqrt(1 - pan) * math.sqrt(2)
    out_r[i:j] += x[: j - i] * gain * math.sqrt(pan) * math.sqrt(2)


def idle(seconds, seed):
    """Auto detenido: ralentí bajo y cabina silenciosa."""
    n = int(seconds * SR)
    rpm = 780 * (1 + 0.006 * slow(1.3, n, seed))
    e = engine(rpm, np.zeros(n), seed)
    e = e / np.max(np.abs(e)) * db(-24)
    room = filt(sos("low", 500), rng.normal(0, 1, n)) * db(-46)
    return e + room


def thump():
    n = int(0.25 * SR)
    tt = np.arange(n) / SR
    body = np.sin(2 * np.pi * 58 * tt) * np.exp(-tt / 0.045) + 0.5 * np.sin(2 * np.pi * 118 * tt) * np.exp(-tt / 0.03)
    tick = filt(sos("band", [700, 2600]), rng.normal(0, 1, n)) * np.exp(-tt / 0.012) * 0.6
    return body + tick


def impact():
    n = int(1.6 * SR)
    tt = np.arange(n) / SR
    body = np.sin(2 * np.pi * np.cumsum(95 * np.exp(-tt / 0.25) + 38) / SR) * np.exp(-tt / 0.32)
    body += 0.8 * filt(sos("low", 320), rng.normal(0, 1, n)) * np.exp(-tt / 0.16)
    src = rng.normal(0, 1, n) * np.exp(-tt / 0.05)
    crack = filt(sos("high", 700), src) * 0.7
    for f0, q, g in ((760, 6, 0.6), (1320, 8, 0.5), (2150, 9, 0.4), (3400, 10, 0.3)):
        crack += g * peak(f0, q, src)
    dl, dr = np.zeros(n), np.zeros(n)
    for _ in range(34):
        t0 = 0.04 + rng.exponential(0.22)
        if t0 > 1.3:
            continue
        m = int(rng.uniform(0.002, 0.008) * SR)
        burst = filt(sos("band", [1800, 6500]), rng.normal(0, 1, m + 64))[64:] * np.exp(-np.arange(m) / (m / 3))
        g = 0.5 * math.exp(-t0 / 0.45) * rng.uniform(0.4, 1.0)
        p = rng.uniform(0.2, 0.8)
        i = int(t0 * SR)
        j = min(n, i + m)
        dl[i:j] += burst[: j - i] * g * (1 - p)
        dr[i:j] += burst[: j - i] * g * p
    hit = db(-1) * body + db(-5) * crack
    return hit + db(-3) * dl, hit + db(-3) * dr


def click(f0, amp):
    m = int(0.03 * SR)
    tt = np.arange(m) / SR
    x = filt(sos("band", [1800, 4200]), rng.normal(0, 1, m)) * np.exp(-tt / 0.0025)
    x += 0.5 * np.sin(2 * np.pi * f0 * tt) * np.exp(-tt / 0.006)
    return x * amp


def relay(t0, t1, gain):
    k = 0
    while t0 + k * HAZARD < t1:
        add(click(620, 1.0), t0 + k * HAZARD, gain)
        add(click(540, 0.75), t0 + k * HAZARD + HAZARD / 2, gain)
        k += 1


# ------------------------------------------------------------------ gancho
add(idle(T["hook"]["duration"] / FPS, 101), 0)

event_times = []
for i, r in enumerate(T["rounds"]):
    fr = round_frames(i)
    A = L[f"r{i+1}"] / FPS
    t_imp = fr["impact"] / FPS
    n = at(t_imp)
    tt = np.arange(n) / SR
    frames = np.arange(fr["impact"] + 1)
    kmh_f = np.array([kmh_at(i, f) for f in frames])
    s_f = np.array([s_at(i, f) for f in frames])
    kmh = np.interp(tt * FPS, frames, kmh_f)
    s_t = np.interp(tt * FPS, frames, s_f)
    accel = np.clip(np.gradient(kmh) * SR / 40.0, 0, 1)  # carga al acelerar
    rel = kmh / 120.0
    e = engine(2450 * rel, accel, 200 + i)
    e = e / np.max(np.abs(e))
    tyre, wind = noise_bed(n, 300 + i)
    lg = np.log10(rel)
    bed = db(-12) * e * db(8 * lg + 3 * accel) + db(-10) * tyre * db(22 * lg) + db(-22) * wind * db(50 * lg)
    bed2 = db(-12) * e * db(8 * lg + 3 * accel) + db(-10) * np.roll(tyre, 211) * db(22 * lg) + db(-22) * np.roll(wind, 977) * db(50 * lg)
    fade = int(0.004 * SR)
    for x in (bed, bed2):
        x[:fade] *= np.linspace(0, 1, fade)
        x[-fade:] *= np.linspace(1, 0, fade)
    i0 = at(A)
    out_l[i0:i0 + n] += bed
    out_r[i0:i0 + n] += bed2

    # juntas (más secas a más velocidad, como la cámara)
    t_event = fr["event"] / FPS
    event_times.append(A + t_event)
    k = math.sqrt(r["speedKmh"] / 120.0)
    hits = []
    for p in SEAMS[r["id"]]:
        for off, amp in ((FRONT, 1.0), (FRONT - WHEELBASE, 0.7)):
            target = p - off
            if s_t[0] <= target < s_t[-1]:
                tc = float(np.interp(target, s_t, tt))
                add(thump(), A + tc, db(-9) * amp * k)
                hits.append(tc)
    assert all(abs(h - t_event) >= 0.3 for h in hits), f"junta junto a la barrera en {r['id']}"

    # auto en sentido contrario (ronda 2)
    if "decoyPassAt" in r:
        tp = r["decoyPassAt"] / FPS
        m = int(3.0 * SR)
        tl = np.arange(m) / SR - 1.5
        dist = np.sqrt((69.4 * tl) ** 2 + 3.2 ** 2)
        env = 1 / (1 + (dist / 6) ** 2)
        x = filt(sos("band", [200, 3500]), rng.normal(0, 1, m)) * env
        f_eng = 120 * np.where(tl < 0, 1.12, 0.9)
        x += 0.3 * np.sin(2 * np.pi * np.cumsum(f_eng) / SR) * env
        x[tl > 1.2] *= np.linspace(1, 0, int((tl > 1.2).sum()))
        add(x / np.max(np.abs(x)), A + tp - 1.5, db(-8), pan=0.2)

    # impacto, silencio y balizas
    il, ir = impact()
    i1 = at(A + t_imp)
    j1 = min(N, i1 + len(il))
    out_l[i1:j1] += il[: j1 - i1]
    out_r[i1:j1] += ir[: j1 - i1]
    t_res = A + fr["result"] / FPS
    t_end = A + fr["duration"] / FPS
    room = filt(sos("low", 400), rng.normal(0, 1, at(t_end - A - t_imp))) * db(-50)
    add(room, A + t_imp)
    relay(t_res, t_end, db(-18))

# ------------------------------------------------------------------ cierre y CTA: balizas que se apagan + ralentí
t_rev = L["reveal"] / FPS
t_cta = L["cta"] / FPS
relay(t_rev, t_rev + 1.5, db(-21))
add(idle(DUR - t_rev, 404), t_rev)

# ------------------------------------------------------------------ voz (guion) con atenuación del ambiente
# El ambiente baja 8 dB mientras se habla (ataque 80 ms, liberación 250 ms). La voz nunca suena cerca de
# la barrera (lo garantiza plan_guion.py), así que la atenuación tampoco cambia en ese momento.
vpath = os.path.join(ROOT, "public", "audio", "voz.wav")
if os.path.exists(vpath):
    _, vox = wavfile.read(vpath)
    vox = vox.astype(np.float64) / 32768.0
    if vox.ndim > 1:
        vox = vox.mean(axis=1)
    vox = np.pad(vox, (0, max(0, N - len(vox))))[:N]
    gate = np.zeros(N)
    for ln in json.load(open(os.path.join(ROOT, "src", "reel", "voz_tiempos.json"))):
        gate[at(ln["start"] - 0.12): at(ln["start"] + ln["dur"] + 0.25)] = 1.0
    k = np.ones(int(0.08 * SR)) / int(0.08 * SR)
    gate = np.convolve(gate, k, mode="same")
    duck = 1 - (1 - db(-8)) * gate
    bed_rms = np.sqrt(np.mean(out_l[at(L["r1"] / FPS + 1): at(L["r1"] / FPS + 3)] ** 2))
    active = np.abs(vox) > 0.02
    v_rms = np.sqrt(np.mean(vox[active] ** 2)) if active.any() else 1.0
    vgain = bed_rms * db(-8) * db(12) / v_rms  # voz ≈ 12 dB sobre el ambiente atenuado
    out_l = out_l * duck + vox * vgain
    out_r = out_r * duck + vox * vgain
    print(f"voz mezclada ({active.mean() * 100:.0f} % del tiempo con voz)")

st = np.stack([out_l, out_r], 1)
end = int(0.01 * SR)
st[-end:] *= np.linspace(1, 0, end)[:, None]
st /= np.max(np.abs(st)) / db(-1.5)
os.makedirs(os.path.join(ROOT, "public", "audio"), exist_ok=True)
wavfile.write(os.path.join(ROOT, "public", "audio", "reel.wav"), SR, (st * 32767).astype(np.int16))


def rms(a, b):
    seg = st[at(a):at(b), 0]
    return 20 * np.log10(np.sqrt(np.mean(seg ** 2)) + 1e-12)


print(f"duración {DUR:.3f} s ({L['total']} fotogramas)")
for i, te in enumerate(event_times):
    print(f"ronda {i+1}: barrera {te:.3f} s · RMS 0,4 s antes {rms(te - 0.4, te):.2f} dB · después {rms(te, te + 0.4):.2f} dB")
