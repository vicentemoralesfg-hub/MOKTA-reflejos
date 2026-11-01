#!/usr/bin/env python3
"""
Locución v3: UNA sola voz para todo el video (Qwen3-TTS, Apache 2.0).

  python3 scripts/gen_vo.py design [N]   → diseña N voces candidatas (VoiceDesign) con la misma descripción
                                           y elige la referencia: public/audio/vo_ref/ref.wav
  python3 scripts/gen_vo.py takes [N]    → clona esa referencia (modelo Base) en cada frase, N tomas
  python3 scripts/gen_vo.py build        → elige tomas con controles estrictos de consistencia y sincroniza:
                                           src/timeline.json + public/audio/vo.wav

Por qué clonar: en la v2 cada frase se "diseñaba" de nuevo y el tono medio variaba de 115 a 236 Hz entre frases
(sonaban como personas distintas). Clonando una única referencia, todas las frases comparten timbre.

Controles (no se puede escuchar aquí, así que se mide):
  - Tono medio de cada toma dentro de ±1,5 semitonos del de la referencia (misma persona, mismo registro).
  - Similitud de timbre con la referencia (Resemblyzer), la más alta posible.
  - Cero errores de transcripción (Whisper) contra el guion.
  - Mismo ritmo en todo el video: un único factor de tempo global (Rubber Band), nunca uno por frase.

Requisitos: pip install qwen-tts faster-whisper resemblyzer praat-parselmouth num2words; torch/torchaudio CPU emparejados; rubberband-cli.
"""
import json
import os
import re
import subprocess
import sys
import tempfile
import unicodedata

import numpy as np
import soundfile as sf
from scipy.signal import resample_poly

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
TL_PATH = os.path.join(ROOT, "src", "timeline.json")
SCRIPT = json.load(open(os.path.join(ROOT, "scripts", "vo_script.json")))
REF_DIR = os.path.join(ROOT, "public", "audio", "vo_ref")
TAKES_DIR = os.path.join(ROOT, "public", "audio", "vo_takes")
SR = 48000

LEAD = {"hook": 2}
DEFAULT_LEAD = 3
TAIL = {"para": 6, "teaser": 6, "horas": 8, "correcto": 8, "escarcha": 8, "cta": 36}
DEFAULT_TAIL = 5
MIN_DUR = {"para": 60, "cta": 110}
MAX_PAUSE = {"para": 0.45, "correcto": 0.32}
DEFAULT_MAX_PAUSE = 0.25
TARGET_WPS = 3.1     # ritmo objetivo global (palabras/s): claro pero ágil
MAX_TEMPO = 1.15     # factor global máximo (igual para todas las frases)
F0_TOL_ST = 1.5      # tolerancia de tono medio respecto de la referencia


# ---------------------------------------------------------------- medición
def norm_words(s):
    from num2words import num2words

    s = re.sub(r"\d+", lambda m: " " + num2words(int(m.group()), lang="es") + " ", s)
    s = unicodedata.normalize("NFD", s.lower())
    s = "".join(c for c in s if unicodedata.category(c) != "Mn")
    s = "".join(c if c.isalnum() or c == " " else " " for c in s)
    return s.replace("v", "b").split()


def wer(ref, hyp):
    r, h = norm_words(ref), norm_words(hyp)
    d = np.zeros((len(r) + 1, len(h) + 1), dtype=int)
    d[:, 0] = np.arange(len(r) + 1)
    d[0, :] = np.arange(len(h) + 1)
    for i in range(1, len(r) + 1):
        for j in range(1, len(h) + 1):
            d[i, j] = min(d[i - 1, j] + 1, d[i, j - 1] + 1, d[i - 1, j - 1] + (r[i - 1] != h[j - 1]))
    return d[len(r), len(h)] / max(1, len(r))


def load(path, sr_out):
    a, sr = sf.read(path, dtype="float32")
    if a.ndim > 1:
        a = a.mean(1)
    from math import gcd

    g = gcd(sr, sr_out)
    return resample_poly(a, sr_out // g, sr // g).astype(np.float32)


def voice_stats(a16):
    import parselmouth

    snd = parselmouth.Sound(a16.astype(np.float64), 16000)
    f0 = snd.to_pitch(time_step=0.01, pitch_floor=65, pitch_ceiling=400).selected_array["frequency"]
    f0 = f0[f0 > 0]
    med = float(np.median(f0)) if len(f0) else 0.0
    sd = float(np.std(12 * np.log2(f0 / med))) if len(f0) > 10 else 0.0
    hnr = snd.to_harmonicity_cc(time_step=0.01, minimum_pitch=65).values
    hnr = float(np.mean(hnr[hnr > -50])) if np.any(hnr > -50) else 0.0
    return med, sd, hnr


class Meter:
    def __init__(self):
        from faster_whisper import WhisperModel
        from resemblyzer import VoiceEncoder

        self.asr = WhisperModel("small", device="cpu", compute_type="int8")
        self.enc = VoiceEncoder("cpu")

    def text(self, a16, prompt=None, words=False):
        segs, _ = self.asr.transcribe(a16, language="es", word_timestamps=words, initial_prompt=prompt)
        segs = list(segs)
        if words:
            return [dict(w=w.word.strip(), start=float(w.start)) for s in segs for w in s.words]
        return " ".join(s.text for s in segs)

    def emb(self, a16):
        from resemblyzer import preprocess_wav

        e = self.enc.embed_utterance(preprocess_wav(a16, source_sr=16000))
        return e / np.linalg.norm(e)


def model(kind):
    import torch
    from qwen_tts import Qwen3TTSModel

    torch.set_num_threads(os.cpu_count() or 4)
    return Qwen3TTSModel.from_pretrained(f"Qwen/Qwen3-TTS-12Hz-1.7B-{kind}", device_map="cpu", dtype=torch.float32)


# ---------------------------------------------------------------- 1) diseñar la voz
def design(n):
    import torch

    os.makedirs(REF_DIR, exist_ok=True)
    m = model("VoiceDesign")
    for k in range(n):
        p = os.path.join(REF_DIR, f"cand_{k}.wav")
        if os.path.exists(p):
            continue
        torch.manual_seed(500 + k)
        wavs, sr = m.generate_voice_design(text=SCRIPT["ref_text"], language="Spanish", instruct=SCRIPT["voice"])
        sf.write(p, wavs[0], sr)
        print(f"candidata {k}: {len(wavs[0]) / sr:.2f} s", flush=True)
    del m
    meter = Meter()
    rows = []
    for k in range(n):
        a16 = load(os.path.join(REF_DIR, f"cand_{k}.wav"), 16000)
        hyp = meter.text(a16)
        med, sd, hnr = voice_stats(a16)
        wps = len(norm_words(SCRIPT["ref_text"])) / (len(a16) / 16000)
        rows.append(dict(k=k, wer=wer(SCRIPT["ref_text"], hyp), med=med, sd=sd, hnr=hnr, wps=wps, hyp=hyp))
    lo, hi = SCRIPT["f0_range_hz"]
    ok = [r for r in rows if r["wer"] == min(x["wer"] for x in rows)]
    ok2 = [r for r in ok if lo <= r["med"] <= hi] or ok
    # voz atrapante y clara: más armónica (HNR), más dinámica (variación de tono), ritmo cercano a 3 pal/s
    best = max(ok2, key=lambda r: r["hnr"] * 0.15 + min(r["sd"], 6) * 0.5 - abs(r["wps"] - 3.0) * 0.6)
    lines = []
    for r in rows:
        lines.append(
            f"cand {r['k']} {'◀' if r is best else ' '} WER {r['wer']:.2f}  tono {r['med']:.0f} Hz  ±{r['sd']:.2f} st  "
            f"HNR {r['hnr']:.1f} dB  {r['wps']:.2f} pal/s | {r['hyp'].strip()}"
        )
    print("\n".join(lines))
    open(os.path.join(REF_DIR, "seleccion.txt"), "w").write("\n".join(lines) + "\n")
    a = load(os.path.join(REF_DIR, f"cand_{best['k']}.wav"), 24000)
    sf.write(os.path.join(REF_DIR, "ref.wav"), a, 24000)
    json.dump(dict(k=best["k"], f0=best["med"], text=SCRIPT["ref_text"]), open(os.path.join(REF_DIR, "ref.json"), "w"), indent=1)


# ---------------------------------------------------------------- 2) clonar en cada frase
def takes(n, only=None):
    import torch

    os.makedirs(TAKES_DIR, exist_ok=True)
    m = model("Base")
    ref = json.load(open(os.path.join(REF_DIR, "ref.json")))
    prompt = m.create_voice_clone_prompt(ref_audio=os.path.join(REF_DIR, "ref.wav"), ref_text=ref["text"])
    ids = [b["id"] for b in json.load(open(TL_PATH))["beats"] if not only or b["id"] in only]
    for k in range(n):
        for bid in ids:
            p = os.path.join(TAKES_DIR, f"{bid}_{k}.wav")
            if os.path.exists(p):
                continue
            torch.manual_seed(2000 + k * 37 + ids.index(bid))
            wavs, sr = m.generate_voice_clone(text=SCRIPT["lines"][bid]["text"], language="Spanish", voice_clone_prompt=prompt)
            sf.write(p, wavs[0], sr)
            print(f"toma {k} {bid}: {len(wavs[0]) / sr:.2f} s", flush=True)


# ---------------------------------------------------------------- 3) elegir, ajustar y sincronizar
def trim(a, sr, pad=0.05, pad_end=0.12):
    env = np.convolve(np.abs(a), np.ones(int(0.01 * sr)) / (0.01 * sr), mode="same")
    idx = np.where(env > env.max() * 10 ** (-42 / 20))[0]
    if len(idx) == 0:
        return a
    return a[max(0, idx[0] - int(pad * sr)): min(len(a), idx[-1] + int(pad_end * sr))]


def cap_pauses(a, sr, max_pause, hop=240):
    n = len(a) // hop
    env = np.array([np.sqrt(np.mean(a[i * hop:(i + 1) * hop] ** 2)) for i in range(n)])
    quiet = env < env.max() * 10 ** (-38 / 20)
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


def stretch(a, sr, tempo):
    if tempo < 1.01:
        return a
    with tempfile.TemporaryDirectory() as d:
        i, o = os.path.join(d, "i.wav"), os.path.join(d, "o.wav")
        sf.write(i, a, sr)
        subprocess.run(["rubberband", "--fine", "-T", f"{tempo:.4f}", i, o], check=True, capture_output=True)
        b, _ = sf.read(o, dtype="float32")
    return b.astype(np.float32)


def speech_rms(a):
    hop = 480
    r = np.array([np.sqrt(np.mean(a[i * hop:(i + 1) * hop] ** 2)) for i in range(len(a) // hop)])
    r = r[r > r.max() * 0.1]
    return float(np.sqrt(np.mean(r ** 2))) if len(r) else 1e-3


def build():
    TL = json.load(open(TL_PATH))
    FPS = TL["fps"]
    ref = json.load(open(os.path.join(REF_DIR, "ref.json")))
    meter = Meter()
    ref_emb = meter.emb(load(os.path.join(REF_DIR, "ref.wav"), 16000))
    info = []
    for f in sorted(x for x in os.listdir(TAKES_DIR) if x.endswith(".wav")):
        bid, k = f[:-4].rsplit("_", 1)
        a16 = load(os.path.join(TAKES_DIR, f), 16000)
        hyp = meter.text(a16)
        med, sd, hnr = voice_stats(a16)
        info.append(dict(file=f, bid=bid, k=int(k), wer=wer(SCRIPT["lines"][bid]["text"], hyp), hyp=hyp, med=med, sd=sd, hnr=hnr,
                         sim=float(np.dot(meter.emb(a16), ref_emb)), dt=abs(12 * np.log2(med / ref["f0"])), dur=len(a16) / 16000))
    report, chosen = [], {}
    for b in TL["beats"]:
        cand = [c for c in info if c["bid"] == b["id"]]
        best_wer = min(c["wer"] for c in cand)
        ok = [c for c in cand if c["wer"] <= best_wer + 1e-9]
        same = [c for c in ok if c["dt"] <= F0_TOL_ST] or sorted(ok, key=lambda c: c["dt"])[:1]
        pick = max(same, key=lambda c: c["sim"] * 4 + min(c["sd"], 6) * 0.08 + c["hnr"] * 0.02)
        chosen[b["id"]] = pick
        for c in sorted(cand, key=lambda c: c["k"]):
            report.append(
                f"{b['id']:<11} toma {c['k']} {'◀' if c is pick else ' '} WER {c['wer']:.2f}  timbre {c['sim']:.3f}  "
                f"tono {c['med']:.0f} Hz (Δ{c['dt']:.1f} st)  ±{c['sd']:.2f} st  {c['dur']:.2f}s | {c['hyp'].strip()}"
            )
    print("\n".join(report))
    open(os.path.join(TAKES_DIR, "seleccion.txt"), "w").write("\n".join(report) + "\n")

    # recorte + pausas; luego UN factor de tempo global para que todo el video tenga el mismo ritmo
    raw = {}
    for b in TL["beats"]:
        a = load(os.path.join(TAKES_DIR, chosen[b["id"]]["file"]), SR)
        raw[b["id"]] = cap_pauses(trim(a, SR), SR, MAX_PAUSE.get(b["id"], DEFAULT_MAX_PAUSE))
    n_words = sum(len(norm_words(SCRIPT["lines"][i]["text"])) for i in raw)
    secs = sum(len(a) / SR for a in raw.values())
    tempo = float(np.clip(TARGET_WPS / (n_words / secs), 1.0, MAX_TEMPO))
    print(f"ritmo natural {n_words / secs:.2f} pal/s → factor global ×{tempo:.3f}")
    lines, target = {}, None
    for b in TL["beats"]:
        a = stretch(raw[b["id"]], SR, tempo)
        r = speech_rms(a)
        target = target or r
        a = a * (target / r)
        words = meter.text(resample_poly(a, 1, 3).astype(np.float32), prompt=SCRIPT["lines"][b["id"]]["text"], words=True)
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
    n = int(sys.argv[2]) if len(sys.argv) > 2 else 2
    if cmd == "design":
        design(n)
    elif cmd == "takes":
        takes(n, sys.argv[3:] or None)
    else:
        build()
