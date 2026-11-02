#!/bin/bash
# Hoja de contacto: scripts/sheet.sh <dir> <out.jpg> [columnas]
set -e
cols=${3:-6}
montage "$1"/f*.jpeg -label '%t' -font DejaVu-Sans -pointsize 22 -geometry 270x480+6+6 -tile ${cols}x -background '#222' -fill white "$2"
