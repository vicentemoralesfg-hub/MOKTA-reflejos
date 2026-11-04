#!/bin/bash
# Renderiza fotogramas sueltos (en segundos) y arma una hoja de contactos para revisión.
# Uso: scripts/sheet.sh nombre t1 t2 t3 ...
cd "$(dirname "$0")/.."
name=$1; shift
rm -rf out/sheet/$name; mkdir -p out/sheet/$name
i=0
for s in "$@"; do
  f=$(python3 -c "print(round($s*30))")
  npx remotion still build MoktaEspejos out/sheet/$name/$(printf %02d $i).png --frame=$f --scale=0.4 --props='{"withAudio":false}' --log=error &
  i=$((i+1))
  if (( i % 4 == 0 )); then wait; fi
done
wait
python3 - "$name" "$@" <<'PY'
import sys, glob, subprocess
name=sys.argv[1]; times=sys.argv[2:]
files=sorted(glob.glob(f"out/sheet/{name}/[0-9][0-9].png"))
cols=6
rows=[files[i:i+cols] for i in range(0,len(files),cols)]
args=[]
for f in files: args+=["-i",f]
fc=""
labels=[]
for k,f in enumerate(files):
    fc+=f"[{k}:v]drawtext=text='{times[k]}s':x=10:y=10:fontsize=28:fontcolor=yellow:box=1:boxcolor=black@0.6[v{k}];"
rowouts=[]
for r,row in enumerate(rows):
    idx=[files.index(f) for f in row]
    while len(idx)<cols:
        fc+=f"color=black:s=432x768:d=1[pad{r}_{len(idx)}];"; idx.append(f"pad{r}_{len(idx)}")
    ins="".join(f"[v{i}]" if isinstance(i,int) else f"[{i}]" for i in idx)
    fc+=f"{ins}hstack=inputs={cols}[r{r}];"; rowouts.append(f"[r{r}]")
if len(rows)>1:
    fc+="".join(rowouts)+f"vstack=inputs={len(rows)}[out]"; m="[out]"
else:
    fc=fc.rstrip(";"); m=rowouts[0]
cmd=["ffmpeg","-v","error","-y"]+args+["-filter_complex",fc,"-map",m,"-frames:v","1","-update","1",f"out/sheet/{name}.png"]
subprocess.run(cmd,check=True)
print(f"out/sheet/{name}.png")
PY
