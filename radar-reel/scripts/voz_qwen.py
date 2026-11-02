#!/usr/bin/env python3
"""
Locución con Qwen3-TTS (modelos abiertos de Qwen, Apache 2.0), local en CPU.

Cada bloque del guion (scripts/guion.py → TAKES, varias frases seguidas) se genera de una vez con
VoiceDesign: la misma persona (QWEN_PERSONA, que fija el timbre) más la dirección de emoción de ese
momento del video (QWEN_EMOTION). Generar por bloques mantiene el timbre estable y la entonación
fluida (por frase suelta el registro salta entre tomas: lo mostró la auditoría).
Después:
  · se recortan los bordes y se acortan los silencios internos largos (aire muerto);
  · se transcribe (faster-whisper, palabras con tiempo) y se alinea con el guion; si no dice el texto
    (error > MAX_WER) se genera otra vez con otra semilla;
  · al unir, cada frontera entre frases se corta en el silencio real del audio; si la voz no hizo
    pausa ahí, las frases quedan unidas tal como las dijo (nunca se corta a mitad de palabra).
Salida: out/qwen/toma_XX.wav/.json · out/qwen/linea_XX.* (para la auditoría) · public/audio/voz_qwen.wav
        · scripts/words_qwen.json y cues.json → voice con una sola fuente "q".

Uso (entorno aislado con torch CPU + qwen-tts + faster-whisper):
  /root/qwen-venv/bin/python scripts/voz_qwen.py                  genera todo y une
  /root/qwen-venv/bin/python scripts/voz_qwen.py --solo 3,7       regenera solo esos bloques (no une)
  /root/qwen-venv/bin/python scripts/voz_qwen.py --unir           une los bloques ya generados
Modelos en $QWEN_MODELS (por defecto /root/qwen-models).
"""
import argparse
import difflib
import json
import os
import re
import subprocess
import sys
import tempfile
import time
import unicodedata

import numpy as np
import soundfile as sf
import torch

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from guion import LINES, QWEN_EMOTION, QWEN_PERSONA, TAKES, TOKENS  # noqa: E402

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MODELS = os.environ.get("QWEN_MODELS", "/root/qwen-models")
OUT = os.path.join(ROOT, "out/qwen")
MAX_WER = 0.12
TRIES = 3
JOIN = 0.4          # silencio entre bloques en la fuente (build_voice fija las pausas reales)
MIN_CUT = 0.10      # silencio mínimo para cortar entre dos frases
# Ajuste de mezcla por línea (dB): la pregunta final no puede apagarse, es la que invita a comentar
LINE_GAIN_DB = {len(LINES) - 1: 3.0}
MAX_INNER = 0.40    # silencio interno más largo que esto es aire muerto…
INNER_KEEP = 0.28   # …y se acorta a esto
# Solo limpieza: sin graves de sobra y compresión suave para que las partes en voz baja se entiendan
VOICE_FX = "highpass=f=70,acompressor=threshold=0.08:ratio=2.2:attack=10:release=150:makeup=1.6"
NUM = {"140": ["ciento", "cuarenta"], "300": ["trescientos"], "200": ["doscientos"], "3": ["tres"], "1": ["un"]}


def norm(w):
    w = unicodedata.normalize("NFD", w.lower())
    return re.sub(r"[^a-z0-9ñ]", "", "".join(c for c in w if unicodedata.category(c) != "Mn"))


def spoken(words):
    """Palabras de la transcripción comparables con el guion (los números en cifras vuelven a palabras)."""
    out = []
    for w in words:
        n = norm(w["text"])
        if n in NUM:
            parts = NUM[n]
            d = (w["end"] - w["start"]) / len(parts)
            out += [dict(text=p, start=w["start"] + d * k, end=w["start"] + d * (k + 1)) for k, p in enumerate(parts)]
        elif n:
            out.append(dict(text=n, start=w["start"], end=w["end"]))
    return out


def align(tokens, heard):
    a, b = [norm(t) for t in tokens], [h["text"] for h in heard]
    out, errors = [None] * len(tokens), 0
    for op, i0, i1, j0, j1 in difflib.SequenceMatcher(None, a, b, autojunk=False).get_opcodes():
        if op == "equal":
            for k in range(i1 - i0):
                out[i0 + k] = dict(start=heard[j0 + k]["start"], end=heard[j0 + k]["end"])
            continue
        errors += max(i1 - i0, j1 - j0)
        if op == "replace":
            t0, t1 = heard[j0]["start"], heard[j1 - 1]["end"]
            for k in range(i1 - i0):
                out[i0 + k] = dict(start=t0 + (t1 - t0) * k / (i1 - i0), end=t0 + (t1 - t0) * (k + 1) / (i1 - i0))
    for i in range(len(out)):
        if out[i] is None:
            prev = out[i - 1]["end"] if i else 0.0
            nxt = next((o["start"] for o in out[i + 1:] if o), prev + 0.25)
            out[i] = dict(start=prev, end=max(prev + 0.05, nxt))
    return out, errors / max(1, len(a))


def voiced(wav, sr):
    """Cuadros de 10 ms con voz (umbral relativo al pico; huecos < 60 ms de oclusivas cuentan como voz)."""
    hop = sr // 100
    n = len(wav) // hop
    env = 20 * np.log10(np.sqrt((wav[: n * hop].reshape(n, hop) ** 2).mean(axis=1)) + 1e-9)
    v = env > env.max() - 40
    i = 0
    while i < n:
        if not v[i]:
            j = i
            while j < n and not v[j]:
                j += 1
            if 0 < i and j < n and j - i < 6:
                v[i:j] = True
            i = j
        else:
            i += 1
    return v


def tidy(wav, sr):
    """Recorta los bordes en silencio y acorta los silencios internos largos (con fundidos de 10 ms)."""
    v = voiced(wav, sr)
    on = np.flatnonzero(v)
    a = max(0, on[0] * sr // 100 - int(0.03 * sr))
    b = min(len(wav), (on[-1] + 1) * sr // 100 + int(0.06 * sr))
    runs, i, n = [], 0, len(v)
    while i < n:
        if not v[i]:
            j = i
            while j < n and not v[j]:
                j += 1
            if on[0] < i and j <= on[-1] and (j - i) / 100 > MAX_INNER:
                runs.append((i, j))
            i = j
        else:
            i += 1
    keep, pos, cut = [], a, 0.0
    half = int(INNER_KEEP / 2 * sr)
    for i, j in runs:
        mid = (i + j) // 2 * sr // 100
        keep.append(wav[pos: mid - half])
        pos = mid + half
        cut += (j - i) / 100 - INNER_KEEP
    keep.append(wav[pos:b])
    f = int(0.01 * sr)
    out = keep[0]
    for k in keep[1:]:
        x = out[-f:] * np.linspace(1, 0, f) + k[:f] * np.linspace(0, 1, f)
        out = np.concatenate([out[:-f], x, k[f:]])
    return out.astype(np.float32), cut


_ASR = None


def asr():
    global _ASR
    if _ASR is None:
        from faster_whisper import WhisperModel
        _ASR = WhisperModel("small", device="cpu", compute_type="int8")
    return _ASR


def transcribe(wav, sr, text):
    a16 = subprocess.run(["ffmpeg", "-v", "error", "-f", "f32le", "-ar", str(sr), "-ac", "1", "-i", "-",
                          "-ar", "16000", "-f", "f32le", "-"], input=wav.tobytes(), capture_output=True).stdout
    segs, _ = asr().transcribe(np.frombuffer(a16, np.float32), language="es", word_timestamps=True, beam_size=5)
    heard = spoken([dict(text=w.word, start=w.start, end=w.end) for s in segs for w in s.words])
    times, wer = align(text.split(), heard)
    return times, wer, " ".join(h["text"] for h in heard)


def take_text(ti):
    return " ".join(LINES[i][0] for i in range(TAKES[ti][0], TAKES[ti][1] + 1))


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--solo", default="", help="bloques a generar, p. ej. 3,7")
    ap.add_argument("--semilla", type=int, default=7)
    ap.add_argument("--unir", action="store_true", help="solo une los bloques ya generados")
    ap.add_argument("--reordenar", action="store_true", help="con --unir: vuelve a recortar el aire muerto y alinear")
    args = ap.parse_args()
    if args.unir:
        if args.reordenar:
            for ti in range(len(TAKES)):
                meta = json.load(open(os.path.join(OUT, f"toma_{ti:02d}.json")))
                meta["tidy"] = False
                json.dump(meta, open(os.path.join(OUT, f"toma_{ti:02d}.json"), "w"), ensure_ascii=False, indent=1)
        return assemble()
    only = [int(x) for x in args.solo.split(",")] if args.solo else list(range(len(TAKES)))
    os.makedirs(OUT, exist_ok=True)
    torch.set_num_threads(os.cpu_count())
    from qwen_tts import Qwen3TTSModel

    design = Qwen3TTSModel.from_pretrained(f"{MODELS}/Qwen3-TTS-12Hz-1.7B-VoiceDesign", device_map="cpu",
                                           dtype=torch.bfloat16)
    for ti in only:
        text = take_text(ti)
        instruct = f"{QWEN_PERSONA} Delivery for this line: {QWEN_EMOTION[ti]}"
        best = None
        for attempt in range(TRIES):
            seed = args.semilla + 1000 * attempt + 100 * ti
            torch.manual_seed(seed)
            t0 = time.time()
            wavs, sr = design.generate_voice_design(text=text, language="Spanish", instruct=instruct)
            wav, cut = tidy(np.asarray(wavs[0], dtype=np.float32), sr)
            times, wer, heard = transcribe(wav, sr, text)
            missing = missing_pauses(ti, wav, sr, times)
            score = wer + 0.05 * len(missing)
            print(f"bloque {ti} intento {attempt} semilla {seed}: {len(wav) / sr:.2f}s en {time.time() - t0:.0f}s · "
                  f"error {wer:.0%} · sin pausa tras {missing or '—'} · aire muerto quitado {cut:.2f}s · oído: {heard}",
                  flush=True)
            if best is None or score < best["score"]:
                best = dict(wav=wav, sr=sr, times=times, wer=wer, seed=seed, heard=heard, score=score)
            if wer <= MAX_WER and not missing:
                break
        save_take(ti, best["wav"], best["sr"], text, best["times"], best["wer"], best["seed"], best["heard"], instruct)
    if not args.solo:
        assemble()


def missing_pauses(ti, wav, sr, times):
    """Fronteras entre frases del bloque donde la voz no hizo pausa (no se podrán controlar al montar)."""
    runs = silences(wav, sr)
    out, k = [], 0
    for li in range(TAKES[ti][0], TAKES[ti][1]):
        k += len(LINES[li][0].split())
        end, nxt = times[k - 1]["end"], times[k]["start"]
        if not any(a < nxt + 0.3 and b > end - 0.3 for a, b in runs):
            out.append(LINES[li][0].split()[-1])
    return out


def save_take(ti, wav, sr, text, times, wer, seed, heard, instruct):
    words = [dict(text=t, **tm) for t, tm in zip(text.split(), times)]
    words[0]["start"], words[-1]["end"] = 0.0, len(wav) / sr  # el archivo ya está recortado al borde de la voz
    sf.write(os.path.join(OUT, f"toma_{ti:02d}.wav"), wav, sr)
    json.dump(dict(text=text, sr=sr, seed=seed, wer=wer, heard=heard, instruct=instruct, tidy=True, words=words),
              open(os.path.join(OUT, f"toma_{ti:02d}.json"), "w"), ensure_ascii=False, indent=1)


def load_take(ti):
    meta = json.load(open(os.path.join(OUT, f"toma_{ti:02d}.json")))
    wav, sr = sf.read(os.path.join(OUT, f"toma_{ti:02d}.wav"), dtype="float32")
    if not meta.get("tidy"):  # tomas generadas antes del recorte de aire muerto
        wav, _ = tidy(wav, sr)
        times, wer, heard = transcribe(wav, sr, meta["text"])
        save_take(ti, wav, sr, meta["text"], times, wer, meta["seed"], heard, meta.get("instruct", ""))
        meta = json.load(open(os.path.join(OUT, f"toma_{ti:02d}.json")))
    return meta, wav, sr


def silences(wav, sr):
    v = voiced(wav, sr)
    out, i, n = [], 0, len(v)
    while i < n:
        if not v[i]:
            j = i
            while j < n and not v[j]:
                j += 1
            if 0 < i and j < n and (j - i) / 100 >= MIN_CUT:
                out.append((i / 100, j / 100))
            i = j
        else:
            i += 1
    return out


def assemble():
    pieces, words, segs, t, sr = [], [], [], 0.0, None
    cuts_ok, merged = 0, []
    for ti, (first, last, *_) in enumerate(TAKES):
        meta, wav, sr = load_take(ti)
        W = meta["words"]
        g0 = sum(len(LINES[i][0].split()) for i in range(first))
        runs = silences(wav, sr)
        seg_start, line_start = 0, 0
        for li in range(first, last + 1):
            e = line_start + len(LINES[li][0].split()) - 1
            if li < last:
                mid = (W[e]["end"] + W[e + 1]["start"]) / 2
                cand = [(abs((a + b) / 2 - mid), a, b) for a, b in runs
                        if a < W[e + 1]["start"] + 0.3 and b > W[e]["end"] - 0.3]
                if cand:
                    _, a, b = min(cand)
                    W[e]["end"], W[e + 1]["start"] = a + 0.02, b - 0.02
                    W[e]["start"] = min(W[e]["start"], W[e]["end"] - 0.08)
                    W[e + 1]["end"] = max(W[e + 1]["end"], W[e + 1]["start"] + 0.08)
                    segs.append(dict(src="q", **{"from": g0 + seg_start, "to": g0 + e}, gapAfter=LINES[li][1],
                                     **({"gainDb": LINE_GAIN_DB[li]} if li in LINE_GAIN_DB else {})))
                    seg_start = e + 1
                    cuts_ok += 1
                else:
                    merged.append(LINES[li][0])
            else:
                segs.append(dict(src="q", **{"from": g0 + seg_start, "to": g0 + e}, gapAfter=LINES[li][1],
                                 **({"gainDb": LINE_GAIN_DB[li]} if li in LINE_GAIN_DB else {})))
            # tramo de la línea para la auditoría
            a_t, b_t = W[line_start]["start"], W[e]["end"]
            seg = wav[int(a_t * sr): int(b_t * sr)]
            sf.write(os.path.join(OUT, f"linea_{li:02d}.wav"), seg, sr)
            json.dump(dict(text=LINES[li][0], take=ti, wer=meta["wer"],
                           words=[dict(text=w["text"], start=w["start"] - a_t, end=w["end"] - a_t) for w in W[line_start:e + 1]]),
                      open(os.path.join(OUT, f"linea_{li:02d}.json"), "w"), ensure_ascii=False, indent=1)
            line_start = e + 1
        for w in W:
            words.append(dict(text=w["text"], start=round(t + w["start"], 4), end=round(t + w["end"], 4)))
        pieces += [wav, np.zeros(int(JOIN * sr), np.float32)]
        t += (len(wav) + int(JOIN * sr)) / sr
    assert [w["text"] for w in words] == TOKENS
    with tempfile.TemporaryDirectory() as tmp:
        raw = os.path.join(tmp, "raw.wav")
        sf.write(raw, np.concatenate(pieces), sr)
        subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", raw, "-af", VOICE_FX, "-c:a", "pcm_s16le",
                        os.path.join(ROOT, "public/audio/voz_qwen.wav")], check=True)
    json.dump(words, open(os.path.join(ROOT, "scripts/words_qwen.json"), "w"), ensure_ascii=False, indent=1)

    path = os.path.join(ROOT, "src/data/cues.json")
    cues = json.load(open(path))
    cues["voice"].update(tempo=1.0, pre=0.0, post=0.0, segments=segs, sources={"q": dict(
        file="public/audio/voz_qwen.wav", words="scripts/words_qwen.json", gainDb=0,
        _nota="Qwen3-TTS 1.7B VoiceDesign: persona fija + emoción por bloque (guion.py); cortes en silencios reales")})
    json.dump(cues, open(path, "w"), ensure_ascii=False, indent=2)
    print(f"voz_qwen: {len(TAKES)} bloques · {len(words)} palabras · {cuts_ok} cortes en silencio · "
          f"frases unidas (sin pausa en la voz): {merged or 'ninguna'}")


if __name__ == "__main__":
    main()
