#!/usr/bin/env python3
"""
Verifica la locución en el MP4 final (con música y efectos):
 - transcribe el audio con Whisper (¿se entiende con la mezcla completa?)
 - para cada golpe visual anclado a una palabra (src/voice.json → anchors) mide la diferencia
   entre el fotograma del golpe y el inicio de esa palabra en el audio final.
Uso: python3 scripts/qa_voice.py out/MOKTA_BotonRecirculacion_v1.mp4
"""
import json
import os
import re
import subprocess
import sys
import unicodedata

import numpy as np
from faster_whisper import WhisperModel

vid = sys.argv[1]
au = np.frombuffer(subprocess.run(["ffmpeg", "-v", "error", "-i", vid, "-ac", "1", "-ar", "16000", "-f", "s16le", "-"], capture_output=True).stdout, np.int16).astype(np.float32) / 32768
cache = os.environ.get("MOKTA_TTS_CACHE", os.path.expanduser("~/.cache/mokta-tts"))
m = WhisperModel("small", device="cpu", compute_type="int8", download_root=os.path.join(cache, "whisper"))
segs, _ = m.transcribe(au, language="es", word_timestamps=True, beam_size=5)
W = [(w.word.strip(), w.start) for s in segs for w in s.words]
print("Transcripción del MP4 final:\n " + " ".join(w for w, _ in W) + "\n")


NUM = {"1": "uno", "2": "dos", "3": "tres", "4": "cuatro", "90": "noventa"}


def n(s):
    s = unicodedata.normalize("NFD", s.lower())
    s = "".join(c for c in s if unicodedata.category(c) != "Mn")
    s = re.sub(r"[^a-z0-9]", "", s)
    return NUM.get(s, s)  # Whisper escribe "1." por "uno"


T = json.load(open("src/timeline.json"))
V = json.load(open("src/voice.json"))
f0 = 0
print(f"{'golpe':18s} {'palabra':10s} {'voz (s)':>8s} {'golpe (s)':>9s} {'dif (ms)':>9s}")
diffs = []
for s in T["scenes"]:
    for b, (phrase, off) in V["scenes"][s["id"]]["anchors"].items():
        first = n(phrase.split()[0])
        expect = (f0 + s["beats"][b] - off) / 30  # instante en que debería empezar la palabra
        cands = [t for w, t in W if n(w) == first and abs(t - expect) <= 1.0]
        if not cands:
            print(f"{s['id'] + '.' + b:18s} {first:10s} {'—':>8s}")
            continue
        t = min(cands, key=lambda c: abs(c - expect))
        g = (f0 + s["beats"][b]) / 30
        d = int(round((g - t) * 1000))
        diffs.append(d - int(round(off / 30 * 1000)))
        print(f"{s['id'] + '.' + b:18s} {first:10s} {t:8.2f} {g:9.2f} {d:+9d}")
    f0 += s["duration"]
print(f"\nerror medio vs. lo previsto (sin contar los adelantos intencionales): {np.mean(np.abs(diffs)):.0f} ms")
