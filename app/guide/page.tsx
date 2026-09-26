"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  BookOpen,
  Sparkles,
  ShieldCheck,
  Send,
  BarChart3,
  CheckCircle2,
  AlertTriangle,
  Flame,
  Layers,
  ArrowRight,
  Terminal,
  Cpu,
  Eye,
  RefreshCw,
  Search,
  Lock,
} from "lucide-react";

export default function GuidePage() {
  const [activeTab, setActiveTab] = useState<"overview" | "agents" | "safeguards" | "manual" | "faq">("overview");

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-8">
      {/* Top Banner */}
      <div className="border-4 border-ink bg-white p-6 sm:p-8 shadow-neo relative overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-lime text-ink px-2.5 py-0.5 border-2 border-ink font-bungee text-xs">
                DOCUMENTATION
              </span>
              <span className="font-mono text-xs text-ink/70">
                SYSTEM OPERATOR & JUDGE GUIDE
              </span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-bungee text-ink tracking-tight">
              STUDIO USER GUIDE & SYSTEM MANUAL
            </h1>
            <p className="font-inter text-sm sm:text-base text-ink/80 mt-2 max-w-3xl leading-relaxed">
              Complete handbook for the <strong>hoichoi AI Content Studio & Command Center</strong>.
              Learn how the multi-agent pipeline generates culturally authentic, channel-tailored
              Bengali marketing assets while guaranteeing strict human sign-off, deterministic compliance,
              and continuous learning via vector insights.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/"
              className="neo-btn bg-lime text-ink px-4 py-2.5 text-sm font-bungee flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4" /> Open Studio
            </Link>
            <Link
              href="/approval"
              className="neo-btn bg-sunshine text-ink px-4 py-2.5 text-sm font-bungee flex items-center gap-2"
            >
              <ShieldCheck className="w-4 h-4" /> Review Queue
            </Link>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap gap-2 border-b-2 border-ink pb-2">
        {[
          { id: "overview", label: "1. Overview & Architecture", icon: Cpu },
          { id: "agents", label: "2. The 4 Autonomous Agents", icon: Sparkles },
          { id: "safeguards", label: "3. Non-Negotiable Safeguards", icon: ShieldCheck },
          { id: "manual", label: "4. Step-by-Step Operator Manual", icon: BookOpen },
          { id: "faq", label: "5. FAQ & Test Scenarios", icon: Terminal },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2.5 font-bungee text-xs sm:text-sm border-2 border-ink flex items-center gap-2 transition-all ${
                isActive
                  ? "bg-ink text-white shadow-neo translate-y-[-2px]"
                  : "bg-white text-ink hover:bg-paper shadow-neo-sm"
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="border-3 border-ink bg-white p-6 shadow-neo">
              <div className="w-10 h-10 bg-tomato text-white border-2 border-ink flex items-center justify-center font-bungee mb-3">
                01
              </div>
              <h3 className="font-bungee text-lg mb-2">The Challenge</h3>
              <p className="font-inter text-xs text-ink/80 leading-relaxed">
                hoichoi Hackathon &apos;26 (Problem 3): Produce cross-platform promotional campaigns
                for OTT releases tailored natively for <strong>Instagram (1:1 visual hooks)</strong>,{" "}
                <strong>Facebook (long-form narrative)</strong>, and <strong>X (punchy hype threads)</strong>.
              </p>
            </div>

            <div className="border-3 border-ink bg-white p-6 shadow-neo">
              <div className="w-10 h-10 bg-lime text-ink border-2 border-ink flex items-center justify-center font-bungee mb-3">
                02
              </div>
              <h3 className="font-bungee text-lg mb-2">The Multi-Agent Core</h3>
              <p className="font-inter text-xs text-ink/80 leading-relaxed">
                Rather than generic one-shot prompts, the Studio runs specialized LLM agents in an
                orchestrated pipeline: Research & Vector RAG → Channel Copywriting → Visual Generation →
                Deterministic Guardrails.
              </p>
            </div>

            <div className="border-3 border-ink bg-white p-6 shadow-neo">
              <div className="w-10 h-10 bg-sunshine text-ink border-2 border-ink flex items-center justify-center font-bungee mb-3">
                03
              </div>
              <h3 className="font-bungee text-lg mb-2">Closed-Loop RAG</h3>
              <p className="font-inter text-xs text-ink/80 leading-relaxed">
                Historical metrics are embedded with vector embeddings. When generating for a new mystery or
                drama brief, previous successful angles and audience hooks are retrieved to seed the new campaign.
              </p>
            </div>
          </div>

          {/* Architecture Flow Diagram */}
          <div className="border-3 border-ink bg-white p-6 sm:p-8 shadow-neo">
            <h3 className="font-bungee text-xl mb-4 flex items-center gap-2">
              <Layers className="w-5 h-5 text-blue" /> End-to-End System Pipeline
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="border-2 border-ink bg-paper p-4">
                <span className="bg-ink text-white font-mono text-[10px] px-2 py-0.5 uppercase">Stage 1</span>
                <h4 className="font-bungee text-sm mt-2 mb-1">Brief Ingestion & RAG</h4>
                <p className="font-inter text-xs text-ink/70">
                  User inputs OTT brief. Semantic vector query retrieves top-performing past hooks from pgvector.
                </p>
              </div>

              <div className="border-2 border-ink bg-paper p-4">
                <span className="bg-tomato text-white font-mono text-[10px] px-2 py-0.5 uppercase">Stage 2</span>
                <h4 className="font-bungee text-sm mt-2 mb-1">Agent Generation</h4>
                <p className="font-inter text-xs text-ink/70">
                  Copywriter outputs 3 tailored Bengali copies. Nano-Banana engine synthesizes 3 distinct channel visuals.
                </p>
              </div>

              <div className="border-2 border-ink bg-paper p-4">
                <span className="bg-sunshine text-ink font-mono text-[10px] px-2 py-0.5 uppercase">Stage 3</span>
                <h4 className="font-bungee text-sm mt-2 mb-1">Guardrail & Review</h4>
                <p className="font-inter text-xs text-ink/70">
                  Deterministic regex check validates Bengali nativeness. Placed in HITL queue for Content Manager sign-off.
                </p>
              </div>

              <div className="border-2 border-ink bg-paper p-4">
                <span className="bg-lime text-ink font-mono text-[10px] px-2 py-0.5 uppercase">Stage 4</span>
                <h4 className="font-bungee text-sm mt-2 mb-1">Publisher & Feedback</h4>
                <p className="font-inter text-xs text-ink/70">
                  Approved assets scheduled. Mock adapters publish, track impressions, and generate weekly AI insights.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: THE 4 AGENTS */}
      {activeTab === "agents" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="border-3 border-ink bg-white p-6 shadow-neo">
            <div className="flex items-center justify-between mb-3">
              <span className="bg-blue text-white px-2 py-0.5 border border-ink font-bungee text-xs">
                AGENT 1: RAG RESEARCHER
              </span>
              <span className="font-mono text-xs text-ink/60">lib/agents/insightRetrieval.ts</span>
            </div>
            <h3 className="font-bungee text-lg mb-2">Historical Insights Agent</h3>
            <p className="font-inter text-xs text-ink/80 leading-relaxed mb-4">
              Queries vector embeddings of past campaigns using pgvector. Discovers what copy hooks, hashtags,
              and tone performed best for similar genres (e.g. Feluda mysteries vs romantic comedies).
            </p>
            <div className="bg-paper p-3 border border-ink font-mono text-xs text-ink/80 space-y-1">
              <div><strong>Input:</strong> Raw brief text + Genre category</div>
              <div><strong>Process:</strong> Cosine similarity search against past campaign metrics</div>
              <div><strong>Output:</strong> Structured insight prompt injection</div>
            </div>
          </div>

          <div className="border-3 border-ink bg-white p-6 shadow-neo">
            <div className="flex items-center justify-between mb-3">
              <span className="bg-pink text-white px-2 py-0.5 border border-ink font-bungee text-xs">
                AGENT 2: NATIVE COPYWRITER
              </span>
              <span className="font-mono text-xs text-ink/60">lib/agents/copywriterAgent.ts</span>
            </div>
            <h3 className="font-bungee text-lg mb-2">Cross-Platform Copywriter</h3>
            <p className="font-inter text-xs text-ink/80 leading-relaxed mb-4">
              Generates genuine, culturally rich Bengali copy with appropriate English subtitles. Adapts length,
              call-to-actions, and hashtags specifically for Instagram, Facebook, and X.
            </p>
            <div className="bg-paper p-3 border border-ink font-mono text-xs text-ink/80 space-y-1">
              <div><strong>Instagram:</strong> Punchy hook, emotional Bengali line, trending hashtags</div>
              <div><strong>Facebook:</strong> Narrative synopsis, character intrigue, stream link CTA</div>
              <div><strong>X / Twitter:</strong> High-urgency cliffhanger, brevity (&lt;280 chars), engagement question</div>
            </div>
          </div>

          <div className="border-3 border-ink bg-white p-6 shadow-neo">
            <div className="flex items-center justify-between mb-3">
              <span className="bg-sunshine text-ink px-2 py-0.5 border border-ink font-bungee text-xs">
                AGENT 3: NANO-BANANA VISUALS
              </span>
              <span className="font-mono text-xs text-ink/60">lib/agents/imageGenerator.ts</span>
            </div>
            <h3 className="font-bungee text-lg mb-2">Distinct Visual Synthesizer</h3>
            <p className="font-inter text-xs text-ink/80 leading-relaxed mb-4">
              Generates 3 genuinely distinct channel images matching each platform&apos;s aspect ratio and tone.
              Uploaded directly to Cloudinary with persistent CDN URLs.
            </p>
            <div className="bg-paper p-3 border border-ink font-mono text-xs text-ink/80 space-y-1">
              <div><strong>Instagram:</strong> 1:1 Square, bold character focal point, vibrant contrast</div>
              <div><strong>Facebook:</strong> 16:9 / 4:3 Cinematic poster layout with dramatic lighting</div>
              <div><strong>X:</strong> 16:9 Wide banner optimized for mobile timeline visibility</div>
            </div>
          </div>

          <div className="border-3 border-ink bg-white p-6 shadow-neo">
            <div className="flex items-center justify-between mb-3">
              <span className="bg-lime text-ink px-2 py-0.5 border border-ink font-bungee text-xs">
                AGENT 4: COMPLIANCE ENGINE
              </span>
              <span className="font-mono text-xs text-ink/60">lib/agents/complianceCheck.ts</span>
            </div>
            <h3 className="font-bungee text-lg mb-2">Deterministic Guardrail (ADR-005)</h3>
            <p className="font-inter text-xs text-ink/80 leading-relaxed mb-4">
              <strong>Never an LLM call.</strong> Runs deterministic rule evaluation on character counts, banned words,
              Bengali Unicode block presence, missing disclosures, and spoiler safety.
            </p>
            <div className="bg-paper p-3 border border-ink font-mono text-xs text-ink/80 space-y-1">
              <div><strong>Rule 1:</strong> Exact channel character limits (X ≤ 280)</div>
              <div><strong>Rule 2:</strong> Bengali script verification (≥ 60% Bengali characters)</div>
              <div><strong>Rule 3:</strong> Zero Romanized Bengali slang or profane terms</div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: SAFEGUARDS */}
      {activeTab === "safeguards" && (
        <div className="space-y-6">
          <div className="border-4 border-tomato bg-tomato/10 p-6 shadow-neo">
            <h3 className="font-bungee text-xl text-tomato flex items-center gap-2 mb-2">
              <ShieldCheck className="w-6 h-6" /> The 3 Auto-Disqualifier Safeguards
            </h3>
            <p className="font-inter text-sm text-ink/80 leading-relaxed">
              In hoichoi Hackathon &apos;26 Problem 3, tripping any of these three auto-disqualifiers scores zero.
              Our codebase has engineered immutable barriers for each:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="border-3 border-ink bg-white p-6 shadow-neo">
              <span className="bg-tomato text-white px-2 py-0.5 border border-ink font-bungee text-xs">
                SAFEGUARD 1
              </span>
              <h4 className="font-bungee text-lg mt-2 mb-2">Zero-Skip Approval Gate</h4>
              <p className="font-inter text-xs text-ink/70 mb-3">
                No code path allows an asset to reach the Publisher without an explicit <code>AssetStatus.APPROVED</code> record created by human interaction.
              </p>
              <div className="p-2 bg-paper border border-ink font-mono text-[11px] text-ink/80">
                server/trpc/publisherRouter.ts:
                <br />
                <code>if (asset.status !== APPROVED) throw Error(...)</code>
              </div>
            </div>

            <div className="border-3 border-ink bg-white p-6 shadow-neo">
              <span className="bg-sunshine text-ink px-2 py-0.5 border border-ink font-bungee text-xs">
                SAFEGUARD 2
              </span>
              <h4 className="font-bungee text-lg mt-2 mb-2">Deterministic Compliance</h4>
              <p className="font-inter text-xs text-ink/70 mb-3">
                ADR-005 strictly mandates deterministic regex and rule tables. The compliance check never delegates to an LLM, preventing hallucinated passes.
              </p>
              <div className="p-2 bg-paper border border-ink font-mono text-[11px] text-ink/80">
                lib/agents/complianceCheck.ts:
                <br />
                <code>Pure TypeScript regex evaluator</code>
              </div>
            </div>

            <div className="border-3 border-ink bg-white p-6 shadow-neo">
              <span className="bg-lime text-ink px-2 py-0.5 border border-ink font-bungee text-xs">
                SAFEGUARD 3
              </span>
              <h4 className="font-bungee text-lg mt-2 mb-2">pgvector Insight Loop</h4>
              <p className="font-inter text-xs text-ink/70 mb-3">
                ADR-008 mandates that past performance data is systematically queried and used as context in future generation prompts.
              </p>
              <div className="p-2 bg-paper border border-ink font-mono text-[11px] text-ink/80">
                lib/agents/insightRetrieval.ts:
                <br />
                <code>retrieveRelevantInsights() in briefRouter</code>
              </div>
            </div>
          </div>

          <div className="border-3 border-ink bg-white p-6 shadow-neo">
            <h3 className="font-bungee text-xl mb-3 flex items-center gap-2">
              <Flame className="w-5 h-5 text-tomato" /> Bengali Nativeness Protocol
            </h3>
            <p className="font-inter text-xs sm:text-sm text-ink/80 leading-relaxed mb-4">
              Bengali audiences reject literal machine translation. Our copywriter prompt and runtime guardrail
              guarantee high-context Kolkata and Dhaka cultural references, authentic idioms (যেমন &quot;গা শিউরে ওঠা&quot;,
              &quot;রহস্যের নতুন মোড়&quot;), and reject awkward phonetic Roman transliterations.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
              <div className="p-3 border border-tomato bg-tomato/10 text-ink">
                <strong>❌ Rejected:</strong> &quot;Apni ki ei show ta dekhechen? Khub valo lagbe!&quot; (Romanized Bengali)
              </div>
              <div className="p-3 border border-lime bg-lime/20 text-ink">
                <strong>✓ Approved:</strong> &quot;রহস্যের জালে জড়িয়ে যাচ্ছে গোটা শহর! আজই স্ট্রিম করুন hoichoi-তে।&quot; (Native Script)
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: OPERATOR MANUAL */}
      {activeTab === "manual" && (
        <div className="space-y-6">
          <div className="border-3 border-ink bg-white p-6 shadow-neo">
            <h3 className="font-bungee text-xl mb-4">Content Manager Walkthrough</h3>
            <div className="space-y-6">
              <div className="flex gap-4 items-start">
                <span className="w-8 h-8 rounded-none bg-ink text-white font-bungee text-sm flex items-center justify-center shrink-0 border-2 border-ink">
                  1
                </span>
                <div>
                  <h4 className="font-bungee text-base">Submit Campaign Brief</h4>
                  <p className="font-inter text-xs sm:text-sm text-ink/70 mt-1">
                    Sign in with your hoichoi manager account. Paste a synopsis, trailer hook, or select one of the
                    pre-built test briefs (Feluda Mystery, Mandaar Crime, Eken Babu Comedy). Click <strong>&quot;Run Multi-Agent Studio&quot;</strong>.
                  </p>
                </div>
              </div>

              <div className="flex gap-4 items-start">
                <span className="w-8 h-8 rounded-none bg-sunshine text-ink font-bungee text-sm flex items-center justify-center shrink-0 border-2 border-ink">
                  2
                </span>
                <div>
                  <h4 className="font-bungee text-base">Human Review in Approval Queue</h4>
                  <p className="font-inter text-xs sm:text-sm text-ink/70 mt-1">
                    Navigate to <Link href="/approval" className="font-bungee underline text-tomato">Approval Queue</Link>.
                    Inspect the 3 channel cards. Review compliance checks. You can:
                  </p>
                  <ul className="list-disc pl-5 mt-2 text-xs font-inter text-ink/80 space-y-1">
                    <li><strong>Approve:</strong> Instantly authorizes the asset for cross-platform scheduling.</li>
                    <li><strong>Regenerate with Feedback:</strong> Type instructions (e.g. &quot;make hook more suspenseful&quot;) to trigger targeted agent refinement.</li>
                    <li><strong>Reject:</strong> Permanently archives non-viable variations.</li>
                  </ul>
                </div>
              </div>

              <div className="flex gap-4 items-start">
                <span className="w-8 h-8 rounded-none bg-blue text-white font-bungee text-sm flex items-center justify-center shrink-0 border-2 border-ink">
                  3
                </span>
                <div>
                  <h4 className="font-bungee text-base">Publisher Command & Live Mockup</h4>
                  <p className="font-inter text-xs sm:text-sm text-ink/70 mt-1">
                    Visit <Link href="/publisher" className="font-bungee underline text-blue">Publisher Command</Link>.
                    Use the <strong>AI Post-Time Optimizer</strong> to select Kolkata prime-time slots (e.g., 8:30 PM),
                    preview your post in the <strong>Social Feed Simulator</strong> (Instagram / Facebook / X), and dispatch mock drops.
                  </p>
                </div>
              </div>

              <div className="flex gap-4 items-start">
                <span className="w-8 h-8 rounded-none bg-pink text-white font-bungee text-sm flex items-center justify-center shrink-0 border-2 border-ink">
                  4
                </span>
                <div>
                  <h4 className="font-bungee text-base">Insights & Cross-Platform Analytics</h4>
                  <p className="font-inter text-xs sm:text-sm text-ink/70 mt-1">
                    Head to <Link href="/insights" className="font-bungee underline text-pink">Insights & Reports</Link>.
                    Compare engagement rates across Instagram, Facebook, and X. Import real or synthetic performance CSVs,
                    and trigger the AI Weekly Performance Digest.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: FAQ */}
      {activeTab === "faq" && (
        <div className="space-y-4">
          {[
            {
              q: "Can anyone see or publish campaigns created by another user?",
              a: "No. With our strict multi-tenant isolation, every brief, asset, approval, and scheduled post is partitioned by your authenticated Clerk userId in tRPC context. Unauthenticated requests are blocked.",
            },
            {
              q: "What happens if Gemini generates an asset that violates character limits?",
              a: "The deterministic compliance engine intercepts the generation immediately. Violations are flagged with specific rule IDs (e.g. X_CHAR_LIMIT, BENGALI_SCRIPT_CHECK), requiring revision before approval.",
            },
            {
              q: "How does the Publisher simulate platform drops?",
              a: "The publisher uses realistic platform adapters (Instagram Graph API, Facebook Marketing API, X API v2 mockers) generating authentic mock platform post IDs, timestamp hashes, and verification webhooks.",
            },
            {
              q: "Can I test the closed-loop insight cycle without real historical data?",
              a: "Yes! Use the 'Generate Demo Post Metrics' button on the Publisher page or upload a sample metrics CSV in Insights. The system embeds the results into pgvector and immediately reflects them in future brief runs.",
            },
          ].map((item, idx) => (
            <div key={idx} className="border-3 border-ink bg-white p-5 shadow-neo">
              <h4 className="font-bungee text-sm sm:text-base text-ink mb-2 flex items-center gap-2">
                <span className="bg-lime px-2 py-0.5 border border-ink text-xs font-mono">Q{idx + 1}</span>
                {item.q}
              </h4>
              <p className="font-inter text-xs sm:text-sm text-ink/80 leading-relaxed pl-7">
                {item.a}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
