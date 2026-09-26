# Guardrails & Safety

## 1. Output validation

Every LLM call that returns structured output is validated against its Zod schema, and failing validation triggers one retry, then manual flagging (`engineering/ERROR_HANDLING.md`) — never silently proceeding with malformed data.

**Additional semantic checks worth enforcing, not just schema shape:**
- Hashtags returned as an array should not include the `#` character redundantly duplicated or empty strings.
- `cta` should never be empty — a missing CTA is worth treating as a validation failure, not just an odd-looking asset.

## 2. Bengali Nativeness Guardrail — the project's single most important guardrail

**The threat:** the problem statement's stated "toughest test" is exactly this — Bengali output that reads as translated rather than natively written. This is the one requirement most likely to be checked closely by judges, since it's called out explicitly.

**The mechanism** (see `agents/AGENT_PROMPTS.md` for the exact prompt):
1. After the Content Generator produces Bengali copy, a lightweight secondary LLM call evaluates whether it reads as native or translated.
2. If `readsAsNative: false` — retry the Content Generator once. If `SARVAM_API_KEY` is configured (per `architecture/DECISIONS.md` ADR-006), route the retry to Sarvam AI instead of Gemini.
3. If the retry also fails — flag the asset for manual review/editing rather than shipping it. **Never silently ship a failed check** just because a retry was attempted.

**Why this can't be a one-time manual check:** a manual spot-check before the demo only catches issues in the specific examples someone happens to try. A judge testing with their own brief text during the live demo link could easily hit different phrasing the manual check never covered. Making this a runtime guardrail on every Bengali generation — not a pre-demo checklist item — is what actually protects against the disqualifier during a live judged session, not just during rehearsal.

## 3. Compliance is a guardrail, not a feature

Framing worth keeping straight: the Compliance Check (`architecture/AGENT_DESIGN.md` stage 6) is a safety mechanism preventing bad content from reaching approval/publishing, not a "content quality" feature. It should fail closed (see `engineering/ERROR_HANDLING.md`) — anything it can't confidently validate is treated as a failure, never a pass-by-default.

## 4. Regeneration cap (cost + demo-safety guardrail)

Per `architecture/DECISIONS.md` ADR-009, automatic Reject → Regenerate is capped at 2 attempts per asset. This is both a cost guardrail (`operations/COST_STRATEGY.md`) and a demo-safety guardrail — an unbounded regenerate loop happening live in front of judges, with no forcing function toward resolution, is a real risk worth designing against explicitly.

## 5. Brand-safety / content-appropriateness guardrail

Since this generates real marketing copy and imagery (even if only mock-published), a lightweight check is worth having:
- Generated copy should not make unverifiable or clearly false claims (e.g. fabricated release dates, fabricated cast names) not present in the original brief — the Content Generator should only elaborate on what the brief actually states, similar in spirit to the "do not infer" instruction used for resume parsing in a prior project. A campaign brief is the equivalent ground truth here; the model should not invent facts beyond it.
- This doesn't need a separate guardrail call in the MVP — enforce it via prompt instruction in `agents/AGENT_PROMPTS.md` first, and only add a dedicated verification step if time allows and testing reveals the model fabricating details.

## 6. Prompt injection — lower risk, still worth a baseline defense

Brief text is user-authored (by the content manager using the tool), not scraped from an adversarial source — meaningfully lower risk than a system ingesting external web content. Still:
- Every prompt delimits the brief/user-provided text clearly (`"""` fences, per `agents/AGENT_PROMPTS.md`).
- The pipeline's control flow (which agent runs next) is determined entirely by code (`lib/agents/graph.ts`), never by parsing free-text model output for instructions — so even if a brief contained adversarial text attempting to influence behavior, it can at most affect the *content* of that one generation call, not the pipeline's execution path.

## Relationship to HITL

Guardrails are automated checks that run within a stage's own execution (nativeness, output validation, regeneration caps). `product/HITL_CHECKPOINTS.md` covers a different thing: points where a human, not a runtime check, must explicitly approve before the system proceeds. Both matter for different reasons — guardrails catch the AI producing bad output; HITL prevents even *good* output from reaching publication without a human's explicit sign-off.
