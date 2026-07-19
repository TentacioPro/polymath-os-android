# Spec: Observability & Telemetry (aspect 9a — named gap)

Extends the scaffold's telemetry layer; consolidates what "watch the system" means.

0. Tracing backend: Opik is the working default (scaffold heritage). Arize Phoenix (your fork
   of it exists) is the recorded alternative — evaluated and decided in Task 08 when tracing is
   wired. ONE backend ships; running both is the parallel-implementation failure mode.
1. Every agent call traces to the chosen backend (Opik until Task 08 decides): prompt version, model, tokens, latency, guardrail outcomes
   (agent-layer.spec.md check 4). Every trace id ↔ audit `request_id` ↔ error-payload
   `request_id` — one id chases a problem through all three.
2. Backend: structured JSON logs (level, request_id, actor, route, duration). No print debugging
   in committed code.
3. Sentry (already wired in web/) stays for client crash reporting; backend errors report with
   request_id so client crash ↔ server trace correlate.
4. A weekly one-query answer to "what did every agent do, cost, and get denied for this week"
   (audit-log.spec.md hard rule 4 made operational). Rendered later as an `analytics` route
   panel — route exists in v4.
5. Budget guard: per-agent token/cost counters with a soft monthly cap; exceeding it flags (not
   halts) via the standard FLAG surface.
