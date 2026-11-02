#!/usr/bin/env python3
"""
Reel motor v2 — ángulo del ciclo (θ) por fotograma, anclado a la locución.
  · gancho: tiempo real (3.000 rpm = 600°/fotograma)
  · "vamos a verlo 50 veces más lento": rampa a 12°/fotograma (1/50)
  · "aspira / comprime / explotar / bota": el cilindro 1 entra en cada tiempo justo cuando se nombra
  · pistón: aún más lento (8°/fotograma) · aceite y cierre: tiempo real de fondo
Escribe src/v2/motor_theta.json (lo usan el video y scripts/v2_audio.py).
"""
import json
import os
import unicodedata

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
vo = json.load(open(os.path.join(ROOT, "src", "vo", "motor.json")))
FPS = 30
S = {s["id"]: s for s in vo["segments"]}
fr = lambda t: int(round(t * FPS))


def clean(w):
    w = unicodedata.normalize("NFD", w.lower())
    return "".join(c for c in w if c.isalnum() and unicodedata.category(c) != "Mn")


def word(seg, needle):
    for w in S[seg]["words"]:
        if needle in clean(w["w"]):
            return fr(w["s"])
    raise SystemExit(f"no encontré '{needle}' en {seg}")


total = fr(vo["duration"] + 2.0)
theta = [0.0] * (total + 1)

f_slow = fr(S["slow"]["start"])
f_ramp_end = f_slow + 30
f_asp, f_comp, f_chis, f_bota = word("strokes", "aspira"), word("strokes", "comprime"), word("strokes", "chispa"), word("strokes", "bota")
f_turns = fr(S["turns"]["start"])
f_piston = fr(S["piston"]["start"])
f_oil = fr(S["oil"]["start"])

# 1) tiempo real
for f in range(1, f_slow + 1):
    theta[f] = theta[f - 1] + 600
# 2) rampa geométrica 600 → 12
import math
for f in range(f_slow + 1, f_ramp_end + 1):
    u = (f - f_slow) / (f_ramp_end - f_slow)
    e = u * u * (3 - 2 * u)
    theta[f] = theta[f - 1] + math.exp(math.log(600) + (math.log(12) - math.log(600)) * e)
# 3) hasta "aspira": velocidad casi constante, ajustada para llegar en fase (cilindro 1 en admisión: a ≡ 360 mod 720)
t0 = theta[f_ramp_end]
target = t0 + 12 * (f_asp - f_ramp_end)
target = target + ((360 - target) % 720)
for f in range(f_ramp_end + 1, f_asp + 1):
    theta[f] = t0 + (target - t0) * (f - f_ramp_end) / (f_asp - f_ramp_end)
# 4) los cuatro tiempos, anclados a las palabras
keys = [(f_asp, target), (f_comp, target + 180), (f_chis, target + 360), (f_bota, target + 540), (f_turns, target + 720)]
for (fa, ta), (fb, tb) in zip(keys, keys[1:]):
    for f in range(fa + 1, fb + 1):
        theta[f] = ta + (tb - ta) * (f - fa) / (fb - fa)
# 5) cilindros turnándose: 1/50
for f in range(f_turns + 1, f_piston + 1):
    theta[f] = theta[f - 1] + 12
# 6) pistón: más lento
for f in range(f_piston + 1, f_oil + 1):
    theta[f] = theta[f - 1] + 8
# 7) aceite y cierre: vuelve a tiempo real (rampa de 20 fotogramas)
for f in range(f_oil + 1, total + 1):
    u = min(1, (f - f_oil) / 20)
    theta[f] = theta[f - 1] + math.exp(math.log(8) + (math.log(600) - math.log(8)) * u * u * (3 - 2 * u))

speed = [theta[f + 1] - theta[f] if f < total else theta[f] - theta[f - 1] for f in range(total + 1)]
out = {"total": total, "theta": [round(x, 3) for x in theta], "speed": [round(x, 3) for x in speed],
       "marks": {"slow": f_slow, "rampEnd": f_ramp_end, "asp": f_asp, "comp": f_comp, "chis": f_chis, "bota": f_bota,
                 "turns": f_turns, "piston": f_piston, "oil": f_oil}}
json.dump(out, open(os.path.join(ROOT, "src", "v2", "motor_theta.json"), "w"))
print("OK", out["marks"], "total", total)
