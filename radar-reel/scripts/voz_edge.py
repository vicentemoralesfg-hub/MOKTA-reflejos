#!/usr/bin/env python3
"""
Locución con edge-tts (voz es-CL-LorenzoNeural) a partir de scripts/guion.py.

Cada toma del guion (TAKES: varios tramos seguidos) se genera con su propia entonación (velocidad,
tono, volumen): la voz sube en las preguntas y la escalada, y baja y se detiene en las revelaciones.
Las tomas se unen con silencio entre medio (build_voice.py fija después las pausas reales).

Uso:    python3 scripts/voz_edge.py
Salida: public/audio/voz_edge.wav (24 kHz, procesada) · scripts/words_edge.json (tiempos por palabra)
        y cues.json → voice con una sola fuente "e" y un tramo por línea.
Después: python3 scripts/guion.py && python3 scripts/build_voice.py, y el resto del flujo.

Requiere salida a speech.platform.bing.com (servicio de lectura en voz alta de Edge; edge-tts no
es un cliente oficial de Microsoft). Usa el proxy de la sesión y su CA, sin desactivar TLS.
Pide el MP3 a 96 kbps (edge-tts usa 48 kbps por defecto): menos artefactos de compresión.
"""
import asyncio
import difflib
import json
import os
import re
import ssl
import subprocess
import sys
import tempfile
import unicodedata

import aiohttp
import edge_tts
import edge_tts.communicate
import numpy as np
from scipy.io import wavfile

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from guion import LINES, TAKES, TOKENS, segments  # noqa: E402

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
VOICE = os.environ.get("EDGE_VOICE", "es-CL-LorenzoNeural")
FORMAT = "audio-24khz-96kbitrate-mono-mp3"
SR = 24000
JOIN = 0.6  # silencio entre tomas (no se oye: build_voice corta cada tramo con sus propias pausas)
# Voz más presente y pareja: sin graves de sobra, un poco de presencia y compresión suave
VOICE_FX = ("highpass=f=75,equalizer=f=220:t=q:w=1.0:g=-1.5,equalizer=f=3200:t=q:w=1.0:g=2.5,"
            "acompressor=threshold=0.1:ratio=2.5:attack=8:release=120:makeup=1.5")


def norm(w):
    w = unicodedata.normalize("NFD", w.lower())
    return re.sub(r"[^a-z0-9]", "", "".join(c for c in w if unicodedata.category(c) != "Mn"))


def setup():
    # edge-tts fija la CA de certifi; el proxy de la sesión presenta su propia CA (incluida en este paquete).
    edge_tts.communicate._SSL_CTX = ssl.create_default_context(cafile=os.environ.get("SSL_CERT_FILE", "/root/.ccr/ca-bundle.crt"))
    edge_tts.communicate.MP3_BITRATE_BPS = 96_000
    send = aiohttp.ClientWebSocketResponse.send_str

    async def send_str(self, data, *a, **k):
        return await send(self, data.replace("audio-24khz-48kbitrate-mono-mp3", FORMAT), *a, **k)

    aiohttp.ClientWebSocketResponse.send_str = send_str


async def synth(text, rate, pitch, volume):
    com = edge_tts.Communicate(text, VOICE, rate=rate, pitch=pitch, volume=volume, boundary="WordBoundary",
                               proxy=os.environ.get("HTTPS_PROXY"))
    audio, marks = bytearray(), []
    async for ch in com.stream():
        if ch["type"] == "audio":
            audio += ch["data"]
        elif ch["type"] == "WordBoundary":
            marks.append(dict(text=ch["text"], start=ch["offset"] / 1e7, end=(ch["offset"] + ch["duration"]) / 1e7))
    return bytes(audio), marks


def decode(mp3):
    with tempfile.TemporaryDirectory() as tmp:
        a, b = os.path.join(tmp, "a.mp3"), os.path.join(tmp, "b.wav")
        open(a, "wb").write(mp3)
        subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", a, "-ac", "1", "-ar", str(SR), "-c:a", "pcm_f32le", b], check=True)
        return wavfile.read(b)[1].astype(np.float32)


def align(tokens, marks):
    """Lleva las marcas del servicio (sin puntuación) a las palabras del guion."""
    a, b = [norm(t) for t in tokens], [norm(m["text"]) for m in marks]
    out = [None] * len(tokens)
    for op, i0, i1, j0, j1 in difflib.SequenceMatcher(None, a, b, autojunk=False).get_opcodes():
        if op == "equal":
            for k in range(i1 - i0):
                out[i0 + k] = dict(marks[j0 + k])
        elif op == "replace" and j1 > j0:
            t0, t1 = marks[j0]["start"], marks[j1 - 1]["end"]
            n = i1 - i0
            for k in range(n):
                out[i0 + k] = dict(start=t0 + (t1 - t0) * k / n, end=t0 + (t1 - t0) * (k + 1) / n)
    for i in range(len(out)):
        if out[i] is None:
            prev = out[i - 1]["end"] if i else 0.0
            nxt = next((o["start"] for o in out[i + 1:] if o), prev + 0.2)
            out[i] = dict(start=prev, end=max(prev + 0.05, nxt))
            print(f"  aviso: '{tokens[i]}' sin marca de tiempo, estimada")
    return out


async def run():
    pieces, words, t = [], [], 0.0
    for first, last, rate, pitch, volume in TAKES:
        text = " ".join(LINES[i][0] for i in range(first, last + 1))
        shift = int(os.environ.get("EDGE_RATE_SHIFT", "0"))  # % que se suma a la velocidad de cada toma
        rate = f"{int(rate.rstrip('%')) + shift:+d}%"
        mp3, marks = await synth(text, rate, pitch, volume)
        x = decode(mp3)
        for tok, m in zip(text.split(), align(text.split(), marks)):
            words.append(dict(text=tok, start=round(t + m["start"], 4), end=round(t + m["end"], 4)))
        pieces += [x, np.zeros(int(JOIN * SR), np.float32)]
        t += (len(x) + int(JOIN * SR)) / SR
        print(f"  {rate:>4} {pitch:>5} {volume:>4}  {len(x) / SR:4.2f}s  {text}")
    return np.concatenate(pieces), words


def main():
    setup()
    audio, words = asyncio.run(run())
    assert [w["text"] for w in words] == TOKENS
    with tempfile.TemporaryDirectory() as tmp:
        raw = os.path.join(tmp, "raw.wav")
        wavfile.write(raw, SR, audio)
        subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", raw, "-af", VOICE_FX, "-c:a", "pcm_s16le",
                        os.path.join(ROOT, "public/audio/voz_edge.wav")], check=True)
    json.dump(words, open(os.path.join(ROOT, "scripts/words_edge.json"), "w"), ensure_ascii=False, indent=1)

    path = os.path.join(ROOT, "src/data/cues.json")
    cues = json.load(open(path))
    vc = cues["voice"]
    vc.update(tempo=1.0, sources={"e": dict(file="public/audio/voz_edge.wav", words="scripts/words_edge.json", gainDb=0,
                                           _nota=f"edge-tts {VOICE} {FORMAT}, una toma por bloque con su entonación (guion.py)")},
              segments=[dict(src="e", **{"from": f, "to": t}, gapAfter=g) for f, t, g in segments()])
    vc.pop("placeholderText", None)
    json.dump(cues, open(path, "w"), ensure_ascii=False, indent=2)
    print(f"{VOICE}: {len(TAKES)} tomas · {len(LINES)} tramos · {len(words)} palabras")


main()
