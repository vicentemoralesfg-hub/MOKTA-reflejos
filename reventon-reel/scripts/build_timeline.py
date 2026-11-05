#!/usr/bin/env python3
"""
Construye src/timeline.json: tiempos finales de cada palabra de la locución tras insertar pausas
dramáticas (reventón, rebobinado, revelación). Video (Remotion) y audio (build_audio.py) leen este archivo.
Entrada: src/words.json (Qwen3-ForcedAligner sobre voz/locucion.wav).
"""
import json, os
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
words = json.load(open(os.path.join(ROOT, "src", "words.json"), encoding="utf-8"))

FPS = 30
TOTAL_S = 60.0
LEAD = 0.10  # la voz entra a los 0,1 s
# (punto de corte en la locución original [s, dentro de un silencio], pausa añadida [s])
GAPS = [
    (7.30, 0.50),   # tras "costar la vida": congelado + rebobinado
    (9.62, 0.90),   # tras "Vas a 100…": el reventón suena solo
    (31.75, 0.35),  # tras "el volantazo": golpe antes de "Entonces"
    (33.60, 0.30),  # tras "¿qué haces?": caída antes de los pasos
]

def out_time(t):
    o = LEAD
    for cut, add in GAPS:
        if t >= cut:
            o += add
    return round(t + o, 3)

segments = []  # tramos de audio: [ini_orig, fin_orig, ini_salida]
prev = 0.0
for cut, add in GAPS + [(1e9, 0)]:
    end = min(cut, 56.80)
    segments.append([prev, end, out_time(prev)])
    prev = cut
    if cut > 56.8:
        break

out = []
for i, w in enumerate(words):
    out.append({"i": i, "w": w["w"], "s": out_time(w["s"]), "e": out_time(w["e"])})

tl = {"fps": FPS, "totalS": TOTAL_S, "totalFrames": int(TOTAL_S * FPS), "voiceSegments": segments, "words": out}
json.dump(tl, open(os.path.join(ROOT, "src", "timeline.json"), "w", encoding="utf-8"), ensure_ascii=False, indent=1)
for w in out:
    print(f"{w['i']:3d} {w['s']:6.2f} {w['e']:6.2f} {w['w']}")
print(segments)
