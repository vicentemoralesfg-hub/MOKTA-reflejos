#!/usr/bin/env python3
"""Control de calidad del MP4 final → QA_REEL.md (formato, sonoridad, sorpresa de la barrera, panel, impactos)."""
import json
import os
import subprocess
import sys

import numpy as np

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from reel_timing import ROOT, FPS, T, layout, round_frames  # noqa: E402

MP4 = os.path.join(ROOT, "out", "MOKTA_TestDeReflejos_B.mp4")
W, H = 1080, 1920
L = layout()


def run(cmd):
    return subprocess.run(cmd, capture_output=True, text=True).stdout + subprocess.run(cmd, capture_output=True, text=True).stderr


probe = json.loads(subprocess.run(["ffprobe", "-v", "error", "-show_streams", "-show_format", "-of", "json", MP4], capture_output=True, text=True).stdout)
v = next(s for s in probe["streams"] if s["codec_type"] == "video")
a = next(s for s in probe["streams"] if s["codec_type"] == "audio")


def frame_rgb(n):
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", MP4, "-vf", f"select=eq(n\\,{n}),format=rgb24", "-vframes", "1", "-f", "rawvideo", "-"], capture_output=True).stdout
    return np.frombuffer(raw, np.uint8).reshape(H, W, 3).astype(float)


def frame(n):
    return frame_rgb(n).mean(axis=2)


def red_px(img):
    """Píxeles de la lámina roja de la barrera (rojo dominante) en la zona del horizonte."""
    z = img[600:820]
    return int(((z[..., 0] - z[..., 1] > 30) & (z[..., 0] > 60)).sum())


lines = ["# MOKTA · Test de reflejos (propuesta B) — control de calidad", "", f"Archivo: `out/MOKTA_TestDeReflejos_B.mp4` (copia en `entregables/`).", ""]
lines += ["## Formato", "", "| Criterio | Valor | Esperado |", "|---|---|---|"]
fr = v["r_frame_rate"]
checks = [
    ("Resolución", f"{v['width']}×{v['height']}", "1080×1920 (9:16)", v["width"] == W and v["height"] == H),
    ("Fotogramas por segundo", fr, "30/1 constante", fr == "30/1"),
    ("Fotogramas", v["nb_frames"], str(L["total"]), int(v["nb_frames"]) == L["total"]),
    ("Duración video / audio", f"{float(v['duration']):.3f} / {float(a['duration']):.3f} s", f"{L['total']/FPS:.3f} s", abs(float(v["duration"]) - L["total"] / FPS) < 0.04),
    ("Video", f"{v['codec_name']} {v.get('profile','')} {v['pix_fmt']} {v.get('color_space','')}", "h264 High yuv420p bt709", v["codec_name"] == "h264" and v["pix_fmt"] == "yuv420p"),
    ("Audio", f"{a['codec_name']} {a['sample_rate']} Hz {a['channels']} canales", "aac 48000 Hz estéreo", a["codec_name"] == "aac" and a["sample_rate"] == "48000"),
    ("Tamaño", f"{int(probe['format']['size'])/1e6:.1f} MB", "< 100 MB", int(probe["format"]["size"]) < 100e6),
]
loud = run(["ffmpeg", "-nostats", "-i", MP4, "-af", "ebur128=peak=true", "-f", "null", "-"])
summ = loud[loud.rfind("Summary"):]
I = float(summ.split("I:")[1].split("LUFS")[0])
TP = float(summ.split("Peak:")[1].split("dBFS")[0])
checks += [("Sonoridad integrada", f"{I:.1f} LUFS", "≈ −14 LUFS", abs(I + 14) <= 1), ("Pico real", f"{TP:.1f} dBFS", "≤ −1 dBFS", TP <= -1.0)]
ok_all = True
for name, val, exp, ok in checks:
    ok_all &= ok
    lines.append(f"| {name} | {val} | {exp} {'✔' if ok else '✘'} |")

lines += ["", "## La barrera aparece por sorpresa y el panel no la anuncia", "",
          "Barrera: píxeles de lámina roja en la franja del horizonte. Panel: píxeles de la pantalla del instrumental que cambian más de 40 niveles respecto del fotograma anterior.", "",
          "| Ronda | Fotograma de aparición | Barrera 2 fot. antes / 1 antes / aparición | Panel en la aparición | Panel 1 fotograma después |", "|---|---|---|---|---|"]
for i, r in enumerate(T["rounds"]):
    rf = round_frames(i)
    ev = L[f"r{i+1}"] + rf["event"]
    c0, c1, c2, c3 = frame_rgb(ev - 2), frame_rgb(ev - 1), frame_rgb(ev), frame_rgb(ev + 1)
    r0, r1, r2 = red_px(c0), red_px(c1), red_px(c2)
    panel = (slice(1268, 1456), slice(204, 876))
    g1, g2, g3 = c1.mean(axis=2), c2.mean(axis=2), c3.mean(axis=2)
    pan = int((np.abs(g2 - g1)[panel] > 40).sum())
    pan2 = int((np.abs(g3 - g2)[panel] > 40).sum())
    ok = r0 == 0 and r1 == 0 and r2 > 50 and pan == 0
    ok_all &= ok
    lines.append(f"| {r['label']} · {r['speedKmh']} | {ev} ({ev/FPS:.2f} s) | {r0} / {r1} / {r2} px {'✔' if r0 == 0 and r1 == 0 and r2 > 50 else '✘'} | {pan} px {'✔' if pan == 0 else '✘'} | {pan2} px |")

lines += ["", "## Impacto y lectura", "", "| Ronda | Fotograma del impacto | Luma media en el negro |", "|---|---|---|"]
for i, r in enumerate(T["rounds"]):
    rf = round_frames(i)
    k = L[f"r{i+1}"] + rf["impact"] + 3
    m = frame(k).mean()
    ok_all &= m < 3
    lines.append(f"| {r['label']} | {L[f'r{i+1}'] + rf['impact']} ({(L[f'r{i+1}'] + rf['impact'])/FPS:.2f} s) | {m:.2f} {'✔' if m < 3 else '✘'} |")

from scipy.io import wavfile  # noqa: E402
_, vox = wavfile.read(os.path.join(ROOT, "public", "audio", "voz.wav"))
vox = vox.astype(float) / 32768.0
lines += ["", "## La voz no anuncia la barrera", "", "Pico de la pista de voz desde 1,2 s antes de la aparición hasta el impacto (debe ser silencio).", "",
          "| Ronda | Ventana | Pico de voz |", "|---|---|---|"]
for i, r in enumerate(T["rounds"]):
    rf = round_frames(i)
    a0 = (L[f"r{i+1}"] + rf["event"]) / FPS - 1.2
    a1 = (L[f"r{i+1}"] + rf["impact"]) / FPS
    pk = float(np.max(np.abs(vox[int(a0 * 48000):int(a1 * 48000)])))
    ok_all &= pk < 0.01
    lines.append(f"| {r['label']} | {a0:.2f}–{a1:.2f} s | {pk:.4f} {'✔' if pk < 0.01 else '✘'} |")

lines += ["", f"**Resultado: {'todos los controles pasan' if ok_all else 'HAY CONTROLES QUE FALLAN'}.**", ""]
open(os.path.join(ROOT, "QA_REEL.md"), "w").write("\n".join(lines))
print("\n".join(lines))
sys.exit(0 if ok_all else 1)
