#!/bin/bash
# Render del video (sin audio) a out/video_only.mp4. El audio se agrega normalizado en assemble.sh.
set -e
cd "$(dirname "$0")/.."
export REMOTION_CHROME=${REMOTION_CHROME:-/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell}
[ -x "$REMOTION_CHROME" ] || unset REMOTION_CHROME
mkdir -p out
npx remotion render src/index.ts MoktaRecirculacion out/video_only.mp4 \
  --codec=h264 --crf=14 --muted --concurrency=${CONCURRENCY:-4} \
  --props='{"withAudio":false}' --log=error
echo RENDERED
