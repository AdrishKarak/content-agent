# Deployment Architecture

## Where it runs

| Component | Platform |
|---|---|
| Next.js app (UI + tRPC + LangGraph pipeline) | Vercel |
| Inngest functions | Run via Vercel's Inngest integration — no separate service (unlike the prior job-platform project, which needed a persistent Node service for its MCP server; this project has no equivalent long-running requirement — see `architecture/DECISIONS.md` ADR-004) |
| Database | Neon (or Supabase) — managed Postgres |
| Media | Cloudinary |

This is a single-deployment-target setup, deliberately simpler than a production system, because the whole point of ADR-004 was avoiding multi-service deployment complexity during hackathon time.

## The live demo link requirement

Per `product/PRD.md`'s submission requirements, a live, working demo link is mandatory. This means:
- The Vercel deployment must have all required environment variables set in the Vercel dashboard, not just locally
- The demo database should be pre-seeded with at least one complete example campaign (brief → generated assets → approved → published → metrics → report) so judges opening the live link see a working system immediately, not an empty state
- Consider a "reset demo data" script/button if judges are expected to interact with the live app themselves (submit their own test brief) — this avoids one judge's test data corrupting what the next judge sees

## Environments

For a hackathon, two is enough:
- **Local development** — your own machine, `pnpm dev` + `pnpm inngest:dev`
- **Production (the submitted demo link)** — the one Vercel deployment judges will actually open

A separate staging environment is unnecessary overhead for this timeline.

## Pre-submission checklist

- [ ] Live demo link loads without errors and shows a pre-seeded example campaign
- [ ] All required env vars are set in Vercel (cross-check against `api/ENVIRONMENT_VARIABLES.md`)
- [ ] GitHub repository is public and `.gitignore` correctly excludes `.env` (check the commit history too — a key committed and later removed is still in git history)
- [ ] The demo video (under 5 minutes) is recorded and uploaded per submission requirements
