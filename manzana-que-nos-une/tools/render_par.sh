#!/bin/bash
# uso: tools/render_par.sh FPS NFRAMES WORKERS OUT.mp4
set -e
FPS=$1; N=$2; K=$3; OUT=$4
DIR=$(dirname "$0"); TMP=$(mktemp -d -p "$(dirname "$OUT")" parts.XXXX)
per=$(( (N + K - 1) / K )); pids=()
for ((i=0;i<K;i++)); do a=$((i*per)); b=$(( (i+1)*per )); ((b>N)) && b=$N
  node "$DIR/render.js" --from $a --to $b --fps $FPS --out "$TMP/p$i.mp4" > "$TMP/log$i.txt" 2>&1 & pids+=($!); done
for p in "${pids[@]}"; do wait $p; done
for ((i=0;i<K;i++)); do echo "file '$TMP/p$i.mp4'" >> "$TMP/list.txt"; done
ffmpeg -v error -y -f concat -safe 0 -i "$TMP/list.txt" -c copy "$OUT"
tail -n 2 "$TMP"/log*.txt | grep frame | tail -n 3
rm -rf "$TMP"
