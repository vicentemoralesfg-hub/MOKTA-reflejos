#!/usr/bin/env python3
"""
Locución: arma la voz final a partir de segmentos (por rango de palabras) de una o más tomas
de ElevenLabs, con pausas definidas, tempo uniforme y nivel igualado entre tomas.

Entrada:  cues.json → voice.sources (mp3 + tiempos por palabra) y voice.segments
Salida:   public/audio/voz.wav (48 kHz mono, 16 bits) · src/data/words.json
"""
import json
import math
import os
import subprocess
import tempfile

import numpy as np
from scipy.io import wavfile

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CUES = json.load(open(os.path.join(ROOT, "src", "data", "cues.json")))
VC = CUES["voice"]
SR = 48000
TEMPO = VC["tempo"]
FPS = CUES["fps"]


def load(src):
    with tempfile.TemporaryDirectory() as tmp:
        out = os.path.join(tmp, "v.wav")
        subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", os.path.join(ROOT, src["file"]),
                        "-af", f"atempo={TEMPO}", "-ac", "1", "-ar", str(SR), "-c:a", "pcm_f32le", out], check=True)
        _, x = wavfile.read(out)
    words = json.load(open(os.path.join(ROOT, src["words"])))
    words = [dict(w, start=w["start"] / TEMPO, end=w["end"] / TEMPO) for w in words]
    return x.astype(np.float32) * (10 ** (src.get("gainDb", 0) / 20)), words


srcs = {k: load(v) for k, v in VC["sources"].items()}
pre, post = VC["pre"], VC["post"]

pieces = [np.zeros(int(round(VC["leadIn"] * SR)), np.float32)]
cursor = VC["leadIn"]
out_words = []
for seg in VC["segments"]:
    audio, words = srcs[seg["src"]]
    w0, w1 = words[seg["from"]], words[seg["to"]]
    a = max(0.0, w0["start"] - pre)
    b = min(len(audio) / SR, w1["end"] + post)
    clip = audio[int(a * SR): int(b * SR)].copy() * (10 ** (seg.get("gainDb", 0) / 20))
    fade = int(0.012 * SR)
    clip[:fade] *= np.linspace(0, 1, fade)
    clip[-fade:] *= np.linspace(1, 0, fade)
    for w in words[seg["from"]: seg["to"] + 1]:
        out_words.append(dict(text=w["text"], start=round(cursor + w["start"] - a, 4), end=round(cursor + w["end"] - a, 4)))
    pieces.append(clip)
    cursor += len(clip) / SR
    gap = np.zeros(int(round(seg["gapAfter"] * SR)), np.float32)
    pieces.append(gap)
    cursor += len(gap) / SR

voice = np.concatenate(pieces)
total = out_words[-1]["end"] + VC["tail"]
frames = int(math.ceil(total * FPS))
n = int(frames / FPS * SR)
voice = np.pad(voice, (0, max(0, n - len(voice))))[:n]

wavfile.write(os.path.join(ROOT, "public/audio/voz.wav"), SR, (np.clip(voice, -1, 1) * 32767).astype(np.int16))
json.dump(dict(durationInFrames=frames, words=out_words), open(os.path.join(ROOT, "src/data/words.json"), "w"),
          ensure_ascii=False, indent=1)
print(f"voz: {n / SR:.2f}s · {frames} fotogramas · {len(out_words)} palabras · última {out_words[-1]['end']:.2f}s")
print(" ".join(w["text"] for w in out_words))
