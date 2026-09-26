# Environment Variables

Single app, single `.env` file — see `.env.example` at the repo root.

| Variable | Purpose | Required for MVP? |
|---|---|---|
| `DATABASE_URL` | Neon/Supabase Postgres connection (pooled) | Yes |
| `DIRECT_URL` | Direct connection, for Prisma migrations | Yes |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk client key | Yes |
| `CLERK_SECRET_KEY` | Clerk server key | Yes |
| `CLERK_WEBHOOK_SECRET` | Verifies Clerk webhooks | Yes |
| `GEMINI_API_KEY` | Text generation, Bengali nativeness guardrail | Yes |
| `SARVAM_API_KEY` | Bengali-specialist model | Only if `architecture/DECISIONS.md` ADR-006's condition is met |
| `REPLICATE_API_TOKEN` | Image generation | Yes (or use `HF_TOKEN` instead) |
| `HF_TOKEN` | Alternative image generation path (Hugging Face Inference API) | Only if using HF instead of Replicate |
| `CLOUDINARY_URL` | Media storage | Yes |
| `CLOUDINARY_API_KEY` / `CLOUDINARY_API_SECRET` | Media storage auth | Yes |
| `INNGEST_EVENT_KEY` / `INNGEST_SIGNING_KEY` | Async steps: scheduling, metrics, weekly report | Yes |
| `FAL_API_KEY` | Video generation | Only if building the stretch goal (ADR-003) |
| `SENTRY_DSN` | Error tracking | Optional |
| `NEXT_PUBLIC_APP_URL` | Used in generated links | Yes |

## Notes

- Skip `SARVAM_API_KEY` and `FAL_API_KEY` entirely at project start — both are conditional additions, not baseline requirements. Wiring them in speculatively before you know you need them wastes setup time that's better spent on the core pipeline.
- If both `REPLICATE_API_TOKEN` and `HF_TOKEN` are set, `lib/ai/imageGen.ts` should have one clearly configured default provider, not silently pick one — avoid ambiguous behavior in a hackathon codebase multiple people are touching.
