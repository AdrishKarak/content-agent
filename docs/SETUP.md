# Setup

## Prerequisites

- **Node.js** 20+
- **pnpm** 9+
- A **Neon** (or Supabase) **PostgreSQL** database with the `pgvector` extension enabled
- API keys: Gemini, Hugging Face (or Replicate), Clerk, Cloudinary, Inngest — see `api/ENVIRONMENT_VARIABLES.md`
- Optional: Sarvam AI key (only add if Gemini's Bengali output fails the native-sounding check — see `agents/GUARDRAILS.md`)

## 1. Clone and install

```bash
git clone <repo-url>
cd ai-content-studio
pnpm install
```

This is a **single Next.js application** — unlike a multi-service architecture, there's one `pnpm install` and one dev server. See `architecture/DECISIONS.md` ADR-004 for why this project deliberately avoids a multi-service split given hackathon time constraints.

## 2. Environment variables

```bash
cp .env.example .env
```

Fill in the values — see `api/ENVIRONMENT_VARIABLES.md` for what each one does. At minimum you need `DATABASE_URL`, Clerk keys, and `GEMINI_API_KEY` to boot and reach the brief-submission screen.

## 3. Database setup

```bash
pnpm prisma generate
pnpm prisma migrate dev --name init
```

Enable `pgvector` on your database first:

```sql
CREATE EXTENSION IF NOT EXISTS vector;
```

Note on vector indexes: `prisma migrate dev` creates the vector *columns* but not pgvector's similarity indexes. Add those via a custom migration once the insight-retrieval loop (Phase 5, see `roadmap/TASK_BREAKDOWN.md`) is actually being built:

```bash
pnpm prisma migrate dev --name add-vector-indexes --create-only
```

then add to the generated SQL file before applying:

```sql
CREATE INDEX ON "briefs" USING hnsw (embedding vector_cosine_ops);
CREATE INDEX ON "insight_embeddings" USING hnsw (embedding vector_cosine_ops);
```

## 4. Running the app

```bash
pnpm dev
```

Single command — one Next.js app on `http://localhost:3000`, with Inngest's dev server run alongside:

```bash
pnpm inngest:dev
```

(Inngest's local dev server lets you see and manually trigger the async steps — scheduling, mock-publish, metrics ingestion, weekly report generation — during development without waiting for real schedules.)

## 5. Verify the critical path first, before building UI

Before writing any frontend code, verify the two things most likely to sink the demo:

1. **Bengali generation quality.** Call Gemini directly with a Bengali brief and read the output yourself — does it sound native, or translated? This decides whether you need Sarvam AI at all. See `agents/GUARDRAILS.md` §2 for the exact check to automate once this manual spot-check passes.
2. **Per-channel image generation actually differs.** Generate three images from three genuinely different prompts (not one prompt + three sizes) and confirm they look meaningfully distinct — this is a hard auto-disqualifier if it fails (`docs/CONTEXT.md`).

## Common issues

| Symptom | Likely cause |
|---|---|
| Prisma migration fails referencing `vector` type | `pgvector` extension not enabled |
| Generated Bengali copy reads as translated | See `agents/GUARDRAILS.md` §2 — add Sarvam AI as the Bengali-specific model rather than trying to fix it via prompting alone |
| Compliance Agent silently passes bad content | Check it's implemented as deterministic validation (`architecture/AGENT_DESIGN.md`), not an LLM call that can hallucinate a pass |
