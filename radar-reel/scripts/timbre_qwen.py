#!/usr/bin/env python3
"""Auditoría de timbre: similitud (coseno) del x-vector de cada toma contra el promedio de todas.
Uso: /root/qwen-venv/bin/python scripts/timbre_qwen.py out/qwen/toma_*.wav [--ref otro.wav]"""
import os, sys, json
import numpy as np, soundfile as sf, torch
from qwen_tts import Qwen3TTSModel
files = [f for f in sys.argv[1:]]
base = Qwen3TTSModel.from_pretrained(os.environ.get("QWEN_MODELS", "/root/qwen-models") + "/Qwen3-TTS-12Hz-1.7B-Base",
                                     device_map="cpu", dtype=torch.bfloat16)
emb = {}
for f in files:
    wav, sr = sf.read(f, dtype="float32")
    item = base.create_voice_clone_prompt(ref_audio=(wav, sr), x_vector_only_mode=True)[0]
    e = item.ref_spk_embedding.float().flatten().numpy()
    emb[f] = e / np.linalg.norm(e)
qwen = [f for f in files if "/out/qwen/" in os.path.abspath(f)]
mean = np.mean([emb[f] for f in qwen], axis=0); mean /= np.linalg.norm(mean)
res = {os.path.basename(f): round(float(emb[f] @ mean), 3) for f in files}
print(json.dumps(res, indent=1))
json.dump(res, open(os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "out/qwen/timbre.json"), "w"), indent=1)
