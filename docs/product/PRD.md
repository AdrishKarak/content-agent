# Product Requirements Document (PRD)

## Problem statement (from the hackathon brief)

Content teams manage the same campaign across multiple social platforms, each with different tone, format, and constraint requirements, in multiple languages. Doing this by hand — writing separate copy, generating separate visuals, checking each platform's rules, tracking what worked — doesn't scale and is easy to get subtly wrong (e.g. shipping "translated" rather than native-language content, or one lightly-modified image passed off as three tailored ones).

## Target user

A content/marketing team at a media company (hoichoi, a streaming platform) running multi-platform promotional campaigns (e.g. promoting a new show) who wants one brief to produce genuinely tailored, compliant, trackable content across channels — with a human still deciding what actually goes live.

## Goals

1. Generate genuinely channel-tailored content (not resized/translated copies) from a single brief, in both Bengali and English
2. Guarantee no content reaches a real (or mock) publishing queue without explicit human review
3. Catch platform-constraint violations mechanically, not by hoping the model got it right
4. Make cross-platform performance comparable like-for-like, not just as separate per-platform totals
5. Close the loop — make weekly insights actually influence the next brief's generation, not just sit on a dashboard

## Non-goals (explicit, for hackathon scope discipline)

- **Not** real social media publishing — every platform is a mock adapter
- **Not** a general-purpose scheduling tool for arbitrary content — only content generated from a brief in this system
- **Not** guaranteed video generation for the MVP — the problem statement says "image/video," and this project treats image as the MVP path, video as stretch (see `architecture/DECISIONS.md` ADR-003)
- **Not** a brand-management or asset-library platform beyond what's needed to run one campaign's lifecycle

## Key features

### 1. Brief-driven generation
A single text brief is parsed into a structured campaign spec (genre, audience, language, tone), then used to generate per-channel copy and images — natively in Bengali and English, not translated.

### 2. Deterministic compliance checking
Every generated asset is checked against its target channel's actual constraints (character limits, aspect ratio, file size, hashtag conventions) before it can reach approval. Violations are rejected, not silently passed through.

### 3. Mandatory human approval gate
Nothing is scheduled or published without an explicit Approve. Reject and Regenerate are first-class actions, not just a delete button — Regenerate re-runs generation with the rejection feedback incorporated.

### 4. Mock multi-platform publishing
Approved, scheduled content is "published" via per-channel mock adapters that still enforce and can reject on platform constraints, producing a realistic mock post ID and timestamp.

### 5. Metrics ingestion (demo-mode or CSV)
Since there's no real social API connection, performance metrics are either generated as plausible demo data or uploaded via CSV for a more grounded demo.

### 6. Cross-platform, like-for-like comparison
Because every channel's asset originates from the same brief, comparison is a direct join on brief ID — not an attempt to fuzzy-match unrelated content across platforms.

### 7. Weekly AI-written report with citations
A report summarizing what worked, with every claim tied to a real post ID — never a vague, unverifiable claim.

### 8. Insight retrieval feeding the next brief
Past briefs and their outcomes are embedded and retrieved when analyzing a new brief, so the Brief Analyzer and Content Generator agents are informed by what has actually worked before — this is the mechanism that satisfies "insights feed back into the next brief" as an actual technical loop, not a report nobody reads.

## Success metrics (for the hackathon demo, not long-term product metrics)

| Metric | Why it matters |
|---|---|
| A Bengali brief's generated output is judged as native-sounding by a Bengali speaker on the team | Directly addresses the stated "toughest test" |
| Three per-channel images are visibly, meaningfully different from each other | Directly avoids the stated #1 auto-disqualifier |
| At least one deliberately-broken test asset (e.g. text too long for X) is caught and rejected by the Compliance check, on camera, in the demo | Directly proves the adapter layer doesn't silently accept violations |
| The demo video shows an insight from one campaign visibly changing the input to, or output of, the next brief's generation | Directly avoids the stated #3 auto-disqualifier |

## Judging/submission requirements (per hackathon rules)

1. A live, working demo link
2. A public GitHub repository link
3. A brief explanatory video (under 5 minutes) walking through what was built, how it works, and how it addresses the problem statement

## Open questions

- Should channel selection be user-configurable per brief, or always all three (Instagram/Facebook/X)?
- Should the demo use real historical hoichoi campaign data (if available) for metrics, or fully synthetic demo data? Real data would make the weekly insight report far more convincing to judges if available in time.
