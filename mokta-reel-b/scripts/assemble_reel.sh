#!/bin/bash
# Une el video del reel con su audio normalizado en dos pasadas (-14 LUFS, pico real ≤ -1 dBTP).
# Salida para Instagram Reels: 1080×1920 (9:16), 30 fps CFR, H.264 High yuv420p BT.709, AAC 48 kHz, faststart.
set -e
cd "$(dirname "$0")/.."
M=$(ffmpeg -hide_banner -nostats -i public/audio/reel.wav -af loudnorm=I=-14:TP=-1.5:LRA=11:print_format=json -f null - 2>&1 | sed -n '/^{/,/^}/p')
get() { echo "$M" | python3 -c "import json,sys; print(json.load(sys.stdin)['$1'])"; }
ffmpeg -v error -y -i public/audio/reel.wav -af "loudnorm=I=-14:TP=-1.5:LRA=11:measured_I=$(get input_i):measured_TP=$(get input_tp):measured_LRA=$(get input_lra):measured_thresh=$(get input_thresh):offset=$(get target_offset):linear=true,alimiter=limit=0.82:level=false" -ar 48000 out/reel_audio.wav
ffmpeg -v error -y -i out/reel_raw.mp4 -i out/reel_audio.wav -map 0:v -map 1:a \
  -c:v libx264 -preset slow -crf 17 -profile:v high -level 4.2 -pix_fmt yuv420p \
  -vf "scale=in_range=full:out_range=tv,format=yuv420p" -color_range tv -colorspace bt709 -color_primaries bt709 -color_trc bt709 \
  -r 30 -g 30 -c:a aac -b:a 256k -ar 48000 -shortest -movflags +faststart out/MOKTA_TestDeReflejos_B.mp4
echo OK
