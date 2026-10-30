#!/usr/bin/env python3
"""Juntas/parches transversales del asfalto (posiciones s en metros). Las leen el shader de la
carretera, la vibración de cámara y el audio: imagen, movimiento y sonido coinciden.
Regla: ninguna junta se pisa a menos de 0,35 s de la aparición de la barrera (no es una pista)."""
import json, os, random
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
T = json.load(open(os.path.join(ROOT, "src", "prototipo", "r1.json")))
v = T["speedKmh"] / 3.6
s_event = T["startS"] + v * T["eventAt"] / T["fps"]
FRONT = 1.0  # m desde el ojo del conductor hasta el eje delantero
rnd = random.Random(11)
seams, s = [], T["startS"] - 60.0
while s < T["startS"] + 700:
    s += rnd.uniform(16, 52)
    t_hit = (s - FRONT - T["startS"]) / v  # segundos desde el inicio
    if abs(t_hit - T["eventAt"] / T["fps"]) < 0.35:
        continue
    seams.append(round(s, 2))
json.dump(seams, open(os.path.join(ROOT, "src", "prototipo", "seams.json"), "w"))
print(len(seams), "juntas; barrera en s =", round(s_event + T["barrierDistanceM"], 2))
