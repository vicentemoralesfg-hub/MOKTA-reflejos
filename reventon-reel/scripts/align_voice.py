#!/usr/bin/env python3
"""
Verifica la locución (Qwen3-ASR-1.7B) y obtiene el tiempo de cada palabra (Qwen3-ForcedAligner-0.6B).
Salida: voz/asr.txt (lo que el modelo escucha) y src/words.json (palabras del guion con inicio/fin en s).
Uso: python scripts/align_voice.py   (con el entorno que tenga qwen-asr + torch instalados)
"""
import json, os, re, sys
import torch
from qwen_asr import Qwen3ASRModel
from qwen_asr.inference.qwen3_forced_aligner import Qwen3ForcedAligner

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
WAV = os.path.join(ROOT, "voz", "locucion.wav")
script = open(os.path.join(ROOT, "voz", "guion.txt"), encoding="utf-8").read()
plain = re.sub(r"\[.*?\]", "", script)
plain = re.sub(r"\s+", " ", plain).strip()
torch.set_num_threads(os.cpu_count())

asr = Qwen3ASRModel.from_pretrained("Qwen/Qwen3-ASR-1.7B", dtype=torch.float32, device_map="cpu", max_new_tokens=1024)
res = asr.transcribe(audio=WAV, language="Spanish")
heard = res[0].text
open(os.path.join(ROOT, "voz", "asr.txt"), "w", encoding="utf-8").write(heard + "\n")
print("ASR:", heard, flush=True)
del asr

al = Qwen3ForcedAligner.from_pretrained("Qwen/Qwen3-ForcedAligner-0.6B", dtype=torch.float32, device_map="cpu")
out = al.align(audio=WAV, text=plain, language="Spanish")[0]
words = [{"w": it.text, "s": it.start_time, "e": it.end_time} for it in out]
json.dump(words, open(os.path.join(ROOT, "src", "words.json"), "w", encoding="utf-8"), ensure_ascii=False, indent=0)
for w in words:
    print(f"{w['s']:7.3f} {w['e']:7.3f} {w['w']}")
