# Spec: Schemas (aspect 3) — extends modules/data-layer.spec.md

## Node types (canonical registry — grows only via a numbered task)
Habit · DormantSkill · HealthTreatment · LifeChapter · CareerSkill · FinancialGoal ·
ValueOrPrinciple · ReadingItem · **LearningItem** (generalizes ReadingItem: courses/blogs/videos; status enum discovered→queued→in_progress→completed→abandoned — the downloaded≠read honesty rule, extended to enrolled≠completed; mastery signal per polymath-os Archivist concepts) · Document · Concept · Prompt · Decision · EmailInsight (staged-only until confirmed, privacy rule 4) · StagingItem

## Hard rules
1. Every node: `id`, `schema_version`, `provenance`, `created_at`, `updated_at` (append-only —
   an update is a new version row referencing its predecessor, never an in-place mutation).
2. `StagingItem` is a separate namespace/table, not a status flag (rbac.spec.md rule 1 depends
   on this being physically true).
3. Migrations: one reversible script per change in `data_layer/migrations/`, applied in order.
   Manual edits to a live store are prohibited — including "just this once".
4. **Reuse mapping is explicit.** First concrete instance: `Habit` inherits CiggTrack's model
   semantics — `cigarette_log`'s event-per-occurrence shape + `smoking_data_service`'s
   day/week aggregation, generalized to any tracked habit (field for unit: cigarettes, hours of
   music, km commuted). Recorded here so the schema's ancestry is traceable.
5. Mongo-era collections (polymath backend) map to these types via
   `scripts/migrate_polymath_os.py` (Task 06); the mapping table lives in that task's spec, and
   every migrated node gets provenance assigned during migration — nothing arrives "unset".
