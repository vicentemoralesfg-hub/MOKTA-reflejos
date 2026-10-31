#!/bin/bash
# Arma los dos MP4 finales a partir de:
#   out/base.mp4  (3D + HUD, sin subtítulos, sin audio)  ← remotion render SinSubtitulos
#   out/subs.mov  (solo subtítulos, ProRes 4444 con alfa) ← remotion render SoloSubtitulos
#   public/audio/mix.wav (locución + música + efectos)    ← scripts/build_audio.py
# Audio normalizado a −14 LUFS / −1 dBTP. Video H.264 High, yuv420p, BT.709, 30 fps, faststart.
set -e
cd "$(dirname "$0")/.."
NAME=${NAME:-CuandoTeMidieron}

# Sonoridad en dos pasadas (lineal): −14 LUFS integrados, pico real ≤ −1 dBTP
M=$(ffmpeg -hide_banner -i public/audio/mix.wav -af loudnorm=I=-14:TP=-1.5:LRA=11:print_format=json -f null - 2>&1 | sed -n '/^{/,/^}/p')
get() { echo "$M" | python3 -c "import json,sys; print(json.load(sys.stdin)['$1'])"; }
ffmpeg -v error -y -i public/audio/mix.wav \
  -af "loudnorm=I=-14:TP=-1.5:LRA=11:linear=true:measured_I=$(get input_i):measured_TP=$(get input_tp):measured_LRA=$(get input_lra):measured_thresh=$(get input_thresh):offset=$(get target_offset)" \
  -ar 48000 -ac 2 out/audio_norm.wav

ENC=(-c:v libx264 -preset slow -crf 17 -profile:v high -level 4.2 -pix_fmt yuv420p
     -color_range tv -colorspace bt709 -color_primaries bt709 -color_trc bt709
     -r 30 -g 60 -c:a aac -b:a 320k -ar 48000 -movflags +faststart -shortest)
# Remotion entrega el H.264 en rango completo con matriz BT.601 (yuvj420p) y los subtítulos en ProRes
# rango TV: cada capa se pasa a RGB con su propia matriz, se superponen en RGB y se codifica BT.709 rango TV.
BASE_RGB="scale=in_color_matrix=bt601:in_range=pc,format=gbrp"
SUBS_RGB="scale=in_color_matrix=bt601:in_range=tv,format=gbrap"
TO709="scale=out_color_matrix=bt709:out_range=tv,format=yuv420p"

ffmpeg -v error -y -i out/base.mp4 -i out/audio_norm.wav \
  -filter_complex "[0:v]${BASE_RGB},${TO709}[v]" -map "[v]" -map 1:a "${ENC[@]}" "out/${NAME}_sin_subtitulos.mp4"

ffmpeg -v error -y -i out/base.mp4 -i out/subs.mov -i out/audio_norm.wav \
  -filter_complex "[0:v]${BASE_RGB}[b];[1:v]${SUBS_RGB}[s];[b][s]overlay=0:0:format=gbrp[o];[o]${TO709}[v]" \
  -map "[v]" -map 2:a "${ENC[@]}" "out/${NAME}_con_subtitulos.mp4"

echo "listo: out/${NAME}_con_subtitulos.mp4 · out/${NAME}_sin_subtitulos.mp4"
