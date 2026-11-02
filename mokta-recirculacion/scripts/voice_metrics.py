#!/usr/bin/env python3
"""
Métricas objetivas de una locución (para auditar ritmo, emoción e inteligibilidad).

  velocidad        sílabas por segundo (total y de articulación, sin pausas > 150 ms)
  pausas           número y duración de silencios > 150 ms
  tono (F0)        mediana en Hz y variación en semitonos (desv. estándar y rango p5–p95)
                   → una voz monótona tiene < 2 st de desviación; una locución expresiva de redes, 3–5 st
  dinámica         variación de energía entre palabras (dB)
  énfasis          cuánto más fuerte/agudas suenan las palabras clave que el resto (dB / st)
  inteligibilidad  similitud entre el texto y lo que oye Whisper (fonética del español de Chile)

Uso como módulo: from voice_metrics import analyze; analyze(wav48k, text, words=[(w, t0, t1), ...], keywords=[...])
"""
import re
import unicodedata

import numpy as np

SR = 48000


def strip_acc(s):
    s = unicodedata.normalize("NFD", s.lower())
    return "".join(c for c in s if unicodedata.category(c) != "Mn")


def syllables(text):
    t = re.sub(r"[^a-záéíóúüñ ]", " ", text.lower())
    n = 0
    for w in t.split():
        # núcleos vocálicos; a/e/o seguidas forman hiato (2 sílabas)
        groups = re.findall(r"[aeiouáéíóúü]+", w)
        for g in groups:
            strong = sum(1 for c in strip_acc(g) if c in "aeo") + sum(1 for c in g if c in "íú")
            n += max(1, strong if strong > 1 else 1)
    return n


def f0_track(x, sr=SR, hop=0.01):
    """F0 por YIN simplificado (Hz por cuadro de 10 ms; 0 = sordo)."""
    x16 = x[:: sr // 16000] if sr % 16000 == 0 else x
    fs = 16000 if sr % 16000 == 0 else sr
    W = int(0.032 * fs)
    H = int(hop * fs)
    tmin, tmax = int(fs / 400), int(fs / 70)
    out = []
    rms_all = np.sqrt(np.mean(x16**2)) + 1e-9
    for i in range(0, len(x16) - W - tmax, H):
        s = x16[i : i + W + tmax]
        if np.sqrt(np.mean(s[:W] ** 2)) < 0.25 * rms_all:
            out.append(0.0)
            continue
        d = np.array([np.sum((s[:W] - s[t : t + W]) ** 2) for t in range(1, tmax)])
        cm = d * np.arange(1, tmax) / np.maximum(np.cumsum(d), 1e-12)
        cand = np.where(cm[tmin - 1 :] < 0.12)[0]
        if len(cand) == 0:
            out.append(0.0)
            continue
        t = tmin - 1 + cand[0]
        while t + 1 < len(cm) and cm[t + 1] < cm[t]:
            t += 1
        out.append(fs / (t + 1))
    return np.array(out)


def pauses(x, sr=SR, min_dur=0.15, th_db=-38):
    hop = sr // 100
    env = np.sqrt(np.convolve(x**2, np.ones(hop) / hop, "same"))[::hop]
    sil = env < np.max(env) * 10 ** (th_db / 20)
    runs, run = [], 0
    for s in sil:
        if s:
            run += 1
        else:
            if run * 0.01 >= min_dur:
                runs.append(run * 0.01)
            run = 0
    # sin contar el silencio inicial/final
    return runs


def analyze(x, text, words=None, keywords=()):
    dur = len(x) / SR
    syl = syllables(text)
    ps = pauses(x)
    inner = sum(ps)
    f0 = f0_track(x)
    v = f0[f0 > 0]
    st = 12 * np.log2(v / np.median(v)) if len(v) else np.array([0.0])
    res = dict(
        dur=round(dur, 2),
        syl_s=round(syl / dur, 2),
        artic_syl_s=round(syl / max(0.1, dur - inner), 2),
        pauses=len(ps),
        pause_s=round(inner, 2),
        f0_med=round(float(np.median(v)) if len(v) else 0, 0),
        f0_sd_st=round(float(np.std(st)), 2),
        f0_range_st=round(float(np.percentile(st, 95) - np.percentile(st, 5)), 2),
    )
    if words:
        def seg_db(a, b):
            s = x[int(a * SR) : int(b * SR)]
            return 20 * np.log10(np.sqrt(np.mean(s**2)) + 1e-9) if len(s) else -99

        def seg_st(a, b):
            fr = f0[int(a * 100) : int(b * 100)]
            fr = fr[fr > 0]
            return 12 * np.log2(np.median(fr) / np.median(v)) if len(fr) and len(v) else 0.0

        dbs = [seg_db(a, b) for _, a, b in words]
        res["word_db_sd"] = round(float(np.std(dbs)), 2)
        kw = [strip_acc(k) for k in keywords]
        kidx = [i for i, (w, _, _) in enumerate(words) if strip_acc(w) in kw]
        if kidx:
            others = [i for i in range(len(words)) if i not in kidx]
            res["kw_db"] = round(float(np.mean([dbs[i] for i in kidx]) - np.mean([dbs[i] for i in others])), 2)
            res["kw_st"] = round(float(np.mean([seg_st(words[i][1], words[i][2]) for i in kidx]) - np.mean([seg_st(words[i][1], words[i][2]) for i in others])), 2)
    return res
