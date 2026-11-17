#!/usr/bin/env bash
# Uso: bash tools/boceto_post.sh <entrada.mp4> <salida.mp4>
# Convierte un render en gris (estilo boceto-base) en dibujo a lápiz sobre papel:
# bordes -> trazos oscuros, tonos suaves aclarados, multiplicado sobre la textura de papel.
set -euo pipefail
HERE="$(cd "$(dirname "$0")/.." && pwd)"
ffmpeg -v error -y -i "$1" -loop 1 -i "$HERE/public/historia/tex/papel.jpg" -filter_complex "
[0:v]format=gbrp,split[a][b];
[a]edgedetect=low=0.04:high=0.12:mode=wires,negate[lines];
[b]colorlevels=rimin=0:gimin=0:bimin=0:romin=0.28:gomin=0.28:bomin=0.34[soft];
[lines][soft]blend=all_mode=multiply[sk];
[1:v]scale=1080:1920,format=gbrp[pap];
[sk][pap]blend=all_mode=multiply:shortest=1,eq=contrast=1.12:brightness=0.04,format=yuv420p[v]" \
  -map "[v]" -map 0:a -c:v libx264 -preset medium -crf 23 -maxrate 7M -bufsize 14M -c:a aac -b:a 192k -movflags +faststart -shortest "$2"
