# Agentic Workflows Guide — Replicating Auto-Commit Development

> How to set up GitHub-native agentic workflows that auto-commit code, similar to how Emergent Agent built this project.

---

## Table of Contents

1. [What You're Trying to Replicate](#1-what-youre-trying-to-replicate)
2. [Option A: GitHub Copilot Coding Agent (Official)](#2-option-a-github-copilot-coding-agent-official)
3. [Option B: OpenHands (Open Source — Recommended)](#3-option-b-openhands-open-source--recommended)
4. [Option C: Aider + GitHub Actions](#4-option-c-aider--github-actions)
5. [Option D: SWE-agent](#5-option-d-swe-agent)
6. [Comparison Table](#6-comparison-table)
7. [Setting Up Auto-Commit Workflows with GitHub Actions](#7-setting-up-auto-commit-workflows-with-github-actions)
8. [Recommended Stack for This Project](#8-recommended-stack-for-this-project)

---

## 1. What You're Trying to Replicate

From the [Emergent Agent Methodology](EMERGENT_AGENT_METHODOLOGY.md), the commit pattern was:

- **59 commits** in ~2 hours
- Commits every **6–15 seconds** during peak activity
- UUID-tagged commit messages (e.g., `49b70227-18f2-4860-9992-62be93ed0e0a - ...`)
- Fully autonomous: no human commits in the history
- Task-driven: each commit maps to a discrete development step

To replicate this, you need:

1. An **AI coding agent** that can read/write files, run commands, and iterate
2. A **commit mechanism** that auto-commits after each successful change
3. A **task orchestrator** that feeds the agent discrete work items

---

## 2. Option A: GitHub Copilot Coding Agent (Official)

GitHub's own agent that operates via Issues and Pull Requests.

### How It Works

1. You assign a GitHub Issue to **Copilot** (via `@github-copilot` or the "Assign to Copilot" button)
2. Copilot creates a branch, writes code, commits, and opens a PR
3. You review and merge

### Setup

1. **Requirements**:
   - GitHub Copilot Enterprise or Copilot Pro+ subscription
   - Repository on GitHub.com (not self-hosted)

2. **Enable Copilot Coding Agent**:
   - Go to your repository → **Settings** → **Copilot** → **Coding agent**
   - Toggle **ON**
   - Configure allowed tools (terminal, file operations)

3. **Usage**:
   ```
   # Create an Issue like:
   Title: Add dark mode to the activities tab
   Body: Implement dark mode toggle in (tabs)/activities.tsx using the existing theme store...
   
   # Then assign it to Copilot
   ```

4. **Copilot will**:
   - Create a branch like `copilot/fix-123`
   - Commit changes with descriptive messages
   - Open a PR with a summary
   - Respond to PR review comments with code fixes

### Pros & Cons

| Pros | Cons |
|------|------|
| Zero setup — native to GitHub | Requires Copilot Enterprise/Pro+ ($$$) |
| Understands repo context automatically | Limited to one task per Issue |
| PR-based workflow (review before merge) | Can't do long multi-step builds |
| Runs in GitHub's infrastructure | No custom tool/command support yet |

### Official Docs

- https://docs.github.com/en/copilot/using-github-copilot/using-copilot-coding-agent

---

## 3. Option B: OpenHands (Open Source — Recommended)

Formerly "OpenDevin". A fully open-source AI software engineer that runs locally or in CI.

### Why This Is the Closest to Emergent

- Operates in a **sandboxed Docker container** (just like Emergent)
- Can run terminal commands, edit files, browse the web
- Supports **autonomous multi-step development** sessions
- Can be wired into GitHub Actions for auto-commit workflows

### Setup (Local)

```bash
# 1. Install
pip install openhands

# 2. Or use Docker (recommended — matches the Emergent pattern)
docker pull ghcr.io/all-hands-ai/openhands:latest

# 3. Run the agent
docker run -it \
  -v $(pwd):/workspace \
  -e OPENAI_API_KEY=sk-your-key \
  ghcr.io/all-hands-ai/openhands:latest \
  python -m openhands.core.main \
  -t "Add error handling to all API endpoints in backend/server.py"
```

### Setup (GitHub Actions — Auto-Commit on Issues)

Create `.github/workflows/openhands-agent.yml`:

```yaml
name: OpenHands AI Agent

on:
  issues:
    types: [opened, labeled]

jobs:
  agent:
    if: contains(github.event.issue.labels.*.name, 'agent')
    runs-on: ubuntu-latest
    permissions:
      contents: write
      pull-requests: write
      issues: write

    steps:
      - uses: actions/checkout@v4

      - name: Run OpenHands Agent
        uses: all-hands-ai/openhands-resolver@main
        with:
          github-token: ${{ secrets.GITHUB_TOKEN }}
          openai-api-key: ${{ secrets.OPENAI_API_KEY }}
          issue-number: ${{ github.event.issue.number }}
          max-iterations: 50
```

**How to use**: Create an Issue with the `agent` label → OpenHands picks it up, creates a branch, commits code, opens a PR.

### Pros & Cons

| Pros | Cons |
|------|------|
| Fully open source (MIT license) | Requires your own API keys |
| Docker-sandboxed (safe) | More setup than Copilot Agent |
| Works with any LLM (OpenAI, Anthropic, local) | Can be slow on complex tasks |
| GitHub Actions integration available | Resource-heavy (needs beefy runner) |
| Closest architecture to Emergent Agent | |

### Links

- GitHub: https://github.com/All-Hands-AI/OpenHands
- Docs: https://docs.all-hands.dev/

---

## 4. Option C: Aider + GitHub Actions

Aider is a terminal-based AI pair programming tool that excels at making targeted code changes.

### Setup

```bash
# Install
pip install aider-chat

# Configure
export OPENAI_API_KEY=sk-your-key

# Run interactively
cd /path/to/polymath-os-android
aider backend/server.py frontend/app/**/*.tsx
```

### Auto-Commit Workflow

Aider **automatically commits every change** it makes with descriptive messages. This is the closest to replicate the Emergent commit pattern.

```bash
# Aider will:
# 1. Read the files you specify
# 2. Make changes based on your prompt
# 3. Auto-commit with a message like: "feat: add dark mode to activities tab"
# 4. Continue iterating

aider --auto-commits --model gpt-4o backend/server.py
```

### GitHub Actions Integration

Create `.github/workflows/aider-agent.yml`:

```yaml
name: Aider Code Agent

on:
  issues:
    types: [opened, labeled]

jobs:
  aider:
    if: contains(github.event.issue.labels.*.name, 'aider')
    runs-on: ubuntu-latest
    permissions:
      contents: write
      pull-requests: write

    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: Setup Python
        uses: actions/setup-python@v5
        with:
          python-version: '3.12'

      - name: Install Aider
        run: pip install aider-chat

      - name: Run Aider
        env:
          OPENAI_API_KEY: ${{ secrets.OPENAI_API_KEY }}
        run: |
          git config user.name "aider-bot"
          git config user.email "aider@users.noreply.github.com"
          
          # Create a working branch
          BRANCH="aider/issue-${{ github.event.issue.number }}"
          git checkout -b "$BRANCH"
          
          # Run aider with the Issue body as the prompt
          aider --yes --auto-commits --model gpt-4o \
            --message "${{ github.event.issue.body }}" \
            backend/server.py frontend/app/**/*.tsx
          
          # Push the branch
          git push origin "$BRANCH"

      - name: Create PR
        uses: peter-evans/create-pull-request@v6
        with:
          branch: aider/issue-${{ github.event.issue.number }}
          title: "🤖 Aider: ${{ github.event.issue.title }}"
          body: "Auto-generated by Aider from #${{ github.event.issue.number }}"
```

### Pros & Cons

| Pros | Cons |
|------|------|
| Auto-commits by default | Single-task focused (no multi-step orchestration) |
| Excellent at targeted code changes | Doesn't run/test code by default |
| Works with any model | No sandboxed execution environment |
| Very lightweight | Manual file specification needed |
| Git-native (understands diffs) | |

### Links

- GitHub: https://github.com/Aider-AI/aider
- Docs: https://aider.chat/

---

## 5. Option D: SWE-agent

Princeton's research tool for autonomous software engineering.

### Setup

```bash
# Clone
git clone https://github.com/princeton-nlp/SWE-agent.git
cd SWE-agent

# Install
pip install -e .

# Run on a GitHub Issue
python run.py \
  --model gpt-4o \
  --data_path https://github.com/your-user/polymath-os-android/issues/1 \
  --repo_path /path/to/polymath-os-android
```

### Pros & Cons

| Pros | Cons |
|------|------|
| Research-grade agent | Complex setup |
| Designed for GitHub Issues | Academic tool, less polished UI |
| Docker-sandboxed | Heavy resource requirements |

### Links

- GitHub: https://github.com/princeton-nlp/SWE-agent

---

## 6. Comparison Table

| Feature | Copilot Agent | OpenHands | Aider | SWE-agent |
|---------|--------------|-----------|-------|-----------|
| **Open Source** | No | Yes (MIT) | Yes (Apache 2) | Yes (MIT) |
| **Cost** | Copilot Pro+ | Your API keys | Your API keys | Your API keys |
| **Auto-Commits** | Yes (per PR) | Yes | Yes (per change) | Yes |
| **Sandboxed Execution** | Yes | Yes (Docker) | No | Yes (Docker) |
| **GitHub Issue Integration** | Native | Via Actions | Via Actions | Native |
| **Multi-Step Tasks** | Limited | Excellent | Limited | Good |
| **Runs Locally** | No | Yes | Yes | Yes |
| **Closest to Emergent** | ⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐ |
| **Ease of Setup** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐ |

---

## 7. Setting Up Auto-Commit Workflows with GitHub Actions

Regardless of which agent you choose, here's the GitHub Actions pattern for auto-committing:

### The Auto-Commit Pattern

```yaml
# .github/workflows/auto-commit.yml
name: Auto-Commit Agent Work

on:
  workflow_dispatch:
    inputs:
      task:
        description: 'Task description for the agent'
        required: true
        type: string

jobs:
  agent-work:
    runs-on: ubuntu-latest
    permissions:
      contents: write

    steps:
      - uses: actions/checkout@v4
        with:
          token: ${{ secrets.PAT_TOKEN }}  # Use PAT for push permissions

      - name: Configure Git Identity
        run: |
          git config user.name "ai-agent"
          git config user.email "agent@yourdomain.com"

      - name: Create Agent Branch
        run: |
          BRANCH="agent/task-$(date +%s)"
          git checkout -b "$BRANCH"
          echo "BRANCH=$BRANCH" >> $GITHUB_ENV

      # === YOUR AGENT STEP HERE ===
      # (OpenHands, Aider, custom script, etc.)

      - name: Commit & Push
        run: |
          git add -A
          git diff --staged --quiet || git commit -m "🤖 Agent: ${{ inputs.task }}"
          git push origin "${{ env.BRANCH }}"

      - name: Create Pull Request
        uses: peter-evans/create-pull-request@v6
        with:
          branch: ${{ env.BRANCH }}
          title: "🤖 ${{ inputs.task }}"
```

### Replicating the Emergent "Rapid-Fire Commits" Pattern

If you want the exact same behavior as Emergent (commits every few seconds), create a wrapper script:

```python
#!/usr/bin/env python3
"""auto_commit_agent.py — wraps any agent with rapid auto-commits"""
import subprocess
import time
import os

COMMIT_INTERVAL = 10  # seconds between commit checks
BRANCH = f"agent/session-{int(time.time())}"

def git(*args):
    return subprocess.run(["git"] + list(args), capture_output=True, text=True)

def auto_commit_loop():
    """Watch for file changes and auto-commit every N seconds."""
    git("checkout", "-b", BRANCH)
    
    while True:
        time.sleep(COMMIT_INTERVAL)
        
        # Stage all changes
        git("add", "-A")
        
        # Check if there are staged changes
        result = git("diff", "--staged", "--quiet")
        if result.returncode != 0:  # There are changes
            timestamp = time.strftime("%H:%M:%S")
            git("commit", "-m", f"🤖 auto-commit at {timestamp}")
            git("push", "origin", BRANCH)
            print(f"[{timestamp}] Committed and pushed changes")

if __name__ == "__main__":
    auto_commit_loop()
```

Run this in the background while your agent works:

```bash
# Terminal 1: Start auto-commit watcher
python auto_commit_agent.py &

# Terminal 2: Run your agent (e.g., aider)
aider --no-auto-commits --model gpt-4o backend/server.py
```

---

## 8. Recommended Stack for This Project

Given that Polymath OS is an Expo + FastAPI project:

### Quick Start (Lowest Effort)

**Use GitHub Copilot Coding Agent** if you have a Copilot Pro+ subscription:
- Zero setup
- Create Issues → assign to Copilot → review PRs
- Best for incremental feature work

### Power User (Most Control)

**Use Aider locally + auto-commit script**:

```bash
# 1. Install
pip install aider-chat

# 2. Add your key
export OPENAI_API_KEY=sk-your-key

# 3. Work on the project
cd polymath-os-android
aider --auto-commits --model gpt-4o \
  backend/server.py \
  frontend/app/\(tabs\)/*.tsx \
  frontend/store/useStore.ts
```

Aider will auto-commit each change with a descriptive message, giving you the same rapid-fire commit pattern as Emergent.

### Full Automation (Closest to Emergent)

**Use OpenHands + GitHub Actions**:

1. Fork or push this repo to GitHub
2. Add `OPENAI_API_KEY` as a repository secret
3. Copy the OpenHands workflow from [Option B](#3-option-b-openhands-open-source--recommended)
4. Create Issues with the `agent` label
5. OpenHands will autonomously write code, commit, and open PRs

This gives you:
- Docker-sandboxed execution (safe)
- Autonomous multi-step development
- Auto-commits on every change
- PR-based review workflow

---

## Quick Reference: Repository Secrets Needed

| Secret | Where to Get It | Used By |
|--------|----------------|---------|
| `OPENAI_API_KEY` | https://platform.openai.com/api-keys | All options |
| `PAT_TOKEN` (optional) | GitHub Settings → Developer Settings → Personal Access Tokens | Auto-commit workflows |
| `ANTHROPIC_API_KEY` (optional) | https://console.anthropic.com/ | OpenHands/Aider with Claude |

---

*Last updated: February 2026*
