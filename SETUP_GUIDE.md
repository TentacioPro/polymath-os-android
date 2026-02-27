# Polymath OS — Development Setup Guide

> Get the backend (FastAPI) and mobile frontend (Expo) running locally on **Windows**.
> Assumes **Node.js**, **Python**, and **MongoDB** are already installed.

---

## Table of Contents

1. [Quick Verify](#1-quick-verify)
2. [Install Bun](#2-install-bun)
3. [Install uv](#3-install-uv)
4. [Clone the Repository](#4-clone-the-repository)
5. [Backend Setup (FastAPI)](#5-backend-setup-fastapi)
6. [Frontend Setup (Expo / React Native)](#6-frontend-setup-expo--react-native)
7. [Running on Your Phone (Expo Go)](#7-running-on-your-phone-expo-go)
8. [Common Issues & Troubleshooting](#8-common-issues--troubleshooting)
9. [Quick Reference Commands](#9-quick-reference-commands)

---

## 1. Quick Verify

Confirm your existing tools:

```powershell
node -v        # 18+ required (20+ recommended)
python --version   # 3.10+ required
mongosh --version  # or check Atlas dashboard
git --version
```

---

## 2. Install Bun

Bun is a fast JavaScript package manager & runtime. We'll use it instead of Yarn/npm for the frontend.

```powershell
# Option A — powershell installer
irm bun.sh/install.ps1 | iex

# Option B — npm (if you prefer)
npm install -g bun

# Verify
bun --version   # should print 1.x
```

> **Why Bun?** 10–25x faster installs than npm/yarn, built-in TypeScript support, drop-in compatible with `package.json`.

---

## 3. Install uv

`uv` is a blazing-fast Python package/project manager (Rust-based replacement for pip + venv).

```powershell
# Option A — powershell installer
irm https://astral.sh/uv/install.ps1 | iex

# Option B — pip
pip install uv

# Verify
uv --version
```

---

## 4. Clone the Repository

```powershell
git clone https://github.com/TentacioPro/polymath-os-android.git
cd polymath-os-android
```

---

## 5. Backend Setup (FastAPI)

### 5.1 Create a uv virtual environment (project root)

```powershell
# From the project root (polymath-os-android/)
uv venv
.\.venv\Scripts\Activate.ps1
```

> If you get an execution policy error:
> ```powershell
> Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
> ```

### 5.2 Install Python dependencies

```powershell
uv pip install -r backend/requirements.txt
```

This installs FastAPI, Motor (async MongoDB driver), OpenAI SDK, Pydantic, and ~120 other packages. With `uv` this should take ~5–10 seconds instead of minutes.

### 5.3 Create the `.env` file

```powershell
Copy-Item backend/.env.example backend/.env
```

Then edit `backend/.env`:

```env
MONGO_URL=mongodb://localhost:27017
DB_NAME=polymath_os
OPENAI_API_KEY=sk-your-openai-api-key-here
```

> Get your OpenAI API key at https://platform.openai.com/api-keys

### 5.4 Start the backend server

```powershell
cd backend
uvicorn server:app --host 0.0.0.0 --port 8001 --reload
```

You should see:
```
INFO:     Uvicorn running on http://0.0.0.0:8001
```

Verify: open <http://localhost:8001/docs> for the Swagger UI.

---

## 6. Frontend Setup (Expo / React Native)

### React ↔ React Native Cheat Sheet

If you know React, this maps 1:1:

| React (Web) | Expo (Mobile) |
|---|---|
| `<div>` | `<View>` |
| `<span>`, `<p>` | `<Text>` |
| `<img>` | `<Image>` |
| `<button>` / `<a>` | `<TouchableOpacity>` / `<Pressable>` |
| `react-router` | `expo-router` (file-based, like Next.js) |
| CSS / styled-components | `StyleSheet.create()` |
| `localStorage` | `AsyncStorage` |
| `useState`, `useEffect` | Same! |

### 6.1 Install dependencies

```powershell
cd frontend
bun install
```

> **Note:** The project's `package.json` has `"packageManager": "yarn@1.22.22"` — Bun ignores this and works fine. If you ever need strict compatibility, just use `bun install --yarn`.

### 6.2 Create the `.env` file

Create `frontend/.env`:

```env
EXPO_PUBLIC_BACKEND_URL=http://<YOUR_LAN_IP>:8001
```

Find your LAN IP:
```powershell
(Get-NetIPAddress -AddressFamily IPv4 | Where-Object { $_.InterfaceAlias -notlike '*Loopback*' -and $_.PrefixOrigin -eq 'Dhcp' }).IPAddress
```

Example: `EXPO_PUBLIC_BACKEND_URL=http://192.168.1.42:8001`

> You need the LAN IP (not `localhost`) because Expo Go on your phone connects over Wi-Fi.

### 6.3 Start the Expo dev server

```powershell
npx expo start
```

This starts Metro. You'll see a QR code in the terminal.

---

## 7. Running on Your Phone (Expo Go)

1. Install **Expo Go** from the Google Play Store (Android) or App Store (iOS).
2. Make sure your phone and computer are on the **same Wi-Fi network**.
3. Open the Expo Go app → scan the QR code from the terminal.
4. The app will bundle and load on your device.

### Tunnel mode (different network / corporate Wi-Fi)

If direct scanning doesn't connect:

```powershell
npx expo start --tunnel
```

This uses ngrok to tunnel through NAT. The project already has `@expo/ngrok` installed.

### Quick preview in browser

Press `w` in the Metro terminal to open a web preview (useful for fast iteration, but mobile is the primary target).

---

## 8. Common Issues & Troubleshooting

### `bun install` warnings about `packageManager` field

Safe to ignore. Bun is compatible with Yarn lockfiles. If it bothers you:
```powershell
# Remove the packageManager field (optional)
cd frontend
npx json -I -f package.json -e 'delete this.packageManager'
```

### Metro bundler crashes / out of memory

```powershell
$env:NODE_OPTIONS="--max-old-space-size=4096"
npx expo start
```

### `MONGO_URL` connection refused

- **Local MongoDB**: `net start MongoDB`
- **Atlas**: Whitelist your IP in Atlas → Network Access.

### Expo Go can't connect to the dev server

- Phone and computer must be on the **same network**.
- Try `npx expo start --tunnel`.
- Check Windows Firewall isn't blocking ports 8081 (Metro) and 8001 (backend).

### OpenAI API key not set

AI features (categorization, connections, agent chat) require `OPENAI_API_KEY` in `backend/.env`.
Get yours at https://platform.openai.com/api-keys

### Python module not found

Make sure the venv is activated:
```powershell
# From project root
.\.venv\Scripts\Activate.ps1
# You should see (.venv) in your prompt
```

---

## 9. Quick Reference Commands

```powershell
# ── Backend ──
.\.venv\Scripts\Activate.ps1                             # Activate venv (from project root)
cd backend
uvicorn server:app --host 0.0.0.0 --port 8001 --reload   # Start server
# API docs → http://localhost:8001/docs

# ── Frontend ──
cd frontend
bun install                        # Install dependencies
npx expo start                     # Start Metro dev server (scan QR with Expo Go)
npx expo start --tunnel            # Start with tunnel (remote access)
npx expo start --clear             # Clear cache and start
npx expo start --web               # Quick web preview

# ── Useful ──
npx expo install <package>         # Install Expo-compatible packages
npx expo doctor                    # Check for dependency issues
bun run lint                       # Run ESLint
```

---

## Project Structure

```
polymath-os-android/
├── .venv/                 # Python virtual environment (project root, via uv)
├── backend/
│   ├── server.py          # FastAPI application (all routes + models)
│   ├── requirements.txt   # Python dependencies
│   ├── .env.example       # Environment template
│   └── .env               # Your environment variables (create this)
├── frontend/
│   ├── app/               # Expo Router pages (file-based routing)
│   │   ├── _layout.tsx    # Root layout (SafeAreaProvider + Stack)
│   │   ├── index.tsx      # Entry redirect
│   │   └── (tabs)/        # Tab-based navigation
│   │       ├── _layout.tsx    # Tab bar config
│   │       ├── index.tsx      # Dashboard
│   │       ├── activities.tsx # Activity tracking
│   │       ├── journal.tsx    # Journal entries
│   │       ├── connections.tsx# Knowledge graph
│   │       ├── agent.tsx      # AI agent with memory
│   │       └── export.tsx     # Export/Import
│   ├── store/
│   │   └── useStore.ts    # Zustand state management
│   ├── package.json       # Node dependencies
│   └── .env               # Frontend env vars (create this)
├── docs/                  # Design & architecture documentation
├── design/                # UI design references (HTML mockups)
└── tests/                 # Test files
```

---

## Technology Stack

| Layer | Technology |
|---|---|
| **Mobile Framework** | Expo SDK 54 + React Native 0.81 |
| **Routing** | expo-router (file-based) |
| **State** | Zustand |
| **API Client** | Axios |
| **Backend** | FastAPI (Python) |
| **Database** | MongoDB + Motor (async) |
| **AI** | OpenAI SDK (gpt-4o-mini) |
| **Package Mgmt** | Bun (frontend) · uv (backend) |

---

*Last updated: February 2026*
