#!/usr/bin/env python3
"""
Arma la pista de locución de un reel a partir de UNA toma de ElevenLabs con todo el guion:
alinea cada frase (faster-whisper solo mide tiempos), la recorta y la coloca con las pausas de vo/<pieza>.json.
Escribe public/vo/<pieza>.wav y src/vo/<pieza>.json (mismo formato que usan las composiciones: frases y palabras con tiempo).
Uso: python3 scripts/el_build.py <pieza> <toma.mp3>
"""
import json, os, subprocess, sys, tempfile
import numpy as np, soundfile as sf
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from el_align import align

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
name, mp3 = sys.argv[1:3]
SR = 48000
spec = json.load(open(os.path.join(ROOT, "vo", f"{name}.json")))["segments"]
cache = mp3.replace(".mp3", ".align.json")
if os.path.exists(cache):
    al = json.load(open(cache))
else:
    al, _ = align(mp3, spec)
    json.dump(al, open(cache, "w"), ensure_ascii=False)
tmp = tempfile.mktemp(suffix=".wav")
subprocess.run(["ffmpeg", "-loglevel", "error", "-y", "-i", mp3, "-ac", "1", "-ar", str(SR), tmp], check=True)
y, _ = sf.read(tmp, dtype="float32"); os.remove(tmp)
parts, meta, t = [], [], 0.0
for i, (a, s) in enumerate(zip(al, spec)):
    # Whisper a veces omite la última palabra: se extiende el corte hasta la pausa real (sin invadir la frase siguiente)
    prev_end = al[i - 1]["end"] if i else 0.0
    nxt = al[i + 1]["start"] if i + 1 < len(al) else len(y) / SR
    s0 = max(prev_end + 0.05, a["start"] - 0.06, 0.0)
    s1 = min(len(y) / SR, a["end"] + 0.45, max(a["end"] + 0.08, nxt - 0.03))
    clip = y[int(s0 * SR): int(s1 * SR)].copy()
    f = int(0.012 * SR); clip[:f] *= np.linspace(0, 1, f); clip[-f:] *= np.linspace(1, 0, f)
    lead = a["start"] - s0
    words = [{"w": w["w"], "s": round(t + w["s"] - s0, 3), "e": round(t + w["e"] - s0, 3)} for w in a["words"]]
    dur = len(clip) / SR
    meta.append({"id": s["id"], "text": s["text"], "start": round(t + lead, 3), "end": round(t + dur - 0.08, 3), "score": 1.0, "words": words})
    parts += [clip, np.zeros(int(s.get("gap", 0.3) * SR), dtype=np.float32)]
    t += dur + s.get("gap", 0.3)
out = np.concatenate(parts); out = out / (np.abs(out).max() + 1e-9) * 0.89
os.makedirs(os.path.join(ROOT, "public", "vo"), exist_ok=True)
sf.write(os.path.join(ROOT, "public", "vo", f"{name}.wav"), out, SR, subtype="PCM_16")
json.dump({"duration": round(len(out) / SR, 3), "engine": "elevenlabs", "segments": meta}, open(os.path.join(ROOT, "src", "vo", f"{name}.json"), "w"), ensure_ascii=False, indent=1)
print("OK", name, f"{len(out) / SR:.2f} s", [round(m["end"] - m["start"], 1) for m in meta])
