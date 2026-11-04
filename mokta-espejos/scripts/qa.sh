#!/bin/bash
# Control de calidad del MP4 final: especificaciones, sonoridad, fotogramas negros y hoja de contactos.
# Uso: scripts/qa.sh entrega/MOKTA_Espejos_v1.mp4
set -e
cd "$(dirname "$0")/.."
F=${1:-entrega/MOKTA_Espejos_v1.mp4}
echo "== Especificaciones"
ffprobe -v error -show_entries stream=codec_name,profile,width,height,pix_fmt,color_range,color_space,r_frame_rate,nb_frames,sample_rate,channels,bit_rate,duration -of default=nw=1 "$F"
echo "== Sonoridad (EBU R128)"
ffmpeg -hide_banner -nostats -i "$F" -map 0:a -af ebur128=peak=true -f null - 2>&1 | grep -A12 "Summary:" | grep -E "I:|LRA:|Peak:"
echo "== Fotogramas negros"
ffmpeg -hide_banner -nostats -i "$F" -vf blackdetect=d=0.05:pix_th=0.06 -an -f null - 2>&1 | grep -c black_start || true
echo "== Silencios de audio > 0,6 s"
ffmpeg -hide_banner -nostats -i "$F" -af silencedetect=noise=-45dB:d=0.6 -vn -f null - 2>&1 | grep -E "silence_(start|end)" || echo "ninguno"
echo "== Hoja de contactos"
mkdir -p out/qa
ffmpeg -v error -y -i "$F" -vf "fps=1/2,scale=270:-1,tile=9x3:padding=4:color=black" -frames:v 1 out/qa/hoja.png
echo out/qa/hoja.png
