#!/usr/bin/env bash
#
# Build and run the banking app with ALL dependencies resolved through
# Chainguard Libraries (via the JFrog virtual repo). This proves the real app
# works unchanged on the secure registry — the "zero developer friction" beat.
#
# Usage:  ./run-cg.sh
#
# Reads JFROG_TOKEN from the environment, or auto-pulls it from
# ~/mydata/cg-repo/libdemo/.npmrc. The token is written only to a temp file
# (never to the repo's .npmrc), so nothing can be committed by accident.

set -euo pipefail

CG_REG="https://chainguardlibraries.jfrog.io/artifactory/api/npm/andrewgc-jscript/"
CG_HOST="chainguardlibraries.jfrog.io/artifactory/api/npm/andrewgc-jscript"
LIBDEMO_NPMRC="$HOME/mydata/cg-repo/libdemo/.npmrc"

if [ -z "${JFROG_TOKEN:-}" ] && [ -f "$LIBDEMO_NPMRC" ]; then
  JFROG_TOKEN="$(grep _authToken "$LIBDEMO_NPMRC" | sed 's/.*_authToken=//')"
fi
if [ -z "${JFROG_TOKEN:-}" ]; then
  echo "JFROG_TOKEN not set and $LIBDEMO_NPMRC not found." >&2
  echo "Run:  export JFROG_TOKEN=<your-artifactory-token>" >&2
  exit 2
fi

TMP_NPMRC="$(mktemp)"
trap 'rm -f "$TMP_NPMRC"' EXIT
cat > "$TMP_NPMRC" <<EOF
registry=$CG_REG
//$CG_HOST/:_authToken=$JFROG_TOKEN
EOF

echo "==> Clean install of the banking app THROUGH Chainguard (this can be slow on a cold cache)..."
rm -rf node_modules package-lock.json
npm install --userconfig "$TMP_NPMRC"

echo
echo "==> All dependencies resolved via Chainguard. Same app, secure supply chain."
echo "==> Starting at http://localhost:3000  (Ctrl+C to stop)"
npm run dev
