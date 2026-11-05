#!/bin/bash
# Une los bloques de video, normaliza el audio (-14 LUFS, -1 dBTP) y exporta el MP4 final para Reels/TikTok/Shorts.
set -e
cd "$(dirname "$0")/.."
OUT=${OUT:-out/MOKTA_AutosChocados_v1.mp4}
(cd out/chunks && ls c_*.mp4 | sort | sed "s/^/file '/; s/$/'/") > out/chunks/list.txt
ffmpeg -v error -y -f concat -safe 0 -i out/chunks/list.txt -c copy out/video_only.mp4
ffmpeg -v error -y -i public/audio/soundtrack.wav -af loudnorm=I=-14:TP=-1.0:LRA=9 -ar 48000 out/audio_norm.wav
ffmpeg -v error -y -i out/video_only.mp4 -i out/audio_norm.wav \
  -map 0:v -map 1:a -c:v libx264 -preset slow -crf 18 -profile:v high -level 4.2 \
  -pix_fmt yuv420p -vf "scale=in_range=full:out_range=tv,format=yuv420p" \
  -color_range tv -colorspace bt709 -color_primaries bt709 -color_trc bt709 \
  -r 30 -g 60 -c:a aac -b:a 256k -ar 48000 -shortest -movflags +faststart "$OUT"
echo "OK -> $OUT"
