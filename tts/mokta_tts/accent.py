"""Detector de seseo (español latinoamericano) vs. distinción /θ/ (España).

En seseo, las palabras con 'z', 'ce', 'ci' llevan una /s/ sibilante con mucha energía
en 4-11 kHz. La /θ/ castellana es una fricativa dental débil y plana en esa banda.
Comparamos la energía sibilante máxima de palabras z/ce/ci contra palabras con 's'.
ratio ≈ 1 -> seseo (latino) ; ratio << 1 -> distinción (España).
"""
from __future__ import annotations
import re
import numpy as np
import librosa

# sólo posiciones interiores (z/c + vocal): la z final ("vez", "luz") queda truncada por el
# límite de palabra y se debilita también en el habla latina -> falsos positivos.
THETA = re.compile(r"z[aeiouáéíóú]|c[eiéí]", re.I)
SIB = re.compile(r"s[aeiouáéíóúptckm]", re.I)


def _sibilance(seg: np.ndarray, sr: int) -> float:
    if len(seg) < 512:
        return np.nan
    S = np.abs(librosa.stft(seg, n_fft=512, hop_length=128)) ** 2
    f = librosa.fft_frequencies(sr=sr, n_fft=512)
    hf = S[(f >= 4000) & (f <= 11000)].sum(0)
    peak = S.sum(0).max() + 1e-12          # pico de energía de la palabra (vocal)
    return float(np.max(10 * np.log10(hf / peak + 1e-12)))   # ráfaga sibilante más fuerte vs. vocal


def seseo_score(wav: np.ndarray, sr: int, words: list) -> dict:
    th, ss = [], []
    for w in words:
        t = w["word"].lower().strip(".,;:¿?¡!…\"'")
        a, b = int(w["start"] * sr), int(w["end"] * sr)
        val = _sibilance(wav[a:b], sr)
        if np.isnan(val):
            continue
        if THETA.search(t) and not SIB.search(t):
            th.append(val)
        elif SIB.search(t) and not THETA.search(t) and "z" not in t:
            ss.append(val)
    if len(th) < 1 or len(ss) < 2:
        return {"theta_db": None, "s_db": None, "delta_db": None, "latino": None}
    d = float(np.median(th) - np.median(ss))
    return {"theta_db": round(float(np.median(th)), 2), "s_db": round(float(np.median(ss)), 2),
            "delta_db": round(d, 2), "latino": bool(d > -4.0), "n": [len(th), len(ss)]}
