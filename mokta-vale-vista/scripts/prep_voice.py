#!/usr/bin/env python3
"""Ajusta la locución: acorta pausas largas (dinamismo) y acelera levemente sin cambiar el tono."""
import subprocess, numpy as np, os
from scipy.io import wavfile
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
src = os.path.join(ROOT, "raw/voz.mp3"); tmp = os.path.join(ROOT, "raw/voz48.wav")
subprocess.run(["ffmpeg","-v","error","-y","-i",src,"-ar","48000","-ac","1",tmp],check=True)
sr, x = wavfile.read(tmp); x = x.astype(np.float32)/32768
win = int(0.01*sr); n = len(x)//win
rms = np.sqrt((x[:n*win].reshape(n,win)**2).mean(1)+1e-12); db = 20*np.log10(rms)
sil = db < -40
MAXP = 0.24  # pausa máxima (s)
keep = np.ones(len(x), bool)
i = 0
while i < n:
    if sil[i]:
        j = i
        while j < n and sil[j]: j += 1
        dur = (j-i)*0.01
        if dur > MAXP and i > 0 and j < n:
            cut = dur - MAXP; a = int((i*0.01 + MAXP/2)*sr); b = a + int(cut*sr)
            keep[a:b] = False
        i = j
    else: i += 1
y = x[keep]
# fade-in/out de 4 ms en cada corte para evitar clics
wavfile.write(os.path.join(ROOT,"raw/voz_cut.wav"), sr, (y*32767).astype(np.int16))
subprocess.run(["ffmpeg","-v","error","-y","-i",os.path.join(ROOT,"raw/voz_cut.wav"),
  "-af","atempo=1.06,highpass=f=70,acompressor=threshold=-20dB:ratio=3:attack=5:release=80,loudnorm=I=-16:TP=-1.5",
  "-ar","48000","-ac","1",os.path.join(ROOT,"public/audio/voz.wav")],check=True)
print(len(x)/sr, "->", len(y)/sr/1.06)
