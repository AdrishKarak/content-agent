# Project Structure

A **single Next.js application** — see `architecture/DECISIONS.md` ADR-004 for why this project doesn't use a multi-service architecture the way a longer-running production system might.

```
ai-content-studio/
├── app/
│   ├── (studio)/                  # Generative Studio — brief submission, generation results
│   │   ├── page.tsx
│   │   └── components/
│   ├── (approval)/                # Approval queue — Approve / Reject / Regenerate
│   │   ├── page.tsx
│   │   └── components/
│   ├── (publisher)/               # Scheduling view, mock-published post list
│   │   ├── page.tsx
│   │   └── components/
│   ├── (insights)/                # Cross-Platform Insights dashboard + weekly reports
│   │   ├── page.tsx
│   │   └── components/
│   ├── api/
│   │   ├── webhooks/clerk/route.ts
│   │   └── inngest/route.ts       # Inngest function invocation endpoint
│   └── layout.tsx
│
├── server/
│   └── trpc/
│       ├── briefRouter.ts
│       ├── assetRouter.ts
│       ├── approvalRouter.ts
│       ├── publisherRouter.ts
│       ├── metricsRouter.ts
│       └── insightsRouter.ts
│
├── lib/
│   ├── design/                     # theme-support utilities — see docs/frontend/DESIGN_SYSTEM.md
│   │   └── stickerRotation.ts      # deterministic per-asset-id rotation, per DESIGN_SYSTEM.md's Implementation notes
│   ├── agents/                    # LangGraph nodes — one file per agent, mirrors architecture/AGENT_DESIGN.md
│   │   ├── briefAnalyzer.ts
│   │   ├── contentGenerator.ts
│   │   ├── imageAgent.ts
│   │   ├── complianceCheck.ts     # deterministic validator, NOT an LLM call — see ADR-005
│   │   ├── publisher.ts
│   │   ├── analyticsAgent.ts
│   │   ├── insightAgent.ts
│   │   └── graph.ts               # wires nodes + conditional edges (approve/reject/regenerate)
│   ├── channels/                  # per-channel config: constraints + mock adapters
│   │   ├── instagram.ts
│   │   ├── facebook.ts
│   │   ├── twitter.ts
│   │   └── types.ts
│   ├── ai/                        # LLM/image-gen client wrappers
│   │   ├── gemini.ts
│   │   ├── sarvam.ts              # only wired in if the Bengali guardrail requires it
│   │   ├── imageGen.ts            # Hugging Face FLUX / Replicate wrapper
│   │   └── embeddings.ts
│   └── guardrails/
│       ├── outputValidation.ts
│       └── bengaliNativenessCheck.ts
│
├── inngest/
│   └── functions/
│       ├── scheduledPublish.ts
│       ├── metricsIngestion.ts
│       └── weeklyReport.ts
│
├── prisma/
│   ├── schema.prisma
│   └── seed.ts
│
├── components/                    # shared UI (shadcn/ui-based)
├── docs/                          # ← you are here
├── .env.example
└── package.json
```

## Ownership boundaries

- **`lib/agents/`** contains every piece of AI-driven logic. Nothing outside this folder calls Gemini, Sarvam, or the image generation APIs directly — this keeps the agent graph the single place where AI behavior is defined, testable, and auditable against `agents/GUARDRAILS.md`.
- **`lib/channels/`** owns per-channel constraints (character limits, aspect ratios, file sizes) and the mock publish behavior. Adding a fifth channel later means adding one file here, not touching the agent graph.
- **`server/trpc/`** is the only way the frontend touches data — no component calls Prisma or an AI client directly.
- **`lib/design/`** holds the one piece of "theme logic" that's actual code rather than CSS — the deterministic sticker-rotation function. It stays separate from `components/` because it's pure, testable logic (id in, rotation degree out), not a UI component itself.
- **Compliance validation (`lib/agents/complianceCheck.ts`) reads its rules from `lib/channels/`**, not from hardcoded values inside the agent itself — this is what makes "add a channel" a one-file change instead of a scattered one.

## Where new code goes

| Task | Location |
|---|---|
| Add a new agent node | `lib/agents/` + wire into `lib/agents/graph.ts` |
| Add a new channel | `lib/channels/` (constraints + mock adapter) |
| Change a database model | `prisma/schema.prisma` → migrate |
| Add a new async/scheduled step | `inngest/functions/` |
| Add a new prompt | `agents/AGENT_PROMPTS.md` (doc) + the relevant file in `lib/agents/` |
| Change the design system | `docs/frontend/DESIGN_SYSTEM.md` first, then `app/globals.css` + `tailwind.config.ts` |
| Add sticker card / rotation logic | `lib/design/stickerRotation.ts` — see `DESIGN_SYSTEM.md`'s Implementation notes; never call `Math.random()` for rotation, it must stay deterministic per asset ID |
| Write new UI copy (buttons, empty states, errors) | Check `DESIGN_SYSTEM.md`'s Voice & Microcopy table first — match its tone, don't default to generic SaaS phrasing |
