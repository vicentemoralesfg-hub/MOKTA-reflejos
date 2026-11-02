#!/bin/bash
# Entrega final para Reels: H.264 High yuv420p BT.709 + AAC 48 kHz, audio a -14 LUFS / -1 dBTP (dos pasadas), faststart.
# Uso: scripts/finalize.sh <video_render.mp4> <audio.wav> <salida.mp4>
set -e
IN=$1; WAV=$2; OUT=$3
J=$(ffmpeg -hide_banner -i "$WAV" -af loudnorm=I=-14:TP=-1.0:LRA=11:print_format=json -f null - 2>&1 | sed -n '/^{/,/^}/p')
g() { echo "$J" | python3 -c "import sys,json;print(json.load(sys.stdin)['$1'])"; }
AF="loudnorm=I=-14:TP=-1.0:LRA=11:measured_I=$(g input_i):measured_TP=$(g input_tp):measured_LRA=$(g input_lra):measured_thresh=$(g input_thresh):offset=$(g target_offset):linear=true"
ffmpeg -hide_banner -loglevel error -y -i "$IN" -i "$WAV" -map 0:v -map 1:a \
  -c:v libx264 -preset slow -crf 17 -profile:v high -level 4.2 -pix_fmt yuv420p \
  -color_range tv -colorspace bt709 -color_primaries bt709 -color_trc bt709 \
  -r 30 -g 60 -af "$AF,alimiter=limit=0.84:level=false" -ar 48000 -c:a aac -b:a 256k -shortest -movflags +faststart "$OUT"
ffmpeg -hide_banner -i "$OUT" -af ebur128=peak=true -f null - 2>&1 | grep -E "^\s+(I|True peak|Peak):" | tr -s ' ' | tr '\n' ' '
echo; ffprobe -v error -show_entries stream=codec_name,width,height,r_frame_rate,duration -of compact "$OUT"
