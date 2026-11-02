#!/usr/bin/env python3
"""
Locución con Qwen3-TTS (Apache-2.0), 100 % local en CPU.

1. La voz del narrador se diseñó una vez con Qwen3-TTS-VoiceDesign (vo/narrador_ref.wav + texto).
2. Este script la clona con Qwen3-TTS-Base para cada frase de vo/<pieza>.json → misma voz en todas las piezas.
3. Cada frase se valida transcribiéndola con faster-whisper: si no coincide con el guion, se regenera (máx. 3 intentos).
4. Se recortan silencios, se arma la pista con las pausas del guion y se escribe:
     public/vo/<pieza>.wav            (48 kHz mono)
     src/vo/<pieza>.json              (inicio/fin de cada frase + palabras con tiempo, para subtítulos y cortes)

Uso: python3 scripts/vo_generate.py motor clic km caballos
"""
import difflib
import json
import os
import re
import sys
import time
import unicodedata

import numpy as np
import soundfile as sf
import torch
from scipy.signal import resample_poly

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
torch.set_num_threads(4)


def norm(s):
    """Minúsculas, sin tildes ni puntuación, y números escritos en palabras (Whisper escribe "5 millones")."""
    from num2words import num2words

    s = s.lower()
    s = re.sub(r"(?<=\d)[.\s](?=\d{3}\b)", "", s)  # 1.600.000 → 1600000
    s = re.sub(r"(\d+),(\d+)", r"\1 coma \2", s)
    s = re.sub(r"\d+", lambda m: " " + num2words(int(m.group()), lang="es") + " ", s)
    s = unicodedata.normalize("NFD", s)
    s = "".join(c for c in s if unicodedata.category(c) != "Mn")
    return re.sub(r"[^a-z ]+", " ", s).split()


def trim(x, sr, thr=0.012, pad=0.04):
    e = np.sqrt(np.convolve(x ** 2, np.ones(int(0.01 * sr)) / int(0.01 * sr), "same"))
    idx = np.flatnonzero(e > thr)
    if len(idx) == 0:
        return x
    a = max(0, idx[0] - int(pad * sr))
    b = min(len(x), idx[-1] + int(pad * sr))
    y = x[a:b].copy()
    f = int(0.006 * sr)
    y[:f] *= np.linspace(0, 1, f)
    y[-f:] *= np.linspace(1, 0, f)
    return y


def main(names):
    from faster_whisper import WhisperModel
    from qwen_tts import Qwen3TTSModel

    stt = WhisperModel("small", device="cpu", compute_type="int8")
    tts = Qwen3TTSModel.from_pretrained("Qwen/Qwen3-TTS-12Hz-1.7B-Base", device_map="cpu", dtype=torch.float32)
    ref_audio = os.path.join(ROOT, "vo", "narrador_ref.wav")
    ref_text = open(os.path.join(ROOT, "vo", "narrador_ref.txt")).read().strip()
    prompt = tts.create_voice_clone_prompt(ref_audio=ref_audio, ref_text=ref_text)

    def transcribe(x, sr):
        y = resample_poly(x, 16000, sr).astype("float32")
        segs, _ = stt.transcribe(y, language="es", word_timestamps=True, beam_size=5)
        return [(w.word.strip(), w.start, w.end) for s in segs for w in s.words]

    for name in names:
        spec = json.load(open(os.path.join(ROOT, "vo", f"{name}.json")))
        SR = 48000
        track = []
        meta = []
        t = 0.0
        for seg in spec["segments"]:
            best = None
            for attempt in range(2):
                t0 = time.time()
                wavs, sr = tts.generate_voice_clone(text=seg["text"], language="Spanish", voice_clone_prompt=prompt)
                x = trim(np.asarray(wavs[0], dtype=np.float32), sr)
                words = transcribe(x, sr)
                score = difflib.SequenceMatcher(None, norm(seg["text"]), norm(" ".join(w[0] for w in words))).ratio()
                print(f"[{name}:{seg['id']}] intento {attempt + 1} · {len(x) / sr:.2f} s · coincidencia {score:.2f} · {time.time() - t0:.0f} s", flush=True)
                if best is None or score > best[0]:
                    best = (score, x, sr, words)
                if score >= 0.86:
                    break
            score, x, sr, words = best
            x48 = resample_poly(x, SR // 1000 * 1, sr // 1000).astype(np.float32) if sr != SR else x
            dur = len(x48) / SR
            meta.append({
                "id": seg["id"], "text": seg["text"], "start": round(t, 3), "end": round(t + dur, 3), "score": round(score, 3),
                "words": [{"w": w, "s": round(t + s, 3), "e": round(t + e, 3)} for w, s, e in words],
            })
            track.append(x48)
            t += dur
            gap = int(seg.get("gap", 0.3) * SR)
            track.append(np.zeros(gap, dtype=np.float32))
            t += gap / SR
        y = np.concatenate(track)
        y = y / (np.max(np.abs(y)) + 1e-9) * 0.89
        os.makedirs(os.path.join(ROOT, "public", "vo"), exist_ok=True)
        os.makedirs(os.path.join(ROOT, "src", "vo"), exist_ok=True)
        sf.write(os.path.join(ROOT, "public", "vo", f"{name}.wav"), y, SR, subtype="PCM_16")
        json.dump({"duration": round(len(y) / SR, 3), "segments": meta}, open(os.path.join(ROOT, "src", "vo", f"{name}.json"), "w"), ensure_ascii=False, indent=1)
        print(f"OK {name}: {len(y) / SR:.2f} s", flush=True)


if __name__ == "__main__":
    main(sys.argv[1:])
