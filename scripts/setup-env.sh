#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."

ENV_FILE=".env.local"
EXAMPLE=".env.example"

if [[ ! -f "$EXAMPLE" ]]; then
  echo "Missing $EXAMPLE — run this from the Hub project root."
  exit 1
fi

if [[ -f "$ENV_FILE" ]]; then
  echo ".env.local already exists — opening it."
else
  cp "$EXAMPLE" "$ENV_FILE"
  echo "Created .env.local from .env.example"
  echo "Add your XAI_API_KEY, then save and restart: npm run dev"
fi

open_env() {
  if [[ -n "${EDITOR:-}" ]]; then
    "$EDITOR" "$ENV_FILE"
    return
  fi
  if command -v cursor >/dev/null 2>&1; then
    cursor "$ENV_FILE"
    return
  fi
  if command -v code >/dev/null 2>&1; then
    code "$ENV_FILE"
    return
  fi
  if [[ "${OSTYPE:-}" == darwin* ]]; then
    open -t "$ENV_FILE"
    return
  fi
  if command -v xdg-open >/dev/null 2>&1; then
    xdg-open "$ENV_FILE" >/dev/null 2>&1 || true
    echo "Opened $ENV_FILE with your default app."
    return
  fi
  if command -v nano >/dev/null 2>&1; then
    nano "$ENV_FILE"
    return
  fi
  echo "Could not detect an editor. Edit manually:"
  echo "  $(pwd)/$ENV_FILE"
}

open_env
