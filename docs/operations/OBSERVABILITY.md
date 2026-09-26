# Observability

Scaled to hackathon needs — enough to debug during the build and to explain what happened if something misbehaves during a live demo, not a full production monitoring setup.

## What to log, at minimum

- Every pipeline stage's start/end and outcome, tagged with `briefId` and `channel` where applicable — this is what lets you reconstruct "what happened" if a live demo run behaves unexpectedly in front of judges.
- Every Compliance Check result, including which specific rule failed — this is directly demoable evidence, so make sure it's visible somewhere (UI and/or logs), not just implicit in the final pass/fail.
- Bengali Nativeness Guardrail results (pass/fail per attempt) — useful both for debugging and as evidence you can point to if a judge asks "how do you know this isn't just translated."

## Sentry (if time allows)

Wire in for uncaught exceptions only — this is a nice-to-have, not a blocker. If time is tight, skip it and rely on Vercel's built-in function logs plus your own structured console logging.

## What "healthy" looks like before the demo

- The last full pipeline run (brief → report) completed without an uncaught error
- The pre-seeded demo campaign's data is intact (not accidentally overwritten by a test run)
- No API key is near a rate limit or quota exhaustion right before recording the demo video — check provider dashboards the day of
