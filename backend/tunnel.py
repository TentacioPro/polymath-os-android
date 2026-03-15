"""
Start the backend with a Cloudflare HTTPS tunnel.
Usage: python tunnel.py
Automatically updates frontend/.env so the app picks up the tunnel URL.
"""
import subprocess
import sys
import os
import re
from pycloudflared import try_cloudflare

PORT = 8001
ROOT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FRONTEND_ENV = os.path.join(ROOT_DIR, "frontend", ".env")


def update_frontend_env(tunnel_url: str):
    """Write or update EXPO_PUBLIC_BACKEND_URL in frontend/.env"""
    env_key = "EXPO_PUBLIC_BACKEND_URL"
    new_line = f"{env_key}={tunnel_url}"

    if os.path.exists(FRONTEND_ENV):
        with open(FRONTEND_ENV, "r") as f:
            content = f.read()
        # Replace existing key or append
        if env_key in content:
            content = re.sub(
                rf"^{env_key}=.*$", new_line, content, flags=re.MULTILINE
            )
        else:
            content = content.rstrip("\n") + f"\n{new_line}\n"
    else:
        content = new_line + "\n"

    with open(FRONTEND_ENV, "w") as f:
        f.write(content)
    print(f"  Updated {FRONTEND_ENV}")


def main():
    # Start the cloudflared tunnel
    print(f"\n[tunnel] Starting Cloudflare tunnel for port {PORT}...")
    tunnel = try_cloudflare(port=PORT)
    url = tunnel.tunnel

    print(f"\n{'='*60}")
    print(f"  HTTPS Tunnel URL: {url}")
    print(f"{'='*60}")

    # Auto-update frontend/.env
    update_frontend_env(url)
    print(f"\n  frontend/.env updated automatically.")
    print(f"  Restart Expo if it's already running (press 'r' in Expo terminal).\n")

    # Start uvicorn
    print(f"[tunnel] Starting backend on port {PORT}...\n")
    try:
        subprocess.run(
            [sys.executable, "-m", "uvicorn", "server:app",
             "--host", "0.0.0.0", "--port", str(PORT), "--reload"],
            cwd=os.path.dirname(os.path.abspath(__file__)),
        )
    except KeyboardInterrupt:
        print("\n[tunnel] Shutting down...")


if __name__ == "__main__":
    main()
