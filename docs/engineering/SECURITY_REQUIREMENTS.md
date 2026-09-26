# Security Requirements

Lighter than a production system's requirements, but not skipped — a hackathon demo that leaks another team's (or a judge's) test data reflects badly regardless of context.

## Data isolation

- If the app supports multiple users/teams (even just for demo purposes), every query on `Brief`, `ContentAsset`, `WeeklyReport`, etc. is scoped to the authenticated user via Clerk's session — not accepted as a client-supplied parameter.
- If the hackathon demo only needs a single shared demo account, this is lower risk, but the query pattern should still be written as if it were multi-user, so it isn't a rewrite if the project continues past the hackathon.

## Secrets

- All API keys (Gemini, Sarvam, Hugging Face/Replicate, Clerk, Cloudinary, Inngest) live in environment variables (`api/ENVIRONMENT_VARIABLES.md`), never committed.
- Since this is a public GitHub repository (a submission requirement per `product/PRD.md`), double-check `.gitignore` excludes `.env` before the first commit — a leaked API key in a public hackathon repo is a real, common failure mode.

## Prompt injection (lower risk here than a scraping-heavy system, but not zero)

- Brief text is user-authored, not scraped from an adversarial external source, so the injection risk is lower than in a system ingesting external web content. Still, treat the brief as untrusted input to a prompt: delimit it clearly in every prompt template (`agents/AGENT_PROMPTS.md`) and don't let generated output control which tool/function gets called next — the pipeline's control flow (which stage runs next) is determined by code (`graph.ts`), never by parsing free-text model output for instructions.

## Media storage

- Generated images/video uploaded to Cloudinary should use signed/expiring URLs where practical, so demo assets aren't indefinitely publicly guessable — low stakes for a hackathon demo, but a cheap thing to get right.

## Input validation

- CSV uploads for metrics ingestion (`product/USER_STORIES.md` #13) are validated for expected columns/types before use — a malformed CSV should produce a clear rejection, not partially-ingested garbage data that then corrupts the weekly report.

## What's explicitly de-scoped for the hackathon

- Rate limiting on internal API calls — unnecessary for a demo with a handful of test users.
- Formal penetration testing / dependency vulnerability scanning — nice to have if time allows, not a blocker for submission.
