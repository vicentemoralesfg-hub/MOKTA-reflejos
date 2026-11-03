#!/usr/bin/env python3
"""
Alinea una locución de ElevenLabs (una sola toma con todo el guion) contra las frases del guion:
transcribe con faster-whisper (solo para medir tiempos, no genera voz) y devuelve inicio/fin por frase y por palabra.
Uso (módulo): from el_align import align
"""
import difflib, os, re, sys, unicodedata
import numpy as np, soundfile as sf
from scipy.signal import resample_poly
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from vo_generate import norm


def read_mono(path, sr=16000):
    import subprocess, tempfile
    tmp = tempfile.mktemp(suffix=".wav")
    subprocess.run(["ffmpeg", "-loglevel", "error", "-y", "-i", path, "-ac", "1", "-ar", str(sr), tmp], check=True)
    y, _ = sf.read(tmp, dtype="float32")
    os.remove(tmp)
    return y


def align(audio_path, segments):
    """segments: [{'id','text'}] → [{'id','start','end','words':[{'w','s','e'}]}] (tiempos del audio original)."""
    from faster_whisper import WhisperModel
    y = read_mono(audio_path)
    m = WhisperModel("medium", device="cpu", compute_type="int8")
    ws, _ = m.transcribe(y, language="es", word_timestamps=True, beam_size=5)
    words = [(w.word.strip(), float(w.start), float(w.end)) for s in ws for w in s.words]
    # tokens normalizados de lo transcrito, cada uno ligado a su palabra
    hyp, owner = [], []
    for i, (w, a, b) in enumerate(words):
        for t in norm(w):
            hyp.append(t); owner.append(i)
    ref, rseg = [], []
    for k, s in enumerate(segments):
        for t in norm(s["text"]):
            ref.append(t); rseg.append(k)
    sm = difflib.SequenceMatcher(None, ref, hyp, autojunk=False)
    first, last = {}, {}
    for a, b, n in [(x.a, x.b, x.size) for x in sm.get_matching_blocks()]:
        for j in range(n):
            k = rseg[a + j]; wi = owner[b + j]
            first[k] = min(first.get(k, wi), wi); last[k] = max(last.get(k, wi), wi)
    out = []
    for k, s in enumerate(segments):
        if k not in first:
            raise RuntimeError(f"no se encontró la frase {s['id']}")
        ws_ = words[first[k]: last[k] + 1]
        out.append({"id": s["id"], "text": s["text"], "start": ws_[0][1], "end": ws_[-1][2], "words": [{"w": w, "s": a, "e": b} for w, a, b in ws_]})
    return out, len(ref) / max(1, len(set(rseg)))
