#!/bin/bash
# Control de calidad del MP4 final: especificaciones, sonoridad, fotogramas negros y hoja de contactos.
F=${1:-out/MOKTA_KilometrajeEngana_v1.mp4}
cd "$(dirname "$0")/.."
echo "== Especificaciones"
ffprobe -v error -show_entries stream=codec_name,profile,width,height,pix_fmt,r_frame_rate,nb_frames,sample_rate,channels,bit_rate,color_space,color_range:format=duration,size -of default=nw=1 "$F"
echo "== Sonoridad"
ffmpeg -hide_banner -i "$F" -af ebur128=peak=true -f null - 2>&1 | grep -A14 Summary | grep -E "I:|LRA:|Peak:"
echo "== Fotogramas negros (>0,1 s)"
ffmpeg -hide_banner -i "$F" -vf blackdetect=d=0.1:pix_th=0.08 -an -f null - 2>&1 | grep -c black_start || true
echo "== Hoja de contactos"
mkdir -p out/qa
ffmpeg -v error -y -i "$F" -vf "fps=1/2,scale=216:-1,tile=6x5:padding=4:color=gray" -frames:v 1 out/qa/hoja_contactos.png && echo out/qa/hoja_contactos.png
