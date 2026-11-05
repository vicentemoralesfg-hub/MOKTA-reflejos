#!/usr/bin/env python3
"""Hoja de contacto de un MP4: python3 scripts/sheet.py video.mp4 salida.png t1 t2 ... (máx. 8)"""
import subprocess, sys
src, out, *ts = sys.argv[1:]
ins = []
for t in ts: ins += ["-ss", t, "-i", src]
n = len(ts); filt = ""
for k in range(n):
    filt += f"[{k}:v]trim=end_frame=1,setpts=PTS-STARTPTS,scale=432:768,drawtext=text='{ts[k]}':fontcolor=yellow:fontsize=28:x=10:y=10[v{k}];"
for k in range(n, 8): filt += f"color=black:s=432x768:d=1[v{k}];"
filt += "".join(f"[v{k}]" for k in range(8)) + "xstack=inputs=8:layout=0_0|w0_0|w0+w1_0|w0+w1+w2_0|0_h0|w0_h0|w0+w1_h0|w0+w1+w2_h0[o]"
subprocess.run(["ffmpeg","-v","error","-y",*ins,"-filter_complex",filt,"-map","[o]","-frames:v","1",out],check=True)
