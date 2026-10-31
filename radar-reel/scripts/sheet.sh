#!/bin/bash
# Uso: scripts/sheet.sh <nombre> <comp> <f1> <f2> ... → out/stills/<nombre>.jpg (hoja 3 columnas)
set -e
cd "$(dirname "$0")/.."
name=$1; comp=$2; shift 2
export REMOTION_CHROME=${REMOTION_CHROME:-/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell}
node scripts/stills.mjs "$comp" "$@" > /dev/null 2>&1
python3 - "$name" "$comp" "$@" <<'PY'
import sys, subprocess
name, comp, *frames = sys.argv[1:]
files = [f"out/stills/{comp}_{int(f):04d}.jpg" for f in frames]
args = []
for f in files: args += ["-i", f]
n = len(files); cols = 3
filt = "".join(f"[{k}:v]scale=360:640,drawtext=text='{int(frames[k])}':x=8:y=8:fontsize=28:fontcolor=yellow:box=1:boxcolor=black[v{k}];" for k in range(n))
filt += "".join(f"[v{k}]" for k in range(n)) + f"xstack=inputs={n}:fill=black:layout=" + "|".join(f"{(k%cols)*360}_{(k//cols)*640}" for k in range(n)) + "[o]"
subprocess.run(["ffmpeg","-v","error","-y",*args,"-filter_complex",filt,"-map","[o]",f"out/stills/{name}.jpg"],check=True)
PY
echo out/stills/$name.jpg
