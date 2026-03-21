#!/usr/bin/env bash
# ──────────────────────────────────────────────────────
# Polymath OS — iOS Development Helper
# ──────────────────────────────────────────────────────
#
# This script starts the backend with a Cloudflare tunnel
# for testing on physical iOS devices (bypasses ATS).
#
# Prerequisites:
#   - cloudflared installed (brew install cloudflared)
#   - Python 3.10+ with uvicorn
#
# Usage:
#   chmod +x scripts/start-tunnel.sh
#   ./scripts/start-tunnel.sh
#
# After running, copy the HTTPS tunnel URL and set it in
# your .env.development as EXPO_PUBLIC_BACKEND_URL
# ──────────────────────────────────────────────────────

set -e

BACKEND_DIR="$(cd "$(dirname "$0")/../../backend" && pwd)"
BACKEND_PORT="${BACKEND_PORT:-8001}"

echo "──── Starting Polymath Backend ────"
echo "Backend directory: $BACKEND_DIR"
echo "Port: $BACKEND_PORT"
echo ""

# Start backend in background
cd "$BACKEND_DIR"
uvicorn server:app --host 0.0.0.0 --port "$BACKEND_PORT" &
BACKEND_PID=$!
echo "Backend PID: $BACKEND_PID"

# Give backend a moment to start
sleep 2

# Start Cloudflare tunnel
echo ""
echo "──── Starting Cloudflare Tunnel ────"
echo "Your HTTPS URL will appear below. Copy it to .env.development"
echo ""
cloudflared tunnel --url "http://localhost:$BACKEND_PORT" &
TUNNEL_PID=$!

# Cleanup on exit
cleanup() {
  echo ""
  echo "──── Shutting down ────"
  kill $BACKEND_PID 2>/dev/null || true
  kill $TUNNEL_PID 2>/dev/null || true
}
trap cleanup EXIT INT TERM

# Wait for both processes
wait
