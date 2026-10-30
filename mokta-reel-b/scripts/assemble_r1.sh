#!/bin/bash
# Une el video del prototipo con su audio normalizado (-14 LUFS, -1 dBTP), H.264 + AAC para Instagram.
set -e
cd "$(dirname "$0")/.."
ffmpeg -v error -y -i public/audio/r1.wav -af "loudnorm=I=-14:TP=-1.5:LRA=11,alimiter=limit=0.84:level=false" -ar 48000 out/r1_audio.wav
ffmpeg -v error -y -i out/r1_raw.mp4 -i out/r1_audio.wav -map 0:v -map 1:a \
  -c:v libx264 -preset slow -crf 17 -profile:v high -pix_fmt yuv420p \
  -vf "scale=in_range=full:out_range=tv,format=yuv420p" -color_range tv -colorspace bt709 -color_primaries bt709 -color_trc bt709 \
  -r 30 -c:a aac -b:a 320k -shortest -movflags +faststart out/MOKTA_PrototipoRonda1.mp4
echo OK
