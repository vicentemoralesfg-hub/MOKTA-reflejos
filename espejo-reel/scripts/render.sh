#!/bin/bash
# Render completo: video sin audio desde Remotion + mezcla normalizada (-14 LUFS, -1 dBTP) con ffmpeg.
set -e
cd "$(dirname "$0")/.."
export REMOTION_CHROME=${REMOTION_CHROME:-/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell}
[ -x "$REMOTION_CHROME" ] || unset REMOTION_CHROME
mkdir -p out
python3 scripts/mix_audio.py
npx remotion bundle src/index.ts --out-dir build --log=error
npx remotion render build EspejoRetrovisor out/video_only.mp4 --codec=h264 --crf=14 --muted \
  --concurrency=${CONCURRENCY:-4} --props='{"withAudio":false}' --log=error
ffmpeg -v error -y -i public/audio/soundtrack.wav \
  -af loudnorm=I=-14:TP=-1.0:LRA=11:print_format=summary -ar 48000 out/audio_norm.wav
ffmpeg -v error -y -i out/video_only.mp4 -i out/audio_norm.wav \
  -map 0:v -map 1:a -c:v libx264 -preset slow -crf 17 -profile:v high -level 4.2 \
  -pix_fmt yuv420p -vf "scale=in_range=full:out_range=tv,format=yuv420p" \
  -color_range tv -colorspace bt709 -color_primaries bt709 -color_trc bt709 \
  -r 30 -g 30 -c:a aac -b:a 320k -ar 48000 -shortest -movflags +faststart \
  out/MOKTA_PalancaEspejo_v1.mp4
echo "LISTO out/MOKTA_PalancaEspejo_v1.mp4"
