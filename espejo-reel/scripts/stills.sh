#!/bin/bash
# Uso: scripts/stills.sh nombre f1 f2 ... → out/stills/<nombre>.jpg (hoja de contactos a 1/2 escala)
cd "$(dirname "$0")/.."
export REMOTION_CHROME=${REMOTION_CHROME:-/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell}
name=$1; shift
npx remotion bundle src/index.ts --out-dir build --log=error >/dev/null 2>&1 || { echo "BUNDLE FAIL"; exit 1; }
mkdir -p out/stills
for fr in "$@"; do
  npx remotion still build EspejoRetrovisor out/stills/s_$fr.jpg --frame=$fr --props='{"withAudio":false}' --log=error --scale=0.5 >/dev/null 2>out/stills/err_$fr.txt || { echo "FAIL $fr"; cat out/stills/err_$fr.txt | tail -5; }
done
python3 - "$name" "$@" <<'PY'
import sys
from PIL import Image, ImageDraw
name, frames = sys.argv[1], sys.argv[2:]
ims = [Image.open(f"out/stills/s_{f}.jpg") for f in frames]
w, h = ims[0].size
cols = min(5, len(ims)); rows = (len(ims) + cols - 1) // cols
sheet = Image.new("RGB", (w * cols, h * rows), "black")
d = ImageDraw.Draw(sheet)
for i, (im, f) in enumerate(zip(ims, frames)):
    x, y = (i % cols) * w, (i // cols) * h
    sheet.paste(im, (x, y)); d.text((x + 8, y + 8), f, fill=(0, 255, 0))
sheet.save(f"out/stills/{name}.jpg", quality=82)
PY
echo "out/stills/$name.jpg"
