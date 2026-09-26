# Kickoff Prompt

Paste this as the first message to your coding agent.

---

You are building the **AI Content Studio & Multi-Platform Command Center** (hoichoi Hackathon '26, Problem 3) in this repository.

## 1. Read first

1. `CLAUDE.md` (repo root) — non-negotiable rules and the doc map
2. `docs/CONTEXT.md` — what this is, the auto-disqualifiers, the toughest test
3. `docs/product/PRD.md`, `USER_STORIES.md`, `ACCEPTANCE_CRITERIA.md`, `HITL_CHECKPOINTS.md`
4. `docs/architecture/SYSTEM_ARCHITECTURE.md`, `DOMAIN_MODEL.md`, `AGENT_DESIGN.md`, `MEMORY_ARCHITECTURE.md`, `DECISIONS.md`
5. `docs/engineering/*`, `docs/api/*`, `docs/operations/*`
6. `docs/agents/AGENT_PROMPTS.md`, `GUARDRAILS.md`, `EVALUATION_CRITERIA.md`
7. `docs/frontend/DESIGN_SYSTEM.md`
8. `docs/PROJECT_STRUCTURE.md`, `docs/SETUP.md`
9. `docs/roadmap/TASK_BREAKDOWN.md` — read last

## 2. Do the Phase 0 spike before anything else

Before writing application code, run the two verification spikes in `roadmap/TASK_BREAKDOWN.md` Phase 0: test Gemini's Bengali output quality, and confirm three genuinely distinct per-channel images can be generated. Report the results to me before proceeding — if either fails, we need to adjust the plan (add Sarvam AI, or change the image generation approach) before building anything that depends on them.

## 3. Follow the roadmap phase by phase

Work through `docs/roadmap/TASK_BREAKDOWN.md` in order. Given this is a hackathon with a hard deadline, time pressure is real — but the three things called out as "never cut" in that document's final section are non-negotiable regardless of remaining time: the approval gate, the compliance check, and the insight retrieval loop. These map directly to the three stated auto-disqualifiers, and a technically impressive project that trips one of them scores zero regardless of everything else.

## 4. Don't stop after every phase and wait for me

work and re-check and don't stop until the end

## 5. Ongoing rules

- Never let compliance checking become an LLM call — it must stay deterministic (`architecture/DECISIONS.md` ADR-005).
- Never let an asset skip the human approval gate under any code path (`product/HITL_CHECKPOINTS.md`).
- Treat the Bengali Nativeness Guardrail as a runtime check on every Bengali generation, not a one-time manual verification (`agents/GUARDRAILS.md` §2).
- If time is running out, consult `roadmap/TASK_BREAKDOWN.md`'s "what NOT to do if time runs short" section rather than improvising cuts.

Begin with step 1.
