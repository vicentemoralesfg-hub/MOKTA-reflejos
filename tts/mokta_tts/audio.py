"""Post-proceso de audio: recorte, pausas, loudness y exportación."""
from __future__ import annotations
import numpy as np
import librosa
import soundfile as sf
import pyloudnorm as pyln


def trim(wav: np.ndarray, sr: int, top_db: float = 42, keep_head: float = 0.03, keep_tail: float = 0.08) -> np.ndarray:
    """Recorta silencios de borde dejando un pequeño margen para no comer consonantes
    finales ni respiraciones de ataque."""
    if len(wav) == 0:
        return wav
    _, (a, b) = librosa.effects.trim(wav, top_db=top_db, frame_length=1024, hop_length=128)
    a = max(0, a - int(keep_head * sr))
    b = min(len(wav), b + int(keep_tail * sr))
    return wav[a:b]


def fade(wav: np.ndarray, sr: int, ms_in: float = 8, ms_out: float = 25) -> np.ndarray:
    w = wav.copy()
    ni, no = int(sr * ms_in / 1000), int(sr * ms_out / 1000)
    if ni and len(w) > ni:
        w[:ni] *= np.linspace(0, 1, ni)
    if no and len(w) > no:
        w[-no:] *= np.linspace(1, 0, no)
    return w


def silence(sec: float, sr: int) -> np.ndarray:
    return np.zeros(int(round(sec * sr)), dtype=np.float32)


def room_tone(sec: float, sr: int, level_db: float = -72) -> np.ndarray:
    """Silencio 'vivo' casi inaudible: evita cortes digitales absolutos entre frases."""
    n = int(round(sec * sr))
    return (np.random.default_rng(0).standard_normal(n) * 10 ** (level_db / 20)).astype(np.float32)


def loudness_normalize(wav: np.ndarray, sr: int, target_lufs: float = -16.0, peak_db: float = -1.5) -> np.ndarray:
    meter = pyln.Meter(sr)
    if len(wav) < sr * 0.5:
        pad = np.concatenate([wav, np.zeros(int(sr * 0.5), dtype=wav.dtype)])
        lufs = meter.integrated_loudness(pad)
    else:
        lufs = meter.integrated_loudness(wav)
    if not np.isfinite(lufs):
        return wav
    out = wav * (10 ** ((target_lufs - lufs) / 20))
    # limitador suave de picos (evita clipping sin aplastar dinámica)
    ceil = 10 ** (peak_db / 20)
    peak = np.max(np.abs(out)) if len(out) else 0
    if peak > ceil:
        knee = ceil * 0.7
        a = np.abs(out)
        over = a > knee
        comp = knee + (ceil - knee) * np.tanh((a[over] - knee) / (ceil - knee))
        out[over] = np.sign(out[over]) * comp
    return out.astype(np.float32)


def highpass(wav: np.ndarray, sr: int, hz: float = 60) -> np.ndarray:
    from scipy.signal import butter, sosfiltfilt
    sos = butter(2, hz, btype="highpass", fs=sr, output="sos")
    return sosfiltfilt(sos, wav).astype(np.float32)


def export(path, wav: np.ndarray, sr_in: int, sr_out: int = 48000, subtype: str = "PCM_24"):
    w = wav if sr_in == sr_out else librosa.resample(wav, orig_sr=sr_in, target_sr=sr_out, res_type="soxr_vhq")
    sf.write(str(path), np.clip(w, -1, 1), sr_out, subtype=subtype)
    return len(w) / sr_out
