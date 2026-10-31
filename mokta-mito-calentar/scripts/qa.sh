#!/bin/bash
# Control de calidad de los MP4 entregados: formato, duración, sonoridad, fotogramas negros y congelados.
cd "$(dirname "$0")/.."
for f in entrega/*.mp4; do
  echo "== $f ($(du -h "$f" | cut -f1))"
  ffprobe -v error -show_entries stream=codec_name,profile,width,height,pix_fmt,r_frame_rate,nb_frames,sample_rate,channels,bit_rate,color_space -show_entries format=duration -of compact=p=0:nk=0 "$f"
  ffmpeg -nostats -i "$f" -map 0:a -af ebur128=peak=true -f null - 2>&1 | grep -A12 Summary | grep -E "I:|Peak:|LRA:" | tr -s ' '
  echo "negros: $(ffmpeg -nostats -i "$f" -vf blackdetect=d=0.1:pix_th=0.06 -an -f null - 2>&1 | grep -c black_start)"
  echo "congelados >1s: $(ffmpeg -nostats -i "$f" -vf freezedetect=n=0.002:d=1 -an -f null - 2>&1 | grep -c freeze_start)"
done
