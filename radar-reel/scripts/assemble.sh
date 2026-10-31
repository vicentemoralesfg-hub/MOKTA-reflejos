#!/bin/bash
# Arma los dos MP4 finales a partir de:
#   out/base.mp4  (3D + HUD, sin subtítulos, sin audio)  ← remotion render SinSubtitulos
#   out/subs.mov  (solo subtítulos, ProRes 4444 con alfa) ← remotion render SoloSubtitulos
#   public/audio/mix.wav y mix_sin_musica.wav               ← scripts/build_audio.py
# Audio normalizado a −14 LUFS / −1 dBTP. Video H.264 High, yuv420p, BT.709, 30 fps, faststart.
set -e
cd "$(dirname "$0")/.."
NAME=${NAME:-CuandoTeMidieron}

# Sonoridad en dos pasadas (lineal): −14 LUFS integrados, pico real ≤ −1 dBTP
norm() {
  local M
  M=$(ffmpeg -hide_banner -i "$1" -af loudnorm=I=-14:TP=-1.5:LRA=11:print_format=json -f null - 2>&1 | sed -n '/^{/,/^}/p')
  get() { echo "$M" | python3 -c "import json,sys; print(json.load(sys.stdin)['$1'])"; }
  ffmpeg -v error -y -i "$1" \
    -af "loudnorm=I=-14:TP=-1.5:LRA=11:linear=true:measured_I=$(get input_i):measured_TP=$(get input_tp):measured_LRA=$(get input_lra):measured_thresh=$(get input_thresh):offset=$(get target_offset)" \
    -ar 48000 -ac 2 "$2"
}
norm public/audio/mix.wav out/audio_con_musica.wav
norm public/audio/mix_sin_musica.wav out/audio_sin_musica.wav

ENC=(-c:v libx264 -preset slow -crf 17 -profile:v high -level 4.2 -pix_fmt yuv420p
     -color_range tv -colorspace bt709 -color_primaries bt709 -color_trc bt709
     -r 30 -g 60 -c:a aac -b:a 320k -ar 48000 -movflags +faststart -shortest)
# Remotion entrega el H.264 en rango completo con matriz BT.601 (yuvj420p) y los subtítulos en ProRes
# rango TV: cada capa se pasa a RGB con su propia matriz, se superponen en RGB y se codifica BT.709 rango TV.
BASE_RGB="scale=in_color_matrix=bt601:in_range=pc,format=gbrp"
SUBS_RGB="scale=in_color_matrix=bt601:in_range=tv,format=gbrap"
TO709="scale=out_color_matrix=bt709:out_range=tv,format=yuv420p"

# video con subtítulos (una sola vez) y luego cada versión de audio
ffmpeg -v error -y -i out/base.mp4 -i out/subs.mov \
  -filter_complex "[0:v]${BASE_RGB}[b];[1:v]${SUBS_RGB}[s];[b][s]overlay=0:0:format=gbrp[o];[o]${TO709}[v]" \
  -map "[v]" -c:v libx264 -preset slow -crf 17 -profile:v high -level 4.2 -pix_fmt yuv420p \
  -color_range tv -colorspace bt709 -color_primaries bt709 -color_trc bt709 -r 30 -g 60 -movflags +faststart out/video_subs.mp4

for v in con_musica sin_musica; do
  ffmpeg -v error -y -i out/video_subs.mp4 -i "out/audio_${v}.wav" -map 0:v -map 1:a -c:v copy \
    -c:a aac -b:a 320k -ar 48000 -movflags +faststart -shortest "out/${NAME}_${v}.mp4"
done
echo "listo: out/${NAME}_con_musica.mp4 · out/${NAME}_sin_musica.mp4"
