#!/usr/bin/env sh
# Runs Biome format+lint on staged files. Skips gracefully when the binary is
# missing (e.g. a broken `npm install`) — it installs normally via `npm install`.
if [ ! -x node_modules/.bin/biome ]; then
  echo "⚠ biome binary missing — run 'npm install' to enable format/lint checks."
  exit 0
fi
exec node_modules/.bin/biome check --write --no-errors-on-unmatched "$@"
