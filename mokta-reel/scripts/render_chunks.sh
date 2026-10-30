#!/bin/bash
# Render reanudable por bloques: cada bloque es un MP4 sin audio; se omiten los ya terminados.
cd "$(dirname "$0")/.."
export REMOTION_CHROME=${REMOTION_CHROME:-/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell}
[ -x "$REMOTION_CHROME" ] || unset REMOTION_CHROME
TOTAL=${TOTAL:-1007}; CH=${CH:-60}
mkdir -p out/chunks
for ((a=0; a<TOTAL; a+=CH)); do
  b=$((a+CH-1)); [ $b -ge $TOTAL ] && b=$((TOTAL-1))
  f=$(printf "out/chunks/c_%04d.mp4" $a)
  [ -f "$f" ] && continue
  npx remotion render build MoktaReflejos "$f.tmp.mp4" --frames=$a-$b --codec=h264 --crf=16 --muted --concurrency=1 --props='{"withAudio":false}' --log=error && mv "$f.tmp.mp4" "$f" && echo "done $a-$b $(date +%T)" >> out/chunks/progress.log || { echo "FAIL $a-$b" >> out/chunks/progress.log; exit 1; }
done
echo ALLDONE >> out/chunks/progress.log
