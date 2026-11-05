#!/bin/bash
# Render final: video (Remotion, sin audio) + banda sonora masterizada → MP4 listo para Reels/TikTok/Shorts.
# Uso: ./scripts/render.sh            (REMOTION_CHROME opcional: ruta a un Chrome headless local)
set -e
cd "$(dirname "$0")/.."
mkdir -p out
npx remotion bundle src/index.ts --out-dir build --log=error
npx remotion render build MoktaKilometraje out/video_mudo.mp4 \
  --codec=h264 --crf=15 --muted --props='{"withAudio":false}' --concurrency=${CONCURRENCY:-4} --log=error
ffmpeg -v error -y -i out/video_mudo.mp4 -i public/audio/soundtrack.wav \
  -map 0:v -map 1:a -c:v libx264 -preset slow -crf 17 -profile:v high -level 4.2 \
  -pix_fmt yuv420p -vf "scale=in_range=full:out_range=tv,format=yuv420p" \
  -color_range tv -colorspace bt709 -color_primaries bt709 -color_trc bt709 \
  -r 30 -g 30 -c:a aac -b:a 320k -ar 48000 -shortest -movflags +faststart \
  out/MOKTA_KilometrajeEngana_v1.mp4
echo "LISTO: out/MOKTA_KilometrajeEngana_v1.mp4"
