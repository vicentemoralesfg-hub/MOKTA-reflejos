#!/usr/bin/env python3
"""Marca de tiempo por palabra de la locución (faster-whisper local) → src/words.json"""
import json, os
from faster_whisper import WhisperModel
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
m = WhisperModel("small", device="cpu", compute_type="int8")
import numpy as np, subprocess
audio = np.frombuffer(subprocess.run(["ffmpeg","-v","error","-i",os.path.join(ROOT,"public/audio/voz.wav"),"-ar","16000","-ac","1","-f","s16le","-"],capture_output=True,check=True).stdout,np.int16).astype(np.float32)/32768
segs, _ = m.transcribe(audio, language="es", word_timestamps=True,
                       initial_prompt="Vale vista, Pablo, al tiro, plata, banco emisor.")
words = [dict(w=w.word.strip(), s=round(w.start, 3), e=round(w.end, 3)) for s in segs for w in s.words]
json.dump(words, open(os.path.join(ROOT, "raw/words_raw.json"), "w"), ensure_ascii=False, indent=0)
print(" ".join(f"{x['w']}@{x['s']}" for x in words))
