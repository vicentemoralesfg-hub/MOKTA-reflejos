#!/usr/bin/env python3
"""
MOKTA · Test de reflejos — diseño sonoro procedural.

Genera public/audio/soundtrack.wav (48 kHz, estéreo) y stems en public/audio/stems/
a partir de src/timeline.json (misma fuente de tiempos que el video).

Todo el audio se sintetiza aquí: sin samples ni música de terceros → libre de licencias
para uso comercial (propiedad de quien ejecuta el script).

Regla de oro: NINGÚN sonido cambia en el fotograma en que aparece la barrera.
El ambiente y la música son estacionarios durante toda la espera y la ventana de reacción.
"""
import json
import os
import numpy as np
from scipy import signal
from scipy.io import wavfile

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
T = json.load(open(os.path.join(ROOT, "src", "timeline.json")))
SR = 48000
FPS = T["fps"]
rng = np.random.default_rng(7)


def f2s(frames):
    return frames / FPS


# ---------------------------------------------------------------- timeline
segs = []
t = 0.0
segs.append(dict(kind="hook", start=t, dur=f2s(T["hook"]["duration"])))
t += segs[-1]["dur"]
for r in T["rounds"]:
    d = f2s(r["eventAt"] + r["reactWindow"] + r["resultDuration"])
    segs.append(dict(kind="round", start=t, dur=d, kmh=r["speedKmh"],
                     event=t + f2s(r["eventAt"]),
                     freeze=t + f2s(r["eventAt"] + r["reactWindow"]),
                     result=r["resultDuration"], decoy=r.get("decoyAt") is not None,
                     idx=len(segs) - 1))
    t += d
segs.append(dict(kind="reveal", start=t, dur=f2s(T["reveal"]["duration"])))
t += segs[-1]["dur"]
segs.append(dict(kind="cta", start=t, dur=f2s(T["cta"]["duration"])))
t += segs[-1]["dur"]
TOTAL = t
N = int(round(TOTAL * SR))
tt = np.arange(N) / SR


def idx(sec):
    return int(round(sec * SR))


# ---------------------------------------------------------------- helpers
def sos_bp(lo, hi, order=2):
    return signal.butter(order, [lo, hi], btype="band", fs=SR, output="sos")


def sos_lp(fc, order=2):
    return signal.butter(order, fc, btype="low", fs=SR, output="sos")


def sos_hp(fc, order=2):
    return signal.butter(order, fc, btype="high", fs=SR, output="sos")


def filt(sos, x):
    return signal.sosfilt(sos, x)


def white(n):
    return rng.standard_normal(n)


def brown(n):
    b = np.cumsum(white(n))
    b = b - filt(sos_hp(8, 1), b)  # quitar deriva
    b = filt(sos_hp(20, 2), b)
    return b / (np.std(b) + 1e-9)


def env_adsr(n, a, r, curve=1.0):
    e = np.ones(n)
    na, nr = int(a * SR), int(r * SR)
    if na > 0:
        e[:na] = np.linspace(0, 1, na) ** curve
    if nr > 0:
        e[-nr:] *= np.linspace(1, 0, nr) ** curve
    return e


def place(buf, x, at, gain=1.0, pan=0.0):
    """Suma x (mono o estéreo) en buf estéreo desde 'at' segundos."""
    i = idx(at)
    if x.ndim == 1:
        l = x * np.sqrt(0.5 * (1 - pan)) * np.sqrt(2)
        r_ = x * np.sqrt(0.5 * (1 + pan)) * np.sqrt(2)
        x = np.stack([l, r_], 1)
    j = min(N, i + len(x))
    if j > i:
        buf[i:j] += x[: j - i] * gain


def smoothstep(a, b, x):
    y = np.clip((x - a) / (b - a), 0, 1)
    return y * y * (3 - 2 * y)


# ---------------------------------------------------------------- 1) ambiente de carretera
def road_bed(dur, kmh, seed):
    n = int(dur * SR)
    g = np.random.default_rng(seed)
    v = kmh / 3.6
    k = v / 58.3
    out = np.zeros((n, 2))
    for ch in range(2):
        w = g.standard_normal(n)
        b = np.cumsum(w)
        b = filt(sos_hp(25, 2), b)
        b /= np.std(b) + 1e-9
        tire = filt(sos_bp(120, 700 + 500 * k), w) * 0.55 + b * 0.35
        wind = filt(sos_bp(900, 5500), g.standard_normal(n)) * (0.12 + 0.55 * k * k)
        # leve modulación lenta (irregularidad del asfalto), no ligada a ningún evento
        am = 1 + 0.06 * np.sin(2 * np.pi * (0.37 + 0.11 * ch) * np.arange(n) / SR + g.random() * 6)
        out[:, ch] = (tire * (0.35 + 0.45 * k) + wind) * am
    # motor: serie armónica estable
    f0 = 40 + 0.45 * kmh
    ts = np.arange(n) / SR
    wob = 1 + 0.004 * np.sin(2 * np.pi * 0.8 * ts)
    eng = np.zeros(n)
    for h in range(1, 9):
        eng += np.sin(2 * np.pi * f0 * h * wob * ts + h * 0.7) / (h ** 1.25)
    eng = filt(sos_lp(700, 2), eng) * 0.22
    out += eng[:, None]
    return out


def tape_stop(x, dur):
    """Frenado de cinta: el sonido cae de tono y se apaga (para la congelación)."""
    n = len(x)
    nd = int(dur * SR)
    nd = min(nd, n)
    # velocidad de lectura decreciente 1→0
    rate = np.linspace(1, 0, nd) ** 1.3
    pos = np.cumsum(rate)
    pos = np.clip(pos, 0, n - 1)
    out = np.zeros((nd, x.shape[1]))
    for ch in range(x.shape[1]):
        out[:, ch] = np.interp(pos, np.arange(n), x[:, ch])
    out *= np.linspace(1, 0, nd)[:, None] ** 0.7
    return out


amb = np.zeros((N, 2))
for s in segs:
    if s["kind"] == "hook":
        bed = road_bed(s["dur"], 40, 1) * 0.45
        bed *= env_adsr(len(bed), 0.02, 0.02)[:, None]
        place(amb, bed, s["start"])
    elif s["kind"] == "round":
        moving = s["freeze"] - s["start"]
        bed = road_bed(moving + 0.5, s["kmh"], 10 + s["idx"])
        main = bed[: idx(moving)].copy()
        main *= env_adsr(len(main), 0.03, 0.0)[:, None]
        place(amb, main, s["start"])
        stop = tape_stop(bed[idx(moving) - 1:], 0.22)
        place(amb, stop, s["freeze"])
        if s["decoy"]:
            # auto en sentido contrario: se acerca y pasa ~2 s ANTES de la barrera (izquierda)
            v_rel = 25 + s["kmh"] / 3.6
            t_pass = s["start"] + 260 / v_rel
            dur = 2.2
            n = int(dur * SR)
            tl = np.arange(n) / SR - 1.6  # 0 = paso
            w = filt(sos_bp(300, 3200), rng.standard_normal(n))
            amp = 1 / (1 + (tl * v_rel / 6) ** 2)
            # efecto doppler aproximado con un filtro que baja al pasar
            hi = filt(sos_bp(1800, 6000), rng.standard_normal(n)) * (tl < 0)
            whoosh = (w + 0.6 * hi) * amp * env_adsr(n, 0.4, 0.3)
            pan = np.clip(-0.2 - 0.6 * smoothstep(-0.4, 0.3, tl), -1, 1)
            st = np.stack([whoosh * np.sqrt(0.5 * (1 - pan)), whoosh * np.sqrt(0.5 * (1 + pan))], 1) * 1.4
            place(amb, st * 0.55, t_pass - 1.6)
    elif s["kind"] in ("reveal", "cta"):
        kmh = 210 if s["kind"] == "reveal" else 120
        bed = road_bed(s["dur"], kmh, 40 + len(s["kind"])) * 0.28
        bed *= env_adsr(len(bed), 0.15, 0.25 if s["kind"] == "cta" else 0.05)[:, None]
        place(amb, bed, s["start"])

# ---------------------------------------------------------------- 2) música (tensión mínima, estacionaria)
BPM = 92
beat = 60 / BPM
D2 = 73.42


def saw(f, ts):
    return 2 * (ts * f - np.floor(0.5 + ts * f))


def pad(dur, freqs, lp=900, seed=0):
    n = int(dur * SR)
    ts = np.arange(n) / SR
    x = np.zeros(n)
    for i, f in enumerate(freqs):
        for d in (-0.12, 0.0, 0.11):
            x += saw(f * (1 + d / 100), ts + i * 0.01)
    x = filt(sos_lp(lp, 2), x) / (len(freqs) * 3)
    return x


def heartbeat(n_beats, gain=1.0):
    """Pulso grave doble (lub-dub) en cada pulso: tensión sin acentos que anticipen."""
    n = int(n_beats * beat * SR)
    x = np.zeros(n)
    th = np.arange(int(0.25 * SR)) / SR
    def thump(f0, dec, amp):
        f = f0 * np.exp(-th * 9) + 38
        ph = 2 * np.pi * np.cumsum(f) / SR
        return np.sin(ph) * np.exp(-th / dec) * amp
    lub = thump(70, 0.07, 1.0)
    dub = thump(62, 0.06, 0.6)
    for b in range(int(n_beats)):
        i = int(b * beat * SR)
        for snd, off in ((lub, 0), (dub, int(0.17 * SR))):
            j = min(n, i + off + len(snd))
            if j > i + off:
                x[i + off:j] += snd[: j - i - off]
    return x * gain


def ticks(dur, every, gain=0.08, seed=3):
    n = int(dur * SR)
    x = np.zeros(n)
    g = np.random.default_rng(seed)
    tk = filt(sos_hp(6000, 2), g.standard_normal(int(0.03 * SR))) * np.exp(-np.arange(int(0.03 * SR)) / SR / 0.006)
    k = 0
    while True:
        i = int(k * every * SR)
        if i >= n:
            break
        j = min(n, i + len(tk))
        x[i:j] += tk[: j - i] * (1.0 if k % 2 == 0 else 0.6)
        k += 1
    return x * gain


mus = np.zeros((N, 2))
chord_dm = [D2 * 2, D2 * 2 * 1.189, D2 * 2 * 1.498]           # Re menor
chord_bb = [D2 * 2 * 0.794 * 2, D2 * 2 * 1.189, D2 * 2 * 1.498]  # Si♭ (color en el cierre)

for s in segs:
    if s["kind"] == "hook":
        d = s["dur"]
        p = pad(d, chord_dm, 700) * env_adsr(int(d * SR), 0.05, 0.05) * 0.5
        hb = heartbeat(d / beat + 1)[: int(d * SR)] * 0.9
        place(mus, np.stack([p * 0.9 + hb, p * 1.1 + hb], 1), s["start"])
    elif s["kind"] == "round":
        moving = s["freeze"] - s["start"]
        d = moving
        n = int(d * SR)
        drone = np.sin(2 * np.pi * D2 * np.arange(n) / SR) * 0.35
        p = pad(d, chord_dm, 600 + 150 * s["idx"]) * 0.42
        hb = heartbeat(d / beat + 1)[:n] * 0.85
        tk = ticks(d, beat / 2, 0.05 + 0.015 * s["idx"], seed=s["idx"])
        e = env_adsr(n, 0.02, 0.0)
        mono = (drone + hb) * e
        st = np.stack([mono + (p + tk) * e, mono + (p * 1.05 + tk * 0.8) * e], 1)
        place(mus, st, s["start"])
        # cola corta (reverb sintética) tras el corte en la congelación
        tail_n = int(0.6 * SR)
        tail = filt(sos_lp(500, 2), rng.standard_normal(tail_n)) * np.exp(-np.arange(tail_n) / SR / 0.18) * 0.05
        place(mus, tail, s["freeze"])
    elif s["kind"] == "reveal":
        d = s["dur"]
        n = int(d * SR)
        p = pad(d, chord_dm, 1100) * 0.55 * env_adsr(n, 0.1, 0.1)
        hb = heartbeat(d / beat + 1)[:n] * 1.0
        drone = np.sin(2 * np.pi * D2 / 2 * np.arange(n) / SR) * 0.4 * env_adsr(n, 0.2, 0.1)
        place(mus, np.stack([p + hb + drone, p * 1.05 + hb + drone], 1), s["start"])
    elif s["kind"] == "cta":
        d = s["dur"]
        n = int(d * SR)
        p = pad(d, chord_bb, 1300) * 0.55 * env_adsr(n, 0.08, 0.35)
        hb = heartbeat(d / beat + 1)[:n] * 0.8 * env_adsr(n, 0.01, 0.6)
        place(mus, np.stack([p + hb, p * 1.05 + hb], 1), s["start"])

# ---------------------------------------------------------------- 3) efectos
sfx = np.zeros((N, 2))


def boom(dur=1.2, f0=60, f1=32, gain=1.0):
    n = int(dur * SR)
    ts = np.arange(n) / SR
    f = f1 + (f0 - f1) * np.exp(-ts * 6)
    ph = 2 * np.pi * np.cumsum(f) / SR
    x = np.sin(ph) * np.exp(-ts / (dur * 0.35))
    crack = filt(sos_bp(150, 2500), rng.standard_normal(n)) * np.exp(-ts / 0.035) * 0.8
    return (x + crack) * gain


def ui_tick(f=2400, dur=0.05, gain=0.25):
    n = int(dur * SR)
    ts = np.arange(n) / SR
    return np.sin(2 * np.pi * f * ts) * np.exp(-ts / 0.012) * gain


def whoosh(dur=0.5, up=True, gain=0.4):
    n = int(dur * SR)
    w = rng.standard_normal(n)
    # barrido de pasa-banda por bloques
    out = np.zeros(n)
    blocks = 24
    for b in range(blocks):
        a, z = b * n // blocks, (b + 1) * n // blocks
        c = 400 * (8 ** (b / blocks if up else 1 - b / blocks))
        seg = filt(sos_bp(c * 0.6, min(c * 1.8, 20000)), w[max(0, a - 2000):z])[-(z - a):]
        out[a:z] = seg
    return out * np.sin(np.linspace(0, np.pi, n)) ** 1.5 * gain


# entrada inmediata (sin silencio en el primer fotograma)
place(sfx, whoosh(0.45, up=False, gain=0.5), 0.0)
place(sfx, boom(0.9, 70, 38, 0.55), 0.0)

for s in segs:
    if s["kind"] == "round":
        # inicio de ronda: barrido + tick (marca la ronda, ocurre ≥1,8 s antes de la barrera)
        place(sfx, whoosh(0.4, up=True, gain=0.35), s["start"] - 0.05)
        place(sfx, ui_tick(1800, 0.06, 0.22), s["start"])
        place(sfx, ui_tick(2700, 0.05, 0.16), s["start"] + 0.07)
        # congelación: impacto grave (después de la ventana de reacción, nunca antes)
        place(sfx, boom(1.3, 62, 30, 0.95 + 0.15 * s["idx"]), s["freeze"])
        # filas de la tabla de resultado
        stagger = 3 if s["idx"] > 0 else 5
        for i in range(3):
            place(sfx, ui_tick(2200 + 300 * i, 0.05, 0.12), s["freeze"] + f2s(10 + 6 + i * stagger))
    elif s["kind"] == "reveal":
        place(sfx, whoosh(0.5, up=False, gain=0.3), s["start"] - 0.05)
        place(sfx, boom(1.0, 58, 34, 0.6), s["start"])
        for i in range(3):
            a = s["start"] + f2s(18 + i * 12)
            for k in range(6):
                place(sfx, ui_tick(1600 + 120 * k + 200 * i, 0.03, 0.06), a + k * 0.07)
        place(sfx, boom(1.6, 55, 28, 1.0), s["start"] + f2s(18 + 24 + 26))
        place(sfx, ui_tick(1200, 0.08, 0.18), s["start"] + f2s(72))
    elif s["kind"] == "cta":
        place(sfx, whoosh(0.45, up=True, gain=0.3), s["start"] - 0.05)
        place(sfx, ui_tick(1500, 0.07, 0.2), s["start"] + f2s(18))

# ---------------------------------------------------------------- mezcla
mix = amb * 0.55 + mus * 0.5 + sfx * 0.8
mix = np.tanh(mix * 1.2) / np.tanh(1.2)
mix /= np.max(np.abs(mix)) + 1e-9
mix *= 0.89
# fundido de 4 ms en los extremos (sin clics; el bucle sigue sin silencio)
fade = int(0.004 * SR)
mix[:fade] *= np.linspace(0, 1, fade)[:, None]
mix[-fade:] *= np.linspace(1, 0, fade)[:, None]

os.makedirs(os.path.join(ROOT, "public", "audio", "stems"), exist_ok=True)


def save(path, x):
    wavfile.write(path, SR, (np.clip(x, -1, 1) * 32767).astype(np.int16))


save(os.path.join(ROOT, "public", "audio", "soundtrack.wav"), mix)
for name, x in (("ambiente", amb), ("musica", mus), ("efectos", sfx)):
    save(os.path.join(ROOT, "public", "audio", "stems", f"{name}.wav"), x / (np.max(np.abs(x)) + 1e-9) * 0.9)

# exportar los instantes de evento para el control de calidad
qa = [dict(kmh=s["kmh"], event=s["event"], freeze=s["freeze"]) for s in segs if s["kind"] == "round"]
json.dump(dict(total=TOTAL, rounds=qa), open(os.path.join(ROOT, "public", "audio", "events.json"), "w"), indent=2)
print(f"OK · {TOTAL:.3f} s · {N} muestras")
