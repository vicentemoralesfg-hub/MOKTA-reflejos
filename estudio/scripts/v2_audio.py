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


if __name__ == "__main__":
    for nm in sys.argv[1:]:
        {"km": km, "caballos": caballos, "motor": motor, "clic": clic}[nm]()
