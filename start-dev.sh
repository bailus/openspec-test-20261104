#!/usr/bin/env bash
# Start the Vite asset server and the Django server together for development.
# Open http://localhost:8000. Press Ctrl+C to stop both.
set -euo pipefail

cd "$(dirname "$0")"
export PATH="$HOME/.local/bin:$PATH"

command -v uv >/dev/null || { echo "uv not found: see https://docs.astral.sh/uv/" >&2; exit 1; }
[ -f .env ] || { echo "Missing .env: run 'cp .env.example .env'" >&2; exit 1; }
[ -d node_modules ] || npm install
uv sync --quiet

npm run dev &
vite_pid=$!
trap 'kill "$vite_pid" 2>/dev/null || true' EXIT INT TERM

uv run manage.py runserver
