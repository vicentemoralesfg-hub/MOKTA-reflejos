#!/bin/bash
# Une el video (sin audio) con la pista normalizada a -14 LUFS / -1 dBTP (loudnorm en dos pasadas).
set -e
cd "$(dirname "$0")/../.."
IN_V=${1:-out/bencina_video.mp4}
OUT=${2:-out/MOKTA_Bencina_UltimosKm_v1.mp4}
MEAS=$(ffmpeg -hide_banner -nostats -i public/bencina/soundtrack.wav -af loudnorm=I=-14:TP=-1.0:LRA=9:print_format=json -f null - 2>&1 | sed -n '/^{/,/^}/p')
get() { echo "$MEAS" | python3 -c "import json,sys; print(json.load(sys.stdin)['$1'])"; }
ffmpeg -v error -y -i public/bencina/soundtrack.wav \
  -af "loudnorm=I=-14:TP=-1.0:LRA=9:measured_I=$(get input_i):measured_TP=$(get input_tp):measured_LRA=$(get input_lra):measured_thresh=$(get input_thresh):offset=$(get target_offset):linear=true" \
  -ar 48000 out/bencina_audio_norm.wav
ffmpeg -v error -y -i "$IN_V" -i out/bencina_audio_norm.wav \
  -map 0:v -map 1:a -c:v libx264 -preset slow -crf 17 -profile:v high -level 4.2 \
  -pix_fmt yuv420p -vf "scale=in_range=full:out_range=tv,format=yuv420p" \
  -color_range tv -colorspace bt709 -color_primaries bt709 -color_trc bt709 \
  -r 30 -g 30 -c:a aac -b:a 320k -ar 48000 -shortest -movflags +faststart "$OUT"
echo "OK → $OUT"
