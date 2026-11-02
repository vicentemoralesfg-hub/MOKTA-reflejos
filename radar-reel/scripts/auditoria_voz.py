#!/usr/bin/env python3
"""
Auditoría crítica de la locución (Qwen3-TTS): ¿se entiende, transmite la emoción de cada momento y
mantiene la atención? Mide los tramos de out/qwen contra lo que el guion pide y, si se le pasa el video
final, revisa también arranque, duración, planos y la transcripción con música y efectos.

Uso: /root/qwen-venv/bin/python scripts/auditoria_voz.py [video.mp4]
"""
import json
import math
import os
import subprocess
import sys

import numpy as np
import scipy.signal as sg
import soundfile as sf

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(ROOT, "scripts"))
from guion import LINES, TAKES  # noqa: E402

# Por bloque (TAKES): (qué debe transmitir, sílabas/s mín–máx, rango tonal mínimo en semitonos)
CRITERIOS = [
    ("gancho: tenso y claro", 4.3, 6.8, 4.0),
    ("pregunta: curiosidad", 4.5, 6.8, 5.0),
    ("juego: emoción creciente", 4.5, 7.2, 5.0),
    ("revelación: asombro y énfasis", 3.0, 5.6, 5.0),
    ("magnitud: asombro, más calmo", 4.0, 6.5, 4.0),
    ("¿cómo?: intriga y respuesta firme", 4.3, 6.8, 5.0),
    ("explicación: atrapante", 4.5, 6.8, 4.0),
    ("remate: lento, grave, con peso", 3.0, 5.2, 4.0),
    ("giro: complicidad", 4.5, 6.8, 4.0),
    ("pregunta final: desafío", 4.0, 6.5, 5.0),
]
MAX_PAUSA = 0.45    # silencio interno máximo dentro de un tramo (s): más es "aire muerto"
# Silencios que la dirección de voz pide a propósito (tramo → máximo aceptado, s)
BEATS = {9: 0.55}   # "A esa distancia, … la patrulla ni siquiera es un punto"
MAX_ERROR = 0.12    # error de palabras de la transcripción
MIN_TIMBRE = 0.975  # similitud x-vector con el promedio (una voz distinta da ~0,96)


def f0(x, sr):
    fr, hop, out = int(0.04 * sr), int(0.01 * sr), []
    for i in range(0, len(x) - fr, hop):
        q = x[i:i + fr] - x[i:i + fr].mean()
        if np.sqrt((q ** 2).mean()) < 0.015:
            continue
        ac = np.correlate(q, q, "full")[fr - 1:]
        lo, hi = int(sr / 350), int(sr / 65)
        k = lo + np.argmax(ac[lo:hi])
        if ac[k] / ac[0] > 0.5:
            out.append(sr / k)
    return np.array(out)


def syllables(w):
    return max(1, sum(c in "aeiouáéíóú" for c in w.lower()))


def pauses(x, sr):
    hop = sr // 100
    n = len(x) // hop
    env = 20 * np.log10(np.sqrt((x[: n * hop].reshape(n, hop) ** 2).mean(axis=1)) + 1e-9)
    v = env > env.max() - 40
    out, i = [], 0
    while i < n:
        if not v[i]:
            j = i
            while j < n and not v[j]:
                j += 1
            if 0 < i and j < n:
                out.append((j - i) / 100)
            i = j
        else:
            i += 1
    return out


def main():
    timbre = {}
    tpath = os.path.join(ROOT, "out/qwen/timbre.json")
    if os.path.exists(tpath):
        timbre = json.load(open(tpath))
    L = []
    for li in range(len(LINES)):
        m = json.load(open(os.path.join(ROOT, f"out/qwen/linea_{li:02d}.json")))
        x, sr = sf.read(os.path.join(ROOT, f"out/qwen/linea_{li:02d}.wav"), dtype="float32")
        p = f0(sg.resample_poly(x, 16000, sr), 16000)
        L.append(dict(m=m, x=x, sr=sr, p=p, dur=len(x) / sr, syl=sum(syllables(w["text"]) for w in m["words"]),
                      rms=20 * np.log10(np.sqrt((x ** 2).mean()) + 1e-9), f0=float(np.median(p)) if len(p) else 0,
                      pauses=pauses(x, sr), sim=timbre.get(f"toma_{m.get('take', -1):02d}.wav", timbre.get(f"linea_{li:02d}.wav"))))
    # el volumen se mide como queda en el video: con la ganancia por tramo de cues.json
    segs = json.load(open(os.path.join(ROOT, "src/data/cues.json")))["voice"]["segments"]
    for li, l in enumerate(L):
        g = sum(len(x[0].split()) for x in LINES[:li])
        l["rms"] += next((s.get("gainDb", 0) for s in segs if s["from"] <= g <= s["to"]), 0)
    f0_med = float(np.median([l["f0"] for l in L]))
    rms_med = float(np.median([l["rms"] for l in L]))
    st = lambda f: 12 * math.log2(f / f0_med)  # noqa: E731

    print("TRAMOS")
    for li, l in enumerate(L):
        print(f"  {li:2d} {l['dur']:4.2f}s {l['syl'] / l['dur']:4.1f} síl/s · tono {st(l['f0']):+5.1f} st · {l['rms'] - rms_med:+5.1f} dB · "
              f"error {l['m']['wer']:3.0%} · timbre {l['sim'] if l['sim'] is not None else '—'} · {LINES[li][0][:52]}")

    print("\nBLOQUES (lo que pide cada momento del video)")
    fails = []
    for ti, (what, rmin, rmax, rng_min) in enumerate(CRITERIOS):
        ls = [L[i] for i in range(TAKES[ti][0], TAKES[ti][1] + 1)]
        rate = sum(l["syl"] for l in ls) / sum(l["dur"] for l in ls)
        p = np.concatenate([l["p"] for l in ls])
        rng = 12 * np.log2(np.percentile(p, 90) / np.percentile(p, 10))
        long_p = [round(g, 2) for i in range(TAKES[ti][0], TAKES[ti][1] + 1) for g in L[i]["pauses"]
                  if g > BEATS.get(i, MAX_PAUSA)]
        checks = {
            "se entiende": all(l["m"]["wer"] <= MAX_ERROR for l in ls),
            "ritmo": rmin <= rate <= rmax,
            "expresividad": rng >= rng_min,
            "sin aire muerto": not long_p,
            "mismo timbre": all(l["sim"] is None or l["sim"] >= MIN_TIMBRE for l in ls),
        }
        bad = [k for k, v in checks.items() if not v]
        fails += [f"bloque {ti}: {k}" for k in bad]
        print(f"  B{ti} {what:34s} {rate:4.1f} síl/s ({rmin}–{rmax}) · rango {rng:4.1f} st (≥{rng_min}) · "
              f"pausas>{MAX_PAUSA}s {long_p or 'no'}  {'OK' if not bad else '✗ ' + ', '.join(bad)}")

    print("\nARCO EMOCIONAL")
    arc = [
        ("la 2.ª suposición sube más que la 1.ª (¿1 km? > ¿300 m?)", L[6]["f0"] >= L[4]["f0"]),
        ("'¡Todavía más!' más arriba que '¡Más lejos!'", L[7]["f0"] > L[5]["f0"]),
        ("la revelación (3 km) suena más fuerte que el promedio", L[8]["rms"] >= rms_med),
        ("la revelación va más lenta que el juego", L[8]["syl"] / L[8]["dur"] < sum(L[i]["syl"] for i in range(4, 8)) / sum(L[i]["dur"] for i in range(4, 8))),
        ("el remate 'ya te midieron' es más grave que el promedio", L[16]["f0"] < f0_med),
        ("el remate va más lento que el promedio", L[16]["syl"] / L[16]["dur"] < np.median([l["syl"] / l["dur"] for l in L])),
        # en español solo las preguntas de sí/no suben; las de qué/cómo/cuándo bajan al final
        ("las suposiciones de sí/no suben (¿300 m? y ¿1 km? sobre el promedio)", L[4]["f0"] > f0_med and L[6]["f0"] > f0_med),
        ("la pregunta final de dos opciones no se apaga (volumen ≥ promedio − 3 dB)", L[20]["rms"] >= rms_med - 3),
    ]
    for what, ok in arc:
        print(f"  {'OK' if ok else '✗ '} {what}")
        if not ok:
            fails.append(f"arco: {what}")

    if len(sys.argv) > 1:
        video = sys.argv[1]
        cues = json.load(open(os.path.join(ROOT, "src/data/cues.json")))
        wd = json.load(open(os.path.join(ROOT, "src/data/words.json")))
        W, F = wd["words"], 30

        def ss(w):
            return 0 if w == 0 else max(math.floor((W[w]["start"] - 0.12) * F + 0.5), math.floor(W[w - 1]["end"] * F + 0.5))
        cuts = [ss(s["word"]) for s in cues["shots"]]
        lens = [(b - a) / F for a, b in zip(cuts, cuts[1:] + [wd["durationInFrames"]])]
        dur = wd["durationInFrames"] / F
        print(f"\nVIDEO\n  duración {dur:.1f} s (≤ 50 objetivo, ≤ 55 máximo) · primera palabra a los {W[0]['start']:.2f} s · "
              f"gancho completo a los {W[12]['end']:.2f} s · plano más largo {max(lens):.2f} s (≤ 2,5)")
        if dur > 55 or max(lens) > 2.5 or W[0]["start"] > 0.3:
            fails.append("video: duración, plano largo o arranque lento")
        from faster_whisper import WhisperModel
        pcm = subprocess.run(["ffmpeg", "-v", "error", "-i", video, "-ac", "1", "-ar", "16000", "-f", "f32le", "-"],
                             capture_output=True).stdout
        segs, _ = WhisperModel("small", device="cpu", compute_type="int8").transcribe(
            np.frombuffer(pcm, np.float32), language="es", beam_size=5)
        print("  transcripción de la mezcla final (música + efectos):\n    " + " ".join(s.text.strip() for s in segs))

    print(f"\nRESULTADO: {'sin problemas' if not fails else str(len(fails)) + ' problema(s)'}")
    for f in fails:
        print("  ✗", f)


if __name__ == "__main__":
    main()
