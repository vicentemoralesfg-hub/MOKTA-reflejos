#!/usr/bin/env python3
"""
Edición de la locución (ElevenLabs, voz Wl3O9lmFSMgGFTTwuS6f, toma A).

1. Acorta los silencios entre frases (ritmo de reel) con fundidos cortos.
2. Acelera un 9 % sin cambiar el tono (rubberband).
3. Re-mapea los tiempos por palabra de la transcripción al audio editado.

Entrada:  source/vo_tomaA.mp3 + source/vo_tomaA_words.json
Salida:   public/audio/vo.wav (48 kHz mono) + src/vo_words.json (tiempos finales, s)
"""
import json
import os
import subprocess
import tempfile

import numpy as np
from scipy.io import wavfile

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SR = 48000
TEMPO = 1.09
LEAD_IN = 0.08  # s antes de la primera palabra (el gancho arranca casi en el fotograma 0)

# Pausa máxima que se conserva según lo que termina la palabra anterior (s, antes del tempo)
CAP_SENTENCE = 0.18
CAP_COMMA = 0.11
# Pausas deliberadas (beats visuales): palabra que precede a la pausa -> pausa
CAP_OVERRIDE = {
    "ti.": 0.34,          # CLICK de la palanca
    "funciona?": 0.26,    # cambio a diagrama
    "luz.": 0.26,
    "estaba.": 0.24,      # antes del CTA
    "palanca.": 0.22,
}

src = os.path.join(ROOT, "source", "vo_tomaA.mp3")
words = [w for w in json.load(open(os.path.join(ROOT, "source", "vo_tomaA_words.json")))["words"]
         if w["type"] == "word" and not w["text"].startswith("[")]


def decode(path):
    with tempfile.TemporaryDirectory() as td:
        out = os.path.join(td, "a.wav")
        subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", path, "-ac", "1", "-ar", str(SR),
                        "-c:a", "pcm_f32le", out], check=True)
        sr, x = wavfile.read(out)
    return x.astype(np.float64)


x = decode(src)

# ------------------------------------------------------------ silencios reales (energía)
hop = int(0.005 * SR)
win = int(0.020 * SR)
n_frames = (len(x) - win) // hop
rms = np.array([np.sqrt(np.mean(x[i * hop:i * hop + win] ** 2) + 1e-12) for i in range(n_frames)])
db = 20 * np.log10(rms)
silent = db < -37


def silence_between(t0, t1):
    """Mayor tramo silencioso dentro de [t0, t1] (s)."""
    a, b = int(t0 * SR / hop), int(t1 * SR / hop)
    best, cur_start = None, None
    for i in range(a, min(b, n_frames)):
        if silent[i]:
            if cur_start is None:
                cur_start = i
        else:
            if cur_start is not None:
                seg = (cur_start, i)
                if best is None or seg[1] - seg[0] > best[1] - best[0]:
                    best = seg
                cur_start = None
    if cur_start is not None:
        seg = (cur_start, min(b, n_frames))
        if best is None or seg[1] - seg[0] > best[1] - best[0]:
            best = seg
    if best is None:
        return None
    return best[0] * hop / SR + win / SR / 2, best[1] * hop / SR + win / SR / 2


# ------------------------------------------------------------ cortes
cuts = []  # (inicio, fin) del tramo que se elimina, en tiempo original
for w, nxt in zip(words[:-1], words[1:]):
    gap = silence_between(w["end"] - 0.12, nxt["start"] + 0.12)
    if gap is None:
        continue
    s, e = gap
    d = e - s
    t = w["text"]
    cap = CAP_OVERRIDE.get(t, CAP_SENTENCE if t[-1] in ".?!:" else CAP_COMMA)
    if d > cap + 0.03:
        keep = cap / 2
        cuts.append((s + keep, e - keep))

# recorte inicial / final
first_on = words[0]["start"]
head = silence_between(0, first_on + 0.1)
start_at = max(0.0, (head[1] if head and head[0] < 0.02 else 0.0) - LEAD_IN)
end_at = min(len(x) / SR, words[-1]["end"] + 0.35)

# ------------------------------------------------------------ ensamblado con fundidos de 12 ms
fade = int(0.012 * SR)
segments = []
cursor = start_at
for a, b in cuts:
    segments.append((cursor, a))
    cursor = b
segments.append((cursor, end_at))

out = np.zeros(0)
time_map = []  # (t_original, t_editado)
for a, b in segments:
    seg = x[int(a * SR):int(b * SR)].copy()
    if len(out) and len(seg) > 2 * fade:
        ramp = np.linspace(0, 1, fade)
        seg[:fade] *= ramp
        tail = out[-fade:] * ramp[::-1]
        out = np.concatenate([out[:-fade], tail + seg[:fade], seg[fade:]])
        t_new = (len(out) - len(seg) + fade) / SR - fade / SR
    else:
        t_new = len(out) / SR
        out = np.concatenate([out, seg])
    time_map.append((a, t_new, b))


def remap(t):
    for a, tn, b in time_map:
        if a - 1e-6 <= t <= b + 1e-6:
            return tn + (t - a)
    # dentro de un tramo eliminado: se pega al inicio del siguiente
    for a, tn, b in time_map:
        if t < a:
            return tn
    a, tn, b = time_map[-1]
    return tn + (b - a)


# ------------------------------------------------------------ tempo (rubberband, tono intacto)
with tempfile.TemporaryDirectory() as td:
    pre = os.path.join(td, "pre.wav")
    wavfile.write(pre, SR, (out / max(1e-9, np.abs(out).max()) * 0.89).astype(np.float32))
    final = os.path.join(ROOT, "public", "audio", "vo.wav")
    os.makedirs(os.path.dirname(final), exist_ok=True)
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", pre,
                    "-af", f"rubberband=tempo={TEMPO}:transients=crisp:formant=preserved,"
                           "highpass=f=70,acompressor=threshold=-20dB:ratio=2.5:attack=8:release=120:makeup=2",
                    "-ar", str(SR), "-ac", "1", "-c:a", "pcm_s16le", final], check=True)

final_words = []
for w in words:
    final_words.append({
        "text": w["text"],
        "start": round(remap(w["start"]) / TEMPO, 3),
        "end": round(remap(w["end"]) / TEMPO, 3),
    })

dur = float(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0",
                            os.path.join(ROOT, "public", "audio", "vo.wav")],
                           capture_output=True, text=True).stdout)
json.dump({"durationS": round(dur, 3), "tempo": TEMPO, "words": final_words},
          open(os.path.join(ROOT, "src", "vo_words.json"), "w"), ensure_ascii=False, indent=1)
print(f"cortes: {len(cuts)}  eliminado: {sum(b - a for a, b in cuts):.2f}s  duración final: {dur:.2f}s")
for i, w in enumerate(final_words):
    print(i, w["text"], w["start"], w["end"])
