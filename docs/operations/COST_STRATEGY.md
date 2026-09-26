# Cost Strategy

## Primary cost driver: image generation

Per `architecture/DECISIONS.md` ADR-002, every brief triggers 3 separate image generations (never 1 resized 3 ways) — this is non-negotiable given it's a hard auto-disqualifier, so cost control has to happen elsewhere:

- **Use a cheaper/faster image model during development**, switch to the best-quality model only for the final demo assets — most of your image generation calls during the hackathon will be for testing and debugging, not final output.
- **Don't regenerate images unnecessarily while testing other stages.** Mock the Image Agent's output during Brief Analyzer / Content Generator development, and only call the real image API when specifically testing image generation or doing an end-to-end run.
- **Cap automatic regeneration at 2 attempts** (ADR-009) — this is a cost control as much as a UX one.

## Text generation cost

Much cheaper than image generation, but still avoid redundant calls:
- Cache the retrieved-insight embedding query per brief — don't re-embed and re-query on every retry within the same pipeline run.
- The Bengali Nativeness Guardrail call is cheap (short classification-style call, not a full generation) — don't skip it to save cost, since it's directly protecting against the project's stated toughest test.

## Sarvam AI — avoid the cost unless needed

Per ADR-006, don't wire in a second LLM provider speculatively. If Gemini's Bengali output passes the guardrail check reliably, there's no cost (or complexity) reason to add Sarvam at all.

## Free-tier awareness

Most hackathon teams run entirely on free-tier API keys. Know each provider's actual free-tier limits (Gemini, Replicate/HF, Cloudinary, Inngest) before the final 24 hours — running out of image generation credits the night before the demo is a common, avoidable failure mode. Check usage dashboards periodically during development, not just when something suddenly stops working.

## What NOT to optimize for cost

- Don't reduce to fewer than 3 distinct channel images to save cost — this directly risks the #1 auto-disqualifier.
- Don't skip the Compliance Check to save time/cost — it's free (deterministic code, no API cost) and it's directly tested in the "toughest test" requirement.
