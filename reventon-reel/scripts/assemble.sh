#!/bin/bash
# Une los bloques, añade la mezcla normalizada (-14 LUFS, -1 dBTP) y exporta H.264/AAC listo para Reels.
set -e
cd "$(dirname "$0")/.."
(cd out/chunks && ls c_*.mp4 | sort | sed "s/^/file '/; s/$/'/") > out/chunks/list.txt
ffmpeg -v error -y -f concat -safe 0 -i out/chunks/list.txt -c copy out/video_only.mp4
ffmpeg -v error -y -i public/audio/mezcla.wav -af "volume=4dB,alimiter=limit=0.79:attack=3:release=60:level=false" -ar 48000 out/mezcla_lim.wav
# loudnorm en dos pasadas (medición + corrección lineal) para clavar -14 LUFS
M=$(ffmpeg -hide_banner -i out/mezcla_lim.wav -af loudnorm=I=-14:TP=-1.0:LRA=11:print_format=json -f null - 2>&1 | sed -n '/^{/,/^}/p')
mI=$(echo "$M" | python3 -c "import json,sys;print(json.load(sys.stdin)['input_i'])")
mTP=$(echo "$M" | python3 -c "import json,sys;print(json.load(sys.stdin)['input_tp'])")
mLRA=$(echo "$M" | python3 -c "import json,sys;print(json.load(sys.stdin)['input_lra'])")
mTH=$(echo "$M" | python3 -c "import json,sys;print(json.load(sys.stdin)['input_thresh'])")
mOFF=$(echo "$M" | python3 -c "import json,sys;print(json.load(sys.stdin)['target_offset'])")
ffmpeg -v error -y -i out/mezcla_lim.wav -af loudnorm=I=-14:TP=-1.0:LRA=11:measured_I=$mI:measured_TP=$mTP:measured_LRA=$mLRA:measured_thresh=$mTH:offset=$mOFF:linear=true -ar 48000 out/audio_norm.wav
ffmpeg -v error -y -i out/video_only.mp4 -i out/audio_norm.wav \
  -map 0:v -map 1:a -c:v libx264 -preset slow -crf 17 -profile:v high -level 4.2 \
  -pix_fmt yuv420p -vf "scale=in_range=full:out_range=tv,format=yuv420p" \
  -color_range tv -colorspace bt709 -color_primaries bt709 -color_trc bt709 \
  -r 30 -g 30 -c:a aac -b:a 320k -ar 48000 -shortest -movflags +faststart \
  out/MOKTA_Reventon_v1.mp4
echo ASSEMBLED
