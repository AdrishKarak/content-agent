# Task Breakdown — Hackathon Build Plan

Ordered to de-risk the two hardest, most disqualifier-relevant problems **first** — Bengali nativeness and per-channel image distinctiveness — rather than building UI polish before knowing whether the core AI capabilities actually work for this use case.

## Phase 0 — Spike: verify the two hardest requirements (a few hours, before any real building)

- Call Gemini directly with a Bengali marketing brief; read the output. Does it sound native? This decides ADR-006's Sarvam question before you build anything around it.
- Generate 3 test images from 3 deliberately different prompts (not one prompt + 3 crops); confirm they look genuinely distinct.
- **Do not proceed to Phase 1 until both of these are verified** — everything else assumes these are solvable with your chosen models.

## Phase 1 — Foundation (half a day)

- Next.js 15 + TypeScript + Tailwind + shadcn/ui scaffold
- Base neobrutalism theme wired in — colors, fonts (Bungee/Inter/JetBrains Mono), overridden `--radius`, the `neo-shadow` utility, and `lib/design/stickerRotation.ts` — per `docs/frontend/DESIGN_SYSTEM.md`. Do this now, not as a later polish pass: every subsequent phase builds UI, and building it against default shadcn styling first just means re-skinning everything later.
- Clerk auth wired in
- Prisma + Neon Postgres connected, `pgvector` enabled, initial migration
- tRPC wired end-to-end with a dummy procedure

**Exit criteria:** logged-in user sees an empty Studio page, already styled in the neobrutalism theme (not default shadcn), with its empty-state copy pulled from `DESIGN_SYSTEM.md`'s voice table rather than a placeholder string.

## Phase 2 — Brief → Structured Spec (half a day)

- Brief submission UI
- Brief Analyzer Agent implemented and Zod-validated
- `Brief` table populated

**Exit criteria:** submitting a brief produces a visible, structured spec.

## Phase 3 — Content Generation (1 day)

- Content Generator Agent, 3 distinct per-channel prompt templates (`agents/AGENT_PROMPTS.md`)
- Bengali Nativeness Guardrail wired in and tested against Phase 0's spike findings
- `ContentAsset` rows created per channel

**Exit criteria:** one brief produces 3 genuinely different copy variants, and Bengali output passes the nativeness check.

## Phase 4 — Image Generation (1 day)

- Image Agent, 3 distinct per-channel prompts
- Image generation client (Replicate or HF FLUX)
- Cloudinary upload/storage

**Exit criteria:** one brief produces 3 visually distinct images per the Phase 0 spike's bar.

## Phase 5 — Compliance Check (half a day)

- Channel constraint configs (`lib/channels/`)
- Deterministic compliance validator (`architecture/DECISIONS.md` ADR-005)
- At least one deliberately-failing test fixture per rule per channel

**Exit criteria:** a too-long X post is reliably rejected with a specific reason; a valid asset passes.

## Phase 6 — Approval Queue (1 day)

- Pending queue UI
- Approve / Reject / Regenerate actions, with feedback captured on Reject/Regenerate
- Regeneration routes back through Content Generator/Image Agent with feedback incorporated
- Regeneration cap enforced (ADR-009)

**Exit criteria:** an asset can be rejected with feedback, regenerated, and the second attempt visibly reflects that feedback.

## Phase 7 — Scheduling & Mock Publishing (half a day)

- Scheduling UI
- Inngest function: mock publish at scheduled time, re-validating constraints (`product/ACCEPTANCE_CRITERIA.md` AC 12.2)
- `PublishedPost` records with mock post IDs

**Exit criteria:** an approved asset schedules, fires (or is manually triggered via Inngest dev tools), and produces a realistic mock-published record.

## Phase 8 — Metrics & Cross-Platform Comparison (half a day)

- Demo metrics generation + CSV upload path
- Comparison view: same `briefId`, all channels, side by side

**Exit criteria:** one brief's three channels show comparable metrics in one view, not three disconnected numbers.

## Phase 9 — Weekly Insight Agent + Feedback Loop (1 day — this is the highest-value remaining work)

- Insight Agent: report generation with citation grounding (`product/ACCEPTANCE_CRITERIA.md` AC 16.1)
- `InsightEmbedding` created from report output
- Retrieval wired into the Brief Analyzer/Content Generator's prompt context for new briefs
- Insight-retrieval moment surfaced visibly in the Studio UI (`frontend/DESIGN_SYSTEM.md`)

**Exit criteria:** submitting a second, related brief visibly shows a retrieved insight from the first campaign's report in its generation context — this is the strongest defense against auto-disqualifier #3 and worth not rushing.

## Phase 10 — Polish, demo prep, and (only if time remains) video generation stretch goal

- Manual verification checklist from `engineering/TESTING_STRATEGY.md`, run in full
- Pre-seed the live demo deployment with a convincing example campaign
- Record the under-5-minute demo video, structured around: brief → generation → compliance rejection (shown live) → approval → mock publish → insights → feedback into next brief
- **Only if time remains:** video generation stretch goal (ADR-003), clearly labeled "Coming Soon" in the UI if not completed

## What NOT to do if time runs short

Cut in this order, latest-added-value first: video generation (never in MVP scope anyway) → visual polish beyond the core design system → CSV metrics upload (fall back to demo-generated metrics only) → Sarvam AI integration (skip if Gemini's Bengali passes the guardrail). **Never cut**: the approval gate, the compliance check, or the insight retrieval loop — these three map directly to the three stated auto-disqualifiers.
