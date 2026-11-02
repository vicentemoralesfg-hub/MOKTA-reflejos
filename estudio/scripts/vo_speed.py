#!/usr/bin/env python3
"""Acelera una locución ya generada (ffmpeg atempo, sin cambiar el tono) y reescala sus tiempos.
Uso: python3 scripts/vo_speed.py <pieza> [factor=1.08]   (idempotente: guarda el original como *_orig)"""
import json, os, shutil, subprocess, sys
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
name = sys.argv[1]; k = float(sys.argv[2]) if len(sys.argv) > 2 else 1.08
wav = os.path.join(ROOT, "public", "vo", f"{name}.wav"); js = os.path.join(ROOT, "src", "vo", f"{name}.json")
owav, ojs = wav.replace(".wav", "_orig.wav"), js.replace(".json", "_orig.json")
if not os.path.exists(owav): shutil.copy(wav, owav); shutil.copy(js, ojs)
subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", owav, "-af", f"atempo={k}", "-ar", "48000", wav], check=True)
d = json.load(open(ojs))
sc = lambda t: round(t / k, 3)
d["duration"] = sc(d["duration"]); d["speed"] = k
for s in d["segments"]:
    s["start"], s["end"] = sc(s["start"]), sc(s["end"])
    for w in s["words"]: w["s"], w["e"] = sc(w["s"]), sc(w["e"])
json.dump(d, open(js, "w"), ensure_ascii=False, indent=1)
print(f"{name}: ×{k} → {d['duration']} s")
