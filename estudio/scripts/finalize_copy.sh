#!/bin/bash
# Como finalize.sh pero sin recodificar el video (solo cambia el audio): scripts/finalize_copy.sh <video> <audio.wav> <salida.mp4>
set -e
IN=$1; WAV=$2; OUT=$3
J=$(ffmpeg -hide_banner -i "$WAV" -af loudnorm=I=-14:TP=-1.0:LRA=11:print_format=json -f null - 2>&1 | sed -n '/^{/,/^}/p')
g() { echo "$J" | python3 -c "import sys,json;print(json.load(sys.stdin)['$1'])"; }
AF="loudnorm=I=-14:TP=-1.0:LRA=11:measured_I=$(g input_i):measured_TP=$(g input_tp):measured_LRA=$(g input_lra):measured_thresh=$(g input_thresh):offset=$(g target_offset):linear=true"
ffmpeg -hide_banner -loglevel error -y -i "$IN" -i "$WAV" -map 0:v -map 1:a -c:v copy -af "$AF,alimiter=limit=0.8:level=false" -ar 48000 -c:a aac -b:a 256k -shortest -movflags +faststart "$OUT"
ffmpeg -hide_banner -i "$OUT" -af ebur128=peak=true -f null - 2>&1 | grep -E "^\s+(I|Peak):" | tr -s ' ' | tr '\n' ' '; echo
