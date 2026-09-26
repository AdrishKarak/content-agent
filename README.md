<div align="center">

# 🎬 AI Content Studio & Multi-Platform Command Center
### *Autonomous Multi-Agent Content Orchestration Engine for hoichoi*
**hoichoi Hackathon '26 — Problem 3: AI-Driven Multi-Platform Content Studio**

[![Next.js 15](https://img.shields.io/badge/Next.js-15.5-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![React 19](https://img.shields.io/badge/React-19-blue?style=for-the-badge&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-3178C6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![tRPC v11](https://img.shields.io/badge/tRPC-v11-2596BE?style=for-the-badge&logo=trpc)](https://trpc.io/)
[![PostgreSQL + pgvector](https://img.shields.io/badge/PostgreSQL-pgvector-336791?style=for-the-badge&logo=postgresql)](https://github.com/pgvector/pgvector)
[![Prisma ORM](https://img.shields.io/badge/Prisma-5.20-2D3748?style=for-the-badge&logo=prisma)](https://www.prisma.io/)
[![Google Gemini](https://img.shields.io/badge/Google_Gemini-3.5_Flash_Lite-8E75B2?style=for-the-badge&logo=google)](https://ai.google.dev/)
[![Vitest](https://img.shields.io/badge/Tests-15%2F15_Passing-4E9F3D?style=for-the-badge&logo=vitest)](https://vitest.dev/)

<p align="center">
  <b>A single show brief. Three culturally authentic platforms. Zero human-in-the-loop bypasses. A closed-loop learning memory that gets smarter with every campaign.</b>
</p>

[Key Innovations](#-the-hard-problems-solved) •
[Architecture & Flow](#-system-architecture--agent-orchestration) •
[Agent Deep-Dive](#-agent-specifications) •
[Design System](#-design-system-sticker-studio-neobrutalism) •
[Compliance Engine](#-deterministic-compliance-engine-adr-005) •
[Getting Started](#-quickstart--local-setup) •
[Verification Suite](#-verification--test-suite)

---

</div>

## 💥 The Hard Problems Solved

Most "AI content generators" make fatal mistakes when applied to regional entertainment marketing like **hoichoi**:
1. **The Translation Trap:** Generating English copy and translating it to Bengali results in robotic English calques (*"সিটের কোণায় ধরে রাখবে"* instead of *"দমবন্ধ করা উত্তেজনা"*).
2. **The Lazy Resize:** Cropping a single 16:9 poster into a 1:1 square or vertical 9:16 story and claiming it's "tailored" for each platform.
3. **The Open-Loop Void:** Displaying analytics on a dashboard where learnings rot in charts instead of feeding back into the creative prompt of the next brief.
4. **The Hallucinating Checker:** Using an LLM to check character limits, which counts tokens instead of characters and approves invalid copy.

### 🛡️ Non-Negotiable Core Safeguards Built Into The Kernel

| Safeguard | How We Enforce It | Architectural Decision |
| :--- | :--- | :--- |
| **1. Distinct Visual Assets** | Synthesizes **three completely distinct visual concepts** per channel (1:1 portrait for IG, 16:9 cinematic landscape for FB, 16:9 neo-noir key art for X). Never cropped or relabelled. | [ADR-004](docs/architecture/DECISIONS.md#adr-004) |
| **2. Human Approval Gate** | **Zero leakage.** Attempting to publish or schedule an unapproved asset throws a hard `PRECONDITION_FAILED` exception in the database and tRPC layer. | [HITL Checkpoint](docs/product/HITL_CHECKPOINTS.md) |
| **3. Closed-Loop Retrieval** | Weekly AI insights are embedded into 1536-dimensional vectors using `gemini-embedding-001`. When a new brief is analyzed, `pgvector` retrieves past performance learnings directly into the generation prompt. | [ADR-008](docs/architecture/DECISIONS.md#adr-008) |
| **4. Deterministic Compliance** | **100% deterministic TypeScript arithmetic and regex.** Character bounds, hashtag counts, and CTA rules fail closed. Zero LLM hallucinations. | [ADR-005](docs/architecture/DECISIONS.md#adr-005) |
| **5. Runtime Bengali Guardrail** | An automated nativeness scanner inspects every Bengali generation for English calques or stiff grammar, triggering automatic regeneration with targeted feedback. | [Agent Guardrails](docs/agents/GUARDRAILS.md) |

---

## 🏗 System Architecture & Agent Orchestration

```mermaid
flowchart TD
    subgraph INGESTION ["1. Brief & Memory Ingestion"]
        Brief["User Show Brief / Campaign Input"]
        pgVector[("pgvector Memory Store (1536-d)")]
        Retrieval["Vector Semantic Retrieval (<=> cosine)"]
        Analyzer["Brief Analyzer Agent (Spec Extraction)"]
        
        Brief --> Analyzer
        Brief --> Retrieval
        pgVector -. Past Campaign Insights .-> Retrieval
        Retrieval --> Analyzer
    end

    subgraph GENERATION ["2. Specialized Multi-Agent Generation"]
        Analyzer --> Spec["Structured Show Spec + Retrieved Learnings"]
        Spec --> CopyAgent["Content Generator Agent"]
        Spec --> ImageAgent["Image Prompt & Synthesis Agent"]
        
        CopyAgent --> Guardrail{"Bengali Nativeness Guardrail"}
        Guardrail -- "Calque Detected" --> RetryCopy["Regenerate with Linguistic Feedback"]
        RetryCopy --> Guardrail
        Guardrail -- "Native Bengali Passed" --> CopyReady["Channel Copy (BN + EN + CTA + Tags)"]
        
        ImageAgent --> DistinctPrompts["3 Distinct Channel Prompts & Aspect Ratios"]
        DistinctPrompts --> Pollinations["Image Synthesis Pipeline"]
        Pollinations --> ImagesReady["Distinct Media Assets"]
    end

    subgraph COMPLIANCE ["3. Deterministic Compliance Engine"]
        CopyReady --> ComplianceCheck{"Deterministic Compliance Checker (ADR-005)"}
        ImagesReady --> ComplianceCheck
        ComplianceCheck -- "Violation (e.g. >280 chars)" --> AutoFix["Deterministic Remediation Loop"]
        AutoFix --> ComplianceCheck
        ComplianceCheck -- "100% Validated" --> ApprovalQueue["Pending Human Review Queue"]
    end

    subgraph HITL ["4. Human-In-The-Loop Approval Gate"]
        ApprovalQueue --> UI["Studio Approval Queue (/approval)"]
        UI --> Decision{"Human Decision"}
        Decision -- "Take Two" --> RePrompt["Regenerate with Human Feedback (Max 2 Attempts)"]
        RePrompt --> CopyAgent
        Decision -- "Nope" --> Rejected["Marked REJECTED"]
        Decision -- "Ship It" --> Approved["Asset Status: APPROVED"]
    end

    subgraph DISPATCH ["5. Scheduler & Mock Publisher"]
        Approved --> Scheduler["Campaign Scheduler (/publisher)"]
        Scheduler --> AdapterRecheck{"Adapter Constraint Re-Validation"}
        AdapterRecheck --> MockAPI["Multi-Channel Publisher (IG / FB / X)"]
        MockAPI --> Published[("Published Posts Record")]
    end

    subgraph CLOSED_LOOP ["6. Analytics & Vector Memory Loop"]
        Published --> MetricIngest["Analytics Ingestion (CSV / Mock Metrics)"]
        MetricIngest --> LikeForLike["Like-for-Like Normalization Engine"]
        LikeForLike --> BangerBadge["Certified Banger (>=10% ER)"]
        LikeForLike --> WeeklyReporter["Weekly AI Performance Reporter"]
        WeeklyReporter --> Embedder["gemini-embedding-001 (1536-d)"]
        Embedder --> pgVector
    end

    classDef primary fill:#eef2ff,stroke:#4f46e5,stroke-width:2px;
    classDef warning fill:#fef3c7,stroke:#d97706,stroke-width:2px;
    classDef success fill:#ecfdf5,stroke:#059669,stroke-width:2px;
    classDef danger fill:#fee2e2,stroke:#dc2626,stroke-width:2px;
    
    class Brief,Spec,Published primary;
    class Guardrail,ComplianceCheck,Decision,AdapterRecheck warning;
    class Approved,BangerBadge,pgVector success;
    class Rejected,RetryCopy danger;
```

---

## 🤖 Agent Specifications

### 1. Brief Analyzer Agent (`lib/agents/briefAnalyzer.ts`)
- **Input:** Unstructured text or high-level logline (e.g. *"নিখোঁজ সংবাদ - কুয়াশাচ্ছন্ন উত্তরবঙ্গে এক বর্ষার রাতে রহস্যজনকভাবে অন্তর্ধান ঘটে এক প্রত্নতাত্ত্বিকের..."*).
- **Function:** Ingests the raw brief, queries `pgvector` for past top-performing campaign insights, and extracts structured metadata validated via Zod:
  - Genre, Tone, Target Audience, Target Channels, Primary Language.
- **Output:** Validated `ShowBriefSpec` with embedded historical learnings.

### 2. Content Generator Agent (`lib/agents/contentGenerator.ts`)
- **Philosophy:** Native Bengali first, never translated English.
- **Platform Specialization:**
  - **Instagram:** Emotional narrative hooks, conversation starters in colloquial Bengali, evocative typography cues, max 30 tags.
  - **Facebook:** Shareable family / cultural context, longer dramatic setup, community-oriented CTA.
  - **Twitter / X:** Razor-sharp cliffhangers, high-suspense hooks under 280 characters, maximum 4 tags.
- **Runtime Guardrail:** Automatically evaluates each Bengali output for English calques. If an idiom is translated literally, it auto-retries with targeted corrective guidance.

### 3. Image Agent (`lib/agents/imageAgent.ts`)
- **Strict Anti-Cropping Guarantee:** Produces 3 entirely different visual prompts tailored to platform consumption habits:
  - **Instagram (1:1 Square):** High-emotion character close-up portraits, dramatic lighting, rain or atmospheric textures.
  - **Facebook (16:9 Landscape):** Cinematic wide establishing shot, period props, authentic Kolkata / Bengal cultural backdrops.
  - **Twitter / X (16:9 Landscape):** High-contrast neo-noir graphic key art, minimalist color palette with bold visual accents.

### 4. Deterministic Compliance Checker (`lib/agents/complianceCheck.ts`)
- **Pure Code (ADR-005):** Zero LLM involvement.
- **Evaluates:**
  - Character count against platform ceilings (`Twitter <= 280`, `Instagram <= 2200`, `Facebook <= 63206`).
  - Hashtag minimums and maximums (`Twitter: 1-4`, `Instagram: 2-30`, `Facebook: 1-10`).
  - Mandatory Call-to-Action (CTA) presence.
  - Asset file size thresholds.

### 5. Mock Publisher & Scheduler (`lib/agents/publisher.ts`)
- **Zero-Bypass Policy:** Enforces approval status verification at runtime.
- **Adapter Re-Validation (AC 12.2):** Re-runs platform constraints immediately prior to dispatch to prevent stale or modified assets from publishing.
- **Simulated Dispatch:** Returns mock platform IDs with realistic timestamping and tracking.

### 6. Analytics & Like-for-Like Comparison Engine (`server/trpc/insightsRouter.ts`)
- **Normalized Cross-Platform Comparison:** Calculates standardized Engagement Rate across fundamentally different channel metric structures:
  $$\text{Engagement Rate (ER)} = \frac{\text{Likes} + \text{Comments} + \text{Shares}}{\text{Views}} \times 100$$
- **"Certified Banger" Badge:** Automatically awarded to any asset achieving $\ge 10\%$ normalized engagement rate.
- **CSV Data Ingestion:** Supports external metric ingestion with schema validation and error reporting.

### 7. Insight Agent & Closed-Loop Vector Memory (`lib/agents/insightAgent.ts`)
- **Citation-Grounded Reporting:** Synthesizes weekly AI performance reports where every claim is strictly cited to published post IDs.
- **Memory Ingestion:** Embeds claims into PostgreSQL `pgvector` using `gemini-embedding-001` (1536 dimensions).
- **Prompt Feedback:** Automatically retrieved by the Brief Analyzer for subsequent campaigns, satisfying the closed-loop requirement.

---

## 🎨 Design System: "Sticker Studio" Neobrutalism

Adhering strictly to [DESIGN_SYSTEM.md](docs/frontend/DESIGN_SYSTEM.md), the user interface delivers an unapologetically bold, tangible studio atmosphere:

| Element | Specification | Visual Representation |
| :--- | :--- | :--- |
| **Palette** | `Paper` (#FDFBF7), `Ink` (#0D0D0D), `Lime` (#D4FF00), `Sunshine` (#FFD000), `Tomato` (#FF4B3E), `Pink` (#FF70A6), `Blue` (#38B6FF), `Jet` (#1A1A1A) | High-contrast vibrant studio colors |
| **Typography** | Headlines: **Bungee** (bold, arcade-grade energy)<br/>Metadata/Codes: **Space Mono**<br/>Body/Bengali: **Inter / Noto Sans Bengali** | Punchy readability with cultural warmth |
| **Card Rotation** | Deterministic hash-based rotation: $\theta \in [-3^\circ, +3^\circ]$ based on string ID | Consistent physical sticker feel without re-render jitter |
| **Buttons & Shadows** | Hard 4px / 6px offset shadows (`shadow-neo`), 2.5px solid ink borders | Physical tactile press on click |
| **Microcopy** | *"Ship It"*, *"Nope"*, *"Take Two"*, *"Certified Banger"*, *"Nothing cooking yet. Feed me a brief."* | Human, playful, confident studio personality |

---

## 🧪 Deterministic Compliance Engine (ADR-005)

```
Asset Input ---> [ Check Copy Presence ] ---> FAIL closed if empty
             ---> [ Total Character Count ] -> FAIL if combined > Channel Limit (returns exact chars to trim)
             ---> [ Hashtag Count Bounds ] -> FAIL if < min or > max
             ---> [ CTA Presence Check ] ----> FAIL if missing
             ---> [ File Size Limits ] ------> FAIL if > Max Bytes
             ---> PASS ONLY IF ALL SUCCEED
```

Unit tested with 100% boundary coverage in [`lib/agents/complianceCheck.test.ts`](lib/agents/complianceCheck.test.ts):
- Twitter 280-character boundary & character trim recommendation calculation.
- Hashtag counts exceeding platform limits.
- Mandatory CTA presence.
- File size boundary enforcement.
- Unknown channel fail-closed validation.

---

## 🚀 Quickstart & Local Setup

### Prerequisites
- **Node.js**: $\ge 20.0.0$
- **pnpm**: $\ge 9.0.0$
- **PostgreSQL**: Neon / Supabase instance with `pgvector` extension enabled

### 1. Clone & Install
```bash
git clone https://github.com/your-username/ai-content-studio.git
cd ai-content-studio
pnpm install
```

### 2. Configure Environment Variables
Create a `.env` file in the root directory:
```env
# Database (Neon PostgreSQL with pgvector)
DATABASE_URL="postgresql://user:password@host/dbname?sslmode=require"

# AI Engine
GEMINI_API_KEY="your-google-gemini-api-key"

# Authentication (Clerk)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_..."
CLERK_SECRET_KEY="sk_test_..."

# App URL
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### 3. Initialize Database & Seed Demo Data
```bash
# Push schema to database
pnpm prisma db push

# Seed realistic hoichoi campaigns, published metrics, and pgvector embeddings
pnpm db:seed
```

### 4. Run Test Suite
```bash
pnpm test
```

### 5. Launch Development Server
```bash
pnpm dev
```
Open **[http://localhost:3000](http://localhost:3000)** (or `http://localhost:3001` if port 3000 is occupied) in your browser.

---

## 🚦 Verification & Test Suite

The repository includes comprehensive automated tests covering the non-negotiable auto-disqualifiers and core system logic:

```bash
pnpm test
```

```text
 ✓ lib/guardrails/outputValidation.test.ts (4 tests)
   ✓ cleans and parses JSON wrapped in markdown fences
   ✓ handles raw JSON without fences
   ✓ returns error for invalid JSON syntax
   ✓ returns error when schema validation fails

 ✓ lib/design/stickerRotation.test.ts (3 tests)
   ✓ returns identical rotation angles for the same asset ID
   ✓ returns rotation within the bounded range of -3 to +3 degrees
   ✓ returns valid transform style object

 ✓ lib/agents/complianceCheck.test.ts (7 tests)
   ✓ passes compliant Twitter/X post under 280 characters with 1-4 hashtags and CTA
   ✓ fails Twitter/X post exceeding 280 characters
   ✓ fails Twitter/X post with more than 4 hashtags
   ✓ fails when copy text is empty or missing
   ✓ fails when CTA is missing
   ✓ fails when image size exceeds channel limits
   ✓ fails closed for unknown channel

 ✓ lib/agents/insightRetrieval.test.ts (1 test)
   ✓ retrieves semantically relevant insights from past campaigns for a new mystery brief (pgvector)

Test Files  4 passed (4)
Tests       15 passed (15)
```

### Full Production Build Verification
```bash
pnpm typecheck # 0 errors
pnpm build     # Next.js 15 App Router production bundle compiled successfully
```

---

## 🐳 Docker & Containerization

The studio is fully containerized with a production-optimized multi-stage build running Next.js 15 Standalone output on Alpine Linux with a secure non-root user.

### Option A: Complete Stack via Docker Compose (Includes PostgreSQL + pgvector)
Run the application and an isolated PostgreSQL instance with `pgvector` enabled out-of-the-box:

```bash
# Start Next.js App + pgvector Database
docker compose up -d

# Check running status
docker compose ps

# View real-time container logs
docker compose logs -f app
```

Services initialized:
- `hoichoi_pgvector`: Official `pgvector/pgvector:pg16` image on port `5432` with automated healthchecks.
- `hoichoi_content_studio`: Standalone Next.js 15 container on port `3000`.

### Option B: Build Standalone Image
```bash
docker build -t hoichoi-ai-content-studio ./ai-content-studio
docker run -p 3000:3000 --env-file ai-content-studio/.env hoichoi-ai-content-studio
```

---

## 🔄 CI/CD Automation Pipeline

The repository includes an enterprise-grade GitHub Actions pipeline configured in [`.github/workflows/ci.yml`](.github/workflows/ci.yml) triggering on every push and pull request to `main`/`master`:

```mermaid
flowchart LR
    A["git push / PR"] --> B["1. Quality Check\n(TypeScript typecheck)"]
    B --> C["2. Test Suite\n(Deterministic Rules & Guardrails)"]
    C --> D["3. Standalone Build\n(Next.js Production Bundle)"]
    D --> E["4. Container Build\n(Docker Multi-Stage Verify)"]

    classDef stage fill:#e0f2fe,stroke:#0284c7,stroke-width:2px;
    class B,C,D,E stage;
```

1. **Typecheck & Quality Audit:** Runs `pnpm typecheck` (`tsc --noEmit`) to guarantee zero compile-time bugs.
2. **Automated Test Suite:** Generates Prisma client and executes unit & integration tests (`pnpm test` / `pnpm test:jest`) covering compliance logic and pgvector similarity retrieval.
3. **Standalone Production Build:** Compiles the full Next.js 15 App Router static & dynamic page traces.
4. **Docker Container Verification:** Executes `docker/build-push-action` using Buildx to guarantee image deployability.

## 🗄️ Database Schema & Vector Extension

```mermaid
erDiagram
    Brief ||--o{ ContentAsset : "generates"
    ContentAsset ||--o{ ComplianceCheck : "validates"
    ContentAsset ||--o{ Approval : "reviews"
    ContentAsset ||--o| ScheduledPost : "schedules"
    ScheduledPost ||--o| PublishedPost : "publishes"
    PublishedPost ||--o{ Metric : "measures"
    WeeklyReport ||--o{ InsightEmbedding : "contains"

    Brief {
        string id PK
        string rawBriefText
        string genre
        string tone
        vector_1536 embedding
    }

    ContentAsset {
        string id PK
        string briefId FK
        enum channel "INSTAGRAM | FACEBOOK | TWITTER"
        string copyBn
        string copyEn
        string cta
        string[] hashtags
        string imageUrl
        enum status "GENERATING | PENDING_APPROVAL | APPROVED | REJECTED | SCHEDULED | PUBLISHED"
    }

    WeeklyReport {
        string id PK
        datetime periodStart
        datetime periodEnd
        string summary
        json keyInsights
    }

    InsightEmbedding {
        string id PK
        string weeklyReportId FK
        string claim
        vector_1536 embedding
    }
```

---

## 👥 Hackathon Team & Acknowledgements
- **Team**: hoichoi Hackathon '26 Innovators
- **Problem Statement**: Problem 3 — AI Content Studio & Multi-Platform Command Center
- **Built for**: Bengali digital entertainment lovers and hoichoi social media creative teams worldwide.
