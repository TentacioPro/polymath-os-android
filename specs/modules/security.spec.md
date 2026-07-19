# Spec: Security (aspect 6)

## Already real (validated on v4 — extend, never reimplement)
auth.py: JWT access+refresh w/ rotation, Argon2id, device/session tracking, account lockout.
crypto.py: AES-256-GCM field-level encryption, per-value nonce, PBKDF2 KDF.
Audit logging: real, being extracted to a module (Task 04).

## Hard rules
1. **Secrets**: never in git. `.env.example` committed, `.env` gitignored. CI uses repo secrets.
   Before reusing ANY old code, run `git log --all --diff-filter=D -- '*.env*'` — maaxly's
   triple env-deletion history is the standing reminder. If a secret ever lands in history,
   rotate it; deleting the file does not un-leak it.
2. **RBAC before everything** (Task 02): owner / agent:read_only / agent:staged_write /
   agent:service, permission matrix in code as source of truth. No role self-escalation; grants
   are owner-only and audit-logged.
3. Field-level encryption for sensitive-at-rest: health treatments, journal bodies, tokens/API
   keys — encrypted via crypto.py before storage, in Mongo today and in Kùzu/LanceDB after
   migration (Task 06 must carry encryption across, verified by test).
4. Service-to-service (backend → agent-service): internal auth with forwarded identity; the
   agent service never accepts anonymous calls even on localhost.
5. JWT_SECRET_KEY has no functional default: the dev fallback in auth.py is replaced with a
   hard startup failure when unset (small task, fold into Task 02).
6. Dependency hygiene: `pip audit` / `bun audit` in CI; a known-critical CVE blocks merge.
