# CLAUDE.md

Instructions for any coding agent working in this repository.

## What this is

A hackathon project (hoichoi Hackathon '26, Problem 3): a single content brief becomes channel-tailored, natively-generated copy and images across Instagram/Facebook/X, gated by human approval, mock-published, measured, and reported on — with those insights feeding back into the next brief. Full context: `docs/CONTEXT.md` — read it first, especially the three auto-disqualifiers, since violating any one of them scores zero regardless of everything else built.

## Repo shape

A **single Next.js application** — no multi-service architecture (see `docs/architecture/DECISIONS.md` ADR-004). Full layout: `docs/PROJECT_STRUCTURE.md`.

```
pnpm install
pnpm dev              # Next.js app
pnpm inngest:dev      # Inngest dev server, for async steps
pnpm prisma generate / migrate dev
```

Full setup: `docs/SETUP.md` — including the Phase 0 spike (verify Bengali generation and per-channel image distinctiveness) that must pass before building anything else.

## Non-negotiable rules

1. **Never crop/relabel one image and call it "tailored" per channel.** Every channel gets a separately composed generation prompt. This is the project's #1 auto-disqualifier. See `architecture/DECISIONS.md` ADR-002.
2. **Nothing reaches scheduling/publishing without an explicit human Approve.** No code path skips this, ever. This is auto-disqualifier #2. See `product/HITL_CHECKPOINTS.md`.
3. **Insights must be retrieved into the next brief's generation, not just displayed on a dashboard.** This is auto-disqualifier #3. See `architecture/AGENT_DESIGN.md` stage 2 and `architecture/DECISIONS.md` ADR-008.
4. **Compliance checking is deterministic code, never an LLM call.** See ADR-005. If a compliance rule seems to need judgment, it belongs at human review, not in this function.
5. **Bengali generation is native, never translated.** One prompt, in Bengali, asking for Bengali output — never English generation followed by a translation step. The Bengali Nativeness Guardrail (`agents/GUARDRAILS.md` §2) runs on every Bengali generation as a runtime check, not a one-time manual test.
6. **The mock channel adapter re-validates constraints at publish time**, independent of the earlier Compliance Check — a second enforcement layer, per the problem statement's explicit requirement.
7. **Regeneration is capped at 2 automatic attempts per asset** before requiring manual intervention (ADR-009) — both a cost and a demo-safety guardrail.
8. **No real social media API integration** — publishing is entirely mocked (ADR-001). Don't add OAuth/real API work; it's explicitly out of scope.
9. **UI copy follows `frontend/DESIGN_SYSTEM.md`'s voice table, and its one rule: funny about the situation, never at the user's expense.** Don't write generic SaaS copy ("Approve", "No data") for anything a user reads, and don't write a joke that makes a reviewer feel dumb for triggering it.

## "Which doc do I need" map

| You're about to... | Read first |
|---|---|
| Add/change a database model | `architecture/DOMAIN_MODEL.md`, then `prisma/schema.prisma` |
| Add or change an agent stage | `architecture/AGENT_DESIGN.md` |
| Write or edit a prompt | `agents/AGENT_PROMPTS.md`, `agents/GUARDRAILS.md` |
| Add a tRPC procedure | `api/API_SPEC.md` |
| Add a new channel (beyond IG/FB/X) | `engineering/FOLDER_STRUCTURE.md` — `lib/channels/` conventions |
| Touch the UI | `frontend/DESIGN_SYSTEM.md` |
| Deal with a failure case | `engineering/ERROR_HANDLING.md` |
| Worried about API cost/quota | `operations/COST_STRATEGY.md`, `api/RATE_LIMITS.md` |
| Not sure where something belongs | `docs/INDEX.md` |

## Current build phase

See `roadmap/TASK_BREAKDOWN.md`. Phase 0 (verify Bengali generation + image distinctiveness) must pass before any other phase begins.
