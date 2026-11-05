#!/bin/bash
# Render reanudable por bloques (MP4 sin audio). Omite los bloques ya terminados.
cd "$(dirname "$0")/.."
export REMOTION_CHROME=${REMOTION_CHROME:-/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell}
[ -x "$REMOTION_CHROME" ] || unset REMOTION_CHROME
TOTAL=$(node -e "const t=require('./src/data/timeline.json'),v=require('./src/data/vo.json');console.log(t.scenes.reduce((a,s)=>a+Math.round((s.voStart+v[s.id].duration+s.tail)*t.fps),0))")
CH=${CH:-150}; CONC=${CONC:-2}
mkdir -p out/chunks
[ -d build ] || npx remotion bundle src/index.ts --out-dir build --log=error
for ((a=0; a<TOTAL; a+=CH)); do
  b=$((a+CH-1)); [ $b -ge $TOTAL ] && b=$((TOTAL-1))
  f=$(printf "out/chunks/c_%05d.mp4" $a)
  [ -f "$f" ] && continue
  npx remotion render build AutosChocados "$f.tmp.mp4" --frames=$a-$b --codec=h264 --crf=16 --muted --concurrency=$CONC --props='{"withAudio":false}' --log=error \
    && mv "$f.tmp.mp4" "$f" && echo "done $a-$b $(date +%T)" >> out/chunks/progress.log \
    || { echo "FAIL $a-$b" >> out/chunks/progress.log; exit 1; }
done
echo "ALLDONE $TOTAL" >> out/chunks/progress.log
