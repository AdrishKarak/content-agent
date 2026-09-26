# Documentation Index

## Top level

| Doc | What it covers |
|---|---|
| [`CONTEXT.md`](./CONTEXT.md) | The problem, the pipeline, the auto-disqualifiers, the toughest test |
| [`SETUP.md`](./SETUP.md) | Local dev setup, including the mandatory Phase 0 spike |
| [`PROJECT_STRUCTURE.md`](./PROJECT_STRUCTURE.md) | Single-app layout, ownership boundaries |

## `product/`

| Doc | What it covers |
|---|---|
| [`PRD.md`](./product/PRD.md) | Problem statement, goals, non-goals, submission requirements |
| [`USER_STORIES.md`](./product/USER_STORIES.md) | Feature-by-feature stories |
| [`ACCEPTANCE_CRITERIA.md`](./product/ACCEPTANCE_CRITERIA.md) | Given/When/Then criteria, mapped to the auto-disqualifiers |
| [`HITL_CHECKPOINTS.md`](./product/HITL_CHECKPOINTS.md) | The mandatory approval gate and other human checkpoints |

## `architecture/`

| Doc | What it covers |
|---|---|
| [`SYSTEM_ARCHITECTURE.md`](./architecture/SYSTEM_ARCHITECTURE.md) | Single-app shape, full pipeline sequence |
| [`DOMAIN_MODEL.md`](./architecture/DOMAIN_MODEL.md) | Entities, relationships |
| [`AGENT_DESIGN.md`](./architecture/AGENT_DESIGN.md) | The 8-stage pipeline (the centerpiece document) |
| [`MEMORY_ARCHITECTURE.md`](./architecture/MEMORY_ARCHITECTURE.md) | Structured/semantic/working/episodic memory |
| [`DECISIONS.md`](./architecture/DECISIONS.md) | ADR log — every tradeoff and why |

## `engineering/`

| Doc | What it covers |
|---|---|
| [`TECH_STACK.md`](./engineering/TECH_STACK.md) | Full stack with rationale |
| [`CODING_STANDARDS.md`](./engineering/CODING_STANDARDS.md) | TypeScript/agent code conventions |
| [`FOLDER_STRUCTURE.md`](./engineering/FOLDER_STRUCTURE.md) | Within-app directory conventions |
| [`TESTING_STRATEGY.md`](./engineering/TESTING_STRATEGY.md) | What to test, prioritized by disqualifier risk |
| [`ERROR_HANDLING.md`](./engineering/ERROR_HANDLING.md) | Per-stage failure handling |
| [`SECURITY_REQUIREMENTS.md`](./engineering/SECURITY_REQUIREMENTS.md) | Scoped-down security for a hackathon build |

## `api/`

| Doc | What it covers |
|---|---|
| [`API_SPEC.md`](./api/API_SPEC.md) | tRPC routers |
| [`ENVIRONMENT_VARIABLES.md`](./api/ENVIRONMENT_VARIABLES.md) | Every env var, required vs. conditional |
| [`RATE_LIMITS.md`](./api/RATE_LIMITS.md) | API cost/quota budgeting for hackathon free tiers |

## `operations/`

| Doc | What it covers |
|---|---|
| [`DEPLOYMENT_ARCHITECTURE.md`](./operations/DEPLOYMENT_ARCHITECTURE.md) | Vercel deployment, live-demo-link checklist |
| [`OBSERVABILITY.md`](./operations/OBSERVABILITY.md) | Minimal logging for hackathon debugging |
| [`COST_STRATEGY.md`](./operations/COST_STRATEGY.md) | Managing image-gen cost, free-tier awareness |

## `agents/`

| Doc | What it covers |
|---|---|
| [`AGENT_PROMPTS.md`](./agents/AGENT_PROMPTS.md) | Every prompt template, per stage and per channel |
| [`GUARDRAILS.md`](./agents/GUARDRAILS.md) | Bengali nativeness check, output validation, regeneration caps |
| [`EVALUATION_CRITERIA.md`](./agents/EVALUATION_CRITERIA.md) | How to judge each component, prioritized by disqualifier risk |
| [`KICKOFF_PROMPT.md`](./agents/KICKOFF_PROMPT.md) | Paste-in prompt for a coding agent, phase-by-phase with review checkpoints |

## `frontend/`

| Doc | What it covers |
|---|---|
| [`DESIGN_SYSTEM.md`](./frontend/DESIGN_SYSTEM.md) | "Sticker Studio" neobrutalism theme — colors, type, voice/microcopy, layout, components |

## `roadmap/`

| Doc | What it covers |
|---|---|
| [`TASK_BREAKDOWN.md`](./roadmap/TASK_BREAKDOWN.md) | Phased hackathon build plan, starting with the Phase 0 spike |

## Reading order for a coding agent about to build

Use `CLAUDE.md`'s task-based map, or paste `agents/KICKOFF_PROMPT.md` directly to have an agent read everything in the right order automatically.
