#!/bin/bash
# Une video + audio normalizado (-14 LUFS, -1 dBTP) → MP4 listo para Reels/TikTok/Shorts (yuv420p, BT.709, faststart).
set -e
cd "$(dirname "$0")/.."
ffmpeg -v error -y -i public/audio/soundtrack.wav -af loudnorm=I=-14:TP=-1.0:LRA=9 -ar 48000 out/audio_norm.wav
ffmpeg -v error -y -i out/video_only.mp4 -i out/audio_norm.wav \
  -map 0:v -map 1:a -c:v libx264 -preset slow -crf 17 -profile:v high -level 4.2 \
  -pix_fmt yuv420p -vf "scale=in_range=full:out_range=tv,format=yuv420p" \
  -color_range tv -colorspace bt709 -color_primaries bt709 -color_trc bt709 \
  -r 30 -g 30 -c:a aac -b:a 320k -ar 48000 -shortest -movflags +faststart \
  out/MOKTA_BotonRecirculacion_v1.mp4
echo ASSEMBLED
