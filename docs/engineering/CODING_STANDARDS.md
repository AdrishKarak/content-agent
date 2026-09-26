# Coding Standards

## TypeScript
- Strict mode. No `any` — use `unknown` and narrow, or a proper Zod-inferred type.
- Every agent's input/output is Zod-validated (`architecture/AGENT_DESIGN.md` state shape) — LLM output is untrusted until it passes schema validation, never assumed correct because the call succeeded.

## Channel casing convention

Prisma's `Channel` enum stores `INSTAGRAM | FACEBOOK | TWITTER` (uppercase, matching every other enum in the schema). Application code — agent state, prompt templates, `lib/channels/` file contents — uses the lowercase literal union `"instagram" | "facebook" | "twitter"`, since that reads more naturally in prompts and config. **This is a deliberate boundary, not an inconsistency**: one conversion pair (`toDbChannel` / `fromDbChannel`) in `lib/channels/types.ts` is the single place this mapping happens. Nothing else in the codebase should do its own case conversion — if you find yourself writing `.toUpperCase()` on a channel string outside that file, stop and use the shared helper instead.

## Naming
- `camelCase` for variables/functions, `PascalCase` for types/components, `SCREAMING_SNAKE_CASE` for enum values (matches Prisma).
- Channel identifiers in application code are consistent everywhere: `"instagram" | "facebook" | "twitter"` — never abbreviated (`"ig"`, `"fb"`) — see "Channel casing convention" below for how this relates to the Prisma enum's uppercase values.

## Agent code (`lib/agents/`)
- One file per agent/stage, matching `architecture/AGENT_DESIGN.md` exactly — if the docs and the code drift in naming or stage order, fix whichever is wrong immediately, don't let them diverge.
- Every agent function takes and returns plain, serializable data (no class instances, no closures over external state) — this keeps agents independently testable by passing in fixed inputs and asserting on outputs, without needing to mock a shared object graph.
- The Compliance Check is pure, synchronous, deterministic code (see `architecture/DECISIONS.md` ADR-005) — it must never make a network call. If a future compliance rule seems to need an LLM (e.g. "does this feel on-brand"), that's a signal it belongs in human review, not in this function.

## Channels (`lib/channels/`)
- Each channel's constraints are defined as plain data (character limits, aspect ratio, file size, hashtag rules) — not scattered as magic numbers inside the Compliance Check or the mock adapter. Adding a channel means adding one config object plus one mock adapter function, not touching agent code.

## Prompts (`lib/agents/*.ts` + `agents/AGENT_PROMPTS.md`)
- Keep the prompt text in the code (where it's actually used) and mirror it in `agents/AGENT_PROMPTS.md` (where it's documented) — update both together. A prompt that only exists in one place will drift.
- Every prompt that asks for structured output specifies the exact JSON shape inline, matching the Zod schema it will be validated against.

## Error handling
- Follow `engineering/ERROR_HANDLING.md` — expected failures (a generation call failing, a compliance rule failing) return typed results; only truly unexpected failures throw.

## Commits
- Conventional commits (`feat:`, `fix:`, `docs:`, `test:`) — useful in a hackathon too, since it makes the demo video's "here's what we built" narration easy to reconstruct from git log if needed.
