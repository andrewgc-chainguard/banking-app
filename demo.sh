#!/usr/bin/env bash
#
# Side-by-side supply-chain demo: install a (malicious) package from public npm
# vs through Chainguard Libraries (via the JFrog virtual repo).
#
# Usage:
#   JFROG_TOKEN=... ./demo.sh [package@version]
#   ./demo.sh                      # defaults to agent-dag@1.35.12
#
# Reads JFROG_TOKEN from the environment; if unset, tries to pull it from
# ~/mydata/cg-repo/libdemo/.npmrc. Nothing is written to the repo; each install
# runs in a throwaway temp dir with --ignore-scripts (real malware never executes).

set -uo pipefail

PKG="${1:-agent-dag@1.35.12}"
PUBLIC="https://registry.npmjs.org/"
CG_REG="https://chainguardlibraries.jfrog.io/artifactory/api/npm/andrewgc-jscript/"
CG_HOST="chainguardlibraries.jfrog.io/artifactory/api/npm/andrewgc-jscript"
LIBDEMO_NPMRC="$HOME/mydata/cg-repo/libdemo/.npmrc"

bold()  { printf "\n\033[1m%s\033[0m\n" "$1"; }
green() { printf "\033[32m%s\033[0m\n" "$1"; }
red()   { printf "\033[31m%s\033[0m\n" "$1"; }

# ---------------------------------------------------------------------------
bold "1) PUBLIC npm  —  $PKG"
D1=$(mktemp -d)
( cd "$D1" && npm init -y >/dev/null 2>&1 \
  && npm install "$PKG" --registry="$PUBLIC" --ignore-scripts --no-audit --no-fund )
r1=$?
if [ "$r1" -eq 0 ]; then
  green "   => INSTALLED from public npm — in a real build this malware ships."
else
  red   "   => not available on public npm (exit $r1) — likely yanked after the fact."
fi
rm -rf "$D1"

# ---------------------------------------------------------------------------
bold "2) Chainguard (JFrog virtual repo)  —  $PKG"

if [ -z "${JFROG_TOKEN:-}" ] && [ -f "$LIBDEMO_NPMRC" ]; then
  JFROG_TOKEN="$(grep _authToken "$LIBDEMO_NPMRC" | sed 's/.*_authToken=//')"
fi
if [ -z "${JFROG_TOKEN:-}" ]; then
  red "   JFROG_TOKEN not set and $LIBDEMO_NPMRC not found."
  echo "   Set it:  export JFROG_TOKEN=<your-artifactory-token>"
  exit 2
fi

D2=$(mktemp -d)
cat > "$D2/.npmrc" <<EOF
registry=$CG_REG
//$CG_HOST/:_authToken=$JFROG_TOKEN
EOF
cd "$D2" && npm init -y >/dev/null 2>&1
out=$(npm install "$PKG" --userconfig "$D2/.npmrc" --ignore-scripts --no-audit --no-fund 2>&1)
r2=$?
echo "$out"
cd - >/dev/null
rm -rf "$D2"

if [ "$r2" -eq 0 ]; then
  red   "   => INSTALLED through Chainguard — NOT blocked. Check the virtual repo for a public-npm remote ahead of Chainguard."
elif echo "$out" | grep -qiE "MALWARE_DETECTED|blocked by Chainguard for malware"; then
  green "   => BLOCKED by Chainguard — 403 MALWARE_DETECTED. The malicious package never entered the build."
else
  red   "   => Install failed (exit $r2) but WITHOUT a malware verdict (ETARGET/404/auth). Pick a package that's live on npm AND flagged, e.g. agent-dag@1.35.12."
fi

bold "Done."
