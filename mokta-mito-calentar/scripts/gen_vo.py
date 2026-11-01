#!/usr/bin/env python3
"""
Locución v2 con Qwen3-TTS VoiceDesign (Apache 2.0), dirigida frase por frase con instrucciones de emoción.

  python3 scripts/gen_vo.py takes [N]   → genera N tomas por escena (public/audio/vo_takes/)
  python3 scripts/gen_vo.py build       → elige la mejor toma de cada escena, sincroniza y escribe:
                                          src/timeline.json (duración, voAt y palabra→fotograma)
                                          public/audio/vo.wav (locución posicionada, 48 kHz)

Criterios de elección (no se puede "escuchar", así que se mide):
  1. Inteligibilidad: tasa de error de palabras (Whisper) contra el guion → descarta tomas con errores.
  2. Mismo hablante: similitud de timbre (Resemblyzer) con el centroide de todas las tomas → evita saltos de voz.
  3. Expresividad: variación de tono en semitonos (Praat) → a igualdad, gana la más expresiva.

Guion y dirección de cada frase: scripts/vo_script.json.
Requisitos: pip install qwen-tts faster-whisper resemblyzer praat-parselmouth; torch/torchaudio CPU emparejados.
"""
import json
import os
import sys
import unicodedata

import numpy as np
import soundfile as sf
from scipy.signal import resample_poly

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
TL_PATH = os.path.join(ROOT, "src", "timeline.json")
SCRIPT = json.load(open(os.path.join(ROOT, "scripts", "vo_script.json")))
TAKES_DIR = os.path.join(ROOT, "public", "audio", "vo_takes")
SR = 48000

# Inicio de la frase dentro de la escena y respiro final (fotogramas); duración mínima de algunas escenas.
LEAD = {"hook": 2}
DEFAULT_LEAD = 3
TAIL = {"para": 6, "teaser": 6, "horas": 8, "correcto": 8, "escarcha": 8, "cta": 36}
DEFAULT_TAIL = 5
MIN_DUR = {"para": 60, "cta": 110}
MAX_PAUSE = {"para": 0.55, "correcto": 0.4}
# Ritmo objetivo de reel (palabras/s). Si una frase queda más lenta, se acelera con Rubber Band R3
# (estiramiento de tiempo de alta calidad, sin cambiar el tono), hasta un máximo de ×1,25.
TARGET_WPS = 3.0
MAX_TEMPO = 1.25
DEFAULT_MAX_PAUSE = 0.32


def norm_words(s):
    import re
    from num2words import num2words

    s = re.sub(r"\d+", lambda m: " " + num2words(int(m.group()), lang="es") + " ", s)
    s = unicodedata.normalize("NFD", s.lower())
    s = "".join(c for c in s if unicodedata.category(c) != "Mn")
    s = "".join(c if c.isalnum() or c == " " else " " for c in s)
    return s.replace("v", "b").split()  # b/v suenan igual en español


def wer(ref, hyp):
    r, h = norm_words(ref), norm_words(hyp)
    d = np.zeros((len(r) + 1, len(h) + 1), dtype=int)
    d[:, 0] = np.arange(len(r) + 1)
    d[0, :] = np.arange(len(h) + 1)
    for i in range(1, len(r) + 1):
        for j in range(1, len(h) + 1):
            d[i, j] = min(d[i - 1, j] + 1, d[i, j - 1] + 1, d[i - 1, j - 1] + (r[i - 1] != h[j - 1]))
    return d[len(r), len(h)] / max(1, len(r))


def takes(n):
    import torch
    from qwen_tts import Qwen3TTSModel

    torch.set_num_threads(os.cpu_count() or 4)
    os.makedirs(TAKES_DIR, exist_ok=True)
    model = Qwen3TTSModel.from_pretrained("Qwen/Qwen3-TTS-12Hz-1.7B-VoiceDesign", device_map="cpu", dtype=torch.float32)
    ids = [b["id"] for b in json.load(open(TL_PATH))["beats"]]
    for k in range(n):
        torch.manual_seed(1000 + k)
        for bid in ids:
            path = os.path.join(TAKES_DIR, f"{bid}_{k}.wav")
            if os.path.exists(path):
                continue
            line = SCRIPT["lines"][bid]
            wavs, sr = model.generate_voice_design(
                text=line["text"], language="Spanish", instruct=SCRIPT["voice"] + " " + line["emotion"]
            )
            sf.write(path, wavs[0], sr)
            print(f"toma {k} {bid}: {len(wavs[0]) / sr:.2f} s", flush=True)


def load(path, sr_out):
    a, sr = sf.read(path, dtype="float32")
    if a.ndim > 1:
        a = a.mean(1)
    from math import gcd

    g = gcd(sr, sr_out)
    return resample_poly(a, sr_out // g, sr // g).astype(np.float32)


def trim(a, sr, pad=0.05, pad_end=0.12):
    env = np.convolve(np.abs(a), np.ones(int(0.01 * sr)) / (0.01 * sr), mode="same")
    thr = env.max() * 10 ** (-42 / 20)
    idx = np.where(env > thr)[0]
    if len(idx) == 0:
        return a
    return a[max(0, idx[0] - int(pad * sr)): min(len(a), idx[-1] + int(pad_end * sr))]


def cap_pauses(a, sr, max_pause, hop=240):
    """Acorta solo los silencios internos más largos que max_pause (conserva la respiración natural)."""
    n = len(a) // hop
    env = np.array([np.sqrt(np.mean(a[i * hop:(i + 1) * hop] ** 2)) for i in range(n)])
    thr = env.max() * 10 ** (-38 / 20)
    quiet = env < thr
    keep = int(max_pause * sr / hop)
    out, last, i = [], 0, 0
    fl = int(0.01 * sr)
    while i < n:
        if quiet[i]:
            j = i
            while j < n and quiet[j]:
                j += 1
            if j - i > keep and i > 0 and j < n:
                cut_a, cut_b = (i + keep // 2) * hop, (j - keep // 2) * hop
                seg = a[last:cut_a].copy()
                seg[-fl:] *= np.linspace(1, 0, fl)
                out.append(seg)
                nxt = a[cut_b:cut_b + fl].copy()
                a[cut_b:cut_b + fl] = nxt * np.linspace(0, 1, len(nxt))
                last = cut_b
            i = j
        else:
            i += 1
    out.append(a[last:])
    return np.concatenate(out)


def tempo_fit(a, sr, n_words):
    """Acelera la frase hasta TARGET_WPS con rubberband --fine (sin tocar el tono)."""
    import subprocess
    import tempfile

    rate = n_words / (len(a) / sr)
    tempo = float(np.clip(TARGET_WPS / rate, 1.0, MAX_TEMPO))
    if tempo < 1.02:
        return a, 1.0
    with tempfile.TemporaryDirectory() as d:
        i, o = os.path.join(d, "i.wav"), os.path.join(d, "o.wav")
        sf.write(i, a, sr)
        subprocess.run(["rubberband", "--fine", "-T", f"{tempo:.4f}", i, o], check=True, capture_output=True)
        b, _ = sf.read(o, dtype="float32")
    return b.astype(np.float32), tempo


def speech_rms(a):
    hop = 480
    n = len(a) // hop
    r = np.array([np.sqrt(np.mean(a[i * hop:(i + 1) * hop] ** 2)) for i in range(n)])
    r = r[r > r.max() * 0.1]
    return float(np.sqrt(np.mean(r ** 2))) if len(r) else 1e-3


def build():
    import parselmouth
    from faster_whisper import WhisperModel
    from resemblyzer import VoiceEncoder, preprocess_wav

    TL = json.load(open(TL_PATH))
    FPS = TL["fps"]
    asr = WhisperModel("small", device="cpu", compute_type="int8")
    enc = VoiceEncoder("cpu")
    files = sorted(f for f in os.listdir(TAKES_DIR) if f.endswith(".wav"))
    info = {}
    for f in files:
        bid, k = f[:-4].rsplit("_", 1)
        p = os.path.join(TAKES_DIR, f)
        a16 = load(p, 16000)
        segs, _ = asr.transcribe(a16, language="es")
        hyp = " ".join(s.text for s in segs)
        emb = enc.embed_utterance(preprocess_wav(a16, source_sr=16000))
        snd = parselmouth.Sound(a16.astype(np.float64), 16000)
        f0 = snd.to_pitch(time_step=0.01, pitch_floor=70, pitch_ceiling=400).selected_array["frequency"]
        f0 = f0[f0 > 0]
        f0sd = float(np.std(12 * np.log2(f0 / np.median(f0)))) if len(f0) > 10 else 0.0
        info[f] = dict(bid=bid, k=int(k), wer=wer(SCRIPT["lines"][bid]["text"], hyp), hyp=hyp, emb=emb, f0sd=f0sd, dur=len(a16) / 16000)
    centroid = np.mean([v["emb"] for v in info.values()], 0)
    centroid /= np.linalg.norm(centroid)
    for v in info.values():
        v["sim"] = float(np.dot(v["emb"], centroid) / np.linalg.norm(v["emb"]))

    chosen = {}
    report = []
    for b in TL["beats"]:
        cand = [v | {"file": f} for f, v in info.items() if v["bid"] == b["id"]]
        best_wer = min(c["wer"] for c in cand)
        ok = [c for c in cand if c["wer"] <= best_wer + 1e-9]
        sims = [c["sim"] for c in info.values()]
        floor = np.median(sims) - 0.04
        ok2 = [c for c in ok if c["sim"] >= floor] or ok
        # a igualdad de inteligibilidad: mismo timbre, más expresiva y más ágil (reel)
        pick = max(ok2, key=lambda c: c["sim"] + 0.03 * min(c["f0sd"], 6) - 0.02 * c["dur"] / max(1, len(norm_words(SCRIPT["lines"][b["id"]]["text"]))) * 10)
        chosen[b["id"]] = pick
        for c in sorted(cand, key=lambda c: c["k"]):
            report.append(
                f"{b['id']:<11} toma {c['k']} {'◀' if c is pick or c['file'] == pick['file'] else ' '} "
                f"WER {c['wer']:.2f}  timbre {c['sim']:.3f}  tono±{c['f0sd']:.2f}st  {c['dur']:.2f}s | {c['hyp'].strip()}"
            )
    print("\n".join(report))
    open(os.path.join(TAKES_DIR, "seleccion.txt"), "w").write("\n".join(report) + "\n")

    # nivel común, recorte, pausas y palabra → fotograma
    lines = {}
    target = None
    for b in TL["beats"]:
        a = load(os.path.join(TAKES_DIR, chosen[b["id"]]["file"]), SR)
        a = cap_pauses(trim(a, SR), SR, MAX_PAUSE.get(b["id"], DEFAULT_MAX_PAUSE))
        a, tempo = tempo_fit(a, SR, len(norm_words(SCRIPT["lines"][b["id"]]["text"])))
        print(f"{b['id']:<11} ritmo ×{tempo:.2f} → {len(norm_words(SCRIPT['lines'][b['id']]['text'])) / (len(a) / SR):.2f} palabras/s")
        r = speech_rms(a)
        target = target or r
        a = a * (target / r)
        segs, _ = asr.transcribe(resample_poly(a, 1, 3).astype(np.float32), language="es", word_timestamps=True, initial_prompt=SCRIPT["lines"][b["id"]]["text"])
        words = [dict(w=w.word.strip(), start=float(w.start)) for s in segs for w in s.words]
        lines[b["id"]] = (a, words)

    for b in TL["beats"]:
        a, words = lines[b["id"]]
        b["vo"] = SCRIPT["lines"][b["id"]]["text"]
        lead = LEAD.get(b["id"], DEFAULT_LEAD)
        need = lead + int(np.ceil(len(a) / SR * FPS)) + TAIL.get(b["id"], DEFAULT_TAIL)
        b["duration"] = int(max(need, MIN_DUR.get(b["id"], 0)))
        b["voAt"] = lead
        b["words"] = [dict(w=w["w"], t=round(lead + w["start"] * FPS, 1)) for w in words]

    total = sum(b["duration"] for b in TL["beats"])
    vo = np.zeros(int(np.ceil(total / FPS * SR)), dtype=np.float32)
    t = 0
    for b in TL["beats"]:
        a, _ = lines[b["id"]]
        i = int(round((t + b["voAt"]) / FPS * SR))
        vo[i:i + len(a)] += a[: len(vo) - i]
        t += b["duration"]
    vo /= np.abs(vo).max() + 1e-9
    vo *= 0.9
    sf.write(os.path.join(ROOT, "public", "audio", "vo.wav"), vo, SR)
    TL["_comment"] = (
        "Fuente única de tiempos (fotogramas a 30 fps). La leen Remotion (src/timeline.ts) y scripts/gen_audio.py. "
        "scripts/gen_vo.py la reescribe a partir de la locución elegida: duración de cada escena, voAt y palabra→fotograma."
    )
    json.dump(TL, open(TL_PATH, "w"), ensure_ascii=False, indent=1)
    print(f"OK · {total} fotogramas · {total / FPS:.2f} s")


if __name__ == "__main__":
    cmd = sys.argv[1] if len(sys.argv) > 1 else "build"
    if cmd == "takes":
        takes(int(sys.argv[2]) if len(sys.argv) > 2 else 2)
    else:
        build()
