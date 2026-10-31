#!/usr/bin/env python3
"""
Locución local con Kokoro-82M (Apache 2.0) + fonética española latinoamericana (espeak-ng es-419).

1. Sintetiza la frase 'vo' de cada escena de src/timeline.json.
2. Recorta silencios y obtiene el instante de cada palabra con Whisper (faster-whisper).
3. Ajusta la duración de cada escena para que la frase quepa (+ respiro) y escribe en
   timeline.json: voAt (inicio de la frase) y words (palabra → fotograma). Las escenas
   sincronizan sus animaciones con esas palabras (src/timeline.ts → cue()).
4. Escribe public/audio/vo.wav (48 kHz) ya posicionado en la línea de tiempo.

Requisitos: pip install kokoro misaki (sin extras) torch soundfile faster-whisper phonemizer-fork; apt install espeak-ng
"""
import json
import os
import sys
import types

import numpy as np
import soundfile as sf
from scipy.signal import resample_poly

# misaki.en requiere spacy (inglés); no se usa → módulo vacío para poder importar kokoro.
_en = types.ModuleType("misaki.en")
_en.MToken = object
_en.G2P = object
sys.modules["misaki.en"] = _en

import torch  # noqa: E402
from huggingface_hub import hf_hub_download  # noqa: E402
from kokoro.model import KModel  # noqa: E402
from misaki.espeak import EspeakG2P  # noqa: E402
from faster_whisper import WhisperModel  # noqa: E402

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
TL_PATH = os.path.join(ROOT, "src", "timeline.json")
VOICE = os.environ.get("VO_VOICE", "em_alex")
SPEED = float(os.environ.get("VO_SPEED", "1.28"))
MAX_PAUSE = float(os.environ.get("VO_MAX_PAUSE", "0.13"))  # s: pausas internas más largas se acortan
SR_K = 24000
SR = 48000

TL = json.load(open(TL_PATH))
FPS = TL["fps"]

# Inicio de la frase dentro de cada escena (fotogramas) y respiro mínimo al final.
LEAD = {"hook": 2, "para": 3}
DEFAULT_LEAD = 3
TAIL = {"teaser": 8, "horas": 12, "correcto": 10, "escarcha": 10, "cta": 36}
DEFAULT_TAIL = 6
MIN_DUR = {"para": 60, "cta": 110}

g2p = EspeakG2P(language="es-419")
model = KModel().eval()
pack = torch.load(hf_hub_download("hexgrad/Kokoro-82M", f"voices/{VOICE}.pt"), weights_only=True)
asr = WhisperModel("small", device="cpu", compute_type="int8")

out_dir = os.path.join(ROOT, "public", "audio", "vo")
os.makedirs(out_dir, exist_ok=True)


def trim(a, thr=0.004, pad=0.05, pad_end=0.09):
    env = np.convolve(np.abs(a), np.ones(240) / 240, mode="same")
    idx = np.where(env > thr)[0]
    if len(idx) == 0:
        return a
    s = max(0, idx[0] - int(pad * SR_K))
    e = min(len(a), idx[-1] + int(pad_end * SR_K))
    return a[s:e]


PAUSE = {"para": 0.38, "correcto": 0.22}  # pausas dramáticas que se respetan


def squeeze_pauses(a, max_pause, thr=0.005, hop=120):
    """Acorta silencios internos a MAX_PAUSE (ritmo de reel), con fundidos de 8 ms."""
    n = len(a) // hop
    env = np.array([np.sqrt(np.mean(a[i * hop:(i + 1) * hop] ** 2)) for i in range(n)])
    quiet = env < thr
    keep = int(max_pause * SR_K / hop)
    out = []
    i = 0
    last = 0
    while i < n:
        if quiet[i]:
            j = i
            while j < n and quiet[j]:
                j += 1
            if j - i > keep and i > 0 and j < n:
                cut_a = (i + keep // 2) * hop
                cut_b = (j - keep // 2) * hop
                seg = a[last:cut_a].copy()
                fl = int(0.008 * SR_K)
                if len(seg) > fl:
                    seg[-fl:] *= np.linspace(1, 0, fl)
                out.append(seg)
                last = cut_b
                nxt = a[last:last + fl].copy()
                a[last:last + fl] = nxt * np.linspace(0, 1, len(nxt))
            i = j
        else:
            i += 1
    out.append(a[last:])
    return np.concatenate(out)


lines = []
for b in TL["beats"]:
    # "... " delante: Kokoro ataca mejor la primera consonante (el silencio inicial se recorta después)
    ph = g2p("... " + b["vo"])
    with torch.no_grad():
        audio = model(ph, pack[len(ph) - 1], SPEED)
    a = audio.numpy() if hasattr(audio, "numpy") else np.asarray(audio)
    a = squeeze_pauses(trim(a.astype(np.float32)), PAUSE.get(b["id"], MAX_PAUSE))
    a16 = resample_poly(a, 2, 3).astype(np.float32)
    segs, _ = asr.transcribe(a16, language="es", word_timestamps=True, initial_prompt=b["vo"])
    words = []
    for s in segs:
        for w in s.words:
            words.append(dict(w=w.word.strip(), start=float(w.start), end=float(w.end), p=float(w.probability)))
    a48 = resample_poly(a, 2, 1).astype(np.float32)
    sf.write(os.path.join(out_dir, f"{b['id']}.wav"), a48, SR)
    lines.append(dict(id=b["id"], audio=a48, words=words, text=" ".join(x["w"] for x in words)))
    print(f"{b['id']:<11} {len(a48) / SR:5.2f}s | {lines[-1]['text']}", flush=True)

# ---------------------------------------------------------------- duraciones y palabras
for b, ln in zip(TL["beats"], lines):
    lead = LEAD.get(b["id"], DEFAULT_LEAD)
    vo_frames = int(np.ceil(len(ln["audio"]) / SR * FPS))
    need = lead + vo_frames + TAIL.get(b["id"], DEFAULT_TAIL)
    b["duration"] = int(max(need, MIN_DUR.get(b["id"], 54)))
    b["voAt"] = lead
    b["words"] = [dict(w=w["w"], t=round(lead + w["start"] * FPS, 1)) for w in ln["words"]]

total = sum(b["duration"] for b in TL["beats"])
vo = np.zeros(int(np.ceil(total / FPS * SR)) + SR, dtype=np.float32)
t = 0
for b, ln in zip(TL["beats"], lines):
    i = int(round((t + b["voAt"]) / FPS * SR))
    vo[i:i + len(ln["audio"])] += ln["audio"]
    t += b["duration"]
vo = vo[: int(np.ceil(total / FPS * SR))]
sf.write(os.path.join(ROOT, "public", "audio", "vo.wav"), vo, SR)

json.dump(TL, open(TL_PATH, "w"), ensure_ascii=False, indent=1)
print(f"OK · {total} fotogramas · {total / FPS:.2f} s")
