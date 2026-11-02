#!/usr/bin/env python3
"""
Auditoría crítica de la locución dentro del video (para retención):
  - ritmo por escena: duración de la escena vs. su voz, sílabas/s, tiempo sin voz al final
  - cobertura de voz en todo el reel y el tramo más largo sin voz ("aire muerto")
  - pausa entre escenas (debe ser corta: el corte no debe "frenar" la narración)
  - expresividad (variación de tono) y énfasis en palabras clave por escena
  - registro (tono medio) parejo entre escenas, para que la energía no se caiga
Lee public/audio/voice/words.json + src/timeline.json + src/voice.json. Escribe out/audit_voice.json y un resumen.
"""
import json
import math
import os

import numpy as np

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
T = json.load(open(os.path.join(ROOT, "src", "timeline.json")))
V = json.load(open(os.path.join(ROOT, "src", "voice.json")))
W = json.load(open(os.path.join(ROOT, "public", "audio", "voice", "words.json")))
FPS = T["fps"]

rows, t0 = [], 0.0
speech = []
for s in T["scenes"]:
    sid = s["id"]
    w = W[sid]
    st = V["scenes"][sid]["start"] / FPS
    dur = s["duration"] / FPS
    m = w["metrics"]
    a, b = t0 + st, t0 + st + w["dur"]
    speech.append((a, b))
    rows.append(
        dict(
            escena=sid,
            dur_escena=round(dur, 2),
            dur_voz=round(w["dur"], 2),
            sin_voz_final=round(dur - st - w["dur"], 2),
            silabas_s=m["syl_s"],
            articulacion=m["artic_syl_s"],
            tono_hz=m["f0_pyin"],
            variacion_st=m["f0_sd_st"],
            enfasis_st=m.get("kw_st"),
            enfasis_db=m.get("kw_db"),
            intelig=m["intelig"],
            toma=w.get("take"),
        )
    )
    t0 += dur
total = t0
# huecos sin voz (entre segmentos y dentro de cada segmento por pausas ya acotadas)
gaps = [speech[0][0]] + [speech[i + 1][0] - speech[i][1] for i in range(len(speech) - 1)] + [total - speech[-1][1]]
covered = sum(b - a for a, b in speech)
tones = [r["tono_hz"] for r in rows]
spread = 12 * math.log2(max(tones) / min(tones))
summary = dict(
    total_s=round(total, 2),
    voz_s=round(covered, 2),
    cobertura=round(covered / total, 3),
    hueco_max_s=round(max(gaps[1:-1]), 2),
    huecos_entre_escenas=[round(g, 2) for g in gaps[1:-1]],
    silabas_s_media=round(float(np.mean([r["silabas_s"] for r in rows])), 2),
    variacion_media_st=round(float(np.mean([r["variacion_st"] for r in rows])), 2),
    registro_spread_st=round(spread, 1),
)
json.dump(dict(escenas=rows, resumen=summary), open(os.path.join(ROOT, "out", "audit_voice.json"), "w"), ensure_ascii=False, indent=1)
print(f"{'escena':8s} {'esc':>5s} {'voz':>5s} {'cola':>5s} {'síl/s':>5s} {'artic':>5s} {'tono':>5s} {'var':>5s} {'énf st':>6s} {'énf dB':>6s}  toma")
for r in rows:
    print(f"{r['escena']:8s} {r['dur_escena']:5.2f} {r['dur_voz']:5.2f} {r['sin_voz_final']:5.2f} {r['silabas_s']:5.2f} {r['articulacion']:5.2f} {r['tono_hz']:5d} {r['variacion_st']:5.2f} {r['enfasis_st']:+6.1f} {r['enfasis_db']:+6.1f}  {r['toma']}")
print(json.dumps(summary, ensure_ascii=False))
