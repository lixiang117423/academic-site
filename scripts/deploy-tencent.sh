#!/usr/bin/env bash
set -euo pipefail

project_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$project_root"

command -v pnpm >/dev/null
command -v rsync >/dev/null
command -v ssh >/dev/null

pnpm test
pnpm build:tencent

rsync -az --checksum --chmod=D755,F644 \
  -e "ssh -o BatchMode=yes -o ConnectTimeout=15" \
  dist/ tsy:/home/ubuntu/my_web/

ssh -o BatchMode=yes -o ConnectTimeout=15 tsy \
  'test -s /home/ubuntu/my_web/index.html && printf "Tencent Cloud deploy OK: /home/ubuntu/my_web/index.html\n"'
