#!/usr/bin/env python3
"""
MOKTA · Locución con Qwen3-TTS (paso 1: generar tomas).

Flujo "diseñar y clonar" recomendado por Qwen para mantener un personaje:
  1. VoiceDesign (Qwen3-TTS-12Hz-1.7B-VoiceDesign) crea la voz de referencia a partir de una descripción
     (persona + emoción del gancho) → public/audio/voice/reference.wav (se guarda en el repo).
  2. Por cada escena se generan tomas con dos modos y varias semillas:
       clone  → Qwen3-TTS-12Hz-1.7B-Base clona el timbre de la referencia (timbre idéntico en todas las escenas)
       design → VoiceDesign con la persona + la emoción propia de la escena (más control emocional)
  3. Se mide la similitud de cada toma con el timbre de la referencia (embedding de hablante del modelo Base).
El paso 2 (scripts/gen_voice.py) transcribe, mide ritmo/tono/énfasis, elige la mejor toma y re-sincroniza la timeline.

Uso: python scripts/qwen_voice.py [modos=clone,design|none] [semillas=1,2,3]
Requisitos (CPU sirve; ~3× tiempo real con bfloat16): pip install qwen-tts torch soundfile numpy
Salida: out/voice_takes/<escena>_<modo>_s<semilla>.wav + out/voice_takes/takes.json
"""
import json
import os
import sys
import time

import numpy as np
import soundfile as sf
import torch
from qwen_tts import Qwen3TTSModel

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
V = json.load(open(os.path.join(ROOT, "src", "voice.json")))
Q = V["qwen"]
OUT = os.path.join(ROOT, "out", "voice_takes")
REF = os.path.join(ROOT, "public", "audio", "voice", "reference.wav")
os.makedirs(OUT, exist_ok=True)
torch.set_num_threads(int(os.environ.get("THREADS", os.cpu_count() or 4)))
DEV = "cuda:0" if torch.cuda.is_available() else "cpu"
KW = dict(device_map=DEV, dtype=torch.bfloat16, attn_implementation="sdpa")

ids = [i for i in V["scenes"] if not os.environ.get("SCENES") or i in os.environ["SCENES"].split(",")]  # SCENES=a,b: solo esas
texts = [V["scenes"][i]["text"] for i in ids]
modes = ([] if sys.argv[1] == "none" else sys.argv[1].split(",")) if len(sys.argv) > 1 else Q["modes"]  # "none": solo medir timbre
seeds = [int(s) for s in (sys.argv[2].split(",") if len(sys.argv) > 2 else Q["seeds"])]


def design_model():
    return Qwen3TTSModel.from_pretrained(Q["designModel"], **KW)


# 1) voz de referencia (solo si no existe: así el timbre queda fijo entre ejecuciones)
if not os.path.exists(REF):
    m = design_model()
    torch.manual_seed(Q["reference"]["seed"])
    w, sr = m.generate_voice_design(text=Q["reference"]["text"], language="Spanish", instruct=Q["persona"] + " " + Q["reference"]["emotion"])
    sf.write(REF, w[0], sr)
    print("referencia creada", REF)
    del m

takes = json.load(open(os.path.join(OUT, "takes.json"))) if os.path.exists(os.path.join(OUT, "takes.json")) else {}

# 2) tomas por escena
for mode in modes:
    if mode == "clone":
        m = Qwen3TTSModel.from_pretrained(Q["cloneModel"], **KW)
        prompt = m.create_voice_clone_prompt(ref_audio=REF, ref_text=Q["reference"]["text"])
    else:
        m = design_model()
    for sd in seeds:
        torch.manual_seed(sd)
        t = time.time()
        if mode == "clone":
            wavs, sr = m.generate_voice_clone(text=texts, language=["Spanish"] * len(texts), voice_clone_prompt=prompt * len(texts), max_new_tokens=600)
        else:
            ins = [Q["persona"] + " " + V["scenes"][i]["emotion"] for i in ids]
            wavs, sr = m.generate_voice_design(text=texts, language=["Spanish"] * len(texts), instruct=ins, max_new_tokens=600)
        for i, w in zip(ids, wavs):
            name = f"{i}_{mode}_s{sd}.wav"
            sf.write(os.path.join(OUT, name), w, sr)
            takes[name] = dict(scene=i, mode=mode, seed=sd)
        print(mode, "semilla", sd, f"{time.time() - t:.0f} s", flush=True)
    del m

# 3) similitud de timbre con la referencia (embedding de hablante del modelo Base)
base = Qwen3TTSModel.from_pretrained(Q["cloneModel"], **KW)


def emb(path):
    p = base.create_voice_clone_prompt(ref_audio=path, x_vector_only_mode=True)[0]
    e = p.ref_spk_embedding.float().flatten().cpu().numpy()
    return e / (np.linalg.norm(e) + 1e-9)


ref_e = emb(REF)
for name in takes:
    takes[name]["spk_sim"] = round(float(np.dot(ref_e, emb(os.path.join(OUT, name)))), 4)
json.dump(takes, open(os.path.join(OUT, "takes.json"), "w"), indent=1)
print("tomas:", len(takes))
