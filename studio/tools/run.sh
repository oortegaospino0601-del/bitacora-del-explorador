#!/usr/bin/env bash
# Uso: bash studio/tools/run.sh studio/specs/<slug>.json
set -euo pipefail
HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"   # studio/
SPEC="$(realpath "$1")"

if ! python3 -c "import kokoro_onnx, soundfile, num2words" 2>/dev/null; then
  pip install --break-system-packages -q kokoro-onnx soundfile numpy num2words
fi
if [ ! -d "$HERE/node_modules/remotion" ]; then
  (cd "$HERE" && npm install --silent --no-audit --no-fund)
fi
python3 -I "$HERE/tools/make.py" "$SPEC"
