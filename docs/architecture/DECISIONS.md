# Architecture Decisions

Lightweight ADR log. Append new decisions; don't edit history.

---

## ADR-001: Publishing is entirely mocked — no real social media API integration

**Status:** Accepted

**Context:** The problem statement requires a "Publisher" module but doesn't require real platform integration, and the MVP scope explicitly says content is "published" via a mock channel adapter.

**Decision:** Never integrate real Instagram/Facebook/X APIs. Build per-channel mock adapters (`lib/channels/`) that simulate publish behavior, including realistic post IDs and re-validation of constraints.

**Consequences:** Removes OAuth complexity, API approval processes, and rate-limit risk entirely — all things that would consume disproportionate hackathon time for no judging benefit, since judges evaluate the demo, not production readiness. The mock adapter must still be a *real* enforcement point (see ADR-002 and the "toughest test" requirement), not just a no-op — a mock that always succeeds would fail the compliance-rejection requirement.

---

## ADR-002: Per-channel image generation, never a single image resized/relabeled

**Status:** Accepted

**Context:** The problem statement's #1 auto-disqualifier is exactly this failure mode.

**Decision:** The Image Agent issues a separately composed prompt per channel (different framing, focus, and layout intent — not just different aspect ratio), resulting in genuinely distinct generated images per channel.

**Consequences:** Roughly 3x the image generation API calls and cost versus a single-image approach — accepted, since this is a hard disqualifier, not a nice-to-have. See `operations/COST_STRATEGY.md` for how this is kept manageable within hackathon API budgets.

---

## ADR-003: Video generation is a stretch goal, not MVP scope

**Status:** Accepted

**Context:** The problem statement says "generated image/video," not "image AND video." Building real video generation (via Runway, fal.ai, etc.) adds significant complexity (longer generation times, larger files, different compliance rules) for a requirement that isn't mandatory.

**Decision:** Ship images only for the MVP demo. If time remains after the full pipeline works end-to-end, add video generation as a visibly-labeled "Phase 2 / Coming Soon" feature rather than leaving it as a silent gap.

**Consequences:** Focuses hackathon time on making the *required* loop (brief → generation → compliance → approval → publish → analytics → insight → next brief) fully work, which is explicitly called out as the strongest possible demo — a working full loop beats a partial loop with video.

---

## ADR-004: Single Next.js application, not a multi-service architecture

**Status:** Accepted

**Context:** A previous project (the AI Job Intelligence Platform) used a three-service architecture (web app, MCP tool server, agent orchestration worker) because it needed continuous background operation and a formal agent/tool trust boundary. This project has neither requirement: it's a fixed-scope hackathon build, generation runs are triggered by a human action (brief submission) rather than continuously, and there's no multi-tenant trust boundary between "the AI" and "the rest of the system" that needs enforcing via a protocol layer.

**Decision:** Build as one Next.js application. The LangGraph pipeline runs in-process. Async/scheduled work (publishing, metrics, weekly reports) runs via Inngest functions within the same app, not a separate service.

**Consequences:** Dramatically faster to build and deploy within hackathon time — one `pnpm install`, one dev server, one Vercel deployment. Tradeoff: less architectural separation between "agent logic" and "everything else" than the MCP-based approach — acceptable here because there's no compelling reason (scale, security boundary, multi-consumer tooling) to pay that complexity cost for a hackathon submission.

---

## ADR-005: Compliance checking is deterministic code, not an LLM agent

**Status:** Accepted

**Context:** An earlier draft plan (from a ChatGPT conversation used as project input) described a "Compliance Agent" without specifying whether it was LLM-based or rule-based. The problem statement's toughest test explicitly requires that violations be *rejected, not silently accepted* — an LLM judgment call is a weaker guarantee than a deterministic check, since it could itself be inconsistent or wrong between runs.

**Decision:** Implement compliance checking as plain, deterministic TypeScript functions reading each channel's actual numeric/structural constraints (`lib/channels/`) — character count, aspect ratio, file size are all directly computable facts, not judgment calls requiring an LLM.

**Consequences:** Fully testable with unit tests (exact inputs, exact expected pass/fail) — see `engineering/TESTING_STRATEGY.md`. Also faster and cheaper than an LLM call on every asset. The tradeoff is that this can't catch *subjective* compliance issues (e.g. "does this hashtag convention feel right for Instagram") — that's intentionally left to human review at the approval gate, not automated.

---

## ADR-006: Gemini first for text generation; Sarvam AI only if the Bengali guardrail fails

**Status:** Accepted

**Context:** The problem statement's toughest test is specifically about Bengali output reading as natively written, not translated. Gemini's Bengali capability as of early 2026 is generally considered good enough for many use cases, but this needs to be verified for this specific use case (marketing copy, informal/persuasive tone) before committing.

**Decision:** Default to Gemini for all text generation. Add an automated Bengali Nativeness Guardrail (`agents/GUARDRAILS.md` §2) that runs on every Bengali generation. Only wire in Sarvam AI (an Indic-language-specialist model) if that guardrail's failure rate against Gemini output is high enough to justify the added complexity of a second model provider.

**Consequences:** Avoids committing to a second LLM provider (and its own API key, rate limits, and prompt-tuning work) unless the data shows it's actually needed. The guardrail check itself is cheap to run and gives an objective signal rather than relying on a one-time manual spot-check that might miss edge cases the demo doesn't happen to hit.

---

## ADR-007: Inngest for all async/scheduled work

**Status:** Accepted

**Context:** Scheduled publishing, metrics ingestion, and weekly report generation all need to run independent of any single request/response cycle, and potentially after the process that created them has restarted or redeployed.

**Decision:** Use Inngest step functions for all three, consistent with the choice made on the prior job-platform project (see that project's `architecture/DECISIONS.md` ADR-001) — same reasoning applies: it's simpler than a message broker, has built-in retries/observability, and needs no separate infrastructure to run.

**Consequences:** One more dependency (an Inngest account/dev server) but no custom queue/worker code to write and debug during hackathon crunch time.

---

## ADR-008: pgvector-based retrieval as the mechanism for the insight feedback loop

**Status:** Accepted

**Context:** The problem statement's #3 auto-disqualifier is insights that live on a dashboard but never reach brief creation. A report that's merely displayed to a human, who may or may not read it before writing their next brief, doesn't robustly satisfy this — it depends on human diligence, not a system guarantee.

**Decision:** Embed each weekly report's key insights (`InsightEmbedding`) and automatically retrieve the most relevant past insight(s) via pgvector cosine similarity whenever a new brief is analyzed, injecting them directly into the generation prompt context (`architecture/AGENT_DESIGN.md` stage 2).

**Consequences:** This is a genuine, demoable technical mechanism — you can show, in the demo video, that a specific past insight measurably appears in a subsequent generation's context, which is a much stronger disqualifier defense than "the report is on this dashboard page." It also happens to be the single best use of the team's existing pgvector/embeddings experience in this whole project.

---

## ADR-009: Regeneration is capped at 2 automatic attempts per asset

**Status:** Accepted

**Context:** The Reject → Regenerate loop (`product/HITL_CHECKPOINTS.md`) has no natural upper bound unless one is imposed — a reviewer repeatedly rejecting the same asset could otherwise run up generation API cost indefinitely with no forcing function toward resolution.

**Decision:** After 2 automatic regenerations for a given asset without approval, the system flags it for manual intervention (e.g. direct manual edit of the copy, or escalation) rather than allowing indefinite automatic regeneration.

**Consequences:** Bounds cost and demo risk (an infinite regenerate loop live in front of judges would be a bad look). Mirrors the same reasoning as the guardrail retry caps used in the prior job-platform project.

---

## ADR-010: Hugging Face FLUX / Replicate for image generation, not a single locked-in provider

**Status:** Accepted

**Context:** Image generation quality and per-channel prompt-following behavior can vary meaningfully between models, and hackathon time is better spent iterating on prompts than locked into one provider's specific API from day one.

**Decision:** Use Replicate (or direct Hugging Face Inference API) as the image generation client, since both provide access to multiple models (FLUX and others) behind one API surface, making it cheap to swap models if one isn't producing sufficiently distinct per-channel results.

**Consequences:** Slightly more abstraction in `lib/ai/imageGen.ts` than calling one vendor's SDK directly, but this pays for itself the moment the team needs to swap models mid-hackathon after seeing generation quality.
