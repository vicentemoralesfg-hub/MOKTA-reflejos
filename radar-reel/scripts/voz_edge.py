#!/usr/bin/env python3
"""
Locución con edge-tts (voz es-CL-LorenzoNeural) para el guion actual completo.

Uso:  python3 scripts/voz_edge.py [--rate +6%]
Salida: public/audio/voz_edge.mp3 · scripts/words_edge.json (tiempos por palabra del guion)
        y cues.json → voice pasa a una sola fuente "e" con los mismos tramos y pausas del montaje.
Después: python3 scripts/build_voice.py y el resto del flujo (render de subtítulos, audio, assemble).

Requiere salida a speech.platform.bing.com (servicio de lectura en voz alta de Edge; edge-tts no
es un cliente oficial de Microsoft). Usa el proxy de la sesión y su CA, sin desactivar TLS.
"""
import argparse
import asyncio
import difflib
import json
import os
import re
import ssl
import unicodedata

import edge_tts
import edge_tts.communicate

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
VOICE = "es-CL-LorenzoNeural"
TEXT = (
    "Te acabas de ganar un parte. Y la patrulla está ahí. ¿La ves? Después la ves. Frenas. Pero ya es tarde. "
    "¿Cómo te midió… si no la veías? El radar lanza una onda más ancha que toda la carretera. "
    "Y funciona hasta desde una patrulla que viene de frente… Pero la pistola láser es otra cosa. "
    "Un rayo del ancho de una puerta. Un solo auto: el tuyo. Y le basta menos de medio segundo. "
    "¿Desde qué distancia? Piensa un número. ¿Trescientos metros?… Más. ¿Un kilómetro?… Más. "
    "Hasta casi tres kilómetros. A esa distancia, ni siquiera es un punto. "
    "A ciento cuarenta, tardarías más de un minuto en llegar. Cuando la ves… ya te midieron. "
    "Pero hay un detalle. Te mide a tres kilómetros… pero para que tu patente salga en la foto, "
    "necesita tenerte a unos doscientos metros. Entonces… ¿cuándo te pillaron de verdad?"
)
TOKENS = TEXT.split()
# Tramos del montaje (índices de palabra del guion) y pausa después de cada uno (s).
SEGMENTS = [
    (0, 5, 0.22), (6, 12, 0.2), (13, 16, 0.14), (17, 20, 0.2), (21, 27, 0.2), (28, 38, 0.16),
    (39, 41, 0.08), (42, 48, 0.2), (49, 62, 0.18), (63, 67, 0.18), (68, 74, 0.2), (75, 80, 0.18),
    (81, 90, 0.5), (91, 108, 0.18), (109, 114, 0.32), (115, 118, 0.12), (119, 123, 0.14),
    (124, 138, 0.16), (139, 144, 0.0),
]
assert len(TOKENS) == 145 and SEGMENTS[-1][1] == len(TOKENS) - 1


def norm(w):
    w = unicodedata.normalize("NFD", w.lower())
    return re.sub(r"[^a-z0-9]", "", "".join(c for c in w if unicodedata.category(c) != "Mn"))


async def synth(rate):
    # edge-tts fija la CA de certifi; el proxy de la sesión presenta su propia CA (incluida en este paquete).
    edge_tts.communicate._SSL_CTX = ssl.create_default_context(cafile=os.environ.get("SSL_CERT_FILE", "/root/.ccr/ca-bundle.crt"))
    com = edge_tts.Communicate(TEXT, VOICE, rate=rate, boundary="WordBoundary", proxy=os.environ.get("HTTPS_PROXY"))
    audio, marks = bytearray(), []
    async for ch in com.stream():
        if ch["type"] == "audio":
            audio += ch["data"]
        elif ch["type"] == "WordBoundary":
            marks.append(dict(text=ch["text"], start=ch["offset"] / 1e7, end=(ch["offset"] + ch["duration"]) / 1e7))
    return bytes(audio), marks


def align(marks):
    """Lleva las marcas del servicio (sin puntuación, a veces agrupadas) a los 145 tokens del guion."""
    a, b = [norm(t) for t in TOKENS], [norm(m["text"]) for m in marks]
    out = [None] * len(TOKENS)
    for op, i0, i1, j0, j1 in difflib.SequenceMatcher(None, a, b, autojunk=False).get_opcodes():
        if op == "equal":
            for k in range(i1 - i0):
                out[i0 + k] = dict(marks[j0 + k])
        elif op == "replace" and j1 > j0:  # p. ej. "140" ↔ "ciento cuarenta": reparte el tramo
            t0, t1 = marks[j0]["start"], marks[j1 - 1]["end"]
            n = i1 - i0
            for k in range(n):
                out[i0 + k] = dict(start=t0 + (t1 - t0) * k / n, end=t0 + (t1 - t0) * (k + 1) / n)
    for i in range(len(out)):  # tokens sin marca: entre la palabra anterior y la siguiente
        if out[i] is None:
            prev = out[i - 1]["end"] if i else 0.0
            nxt = next((o["start"] for o in out[i + 1:] if o), prev + 0.2)
            out[i] = dict(start=prev, end=max(prev + 0.05, nxt))
            print(f"  aviso: '{TOKENS[i]}' sin marca de tiempo, estimada")
    return [dict(text=t, start=round(o["start"], 4), end=round(o["end"], 4)) for t, o in zip(TOKENS, out)]


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--rate", default="+0%")
    args = ap.parse_args()
    audio, marks = asyncio.run(synth(args.rate))
    open(os.path.join(ROOT, "public/audio/voz_edge.mp3"), "wb").write(audio)
    words = align(marks)
    json.dump(words, open(os.path.join(ROOT, "scripts/words_edge.json"), "w"), ensure_ascii=False, indent=1)

    path = os.path.join(ROOT, "src/data/cues.json")
    cues = json.load(open(path))
    vc = cues["voice"]
    vc.update(tempo=1.0, sources={"e": dict(file="public/audio/voz_edge.mp3", words="scripts/words_edge.json", gainDb=0,
                                           _nota=f"edge-tts {VOICE} rate {args.rate}, guion completo en una toma")},
              segments=[dict(src="e", **{"from": f, "to": t}, gapAfter=g) for f, t, g in SEGMENTS])
    vc.pop("placeholderText", None)
    json.dump(cues, open(path, "w"), ensure_ascii=False, indent=2)
    print(f"{VOICE} {args.rate}: {len(marks)} marcas → {len(words)} palabras · toma {words[-1]['end']:.2f} s")


main()
