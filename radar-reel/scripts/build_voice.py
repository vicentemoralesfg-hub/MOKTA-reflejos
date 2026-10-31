#!/usr/bin/env python3
"""
Locución: arma la voz final a partir de segmentos (por rango de palabras) de una o más tomas
de ElevenLabs, con pausas definidas, tempo uniforme y nivel igualado entre tomas.

Entrada:  cues.json → voice.sources (mp3 + tiempos por palabra) y voice.segments
Salida:   public/audio/voz.wav (48 kHz mono, 16 bits) · src/data/words.json

Un segmento con "slot" ocupa siempre ese tiempo (s): si la toma es más larga se acelera lo justo
(atempo), si es más corta se completa con silencio. Así los cortes de los planos no dependen de la
toma y basta re-renderizar los subtítulos al cambiar la voz. Si el archivo de una fuente no existe,
sus segmentos quedan en silencio con tiempos por palabra estimados (vista previa).
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


SLOT_MIN_GAP = 0.12


def atempo(x, factor):
    with tempfile.TemporaryDirectory() as tmp:
        a, b = os.path.join(tmp, "a.wav"), os.path.join(tmp, "b.wav")
        wavfile.write(a, SR, x.astype(np.float32))
        subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", a, "-af", f"atempo={factor}", "-c:a", "pcm_f32le", b], check=True)
        _, y = wavfile.read(b)
    return y.astype(np.float32)


def placeholder(key):
    """Fuente ausente: tiempos estimados por sílabas aproximadas (vocales), sin audio."""
    words = []
    t = 0.0
    for w in VC["placeholderText"][key]:
        n = max(1, sum(ch in "aeiouáéíóú" for ch in w.lower()))
        d = 0.16 * n / TEMPO
        words.append(dict(text=w, start=t, end=t + d))
        t += d + (0.18 if w.endswith((".", "?", "…")) else 0.03)
    return None, words


def load(src, key):
    if not os.path.exists(os.path.join(ROOT, src["file"])):
        return placeholder(key)
    with tempfile.TemporaryDirectory() as tmp:
        out = os.path.join(tmp, "v.wav")
        subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", os.path.join(ROOT, src["file"]),
                        "-af", f"atempo={TEMPO}", "-ac", "1", "-ar", str(SR), "-c:a", "pcm_f32le", out], check=True)
        _, x = wavfile.read(out)
    words = json.load(open(os.path.join(ROOT, src["words"])))
    words = [dict(w, start=w["start"] / TEMPO, end=w["end"] / TEMPO) for w in words]
    return x.astype(np.float32) * (10 ** (src.get("gainDb", 0) / 20)), words


srcs = {k: load(v, k) for k, v in VC["sources"].items()}
missing = [k for k, (a, _) in srcs.items() if a is None]
pre, post = VC["pre"], VC["post"]

pieces = [np.zeros(int(round(VC["leadIn"] * SR)), np.float32)]
cursor = VC["leadIn"]
out_words = []
for seg in VC["segments"]:
    audio, words = srcs[seg["src"]]
    w0, w1 = words[seg["from"]], words[seg["to"]]
    a = max(0.0, w0["start"] - pre)
    b = w1["end"] + post if audio is None else min(len(audio) / SR, w1["end"] + post)
    if audio is None:
        clip = np.zeros(int((b - a) * SR), np.float32)
    else:
        clip = audio[int(a * SR): int(b * SR)].copy() * (10 ** (seg.get("gainDb", 0) / 20))
    k = 1.0
    if "slot" in seg and len(clip) / SR > seg["slot"] - SLOT_MIN_GAP:
        k = (len(clip) / SR) / (seg["slot"] - SLOT_MIN_GAP)
        clip = atempo(clip, k) if audio is not None else clip[: int((seg["slot"] - SLOT_MIN_GAP) * SR)]
        if k > 1.12:
            print(f"  aviso: '{w0['text']}…' necesitó acelerar ×{k:.2f} para caber en su hueco")
    fade = int(0.012 * SR)
    clip[:fade] *= np.linspace(0, 1, fade)
    clip[-fade:] *= np.linspace(1, 0, fade)
    for w in words[seg["from"]: seg["to"] + 1]:
        out_words.append(dict(text=w["text"], start=round(cursor + (w["start"] - a) / k, 4), end=round(cursor + (w["end"] - a) / k, 4)))
    pieces.append(clip)
    cursor += len(clip) / SR
    gap_s = seg["slot"] - len(clip) / SR if "slot" in seg else seg["gapAfter"]
    gap = np.zeros(int(round(gap_s * SR)), np.float32)
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
if missing:
    print(f"  VISTA PREVIA: falta la toma de la(s) fuente(s) {missing}; esos segmentos van en silencio.")
