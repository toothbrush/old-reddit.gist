#!/usr/bin/env bash
# Serve the repo over HTTP so the dev loader can fetch old-reddit.user.js live.
# Usage: dev/serve.sh   (Ctrl-C to stop)
set -euo pipefail
cd "$(dirname "$0")/.."
echo "Serving $(pwd) at http://localhost:8765/  (old-reddit.user.js is the file the loader fetches)"
exec python3 -m http.server 8765
