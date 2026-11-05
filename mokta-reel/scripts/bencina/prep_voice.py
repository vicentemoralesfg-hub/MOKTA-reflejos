#!/usr/bin/env python3
"""
MOKTA · Marcador de bencina — preparación de la locución.

Entrada:  public/bencina/voz_original.mp3      (ElevenLabs, voz "David C - Viral Storytelling", eleven_v4)
          scripts/bencina/words_original.json  (alineación por palabra de ElevenLabs Scribe)
Salida:   public/bencina/voz.wav               (48 kHz, tempo ×TEMPO sin cambio de tono, EQ suave)
          src/bencina/data/words.json          (palabras con fotograma de inicio/fin ya re-escalados)

Fuente única de tiempos: video, subtítulos y diseño sonoro leen words.json.
"""
import json
import os
import subprocess

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
TEMPO = 1.15      # más dinámico para Reels; rubberband conserva el tono
FPS = 30
LEAD_S = 0.0      # la voz arranca en el primer fotograma (gancho inmediato)

src = os.path.join(ROOT, "public/bencina/voz_original.mp3")
dst = os.path.join(ROOT, "public/bencina/voz.wav")
subprocess.run([
    "ffmpeg", "-v", "error", "-y", "-i", src,
    "-af", (
        f"aresample=48000,rubberband=tempo={TEMPO}:pitchq=quality:transients=mixed:smoothing=on,"
        "highpass=f=75,equalizer=f=220:t=q:w=1.2:g=-1.5,equalizer=f=3200:t=q:w=1.0:g=2,"
        "acompressor=threshold=-20dB:ratio=2.5:attack=8:release=120:makeup=2"
    ),
    "-ar", "48000", "-ac", "1", dst,
], check=True)

words = json.load(open(os.path.join(ROOT, "scripts/bencina/words_original.json")))["words"]
out = []
for w in words:
    if w["text"].startswith("["):
        continue  # etiquetas de interpretación de eleven_v4: no se pronuncian
    s = LEAD_S + w["start"] / TEMPO
    e = LEAD_S + w["end"] / TEMPO
    out.append({"text": w["text"], "start": round(s * FPS, 2), "end": round(e * FPS, 2)})

dur = float(subprocess.run(
    ["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", dst],
    capture_output=True, text=True, check=True).stdout)
json.dump({"fps": FPS, "tempo": TEMPO, "voiceFrames": round(dur * FPS, 2), "words": out},
          open(os.path.join(ROOT, "src/bencina/data/words.json"), "w"), ensure_ascii=False, indent=1)
print(f"voz.wav {dur:.2f}s · {len(out)} palabras · última termina en f{out[-1]['end']}")
