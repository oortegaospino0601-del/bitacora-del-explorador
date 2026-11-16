#!/usr/bin/env bash
# Uso: bash tools/revisar.sh <slug> <carpeta_salida>
# Renderiza 2 fotogramas por escena y los junta en <carpeta>/hoja-<slug>.png para revisarlos.
set -euo pipefail
SLUG="$1"; OUT="$2"
cd "$(dirname "$0")/.."
COMP=$(echo "$SLUG" | sed 's/^historia-/Historia-/')
rm -rf "$OUT/st-$SLUG"; mkdir -p "$OUT/st-$SLUG"
F=$(python3 -c "
import json;tl=json.load(open('src/styles/historia/timeline-$SLUG.json'))
s=0;out=[15]
for d in tl['durations']:
  out+=[int((s+0.9)*30), int((s+d-0.3)*30)]; s+=d
print(' '.join(map(str,out)))")
CHROME=${CHROME:-/opt/pw-browsers/chromium} node tools/stills.mjs "$OUT/st-$SLUG" "$COMP" $F 2>&1 | grep -v -i "memory\|docker\|cgroup" | tail -2
ffmpeg -v error -y -pattern_type glob -i "$OUT/st-$SLUG/f*.png" -vf "scale=216:384,tile=7x4" -frames:v 1 "$OUT/hoja-$SLUG.png"
echo "$OUT/hoja-$SLUG.png"
