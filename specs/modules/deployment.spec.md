# Spec: Deployment (aspect 8)

## Posture: local-first, cloud-optional
The system's home is the Dell G15. Cloud (GCP free tier — your Maaxly research applies) is an
optional encrypted mirror for backup/remote access, never the source of truth.

## Reuse (from maaxly gcp-deploy-nov15 — the canonical branch)
- `scripts/backup/backup.sh` → seed for Task 10's snapshot script
- nginx 8080/8443 routing + DuckDNS pattern → if/when remote access is wanted
- GitHub Actions SSH-deploy workflow (post-fix commits) → CI skeleton
- The docs/ deployment journals → the recorded pitfalls (compose confusion, env leaks, Express
  wildcard routing) that these rules exist to prevent

## Hard rules
1. One `docker-compose.yml` at repo root runs everything: backend, agent-service, Mongo (until
   Task 06), web (dev mode). `docker compose up` from cold clone + `.env` = working system;
   that sentence is CI-tested (compose-up smoke job).
2. Images are reproducible: pinned base images, lockfiles honored, no `latest` tags.
3. **The Vault (Task 10)**: cron-driven volume snapshots, versioned, immutable, tested restore.
   A backup that has never been restored is a hope, not a backup — restore drill is part of the
   task's DONE criteria and repeats quarterly.
4. Deploy scripts are cross-platform bash (WSL2-first); PowerShell variants only as thin wrappers.
5. CI (GitHub Actions, exists on main as lint gates): extend to full suite + compose smoke.
   A red main is a stop-the-line event.
