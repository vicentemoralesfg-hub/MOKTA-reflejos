#!/usr/bin/env python3
"""Genera N patrones musicales con Qwen3 y guarda el que mejor cumple las reglas pedidas en el prompt."""
import json, os, re, sys, importlib.util
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.argv = [sys.argv[0], sys.argv[1]] if len(sys.argv) > 1 else sys.argv
# reutiliza modelo, prompt y utilidades del diseñador principal sin volver a generar los efectos
src = open(os.path.join(ROOT, "scripts", "qwen_sfx_design.py")).read().split("recipes = json.load")[0].split("OUT = os.path.join")[0]
ns = {"__file__": os.path.join(ROOT, "scripts", "qwen_sfx_design.py"), "__name__": "qwen_sfx_design"}
exec(compile(src, "qwen_sfx_design", "exec"), ns)
ask, parse, MUSIC_PROMPT = ns["ask"], ns["parse"], ns["MUSIC_PROMPT"]
sys_msg = {"role": "system", "content": "You are an expert music producer who writes drum and bass patterns as strict JSON."}


def score(p):
    s = 0
    g = lambda k: [1 if v else 0 for v in (p.get(k) or [0] * 16)][:16] + [0] * max(0, 16 - len(p.get(k) or []))
    kick, snare, hat, oh = g("kick"), g("snare"), g("hat"), g("open_hat")
    s += 2 * (kick[0] + kick[8])
    s += 2 * (snare[4] + snare[12]) - sum(snare[i] for i in range(16) if i not in (4, 12))
    s += min(sum(hat), 8) * 0.5 - max(0, sum(hat) - 14)
    s += 1 if 1 <= sum(oh) <= 2 else 0
    bass = [b for b in (p.get("bass") or []) if b is not None]
    s += min(len(set(bass)), 3)
    s += 1 if sum(kick) in (3, 4, 5) else 0
    return s


R = json.load(open(os.path.join(ROOT, "assets", "sfx_recipes.json")))
cands = []
for i in range(int(os.environ.get("N", 6))):
    try:
        raw = ask([sys_msg, {"role": "user", "content": MUSIC_PROMPT}], 600)
        p = parse(raw)
        cands.append({"score": score(p), "pattern": p, "raw": raw})
        print(f"candidata {i}: puntaje {cands[-1]['score']:.1f}", flush=True)
    except Exception as e:
        print(f"candidata {i}: inválida ({e})", flush=True)
best = max(cands, key=lambda c: c["score"])
R["music"] = {"prompt": MUSIC_PROMPT, "pattern": best["pattern"], "raw": best["raw"], "score": best["score"],
              "selection": f"mejor de {len(cands)} candidatas generadas por Qwen3 según las reglas del prompt",
              "candidates": [{"score": c["score"], "pattern": c["pattern"]} for c in cands]}
json.dump(R, open(os.path.join(ROOT, "assets", "sfx_recipes.json"), "w"), indent=1, ensure_ascii=False)
print("elegida:", best["score"], json.dumps(best["pattern"]))
