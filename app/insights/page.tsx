"use client";

import React, { useState } from "react";
import { trpc } from "@/lib/trpc/client";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  BarChart3,
  Flame,
  FileText,
  Upload,
  RefreshCw,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Award,
  Database,
  Layers,
} from "lucide-react";

import { useUser, SignInButton } from "@clerk/nextjs";

function InsightsContent() {
  const { isSignedIn, isLoaded } = useUser();
  const searchParams = useSearchParams();
  const initialBriefId = searchParams.get("briefId") || "";

  const [selectedBriefId, setSelectedBriefId] = useState(initialBriefId);
  const [csvText, setCsvText] = useState("");
  const [showCsvModal, setShowCsvModal] = useState(false);

  const utils = trpc.useUtils();

  // Queries
  const { data: recentBriefs } = trpc.brief.list.useQuery(undefined, { enabled: !!isSignedIn });
  const effectiveBriefId = selectedBriefId || recentBriefs?.[0]?.id || "";

  const { data: comparisonData, isLoading: isLoadingComparison } =
    trpc.insights.crossPlatformComparison.useQuery(
      { briefId: effectiveBriefId },
      { enabled: !!effectiveBriefId && !!isSignedIn }
    );

  const { data: weeklyReports, isLoading: isLoadingReports } =
    trpc.insights.weeklyReports.useQuery(undefined, { enabled: !!isSignedIn });

  // Mutations
  const generateDemoMetricsMutation = trpc.metrics.generateDemoMetrics.useMutation({
    onSuccess: () => {
      utils.insights.crossPlatformComparison.invalidate();
      utils.publisher.list.invalidate();
    },
  });

  const uploadCsvMutation = trpc.metrics.uploadCsv.useMutation({
    onSuccess: (data) => {
      alert(`Imported ${data.imported} metrics records! Errors: ${data.errors.length}`);
      utils.insights.crossPlatformComparison.invalidate();
      setShowCsvModal(false);
    },
  });

  const generateReportMutation = trpc.insights.generateReport.useMutation({
    onSuccess: () => {
      utils.insights.weeklyReports.invalidate();
    },
  });

  const handleGenerateMetrics = (publishedPostId: string) => {
    generateDemoMetricsMutation.mutate({ publishedPostId });
  };

  const handleTriggerReport = () => {
    const periodStart = new Date(Date.now() - 7 * 86400000).toISOString();
    const periodEnd = new Date().toISOString();
    generateReportMutation.mutate({ periodStart, periodEnd });
  };

  // Find top performer for "Certified Banger" badge (DESIGN_SYSTEM.md voice table)
  let topPerformerChannel: string | null = null;
  let maxEngagement = -1;

  if (comparisonData?.comparison) {
    for (const item of comparisonData.comparison) {
      if (item.metrics && item.metrics.engagementRate > maxEngagement) {
        maxEngagement = item.metrics.engagementRate;
        topPerformerChannel = item.channel;
      }
    }
  }

  if (isLoaded && !isSignedIn) {
    return (
      <div className="max-w-xl mx-auto my-16 p-8 border-4 border-ink bg-white shadow-neo text-center">
        <BarChart3 className="w-12 h-12 text-pink mx-auto mb-3" />
        <h2 className="font-bungee text-2xl mb-2">ANALYTICS PROTECTED</h2>
        <p className="font-inter text-sm text-ink/80 mb-6">
          Sign in with your hoichoi account to view your campaign performance metrics and weekly AI insight reports.
        </p>
        <SignInButton mode="modal">
          <button className="neo-btn bg-lime text-ink px-6 py-2.5 font-bungee text-sm">
            Sign In to View Insights
          </button>
        </SignInButton>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
      {/* Top Banner */}
      <div className="mb-8 border-4 border-ink bg-white p-4 sm:p-6 shadow-neo">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="bg-pink text-white px-2 py-0.5 border-2 border-ink font-bungee text-xs">
                MODULES 3 & 4
              </span>
              <span className="font-mono text-xs text-ink/70">
                ANALYTICS STORE & CROSS-PLATFORM INSIGHTS
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl text-ink font-bungee">INSIGHTS COMMAND</h1>
            <p className="font-inter text-sm text-ink/80 mt-1 max-w-2xl">
              Like-for-like side-by-side performance comparison for the exact same campaign
              (AC 14.1). Generates AI reports with verified post citations (AC 16.1) and embeds
              insights back into pgvector to inform future briefs (ADR-008).
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setShowCsvModal(true)}
              className="neo-btn bg-paper text-ink px-3 py-2 text-xs flex items-center gap-1.5"
            >
              <Upload className="w-4 h-4" /> CSV Ingest
            </button>

            <button
              onClick={handleTriggerReport}
              disabled={generateReportMutation.isPending}
              className="neo-btn bg-lime text-ink px-4 py-2 text-xs flex items-center gap-1.5 hover:bg-lime-hover"
            >
              <Sparkles className="w-4 h-4" />
              {generateReportMutation.isPending ? "Analyzing..." : "Generate AI Weekly Report"}
            </button>
          </div>
        </div>
      </div>

      {/* Campaign Selector Tabs */}
      {recentBriefs && recentBriefs.length > 0 && (
        <div className="mb-6 flex items-center gap-2 overflow-x-auto pb-2">
          <span className="font-bungee text-xs text-ink/70 shrink-0 mr-1">Campaigns:</span>
          {recentBriefs.map((b) => (
            <button
              key={b.id}
              onClick={() => setSelectedBriefId(b.id)}
              className={`px-3 py-1.5 border-2 border-ink font-bungee text-xs whitespace-nowrap transition-all ${
                effectiveBriefId === b.id
                  ? "bg-sunshine text-ink shadow-neo-sm translate-y-[-1px]"
                  : "bg-white text-ink hover:bg-paper"
              }`}
            >
              {b.genre || "Media Brief"} ({b.assets.length})
            </button>
          ))}
        </div>
      )}

      {/* Module 4: Like-For-Like Cross-Platform Comparison (AC 14.1) */}
      <div className="border-4 border-ink bg-white p-4 sm:p-6 shadow-neo mb-8">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b-3 border-ink pb-4 mb-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-blue text-white px-2 py-0.5 border border-ink font-bungee text-[11px]">
                SIDE-BY-SIDE
              </span>
              <h2 className="text-xl font-bungee text-ink">
                Cross-Platform Like-for-Like Comparison
              </h2>
            </div>
            <p className="font-inter text-xs text-ink/70 mt-0.5">
              Comparing identical creative brief across channels side by side (AC 14.1).
            </p>
          </div>

          {comparisonData?.brief && (
            <div className="font-mono text-xs text-ink/70 bg-paper p-2 border border-ink">
              Brief ID: {comparisonData.brief.id} • Target:{" "}
              {comparisonData.brief.targetChannels.join(", ")}
            </div>
          )}
        </div>

        {isLoadingComparison ? (
          <div className="p-8 text-center font-mono text-xs">
            Loading cross-platform comparison...
          </div>
        ) : comparisonData?.comparison && comparisonData.comparison.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {comparisonData.comparison.map((item) => {
              const channel = item.channel.toLowerCase();
              const isInstagram = channel === "instagram";
              const isFacebook = channel === "facebook";
              const channelColor = isInstagram
                ? "bg-pink text-white"
                : isFacebook
                ? "bg-blue text-white"
                : "bg-jet text-white";

              const isTopBanger =
                topPerformerChannel === item.channel && (item.metrics?.engagementRate ?? 0) > 0;

              return (
                <div
                  key={item.assetId}
                  className={`border-3 border-ink p-5 flex flex-col justify-between shadow-neo-sm relative ${
                    isTopBanger ? "bg-[#FFFCE8] border-tomato" : "bg-paper"
                  }`}
                >
                  {/* Certified Banger Badge (DESIGN_SYSTEM.md voice table) */}
                  {isTopBanger && (
                    <div className="absolute -top-3.5 right-3 bg-tomato text-white px-2 py-0.5 border-2 border-ink font-bungee text-[11px] rotate-[2deg] shadow-neo-sm flex items-center gap-1 z-10">
                      <Flame className="w-3.5 h-3.5" /> Certified Banger
                    </div>
                  )}

                  <div>
                    {/* Channel Header */}
                    <div className="flex items-center justify-between mb-3">
                      <span
                        className={`font-bungee text-xs px-2.5 py-0.5 border-2 border-ink uppercase ${channelColor}`}
                      >
                        {item.channel}
                      </span>
                      {item.publishedPostId && (
                        <span className="font-mono text-[10px] bg-white px-1.5 py-0.5 border border-ink">
                          {item.publishedPostId}
                        </span>
                      )}
                    </div>

                    {/* Visual Asset Thumbnail */}
                    {item.imageUrl && (
                      <div className="mb-3 border-2 border-ink overflow-hidden bg-black/5">
                        <img
                          src={item.imageUrl}
                          alt={item.channel}
                          className="w-full h-32 object-cover"
                        />
                      </div>
                    )}

                    <p className="font-inter text-xs text-ink line-clamp-3 mb-4 font-medium">
                      {item.copy}
                    </p>

                    {/* Metrics Grid */}
                    {item.metrics ? (
                      <div className="grid grid-cols-2 gap-2 bg-white p-3 border-2 border-ink font-mono text-xs mb-3">
                        <div>
                          <span className="text-[10px] text-ink/60 block">VIEWS</span>
                          <span className="font-bold text-sm">
                            {item.metrics.views.toLocaleString()}
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] text-ink/60 block">LIKES</span>
                          <span className="font-bold text-sm">
                            {item.metrics.likes.toLocaleString()}
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] text-ink/60 block">SHARES</span>
                          <span className="font-bold text-sm">
                            {item.metrics.shares.toLocaleString()}
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] text-ink/60 block">ENGAGEMENT</span>
                          <span className="font-bold text-sm text-tomato">
                            {item.metrics.engagementRate}%
                          </span>
                        </div>
                        <div className="col-span-2 pt-1 border-t border-ink/10 text-[10px] text-ink/50 flex justify-between">
                          <span>Source: {item.metrics.source}</span>
                        </div>
                      </div>
                    ) : (
                      <div className="border-2 border-dashed border-ink/40 p-4 text-center bg-white mb-3">
                        <span className="font-inter text-xs text-ink/60 block mb-2">
                          No performance data recorded
                        </span>
                        {item.publishedPostId ? (
                          <button
                            onClick={() => handleGenerateMetrics(item.publishedPostId!)}
                            disabled={generateDemoMetricsMutation.isPending}
                            className="neo-btn bg-sunshine text-ink px-2.5 py-1 text-[11px]"
                          >
                            🎲 Generate Demo Metrics
                          </button>
                        ) : (
                          <span className="font-mono text-[10px] text-ink/50">
                            Must be mock-published first
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="pt-2 border-t border-ink/20 flex items-center justify-between text-[11px] font-mono">
                    <span className="text-ink/60">AC 14.1 like-for-like</span>
                    {item.publishedPostId && (
                      <button
                        onClick={() => handleGenerateMetrics(item.publishedPostId!)}
                        className="text-blue hover:underline font-semibold"
                      >
                        Re-roll Metrics ⟳
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-8 text-center border-2 border-dashed border-ink/40">
            <p className="font-inter text-sm text-ink/70">
              Select or generate a campaign brief above to view cross-platform metrics comparison.
            </p>
          </div>
        )}
      </div>

      {/* Module 4: Weekly AI Reports with Grounded Post Citations (AC 16.1 & ADR-008) */}
      <div className="border-4 border-ink bg-white p-6 shadow-neo">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b-3 border-ink pb-4 mb-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-lime text-ink px-2 py-0.5 border border-ink font-bungee text-[11px]">
                GROUNDED AI
              </span>
              <h2 className="text-xl font-bungee text-ink">
                Weekly AI Reports & Retrieval Embeddings
              </h2>
            </div>
            <p className="font-inter text-xs text-ink/70 mt-0.5">
              Summaries with strict post citation grounding (AC 16.1) that feed back into new
              briefs via pgvector embeddings (ADR-008).
            </p>
          </div>
        </div>

        {isLoadingReports ? (
          <div className="p-8 text-center font-mono text-xs">Loading AI reports...</div>
        ) : weeklyReports && weeklyReports.length > 0 ? (
          <div className="space-y-6">
            {(weeklyReports as any[]).map((report) => (
              <div key={report.id} className="border-3 border-ink p-5 bg-paper shadow-neo-sm">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b-2 border-ink pb-2 mb-3">
                  <div className="flex items-center gap-2">
                    <span className="font-bungee text-sm text-ink">
                      WEEKLY SUMMARY — {new Date(report.generatedAt).toLocaleDateString()}
                    </span>
                  </div>
                  <span className="font-mono text-xs text-ink/60">
                    Period: {new Date(report.periodStart).toLocaleDateString()} –{" "}
                    {new Date(report.periodEnd).toLocaleDateString()}
                  </span>
                </div>

                {/* Report Summary Prose */}
                <p className="font-inter text-sm text-ink leading-relaxed mb-4 font-medium">
                  {report.summary}
                </p>

                {/* Key Insights with Citations (AC 16.1) */}
                {report.keyInsights && Array.isArray(report.keyInsights) && (
                  <div className="space-y-2 mb-4">
                    <span className="font-bungee text-xs text-ink flex items-center gap-1.5">
                      <FileText className="w-4 h-4 text-blue" /> Grounded Insights (Citing Real Post
                      IDs):
                    </span>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {(
                        report.keyInsights as Array<{
                          claim: string;
                          citedPostIds: string[];
                        }>
                      ).map((insight, idx) => (
                        <div
                          key={idx}
                          className="bg-white border-2 border-ink p-3 text-xs font-inter flex flex-col justify-between shadow-neo-sm"
                        >
                          <p className="text-ink mb-2">"{insight.claim}"</p>
                          <div className="pt-2 border-t border-ink/10 flex items-center gap-1 font-mono text-[10px] text-ink/70">
                            <span className="bg-sunshine/40 px-1 border border-ink">
                              Cited IDs:
                            </span>
                            <span>{insight.citedPostIds?.join(", ") || "Aggregate"}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Vector Embeddings Confirmation (ADR-008 loop) */}
                <div className="bg-[#EBF5FF] border-2 border-ink p-3 flex items-center justify-between text-xs font-mono text-ink">
                  <div className="flex items-center gap-2">
                    <Database className="w-4 h-4 text-blue" />
                    <span>
                      Stored in pgvector (1536-dim): Available for retrieval on next brief
                      submission
                    </span>
                  </div>
                  <span className="bg-blue text-white px-2 py-0.5 border border-ink font-bungee text-[10px]">
                    FEEDBACK LOOP ACTIVE
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Graceful "Not enough data" empty state (AC 16.2 / DESIGN_SYSTEM.md voice table) */
          <div className="p-8 text-center border-2 border-dashed border-ink/40 bg-paper">
            <span className="font-bungee text-lg block mb-1">
              "Not enough posts to say anything smart yet. Ask again next week."
            </span>
            <p className="font-inter text-xs text-ink/70 max-w-sm mx-auto mb-4">
              Publish some approved posts and generate or upload performance metrics to produce an
              AI-written report.
            </p>
            <button
              onClick={handleTriggerReport}
              disabled={generateReportMutation.isPending}
              className="neo-btn bg-lime text-ink px-4 py-2 text-xs"
            >
              Generate First Report
            </button>
          </div>
        )}
      </div>

      {/* CSV Ingestion Modal */}
      {showCsvModal && (
        <div className="fixed inset-0 bg-ink/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="neo-card p-6 max-w-lg w-full bg-white space-y-4">
            <div className="flex items-center justify-between border-b-2 border-ink pb-2">
              <h3 className="font-bungee text-lg">CSV Metrics Ingestion</h3>
              <button
                onClick={() => setShowCsvModal(false)}
                className="font-bungee text-sm hover:text-tomato"
              >
                ✕
              </button>
            </div>

            <p className="font-inter text-xs text-ink/70">
              Paste CSV content containing <code>post_id, views, likes, shares, comments</code>.
            </p>

            <textarea
              value={csvText}
              onChange={(e) => setCsvText(e.target.value)}
              placeholder="post_id, views, likes, shares, comments&#10;ig_1720000000_abc, 25400, 1850, 240, 110"
              rows={6}
              className="w-full border-2 border-ink p-2 font-mono text-xs bg-paper focus:outline-none"
            />

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowCsvModal(false)}
                className="neo-btn bg-paper text-ink px-3 py-1.5 text-xs"
              >
                Cancel
              </button>
              <button
                onClick={() => uploadCsvMutation.mutate({ csvContent: csvText })}
                disabled={uploadCsvMutation.isPending || !csvText.trim()}
                className="neo-btn bg-lime text-ink px-4 py-1.5 text-xs hover:bg-lime-hover"
              >
                {uploadCsvMutation.isPending ? "Importing..." : "Import CSV Records"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function InsightsPage() {
  return (
    <React.Suspense
      fallback={
        <div className="max-w-7xl mx-auto p-6 text-center py-24 font-mono font-bold text-ink">
          Loading Insights & Cross-Platform Metrics...
        </div>
      }
    >
      <InsightsContent />
    </React.Suspense>
  );
}
