# Rate Limits & API Budget

Hackathons run on free/trial-tier API keys with real quota limits — this matters more here than rate-limiting your own API, which barely matters for a demo with a handful of users.

## Per-brief cost accounting

One brief submission, at 3 channels, triggers:
- 1 Brief Analyzer call
- 3 Content Generator calls (1 per channel)
- Up to 1 Bengali Nativeness Guardrail call per Bengali asset
- 3 Image Agent calls (1 per channel) — the most expensive line item, per `architecture/DECISIONS.md` ADR-002
- 0 Compliance Check calls (free — deterministic code, no API cost)

Each Reject → Regenerate adds another Content Generator and/or Image Agent call, capped at 2 automatic attempts per asset (ADR-009).

**Rule of thumb while testing:** budget roughly 7–10 LLM/image calls per full brief-to-approval cycle, and multiply by however many test campaigns you run before the actual demo. Running the full pipeline 20+ times while debugging can burn through a free-tier image generation quota fast — test the early pipeline stages (Brief Analyzer, Content Generator) with mocked image generation during development, and only call the real image API when specifically testing that stage.

## Provider-specific notes

| Provider | Constraint | Mitigation |
|---|---|---|
| Gemini | Free-tier rate limits (requests/minute) | Batch nothing needs batching at hackathon scale; just avoid parallel-firing all 3 channel generations if you hit rate limits — sequential is fine for a demo |
| Replicate / Hugging Face | Free-tier credits are finite and per-image cost varies by model | Use a cheaper/faster model during development iteration, switch to the best-quality model only for final demo asset generation |
| Sarvam AI (if used) | Check current free-tier limits before committing to it as a fallback path | Only call it when the Bengali guardrail actually fails, not as a default |
| Cloudinary | Free tier has storage/bandwidth limits | Clean up test uploads before the final demo if approaching limits |

## Internal API

No meaningful rate limiting needed on the app's own tRPC endpoints for a hackathon demo — the real constraint is upstream provider quota, not your own server capacity.
