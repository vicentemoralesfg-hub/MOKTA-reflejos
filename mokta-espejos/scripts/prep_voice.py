#!/usr/bin/env python3
"""
Prepara la locución para ritmo de reel y recalcula los tiempos de cada palabra.

1. Acorta las pausas largas (silencios > 0,28 s) a una duración objetivo, con fundido corto en cada corte.
2. Acelera la voz ×TEMPO conservando el tono (ffmpeg atempo).
3. Lleva cada palabra de la transcripción a la nueva línea de tiempo y escribe src/vo.json.

Entrada: source/locucion_toma1.mp3 (ElevenLabs, voz l1zE9xgNpUTaQCZzpNJa) + source/locucion_toma1_palabras.json (Scribe)
Salida:  public/vo/voz.wav (48 kHz mono) + src/vo.json
"""
import json
import os
import subprocess
import sys

import numpy as np

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, "source", "locucion_toma1.mp3")
WORDS = os.path.join(ROOT, "source", "locucion_toma1_palabras.json")
OUT_WAV = os.path.join(ROOT, "public", "vo", "voz.wav")
OUT_JSON = os.path.join(ROOT, "src", "vo.json")

SR = 48000
TEMPO = 1.10
SIL_DB = -38.0
MIN_SIL = 0.28
DEFAULT_KEEP = 0.17
# Pausas con intención (palabra anterior → segundos de silencio a conservar)
KEEP_AFTER = {
    "personas.": 0.22,
    "parte.": 0.2,
    "pista...": 0.34,
    "viste.": 0.42,
    "segundos.": 0.22,
    "nunca.": 0.24,
    "hombro.": 0.22,
}
XFADE = int(0.008 * SR)


def decode(path):
    raw = subprocess.run(
        ["ffmpeg", "-v", "error", "-i", path, "-ac", "1", "-ar", str(SR), "-f", "f32le", "-"],
        check=True, capture_output=True,
    ).stdout
    return np.frombuffer(raw, dtype=np.float32).copy()


def find_silences(x):
    hop = int(0.01 * SR)
    n = len(x) // hop
    rms = np.sqrt((x[: n * hop].reshape(n, hop) ** 2).mean(1) + 1e-12)
    quiet = 20 * np.log10(rms) < SIL_DB
    sils, i = [], 0
    while i < n:
        if quiet[i]:
            j = i
            while j < n and quiet[j]:
                j += 1
            s, e = i * hop / SR, j * hop / SR
            if e - s >= MIN_SIL and s > 0.05:
                sils.append((s, e))
            i = j
        else:
            i += 1
    return sils


def main():
    x = decode(SRC)
    words = [w for w in json.load(open(WORDS))["words"] if w["type"] == "word" and not w["text"].startswith("[")]

    # Corrección manual del tramo "95%" (Scribe lo comprime; medido en la envolvente de energía)
    fix = {"95%": (4.08, 5.46), "de": (5.50, 5.60), "las": (5.62, 5.84), "personas.": (5.88, 6.72)}
    for i, w in enumerate(words):
        if w["text"] in fix and 3.5 < w["start"] < 6.5:
            w["start"], w["end"] = fix[w["text"]]

    sils = find_silences(x)
    cuts = []  # (inicio_corte, fin_corte) en segundos originales
    for s, e in sils:
        prev = [w for w in words if w["end"] <= s + 0.25]
        keep = KEEP_AFTER.get(prev[-1]["text"], DEFAULT_KEEP) if prev else DEFAULT_KEEP
        if e - s > keep + 0.02:
            mid_a = s + keep / 2
            mid_b = e - keep / 2
            cuts.append((mid_a, mid_b))

    # Construir audio con cortes y fundidos
    pieces, last = [], 0
    for a, b in cuts:
        ia, ib = int(a * SR), int(b * SR)
        pieces.append(x[last:ia])
        last = ib
    pieces.append(x[last:])
    out = pieces[0]
    for p in pieces[1:]:
        if len(out) > XFADE and len(p) > XFADE:
            fade = np.linspace(0, 1, XFADE, dtype=np.float32)
            mixed = out[-XFADE:] * (1 - fade) + p[:XFADE] * fade
            out = np.concatenate([out[:-XFADE], mixed, p[XFADE:]])
        else:
            out = np.concatenate([out, p])

    def tmap(t):
        removed = 0.0
        for a, b in cuts:
            if t >= b:
                removed += b - a - XFADE / SR
            elif t > a:
                removed += t - a
        return (t - removed) / TEMPO

    os.makedirs(os.path.dirname(OUT_WAV), exist_ok=True)
    tmp = OUT_WAV + ".tmp.wav"
    subprocess.run(
        ["ffmpeg", "-v", "error", "-y", "-f", "f32le", "-ar", str(SR), "-ac", "1", "-i", "-",
         "-af", f"atempo={TEMPO},highpass=f=70,acompressor=threshold=-20dB:ratio=2.5:attack=8:release=120:makeup=2",
         "-c:a", "pcm_s16le", tmp],
        input=out.astype(np.float32).tobytes(), check=True,
    )
    os.replace(tmp, OUT_WAV)
    dur = float(subprocess.run(
        ["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", OUT_WAV],
        capture_output=True, text=True, check=True).stdout.strip())

    mapped = [
        {"text": w["text"], "start": round(tmap(w["start"]), 3), "end": round(tmap(w["end"]), 3)}
        for w in words
    ]
    json.dump({"durationS": round(dur, 3), "words": mapped}, open(OUT_JSON, "w"), ensure_ascii=False, indent=1)
    print(f"cortes: {len(cuts)}  original: {len(x)/SR:.2f}s  final: {dur:.2f}s  palabras: {len(mapped)}", file=sys.stderr)


if __name__ == "__main__":
    main()
