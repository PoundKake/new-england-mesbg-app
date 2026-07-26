#!/usr/bin/env bash
# Full local dev reset: stops the docker compose stack, rebuilds every
# image, brings it back up, installs any new npm packages, then starts the
# Nuxt dev server (Vite HMR). Named volumes (pgdata, caddy_data, ...) are
# left untouched, so the database survives the reset.
set -euo pipefail
cd "$(dirname "${BASH_SOURCE[0]}")/.."

step() { printf '\033[1;36m==> %s\033[0m\n' "$1"; }

step 'Stopping docker compose stack'
docker compose down --remove-orphans

# Runs before the docker build: the app image's Dockerfile uses `npm ci`,
# which requires package-lock.json to already be in sync with package.json.
# `npm install` (not `npm ci`) is what brings a lock file that's fallen
# behind (e.g. after pulling commits with new deps) back in sync.
step 'Installing npm packages'
npm install

# `sharp` (used for photo resizing) carries per-libc optional deps, and a
# plain `npm install` prunes whichever variant doesn't match the platform
# it ran on (e.g. @emnapi/runtime, the wasm fallback) from
# package-lock.json. The app image builds on Alpine (musl, node:24-alpine)
# while `npm install` above almost certainly ran against glibc (Windows or
# a non-Alpine WSL2 distro), so repair the lock file's musl entries here —
# package-lock-only, so it doesn't touch node_modules.
step 'Repairing lock file for cross-platform (musl/Alpine) optional deps'
docker run --rm -v "${PWD}:/app" -w /app node:24-alpine \
  sh -c 'npm install --package-lock-only --ignore-scripts'

step 'Pulling latest base images (db, postgrest, caddy)'
docker compose pull db postgrest caddy

step 'Rebuilding custom images (app, pg-backup)'
docker compose build

step 'Starting docker compose stack'
docker compose up -d

# The containerized `app` service is a production build with no HMR — it's
# what npm run dev replaces. Stop it so it can't end up bound to :3000
# ahead of the dev server. db/postgrest/caddy/pg-backup stay up for real
# data + auth. Filtered by compose label rather than
# `docker compose stop <service>` / `ps -q <service>`, which have proven
# unreliable across compose versions (some cascade-stop dependencies).
step 'Stopping containerized app (freeing :3000 for the dev server)'
project="$(basename "$PWD")"
app_container="$(docker ps -q \
  --filter "label=com.docker.compose.service=app" \
  --filter "label=com.docker.compose.project=${project}")"
if [ -n "$app_container" ]; then
  docker stop "$app_container" >/dev/null
fi

step 'Starting Nuxt dev server (HMR) on http://localhost:3000'
npm run dev
