#!/bin/bash
# Render reanudable por bloques (MP4 sin audio); se omiten los bloques ya terminados.
cd "$(dirname "$0")/.."
export REMOTION_CHROME=${REMOTION_CHROME:-/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell}
[ -x "$REMOTION_CHROME" ] || unset REMOTION_CHROME
TOTAL=${TOTAL:-1800}; CH=${CH:-150}; CONC=${CONC:-4}
mkdir -p out/chunks
for ((a=0; a<TOTAL; a+=CH)); do
  b=$((a+CH-1)); [ $b -ge $TOTAL ] && b=$((TOTAL-1))
  f=$(printf "out/chunks/c_%04d.mp4" $a)
  [ -f "$f" ] && continue
  npx remotion render build Reventon "$f.tmp.mp4" --frames=$a-$b --codec=h264 --crf=15 --muted --concurrency=$CONC --gl=swangle --props='{"withAudio":false}' --log=error 2>&1 | grep -v -i "memory\|cgroup\|docker\|lower amount" ; [ -f "$f.tmp.mp4" ] && mv "$f.tmp.mp4" "$f" && echo "done $a-$b $(date +%T)" >> out/chunks/progress.log || { echo "FAIL $a-$b" >> out/chunks/progress.log; exit 1; }
done
echo ALLDONE >> out/chunks/progress.log
