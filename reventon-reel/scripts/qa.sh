#!/bin/bash
# Control de calidad del MP4 final: especificaciones, sonoridad, fotogramas negros, duración A/V.
F=${1:-out/MOKTA_Reventon_v1.mp4}
echo "== $F"; ls -la "$F"
ffprobe -v error -show_entries stream=codec_name,profile,width,height,pix_fmt,r_frame_rate,nb_frames,sample_rate,channels,bit_rate,duration,color_range,color_space -of default=nw=1 "$F"
echo "== sonoridad"; ffmpeg -nostats -i "$F" -af ebur128=peak=true -f null - 2>&1 | grep -A20 "Summary" | grep -E "I:|LRA:|Peak:"
echo "== negros"; ffmpeg -nostats -i "$F" -vf blackdetect=d=0.05:pix_th=0.06 -an -f null - 2>&1 | grep -c black_start; true
