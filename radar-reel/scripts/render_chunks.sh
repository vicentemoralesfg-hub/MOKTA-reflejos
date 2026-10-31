#!/bin/bash
# Render del 3D por bloques reanudables: cada bloque es un MP4 (sin audio) y se omiten los ya terminados.
# Si el proceso se corta, basta volver a ejecutarlo. Al final une los bloques en out/base.mp4.
set -e
cd "$(dirname "$0")/.."
export REMOTION_CHROME=${REMOTION_CHROME:-/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell}
TOTAL=$(python3 -c "import json; print(json.load(open('src/data/words.json'))['durationInFrames'])")
CH=${CH:-150}
mkdir -p out/chunks
for ((a=0; a<TOTAL; a+=CH)); do
  b=$((a+CH-1)); [ $b -ge $TOTAL ] && b=$((TOTAL-1))
  f=$(printf "out/chunks/c_%04d_%04d.mp4" $a $b)
  [ -f "$f" ] && continue
  npx remotion render src/index.ts SinSubtitulos "$f.tmp.mp4" --props='{"subtitles":false,"withAudio":false}' \
    --muted --codec=h264 --crf=12 --concurrency=3 --frames=$a-$b --log=error
  mv "$f.tmp.mp4" "$f"
  echo "bloque $a-$b listo $(date +%T)" >> out/chunks/progress.log
done
(cd out/chunks && ls c_*.mp4 | sort | sed "s/^/file '/; s/$/'/") > out/chunks/list.txt
ffmpeg -v error -y -f concat -safe 0 -i out/chunks/list.txt -c copy out/base.mp4
echo "TODO_LISTO $(date +%T)" >> out/chunks/progress.log
