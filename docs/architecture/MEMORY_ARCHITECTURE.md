# Memory Architecture

## 1. Long-term structured memory
`Brief`, `ContentAsset`, `ComplianceCheck`, `Approval`, `ScheduledPost`, `PublishedPost`, `Metric`, `WeeklyReport` — all in Postgres via Prisma. This is durable, survives restarts, and is the source of truth once a pipeline run completes.

## 2. Long-term semantic memory (the feedback loop)
`Brief.embedding` (one field on `Brief`) and `InsightEmbedding` (its own table, since one weekly report produces several distinct insights), both stored via pgvector on the same Postgres instance. This is the mechanism behind "insights feed back into the next brief" — a new brief's embedding is compared against past `InsightEmbedding` rows, and the most similar are retrieved into the Content Generator's prompt context (see `architecture/AGENT_DESIGN.md` stage 2). Regenerated only when a new brief is submitted or a new weekly report is produced — not recomputed on every read.

## 3. Working memory (per pipeline run)
The in-process LangGraph state (`briefId`, `spec`, `retrievedInsights`, per-channel `assets[]`) described in `architecture/AGENT_DESIGN.md`. This exists only for the duration of the synchronous generation stages (Brief Analyzer through Compliance Check). It is **not** how approved-but-not-yet-published assets are tracked — once an asset is `APPROVED` and scheduled, its state lives entirely in Postgres, read by the Inngest publish function at the scheduled time. This matters because a scheduled post might fire hours or days after the generation run that created it — there is no guarantee the same process (or even the same deployment) is still running, so nothing about publishing can depend on in-memory state surviving that long.

## 4. Episodic memory
`Approval` history (append-only, per asset version) and `Metric` records. These represent "what happened," not "what is generally true" — unlike `Brief.embedding`/`InsightEmbedding`, which represent distilled, reusable learning.

## What's explicitly out of scope

- **No conversational memory** — there's no chat interface; the brief is a one-shot text input per campaign, not a dialogue.
- **No per-agent private state across runs** — every agent reads what it needs from Postgres/pgvector at the start of its run; nothing is cached in a way that would make two runs of the same brief behave differently due to hidden state.

## Summary table

| Memory type | Durable? | Storage | Regenerated on |
|---|---|---|---|
| Structured (briefs, assets, approvals, metrics) | Yes | Postgres | User actions, Inngest steps |
| Semantic (brief/insight embeddings) | Yes | Postgres (pgvector) | New brief submitted; new weekly report generated |
| Working (in-process pipeline state) | No | In-process, per run | Every pipeline invocation, from scratch |
| Episodic (approval history, metrics) | Yes | Postgres | Append-only, never overwritten |
