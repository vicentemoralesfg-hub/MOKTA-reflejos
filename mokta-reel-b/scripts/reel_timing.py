"""Tiempos del reel completo, idénticos a src/reel/config.ts (misma rampa de velocidad y mismas fórmulas)."""
import json, math, os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
T = json.load(open(os.path.join(ROOT, "src", "reel", "timeline.json")))
FPS = T["fps"]
D = T["barrierDistanceM"]
RAMP = T["rampFrames"]


def smooth(x):
    x = min(max(x, 0.0), 1.0)
    return x * x * (3 - 2 * x)


def kmh_at(i, f):
    """Velocidad (km/h) en el fotograma f de la ronda i: las rondas 2 y 3 aceleran desde la anterior."""
    r = T["rounds"][i]
    if i == 0:
        return r["speedKmh"]
    k0 = T["rounds"][i - 1]["speedKmh"]
    return k0 + (r["speedKmh"] - k0) * smooth(f / RAMP)


def s_at(i, f):
    """Metros recorridos al inicio del fotograma f (suma por fotograma, igual que en TS)."""
    r = T["rounds"][i]
    s = r["startS"]
    for k in range(int(f)):
        s += kmh_at(i, k) / 3.6 / FPS
    return s


def round_frames(i):
    r = T["rounds"][i]
    v = r["speedKmh"] / 3.6
    impact = r["eventAt"] + math.ceil(D / v * FPS - 1e-9)
    result = impact + T["blackFrames"]
    end = result + r["resultFrames"]
    return dict(event=r["eventAt"], impact=impact, result=result, duration=end)


def layout():
    """Inicio absoluto (fotograma) de cada bloque."""
    out = {"hook": 0}
    t = T["hook"]["duration"]
    for i in range(3):
        out[f"r{i+1}"] = t
        t += round_frames(i)["duration"]
    out["reveal"] = t
    t += T["reveal"]["duration"]
    out["cta"] = t
    t += T["cta"]["duration"]
    out["total"] = t
    return out
