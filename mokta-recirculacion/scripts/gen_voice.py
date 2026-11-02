#!/usr/bin/env python3
"""
MOKTA · Locución (paso 2): elegir la mejor toma por escena, ajustar el ritmo y re-sincronizar la timeline.

Entrada: out/voice_takes/*.wav + takes.json (scripts/qwen_voice.py, Qwen3-TTS)
Por cada toma:
  - recorte de pausas: ninguna pausa interna dura más de `pauseCap` s (mantiene el ritmo de reel)
  - transcripción con Whisper (inteligibilidad + tiempo de cada palabra)
  - métricas (scripts/voice_metrics.py): sílabas/s, pausas, tono medio, variación de tono, énfasis en palabras clave
Puntaje = inteligibilidad (excluyente) + timbre igual a la referencia + énfasis + expresividad + velocidad,
con penalización si el tono sale del rango de la persona (voz masculina grave).
Se guarda la tabla completa de candidatas en out/voice_takes/audit.json (evidencia de la auditoría).

Salida: public/audio/voice/<escena>.wav (48 kHz), public/audio/voice/words.json y src/timeline.json re-sincronizada:
cada escena dura lo que su voz + lo mínimo que necesita su animación (sin redondeos), y cada golpe visual
cae en la palabra que lo dispara.
Opción --keep-audio: no elige tomas; re-sincroniza con los .wav ya presentes en public/audio/voice/.
"""
import difflib
import json
import math
import os
import re
import sys
import unicodedata

import numpy as np
import soundfile as sf
from scipy.signal import resample_poly

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from voice_metrics import analyze  # noqa: E402

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
V = json.load(open(os.path.join(ROOT, "src", "voice.json")))
Q = V["qwen"]
TL_PATH = os.path.join(ROOT, "src", "timeline.json")
T = json.load(open(TL_PATH))
FPS = T["fps"]
OUT = os.path.join(ROOT, "public", "audio", "voice")
TAKES = os.path.join(ROOT, "out", "voice_takes")
CACHE = os.environ.get("MOKTA_TTS_CACHE", os.path.expanduser("~/.cache/mokta-tts"))
KEEP = "--keep-audio" in sys.argv
SR = 48000
PREV = {}


# ---------------------------------------------------------------- texto
def norm(s):
    s = unicodedata.normalize("NFD", s.lower())
    s = "".join(c for c in s if unicodedata.category(c) != "Mn")
    return re.sub(r"[^a-z0-9ñ ]+", " ", s).split()


NUM = {"90": "noventa", "%": "por ciento", "2": "dos", "1": "uno", "3": "tres", "4": "cuatro"}


def phon(tokens):
    """Forma "fonética" del español de Chile (seseo, b/v, ll/y, h muda) para comparar lo dicho con lo oído."""
    return [re.sub(r"c(?=[ei])", "s", t).replace("z", "s").replace("v", "b").replace("ll", "y").replace("h", "") for t in tokens]


def heard_tokens(heard):
    """Tokens de lo oído, con los números que escribe Whisper ("1.", "90 %") pasados a palabras."""
    return norm(" ".join(NUM.get(w, w) for w in norm(heard.replace("%", " % ").replace("%", " porciento "))).replace("porciento", "por ciento"))


def intelligibility(text, heard):
    """Similitud letra a letra (sin espacios: "en fría" = "enfría") entre lo dicho y lo oído."""
    a = "".join(phon(norm(text)))
    b = "".join(phon(heard_tokens(heard)))
    return difflib.SequenceMatcher(None, a, b, autojunk=False).ratio()


# ---------------------------------------------------------------- audio
def load48(path):
    x, sr = sf.read(path)
    x = x.mean(1) if x.ndim > 1 else x
    return resample_poly(x, SR, sr) if sr != SR else x


def silences(x, th_db=-40, min_dur=0.0):
    hop = SR // 100
    env = np.sqrt(np.convolve(x**2, np.ones(hop) / hop, "same"))[::hop]
    sil = env < np.max(env) * 10 ** (th_db / 20)
    out, start = [], None
    for i, s in enumerate(np.r_[sil, False]):
        if s and start is None:
            start = i
        elif not s and start is not None:
            if (i - start) / 100 >= min_dur:
                out.append((start / 100, i / 100))
            start = None
    return out


def tighten(x, cap):
    """Recorta silencios iniciales/finales y acorta toda pausa interna a `cap` s (con fundidos de 10 ms)."""
    sil = silences(x, -40)
    if not sil:
        return x
    nz = np.where(np.abs(x) > np.max(np.abs(x)) * 10 ** (-40 / 20))[0]
    a, b = max(0, nz[0] - int(0.02 * SR)), min(len(x), nz[-1] + int(0.06 * SR))
    segs, cur = [], a
    fade = int(0.01 * SR)
    for s0, s1 in sil:
        i0, i1 = int(s0 * SR), int(s1 * SR)
        if i0 <= a or i1 >= b or (s1 - s0) <= cap:
            continue
        keep = int(cap * SR / 2)
        segs.append(x[cur : i0 + keep])
        cur = i1 - keep
    segs.append(x[cur:b])
    y = segs[0]
    for s in segs[1:]:
        r = np.linspace(0, 1, fade)
        y = np.concatenate([y[:-fade], y[-fade:] * (1 - r) + s[:fade] * r, s[fade:]])
    return y


def f0_median(x):
    try:
        import librosa

        y = resample_poly(x, 16000, SR)
        f0, vf, _ = librosa.pyin(y, fmin=60, fmax=500, sr=16000, frame_length=1024)
        return float(np.median(f0[vf])) if np.any(vf) else 0.0
    except ImportError:
        return analyze(x, "a")["f0_med"]


# ---------------------------------------------------------------- tiempos por palabra
_model = None


def whisper():
    global _model
    if _model is None:
        from faster_whisper import WhisperModel

        _model = WhisperModel(os.environ.get("WHISPER_MODEL", "small"), device="cpu", compute_type="int8", download_root=os.path.join(CACHE, "whisper"))
    return _model


def transcribe(x, text):
    segs, _ = whisper().transcribe(resample_poly(x, 16000, SR).astype(np.float32), language="es", word_timestamps=True, beam_size=5)
    wh = [(w.word, w.start, w.end) for s in segs for w in s.words]
    heard = " ".join(w.strip() for w, _, _ in wh)
    wtok, wt = [], []
    for w, s0, s1 in wh:
        toks = heard_tokens(w)
        for k, t in enumerate(toks):
            wtok.append(t)
            wt.append((s0 + (s1 - s0) * k / max(1, len(toks)), s1))
    otok = norm(text)
    times = [None] * len(otok)
    for blk in difflib.SequenceMatcher(None, phon(otok), phon(wtok), autojunk=False).get_matching_blocks():
        for k in range(blk.size):
            times[blk.a + k] = wt[blk.b + k]
    known = [i for i, t in enumerate(times) if t is not None]
    for i in range(len(times)):  # interpolar las no reconocidas
        if times[i] is None:
            prev = max([k for k in known if k < i], default=None)
            nxt = min([k for k in known if k > i], default=None)
            t0 = times[prev][1] if prev is not None else 0.0
            t1 = times[nxt][0] if nxt is not None else len(x) / SR
            n_gap = (nxt if nxt is not None else len(times)) - (prev if prev is not None else -1) - 1
            j = i - (prev if prev is not None else -1) - 1
            times[i] = (t0 + (t1 - t0) * j / max(1, n_gap), t0 + (t1 - t0) * (j + 1) / max(1, n_gap))
    return otok, times, heard


def onsets(x):
    """Inicios de habla tras una pausa ≥ 120 ms (precisos; Whisper puede errar ±0,4 s justo después de una pausa)."""
    return [b for a, b in silences(x, -38, 0.12)]


def anchor(otok, times, phrase, text, ons):
    p = norm(phrase)
    for i in range(len(otok) - len(p) + 1):
        if otok[i : i + len(p)] == p:
            t = times[i][0]
            if re.search(r"[.?!:…]\s*[¿¡]?" + re.escape(phrase.split()[0]), text, re.IGNORECASE) and ons:
                o = min(ons, key=lambda o: abs(o - t))
                if abs(o - t) <= 0.6:
                    t = o
            return t
    raise SystemExit(f"Ancla no encontrada: '{phrase}'")


# ---------------------------------------------------------------- puntaje de una toma
def evaluate(x, sid, spk_sim=None):
    sc = V["scenes"][sid]
    otok, times, heard = transcribe(x, sc["text"])
    words = [(w, a, b) for w, (a, b) in zip(otok, times)]
    m = analyze(x, sc["text"], words, sc.get("keywords", []))
    m["intelig"] = round(intelligibility(sc["text"], heard), 3)
    m["f0_pyin"] = round(f0_median(x))
    m["spk_sim"] = spk_sim
    lo, hi = Q["pitchRange"]
    pitch_pen = 0 if lo <= m["f0_pyin"] <= hi else min(3.0, abs(m["f0_pyin"] - (lo if m["f0_pyin"] < lo else hi)) / 15)
    # registro parejo entre escenas: penaliza alejarse más de 3 semitonos del tono de la referencia
    dist = abs(12 * math.log2(max(m["f0_pyin"], 1) / Q.get("pitchTarget", 140)))
    pitch_pen += 0.25 * max(0.0, dist - 3)
    clip = lambda v, a, b: max(a, min(b, v))  # noqa: E731
    m["score"] = round(
        4.0 * m["intelig"]
        + 2.0 * (spk_sim if spk_sim is not None else 0.8)
        + 0.12 * clip(m.get("kw_st", 0), -2, 6)
        + 0.10 * clip(m.get("kw_db", 0), -3, 4)
        + 0.10 * clip(m["f0_sd_st"], 0, 6)
        + 0.25 * clip(m["artic_syl_s"] - 5.5, -1.5, 1.5)
        - pitch_pen
        - (2.0 if m["intelig"] < 0.93 else 0.0)
        - (2.0 if spk_sim is not None and spk_sim < Q.get("minSpeakerSim", 0) else 0.0),  # timbre distinto = otro locutor
        3,
    )
    return m, otok, times, heard


# ---------------------------------------------------------------- re-sincronización
def retime(scene, info):
    sid = scene["id"]
    st = V["scenes"][sid]["start"]
    b = dict(scene["beats"])
    F = lambda t: st + int(round(t * FPS))  # noqa: E731
    for name, (phrase, off) in V["scenes"][sid]["anchors"].items():
        b[name] = F(anchor(info["tok"], info["times"], phrase, V["scenes"][sid]["text"], info["ons"])) + off
    vo_end = st + int(math.ceil(info["dur"] * FPS))
    tail = V.get("tail", 5)
    if sid == "hook":
        need = max(vo_end + tail, b["c2"] + 26)
    elif sid == "define":
        b["diagram"] = max(14, b["intake"] - 12)
        need = max(vo_end + tail, b["loop"] + 36)
    elif sid == "winter":
        b["co2"] = b["fogged"] + 8
        need = max(vo_end + tail, b["co2"] + 22)
    elif sid == "summer":
        need = max(vo_end + tail, b["fuel"] + 50)
    elif sid == "rule":
        b["flipHit"] = b["flip"] + 10
        b["notes"] = b["hot"] + 16
        b["save"] = b["notes"] + 16
        need = max(vo_end + tail, b["save"] + 22)
    elif sid == "recipe":
        b["rear"] = b["done"] + 8
        need = max(vo_end + tail, b["rear"] + 34)
    elif sid == "cta":
        b["save"] = b["comment"] + 16
        b["share"] = b["save"] + 12
        b["brand"] = b["share"] + 12
        need = max(vo_end + 8, b["brand"] + 24)
    scene["beats"] = b
    scene["duration"] = int(need)
    return vo_end


def dump_timeline(t):
    """JSON legible: beats y cues de cada escena en una sola línea."""
    lines = ["{", f'  "_comment": {json.dumps(t["_comment"], ensure_ascii=False)},', f'  "fps": {t["fps"]},', f'  "bpm": {t["bpm"]},', '  "scenes": [']
    for i, s in enumerate(t["scenes"]):
        beats = ", ".join(f'"{k}": {v}' for k, v in s["beats"].items())
        cues = json.dumps(s["cues"], ensure_ascii=False).replace("],[", "], [").replace('","', '", "').replace(',"', ', "')
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
    global PREV
    wj = os.path.join(OUT, "words.json")
    PREV = json.load(open(wj)) if os.path.exists(wj) else {}
    takes = {} if KEEP else json.load(open(os.path.join(TAKES, "takes.json")))
    audit, report = {}, {}
    os.makedirs(OUT, exist_ok=True)
    for s in T["scenes"]:
        sid = s["id"]
        if KEEP:
            x = load48(os.path.join(OUT, f"{sid}.wav"))
            prev = PREV.get(sid, {})
            best = (evaluate(x, sid, prev.get("metrics", {}).get("spk_sim")), x, prev.get("take", f"{sid}.wav"))
        else:
            cands = []
            for name, meta in takes.items():
                if meta["scene"] != sid:
                    continue
                x = tighten(load48(os.path.join(TAKES, name)), Q["pauseCap"])
                if Q.get("tempo", 1.0) != 1.0:
                    import subprocess

                    raw = subprocess.run(["ffmpeg", "-v", "error", "-f", "f32le", "-ar", str(SR), "-ac", "1", "-i", "-", "-af", f"atempo={Q['tempo']}", "-f", "f32le", "-"], input=x.astype(np.float32).tobytes(), capture_output=True).stdout
                    x = np.frombuffer(raw, np.float32).astype(np.float64)
                ev = evaluate(x, sid, meta.get("spk_sim"))
                cands.append((ev, x, name))
                audit.setdefault(sid, []).append(dict(take=name, mode=meta["mode"], **ev[0], heard=ev[3]))
            cands.sort(key=lambda c: -c[0][0]["score"])
            best = cands[0]
            audit[sid].sort(key=lambda r: -r["score"])
        (m, tok, times, heard), x, name = best
        x = x / (np.max(np.abs(x)) + 1e-9) * 0.9
        sf.write(os.path.join(OUT, f"{sid}.wav"), (x * 32767).astype(np.int16), SR, subtype="PCM_16")
        info = dict(tok=tok, times=times, dur=len(x) / SR, ons=onsets(x))
        vo_end = retime(s, info)
        report[sid] = dict(take=name, start=V["scenes"][sid]["start"], dur=round(info["dur"], 3), text=V["scenes"][sid]["text"], heard=heard, metrics=m, words=[[w, round(a, 3), round(b_, 3)] for w, (a, b_) in zip(tok, times)])
        print(f"{sid:7s} {name:22s} voz {info['dur']:5.2f}s  escena {s['duration'] / FPS:5.2f}s  puntaje {m['score']:5.2f}  "
              f"intelig {m['intelig']:.0%}  tono {m['f0_pyin']} Hz  var {m['f0_sd_st']} st  énfasis {m.get('kw_st', 0):+.1f} st/{m.get('kw_db', 0):+.1f} dB  "
              f"{m['artic_syl_s']} síl/s  timbre {m['spk_sim']}")
    dump_timeline(T)
    json.dump(report, open(os.path.join(OUT, "words.json"), "w"), ensure_ascii=False, indent=1)
    if audit:
        json.dump(audit, open(os.path.join(TAKES, "audit.json"), "w"), ensure_ascii=False, indent=1)
    total = sum(s["duration"] for s in T["scenes"])
    print(f"TOTAL {total} fotogramas = {total / FPS:.2f} s")


if __name__ == "__main__":
    main()
