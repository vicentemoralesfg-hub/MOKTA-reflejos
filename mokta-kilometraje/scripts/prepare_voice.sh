#!/bin/bash
# Locución: acelera 8 % sin cambiar el tono (rubberband), limpia graves y comprime suave.
# Entrada: voz/locucion_elevenlabs.mp3 (ElevenLabs, voz "Mario", eleven_v4)
# Salida:  out/voz_procesada.wav (48 kHz mono) — la mezcla la hace scripts/gen_audio.py
set -e
cd "$(dirname "$0")/.."
SPEED=$(python3 -c "import json;print(json.load(open('src/data/timeline.json'))['voiceSpeed'])" 2>/dev/null || echo 1.08)
mkdir -p out
ffmpeg -v error -y -i voz/locucion_elevenlabs.mp3 \
  -af "rubberband=tempo=${SPEED}:pitchq=quality:formant=preserved,highpass=f=75,equalizer=f=3200:t=q:w=1.2:g=2,acompressor=threshold=-20dB:ratio=2.5:attack=8:release=120:makeup=2" \
  -ar 48000 -ac 1 out/voz_procesada.wav
echo "voz lista (tempo ${SPEED})"
