# Model Playbook — per-family practices, token efficiency, and official docs
*(For the harness to consult when the driving model changes. Honesty note: several models you
listed (Kimi k2.5–2.7, GPT-5.5/5.6) are newer than my reliable knowledge — the per-family notes
are safe patterns; version-specific behavior MUST be checked from the linked official docs by
the harness at session start: "fetch and skim <doc> before we begin".)*

## Universal first (applies to every model, harness, and task)
- The spec system already does the heavy lifting: attach the task spec + state file, not the
  whole repo. Context files > pasted context. This is 80% of token efficiency.
- One task per session. Fresh session per task beats one mega-session (stale context causes
  more failed calls than weak models do).
- Structured output requests ("return JSON with fields a,b,c") beat prose parsing on ALL models.
- Temperature 0–0.3 for code/tool work regardless of vendor.
- Always give the model an out: "if uncertain, say so and stop" — hallucinated success is the
  most expensive failure on every model family.

## Anthropic Claude (Claude Code)
- Docs: https://docs.claude.com (Claude Code overview + best practices; prompt engineering).
- Practices: XML tags for structure; CLAUDE.md auto-loads (ours points to AGENTS.md);
  extended thinking for architecture tasks, off for mechanical edits; use /clear
  between tasks; Skills (SKILL.md) are first-class — our prompt-optimizer installs as one.
- Token efficiency: reference files by path (it reads on demand); avoid pasting file bodies.

## Kimi (Moonshot, k2.x)
- Docs: https://platform.moonshot.ai/docs (+ model release notes per k2.x version — HARNESS: fetch before use).
- Practices (K2 family are agentic/tool-native): long-context strong — still attach selectively;
  explicit tool schemas; K2-style models respond well to terse imperative prompts; verify its
  tool-call JSON strictly (mixed harnesses sometimes mis-map tool schemas — first session, run
  one trivial tool call as a smoke test).
- Token efficiency: strong at long-doc digestion — good model for "read the whole spec pack and
  answer questions" sessions.

## OpenAI (gpt-4o, gpt-5.x)
- Docs: https://platform.openai.com/docs (prompting guide; function calling; reasoning-model
  best practices page for 5.x — HARNESS: check the reasoning-effort/verbosity params current names).
- Practices: 4o = fast/multimodal, keep prompts compact, few-shot helps; 5.x reasoning models =
  do NOT chain-of-thought-prompt them ("think step by step" wastes tokens — they reason
  internally); give goal + constraints, set reasoning effort low for mechanical edits, high for
  design; developer/system message discipline matters more than examples.
- Token efficiency: reasoning models bill thinking tokens — BUDGET line in the optimizer
  template matters most here.

## Mistral
- Docs: https://docs.mistral.ai (prompting capabilities; function calling; Codestral for code).
- Practices: excellent price/perf for mechanical tasks (test fixing, migrations); keep tool
  count low (≤8 tools exposed at once); explicit output format every time.

## NVIDIA (NIM / Nemotron family)
- Docs: https://build.nvidia.com and https://docs.nvidia.com/nim (model cards per endpoint —
  HARNESS: read the specific model card; context length and tool support vary widely).
- Practices: treat as OpenAI-compatible endpoints; verify tool-calling support per model card
  before agentic use (some are chat-only); good local/edge option later next to Ollama.

## Routing cheat-sheet (which model for which task type)
- Architecture/spec writing, ambiguous scope → Claude (largest-capability tier available).
- Mechanical red→green, migrations, rename storms → Mistral/Codestral or a cheap Kimi tier.
- Long-document digestion, cross-file Q&A → Kimi long-context.
- Quick multimodal (screenshot → issue) → gpt-4o class.
- Never route by price alone on Tasks 02/03/06 (security + migration) — capability tier there;
  a cheap model's silent mistake in auth or data migration costs more than the tokens saved.

## Standing instruction for ANY harness (paste once per session)
"Model in use: <name>. Before starting: (1) read model-playbook.md section for this family and
fetch its linked doc if version-specific behavior matters to the task; (2) apply
prompt-optimizer.skill.md to my instructions; (3) confirm tool-calling works with one trivial
call; then proceed."
