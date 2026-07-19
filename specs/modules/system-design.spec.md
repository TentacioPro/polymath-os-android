# Spec: System Design (aspect 4) — the corrected end-to-end shape, post-validation

```
web/ (Next.js 15 + TS)      frontend/ (Expo RN)          ← v4's real clients, extended
        └────────────┬────────────┘
                     ▼  HTTPS + JWT
        backend/ (FastAPI, Python)                        ← v4's real backend, extended
          auth.py (JWT+Argon2id) · crypto.py (AES-256-GCM)
          + audit module (extracted, Task 04)
          + rbac module (Task 02) + guardrails (Task 03) + error contract (Task 05)
                     ▼  in-process / internal call, identity forwarded
        agent-service (Python)                            ← net-new (scaffold heritage)
          orchestrator (run_agent_step = the ONE hook point, incl. future Shepherd)
          data_layer: provenance · dedup · GraphStore(Kùzu) · vectors(LanceDB)
          telemetry: Opik on every agent call
                     ▼
        Mongo (today) ──migration (Task 06)──▶ Kùzu + LanceDB · versioned local FS
```

## Hard rules
1. One backend, two thin clients, one contract (api.spec.md). No client-specific endpoints.
2. Middleware order on every route: authenticate → rbac → validate → audit → handler → audit.
3. Every mutation path terminates in staging unless the actor is `owner` confirming.
4. The backend is the only trust boundary; agent-service trusts forwarded identity but re-checks
   provenance/guardrails (defense in depth, not redundancy).
5. Local-first: everything runs on the Dell G15 via docker compose; cloud is an optional mirror,
   never the source of truth (deployment.spec.md).
6. Resource budget is a design input: 4GB VRAM / 16GB RAM. Any component that assumes more
   (Kafka-class brokers, >7B local models) is rejected at spec time, per the triage record.
