#!/usr/bin/env python3
"""
MOKTA · Locución TTS + re-sincronización de la timeline.

1. Sintetiza el texto de cada escena (src/voice.json) con Piper (voz neural local es_MX-claude-high, Apache-2.0).
2. Transcribe cada clip con Whisper (faster-whisper) para obtener el tiempo de cada palabra
   y verificar que se entiende (se imprime la transcripción junto al texto original).
3. Reescribe src/timeline.json: duración de cada escena y los 'beats' (golpes visuales) anclados
   a la palabra exacta en que la voz los dice.

Requisitos: pip install piper-tts faster-whisper scipy numpy
Salida: public/audio/voice/<escena>.wav (48 kHz mono) y public/audio/voice/words.json
Opción: --keep-audio  no sintetiza; usa los .wav existentes (otra voz) y solo re-sincroniza la timeline.
"""
import difflib
import json
import math
import os
import re
import unicodedata
import sys
import urllib.request
import wave

import numpy as np
from scipy.io import wavfile
from scipy.signal import resample_poly

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
V = json.load(open(os.path.join(ROOT, "src", "voice.json")))
TL_PATH = os.path.join(ROOT, "src", "timeline.json")
T = json.load(open(TL_PATH))
FPS = T["fps"]
GRID = 15  # fotogramas por pulso (120 BPM)
OUT = os.path.join(ROOT, "public", "audio", "voice")
CACHE = os.environ.get("MOKTA_TTS_CACHE", os.path.expanduser("~/.cache/mokta-tts"))
KEEP = "--keep-audio" in sys.argv  # no sintetizar: re-sincronizar con los .wav existentes
os.makedirs(OUT, exist_ok=True)
os.makedirs(CACHE, exist_ok=True)


# ---------------------------------------------------------------- 1) síntesis
def ensure_voice():
    base = os.path.join(CACHE, V["voice"])
    for ext in (".onnx", ".onnx.json"):
        if not os.path.exists(base + ext):
            print("descargando", V["voice"] + ext)
            urllib.request.urlretrieve(V["voiceUrl"] + V["voice"] + ext, base + ext)
    return base + ".onnx"


def synth(voice, text):
    from piper import SynthesisConfig

    cfg = SynthesisConfig(length_scale=V["lengthScale"], noise_scale=V["noiseScale"], noise_w_scale=V["noiseW"])
    # pronunciaciones corregidas (fonemas IPA entre [[ ]])
    for word, ph in V.get("pronunciations", {}).items():
        text = re.sub(rf"(?<![\wáéíóúñ]){re.escape(word)}(?![\wáéíóúñ])", ph, text, flags=re.IGNORECASE)
    chunks = list(voice.synthesize(text, syn_config=cfg))
    sr = chunks[0].sample_rate
    gap = np.zeros(int(V.get("sentenceGap", 0.14) * sr))
    parts = []
    for c in chunks:  # una parte por oración: se recortan sus silencios y se unen con una pausa fija
        y = c.audio_float_array.astype(np.float64)
        env = np.abs(y)
        nz = np.where(env > 10 ** (-42 / 20) * np.max(env))[0]
        if len(nz) == 0:
            continue
        y = y[max(0, nz[0] - int(0.01 * sr)) : min(len(y), nz[-1] + int(0.05 * sr))]
        parts += [y, gap]
    x = np.concatenate(parts[:-1])
    x = resample_poly(x, 48000, sr)  # 22,05 kHz → 48 kHz
    return x / (np.max(np.abs(x)) + 1e-9) * 0.9


def save_wav(path, x, sr=48000):
    with wave.open(path, "wb") as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(sr)
        w.writeframes((np.clip(x, -1, 1) * 32767).astype(np.int16).tobytes())


# ---------------------------------------------------------------- 2) tiempos por palabra
def norm(s):
    s = unicodedata.normalize("NFD", s.lower())
    s = "".join(c for c in s if unicodedata.category(c) != "Mn")
    return re.sub(r"[^a-z0-9ñ ]+", " ", s).split()


NUM = {"90": "noventa", "%": "por ciento", "2": "dos", "1": "uno", "3": "tres", "4": "cuatro"}


def phon(tokens):
    """Tokens → forma "fonética" del español de Chile para comparar lo dicho con lo oído."""
    out = []
    for t in tokens:
        t = re.sub(r"c(?=[ei])", "s", t).replace("z", "s").replace("v", "b").replace("ll", "y").replace("h", "")
        out.append(t)
    return out


def score(text, heard):
    a = phon(norm(text))
    h = " ".join(NUM.get(w, w) for w in heard.replace("%", " % ").split())
    b = phon(norm(h))
    return difflib.SequenceMatcher(None, a, b, autojunk=False).ratio()


def word_times(model, x, text):
    audio16 = resample_poly(x, 16000, 48000).astype(np.float32)
    segs, _ = model.transcribe(audio16, language="es", word_timestamps=True, beam_size=5)
    wh = [(w.word, w.start, w.end) for s in segs for w in s.words]
    heard = " ".join(w for w, _, _ in wh).strip()
    wtok, wt = [], []
    for w, s0, s1 in wh:
        toks = norm(w)
        for k, t in enumerate(toks):  # "90%" → varios tokens comparten tiempo
            wtok.append(t)
            wt.append((s0 + (s1 - s0) * k / max(1, len(toks)), s1))
    otok = norm(text)
    times = [None] * len(otok)
    for blk in difflib.SequenceMatcher(None, otok, wtok, autojunk=False).get_matching_blocks():
        for k in range(blk.size):
            times[blk.a + k] = wt[blk.b + k]
    # interpolar las palabras que Whisper no reconoció igual
    known = [i for i, t in enumerate(times) if t is not None]
    for i in range(len(times)):
        if times[i] is None:
            prev = max([k for k in known if k < i], default=None)
            nxt = min([k for k in known if k > i], default=None)
            t0 = times[prev][1] if prev is not None else 0.0
            t1 = times[nxt][0] if nxt is not None else len(x) / 48000
            n_gap = (nxt if nxt is not None else len(times)) - (prev if prev is not None else -1) - 1
            j = i - (prev if prev is not None else -1) - 1
            s = t0 + (t1 - t0) * j / max(1, n_gap)
            times[i] = (s, t0 + (t1 - t0) * (j + 1) / max(1, n_gap))
    matched = len(known) / max(1, len(otok))
    return otok, times, heard, matched


def onsets(x, sr=48000):
    """Inicios de habla tras un silencio ≥ 120 ms (pausas entre oraciones; Whisper puede errar ±0,4 s ahí)."""
    hop = sr // 100
    env = np.sqrt(np.convolve(x**2, np.ones(hop) / hop, "same"))[::hop]
    silent = env < np.max(env) * 10 ** (-38 / 20)
    out, run = [], 0
    for i, sl in enumerate(silent):
        if sl:
            run += 1
        else:
            if run >= 12:
                out.append(i / 100)
            run = 0
    return out


def anchor(otok, times, phrase, text, ons):
    p = norm(phrase)
    for i in range(len(otok) - len(p) + 1):
        if otok[i : i + len(p)] == p:
            t = times[i][0]
            # si la frase empieza una oración (tras . ? !), se ajusta al inicio real de la voz después de la pausa
            m = re.search(r"[.?!]\s*[¿¡]?" + re.escape(phrase.split()[0]), text, re.IGNORECASE)
            if m and ons:
                o = min(ons, key=lambda o: abs(o - t))
                if abs(o - t) <= 0.6:
                    t = o
            return t
    raise SystemExit(f"Ancla no encontrada: '{phrase}'")


# ---------------------------------------------------------------- 3) re-sincronización
def ceil_grid(fr):
    return int(math.ceil(fr / GRID) * GRID)


def retime(scene, info):
    sid = scene["id"]
    st = V["scenes"][sid]["start"]
    b = dict(scene["beats"])
    F = lambda t: st + int(round(t * FPS))  # noqa: E731
    for name, (phrase, off) in V["scenes"][sid]["anchors"].items():
        b[name] = F(anchor(info["tok"], info["times"], phrase, V["scenes"][sid]["text"], info["ons"])) + off
    vo_end = st + int(math.ceil(info["dur"] * FPS))
    if sid == "hook":
        need = max(vo_end + 6, b["c2"] + 34)
    elif sid == "define":
        b["diagram"] = max(18, b["intake"] - 15)
        need = max(vo_end + 8, b["loop"] + 40)
    elif sid == "winter":
        b["co2"] = b["fogged"] + 10
        need = max(vo_end + 8, b["co2"] + 28)
    elif sid == "summer":
        need = max(vo_end + 8, b["fuel"] + 62)
    elif sid == "rule":
        b["flipHit"] = b["flip"] + 10
        b["notes"] = max(b["hot"] + 24, vo_end - 8)
        b["save"] = b["notes"] + 26
        need = max(vo_end + 8, b["save"] + 32)
    elif sid == "recipe":
        b["rear"] = b["done"] + 10
        need = max(vo_end + 8, b["rear"] + 40)
    elif sid == "cta":
        b["save"] = b["comment"] + 20
        b["share"] = b["save"] + 14
        b["brand"] = b["share"] + 16
        need = max(vo_end + 10, b["brand"] + 26)
    scene["beats"] = b
    scene["duration"] = ceil_grid(need)
    return vo_end


def dump_timeline(t):
    """JSON legible: beats y cues de cada escena en una sola línea."""
    lines = ["{", f'  "_comment": {json.dumps(t["_comment"], ensure_ascii=False)},', f'  "fps": {t["fps"]},', f'  "bpm": {t["bpm"]},', '  "scenes": [']
    for i, s in enumerate(t["scenes"]):
        beats = ", ".join(f'"{k}": {v}' for k, v in s["beats"].items())
        cues = json.dumps(s["cues"], ensure_ascii=False).replace('],[', '], [').replace('","', '", "').replace(',"', ', "')
        lines += [
            "    {",
            f'      "id": "{s["id"]}",',
            f'      "duration": {s["duration"]},',
            f'      "music": "{s["music"]}",',
            f'      "beats": {{ {beats} }},',
            f'      "cues": {cues}',
            "    }" + ("," if i < len(t["scenes"]) - 1 else ""),
        ]
    lines += ["  ]", "}", ""]
    open(TL_PATH, "w").write("\n".join(lines))


def main():
    from faster_whisper import WhisperModel
    from piper import PiperVoice

    voice = None if KEEP else PiperVoice.load(ensure_voice())
    model = WhisperModel(os.environ.get("WHISPER_MODEL", "small"), device="cpu", compute_type="int8", download_root=os.path.join(CACHE, "whisper"))
    report = {}
    for s in T["scenes"]:
        sid = s["id"]
        text = V["scenes"][sid]["text"]
        best = None
        if KEEP:  # usar el audio ya existente (p. ej. otra voz grabada aparte): solo medir y re-sincronizar
            vsr, raw = wavfile.read(os.path.join(OUT, f"{sid}.wav"))
            x = raw.astype(np.float64) / 32768
            x = resample_poly(x, 48000, vsr) if vsr != 48000 else x
            tok, times, heard, matched = word_times(model, x, text)
            best = (score(text, heard), x, tok, times, heard, matched)
        for take in range(0 if KEEP else V.get("takes", 5)):  # la voz varía en cada toma: se elige la que mejor se entiende
            x = synth(voice, text)
            tok, times, heard, matched = word_times(model, x, text)
            sc = score(text, heard)
            if best is None or sc > best[0] + 1e-6 or (abs(sc - best[0]) < 1e-6 and len(x) < len(best[1])):
                best = (sc, x, tok, times, heard, matched)
            if sc >= 0.999:
                break
        sc, x, tok, times, heard, matched = best
        save_wav(os.path.join(OUT, f"{sid}.wav"), x)
        info = dict(tok=tok, times=times, dur=len(x) / 48000, ons=onsets(x))
        vo_end = retime(s, info)
        report[sid] = dict(start=V["scenes"][sid]["start"], dur=round(info["dur"], 3), text=text, heard=heard, intelligibility=round(sc, 3), words=[[w, round(a, 3), round(b_, 3)] for w, (a, b_) in zip(tok, times)])
        print(f"{sid:7s} voz {info['dur']:5.2f}s  fin f{vo_end:4d}  escena {s['duration']:4d}f  inteligibilidad {sc:4.0%}")
        print(f"        dicho:  {text}\n        oído:   {heard}")
    dump_timeline(T)
    json.dump(report, open(os.path.join(OUT, "words.json"), "w"), ensure_ascii=False, indent=1)
    total = sum(s["duration"] for s in T["scenes"])
    print(f"TOTAL {total} fotogramas = {total / FPS:.2f} s")


if __name__ == "__main__":
    main()
