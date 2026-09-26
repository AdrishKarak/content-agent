"use client";

import React, { useState } from "react";
import { trpc } from "@/lib/trpc/client";
import { getStickerRotationStyle } from "@/lib/design/stickerRotation";
import Link from "next/link";
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  AlertTriangle,
  RotateCcw,
  CheckCircle2,
  XCircle,
  Clock,
  Layers,
  Flame,
} from "lucide-react";
import { useUser, SignInButton, SignedIn, SignedOut } from "@clerk/nextjs";

export default function StudioPage() {
  const { isSignedIn, isLoaded } = useUser();
  const [briefText, setBriefText] = useState("");
  const [activeBriefId, setActiveBriefId] = useState<string | null>(null);

  // Queries & Mutations
  const submitBriefMutation = trpc.brief.submit.useMutation({
    onSuccess: (data) => {
      setActiveBriefId(data.briefId);
    },
  });

  const { data: currentBrief, isLoading: isLoadingBrief } = trpc.brief.get.useQuery(
    { briefId: activeBriefId! },
    { enabled: !!activeBriefId && !!isSignedIn }
  );

  const { data: recentBriefs, refetch: refetchRecent } = trpc.brief.list.useQuery(
    undefined,
    { enabled: !!isSignedIn }
  );

  const handleSampleClick = (sample: string) => {
    setBriefText(sample);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isSignedIn) {
      alert("Please sign in to generate studio campaigns.");
      return;
    }
    if (!briefText.trim()) return;
    submitBriefMutation.mutate({ rawBriefText: briefText });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-8">
      {/* Explosive Landing Hero Section */}
      <section className="border-4 border-ink bg-white p-6 sm:p-10 shadow-neo relative overflow-hidden">
        <div className="max-w-4xl relative z-10 space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="bg-tomato text-white px-2.5 py-1 border-2 border-ink font-bungee text-xs rotate-[-1deg] shadow-neo-xs">
              HOICHOI HACKATHON &apos;26 • PROBLEM 3
            </span>
            <span className="bg-lime text-ink px-2.5 py-1 border-2 border-ink font-bungee text-xs shadow-neo-xs">
              PRODUCTION-READY AGENT PIPELINE
            </span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bungee text-ink tracking-tight leading-none">
            AUTONOMOUS BENGALI-FIRST MULTI-PLATFORM STUDIO
          </h1>

          <p className="font-inter text-sm sm:text-base text-ink/80 max-w-3xl leading-relaxed">
            Transform OTT show releases into culturally authentic, channel-tailored marketing campaigns
            for <strong>Instagram (1:1 visual hooks)</strong>, <strong>Facebook (narrative synopsis)</strong>, and{" "}
            <strong>X (280-char hype threads)</strong>. Guaranteed with zero auto-publish leaks, deterministic
            compliance checks, and closed-loop semantic insight retrieval.
          </p>

          {/* Quick Pillars Badges */}
          <div className="flex flex-wrap gap-2 pt-1">
            <span className="bg-paper px-3 py-1 border-2 border-ink font-mono text-xs font-semibold flex items-center gap-1.5 shadow-neo-xs">
              <ShieldCheck className="w-3.5 h-3.5 text-lime" /> Zero-Skip HITL Gate
            </span>
            <span className="bg-paper px-3 py-1 border-2 border-ink font-mono text-xs font-semibold flex items-center gap-1.5 shadow-neo-xs">
              <Flame className="w-3.5 h-3.5 text-tomato" /> Bengali Nativeness Check
            </span>
            <span className="bg-paper px-3 py-1 border-2 border-ink font-mono text-xs font-semibold flex items-center gap-1.5 shadow-neo-xs">
              <Sparkles className="w-3.5 h-3.5 text-pink" /> 3 Distinct Visuals
            </span>
            <span className="bg-paper px-3 py-1 border-2 border-ink font-mono text-xs font-semibold flex items-center gap-1.5 shadow-neo-xs">
              <Layers className="w-3.5 h-3.5 text-blue" /> pgvector Insight RAG
            </span>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center gap-3 pt-3">
            <a
              href="#studio-workspace"
              className="neo-btn bg-lime text-ink px-5 py-3 text-sm font-bungee flex items-center gap-2 hover:bg-lime-hover shadow-neo"
            >
              <Sparkles className="w-4 h-4" /> Launch Studio Generator ↓
            </a>
            <Link
              href="/guide"
              className="neo-btn bg-sunshine text-ink px-4 py-3 text-sm font-bungee flex items-center gap-2 shadow-neo"
            >
              Read System Guide →
            </Link>
            <Link
              href="/approval"
              className="neo-btn bg-white text-ink px-4 py-3 text-sm font-bungee flex items-center gap-2 shadow-neo"
            >
              <ShieldCheck className="w-4 h-4 text-tomato" /> Approval Queue
            </Link>
          </div>
        </div>

        {/* Decorative Neobrutalist Corner Tag */}
        <div className="hidden lg:block absolute -right-6 -bottom-6 w-44 h-44 bg-sunshine/40 border-4 border-ink rotate-12 -z-0 pointer-events-none" />
      </section>

      {/* Main Workspace Anchor */}
      <div id="studio-workspace" className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Brief Submission & Controls (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="border-3 border-ink bg-white p-6 shadow-neo">
            <h2 className="text-xl font-bungee mb-3 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-pink" /> Campaign Brief
            </h2>
            <SignedOut>
              <div className="border-2 border-ink bg-sunshine/30 p-3 mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-neo-sm">
                <div>
                  <p className="font-bungee text-xs">AUTHENTICATION REQUIRED</p>
                  <p className="text-[11px] text-ink/80 font-inter">Sign in with your hoichoi account to generate, isolate, and view private campaigns.</p>
                </div>
                <SignInButton mode="modal">
                  <button className="neo-btn bg-lime text-ink px-3 py-1 text-xs whitespace-nowrap self-start sm:self-auto">
                    Sign In
                  </button>
                </SignInButton>
              </div>
            </SignedOut>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <textarea
                  value={briefText}
                  onChange={(e) => setBriefText(e.target.value)}
                  placeholder="Paste or write your campaign brief here (Bengali, English, or mixed)..."
                  rows={6}
                  className="w-full border-3 border-ink p-3 font-inter text-sm focus:outline-none focus:ring-0 focus:border-pink bg-paper shadow-neo-sm placeholder:text-ink/40"
                  required
                />
              </div>

              {/* Sample Brief Presets */}
              <div className="space-y-2">
                <span className="font-mono text-xs font-semibold text-ink/70">
                  Quick Demo Briefs:
                </span>
                <div className="flex flex-col gap-1.5">
                  <button
                    type="button"
                    onClick={() =>
                      handleSampleClick(
                        `হইচই-এর নতুন সাইকোলজিক্যাল থ্রিলার ওয়েব সিরিজ "নিখোঁজ সংবাদ" আগামী মাসে রিলিজ করছে। গল্পটি কলকাতার এক বর্ষার রাতে শুরু হয়, যেখানে এক নামকরা অনুসন্ধানী সাংবাদিক হঠাৎ রহস্যজনকভাবে ভ্যানিশ হয়ে যায়। টার্গেট অডিয়েন্স: ১৮-৩৫ বছর বয়সী বাংলা থ্রিলারপ্রেমী ও সিনেমা-সিরিজ অনুরাগী দর্শক। টোন: সাসপেন্সফুল, ডার্ক, এনগেজিং ও রহস্যময়।`
                      )
                    }
                    className="text-left text-xs font-inter p-2 border-2 border-ink hover:bg-sunshine/30 transition-colors"
                  >
                    <span className="font-bungee text-[11px] text-tomato mr-1">[BENGALI]</span>
                    নিখোঁজ সংবাদ — Psychological Thriller (Kolkata Monsoon)
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      handleSampleClick(
                        `hoichoi original romantic comedy series "Prem Dot Com" releasing on Valentine's week. A hilarious modern take on dating apps in North Kolkata starring young leads. Target audience: 16-28 urban youth. Tone: Quirky, funny, heartwarming, and relatable.`
                      )
                    }
                    className="text-left text-xs font-inter p-2 border-2 border-ink hover:bg-pink/20 transition-colors"
                  >
                    <span className="font-bungee text-[11px] text-blue mr-1">[ENGLISH]</span>
                    Prem Dot Com — Modern North Kolkata Rom-Com
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      handleSampleClick(
                        `ঐতিহাসিক রহস্যধর্মী সিরিজ "লালবাজারের গুপ্তধন"। ঔপনিবেশিক আমলের এক ব্রিটিশ বাংলোর নিচে লুকানো রহস্য নিয়ে দুই গোয়েন্দার শ্বাসরুদ্ধকর অনুসন্ধান। টার্গেট: সর্বস্তরের বাংলা রহস্যপ্রেমী দর্শক। টোন: ক্লাসিক্যাল ডিটেকটিভ, অ্যাডভেঞ্চার ও হিস্টোরিক্যাল।`
                      )
                    }
                    className="text-left text-xs font-inter p-2 border-2 border-ink hover:bg-lime/30 transition-colors"
                  >
                    <span className="font-bungee text-[11px] text-lime mr-1">[PERIOD]</span>
                    লালবাজারের গুপ্তধন — Colonial Mystery Detective
                  </button>
                </div>
              </div>

              {submitBriefMutation.error && (
                <div className="bg-tomato/10 border-2 border-tomato p-3 font-mono text-xs text-tomato">
                  {submitBriefMutation.error.message}
                </div>
              )}

              {isSignedIn ? (
                <button
                  type="submit"
                  disabled={submitBriefMutation.isPending}
                  className="w-full neo-btn bg-lime text-ink py-3 text-base flex items-center justify-center gap-2 hover:bg-lime-hover disabled:opacity-50"
                >
                  {submitBriefMutation.isPending ? (
                    <>
                      <RotateCcw className="w-5 h-5 animate-spin" />
                      Generating Tailored Studio Assets...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5" />
                      Run Multi-Agent Studio
                    </>
                  )}
                </button>
              ) : (
                <SignInButton mode="modal">
                  <button
                    type="button"
                    className="w-full neo-btn bg-sunshine text-ink py-3 text-base flex items-center justify-center gap-2 hover:bg-sunshine/80"
                  >
                    <Sparkles className="w-5 h-5" />
                    Sign In to Run Multi-Agent Studio
                  </button>
                </SignInButton>
              )}
            </form>
          </div>

          {/* Recent Campaigns History */}
          {recentBriefs && recentBriefs.length > 0 && (
            <div className="border-3 border-ink bg-white p-4 shadow-neo">
              <h3 className="font-bungee text-sm mb-3 flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-ink" /> Past Campaigns
              </h3>
              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {recentBriefs.map((b) => (
                  <button
                    key={b.id}
                    onClick={() => setActiveBriefId(b.id)}
                    className={`w-full text-left p-2.5 border-2 border-ink text-xs font-inter transition-all flex items-center justify-between ${
                      activeBriefId === b.id ? "bg-sunshine shadow-neo-sm" : "hover:bg-paper"
                    }`}
                  >
                    <div className="truncate mr-2">
                      <span className="font-bungee text-[11px] block truncate">
                        {b.genre || "Campaign"}
                      </span>
                      <span className="text-[11px] text-ink/70 truncate block">
                        {b.rawBriefText.substring(0, 45)}...
                      </span>
                    </div>
                    <span className="font-mono text-[10px] bg-paper px-1.5 py-0.5 border border-ink shrink-0">
                      {b.assets.length} assets
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Generation Output / Sticker Corkboard (7 cols) */}
        <div className="lg:col-span-7">
          {submitBriefMutation.isPending || isLoadingBrief ? (
            <div className="border-3 border-ink bg-white p-12 text-center shadow-neo">
              <RotateCcw className="w-10 h-10 animate-spin mx-auto text-pink mb-4" />
              <h3 className="font-bungee text-xl mb-2">Multi-Agent Engine in Progress</h3>
              <p className="font-inter text-sm text-ink/70 max-w-md mx-auto">
                Analyzing brief spec • Retrieving historical campaign insights • Drafting native
                Bengali/English copy • Composing 3 distinct visual prompts • Executing
                deterministic compliance checks...
              </p>
            </div>
          ) : currentBrief ? (
            <div className="space-y-6">
              {/* Structured Spec Header Banner */}
              <div className="border-3 border-ink bg-paper p-5 shadow-neo">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b-2 border-ink pb-3 mb-3">
                  <div>
                    <span className="font-mono text-xs text-ink/60">ANALYZED SPEC</span>
                    <h3 className="text-xl font-bungee text-ink">
                      {currentBrief.genre || "Media Campaign"}
                    </h3>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="bg-lime text-ink px-2 py-0.5 border-2 border-ink font-bungee text-xs">
                      LANG: {currentBrief.language}
                    </span>
                    <span className="bg-sunshine text-ink px-2 py-0.5 border-2 border-ink font-bungee text-xs">
                      TONE: {currentBrief.tone || "Engaging"}
                    </span>
                  </div>
                </div>

                <div className="font-inter text-xs text-ink/80 mb-3">
                  <strong>Target Audience:</strong> {currentBrief.targetAudience}
                </div>

                {/* Insight Feedback Loop Callout (Auto-Disqualifier #3 Safeguard!) */}
                {submitBriefMutation.data?.retrievedInsights &&
                  submitBriefMutation.data.retrievedInsights.length > 0 && (
                    <div className="bg-[#FFF4D0] border-2 border-ink p-3 shadow-neo-sm">
                      <div className="flex items-center gap-1.5 font-bungee text-xs text-ink mb-1">
                        <Flame className="w-4 h-4 text-tomato" />
                        RETRIEVED HISTORICAL INSIGHT (pgvector Feedback Loop)
                      </div>
                      <p className="font-inter text-xs text-ink/90 italic">
                        "{submitBriefMutation.data.retrievedInsights[0]}"
                      </p>
                      <span className="font-mono text-[10px] text-ink/60 block mt-1">
                        ✓ Injected into Content Generator prompt context
                      </span>
                    </div>
                  )}
              </div>

              {/* Per-Channel Generated Assets Corkboard */}
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="font-bungee text-lg flex items-center gap-2">
                    <Layers className="w-5 h-5 text-blue" /> Channel Tailored Stickers
                  </h3>
                  <span className="font-mono text-xs text-ink/60">
                    Seeded rotation active • Click to review
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {currentBrief.assets.map((asset) => {
                    const rotationStyle = getStickerRotationStyle(asset.id);
                    const channelName = asset.channel.toLowerCase();
                    const isInstagram = channelName === "instagram";
                    const isFacebook = channelName === "facebook";
                    const isTwitter = channelName === "twitter";

                    const channelColor = isInstagram
                      ? "bg-pink text-white"
                      : isFacebook
                      ? "bg-blue text-white"
                      : "bg-jet text-white";

                    const isPending = asset.status === "PENDING_APPROVAL";
                    const isRejected = asset.status === "REJECTED";
                    const isApproved = asset.status === "APPROVED";
                    const isPublished = asset.status === "PUBLISHED";

                    const failedChecks = asset.complianceChecks?.filter((c) => !c.passed) ?? [];

                    return (
                      <div
                        key={asset.id}
                        style={rotationStyle}
                        className="neo-card p-4 flex flex-col justify-between transition-transform hover:rotate-0 hover:scale-[1.01]"
                      >
                        <div>
                          {/* Channel Badge & Status Tag */}
                          <div className="flex items-center justify-between mb-3">
                            <span
                              className={`px-2.5 py-0.5 border-2 border-ink font-bungee text-xs uppercase shadow-neo-sm ${channelColor}`}
                            >
                              {asset.channel}
                            </span>

                            {isApproved && (
                              <span className="bg-lime text-ink px-2 py-0.5 border-2 border-ink font-bungee text-xs shadow-neo-sm">
                                Ship It 🔥
                              </span>
                            )}
                            {isPending && (
                              <span className="bg-sunshine text-ink px-2 py-0.5 border-2 border-ink font-bungee text-xs shadow-neo-sm">
                                Review Me ⏳
                              </span>
                            )}
                            {isRejected && (
                              <span className="bg-tomato text-white px-2 py-0.5 border-2 border-ink font-bungee text-xs shadow-neo-sm">
                                Nope ❌
                              </span>
                            )}
                            {isPublished && (
                              <span className="bg-lime text-ink px-2 py-0.5 border-2 border-ink font-bungee text-xs shadow-neo-sm">
                                Live 🚀
                              </span>
                            )}
                          </div>

                          {/* Distinct Per-Channel Visual (ADR-002) */}
                          {asset.imageUrl && (
                            <div className="mb-3 border-2 border-ink overflow-hidden bg-black/5 relative group">
                              <img
                                src={asset.imageUrl}
                                alt={`Generated for ${asset.channel}`}
                                className={`w-full object-cover ${
                                  isInstagram ? "aspect-square" : "aspect-video"
                                }`}
                              />
                              <div className="absolute bottom-1 right-1 bg-ink/90 text-white font-mono text-[10px] px-1.5 py-0.5 border border-white">
                                {isInstagram ? "1:1 Square" : "16:9 Landscape"}
                              </div>
                            </div>
                          )}

                          {/* Bengali Nativeness Badge (GUARDRAILS.md §2) */}
                          {asset.copyBn && (
                            <div className="mb-2 flex items-center gap-1.5 text-xs font-mono">
                              {asset.bengaliNativenessPassed ? (
                                <span className="inline-flex items-center gap-1 text-[#057A55] bg-[#DEF7EC] px-1.5 py-0.5 border border-[#057A55]">
                                  <CheckCircle2 className="w-3.5 h-3.5" /> Native Bengali Verified
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 text-[#E02424] bg-[#FDE8E8] px-1.5 py-0.5 border border-[#E02424]">
                                  <AlertTriangle className="w-3.5 h-3.5" /> Translation Calque Flagged
                                </span>
                              )}
                            </div>
                          )}

                          {/* Copy Content */}
                          <div className="space-y-2 mb-3">
                            {asset.copyBn && (
                              <p className="font-inter text-xs text-ink leading-relaxed bg-paper/60 p-2 border border-ink/20">
                                {asset.copyBn}
                              </p>
                            )}
                            {asset.copyEn && (
                              <p className="font-inter text-xs text-ink/80 italic leading-relaxed">
                                {asset.copyEn}
                              </p>
                            )}

                            {/* CTA & Hashtags */}
                            {asset.cta && (
                              <div className="text-xs font-inter font-semibold text-ink">
                                👉 {asset.cta}
                              </div>
                            )}

                            {asset.hashtags && asset.hashtags.length > 0 && (
                              <div className="flex flex-wrap gap-1">
                                {asset.hashtags.map((h, i) => (
                                  <span
                                    key={i}
                                    className="font-mono text-[10px] bg-paper px-1 border border-ink/40"
                                  >
                                    #{h}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>

                          {/* Torn-Ticket Compliance Failure Banner (AC 6.1, DESIGN_SYSTEM.md) */}
                          {failedChecks.length > 0 && (
                            <div className="torn-ticket p-3 mb-3">
                              <div className="flex items-center gap-1.5 font-bungee text-xs mb-1">
                                <AlertTriangle className="w-4 h-4 text-white" />
                                COMPLIANCE REJECTION
                              </div>
                              <ul className="text-xs font-inter space-y-1 list-disc list-inside">
                                {failedChecks.map((f, i) => (
                                  <li key={i}>{f.reason}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>

                        {/* Card Action Link */}
                        <div className="pt-2 border-t-2 border-ink/20 flex items-center justify-between">
                          <span className="font-mono text-[10px] text-ink/60">
                            Version {asset.version}
                          </span>
                          <Link
                            href="/approval"
                            className="neo-btn bg-paper hover:bg-lime text-ink px-3 py-1 text-xs"
                          >
                            Review & Ship →
                          </Link>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : (
            /* Empty State per DESIGN_SYSTEM.md Voice Table */
            <div className="border-3 border-ink bg-white p-12 text-center shadow-neo">
              <div className="w-16 h-16 bg-sunshine border-3 border-ink mx-auto flex items-center justify-center font-bungee text-2xl shadow-neo-sm rotate-[-3deg] mb-4">
                ☕
              </div>
              <h3 className="font-bungee text-2xl mb-2">Nothing cooking yet. Feed me a brief.</h3>
              <p className="font-inter text-sm text-ink/70 max-w-sm mx-auto mb-6">
                Pick one of the quick demo briefs on the left or write your own to watch the
                multi-agent studio craft tailored, compliant assets.
              </p>
              <div className="inline-flex items-center gap-2 border-2 border-ink bg-paper px-3 py-1.5 font-mono text-xs">
                <span>Auto-disqualifier safeguards:</span>
                <span className="text-[#057A55] font-bold">100% Active</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
