# Aspects Index — end-to-end coverage map (answers "what am I missing?")

| # | Aspect | Spec file | Status |
|---|---|---|---|
| 1 | Consistent UI/UX | modules/ui-ux.spec.md | new |
| 2 | Theming | modules/theming.spec.md | new |
| 3 | Schemas | modules/schemas.spec.md (+data-layer) | new+existing |
| 4 | System design | modules/system-design.spec.md | new (consolidates ARCHITECTURE.md) |
| 5 | Validation & errors | modules/validation-error-handling.spec.md (+validation-guardrails) | new+existing |
| 6 | Security | modules/security.spec.md (+rbac, +crypto in code) | new+existing |
| 7 | Testing | modules/testing.spec.md | new |
| 8 | Deployment | modules/deployment.spec.md | new |
| 9a | Observability | modules/observability.spec.md | new (was implicit) |
| 9b | Privacy & ownership | modules/privacy-data-ownership.spec.md | new (was a real gap) |
| 9c | Provenance | modules/provenance.spec.md | existing (scaffold) |
| 9d | Audit | modules/audit-log.spec.md | existing (scaffold) |
| 9e | Agents | modules/agent-layer.spec.md | existing (scaffold) |
| 9f | API contract | modules/api.spec.md | existing (scaffold) |
| 10 | Extensibility | modules/extensibility.spec.md | new |
| 11 | Roadmap | specs/roadmap.md | new |
| 9g | Memory (Letta-pattern) | modules/memory.spec.md | new (was a gap — Q3) |
| 9h | Interop: OKF / MCP / Skills | modules/interop.spec.md | new (was a gap — Q5) |
| — | Process itself | tasks/00-spec-system.md v1.1 | done |

Deliberately deferred (recorded, not forgotten): performance profiling (after Phase 2 gives real
load) · i18n (single-user, English) · multi-user (never — this is a personal OS; RBAC's "roles"
are you + your agents).
