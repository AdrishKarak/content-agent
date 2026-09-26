# Evaluation Criteria

How to judge whether each AI component is good enough to demo, given hackathon time constraints — prioritized toward the two explicit auto-disqualifiers and the stated "toughest test."

## Bengali nativeness (highest priority — this is the stated toughest test)

- Run the guardrail check (`agents/GUARDRAILS.md` §2) against a handful of known native vs. known translated Bengali examples first, to sanity-check the guardrail's own accuracy before trusting it in the pipeline.
- Have an actual Bengali speaker (team member or otherwise) read generated output directly — the automated guardrail is a safety net for the live demo, not a replacement for a human judgment call during development.

## Per-channel distinctiveness (highest priority — this is the stated #1 auto-disqualifier)

- **Images:** put the three generated images for one brief side by side. If a judge or teammate can't immediately tell they came from three different prompts (not just three crops of one image), that's a failure regardless of individual image quality.
- **Copy:** check that length, tone, and hashtag count/style actually differ across channels for the same brief — not just different superficially (e.g. different first sentence, identical structure otherwise).

## Compliance check accuracy

- For each channel's each rule (character limit, aspect ratio, file size), verify with both a passing and a deliberately-failing fixture that the check produces the correct result — this is fully testable (`engineering/TESTING_STRATEGY.md`), so there's no excuse for guessing here.

## Weekly report grounding

- Take a generated report and manually cross-check every specific claim against the actual metrics data it was given. Any claim that doesn't trace to a real post ID is a guardrail failure (`product/ACCEPTANCE_CRITERIA.md` AC 16.1) that needs prompt tightening.

## Insight feedback loop (highest priority — this is the stated #3 auto-disqualifier)

- The strongest possible evidence: run two related briefs (e.g. two campaigns for similar-genre shows) with a weekly report generated in between, and confirm the second brief's generation context visibly includes a retrieved insight from the first. Log or display this retrieval explicitly somewhere inspectable (even just a debug panel or console log) so it can be pointed to directly in the demo video, not just claimed.

## What "good enough for a hackathon demo" means here

Given the time constraint, the bar isn't "production quality" — it's "demonstrably satisfies every explicit requirement and auto-disqualifier in the problem statement, verifiably, on camera." Prioritize evaluation effort in the order above; polish (visual design, copy quality beyond "genuinely distinct and non-translated") matters less than proving these specific mechanisms work.
