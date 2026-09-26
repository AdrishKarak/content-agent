# Error Handling

## General principle

Distinguish expected failure (a generation call fails, an image doesn't come back, a compliance rule fails) from unexpected failure (a bug, a violated invariant). Expected failures return typed results; unexpected failures throw and surface visibly rather than being swallowed.

## Per-stage handling

| Stage | Failure mode | Handling |
|---|---|---|
| Brief Analyzer | Malformed/unparseable output | Retry once; on second failure, flag the brief for manual structuring rather than guessing at a spec |
| Content Generator | One channel's generation fails | Other channels proceed independently — a Twitter API hiccup shouldn't block Instagram/Facebook generation |
| Bengali Nativeness Guardrail | Fails the check | Retry generation once (optionally via Sarvam if configured); on second failure, flag the asset — never silently ship translation-quality Bengali output |
| Image Agent | Generation fails or times out | The corresponding copy asset still proceeds to compliance/approval with a "regenerate image" action available, rather than discarding the whole channel's work |
| Compliance Check | A rule can't be confidently evaluated (e.g. malformed image metadata) | **Fails closed** — treated as a compliance failure requiring manual review, never treated as a silent pass |
| Mock Publish (Inngest) | Constraint re-validation fails at publish time | The asset is NOT published; flagged for manual review — this is a second enforcement layer, so failing here is expected occasionally, not a bug |
| Metrics ingestion | CSV malformed or missing expected columns | Reject the upload with a specific error, don't partially ingest silently-wrong data |
| Weekly Report | Insufficient data for the period | Report explicitly states this, rather than fabricating plausible-sounding numbers (`product/ACCEPTANCE_CRITERIA.md` AC 16.2) |

## Regeneration loop bounds

Per `architecture/DECISIONS.md` ADR-009, Reject → Regenerate is capped at 2 automatic attempts. On the 3rd rejection, the asset is flagged for manual editing rather than triggering another generation call — this is both a cost control and a demo-safety measure (an unbounded loop live in front of judges is a real risk).

## User-facing error states

- A failed generation call surfaces as a clear per-asset error state in the Studio UI ("Generation failed for X — retry?"), not a blank card or a silent gap in the review queue.
- A compliance rejection always shows the specific rule and reason (`ComplianceCheck.reason`), never a generic "this failed" message — the reviewer needs to know whether to regenerate or manually edit.

## Logging

Given the compressed hackathon timeline, structured logging matters less than for a production system, but log at minimum: which brief, which channel, which stage, and outcome — this is what makes the demo video's "here's what happens when we submit a bad asset" narration reconstructable from actual logs if something behaves unexpectedly during a live demo.
