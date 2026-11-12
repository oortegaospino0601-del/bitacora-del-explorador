#!/usr/bin/env bash
# Uso: bash studio/tools/publish.sh <slug>
# Copia el MP4 a videos/, hace commit y push a la rama shorts-videos y
# imprime la URL pública (raw.githubusercontent.com) lista para Metricool.
set -euo pipefail
SLUG="$1"
REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$REPO_ROOT"
STAMP="$(TZ=America/Bogota date +%Y%m%d-%H%M)"
FILE="videos/${STAMP}-${SLUG}.mp4"
mkdir -p videos specs
cp "studio/out/${SLUG}.mp4" "$FILE"
[ -f "studio/specs/${SLUG}.json" ] && cp "studio/specs/${SLUG}.json" "specs/${STAMP}-${SLUG}.json" || true
git add "$FILE" specs studio/specs 2>/dev/null || git add "$FILE"
git commit -q -m "Short: ${SLUG}"
for i in 1 2 3; do
  git pull -q --rebase origin shorts-videos 2>/dev/null || true
  if git push -q origin shorts-videos; then break; fi
  sleep 5
done
REMOTE="$(git remote get-url origin | sed -E 's#(https://[^/]*@|https://)github.com/##; s#\.git$##')"
URL="https://raw.githubusercontent.com/${REMOTE}/shorts-videos/${FILE}"
for i in $(seq 1 12); do
  code="$(curl -s -o /dev/null -w '%{http_code}' -I "$URL" || true)"
  [ "$code" = "200" ] && break
  sleep 5
done
echo "HTTP ${code:-?}"
echo "URL_PUBLICA=${URL}"
