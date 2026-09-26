# Tech Stack

## Application
- **Next.js 15** (App Router) — single application, both UI and API (see `architecture/DECISIONS.md` ADR-004)
- **React 19**, **TypeScript** (strict mode)
- **Tailwind CSS**, **shadcn/ui** — themed for "Sticker Studio" neobrutalism (see `docs/frontend/DESIGN_SYSTEM.md` — overridden `--radius`, offset-shadow utilities, seeded-rotation sticker cards, channel/status color maps)
- **tRPC** + **TanStack Query** — typed API layer
- **Zod** — validation at every boundary (agent I/O, tRPC procedures, form inputs)

## Database
- **Neon PostgreSQL** (or Supabase Postgres) — with **pgvector** for `Brief.embedding` and `InsightEmbedding`
- **Prisma** — ORM

## Auth
- **Clerk**

## AI — text generation
- **Gemini** — primary model for all copy generation and the Bengali nativeness guardrail check
- **Sarvam AI** — Indic-language-specialist model, wired in only if the Bengali guardrail's failure rate against Gemini justifies it (see `architecture/DECISIONS.md` ADR-006)

## AI — image generation
- **Replicate** or **Hugging Face Inference API** (FLUX models) — see ADR-010 for why a multi-model-capable provider was chosen over a single locked-in vendor

## AI — video generation (stretch goal only)
- **fal.ai** or **Runway** — not part of MVP scope (ADR-003); only added if time remains after the core loop works end-to-end

## Orchestration
- **LangGraph.js** — the 8-stage agent pipeline (`architecture/AGENT_DESIGN.md`), running in-process, no separate agent service

## Media storage
- **Cloudinary** — stores generated images/video; its transformation API is also useful for verifying aspect ratio/file size during compliance checking

## Async / scheduled work
- **Inngest** — scheduled publishing, metrics ingestion, weekly report generation (ADR-007)

## Testing
- **Vitest** — unit tests (compliance rules, prompt output shape validation)
- **Playwright** — end-to-end tests for the brief → approval → publish flow

## Deployment
- **Vercel** — single deployment target; Inngest functions run alongside via its Vercel integration, no separate persistent service needed (unlike the prior job-platform project, which needed one — see that project's ADR-006 for contrast)

## Monitoring (if time allows)
- **Sentry** — error tracking
