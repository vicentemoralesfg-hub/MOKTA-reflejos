#!/usr/bin/env python3
"""
Reacción vocal del conductor al reventón, generada con Qwen3-TTS-12Hz-1.7B-VoiceDesign (local, CPU).
Salida: voz/qwen_reaccion_{i}.wav
"""
import os, sys
import numpy as np
import soundfile as sf
import torch
from qwen_tts import Qwen3TTSModel

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
torch.set_num_threads(os.cpu_count())
model = Qwen3TTSModel.from_pretrained("Qwen/Qwen3-TTS-12Hz-1.7B-VoiceDesign", device_map="cpu", dtype=torch.float32)
instruct = ("Hombre chileno de unos 35 años que maneja de noche y se asusta de golpe por un estallido fuerte: "
            "grito ahogado corto, tenso y sorprendido, sin gritar fuerte, con la respiración cortada.")
texts = ["¡Ah…!", "¡Uh!", "¡Chuta…!"]
for i, txt in enumerate(texts):
    torch.manual_seed(7 + i)
    wavs, sr = model.generate_voice_design(text=txt, language="Spanish", instruct=instruct, do_sample=True, temperature=0.8, max_new_tokens=60)
    w = np.asarray(wavs[0], dtype=np.float32)
    sf.write(os.path.join(ROOT, "voz", f"qwen_reaccion_{i}.wav"), w, sr)
    print(i, txt, sr, len(w) / sr, flush=True)
