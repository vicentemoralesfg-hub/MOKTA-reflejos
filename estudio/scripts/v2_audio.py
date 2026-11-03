#!/usr/bin/env python3
"""
Mezcla de audio de los reels v2: locución (Qwen3-TTS) + música sintetizada atenuada bajo la voz + efectos
sincronizados a los mismos tiempos que el video (src/vo/<pieza>.json y, en el motor, src/v2/motor_theta.json).
Uso: python3 scripts/v2_audio.py km caballos motor clic
"""
import json
import math
import os
import sys
import unicodedata

import numpy as np
import soundfile as sf

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from sfx import SR, bp, env, hp, lp, place, soft_clip, stamp, thump, tick, whoosh, riser

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FPS = 30
rng = np.random.default_rng(11)


def load(name):
    vo = json.load(open(os.path.join(ROOT, "src", "vo", f"{name}.json")))
    voice, sr = sf.read(os.path.join(ROOT, "public", "vo", f"{name}.wav"), dtype="float32")
    assert sr == SR
    if voice.ndim > 1:
        voice = voice.mean(1)
    return vo, voice


def clean(w):
    w = unicodedata.normalize("NFD", w.lower())
    return "".join(c for c in w if c.isalnum() and unicodedata.category(c) != "Mn")


def S(vo, id_):
    return next(s for s in vo["segments"] if s["id"] == id_)


def word(vo, id_, needles, default=None):
    seg = S(vo, id_)
    for n in needles:
        for w in seg["words"]:
            if n in clean(w["w"]):
                return w["s"]
    return seg["start"] if default is None else default


def frame_t(f):
    return f / FPS


# ------------------------------------------------------------------ música
def saw(f, n):
    ts = np.arange(n) / SR
    return 2 * (ts * f - np.floor(0.5 + ts * f))


def pad(dur, freqs, lpf=1200, a=0.6, r=0.8):
    n = int(dur * SR)
    x = sum(saw(f * (1 + d / 100), n) for f in freqs for d in (-0.18, 0, 0.17)) / (3 * len(freqs))
    return lp(x, lpf, 2) * env(n, a, r)


def pulse_bed(dur, bpm, root, prog, kick=True, hats=True, bright=900):
    """Base rítmica discreta: bombo suave, bajo pulsado y acordes largos."""
    n = int(dur * SR)
    out = np.zeros((n, 2))
    beat = 60 / bpm
    nb = int(dur / beat) + 1
    for b in range(nb):
        t = b * beat
        r = root * prog[(b // 4) % len(prog)]
        if kick and b % 2 == 0:
            place(out, thump(0.3, 58, 0.08) * 0.5, t)
        if hats:
            m = int(0.03 * SR)
            h = hp(rng.standard_normal(m), 7500) * np.exp(-np.arange(m) / SR / 0.01) * 0.12
            place(out, h, t + beat / 2, pan=0.25)
        m = int(beat * 0.9 * SR)
        bass = lp(saw(r, m), 220) * env(m, 0.005, 0.1) * 0.35
        place(out, bass, t)
        if b % 4 == 0:
            ch = pad(beat * 4, [r * 2, r * 2 * 1.26, r * 2 * 1.5], bright, 0.3, 1.2) * 0.25
            place(out, np.stack([ch, ch * 0.96], 1), t)
    return out


def duck(music, voice, amount_db=-12):
    e = np.abs(voice)
    k = int(0.12 * SR)
    e = np.convolve(e, np.ones(k) / k, "same")
    g = np.where(e > 0.02, 10 ** (amount_db / 20), 1.0)
    k2 = int(0.25 * SR)
    g = np.convolve(g, np.ones(k2) / k2, "same")
    return music * g[: len(music), None]


def finish(name, voice, music, fx, total, music_gain=0.32):
    n = int(total * SR)
    v = np.zeros((n, 2))
    v[: min(n, len(voice))] = voice[:n, None] * np.array([1, 1])
    music = music[:n] if len(music) >= n else np.pad(music, ((0, n - len(music)), (0, 0)))
    fx = fx[:n] if len(fx) >= n else np.pad(fx, ((0, n - len(fx)), (0, 0)))
    music = duck(music, v[:, 0])
    mix = v * 1.0 + music * music_gain + fx * 0.8
    mix = soft_clip(mix * 1.1)
    mix /= np.max(np.abs(mix)) + 1e-9
    mix *= 0.9
    f = int(0.35 * SR)
    mix[-f:] *= np.linspace(1, 0, f)[:, None]
    out = os.path.join(ROOT, "public", "audio", f"v2-{name}.wav")
    sf.write(out, mix, SR, subtype="PCM_16")
    print("OK", out, f"{total:.2f} s")


def transitions(vo, fx, gain=0.22):
    for s in vo["segments"][1:]:
        place(fx, whoosh(0.4, up=True) * gain, s["start"] - 0.25)


# ------------------------------------------------------------------ piezas
def km():
    vo, voice = load("km")
    total = vo["duration"] + 2.0
    n = int(total * SR)
    fx = np.zeros((n, 2))
    music = pulse_bed(total, 104, 55.0, [1, 1.335, 1.5, 1.189])
    transitions(vo, fx)
    # gancho: odómetro rodando (clics mecánicos)
    for k in range(int(1.0 * 30)):
        place(fx, tick(2200, 0.02, 0.004) * 0.12, k / 30)
    place(fx, stamp(80) * 0.6, 0.0)
    # cuenta regresiva
    q = S(vo, "q")
    cd0, cd1 = q["end"], S(vo, "p3")["start"]
    for i in range(3):
        place(fx, tick(1200 + 200 * i, 0.1, 0.03) * 0.5, cd0 + i * (cd1 - cd0) / 3)
    # odómetros del ranking: clics acelerando durante el giro (fotogramas 6–60 de cada escena)
    for pid in ("p3", "p2", "p1"):
        t0 = S(vo, pid)["start"] - 4 / 30
        for k in range(6, 60, 2):
            place(fx, tick(1800 + 10 * k, 0.02, 0.004) * 0.1, t0 + k / 30)
        place(fx, thump(0.5, 70, 0.1) * 0.45, t0 + 60 / 30)
    # récord
    p1 = S(vo, "p1")["start"] - 4 / 30
    place(fx, stamp(90) * 0.7, p1 + 70 / 30)
    m = int(0.6 * SR)
    chime = (np.sin(2 * np.pi * 1318.5 * np.arange(m) / SR) + 0.4 * np.sin(2 * np.pi * 1975.5 * np.arange(m) / SR)) * np.exp(-np.arange(m) / SR / 0.2)
    place(fx, chime * 0.25, p1 + 72 / 30)
    # luna
    place(fx, riser(1.2, 200, 900) * 0.25, S(vo, "moon")["start"] - 0.2)
    finish("km", voice, music, fx, total)


def hooves(dur, rate=2.4, gain=0.5, seed=0):
    """Galope sintetizado: grupos de 3 golpes (ritmo de galope) por zancada."""
    g = np.random.default_rng(seed)
    n = int(dur * SR)
    out = np.zeros(n)
    stride = 1 / rate
    k = 0
    while k * stride < dur:
        t = k * stride
        for off, a in ((0.0, 0.7), (0.07, 0.9), (0.15, 1.0)):
            m = int(0.09 * SR)
            ts = np.arange(m) / SR
            hit = (np.sin(2 * np.pi * (90 + 30 * g.random()) * ts) * np.exp(-ts / 0.03) + bp(g.standard_normal(m), 300, 2500) * np.exp(-ts / 0.012) * 0.6) * a
            i = max(0, int((t + off + g.normal(0, 0.006)) * SR))
            j = min(n, i + m)
            if i < j:
                out[i:j] += hit[: j - i]
        k += 1
    return out * gain


def caballos():
    vo, voice = load("caballos")
    total = vo["duration"] + 2.0
    n = int(total * SR)
    fx = np.zeros((n, 2))
    music = pulse_bed(total, 96, 49.0, [1, 1.189, 1.335, 1.122], hats=False, bright=700)
    transitions(vo, fx, 0.18)
    # galope del gancho y del bloque "tirón"
    h = hooves(S(vo, "why")["start"], 2.6, 0.35, 1)
    place(fx, np.stack([h, h * 0.9], 1), 0.0)
    pk0, pk1 = S(vo, "peak")["start"], S(vo, "hilux")["start"]
    h = hooves(pk1 - pk0, 2.6, 0.22, 2)
    place(fx, np.stack([h * 0.9, h], 1), pk0)
    # Watt: siseo de vapor y golpe mecánico
    w0 = S(vo, "watt")["start"]
    m = int(1.6 * SR)
    hiss = hp(rng.standard_normal(m), 3000) * env(m, 0.3, 0.9) * 0.08
    place(fx, hiss, w0)
    for i in range(3):
        place(fx, thump(0.4, 80, 0.06) * 0.3, w0 + 0.3 + i * 0.6)
    # Hilux: manada de 14 · Chiron: estampida de 100
    hx0, ch0, cta0 = S(vo, "hilux")["start"], S(vo, "chiron")["start"], S(vo, "cta")["start"]
    herd = sum(hooves(ch0 - hx0, 2.4 + 0.15 * k, 0.09, 10 + k) for k in range(5))
    place(fx, np.stack([herd, herd[::-1] * 0 + herd * 0.95], 1), hx0)
    st = sum(hooves(cta0 - ch0, 2.2 + 0.11 * k, 0.07, 30 + k) for k in range(14))
    st = lp(st, 1800)
    place(fx, np.stack([st, st * 0.97], 1) * env(len(st), 0.3, 0.4)[:, None], ch0)
    place(fx, thump(0.9, 50, 0.2) * 0.6, ch0)
    finish("caballos", voice, music, fx, total)


def motor():
    vo, voice = load("motor")
    TH = json.load(open(os.path.join(ROOT, "src", "v2", "motor_theta.json")))
    total = TH["total"] / FPS
    n = int(total * SR)
    th = np.array(TH["theta"])
    # θ por muestra (interpolación lineal entre fotogramas)
    tf = np.arange(n) / SR * FPS
    theta = np.interp(tf, np.arange(len(th)), th)
    spd = np.interp(tf, np.arange(len(th)), np.array(TH["speed"])) / 600.0
    events = np.nonzero(np.diff(np.floor(theta / 180.0)) > 0)[0] + 1
    eng = np.zeros(n)
    booms = np.zeros((n, 2))
    pn = int(0.014 * SR)
    pt = np.arange(pn) / SR
    pulse = (np.sin(2 * np.pi * 95 * pt) * 0.9 + np.sin(2 * np.pi * 190 * pt + 0.5) * 0.4) * np.exp(-pt / 0.0045)
    pulse += lp(rng.standard_normal(pn), 2200) * np.exp(-pt / 0.002) * 0.6
    for e in events:
        s = spd[e]
        if s > 0.12:
            j = min(n, e + pn)
            eng[e:j] += pulse[: j - e] * min(1, (s - 0.12) / 0.5)
        if s < 0.5:
            x = thump(0.8, 68, 0.2) * 0.8 + lp(rng.standard_normal(int(0.8 * SR)), 900) * np.exp(-np.arange(int(0.8 * SR)) / SR / 0.05) * 0.5
            place(booms, soft_clip(x * 1.2) * min(1, (0.5 - s) / 0.35) * 0.55, e / SR)
    eng = lp(eng, 1800)
    eng = soft_clip(eng * 2.2) * 0.45
    # el motor se atenúa bajo la voz (−8 dB) y queda de fondo durante el aceite y el cierre
    v = np.zeros(n); v[: min(n, len(voice))] = voice[:n]
    env_v = np.convolve(np.abs(v), np.ones(int(0.12 * SR)) / int(0.12 * SR), "same")
    g = np.where(env_v > 0.02, 10 ** (-8 / 20), 1.0)
    g = np.convolve(g, np.ones(int(0.2 * SR)) / int(0.2 * SR), "same")
    oil0 = int(S(vo, "oil")["start"] * SR)
    g[oil0:] *= np.linspace(1, 0.35, min(int(0.5 * SR), n - oil0)).tolist() + [0.35] * max(0, n - oil0 - int(0.5 * SR))
    eng = eng * g
    fx = np.stack([eng, eng * 0.96], 1) + booms
    transitions(vo, fx, 0.15)
    place(fx, whoosh(0.6, up=False) * 0.35, S(vo, "slow")["start"] - 0.1)
    place(fx, stamp(80) * 0.5, word(vo, "piston", ["quinientas", "500"]))
    music = pad(total, [55, 82.5, 110], 500, 1.0, 1.0)
    music = np.stack([music, music * 0.97], 1) * 0.5
    finish("motor", voice, music, fx, total, music_gain=0.3)


def clic():
    vo, voice = load("clic")
    total = vo["duration"] + 1.8
    n = int(total * SR)
    fx = np.zeros((n, 2))
    music = pulse_bed(total, 110, 61.7, [1, 1, 1.189, 0.891], kick=True, hats=True, bright=1100)
    transitions(vo, fx, 0.15)
    f_tapa = word(vo, "click", ["tapa"])
    f_clic = word(vo, "click", ["clic"], S(vo, "click")["end"])
    # chorro de bencina mientras la válvula está abierta
    m = int(f_clic * SR)
    ts = np.arange(m) / SR
    pour = bp(rng.standard_normal(m), 250, 2600) * (0.65 + 0.35 * np.sin(2 * np.pi * 6.5 * ts)) * env(m, 0.05, 0.03) * 0.13
    place(fx, np.stack([pour, pour * 0.95], 1), 0.0)
    # aire entrando por el orificio (siseo suave) hasta que la bencina lo tapa
    h0 = S(vo, "hole")["start"]
    m = int(max(0.1, f_tapa - h0) * SR)
    hiss = hp(rng.standard_normal(m), 4000) * env(m, 0.2, 0.1) * 0.05
    place(fx, hiss, h0)
    # el CLIC: chasquido metálico + resorte
    m = int(0.25 * SR)
    ts = np.arange(m) / SR
    c = hp(rng.standard_normal(m), 2500) * np.exp(-ts / 0.004) * 1.3 + np.sin(2 * np.pi * 1700 * ts) * np.exp(-ts / 0.012) * 0.7 + np.sin(2 * np.pi * 380 * ts) * np.exp(-ts / 0.04) * 0.6
    place(fx, c * 0.9, f_clic)
    place(fx, c * 0.6, word(vo, "hook", ["clic"]) + 0.2)  # clic del gancho ("…o hasta el clic?")
    # bencina llegando al cánister: gorgoteo
    o0 = S(vo, "over")["start"]
    m = int(1.4 * SR)
    ts = np.arange(m) / SR
    gurgle = bp(rng.standard_normal(m), 120, 900) * (0.5 + 0.5 * np.sign(np.sin(2 * np.pi * 8 * ts))) * env(m, 0.2, 0.4) * 0.35
    place(fx, gurgle, o0 + 1.0)
    # daños: tres avisos
    for k in ("olor", "luz", "reparacion"):
        t = word(vo, "damage", [k])
        m = int(0.25 * SR)
        place(fx, np.sin(2 * np.pi * 988 * np.arange(m) / SR) * np.exp(-np.arange(m) / SR / 0.06) * 0.3, t)
    place(fx, stamp(85) * 0.6, S(vo, "cta")["start"])
    finish("clic", voice, music, fx, total)


# ------------------------------------------------------------------ entrega 3
def roll(fx, t0, t1, f0=1800, f1=2600, gain=0.1, n0=22, n1=6):
    """Clics de contador que se van frenando entre t0 y t1."""
    t = t0
    while t < t1:
        p = (t - t0) / max(1e-3, t1 - t0)
        place(fx, tick(f0 + (f1 - f0) * p, 0.02, 0.004) * gain, t)
        t += 1 / (n0 + (n1 - n0) * p)


def chime(gain=0.25, f=1318.5):
    m = int(0.7 * SR)
    ts = np.arange(m) / SR
    return (np.sin(2 * np.pi * f * ts) + 0.4 * np.sin(2 * np.pi * f * 1.5 * ts)) * np.exp(-ts / 0.22) * gain


def beep(f=880, dur=0.16, gain=0.3):
    m = int(dur * SR)
    ts = np.arange(m) / SR
    return np.sin(2 * np.pi * f * ts) * env(m, 0.005, 0.03) * gain


def horn(dur=1.6, gain=0.5):
    """Bocina de barco: dos notas graves con armónicos."""
    m = int(dur * SR)
    x = sum(saw(f0, m) for f0 in (73.4, 110.0)) / 2
    x = lp(x, 700, 2) * env(m, 0.08, 0.5)
    return soft_clip(x * 1.6) * gain


def phase_osc(freq, harm=(1.0, 0.5, 0.25)):
    ph = np.cumsum(2 * np.pi * freq / SR)
    return sum(a * np.sin(ph * (k + 1)) for k, a in enumerate(harm))


def ice(dur, T, shifts, lo, hi, gain=0.3):
    """Motor a combustión acelerando con cambios de marcha (frecuencia de encendido sube y cae en cada cambio)."""
    n = int(dur * SR)
    ts = np.arange(n) / SR
    edges = [0.0] + list(shifts) + [T]
    fr_ = np.full(n, lo * 0.6)
    for a, b in zip(edges[:-1], edges[1:]):
        m = (ts >= a) & (ts < b)
        fr_[m] = lo + (hi - lo) * ((ts[m] - a) / (b - a)) ** 0.8
    after = ts >= T
    fr_[after] = hi * 0.9 * np.exp(-(ts[after] - T) / 1.5) + lo * 0.6
    x = phase_osc(fr_, (1.0, 0.7, 0.45, 0.3, 0.2)) + lp(rng.standard_normal(n), 1500) * 0.25
    x = lp(soft_clip(x * 1.4), 2600)
    g = env(n, 0.05, 0.6) * np.where(ts < T, 1.0, np.exp(-(ts - T) / 0.8) * 0.7 + 0.3)
    return x * g * gain


def ev_whine(dur, T, gain=0.18):
    n = int(dur * SR)
    ts = np.arange(n) / SR
    fr_ = np.where(ts < T, 260 + 1500 * (ts / T) ** 0.7, 1760 * np.exp(-(ts - T) / 1.2))
    x = phase_osc(fr_, (1.0, 0.25)) + 0.15 * phase_osc(fr_ * 0.5, (1.0,))
    g = env(n, 0.05, 0.5) * np.where(ts < T, 1.0, np.exp(-(ts - T) / 0.6))
    return x * g * gain


def options_ticks(fx, vo, seg_id, keys):
    for k in keys:
        t = word(vo, seg_id, k, -1)
        if t >= 0:
            place(fx, tick(1500, 0.06, 0.02) * 0.35, t)


def countdown(fx, t0, t1):
    for i in range(3):
        place(fx, tick(1200 + 200 * i, 0.1, 0.03) * 0.5, t0 + i * (t1 - t0) / 3)


def potencia():
    vo, voice = load("potencia")
    total = vo["duration"] + 1.6
    n = int(total * SR)
    fx = np.zeros((n, 2))
    music = pulse_bed(total, 100, 55.0, [1, 1.189, 1.335, 1.122], bright=800)
    transitions(vo, fx, 0.16)
    place(fx, stamp(85) * 0.55, 0.0)
    h = S(vo, "hook")
    wM, wC = word(vo, "hook", ["motor"]), word(vo, "hook", ["casi"])
    place(fx, horn(1.8, 0.35), wM - 0.05)
    place(fx, riser(h["end"] - wM + 0.1, 150, 900) * 0.22, wM)
    roll(fx, wM + 0.1, h["end"], gain=0.09)
    place(fx, thump(0.7, 55, 0.18) * 0.6, h["end"])
    for k, sid in enumerate(("hilux", "f1", "bugatti", "cat")):
        t = S(vo, sid)["start"] - 0.13
        place(fx, thump(0.5, 70 - 4 * k, 0.1) * (0.35 + 0.07 * k), t)
    b = S(vo, "barco")["start"] - 0.13
    place(fx, thump(1.0, 45, 0.25) * 0.8, b)
    place(fx, horn(2.2, 0.4), b + 0.05)
    place(fx, riser(1.2, 120, 700) * 0.25, S(vo, "size")["start"] + 0.13)
    place(fx, stamp(80) * 0.45, word(vo, "size", ["piston"]))
    # gira lento: zumbido rápido (auto) a la izquierda, golpes lentos (barco) a la derecha
    r0, r1 = S(vo, "rpm")["start"], S(vo, "cta")["start"]
    m = int((r1 - r0) * SR)
    buzz = lp(phase_osc(np.full(m, 100.0), (1.0, 0.6, 0.3)), 900) * env(m, 0.2, 0.3) * 0.06
    place(fx, buzz, r0, pan=-0.6)
    t = r0 + 0.2
    while t < r1 - 0.2:
        place(fx, thump(0.4, 48, 0.12) * 0.35, t, pan=0.6)
        t += 60 / 102
    place(fx, stamp(85) * 0.55, S(vo, "cta")["start"])
    finish("potencia", voice, music, fx, total)


def cero100():
    vo, voice = load("cero100")
    total = vo["duration"] + 1.6
    n = int(total * SR)
    fx = np.zeros((n, 2))
    music = pulse_bed(total, 118, 61.7, [1, 1.335, 1.189, 1.5], bright=1000)
    transitions(vo, fx, 0.14)
    place(fx, stamp(85) * 0.55, 0.0)
    options_ticks(fx, vo, "options", (["ferrari"], ["lamborghini"], ["toyota"], ["byd", "bi"]))
    go = S(vo, "go")
    countdown(fx, S(vo, "options")["end"], go["start"])
    place(fx, beep(1320, 0.5, 0.32), go["start"])
    start = go["end"] - 4 / FPS
    race = 11.0
    place(fx, ice(race, 4.1, (1.5, 2.9), 120, 420, 0.22)[:, None] * np.array([0.9, 0.6]), start)
    place(fx, ice(race, 4.9, (1.8, 3.5), 105, 380, 0.2)[:, None] * np.array([0.6, 0.9]), start)
    hy = lp(phase_osc(np.linspace(85, 150, int(race * SR)), (1.0, 0.5, 0.2)), 900) * env(int(race * SR), 0.2, 1.0) * 0.08
    place(fx, hy, start)
    place(fx, ev_whine(race, 3.8, 0.12), start)
    for T in (3.8, 4.1, 4.9, 9.1):
        place(fx, chime(0.22 if T == 3.8 else 0.12, 1568 if T == 3.8 else 1175), start + T)
    a = word(vo, "why", ["electrico"]) - 4 / FPS
    place(fx, ev_whine(1.6, 0.8, 0.08), a)
    place(fx, ice(2.0, 1.2, (), 90, 260, 0.12)[:, None] * np.array([1, 1]), a + 14 / FPS)
    aw = S(vo, "awd")["start"]
    for i in range(4):
        place(fx, tick(1400 + 150 * i, 0.06, 0.02) * 0.35, aw + i * 5 / FPS)
    place(fx, stamp(85) * 0.55, S(vo, "cta")["start"])
    finish("cero100", voice, music, fx, total)


def vendidos():
    vo, voice = load("vendidos")
    total = vo["duration"] + 1.6
    n = int(total * SR)
    fx = np.zeros((n, 2))
    music = pulse_bed(total, 108, 58.3, [1, 1.26, 1.5, 1.335], bright=950)
    transitions(vo, fx, 0.15)
    place(fx, stamp(85) * 0.55, 0.0)
    roll(fx, 0.0, S(vo, "hook")["start"] + 50 / FPS, gain=0.09)
    options_ticks(fx, vo, "options", (["escarabajo"], ["ford", "modelo"], ["golf"], ["corolla"]))
    countdown(fx, S(vo, "options")["end"], S(vo, "p4")["start"])
    for k, pid in enumerate(("p4", "p3", "p2", "p1")):
        t = S(vo, pid)["start"] - 4 / FPS
        place(fx, thump(0.5, 70 - 5 * k, 0.1) * (0.35 + 0.08 * k), t)
        roll(fx, t + 0.2, t + 1.4, gain=0.07)
    p1 = S(vo, "p1")["start"]
    place(fx, stamp(90) * 0.7, p1 + 0.3)
    place(fx, chime(0.25), p1 + 0.35)
    # ritmo: un "clic" por cada vuelta del reloj (un Corolla vendido)
    p0, p1e = S(vo, "pace")["start"], S(vo, "earth")["start"]
    t = p0 + 6 / FPS
    while t < p1e - 0.1:
        place(fx, tick(2000, 0.05, 0.012) * 0.25, t)
        t += 36 / FPS
    e0, e1 = S(vo, "earth")["start"], S(vo, "cta")["start"]
    place(fx, riser(max(0.5, e1 - e0 - 0.3), 200, 1100) * 0.2, e0)
    place(fx, stamp(85) * 0.55, e1)
    finish("vendidos", voice, music, fx, total)


def gavel(gain=0.6):
    m = int(0.25 * SR)
    ts = np.arange(m) / SR
    return (hp(rng.standard_normal(m), 1800) * np.exp(-ts / 0.006) * 0.9 + np.sin(2 * np.pi * 420 * ts) * np.exp(-ts / 0.03) + np.sin(2 * np.pi * 160 * ts) * np.exp(-ts / 0.05)) * gain


def caro():
    vo, voice = load("caro")
    total = vo["duration"] + 1.6
    n = int(total * SR)
    fx = np.zeros((n, 2))
    music = pulse_bed(total, 92, 49.0, [1, 1.189, 0.891, 1.335], hats=False, bright=750)
    transitions(vo, fx, 0.15)
    place(fx, stamp(85) * 0.55, 0.0)
    roll(fx, 0.0, max(1.0, S(vo, "hook")["end"] - 0.2), gain=0.09)
    place(fx, chime(0.22, 1760), S(vo, "hook")["end"] - 0.1)
    q = S(vo, "q")
    place(fx, whoosh(0.4, up=True) * 0.2, q["start"])
    countdown(fx, q["end"], S(vo, "reveal")["start"])
    r = S(vo, "reveal")["start"]
    place(fx, stamp(90) * 0.7, r)
    place(fx, chime(0.25), r + 0.05)
    a0 = S(vo, "auction")["start"]
    for i in range(3):
        place(fx, gavel(0.45), a0 + 0.1 + i * 0.28)
    roll(fx, a0 + 0.2, a0 + 1.33, gain=0.07)
    place(fx, thump(0.5, 62, 0.1) * 0.4, S(vo, "second")["start"])
    c0, c1 = S(vo, "compare")["start"], S(vo, "cta")["start"]
    roll(fx, c0, c1 - 8 / FPS, f0=2400, f1=3200, gain=0.05, n0=30, n1=12)
    place(fx, riser(max(0.5, c1 - c0 - 0.3), 200, 1000) * 0.18, c0)
    place(fx, stamp(85) * 0.55, c1)
    finish("caro", voice, music, fx, total)


if __name__ == "__main__":
    for nm in sys.argv[1:]:
        {"km": km, "caballos": caballos, "motor": motor, "clic": clic, "potencia": potencia, "cero100": cero100, "vendidos": vendidos, "caro": caro}[nm]()
