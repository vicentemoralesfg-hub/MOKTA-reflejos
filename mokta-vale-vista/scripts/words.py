#!/usr/bin/env python3
"""Reemplaza el texto transcrito por el guion exacto (mismos tiempos) → src/words.json"""
import json, os
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
raw = json.load(open(os.path.join(ROOT, "raw/words_raw.json")))
script = open(os.path.join(ROOT, "guion.txt")).read().replace("...", "…").split()
assert len(script) == len(raw), (len(script), len(raw))
out = [dict(w=t, s=r["s"], e=r["e"]) for t, r in zip(script, raw)]
json.dump(out, open(os.path.join(ROOT, "src/words.json"), "w"), ensure_ascii=False)
print("ok", len(out))
