#!/bin/bash
# Masteriza el render de Remotion para Reels/TikTok/Shorts:
#  - video H.264 High, yuv420p rango TV, BT.709, GOP 1 s, faststart
#  - audio AAC 48 kHz estéreo, normalizado a −14 LUFS integrados / −1 dBTP (dos pasadas)
# Uso: scripts/master.sh out/render.mp4 out/MOKTA_Espejos_v1.mp4
set -e
cd "$(dirname "$0")/.."
IN=${1:-out/render_v1.mp4}
OUT=${2:-out/MOKTA_Espejos_v1.mp4}
STATS=$(ffmpeg -hide_banner -i "$IN" -map 0:a -af loudnorm=I=-14:TP=-1.0:LRA=11:print_format=json -f null - 2>&1 | sed -n '/^{/,/^}/p')
mI=$(echo "$STATS" | python3 -c "import sys,json;print(json.load(sys.stdin)['input_i'])")
mTP=$(echo "$STATS" | python3 -c "import sys,json;print(json.load(sys.stdin)['input_tp'])")
mLRA=$(echo "$STATS" | python3 -c "import sys,json;print(json.load(sys.stdin)['input_lra'])")
mTH=$(echo "$STATS" | python3 -c "import sys,json;print(json.load(sys.stdin)['input_thresh'])")
mOFF=$(echo "$STATS" | python3 -c "import sys,json;print(json.load(sys.stdin)['target_offset'])")
ffmpeg -v error -y -i "$IN" \
  -map 0:v -map 0:a \
  -c:v libx264 -preset slow -crf 17 -profile:v high -level 4.2 \
  -vf "scale=in_range=full:out_range=tv,format=yuv420p" \
  -color_range tv -colorspace bt709 -color_primaries bt709 -color_trc bt709 \
  -r 30 -g 30 \
  -af "loudnorm=I=-14:TP=-1.0:LRA=11:measured_I=$mI:measured_TP=$mTP:measured_LRA=$mLRA:measured_thresh=$mTH:offset=$mOFF:linear=true,aresample=48000" \
  -c:a aac -b:a 320k -ar 48000 -ac 2 -movflags +faststart \
  "$OUT"
echo "$OUT"
