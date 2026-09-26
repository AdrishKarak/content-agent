# Human-in-the-Loop (HITL) Checkpoints

## Guiding principle

Automate generation, compliance-checking, and analysis fully. Require human confirmation before anything reaches a publishing queue, real or mock — the problem statement makes this explicit and it is also the project's single biggest auto-disqualifier risk (`docs/CONTEXT.md` #2).

## Checkpoints

| Checkpoint | What's gated | Why |
|---|---|---|
| Generated asset → publishing queue | Every asset (copy + image, per channel) requires an explicit Approve before it can be scheduled | Direct requirement from the problem statement: "Nothing enters the publishing queue without explicit human approval." No code path may skip this — see `product/ACCEPTANCE_CRITERIA.md` AC 8.1 |
| Reject → Regenerate | A rejected asset only regenerates when the reviewer explicitly requests it, with their feedback attached | Prevents silent, uncontrolled regeneration loops running up API cost without human awareness |
| Scheduling → mock publish | The mock publish step only fires at the scheduled time for assets already in `APPROVED` state | An asset that was rejected or never reviewed must never reach the mock adapter, even if a scheduling bug tries to fire it — this is enforced at the mock adapter level too, not just the scheduler (see `product/ACCEPTANCE_CRITERIA.md` AC 12.2) |
| Weekly report → next brief | The retrieved insight is *available as context*, not auto-applied as a rule that silently overrides what the content manager writes in their brief | The system should inform the human's next brief and the generation agents' reasoning, not autonomously rewrite briefs on their behalf |

## What is deliberately NOT gated (fully automated by design)

| Not gated | Why automation is safe here |
|---|---|
| Brief analysis (parsing into structured spec) | Informational/preparatory — feeds the next step, doesn't take action |
| Content/image generation | Nothing is published from generation alone; it always passes through Approval first |
| Compliance checking | This is itself a *safety* mechanism, not a risky action — it only ever prevents bad content from advancing, never approves anything on its own |
| Metrics ingestion | Read-only data collection, no outbound action |
| Weekly report generation | Informational output; the report itself doesn't publish or change anything by existing |

## Rule for evaluating new features

Before adding a new automated capability, ask:

1. Does it cause content to become visible outside the system (published, scheduled, sent)? → needs an explicit approval gate, no exceptions.
2. Does it override or bypass a human's prior explicit decision (e.g. auto-re-approving a previously-rejected asset after regeneration)? → needs its own explicit confirmation, not silent re-use of an old approval.
3. Is it purely informational or preparatory? → safe to automate.

If a proposed feature fails (1) or (2), design its approval step before building it — and check it against the project's own stated auto-disqualifiers in `docs/CONTEXT.md` before assuming it's fine.
