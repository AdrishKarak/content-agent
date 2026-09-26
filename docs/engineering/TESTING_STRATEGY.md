# Testing Strategy

Given hackathon time constraints, testing effort is concentrated where a silent bug would directly cause an auto-disqualifier, not spread evenly.

## Highest priority: Compliance Check unit tests

Since compliance checking is deterministic code (`architecture/DECISIONS.md` ADR-005), it's fully unit-testable with exact fixtures:

```ts
// example test shape
test("rejects X copy over character limit", () => {
  const result = checkCompliance({ channel: "twitter", copy: "x".repeat(300) });
  expect(result.passed).toBe(false);
  expect(result.failures).toContainEqual(
    expect.objectContaining({ rule: "character_limit" })
  );
});
```

Write at least one deliberately-violating fixture per rule per channel (character limit, aspect ratio, file size) — these are also exactly the test cases worth demoing live to judges (`product/ACCEPTANCE_CRITERIA.md` AC 6.1).

## Second priority: Bengali nativeness guardrail

Since this is the stated "toughest test," it deserves a real test harness, not just a one-time manual check:
- A small fixture set (5–10 known-good native Bengali examples, 5–10 known-translated examples) run through the guardrail check to sanity-check its own accuracy before trusting it in the pipeline
- This can be a plain script run manually before the demo, not necessarily wired into CI given hackathon time — but it must exist and be run at least once with recorded results

## Third priority: the cross-platform comparison join

Since AC 14.1 depends on the comparison being genuinely like-for-like (same `briefId` across channels, not coincidentally similar totals), a test with seeded fixture data (one brief, three channels, three different metric sets) should assert the comparison view groups them correctly.

## Agent pipeline tests

Test each agent function in isolation with fixed inputs (per `engineering/CODING_STANDARDS.md`'s "plain, serializable data" convention) — no need to run the full LangGraph for most of these:
- Brief Analyzer: given a brief string, assert the structured spec shape and reasonable field values
- Content Generator: given a spec, assert three genuinely different outputs are produced per channel (this can be a length/tone heuristic check, not a full quality judgment)
- Regeneration cap: given 2 prior regenerate attempts, assert the 3rd is flagged for manual intervention rather than looping (`architecture/DECISIONS.md` ADR-009)

## What NOT to spend hackathon time on

- Full E2E coverage of every UI interaction — pick the 2–3 flows that matter for the demo (submit brief → review → approve → see it scheduled; reject and regenerate; view the weekly report) and cover those with Playwright, skip the rest.
- Load/performance testing — irrelevant for a hackathon demo with a handful of test campaigns.
- Testing the mock adapters' "success" path exhaustively — the interesting test is that they *reject* violations (AC 12.2), not that they succeed on valid input (which is the easy case).

## Manual verification checklist before the demo

Since hackathon time won't allow full automated coverage of everything, verify these manually, in order, before recording the demo video:

1. Submit a Bengali brief → generated copy reads native, not translated (this is the single most important manual check in the whole project)
2. Confirm the three per-channel images look meaningfully different from each other
3. Deliberately submit an asset that violates a compliance rule → confirm it's rejected with a clear reason, live, on camera
4. Approve → confirm it schedules; let it fire (or manually trigger the Inngest function) → confirm a realistic mock-published record appears
5. Ingest metrics → confirm the cross-platform comparison shows the same brief's channels side by side
6. Generate a weekly report → confirm every claim cites a real post ID
7. Submit a second, related brief → confirm the previous campaign's insight is visibly retrieved into the new generation's context (this is the check for disqualifier #3 — the single most important structural check in the whole project, alongside #1)
8. Scan the whole UI for any leftover generic copy ("Approve", "Reject", a plain "No data" string) that never got swapped for its `DESIGN_SYSTEM.md` voice-table equivalent ("Ship It", "Nope", "Not enough posts to say anything smart yet") — a theme that's funny in the design doc but generic in the actual UI reads as an unfinished skin, not a deliberate choice
9. Confirm sticker cards are visibly rotated and the rotation doesn't jump/reshuffle on page refresh (proves the rotation is deterministic per asset ID, not `Math.random()` — see `docs/frontend/DESIGN_SYSTEM.md` Implementation notes)
