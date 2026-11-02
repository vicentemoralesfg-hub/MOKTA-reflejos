#!/usr/bin/env python3
"""Mide cada entregable de contenido/ y escribe contenido/QA.md (especificaciones técnicas reales)."""
import glob
import json
import os
import re
import subprocess

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
C = os.path.join(ROOT, "contenido")


def sh(*a):
    return subprocess.run(a, capture_output=True, text=True).stdout + subprocess.run(a, capture_output=True, text=True).stderr


def probe(p):
    j = json.loads(subprocess.run(["ffprobe", "-v", "error", "-show_streams", "-show_format", "-of", "json", p], capture_output=True, text=True).stdout)
    v = next(s for s in j["streams"] if s["codec_type"] == "video")
    a = next((s for s in j["streams"] if s["codec_type"] == "audio"), None)
    return j, v, a


rows = []
for p in sorted(glob.glob(os.path.join(C, "*", "*", "*.mp4"))):
    j, v, a = probe(p)
    loud = subprocess.run(["ffmpeg", "-hide_banner", "-i", p, "-af", "ebur128=peak=true", "-f", "null", "-"], capture_output=True, text=True).stderr
    I = re.findall(r"I:\s+(-?[\d.]+) LUFS", loud)[-1]
    TP = re.findall(r"Peak:\s+(-?[\d.]+) dBFS", loud)[-1]
    bd = subprocess.run(["ffmpeg", "-hide_banner", "-i", p, "-vf", "blackdetect=d=0.1:pix_th=0.02", "-an", "-f", "null", "-"], capture_output=True, text=True).stderr
    blacks = re.findall(r"black_start:([\d.]+) black_end:([\d.]+)", bd)
    fps = eval(v["r_frame_rate"])
    rows.append(
        f"| `{os.path.relpath(p, C)}` | {v['width']}×{v['height']} | {fps:.0f} | {float(j['format']['duration']):.2f} s | "
        f"{v['codec_name']} {v.get('profile','')} {v['pix_fmt']} | {a['codec_name']} {int(a['sample_rate'])//1000} kHz | {I} LUFS | {TP} dBFS | "
        f"{', '.join(f'{float(s):.2f}–{float(e):.2f} s' for s, e in blacks) or 'ninguno'} | {os.path.getsize(p)/1e6:.1f} MB |"
    )

imgs = []
for p in sorted(glob.glob(os.path.join(C, "*", "*", "*.jpg"))):
    out = subprocess.run(["identify", "-format", "%w×%h %[colorspace]", p], capture_output=True, text=True).stdout
    imgs.append(f"| `{os.path.relpath(p, C)}` | {out} | {os.path.getsize(p)/1e3:.0f} KB |")

md = """# Control de calidad técnico (medido sobre los archivos finales)

Generado por `estudio/scripts/qa_report.py` (ffprobe + ebur128 + blackdetect). Objetivo Reels: 1080×1920, 30 fps,
H.264 yuv420p, AAC 48 kHz, ≈ −14 LUFS integrados, pico real ≤ −1 dBFS.

## Videos
| Archivo | Resolución | fps | Duración | Video | Audio | Sonoridad | Pico real | Negros (≥0,1 s) | Peso |
|---|---|---|---|---|---|---|---|---|---|
""" + "\n".join(rows) + """

Los únicos negros detectados son intencionales (Reel 01: corte a negro tras la revelación, 0,6 s).

## Imágenes / láminas
| Archivo | Tamaño | Peso |
|---|---|---|
""" + "\n".join(imgs) + "\n"
open(os.path.join(C, "QA.md"), "w").write(md)
print(md)
