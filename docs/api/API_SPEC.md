# API Spec

All API surface is tRPC, consumed by the app's own frontend.

## `briefRouter`

| Procedure | Type | Input | Output |
|---|---|---|---|
| `submit` | mutation | `{ rawBriefText: string }` | `{ briefId: string }` — kicks off the synchronous pipeline (Brief Analyzer → ... → Compliance Check) |
| `get` | query | `{ briefId: string }` | `Brief & { assets: ContentAsset[] }` |
| `list` | query | `{ limit?, cursor? }` | `Brief[]` |

## `assetRouter`

| Procedure | Type | Input | Output |
|---|---|---|---|
| `getById` | query | `{ assetId: string }` | `ContentAsset & { complianceChecks, approvals }` |
| `regenerate` | mutation | `{ assetId: string; feedback?: string; target: "copy" \| "image" \| "both" }` | updated `ContentAsset` (new version) |

## `approvalRouter`

| Procedure | Type | Input | Output |
|---|---|---|---|
| `decide` | mutation | `{ assetId: string; decision: "APPROVE" \| "REJECT" \| "REGENERATE"; feedback?: string }` | `Approval` record; on `APPROVE`, asset status → `APPROVED` |
| `pendingQueue` | query | `{}` | `ContentAsset[]` where status is `PENDING_APPROVAL` |

## `publisherRouter`

| Procedure | Type | Input | Output |
|---|---|---|---|
| `schedule` | mutation | `{ assetId: string; scheduledAt: string }` | `ScheduledPost` |
| `list` | query | `{ status?: "SCHEDULED" \| "PUBLISHED" }` | `ScheduledPost[] \| PublishedPost[]` |

## `metricsRouter`

| Procedure | Type | Input | Output |
|---|---|---|---|
| `generateDemoMetrics` | mutation | `{ publishedPostId: string }` | `Metric` — plausible synthetic data |
| `uploadCsv` | mutation | `{ csvContent: string }` | `{ imported: number; errors: string[] }` |

## `insightsRouter`

| Procedure | Type | Input | Output |
|---|---|---|---|
| `crossPlatformComparison` | query | `{ briefId: string }` | Metrics grouped by channel, for the same brief |
| `weeklyReports` | query | `{ limit?, cursor? }` | `WeeklyReport[]` |
| `generateReport` | mutation | `{ periodStart: string; periodEnd: string }` | `{ reportId: string }` — manual trigger, in addition to the weekly scheduled one |

## Webhooks / Route Handlers

| Endpoint | Purpose |
|---|---|
| `POST /api/webhooks/clerk` | User lifecycle events |
| `POST /api/inngest` | Inngest function invocation endpoint |

## Conventions

- Every mutation input is Zod-validated.
- `assetRouter.regenerate` and `approvalRouter.decide` with `REGENERATE` both route through the same underlying regeneration path — the router layer doesn't duplicate logic, it just offers two natural entry points (direct regenerate vs. reject-with-regenerate).
