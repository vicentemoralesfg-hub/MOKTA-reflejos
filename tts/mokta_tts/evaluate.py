"""Control de calidad automático de cada toma.

Métricas (todas locales):
  - CER: tasa de error de caracteres entre el guion y lo que Whisper entiende (detecta
    palabras omitidas, repeticiones, alucinaciones y mala dicción).
  - SQUIM (torchaudio): estimación sin referencia de PESQ/STOI/SI-SDR -> limpieza del audio.
  - F0: tono medio y variación (expresividad) con pYIN.
  - Similitud de hablante: coseno entre embeddings del codificador de Qwen3-TTS Base.
"""
from __future__ import annotations
import re, unicodedata
from dataclasses import dataclass, asdict, field

import numpy as np
import librosa
import torch

_whisper = None
_squim = None


def _norm_text(s: str) -> str:
    s = unicodedata.normalize("NFKD", s.lower())
    s = "".join(c for c in s if not unicodedata.combining(c))
    s = re.sub(r"[^a-z0-9ñ ]+", " ", s)
    return re.sub(r"\s+", " ", s).strip()


def _levenshtein(a: str, b: str) -> int:
    if len(a) < len(b):
        a, b = b, a
    prev = list(range(len(b) + 1))
    for i, ca in enumerate(a, 1):
        cur = [i]
        for j, cb in enumerate(b, 1):
            cur.append(min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (ca != cb)))
        prev = cur
    return prev[-1]


def cer(ref: str, hyp: str) -> float:
    from .text import normalize  # Whisper escribe cifras ("2019"): normalizar ambos lados igual
    r, h = _norm_text(normalize(ref)), _norm_text(normalize(hyp))
    if not r:
        return 0.0
    return _levenshtein(r, h) / len(r)


def get_whisper(model_name: str, device: str, compute_type: str):
    global _whisper
    if _whisper is None:
        from faster_whisper import WhisperModel
        _whisper = WhisperModel(model_name, device=device, compute_type=compute_type)
    return _whisper


def transcribe(wav: np.ndarray, sr: int, whisper_cfg: dict, prompt: str | None = None):
    """Devuelve (texto, palabras[{word,start,end}]). wav en float32 mono."""
    w16 = librosa.resample(wav.astype(np.float32), orig_sr=sr, target_sr=16000)
    model = get_whisper(whisper_cfg.get("model", "large-v3-turbo"), whisper_cfg["device"], whisper_cfg["compute_type"])
    segs, _ = model.transcribe(w16, language="es", word_timestamps=True, beam_size=5,
                               vad_filter=False, condition_on_previous_text=False,
                               initial_prompt=prompt)
    text, words = [], []
    for s in segs:
        text.append(s.text)
        for w in (s.words or []):
            words.append({"word": w.word.strip(), "start": round(w.start, 3), "end": round(w.end, 3)})
    return " ".join(t.strip() for t in text), words


def squim(wav: np.ndarray, sr: int) -> dict:
    global _squim
    import torchaudio
    if _squim is None:
        _squim = torchaudio.pipelines.SQUIM_OBJECTIVE.get_model().eval()
    w16 = librosa.resample(wav.astype(np.float32), orig_sr=sr, target_sr=16000)
    with torch.no_grad():
        stoi, pesq, sisdr = _squim(torch.tensor(w16)[None])
    return {"stoi": float(stoi), "pesq": float(pesq), "si_sdr": float(sisdr)}


def pitch_stats(wav: np.ndarray, sr: int) -> dict:
    w = librosa.resample(wav.astype(np.float32), orig_sr=sr, target_sr=16000)
    f0, voiced, _ = librosa.pyin(w, fmin=60, fmax=300, sr=16000, frame_length=1024)
    f0 = f0[voiced & ~np.isnan(f0)]
    if len(f0) < 10:
        return {"f0_median": 0.0, "f0_st_std": 0.0}
    st = 12 * np.log2(f0 / np.median(f0))
    return {"f0_median": float(np.median(f0)), "f0_st_std": float(np.std(st))}


def cosine(a, b) -> float:
    a = torch.as_tensor(a).float().flatten()
    b = torch.as_tensor(b).float().flatten()
    return float(torch.nn.functional.cosine_similarity(a, b, dim=0))


@dataclass
class TakeReport:
    cer: float
    transcript: str
    stoi: float
    pesq: float
    si_sdr: float
    f0_median: float
    f0_st_std: float
    chars_per_sec: float
    duration: float
    clipped: bool
    spk_sim: float | None = None
    seseo_delta: float | None = None    # dB z/ce/ci vs s; < SESEO_MIN => pronunciación peninsular
    score: float = 0.0
    words: list = field(default_factory=list)

    def to_dict(self, with_words=False):
        d = asdict(self)
        if not with_words:
            d.pop("words")
        return d


def evaluate_take(wav: np.ndarray, sr: int, text: str, whisper_cfg: dict,
                  spk_emb=None, ref_emb=None) -> TakeReport:
    hyp, words = transcribe(wav, sr, whisper_cfg)
    q = squim(wav, sr)
    p = pitch_stats(wav, sr)
    dur = len(wav) / sr
    nchar = len(_norm_text(text).replace(" ", ""))
    # velocidad de articulación: letras / tiempo con voz (excluye pausas dramáticas)
    iv = librosa.effects.split(wav, top_db=35, frame_length=1024, hop_length=256)
    voiced = max(sum(b - a for a, b in iv) / sr, 1e-3)
    rep = TakeReport(cer=cer(text, hyp), transcript=hyp, **q, **p,
                     chars_per_sec=nchar / voiced, duration=dur,
                     clipped=bool(np.max(np.abs(wav)) >= 0.999), words=words)
    if spk_emb is not None and ref_emb is not None:
        rep.spk_sim = cosine(spk_emb, ref_emb)
    from .accent import seseo_score
    rep.seseo_delta = seseo_score(wav, sr, words)["delta_db"]
    rep.score = score(rep)
    return rep


SESEO_MIN = -4.0   # dB; voces latinas medidas: -1.4..+2.6 ; peninsular: ~-10


def score(r: TakeReport) -> float:
    """Puntaje compuesto (mayor = mejor). La inteligibilidad pesa más: una toma
    con palabras cambiadas es inutilizable aunque suene bonita."""
    s = 0.0
    s -= 400 * r.cer                         # 1% CER = -4 puntos
    s += 6 * (r.pesq - 3.0)                  # limpieza / ausencia de artefactos
    s += 40 * (r.stoi - 0.95)
    # articulación natural de narración en español: ~11-17 letras por segundo con voz
    if r.chars_per_sec < 10.5:
        s -= 3 * (10.5 - r.chars_per_sec)
    if r.chars_per_sec > 17.5:
        s -= 3 * (r.chars_per_sec - 17.5)
    # expresividad: monótono (<1.8 st) o exagerado (>5 st) penaliza
    if r.f0_st_std < 1.8:
        s -= 4 * (1.8 - r.f0_st_std)
    if r.f0_st_std > 5.0:
        s -= 2 * (r.f0_st_std - 5.0)
    if r.spk_sim is not None:
        s += 30 * (r.spk_sim - 0.85)         # consistencia del timbre
    if r.clipped:
        s -= 2
    # acento: exigimos seseo latinoamericano (penaliza /θ/ peninsular)
    if r.seseo_delta is not None and r.seseo_delta < SESEO_MIN:
        s -= 2.0 * (SESEO_MIN - r.seseo_delta) + 6
    return round(s, 3)
