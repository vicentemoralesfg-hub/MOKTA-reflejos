#!/usr/bin/env python3
"""
Locución: aplica tempo y pausas dramáticas a la voz de ElevenLabs y reescribe
los tiempos por palabra para Remotion.

Entrada:  public/audio/voz_raw.mp3 (ElevenLabs) · scripts/words_raw.json (transcripción con tiempos)
Salida:   public/audio/voz.wav (48 kHz mono) · src/data/words.json
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
RAW = json.load(open(os.path.join(ROOT, "scripts", "words_raw.json")))
SR = 48000
TEMPO = CUES["voiceTempo"]

with tempfile.TemporaryDirectory() as tmp:
    out = os.path.join(tmp, "v.wav")
    subprocess.run(
        ["ffmpeg", "-v", "error", "-y", "-i", os.path.join(ROOT, "public/audio/voz_raw.mp3"),
         "-af", f"atempo={TEMPO}", "-ac", "1", "-ar", str(SR), "-c:a", "pcm_f32le", out],
        check=True,
    )
    sr, voice = wavfile.read(out)
voice = voice.astype(np.float32)

words = [dict(w, start=w["start"] / TEMPO, end=w["end"] / TEMPO) for w in RAW]

# Pausas: se cortan en el centro del silencio entre dos palabras.
pieces, cursor, shift = [], 0, 0.0
pause_at = {p["afterWord"]: p["seconds"] for p in CUES["pauses"]}
shifts = [0.0] * len(words)
for i in range(len(words)):
    shifts[i] = shift
    if i in pause_at and i + 1 < len(words):
        cut_t = (words[i]["end"] + words[i + 1]["start"]) / 2
        cut = int(round(cut_t * SR))
        pieces.append(voice[cursor:cut])
        pieces.append(np.zeros(int(round(pause_at[i] * SR)), np.float32))
        cursor = cut
        shift += pause_at[i]
pieces.append(voice[cursor:])

lead = CUES["voiceLeadIn"]
voice = np.concatenate([np.zeros(int(round(lead * SR)), np.float32)] + pieces)

out_words = []
for w, sh in zip(words, shifts):
    out_words.append(dict(text=w["text"], start=round(w["start"] + sh + lead, 4), end=round(w["end"] + sh + lead, 4)))

total = out_words[-1]["end"] + CUES["tail"]
frames = int(math.ceil(total * CUES["fps"]))
voice = np.pad(voice, (0, max(0, int(frames / CUES["fps"] * SR) - len(voice))))[: int(frames / CUES["fps"] * SR)]

wavfile.write(os.path.join(ROOT, "public/audio/voz.wav"), SR, (np.clip(voice, -1, 1) * 32767).astype(np.int16))
json.dump(dict(durationInFrames=frames, words=out_words), open(os.path.join(ROOT, "src/data/words.json"), "w"),
          ensure_ascii=False, indent=1)
print(f"voz: {len(voice) / SR:.2f}s · {frames} fotogramas · última palabra {out_words[-1]['end']:.2f}s")
