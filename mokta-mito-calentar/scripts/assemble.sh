#!/bin/bash
# Une el video renderizado (sin audio) con cada mezcla, normalizada a −14 LUFS / −1 dBTP (loudnorm en 2 pasadas, lineal).
# Salida: H.264 High yuv420p BT.709 + AAC 48 kHz, faststart (listo para Reels / TikTok / Shorts).
set -e
cd "$(dirname "$0")/.."
VIDEO=${VIDEO:-out/video_muted.mp4}
mkdir -p entrega

norm() { # $1 = wav de entrada, $2 = wav de salida
  local m
  m=$(ffmpeg -hide_banner -nostats -i "$1" -af loudnorm=I=-14:TP=-1.0:LRA=11:print_format=json -f null - 2>&1 | sed -n '/^{/,/^}/p')
  local ii tp lra th off
  ii=$(echo "$m" | python3 -c "import sys,json;print(json.load(sys.stdin)['input_i'])")
  tp=$(echo "$m" | python3 -c "import sys,json;print(json.load(sys.stdin)['input_tp'])")
  lra=$(echo "$m" | python3 -c "import sys,json;print(json.load(sys.stdin)['input_lra'])")
  th=$(echo "$m" | python3 -c "import sys,json;print(json.load(sys.stdin)['input_thresh'])")
  off=$(echo "$m" | python3 -c "import sys,json;print(json.load(sys.stdin)['target_offset'])")
  ffmpeg -v error -y -i "$1" -af "loudnorm=I=-14:TP=-1.0:LRA=11:measured_I=$ii:measured_TP=$tp:measured_LRA=$lra:measured_thresh=$th:offset=$off:linear=true" -ar 48000 "$2"
}

mux() { # $1 = wav normalizado, $2 = mp4 de salida
  ffmpeg -v error -y -i "$VIDEO" -i "$1" -map 0:v -map 1:a \
    -c:v libx264 -preset slow -crf 17 -profile:v high -level 4.2 -pix_fmt yuv420p \
    -color_range tv -colorspace bt709 -color_primaries bt709 -color_trc bt709 \
    -r 30 -g 30 -c:a aac -b:a 320k -ar 48000 -shortest -movflags +faststart "$2"
}

norm public/audio/mix.wav out/mix_norm.wav
norm public/audio/mix_sinvoz.wav out/mix_sinvoz_norm.wav
mux out/mix_norm.wav entrega/MOKTA_MitoCalentarAuto_${VERSION:-v2}.mp4
mux out/mix_sinvoz_norm.wav entrega/MOKTA_MitoCalentarAuto_${VERSION:-v2}_sinvoz.mp4
echo ASSEMBLED
