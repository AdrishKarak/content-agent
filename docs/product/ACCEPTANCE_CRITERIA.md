# Acceptance Criteria

Given/When/Then criteria for the highest-priority stories (see `product/USER_STORIES.md`).

## Story 2 — Brief analysis

**AC 2.1 — Structured output**
- Given a plain-text brief is submitted
- When the Brief Analyzer Agent processes it
- Then it returns a structured spec (genre, audience, language, tone, target channels) that validates against its Zod schema — malformed output is retried once, then flagged for manual review rather than silently proceeding with garbage

## Story 3, 4, 5 — Channel-tailored generation

**AC 3.1 — Distinct copy per channel**
- Given a campaign spec for Instagram, Facebook, and X
- When the Content Generator Agent runs
- Then each channel's copy differs in at least tone, length, and CTA phrasing — copy that is identical or near-identical across channels (beyond the core message) fails review

**AC 4.1 — Native Bengali, not translated**
- Given a brief requesting Bengali content
- When Bengali copy is generated
- Then it is generated directly in Bengali by the model, never produced by generating English first and passing it through a translation step — see `agents/GUARDRAILS.md` §2 for the automated check
- And a native Bengali speaker (or the automated nativeness check) does not flag it as translation-like phrasing

**AC 5.1 — Distinct images per channel**
- Given a campaign spec targeting three channels
- When the Image Agent runs
- Then it issues three separately-composed image generation prompts (different composition/framing/focus, not just different aspect ratio crops of one image) and the resulting images are visually distinguishable from each other, not just differently cropped
- This is directly tested against the project's #1 auto-disqualifier (`docs/CONTEXT.md`)

## Story 6, 7 — Compliance

**AC 6.1 — Rejection on violation**
- Given a generated asset whose copy exceeds its channel's character limit (e.g. X's limit)
- When the Compliance check runs
- Then the asset is marked `REJECTED` with a specific reason, and does not appear in the approval queue as if it were valid
- This is directly tested against the project's stated "toughest test" (`docs/CONTEXT.md`)

**AC 6.2 — Deterministic, not model-judged**
- Given the same asset and the same channel rules
- When the Compliance check runs multiple times
- Then it produces the identical pass/fail result every time — compliance checking is implemented as rule-based validation, not an LLM call whose judgment could vary between runs (see `architecture/DECISIONS.md` ADR-005)

## Story 8, 9, 10 — Approval

**AC 8.1 — No bypass**
- Given any generated and compliance-passed asset
- When it has not yet received an Approve decision
- Then it cannot be scheduled or published under any code path — there is no internal "auto-approve" flag or admin override that skips this gate
- This is directly tested against the project's #2 auto-disqualifier

**AC 10.1 — Regenerate incorporates feedback**
- Given a reviewer clicks Regenerate with a feedback note (e.g. "too formal for Instagram")
- When the Content Generator or Image Agent re-runs for that asset
- Then the feedback note is included in the regeneration prompt — the second attempt is not generated from the exact same prompt as the first

**AC 10.2 — Regeneration is capped**
- Given an asset has been regenerated 2 times without approval
- When a 3rd regenerate is requested
- Then the system flags this asset for manual intervention (e.g. manual edit) rather than looping indefinitely — see `agents/GUARDRAILS.md` §4

## Story 11, 12 — Scheduling & mock publishing

**AC 12.1 — Mock publish output**
- Given an approved, scheduled asset's scheduled time arrives
- When the mock publish step runs
- Then a `PublishedPost` record is created with a realistic mock platform post ID and timestamp, and the asset's status updates to `PUBLISHED`

**AC 12.2 — Mock adapter still enforces constraints**
- Given a scheduled asset that somehow reaches the mock publish step with a constraint violation (e.g. a bug upstream let it through)
- When the mock adapter processes it
- Then the mock adapter itself re-validates and rejects it rather than "publishing" invalid content — the adapter layer is a second enforcement point, not a rubber stamp (this directly matches the problem statement's explicit requirement that the adapter layer must reject invalid content)

## Story 14 — Cross-platform comparison

**AC 14.1 — Like-for-like, not just totals**
- Given a campaign's assets published across Instagram, Facebook, and X
- When the cross-platform comparison view renders
- Then it shows the three channels' performance for the *same underlying brief* side by side (e.g. as a grouped chart keyed by `briefId`), not as three separate unrelated per-platform totals with no shared reference point
- This is directly tested against the "Comparison" requirement in `docs/CONTEXT.md`

## Story 15, 16 — Weekly report

**AC 16.1 — Citation grounding**
- Given a weekly report is generated
- When any specific performance claim appears in the report text
- Then it references the specific post ID(s) that claim is based on, and this is programmatically checkable — the report generator receives a structured metrics object and every number/claim in its output must trace back to that object, not be invented

**AC 16.2 — Graceful "not enough data" case**
- Given a week with no published posts or insufficient data
- When the weekly report is generated
- Then it explicitly states there's insufficient data, rather than fabricating plausible-sounding metrics

## Story 17 — Insight feedback loop

**AC 17.1 — Retrieval actually happens**
- Given at least one past campaign has a weekly report and embedded insights
- When a new brief is submitted
- Then the Brief Analyzer or Content Generator Agent retrieves the most relevant past insight(s) via embedding similarity and the retrieved content is demonstrably part of the prompt context for that run (loggable/inspectable, not just claimed)
- This is directly tested against the project's #3 auto-disqualifier — insights must reach brief creation, not just live on a dashboard
