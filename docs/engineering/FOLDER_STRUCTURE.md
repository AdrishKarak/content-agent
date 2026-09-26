# Folder Structure — Within-App Conventions

`docs/PROJECT_STRUCTURE.md` shows the top-level layout. This covers conventions within it.

## `app/`

Route-group-per-module, matching the four required modules from the problem statement:

```
app/
├── (studio)/       # Generative Studio — brief submission + generation results
├── (approval)/     # Approval queue
├── (publisher)/    # Scheduling + mock-published post list
├── (insights)/     # Cross-Platform Insights + weekly reports
```

Each route group owns its own `components/` subfolder for page-specific UI; a component only moves to the shared top-level `components/` once a second module actually needs it.

## `lib/agents/`

One file per pipeline stage, in the same order as `architecture/AGENT_DESIGN.md`:

```
lib/agents/
├── briefAnalyzer.ts
├── contentGenerator.ts
├── imageAgent.ts
├── complianceCheck.ts   # deterministic — no AI client imports here, ever
├── publisher.ts
├── analyticsAgent.ts
├── insightAgent.ts
└── graph.ts              # wires everything together, including conditional edges
```

No agent file imports another agent file directly — handoffs are wired in `graph.ts` only, so the control flow (including the Reject → Regenerate routing) lives in one place.

## `lib/channels/`

```
lib/channels/
├── instagram.ts   # constraints + mock adapter for Instagram
├── facebook.ts
├── twitter.ts
└── types.ts        # shared ChannelConfig type, imported by all three
```

Each file exports the same shape (constraints object + `mockPublish()` function) so `complianceCheck.ts` and `publisher.ts` can iterate over channels generically rather than special-casing each one.

## `lib/ai/`

Thin client wrappers only — no business logic:

```
lib/ai/
├── gemini.ts
├── sarvam.ts        # only present once ADR-006's condition is met
├── imageGen.ts
└── embeddings.ts
```

## `inngest/functions/`

```
inngest/functions/
├── scheduledPublish.ts
├── metricsIngestion.ts
└── weeklyReport.ts
```

Each function reads its required state entirely from Postgres at invocation time — never assumes anything from the in-process pipeline state (`architecture/MEMORY_ARCHITECTURE.md` §3).

## Tests

Co-located: `complianceCheck.ts` + `complianceCheck.test.ts` in the same folder. End-to-end tests (Playwright) live in a top-level `e2e/` folder since they span multiple app route groups.
