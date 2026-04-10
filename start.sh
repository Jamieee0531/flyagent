#!/usr/bin/env bash
# =============================================================================
# start.sh — One-command startup for Nomie
#
# Starts all three services in order:
#   1. Docker (MongoDB :27017 + Gateway :8080)
#   2. LangGraph Server (Python agent backend :2024)
#   3. Frontend (React/Vite :3000)
#
# Usage:
#   ./start.sh            # normal start
#   ./start.sh --rebuild  # force docker rebuild (after gateway code changes)
#
# Ctrl+C stops the frontend and LangGraph processes.
# Docker services are left running (use `docker-compose down` to stop them).
# =============================================================================

set -euo pipefail

ROOT="$(cd "$(dirname "$0")" && pwd)"
REBUILD=false
[[ "${1:-}" == "--rebuild" ]] && REBUILD=true

# ── Colors ────────────────────────────────────────────────────────────────────
RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'
CYAN='\033[0;36m'; BOLD='\033[1m'; RESET='\033[0m'

log()  { echo -e "${BOLD}[Nomie]${RESET} $*"; }
ok()   { echo -e "  ${GREEN}✓${RESET} $*"; }
warn() { echo -e "  ${YELLOW}⚠${RESET} $*"; }
err()  { echo -e "  ${RED}✗${RESET} $*" >&2; }
step() { echo -e "\n${CYAN}▶ $*${RESET}"; }

# ── Cleanup ───────────────────────────────────────────────────────────────────
PIDS=()
cleanup() {
  echo ""
  log "Shutting down frontend and LangGraph..."
  for pid in "${PIDS[@]:-}"; do
    kill "$pid" 2>/dev/null || true
  done
  log "Docker services are still running. To stop them:"
  echo "       cd docker && docker-compose down"
}
trap cleanup EXIT INT TERM

# ── Prerequisite checks ───────────────────────────────────────────────────────
step "Checking prerequisites"
MISSING=()
command -v docker &>/dev/null && ok "docker"        || MISSING+=("docker")
command -v uv     &>/dev/null && ok "uv"            || MISSING+=("uv  →  pip install uv")
command -v npm    &>/dev/null && ok "npm / Node.js" || MISSING+=("npm / Node.js 18+")

if [[ ${#MISSING[@]} -gt 0 ]]; then
  err "Missing dependencies — install these first:"
  for m in "${MISSING[@]}"; do echo "      • $m"; done
  exit 1
fi

# ── .env checks ───────────────────────────────────────────────────────────────
step "Checking .env files"
ENV_OK=true
check_env() {
  local path="$ROOT/$1" label="$2" example="$ROOT/${1%.env}.env.example"
  if [[ -f "$path" ]]; then
    ok "$label"
  else
    warn "$label not found  →  cp ${1%.env}.env.example $1  then fill in keys"
    ENV_OK=false
  fi
}

check_env "backend/.env"        "backend/.env"
check_env "gateway/.env.docker" "gateway/.env.docker"
check_env "frontend/.env"       "frontend/.env"

if [[ "$ENV_OK" == false ]]; then
  err "Fix missing .env files before starting. See README → Environment Variables."
  exit 1
fi

# ── 1. Docker: MongoDB + Gateway ─────────────────────────────────────────────
step "Starting Docker services (MongoDB + Gateway)"
if $REBUILD; then
  (cd "$ROOT/docker" && docker-compose up --build -d)
else
  (cd "$ROOT/docker" && docker-compose up -d)
fi

log "Waiting for Gateway to be healthy..."
RETRIES=30
until curl -sf http://localhost:8080/health &>/dev/null; do
  RETRIES=$((RETRIES - 1))
  if [[ $RETRIES -le 0 ]]; then
    err "Gateway did not start in time. Check logs:"
    echo "       cd docker && docker-compose logs api-gateway"
    exit 1
  fi
  sleep 2
done
ok "Gateway ready  →  http://localhost:8080"

# ── 2. LangGraph Server ───────────────────────────────────────────────────────
step "Starting LangGraph Server"
LOG_LG="$ROOT/.langgraph.log"
(cd "$ROOT/backend" && uv run langgraph dev --no-browser --allow-blocking --no-reload \
  > "$LOG_LG" 2>&1) &
PIDS+=($!)

log "Waiting for LangGraph to open port 2024..."
RETRIES=30
until (echo > /dev/tcp/localhost/2024) 2>/dev/null; do
  RETRIES=$((RETRIES - 1))
  if [[ $RETRIES -le 0 ]]; then
    warn "LangGraph may still be loading. Check: tail -f .langgraph.log"
    break
  fi
  sleep 2
done
ok "LangGraph Server ready  →  http://localhost:2024  (log: .langgraph.log)"

# ── 3. Frontend ───────────────────────────────────────────────────────────────
step "Starting Frontend"
(cd "$ROOT/frontend" && npm run dev) &
PIDS+=($!)
sleep 2

# ── Ready banner ─────────────────────────────────────────────────────────────
echo ""
echo -e "${BOLD}${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}"
echo -e "${BOLD}  Nomie is running!${RESET}"
echo -e "  Frontend   →  ${CYAN}http://localhost:3000${RESET}"
echo -e "  Gateway    →  ${CYAN}http://localhost:8080${RESET}"
echo -e "  LangGraph  →  ${CYAN}http://localhost:2024${RESET}"
echo -e "${BOLD}${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}"
echo -e "  ${BOLD}Ctrl+C${RESET} to stop frontend + LangGraph\n"

wait
