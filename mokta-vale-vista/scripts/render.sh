#!/bin/bash
# Render final: video sin audio (Remotion) + mezcla normalizada (-14 LUFS, -1 dBTP) → out/MOKTA_FalsoValeVista.mp4
set -e
cd "$(dirname "$0")/.."
HS=/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell
[ -z "$REMOTION_CHROME" ] && [ -x "$HS" ] && export REMOTION_CHROME=$HS
mkdir -p out
npx remotion bundle src/index.ts --out-dir build --log=error
npx remotion render build FalsoValeVista out/video_only.mp4 --codec=h264 --crf=16 --muted --concurrency=${CONC:-4} --props='{"withAudio":false}' --log=error
ffmpeg -v error -y -i public/audio/mix.wav -af loudnorm=I=-14:TP=-1.0:LRA=9 -ar 48000 out/audio_norm.wav
ffmpeg -v error -y -i out/video_only.mp4 -i out/audio_norm.wav \
  -map 0:v -map 1:a -c:v libx264 -preset slow -crf 21 -profile:v high -level 4.2 \
  -pix_fmt yuv420p -vf "scale=in_range=full:out_range=tv,format=yuv420p" \
  -color_range tv -colorspace bt709 -color_primaries bt709 -color_trc bt709 \
  -r 30 -g 30 -c:a aac -b:a 320k -ar 48000 -shortest -movflags +faststart \
  out/MOKTA_FalsoValeVista.mp4
echo LISTO
