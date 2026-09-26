# Project Context

## What this is

**AI Content Studio & Multi-Platform Command Center** — a hackathon project (hoichoi Hackathon '26, Problem 3, Track: Content Ops / Generative AI). It turns a single content brief into on-brand, natively-generated assets for multiple social channels, gated by human approval, scheduled and mock-published, with performance metrics feeding an AI-written weekly report — and that report's insights feed back into the next brief.

## The four required modules

1. **Generative Studio** — brief in, channel-tailored copy + images out (Bengali and English, natively generated, not translated)
2. **Publisher** — approval queue → scheduling → mock multi-platform publishing
3. **Analytics Store** — ingest performance metrics per published post
4. **Cross-Platform Insights** — compare content side-by-side across channels, produce a weekly AI report, and feed learnings back into future briefs

## The pipeline

```
Content Brief (text)
    ↓
Brief Analyzer Agent  →  structured campaign spec (genre, audience, language, tone, channels)
    ↓
Content Generator Agent  →  per-channel copy (Bengali + English), CTA, hashtags
    ↓
Image Agent  →  per-channel distinct image (NOT one image resized three ways)
    ↓
Compliance Check  →  character limits, aspect ratio, file size — rejects violations
    ↓
Human Approval Gate  →  Approve / Reject / Regenerate (nothing skips this)
    ↓
Scheduler  →  Mock Publish (per channel, via a mock adapter — no real social APIs)
    ↓
Metrics Ingestion  →  demo-generated or CSV-uploaded performance data
    ↓
Cross-Platform Comparison  →  like-for-like, same brief across channels
    ↓
Weekly Insight Agent  →  AI report, every claim cites real post IDs
    ↓
Insights retrieved (via embeddings) when analyzing the NEXT brief
```

## What must be gotten right (from the problem statement, verbatim priorities)

| Requirement | What it means concretely |
|---|---|
| **Generation** | Visual and copy must differ meaningfully per channel (tone, length, hashtag convention, CTA) — Bengali and English are both natively generated, not translated |
| **Approval gate** | Nothing enters the publishing queue without explicit human approval; a discard-and-retry (regenerate) loop exists before that point |
| **Comparison** | Cross-platform insights compare like-for-like content side by side, not just separate per-platform totals |

## Auto-disqualifiers (do not violate these, ever)

1. One generated image cropped/relabeled per platform and called "tailored"
2. Generation with no approval gate before scheduling
3. Insights that live on a dashboard but never reach brief creation

Every one of these three has a corresponding architectural safeguard in this project — see `architecture/DECISIONS.md` ADR-002 (per-channel image generation), `product/HITL_CHECKPOINTS.md` (the approval gate), and `architecture/AGENT_DESIGN.md` (the Insight Agent's output is retrieved as input to the next Brief Analyzer run, not just displayed).

## The toughest test (from the problem statement)

> A Bengali brief is checked for genuinely native-sounding output, not machine translation. A post that violates a platform constraint is submitted to the adapter layer and must be rejected, not silently accepted.

This project treats both halves of that sentence as first-class, testable requirements — not as things to eyeball once during development:
- **Native Bengali** gets an automated runtime check (see `agents/GUARDRAILS.md` §2), not just a one-time manual spot-check before the demo.
- **Constraint rejection** is deterministic, rule-based validation (see `architecture/AGENT_DESIGN.md` — Compliance Agent), not another LLM call that could itself hallucinate a pass.

## What this is NOT (scope discipline for a hackathon)

- **Not connected to real social media APIs.** Publishing is entirely mocked — see `architecture/DECISIONS.md` ADR-001.
- **Not a video generation platform for the MVP.** The problem statement says "image/video," not "image AND video" — see ADR-003. Video is an explicit stretch goal, clearly labeled as such in the demo, never silently missing.
- **Not a general social media scheduler.** It only handles content originating from a brief created in this system.
- **Not fully autonomous.** No asset reaches the publishing queue without a human clicking Approve — see `product/HITL_CHECKPOINTS.md`.

## Guiding principle for the demo

The strongest demo for this problem is not video generation or the flashiest image model — it's showing the **complete, closed loop**: brief → multi-agent generation → compliance validation → human approval → scheduling → analytics → AI insights → those insights visibly shaping the next brief. Judges are told exactly what the auto-disqualifiers are; showing the loop close is worth more than any single flashy component.

## Related documents

- `docs/SETUP.md` — get it running locally
- `docs/PROJECT_STRUCTURE.md` — where everything lives
- `architecture/SYSTEM_ARCHITECTURE.md` — how the pieces fit together
- `architecture/AGENT_DESIGN.md` — the 8-agent pipeline
- `architecture/DECISIONS.md` — why things are built the way they are
- `roadmap/TASK_BREAKDOWN.md` — phased build plan for hackathon time constraints
